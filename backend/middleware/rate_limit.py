"""
In-memory sliding window rate limiter.
No Redis or external dependencies required.
To upgrade to Redis later, replace this file only — the API (check_rate_limit) stays identical.
"""
import time
import asyncio
from collections import defaultdict, deque
from fastapi import HTTPException

# Global store: { key -> deque of timestamps }
_request_log: dict[str, deque] = defaultdict(deque)
_lock = asyncio.Lock()

async def check_rate_limit(key: str, limit: int, window_seconds: int):
    """
    Sliding window rate limiter.
    Raises HTTP 429 if `key` has exceeded `limit` requests within `window_seconds`.
    """
    now = time.time()
    cutoff = now - window_seconds

    async with _lock:
        window = _request_log[key]

        # Evict timestamps outside the current window
        while window and window[0] < cutoff:
            window.popleft()

        if len(window) >= limit:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": str(window_seconds)}
            )

        # Evict to prevent unbounded memory growth if dictionary grows too large
        if len(_request_log) > 10000:
            oldest_key = next(iter(_request_log))
            del _request_log[oldest_key]

        # Record this request
        window.append(now)
