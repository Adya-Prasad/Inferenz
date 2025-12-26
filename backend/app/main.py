"""FastAPI application factory and startup events."""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database import engine, Base
from .api.v1 import api_router

logger = logging.getLogger(__name__)

# Allow the frontend dev origin by default; in production set allowed origins via env
DEFAULT_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

app = FastAPI(title="Inferenz - Data Insights Platform")
app.include_router(api_router)

# Configure CORS for local development (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=DEFAULT_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Basic health check for load balancers and readiness probes."""
    return JSONResponse({"status": "ok"})


@app.on_event("startup")
async def on_startup():
    """Create DB tables on startup (useful for development)."""
    # Use run_sync to create tables synchronously on the async engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ensured (development mode)")
