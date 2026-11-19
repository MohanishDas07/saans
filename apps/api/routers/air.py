"""
Air Quality Forecast Router.
"""

from fastapi import APIRouter, Query
from schemas.contracts import AirQualityResponse
from services.air_service import get_air_quality

router = APIRouter(tags=["Air Quality"])


@router.get("/air", response_model=AirQualityResponse)
async def get_air(
    lat: float = Query(28.6692, ge=-90.0, le=90.0, description="Latitude"),
    lon: float = Query(77.4538, ge=-180.0, le=180.0, description="Longitude"),
    city: str | None = Query("Ghaziabad", description="City name"),
    fallback: bool = Query(False, description="Force labeled offline sample fixture"),
):
    return await get_air_quality(
        latitude=lat, longitude=lon, city_name=city, force_fallback=fallback
    )
