import asyncio

from agents.pipeline import run_pipeline


async def test():
    with open("sample_data.csv", "r") as f:
        content = f.read()

    print("Running agent pipeline...")
    result = await run_pipeline(content)

    print(f"OK Auditor: found {len(result.audit.issues)} issues, ${result.audit.wasted_spend} wasted")
    print(f"OK Strategist: generated {len(result.strategy.recommendations)} recommendations")
    print(f"OK Copywriter: rewrote {len(result.copy.variants)} ad variants")
    print(f"\nROAS: {result.audit.total_roas:.2f}x")
    print(f"\nTop recommendation: {result.strategy.recommendations[0].reasoning}")


asyncio.run(test())
