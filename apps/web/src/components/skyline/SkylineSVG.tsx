"use client";

import React from "react";

interface SkylineSVGProps {
  aqi: number;
  band: "good" | "satisfactory" | "moderate" | "poor" | "very_poor" | "severe";
}

/**
 * Signature SAANS City Skyline Element.
 * Building depth planes fade in discrete steps corresponding to CPCB AQI bands,
 * mimicking real atmospheric visibility reduction in winter smog.
 * Strictly decorative (aria-hidden="true") and respects prefers-reduced-motion.
 */
export const SkylineSVG: React.FC<SkylineSVGProps> = ({ aqi, band }) => {
  // Determine opacity of background, midground, and smog blanket
  const getOpacities = () => {
    switch (band) {
      case "good":
        return { bg: 1.0, mid: 1.0, fg: 1.0, smog: 0.0 };
      case "satisfactory":
        return { bg: 0.85, mid: 0.95, fg: 1.0, smog: 0.08 };
      case "moderate":
        return { bg: 0.6, mid: 0.85, fg: 1.0, smog: 0.2 };
      case "poor":
        return { bg: 0.35, mid: 0.7, fg: 0.95, smog: 0.4 };
      case "very_poor":
        return { bg: 0.12, mid: 0.45, fg: 0.85, smog: 0.65 };
      case "severe":
      default:
        return { bg: 0.03, mid: 0.22, fg: 0.7, smog: 0.85 };
    }
  };

  const { bg, mid, fg, smog } = getOpacities();

  return (
    <div
      aria-hidden="true"
      className="relative w-full h-36 md:h-48 overflow-hidden bg-surface border-b hairline border-rule select-none"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Layer: Distant Monuments, Highrises & Towers */}
        <g style={{ opacity: bg, transition: "opacity 0.6s ease" }} fill="#A6A29A">
          {/* Distant Transmission Tower */}
          <polygon points="120,50 123,170 117,170" />
          <line x1="110" y1="90" x2="130" y2="90" stroke="#A6A29A" strokeWidth="2" />
          <line x1="112" y1="120" x2="128" y2="120" stroke="#A6A29A" strokeWidth="2" />

          {/* Distant High-rises */}
          <rect x="180" y="70" width="45" height="130" />
          <rect x="235" y="55" width="55" height="145" />
          <polygon points="262,35 260,55 264,55" />
          <rect x="300" y="80" width="40" height="120" />

          {/* Central Dome Monument Silhouette (e.g. Indic heritage / Delhi monument) */}
          <path d="M 460 110 Q 500 65 540 110 L 545 200 L 455 200 Z" />
          <rect x="495" y="50" width="10" height="20" />

          {/* Eastern NCR Highrise Cluster */}
          <rect x="680" y="60" width="50" height="140" />
          <rect x="740" y="75" width="60" height="125" />
          <rect x="810" y="45" width="45" height="155" />
          <rect x="865" y="80" width="70" height="120" />
        </g>

        {/* Midground Layer: Mid-rise Apartments, Rooftop Water Tanks */}
        <g style={{ opacity: mid, transition: "opacity 0.6s ease" }} fill="#696C73">
          <rect x="50" y="110" width="60" height="90" />
          {/* Water tank */}
          <rect x="70" y="98" width="18" height="12" rx="2" />

          <rect x="130" y="125" width="75" height="75" />
          <rect x="330" y="105" width="85" height="95" />
          <rect x="360" y="95" width="22" height="10" />

          <rect x="560" y="115" width="90" height="85" />
          <rect x="610" y="102" width="20" height="13" />

          <rect x="890" y="110" width="80" height="90" />
        </g>

        {/* Foreground Layer: Low Residences, Brick Parapets, Street Structures */}
        <g style={{ opacity: fg, transition: "opacity 0.6s ease" }} fill="#17181A">
          <rect x="0" y="145" width="70" height="55" />
          <rect x="85" y="150" width="90" height="50" />
          {/* Balcony Railings */}
          <line x1="90" y1="160" x2="170" y2="160" stroke="#F3EFE6" strokeWidth="1.5" />

          <rect x="200" y="135" width="110" height="65" />
          <rect x="430" y="140" width="115" height="60" />
          <rect x="670" y="145" width="100" height="55" />
          <rect x="790" y="138" width="85" height="62" />
          <rect x="940" y="148" width="60" height="52" />

          {/* Base Ground Baseline */}
          <rect x="0" y="196" width="1000" height="4" fill="#17181A" />
        </g>

        {/* Atmospheric Winter Smog Overlay Blanket */}
        <rect
          x="0"
          y="0"
          width="1000"
          height="200"
          fill="#F3EFE6"
          style={{ opacity: smog, transition: "opacity 0.6s ease" }}
        />
      </svg>

      {/* Visibility Indicator Tag */}
      <div className="absolute bottom-2 right-3 font-mono text-xs px-2 py-0.5 bg-paper/90 border border-rule text-ink">
        Visibility: {Math.max(10, Math.round(100 - smog * 100))}% (AQI {aqi})
      </div>
    </div>
  );
};
