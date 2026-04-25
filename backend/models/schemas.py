from typing import List

from pydantic import BaseModel


class AdRow(BaseModel):
    campaign_name: str
    ad_group: str
    keyword: str
    impressions: int
    clicks: int
    ctr: str
    avg_cpc: float
    spend: float
    conversions: int
    conversion_rate: str
    revenue: float


class AuditIssue(BaseModel):
    keyword: str
    campaign_name: str
    issue_type: str
    severity: str
    spend: float
    detail: str


class AuditResult(BaseModel):
    total_spend: float
    total_revenue: float
    total_roas: float
    wasted_spend: float
    issues: List[AuditIssue]
    summary: str


class StrategyRecommendation(BaseModel):
    priority: int
    action: str
    target: str
    reasoning: str
    expected_impact: str


class StrategyResult(BaseModel):
    recommendations: List[StrategyRecommendation]
    summary: str


class CopyVariant(BaseModel):
    keyword: str
    campaign_name: str
    original_headline: str
    original_description: str
    new_headline: str
    new_description: str
    improvement_reason: str


class CopyResult(BaseModel):
    variants: List[CopyVariant]
    summary: str


class PipelineResult(BaseModel):
    audit: AuditResult
    strategy: StrategyResult
    copy: CopyResult
    status: str = "complete"
