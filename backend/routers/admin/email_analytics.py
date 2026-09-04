from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, EmailLog
from app.dependencies import require_admin
from datetime import datetime

router = APIRouter()

@router.get("/email-analytics")
def get_email_analytics(page: int = 1, size: int = 20, log_type: str = "", log_status: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    from sqlalchemy import func
    
    total = db.query(EmailLog).count()
    
    today = datetime.utcnow().date()
    today_count = db.query(EmailLog).filter(func.date(EmailLog.created_at) == today).count()
    
    verify_count = db.query(EmailLog).filter(EmailLog.email_type == "verification").count()
    reset_count = db.query(EmailLog).filter(EmailLog.email_type == "password_reset").count()
    
    success_count = db.query(EmailLog).filter(EmailLog.status == "sent").count()
    success_rate = round(success_count / total, 2) if total > 0 else 1.0
    
    top_ips_query = db.query(EmailLog.ip_address, func.count(EmailLog.id).label("count"))\
                      .filter(EmailLog.ip_address != None)\
                      .group_by(EmailLog.ip_address)\
                      .order_by(desc("count"))\
                      .limit(10).all()
                      
    top_ips = [{"ip": ip, "count": count, "flagged": count > 50} for ip, count in top_ips_query]
    
    logs_query = db.query(EmailLog)
    if log_type and log_type != "all":
        logs_query = logs_query.filter(EmailLog.email_type == log_type)
    if log_status and log_status != "all":
        logs_query = logs_query.filter(EmailLog.status == log_status)
        
    logs_total = logs_query.count()
    recent = logs_query.order_by(desc(EmailLog.created_at)).offset((page - 1) * size).limit(size).all()
    
    recent_logs = []
    for r in recent:
        recent_logs.append({
            "id": r.id,
            "email_to": r.email_to,
            "type": r.email_type,
            "status": r.status,
            "ip_address": r.ip_address,
            "user_agent": r.user_agent,
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })
        
    return {
        "total": total,
        "today": today_count,
        "by_type": {"verification": verify_count, "password_reset": reset_count},
        "success_rate": success_rate,
        "top_ips": top_ips,
        "recent_logs": {
            "items": recent_logs,
            "total": logs_total,
            "page": page,
            "size": size,
            "pages": (logs_total + size - 1) // size if size > 0 else 0
        }
    }
