# Architecture Decisions Record (ADR)

## ADR-0001: Pure Python Exposure Engine with Isolated Deterministic Math
- **Status:** Accepted (2026-11-17)
- **Context:** The prompt mandates: "THE LLM NEVER DOES THE MATH." Air quality metrics, inhaled dose, indoor mass balance, Breath Budget, cigarette-equivalents, and scheduling optimizations must be reproducible, auditable, and unit-tested without LLM hallucination or floating-point unpredictability.
- **Decision:** Build `apps/api/engine` as a pure Python module with zero external framework dependencies (no FastAPI, no database, no LLM imports). All inputs and outputs use standard dataclasses/Pydantic schemas. The LLM interacts strictly through typed tool calling, and every numeric claim in narration is traceable to an engine result.
- **Consequences:** The engine can be tested with standard unit tests, property tests (Hypothesis), and mutation testing (mutmut) in milliseconds.

## ADR-0002: Client-Side Household Profile and Zero Server Persistence
- **Status:** Accepted (2026-11-17)
- **Context:** User trust and privacy are paramount when dealing with health-sensitive family data (e.g., breathing sensitivity, family ages).
- **Decision:** No user accounts or authentication. The household profile is stored strictly in the user's browser `localStorage` and sent transiently per request in the payload of POST endpoints. The backend never persists or logs health-sensitive attributes. SQLite is reserved solely for response caching (Open-Meteo 15-min TTL) and the pre-computed document retrieval index.
- **Consequences:** Eliminates attack surfaces for health data exfiltration, simplifies compliance, and guarantees privacy by design.

## ADR-0003: Monorepo Architecture with OpenAPI-Driven Type Generation
- **Status:** Accepted (2026-11-17)
- **Context:** The stack is locked as Next.js (TypeScript strict) + Tailwind in `apps/web` and FastAPI (Python 3.12/3.13, Pydantic v2) in `apps/api`. Drift between API schemas and frontend types must be prevented.
- **Decision:** Generate TypeScript type definitions directly from the FastAPI OpenAPI schema at build/check time. Both apps run from a root `Makefile` and `docker-compose.yml`.

## ADR-0004: Tiered Caching, Rate Limiting, and Offline Fixture Fallback
- **Status:** Accepted (2026-11-17)
- **Context:** Upstream air quality APIs (Open-Meteo) have rate limits and can fail. Demos and evaluations must work deterministically even offline.
- **Decision:** Geocoordinates are rounded to ~0.1° (~11 km) with a 15-minute TTL cache in SQLite. Labeled offline fixtures for Delhi, Ghaziabad, and Lucknow are bundled. When fallback fixtures are served, a strict header and UI banner ("Data as of <time>, source <name> - Sample / Offline Fallback") is surfaced. Fixture data is never misrepresented as live.

## ADR-0005: MapLibre Station-Based IDW Interpolation with Confidence Scoring
- **Status:** Accepted (2026-11-17)
- **Context:** Open-Meteo global grid cells (~10-25 km) are too coarse for intra-city ward variations.
- **Decision:** Ward-level map uses real monitoring stations with Inverse Distance Weighting (IDW) interpolation implemented inside the engine. Every estimated point displays distance to nearest station as a confidence metric, clearly distinguishing measured vs. estimated points, backed by an accessible tabular view.

## ADR-0006: Feature Flags for Addendum Scope Gating
- **Status:** Accepted (2026-11-17)
- **Context:** Addendum v2 requires all features (ward map, route comparison, weekly report, Marathi, voice) to meet section 8 quality bars before being visible, and never half-shown.
- **Decision:** Central feature flag configuration in both backend and frontend (`NEXT_PUBLIC_FF_*`). Any feature not meeting the acceptance criteria remains flagged off by default.
