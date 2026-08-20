from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, Workspace, WorkspaceMember, AnalysisJob
from app.dependencies import require_admin
from main import sanitize_like

router = APIRouter()

@router.get("/workspaces", response_model=dict)
def get_admin_workspaces(page: int = 1, size: int = 20, search: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(Workspace)
    if search:
        safe_search = sanitize_like(search)
        from sqlalchemy import or_
        query = query.outerjoin(User, User.id == Workspace.owner_id).filter(
            or_(
                Workspace.name.ilike(f"%{safe_search}%"),
                User.email.ilike(f"%{safe_search}%")
            )
        )
    total = query.count()
    from sqlalchemy.orm import joinedload
    workspaces = query.options(joinedload(Workspace.owner)).order_by(desc(Workspace.created_at)).offset((page - 1) * size).limit(size).all()
    
    ws_ids = [w.id for w in workspaces]
    member_counts = {w_id: 0 for w_id in ws_ids}
    job_counts = {w_id: 0 for w_id in ws_ids}
    
    if ws_ids:
        from sqlalchemy import func
        member_res = db.query(WorkspaceMember.workspace_id, func.count(WorkspaceMember.id)).filter(WorkspaceMember.workspace_id.in_(ws_ids)).group_by(WorkspaceMember.workspace_id).all()
        for wid, count in member_res:
            member_counts[wid] = count
            
        job_res = db.query(AnalysisJob.workspace_id, func.count(AnalysisJob.id)).filter(AnalysisJob.workspace_id.in_(ws_ids)).group_by(AnalysisJob.workspace_id).all()
        for wid, count in job_res:
            job_counts[wid] = count
            
    items = []
    for w in workspaces:
        items.append({
            "id": w.id,
            "name": w.name,
            "owner_email": w.owner.email if w.owner else "Unknown",
            "member_count": member_counts[w.id],
            "job_count": job_counts[w.id],
            "created_at": w.created_at.isoformat() if w.created_at else ""
        })
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}
