"use client";

import { RedFlagAlert } from "@/lib/types";
import { AlertOctagon, HelpCircle, ShieldAlert } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface RedFlagBannerProps {
  redFlags: RedFlagAlert[];
}

export default function RedFlagBanner({ redFlags }: RedFlagBannerProps) {
  const { t, language } = useLanguage();

  if (!redFlags || redFlags.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
          <ShieldAlert className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900">{t.zeroRedFlagsTitle}</h4>
          <p className="text-xs text-emerald-700">{t.zeroRedFlagsDesc}</p>
        </div>
      </div>
    );
  }

  const criticalCount = redFlags.filter((f) => f.severity === "critical").length;

  return (
    <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/30">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-rose-950">
              {t.redFlagAlertTitle(redFlags.length)}
            </h3>
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white">
                {criticalCount} {language === "es" ? "Críticas" : "Critical"}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-rose-800 mt-0.5">
            {t.redFlagAlertDesc}
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {redFlags.map((flag, idx) => {
          const qText = (language === "es" && flag.questionTextEs) ? flag.questionTextEs : flag.questionText;
          const ansText = (language === "es" && flag.candidateAnswerTextEs) ? flag.candidateAnswerTextEs : flag.candidateAnswerText;
          const reason = (language === "es" && flag.reasonEs) ? flag.reasonEs : flag.reason;
          const probe = (language === "es" && flag.recommendedProbeEs) ? flag.recommendedProbeEs : flag.recommendedProbe;

          return (
            <div
              key={idx}
              className="p-4 rounded-lg bg-white border border-rose-200 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {language === "es" ? "Pregunta" : "Question"} {idx + 1}: {qText}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    flag.severity === "critical"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {flag.severity === "critical"
                    ? language === "es" ? "Crítico" : "Critical"
                    : language === "es" ? "Alto Riesgo" : "High"}
                </span>
              </div>

              <div className="p-2.5 rounded bg-rose-50/60 border border-rose-100 text-xs">
                <span className="font-semibold text-rose-900 block mb-0.5">
                  {t.candidateSelectedResp}
                </span>
                <p className="text-rose-950 italic">&ldquo;{ansText}&rdquo;</p>
              </div>

              <div className="text-xs text-slate-700 space-y-1">
                <p>
                  <strong className="text-rose-900">{t.safetyHazard}</strong> {reason}
                </p>
                <div className="flex items-start gap-1.5 pt-1 text-slate-900 bg-slate-50 p-2.5 rounded border border-slate-200/80">
                  <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sky-900 block">{t.recommendedProbe}</span>
                    <span className="italic text-slate-700">&ldquo;{probe}&rdquo;</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
