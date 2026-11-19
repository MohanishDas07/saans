"""
Geocoding Router for City Search.
"""

from fastapi import APIRouter, Query
from schemas.contracts import GeocodeResponse
from services.air_service import search_city_geocoding

router = APIRouter(tags=["Geocoding"])


@router.get("/geocode", response_model=GeocodeResponse)
async def geocode_city(q: str = Query("Ghaziabad", description="City name to search")):
    return await search_city_geocoding(q)
