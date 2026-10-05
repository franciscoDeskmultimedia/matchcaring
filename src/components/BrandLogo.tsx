"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageContext";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  theme?: "light" | "dark";
  href?: string;
  className?: string;
}

export function BrandLogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dimMap = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
  };

  return (
    <div
      className={`${dimMap[size]} bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Supportive Hands Heart & Spark */}
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function BrandLogo({
  size = "md",
  showSubtitle = true,
  theme = "light",
  href,
  className = "",
}: BrandLogoProps) {
  const { language, t } = useLanguage();

  const titleSize = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <BrandLogoIcon size={size} className="group-hover:scale-105 transition-transform" />
      <div>
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight ${
              theme === "dark" ? "text-white" : "text-slate-900"
            } ${titleSize}`}
          >
            MatchCaring
          </span>
          <span
            className={`font-black uppercase tracking-wider rounded-md ${
              size === "lg" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5"
            } ${
              theme === "dark"
                ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                : "bg-sky-100 text-sky-800 border border-sky-200"
            }`}
          >
            Bio
          </span>
        </div>

        {showSubtitle && (
          <p
            className={`text-[10px] hidden sm:block font-medium truncate max-w-xs ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {language === "es"
              ? "Diagnóstico Psicológico y Selección de Cuidados"
              : "Psychological Screening & Care Matching"}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
