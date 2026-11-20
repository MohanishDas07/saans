"""
Air Quality Data Service with SQLite 15-minute TTL Caching and Labeled Fixture Fallback.
Implements Open-Meteo API integration with 0.1° spatial rounding and robust offline support.
"""

import json
import logging
import math
import os
import sqlite3
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx
from engine import (
    get_grap_stage,
    get_overall_cpcb_aqi,
)
from schemas.contracts import (
    AirQualityResponse,
    GeocodeItem,
    GeocodeResponse,
    GRAPStageInfo,
    HourlyAirPoint,
)

logger = logging.getLogger("saans.air_service")

CACHE_DIR = Path(
    os.environ.get("CACHE_DIR", Path(__file__).resolve().parent.parent / "data")
)
CACHE_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = CACHE_DIR / "saans_cache.sqlite3"
FIXTURES_DIR = Path(__file__).resolve().parent.parent / "data" / "fixtures"

TTL_SECONDS = 15 * 60  # 15 minutes TTL


def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in km between two coordinate pairs."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), timeout=5.0, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=DELETE;")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS air_cache (
            lat_rounded REAL,
            lon_rounded REAL,
            cached_at INTEGER,
            payload TEXT,
            PRIMARY KEY (lat_rounded, lon_rounded)
        );
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS geocode_cache (
            query TEXT PRIMARY KEY,
            cached_at INTEGER,
            payload TEXT
        );
        """
    )
    conn.commit()
    return conn


_conn = get_db_connection()


def round_coords(lat: float, lon: float) -> tuple[float, float]:
    """Rounds coordinates to approximately 0.1 degree (~11 km) for cache collapsing."""
    return round(lat, 1), round(lon, 1)


def find_closest_fixture(lat: float, lon: float) -> tuple[dict, str, float]:
    """
    Finds the closest labeled fixture among Ghaziabad, Delhi, and Lucknow.
    Returns (fixture_data, nearest_city_name, distance_km).
    """
    fixtures = [
        (28.6692, 77.4538, "Ghaziabad", FIXTURES_DIR / "ghaziabad.json"),
        (28.6139, 77.2090, "Delhi", FIXTURES_DIR / "delhi.json"),
        (26.8467, 80.9462, "Lucknow", FIXTURES_DIR / "lucknow.json"),
    ]
    best_file = fixtures[0][3]
    best_city = fixtures[0][2]
    best_dist_km = float("inf")

    for f_lat, f_lon, c_name, path in fixtures:
        d_km = calculate_distance_km(lat, lon, f_lat, f_lon)
        if d_km < best_dist_km and path.exists():
            best_dist_km = d_km
            best_file = path
            best_city = c_name

    with open(best_file, "r", encoding="utf-8") as f:
        return json.load(f), best_city, best_dist_km


def search_city_geocoding_sync(query: str) -> GeocodeResponse:
    """Synchronous geocoding lookup for offline/fallback mode."""
    clean_q = query.strip().lower()
    fallback_items = [
        GeocodeItem(
            name="Ghaziabad",
            latitude=28.6692,
            longitude=77.4538,
            country="India",
            admin1="Uttar Pradesh",
        ),
        GeocodeItem(
            name="Delhi",
            latitude=28.6139,
            longitude=77.2090,
            country="India",
            admin1="Delhi",
        ),
        GeocodeItem(
            name="Lucknow",
            latitude=26.8467,
            longitude=80.9462,
            country="India",
            admin1="Uttar Pradesh",
        ),
    ]
    matched = [item for item in fallback_items if clean_q in item.name.lower()]
    return GeocodeResponse(query=query, results=matched if matched else fallback_items)


async def search_city_geocoding(query: str) -> GeocodeResponse:
    """
    Searches cities via Open-Meteo Geocoding API with local SQLite cache
    and offline fallback for Delhi, Ghaziabad, and Lucknow.
    """
    clean_q = query.strip().lower()
    if not clean_q:
        return GeocodeResponse(query=query, results=[])

    if os.environ.get("SAANS_OFFLINE") == "1":
        fallback_items = [
            GeocodeItem(
                name="Ghaziabad",
                latitude=28.6692,
                longitude=77.4538,
                country="India",
                admin1="Uttar Pradesh",
            ),
            GeocodeItem(
                name="Delhi",
                latitude=28.6139,
                longitude=77.2090,
                country="India",
                admin1="Delhi",
            ),
            GeocodeItem(
                name="Lucknow",
                latitude=26.8467,
                longitude=80.9462,
                country="India",
                admin1="Uttar Pradesh",
            ),
        ]
        matched = [item for item in fallback_items if clean_q in item.name.lower()]
        return GeocodeResponse(
            query=query, results=matched if matched else fallback_items
        )

    # Check cache
    cursor = _conn.cursor()
    cursor.execute(
        "SELECT cached_at, payload FROM geocode_cache WHERE query = ?", (clean_q,)
    )
    row = cursor.fetchone()
    now_ts = int(time.time())

    if row and (now_ts - row[0]) < 86400 * 7:  # Geocoding cached for 7 days
        data = json.loads(row[1])
        return GeocodeResponse(**data)

    # Attempt upstream API call
    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {"name": query, "count": 5, "language": "en", "format": "json"}

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("results", []):
                    results.append(
                        GeocodeItem(
                            name=item.get("name"),
                            latitude=item.get("latitude"),
                            longitude=item.get("longitude"),
                            country=item.get("country", "India"),
                            admin1=item.get("admin1"),
                        )
                    )
                response_obj = GeocodeResponse(query=query, results=results)
                # Cache response
                _conn.execute(
                    "INSERT OR REPLACE INTO geocode_cache (query, cached_at, payload) VALUES (?, ?, ?)",
                    (clean_q, now_ts, response_obj.model_dump_json()),
                )
                _conn.commit()
                return response_obj
    except (httpx.HTTPError, OSError, ValueError, RuntimeError) as e:
        logger.warning(
            f"Upstream geocoding failed or unreachable: {e}. Falling back to local fixtures."
        )

    # Offline / local fallback
    fallback_items = [
        GeocodeItem(
            name="Ghaziabad",
            latitude=28.6692,
            longitude=77.4538,
            country="India",
            admin1="Uttar Pradesh",
        ),
        GeocodeItem(
            name="Delhi",
            latitude=28.6139,
            longitude=77.2090,
            country="India",
            admin1="Delhi",
        ),
        GeocodeItem(
            name="Lucknow",
            latitude=26.8467,
            longitude=80.9462,
            country="India",
            admin1="Uttar Pradesh",
        ),
    ]
    matched = [item for item in fallback_items if clean_q in item.name.lower()]
    return GeocodeResponse(query=query, results=matched if matched else fallback_items)


def _build_response_from_fixture(
    fixture_data: dict,
    city_override: str | None = None,
    nearest_city: str | None = None,
    distance_km: float = 0.0,
) -> AirQualityResponse:
    hourly_points: list[HourlyAirPoint] = []
    hourly_raw = fixture_data.get("hourly", [])

    for h in hourly_raw:
        pm25 = float(h.get("pm2_5", 0.0))
        pm10 = float(h.get("pm10", 0.0)) if h.get("pm10") is not None else None
        aqi_val, band, _ = get_overall_cpcb_aqi(pm25, pm10)
        grap = get_grap_stage(aqi_val)

        hourly_points.append(
            HourlyAirPoint(
                hour=int(h.get("hour", 0)),
                time_iso=h.get("time", f"T{h.get('hour', 0):02d}:00:00Z"),
                pm2_5=pm25,
                pm10=pm10,
                cpcb_aqi=aqi_val,
                aqi_band_code=band.code,
                aqi_band_name=band.name,
                aqi_color_hex=band.color_hex,
                health_statement_en=band.health_statement_en,
                health_statement_hi=band.health_statement_hi,
                health_statement_mr=band.health_statement_mr,
                grap_stage=grap.stage_number if grap else None,
            )
        )

    # Current hour selected according to local IST time (UTC + 5:30)
    now_utc = datetime.now(timezone.utc)
    ist_hour = (now_utc + timedelta(hours=5, minutes=30)).hour
    current_pt = next(
        (p for p in hourly_points if p.hour == ist_hour),
        (hourly_points[0] if hourly_points else None),
    )

    current_aqi = current_pt.cpcb_aqi if current_pt else 450
    current_band = current_pt.aqi_band_code if current_pt else "severe"
    current_color = current_pt.aqi_color_hex if current_pt else "#7A0F2E"
    current_pm25 = current_pt.pm2_5 if current_pt else 350.0
    current_pm10 = current_pt.pm10 if current_pt else 480.0

    grap_obj = get_grap_stage(current_aqi)
    grap_info = None
    if grap_obj:
        grap_info = GRAPStageInfo(
            stage_number=grap_obj.stage_number,
            name=grap_obj.name,
            aqi_threshold=grap_obj.aqi_threshold_text,
            mandatory_actions=grap_obj.mandatory_actions_en,
            citizen_advisory=grap_obj.citizen_advisory_en,
        )

    display_city = city_override or fixture_data.get("city", "Ghaziabad")
    ref_city = nearest_city or fixture_data.get("city", "Ghaziabad")

    if distance_km > 150.0:
        banner = (
            f"OFFLINE SAMPLE REFERENCE: No active monitoring station data in {display_city}. "
            f"Displaying regional reference snapshot from {ref_city} ({int(distance_km)} km away)."
        )
        src = f"Regional Sample: {ref_city} Station ({int(distance_km)} km away)"
        verdict_en = (
            f"No live monitoring station in {display_city}. Nearest regional reference station is "
            f"{ref_city} ({int(distance_km)} km away, estimated AQI {current_aqi})."
        )
        verdict_hi = (
            f"{display_city} में कोई सक्रिय स्टेशन नहीं है। निकटतम संदर्भ स्टेशन "
            f"{ref_city} ({int(distance_km)} किमी दूर, अनुमानित AQI {current_aqi}) है।"
        )
        verdict_mr = (
            f"{display_city} येथे सक्रिय केंद्र उपलब्ध नाही. सर्वात जवळचे संदर्भ केंद्र "
            f"{ref_city} ({int(distance_km)} किमी अंतरावर, अंदाजे AQI {current_aqi}) आहे."
        )
    else:
        banner = (
            f"RECORDED SAMPLE: {ref_city} Reference Station (17 Nov 2026 Snapshot)."
        )
        src = f"Recorded Reference: {ref_city} Station"
        verdict_en = f"Estimated air quality in {display_city} is {current_band.replace('_', ' ').title()} (AQI {current_aqi})."
        verdict_hi = f"{display_city} में अनुमानित वायु गुणवत्ता {current_band.replace('_', ' ').title()} (AQI {current_aqi}) है।"
        verdict_mr = f"{display_city} मधील अंदाजे हवेची गुणवत्ता {current_band.replace('_', ' ').title()} (AQI {current_aqi}) आहे."

    return AirQualityResponse(
        city=display_city,
        state=fixture_data.get("state", "Uttar Pradesh"),
        country=fixture_data.get("country", "India"),
        latitude=float(fixture_data.get("latitude", 28.6692)),
        longitude=float(fixture_data.get("longitude", 77.4538)),
        current_pm2_5=current_pm25,
        current_pm10=current_pm10,
        current_cpcb_aqi=current_aqi,
        current_aqi_band=current_band,
        current_aqi_color=current_color,
        dominant_pollutant="PM2.5",
        one_sentence_verdict_en=verdict_en,
        one_sentence_verdict_hi=verdict_hi,
        one_sentence_verdict_mr=verdict_mr,
        data_as_of=fixture_data.get(
            "data_as_of", datetime.now(timezone.utc).isoformat()
        ),
        data_source=src,
        is_sample_or_fallback=True,
        fallback_banner_text=banner,
        active_grap_stage=grap_info,
        hourly_forecast=hourly_points,
    )


def get_air_quality_sync(
    latitude: float,
    longitude: float,
    city_name: str | None = None,
    force_fallback: bool = False,
) -> AirQualityResponse:
    """
    Synchronous air quality retrieval for offline/fixture evaluations and test execution.
    """
    fixture, nearest_city, distance_km = find_closest_fixture(latitude, longitude)
    return _build_response_from_fixture(
        fixture,
        city_override=city_name,
        nearest_city=nearest_city,
        distance_km=distance_km,
    )


async def get_air_quality(
    latitude: float,
    longitude: float,
    city_name: str | None = None,
    force_fallback: bool = False,
) -> AirQualityResponse:
    """
    Fetches 24-hour air quality forecast for coordinates.
    Employs 15-minute SQLite caching, 0.1° spatial rounding, and labeled offline fixtures.
    """
    r_lat, r_lon = round_coords(latitude, longitude)
    now_ts = int(time.time())

    # Check offline environment variable
    if os.environ.get("SAANS_OFFLINE") == "1":
        force_fallback = True

    # Check cache unless forced fallback
    if not force_fallback:
        cursor = _conn.cursor()
        cursor.execute(
            "SELECT cached_at, payload FROM air_cache WHERE lat_rounded = ? AND lon_rounded = ?",
            (r_lat, r_lon),
        )
        row = cursor.fetchone()
        if row and (now_ts - row[0]) < TTL_SECONDS:
            data = json.loads(row[1])
            return AirQualityResponse(**data)

    # Attempt upstream Open-Meteo call
    if not force_fallback:
        url = "https://air-quality-api.open-meteo.com/v1/air-quality"
        params = {
            "latitude": r_lat,
            "longitude": r_lon,
            "hourly": "pm2_5,pm10,temperature_2m,relative_humidity_2m",
            "forecast_days": 1,
            "timezone": "auto",
        }
        try:
            async with httpx.AsyncClient(timeout=4.5) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    api_data = resp.json()
                    hourly = api_data.get("hourly", {})
                    times = hourly.get("time", [])
                    pm25_vals = hourly.get("pm2_5", [])
                    pm10_vals = hourly.get("pm10", [])

                    points: list[HourlyAirPoint] = []
                    for idx, t in enumerate(times[:24]):
                        if idx >= len(pm25_vals) or pm25_vals[idx] is None:
                            # Never invent arbitrary numbers; forward-fill if available
                            if points:
                                val_25 = points[-1].pm2_5
                            else:
                                continue
                        else:
                            val_25 = float(pm25_vals[idx])

                        val_10 = (
                            float(pm10_vals[idx])
                            if idx < len(pm10_vals) and pm10_vals[idx] is not None
                            else None
                        )
                        aqi_val, band, _ = get_overall_cpcb_aqi(val_25, val_10)
                        grap = get_grap_stage(aqi_val)

                        points.append(
                            HourlyAirPoint(
                                hour=idx,
                                time_iso=t,
                                pm2_5=round(val_25, 1),
                                pm10=round(val_10, 1) if val_10 is not None else None,
                                cpcb_aqi=aqi_val,
                                aqi_band_code=band.code,
                                aqi_band_name=band.name,
                                aqi_color_hex=band.color_hex,
                                health_statement_en=band.health_statement_en,
                                health_statement_hi=band.health_statement_hi,
                                health_statement_mr=band.health_statement_mr,
                                grap_stage=grap.stage_number if grap else None,
                            )
                        )

                    # Select point corresponding to current local hour
                    utc_offset = api_data.get("utc_offset_seconds", 19800)
                    now_utc = datetime.now(timezone.utc)
                    local_hour = (now_utc + timedelta(seconds=utc_offset)).hour
                    cur = next(
                        (p for p in points if p.hour == local_hour),
                        (points[0] if points else None),
                    )
                    cur_aqi = cur.cpcb_aqi if cur else 150
                    cur_band = cur.aqi_band_code if cur else "moderate"
                    cur_color = cur.aqi_color_hex if cur else "#F2C200"

                    grap_stage_cur = get_grap_stage(cur_aqi)
                    grap_info = None
                    if grap_stage_cur:
                        grap_info = GRAPStageInfo(
                            stage_number=grap_stage_cur.stage_number,
                            name=grap_stage_cur.name,
                            aqi_threshold=grap_stage_cur.aqi_threshold_text,
                            mandatory_actions=grap_stage_cur.mandatory_actions_en,
                            citizen_advisory=grap_stage_cur.citizen_advisory_en,
                        )

                    res_obj = AirQualityResponse(
                        city=city_name or f"Loc ({r_lat}, {r_lon})",
                        country="India",
                        latitude=latitude,
                        longitude=longitude,
                        current_pm2_5=cur.pm2_5 if cur else 80.0,
                        current_pm10=cur.pm10 if cur else 120.0,
                        current_cpcb_aqi=cur_aqi,
                        current_aqi_band=cur_band,
                        current_aqi_color=cur_color,
                        dominant_pollutant="PM2.5",
                        one_sentence_verdict_en=f"Current air quality is {cur_band.replace('_', ' ').title()} (AQI {cur_aqi}).",
                        one_sentence_verdict_hi=f"वर्तमान वायु गुणवत्ता {cur_band.replace('_', ' ').title()} (AQI {cur_aqi}) है।",
                        one_sentence_verdict_mr=f"सध्याची हवेची गुणवत्ता {cur_band.replace('_', ' ').title()} (AQI {cur_aqi}) आहे.",
                        data_as_of=datetime.now(timezone.utc).isoformat(),
                        data_source="Open-Meteo Air Quality API",
                        is_sample_or_fallback=False,
                        active_grap_stage=grap_info,
                        hourly_forecast=points,
                    )

                    _conn.execute(
                        "INSERT OR REPLACE INTO air_cache (lat_rounded, lon_rounded, cached_at, payload) VALUES (?, ?, ?, ?)",
                        (r_lat, r_lon, now_ts, res_obj.model_dump_json()),
                    )
                    _conn.commit()
                    return res_obj
        except (httpx.HTTPError, OSError, ValueError, RuntimeError) as e:
            logger.warning(
                f"Failed to fetch live air data from Open-Meteo: {e}. Using offline fixtures."
            )

    # Resilient offline fixture fallback
    fixture, nearest_city, distance_km = find_closest_fixture(latitude, longitude)
    return _build_response_from_fixture(
        fixture,
        city_override=city_name,
        nearest_city=nearest_city,
        distance_km=distance_km,
    )
