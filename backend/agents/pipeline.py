from models.schemas import PipelineResult
from services.csv_parser import parse_csv

from agents.auditor import run_auditor
from agents.copywriter import run_copywriter
from agents.strategist import run_strategist


async def run_pipeline(csv_content: str) -> PipelineResult:
    rows, _stats = parse_csv(csv_content)

    audit_result = await run_auditor(rows)
    strategy_result = await run_strategist(rows, audit_result)
    copy_result = await run_copywriter(rows, audit_result)

    return PipelineResult(
        audit=audit_result,
        strategy=strategy_result,
        copy=copy_result,
        status="complete",
    )
