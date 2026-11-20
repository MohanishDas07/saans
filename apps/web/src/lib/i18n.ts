"use client";

import { useState, useEffect } from "react";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import mr from "@/messages/mr.json";

export type Language = "en" | "hi" | "mr";

const translations: Record<Language, any> = {
  en,
  hi,
  mr,
};

export function getTranslation(lang: Language, path: string): string {
  const dict = translations[lang] || translations.en;
  const parts = path.split(".");
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      let fallback: any = translations.en;
      for (const fPart of parts) {
        if (fallback && typeof fallback === "object" && fPart in fallback) {
          fallback = fallback[fPart];
        } else {
          return path;
        }
      }
      return typeof fallback === "string" ? fallback : path;
    }
  }

  return typeof current === "string" ? current : path;
}

export function useTranslation() {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = (localStorage.getItem("saans_lang") as Language) || "en";
    setLangState(saved);

    const onLangChange = () => {
      const current = (localStorage.getItem("saans_lang") as Language) || "en";
      setLangState(current);
    };

    window.addEventListener("saans_lang_changed", onLangChange);
    return () => window.removeEventListener("saans_lang_changed", onLangChange);
  }, []);

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("saans_lang", newLang);
    document.documentElement.lang = newLang;
    window.dispatchEvent(new Event("saans_lang_changed"));
  };

  const t = (path: string) => getTranslation(lang, path);

  return { t, lang, setLanguage };
}
