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
    inefficient_spend: float
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


class PosterPrompts(BaseModel):
    ideogram: str
    midjourney: str
    canva: str


class CopyVariant(BaseModel):
    keyword: str
    campaign_name: str
    test_a: ABTestVariant
    test_b: ABTestVariant
    test_rationale: str
    poster_prompts: Optional[PosterPrompts] = None


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


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class AdminUserOut(BaseModel):
    id: int
    email: str
    is_superadmin: bool
    is_banned: bool
    created_at: str
    jobs_count: int
    workspaces_count: int


class AdminJobOut(BaseModel):
    id: int
    user_email: str
    workspace_name: Optional[str] = None
    status: str
    input_spend: float
    input_revenue: float
    created_at: str


class AdminReviewOut(BaseModel):
    id: int
    user_email: str
    author_name: str
    rating: int
    content: str
    is_approved: int
    created_at: str


class AdminWorkspaceOut(BaseModel):
    id: int
    name: str
    owner_email: str
    member_count: int
    job_count: int
    created_at: str


class AdminStats(BaseModel):
    total_users: int
    active_today: int
    total_jobs: int
    total_spend_analyzed: float
    reviews_pending: int
    total_workspaces: int


class TicketMessageOut(BaseModel):
    id: int
    sender_type: str
    message: str
    created_at: str


class TicketCreate(BaseModel):
    category: str
    subject: str
    message: str
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None


class TicketOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    category: str
    subject: str
    status: str
    created_at: str
    updated_at: str
    messages: List[TicketMessageOut]


class TicketReplyCreate(BaseModel):
    message: str


class TicketListItem(BaseModel):
    id: int
    user_id: Optional[int] = None
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    category: str
    subject: str
    status: str
    created_at: str
    updated_at: str


class TicketStatusUpdate(BaseModel):
    status: str

