"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SkylineSVG } from "@/components/skyline/SkylineSVG";
import { fetchAirQuality } from "@/lib/api";
import { AirQualityResponse } from "@/types/api";

export default function LandingPage() {
  const [city, setCity] = useState<string>("Ghaziabad");
  const [lat, setLat] = useState<number>(28.6692);
  const [lon, setLon] = useState<number>(77.4538);
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lang, setLang] = useState<"en" | "hi" | "mr">("en");

  useEffect(() => {
    const savedLang = (localStorage.getItem("saans_lang") as "en" | "hi" | "mr") || "en";
    setLang(savedLang);

    const onLang = () => {
      setLang((localStorage.getItem("saans_lang") as "en" | "hi" | "mr") || "en");
    };
    window.addEventListener("saans_lang_changed", onLang);
    return () => window.removeEventListener("saans_lang_changed", onLang);
  }, []);

  const loadAir = async (cName: string, cLat: number, cLon: number) => {
    setLoading(true);
    try {
      const data = await fetchAirQuality(cLat, cLon, cName);
      setAirData(data);
    } catch (err) {
      console.error("Failed to load air data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAir(city, lat, lon);
  }, [city, lat, lon]);

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "Ghaziabad") {
      setCity("Ghaziabad");
      setLat(28.6692);
      setLon(77.4538);
    } else if (val === "Delhi") {
      setCity("Delhi");
      setLat(28.6139);
      setLon(77.2090);
    } else if (val === "Lucknow") {
      setCity("Lucknow");
      setLat(26.8467);
      setLon(80.9462);
    }
  };

  const getVerdict = () => {
    if (!airData) return "";
    if (lang === "hi") return airData.one_sentence_verdict_hi;
    if (lang === "mr") return airData.one_sentence_verdict_mr;
    return airData.one_sentence_verdict_en;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sample / Offline Fallback Banner */}
      {airData?.is_sample_or_fallback && (
        <div
          role="alert"
          className="bg-amber-100 border-l-4 border-amber-600 text-amber-900 p-4 font-sans text-xs md:text-sm shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold tracking-tight uppercase font-mono">
                Notice: Offline Sample Reference Fixture Active
              </p>
              <p className="mt-1">
                Data as of: <span className="font-mono">{airData.data_as_of}</span> | Source:{" "}
                <span className="font-semibold">{airData.data_source}</span>
              </p>
              <p className="text-2xs text-amber-800 mt-0.5">
                {airData.fallback_banner_text || "Displaying pre-verified winter smog historical snapshot."}
              </p>
            </div>
            <span className="hidden sm:inline font-mono text-2xs px-2 py-1 bg-amber-200 border border-amber-400">
              OFFLINE RESILIENT
            </span>
          </div>
        </div>
      )}

      {/* Hero Skyline Section */}
      <section className="bg-surface border hairline border-rule shadow-sm overflow-hidden" aria-label="Today's Air Overview">
        {/* Decorative SVG Skyline */}
        <SkylineSVG
          aqi={airData?.current_cpcb_aqi || 450}
          band={airData?.current_aqi_band || "severe"}
        />

        {/* Hero Air Data Panel */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b hairline border-rule pb-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono uppercase text-ink-muted">
                <span>Field Station Reading</span>
                <span>•</span>
                <span>CPCB NAQI Standard</span>
              </div>

              <div className="mt-2 flex items-center space-x-3">
                <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink">
                  {city}
                </h1>

                {/* City Selector */}
                <label htmlFor="city-select" className="sr-only">Select City</label>
                <select
                  id="city-select"
                  value={city}
                  onChange={handleCitySelect}
                  className="font-mono text-xs px-2.5 py-1.5 border border-rule bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                >
                  <option value="Ghaziabad">Ghaziabad (Demo)</option>
                  <option value="Delhi">Delhi (NCR)</option>
                  <option value="Lucknow">Lucknow</option>
                </select>
              </div>

              {/* One Sentence Verdict */}
              <p className="mt-3 text-base md:text-lg font-sans text-ink leading-relaxed max-w-3xl">
                {loading ? "Analyzing atmospheric readings..." : getVerdict()}
              </p>
            </div>

            {/* Live AQI Big Block */}
            <div className="flex items-baseline space-x-4">
              <div className="text-right">
                <span className="block font-mono text-2xs uppercase tracking-wider text-ink-muted">
                  CPCB AQI Index
                </span>
                <span
                  className="font-mono text-5xl md:text-6xl font-extrabold tracking-tight"
                  style={{ color: airData?.current_aqi_color || "#7A0F2E" }}
                >
                  {loading ? "--" : airData?.current_cpcb_aqi}
                </span>
              </div>

              <div className="border-l hairline border-rule pl-4 space-y-1">
                <span
                  className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: airData?.current_aqi_color || "#7A0F2E" }}
                >
                  {airData?.current_aqi_band.replace("_", " ") || "Severe"}
                </span>
                <div className="font-mono text-xs text-ink-muted">
                  PM2.5: <strong className="text-ink">{airData?.current_pm2_5} µg/m³</strong>
                </div>
                {airData?.current_pm10 && (
                  <div className="font-mono text-xs text-ink-muted">
                    PM10: <strong className="text-ink">{airData?.current_pm10} µg/m³</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active GRAP Notification for NCR */}
          {airData?.active_grap_stage && (
            <div className="bg-red-50 border border-red-200 p-4 text-red-950 font-sans text-sm">
              <div className="flex items-center justify-between border-b border-red-200 pb-2 mb-2 font-mono text-xs font-bold uppercase">
                <span>CAQM GRAP Active: {airData.active_grap_stage.name}</span>
                <span className="px-1.5 py-0.5 bg-red-800 text-white text-2xs">MANDATORY</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {airData.active_grap_stage.citizen_advisory.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-red-700 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs font-sans text-ink-muted">
              Personalized protection calculates hourly inhaled doses, indoor filtration, and rupee efficiency.
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto text-center px-6 py-3 bg-ink text-paper font-sans font-semibold text-sm hover:opacity-90 transition-opacity border border-ink"
              >
                Set Up Your Household's Breath Budget →
              </Link>
              <Link
                href="/your-day"
                className="w-full sm:w-auto text-center px-4 py-3 bg-surface hover:bg-paper font-sans font-semibold text-sm border border-rule text-ink transition-colors"
              >
                View Your Day Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        <div className="p-5 bg-surface border hairline border-rule space-y-2">
          <span className="font-mono text-2xs uppercase text-ink-muted font-bold block">
            01 / Physical Reality
          </span>
          <h2 className="font-serif text-lg font-bold text-ink">The Breath Budget</h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            Every choice—opening a window, riding a two-wheeler, or turning on a purifier—spends or saves micrograms of PM2.5. We track your cumulative daily inhalation against WHO and India standards.
          </p>
        </div>

        <div className="p-5 bg-surface border hairline border-rule space-y-2">
          <span className="font-mono text-2xs uppercase text-ink-muted font-bold block">
            02 / Architectural Integrity
          </span>
          <h2 className="font-serif text-lg font-bold text-ink">The LLM Never Does The Math</h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            All exposure equations, steady-state mass balances, and schedule optimizations are computed by an isolated, deterministic pure-Python engine. The AI solely narrates verified tool outputs.
          </p>
        </div>

        <div className="p-5 bg-surface border hairline border-rule space-y-2">
          <span className="font-mono text-2xs uppercase text-ink-muted font-bold block">
            03 / Privacy by Design
          </span>
          <h2 className="font-serif text-lg font-bold text-ink">Zero Server Accounts</h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            Your family ages, medical vulnerability, and daily routines live exclusively in your browser's localStorage. The server never stores or logs your household profile.
          </p>
        </div>
      </section>
    </div>
  );
}
