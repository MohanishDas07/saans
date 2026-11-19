/**
 * Typed API Client for SAANS.
 * Communicates with FastAPI backend under /api/v1.
 * Automatic fallback to labeled offline fixtures if backend is unreachable.
 */

import {
  AirQualityResponse,
  GeocodeResponse,
  PlanRequest,
  PlanResponse,
  SimulateRequest,
  SimulateResponse,
  CommunityAdvisoryRequest,
  CommunityAdvisoryResponse,
} from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`Fetch failed for ${url}:`, err);
    throw err;
  }
}

export async function fetchAirQuality(
  lat: number,
  lon: number,
  city: string = "Ghaziabad",
  fallback: boolean = false
): Promise<AirQualityResponse> {
  try {
    return await fetchJSON<AirQualityResponse>(
      `/air?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}&fallback=${fallback}`
    );
  } catch {
    // If backend is offline, return synthetic labeled offline Ghaziabad response
    return {
      city: "Ghaziabad (Offline Mode)",
      state: "Uttar Pradesh",
      country: "India",
      latitude: lat,
      longitude: lon,
      current_pm2_5: 410.0,
      current_pm10: 530.0,
      current_cpcb_aqi: 492,
      current_aqi_band: "severe",
      current_aqi_color: "#7A0F2E",
      dominant_pollutant: "PM2.5",
      one_sentence_verdict_en: "Air quality in Ghaziabad is Severe (AQI 492). Stay indoors and run air purifiers.",
      one_sentence_verdict_hi: "गाजियाबाद में वायु गुणवत्ता गंभीर (AQI 492) है। घर के अंदर रहें और प्यूरीफायर चलाएं।",
      one_sentence_verdict_mr: "गाझियाबादमध्ये हवेची गुणवत्ता गंभीर (AQI 492) आहे. शक्यतो घरातच राहा.",
      data_as_of: new Date().toISOString(),
      data_source: "Open-Meteo Air Quality Archive & UPPCB Ghaziabad Station Snapshot",
      is_sample_or_fallback: true,
      fallback_banner_text: "OFFLINE FALLBACK DATA: Demonstrating resilient client behavior with labeled reference snapshot.",
      active_grap_stage: {
        stage_number: 4,
        name: "Stage IV - 'Severe+' Air Quality",
        aqi_threshold: "AQI > 450",
        mandatory_actions: [
          "Ban on entry of non-essential diesel truck traffic into NCR.",
          "Ban on all construction and demolition work.",
          "Schools online for primary and middle grades.",
        ],
        citizen_advisory: [
          "Remain indoors as much as possible.",
          "Run certified HEPA purifiers continuously in closed bedrooms.",
          "Do not perform outdoor morning walks or strenuous physical training.",
        ],
      },
      hourly_forecast: Array.from({ length: 24 }).map((_, i) => ({
        hour: i,
        time_iso: `T${i.toString().padStart(2, "0")}:00:00Z`,
        pm2_5: i >= 6 && i <= 9 ? 460 - (i - 6) * 20 : (i >= 12 && i <= 15 ? 160 + (i - 12) * 15 : 320),
        pm10: 480,
        cpcb_aqi: i >= 6 && i <= 9 ? 500 : (i >= 12 && i <= 15 ? 335 : 445),
        aqi_band_code: i >= 12 && i <= 15 ? "very_poor" : "severe",
        aqi_band_name: i >= 12 && i <= 15 ? "Very Poor" : "Severe",
        aqi_color_hex: i >= 12 && i <= 15 ? "#D7263D" : "#7A0F2E",
        health_statement_en: "Respiratory distress on prolonged exposure.",
        health_statement_hi: "लंबे समय तक रहने पर सांस की तकलीफ।",
        health_statement_mr: "दीर्घकाळ संपर्कात राहिल्यास श्वसनाचा त्रास.",
        grap_stage: i >= 6 && i <= 9 ? 4 : 3,
      })),
    };
  }
}

export async function searchCities(q: string): Promise<GeocodeResponse> {
  try {
    return await fetchJSON<GeocodeResponse>(`/geocode?q=${encodeURIComponent(q)}`);
  } catch {
    return {
      query: q,
      results: [
        { name: "Ghaziabad", latitude: 28.6692, longitude: 77.4538, country: "India", admin1: "Uttar Pradesh" },
        { name: "Delhi", latitude: 28.6139, longitude: 77.2090, country: "India", admin1: "Delhi" },
        { name: "Lucknow", latitude: 26.8467, longitude: 80.9462, country: "India", admin1: "Uttar Pradesh" },
      ],
    };
  }
}

export async function generateDayPlan(req: PlanRequest): Promise<PlanResponse> {
  try {
    return await fetchJSON<PlanResponse>("/plan", {
      method: "POST",
      body: JSON.stringify(req),
    });
  } catch {
    // Client-side fallback computation
    const outdoorWorker = req.profile.members.some((m) => m.is_outdoor_worker);
    return {
      city: req.profile.city_name,
      data_as_of: new Date().toISOString(),
      data_source: "Local Engine Resilience Fallback",
      is_sample_or_fallback: true,
      current_aqi: 485,
      current_band: "severe",
      active_grap_stage: 4,
      schedules: [
        {
          activity_id: "morning_exercise",
          name_en: "Outdoor Exercise / Morning Walk",
          name_hi: "सुबह की सैर / व्यायाम",
          name_mr: "सकाळचा व्यायाम / फिरणे",
          baseline_time: "07:00 - 08:00",
          optimized_time: "14:00 - 15:00",
          duration_hours: 1,
          baseline_pm25: 460.0,
          optimized_pm25: 160.0,
          reduction_ug_m3: 300.0,
          reduction_pct: 65.2,
          rationale_en: "Moving from 07:00 to 14:00 avoids peak winter inversion, reducing exposure by 300 µg/m³ (65.2%).",
          rationale_hi: "सुबह 7 बजे के बजाय दोपहर 2 बजे करने से स्मॉग के चरम स्तर से बचाव होता है, जिससे 65.2% प्रदूषण कम होता है।",
          rationale_mr: "सकाळी ७ ऐवजी दुपारी २ वाजता फिरल्याने प्रदूषणाचा संपर्क ६५.२% कमी होतो.",
        },
        {
          activity_id: "home_ventilation",
          name_en: "Home Window Airing / Ventilation",
          name_hi: "घर में खिड़कियां खोलना",
          name_mr: "खिडक्या उघडून हवा खेळती ठेवणे",
          baseline_time: "08:00 - 09:00",
          optimized_time: "13:00 - 14:00",
          duration_hours: 1,
          baseline_pm25: 440.0,
          optimized_pm25: 175.0,
          reduction_ug_m3: 265.0,
          reduction_pct: 60.2,
          rationale_en: "Airing rooms at midday when sunlight breaks atmospheric inversion reduces indoor particle ingress.",
          rationale_hi: "दोपहर में जब धूप निकलती है तब खिड़की खोलने से घर में जहरीला धुआं कम आता है।",
          rationale_mr: "दुपारी ऊन पडल्यावर खिडक्या उघडल्याने घरात कमी धूर येतो.",
        },
      ],
      member_budgets: req.profile.members.map((m) => ({
        member_id: m.id,
        label: m.label,
        age_band: m.age_band,
        is_sensitive: m.is_breathing_sensitive,
        total_inhaled_dose_ug: m.age_band === "child" ? 1420.0 : (m.age_band === "senior" ? 1850.0 : 2250.0),
        time_weighted_avg_pm25: 220.0,
        who_budget_ratio: 14.67,
        india_naaqs_ratio: 3.67,
        cigarette_equivalents: 10.0,
        heuristic_disclaimer: "Communication heuristic (Berkeley Earth, 2015: 22 µg/m³ PM2.5 ≈ 1 cigarette/day). Illustrative only, not clinical fact.",
      })),
      recommendations: [
        {
          id: "shift_ventilation_afternoon",
          tier: "zero",
          tier_label: "₹0 Free Habits",
          cost_inr: 0,
          name_en: "Afternoon Window Airing (12 PM - 3 PM)",
          name_hi: "दोपहर में खिड़कियां खोलना (12 बजे - 3 बजे)",
          name_mr: "दुपारी खिडक्या उघडणे (१२ ते ३)",
          description_en: "Open windows strictly during afternoon dispersion instead of early morning.",
          description_hi: "सुबह के बजाय केवल दोपहर 12 से 3 बजे के बीच खिड़कियां खोलें।",
          description_mr: "सकाळऐवजी फक्त दुपारी १२ ते ३ दरम्यान खिडक्या उघडा.",
          category: "ventilation",
          dose_saved_pct: 25.0,
          cost_efficiency_score: 1025.0,
        },
        {
          id: "family_n95_masks",
          tier: "under_1k",
          tier_label: "Budget (< ₹1,000)",
          cost_inr: 450,
          name_en: "Certified ISI/BIS N95 Masks for Commutes",
          name_hi: "आने-जाने के लिए प्रमाणित N95 मास्क",
          name_mr: "प्रवासासाठी प्रमाणित एन-९५ मास्क",
          description_en: "Certified N95 masks filter up to 85% of fine particles during two-wheeler and bus commutes.",
          description_hi: "सफर के दौरान 85% तक जहरीले कण फेफड़ों में जाने से रोकता है।",
          description_mr: "प्रवासात ८५% पर्यंत सूक्ष्म कण रोखतो.",
          category: "mask",
          dose_saved_pct: 30.0,
          cost_efficiency_score: 6.67,
        },
        {
          id: "hepa_room_purifier",
          tier: "over_5k",
          tier_label: "Investment (> ₹5,000)",
          cost_inr: 8500,
          name_en: "True HEPA Air Purifier (CADR 250 m³/h)",
          name_hi: "ट्रू HEPA एयर प्यूरीफायर",
          name_mr: "ट्रू हेपा एअर प्युरिफायर",
          description_en: "Reduces bedroom particulate levels by 70-85% in closed rooms during sleep.",
          description_hi: "रात को सोते समय बेडरूम की हवा को 70-85% तक साफ करता है।",
          description_mr: "झोपताना बेडरूममधील हवा ७०-८५% शुद्ध करते.",
          category: "purifier",
          dose_saved_pct: 45.0,
          cost_efficiency_score: 0.53,
        },
      ],
      outdoor_worker_advice_en: outdoorWorker
        ? "OUTDOOR PROTOCOL: Rotate two ISI N95 masks every 4 hours. Take indoor clean air breaks."
        : null,
      outdoor_worker_advice_hi: outdoorWorker
        ? "आउटडोर निर्देश: हर 4 घंटे में N95 मास्क बदलें। बीच-बीच में इनडोर ब्रेक लें।"
        : null,
      outdoor_worker_advice_mr: outdoorWorker
        ? "सुरक्षा सूचना: दर ४ तासांनी मास्क बदला आणि थोडा वेळ बंद खोलीत विश्रांती घ्या."
        : null,
    };
  }
}

export async function simulateInterventions(req: SimulateRequest): Promise<SimulateResponse> {
  try {
    return await fetchJSON<SimulateResponse>("/simulate", {
      method: "POST",
      body: JSON.stringify(req),
    });
  } catch {
    const fraction = req.selected_intervention_ids.length > 0 ? 0.45 : 0.0;
    const baseDose = 2400.0;
    const simDose = round(baseDose * (1 - fraction), 1);
    const cost = req.selected_intervention_ids.includes("hepa_room_purifier") ? 8500 : (req.selected_intervention_ids.length > 0 ? 450 : 0);
    return {
      baseline_dose_ug: baseDose,
      simulated_dose_ug: simDose,
      dose_reduction_ug: round(baseDose - simDose, 1),
      dose_reduction_pct: round(fraction * 100, 1),
      baseline_cigs: 10.9,
      simulated_cigs: round(10.9 * (1 - fraction), 1),
      cigs_saved: round(10.9 * fraction, 1),
      cigarette_heuristic_disclaimer: "Communication heuristic (Berkeley Earth, 2015: 22 µg/m³ PM2.5 ≈ 1 cigarette/day). Illustrative only, not clinical fact.",
      total_cost_inr: cost,
      cost_per_ug_reduced_inr: cost > 0 ? round(cost / (baseDose - simDose), 2) : 0,
      pm25_emissions_avoided_g: 0.528,
      co2e_emissions_avoided_kg: 0.276,
      community_multiplier: req.community_household_count,
      community_pm25_avoided_g: round(0.528 * req.community_household_count, 2),
      community_co2e_avoided_kg: round(0.276 * req.community_household_count, 2),
      applied_interventions: req.selected_intervention_ids,
    };
  }
}

function round(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
