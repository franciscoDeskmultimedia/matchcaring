"use client";

import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "subtle";
}

export default function LanguageSwitcher({
  className = "",
  variant = "pill",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === "subtle") {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs text-slate-500 ${className}`}>
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`font-semibold transition-colors ${
            language === "en" ? "text-sky-600 underline" : "hover:text-slate-700"
          }`}
        >
          EN
        </button>
        <span>|</span>
        <button
          type="button"
          onClick={() => setLanguage("es")}
          className={`font-semibold transition-colors ${
            language === "es" ? "text-sky-600 underline" : "hover:text-slate-700"
          }`}
        >
          ES
        </button>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
          language === "en"
            ? "bg-white text-slate-900 shadow-xs"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <span>🇺🇸</span>
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage("es")}
        className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
          language === "es"
            ? "bg-white text-slate-900 shadow-xs"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <span>🇪🇸</span>
        <span>ES</span>
      </button>
    </div>
  );
}
