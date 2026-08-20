import asyncio
import json
from services.csv_parser import parse_csv
from agents.auditor import run_auditor
from agents.strategist import run_strategist
from agents.copywriter import run_copywriter

async def main():
    with open("meta_ads_raw.csv", "r", encoding="utf-8") as f:
        csv_text = f.read()
    
    rows, stats = parse_csv(csv_text)
    print("=== ROWS PARSED ===")
    print(f"Total Rows: {len(rows)}")
    
    print("\n=== RUNNING AUDITOR ===")
    audit = await run_auditor(rows)
    print(json.dumps(audit.model_dump(), indent=2))
    
    print("\n=== RUNNING STRATEGIST ===")
    strategy = await run_strategist(rows, audit)
    print(json.dumps(strategy.model_dump(), indent=2))
    
    print("\n=== RUNNING COPYWRITER ===")
    copy = await run_copywriter(rows, audit)
    print(json.dumps(copy.model_dump(), indent=2))

if __name__ == "__main__":
    asyncio.run(main())
