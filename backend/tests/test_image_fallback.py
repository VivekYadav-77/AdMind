import asyncio
import os
import sys

from dotenv import load_dotenv

# Setup path so it can import services
sys.path.append(os.path.dirname(__file__))

load_dotenv()

# Purposefully corrupt Gemini and Cloudflare keys for testing
os.environ["GEMINI_API_KEY"] = "invalid_gemini_key"
os.environ["CLOUDFLARE_API_TOKEN"] = "invalid_cf_token"
# Leave HuggingFace and Pollinations as they are in the .env (or empty)

from services.image_generator import ImageGenerationManager

async def test_fallback():
    manager = ImageGenerationManager()
    
    # Update manager instances directly to simulate corrupted environment
    manager.gemini_key = "invalid"
    manager.cf_token = "invalid"
    
    print("Starting fallback test...")
    print(f"Gemini Key: {manager.gemini_key}")
    print(f"Cloudflare Token: {manager.cf_token}")
    print(f"HuggingFace Key: {manager.hf_key}")
    print(f"Pollinations Key: {manager.pollinations_key}")
    
    try:
        image_bytes = await manager.generate_image("A highly detailed futuristic city, 8k resolution, cinematic")
        print(f"\nSUCCESS: Generated image of size {len(image_bytes)} bytes.")
    except Exception as e:
        print(f"\nFAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_fallback())
