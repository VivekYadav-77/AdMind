import asyncio
import json
import os

import google.generativeai as genai
from dotenv import load_dotenv


class GeminiError(Exception):
    pass


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview")
GEMINI_USE_MOCK_FALLBACK = os.getenv("GEMINI_USE_MOCK_FALLBACK", "true").lower() == "true"

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def _mock_gemini_response(prompt: str) -> str:
    # TODO: REAL_GEMINI_KEY - remove this stub once a real Gemini API key is configured.
    if '"total_spend"' in prompt and '"wasted_spend"' in prompt:
        return json.dumps(
            {
                "total_spend": 2225.1,
                "total_revenue": 5700.0,
                "total_roas": 2.56,
                "wasted_spend": 666.1,
                "issues": [
                    {
                        "keyword": "display banner",
                        "campaign_name": "Display",
                        "issue_type": "wasted_spend",
                        "severity": "high",
                        "spend": 500.0,
                        "detail": "This keyword spent $500.00 with zero conversions.",
                    },
                    {
                        "keyword": "buy shoes online",
                        "campaign_name": "Summer Sale",
                        "issue_type": "wasted_spend",
                        "severity": "medium",
                        "spend": 60.0,
                        "detail": "This keyword spent $60.00 with zero conversions and low CTR.",
                    },
                    {
                        "keyword": "competitor name",
                        "campaign_name": "Competitor",
                        "issue_type": "zero_conversion",
                        "severity": "medium",
                        "spend": 67.5,
                        "detail": "This competitor keyword has meaningful spend and no conversions.",
                    },
                ],
                "summary": "The account has profitable pockets, but several keywords are spending without conversions. Budget should move away from zero-conversion traffic and toward high-ROAS campaigns.",
            }
        )

    if '"recommendations"' in prompt:
        return json.dumps(
            {
                "recommendations": [
                    {
                        "priority": 1,
                        "action": "pause",
                        "target": "display banner",
                        "reasoning": "It spent $500.00 with zero conversions, making it the largest waste source.",
                        "expected_impact": "Recover up to $500.00 for higher-performing search and retargeting campaigns.",
                    },
                    {
                        "priority": 2,
                        "action": "reallocate",
                        "target": "Retargeting",
                        "reasoning": "Retargeting generated $1500.00 revenue from $216.00 spend.",
                        "expected_impact": "Shift budget toward a campaign with roughly 6.94x ROAS.",
                    },
                    {
                        "priority": 3,
                        "action": "test_new_copy",
                        "target": "buy shoes online",
                        "reasoning": "The keyword has low CTR and no conversions despite commercial intent.",
                        "expected_impact": "Improve click quality before deciding whether to pause it.",
                    },
                    {
                        "priority": 4,
                        "action": "reduce_bid",
                        "target": "competitor name",
                        "reasoning": "Competitor traffic has high CPC pressure and no conversions.",
                        "expected_impact": "Reduce inefficient spend while keeping limited coverage.",
                    },
                    {
                        "priority": 5,
                        "action": "increase_budget",
                        "target": "Brand Campaign",
                        "reasoning": "Brand traffic produced $2250.00 revenue from $320.00 spend.",
                        "expected_impact": "Capture more efficient conversions from proven branded demand.",
                    },
                ],
                "summary": "The strongest strategy is to pause or reduce inefficient zero-conversion spend, then reallocate budget toward brand and retargeting campaigns. Copy tests should focus on low-CTR keywords with clear purchase intent.",
            }
        )

    if '"variants"' in prompt:
        return json.dumps(
            {
                "variants": [
                    {
                        "keyword": "display banner",
                        "campaign_name": "Display",
                        "original_headline": "Display Ads",
                        "original_description": "See our products and learn more today.",
                        "new_headline": "Shop Top Deals",
                        "new_description": "Find limited-time offers and start saving today.",
                        "improvement_reason": "The rewrite adds a clearer offer and call to action.",
                    },
                    {
                        "keyword": "buy shoes online",
                        "campaign_name": "Summer Sale",
                        "original_headline": "Buy Shoes Online",
                        "original_description": "Browse shoes online for every style.",
                        "new_headline": "Save On Shoes",
                        "new_description": "Shop running shoes online with fast checkout today.",
                        "improvement_reason": "The rewrite makes the benefit more specific to purchase intent.",
                    },
                ],
                "summary": "The copy uses clearer offers, direct calls to action, and tighter keyword intent matching.",
            }
        )

    return "Hello from AdMind's temporary Gemini stub."


async def call_gemini(prompt: str, system_instruction: str = "") -> str:
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        return _mock_gemini_response(prompt)

    try:
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction=system_instruction or None,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 2048,
            },
        )
        response = await asyncio.wait_for(
            model.generate_content_async(prompt),
            timeout=30,
        )
        return response.text or ""
    except Exception as exc:
        if GEMINI_USE_MOCK_FALLBACK:
            # TODO: REAL_GEMINI_KEY - remove this fallback once live Gemini quota is available.
            return _mock_gemini_response(prompt)
        raise GeminiError(f"Gemini API call failed: {exc}") from exc
