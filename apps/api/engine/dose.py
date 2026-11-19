"""
Inhaled Dose and Breath Budget Exposure Calculator.
Strictly deterministic calculation of personal micrograms inhaled,
guideline ratios (WHO and India NAAQS), and Berkeley Earth cigarette-equivalents.
"""

from dataclasses import dataclass

from .constants import (
    BERKELEY_EARTH_PM25_PER_CIGARETTE,
    INDIA_NAAQS_PM25_24H_LIMIT,
    INHALATION_RATES,
    MASK_EFFICIENCIES,
    WHO_PM25_24H_GUIDELINE,
)


@dataclass
class ActivitySlice:
    name: str
    duration_hours: float
    pm25_concentration: float  # Ambient or indoor air concentration (ug/m^3)
    activity_level: str  # "sleep", "sedentary", "light", "moderate"
    mask_type: str = "none"  # "none", "cloth", "surgical", "n95_loose", "n95"
    is_indoor: bool = True


@dataclass
class MemberDoseResult:
    member_id: str
    age_band: str
    is_sensitive: bool
    total_inhaled_dose_ug: float
    time_weighted_avg_pm25: float
    who_budget_ratio: float
    india_naaqs_ratio: float
    cigarette_equivalents: float
    slices_dose: list[float]


def calculate_hourly_inhaled_dose(
    pm25_ambient: float,
    age_band: str,
    activity_level: str,
    duration_hours: float = 1.0,
    mask_type: str = "none",
) -> float:
    """
    Computes micrograms (ug) of PM2.5 inhaled during an activity window:
        Dose = C_inhaled * Inhalation_Rate * Duration
        where C_inhaled = C_ambient * (1 - eta_mask)
    """
    age_rates = INHALATION_RATES.get(age_band, INHALATION_RATES["adult"])
    rate_m3_h = getattr(age_rates, activity_level, age_rates.sedentary)
    mask_eff = MASK_EFFICIENCIES.get(mask_type, 0.0)

    effective_c = pm25_ambient * (1.0 - mask_eff)
    dose_ug = effective_c * rate_m3_h * max(0.0, duration_hours)
    return round(max(0.0, dose_ug), 2)


def calculate_daily_member_dose(
    member_id: str, age_band: str, is_sensitive: bool, slices: list[ActivitySlice]
) -> MemberDoseResult:
    """
    Computes full-day (typically 24h) cumulative dose, time-weighted average PM2.5,
    WHO Breath Budget ratio, India NAAQS ratio, and Berkeley Earth cigarette-equivalents.
    """
    total_hours = sum(s.duration_hours for s in slices)
    if total_hours <= 0:
        total_hours = 24.0

    total_dose = 0.0
    weighted_c_sum = 0.0
    slice_doses: list[float] = []

    for s in slices:
        d = calculate_hourly_inhaled_dose(
            pm25_ambient=s.pm25_concentration,
            age_band=age_band,
            activity_level=s.activity_level,
            duration_hours=s.duration_hours,
            mask_type=s.mask_type,
        )
        slice_doses.append(d)
        total_dose += d

        mask_eff = MASK_EFFICIENCIES.get(s.mask_type, 0.0)
        c_effective = s.pm25_concentration * (1.0 - mask_eff)
        weighted_c_sum += c_effective * s.duration_hours

    twa_pm25 = weighted_c_sum / total_hours

    who_ratio = round(twa_pm25 / WHO_PM25_24H_GUIDELINE, 2)
    india_ratio = round(twa_pm25 / INDIA_NAAQS_PM25_24H_LIMIT, 2)
    cigs = round(twa_pm25 / BERKELEY_EARTH_PM25_PER_CIGARETTE, 2)

    return MemberDoseResult(
        member_id=member_id,
        age_band=age_band,
        is_sensitive=is_sensitive,
        total_inhaled_dose_ug=round(total_dose, 1),
        time_weighted_avg_pm25=round(twa_pm25, 1),
        who_budget_ratio=who_ratio,
        india_naaqs_ratio=india_ratio,
        cigarette_equivalents=cigs,
        slices_dose=slice_doses,
    )
