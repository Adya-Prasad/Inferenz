from fastapi import APIRouter

from .endpoints import datasources, search

api_router = APIRouter()
api_router.include_router(datasources.router, prefix="/api/v1/datasources", tags=["datasources"])
api_router.include_router(search.router, prefix="/api/v1/search", tags=["search"])
