"use client";

import { useState } from "react";
import { CareCategory, Child, CustomQuestion, ParentCampaign } from "@/lib/types";
import { useLanguage } from "./LanguageContext";
import QuestionBankModal from "./QuestionBankModal";
import {
  Activity,
  Baby,
  BookmarkCheck,
  Brain,
  Calendar,
  Check,
  Clock,
  DollarSign,
  HeartHandshake,
  HelpCircle,
  Layers,
  Pill,
  Plus,
  Sparkles,
  Users2,
  X,
} from "lucide-react";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
  onCampaignCreated: (campaign: ParentCampaign) => void;
}

export default function CreateCampaignModal({
  isOpen,
  onClose,
  childrenList,
  onCampaignCreated,
}: CreateCampaignModalProps) {
  const { language } = useLanguage();

  const [careCategory, setCareCategory] = useState<CareCategory>("childcare");
  const [title, setTitle] = useState("");
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>(
    childrenList.map((c) => c.id)
  );
  const [scheduleType, setScheduleType] = useState<
    "full_time" | "part_time" | "weekends" | "occasional"
  >("full_time");
  const [expectedHourlyRate, setExpectedHourlyRate] = useState("");
  const [startDate, setStartDate] = useState(
    language === "es" ? "Inmediato" : "Immediate"
  );
  const [notes, setNotes] = useState("");
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const toggleChild = (id: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((cId) => cId !== id)
          : prev
        : [...prev, id]
    );
  };

  const handleAddBankQuestions = (qs: CustomQuestion[]) => {
    setCustomQuestions((prev) => [...prev, ...qs]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg(
        language === "es"
          ? "Ingresa un nombre para la campaña"
          : "Please enter a campaign title"
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const targetKids = childrenList.filter((k) =>
        selectedChildIds.includes(k.id)
      );

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          careCategory,
          targetChildren: targetKids,
          scheduleType,
          expectedHourlyRate: expectedHourlyRate.trim(),
          startDate: startDate.trim(),
          notes: notes.trim(),
          customQuestions,
          active: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onCampaignCreated(data.campaign);
        onClose();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to create campaign");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-indigo-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {language === "es"
                    ? "Crear Nueva Campaña de Selección"
                    : "Create New Screening Campaign"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "es"
                    ? "Configura la búsqueda específica para tus hijos, horario y preguntas clave."
                    : "Configure a targeted search for your children, schedule, and key questions."}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
          >
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Care Domain Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {language === "es" ? "1. Selecciona el Tipo de Cuidado *" : "1. Select Care Type / Focus *"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setCareCategory("childcare");
                    if (!title || title.includes("Adulto") || title.includes("Discapacidad")) {
                      setTitle(language === "es" ? "Cuidado Infantil / Niñera" : "Childcare / Nanny");
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    careCategory === "childcare"
                      ? "bg-sky-50/90 border-sky-500 ring-2 ring-sky-500/20 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👶</span>
                    <span className="text-xs font-black text-slate-900">
                      {language === "es" ? "Cuidado Infantil" : "Childcare"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === "es" ? "Bebés, niños pequeños y escolares" : "Infants, toddlers & school kids"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCareCategory("elderly_care");
                    if (!title || title.includes("Infantil") || title.includes("Discapacidad")) {
                      setTitle(language === "es" ? "Cuidado y Acompañamiento Adulto Mayor" : "Elderly Care & Assistance");
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    careCategory === "elderly_care"
                      ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👵</span>
                    <span className="text-xs font-black text-slate-900">
                      {language === "es" ? "Adulto Mayor" : "Elderly Care"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === "es" ? "Gerontología, medicinas y movilidad" : "Medication, mobility & companionship"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCareCategory("disability_care");
                    if (!title || title.includes("Infantil") || title.includes("Adulto")) {
                      setTitle(language === "es" ? "Apoyo en Discapacidad y Neurodiversidad" : "Disability & Neurodiversity Support");
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    careCategory === "disability_care"
                      ? "bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/20 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">♿</span>
                    <span className="text-xs font-black text-slate-900">
                      {language === "es" ? "Discapacidad" : "Special Needs"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === "es" ? "Autonomía, TEA, apoyos adaptados" : "Autism, therapy support & mobility"}
                  </p>
                </button>
              </div>
            </div>

            {/* Campaign Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {language === "es" ? "2. Título de la Campaña *" : "2. Campaign Title *"}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  careCategory === "elderly_care"
                    ? language === "es"
                      ? "Ej: Cuidadora Geriátrica para Abuela Carmen (Turno Día)"
                      : "E.g.: Senior Caregiver for Grandma Carmen (Day Shift)"
                    : careCategory === "disability_care"
                    ? language === "es"
                      ? "Ej: Asistente Terapéutico y Apoyo para Lucas (TEA Grado 2)"
                      : "E.g.: Support Assistant for Lucas (Autism Spectrum)"
                    : language === "es"
                    ? "Ej: Niñera para Sofía (Tardes y Salidas al Parque)"
                    : "E.g.: Nanny for Sofia (Afternoons & Outings)"
                }
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Target Children */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {language === "es"
                  ? "¿Para qué hijo(s) es esta campaña? *"
                  : "Which child(ren) is this campaign for? *"}
              </label>
              <div className="flex flex-wrap gap-2">
                {childrenList.map((kid) => {
                  const isSelected = selectedChildIds.includes(kid.id);
                  return (
                    <button
                      key={kid.id}
                      type="button"
                      onClick={() => toggleChild(kid.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                        isSelected
                          ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Baby className="w-3.5 h-3.5" />
                      <span>
                        {kid.name} ({kid.age} {language === "es" ? "años" : "yrs"})
                      </span>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule & Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {language === "es" ? "Tipo de Horario" : "Schedule Type"}
                </label>
                <select
                  value={scheduleType}
                  onChange={(e) =>
                    setScheduleType(
                      e.target.value as
                        | "full_time"
                        | "part_time"
                        | "weekends"
                        | "occasional"
                    )
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="full_time">
                    {language === "es" ? "Tiempo Completo (40h+)" : "Full Time (40h+)"}
                  </option>
                  <option value="part_time">
                    {language === "es" ? "Medio Tiempo (20-30h)" : "Part Time (20-30h)"}
                  </option>
                  <option value="weekends">
                    {language === "es" ? "Fines de Semana" : "Weekends"}
                  </option>
                  <option value="occasional">
                    {language === "es" ? "Ocasional / Por Horas" : "Occasional / Hourly"}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {language === "es"
                    ? "Rango o Tarifa por Hora (Opcional)"
                    : "Hourly Rate / Range (Optional)"}
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={expectedHourlyRate}
                    onChange={(e) => setExpectedHourlyRate(e.target.value)}
                    placeholder={language === "es" ? "$15 - $20 / hora" : "$15 - $20 / hr"}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Start Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {language === "es" ? "Fecha de Inicio Esperada" : "Target Start Date"}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder={language === "es" ? "Ej: Inmediato, o 1 de Nov" : "E.g.: Immediate, Nov 1"}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {language === "es"
                    ? "Notas o Requisitos Especiales"
                    : "Notes / Special Preferences"}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    language === "es"
                      ? "Ej: Cero pantallas, gusto por paseos"
                      : "E.g.: No screens, loves outdoor play"
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Custom Questions Section with Question Bank Picker */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span>
                      {language === "es"
                        ? "Preguntas Personalizadas de la Campaña"
                        : "Custom Campaign Questions"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                      {customQuestions.length}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {language === "es"
                      ? "Se incluirán en el test psicológico para evaluar aspectos de tu familia."
                      : "Will be added to the assessment to evaluate family-specific fit."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQuestionBankOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {language === "es"
                      ? "+ Banco de Preguntas"
                      : "+ Question Bank"}
                  </span>
                </button>
              </div>

              {customQuestions.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {customQuestions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          {q.prompt}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCustomQuestions((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-white/70 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-medium">
                    {language === "es"
                      ? "Opcional: Añade preguntas de logística, disciplina o alergias con 1 clic."
                      : "Optional: Add logistics, discipline, or allergy questions with 1 click."}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {language === "es" ? "Cancelar" : "Cancel"}
              </button>

              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shadow-md shadow-sky-600/20 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {submitting
                    ? language === "es"
                      ? "Creando Campaña..."
                      : "Creating Campaign..."
                    : language === "es"
                    ? "Crear Campaña"
                    : "Create Campaign"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Question Bank Modal */}
      <QuestionBankModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        onAddQuestions={handleAddBankQuestions}
        initialCategory={careCategory}
      />
    </>
  );
}
