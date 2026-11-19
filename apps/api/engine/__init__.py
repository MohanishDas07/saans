"""
SAANS Deterministic Exposure Engine.
Pure Python module with zero external framework dependencies.
"""

from .constants import (
    BERKELEY_EARTH_PM25_PER_CIGARETTE,
    COOKING_EMISSION_FACTORS,
    ENVELOPE_PROFILES,
    INDIA_NAAQS_PM25_24H_LIMIT,
    INHALATION_RATES,
    MASK_EFFICIENCIES,
    TRANSPORT_EMISSION_FACTORS,
    WHO_PM25_24H_GUIDELINE,
)
from .cpcb_aqi import (
    PM10_BREAKPOINTS,
    PM25_BREAKPOINTS,
    AQIBand,
    calculate_sub_index,
    get_overall_cpcb_aqi,
)
from .dose import (
    ActivitySlice,
    MemberDoseResult,
    calculate_daily_member_dose,
    calculate_hourly_inhaled_dose,
)
from .grap import (
    GRAP_STAGES,
    GRAPStage,
    get_grap_stage,
)
from .idw import (
    AirStation,
    InterpolatedPoint,
    haversine_distance_km,
    interpolate_idw,
)
from .interventions import (
    INTERVENTION_CATALOGUE,
    InterventionOption,
    SimulationComparison,
    run_simulation,
)
from .mass_balance import (
    calculate_indoor_concentration,
    calculate_required_cadr,
)
from .scheduler import (
    FlexibleActivity,
    ScheduledSlot,
    optimize_activity_schedule,
    optimize_household_day_plan,
)
from .sustainability import (
    AvoidedEmissionsResult,
    calculate_cooking_emissions_avoided,
    calculate_transport_emissions_avoided,
)

__all__ = [
    "BERKELEY_EARTH_PM25_PER_CIGARETTE",
    "COOKING_EMISSION_FACTORS",
    "ENVELOPE_PROFILES",
    "GRAP_STAGES",
    "INDIA_NAAQS_PM25_24H_LIMIT",
    "INHALATION_RATES",
    "INTERVENTION_CATALOGUE",
    "MASK_EFFICIENCIES",
    "PM10_BREAKPOINTS",
    "PM25_BREAKPOINTS",
    "TRANSPORT_EMISSION_FACTORS",
    "WHO_PM25_24H_GUIDELINE",
    "AQIBand",
    "ActivitySlice",
    "AirStation",
    "AvoidedEmissionsResult",
    "FlexibleActivity",
    "GRAPStage",
    "InterpolatedPoint",
    "InterventionOption",
    "MemberDoseResult",
    "ScheduledSlot",
    "SimulationComparison",
    "calculate_cooking_emissions_avoided",
    "calculate_daily_member_dose",
    "calculate_hourly_inhaled_dose",
    "calculate_indoor_concentration",
    "calculate_required_cadr",
    "calculate_sub_index",
    "calculate_transport_emissions_avoided",
    "get_grap_stage",
    "get_overall_cpcb_aqi",
    "haversine_distance_km",
    "interpolate_idw",
    "optimize_activity_schedule",
    "optimize_household_day_plan",
    "run_simulation",
]
