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
from sqlalchemy.exc import IntegrityError
import tempfile
from docx2pdf import convert as docx_to_pdf

from agents.auditor import run_auditor
from agents.copywriter import run_copywriter
from agents.strategist import run_strategist
from agents.landing_page_auditor import run_landing_page_auditor
from agents.audience_builder import run_audience_builder
from agents.competitor_teardown import run_competitor_teardown
from db.database import Base, engine, get_db, SessionLocal
from db.models import AnalysisJob, User, Workspace, WorkspaceMember, ChatMessage, RecommendationComment, ABTestCampaign, CommunityReview, SupportTicket, TicketMessage, EmailToken, EmailLog, UserFeatureControl
from models.schemas import PipelineResult, UserCreate, Token, AdminUserOut, AdminJobOut, AdminReviewOut, AdminWorkspaceOut, AdminStats, TicketCreate, TicketOut, TicketReplyCreate, TicketListItem, TicketStatusUpdate, ForgotPasswordRequest, ResetPasswordRequest, ResendVerificationRequest, VerifyEmailRequest
from services.csv_parser import parse_csv
from services.email_service import send_email_via_gas, generate_token
from services.email_templates import verification_email, password_reset_email
from middleware.rate_limit import check_rate_limit

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


def check_feature_blocked(user: User, feature: str, db: Session):
    ctrl = db.query(UserFeatureControl).filter(
        UserFeatureControl.user_id == user.id,
        UserFeatureControl.feature == feature,
        UserFeatureControl.is_blocked == True
    ).first()
    if ctrl:
        msg = ctrl.reason if ctrl.reason else "Your access to this feature has been restricted by an admin."
        raise HTTPException(status_code=403, detail=msg)


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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_feature_blocked(current_user, "export", db)
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


VERIFY_COOLDOWN_MINUTES = 5
VERIFY_COOLDOWN_SECONDS = VERIFY_COOLDOWN_MINUTES * 60
_verify_cooldown_store: dict[str, float] = {}

@app.post("/register")
async def register_user(user: UserCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    normalized_email = user.email.strip().lower()
    
    await check_rate_limit(f"ratelimit:register:{ip}", 5, 3600)
    await check_rate_limit(f"ratelimit:auth_global:{ip}", 20, 60)
    await check_rate_limit(f"ratelimit:register_email:{normalized_email}", 3, 3600)

    GENERIC_RESPONSE = {"message": "If this email can be used for an account, check your inbox for further instructions."}

    async def _send_verification_email(email, name, plain_token, uid, client_ip):
        html = verification_email(name, plain_token)
        try:
            res = await send_email_via_gas(email, "Verify your AdMind account", html)
            status = "sent" if res.get("status") == "ok" else "failed"
            log = EmailLog(user_id=uid, email_to=email, email_type="verification", status=status, ip_address=client_ip, gas_response=str(res))
        except Exception as e:
            log = EmailLog(user_id=uid, email_to=email, email_type="verification", status="failed", ip_address=client_ip, gas_response=str(e))
        db_session = SessionLocal()
        db_session.add(log)
        db_session.commit()
        db_session.close()

    try:
        existing = db.query(User).filter(User.email == normalized_email).first()

        if existing is None:
            # CASE 1: Brand new email
            hashed_password = get_password_hash(user.password)
            new_user = User(email=normalized_email, name=user.name, hashed_password=hashed_password, is_verified=False)
            db.add(new_user)
            db.flush()
            
            ws = Workspace(name="My Workspace", owner_id=new_user.id)
            db.add(ws)
            db.flush()
            ws_member = WorkspaceMember(workspace_id=ws.id, user_id=new_user.id, role="admin")
            db.add(ws_member)
            
            import hashlib
            plain, hashed = generate_token()
            db.add(EmailToken(user_id=new_user.id, token_hash=hashed, token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=24)))
            db.commit()
            background_tasks.add_task(_send_verification_email, normalized_email, new_user.name, plain, new_user.id, ip)
            
        elif not existing.is_verified:
            if getattr(existing, 'email_blocked', False):
                return GENERIC_RESPONSE
            # CASE 2: PENDING re-registration
            existing.hashed_password = get_password_hash(user.password)
            if user.name:
                existing.name = user.name
                
            import time
            now = time.time()
            last_sent = _verify_cooldown_store.get(normalized_email)
            if last_sent is None or (now - last_sent) >= VERIFY_COOLDOWN_SECONDS:
                _verify_cooldown_store[normalized_email] = now
                
                db.query(EmailToken).filter(
                    EmailToken.user_id == existing.id,
                    EmailToken.token_type == "verify",
                    EmailToken.used_at == None
                ).update({"used_at": datetime.utcnow()})
                
                import hashlib
                plain, hashed = generate_token()
                db.add(EmailToken(user_id=existing.id, token_hash=hashed, token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=24)))
                background_tasks.add_task(_send_verification_email, normalized_email, existing.name, plain, existing.id, ip)
                
            db.commit()
            
        else:
            # CASE 3: ACTIVE account
            pass
            
    except IntegrityError:
        db.rollback()
        existing = db.query(User).filter(User.email == normalized_email).first()
        if existing and not existing.is_verified:
            existing.hashed_password = get_password_hash(user.password)
            import time
            now = time.time()
            last_sent = _verify_cooldown_store.get(normalized_email)
            if last_sent is None or (now - last_sent) >= VERIFY_COOLDOWN_SECONDS:
                _verify_cooldown_store[normalized_email] = now
                
                db.query(EmailToken).filter(
                    EmailToken.user_id == existing.id,
                    EmailToken.token_type == "verify",
                    EmailToken.used_at == None
                ).update({"used_at": datetime.utcnow()})
                import hashlib
                plain, hashed = generate_token()
                db.add(EmailToken(user_id=existing.id, token_hash=hashed, token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=24)))
                background_tasks.add_task(_send_verification_email, normalized_email, existing.name, plain, existing.id, ip)
                
            db.commit()

    return GENERIC_RESPONSE


@app.post("/login", response_model=Token)
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    normalized_email = form_data.username.strip().lower()
    
    await check_rate_limit(f"ratelimit:login:{ip}", 10, 900)
    await check_rate_limit(f"ratelimit:auth_global:{ip}", 20, 60)

    user = db.query(User).filter(User.email == normalized_email).first()
    password_ok = user is not None and verify_password(form_data.password, user.hashed_password)
    
    if not password_ok:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    
    if getattr(user, 'login_blocked', False):
        raise HTTPException(status_code=403, detail="Login has been restricted for this account.")
    
    if user.is_banned:
        raise HTTPException(status_code=403, detail="Your account has been banned.")
        
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer", "X-Verification-Required": "true"}
        )
    
    access_token = create_access_token(data={"sub": user.email, "name": user.name}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/resend-verification")
async def resend_verification(req: ResendVerificationRequest, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    normalized_email = req.email.strip().lower()
    
    await check_rate_limit(f"ratelimit:resend_verify:{ip}", 3, 3600)
    await check_rate_limit(f"ratelimit:resend_verify_email:{normalized_email}", 3, 3600)
    await check_rate_limit(f"ratelimit:auth_global:{ip}", 20, 60)

    GENERIC_RESPONSE = {"message": "If your email is unregistered or already verified, no email will be sent. Otherwise, check your inbox."}

    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or user.is_verified or getattr(user, 'email_blocked', False):
        return GENERIC_RESPONSE
        
    import time
    now = time.time()
    last_sent = _verify_cooldown_store.get(normalized_email)
    if last_sent is not None and (now - last_sent) < VERIFY_COOLDOWN_SECONDS:
        return GENERIC_RESPONSE
        
    _verify_cooldown_store[normalized_email] = now
        
    db.query(EmailToken).filter(
        EmailToken.user_id == user.id,
        EmailToken.token_type == "verify",
        EmailToken.used_at == None
    ).update({"used_at": datetime.utcnow()})
        
    import hashlib
    plain, hashed = generate_token()
    token_record = EmailToken(user_id=user.id, token_hash=hashed, token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=24))
    db.add(token_record)
    db.commit()

    async def send_verification(email, name, plain_token, uid):
        html = verification_email(name, plain_token)
        try:
            res = await send_email_via_gas(email, "Verify your AdMind account", html)
            status = "sent" if res.get("status") == "ok" else "failed"
            log = EmailLog(user_id=uid, email_to=email, email_type="verification", status=status, ip_address=ip, gas_response=str(res))
        except Exception as e:
            log = EmailLog(user_id=uid, email_to=email, email_type="verification", status="failed", ip_address=ip, gas_response=str(e))
        db_session = SessionLocal()
        db_session.add(log)
        db_session.commit()
        db_session.close()

    background_tasks.add_task(send_verification, user.email, user.name, plain, user.id)
    return GENERIC_RESPONSE

@app.post("/auth/verify-email")
async def verify_email(body: VerifyEmailRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(f"ratelimit:verify_token:{ip}", 20, 3600)
    
    import hashlib
    token_hash = hashlib.sha256(body.token.encode()).hexdigest()
    record = db.query(EmailToken).filter(EmailToken.token_hash == token_hash, EmailToken.token_type == "verify").first()
    
    # Unified error message to prevent token state enumeration
    invalid_error = HTTPException(status_code=400, detail="This verification link is invalid or has already been used.")
    
    if not record:
        raise invalid_error
    if record.used_at:
        raise invalid_error
    if record.expires_at.replace(tzinfo=None) < datetime.utcnow():
        raise invalid_error
        
    record.used_at = datetime.utcnow()
    user = db.query(User).filter(User.id == record.user_id).first()
    if user:
        user.is_verified = True
        
    db.query(EmailToken).filter(
        EmailToken.user_id == record.user_id,
        EmailToken.token_type == "verify",
        EmailToken.used_at == None
    ).update({"used_at": datetime.utcnow()})
    
    db.commit()
    
    return {"message": "Email verified successfully"}

RESET_COOLDOWN_MINUTES = 10
RESET_COOLDOWN_SECONDS = RESET_COOLDOWN_MINUTES * 60
_reset_cooldown_store: dict[str, float] = {}

@app.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    import time
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(f"ratelimit:forgot:{ip}", 3, 3600)
    await check_rate_limit(f"ratelimit:auth_global:{ip}", 20, 60)

    email_key = req.email.strip().lower()
    now = time.time()

    # --- 1. Check per-email cooldown (unconditional, regardless of account existence) ---
    last_sent = _reset_cooldown_store.get(email_key)
    if last_sent is not None:
        elapsed = now - last_sent
        if elapsed < RESET_COOLDOWN_SECONDS:
            remaining = int(RESET_COOLDOWN_SECONDS - elapsed)
            return {"cooldown_seconds_remaining": remaining}

    # --- 2. Record the cooldown timestamp NOW (before any DB check) ---
    _reset_cooldown_store[email_key] = now

    # --- 3. Silently try to send email — only if account exists and is verified ---
    user = db.query(User).filter(User.email == req.email).first()
    if user and user.is_verified and not getattr(user, 'email_blocked', False):
        import hashlib
        plain, hashed = generate_token()
        token_record = EmailToken(user_id=user.id, token_hash=hashed, token_type="reset", expires_at=datetime.utcnow() + timedelta(minutes=15))
        db.add(token_record)
        db.commit()

        async def send_reset(email, name, plain_token, uid):
            html = password_reset_email(name, plain_token)
            try:
                res = await send_email_via_gas(email, "Password Reset Request", html)
                status = "sent" if res.get("status") == "ok" else "failed"
                log = EmailLog(user_id=uid, email_to=email, email_type="password_reset", status=status, ip_address=ip, gas_response=str(res))
            except Exception as e:
                log = EmailLog(user_id=uid, email_to=email, email_type="password_reset", status="failed", ip_address=ip, gas_response=str(e))
            db_session = SessionLocal()
            db_session.add(log)
            db_session.commit()
            db_session.close()

        background_tasks.add_task(send_reset, user.email, user.name, plain, user.id)

    # --- 4. Always return the same response ---
    return {"cooldown_seconds_remaining": RESET_COOLDOWN_SECONDS}

@app.post("/auth/reset-password")
async def reset_password(req: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(f"ratelimit:reset_password:{ip}", 5, 900)
    await check_rate_limit(f"ratelimit:auth_global:{ip}", 20, 60)
    
    import hashlib
    token_hash = hashlib.sha256(req.token.encode()).hexdigest()
    record = db.query(EmailToken).filter(EmailToken.token_hash == token_hash, EmailToken.token_type == "reset").first()
    
    if not record:
        raise HTTPException(status_code=400, detail="Invalid token")
    if record.used_at:
        raise HTTPException(status_code=400, detail="Token already used")
    if record.expires_at.replace(tzinfo=None) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")
        
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        
    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.hashed_password = get_password_hash(req.new_password)
    record.used_at = datetime.utcnow()
    
    # Invalidate all other unused reset tokens for this user
    db.query(EmailToken).filter(
        EmailToken.user_id == user.id, 
        EmailToken.token_type == "reset", 
        EmailToken.used_at == None
    ).update({"used_at": datetime.utcnow()})
    
    db.commit()
    
    return {"message": "Password reset successfully"}


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
    check_feature_blocked(current_user, "workspaces", db)
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
    check_feature_blocked(current_user, "analyze", db)
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
    check_feature_blocked(current_user, "history", db)
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
    check_feature_blocked(current_user, "history", db)
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
    check_feature_blocked(current_user, "chat", db)
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
    check_feature_blocked(current_user, "chat", db)
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
    check_feature_blocked(current_user, "ab_tests", db)
    wid = _get_workspace_id(request, db, current_user)
    if not wid:
        return []
    
    tests = db.query(ABTestCampaign).filter(ABTestCampaign.workspace_id == wid).order_by(desc(ABTestCampaign.created_at)).all()
    return tests

@app.post("/workspaces/tests")
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

@app.put("/workspaces/tests/{test_id}/winner")
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


# Tools Endpoints
class UrlRequest(BaseModel):
    url: str

class DescRequest(BaseModel):
    description: str

class AdRequest(BaseModel):
    ad_copy: str

@app.post("/tools/audit-landing-page")
async def audit_landing_page(req: UrlRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "tools", db)
    return await run_landing_page_auditor(req.url)

@app.post("/tools/audience-builder")
async def build_audience(req: DescRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "tools", db)
    return await run_audience_builder(req.description)

@app.post("/tools/competitor-teardown")
async def tear_down_competitor(req: AdRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "tools", db)
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
    check_feature_blocked(current_user, "community", db)
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
def get_admin_users(page: int = 1, size: int = 20, search: str = "", role: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    if role == "admin":
        query = query.filter(User.is_superadmin == True)
    elif role == "user":
        query = query.filter(User.is_superadmin == False)
    elif role == "banned":
        query = query.filter(User.is_banned == True)
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


class FeatureControlUpdate(BaseModel):
    feature: str
    is_blocked: bool
    reason: Optional[str] = None

@app.get("/admin/users/{user_id}/controls")
def get_user_controls(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    controls = db.query(UserFeatureControl).filter(UserFeatureControl.user_id == user_id).all()
    ctrl_dict = {
        c.feature: {"blocked": c.is_blocked, "reason": c.reason}
        for c in controls
    }
    
    # Fill in defaults for all features
    features = ["analyze", "history", "chat", "tools", "ab_tests", "workspaces", "community", "support", "export"]
    res_features = {}
    for f in features:
        res_features[f] = ctrl_dict.get(f, {"blocked": False, "reason": None})
        
    return {
        "user_id": user.id,
        "email": user.email,
        "login_blocked": getattr(user, 'login_blocked', False),
        "email_blocked": getattr(user, 'email_blocked', False),
        "features": res_features
    }

@app.post("/admin/users/{user_id}/controls")
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

@app.put("/admin/users/{user_id}/login-block")
def toggle_login_block(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot block your own login")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.login_blocked = not getattr(user, 'login_blocked', False)
    db.commit()
    return {"message": "Login block status updated", "login_blocked": user.login_blocked}

@app.put("/admin/users/{user_id}/email-block")
def toggle_email_block(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.email_blocked = not getattr(user, 'email_blocked', False)
    db.commit()
    return {"message": "Email block status updated", "email_blocked": user.email_blocked}

@app.get("/admin/jobs", response_model=dict)
def get_admin_jobs(page: int = 1, size: int = 20, status: str = "", search: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(AnalysisJob)
    if status and status != "all":
        query = query.filter(AnalysisJob.status == status)
    if search:
        query = query.join(User, User.id == AnalysisJob.user_id).filter(User.email.ilike(f"%{search}%"))
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
def get_admin_workspaces(page: int = 1, size: int = 20, search: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(Workspace)
    if search:
        from sqlalchemy import or_
        query = query.outerjoin(User, User.id == Workspace.owner_id).filter(
            or_(
                Workspace.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
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

@app.get("/admin/activity", response_model=dict)
def get_admin_activity(page: int = 1, size: int = 20, type_filter: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    feed = []
    
    if type_filter in ["", "users", "all"]:
        users = db.query(User).order_by(desc(User.created_at)).limit(500).all()
        for u in users:
            feed.append({"type": "user_registered", "message": f"New user registered: {u.email}", "timestamp": u.created_at})
            
    if type_filter in ["", "jobs", "all"]:
        jobs = db.query(AnalysisJob).order_by(desc(AnalysisJob.created_at)).limit(500).all()
        for j in jobs:
            user = db.query(User).filter(User.id == j.user_id).first()
            email = user.email if user else "Unknown"
            feed.append({"type": f"job_{j.status}", "message": f"Job {j.status} for {email}", "timestamp": j.created_at})
            
    if type_filter in ["", "reviews", "all"]:
        reviews = db.query(CommunityReview).order_by(desc(CommunityReview.created_at)).limit(500).all()
        for r in reviews:
            user = db.query(User).filter(User.id == r.user_id).first()
            email = user.email if user else "Unknown"
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


# --- TICKET SYSTEM ---

@app.post("/contact", status_code=201)
def create_guest_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    if not ticket.guest_name or not ticket.guest_email:
        raise HTTPException(status_code=400, detail="Guest name and email are required")
    
    db_ticket = SupportTicket(
        guest_name=ticket.guest_name,
        guest_email=ticket.guest_email,
        category=ticket.category,
        subject=ticket.subject
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    # Initial message
    db_msg = TicketMessage(
        ticket_id=db_ticket.id,
        sender_type="guest",
        message=ticket.message
    )
    db.add(db_msg)
    db.commit()

    return {"message": "Ticket created successfully"}


@app.post("/tickets", status_code=201)
def create_user_ticket(ticket: TicketCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_feature_blocked(current_user, "support", db)
    db_ticket = SupportTicket(
        user_id=current_user.id,
        category=ticket.category,
        subject=ticket.subject
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    # Initial message
    db_msg = TicketMessage(
        ticket_id=db_ticket.id,
        sender_type="user",
        message=ticket.message
    )
    db.add(db_msg)
    db.commit()

    return {"message": "Ticket created successfully", "ticket_id": db_ticket.id}


@app.get("/tickets/mine", response_model=dict)
def get_my_tickets(page: int = 1, size: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id)
    total = query.count()
    tickets = query.order_by(desc(SupportTicket.created_at)).offset((page - 1) * size).limit(size).all()
    
    items = []
    for t in tickets:
        items.append({
            "id": t.id,
            "category": t.category,
            "subject": t.subject,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else "",
            "updated_at": t.updated_at.isoformat() if t.updated_at else ""
        })
    
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}


@app.get("/tickets/{ticket_id}", response_model=TicketOut)
def get_ticket_detail(ticket_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket or ticket.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return {
        "id": ticket.id,
        "user_id": ticket.user_id,
        "guest_name": ticket.guest_name,
        "guest_email": ticket.guest_email,
        "category": ticket.category,
        "subject": ticket.subject,
        "status": ticket.status,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else "",
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else "",
        "messages": [
            {
                "id": m.id,
                "sender_type": m.sender_type,
                "message": m.message,
                "created_at": m.created_at.isoformat() if m.created_at else ""
            } for m in ticket.messages
        ]
    }


@app.post("/tickets/{ticket_id}/reply")
def reply_ticket(ticket_id: int, reply: TicketReplyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket or ticket.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket.status == "closed":
        raise HTTPException(status_code=400, detail="Cannot reply to a closed ticket")
    
    db_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_type="user",
        message=reply.message
    )
    db.add(db_msg)
    
    # Optionally update ticket status to "open" if it was "resolved"
    if ticket.status == "resolved":
        ticket.status = "open"
        
    db.commit()
    
    return {"message": "Reply added successfully"}


# Admin Ticket Routes
@app.get("/admin/tickets", response_model=dict)
def get_admin_tickets(page: int = 1, size: int = 20, status: str = "", category: str = "", search: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(SupportTicket)
    if status and status != "all":
        query = query.filter(SupportTicket.status == status)
    if category and category != "all":
        query = query.filter(SupportTicket.category == category)
    if search:
        from sqlalchemy import or_
        query = query.outerjoin(User, User.id == SupportTicket.user_id).filter(
            or_(
                SupportTicket.subject.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                SupportTicket.guest_email.ilike(f"%{search}%")
            )
        )
    
    total = query.count()
    tickets = query.order_by(desc(SupportTicket.created_at)).offset((page - 1) * size).limit(size).all()
    
    items = []
    for t in tickets:
        if t.user_id:
            user = db.query(User).filter(User.id == t.user_id).first()
            user_email = user.email if user else "Unknown User"
        else:
            user_email = f"{t.guest_name} (Guest)"
            
        items.append({
            "id": t.id,
            "user_id": t.user_id,
            "guest_name": t.guest_name,
            "guest_email": t.guest_email,
            "user_email": user_email,
            "category": t.category,
            "subject": t.subject,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else "",
            "updated_at": t.updated_at.isoformat() if t.updated_at else ""
        })
        
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}


@app.get("/admin/tickets/stats")
def get_admin_ticket_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    open_count = db.query(SupportTicket).filter(SupportTicket.status == "open").count()
    return {"open_count": open_count}


@app.get("/admin/tickets/{ticket_id}", response_model=TicketOut)
def get_admin_ticket_detail(ticket_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    return {
        "id": ticket.id,
        "user_id": ticket.user_id,
        "guest_name": ticket.guest_name,
        "guest_email": ticket.guest_email,
        "category": ticket.category,
        "subject": ticket.subject,
        "status": ticket.status,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else "",
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else "",
        "messages": [
            {
                "id": m.id,
                "sender_type": m.sender_type,
                "message": m.message,
                "created_at": m.created_at.isoformat() if m.created_at else ""
            } for m in ticket.messages
        ]
    }


@app.post("/admin/tickets/{ticket_id}/reply")
def reply_admin_ticket(ticket_id: int, reply: TicketReplyCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    db_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_type="admin",
        message=reply.message
    )
    db.add(db_msg)
    db.commit()
    
    return {"message": "Reply added successfully"}


@app.patch("/admin/tickets/{ticket_id}/status")
def update_admin_ticket_status(ticket_id: int, request: TicketStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if request.status not in ["open", "in_progress", "resolved", "closed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    ticket.status = request.status
    db.commit()
    
    return {"message": "Ticket status updated successfully"}


@app.delete("/admin/tickets/{ticket_id}")
def delete_admin_ticket(ticket_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Cascade delete is handled by relationship, but we can do it explicitly
    db.query(TicketMessage).filter(TicketMessage.ticket_id == ticket.id).delete()
    db.delete(ticket)
    db.commit()
    
    return {"message": "Ticket deleted successfully"}

@app.get("/admin/email-analytics")
def get_email_analytics(page: int = 1, size: int = 20, log_type: str = "", log_status: str = "", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    from sqlalchemy import func
    
    total = db.query(EmailLog).count()
    
    # Today's count
    today = datetime.utcnow().date()
    today_count = db.query(EmailLog).filter(func.date(EmailLog.created_at) == today).count()
    
    # By type
    verify_count = db.query(EmailLog).filter(EmailLog.email_type == "verification").count()
    reset_count = db.query(EmailLog).filter(EmailLog.email_type == "password_reset").count()
    
    # Success rate
    success_count = db.query(EmailLog).filter(EmailLog.status == "sent").count()
    success_rate = round(success_count / total, 2) if total > 0 else 1.0
    
    # Top IPs
    top_ips_query = db.query(EmailLog.ip_address, func.count(EmailLog.id).label("count"))\
                      .filter(EmailLog.ip_address != None)\
                      .group_by(EmailLog.ip_address)\
                      .order_by(desc("count"))\
                      .limit(10).all()
                      
    top_ips = [{"ip": ip, "count": count, "flagged": count > 50} for ip, count in top_ips_query]
    
    # Recent logs
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=False)
