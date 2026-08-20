from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, AnalysisJob, ChatMessage
from models.requests import ChatRequest
from services.gemini import call_gemini_chat
from app.dependencies import get_current_user
from main import check_feature_blocked

router = APIRouter()

@router.get("/history/{job_id}/chat")
def get_chat_history(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "chat", db)
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id, AnalysisJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    messages = db.query(ChatMessage).filter(ChatMessage.job_id == job_id).order_by(ChatMessage.created_at).all()
    return [{"role": m.role, "content": m.content, "created_at": m.created_at} for m in messages]

@router.post("/history/{job_id}/chat")
async def send_chat_message(
    job_id: int, 
    req: ChatRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    check_feature_blocked(current_user, "chat", db)
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id, AnalysisJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "complete":
        raise HTTPException(status_code=400, detail="Cannot chat until report is complete")

    user_msg = ChatMessage(job_id=job.id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()

    history = db.query(ChatMessage).filter(ChatMessage.job_id == job_id).order_by(ChatMessage.created_at).all()
    history_dicts = [{"role": m.role, "content": m.content} for m in history]

    context = {
        "total_rows": job.total_rows,
        "input_spend": job.input_spend,
        "input_revenue": job.input_revenue,
        "audit": job.audit_data,
        "strategy": job.strategy_data,
        "copy": job.copy_data
    }

    reply_text = await call_gemini_chat(context, history_dicts, req.message)

    asst_msg = ChatMessage(job_id=job.id, role="assistant", content=reply_text)
    db.add(asst_msg)
    db.commit()

    return {"role": "assistant", "content": reply_text}
