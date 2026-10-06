"use client";

import React, { useMemo } from "react";
import {
  PSYCHOMETRIC_BATTERIES,
  getRecommendedBatteriesForRecipient,
} from "@/lib/psychometricBatteries";
import { useLanguage } from "./LanguageContext";
import {
  Brain,
  ShieldCheck,
  ShieldAlert,
  HeartHandshake,
  Clock,
  Sparkles,
  Check,
  FileCheck2,
  Lock,
  RotateCcw,
} from "lucide-react";

interface PsychometricBatterySelectorProps {
  selectedBatteryIds: string[];
  onChange: (ids: string[]) => void;
  targetAge?: number | null;
  careCategory?: string;
  recipientLabel?: string;
}

export default function PsychometricBatterySelector({
  selectedBatteryIds,
  onChange,
  targetAge,
  careCategory,
  recipientLabel,
}: PsychometricBatterySelectorProps) {
  const { language } = useLanguage();

  // Recommended batteries calculated dynamically
  const recommendedIds = useMemo(() => {
    return getRecommendedBatteriesForRecipient(targetAge, careCategory);
  }, [targetAge, careCategory]);

  const toggleBattery = (id: string) => {
    if (id === "sjt_base") return; // SJT Base is mandatory
    if (selectedBatteryIds.includes(id)) {
      onChange(selectedBatteryIds.filter((bId) => bId !== id));
    } else {
      onChange([...selectedBatteryIds, id]);
    }
  };

  const handleApplyRecommended = () => {
    onChange(recommendedIds);
  };

  // Metrics
  const activeBatteries = PSYCHOMETRIC_BATTERIES.filter((b) =>
    selectedBatteryIds.includes(b.id)
  );
  const totalQuestions = activeBatteries.reduce(
    (sum, b) => sum + b.questionCount,
    0
  );
  const totalMinutes = activeBatteries.reduce(
    (sum, b) => sum + b.estimatedTimeMinutes,
    0
  );

  const phase1Batteries = PSYCHOMETRIC_BATTERIES.filter((b) => b.phase === 1);
  const phase2Batteries = PSYCHOMETRIC_BATTERIES.filter((b) => b.phase === 2);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all">
      {/* Delicate top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200/60 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
            <Brain className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                {language === "es"
                  ? "Baterías Psicométricas Validadas"
                  : "Validated Psychometric Batteries"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {language === "es"
                ? "Evaluaciones Psicológicas y Clínicas"
                : "Psychological & Clinical Assessments"}
            </h3>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              {language === "es"
                ? "Selecciona los test a evaluar. Se autocalibran científicamente con base en la edad del familiar a cuidar."
                : "Select assessment tests. Scientifically auto-calibrated based on recipient age and specific care needs."}
            </p>
          </div>
        </div>

        {/* Quick summary badges & reset */}
        <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
            <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{totalQuestions}</span> {language === "es" ? "reactivos" : "items"}
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-sky-700 font-bold">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>~{totalMinutes} min</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyRecommended}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
            title={
              language === "es"
                ? "Restablecer a la sugerencia por edad"
                : "Reset to age-recommended setup"
            }
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {language === "es"
                ? "Auto-preseleccionar por edad"
                : "Auto-preselect by age"}
            </span>
          </button>
        </div>
      </div>

      {/* Recipient Context Notice if available */}
      {recipientLabel && (
        <div className="flex items-center gap-2.5 text-xs text-indigo-950 bg-gradient-to-r from-indigo-50/70 via-sky-50/40 to-slate-50 border border-indigo-200/70 p-3 rounded-2xl">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            {language === "es" ? "Calibrado para:" : "Calibrated for:"}{" "}
            <strong className="text-indigo-900 font-black">{recipientLabel}</strong>.{" "}
            {language === "es"
              ? "Las tarjetas marcadas con la insignia brillante se recomiendan para esta etapa."
              : "Cards marked with the glowing badge are recommended for this developmental stage."}
          </span>
        </div>
      )}

      {/* Section: FASE 1 */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
            {language === "es" ? "Fase 1: Seguridad & Honestidad" : "Phase 1: Safety & Honesty"}
          </span>
          <span className="text-xs text-slate-500">
            {language === "es"
              ? "(Filtros no negociables y detección de falseamiento)"
              : "(Non-negotiable life filters and anti-gaming)"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {phase1Batteries.map((battery) => {
            const isSelected = selectedBatteryIds.includes(battery.id);
            const isRecommended = recommendedIds.includes(battery.id);

            return (
              <div
                key={battery.id}
                onClick={() => !battery.isBase && toggleBattery(battery.id)}
                className={`relative rounded-2xl p-4.5 transition-all duration-200 border flex flex-col justify-between select-none ${
                  battery.isBase
                    ? "bg-slate-50/80 border-slate-200 cursor-default ring-1 ring-slate-200/80"
                    : isSelected
                    ? "bg-gradient-to-b from-white to-indigo-50/30 border-indigo-500 ring-2 ring-indigo-500/15 shadow-sm shadow-indigo-500/5 cursor-pointer hover:border-indigo-600"
                    : "bg-white/80 border-slate-200/80 opacity-70 hover:opacity-100 hover:border-slate-300 hover:shadow-2xs cursor-pointer"
                }`}
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        battery.isBase
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : battery.id === "buss_perry"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {language === "es" ? battery.badgeEs : battery.badgeEn}
                    </span>

                    {/* Toggle check or lock */}
                    {battery.isBase ? (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                        title={
                          language === "es"
                            ? "Obligatorio para la seguridad del cuidado"
                            : "Mandatory for life safety"
                        }
                      >
                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                        {language === "es" ? "Fijo" : "Locked"}
                      </span>
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug mb-1">
                    {language === "es" ? battery.nameEs : battery.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {language === "es" ? battery.descriptionEs : battery.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 mt-auto flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>
                    {battery.questionCount} {language === "es" ? "preguntas" : "questions"} • ~{battery.estimatedTimeMinutes} min
                  </span>
                  {isRecommended && !battery.isBase && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-extrabold text-[10px]">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {language === "es" ? "Sugerido" : "Suggested"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: FASE 2 */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
            {language === "es"
              ? "Fase 2: Sensibilidad Clínica & Personalidad"
              : "Phase 2: Clinical Sensitivity & Personality"}
          </span>
          <span className="text-xs text-slate-500">
            {language === "es"
              ? "(Empatía con no verbales, vínculo de apego y perfil Big Five)"
              : "(Non-verbal empathy, attachment security, and Big Five)"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {phase2Batteries.map((battery) => {
            const isSelected = selectedBatteryIds.includes(battery.id);
            const isRecommended = recommendedIds.includes(battery.id);

            return (
              <div
                key={battery.id}
                onClick={() => toggleBattery(battery.id)}
                className={`relative rounded-2xl p-4.5 transition-all duration-200 border flex flex-col justify-between select-none ${
                  isSelected
                    ? "bg-gradient-to-b from-white to-sky-50/30 border-sky-500 ring-2 ring-sky-500/15 shadow-sm shadow-sky-500/5 cursor-pointer hover:border-sky-600"
                    : "bg-white/80 border-slate-200/80 opacity-70 hover:opacity-100 hover:border-slate-300 hover:shadow-2xs cursor-pointer"
                }`}
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-sky-50 text-sky-700 border-sky-200">
                      {language === "es" ? battery.badgeEs : battery.badgeEn}
                    </span>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? "bg-sky-600 border-sky-600 text-white shadow-2xs"
                          : "border-slate-300 bg-white text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug mb-1">
                    {language === "es" ? battery.nameEs : battery.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {language === "es" ? battery.descriptionEs : battery.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 mt-auto flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>
                    {battery.questionCount} {language === "es" ? "preguntas" : "questions"} • ~{battery.estimatedTimeMinutes} min
                  </span>
                  {isRecommended && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-extrabold text-[10px]">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {language === "es" ? "Sugerido" : "Suggested"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
