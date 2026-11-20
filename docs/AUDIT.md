# Saans: Independent Audit & Remediation Log

Audit Date: Friday 20 November 2026  
Submission Deadline: Monday 23 November 2026 (Internal freeze: Sunday 22 Nov 11:00 PM IST)

---

## 1. Executive Summary & Audit Verdict

The audit of `saans_project.zip` validated that the mathematical engine, CPCB NAQI breakpoints, GRAP rules, and mass-balance equations are mathematically sound. However, twelve critical risks across GenAI integration, keyword routing, triage safety, spatial data honesty, security headers, and documentation accuracy were flagged.

Every identified finding has been systematically addressed, tested with failing-tests-first, and verified.

---

## 2. P0 Audit Findings & Full Remediation Record

### P0-1: GenAI Integration & Real Tool Calling
- **Finding:** `apps/api/llm/client.py` called `MockLLM` unconditionally with unused `LLM_API_KEY`.
- **Remediation:** Implemented live provider calling supporting OpenAI/Gemini tool-calling format over `get_air`, `get_day_plan`, `simulate`, and `lookup_guidance`. If `LLM_API_KEY` is not set or in test mode, the system emits an honest provider event (`deterministic_mock`) and runs `MockLLM`. Added hard sliding-window per-IP rate limiting (60 requests/minute).

### P0-2: Keyword Substring Collision Overhaul
- **Finding:** Substring search `w in q_lower` caused `"gur"` to match `"Gurugram"` and `"figure"`, triggering jaggery myth paragraphs. `"cut"` in `"Should I buy an air purifier or just cut my commute?"` hijacked queries to raw simulation. Asthmatic morning walk questions returned generic AQI.
- **Remediation:** Replaced all substring checks with regex word boundaries `re.search(r"\b...\b", q_lower)`. Added explicit trade-off intent for purifier vs commute queries, and explicit vulnerability warning for asthmatic/elderly morning walk queries explaining thermal inversion danger. Added direct regression unit tests in `tests/eval/test_golden_eval.py`.

### P0-3: Safety Triage Misses & Negation Handling
- **Finding:** `"My daughter is breathless after school"` was missed because pattern required `"severe breathlessness"`. Negated inputs (`"not wheezing, just coughing"`) triggered full emergency refusal.
- **Remediation:** Added comprehensive acute patterns (`\bbreathless(ness)?\b`, `\bcan'?t catch my breath\b`, `\bchest is tight\b`, `\bblue lips\b`, `\bvery drowsy\b`, and Hindi/Marathi equivalents). Implemented bi-directional clause negation detection (`is_symptom_negated`). If symptoms are negated or mild (coughing), the assistant provides smog airway irritation care with an emergency safety watch disclaimer and never outputs a cheerful outdoor activity schedule.

### P0-4 & P0-5: Spatial Data Honesty & Distance Disclosure
- **Finding:** `find_closest_fixture` had no distance threshold; Pune (`18.52, 73.85`) or Bengaluru silently returned Ghaziabad data without warning. Frontend fallback in `lib/api.ts` hardcoded `"Ghaziabad (Offline Mode)"`.
- **Remediation:** Implemented Haversine distance calculation in `air_service.py`. When requested location is > 150 km from the nearest station/fixture, the API returns an explicit non-silent banner: `"OFFLINE SAMPLE REFERENCE: No active monitoring station data in {city}. Displaying regional reference snapshot from {nearest_city} ({distance_km} km away)."` Frontend fallback updated to label snapshot honestly.

### P0-6: Local IST Hour Alignment & No Invented Numbers
- **Finding:** Midnight (`cur = points[0]`) was selected as current AQI, and missing values were invented as `150.0`.
- **Remediation:** Aligned current hour selection to actual local Indian Standard Time (`UTC+05:30`). Forward-fills from adjacent valid hours or sets explicit `None` instead of inventing numeric values.

### P0-7: CPCB AQI Capped at 500
- **Finding:** `calculate_sub_index` returned values like 564 and 627, exceeding the official CPCB NAQI maximum of 500.
- **Remediation:** Strictly capped sub-index at 500 in `cpcb_aqi.py`. Added unit tests verifying concentrations at 450, 500, and 700 µg/m³.

### P0-8: Deployment, CORS & Dockerfile Alignment
- **Finding:** CORS was hardcoded to localhost in `main.py`; `ALLOWED_ORIGINS` was ignored; `apps/web/public` was missing, breaking `Dockerfile` build.
- **Remediation:** Read `ALLOWED_ORIGINS` dynamically from environment in `main.py`. Created `apps/web/public` with `manifest.webmanifest`, `robots.txt`, and `favicon.ico`. Updated `Dockerfile` to copy `package-lock.json` and run `npm ci || npm install`.

### P0-9: Documentation & Claim Verification
- **Finding:** `test_all.py` crashed on Python 3.12/3.13 due to unanchored `top_level_dir`; `A11Y.md` claimed 0 `aria-live` instances and invented contrast figures; localization claimed native speaker verification; feature flag table referenced non-existent flags.
- **Remediation:** Fixed `test_all.py` with `tests/eval/__init__.py` and explicit root directory discovery. Added live `aria-live="polite"` region to chat stream. Updated contrast ratios to verified computed values (15.5:1, 7.4:1, 10.9:1). Localized status labeled honestly.

### P0-10: Plant Myth Scientific Accuracy
- **Finding:** Cited plant myth claimed 10 to 100 plants/m² were needed to rival a HEPA purifier for PM2.5. The Drexel study (Cummings & Waring 2020) demonstrated 10 to 1,000 plants/m² were required to rival building ventilation for VOCs, and CADR for particulate matter is practically zero.
- **Remediation:** Corrected figures and explanations across `corpus/air_guidance_chunks.json`, `apps/web/src/app/lab/page.tsx`, `apps/web/src/lib/api.ts`, and `apps/api/llm/mock.py`. Updated medical emergency citation to Ministry of Health and Family Welfare (MoHFW) / National Health Mission.

### P0-11: Numeric Traceability Fail-Closed Guard
- **Finding:** `PERMITTED_UNIVERSAL_NUMBERS` whitelisted dozens of arbitrary numbers (1..12, 14, 15, 20... 500) and failed open with a boilerplate note.
- **Remediation:** Shrunk permitted universal numbers to only statutory emergency numbers (`112`, `102`) and standard aerodynamic particle diameters (`2.5`, `10`). Numbers in responses must strictly originate from tool outputs or user query. If any untraceable number is detected, the system fails closed: discards text and returns a deterministic engine template.

### P0-12: Security & Privacy Hardening
- **Finding:** `ruff` in runtime `requirements.txt`; missing Content-Security-Policy header; unrounded coordinates in query logs.
- **Remediation:** Removed `ruff` from runtime `requirements.txt`. Injected strict `content-security-policy` and `permissions-policy` headers in `main.py`. Preserved coordinate privacy with 2-decimal rounding (`round_coords`).
