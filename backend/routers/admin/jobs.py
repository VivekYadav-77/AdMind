from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, AnalysisJob, ChatMessage, RecommendationComment, Workspace
from app.dependencies import require_admin
from app.utils import sanitize_like

router = APIRouter()

@router.get("/jobs", response_model=dict)
def get_admin_jobs(page: int = 1, size: int = 20, status: str = "", search: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(AnalysisJob)
    if status and status != "all":
        query = query.filter(AnalysisJob.status == status)
    if search:
        safe_search = sanitize_like(search)
        query = query.join(User, User.id == AnalysisJob.user_id).filter(User.email.ilike(f"%{safe_search}%"))
    
    total = query.count()
    # N+1 optimization: joinedload User and Workspace
    from sqlalchemy.orm import joinedload
    jobs = query.options(joinedload(AnalysisJob.user), joinedload(AnalysisJob.workspace)).order_by(desc(AnalysisJob.created_at)).offset((page - 1) * size).limit(size).all()
    
    items = []
    for j in jobs:
        items.append({
            "id": j.id,
            "user_email": j.user.email if j.user else "Unknown",
            "workspace_name": j.workspace.name if j.workspace else None,
            "status": j.status,
            "input_spend": j.input_spend,
            "input_revenue": j.input_revenue,
            "created_at": j.created_at.isoformat() if j.created_at else ""
        })
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}

@router.get("/jobs/{job_id}")
def get_admin_job_detail(job_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    user = db.query(User).filter(User.id == job.user_id).first()
    return {
        "id": job.id,
        "user_email": user.email if user else "Unknown",
        "status": job.status,
        "audit_data": job.audit_data,
        "strategy_data": job.strategy_data,
        "copy_data": job.copy_data
    }

@router.delete("/jobs/{job_id}")
def delete_job_admin(job_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.query(ChatMessage).filter(ChatMessage.job_id == job.id).delete()
    db.query(RecommendationComment).filter(RecommendationComment.job_id == job.id).delete()
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}
