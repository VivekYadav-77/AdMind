from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, AnalysisJob, CommunityReview
from app.dependencies import require_admin

router = APIRouter()

@router.get("/activity", response_model=dict)
def get_admin_activity(page: int = 1, size: int = 20, type_filter: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    feed = []
    
    if type_filter in ["", "users", "all"]:
        users = db.query(User).order_by(desc(User.created_at)).limit(500).all()
        for u in users:
            feed.append({"type": "user_registered", "message": f"New user registered: {u.email}", "timestamp": u.created_at})
            
    if type_filter in ["", "jobs", "all"]:
        from sqlalchemy.orm import joinedload
        jobs = db.query(AnalysisJob).options(joinedload(AnalysisJob.user)).order_by(desc(AnalysisJob.created_at)).limit(500).all()
        for j in jobs:
            email = j.user.email if j.user else "Unknown"
            feed.append({"type": f"job_{j.status}", "message": f"Job {j.status} for {email}", "timestamp": j.created_at})
            
    if type_filter in ["", "reviews", "all"]:
        from sqlalchemy.orm import joinedload
        reviews = db.query(CommunityReview).options(joinedload(CommunityReview.user)).order_by(desc(CommunityReview.created_at)).limit(500).all()
        for r in reviews:
            email = r.user.email if r.user else "Unknown"
            action = "New review submitted" if r.is_approved == 0 else "Review approved"
            feed.append({"type": "review_submitted", "message": f"{action} by {email}", "timestamp": r.created_at})
            
    feed.sort(key=lambda x: x["timestamp"], reverse=True)
    
    total = len(feed)
    start = (page - 1) * size
    end = start + size
    
    return {
        "items": feed[start:end],
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size if size > 0 else 0
    }
