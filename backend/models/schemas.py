from typing import List, Optional

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
    device: Optional[str] = None
    location: Optional[str] = None
    age_group: Optional[str] = None


class AuditIssue(BaseModel):
    keyword: str
    campaign_name: str
    issue_type: str
    severity: str
    spend: float
    detail: str
    segment_type: Optional[str] = None
    segment_value: Optional[str] = None


class AuditSummary(BaseModel):
    overview: str
    critical_finding: str
    action_required: str


class AuditResult(BaseModel):
    total_spend: float
    total_revenue: float
    total_roas: float
    wasted_spend: float
    issues: List[AuditIssue]
    summary: AuditSummary
    segment_anomalies: Optional[List[AuditIssue]] = None


class StrategyRecommendation(BaseModel):
    priority: int
    action: str
    target: str
    reasoning: str
    expected_impact: str


class StrategyResult(BaseModel):
    recommendations: List[StrategyRecommendation]
    summary: str


class ABTestVariant(BaseModel):
    label: str
    angle: str
    headline: str
    description: str


class CopyVariant(BaseModel):
    keyword: str
    campaign_name: str
    test_a: ABTestVariant
    test_b: ABTestVariant
    test_rationale: str


class CopyResult(BaseModel):
    variants: List[CopyVariant]
    summary: str


class PipelineResult(BaseModel):
    audit: AuditResult
    strategy: StrategyResult
    copy_results: CopyResult
    status: str = "complete"


class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
