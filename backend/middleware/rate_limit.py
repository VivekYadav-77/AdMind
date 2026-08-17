import os
import time
import redis.asyncio as aioredis
from fastapi import HTTPException

REDIS_URL = os.getenv("REDIS_URL")

_redis = None

async def get_redis():
    global _redis
    if _redis is None:
        if not REDIS_URL:
            # If no redis is configured, we fallback to no rate limiting for local dev
            print("WARNING: REDIS_URL not set, rate limiting disabled")
            return None
        _redis = aioredis.from_url(REDIS_URL, decode_responses=True)
    return _redis

async def check_rate_limit(key: str, limit: int, window_seconds: int):
    r = await get_redis()
    if r is None:
        return
        
    now = int(time.time())
    # Upstash free tier can be slow sometimes, pipeline ensures atomicity
    pipe = r.pipeline()
    pipe.zremrangebyscore(key, 0, now - window_seconds)
    pipe.zadd(key, {str(now * 1000): now})
    pipe.zcard(key)
    pipe.expire(key, window_seconds)
    
    results = await pipe.execute()
    count = results[2]
    
    if count > limit:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(window_seconds)}
        )
