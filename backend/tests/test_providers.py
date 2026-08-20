import asyncio
import os
import sys

from dotenv import load_dotenv

sys.path.append(os.path.dirname(__file__))

load_dotenv()

from services.image_generator import ImageGenerationManager

async def test_all_providers():
    manager = ImageGenerationManager()
    prompt = "A simple test image of a blue square, low resolution."
    
    print("--- Provider API Diagnostics ---")
    
    # 1. Test Gemini
    print("\n1. Testing Gemini (gemini-2.5-flash-image)...")
    try:
        if not manager.gemini_key or manager.gemini_key.startswith("your_"):
            print("   -> SKIP: No valid Gemini key configured in .env")
        else:
            img = await manager._generate_gemini(prompt)
            print(f"   -> SUCCESS! Image generated ({len(img)} bytes)")
    except Exception as e:
        print(f"   -> FAILED: {str(e)}")

    # 2. Test Cloudflare
    print("\n2. Testing Cloudflare AI (FLUX.1 Schnell)...")
    try:
        if not manager.cf_token or not manager.cf_account_id or manager.cf_token.startswith("your_"):
            print("   -> SKIP: No valid Cloudflare token/account ID configured in .env")
        else:
            img = await manager._generate_cloudflare(prompt)
            print(f"   -> SUCCESS! Image generated ({len(img)} bytes)")
    except Exception as e:
        print(f"   -> FAILED: {str(e)}")

    # 3. Test Hugging Face
    print("\n3. Testing Hugging Face (FLUX.1 Schnell)...")
    try:
        if not manager.hf_key or manager.hf_key.startswith("your_"):
            print("   -> SKIP: No valid Hugging Face key configured in .env")
        else:
            img = await manager._generate_huggingface(prompt)
            print(f"   -> SUCCESS! Image generated ({len(img)} bytes)")
    except Exception as e:
        print(f"   -> FAILED: {str(e)}")

    # 4. Test Pollinations
    print("\n4. Testing Pollinations (Public URL Fallback)...")
    try:
        img = await manager._generate_pollinations(prompt)
        print(f"   -> SUCCESS! Image generated ({len(img)} bytes)")
    except Exception as e:
        print(f"   -> FAILED: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_all_providers())
