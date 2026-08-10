import json
import os
import asyncio
from pathlib import Path
from datetime import timedelta, datetime
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import tempfile
from docx2pdf import convert as docx_to_pdf

from agents.auditor import run_auditor
from agents.copywriter import run_copywriter
from agents.strategist import run_strategist
from agents.landing_page_auditor import run_landing_page_auditor
from agents.audience_builder import run_audience_builder
from agents.competitor_teardown import run_competitor_teardown
from db.database import Base, engine, get_db, SessionLocal
from db.models import AnalysisJob, User, Workspace, WorkspaceMember, ChatMessage, RecommendationComment, ABTestCampaign, CommunityReview
from models.schemas import PipelineResult, UserCreate, Token, AdminUserOut, AdminJobOut, AdminReviewOut, AdminWorkspaceOut, AdminStats
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
    if user.is_banned:
        raise HTTPException(status_code=403, detail="Your account has been banned.")
        
    # Update last_seen_at
    from datetime import datetime
    user.last_seen_at = datetime.utcnow()
    db.commit()
    
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


@app.post("/export/pdf")
async def export_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.filename or not file.filename.endswith('.docx'):
        raise HTTPException(status_code=400, detail="Only .docx files are accepted")
    
    contents = await file.read()
    
    with tempfile.TemporaryDirectory() as tmpdir:
        docx_path = os.path.join(tmpdir, "report.docx")
        pdf_path  = os.path.join(tmpdir, "report.pdf")
        
        with open(docx_path, 'wb') as f:
            f.write(contents)
        
        try:
            docx_to_pdf(docx_path, pdf_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")
            
        if not os.path.exists(pdf_path):
             raise HTTPException(status_code=500, detail="PDF conversion failed: file not created")
             
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=admind-report.pdf"}
    )


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


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@app.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


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


# Community Reviews Endpoints
class ReviewCreate(BaseModel):
    rating: int
    content: str

@app.get("/reviews")
def get_reviews(db: Session = Depends(get_db)):
    """Public endpoint — returns only admin-approved reviews."""
    reviews = db.query(CommunityReview).filter(CommunityReview.is_approved == 1).order_by(desc(CommunityReview.created_at)).all()
    return reviews

@app.get("/reviews/my")
def get_my_review(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns the current user's own review (pending or approved), or null if none."""
    review = db.query(CommunityReview).filter(CommunityReview.user_id == current_user.id).first()
    if not review:
        return None
    return {
        "id": review.id,
        "rating": review.rating,
        "content": review.content,
        "is_approved": review.is_approved,
        "author_name": review.author_name,
        "created_at": review.created_at.isoformat() if review.created_at else ""
    }

@app.post("/reviews")
def create_review(req: ReviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Prevent duplicate submissions
    existing = db.query(CommunityReview).filter(CommunityReview.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a review. Please wait for admin approval.")

    # Mask the email for display
    email_parts = current_user.email.split("@")
    if len(email_parts) == 2 and len(email_parts[0]) > 1:
        masked_name = f"{email_parts[0][0]}***@{email_parts[1]}"
    else:
        masked_name = "User"

    review = CommunityReview(
        user_id=current_user.id,
        author_name=masked_name,
        rating=req.rating,
        content=req.content,
        is_approved=0  # Requires admin approval
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@app.delete("/reviews/{review_id}")
def delete_review(review_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(CommunityReview).filter(CommunityReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")

    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}

# -----------------------------------------------------------------------------
# Admin Dashboard Endpoints
# -----------------------------------------------------------------------------

def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Superadmin access required")
    return current_user

@app.get("/admin/me")
def verify_admin(admin: User = Depends(require_admin)):
    return {"isAdmin": True, "email": admin.email}

@app.get("/admin/stats", response_model=AdminStats)
def get_admin_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    from datetime import datetime, date
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

@app.get("/admin/stats/growth")
def get_admin_growth(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    from datetime import datetime, date, timedelta
    today = date.today()
    start_date = today - timedelta(days=30)
    
    date_list = [start_date + timedelta(days=x) for x in range(31)]
    
    users = db.query(User.created_at).filter(User.created_at >= start_date).all()
    jobs = db.query(AnalysisJob.created_at).filter(AnalysisJob.created_at >= start_date).all()
    
    from collections import Counter
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

@app.get("/admin/users", response_model=dict)
def get_admin_users(page: int = 1, size: int = 20, search: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    total = query.count()
    users = query.order_by(desc(User.created_at)).offset((page - 1) * size).limit(size).all()
    items = []
    for u in users:
        jobs_count = db.query(AnalysisJob).filter(AnalysisJob.user_id == u.id).count()
        ws_count = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == u.id).count()
        items.append({
            "id": u.id,
            "email": u.email,
            "is_superadmin": u.is_superadmin,
            "is_banned": u.is_banned,
            "created_at": u.created_at.isoformat() if u.created_at else "",
            "jobs_count": jobs_count,
            "workspaces_count": ws_count
        })
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}

@app.post("/admin/users/{user_id}/toggle-ban")
def toggle_user_ban(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot ban yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_banned = not user.is_banned
    db.commit()
    return {"message": "User ban status updated", "is_banned": user.is_banned}

@app.post("/admin/users/{user_id}/make-admin")
def toggle_user_admin(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot revoke your own admin rights")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_superadmin = not user.is_superadmin
    db.commit()
    return {"message": "User admin status updated", "is_superadmin": user.is_superadmin}

@app.delete("/admin/users/{user_id}")
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

@app.get("/admin/jobs", response_model=dict)
def get_admin_jobs(page: int = 1, size: int = 20, status: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(AnalysisJob)
    if status and status != "all":
        query = query.filter(AnalysisJob.status == status)
    total = query.count()
    jobs = query.order_by(desc(AnalysisJob.created_at)).offset((page - 1) * size).limit(size).all()
    items = []
    for j in jobs:
        user = db.query(User).filter(User.id == j.user_id).first()
        ws = db.query(Workspace).filter(Workspace.id == j.workspace_id).first()
        items.append({
            "id": j.id,
            "user_email": user.email if user else "Unknown",
            "workspace_name": ws.name if ws else None,
            "status": j.status,
            "input_spend": j.input_spend,
            "input_revenue": j.input_revenue,
            "created_at": j.created_at.isoformat() if j.created_at else ""
        })
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}

@app.get("/admin/jobs/{job_id}")
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

@app.delete("/admin/jobs/{job_id}")
def delete_job_admin(job_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.query(ChatMessage).filter(ChatMessage.job_id == job.id).delete()
    db.query(RecommendationComment).filter(RecommendationComment.job_id == job.id).delete()
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}

@app.get("/admin/reviews", response_model=dict)
def get_admin_reviews(page: int = 1, size: int = 20, status: str = "pending", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(CommunityReview)
    if status == "pending":
        query = query.filter(CommunityReview.is_approved == 0)
    elif status == "approved":
        query = query.filter(CommunityReview.is_approved == 1)
        
    total = query.count()
    reviews = query.order_by(desc(CommunityReview.created_at)).offset((page - 1) * size).limit(size).all()
    items = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        items.append({
            "id": r.id,
            "user_email": user.email if user else "Unknown",
            "author_name": r.author_name,
            "rating": r.rating,
            "content": r.content,
            "is_approved": r.is_approved,
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}

@app.post("/admin/reviews/{review_id}/approve")
def approve_review(review_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    review = db.query(CommunityReview).filter(CommunityReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = 1
    db.commit()
    return {"message": "Review approved"}

@app.delete("/admin/reviews/{review_id}/reject")
def reject_review(review_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    review = db.query(CommunityReview).filter(CommunityReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}

@app.get("/admin/workspaces", response_model=dict)
def get_admin_workspaces(page: int = 1, size: int = 20, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(Workspace)
    total = query.count()
    workspaces = query.order_by(desc(Workspace.created_at)).offset((page - 1) * size).limit(size).all()
    items = []
    for w in workspaces:
        owner = db.query(User).filter(User.id == w.owner_id).first()
        member_count = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == w.id).count()
        job_count = db.query(AnalysisJob).filter(AnalysisJob.workspace_id == w.id).count()
        items.append({
            "id": w.id,
            "name": w.name,
            "owner_email": owner.email if owner else "Unknown",
            "member_count": member_count,
            "job_count": job_count,
            "created_at": w.created_at.isoformat() if w.created_at else ""
        })
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}

@app.get("/admin/activity", response_model=list)
def get_admin_activity(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(20).all()
    recent_jobs = db.query(AnalysisJob).order_by(desc(AnalysisJob.created_at)).limit(20).all()
    recent_reviews = db.query(CommunityReview).order_by(desc(CommunityReview.created_at)).limit(20).all()
    
    feed = []
    for u in recent_users:
        feed.append({"type": "user_registered", "message": f"New user registered: {u.email}", "timestamp": u.created_at})
    for j in recent_jobs:
        user = db.query(User).filter(User.id == j.user_id).first()
        email = user.email if user else "Unknown"
        feed.append({"type": f"job_{j.status}", "message": f"Job {j.status} for {email}", "timestamp": j.created_at})
    for r in recent_reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        email = user.email if user else "Unknown"
        action = "New review submitted" if r.is_approved == 0 else "Review approved"
        feed.append({"type": "review_submitted", "message": f"{action} by {email}", "timestamp": r.created_at})
        
    feed.sort(key=lambda x: x["timestamp"], reverse=True)
    return feed[:100]



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=False)
