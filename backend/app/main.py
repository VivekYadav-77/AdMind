from fastapi import FastAPI
from app.config import settings
from app.security import setup_cors

def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)
    setup_cors(app)
    
    # We will register routers here
    
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "ok", "version": settings.VERSION}
        
    return app
