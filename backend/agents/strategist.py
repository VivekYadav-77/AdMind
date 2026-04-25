from typing import List

from agents.utils import format_campaign_table, parse_json_response
from models.schemas import AdRow, AuditResult, StrategyResult
from services.gemini import call_gemini


SYSTEM_INSTRUCTION = """
You are a senior paid media strategist who turns audit findings into clear action plans.
You prioritize recommendations by potential impact and ease of implementation.
You always respond with valid JSON only. No explanations outside the JSON.
""".strip()


def _format_issues(audit: AuditResult) -> str:
    if not audit.issues:
        return "No issues found."

    return "\n".join(
        f"- [{issue.severity}] {issue.issue_type}: {issue.keyword} in {issue.campaign_name} "
        f"spent ${issue.spend:.2f}. {issue.detail}"
        for issue in audit.issues
    )


async def run_strategist(rows: List[AdRow], audit: AuditResult) -> StrategyResult:
    top_rows = sorted(rows, key=lambda row: row.spend, reverse=True)[:10]
    prompt = f"""
Based on this campaign audit, generate strategic recommendations.

AUDIT SUMMARY:
{audit.summary}

KEY ISSUES FOUND:
{_format_issues(audit)}

FULL CAMPAIGN DATA:
{format_campaign_table(top_rows)}

Generate 5-8 prioritized recommendations.

Respond ONLY with this JSON structure:
{{
  "recommendations": [
    {{
      "priority": <1-8, 1 is most urgent>,
      "action": "<pause|reduce_bid|increase_budget|restructure|test_new_copy|reallocate>",
      "target": "<specific keyword or campaign name>",
      "reasoning": "<why this action, referencing specific data>",
      "expected_impact": "<what improvement to expect, be specific with numbers where possible>"
    }}
  ],
  "summary": "<2-3 sentence strategy overview>"
}}
""".strip()

    response = await call_gemini(prompt, SYSTEM_INSTRUCTION)
    data = parse_json_response(response, "Strategist agent returned invalid JSON")
    return StrategyResult(**data)
