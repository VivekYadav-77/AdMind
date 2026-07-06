from typing import List

from agents.utils import parse_json_response, percent_to_float
from models.schemas import AdRow, AuditResult, CopyResult
from services.gemini import call_gemini


SYSTEM_INSTRUCTION = """
You are an expert direct-response copywriter AND A/B testing strategist specializing in paid search and social ads.
For every underperforming keyword, you produce two distinct ad variations (Test A and Test B) with
completely different creative angles. You explain the strategic rationale for WHY these two angles
should be tested against each other.
You always respond with valid JSON only. No explanations outside the JSON.
""".strip()


def _select_underperforming_rows(rows: List[AdRow], audit: AuditResult) -> List[AdRow]:
    issue_keywords = {issue.keyword for issue in audit.issues}
    selected = [row for row in rows if row.keyword in issue_keywords]

    # Deduplicate by keyword (demographic rows create duplicates)
    seen_keywords = set()
    unique_selected = []
    for row in selected:
        if row.keyword not in seen_keywords:
            seen_keywords.add(row.keyword)
            unique_selected.append(row)
    selected = unique_selected

    if len(selected) < 2:
        for row in sorted(rows, key=lambda r: percent_to_float(r.ctr)):
            if row.keyword not in seen_keywords:
                seen_keywords.add(row.keyword)
                selected.append(row)
            if len(selected) >= 2:
                break

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
Create structured A/B test ad copy for these underperforming keywords.
For each keyword, produce TWO distinct creative angles to test against each other.

KEYWORDS TO IMPROVE:
{_format_keywords(selected_rows)}

RULES FOR EACH VARIATION:
- Headlines: max 30 characters
- Descriptions: max 90 characters
- Be specific and benefit-focused
- Include a clear call to action
- Match user search intent for the keyword

CREATIVE ANGLES TO CONSIDER:
- Emotional hook vs Data-driven hook
- Urgency-based vs Trust-based
- Problem-focused vs Solution-focused
- Benefit-led vs Feature-led

Respond ONLY with this JSON structure:
{{
  "variants": [
    {{
      "keyword": "<keyword>",
      "campaign_name": "<campaign>",
      "test_a": {{
        "label": "<short name for this angle, e.g. 'Emotional Hook'>",
        "angle": "<1 sentence describing the creative strategy>",
        "headline": "<your headline for test A>",
        "description": "<your description for test A>"
      }},
      "test_b": {{
        "label": "<short name for opposite angle, e.g. 'Data-Driven'>",
        "angle": "<1 sentence describing the creative strategy>",
        "headline": "<your headline for test B>",
        "description": "<your description for test B>"
      }},
      "visual_prompt": "<A cinematic, highly-detailed description of an image to accompany this ad campaign (e.g. 'A sleek modern running shoe on a glowing neon track, highly detailed, photorealistic')>",
      "test_rationale": "<1-2 sentences explaining WHY testing these two angles will reveal which messaging resonates best with this audience>"
    }}
  ],
  "summary": "<2-3 sentence summary of the overall A/B testing strategy>"
}}
""".strip()

    response = await call_gemini(prompt, SYSTEM_INSTRUCTION)
    data = parse_json_response(response, "Copywriter agent returned invalid JSON")
    return CopyResult(**data)
