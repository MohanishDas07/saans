"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { generateDayPlan } from "@/lib/api";
import { getStoredProfile } from "@/lib/storage";
import { PlanResponse, HouseholdProfile } from "@/types/api";

export default function YourDayPage() {
  const [profile, setProfile] = useState<HouseholdProfile | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMemberIdx, setSelectedMemberIdx] = useState<number>(0);
  const [activeTierFilter, setActiveTierFilter] = useState<string>("all");
  const [outdoorModeOverride, setOutdoorModeOverride] = useState<boolean>(false);

  useEffect(() => {
    const p = getStoredProfile();
    setProfile(p);
    loadPlan(p);
  }, []);

  const loadPlan = async (userProfile: HouseholdProfile) => {
    setLoading(true);
    try {
      const res = await generateDayPlan({ profile: userProfile });
      setPlan(res);
    } catch (err) {
      console.error("Failed to load plan", err);
    } finally {
      setLoading(false);
    }
  };

  const currentMember = plan?.member_budgets[selectedMemberIdx] || plan?.member_budgets[0];

  const filteredRecs = plan?.recommendations.filter((rec) => {
    if (activeTierFilter === "all") return true;
    return rec.tier === activeTierFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & City Status */}
      <div className="border-b hairline border-rule pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-ink-muted">
            <span>24-Hour Routine & Inhalation Plan</span>
            <span>•</span>
            <span>{plan?.city || profile?.city_name}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink mt-1">
            Your Day's Breath Budget & Routine
          </h1>
          <p className="text-sm text-ink-muted mt-1 max-w-2xl">
            Calculated by the pure-Python deterministic engine. Flexible routines are placed in lowest-exposure windows.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/simulate"
            className="px-4 py-2 bg-ink text-paper text-xs font-mono uppercase tracking-wide hover:opacity-90"
          >
            Open What-If Simulator →
          </Link>
          <Link
            href="/onboarding"
            className="px-3 py-2 border border-rule bg-surface text-ink text-xs font-mono hover:bg-paper"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center font-mono text-sm text-ink-muted bg-surface border border-rule">
          Computing personal exposure, steady-state mass balances, and schedule optimization...
        </div>
      ) : (
        <>
          {/* Section 1: The Breath Budget Rings (Personal Inhalation & Benchmarks) */}
          <section className="bg-surface border hairline border-rule p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b hairline border-rule pb-4">
              <div>
                <span className="font-mono text-2xs uppercase text-ink-muted font-bold block">
                  Deterministic Exposure Metric
                </span>
                <h2 className="font-serif text-2xl font-bold text-ink">
                  Household Member Breath Budget
                </h2>
              </div>

              {/* Member Selector Tabs */}
              <div className="flex flex-wrap gap-2">
                {plan?.member_budgets.map((mb, idx) => (
                  <button
                    key={mb.member_id}
                    onClick={() => setSelectedMemberIdx(idx)}
                    className={`px-3 py-1.5 text-xs font-sans transition-colors border ${
                      selectedMemberIdx === idx
                        ? "bg-ink text-paper font-bold border-ink"
                        : "bg-paper text-ink border-rule hover:border-ink"
                    }`}
                  >
                    {mb.label} {mb.is_sensitive && "⚠️"}
                  </button>
                ))}
              </div>
            </div>

            {currentMember && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric 1: Total Micrograms Inhaled */}
                <div className="p-5 bg-paper border border-rule space-y-2">
                  <span className="font-mono text-2xs uppercase text-ink-muted block">
                    Total Inhaled Dose (24 Hours)
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-mono text-4xl font-extrabold text-ink">
                      {currentMember.total_inhaled_dose_ug}
                    </span>
                    <span className="font-mono text-sm text-ink-muted">µg PM2.5</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Physical particulate mass drawn into alveolar lung tissue based on age ({currentMember.age_band}) and activities.
                  </p>
                </div>

                {/* Metric 2: Breath Budget Ratio (WHO vs India Standard) */}
                <div className="p-5 bg-paper border border-rule space-y-2">
                  <span className="font-mono text-2xs uppercase text-ink-muted block">
                    WHO Guideline Breath Budget
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span
                      className={`font-mono text-4xl font-extrabold ${
                        currentMember.who_budget_ratio > 5 ? "text-red-700" : "text-amber-700"
                      }`}
                    >
                      {currentMember.who_budget_ratio}×
                    </span>
                    <span className="font-mono text-xs text-ink-muted">of WHO 24h limit</span>
                  </div>
                  <div className="w-full bg-rule h-2 relative overflow-hidden">
                    <div
                      className="bg-red-700 h-full"
                      style={{ width: `${Math.min(100, (currentMember.who_budget_ratio / 15) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-2xs font-mono text-ink-muted">
                    <span>WHO: 15 µg/m³</span>
                    <span>India Standard: 60 µg/m³ ({currentMember.india_naaqs_ratio}×)</span>
                  </div>
                </div>

                {/* Metric 3: Berkeley Earth Cigarette-Equivalent Heuristic */}
                <div className="p-5 bg-paper border border-rule space-y-2">
                  <span className="font-mono text-2xs uppercase text-ink-muted block">
                    Cigarette-Equivalents (Heuristic)
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-mono text-4xl font-extrabold text-ink">
                      ~{currentMember.cigarette_equivalents}
                    </span>
                    <span className="font-mono text-sm text-ink-muted">cigs / day</span>
                  </div>
                  <p className="text-2xs text-ink-muted leading-tight">
                    <strong>Rule of Thumb:</strong> 24h avg PM2.5 ÷ 22 µg/m³ (Berkeley Earth).
                    <span className="block italic mt-0.5 text-ink-muted font-mono">
                      Communication heuristic only, NOT medical fact.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Best Windows & Flexible Routine Optimization */}
          <section className="bg-surface border hairline border-rule p-6 md:p-8 space-y-6">
            <div className="border-b hairline border-rule pb-3">
              <span className="font-mono text-2xs uppercase text-ink-muted font-bold block">
                Algorithmically Optimized Windows
              </span>
              <h2 className="font-serif text-2xl font-bold text-ink">
                Flexible Routine Placement (Avoiding Peak Inversion)
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Winter morning air traps toxic smoke near ground level. Moving flexible tasks to midday cuts inhaled dose drastically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan?.schedules.map((item) => (
                <div key={item.activity_id} className="p-4 bg-paper border border-rule space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-base font-bold text-ink">{item.name_en}</h3>
                      <span className="text-xs font-devanagari text-ink-muted">{item.name_hi}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-900 border border-green-300 font-mono text-xs font-bold">
                      -{item.reduction_pct}% PM2.5
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono py-2 border-y hairline border-rule">
                    <div>
                      <span className="text-ink-muted block">Default Routine:</span>
                      <strong className="text-red-900 line-through">{item.baseline_time}</strong>
                      <span className="block text-2xs text-ink-muted">({item.baseline_pm25} µg/m³)</span>
                    </div>
                    <div>
                      <span className="text-ink-muted block">Saans Optimal:</span>
                      <strong className="text-green-900">{item.optimized_time}</strong>
                      <span className="block text-2xs text-green-800 font-bold">({item.optimized_pm25} µg/m³)</span>
                    </div>
                  </div>

                  <p className="text-xs text-ink leading-relaxed">
                    {item.rationale_en}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: "If You Must Be Outside" Protocol (Outdoor Workers & Delivery Riders) */}
          {(plan?.outdoor_worker_advice_en || outdoorModeOverride) && (
            <section className="bg-amber-50 border-2 border-amber-600 p-6 space-y-3 text-amber-950">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1">
                  <span>🚨</span>
                  <span>Safety Protocol: If You Must Be Outside</span>
                </span>
                <span className="font-mono text-2xs px-2 py-0.5 bg-amber-200 border border-amber-400">
                  CRITICAL HEALTH DEFENSE
                </span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed">
                {plan?.outdoor_worker_advice_en}
              </p>
              <div className="text-2xs font-devanagari text-amber-900 pt-1 border-t border-amber-200/60">
                {plan?.outdoor_worker_advice_hi}
              </div>
            </section>
          )}

          {/* Section 4: Ranked Recommendations by Budget Tiers */}
          <section className="bg-surface border hairline border-rule p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b hairline border-rule pb-4">
              <div>
                <span className="font-mono text-2xs uppercase text-ink-muted font-bold block">
                  Actionable Interventions
                </span>
                <h2 className="font-serif text-2xl font-bold text-ink">
                  Ranked Recommendations by Exposure Saved Per Rupee
                </h2>
                <p className="text-xs text-ink-muted mt-1">
                  Tier 0 (₹0 Free Habits) are prioritized first, followed by high cost-efficiency measures.
                </p>
              </div>

              {/* Tier Filter Buttons */}
              <div className="flex items-center space-x-2 font-mono text-xs">
                <button
                  onClick={() => setActiveTierFilter("all")}
                  className={`px-2.5 py-1 border ${
                    activeTierFilter === "all" ? "bg-ink text-paper border-ink" : "bg-paper text-ink border-rule"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTierFilter("zero")}
                  className={`px-2.5 py-1 border ${
                    activeTierFilter === "zero" ? "bg-ink text-paper border-ink" : "bg-paper text-ink border-rule"
                  }`}
                >
                  ₹0 Free
                </button>
                <button
                  onClick={() => setActiveTierFilter("under_1k")}
                  className={`px-2.5 py-1 border ${
                    activeTierFilter === "under_1k" ? "bg-ink text-paper border-ink" : "bg-paper text-ink border-rule"
                  }`}
                >
                  &lt; ₹1,000
                </button>
                <button
                  onClick={() => setActiveTierFilter("over_5k")}
                  className={`px-2.5 py-1 border ${
                    activeTierFilter === "over_5k" ? "bg-ink text-paper border-ink" : "bg-paper text-ink border-rule"
                  }`}
                >
                  &gt; ₹5,000
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredRecs?.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-paper border border-rule flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-mono text-2xs px-2 py-0.5 uppercase font-bold border ${
                          rec.tier === "zero"
                            ? "bg-green-100 text-green-900 border-green-300"
                            : (rec.tier === "under_1k"
                               ? "bg-blue-100 text-blue-900 border-blue-300"
                               : "bg-purple-100 text-purple-900 border-purple-300")
                        }`}
                      >
                        {rec.tier_label}
                      </span>
                      <h3 className="font-serif text-base font-bold text-ink">{rec.name_en}</h3>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {rec.description_en}
                    </p>
                  </div>

                  <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l hairline border-rule pt-3 md:pt-0 md:pl-6">
                    <div className="text-right">
                      <span className="font-mono text-2xs uppercase text-ink-muted block">Estimated Cost</span>
                      <span className="font-mono text-lg font-bold text-ink">
                        {rec.cost_inr === 0 ? "₹0" : `₹${rec.cost_inr.toLocaleString("en-IN")}`}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-2xs uppercase text-ink-muted block">Dose Saved</span>
                      <span className="font-mono text-lg font-bold text-green-800">
                        ~{rec.dose_saved_pct}%
                      </span>
                    </div>

                    <Link
                      href="/simulate"
                      className="px-3 py-1.5 border border-ink bg-surface hover:bg-ink hover:text-paper font-mono text-xs transition-colors whitespace-nowrap"
                    >
                      Simulate →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
