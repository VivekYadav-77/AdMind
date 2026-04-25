import csv
import io
from typing import Dict, List, Tuple

from models.schemas import AdRow


REQUIRED_COLUMNS = {
    "campaign_name",
    "ad_group",
    "keyword",
    "impressions",
    "clicks",
    "spend",
    "conversions",
    "revenue",
}


def _clean_text(value: str | None) -> str:
    return (value or "").strip()


def _parse_int(value: str | None) -> int:
    try:
        return int(float(_clean_text(value).replace(",", "")))
    except (TypeError, ValueError):
        return 0


def _parse_float(value: str | None) -> float:
    try:
        return float(_clean_text(value).replace(",", "").replace("$", ""))
    except (TypeError, ValueError):
        return 0.0


def _format_percent(value: float) -> str:
    return f"{value:.2f}%"


def parse_csv(raw_csv: str) -> Tuple[List[AdRow], Dict[str, float]]:
    reader = csv.DictReader(io.StringIO(raw_csv))
    fieldnames = {name.strip() for name in (reader.fieldnames or [])}
    missing_columns = sorted(REQUIRED_COLUMNS - fieldnames)

    if missing_columns:
        raise ValueError(f"Missing required CSV columns: {', '.join(missing_columns)}")

    rows: List[AdRow] = []

    for raw_row in reader:
        impressions = _parse_int(raw_row.get("impressions"))
        clicks = _parse_int(raw_row.get("clicks"))
        spend = _parse_float(raw_row.get("spend"))
        conversions = _parse_int(raw_row.get("conversions"))
        revenue = _parse_float(raw_row.get("revenue"))

        ctr = _clean_text(raw_row.get("ctr"))
        if not ctr:
            ctr = _format_percent((clicks / impressions) * 100) if impressions > 0 else "0%"

        avg_cpc = _parse_float(raw_row.get("avg_cpc"))
        if avg_cpc == 0.0 and clicks > 0:
            avg_cpc = spend / clicks

        conversion_rate = _clean_text(raw_row.get("conversion_rate"))
        if not conversion_rate:
            conversion_rate = _format_percent((conversions / clicks) * 100) if clicks > 0 else "0%"

        rows.append(
            AdRow(
                campaign_name=_clean_text(raw_row.get("campaign_name")),
                ad_group=_clean_text(raw_row.get("ad_group")),
                keyword=_clean_text(raw_row.get("keyword")),
                impressions=impressions,
                clicks=clicks,
                ctr=ctr,
                avg_cpc=avg_cpc,
                spend=spend,
                conversions=conversions,
                conversion_rate=conversion_rate,
                revenue=revenue,
            )
        )

    stats = {
        "total_rows": len(rows),
        "total_spend": sum(row.spend for row in rows),
        "total_revenue": sum(row.revenue for row in rows),
    }

    return rows, stats
