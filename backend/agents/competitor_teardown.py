import json
from services.gemini import call_gemini

async def run_competitor_teardown(ad_copy: str) -> dict:
    """
    Analyzes competitor ad copy and generates counter-ads.
    """
    
    system_instruction = (
        "You are an elite Direct Response Copywriter. "
        "Your job is to analyze a competitor's ad copy, identify their primary psychological angle, "
        "and generate 3 'counter-ads' designed to disrupt their messaging and steal their traffic."
    )
    
    prompt = (
        f"Competitor Ad Copy:\n{ad_copy}\n\n"
        "Respond strictly with a JSON object in this format:\n"
        "{\n"
        '  "analysis": "<A 1-2 sentence breakdown of what angle the competitor is using (e.g., Fear of missing out, status, discount)>",\n'
        '  "counter_ads": [\n'
        '    {\n'
        '      "angle": "<The psychological angle of this counter ad>",\n'
        '      "headline": "<A punchy headline>",\n'
        '      "primary_text": "<The main ad copy>"\n'
        '    }\n'
        '  ],\n'
        '  "tool": "competitor_teardown"\n'
        "}"
        "\n\nMake sure counter_ads has exactly 3 items."
    )
    
    raw_response = await call_gemini(prompt, system_instruction)
    
    try:
        clean_json = raw_response.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(clean_json)
        return data
    except Exception as e:
        # Fallback if parsing fails
        return {
            "analysis": "Competitor is using a standard features/benefits approach.",
            "counter_ads": [
                {"angle": "Price Anchor", "headline": "Don't Overpay for X", "primary_text": "Get the same quality for half the price."},
                {"angle": "Social Proof", "headline": "Why 10k People Switched", "primary_text": "See why everyone is leaving the old way behind."},
                {"angle": "Risk Reversal", "headline": "Try Risk-Free Today", "primary_text": "Not happy? We will refund you and let you keep the product."}
            ],
            "tool": "competitor_teardown"
        }
