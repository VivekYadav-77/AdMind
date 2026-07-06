import os
import httpx
import base64
import random
import urllib.parse
import logging

logger = logging.getLogger(__name__)

class ImageGenerationManager:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_IMAGE_API_KEY") or os.getenv("GEMINI_API_KEY")
        self.cf_token = os.getenv("CLOUDFLARE_API_TOKEN")
        self.cf_account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        self.hf_key = os.getenv("HUGGINGFACE_API_KEY")
        self.pollinations_key = os.getenv("POLLINATIONS_API_KEY")
        self._gemini_semaphore = None

    async def generate_image(self, prompt: str) -> bytes:
        """
        Attempts to generate an image using a strict priority fallback sequence:
        1. Gemini -> 2. Cloudflare -> 3. Hugging Face -> 4. Pollinations
        """
        providers = [
            ("Gemini (gemini-2.5-flash-image)", self._generate_gemini),
            ("Cloudflare (FLUX.1 Schnell)", self._generate_cloudflare),
            ("Hugging Face (FLUX.1 Schnell)", self._generate_huggingface),
            ("Pollinations (Fallback)", self._generate_pollinations)
        ]

        last_exception = None

        for name, provider_func in providers:
            try:
                logger.info(f"Attempting to generate image with {name}...")
                image_bytes = await provider_func(prompt)
                if image_bytes:
                    logger.info(f"Successfully generated image with {name}.")
                    return image_bytes
            except Exception as e:
                logger.warning(f"Provider {name} failed: {str(e)}")
                last_exception = e
                continue

        logger.error("All image generation providers failed!")
        raise Exception(f"All image generation providers failed. Last error: {str(last_exception)}")

    async def _generate_gemini(self, prompt: str) -> bytes:
        import asyncio
        if self._gemini_semaphore is None:
            self._gemini_semaphore = asyncio.Semaphore(1)  # Strictly 1 request at a time to prevent 429

        if not self.gemini_key or self.gemini_key.startswith("your_"):
            raise ValueError("Gemini API key is not configured.")

        # Using the standard Gemini REST API for image generation
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={self.gemini_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        
        async with self._gemini_semaphore:
            max_retries = 3
            async with httpx.AsyncClient() as client:
                for attempt in range(max_retries):
                    response = await client.post(url, json=payload, timeout=60.0)
                    
                    if response.status_code == 429 and attempt < max_retries - 1:
                        wait_time = 2 ** (attempt + 1)
                        logger.warning(f"Gemini Rate Limited (429). Retrying in {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                        
                    response.raise_for_status()
                    data = response.json()
                    try:
                        # The image is returned as a base64 string in inlineData
                        b64 = data["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
                        return base64.b64decode(b64)
                    except (KeyError, IndexError):
                        raise ValueError(f"Unexpected response format from Gemini: {data}")
                        
                raise Exception("Gemini rate limit exceeded after max retries")

    async def _generate_cloudflare(self, prompt: str) -> bytes:
        if not self.cf_token or not self.cf_account_id or self.cf_token.startswith("your_"):
            raise ValueError("Cloudflare API token or account ID is not configured.")

        url = f"https://api.cloudflare.com/client/v4/accounts/{self.cf_account_id}/ai/run/@cf/black-forest-labs/flux-1-schnell"
        headers = {"Authorization": f"Bearer {self.cf_token}"}
        payload = {"prompt": prompt}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            # Cloudflare returns binary raw image data directly
            return response.content

    async def _generate_huggingface(self, prompt: str) -> bytes:
        if not self.hf_key or self.hf_key.startswith("your_"):
            raise ValueError("Hugging Face API key is not configured.")

        url = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
        headers = {"Authorization": f"Bearer {self.hf_key}"}
        payload = {"inputs": prompt}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            # HF returns binary raw image data directly
            return response.content

    async def _generate_pollinations(self, prompt: str) -> bytes:
        encoded = urllib.parse.quote(prompt)
        url = f"https://image.pollinations.ai/prompt/{encoded}?nologo=true"
        
        if self.pollinations_key and not self.pollinations_key.startswith("optional_"):
            url += f"&api_key={self.pollinations_key}"
            
        url += f"&seed={random.randint(1, 1000000)}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30.0)
            response.raise_for_status()
            return response.content

# Singleton instance
image_manager = ImageGenerationManager()
