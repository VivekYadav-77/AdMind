import json
from services.gemini import call_gemini

async def run_audience_builder(description: str) -> dict:
    """
    Builds Meta and Google Ads targeting parameters based on a product description.
    """
    
    system_instruction = (
        "You are an elite Media Buyer and Audience Strategist. "
        "Given a product/business description, your job is to output precise, highly-effective "
        "targeting parameters for both Meta Ads (Facebook/Instagram) and Google Ads."
    )
    
    prompt = (
        f"Product/Business Description: {description}\n\n"
        "Respond strictly with a JSON object in this format:\n"
        "{\n"
        '  "meta": {\n'
        '    "interests": ["<interest 1>", "<interest 2>", "<interest 3>"],\n'
        '    "behaviors": ["<behavior 1>", "<behavior 2>"]\n'
        '  },\n'
        '  "google": {\n'
        '    "in_market": ["<segment 1>", "<segment 2>"],\n'
        '    "keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"]\n'
        '  },\n'
        '  "tool": "audience_builder"\n'
        "}"
    )
    
    raw_response = await call_gemini(prompt, system_instruction)
    
    try:
        clean_json = raw_response.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(clean_json)
        return data
    except Exception as e:
        # Fallback if parsing fails
        return {
            "meta": {"interests": ["Broad Targeting"], "behaviors": ["Online Shoppers"]},
            "google": {"in_market": ["Custom Intent"], "keywords": ["product keyword"]},
            "tool": "audience_builder"
        }
