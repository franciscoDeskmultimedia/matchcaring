"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageContext";
import { User } from "@/lib/types";
import BrandLogo from "./BrandLogo";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Baby,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  FileText,
  Heart,
  HeartHandshake,
  Lock,
  MessagesSquare,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

interface HomeClientProps {
  user: User | null;
}

export default function HomeClient({ user }: HomeClientProps) {
  const { t, language } = useLanguage();

  // Interactive Live Scorecard Simulator State
  const [activeDemoTab, setActiveDemoTab] = useState<
    "score" | "dimensions" | "redflags" | "interview"
  >("score");

  // Interactive FAQ State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  const faqItems = [
    {
      qEs: "¿Cómo previene el sistema que la candidata elija 'lo que suena bien'?",
      qEn: "How does the system prevent candidates from just guessing the 'right' answer?",
      aEs: "Nuestros reactivos de juicio situacional presentan dilemas donde todas las opciones parecen válidas o donde la opción correcta exige disciplina no intuitiva (como no darle agua a un bebé menor de 6 meses o no acostar a un anciano tras un golpe de cabeza). Además, barajamos aleatoriamente las opciones en cada test para eliminar sesgos de patrón.",
      aEn: "Our situational judgment scenarios place candidates into dilemmas where multiple options appear valid or where the correct medical response is counter-intuitive (such as never giving water to an infant under 6 months or monitoring head trauma protocols). Furthermore, answer orders are dynamically randomized to eliminate pattern guessing.",
    },
    {
      qEs: "¿Puedo usarlo para cuidar adultos mayores o solo niños?",
      qEn: "Can I use this for elder care or only children?",
      aEs: "Está 100% calibrado para las 3 ramas críticas: Cuidado Infantil, Adulto Mayor y Discapacidad / Neurodiversidad. Al crear tu campaña, seleccionas la especialidad y el sistema carga la batería de preguntas científicamente formulada para ese perfil específico.",
      aEn: "It is fully calibrated for all 3 critical care paths: Childcare, Elder Care, and Disability / Neurodiversity. When you create a campaign, you select the specialty and the engine loads the scientifically vetted question battery for that exact profile.",
    },
    {
      qEs: "¿Puedo agregar mis propias preguntas sobre las reglas de mi casa?",
      qEn: "Can I add my own questions regarding household rules?",
      aEs: "¡Sí! Puedes usar nuestro Banco de Preguntas Curado o redactar tus propias preguntas de opción múltiple y texto abierto (ej. si tienes mascotas, restricciones de uso de auto, o horarios especiales).",
      aEn: "Yes! You can choose from our Curated Question Bank or write custom multiple choice and open-text questions (e.g. dealing with pets, driving rules, or specific schedule needs).",
    },
    {
      qEs: "¿La candidata necesita descargar alguna app o pagar algo?",
      qEn: "Does the candidate need to install an app or pay anything?",
      aEs: "Absolutamente no. La postulante recibe un enlace directo por WhatsApp o correo que abre en el navegador de cualquier teléfono móvil, responde en aproximadamente 12 minutos y tú recibes su diagnóstico inmediatamente.",
      aEn: "Not at all. The applicant receives a direct link via WhatsApp or email that opens in any mobile browser, takes roughly 12 minutes to complete, and you receive their scorecard instantly.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Ambient Lighting Mesh (Multi-layer radial glows for glassmorphic refraction) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-100px] left-[15%] w-[520px] h-[520px] rounded-full bg-sky-400/15 blur-[120px]" />
        <div className="absolute top-[80px] right-[15%] w-[480px] h-[480px] rounded-full bg-indigo-500/10 blur-[130px]" />
        <div className="absolute top-[280px] left-[40%] w-[380px] h-[380px] rounded-full bg-teal-400/10 blur-[110px]" />
      </div>

      {/* Modern Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/70 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <BrandLogo href="/" />
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-[11px] font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {language === "es"
                  ? "Diagnóstico Psicométrico & Seguridad Vital"
                  : "Clinical Psychometrics & Life Safety"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-sky-600/25 transition-all active:scale-95"
              >
                <span>{t.openDashboard}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  {t.signIn}
                </Link>
                <Link
                  href="/login?tab=register"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-sky-600/25 transition-all active:scale-95"
                >
                  <span>{t.getStarted}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
            {/* Hero Copy */}
            <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-sky-200/90 shadow-xs backdrop-blur-md text-sky-900 text-xs font-bold"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600" />
                </span>
                <span>{t.heroTag}</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]"
              >
                {language === "es" ? (
                  <>
                    Contrata con Confianza Absoluta:{" "}
                    <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                      Diagnostica la Psicología, Seguridad y Ética de tus Cuidadores
                    </span>{" "}
                    Antes de Abrirles tu Hogar.
                  </>
                ) : (
                  <>
                    Hire with Total Confidence:{" "}
                    <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                      Diagnose Caregiver Psyche, Safety & Ethics
                    </span>{" "}
                    Before They Enter Your Home.
                  </>
                )}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal"
              >
                {t.heroDesc}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
              >
                <Link
                  href={user ? "/dashboard" : "/login?tab=register"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>{user ? t.openDashboard : t.tryDemo}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#scorecard-demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200/90 font-bold text-sm shadow-sm backdrop-blur-md transition-all hover:border-slate-300 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>
                    {language === "es"
                      ? "Ver Simulación Interactiva"
                      : "Explore Interactive Demo"}
                  </span>
                </a>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-500 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.aapProtocol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-sky-600" />
                  <span>{t.emotionalRegulation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessagesSquare className="w-4 h-4 text-indigo-600" />
                  <span>{t.inPersonProbes}</span>
                </div>
              </motion.div>
            </div>

            {/* HERO CENTERPIECE: Interactive Live Scorecard Simulator */}
            <motion.div
              id="scorecard-demo"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="max-w-4xl mx-auto rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-200/60 overflow-hidden"
            >
              {/* Simulator Header / Candidate Profile Bar */}
              <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-sky-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
                    CM
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Camila Morales
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {language === "es" ? "Test Completado" : "Evaluated"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {language === "es"
                        ? "Postulante a Cuidadora Infantil &bull; 6 años de exp. &bull; RCP Vigente"
                        : "Applicant for Childcare Specialist &bull; 6 yrs exp. &bull; CPR Valid"}
                    </p>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                      {language === "es" ? "Puntaje Global" : "Overall Score"}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-sky-600">
                      96 <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-extrabold text-xs shadow-md shadow-sky-600/20">
                    {language === "es" ? "Sobresaliente" : "Outstanding"}
                  </div>
                </div>
              </div>

              {/* Simulator Tabs */}
              <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50 p-1.5 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setActiveDemoTab("score")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeDemoTab === "score"
                      ? "bg-white text-sky-700 shadow-xs border border-slate-200/80 font-black"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Target className="w-4 h-4 text-sky-600" />
                  <span>{language === "es" ? "Diagnóstico Clínico" : "Clinical Diagnosis"}</span>
                </button>

                <button
                  onClick={() => setActiveDemoTab("dimensions")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeDemoTab === "dimensions"
                      ? "bg-white text-sky-700 shadow-xs border border-slate-200/80 font-black"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>{language === "es" ? "Desglose 6 Dimensiones" : "6 Dimensions Breakdown"}</span>
                </button>

                <button
                  onClick={() => setActiveDemoTab("redflags")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeDemoTab === "redflags"
                      ? "bg-white text-rose-700 shadow-xs border border-slate-200/80 font-black"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>{language === "es" ? "Auditoría de Banderas Rojas" : "Red Flag Audit"}</span>
                </button>

                <button
                  onClick={() => setActiveDemoTab("interview")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeDemoTab === "interview"
                      ? "bg-white text-emerald-700 shadow-xs border border-slate-200/80 font-black"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{language === "es" ? "Guía para Entrevista" : "Interview Guide"}</span>
                </button>
              </div>

              {/* Simulator Tab Content */}
              <div className="p-6 sm:p-8 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {activeDemoTab === "score" && (
                    <motion.div
                      key="tab-score"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
                    >
                      {/* Left: Animated Circular Gauge Simulation */}
                      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-sky-50/70 to-indigo-50/40 border border-sky-100 text-center">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              className="stroke-slate-200/80"
                              strokeWidth="8"
                              fill="transparent"
                            />
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="url(#heroScoreGrad)"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={2 * Math.PI * 40}
                              strokeDashoffset={2 * Math.PI * 40 * (1 - 0.96)}
                              strokeLinecap="round"
                              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - 0.96) }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                            <defs>
                              <linearGradient id="heroScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="100%" stopColor="#6366f1" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">96</span>
                            <span className="text-[10px] font-bold text-sky-600 uppercase">Sobresaliente</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 mt-2">
                          {language === "es" ? "Apta para Cuidado Infantil" : "Approved for Childcare"}
                        </span>
                      </div>

                      {/* Right: Clinical Assessment Summary */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700">
                            {language === "es" ? "Dictamen Psicométrico" : "Psychometric Consensus"}
                          </span>
                          <h4 className="text-base font-black text-slate-900">
                            {language === "es"
                              ? "Excelente regulación emocional y reflejos ante asfixia (AAP)"
                              : "High emotional stability and fast airway obstruction response"}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {language === "es"
                              ? "Camila demostró consistencia óptima al resolver rabietas sin recurrir a la intimidación ni al soborno. En escenarios de atragantamiento actuó conforme al protocolo de palmadas en la espalda / Heimlich sin dudar."
                              : "Camila exhibited optimal non-punitive tantrum de-escalation without yielding or bribing. In airway emergencies she immediately followed AAP back-blow / Heimlich procedures."}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                            <span className="font-bold text-slate-800 block">
                              {language === "es" ? "Prevención de Asfixia" : "Choking Safety"}
                            </span>
                            <span className="text-emerald-600 font-extrabold text-[11px]">
                              100% Protocolo Correcto
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                            <span className="font-bold text-slate-800 block">
                              {language === "es" ? "Uso de Pantallas" : "Screen Time"}
                            </span>
                            <span className="text-sky-600 font-extrabold text-[11px]">
                              100% Cero Distracción
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeDemoTab === "dimensions" && (
                    <motion.div
                      key="tab-dimensions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3.5"
                    >
                      {[
                        { name: "Regulación Emocional & Paciencia", score: 98, color: "from-sky-500 to-sky-600" },
                        { name: "Seguridad Crítica & Primeros Auxilios (AAP)", score: 95, color: "from-emerald-500 to-emerald-600" },
                        { name: "Juicio Situacional en Emergencias", score: 96, color: "from-indigo-500 to-indigo-600" },
                        { name: "Conducta, Pedagogía & Límites No Violentos", score: 92, color: "from-amber-500 to-amber-600" },
                        { name: "Ética, Privacidad & Cero Celular", score: 100, color: "from-purple-500 to-purple-600" },
                        { name: "Consistencia & Detección de Deshonestidad", score: 95, color: "from-teal-500 to-teal-600" },
                      ].map((dim, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-800">{dim.name}</span>
                            <span className="text-slate-900 font-black">{dim.score}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full bg-gradient-to-r ${dim.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${dim.score}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.08 }}
                            />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeDemoTab === "redflags" && (
                    <motion.div
                      key="tab-redflags"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 text-xs">
                          <h5 className="font-extrabold text-emerald-900">
                            {language === "es"
                              ? "Cero Banderas Rojas Críticas Detectadas"
                              : "Zero Critical Red Flags Detected"}
                          </h5>
                          <p className="text-emerald-700">
                            {language === "es"
                              ? "La candidata no mostró tolerancia al castigo físico, descuidos en agua ni encubrimiento de accidentes."
                              : "The applicant showed zero tolerance for physical punishment, water supervision lapses, or accident concealment."}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-sky-50/90 border border-sky-200/80 flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 text-xs">
                          <h5 className="font-extrabold text-sky-900">
                            {language === "es"
                              ? "Nota Preventiva Sugerida"
                              : "Suggested Safety Note"}
                          </h5>
                          <p className="text-sky-700">
                            {language === "es"
                              ? "En preguntas sobre caídas leves, prefiere reportar de inmediato vía WhatsApp con foto. Se recomienda coordinar un botiquín de primeros auxilios visible en el hogar."
                              : "Applicant prefers instant WhatsApp photo alerts for minor scrapes. Recommend agreeing on the home first aid kit location."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeDemoTab === "interview" && (
                    <motion.div
                      key="tab-interview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                          {language === "es" ? "Pregunta de Entrevista 1" : "Interview Probe 1"}
                        </span>
                        <p className="text-xs font-bold text-slate-900">
                          {language === "es"
                            ? "«Notamos que tienes excelente instinto de seguridad ante asfixia. Si el niño empieza a toser con fuerza comiendo, ¿cuál es el error más común que jamás cometerías?»"
                            : "«We noticed your strong choking reflexes. If a toddler coughs forcefully while eating, what common mistake would you avoid?»"}
                        </p>
                        <p className="text-[11px] text-slate-500 italic">
                          {language === "es"
                            ? "Objetivo: Confirmar que sabe que no debe meter el dedo a ciegas en la garganta si el niño puede toser activamente."
                            : "Goal: Verify she knows never to perform a blind finger sweep when the child is coughing effectively."}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                          {language === "es" ? "Pregunta de Entrevista 2" : "Interview Probe 2"}
                        </span>
                        <p className="text-xs font-bold text-slate-900">
                          {language === "es"
                            ? "«Si el niño insiste en hacer un berrinche en la calle porque no compras un dulce, ¿cómo mantienes la calma sin ceder a la rabieta?»"
                            : "«If the child throws a street tantrum over candy, how do you keep calm without giving in to the demand?»"}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card Footer reassurance */}
              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  {language === "es"
                    ? "Respuestas encriptadas y protegidas bajo estricta confidencialidad médica"
                    : "Encrypted candidate submissions under strict medical privacy"}
                </span>
                <span className="font-bold text-sky-600">
                  {language === "es" ? "Generado automáticamente por MatchCaring Bio" : "Generated by MatchCaring Bio Engine"}
                </span>
              </div>
            </motion.div>

            {/* ASYMMETRIC BENTO GRID: The 3 Specialized Care Pillars + Anti-Bias Engine */}
            <div className="pt-12 sm:pt-16 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700 bg-sky-100/70 border border-sky-200 px-3 py-1 rounded-full">
                  {language === "es" ? "Cobertura Multidisciplinaria" : "Multi-Disciplinary Care"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {language === "es"
                    ? "Evaluación Adaptada a Cada Etapa y Necesidad"
                    : "Tailored Screening for Every Stage & Need"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {language === "es"
                    ? "Baterías de pruebas científicamente diferenciadas con preguntas de juicio situacional para cada perfil de cuidado."
                    : "Differentiated scenario assessments engineered specifically for each distinct care category."}
                </p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Bento Card 1: Childcare (Prominent 2-col on large screens) */}
                <div className="lg:col-span-2 p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-white via-white to-sky-50/40 border border-sky-200/70 shadow-lg shadow-sky-500/5 space-y-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-inner">
                        <Baby className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">
                          {language === "es" ? "Pilar Pediátrico" : "Pediatric Pillar"}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                          {language === "es" ? "Cuidado Infantil & Niñeras (0 a 12 años)" : "Childcare & Nannies (Ages 0-12)"}
                        </h3>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold">
                      Protocolo AAP
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {language === "es"
                      ? "Evalúa la tolerancia a berrinches intensos, límites respetuosos sin amenazas ni violencia, reflejos vitales ante asfixia (corte seguro de uvas y alimentos cilíndricos) y supervisión acuática estricta con cero tolerancia al celular."
                      : "Evaluates tolerance to intense tantrums, respectful boundaries without yelling or threats, vital airway obstruction reflexes (choking hazards), and zero-phone water supervision."}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/60 text-xs space-y-1">
                      <span className="font-extrabold text-sky-950 block">Desescalada No Violenta</span>
                      <p className="text-[11px] text-sky-700">Contención respetuosa sin chantajes ni aislamiento forzado.</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/60 text-xs space-y-1">
                      <span className="font-extrabold text-sky-950 block">Primeros Auxilios 911</span>
                      <p className="text-[11px] text-sky-700">Palmadas de espalda, Heimlich pediátrico y prevención de asfixia.</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/60 text-xs space-y-1">
                      <span className="font-extrabold text-sky-950 block">Cero Pantallas</span>
                      <p className="text-[11px] text-sky-700">Estimulación sensorial activa y atención visual constante.</p>
                    </div>
                  </div>
                </div>

                {/* Bento Card 2: Elderly Care */}
                <div className="p-7 rounded-3xl bg-white border border-amber-200/80 shadow-md shadow-amber-500/5 space-y-5 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
                      <Heart className="w-7 h-7" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                      {language === "es" ? "Geriatría" : "Geriatrics"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {language === "es" ? "Adulto Mayor & Cuidados Geriátricos" : "Senior Care & Geriatrics"}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {language === "es"
                        ? "Empatía ante desorientación o Alzheimer, prevención de caídas críticas en cama/baño y administración estricta de medicamentos."
                        : "Patience with memory loss or confusion, critical fall prevention in bathrooms, and rigorous medication compliance."}
                    </p>
                  </div>

                  <ul className="text-xs text-slate-600 space-y-2.5 pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Trato digno sin infantilización</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Transferencias y movilidad segura</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Bitácora diaria de signos vitales</span>
                    </li>
                  </ul>
                </div>

                {/* Bento Card 3: Disability & Neurodiversity */}
                <div className="p-7 rounded-3xl bg-white border border-purple-200/80 shadow-md shadow-purple-500/5 space-y-5 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner">
                      <Activity className="w-7 h-7" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
                      {language === "es" ? "Neurodiversidad" : "Special Needs"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {language === "es" ? "Discapacidad & Neurodiversidad (TEA, TDAH)" : "Disability & Neurodiversity"}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {language === "es"
                        ? "Desescalada no restrictiva de sobrecargas sensoriales, comunicación aumentativa (pictogramas) y respeto absoluto por la autonomía."
                        : "Non-restrictive sensory overload de-escalation, visual AAC communication, and unwavering respect for personal dignity."}
                    </p>
                  </div>

                  <ul className="text-xs text-slate-600 space-y-2.5 pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Desescalada sensorial respetuosa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Tableros de comunicación y pictogramas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Fomento activo de la independencia</span>
                    </li>
                  </ul>
                </div>

                {/* Bento Card 4: Anti-Bias & Randomized Shuffle Engine (Spans 2 cols on desktop) */}
                <div className="lg:col-span-2 p-7 sm:p-9 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl space-y-5 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 rounded-2xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30 shrink-0">
                        <Zap className="w-6 h-6 text-sky-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 block">
                          {language === "es" ? "Tecnología Anti-Fraude" : "Anti-Gaming Tech"}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                          {language === "es" ? "Motor Anti-Sesgo y Mezcla Aleatoria" : "Anti-Bias Randomization Engine"}
                        </h3>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold self-start sm:self-auto">
                      Fisher-Yates Shuffle
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed relative z-10">
                    {language === "es"
                      ? "A diferencia de formularios comunes donde la opción 'A' siempre es la respuesta óptima, nuestro motor mezcla de forma matemáticamente aleatoria las alternativas para cada candidata individual. Esto neutraliza la memorización de respuestas y expone con certeza el verdadero juicio situacional del postulante."
                      : "Unlike basic quizzes where option 'A' is always the obvious best answer, our engine mathematically randomizes option order for every individual applicant. This neutralizes pattern guessing and accurately reveals real situational reflex."}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-sky-200/90 font-semibold relative z-10">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {language === "es" ? "Respuestas barajadas por postulante" : "Per-candidate option shuffle"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {language === "es" ? "Detección de patrones de complacencia" : "Social desirability bias filter"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* HOW IT WORKS: 3-Step Timeline */}
            <div className="pt-16 sm:pt-24 space-y-10">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                  {language === "es" ? "Flujo Simple y Seguro" : "Seamless Workflow"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {language === "es" ? "¿Cómo Funciona MatchCaring Bio?" : "How MatchCaring Bio Works"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {language === "es"
                    ? "Tres pasos sencillos para transformar una entrevista incierta en una contratación fundamentada."
                    : "Three simple steps to transform an uncertain hiring process into a data-backed decision."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-md shadow-slate-200/40 space-y-4 hover:border-sky-300 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 font-black text-base flex items-center justify-center">
                    01
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{t.step1Title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.step1Desc}</p>
                </div>

                <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-md shadow-slate-200/40 space-y-4 hover:border-indigo-300 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-base flex items-center justify-center">
                    02
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{t.step2Title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.step2Desc}</p>
                </div>

                <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-md shadow-slate-200/40 space-y-4 hover:border-emerald-300 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-base flex items-center justify-center">
                    03
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{t.step3Title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.step3Desc}</p>
                </div>
              </div>
            </div>

            {/* THE 6 RESEARCH DIMENSIONS */}
            <div className="pt-16 sm:pt-24 space-y-10">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {language === "es"
                    ? "Dimensiones de Evaluación Científicamente Investigadas"
                    : "Scientifically Researched Assessment Dimensions"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {language === "es"
                    ? "Evaluación integral adaptada a las necesidades críticas de cuidado infantil, geriatría y neurodiversidad."
                    : "Comprehensive assessment tailored to the critical demands of childcare, elderly companion, and special needs care."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Brain,
                    bg: "bg-sky-50 text-sky-600",
                    border: "border-sky-100",
                    titleEs: "Temperamento Psicológico y Regulación del Sistema Nervioso",
                    titleEn: "Psychological Temperament & Nervous System Regulation",
                    descEs: "Evalúa la tolerancia a la frustración, control de impulsos y capacidad de mantenerse como ancla emocional durante crisis y momentos de alta demanda.",
                    descEn: "Evaluates frustration tolerance, impulse control, response to repetitive sensory stimulation, and ability to remain a calm emotional anchor during meltdowns.",
                  },
                  {
                    icon: ShieldAlert,
                    bg: "bg-rose-50 text-rose-600",
                    border: "border-rose-100",
                    titleEs: "Seguridad Crítica, Primeros Auxilios y Prevención de Riesgos",
                    titleEn: "Critical Safety, First Aid & Accident Prevention",
                    descEs: "Evalúa prevención de asfixia, caídas, supervisión continua en agua de bañeras/piscinas y escalamiento inmediato de emergencias 911.",
                    descEn: "Tests knowledge of airway obstruction, fall prevention, zero-tolerance water supervision, and immediate 911 incident escalation.",
                  },
                  {
                    icon: HeartHandshake,
                    bg: "bg-amber-50 text-amber-600",
                    border: "border-amber-100",
                    titleEs: "Conducta, Pedagogía y Cuidado Adaptativo",
                    titleEn: "Behavior, Development & Adaptive Care",
                    descEs: "Mide respuestas constructivas ante conductas desafiantes en niños, desorientación en adultos mayores o sobrecarga sensorial en personas con discapacidad.",
                    descEn: "Measures constructive responses to toddler defiance, elderly confusion/memory loss, and sensory overload in neurodiverse individuals.",
                  },
                  {
                    icon: Scale,
                    bg: "bg-indigo-50 text-indigo-600",
                    border: "border-indigo-100",
                    titleEs: "Ética, Privacidad Digital y Límites con el Celular",
                    titleEn: "Ethics, Digital Privacy & Smartphone Boundaries",
                    descEs: "Cero distracciones en el celular durante la supervisión activa, prohibición estricta de publicar fotos en redes y respeto por la intimidad del hogar.",
                    descEn: "Zero smartphone distraction during active supervision, strict prohibition of posting photos on social media, and alignment with household rules.",
                  },
                  {
                    icon: Sparkles,
                    bg: "bg-emerald-50 text-emerald-600",
                    border: "border-emerald-100",
                    titleEs: "Casos Prácticos de Juicio Situacional",
                    titleEn: "Realistic Situational Judgment Scenarios",
                    descEs: "Reacciones inmediatas ante extraños en la calle, caídas repentinas, crisis alérgicas y resolución de conflictos sin violencia ni represalias.",
                    descEn: "Evaluates instant reactions to street strangers, sudden falls, allergic reactions (anaphylaxis), and physical defiance without retaliating.",
                  },
                  {
                    icon: AlertOctagon,
                    bg: "bg-purple-50 text-purple-600",
                    border: "border-purple-100",
                    titleEs: "Motor de Alertas y Banderas Rojas",
                    titleEn: "Critical Red Flag Alert Engine",
                    descEs: "Alerta instantáneamente respuestas que impliquen castigo físico, descuidos en agua o encubrimiento de caídas antes de contratarla.",
                    descEn: "Instantly flags choices that represent physical punishment, negligence in water, or concealing injuries before you invite them into your home.",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className={`p-7 rounded-3xl bg-white border ${item.border} shadow-xs hover:shadow-lg transition-all space-y-3`}
                    >
                      <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-black text-slate-900 leading-snug">
                        {language === "es" ? item.titleEs : item.titleEn}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {language === "es" ? item.descEs : item.descEn}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* INTERACTIVE FAQ ACCORDION */}
            <div className="pt-16 sm:pt-24 max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                  {language === "es" ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
                </span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {language === "es"
                    ? "Claridad y Confianza para Familias"
                    : "Clarity & Confidence for Families"}
                </h2>
              </div>

              <div className="space-y-3">
                {faqItems.map((item, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                      >
                        <span className="text-sm font-black text-slate-900">
                          {language === "es" ? item.qEs : item.qEn}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                            isOpen ? "rotate-180 text-sky-600" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                          >
                            {language === "es" ? item.aEs : item.aEn}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CONVERSION CTA BANNER */}
            <div className="mt-20 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-5">
                <span className="text-xs font-black text-sky-400 uppercase tracking-widest bg-sky-500/15 border border-sky-400/20 px-3.5 py-1 rounded-full">
                  {language === "es" ? "¿Listo para evaluar a tu próximo cuidador?" : "Ready to screen your next caregiver?"}
                </span>

                <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  {language === "es"
                    ? "Protege a tus Seres Queridos con una Selección Basada en Datos"
                    : "Protect Your Loved Ones with Data-Driven Caregiver Screening"}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {language === "es"
                    ? "Crea tu cuenta, define la categoría de cuidado (infantil, adulto mayor o discapacidad) y envía pruebas psicométricas personalizadas en minutos."
                    : "Create your account, select the care category (childcare, senior, or disability), and send tailored psychometric evaluations in minutes."}
                </p>

                <div className="pt-2">
                  <Link
                    href={user ? "/dashboard" : "/login?tab=register"}
                    className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-extrabold text-sm shadow-xl shadow-sky-500/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>{user ? t.openDashboard : (language === "es" ? "Comenzar Ahora Gratis" : "Get Started Now Free")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo href="/" size="sm" />
          <p>&copy; {new Date().getFullYear()} MatchCaring Bio &bull; {t.brandSubtitle}.</p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>Privacidad</span>
            <span>&bull;</span>
            <span>Términos</span>
            <span>&bull;</span>
            <span>Protocolo AAP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
