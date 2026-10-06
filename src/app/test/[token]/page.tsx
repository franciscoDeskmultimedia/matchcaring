"use client";

import { useEffect, useState, use } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { CandidateProfile, CandidateResponse, CustomAnswer, CustomQuestion } from "@/lib/types";
import { COUNTRIES, getCountryByCode, detectUserCountry } from "@/lib/countries";
import { useLanguage } from "@/components/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BrandLogo from "@/components/BrandLogo";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  CheckCircle2,
  Clock,
  Globe2,
  HeartHandshake,
  HelpCircle,
  Lock,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface SanitizedOption {
  id: string;
  text: string;
  textEs?: string;
}

interface SanitizedQuestion {
  id: string;
  category: string;
  categoryTitle: string;
  categoryTitleEs?: string;
  question: string;
  questionEs?: string;
  context?: string;
  contextEs?: string;
  type: string;
  options: SanitizedOption[];
}

export default function CandidateTestPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const { token } = resolvedParams;
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateInfo, setCandidateInfo] = useState<{
    id: string;
    name: string;
    phone?: string;
    email?: string;
    roleTarget: string;
    askHourlyRate?: boolean;
    alreadyCompleted: boolean;
    customQuestions?: CustomQuestion[];
  } | null>(null);
  const [questions, setQuestions] = useState<SanitizedQuestion[]>([]);

  // Wizard state:
  // step = 0: Welcome Intro
  // step = 1: Profile & Background
  // step = 2 to (questions.length + 1): Questions
  // step = finished: Completed Thank You
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Profile Form state: preselect country based on detected location
  const [profile, setProfile] = useState<CandidateProfile>(() => {
    const detectedCode = detectUserCountry();
    const cData = getCountryByCode(detectedCode);
    return {
      fullName: "",
      countryOfOrigin: detectedCode,
      countryOfResidence: detectedCode,
      phoneDialCode: cData.dialCode,
      phone: "",
      email: "",
      yearsOfExperience: 3,
      hasCprCertification: true,
      cprExpirationDate: "",
      hasEarlyChildhoodEducation: false,
      highestEducation: "Some College / Training",
      authorizedToWork: true,
      availableStartDate: "Within 2 weeks",
      preferredHourlyRate: "$25 - $30 / hr",
      personalStatement: "",
    };
  });

  // Responses map: questionId -> selectedOptionId
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Custom Answers map: customQuestionId -> answer string
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTest();
    // Also refine country preselection using /api/geo
    fetch("/api/geo")
      .then((r) => r.json())
      .then((geo) => {
        if (geo?.country) {
          const cData = getCountryByCode(geo.country);
          setProfile((prev) => ({
            ...prev,
            countryOfOrigin: prev.countryOfOrigin || geo.country,
            countryOfResidence: prev.countryOfResidence || geo.country,
            phoneDialCode: prev.phoneDialCode || cData.dialCode,
          }));
        }
      })
      .catch(() => {});
  }, [token]);

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/test/${token}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Assessment link not found or expired.");
      }

      setCandidateInfo(data.candidate);
      setQuestions(data.questions || []);

      if (data.candidate) {
        setProfile((prev) => ({
          ...prev,
          fullName: data.candidate.name || prev.fullName,
          phone: data.candidate.phone || prev.phone,
          email: data.candidate.email || prev.email,
          preferredHourlyRate:
            data.candidate.askHourlyRate === false ? "" : prev.preferredHourlyRate,
        }));
      }

      if (data.candidate?.alreadyCompleted) {
        setCompleted(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleCustomAnswerChange = (questionId: string, val: string) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    try {
      const responsesList: CandidateResponse[] = Object.entries(answers).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })
      );

      const customAnswersList: CustomAnswer[] = (candidateInfo?.customQuestions || []).map((cq) => ({
        questionId: cq.id,
        questionPrompt: cq.prompt,
        type: cq.type,
        answer: customAnswers[cq.id] || "",
      }));

      const res = await fetch(`/api/test/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          responses: responsesList,
          customAnswers: customAnswersList,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit responses.");

      setCompleted(true);
      toast.success(
        language === "es"
          ? "¡Evaluación completada con éxito!"
          : "Assessment submitted successfully!"
      );
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      toast.error(err.message || "An error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            {language === "es" ? "Cargando Cuestionario de Evaluación..." : "Loading Assessment Questionnaire..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 text-center shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t.linkUnavailable}</h2>
          <p className="text-xs sm:text-sm text-slate-600">{error}</p>
          <p className="text-xs text-slate-400">
            {t.askRenewed}
          </p>
        </div>
      </div>
    );
  }

  // Shared persistent navigation bar for all test steps
  const renderHeaderBar = () => (
    <header className="w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo href="#" size="sm" />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/70 text-[11px] font-bold text-sky-800">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>{language === "es" ? "Portal Oficial de Evaluación" : "Official Candidate Evaluation"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(profile.fullName || candidateInfo?.name) && (
            <span className="hidden md:inline-flex text-xs font-semibold text-slate-500 bg-slate-100/90 border border-slate-200/60 px-3 py-1 rounded-full">
              {profile.fullName || candidateInfo?.name}
            </span>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );

  // Already Completed Screen
  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-slate-50 to-sky-50/40 flex flex-col justify-between">
        {renderHeaderBar()}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 text-center shadow-xl space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {t.submittedTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.submittedDesc(profile.fullName || candidateInfo?.name || "")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 text-left space-y-1.5">
              <p className="font-bold text-slate-800">{t.whatHappensNext}</p>
              <p>{t.nextStep1}</p>
              <p>{t.nextStep2}</p>
            </div>

            <p className="text-[11px] text-slate-400 pt-2">
              {t.closeWindow}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Welcome Step (Step 0)
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50/50 via-slate-50 to-indigo-50/40 flex flex-col justify-between">
        {renderHeaderBar()}
        <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 relative">
          <div className="max-w-xl w-full mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-3.5 pb-2 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30 shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">
                  {t.portalTag}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t.welcomeTitle(candidateInfo?.name || "Candidate")}
                </h1>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>{t.welcomeP1}</p>
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200/80 font-bold text-sky-950 flex items-center gap-2">
                <Baby className="w-5 h-5 text-sky-600 shrink-0" />
                <span>{candidateInfo?.roleTarget}</span>
              </div>
              <p>{t.welcomeP2}</p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                <Clock className="w-4 h-4 text-sky-600 mx-auto mb-1.5" />
                <span className="font-bold text-slate-900 block">{t.highlight1Title}</span>
                <span className="text-slate-500 text-[11px]">{t.highlight1Sub}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                <Sparkles className="w-4 h-4 text-indigo-600 mx-auto mb-1.5" />
                <span className="font-bold text-slate-900 block">{t.highlight2Title}</span>
                <span className="text-slate-500 text-[11px]">{t.highlight2Sub}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1.5" />
                <span className="font-bold text-slate-900 block">{t.highlight3Title}</span>
                <span className="text-slate-500 text-[11px]">{t.highlight3Sub}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">{t.readyWhenYouAre}</span>
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/25 transition-all active:scale-95"
              >
                <span>{t.beginAssessment}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile Background Step (Step 1)
  if (currentStep === 1) {
    const handleNextFromProfile = (e: React.FormEvent) => {
      e.preventDefault();
      if (!profile.fullName || !profile.phone) {
        toast.warning(
          language === "es"
            ? "Por favor ingresa tu nombre y teléfono celular para continuar."
            : "Please provide your full name and phone number."
        );
        return;
      }
      setCurrentStep(2);
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        {renderHeaderBar()}
        <div className="flex-1 py-8 px-4 sm:px-6">
          <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4 space-y-1">
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">
                {t.stepProgress(1, questions.length + 1)}
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {t.step1Header}
              </h2>
              <p className="text-xs text-slate-500">
                {language === "es"
                  ? "Información requerida para validar tu perfil ante la familia evaluadora."
                  : "Information required to verify your profile with the hiring family."}
              </p>
            </div>

            <form onSubmit={handleNextFromProfile} className="space-y-4">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.legalName}
                </label>
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="e.g. Maria Gonzalez"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.emailAddress}
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Country of Origin & Country of Residence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.countryOfOrigin}
                </label>
                <div className="relative">
                  <select
                    value={profile.countryOfOrigin || "MX"}
                    onChange={(e) => setProfile({ ...profile, countryOfOrigin: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none bg-white cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {language === "es" ? c.nameEs : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.countryOfResidence}
                </label>
                <div className="relative">
                  <select
                    value={profile.countryOfResidence || "MX"}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      const cData = getCountryByCode(newCode);
                      setProfile({
                        ...profile,
                        countryOfResidence: newCode,
                        phoneDialCode: cData.dialCode,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none bg-white cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {language === "es" ? c.nameEs : c.nameEn} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Phone & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.mobileNumber}
                </label>
                {(() => {
                  const residenceCountry = getCountryByCode(profile.countryOfResidence || "MX");
                  return (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shrink-0">
                        <span>{residenceCountry.flag}</span>
                        <span>{profile.phoneDialCode || residenceCountry.dialCode}</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder={residenceCountry.placeholder}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.yrsExpLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={profile.yearsOfExperience}
                  onChange={(e) => setProfile({ ...profile, yearsOfExperience: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            {/* CPR Certification Checkbox */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.hasCprCertification}
                  onChange={(e) => setProfile({ ...profile, hasCprCertification: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  {t.cprStatement}
                </span>
              </label>

              {profile.hasCprCertification && (
                <div className="pl-6">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    {t.cprExpirationLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. American Red Cross, valid through 2027"
                    value={profile.cprExpirationDate}
                    onChange={(e) => setProfile({ ...profile, cprExpirationDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Compensation & Start Date (Hourly Rate is optional per parent request) */}
            <div className={`grid grid-cols-1 ${candidateInfo?.askHourlyRate !== false ? "sm:grid-cols-2" : ""} gap-4`}>
              {candidateInfo?.askHourlyRate !== false && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.prefRateLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $28 - $32 / hr"
                    value={profile.preferredHourlyRate}
                    onChange={(e) => setProfile({ ...profile, preferredHourlyRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.startDateLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Within 2 weeks"
                  value={profile.availableStartDate}
                  onChange={(e) => setProfile({ ...profile, availableStartDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.philosophyLabel}
              </label>
              <textarea
                rows={3}
                placeholder={
                  language === "es"
                    ? "Comparte unas palabras sobre tu paciencia, metodología o lo que más te alegra al cuidar niños de 3 años..."
                    : "Share a sentence or two about your energy, philosophy, or what brings you joy when caring for toddlers..."
                }
                value={profile.personalStatement}
                onChange={(e) => setProfile({ ...profile, personalStatement: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.previous}</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/25 transition-all active:scale-95"
              >
                <span>{t.continueQuestions}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Step: Family Custom Questions (Step questions.length + 2)
  if (
    currentStep === questions.length + 2 &&
    candidateInfo?.customQuestions &&
    candidateInfo.customQuestions.length > 0
  ) {
    const customQuestionsList = candidateInfo.customQuestions;
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        {renderHeaderBar()}
        <div className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                  {language === "es" ? "Etapa Final" : "Final Stage"}
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {t.customQuestionsCandidateTitle}
                </h2>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {customQuestionsList.length} {language === "es" ? "Preguntas Familiares" : "Family Questions"}
            </span>
          </div>

          {/* Custom Questions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6 animate-in fade-in">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.customQuestionsCandidateDesc}
            </p>

            <div className="space-y-6">
              {customQuestionsList.map((cq, idx) => {
                const currentAnswer = customAnswers[cq.id] || "";
                return (
                  <div
                    key={cq.id}
                    className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{cq.prompt}</h3>
                    </div>

                    {cq.type === "multiple_choice" && cq.options && (
                      <div className="space-y-2 pt-1 pl-7">
                        {cq.options.map((opt, optIdx) => {
                          const isSelected = currentAnswer === opt;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleCustomAnswerChange(cq.id, opt)}
                              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-3 transition-colors ${
                                isSelected
                                  ? "bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 text-purple-950 font-semibold"
                                  : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isSelected
                                    ? "bg-purple-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {isSelected ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  String.fromCharCode(65 + optIdx)
                                )}
                              </div>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {cq.type === "open_text" && (
                      <div className="pt-1 pl-7">
                        <textarea
                          rows={3}
                          value={currentAnswer}
                          onChange={(e) => handleCustomAnswerChange(cq.id, e.target.value)}
                          placeholder={t.openTextPlaceholder}
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Controls */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(questions.length + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.previous}</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitAll}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <span>{t.submittingAssessment}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.submitFinal}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer reassurance */}
        <footer className="max-w-2xl w-full mx-auto text-center pt-6 text-[11px] text-slate-400">
          Caregiver Psychological & Safety Assessment &bull; Secure & Confidential
        </footer>
      </div>
    );
  }

  // Question Steps (Step 2 to questions.length + 1)
  const questionIndex = currentStep - 2;
  const currentQuestion = questions[questionIndex];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = questionIndex === questions.length - 1;
  const hasCustomQuestions = Boolean(
    candidateInfo?.customQuestions && candidateInfo.customQuestions.length > 0
  );
  const progressPercent = Math.round(((questionIndex + 1) / questions.length) * 100);

  const categoryTitle =
    language === "es" && currentQuestion?.categoryTitleEs
      ? currentQuestion.categoryTitleEs
      : currentQuestion?.categoryTitle;

  const questionText =
    language === "es" && currentQuestion?.questionEs
      ? currentQuestion.questionEs
      : currentQuestion?.question;

  const contextText =
    language === "es" && currentQuestion?.contextEs
      ? currentQuestion.contextEs
      : currentQuestion?.context;

  const handleNextQuestion = () => {
    if (!selectedOptionId) {
      toast.warning(
        language === "es"
          ? "Por favor selecciona una de las opciones antes de continuar."
          : "Please select one of the options before continuing."
      );
      return;
    }

    if (isLastQuestion) {
      if (hasCustomQuestions) {
        setCurrentStep(questions.length + 2);
      } else {
        handleSubmitAll();
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-indigo-50/50 flex flex-col justify-between relative overflow-hidden">
      {/* Ambient background blur elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      {renderHeaderBar()}

      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 space-y-6 relative z-10 pb-12">
        {/* Spacious, Elegant Progress Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-800 self-start">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase">
                {categoryTitle}
              </span>
            </div>

            {/* Question Counter Pill & Progress % */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                {language === "es" ? "Pregunta" : "Question"} {questionIndex + 1} / {questions.length}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-sky-600 text-white font-black text-xs shadow-xs">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-600 rounded-full"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 18 }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
              <span>{t.questionProgress(questionIndex + 1, questions.length, progressPercent)}</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>{language === "es" ? "Progreso guardado automáticamente" : "Responses auto-saved"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Question Card with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6 relative overflow-hidden"
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{language === "es" ? "Pregunta" : "Question"} {questionIndex + 1} / {questions.length}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {questionText}
              </h2>
              {contextText && (
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-500 italic flex items-center gap-2">
                  <span className="text-sky-500 font-bold not-italic">💡</span>
                  <span>{language === "es" ? "Contexto evaluado:" : "Context:"} {contextText}</span>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const optionLetter = String.fromCharCode(65 + idx);
                const optText = (language === "es" && opt.textEs) ? opt.textEs : opt.text;

                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileHover={{ scale: 1.008, y: -1 }}
                    whileTap={{ scale: 0.992 }}
                    onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                    className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-sky-50/90 to-indigo-50/70 border-sky-500 ring-2 ring-sky-500/25 shadow-md shadow-sky-500/10"
                        : "bg-white border-slate-200/80 hover:border-sky-300 hover:bg-slate-50/60 shadow-xs"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                        isSelected
                          ? "bg-sky-600 text-white shadow-sm shadow-sky-600/30 scale-105"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : optionLetter}
                    </div>

                    <span
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isSelected ? "text-slate-950 font-bold" : "text-slate-700 font-medium"
                      }`}
                    >
                      {optText}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Navigation Controls */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.previous}</span>
              </button>

            <button
              type="button"
              disabled={!selectedOptionId || submitting}
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span>{t.submittingAssessment}</span>
              ) : isLastQuestion && !hasCustomQuestions ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.submitFinal}</span>
                </>
              ) : isLastQuestion && hasCustomQuestions ? (
                <>
                  <span>{language === "es" ? "Preguntas de la Familia" : "Family Questions"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{t.nextQuestion}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>

      {/* Footer reassurance */}
      <footer className="max-w-2xl w-full mx-auto text-center pt-6 text-[11px] text-slate-400">
        Caregiver Psychological & Safety Assessment &bull; Secure & Confidential
      </footer>
    </div>
  );
}
