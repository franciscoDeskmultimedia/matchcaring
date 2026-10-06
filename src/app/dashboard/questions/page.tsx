"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageContext";
import {
  PSYCHOMETRIC_BATTERIES,
  MARLOWE_CROWNE_QUESTIONS,
  BUSS_PERRY_QUESTIONS,
  EMPATHY_DAVIS_QUESTIONS,
  BIG_FIVE_CARE_QUESTIONS,
  ATTACHMENT_ADULT_QUESTIONS,
} from "@/lib/psychometricBatteries";
import { ASSESSMENT_QUESTIONS } from "@/lib/questions";
import { DEFAULT_QUESTION_BANK_GROUPS } from "@/lib/questionBank";
import { QuestionBankItem, User } from "@/lib/types";
import {
  Brain,
  ShieldCheck,
  ShieldAlert,
  HeartHandshake,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  BookOpen,
  Home,
  Baby,
  Eye,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function QuestionsCatalogPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"psychometric" | "household">("psychometric");
  const [selectedBatteryId, setSelectedBatteryId] = useState<string>("sjt_base");

  // User's custom saved questions
  const [savedQuestions, setSavedQuestions] = useState<QuestionBankItem[]>([]);
  const [loadingBank, setLoadingBank] = useState(false);

  // New question form modal/drawer
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [newType, setNewType] = useState<"multiple_choice" | "open_text">("multiple_choice");
  const [newOptions, setNewOptions] = useState<string[]>(["Sí", "No"]);
  const [savingCustom, setSavingCustom] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchSavedBank();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedBank = async () => {
    setLoadingBank(true);
    try {
      const res = await fetch("/api/question-bank");
      if (res.ok) {
        const data = await res.json();
        setSavedQuestions(data.items || []);
      }
    } catch (e) {
      console.error("Error loading custom bank:", e);
    } finally {
      setLoadingBank(false);
    }
  };

  const handleCreateCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    setSavingCustom(true);
    try {
      const filteredOpts = newType === "multiple_choice" ? newOptions.filter((o) => o.trim() !== "") : undefined;
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: newPrompt.trim(),
          promptEs: newPrompt.trim(),
          type: newType,
          options: filteredOpts,
          optionsEs: filteredOpts,
          required: true,
          groupId: "grp_user_saved",
          groupNameEs: "⭐ Mis Preguntas Guardadas",
          groupNameEn: "⭐ My Saved Questions",
        }),
      });

      if (res.ok) {
        toast.success(language === "es" ? "Pregunta agregada a tu banco" : "Question saved to your bank");
        setNewPrompt("");
        setNewOptions(["Sí", "No"]);
        setShowAddCustom(false);
        fetchSavedBank();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error saving question");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save question");
    } finally {
      setSavingCustom(false);
    }
  };

  const handleDeleteSavedQuestion = async (id: string) => {
    try {
      const res = await fetch(`/api/question-bank?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(language === "es" ? "Pregunta eliminada" : "Question deleted");
        setSavedQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  // Get active battery details & sample questions
  const activeBattery = PSYCHOMETRIC_BATTERIES.find((b) => b.id === selectedBatteryId) || PSYCHOMETRIC_BATTERIES[0];

  const getBatteryQuestions = (id: string) => {
    switch (id) {
      case "sjt_base":
        return ASSESSMENT_QUESTIONS;
      case "marlowe_crowne":
        return MARLOWE_CROWNE_QUESTIONS;
      case "buss_perry":
        return BUSS_PERRY_QUESTIONS;
      case "empathy_davis":
        return EMPATHY_DAVIS_QUESTIONS;
      case "big_five_care":
        return BIG_FIVE_CARE_QUESTIONS;
      case "attachment_adult":
        return ATTACHMENT_ADULT_QUESTIONS;
      default:
        return ASSESSMENT_QUESTIONS;
    }
  };

  const sampleQuestions = getBatteryQuestions(selectedBatteryId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Card */}
        <div className="rounded-3xl bg-gradient-to-br from-white via-indigo-50/20 to-sky-50/30 text-slate-900 p-6 sm:p-10 shadow-sm border border-slate-200/90 relative overflow-hidden">
          {/* Subtle top color stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                {language === "es" ? "Centro de Evaluación Científica" : "Scientific Assessment Hub"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {language === "es"
                ? "Banco de Preguntas & Catálogo Psicométrico"
                : "Question Bank & Psychometric Catalog"}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
              {language === "es"
                ? "Dos áreas claramente estructuradas: las baterías psicológicas validadas (seguridad vital, honestidad, contención emocional) y el banco de preguntas particulares para tu hogar (mascotas, rutinas, cocina, permisos)."
                : "Two clearly structured areas: validated psychometric batteries (life safety, honesty, emotion regulation) and household-specific question banks (pets, cooking, schedules, rules)."}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>{language === "es" ? "Crear Nueva Evaluación" : "Create New Assessment"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/test/preview"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span>{language === "es" ? "Ver Vista Previa del Test" : "Preview Candidate Test"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab("psychometric")}
            className={`pb-3.5 px-3 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 -mb-px ${
              activeTab === "psychometric"
                ? "border-indigo-600 text-indigo-700 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>
              {language === "es"
                ? "1. Baterías Psicológicas Estandarizadas"
                : "1. Standardized Psychometric Batteries"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold">
              6 Tests
            </span>
          </button>

          <button
            onClick={() => setActiveTab("household")}
            className={`pb-3.5 px-3 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 -mb-px ${
              activeTab === "household"
                ? "border-sky-600 text-sky-700 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>
              {language === "es"
                ? "2. Banco de Preguntas del Hogar"
                : "2. Household Question Bank"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold">
              {DEFAULT_QUESTION_BANK_GROUPS.reduce((acc, g) => acc + g.questions.length, 0) + savedQuestions.length}
            </span>
          </button>
        </div>

        {/* TAB 1: PSYCHOMETRIC BATTERIES */}
        {activeTab === "psychometric" && (
          <div className="space-y-6">
            {/* Battery Cards Carousel / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PSYCHOMETRIC_BATTERIES.map((battery) => {
                const isSelected = selectedBatteryId === battery.id;
                return (
                  <div
                    key={battery.id}
                    onClick={() => setSelectedBatteryId(battery.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer select-none relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/5"
                        : "bg-white/80 border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            battery.phase === 1
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-sky-50 text-sky-700 border-sky-200"
                          }`}
                        >
                          {language === "es" ? battery.badgeEs : battery.badgeEn}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Fase {battery.phase}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 leading-snug mb-1">
                        {language === "es" ? battery.nameEs : battery.name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3 font-medium">
                        {language === "es" ? battery.descriptionEs : battery.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        {battery.questionCount} {language === "es" ? "preguntas" : "questions"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        ~{battery.estimatedTimeMinutes} min
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Battery Deep Dive Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                      {activeBattery.scientificBasis}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {activeBattery.questionCount} {language === "es" ? "Ítems Científicos" : "Scientific Items"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {language === "es" ? activeBattery.nameEs : activeBattery.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1">
                    {language === "es" ? activeBattery.descriptionEs : activeBattery.description}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 space-y-1 shrink-0">
                  <span className="font-bold block text-indigo-900">
                    {language === "es" ? "🎯 Recomendación de Calibración:" : "🎯 Calibration Target:"}
                  </span>
                  <p className="text-[11px] text-indigo-800">
                    {language === "es"
                      ? activeBattery.targetRecommendationEs
                      : activeBattery.targetRecommendationEn}
                  </p>
                </div>
              </div>

              {/* Sample Questions Accordion / List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {language === "es" ? "Muestra de Reactivos y Escenarios" : "Sample Items & Scoring"}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {sampleQuestions.length} {language === "es" ? "preguntas en esta batería" : "questions in this battery"}
                  </span>
                </div>

                <div className="space-y-3">
                  {sampleQuestions.slice(0, 5).map((q, idx) => {
                    const qPrompt = language === "es" && q.questionEs ? q.questionEs : q.question;
                    const insight = language === "es" && q.psychologicalInsightEs ? q.psychologicalInsightEs : q.psychologicalInsight;

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            {qPrompt}
                          </span>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7 pt-1">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                opt.score === 10
                                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-950 font-medium"
                                  : opt.isRedFlag
                                  ? "bg-rose-50/80 border-rose-200 text-rose-950"
                                  : "bg-white border-slate-200 text-slate-700"
                              }`}
                            >
                              <span>{language === "es" && opt.textEs ? opt.textEs : opt.text}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-2 ${
                                  opt.score === 10
                                    ? "bg-emerald-200 text-emerald-900"
                                    : opt.isRedFlag
                                    ? "bg-rose-200 text-rose-900"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {opt.score}/10
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Clinical Insight */}
                        {insight && (
                          <div className="pl-7 pt-1 flex items-start gap-1.5 text-[11px] text-slate-500">
                            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>{insight}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOUSEHOLD QUESTION BANK */}
        {activeTab === "household" && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  {language === "es" ? "Banco de Preguntas Específicas del Hogar" : "Household-Specific Question Bank"}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === "es"
                    ? "Selecciona o crea preguntas para incluir en tus campañas (mascotas, natación, dietas, viajes)."
                    : "Select or create custom questions to append to your campaigns (pets, swimming, diets, travel)."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCustom(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "es" ? "Crear Nueva Pregunta" : "Create New Question"}</span>
              </button>
            </div>

            {/* Quick Add Custom Question Form (if opened) */}
            {showAddCustom && (
              <form
                onSubmit={handleCreateCustomQuestion}
                className="p-5 rounded-2xl bg-white border-2 border-indigo-500 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900">
                    {language === "es" ? "Nueva Pregunta para tu Banco Personal" : "New Question for Your Personal Bank"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {language === "es" ? "Cancelar" : "Cancel"}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === "es" ? "Enunciado de la Pregunta *" : "Question Text *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder={
                      language === "es"
                        ? "¿Cuenta con experiencia administrando medicamentos o nebulizaciones a niños?"
                        : "Do you have experience administering asthma medications or nebulizers to children?"
                    }
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {language === "es" ? "Tipo de Respuesta" : "Answer Type"}
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="multiple_choice">
                        {language === "es" ? "Opción Múltiple" : "Multiple Choice"}
                      </option>
                      <option value="open_text">
                        {language === "es" ? "Texto Libre / Descriptivo" : "Open Text"}
                      </option>
                    </select>
                  </div>

                  {newType === "multiple_choice" && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {language === "es" ? "Opciones de Selección" : "Choice Options"}
                      </label>
                      <div className="flex gap-2">
                        {newOptions.map((opt, i) => (
                          <input
                            key={i}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...newOptions];
                              updated[i] = e.target.value;
                              setNewOptions(updated);
                            }}
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingCustom}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingCustom
                      ? language === "es"
                        ? "Guardando..."
                        : "Saving..."
                      : language === "es"
                      ? "Guardar en mi Banco"
                      : "Save to My Bank"}
                  </button>
                </div>
              </form>
            )}

            {/* User Saved Questions Section (if any) */}
            {savedQuestions.length > 0 && (
              <div className="bg-white rounded-3xl border border-indigo-200/80 shadow-xs p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-indigo-50 pb-3">
                  <span className="text-base">⭐</span>
                  <h3 className="text-sm font-black text-slate-900">
                    {language === "es" ? "Mis Preguntas Guardadas Personalizadas" : "My Custom Saved Questions"}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {savedQuestions.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedQuestions.map((sq) => (
                    <div
                      key={sq.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                          {sq.type === "multiple_choice"
                            ? language === "es"
                              ? "Opción Múltiple"
                              : "Multiple Choice"
                            : language === "es"
                            ? "Texto Abierto"
                            : "Open Text"}
                        </span>
                        <p className="text-xs font-bold text-slate-900 leading-snug">
                          {language === "es" && sq.promptEs ? sq.promptEs : sq.prompt}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSavedQuestion(sq.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title={language === "es" ? "Eliminar de mi banco" : "Delete from bank"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Curated Groups */}
            <div className="space-y-5">
              {DEFAULT_QUESTION_BANK_GROUPS.map((grp) => (
                <div
                  key={grp.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        {language === "es" ? grp.nameEs : grp.nameEn}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {language === "es" ? grp.descriptionEs : grp.descriptionEn}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {grp.questions.length} {language === "es" ? "preguntas" : "questions"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {grp.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Pregunta #{idx + 1}</span>
                          <span className="text-slate-500">
                            {q.type === "multiple_choice"
                              ? language === "es"
                                ? "Opción Múltiple"
                                : "Multiple Choice"
                              : language === "es"
                              ? "Texto Abierto"
                              : "Open Text"}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 leading-snug">
                          {language === "es" && q.promptEs ? q.promptEs : q.prompt}
                        </p>
                        {q.options && q.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {q.options.map((opt, oIdx) => (
                              <span
                                key={oIdx}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
