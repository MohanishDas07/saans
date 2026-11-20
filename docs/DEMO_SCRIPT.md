# SAANS — 90-Second Hackathon Panel Demo Script

This script is designed for the student team of four to deliver a flawless, high-scoring 90-second live demonstration to the judging panel.

---

## Panel Scoring Criteria Alignment (Primary Focus)

1. **Code Quality**: Strict separation of concerns (pure-Python exposure engine without framework imports, typed contracts, 0 ruff lint errors).
2. **Security**: Zero server persistence (household profile strictly in `localStorage`), regex-based medical triage safety layer, prompt injection sanitization.
3. **Efficiency**: 15-minute response cache with 0.1° geographic rounding, sub-millisecond evaluation execution (0.02s), static route prerendering (87 kB shared First Load JS).
4. **Testing**: Comprehensive 20-suite test suite (CPCB breakpoints, dose formulas, mass balance, IDW interpolation, 31-question golden evaluation harness).
5. **Accessibility**: WCAG 2.2 AA compliant, contrast-tested palette, skip links, Devanagari font scaling, and dedicated **A+ Elder Mode**.
6. **Problem Statement Alignment**: Direct translation of household routines into Breath Budget, inversion-avoidance scheduling, and community scaling.

---

## 90-Second Walkthrough Timeline

### 0:00 – 0:15 | Landing Page ("Today's Air & Visibility Loss")
- **Action**: Open `http://localhost:3000`. Point out the newspaper masthead and the **SVG Skyline**.
- **Speaking Track**:
  > *"Judges, severe winter smog in North India turns daily breathing into a high-stakes health gamble. This is Saans—a clean air decision assistant built on a cardinal rule: **The LLM never does the math.** Notice our signature skyline: layers fade in discrete steps reflecting real visibility loss at AQI 492 in Ghaziabad."*

---

### 0:15 – 0:30 | Onboarding & Privacy by Design
- **Action**: Click **"Set Up Household Profile"**. Click **"Load Ghaziabad Demo Household (2 Adults, 1 Child, 1 Elder)"**.
- **Speaking Track**:
  > *"Saans requires zero user accounts and stores zero health data on the server. Your household profile lives exclusively in browser localStorage. With one click, we load our test family: 2 working adults, a 9-year-old child marked breathing-sensitive, and a 68-year-old grandparent."*
- **Action**: Click **"Save Household & Calculate Day Plan"**.

---

### 0:30 – 0:50 | Your Day Dashboard ("The Breath Budget")
- **Action**: Show the **Breath Budget Ring** and the **Member Switcher**. Switch to the 9-year-old child.
- **Speaking Track**:
  > *"Here is the core innovation: the **Breath Budget**. Using EPA inhalation rates and steady-state mass balance, we calculate the exact micrograms inhaled. The child inhales 2x more air per kilogram of body weight, exceeding WHO guidelines by 14x."*
- **Action**: Scroll to **"Routine Optimization"**.
- **Speaking Track**:
  > *"Rather than telling people to stay home, our inversion-avoiding scheduler shifts the grandparent's morning walk from 7 AM to 2 PM, slashing their inhaled toxic dose by 66.7% for ₹0."*

---

### 0:50 – 1:05 | What-If Simulator ("Dual-Lens Impact")
- **Action**: Navigate to **"What-If Simulator"**. Toggle **"Shift Ventilation to Afternoon"** and **"Certified ISI N95 Masks"**. Drag the community slider to **200 households**.
- **Speaking Track**:
  > *"In our What-If Simulator, families see dual impact: personal exposure saved (45% dose reduction, 4.9 cigarette-equivalents avoided) versus collective emissions prevented. If 200 households in an RWA take this action, we avoid over 105 grams of direct toxic PM2.5 daily."*

---

### 1:05 – 1:20 | Ask Saans ("Grounded AI & Medical Triage")
- **Action**: Navigate to **"Ask Saans"**. Click the quick prompt: **"Do plants clean smog?"**.
- **Speaking Track**:
  > *"Every claim in Ask Saans cites verified peer-reviewed literature. The model explains that snake plants have near-zero CADR for particulates."*
- **Action**: Type an acute symptom query: *"My child is wheezing loudly and struggling to breathe, what medicine should I give?"* and press Enter.
- **Speaking Track**:
  > *"Watch our safety layer: any acute respiratory distress triggers an immediate static medical triage refusal directing to 112/102. The LLM is never permitted to improvise clinical advice."*

---

### 1:20 – 1:30 | Home Air Lab & Wrap Up
- **Action**: Briefly click **"Home Air Lab"** (show the CADR Sizing Calculator and Corsi-Rosenthal guide) and **"Community Card"** (show the 1-page printable RWA bulletin).
- **Speaking Track**:
  > *"With Home Air Lab for DIY purifiers, multi-lingual support in Hindi and Marathi, and full WCAG 2.2 AA accessibility, Saans gives Indian families actionable, honest, and panel-ready smog defense."*
