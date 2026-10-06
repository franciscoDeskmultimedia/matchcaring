"use client";

import React from "react";
import { PsychometricReport } from "@/lib/types";
import { useLanguage } from "./LanguageContext";
import {
  Brain,
  ShieldCheck,
  ShieldAlert,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Activity,
  Award,
  Layers,
  Smile,
} from "lucide-react";

interface PsychometricReportCardProps {
  report?: PsychometricReport;
}

export default function PsychometricReportCard({ report }: PsychometricReportCardProps) {
  const { language } = useLanguage();

  if (!report) return null;

  const {
    honestyScore,
    angerControlScore,
    empathyScore,
    bigFiveProfile,
    attachmentProfile,
  } = report;

  // Don't render if none of the optional psychometric tests were taken
  if (
    !honestyScore &&
    !angerControlScore &&
    !empathyScore &&
    !bigFiveProfile &&
    !attachmentProfile
  ) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 overflow-hidden relative">
      {/* Subtle top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/60 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {language === "es"
                  ? "Diagnóstico Psicométrico y Perfil Clínico"
                  : "Psychometric Diagnosis & Clinical Profile"}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                {language === "es" ? "Científico IPIP" : "Scientific IPIP"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {language === "es"
                ? "Evaluación estandarizada de veracidad, control de impulsos, empatía y personalidad para cuidadores."
                : "Standardized clinical assessment of honesty, impulse control, empathy, and caregiving personality."}
            </p>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {language === "es"
            ? "Sin sesgos algorítmicos • Escalas Validadas"
            : "No AI Bias • Open Validated Scales"}
        </div>
      </div>

      {/* Grid of Psychometric Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Sinceridad y Deseabilidad Social (Marlowe-Crowne) */}
        {honestyScore && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/90 space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                  {language === "es" ? "Escala SDS-8 Marlowe-Crowne" : "SDS-8 Marlowe-Crowne Scale"}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === "es"
                    ? "Índice de Sinceridad y Autenticidad"
                    : "Honesty & Authenticity Index"}
                </h3>
              </div>

              <div
                className={`text-right px-2.5 py-1 rounded-xl text-xs font-black border ${
                  honestyScore.rating.includes("Alta")
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : honestyScore.rating.includes("Moderada")
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                <div className="text-sm font-black">{honestyScore.indexPercent}%</div>
                <div className="text-[10px] font-semibold">
                  {language === "es" ? honestyScore.rating : honestyScore.ratingEn}
                </div>
              </div>
            </div>

            {/* Meter Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  honestyScore.indexPercent >= 80
                    ? "bg-emerald-500"
                    : honestyScore.indexPercent >= 60
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${honestyScore.indexPercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {language === "es" ? honestyScore.explanationEs : honestyScore.explanationEn}
            </p>
          </div>
        )}

        {/* 2. Control de Ira y Frustración (Buss-Perry) */}
        {angerControlScore && (
          <div
            className={`p-5 rounded-2xl border space-y-3.5 ${
              angerControlScore.criticalAlert
                ? "bg-rose-50/70 border-rose-300"
                : "bg-gradient-to-br from-slate-50 to-emerald-50/30 border-slate-200/90"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    angerControlScore.criticalAlert ? "text-rose-600" : "text-emerald-700"
                  }`}
                >
                  {language === "es" ? "Buss-Perry (BPAQ-SF) & BIS-11" : "Buss-Perry & BIS-11"}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === "es"
                    ? "Control de Ira, Frustración y Contención"
                    : "Anger, Frustration & Impulse Control"}
                </h3>
              </div>

              <div
                className={`text-right px-2.5 py-1 rounded-xl text-xs font-black border ${
                  angerControlScore.criticalAlert
                    ? "bg-rose-100 text-rose-900 border-rose-300 animate-pulse"
                    : angerControlScore.riskLevel.includes("Bajo")
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                <div className="text-sm font-black">{angerControlScore.controlPercent}%</div>
                <div className="text-[10px] font-semibold">
                  {language === "es"
                    ? angerControlScore.riskLevel
                    : angerControlScore.riskLevelEn}
                </div>
              </div>
            </div>

            {/* Meter Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  angerControlScore.criticalAlert
                    ? "bg-rose-600"
                    : angerControlScore.controlPercent >= 80
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${angerControlScore.controlPercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {language === "es"
                ? angerControlScore.explanationEs
                : angerControlScore.explanationEn}
            </p>
          </div>
        )}

        {/* 3. Empatía y Señales No Verbales (Davis IRI) */}
        {empathyScore && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/30 border border-slate-200/90 space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600">
                  {language === "es" ? "Davis IRI & Wong-Law" : "Davis IRI & Wong-Law"}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === "es"
                    ? "Empatía y Decodificación No Verbal"
                    : "Empathy & Non-Verbal Decoding"}
                </h3>
              </div>

              <div className="text-right px-2.5 py-1 rounded-xl text-xs font-black bg-sky-50 text-sky-800 border border-sky-200">
                <div className="text-sm font-black">{empathyScore.empathyPercent}%</div>
                <div className="text-[10px] font-semibold">
                  {empathyScore.nonVerbalSensitivity}
                </div>
              </div>
            </div>

            {/* Sub-breakdown: Perspective Taking */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>{language === "es" ? "Toma de Perspectiva Cognitiva" : "Perspective Taking"}</span>
                <span className="text-sky-700">{empathyScore.perspectiveTakingPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${empathyScore.perspectiveTakingPercent}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {empathyScore.explanationEs}
            </p>
          </div>
        )}

        {/* 4. Estilo de Apego y Vínculo Emocional (AAS) */}
        {attachmentProfile && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-pink-50/30 border border-slate-200/90 space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
                  {language === "es" ? "Adult Attachment Scale (AAS)" : "Adult Attachment Scale (AAS)"}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === "es"
                    ? "Estilo de Apego y Modelo Vincular"
                    : "Attachment Style & Bonding"}
                </h3>
              </div>

              <div className="text-right px-2.5 py-1 rounded-xl text-xs font-black bg-pink-50 text-pink-800 border border-pink-200">
                <div className="text-sm font-black">{attachmentProfile.confidencePercent}%</div>
                <div className="text-[10px] font-semibold">
                  {language === "es" ? attachmentProfile.style : attachmentProfile.styleEn}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-pink-100 text-xs text-pink-950 font-medium">
              <HeartHandshake className="w-4 h-4 text-pink-600 shrink-0" />
              <span>
                {language === "es"
                  ? "Capacidad probada para brindar base segura y confort afectivo sin sobreapego."
                  : "Demonstrated capacity to provide a secure base and warmth without anxious clinginess."}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {attachmentProfile.explanationEs}
            </p>
          </div>
        )}
      </div>

      {/* 5. Big Five Caregiver Personality Profile (Full Width Radar / Bars) */}
      {bigFiveProfile && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-slate-50 to-indigo-50/30 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                {language === "es" ? "Inventario IPIP Big Five" : "IPIP Big Five Inventory"}
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">
                {language === "es"
                  ? "Dimensiones de Personalidad en el Cuidado del Hogar"
                  : "Personality Dimensions for Domestic Caregiving"}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {language === "es" ? "Percentil Nacional 90+" : "National 90+ Percentile"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                {language === "es" ? "Responsabilidad" : "Conscientiousness"}
              </div>
              <div className="text-lg font-black text-slate-900">{bigFiveProfile.conscientiousness}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${bigFiveProfile.conscientiousness}%` }} />
              </div>
              <div className="text-[9px] text-slate-500 pt-0.5">Rigor en medicinas y horarios</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                {language === "es" ? "Calidez y Afabilidad" : "Agreeableness"}
              </div>
              <div className="text-lg font-black text-slate-900">{bigFiveProfile.agreeableness}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${bigFiveProfile.agreeableness}%` }} />
              </div>
              <div className="text-[9px] text-slate-500 pt-0.5">Tono positivo y afectuoso</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                {language === "es" ? "Estabilidad Emocional" : "Emotional Stability"}
              </div>
              <div className="text-lg font-black text-slate-900">{bigFiveProfile.emotionalStability}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: `${bigFiveProfile.emotionalStability}%` }} />
              </div>
              <div className="text-[9px] text-slate-500 pt-0.5">Serenidad bajo tensión</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                {language === "es" ? "Energía y Dinamismo" : "Energy & Vitality"}
              </div>
              <div className="text-lg font-black text-slate-900">{bigFiveProfile.energy}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full" style={{ width: `${bigFiveProfile.energy}%` }} />
              </div>
              <div className="text-[9px] text-slate-500 pt-0.5">Juego activo y estimulación</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                {language === "es" ? "Adaptabilidad" : "Adaptability"}
              </div>
              <div className="text-lg font-black text-slate-900">{bigFiveProfile.adaptability}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${bigFiveProfile.adaptability}%` }} />
              </div>
              <div className="text-[9px] text-slate-500 pt-0.5">Flexibilidad ante cambios</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
