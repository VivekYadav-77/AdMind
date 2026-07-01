from typing import List

from agents.utils import format_campaign_table, parse_json_response
from models.schemas import AdRow, AuditResult
from services.gemini import call_gemini


SYSTEM_INSTRUCTION = """
You are an expert paid advertising auditor with 10 years experience in Google Ads and Meta Ads.
Your job is to analyze campaign data and identify performance problems with precision.
You look beyond averages to find hidden anomalies in specific segments such as device types,
geographic locations, and age groups.
You always respond with valid JSON only. No explanations outside the JSON.
""".strip()


def _has_demographics(rows: List[AdRow]) -> bool:
    return any(row.device or row.location or row.age_group for row in rows)


async def run_auditor(rows: List[AdRow]) -> AuditResult:
    formatted_table = format_campaign_table(rows)
    has_demo = _has_demographics(rows)

    demographic_section = ""
    if has_demo:
        demographic_section = """
SEGMENT ANOMALY DETECTION:
- Compare performance by device (Mobile vs Desktop). Flag if one device has 2x+ higher CPA or 50%+ lower conversion rate.
- Compare performance by location. Flag if a region is spending significantly but producing zero or very low conversions.
- Compare performance by age group. Flag if an age group has disproportionately high spend but low returns.

For each segment anomaly found, include it in the "segment_anomalies" array with these fields:
  - "keyword": the keyword or "account-wide" if it spans multiple keywords
  - "campaign_name": the campaign name
  - "issue_type": "device_anomaly" | "location_anomaly" | "age_anomaly"
  - "severity": "high" | "medium" | "low"
  - "spend": the spend in that segment
  - "detail": a clear one-sentence explanation (e.g., "Mobile has 3x higher CPA than Desktop for this keyword")
  - "segment_type": "device" | "location" | "age_group"
  - "segment_value": the specific segment value that is underperforming (e.g., "Mobile", "California", "18-24")
"""

    segment_json = ""
    if has_demo:
        segment_json = """
  "segment_anomalies": [
    {{
      "keyword": "<keyword or account-wide>",
      "campaign_name": "<campaign>",
      "issue_type": "<device_anomaly|location_anomaly|age_anomaly>",
      "severity": "<high|medium|low>",
      "spend": <number>,
      "detail": "<one sentence explaining the specific segment problem>",
      "segment_type": "<device|location|age_group>",
      "segment_value": "<the underperforming segment value>"
    }}
  ],"""

    prompt = f"""
Analyze this ad campaign data and identify all performance issues.

CAMPAIGN DATA:
{formatted_table}

METRICS TO ANALYZE:
- Wasted spend: keywords with spend > $30 and 0 conversions
- Low CTR: keywords with CTR < 0.5% and impressions > 1000
- Zero conversion keywords with significant spend (> $20)
- High CPC relative to revenue (CPC > revenue per conversion)
{demographic_section}

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
  ],{segment_json}
  "summary": {{
    "overview": "<1-sentence bottom line>",
    "critical_finding": "<the biggest problem found, or 'None'>",
    "action_required": "<the immediate next step>"
  }}
}}
""".strip()

    response = await call_gemini(prompt, SYSTEM_INSTRUCTION)
    data = parse_json_response(response, "Auditor agent returned invalid JSON")
    return AuditResult(**data)
