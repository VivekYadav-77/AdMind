import json
import re
from typing import Any, Iterable, List

from models.schemas import AdRow


def strip_json_fences(response_text: str) -> str:
    text = response_text.strip()
    fence_match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL | re.IGNORECASE)
    return fence_match.group(1).strip() if fence_match else text


def parse_json_response(response_text: str, error_message: str) -> Any:
    try:
        return json.loads(strip_json_fences(response_text))
    except json.JSONDecodeError as exc:
        raise ValueError(error_message) from exc


def percent_to_float(value: str) -> float:
    try:
        return float((value or "").replace("%", "").strip())
    except ValueError:
        return 0.0


def format_campaign_table(rows: Iterable[AdRow]) -> str:
    headers = [
        "campaign_name",
        "ad_group",
        "keyword",
        "impressions",
        "clicks",
        "ctr",
        "avg_cpc",
        "spend",
        "conversions",
        "conversion_rate",
        "revenue",
    ]
    lines: List[str] = [" | ".join(headers)]
    lines.append(" | ".join("---" for _ in headers))

    for row in rows:
        values = [
            row.campaign_name,
            row.ad_group,
            row.keyword,
            str(row.impressions),
            str(row.clicks),
            row.ctr,
            f"{row.avg_cpc:.2f}",
            f"{row.spend:.2f}",
            str(row.conversions),
            row.conversion_rate,
            f"{row.revenue:.2f}",
        ]
        lines.append(" | ".join(values))

    return "\n".join(lines)
