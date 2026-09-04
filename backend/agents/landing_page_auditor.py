import json
import requests
from bs4 import BeautifulSoup
from services.gemini import call_gemini

async def run_landing_page_auditor(url: str) -> dict:
    """
    Analyzes landing page text for CRO issues using Gemini.
    """
    
    try:
        # Fetch the URL with a realistic User-Agent
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "noscript", "meta"]):
            script.extract()
            
        text = soup.get_text(separator=' ', strip=True)
        html_content = text
    except Exception as e:
        html_content = f"Failed to fetch content from {url}. Error: {str(e)}"
    
    # Truncate content to avoid blowing up context window
    truncated_content = html_content[:20000]
    
    system_instruction = (
        "You are an elite Conversion Rate Optimization (CRO) expert. "
        "Analyze the text extracted from the user's landing page and provide a brutal, actionable critique. "
        "Focus on: clarity, CTA strength, friction points, trust signals, and overall layout structure."
    )
    
    prompt = (
        f"Landing Page URL: {url}\n\n"
        f"Extracted Text content:\n{truncated_content}\n\n"
        "Respond strictly with a JSON object in this format:\n"
        "{\n"
        '  "score": <A number between 0 and 100 representing the CRO score>,\n'
        '  "analysis": "<A 2-3 paragraph analysis formatted as HTML. Use <strong>, <ul>, <li> tags to highlight key issues. Do NOT use markdown.>",\n'
        '  "tool": "landing_page_auditor"\n'
        "}"
    )
    
    raw_response = await call_gemini(prompt, system_instruction)
    
    try:
        # Clean up response if Gemini added markdown ticks
        clean_json = raw_response.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(clean_json)
        return data
    except Exception as e:
        # Fallback if parsing fails
        return {
            "score": 65,
            "analysis": f"<p>Failed to parse AI response. Raw output:</p><p>{raw_response}</p>",
            "tool": "landing_page_auditor"
        }
