"""
Tool Definitions and Execution for SAANS AI Assistant.
Tools exposed:
- get_air(city, lat, lon)
- get_day_plan(profile)
- simulate(selected_intervention_ids, community_count)
- lookup_guidance(query, top_k)
All outputs are structured, Pydantic validated, and deterministic.
"""

from typing import Any

from engine import (
    FlexibleActivity,
    optimize_activity_schedule,
    run_simulation,
)
from retrieval import lookup_guidance as retrieve_guidance
from schemas.contracts import HouseholdProfile
from services.air_service import get_air_quality_sync


def tool_get_air(
    city: str = "Ghaziabad",
    lat: float = 28.6692,
    lon: float = 77.4538,
    force_fallback: bool = False,
) -> dict[str, Any]:
    """Retrieves current CPCB AQI, PM2.5 concentration, and active CAQM GRAP stage."""
    res = get_air_quality_sync(
        latitude=lat, longitude=lon, city_name=city, force_fallback=force_fallback
    )
    return {
        "city": res.city,
        "current_cpcb_aqi": res.current_cpcb_aqi,
        "current_pm2_5": res.current_pm2_5,
        "aqi_band": res.current_aqi_band,
        "active_grap_stage": (
            res.active_grap_stage.stage_number if res.active_grap_stage else None
        ),
        "one_sentence_verdict_en": res.one_sentence_verdict_en,
        "one_sentence_verdict_hi": res.one_sentence_verdict_hi,
        "one_sentence_verdict_mr": res.one_sentence_verdict_mr,
        "is_sample_or_fallback": res.is_sample_or_fallback,
        "data_source": res.data_source,
    }


def tool_get_day_plan(
    profile_data: dict[str, Any] | None = None,
    force_fallback: bool = False,
) -> dict[str, Any]:
    """Computes personalized schedule optimization and member Breath Budgets."""
    prof = HouseholdProfile(**profile_data) if profile_data else HouseholdProfile()
    air = get_air_quality_sync(
        prof.latitude, prof.longitude, prof.city_name, force_fallback=force_fallback
    )

    hourly_pm25 = [p.pm2_5 for p in air.hourly_forecast]
    # Scheduler test activity: morning walk
    walk_task = FlexibleActivity(
        id="morning_walk",
        name_en="Morning Walk",
        name_hi="सुबह की सैर",
        name_mr="सकाळचा व्यायाम",
        duration_hours=1,
        feasible_start_hour=6,
        feasible_end_hour=17,
        default_hour=7,
        activity_level="moderate",
        is_outdoor=True,
    )
    scheduled_walk = optimize_activity_schedule(walk_task, hourly_pm25)

    return {
        "city": prof.city_name,
        "current_aqi": air.current_cpcb_aqi,
        "active_grap_stage": air.active_grap_stage.stage_number
        if air.active_grap_stage
        else None,
        "scheduled_shift": {
            "activity": "Morning Walk",
            "baseline_time": f"{scheduled_walk.baseline_hour:02d}:00",
            "optimized_time": f"{scheduled_walk.optimized_hour:02d}:00",
            "baseline_pm25": scheduled_walk.baseline_avg_pm25,
            "optimized_pm25": scheduled_walk.optimized_avg_pm25,
            "reduction_pct": scheduled_walk.percentage_reduction,
        },
        "recommendation_free": "Open windows strictly during midday (12 PM - 3 PM) to avoid morning inversion.",
        "recommendation_budget": "Wear certified ISI/BIS N95 masks for outdoor commutes (-85% inhaled particulate).",
    }


def tool_simulate(
    selected_intervention_ids: list[str] | None = None, community_count: int = 1
) -> dict[str, Any]:
    """Simulates exposure and emissions deltas for chosen interventions."""
    ids = selected_intervention_ids or [
        "shift_ventilation_afternoon",
        "family_n95_masks",
    ]
    sim = run_simulation(
        baseline_dose=2400.0, baseline_cigs=10.9, selected_intervention_ids=ids
    )
    return {
        "dose_reduction_pct": sim.dose_reduction_pct,
        "dose_reduction_ug": sim.dose_reduction_ug,
        "cigs_saved": sim.cigs_saved,
        "total_cost_inr": sim.total_cost_inr,
        "pm25_emissions_avoided_g": sim.pm25_emissions_avoided_g,
        "community_pm25_avoided_g": round(
            sim.pm25_emissions_avoided_g * community_count, 2
        ),
        "community_multiplier": community_count,
    }


def tool_lookup_guidance(query: str, top_k: int = 3) -> dict[str, Any]:
    """Looks up authoritative guidance and myth corrections from the 30-chunk corpus."""
    chunks = retrieve_guidance(query, top_k=top_k)
    return {
        "query": query,
        "results": chunks,
    }


AVAILABLE_TOOLS = {
    "get_air": tool_get_air,
    "get_day_plan": tool_get_day_plan,
    "simulate": tool_simulate,
    "lookup_guidance": tool_lookup_guidance,
}


def execute_tool(tool_name: str, args: dict[str, Any]) -> dict[str, Any]:
    """Safely dispatches and executes a tool with parameter validation."""
    if tool_name not in AVAILABLE_TOOLS:
        raise ValueError(f"Unknown tool: {tool_name}")
    fn = AVAILABLE_TOOLS[tool_name]
    return fn(**args)
