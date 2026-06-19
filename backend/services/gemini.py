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
                        "detail": "This keyword spent $500.00 with zero conversions across all devices.",
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
                    {
                        "keyword": "cheap jackets",
                        "campaign_name": "Winter Promo",
                        "issue_type": "zero_conversion",
                        "severity": "low",
                        "spend": 39.6,
                        "detail": "This keyword spent $39.60 with zero conversions on both devices.",
                    },
                ],
                "segment_anomalies": [
                    {
                        "keyword": "running shoes",
                        "campaign_name": "Summer Sale",
                        "issue_type": "device_anomaly",
                        "severity": "high",
                        "spend": 200.0,
                        "detail": "Mobile spent $200 with 2 conversions but Desktop spent $100 with 0 conversions. Desktop has a 100% higher CPA.",
                        "segment_type": "device",
                        "segment_value": "Desktop",
                    },
                    {
                        "keyword": "mobile brand",
                        "campaign_name": "Search Brand",
                        "issue_type": "device_anomaly",
                        "severity": "medium",
                        "spend": 90.0,
                        "detail": "Desktop CPA is $22.50 vs Mobile CPA of $9.00. Desktop is 2.5x less efficient for this brand keyword.",
                        "segment_type": "device",
                        "segment_value": "Desktop",
                    },
                    {
                        "keyword": "account-wide",
                        "campaign_name": "Summer Sale",
                        "issue_type": "location_anomaly",
                        "severity": "medium",
                        "spend": 60.0,
                        "detail": "New York location spent $60 across Summer Sale with zero conversions while California produced conversions.",
                        "segment_type": "location",
                        "segment_value": "New York",
                    },
                ],
                "summary": "The account has profitable pockets, but several keywords are spending without conversions. Desktop traffic underperforms Mobile significantly for key terms. Budget should move away from zero-conversion traffic and toward high-ROAS campaigns.",
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
                        "action": "reduce_bid",
                        "target": "running shoes — Desktop",
                        "reasoning": "Desktop segment has $100 spend with 0 conversions while Mobile converts. Device-level bid adjustment needed.",
                        "expected_impact": "Reduce Desktop waste by ~$100/period while maintaining profitable Mobile traffic.",
                    },
                    {
                        "priority": 4,
                        "action": "test_new_copy",
                        "target": "buy shoes online",
                        "reasoning": "The keyword has low CTR and no conversions despite commercial intent.",
                        "expected_impact": "Improve click quality before deciding whether to pause it.",
                    },
                    {
                        "priority": 5,
                        "action": "reduce_bid",
                        "target": "competitor name",
                        "reasoning": "Competitor traffic has high CPC pressure and no conversions.",
                        "expected_impact": "Reduce inefficient spend while keeping limited coverage.",
                    },
                    {
                        "priority": 6,
                        "action": "increase_budget",
                        "target": "Brand Campaign",
                        "reasoning": "Brand traffic produced $2250.00 revenue from $320.00 spend.",
                        "expected_impact": "Capture more efficient conversions from proven branded demand.",
                    },
                ],
                "summary": "The strongest strategy is to pause zero-conversion Display spend, reduce Desktop bids on keywords where Mobile outperforms, and reallocate budget toward brand and retargeting campaigns. Copy tests should focus on low-CTR keywords with clear purchase intent.",
            }
        )

    if '"variants"' in prompt:
        return json.dumps(
            {
                "variants": [
                    {
                        "keyword": "display banner",
                        "campaign_name": "Display",
                        "test_a": {
                            "label": "Urgency Hook",
                            "angle": "Create time pressure to drive immediate clicks from display traffic.",
                            "headline": "Flash Sale — Ends Tonight",
                            "description": "Limited-time deals on top products. Shop now before stock runs out.",
                        },
                        "test_b": {
                            "label": "Social Proof",
                            "angle": "Use trust signals and popularity to overcome display ad skepticism.",
                            "headline": "Loved by 50K+ Shoppers",
                            "description": "See why thousands choose us. Top-rated products with free shipping.",
                        },
                        "test_rationale": "Display traffic is cold and skeptical. Testing urgency vs social proof will reveal whether this audience responds better to time pressure or trust signals.",
                    },
                    {
                        "keyword": "buy shoes online",
                        "campaign_name": "Summer Sale",
                        "test_a": {
                            "label": "Benefit-Led",
                            "angle": "Lead with the tangible benefit of comfort and quality.",
                            "headline": "Walk in Comfort Today",
                            "description": "Premium running shoes designed for all-day comfort. Free returns.",
                        },
                        "test_b": {
                            "label": "Deal-Focused",
                            "angle": "Emphasize savings and value to attract price-conscious buyers.",
                            "headline": "Save 40% On Shoes",
                            "description": "Summer sale on top running shoes. Fast checkout, free shipping.",
                        },
                        "test_rationale": "This keyword has clear purchase intent but zero conversions. Testing a benefit-led approach against a deal-focused one will show if users need quality reassurance or a price incentive to convert.",
                    },
                    {
                        "keyword": "competitor name",
                        "campaign_name": "Competitor",
                        "test_a": {
                            "label": "Direct Comparison",
                            "angle": "Position directly against the competitor with a clear differentiator.",
                            "headline": "Better Than [Rival]?",
                            "description": "Compare features side by side. See why switchers stay with us.",
                        },
                        "test_b": {
                            "label": "Alternative Framing",
                            "angle": "Position as a fresh alternative without directly attacking the competitor.",
                            "headline": "A Smarter Alternative",
                            "description": "Discover a new option loved by former [Rival] customers. Try free.",
                        },
                        "test_rationale": "Competitor keywords attract users already loyal to another brand. Testing aggressive comparison vs gentle alternative framing reveals the right tone for conquesting.",
                    },
                ],
                "summary": "The A/B testing strategy pairs opposing creative angles for each underperformer. Each test is designed to isolate a single messaging variable — urgency vs trust, benefit vs deal, comparison vs alternative — to generate statistically meaningful learnings that inform future campaigns.",
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
