"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageContext";
import { User } from "@/lib/types";
import BrandLogo from "./BrandLogo";
import {
  AlertOctagon,
  ArrowRight,
  Baby,
  Brain,
  CheckCircle2,
  HeartHandshake,
  MessagesSquare,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface HomeClientProps {
  user: User | null;
}

export default function HomeClient({ user }: HomeClientProps) {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo href="/" />

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 transition-all active:scale-95"
              >
                <span>{t.openDashboard}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  {t.signIn}
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 transition-all active:scale-95"
                >
                  {t.tryDemo}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-200/80 text-sky-800 text-xs font-semibold shadow-xs">
                <Baby className="w-4 h-4 text-sky-600" />
                <span>{t.heroTag}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                {language === "es" ? (
                  <>
                    Contrata con Confianza:{" "}
                    <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                      Evalúa la Psicología y Seguridad de tu Niñera
                    </span>{" "}
                    Antes de Abrirle tu Hogar
                  </>
                ) : (
                  <>
                    Hire with Confidence:{" "}
                    <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                      Diagnose Nanny Psyche & Safety
                    </span>{" "}
                    Before They Enter Your Home
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                {t.heroDesc}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-sky-600/25 transition-all active:scale-95"
                >
                  <span>{user ? t.openDashboard : t.tryDemo}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login?tab=register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm shadow-xs transition-colors"
                >
                  <span>{t.createAccount}</span>
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {t.aapProtocol}
                </span>
                <span className="flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-sky-600" />
                  {t.emotionalRegulation}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessagesSquare className="w-4 h-4 text-indigo-600" />
                  {t.inPersonProbes}
                </span>
              </div>
            </div>

            {/* How It Works 3-Step Banner */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.step1Title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.step1Desc}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.step2Title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.step2Desc}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.step3Title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.step3Desc}
                </p>
              </div>
            </div>

            {/* The 5 Research Dimensions */}
            <div className="mt-20 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {language === "es"
                    ? "Dimensiones de Evaluación Científicamente Investigadas"
                    : "Scientifically Researched Assessment Dimensions"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {language === "es"
                    ? "Enfocadas con precisión en la etapa del desarrollo y las exigencias de un niño de 3 años."
                    : "Targeted exclusively to the developmental vulnerabilities and high-energy demands of a 3-year-old child."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {language === "es"
                      ? "Temperamento Psicológico y Regulación del Sistema Nervioso"
                      : "Psychological Temperament & Nervous System Regulation"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === "es"
                      ? "Evalúa la tolerancia a la frustración, control de impulsos y capacidad de mantenerse como ancla emocional durante las rabietas del niño pequeño."
                      : "Evaluates frustration tolerance, impulse control, response to repetitive sensory stimulation, and ability to remain a calm emotional anchor during toddler meltdowns."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {language === "es"
                      ? "Seguridad Crítica, RCP y Primeros Auxilios Pediátricos"
                      : "Critical Safety, CPR & Pediatric First Aid"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === "es"
                      ? "Evalúa el corte preventivo de asfixia (uvas, salchichas), supervisión continua en agua de bañeras/piscinas y escalamiento de emergencias 911."
                      : "Tests knowledge of airway obstruction (grapes, coin hot-dogs), zero-tolerance water supervision in bathtubs/pools, and immediate 911 incident escalation."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Baby className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {language === "es"
                      ? "Conducta Infantil y Pedagogía a los 3 Años"
                      : "Toddler Behavior & Age-3 Developmental Mastery"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === "es"
                      ? "Mide respuestas no punitivas ante retrocesos en el orinal, límites positivos sin violencia y juegos sensoriales sin pantallas."
                      : "Measures non-punitive responses to potty regression, limit-testing ('No!'), positive discipline, and creative screen-free sensory play."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {language === "es"
                      ? "Ética, Privacidad Digital y Límites con el Celular"
                      : "Ethics, Digital Privacy & Smartphone Boundaries"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === "es"
                      ? "Cero distracciones en el celular durante la supervisión activa, prohibición estricta de publicar fotos en redes y respeto por las normas familiares."
                      : "Zero smartphone distraction during active supervision, strict prohibition of posting child photos on TikTok/Instagram, and alignment with household rules."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {language === "es"
                      ? "Casos Prácticos de Juicio Situacional"
                      : "Realistic Situational Judgment Scenarios"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === "es"
                      ? "Reacciones inmediatas ante extraños en el parque, crisis alérgicas repentinas (anafilaxia) y desescalamiento de golpes sin devolver agresión."
                      : "Evaluates instant reactions to playground strangers, sudden allergic reactions (anaphylaxis), and physical defiance without retaliating."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {language === "es"
                      ? "Motor de Alertas y Banderas Rojas"
                      : "Critical Red Flag Alert Engine"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === "es"
                      ? "Alerta instantáneamente respuestas que impliquen castigo físico, descuidos en agua o encubrimiento de caídas antes de contratarla."
                      : "Instantly flags choices that represent physical punishment, negligence in water, or concealing head bumps from parents before you invite them into your home."}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Demo CTA */}
            <div className="mt-16 rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center space-y-4 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-xl mx-auto space-y-4">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                  {language === "es" ? "¿Lista para evaluar?" : "Ready to test?"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {language === "es"
                    ? "Protege a tu Hijo con una Selección Basada en Datos"
                    : "Protect Your Child with Data-Driven Caregiver Screening"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  {language === "es"
                    ? "Incluye candidatas de muestra con perfiles sobresalientes, alertas sutiles de celular y advertencias críticas de banderas rojas."
                    : "Pre-loaded with sample candidates showing high-performing caregivers, subtle phone habit watchouts, and critical red-flag warnings."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/30 transition-all active:scale-95"
                  >
                    <span>{language === "es" ? "Iniciar Demo de Reclutamiento" : "Launch Parent Recruiter Demo"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} MatchCaring Bio &bull; {t.brandSubtitle}.</p>
      </footer>
    </div>
  );
}
