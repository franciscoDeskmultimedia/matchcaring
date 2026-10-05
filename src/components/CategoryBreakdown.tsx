"use client";

import { CategoryScore, QuestionCategory } from "@/lib/types";
import { useLanguage } from "./LanguageContext";
import {
  Brain,
  ShieldAlert,
  Baby,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users2,
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
      {categories.map((cat) => {
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

        let barColor = "bg-emerald-500";
        let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";

        if (cat.score < 55 || cat.rating === "High Risk") {
          barColor = "bg-rose-500";
          badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
        } else if (cat.score < 75 || cat.rating === "Needs Attention") {
          barColor = "bg-amber-500";
          badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
        } else if (cat.rating === "Solid") {
          barColor = "bg-sky-500";
          badgeStyle = "bg-sky-50 text-sky-700 border-sky-200";
        }

        return (
          <div
            key={cat.category}
            className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Icon className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {title}
                  </h4>
                  <p className="text-xs text-slate-500">{feedback}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-base font-black text-slate-900">
                  {cat.score}%
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}
                >
                  {rating}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                style={{ width: `${Math.min(100, Math.max(5, cat.score))}%` }}
              />
            </div>

            {/* Strengths & Watchouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
              {strengths && strengths.length > 0 && (
                <div className="space-y-1">
                  {strengths.map((str, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              )}

              {watchouts && watchouts.length > 0 && (
                <div className="space-y-1">
                  {watchouts.map((wat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-600">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{wat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
