"use client";

import { MessagesSquare, Sparkles } from "lucide-react";
import { useLanguage } from "./LanguageContext";

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
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 p-5 sm:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
            <MessagesSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {t.tailoredInterviewTitle}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                {language === "es" ? "IA-Diagnóstico" : "AI-Diagnostic"}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {t.tailoredInterviewDesc(candidateName)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {questions.map((q, idx) => {
          const topic = (language === "es" && q.topicEs) ? q.topicEs : q.topic;
          const questionText = (language === "es" && q.suggestedQuestionEs) ? q.suggestedQuestionEs : q.suggestedQuestion;
          const rationale = (language === "es" && q.rationaleEs) ? q.rationaleEs : q.rationale;

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-700 uppercase tracking-wider text-[11px]">
                  {q.category} &bull; {topic}
                </span>
                <span className="text-slate-400 font-medium">
                  {language === "es" ? "Pregunta #" : "Probe #"}{idx + 1}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-900 leading-snug">
                &ldquo;{questionText}&rdquo;
              </p>

              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">{t.whatToLookFor}</span>{" "}
                {rationale}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
