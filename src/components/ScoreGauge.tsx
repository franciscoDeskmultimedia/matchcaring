"use client";

interface ScoreGaugeProps {
  score: number;
  tier: "Exceptional Fit" | "Strong Candidate" | "Proceed with Caution" | "High Risk / Not Recommended";
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

  let colorClass = "text-emerald-500 stroke-emerald-500";
  let bgClass = "bg-emerald-50 text-emerald-800 border-emerald-200";

  if (hasRedFlags || tier === "High Risk / Not Recommended") {
    colorClass = "text-rose-500 stroke-rose-500";
    bgClass = "bg-rose-50 text-rose-800 border-rose-200";
  } else if (tier === "Proceed with Caution" || score < 70) {
    colorClass = "text-amber-500 stroke-amber-500";
    bgClass = "bg-amber-50 text-amber-800 border-amber-200";
  } else if (tier === "Strong Candidate") {
    colorClass = "text-sky-500 stroke-sky-500";
    bgClass = "bg-sky-50 text-sky-800 border-sky-200";
  }

  const dimMap = {
    sm: { box: 76, text: "text-base font-bold", label: "text-[10px]" },
    md: { box: 112, text: "text-2xl font-extrabold", label: "text-xs" },
    lg: { box: 148, text: "text-4xl font-extrabold", label: "text-sm" },
  };

  const dim = dimMap[size];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dim.box}
          height={dim.box}
          className="transform -rotate-90"
        >
          {/* Track */}
          <circle
            cx={dim.box / 2}
            cy={dim.box / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-slate-200"
          />
          {/* Progress */}
          <circle
            cx={dim.box / 2}
            cy={dim.box / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${colorClass}`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${dim.text} text-slate-900 tracking-tight leading-none`}>
            {score}
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400">/100</span>
          </span>
        </div>
      </div>

      <div className="mt-2.5">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgClass}`}
        >
          {tier}
        </span>
      </div>
    </div>
  );
}
