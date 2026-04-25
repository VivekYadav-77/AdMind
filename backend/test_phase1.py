import asyncio

from services.csv_parser import parse_csv
from services.gemini import call_gemini


async def test():
    with open("sample_data.csv", "r") as f:
        content = f.read()

    rows, stats = parse_csv(content)
    print(f"OK CSV parsed: {len(rows)} rows, total spend: ${stats['total_spend']}")

    response = await call_gemini("Say hello in one sentence.")
    print(f"OK Gemini works: {response[:80]}")


asyncio.run(test())
