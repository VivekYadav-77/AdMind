from typing import List

from agents.utils import parse_json_response, percent_to_float
from models.schemas import AdRow, AuditResult, CopyResult
from services.gemini import call_gemini


SYSTEM_INSTRUCTION = """
You are an expert direct-response copywriter specializing in paid search and social ads.
You write headlines that are specific, benefit-focused, and create urgency without being spammy.
You always respond with valid JSON only. No explanations outside the JSON.
""".strip()


def _select_underperforming_rows(rows: List[AdRow], audit: AuditResult) -> List[AdRow]:
    issue_keywords = {issue.keyword for issue in audit.issues}
    selected = [row for row in rows if row.keyword in issue_keywords]

    if len(selected) < 2:
        selected = sorted(rows, key=lambda row: percent_to_float(row.ctr))[:2]

    return selected[:5]


def _format_keywords(rows: List[AdRow]) -> str:
    return "\n".join(
        f"- {row.keyword} | campaign: {row.campaign_name} | CTR: {row.ctr} | "
        f"conversion rate: {row.conversion_rate}"
        for row in rows
    )


async def run_copywriter(rows: List[AdRow], audit: AuditResult) -> CopyResult:
    selected_rows = _select_underperforming_rows(rows, audit)
    prompt = f"""
Rewrite ad copy for these underperforming keywords to improve CTR and conversions.

KEYWORDS TO IMPROVE:
{_format_keywords(selected_rows)}

RULES FOR NEW COPY:
- Headlines: max 30 characters
- Descriptions: max 90 characters
- Be specific and benefit-focused
- Include a clear call to action
- Match user search intent for the keyword

Respond ONLY with this JSON structure:
{{
  "variants": [
    {{
      "keyword": "<keyword>",
      "campaign_name": "<campaign>",
      "original_headline": "<generate a realistic original generic headline for this keyword>",
      "original_description": "<generate a realistic original generic description>",
      "new_headline": "<your improved headline>",
      "new_description": "<your improved description>",
      "improvement_reason": "<one sentence: what specific change you made and why>"
    }}
  ],
  "summary": "<1-2 sentence summary of the copy strategy used>"
}}
""".strip()

    response = await call_gemini(prompt, SYSTEM_INSTRUCTION)
    data = parse_json_response(response, "Copywriter agent returned invalid JSON")
    return CopyResult(**data)
