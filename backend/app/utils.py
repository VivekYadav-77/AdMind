from fastapi import HTTPException, Request, UploadFile
from sqlalchemy.orm import Session
from db.models import UserFeatureControl, WorkspaceMember, AnalysisJob
from db.database import SessionLocal
from services.csv_parser import parse_csv
from agents.auditor import run_auditor
from agents.copywriter import run_copywriter
from agents.strategist import run_strategist
from models.schemas import PipelineResult

def sanitize_like(s: str) -> str:
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

def check_feature_blocked(user, feature: str, db: Session):
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

def _get_workspace_id(request: Request, db: Session, current_user):
    wid = request.headers.get("X-Workspace-Id")
    if wid:
        member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == int(wid), WorkspaceMember.user_id == current_user.id).first()
        if member:
            return int(wid)
    first_member = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == current_user.id).first()
    if first_member:
        return first_member.workspace_id
    return None
