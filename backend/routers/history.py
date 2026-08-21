from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, AnalysisJob, RecommendationComment, ChatMessage
from models.requests import CommentCreate, AnalysisRename
from app.dependencies import get_current_user
from app.utils import check_feature_blocked, _get_workspace_id

router = APIRouter()

@router.get("/history/trends")
def get_trends(
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    wid = _get_workspace_id(request, db, current_user)
    query = db.query(AnalysisJob).filter(
        AnalysisJob.user_id == current_user.id,
        AnalysisJob.status == "complete"
    )
    if wid:
        query = query.filter(AnalysisJob.workspace_id == wid)
        
    jobs = query.order_by(AnalysisJob.created_at).all()
    
    trends = []
    for job in jobs:
        if not job.audit_data:
            continue
            
        audit = job.audit_data
        total_spend = audit.get("total_spend", 0)
        inefficient_spend = audit.get("inefficient_spend")
        if inefficient_spend is None:
            inefficient_spend = audit.get("wasted_spend", 0)
            
        efficiency = 0
        if total_spend > 0:
            efficiency = max(0, total_spend - inefficient_spend) / total_spend
            
        roas = audit.get("total_roas", 0)
        score = (efficiency * 60) + (min(roas / 4, 1) * 40)
        
        trends.append({
            "id": job.id,
            "date": job.created_at.strftime("%b %d"),
            "timestamp": job.created_at.isoformat(),
            "score": round(score),
            "efficiency": round(efficiency * 100),
            "roas": round(roas, 2)
        })
        
    return trends


@router.get("/history")
def get_history(
    request: Request,
    page: int = 1, 
    size: int = 10,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    check_feature_blocked(current_user, "history", db)
    wid = _get_workspace_id(request, db, current_user)
    query = db.query(AnalysisJob).filter(AnalysisJob.user_id == current_user.id)
    if wid:
        query = query.filter(AnalysisJob.workspace_id == wid)
        
    total = query.count()
    jobs = query.order_by(desc(AnalysisJob.created_at)).offset((page - 1) * size).limit(size).all()
    
    return {
        "items": [{
            "id": j.id, 
            "name": j.name,
            "created_at": j.created_at, 
            "status": j.status,
            "total_rows": j.total_rows,
            "input_spend": j.input_spend,
            "input_revenue": j.input_revenue
        } for j in jobs],
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }


@router.get("/history/{job_id}")
def get_job_detail(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_feature_blocked(current_user, "history", db)
    job = db.query(AnalysisJob).filter(
        AnalysisJob.id == job_id,
        AnalysisJob.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    return job

@router.get("/history/{job_id}/comments")
def get_comments(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id, AnalysisJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    comments = db.query(RecommendationComment).filter(RecommendationComment.job_id == job_id).order_by(RecommendationComment.created_at).all()
    result = []
    for c in comments:
        user = db.query(User).filter(User.id == c.user_id).first()
        result.append({
            "id": c.id,
            "target_keyword": c.target_keyword,
            "comment_text": c.comment_text,
            "user_email": user.email if user else "Unknown",
            "created_at": c.created_at
        })
    return result

@router.post("/history/{job_id}/comments")
def add_comment(job_id: int, req: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id, AnalysisJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    new_comment = RecommendationComment(
        user_id=current_user.id,
        job_id=job.id,
        target_keyword=req.target_keyword,
        comment_text=req.comment_text
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return {
        "id": new_comment.id,
        "target_keyword": new_comment.target_keyword,
        "comment_text": new_comment.comment_text,
        "user_email": current_user.email,
        "created_at": new_comment.created_at
    }

@router.patch("/history/{job_id}/rename")
def rename_job(
    job_id: int,
    req: AnalysisRename,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_feature_blocked(current_user, "history", db)
    job = db.query(AnalysisJob).filter(
        AnalysisJob.id == job_id,
        AnalysisJob.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")
        
    job.name = req.name
    db.commit()
    db.refresh(job)
    
    return {
        "id": job.id, 
        "name": job.name,
        "status": job.status
    }

@router.delete("/history/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_feature_blocked(current_user, "history", db)
    job = db.query(AnalysisJob).filter(
        AnalysisJob.id == job_id,
        AnalysisJob.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    
    # Delete related data first
    db.query(ChatMessage).filter(ChatMessage.job_id == job_id).delete()
    db.query(RecommendationComment).filter(RecommendationComment.job_id == job_id).delete()
    
    # Delete the job
    db.delete(job)
    db.commit()
    
    return {"ok": True}
