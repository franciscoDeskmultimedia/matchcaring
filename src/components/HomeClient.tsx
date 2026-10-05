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
  Heart,
  HeartHandshake,
  MessagesSquare,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Activity,
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
                  href="/login?tab=register"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 transition-all active:scale-95"
                >
                  {t.getStarted}
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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200/80 text-sky-800 text-xs font-semibold shadow-xs">
                <HeartHandshake className="w-4 h-4 text-sky-600" />
                <span>{t.heroTag}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                {language === "es" ? (
                  <>
                    Contrata con Confianza:{" "}
                    <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                      Evalúa la Psicología, Seguridad y Ética de tus Cuidadores
                    </span>{" "}
                    Antes de Abrirles tu Hogar
                  </>
                ) : (
                  <>
                    Hire with Confidence:{" "}
                    <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                      Diagnose Caregiver Psyche, Safety & Ethics
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
                  href={user ? "/dashboard" : "/login?tab=register"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-sky-600/25 transition-all active:scale-95"
                >
                  <span>{user ? t.openDashboard : t.tryDemo}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm shadow-xs transition-colors"
                >
                  <span>{t.signIn}</span>
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

            {/* 3 Pillars of Care: Children, Elderly, Disability */}
            <div className="mt-16 space-y-4">
              <div className="text-center max-w-2xl mx-auto space-y-1">
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-widest">
                  {language === "es" ? "Cobertura Multidisciplinaria" : "Multi-Disciplinary Care"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {language === "es"
                    ? "Evaluación Adaptada a Cada Etapa y Necesidad"
                    : "Tailored Screening for Every Stage & Need"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {language === "es"
                    ? "Pruebas científicas con preguntas de juicio situacional específicas para cada perfil de cuidado."
                    : "Scientific scenario-based assessments engineered specifically for each distinct care category."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Pillar 1: Childcare */}
                <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                      <Baby className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {language === "es" ? "Cuidado Infantil" : "Childcare & Nannies"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {language === "es" ? "Niños & Bebés" : "Children & Infants"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {language === "es"
                        ? "Paciencia durante rabietas, límites no violentos, reflejos ante asfixia (corte de uvas/salchichas) y supervisión acuática estricta."
                        : "Tantrum de-escalation, non-punitive guidance, choking prevention (AAP protocols), and zero-distraction water safety."}
                    </p>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{language === "es" ? "Regulación en crisis de berrinches" : "Tantrum emotional grounding"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{language === "es" ? "Cero pantallas y juego sensorial" : "Screen-free developmental play"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{language === "es" ? "Emergencias pediátricas 911" : "Pediatric emergency escalation"}</span>
                    </li>
                  </ul>
                </div>

                {/* Pillar 2: Elderly Care */}
                <div className="p-6 rounded-2xl bg-white border border-amber-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Heart className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {language === "es" ? "Adultos Mayores" : "Elderly & Companion"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {language === "es" ? "Adulto Mayor & Geriatría" : "Senior Care & Geriatrics"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {language === "es"
                        ? "Empatía ante desorientación o Alzheimer, prevención activa de caídas en cama/baño y rigurosa administración de medicamentos."
                        : "Empathy during memory loss or confusion, active fall prevention protocols, and strict medication schedule adherence."}
                    </p>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{language === "es" ? "Trato digno sin infantilización" : "Dignified communication without infantalizing"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{language === "es" ? "Transferencias y movilidad segura" : "Safe transfers and mobility assistance"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{language === "es" ? "Bitácora diaria de signos vitales" : "Daily vitals and routine logging"}</span>
                    </li>
                  </ul>
                </div>

                {/* Pillar 3: Disability & Neurodiversity */}
                <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                      {language === "es" ? "Discapacidad & TEA" : "Disability & Special Needs"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {language === "es" ? "Discapacidad & Neurodiversidad" : "Disability & Neurodiversity"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {language === "es"
                        ? "Desescalada no restrictiva de sobrecargas sensoriales, comunicación aumentativa (SAAC) y respeto absoluto a la autonomía."
                        : "Non-restrictive sensory de-escalation, visual AAC communication methods, and unwavering respect for personal autonomy."}
                    </p>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{language === "es" ? "Desescalada no violenta de crisis" : "Non-violent sensory de-escalation"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{language === "es" ? "Tableros de comunicación y pictogramas" : "Visual schedules and AAC boards"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{language === "es" ? "Preservación de la independencia" : "Fostering independence and safety"}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How It Works 3-Step Banner */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* The 6 Research Dimensions */}
            <div className="mt-20 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
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
                      ? "Evalúa la tolerancia a la frustración, control de impulsos y capacidad de mantenerse como ancla emocional durante crisis y momentos de alta demanda."
                      : "Evaluates frustration tolerance, impulse control, response to repetitive sensory stimulation, and ability to remain a calm emotional anchor during meltdowns."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {language === "es"
                      ? "Seguridad Crítica, Primeros Auxilios y Prevención de Riesgos"
                      : "Critical Safety, First Aid & Accident Prevention"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === "es"
                      ? "Evalúa prevención de asfixia, caídas, supervisión continua en agua de bañeras/piscinas y escalamiento inmediato de emergencias 911."
                      : "Tests knowledge of airway obstruction, fall prevention, zero-tolerance water supervision, and immediate 911 incident escalation."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {language === "es"
                      ? "Conducta, Pedagogía y Cuidado Adaptativo"
                      : "Behavior, Development & Adaptive Care"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === "es"
                      ? "Mide respuestas constructivas ante conductas desafiantes en niños, desorientación en adultos mayores o sobrecarga sensorial en personas con discapacidad."
                      : "Measures constructive responses to toddler defiance, elderly confusion/memory loss, and sensory overload in neurodiverse individuals."}
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
                      ? "Cero distracciones en el celular durante la supervisión activa, prohibición estricta de publicar fotos en redes y respeto por la intimidad del hogar."
                      : "Zero smartphone distraction during active supervision, strict prohibition of posting photos on social media, and alignment with household rules."}
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
                      ? "Reacciones inmediatas ante extraños en la calle, caídas repentinas, crisis alérgicas y resolución de conflictos sin violencia ni represalias."
                      : "Evaluates instant reactions to street strangers, sudden falls, allergic reactions (anaphylaxis), and physical defiance without retaliating."}
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
                      : "Instantly flags choices that represent physical punishment, negligence in water, or concealing injuries before you invite them into your home."}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom CTA Banner */}
            <div className="mt-16 rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center space-y-4 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-xl mx-auto space-y-4">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                  {language === "es" ? "¿Listo para evaluar a tu próximo cuidador?" : "Ready to screen your next caregiver?"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {language === "es"
                    ? "Protege a tus Seres Queridos con una Selección Basada en Datos"
                    : "Protect Your Loved Ones with Data-Driven Caregiver Screening"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  {language === "es"
                    ? "Crea tu cuenta, define la categoría de cuidado (infantil, adulto mayor o discapacidad) y envía pruebas psicométricas personalizadas en minutos."
                    : "Create your account, select the care category (childcare, senior, or disability), and send tailored psychometric evaluations in minutes."}
                </p>
                <div className="pt-2">
                  <Link
                    href={user ? "/dashboard" : "/login?tab=register"}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/30 transition-all active:scale-95"
                  >
                    <span>{user ? t.openDashboard : (language === "es" ? "Comenzar Ahora" : "Get Started Now")}</span>
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
