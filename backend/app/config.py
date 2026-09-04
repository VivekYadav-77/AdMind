import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AdMind API"
    VERSION: str = "1.0.0"
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5174")
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]
    
settings = Settings()
