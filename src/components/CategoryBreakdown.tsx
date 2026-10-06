"use client";

import { CategoryScore, QuestionCategory } from "@/lib/types";
import { useLanguage } from "./LanguageContext";
import { motion } from "framer-motion";
import {
  Brain,
  ShieldAlert,
  Baby,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users2,
  ChevronRight,
} from "lucide-react";

interface CategoryBreakdownProps {
  categoryScores: Record<QuestionCategory, CategoryScore>;
}

const CATEGORY_ICONS: Record<QuestionCategory, any> = {
  psychological_temperament: Brain,
  safety_and_emergency: ShieldAlert,
  toddler_development_age3: Baby,
  ethics_and_professionalism: Scale,
  situational_judgment: Sparkles,
  sibling_and_multichild: Users2,
};

export default function CategoryBreakdown({ categoryScores }: CategoryBreakdownProps) {
  const { language } = useLanguage();
  const categories = Object.values(categoryScores);

  return (
    <div className="space-y-4">
      {categories.map((cat, index) => {
        const Icon = CATEGORY_ICONS[cat.category] || Sparkles;
        const title = (language === "es" && cat.titleEs) ? cat.titleEs : cat.title;
        const feedback = (language === "es" && cat.feedbackEs) ? cat.feedbackEs : cat.feedback;
        const rating = (language === "es" && cat.ratingEs) ? cat.ratingEs : cat.rating;
        const strengths = (language === "es" && cat.strengthsEs && cat.strengthsEs.length > 0)
          ? cat.strengthsEs
          : cat.strengths;
        const watchouts = (language === "es" && cat.watchoutsEs && cat.watchoutsEs.length > 0)
          ? cat.watchoutsEs
          : cat.watchouts;

        let barGradient = "from-emerald-500 to-teal-400";
        let badgeStyle = "bg-emerald-50/90 text-emerald-800 border-emerald-200/90 shadow-emerald-500/10";
        let iconBg = "bg-emerald-50 text-emerald-600 border-emerald-200/60";

        if (cat.score < 55 || cat.rating === "High Risk") {
          barGradient = "from-rose-500 to-red-600";
          badgeStyle = "bg-rose-50/90 text-rose-800 border-rose-200/90 shadow-rose-500/10";
          iconBg = "bg-rose-50 text-rose-600 border-rose-200/60";
        } else if (cat.score < 75 || cat.rating === "Needs Attention") {
          barGradient = "from-amber-400 to-amber-500";
          badgeStyle = "bg-amber-50/90 text-amber-800 border-amber-200/90 shadow-amber-500/10";
          iconBg = "bg-amber-50 text-amber-600 border-amber-200/60";
        } else if (cat.rating === "Solid") {
          barGradient = "from-sky-500 to-indigo-500";
          badgeStyle = "bg-sky-50/90 text-sky-800 border-sky-200/90 shadow-sky-500/10";
          iconBg = "bg-sky-50 text-sky-600 border-sky-200/60";
        }

        return (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 card-hover-lift"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs shrink-0 ${iconBg}`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    {title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xl">{feedback}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {cat.score}
                  <span className="text-xs font-semibold text-slate-400 ml-0.5">%</span>
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-2xs ${badgeStyle}`}
                >
                  {rating}
                </span>
              </div>
            </div>

            {/* Progress Bar with Gradient & Motion */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 mb-4 border border-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(5, cat.score))}%` }}
                transition={{ duration: 0.9, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full bg-gradient-to-r shadow-xs ${barGradient}`}
              />
            </div>

            {/* Strengths & Watchouts with Editorial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs pt-1">
              {strengths && strengths.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/80 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === "es" ? "Fortalezas Destacadas" : "Key Strengths"}</span>
                  </span>
                  <div className="space-y-1">
                    {strengths.map((str, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-700">
                        <ChevronRight className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium leading-relaxed">{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {watchouts && watchouts.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-100/80 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === "es" ? "Puntos de Atención / Observación" : "Watchouts & Probes"}</span>
                  </span>
                  <div className="space-y-1">
                    {watchouts.map((wat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-700">
                        <ChevronRight className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                        <span className="font-medium leading-relaxed">{wat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

