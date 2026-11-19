import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface border-t hairline border-rule mt-16 text-sm font-sans text-ink-muted">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: System Purpose */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-serif text-xl font-bold text-ink block">
              साँस / SAANS Air Quality Decision Assistant
            </span>
            <p className="text-xs leading-relaxed">
              Designed for Indian households navigating severe winter smog. Built on strict principles:
              the LLM never computes numbers; a pure deterministic engine calculates inhaled doses,
              indoor mass balances, and schedule optimizations.
            </p>
            <div className="font-mono text-2xs p-2 bg-paper border border-rule text-ink">
              <strong>Cardinal Rule:</strong> All numbers are computed deterministically. The LLM only narrates and personalizes tool outputs.
            </div>
          </div>

          {/* Col 2: Navigation & Evidence */}
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold block">
              System Pages
            </span>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/" className="hover:underline">Today's Air & Skyline</Link></li>
              <li><Link href="/onboarding" className="hover:underline">Household Profile Setup</Link></li>
              <li><Link href="/your-day" className="hover:underline">Your Day Timeline & Budget</Link></li>
              <li><Link href="/simulate" className="hover:underline">What-If Intervention Simulator</Link></li>
              <li><Link href="/community" className="hover:underline">Community & School Advisory Card</Link></li>
              <li><Link href="/how-saans-works" className="hover:underline">Formulas & Privacy Model</Link></li>
            </ul>
          </div>

          {/* Col 3: Privacy & Disclaimers */}
          <div className="space-y-2 text-xs">
            <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold block">
              Privacy & Standards
            </span>
            <p>
              <strong>Privacy by Design:</strong> No server accounts. Household data lives exclusively in your browser localStorage.
            </p>
            <p className="text-2xs text-ink-muted">
              <strong>Heuristic Note:</strong> Cigarette-equivalents (PM2.5 / 22 µg/m³) is a communication rule of thumb (Berkeley Earth, 2015) and NOT medical fact.
            </p>
          </div>
        </div>

        <div className="border-t hairline border-rule pt-4 flex flex-col sm:flex-row justify-between items-center text-xs font-mono">
          <div>© 2026 SAANS Team. Open-Meteo Air Quality & CPCB Standard Breakdown.</div>
          <div className="mt-2 sm:mt-0">WCAG 2.2 AA Accessible • Panel Ready Vertical Slice</div>
        </div>
      </div>
    </footer>
  );
};
