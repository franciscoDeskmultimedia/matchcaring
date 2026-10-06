"use client";

import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  tier: "Exceptional Fit" | "Strong Candidate" | "Proceed with Caution" | "High Risk / Not Recommended" | string;
  size?: "sm" | "md" | "lg";
  hasRedFlags?: boolean;
}

export default function ScoreGauge({
  score,
  tier,
  size = "md",
  hasRedFlags = false,
}: ScoreGaugeProps) {
  // SVG circle calculations
  const radius = size === "lg" ? 54 : size === "sm" ? 28 : 42;
  const stroke = size === "lg" ? 10 : size === "sm" ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let gradientId = "gauge-emerald";
  let textColor = "text-emerald-700";
  let bgClass = "bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-emerald-500/10";
  let glowColor = "rgba(16, 185, 129, 0.25)";

  if (hasRedFlags || tier === "High Risk / Not Recommended" || tier.includes("Riesgo") || tier.includes("Risk")) {
    gradientId = "gauge-rose";
    textColor = "text-rose-600";
    bgClass = "bg-rose-50 text-rose-800 border-rose-200/90 shadow-rose-500/10";
    glowColor = "rgba(244, 63, 94, 0.25)";
  } else if (tier === "Proceed with Caution" || score < 70 || tier.includes("Precaución") || tier.includes("Caution")) {
    gradientId = "gauge-amber";
    textColor = "text-amber-600";
    bgClass = "bg-amber-50 text-amber-800 border-amber-200/90 shadow-amber-500/10";
    glowColor = "rgba(245, 158, 11, 0.25)";
  } else if (tier === "Strong Candidate" || tier.includes("Sólida") || tier.includes("Strong")) {
    gradientId = "gauge-sky";
    textColor = "text-sky-600";
    bgClass = "bg-sky-50 text-sky-800 border-sky-200/90 shadow-sky-500/10";
    glowColor = "rgba(14, 165, 233, 0.25)";
  }

  const dimMap = {
    sm: { box: 76, text: "text-base font-black", label: "text-[10px]" },
    md: { box: 116, text: "text-2xl font-black", label: "text-xs" },
    lg: { box: 156, text: "text-4xl font-black", label: "text-sm" },
  };

  const dim = dimMap[size];

  return (
    <div className="flex flex-col items-center text-center group">
      <div className="relative inline-flex items-center justify-center">
        {/* Subtle Ambient Glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-opacity duration-700 opacity-60 group-hover:opacity-100"
          style={{ backgroundColor: glowColor }}
        />

        <svg
          width={dim.box}
          height={dim.box}
          className="transform -rotate-90 relative z-10"
        >
          <defs>
            <linearGradient id="gauge-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gauge-sky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="gauge-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="gauge-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx={dim.box / 2}
            cy={dim.box / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-slate-100/90"
          />
          {/* Animated Progress */}
          <motion.circle
            cx={dim.box / 2}
            cy={dim.box / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-baseline"
          >
            <span className={`${dim.text} ${textColor} tracking-tight leading-none`}>
              {score}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 ml-0.5">
              /100
            </span>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-2.5"
      >
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-xs backdrop-blur-xs ${bgClass}`}
        >
          {tier}
        </span>
      </motion.div>
    </div>
  );
}

