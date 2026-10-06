"use client";

import { MessagesSquare, Sparkles, ChevronRight } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { motion } from "framer-motion";

interface InterviewQuestion {
  category: string;
  topic: string;
  topicEs?: string;
  suggestedQuestion: string;
  suggestedQuestionEs?: string;
  rationale: string;
  rationaleEs?: string;
}

interface InterviewGuideCardProps {
  questions: InterviewQuestion[];
  candidateName: string;
}

export default function InterviewGuideCard({
  questions,
  candidateName,
}: InterviewGuideCardProps) {
  const { t, language } = useLanguage();

  if (!questions || questions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/60 p-6 sm:p-7 space-y-5 shadow-sm relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/25">
            <MessagesSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {t.tailoredInterviewTitle}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100/80 text-indigo-800 border border-indigo-200 shadow-2xs">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                {language === "es" ? "IA-Diagnóstico" : "AI-Diagnostic"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {t.tailoredInterviewDesc(candidateName)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-1 relative z-10">
        {questions.map((q, idx) => {
          const topic = (language === "es" && q.topicEs) ? q.topicEs : q.topic;
          const questionText = (language === "es" && q.suggestedQuestionEs) ? q.suggestedQuestionEs : q.suggestedQuestion;
          const rationale = (language === "es" && q.rationaleEs) ? q.rationaleEs : q.rationale;

          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-2.5 card-hover-lift"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-indigo-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                  {q.category} &bull; {topic}
                </span>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {language === "es" ? "Pregunta #" : "Probe #"}{idx + 1}
                </span>
              </div>

              <p className="text-sm font-bold text-slate-900 leading-snug">
                &ldquo;{questionText}&rdquo;
              </p>

              <div className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-100 flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-slate-800">{t.whatToLookFor}</strong>{" "}
                  {rationale}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

