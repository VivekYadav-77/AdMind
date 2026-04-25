from typing import List

from agents.utils import format_campaign_table, parse_json_response
from models.schemas import AdRow, AuditResult
from services.gemini import call_gemini


SYSTEM_INSTRUCTION = """
You are an expert paid advertising auditor with 10 years experience in Google Ads and Meta Ads.
Your job is to analyze campaign data and identify performance problems with precision.
You always respond with valid JSON only. No explanations outside the JSON.
""".strip()


async def run_auditor(rows: List[AdRow]) -> AuditResult:
    formatted_table = format_campaign_table(rows)
    prompt = f"""
Analyze this ad campaign data and identify all performance issues.

CAMPAIGN DATA:
{formatted_table}

METRICS TO ANALYZE:
- Wasted spend: keywords with spend > $30 and 0 conversions
- Low CTR: keywords with CTR < 0.5% and impressions > 1000
- Zero conversion keywords with significant spend (> $20)
- High CPC relative to revenue (CPC > revenue per conversion)

Respond ONLY with this JSON structure:
{{
  "total_spend": <number>,
  "total_revenue": <number>,
  "total_roas": <number>,
  "wasted_spend": <total $ wasted on zero-conversion keywords>,
  "issues": [
    {{
      "keyword": "<keyword>",
      "campaign_name": "<campaign>",
      "issue_type": "<wasted_spend|low_ctr|zero_conversion|high_cpc>",
      "severity": "<high|medium|low>",
      "spend": <number>,
      "detail": "<one sentence explaining the specific problem>"
    }}
  ],
  "summary": "<2-3 sentence overall audit summary>"
}}
""".strip()

    response = await call_gemini(prompt, SYSTEM_INSTRUCTION)
    data = parse_json_response(response, "Auditor agent returned invalid JSON")
    return AuditResult(**data)
