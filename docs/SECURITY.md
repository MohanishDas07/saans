# SAANS Security Specification & Threat Model

## 1. Threat Model & Boundaries

| Component | Asset / Surface | Threat Scenario | Mitigation in Code |
| :--- | :--- | :--- | :--- |
| **Household Profile** | User health flags, ages, home structure | Exfiltration, unauthorized surveillance, health data breach | **Zero Server Persistence:** Profile lives strictly in browser `localStorage`. Transmitted transiently per request; never written to SQLite, persistent disks, or logs. |
| **Exposure Engine** | Mathematical computation & dose numbers | Hallucination, floating-point drift, invalid health claims | **Isolated Deterministic Math:** Pure-Python package with zero framework imports. Invariants enforced by property tests. The LLM never computes numbers. |
| **Chat & AI Layer** | LLM prompt context & tool calling | Prompt injection, jailbreak attempts, dangerous medical advice | **Safety Guards:** Static regex intercept for acute symptoms (chest pain, wheeze, breathlessness) returning fixed static emergency instructions. Output parser enforces numeric traceability against tool results. |
| **Upstream Network** | Open-Meteo & external geocoding | SSRF, outbound abuse, API quota exhaustion | **Allowlist Enforcement:** Outbound requests restricted to `*.open-meteo.com`. Automatic offline fixture fallback for Delhi, Ghaziabad, and Lucknow. |
| **Community Advisory**| Publicly printable advisory card | XSS injection, defacement of public notices | **Input Sanitization:** Strict Pydantic length bounds (`max_length=120`), no HTML parsing (`dangerouslySetInnerHTML` forbidden). |

---

## 2. Security Headers & Content Security Policy (CSP)

Implemented in `apps/api/main.py` and `apps/web/next.config.mjs`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(self), microphone=(self)`

---

## 3. Container & Runtime Security

- Docker containers run as unprivileged non-root users (`saans` and `nextjs`).
- Secrets and API keys are stored server-side and never exposed to client bundles.
- Request payload limits enforced by FastAPI / Starlette.
