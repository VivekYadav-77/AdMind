from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, AnalysisJob, WorkspaceMember, UserFeatureControl, Workspace, CommunityReview
from models.requests import FeatureControlUpdate
from app.dependencies import require_admin
from app.utils import sanitize_like

router = APIRouter()

@router.get("/users", response_model=dict)
def get_admin_users(page: int = 1, size: int = 20, search: str = "", role: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(User)
    if search:
        safe_search = sanitize_like(search)
        query = query.filter(User.email.ilike(f"%{safe_search}%"))
    if role == "admin":
        query = query.filter(User.is_superadmin == True)
    elif role == "user":
        query = query.filter(User.is_superadmin == False)
    elif role == "banned":
        query = query.filter(User.is_banned == True)
    
    total = query.count()
    users = query.order_by(desc(User.created_at)).offset((page - 1) * size).limit(size).all()
    
    # N+1 Optimization: fetch counts in bulk
    user_ids = [u.id for u in users]
    jobs_counts = {u_id: 0 for u_id in user_ids}
    ws_counts = {u_id: 0 for u_id in user_ids}
    
    if user_ids:
        from sqlalchemy import func
        jobs_res = db.query(AnalysisJob.user_id, func.count(AnalysisJob.id)).filter(AnalysisJob.user_id.in_(user_ids)).group_by(AnalysisJob.user_id).all()
        for uid, count in jobs_res:
            jobs_counts[uid] = count
            
        ws_res = db.query(WorkspaceMember.user_id, func.count(WorkspaceMember.id)).filter(WorkspaceMember.user_id.in_(user_ids)).group_by(WorkspaceMember.user_id).all()
        for uid, count in ws_res:
            ws_counts[uid] = count
            
    items = []
    for u in users:
        items.append({
            "id": u.id,
            "email": u.email,
            "is_superadmin": u.is_superadmin,
            "is_banned": u.is_banned,
            "created_at": u.created_at.isoformat() if u.created_at else "",
            "jobs_count": jobs_counts[u.id],
            "workspaces_count": ws_counts[u.id]
        })
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}

@router.post("/{user_id}/toggle-ban")
def toggle_user_ban(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot ban yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_banned = not user.is_banned
    db.commit()
    return {"message": "User ban status updated", "is_banned": user.is_banned}

@router.post("/{user_id}/make-admin")
def toggle_user_admin(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot revoke your own admin rights")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_superadmin = not user.is_superadmin
    db.commit()
    return {"message": "User admin status updated", "is_superadmin": user.is_superadmin}

@router.get("/{user_id}/controls")
def get_user_controls(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    controls = db.query(UserFeatureControl).filter(UserFeatureControl.user_id == user_id).all()
    ctrl_dict = {
        c.feature: {"blocked": c.is_blocked, "reason": c.reason}
        for c in controls
    }
    
    features = ["analyze", "history", "chat", "tools", "ab_tests", "workspaces", "community", "support", "export"]
    res_features = {}
    for f in features:
        res_features[f] = ctrl_dict.get(f, {"blocked": False, "reason": None})
        
    return {
        "user_id": user.id,
        "email": user.email,
        "login_blocked": user.login_blocked,
        "email_blocked": user.email_blocked,
        "features": res_features
    }

@router.post("/{user_id}/controls")
def set_feature_control(user_id: int, req: FeatureControlUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    ctrl = db.query(UserFeatureControl).filter(
        UserFeatureControl.user_id == user_id, 
        UserFeatureControl.feature == req.feature
    ).first()
    
    if ctrl:
        ctrl.is_blocked = req.is_blocked
        ctrl.reason = req.reason
        ctrl.updated_by = admin.id
    else:
        ctrl = UserFeatureControl(
            user_id=user_id,
            feature=req.feature,
            is_blocked=req.is_blocked,
            reason=req.reason,
            updated_by=admin.id
        )
        db.add(ctrl)
        
    db.commit()
    return {"message": "Feature control updated"}

@router.put("/{user_id}/login-block")
def toggle_login_block(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot block your own login")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.login_blocked = not user.login_blocked
    db.commit()
    return {"message": "Login block status updated", "login_blocked": user.login_blocked}

@router.put("/{user_id}/email-block")
def toggle_email_block(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.email_blocked = not user.email_blocked
    db.commit()
    return {"message": "Email block status updated", "email_blocked": user.email_blocked}

@router.delete("/{user_id}")
def delete_user_admin(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.query(AnalysisJob).filter(AnalysisJob.user_id == user.id).delete()
    db.query(WorkspaceMember).filter(WorkspaceMember.user_id == user.id).delete()
    db.query(Workspace).filter(Workspace.owner_id == user.id).delete()
    db.query(CommunityReview).filter(CommunityReview.user_id == user.id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
