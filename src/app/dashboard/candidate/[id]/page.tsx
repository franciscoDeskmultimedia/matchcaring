"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ScoreGauge from "@/components/ScoreGauge";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import RedFlagBanner from "@/components/RedFlagBanner";
import InterviewGuideCard from "@/components/InterviewGuideCard";
import { Candidate, CandidateStatus, User } from "@/lib/types";
import { ASSESSMENT_QUESTIONS } from "@/lib/questions";
import { getCountryByCode } from "@/lib/countries";
import { useLanguage } from "@/components/LanguageContext";
import {
  ArrowLeft,
  Baby,
  Calendar,
  ChevronDown,
  ChevronUp,
  Globe2,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Printer,
  Save,
  ShieldCheck,
} from "lucide-react";

export default function CandidateScorecardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { t, language } = useLanguage();

  const [user, setUser] = useState<User | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<CandidateStatus>("completed");
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const candRes = await fetch(`/api/candidates/${id}`);
      if (!candRes.ok) {
        alert(language === "es" ? "Candidata no encontrada." : "Candidate not found.");
        router.push("/dashboard");
        return;
      }
      const candData = await candRes.json();
      setCandidate(candData.candidate);
      setNotes(candData.candidate.parentNotes || "");
      setStatus(candData.candidate.status || "completed");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: CandidateStatus) => {
    setStatus(newStatus);
    try {
      await fetch(`/api/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await fetch(`/api/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentNotes: notes }),
      });
    } catch (err) {
      console.error("Notes save error:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!candidate) return null;

  const result = candidate.result;
  const tierLabel =
    language === "es" && result?.tierEs ? result.tierEs : result?.tier;
  const summaryText =
    language === "es" && result?.summaryEs ? result.summaryEs : result?.summary;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToCandidates}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
              <span className="text-slate-400 font-normal">{t.statusLabel}</span>
              <select
                value={status}
                onChange={(e) => handleUpdateStatus(e.target.value as CandidateStatus)}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
              >
                <option value="completed">
                  {language === "es" ? "Evaluación Completada" : "Completed Assessment"}
                </option>
                <option value="under_review">
                  {language === "es" ? "En Revisión" : "Under Review"}
                </option>
                <option value="interview_scheduled">
                  {language === "es" ? "Entrevista Agendada" : "Interview Scheduled"}
                </option>
                <option value="hired">
                  {language === "es" ? "Contratada 🎉" : "Hired 🎉"}
                </option>
                <option value="rejected">
                  {language === "es" ? "No Seleccionada" : "Not Moving Forward"}
                </option>
              </select>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>{t.printPdf}</span>
            </button>
          </div>
        </div>

        {/* Candidate Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md shadow-sky-600/20">
                {candidate.name.charAt(0)}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {candidate.name}
                  </h1>
                  {result && (
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                        result.tier === "Exceptional Fit"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : result.tier === "High Risk / Not Recommended"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {tierLabel}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {candidate.roleTarget}
                </p>

                {/* Target Children Badges */}
                {candidate.targetChildren && candidate.targetChildren.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {language === "es" ? "Cuidando a:" : "Caring for:"}
                    </span>
                    {candidate.targetChildren.map((kid) => (
                      <span
                        key={kid.id}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                      >
                        <Baby className="w-3 h-3 text-amber-600" />
                        {kid.name} ({kid.age} {language === "es" ? "años" : "yo"})
                      </span>
                    ))}
                  </div>
                )}

                {/* Contact & Country Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                  {candidate.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {candidate.phone}
                    </span>
                  )}
                  {candidate.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {candidate.email}
                    </span>
                  )}
                  {candidate.profile?.countryOfOrigin && (
                    <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                      <Globe2 className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-500">{language === "es" ? "Origen:" : "Origin:"}</span>
                      <span>
                        {getCountryByCode(candidate.profile.countryOfOrigin).flag}{" "}
                        {language === "es"
                          ? getCountryByCode(candidate.profile.countryOfOrigin).nameEs
                          : getCountryByCode(candidate.profile.countryOfOrigin).nameEn}
                      </span>
                    </span>
                  )}
                  {candidate.profile?.countryOfResidence && (
                    <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-500">{language === "es" ? "Residencia:" : "Residence:"}</span>
                      <span>
                        {getCountryByCode(candidate.profile.countryOfResidence).flag}{" "}
                        {language === "es"
                          ? getCountryByCode(candidate.profile.countryOfResidence).nameEs
                          : getCountryByCode(candidate.profile.countryOfResidence).nameEn}
                      </span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {language === "es" ? "Enviado:" : "Submitted:"}{" "}
                    {result?.completedAt
                      ? new Date(result.completedAt).toLocaleDateString()
                      : (language === "es" ? "Pendiente" : "Pending")}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Score Badge */}
            {result && (
              <div className="shrink-0 flex justify-center md:justify-end">
                <ScoreGauge
                  score={result.overallScore}
                  tier={tierLabel as any}
                  size="lg"
                  hasRedFlags={result.redFlags.length > 0}
                />
              </div>
            )}
          </div>

          {/* Candidate Profile Details (Bio, CPR, Experience) */}
          {candidate.profile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                  {t.toddlerExperience}
                </span>
                <span className="text-slate-900 font-bold text-sm">
                  {candidate.profile.yearsOfExperience} {language === "es" ? "Años" : "Years"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                  {t.cprFirstAid}
                </span>
                <span className="font-bold text-sm flex items-center gap-1 text-slate-900">
                  {candidate.profile.hasCprCertification ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />{" "}
                      {language === "es" ? "Certificada" : "Certified"}
                    </span>
                  ) : (
                    <span className="text-rose-700">
                      {language === "es" ? "Sin Certificado" : "Not Certified"}
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                  {t.targetRate}
                </span>
                {candidate.askHourlyRate === false ? (
                  <span className="text-slate-500 font-medium text-xs italic block pt-0.5">
                    {language === "es" ? "No solicitado por la familia" : "Not requested by family"}
                  </span>
                ) : (
                  <span className="text-slate-900 font-bold text-sm">
                    {candidate.profile.preferredHourlyRate || (language === "es" ? "A convenir" : "Negotiable")}
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                  {t.startDate}
                </span>
                <span className="text-slate-900 font-bold text-sm">
                  {candidate.profile.availableStartDate || (language === "es" ? "Flexible" : "Flexible")}
                </span>
              </div>

              {candidate.profile.personalStatement && (
                <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/50">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px] mb-1">
                    {t.personalPhilosophy}
                  </span>
                  <p className="text-slate-700 italic">
                    &ldquo;{candidate.profile.personalStatement}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Diagnostic Clinical Summary */}
          {result && (
            <div className="p-4 sm:p-5 rounded-xl bg-sky-50/60 border border-sky-200 text-xs sm:text-sm text-sky-950 leading-relaxed">
              <span className="font-extrabold text-sky-900 uppercase tracking-wider block mb-1 text-xs">
                {t.clinicalSummaryTitle}
              </span>
              {summaryText}
            </div>
          )}
        </div>

        {/* Family Custom Questions & Candidate Answers Card */}
        {((candidate.customQuestions && candidate.customQuestions.length > 0) ||
          (candidate.customAnswers && candidate.customAnswers.length > 0)) && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
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
                    ? "Respuestas directas de la niñera a las consultas particulares configuradas por la familia."
                    : "Direct answers provided by the nanny to household-specific questions configured by the family."}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {(candidate.customQuestions || []).map((cq, idx) => {
                const answerObj = candidate.customAnswers?.find(
                  (ca) => ca.questionId === cq.id
                );
                const answerText =
                  answerObj?.answer ||
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

        {/* Red Flags Alert Section */}
        {result && <RedFlagBanner redFlags={result.redFlags} />}

        {/* Dimensional Competency Breakdown */}
        {result && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {t.psychBreakdownTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.psychBreakdownDesc}
              </p>
            </div>

            <CategoryBreakdown categoryScores={result.categoryScores} />
          </div>
        )}

        {/* Tailored Interview Guide */}
        {result && (
          <InterviewGuideCard
            questions={result.generatedInterviewQuestions}
            candidateName={candidate.name}
          />
        )}

        {/* Expandable Question-by-Question Deep Dive */}
        {result && candidate.responses && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowAllQuestions(!showAllQuestions)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.questionAuditTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.questionAuditDesc(candidate.name)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                {showAllQuestions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            {showAllQuestions && (
              <div className="p-6 border-t border-slate-100 divide-y divide-slate-100 space-y-6">
                {ASSESSMENT_QUESTIONS.map((q, idx) => {
                  const userResponse = candidate.responses?.find((r) => r.questionId === q.id);
                  const selectedOpt = q.options.find((o) => o.id === userResponse?.selectedOptionId);
                  const idealOpt = q.options.reduce((best, curr) => (curr.score > best.score ? curr : best), q.options[0]);
                  const isMatch = selectedOpt?.id === idealOpt.id;

                  const questionText = (language === "es" && q.questionEs) ? q.questionEs : q.question;
                  const catTitle = (language === "es" && q.categoryTitleEs) ? q.categoryTitleEs : q.categoryTitle;
                  const selectedText = selectedOpt
                    ? (language === "es" && selectedOpt.textEs ? selectedOpt.textEs : selectedOpt.text)
                    : (language === "es" ? "Sin respuesta" : "No answer provided");
                  const idealText = (language === "es" && idealOpt.textEs) ? idealOpt.textEs : idealOpt.text;
                  const insight = (language === "es" && q.psychologicalInsightEs) ? q.psychologicalInsightEs : q.psychologicalInsight;
                  const idealExplanation = (language === "es" && q.idealAnswerExplanationEs) ? q.idealAnswerExplanationEs : q.idealAnswerExplanation;

                  return (
                    <div key={q.id} className="pt-6 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          {language === "es" ? "Pregunta" : "Question"} {idx + 1} &bull; {catTitle}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isMatch
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : selectedOpt?.isRedFlag
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {language === "es" ? "Puntaje:" : "Score:"} {selectedOpt?.score ?? 0}/10
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900">{questionText}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div
                          className={`p-3 rounded-xl border ${
                            isMatch
                              ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                              : selectedOpt?.isRedFlag
                              ? "bg-rose-50/50 border-rose-200 text-rose-950"
                              : "bg-amber-50/50 border-amber-200 text-amber-950"
                          }`}
                        >
                          <span className="font-bold block mb-1">
                            {t.candidateSelected}
                          </span>
                          <p>{selectedText}</p>
                        </div>

                        {!isMatch && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                            <span className="font-bold text-sky-800 block mb-1">
                              {t.recommendedGoldStandard}
                            </span>
                            <p>{idealText}</p>
                          </div>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1">
                        <p>
                          <strong className="text-slate-800">{t.pediatricInsight}</strong>{" "}
                          {insight}
                        </p>
                        <p className="text-slate-500 italic">
                          {t.idealRationale} {idealExplanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Private Parent Notes Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4 no-print">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.privateNotesTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.privateNotesDesc}
              </p>
            </div>
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingNotes ? t.saving : t.saveNotes}</span>
            </button>
          </div>

          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            className="w-full p-3.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>
      </main>
    </div>
  );
}
