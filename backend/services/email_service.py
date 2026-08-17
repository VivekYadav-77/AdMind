import os
import hashlib
import secrets
import httpx

GAS_WEBHOOK_URL = os.getenv("GAS_WEBHOOK_URL")
GAS_SECRET = os.getenv("GAS_SECRET")

async def send_email_via_gas(to: str, subject: str, html_body: str) -> dict:
    """POST to Google Apps Script relay. Returns {"status": "ok"} or raises."""
    if not GAS_WEBHOOK_URL or not GAS_SECRET:
        print("WARNING: GAS_WEBHOOK_URL or GAS_SECRET not set, not sending email.")
        return {"status": "skipped"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            GAS_WEBHOOK_URL,
            json={"to": to, "subject": subject, "body": html_body, "secret": GAS_SECRET},
            headers={"Content-Type": "application/json"}
        )
        resp.raise_for_status()
        return resp.json()

def generate_token() -> tuple[str, str]:
    """Returns (plain_token, sha256_hash). Store hash; email plain."""
    plain = secrets.token_urlsafe(32)
    hashed = hashlib.sha256(plain.encode()).hexdigest()
    return plain, hashed
