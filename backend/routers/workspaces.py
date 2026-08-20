from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, Workspace, WorkspaceMember, ABTestCampaign
from models.requests import WorkspaceCreate, ABTestCreate, ABTestWinner
from app.dependencies import get_current_user
from main import check_feature_blocked, _get_workspace_id

router = APIRouter()

@router.get("/workspaces")
def get_workspaces(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    members = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == current_user.id).all()
    workspaces = [m.workspace for m in members]
    return [{"id": w.id, "name": w.name, "role": m.role} for m, w in zip(members, workspaces)]

@router.post("/workspaces")
def create_workspace(ws: WorkspaceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "workspaces", db)
    new_ws = Workspace(name=ws.name, owner_id=current_user.id)
    db.add(new_ws)
    db.commit()
    db.refresh(new_ws)
    member = WorkspaceMember(workspace_id=new_ws.id, user_id=current_user.id, role="admin")
    db.add(member)
    db.commit()
    return {"id": new_ws.id, "name": new_ws.name, "role": "admin"}

@router.get("/workspaces/tests")
def get_ab_tests(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "ab_tests", db)
    wid = _get_workspace_id(request, db, current_user)
    if not wid:
        return []
    
    tests = db.query(ABTestCampaign).filter(ABTestCampaign.workspace_id == wid).order_by(desc(ABTestCampaign.created_at)).all()
    return tests

@router.post("/workspaces/tests")
def create_ab_test(req: ABTestCreate, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "ab_tests", db)
    wid = _get_workspace_id(request, db, current_user)
    if not wid:
        raise HTTPException(status_code=400, detail="No active workspace found")
        
    test = ABTestCampaign(
        workspace_id=wid,
        test_name=req.test_name,
        variant_a_copy=req.variant_a_copy,
        variant_b_copy=req.variant_b_copy,
        status="running"
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return test

@router.put("/workspaces/tests/{test_id}/winner")
def declare_winner(test_id: int, req: ABTestWinner, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "ab_tests", db)
    wid = _get_workspace_id(request, db, current_user)
    test = db.query(ABTestCampaign).filter(ABTestCampaign.id == test_id, ABTestCampaign.workspace_id == wid).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
        
    test.status = "completed"
    test.winner = req.winner
    db.commit()
    db.refresh(test)
    return test
