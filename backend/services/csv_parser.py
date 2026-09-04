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

OPTIONAL_COLUMNS = {"device", "location", "age_group"}


COLUMN_ALIASES = {
    "campaign": "campaign_name",
    "campaign name": "campaign_name",
    "ad group": "ad_group",
    "search keyword": "keyword",
    "cost": "spend",
    "amount spent": "spend",
    "conv.": "conversions",
    "conv": "conversions",
    "conversion": "conversions",
    "impr.": "impressions",
    "impr": "impressions",
    "purchase value": "revenue",
    "conv. value": "revenue",
}


def _normalize_header(header: str) -> str:
    h = header.lower().strip()
    return COLUMN_ALIASES.get(h, h)


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
    
    original_headers = reader.fieldnames or []
    mapped_headers = [_normalize_header(h) for h in original_headers]
    reader.fieldnames = mapped_headers
    
    fieldnames = set(mapped_headers)
    missing_columns = sorted(REQUIRED_COLUMNS - fieldnames)

    if missing_columns:
        raise ValueError(f"Missing required CSV columns: {', '.join(missing_columns)}")

    has_device = "device" in fieldnames
    has_location = "location" in fieldnames
    has_age_group = "age_group" in fieldnames

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
                device=_clean_text(raw_row.get("device")) if has_device else None,
                location=_clean_text(raw_row.get("location")) if has_location else None,
                age_group=_clean_text(raw_row.get("age_group")) if has_age_group else None,
            )
        )

    stats = {
        "total_rows": len(rows),
        "total_spend": sum(row.spend for row in rows),
        "total_revenue": sum(row.revenue for row in rows),
    }

    return rows, stats
