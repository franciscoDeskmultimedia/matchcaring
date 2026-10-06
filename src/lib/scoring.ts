import {
  AssessmentResult,
  CandidateResponse,
  CategoryScore,
  QuestionCategory,
  RedFlagAlert,
} from "./types";
import { ASSESSMENT_QUESTIONS } from "./questions";
import {
  calculatePsychometricReport,
  getQuestionsForSelectedBatteries,
} from "./psychometricBatteries";

const CATEGORY_META: Record<
  QuestionCategory,
  { title: string; titleEs: string; weight: number }
> = {
  psychological_temperament: {
    title: "Psychological Temperament & Emotional Regulation",
    titleEs: "Temperamento Psicológico y Regulación Emocional",
    weight: 0.25,
  },
  safety_and_emergency: {
    title: "Critical Safety, CPR & Emergency Protocols",
    titleEs: "Seguridad Crítica, RCP y Protocolos de Emergencia",
    weight: 0.25,
  },
  toddler_development_age3: {
    title: "Toddler Behavior & Age-3 Developmental Care",
    titleEs: "Conducta y Desarrollo Infantil a los 3 Años",
    weight: 0.20,
  },
  ethics_and_professionalism: {
    title: "Ethics, Professional Boundaries & Reliability",
    titleEs: "Ética, Límites Profesionales y Confiabilidad",
    weight: 0.15,
  },
  situational_judgment: {
    title: "Situational Judgment & Critical Thinking",
    titleEs: "Juicio Situacional y Pensamiento Crítico",
    weight: 0.15,
  },
  sibling_and_multichild: {
    title: "Multi-Child Supervision & Sibling Dynamics",
    titleEs: "Supervisión de Múltiples Niños y Dinámica entre Hermanos",
    weight: 0.15,
  },
};

export function evaluateAssessment(
  responses: CandidateResponse[],
  selectedBatteryIds?: string[]
): AssessmentResult {
  const responseMap = new Map<string, string>();
  responses.forEach((r) => responseMap.set(r.questionId, r.selectedOptionId));

  const categoryTotals: Record<QuestionCategory, { earned: number; max: number }> = {
    psychological_temperament: { earned: 0, max: 0 },
    safety_and_emergency: { earned: 0, max: 0 },
    toddler_development_age3: { earned: 0, max: 0 },
    ethics_and_professionalism: { earned: 0, max: 0 },
    situational_judgment: { earned: 0, max: 0 },
    sibling_and_multichild: { earned: 0, max: 0 },
  };

  const redFlags: RedFlagAlert[] = [];
  const missedQuestions: {
    questionText: string;
    questionTextEs: string;
    categoryTitle: string;
    categoryTitleEs: string;
    userAnswerText: string;
    userAnswerTextEs: string;
    idealAnswerText: string;
    idealAnswerTextEs: string;
    followUp: string;
    followUpEs: string;
    insight: string;
    insightEs: string;
  }[] = [];

  const allQuestionsToScore = getQuestionsForSelectedBatteries(
    selectedBatteryIds,
    ASSESSMENT_QUESTIONS
  );

  for (const q of allQuestionsToScore) {
    const selectedOptionId = responseMap.get(q.id);
    const maxOptionScore = Math.max(...q.options.map((o) => o.score));
    const selectedOption = q.options.find((o) => o.id === selectedOptionId);
    const idealOption = q.options.find((o) => o.score === maxOptionScore) || q.options[0];

    // Only count questions in max if the question was presented / answered
    if (selectedOptionId !== undefined) {
      categoryTotals[q.category].max += maxOptionScore;
    }

    if (selectedOption) {
      categoryTotals[q.category].earned += selectedOption.score;

      if (selectedOption.isRedFlag) {
        redFlags.push({
          questionId: q.id,
          questionText: q.question,
          questionTextEs: q.questionEs || q.question,
          candidateAnswerText: selectedOption.text,
          candidateAnswerTextEs: selectedOption.textEs || selectedOption.text,
          severity: selectedOption.score === 0 ? "critical" : "high",
          reason: selectedOption.redFlagReason || "Violates standard safety or psychological guidelines.",
          reasonEs: selectedOption.redFlagReasonEs || "Contradice las normas pediátricas de seguridad y bienestar.",
          recommendedProbe: q.followUpInterviewQuestion,
          recommendedProbeEs: q.followUpInterviewQuestionEs || q.followUpInterviewQuestion,
        });
      }

      if (selectedOption.score < maxOptionScore * 0.7) {
        missedQuestions.push({
          questionText: q.question,
          questionTextEs: q.questionEs || q.question,
          categoryTitle: q.categoryTitle,
          categoryTitleEs: q.categoryTitleEs || q.categoryTitle,
          userAnswerText: selectedOption.text,
          userAnswerTextEs: selectedOption.textEs || selectedOption.text,
          idealAnswerText: idealOption.text,
          idealAnswerTextEs: idealOption.textEs || idealOption.text,
          followUp: q.followUpInterviewQuestion,
          followUpEs: q.followUpInterviewQuestionEs || q.followUpInterviewQuestion,
          insight: q.psychologicalInsight,
          insightEs: q.psychologicalInsightEs || q.psychologicalInsight,
        });
      }
    }
  }

  // Calculate percentage scores for each category and normalize weights across active categories
  const categoryScores: Record<QuestionCategory, CategoryScore> = {} as any;
  
  // Find active categories (where questions were answered)
  const activeCategories = (Object.keys(CATEGORY_META) as QuestionCategory[]).filter(
    (k) => categoryTotals[k].max > 0
  );
  
  const totalRawWeight = activeCategories.reduce(
    (acc, k) => acc + CATEGORY_META[k].weight,
    0
  );

  let overallWeightedSum = 0;

  for (const catKey of Object.keys(CATEGORY_META) as QuestionCategory[]) {
    const { title, titleEs, weight } = CATEGORY_META[catKey];
    const { earned, max } = categoryTotals[catKey];
    const pct = max > 0 ? Math.round((earned / max) * 100) : 100;
    const normalizedWeight = totalRawWeight > 0 ? weight / totalRawWeight : 0;

    if (max > 0) {
      overallWeightedSum += pct * normalizedWeight;
    }

    let rating: CategoryScore["rating"] = "Solid";
    let ratingEs = "Sólido";
    let feedback = "";
    let feedbackEs = "";
    const strengths: string[] = [];
    const strengthsEs: string[] = [];
    const watchouts: string[] = [];
    const watchoutsEs: string[] = [];

    if (pct >= 90) {
      rating = "Exceptional";
      ratingEs = "Sobresaliente";
      feedback = `Demonstrates mastery and instinctual alignment with gold-standard practices in ${title.toLowerCase()}.`;
      feedbackEs = `Demuestra dominio y alineación instintiva con las mejores prácticas en ${titleEs.toLowerCase()}.`;
      strengths.push("Intuitive alignment with modern authoritative parenting & pediatric safety");
      strengthsEs.push("Alineación intuitiva con la crianza respetuosa y seguridad pediátrica");
      strengths.push("Calm, non-reactive behavioral reflexes under toddler stress");
      strengthsEs.push("Reflejos tranquilos y no reactivos ante el estrés infantil");
    } else if (pct >= 75) {
      rating = "Solid";
      ratingEs = "Sólido";
      feedback = `Solid working knowledge in ${title.toLowerCase()}, suitable for standard daily supervision with minor guidance.`;
      feedbackEs = `Conocimientos sólidos en ${titleEs.toLowerCase()}, apta para supervisión diaria con orientación menor.`;
      strengths.push("Reliable core competencies and safety awareness");
      strengthsEs.push("Competencias básicas confiables y buen sentido de seguridad");
      watchouts.push("Occasional minor hesitation or compromise under extreme situations");
      watchoutsEs.push("Cierta duda o vacilación en situaciones límite");
    } else if (pct >= 55) {
      rating = "Needs Attention";
      ratingEs = "Requiere Atención";
      feedback = `Notable inconsistencies in ${title.toLowerCase()}. Requires explicit clarification during face-to-face interview.`;
      feedbackEs = `Inconsistencias notables en ${titleEs.toLowerCase()}. Requiere aclaración en la entrevista presencial.`;
      watchouts.push("Sub-optimal responses in stress-inducing or developmental friction scenarios");
      watchoutsEs.push("Respuestas subóptimas en momentos de fricción del desarrollo");
      watchouts.push("Parental rules may need close monitoring and explicit guardrails");
      watchoutsEs.push("Las normas familiares requerirán supervisión cercana");
    } else {
      rating = "High Risk";
      ratingEs = "Alto Riesgo";
      feedback = `High probability of conflict, safety oversight, or emotional frustration in ${title.toLowerCase()}.`;
      feedbackEs = `Alta probabilidad de conflicto, descuido de seguridad o frustración en ${titleEs.toLowerCase()}.`;
      watchouts.push("Answered with punitive or high-risk choices");
      watchoutsEs.push("Respondió con opciones punitivas o de alto riesgo");
      watchouts.push("Potentially unsuited without intensive formal retraining");
      watchoutsEs.push("Potencialmente no apta sin reentrenamiento intensivo previo");
    }

    categoryScores[catKey] = {
      category: catKey,
      title,
      titleEs,
      score: pct,
      rating,
      ratingEs,
      feedback,
      feedbackEs,
      strengths,
      strengthsEs,
      watchouts,
      watchoutsEs,
    };
  }

  const overallScore = Math.round(overallWeightedSum);

  // Determine overall tier
  let tier: AssessmentResult["tier"] = "Strong Candidate";
  let tierEs = "Candidata Sólida";
  const criticalFlagsCount = redFlags.filter((f) => f.severity === "critical").length;

  if (criticalFlagsCount > 0 || overallScore < 55) {
    tier = "High Risk / Not Recommended";
    tierEs = "Alto Riesgo / No Recomendada";
  } else if (redFlags.length > 1 || overallScore < 70) {
    tier = "Proceed with Caution";
    tierEs = "Proceder con Cautela";
  } else if (overallScore >= 88 && redFlags.length === 0) {
    tier = "Exceptional Fit";
    tierEs = "Alineación Excepcional";
  } else {
    tier = "Strong Candidate";
    tierEs = "Candidata Sólida";
  }

  // Generate dynamic interview questions
  const generatedInterviewQuestions: AssessmentResult["generatedInterviewQuestions"] = [];

  // Add questions for red flags first
  for (const rf of redFlags) {
    generatedInterviewQuestions.push({
      category: "Red Flag Clarification",
      topic: rf.questionText.slice(0, 45) + "...",
      topicEs: (rf.questionTextEs || rf.questionText).slice(0, 45) + "...",
      suggestedQuestion: rf.recommendedProbe,
      suggestedQuestionEs: rf.recommendedProbeEs || rf.recommendedProbe,
      rationale: `Candidate selected: "${rf.candidateAnswerText.slice(0, 80)}...". Need to verify if this was misunderstanding or actual habit.`,
      rationaleEs: `La candidata respondió: "${(rf.candidateAnswerTextEs || rf.candidateAnswerText).slice(0, 80)}...". Verificar si fue confusión o costumbre real.`,
    });
  }

  // Add questions for missed items
  for (const m of missedQuestions) {
    if (generatedInterviewQuestions.length >= 6) break;
    if (!generatedInterviewQuestions.some((q) => q.suggestedQuestion === m.followUp)) {
      generatedInterviewQuestions.push({
        category: m.categoryTitle,
        topic: m.questionText.slice(0, 45) + "...",
        topicEs: m.questionTextEs.slice(0, 45) + "...",
        suggestedQuestion: m.followUp,
        suggestedQuestionEs: m.followUpEs,
        rationale: m.insight,
        rationaleEs: m.insightEs,
      });
    }
  }

  // If candidate was exceptional and had no missed questions, give standard behavioral depth probes
  if (generatedInterviewQuestions.length === 0) {
    generatedInterviewQuestions.push(
      {
        category: "Psychological Stability",
        topic: "End-of-day Fatigue & Emotional Anchoring",
        topicEs: "Fatiga al final del día y ancla emocional",
        suggestedQuestion:
          "On days when a 3-year-old skips their nap and is melting down repeatedly between 4 PM and 6 PM, what is your personal strategy to keep your own voice soft and calm?",
        suggestedQuestionEs:
          "En días en que el niño de 3 años no duerme su siesta y tiene rabietas continuas entre las 4 y 6 PM, ¿cuál es tu estrategia personal para mantener tu voz suave y en calma?",
        rationale: "Assesses stamina and somatic self-regulation strategies.",
        rationaleEs: "Evalúa la resistencia física y estrategias de autorregulación somática.",
      },
      {
        category: "Safety Protocols",
        topic: "Household Emergency Drills",
        topicEs: "Simulacro de emergencias en el hogar",
        suggestedQuestion:
          "If the child has a high fever or sudden illness while parents are unreachable in transit, what are your exact communication and medical triage steps?",
        suggestedQuestionEs:
          "Si el niño presenta fiebre alta o malestar repentino mientras los padres están incomunicados en tránsito, ¿cuáles son tus pasos de triaje médico y comunicación?",
        rationale: "Assesses operational independence in unforeseen emergencies.",
        rationaleEs: "Evalúa la autonomía operativa ante emergencias inesperadas.",
      },
      {
        category: "Early Childhood Pedagogy",
        topic: "Fostering Autonomy at Age 3",
        topicEs: "Fomentar la autonomía a los 3 años",
        suggestedQuestion:
          "At age 3, toddlers want to 'do it myself' for dressing and shoes, which often takes 20 minutes. How do you balance their independence with our morning schedule?",
        suggestedQuestionEs:
          "A los 3 años, los niños insisten en 'hacerlo yo solo' al vestirse, lo que puede tardar 20 minutos. ¿Cómo equilibras su autonomía con el horario familiar de la mañana?",
        rationale: "Assesses patience with developmental autonomy versus rushing.",
        rationaleEs: "Evalúa la paciencia con la autonomía del desarrollo frente a las prisas.",
      }
    );
  }

  let summary = "";
  let summaryEs = "";

  if (tier === "Exceptional Fit") {
    summary = `Candidate scored ${overallScore}/100 with zero safety red flags. Demonstrates superior emotional regulation, non-punitive developmental awareness for a 3-year-old, and strict pediatric safety protocols. Strongly recommended for an in-person trial.`;
    summaryEs = `La candidata obtuvo ${overallScore}/100 sin banderas rojas de seguridad. Demuestra autorregulación emocional superior, enfoque no punitivo para niños de 3 años y estricto apego a protocolos pediátricos. Altamente recomendada para prueba presencial.`;
  } else if (tier === "Strong Candidate") {
    summary = `Candidate scored ${overallScore}/100. Demonstrates strong day-to-day competencies and child-centered intuition. Review the minor areas noted in the scorecard during the face-to-face interview.`;
    summaryEs = `La candidata obtuvo ${overallScore}/100. Demuestra competencias sólidas para el día a día y buena intuición infantil. Revisar los puntos menores señalados en la ficha durante la entrevista presencial.`;
  } else if (tier === "Proceed with Caution") {
    summary = `Candidate scored ${overallScore}/100 and triggered ${redFlags.length} safety or behavioral watchout(s). While they possess basic skills, their responses indicate potential friction regarding discipline or safety boundaries that require strict verification.`;
    summaryEs = `La candidata obtuvo ${overallScore}/100 y activó ${redFlags.length} alerta(s) de seguridad o conducta. Aunque posee habilidades básicas, sus respuestas señalan posibles fricciones en disciplina o límites de seguridad que exigen verificación estricta.`;
  } else {
    summary = `CRITICAL WARNING: Candidate scored ${overallScore}/100 and triggered ${criticalFlagsCount} critical red flag(s). Their responses indicate views on discipline or emergency safety that pose risks for a 3-year-old. Not recommended without extensive verification.`;
    summaryEs = `ADVERTENCIA CRÍTICA: La candidata obtuvo ${overallScore}/100 y activó ${criticalFlagsCount} bandera(s) roja(s) crítica(s). Sus respuestas reflejan criterios de disciplina o seguridad que representan riesgos para un niño de 3 años. No se recomienda sin verificación exhaustiva.`;
  }

  const psychometricReport = calculatePsychometricReport(
    responses,
    selectedBatteryIds && selectedBatteryIds.length > 0 ? selectedBatteryIds : ["sjt_base"]
  );

  return {
    overallScore,
    tier,
    tierEs,
    summary,
    summaryEs,
    categoryScores,
    redFlags,
    generatedInterviewQuestions,
    psychometricReport,
    completedAt: new Date().toISOString(),
  };
}
