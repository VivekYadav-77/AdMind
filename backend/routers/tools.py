from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User
from models.requests import UrlRequest, DescRequest, AdRequest
from agents.landing_page_auditor import run_landing_page_auditor
from agents.audience_builder import run_audience_builder
from agents.competitor_teardown import run_competitor_teardown
from app.dependencies import get_current_user
from app.utils import check_feature_blocked

router = APIRouter()

@router.post("/tools/audit-landing-page")
async def audit_landing_page(req: UrlRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "tools", db)
    return await run_landing_page_auditor(req.url)

@router.post("/tools/audience-builder")
async def build_audience(req: DescRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "tools", db)
    return await run_audience_builder(req.description)

@router.post("/tools/competitor-teardown")
async def tear_down_competitor(req: AdRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "tools", db)
    return await run_competitor_teardown(req.ad_copy)
