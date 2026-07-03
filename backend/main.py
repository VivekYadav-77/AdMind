import json
import os
import asyncio
from pathlib import Path
from datetime import timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import desc

from agents.auditor import run_auditor
from agents.copywriter import run_copywriter
from agents.strategist import run_strategist
from agents.landing_page_auditor import run_landing_page_auditor
from agents.audience_builder import run_audience_builder
from agents.competitor_teardown import run_competitor_teardown
from db.database import Base, engine, get_db, SessionLocal
from db.models import AnalysisJob, User, Workspace, WorkspaceMember, ChatMessage, RecommendationComment, ABTestCampaign
from models.schemas import PipelineResult, UserCreate, Token
from services.csv_parser import parse_csv
from services.gemini import GeminiError, call_gemini_chat
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token,
    oauth2_scheme,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

from pydantic import BaseModel

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AdMind API", version="1.0.0")

cors_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
SAMPLE_CSV_PATH = BASE_DIR / "sample_data.csv"


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


async def _read_csv_upload(file: UploadFile) -> str:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")
    content = await file.read()
    try:
        return content.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV must be UTF-8 encoded") from exc


def _append_job_log(db: Session, job_id: int, event: str, data: dict):
    from sqlalchemy.orm.attributes import flag_modified
    # Retrieve job, append log, commit. Needs to run in sync.
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if job:
        if job.progress_logs is None:
            job.progress_logs = []
        job.progress_logs.append({"event": event, "data": data})
        flag_modified(job, "progress_logs")
        db.commit()

async def run_analysis_task(job_id: int, csv_text: str):
    # Open a new DB session for the background task
    db = SessionLocal()
    try:
        _append_job_log(db, job_id, "start", {"message": "Pipeline started", "total_steps": 3})
        
        rows, stats = parse_csv(csv_text)
        
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        job.total_rows = stats["total_rows"]
        job.input_spend = stats["total_spend"]
        job.input_revenue = stats["total_revenue"]
        db.commit()

        _append_job_log(db, job_id, "csv_parsed", {
            "job_id": job.id,
            "rows": stats["total_rows"],
            "total_spend": stats["total_spend"],
            "total_revenue": stats["total_revenue"],
        })

        _append_job_log(db, job_id, "agent_start", {"agent": "auditor", "message": "Analyzing campaign performance..."})
        audit = await run_auditor(rows)
        job.audit_data = audit.model_dump()
        db.commit()
        _append_job_log(db, job_id, "agent_done", {"agent": "auditor", "result": audit.model_dump()})

        _append_job_log(db, job_id, "agent_start", {"agent": "strategist", "message": "Generating strategy recommendations..."})
        strategy = await run_strategist(rows, audit)
        job.strategy_data = strategy.model_dump()
        db.commit()
        _append_job_log(db, job_id, "agent_done", {"agent": "strategist", "result": strategy.model_dump()})

        _append_job_log(db, job_id, "agent_start", {"agent": "copywriter", "message": "Rewriting underperforming ad copy..."})
        copy = await run_copywriter(rows, audit)
        job.copy_data = copy.model_dump()
        job.status = "complete"
        db.commit()
        _append_job_log(db, job_id, "agent_done", {"agent": "copywriter", "result": copy.model_dump()})

        final = PipelineResult(audit=audit, strategy=strategy, copy_results=copy)
        _append_job_log(db, job_id, "complete", final.model_dump())

    except Exception as exc:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if job:
            job.status = "error"
            job.error_message = str(exc)
            db.commit()
            _append_job_log(db, job_id, "error", {"message": str(exc)})
    finally:
        db.close()


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/register", response_model=Token)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create default workspace
    ws = Workspace(name="My Workspace", owner_id=new_user.id)
    db.add(ws)
    db.commit()
    db.refresh(ws)
    
    ws_member = WorkspaceMember(workspace_id=ws.id, user_id=new_user.id, role="admin")
    db.add(ws_member)
    db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    
    access_token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/sample-csv")
async def get_sample_csv():
    if not SAMPLE_CSV_PATH.exists():
        raise HTTPException(status_code=404, detail="Sample CSV not found")
    return PlainTextResponse(
        SAMPLE_CSV_PATH.read_text(encoding="utf-8"),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="sample_ads.csv"'},
    )


# Workspace Endpoints
class WorkspaceCreate(BaseModel):
    name: str

@app.get("/workspaces")
def get_workspaces(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    members = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == current_user.id).all()
    workspaces = [m.workspace for m in members]
    return [{"id": w.id, "name": w.name, "role": m.role} for m, w in zip(members, workspaces)]

@app.post("/workspaces")
def create_workspace(ws: WorkspaceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_ws = Workspace(name=ws.name, owner_id=current_user.id)
    db.add(new_ws)
    db.commit()
    db.refresh(new_ws)
    member = WorkspaceMember(workspace_id=new_ws.id, user_id=current_user.id, role="admin")
    db.add(member)
    db.commit()
    return {"id": new_ws.id, "name": new_ws.name, "role": "admin"}


# Analyze Endpoints
def _get_workspace_id(request: Request, db: Session, current_user: User):
    # Try to get from header
    wid = request.headers.get("X-Workspace-Id")
    if wid:
        # verify access
        member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == int(wid), WorkspaceMember.user_id == current_user.id).first()
        if member:
            return int(wid)
    # fallback to first workspace
    first_member = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == current_user.id).first()
    if first_member:
        return first_member.workspace_id
    return None


@app.post("/analyze")
async def analyze(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    csv_text = await _read_csv_upload(file)
    wid = _get_workspace_id(request, db, current_user)
    
    job = AnalysisJob(
        user_id=current_user.id,
        workspace_id=wid,
        status="processing",
        progress_logs=[]
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(run_analysis_task, job.id, csv_text)
    return {"job_id": job.id}


@app.get("/analyze/{job_id}/stream")
async def analyze_stream(
    job_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify access
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id, AnalysisJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_stream():
        last_idx = 0
        while True:
            # Create a new session since the request db session is closed during streaming
            db_stream = SessionLocal()
            try:
                # Re-fetch job to get latest logs
                current_job = db_stream.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
                if not current_job:
                    break
                logs = current_job.progress_logs or []
                
                # Yield any new logs
                for i in range(last_idx, len(logs)):
                    log = logs[i]
                    yield f"data: {json.dumps(log)}\n\n"
                
                last_idx = len(logs)
                
                if current_job.status in ["complete", "error"]:
                    break
            finally:
                db_stream.close()
                
            await asyncio.sleep(1)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# History Endpoints
@app.get("/history/trends")
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


@app.get("/history")
def get_history(
    request: Request,
    page: int = 1, 
    size: int = 10,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    wid = _get_workspace_id(request, db, current_user)
    query = db.query(AnalysisJob).filter(AnalysisJob.user_id == current_user.id)
    if wid:
        query = query.filter(AnalysisJob.workspace_id == wid)
        
    total = query.count()
    jobs = query.order_by(desc(AnalysisJob.created_at)).offset((page - 1) * size).limit(size).all()
    
    # Return without the massive JSON payloads to keep list fast
    return {
        "items": [{
            "id": j.id, 
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


@app.get("/history/{job_id}")
def get_job_detail(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(AnalysisJob).filter(
        AnalysisJob.id == job_id,
        AnalysisJob.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    return job


# Chat Endpoints
class ChatRequest(BaseModel):
    message: str

@app.get("/history/{job_id}/chat")
def get_chat_history(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id, AnalysisJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    messages = db.query(ChatMessage).filter(ChatMessage.job_id == job_id).order_by(ChatMessage.created_at).all()
    return [{"role": m.role, "content": m.content, "created_at": m.created_at} for m in messages]

@app.post("/history/{job_id}/chat")
async def send_chat_message(
    job_id: int, 
    req: ChatRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id, AnalysisJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "complete":
        raise HTTPException(status_code=400, detail="Cannot chat until report is complete")

    # Save user message
    user_msg = ChatMessage(job_id=job.id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()

    # Get history
    history = db.query(ChatMessage).filter(ChatMessage.job_id == job_id).order_by(ChatMessage.created_at).all()
    history_dicts = [{"role": m.role, "content": m.content} for m in history]

    # Job Context
    context = {
        "total_rows": job.total_rows,
        "input_spend": job.input_spend,
        "input_revenue": job.input_revenue,
        "audit": job.audit_data,
        "strategy": job.strategy_data,
        "copy": job.copy_data
    }

    # Call Gemini
    reply_text = await call_gemini_chat(context, history_dicts, req.message)

    # Save Assistant message
    asst_msg = ChatMessage(job_id=job.id, role="assistant", content=reply_text)
    db.add(asst_msg)
    db.commit()

    return {"role": "assistant", "content": reply_text}


# Comments Endpoints
class CommentCreate(BaseModel):
    target_keyword: str
    comment_text: str

@app.get("/history/{job_id}/comments")
def get_comments(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id, AnalysisJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    comments = db.query(RecommendationComment).filter(RecommendationComment.job_id == job_id).order_by(RecommendationComment.created_at).all()
    # We can fetch the user emails too for UI display
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

@app.post("/history/{job_id}/comments")
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


# AB Test Campaign Endpoints
class ABTestCreate(BaseModel):
    test_name: str
    variant_a_copy: str
    variant_b_copy: str

class ABTestWinner(BaseModel):
    winner: str # 'A' or 'B'

@app.get("/workspaces/tests")
def get_ab_tests(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wid = _get_workspace_id(request, db, current_user)
    if not wid:
        return []
    
    tests = db.query(ABTestCampaign).filter(ABTestCampaign.workspace_id == wid).order_by(desc(ABTestCampaign.created_at)).all()
    return tests

@app.post("/workspaces/tests")
def create_ab_test(req: ABTestCreate, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
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

@app.put("/workspaces/tests/{test_id}/winner")
def declare_winner(test_id: int, req: ABTestWinner, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wid = _get_workspace_id(request, db, current_user)
    test = db.query(ABTestCampaign).filter(ABTestCampaign.id == test_id, ABTestCampaign.workspace_id == wid).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
        
    test.status = "completed"
    test.winner = req.winner
    db.commit()
    db.refresh(test)
    return test


# Tools Endpoints
class UrlRequest(BaseModel):
    url: str

class DescRequest(BaseModel):
    description: str

class AdRequest(BaseModel):
    ad_copy: str

@app.post("/tools/audit-landing-page")
async def audit_landing_page(req: UrlRequest, current_user: User = Depends(get_current_user)):
    return await run_landing_page_auditor(req.url)

@app.post("/tools/audience-builder")
async def build_audience(req: DescRequest, current_user: User = Depends(get_current_user)):
    return await run_audience_builder(req.description)

@app.post("/tools/competitor-teardown")
async def tear_down_competitor(req: AdRequest, current_user: User = Depends(get_current_user)):
    return await run_competitor_teardown(req.ad_copy)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=False)
