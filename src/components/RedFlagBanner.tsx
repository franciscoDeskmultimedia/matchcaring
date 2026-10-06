"use client";

import { RedFlagAlert } from "@/lib/types";
import { AlertOctagon, HelpCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { motion } from "framer-motion";

interface RedFlagBannerProps {
  redFlags: RedFlagAlert[];
}

export default function RedFlagBanner({ redFlags }: RedFlagBannerProps) {
  const { t, language } = useLanguage();

  if (!redFlags || redFlags.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white border border-emerald-200/90 shadow-xs flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-700 shrink-0 border border-emerald-200/80 shadow-2xs">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h4 className="text-sm font-black text-emerald-950 tracking-tight">{t.zeroRedFlagsTitle}</h4>
          <p className="text-xs text-emerald-700/90 mt-0.5 leading-relaxed">{t.zeroRedFlagsDesc}</p>
        </div>
      </motion.div>
    );
  }

  const criticalCount = redFlags.filter((f) => f.severity === "critical").length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border-2 border-rose-300 bg-gradient-to-b from-rose-50/90 to-white p-5 sm:p-6 space-y-4 shadow-lg shadow-rose-500/5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3.5 relative z-10">
        <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30 animate-pulse">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-rose-950 tracking-tight">
              {t.redFlagAlertTitle(redFlags.length)}
            </h3>
            {criticalCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                {criticalCount} {language === "es" ? "Críticas" : "Critical"}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-rose-800/90 mt-1 leading-relaxed">
            {t.redFlagAlertDesc}
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1 relative z-10">
        {redFlags.map((flag, idx) => {
          const qText = (language === "es" && flag.questionTextEs) ? flag.questionTextEs : flag.questionText;
          const ansText = (language === "es" && flag.candidateAnswerTextEs) ? flag.candidateAnswerTextEs : flag.candidateAnswerText;
          const reason = (language === "es" && flag.reasonEs) ? flag.reasonEs : flag.reason;
          const probe = (language === "es" && flag.recommendedProbeEs) ? flag.recommendedProbeEs : flag.recommendedProbe;

          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-xl bg-white border border-rose-200/90 shadow-xs space-y-3 card-hover-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold text-slate-800 leading-snug">
                  <span className="text-rose-600 font-extrabold mr-1">#{idx + 1}</span>
                  {language === "es" ? "Pregunta" : "Question"}: {qText}
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    flag.severity === "critical"
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {flag.severity === "critical"
                    ? language === "es" ? "Crítico" : "Critical"
                    : language === "es" ? "Alto Riesgo" : "High"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-xs">
                <span className="font-bold text-rose-900 block mb-1">
                  {t.candidateSelectedResp}
                </span>
                <p className="text-rose-950 font-medium italic">&ldquo;{ansText}&rdquo;</p>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <p className="leading-relaxed">
                  <strong className="text-rose-900 font-bold">{t.safetyHazard}</strong> {reason}
                </p>
                <div className="flex items-start gap-2.5 pt-1 text-slate-900 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                  <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-sky-950 block text-[11px] uppercase tracking-wider">
                      {t.recommendedProbe}
                    </span>
                    <span className="italic text-slate-700 leading-relaxed">&ldquo;{probe}&rdquo;</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

