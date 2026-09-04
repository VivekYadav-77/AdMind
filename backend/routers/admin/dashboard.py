from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from collections import Counter

from db.database import get_db
from db.models import User, AnalysisJob, CommunityReview, Workspace
from models.schemas import AdminStats
from app.dependencies import require_admin

router = APIRouter()

@router.get("/me")
def verify_admin(admin: User = Depends(require_admin)):
    return {"isAdmin": True, "email": admin.email}

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    today = date.today()
    total_users = db.query(User).count()
    active_today = db.query(User).filter(func.date(User.last_seen_at) == today).count() 
    total_jobs = db.query(AnalysisJob).count()
    total_spend_analyzed = db.query(func.sum(AnalysisJob.input_spend)).scalar() or 0.0
    reviews_pending = db.query(CommunityReview).filter(CommunityReview.is_approved == 0).count()
    total_workspaces = db.query(Workspace).count()
    return {
        "total_users": total_users,
        "active_today": active_today,
        "total_jobs": total_jobs,
        "total_spend_analyzed": total_spend_analyzed,
        "reviews_pending": reviews_pending,
        "total_workspaces": total_workspaces
    }

@router.get("/stats/growth")
def get_admin_growth(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    today = date.today()
    start_date = today - timedelta(days=30)
    
    date_list = [start_date + timedelta(days=x) for x in range(31)]
    
    users = db.query(User.created_at).filter(User.created_at >= start_date).all()
    jobs = db.query(AnalysisJob.created_at).filter(AnalysisJob.created_at >= start_date).all()
    
    user_counts = Counter(u[0].date() for u in users if u[0])
    job_counts = Counter(j[0].date() for j in jobs if j[0])
    
    data = []
    for d in date_list:
        data.append({
            "date": d.strftime("%b %d"),
            "new_users": user_counts.get(d, 0),
            "new_jobs": job_counts.get(d, 0)
        })
    return data
