"""
Health and Diagnostic Router for SAANS API.
"""

from fastapi import APIRouter
from schemas.contracts import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def check_health():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        service="saans-api",
        offline_fallback_available=True,
        cache_backend="sqlite",
    )
