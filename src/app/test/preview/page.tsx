"use client";

import { useState } from "react";
import Link from "next/link";
import { ASSESSMENT_QUESTIONS } from "@/lib/questions";
import { evaluateAssessment } from "@/lib/scoring";
import { AssessmentResult, CandidateProfile, CandidateResponse, CustomQuestion } from "@/lib/types";
import { COUNTRIES, getCountryByCode } from "@/lib/countries";
import { useLanguage } from "@/components/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ScoreGauge from "@/components/ScoreGauge";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import RedFlagBanner from "@/components/RedFlagBanner";
import InterviewGuideCard from "@/components/InterviewGuideCard";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  CheckCircle2,
  Clock,
  Coins,
  Eye,
  HeartHandshake,
  HelpCircle,
  Layers,
  ListOrdered,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users2,
  Wand2,
} from "lucide-react";

export default function TestPreviewPage() {
  const { t, language } = useLanguage();

  // Preview Configuration:
  // single vs multi-child
  const [childScenario, setChildScenario] = useState<"single" | "multi">("multi");
  // walkthrough vs audit
  const [viewMode, setViewMode] = useState<"wizard" | "audit">("wizard");
  // parent option: include vs omit hourly rate question
  const [previewAskHourlyRate, setPreviewAskHourlyRate] = useState<boolean>(true);
  // parent option: include vs omit custom questions
  const [includeCustomQuestions, setIncludeCustomQuestions] = useState<boolean>(true);

  // Wizard state: 0 = Intro, 1 = Profile, 2..N = Questions, N+1 = Custom Qs, N+2 = Simulated Scorecard
  const [currentStep, setCurrentStep] = useState(0);

  // Selected candidate responses: questionId -> optionId
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({
    sample_cq_1:
      language === "es"
        ? "Sí, tengo licencia vigente y vehículo propio"
        : "Yes, valid license and personal vehicle",
    sample_cq_2:
      language === "es"
        ? "Priorizo juegos sensoriales, lectura de cuentos y manualidades sin pantallas."
        : "I prioritize sensory activities, reading storybooks, and crafts with zero screens.",
  });
  const [simulatedResult, setSimulatedResult] = useState<AssessmentResult | null>(null);

  const sampleCustomQuestions: CustomQuestion[] = [
    {
      id: "sample_cq_1",
      type: "multiple_choice",
      prompt:
        language === "es"
          ? "¿Cuenta con licencia de conducir vigente y récord limpio para trasladar a los niños?"
          : "Do you have a valid driver's license and clean record to drive the children?",
      options:
        language === "es"
          ? [
              "Sí, tengo licencia vigente y vehículo propio",
              "Sí, tengo licencia vigente pero no vehículo",
              "No conduzco",
            ]
          : [
              "Yes, valid license and personal vehicle",
              "Yes, valid license but no vehicle",
              "I do not drive",
            ],
      required: true,
    },
    {
      id: "sample_cq_2",
      type: "open_text",
      prompt:
        language === "es"
          ? "¿Cómo gestiona el tiempo de pantallas y qué juegos creativos propone para un día lluvioso?"
          : "How do you manage screen time and what indoor creative games do you propose for rainy days?",
      required: false,
    },
  ];

  const defaultCountryCode = language === "es" ? "MX" : "US";
  const defaultCountry = getCountryByCode(defaultCountryCode);

  // Sample profile
  const [profile, setProfile] = useState<CandidateProfile>({
    fullName: language === "es" ? "Camila Rodriguez (Vista Previa)" : "Camila Rodriguez (Preview)",
    countryOfOrigin: defaultCountryCode,
    countryOfResidence: defaultCountryCode,
    phoneDialCode: defaultCountry.dialCode,
    phone: "55 4321 8765",
    email: "camila.preview@example.com",
    yearsOfExperience: 5,
    hasCprCertification: true,
    cprExpirationDate: "2027-06-30",
    hasEarlyChildhoodEducation: true,
    highestEducation: "Associate Degree in Early Childhood",
    authorizedToWork: true,
    availableStartDate: "In 2 weeks",
    preferredHourlyRate: "$28 - $32 / hr",
    personalStatement:
      language === "es"
        ? "Apasionada por la crianza respetuosa, actividades lúdicas al aire libre y rutinas seguras para niños pequeños y sus hermanitos."
        : "Passionate about gentle authoritative care, sensory exploration, and creating peaceful, structured routines for toddlers and siblings.",
  });

  // Filter questions depending on child scenario
  const displayedQuestions = ASSESSMENT_QUESTIONS.filter((q) => {
    if (childScenario === "single" && q.category === "sibling_and_multichild") {
      return false;
    }
    return true;
  });

  const totalSteps = displayedQuestions.length + 1; // 0=Intro, 1=Profile, 2..displayedQuestions.length+1

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const calculateScorecard = (currentAnswers = answers) => {
    const responsesList: CandidateResponse[] = Object.entries(currentAnswers).map(
      ([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })
    );
    const result = evaluateAssessment(responsesList);
    setSimulatedResult(result);
  };

  const handleAutoFillIdeal = () => {
    const filled: Record<string, string> = {};
    displayedQuestions.forEach((q) => {
      const best = q.options.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));
      filled[q.id] = best.id;
    });
    setAnswers(filled);
    calculateScorecard(filled);
  };

  const handleAutoFillMixed = () => {
    const filled: Record<string, string> = {};
    displayedQuestions.forEach((q, idx) => {
      if (idx % 4 === 1 && q.options.some((o) => o.isRedFlag)) {
        const flagOpt = q.options.find((o) => o.isRedFlag) || q.options[q.options.length - 1];
        filled[q.id] = flagOpt.id;
      } else if (idx % 3 === 0) {
        // Average option
        const midOpt = q.options.find((o) => o.score >= 3 && o.score <= 6) || q.options[1];
        filled[q.id] = midOpt.id;
      } else {
        const best = q.options.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));
        filled[q.id] = best.id;
      }
    });
    setAnswers(filled);
    calculateScorecard(filled);
  };

  const handleReset = () => {
    setAnswers({});
    setSimulatedResult(null);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Parent Preview Header Banner */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === "es" ? "Volver al Panel" : "Back to Dashboard"}</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                {t.previewBannerTitle}
              </span>
              <span className="hidden sm:inline text-xs text-slate-400">
                {language === "es"
                  ? "Experimenta el test tal como lo ve la niñera"
                  : "Experience the test exactly as nannies see it"}
              </span>
            </div>
          </div>

          {/* Controls: Family Scenario & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Single Child vs Multi-Child Toggle */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center text-xs">
              <button
                onClick={() => {
                  setChildScenario("single");
                  setSimulatedResult(null);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  childScenario === "single"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Single Child (13 questions)"
              >
                <Baby className="w-3.5 h-3.5" />
                <span>{language === "es" ? "1 Hijo (3 años)" : "Single Child (3yo)"}</span>
              </button>
              <button
                onClick={() => {
                  setChildScenario("multi");
                  setSimulatedResult(null);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  childScenario === "multi"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Multiple Children (16 questions, includes sibling & bath dynamics)"
              >
                <Users2 className="w-3.5 h-3.5" />
                <span>{language === "es" ? "Varios Hijos (Hermanos)" : "Multi-Child / Siblings"}</span>
              </button>
            </div>

            {/* Wizard vs Audit Mode Toggle */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center text-xs">
              <button
                onClick={() => setViewMode("wizard")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                  viewMode === "wizard"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Candidate Step-by-Step Experience"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>{language === "es" ? "Paso a Paso" : "Step-by-Step"}</span>
              </button>
              <button
                onClick={() => setViewMode("audit")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                  viewMode === "audit"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Inspect all questions and answers at once"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === "es" ? "Ver Todas" : "Inspect All"}</span>
              </button>
            </div>

            {/* Hourly Rate Inclusion Toggle */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center text-xs">
              <button
                onClick={() => setPreviewAskHourlyRate(!previewAskHourlyRate)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  previewAskHourlyRate
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title={language === "es" ? "Alternar visibilidad del campo tarifa por hora" : "Toggle hourly rate field visibility"}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>
                  {language === "es"
                    ? previewAskHourlyRate
                      ? "Tarifa: Solicitada"
                      : "Tarifa: Omitida"
                    : previewAskHourlyRate
                    ? "Rate: Requested"
                    : "Rate: Omitted"}
                </span>
              </button>
            </div>

            {/* Custom Questions Toggle */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center text-xs">
              <button
                onClick={() => setIncludeCustomQuestions(!includeCustomQuestions)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  includeCustomQuestions
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title={language === "es" ? "Alternar preguntas personalizadas de la familia" : "Toggle family custom questions"}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {language === "es"
                    ? includeCustomQuestions
                      ? "Preguntas Familia: Activas"
                      : "Preguntas Familia: Omitidas"
                    : includeCustomQuestions
                    ? "Custom Qs: Active"
                    : "Custom Qs: Omitted"}
                </span>
              </button>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Explanatory Context Bar */}
      <div className="bg-sky-950/20 border-b border-sky-900/20 px-4 py-2 text-xs text-sky-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="flex items-center gap-2">
            <span className="font-bold text-sky-700">{language === "es" ? "Modo Activo:" : "Active Mode:"}</span>
            <span>
              {childScenario === "multi" ? (
                <>
                  <strong className="font-semibold text-slate-800">
                    {language === "es" ? "Múltiples Hijos (3 años + Bebé)" : "Multi-Child (3yo + Baby)"}
                  </strong>{" "}
                  &mdash; {language === "es"
                    ? "Incluye 3 preguntas avanzadas de atención dividida en tina, asfixia por juguetes cruzados y agresión entre hermanos."
                    : "Includes 3 specialized scenarios on divided bath attention, cross-age toy choking hazards, and sibling aggression."}
                </>
              ) : (
                <>
                  <strong className="font-semibold text-slate-800">
                    {language === "es" ? "Hijo Único (3 años)" : "Single Child (3yo)"}
                  </strong>{" "}
                  &mdash; {language === "es"
                    ? "Cuestionario estándar enfocado en regulación emocional, asfixia AAP y rabietas a los 3 años."
                    : "Standard 13-question questionnaire focused on emotional regulation, AAP choking, and age-3 development."}
                </>
              )}
            </span>
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAutoFillIdeal}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors"
            >
              <Wand2 className="w-3 h-3" />
              <span>{language === "es" ? "Llenar Respuestas Óptimas" : "Fill Ideal Answers"}</span>
            </button>
            <button
              onClick={handleAutoFillMixed}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>{language === "es" ? "Llenar con Banderas Rojas" : "Fill with Red Flags"}</span>
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-1.5 py-0.5 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === "es" ? "Reiniciar" : "Reset"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {simulatedResult ? (
          /* Simulated Scorecard Preview */
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                    {language === "es" ? "Simulación de Evaluación Final" : "Simulated Assessment Outcome"}
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    {language === "es"
                      ? "Ficha Diagnóstica Generada para los Padres"
                      : "Diagnostic Scorecard Generated for Parents"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === "es"
                      ? `Candidata: ${profile.fullName} • Posición: Niñera para ${childScenario === "multi" ? "Leo (3a) & Mateo (1a)" : "Leo (3a)"}`
                      : `Candidate: ${profile.fullName} • Position: Nanny for ${childScenario === "multi" ? "Leo (3yo) & Mateo (1yo)" : "Leo (3yo)"}`}
                  </p>
                </div>

                <button
                  onClick={() => setSimulatedResult(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === "es" ? "Volver al Cuestionario" : "Back to Questionnaire"}</span>
                </button>
              </div>

              {/* Score Gauge & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center md:justify-start">
                  <ScoreGauge score={simulatedResult.overallScore} tier={simulatedResult.tier} />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <h3 className="text-base font-bold text-slate-900">
                    {language === "es" ? "Resumen Diagnóstico" : "Clinical Summary"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {language === "es" && simulatedResult.summaryEs
                      ? simulatedResult.summaryEs
                      : simulatedResult.summary}
                  </p>
                </div>
              </div>

              {/* Red Flags Alert */}
              <RedFlagBanner redFlags={simulatedResult.redFlags} />

              {/* Dimensional Category Breakdown */}
              <CategoryBreakdown categoryScores={simulatedResult.categoryScores} />

              {/* Dynamic Interview Probe Questions */}
              <InterviewGuideCard
                candidateName={profile.fullName}
                questions={simulatedResult.generatedInterviewQuestions}
              />

              {/* Family Custom Questions (Simulated Preview) */}
              {includeCustomQuestions && sampleCustomQuestions.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">
                        {t.customQuestionsReviewTitle}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {language === "es"
                          ? "Respuestas simuladas de la candidata a tus preguntas específicas del hogar."
                          : "Simulated answers from the candidate to your household-specific questions."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-1">
                    {sampleCustomQuestions.map((cq, idx) => {
                      const answerText =
                        customAnswers[cq.id] ||
                        (language === "es"
                          ? "Sin respuesta proporcionada"
                          : "No response provided");

                      return (
                        <div
                          key={cq.id}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                                #{idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {cq.prompt}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 self-start sm:self-auto">
                              {cq.type === "multiple_choice"
                                ? t.typeMultipleChoice
                                : t.typeOpenText}
                            </span>
                          </div>

                          <div className="pl-7">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              {language === "es" ? "Respuesta de la Candidata:" : "Candidate's Response:"}
                            </span>
                            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium">
                              {answerText}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === "audit" ? (
          /* AUDIT MODE: Inspect All Questions At Once */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {language === "es"
                    ? `Auditoría Completa (${displayedQuestions.length} Preguntas)`
                    : `Complete Question Audit (${displayedQuestions.length} Questions)`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === "es"
                    ? "Revisa cada escenario, ponderación de opciones y criterio clínico evaluado."
                    : "Review every scenario, option scoring weight, and pediatric criteria evaluated."}
                </p>
              </div>

              <button
                onClick={() => calculateScorecard()}
                disabled={Object.keys(answers).length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition-all disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === "es" ? "Calcular Ficha Diagnóstica" : "Calculate Scorecard"}</span>
              </button>
            </div>

            <div className="space-y-4">
              {displayedQuestions.map((q, idx) => {
                const questionText = language === "es" && q.questionEs ? q.questionEs : q.question;
                const categoryTitle =
                  language === "es" && q.categoryTitleEs ? q.categoryTitleEs : q.categoryTitle;
                const selectedOptId = answers[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                          #{idx + 1} &bull; {categoryTitle}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                          {questionText}
                        </h3>
                      </div>

                      {q.category === "sibling_and_multichild" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold shrink-0">
                          <Users2 className="w-3 h-3" />
                          {language === "es" ? "Multiniño" : "Multi-Child"}
                        </span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="space-y-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const optText = language === "es" && opt.textEs ? opt.textEs : opt.text;
                        const isSelected = selectedOptId === opt.id;
                        const isBest = opt.score === Math.max(...q.options.map((o) => o.score));

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-colors ${
                              isSelected
                                ? "bg-sky-50 border-sky-500 ring-2 ring-sky-500/20"
                                : "bg-white border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected
                                  ? "bg-sky-600 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>

                            <div className="flex-1 space-y-1">
                              <span className={isSelected ? "font-semibold text-sky-950" : "text-slate-700"}>
                                {optText}
                              </span>

                              {/* Parent diagnostic badge tags */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                                {isBest && (
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    ★ {language === "es" ? "Respuesta Pediátrica Óptima (10 pts)" : "Pediatric Gold Standard (10 pts)"}
                                  </span>
                                )}
                                {opt.isRedFlag && (
                                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    ⚠️ {language === "es" ? "Bandera Roja Clínica" : "Clinical Red Flag"}
                                  </span>
                                )}
                                <span className="text-slate-400">
                                  {language === "es" ? `Puntaje: ${opt.score}/10` : `Weight: ${opt.score}/10`}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Pediatric insight */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">
                        {language === "es" ? "💡 Criterio Evaluado:" : "💡 Clinical Insight:"}
                      </p>
                      <p>{language === "es" && q.psychologicalInsightEs ? q.psychologicalInsightEs : q.psychologicalInsight}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* WIZARD MODE: Candidate Interactive Step-by-Step Experience */
          <div>
            {currentStep === 0 && (
              /* Step 0: Welcome Screen */
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-6 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                      {t.portalTag}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {t.welcomeTitle(profile.fullName)}
                    </h1>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>{t.welcomeP1}</p>
                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200/80 font-bold text-sky-950 flex items-center gap-2">
                    <Baby className="w-5 h-5 text-sky-600 shrink-0" />
                    <span>
                      {childScenario === "multi"
                        ? language === "es"
                          ? "Niñera de Tiempo Completo para Leo (3 años) y Mateo (1 año)"
                          : "Full-Time Nanny for Leo (3yo) & Mateo (1yo)"
                        : language === "es"
                        ? "Niñera de Tiempo Completo para Leo (3 años)"
                        : "Full-Time Nanny for 3yo Leo"}
                    </span>
                  </div>
                  <p>{t.welcomeP2}</p>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
                    <Clock className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                    <span className="font-bold text-slate-900 block">{t.highlight1Title}</span>
                    <span className="text-slate-500 text-[11px]">{t.highlight1Sub}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
                    <Sparkles className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                    <span className="font-bold text-slate-900 block">{t.highlight2Title}</span>
                    <span className="text-slate-500 text-[11px]">{t.highlight2Sub}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
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
            )}

            {currentStep === 1 && (
              /* Step 1: Candidate Background Form */
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                    {t.stepProgress(1, totalSteps)}
                  </span>
                  <h2 className="text-lg font-black text-slate-900">{t.step1Header}</h2>
                </div>

                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t.legalName}
                    </label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
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
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>

                {/* Country of Origin & Country of Residence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t.countryOfOrigin}
                    </label>
                    <select
                      value={profile.countryOfOrigin || defaultCountryCode}
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t.countryOfResidence}
                    </label>
                    <select
                      value={profile.countryOfResidence || defaultCountryCode}
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

                {/* Mobile Phone & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t.mobileNumber}
                    </label>
                    {(() => {
                      const residenceCountry = getCountryByCode(
                        profile.countryOfResidence || defaultCountryCode
                      );
                      return (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shrink-0">
                            <span>{residenceCountry.flag}</span>
                            <span>{profile.phoneDialCode || residenceCountry.dialCode}</span>
                          </div>
                          <input
                            type="tel"
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
                      value={profile.yearsOfExperience}
                      onChange={(e) =>
                        setProfile({ ...profile, yearsOfExperience: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>

                {/* CPR Certification */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.hasCprCertification}
                      onChange={(e) =>
                        setProfile({ ...profile, hasCprCertification: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">{t.cprStatement}</span>
                  </label>
                  {profile.hasCprCertification && (
                    <input
                      type="text"
                      placeholder="e.g. American Red Cross, valid through 2027"
                      value={profile.cprExpirationDate}
                      onChange={(e) =>
                        setProfile({ ...profile, cprExpirationDate: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  )}
                </div>

                {/* Compensation & Start Date (Optional per parent setting) */}
                <div className={`grid grid-cols-1 ${previewAskHourlyRate ? "sm:grid-cols-2" : ""} gap-4 text-xs sm:text-sm`}>
                  {previewAskHourlyRate ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {t.prefRateLabel}
                      </label>
                      <input
                        type="text"
                        value={profile.preferredHourlyRate}
                        onChange={(e) =>
                          setProfile({ ...profile, preferredHourlyRate: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t.startDateLabel}
                    </label>
                    <input
                      type="text"
                      value={profile.availableStartDate}
                      onChange={(e) =>
                        setProfile({ ...profile, availableStartDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.philosophyLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={profile.personalStatement}
                    onChange={(e) => setProfile({ ...profile, personalStatement: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
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
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/25 transition-all active:scale-95"
                  >
                    <span>{t.continueQuestions}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {currentStep >= 2 && currentStep <= displayedQuestions.length + 1 && (
              /* Question Steps */
              (() => {
                const qIdx = currentStep - 2;
                const q = displayedQuestions[qIdx];
                if (!q) return null;

                const selectedOptionId = answers[q.id];
                const isLastQuestion = qIdx === displayedQuestions.length - 1;
                const progressPct = Math.round(((qIdx + 1) / displayedQuestions.length) * 100);

                const categoryTitle =
                  language === "es" && q.categoryTitleEs ? q.categoryTitleEs : q.categoryTitle;
                const questionText = language === "es" && q.questionEs ? q.questionEs : q.question;
                const contextText = language === "es" && q.contextEs ? q.contextEs : q.context;

                return (
                  <div className="space-y-6 animate-in fade-in">
                    {/* Progress Bar & Category Header */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-sky-600 uppercase tracking-wider">
                          {categoryTitle}
                        </span>
                        <span className="font-semibold text-slate-400">
                          {t.questionProgress(qIdx + 1, displayedQuestions.length, progressPct)}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                          {questionText}
                        </h2>
                        {contextText && (
                          <p className="text-xs text-slate-500 italic">
                            {language === "es" ? "Contexto evaluado:" : "Context:"} {contextText}
                          </p>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        {q.options.map((opt, idx) => {
                          const isSelected = selectedOptionId === opt.id;
                          const optionLetter = String.fromCharCode(65 + idx);
                          const optText = language === "es" && opt.textEs ? opt.textEs : opt.text;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectOption(q.id, opt.id)}
                              className={`w-full text-left p-4 sm:p-4.5 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                                isSelected
                                  ? "bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 shadow-sm"
                                  : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                  isSelected
                                    ? "bg-sky-600 text-white"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                }`}
                              >
                                {isSelected ? <CheckCircle2 className="w-4 h-4" /> : optionLetter}
                              </div>

                              <span
                                className={`text-xs sm:text-sm leading-relaxed ${
                                  isSelected ? "text-sky-950 font-semibold" : "text-slate-700"
                                }`}
                              >
                                {optText}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation Controls */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(currentStep - 1)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>{t.previous}</span>
                        </button>

                        <button
                          type="button"
                          disabled={!selectedOptionId}
                          onClick={() => {
                            if (isLastQuestion) {
                              if (includeCustomQuestions && sampleCustomQuestions.length > 0) {
                                setCurrentStep(displayedQuestions.length + 2);
                              } else {
                                calculateScorecard();
                              }
                            } else {
                              setCurrentStep(currentStep + 1);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/25 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isLastQuestion && !includeCustomQuestions ? (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>{language === "es" ? "Ver Ficha Simulada" : "Generate Simulated Scorecard"}</span>
                            </>
                          ) : isLastQuestion && includeCustomQuestions ? (
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
                    </div>
                  </div>
                );
              })()
            )}

            {/* Custom Questions Step in Wizard Mode */}
            {currentStep === displayedQuestions.length + 2 &&
              includeCustomQuestions &&
              sampleCustomQuestions.length > 0 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                          {language === "es" ? "Etapa Final de Preguntas" : "Final Questions Stage"}
                        </span>
                        <h2 className="text-base font-black text-slate-900">
                          {t.customQuestionsCandidateTitle}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {t.customQuestionsCandidateDesc}
                    </p>

                    <div className="space-y-6">
                      {sampleCustomQuestions.map((cq, idx) => {
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
                                      onClick={() =>
                                        setCustomAnswers((prev) => ({ ...prev, [cq.id]: opt }))
                                      }
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
                                  onChange={(e) =>
                                    setCustomAnswers((prev) => ({
                                      ...prev,
                                      [cq.id]: e.target.value,
                                    }))
                                  }
                                  placeholder={t.openTextPlaceholder}
                                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(displayedQuestions.length + 1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t.previous}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => calculateScorecard()}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{language === "es" ? "Ver Ficha Simulada" : "Generate Simulated Scorecard"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </main>
    </div>
  );
}
