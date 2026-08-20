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
from sqlalchemy import desc, func, text
from sqlalchemy.exc import IntegrityError
import tempfile
from docx2pdf import convert as docx_to_pdf

from db.database import Base, engine, get_db, SessionLocal
from db.models import AnalysisJob, User, Workspace, WorkspaceMember, ChatMessage, RecommendationComment, ABTestCampaign, CommunityReview, SupportTicket, TicketMessage, EmailToken, EmailLog, UserFeatureControl
from models.schemas import PipelineResult
from services.csv_parser import parse_csv
from agents.auditor import run_auditor
from agents.copywriter import run_copywriter
from agents.strategist import run_strategist
from app.dependencies import get_current_user

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
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Workspace-Id"],
)

def sanitize_like(s: str) -> str:
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

BASE_DIR = Path(__file__).resolve().parent
SAMPLE_CSV_PATH = BASE_DIR / "sample_data.csv"

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
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if job:
        if job.progress_logs is None:
            job.progress_logs = []
        job.progress_logs.append({"event": event, "data": data})
        flag_modified(job, "progress_logs")
        db.commit()

async def run_analysis_task(job_id: int, csv_text: str):
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


def _get_workspace_id(request: Request, db: Session, current_user: User):
    wid = request.headers.get("X-Workspace-Id")
    if wid:
        member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == int(wid), WorkspaceMember.user_id == current_user.id).first()
        if member:
            return int(wid)
    first_member = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == current_user.id).first()
    if first_member:
        return first_member.workspace_id
    return None


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

@app.get("/sample-csv")
async def get_sample_csv():
    if not SAMPLE_CSV_PATH.exists():
        raise HTTPException(status_code=404, detail="Sample CSV not found")
    return PlainTextResponse(
        SAMPLE_CSV_PATH.read_text(encoding="utf-8"),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="sample_ads.csv"'},
    )

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

# Include Routers
from routers import auth, workspaces, analyze, history, chat, tools, community, tickets
from routers.admin import __init__ as admin

app.include_router(auth.router, tags=["Authentication"])
app.include_router(workspaces.router, tags=["Workspaces"])
app.include_router(analyze.router, tags=["Analysis"])
app.include_router(history.router, tags=["History"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(tools.router, tags=["Tools"])
app.include_router(community.router, tags=["Community"])
app.include_router(tickets.router, tags=["Support"])
app.include_router(admin.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=False)
