"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [lang, setLang] = useState<"en" | "hi" | "mr">("en");
  const [elderMode, setElderMode] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("saans_lang") as "en" | "hi" | "mr";
    if (savedLang) setLang(savedLang);

    const savedElder = localStorage.getItem("saans_elder_mode") === "1";
    if (savedElder) {
      setElderMode(true);
      document.body.classList.add("elder-mode");
    }
  }, []);

  const handleLangChange = (newLang: "en" | "hi" | "mr") => {
    setLang(newLang);
    localStorage.setItem("saans_lang", newLang);
    document.documentElement.lang = newLang;
    window.dispatchEvent(new Event("saans_lang_changed"));
  };

  const toggleElderMode = () => {
    const next = !elderMode;
    setElderMode(next);
    localStorage.setItem("saans_elder_mode", next ? "1" : "0");
    if (next) {
      document.body.classList.add("elder-mode");
    } else {
      document.body.classList.remove("elder-mode");
    }
  };

  const navLinks = [
    { href: "/", labelEn: "Today's Air", labelHi: "आज की हवा", labelMr: "आजची हवा" },
    { href: "/onboarding", labelEn: "Household", labelHi: "परिवार", labelMr: "कुटुंब" },
    { href: "/your-day", labelEn: "Your Day", labelHi: "दिनचर्या", labelMr: "दिनचर्या" },
    { href: "/simulate", labelEn: "What-If Simulator", labelHi: "सिमुलेटर", labelMr: "सिम्युलेटर" },
    { href: "/community", labelEn: "Community Card", labelHi: "समुदाय कार्ड", labelMr: "समुदाय कार्ड" },
    { href: "/how-saans-works", labelEn: "How It Works", labelHi: "पारदर्शिता", labelMr: "पारदर्शकता" },
  ];

  return (
    <header className="w-full bg-surface border-b hairline border-rule select-none">
      {/* Top Banner: Editorial Newspaper Masthead Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-b hairline border-rule flex items-center justify-between text-xs font-mono text-ink-muted">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-ink uppercase tracking-wider">SAANS</span>
          <span>|</span>
          <span className="hidden sm:inline">Winter Smog & Clean Air Decision System</span>
          <span className="sm:hidden">Clean Air Decision System</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Elder Mode Toggle */}
          <button
            onClick={toggleElderMode}
            aria-pressed={elderMode}
            className={`px-2 py-0.5 border text-xs font-sans transition-colors ${
              elderMode
                ? "bg-ink text-paper border-ink font-bold"
                : "bg-surface hover:bg-paper border-rule text-ink"
            }`}
            title="Toggle Elder Mode (Larger fonts & high contrast)"
          >
            A+ Elder Mode
          </button>

          {/* Language Switcher */}
          <div className="flex items-center border border-rule bg-surface overflow-hidden">
            <button
              onClick={() => handleLangChange("en")}
              className={`px-2 py-0.5 text-xs font-medium ${
                lang === "en" ? "bg-ink text-paper" : "hover:bg-paper text-ink"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLangChange("hi")}
              className={`px-2 py-0.5 text-xs font-devanagari ${
                lang === "hi" ? "bg-ink text-paper" : "hover:bg-paper text-ink"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => handleLangChange("mr")}
              className={`px-2 py-0.5 text-xs font-devanagari ${
                lang === "mr" ? "bg-ink text-paper" : "hover:bg-paper text-ink"
              }`}
            >
              मराठी
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="group flex items-baseline space-x-2">
          <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-ink group-hover:opacity-90">
            साँस / SAANS
          </span>
          <span className="font-mono text-xs uppercase px-1.5 py-0.5 bg-paper border border-rule text-ink-muted">
            Field Unit
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-sans" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            const label = lang === "hi" ? link.labelHi : (lang === "mr" ? link.labelMr : link.labelEn);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-1 transition-colors border-b-2 ${
                  active
                    ? "border-ink font-semibold text-ink"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-rule"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            className="p-2 border border-rule bg-paper text-ink"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <nav className="md:hidden border-t hairline border-rule bg-paper px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            const label = lang === "hi" ? link.labelHi : (lang === "mr" ? link.labelMr : link.labelEn);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-2 text-base ${
                  pathname === link.href ? "font-bold text-ink" : "text-ink-muted"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
};
