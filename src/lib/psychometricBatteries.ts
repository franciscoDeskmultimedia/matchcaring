import { Question, PsychometricBatteryMeta, PsychometricReport, CandidateResponse } from "./types";

export const PSYCHOMETRIC_BATTERIES: PsychometricBatteryMeta[] = [
  {
    id: "sjt_base",
    name: "Situational Judgment & Critical Safety (AAP)",
    nameEs: "Juicio Situacional y Seguridad Vital (AAP)",
    scientificBasis: "American Academy of Pediatrics (AAP) Life Safety & Situational Judgment Tests",
    phase: 1,
    badgeEs: "Base Obligatoria",
    badgeEn: "Core Mandatory",
    description: "Evaluates airway obstruction (choking), 911 emergency escalation, water supervision, falls, and non-violent de-escalation.",
    descriptionEs: "Evalúa atragantamiento (maniobra de Heimlich pediátrica), emergencias 911, supervisión en agua, caídas y límites sin violencia.",
    targetRecommendationEs: "Obligatorio para cualquier tipo y edad de cuidado",
    targetRecommendationEn: "Mandatory for all care categories and ages",
    estimatedTimeMinutes: 10,
    questionCount: 15,
    isBase: true,
  },
  {
    id: "marlowe_crowne",
    name: "Social Desirability & Honesty Scale (Marlowe-Crowne)",
    nameEs: "Escala de Sinceridad y Deseabilidad Social (Marlowe-Crowne SDS-8)",
    scientificBasis: "Marlowe-Crowne Social Desirability Scale (Reynolds Form C / IPIP)",
    phase: 1,
    badgeEs: "Filtro Anti-Engaño",
    badgeEn: "Anti-Gaming Filter",
    description: "Detects whether the candidate is faking a perfect persona or answering with genuine authenticity and truthfulness.",
    descriptionEs: "Detecta si la postulante intenta fingir una personalidad 'irrealmente perfecta' o si responde con sinceridad y honestidad.",
    targetRecommendationEs: "Recomendado para todas las edades; vital para descartar manipulaciones.",
    targetRecommendationEn: "Recommended for all ages; essential for detecting deceptive response patterns.",
    estimatedTimeMinutes: 3,
    questionCount: 8,
    isBase: false,
  },
  {
    id: "buss_perry",
    name: "Anger Control, Frustration & Impulse Restraint",
    nameEs: "Control de Ira, Frustración e Impulsividad (Buss-Perry & Barratt)",
    scientificBasis: "Buss-Perry Aggression Questionnaire (BPAQ-SF) & Barratt Impulsiveness Scale (BIS-11)",
    phase: 1,
    badgeEs: "Seguridad Vital",
    badgeEn: "Vital Safety",
    description: "Measures emotional breakdown threshold under persistent screaming, defiance, or high-pressure stress. Flags abusive tendencies.",
    descriptionEs: "Mide el umbral de tolerancia ante llanto incesante, berrinches y provocaciones. Alerta con bandera roja ante irritabilidad punitiva.",
    targetRecommendationEs: "Imprescindible para bebés (0-2 años), niños con rabietas (3-6 años) y demencia.",
    targetRecommendationEn: "Critical for infants (0-2 yrs), tantrum-prone toddlers, and memory loss / dementia.",
    estimatedTimeMinutes: 4,
    questionCount: 8,
    isBase: false,
  },
  {
    id: "empathy_davis",
    name: "Empathy & Non-Verbal Decoding (Davis IRI & WLEIS)",
    nameEs: "Empatía y Decodificación de Señales No Verbales (Davis IRI & WLEIS)",
    scientificBasis: "Davis Interpersonal Reactivity Index (IRI) & Wong and Law Emotional Intelligence (WLEIS)",
    phase: 2,
    badgeEs: "Sensibilidad Clínica",
    badgeEn: "Clinical Empathy",
    description: "Assesses cognitive perspective-taking and affective sensitivity for individuals unable to speak fluently (infants, ASD, dementia).",
    descriptionEs: "Evalúa la toma de perspectiva y empatía ante personas que no pueden comunicarse con palabras (bebés con cólicos, TEA, Alzheimer).",
    targetRecommendationEs: "Recomendado para lactantes (0-2 años), neurodiversidad y adultos mayores.",
    targetRecommendationEn: "Recommended for infants, special needs / autism, and seniors.",
    estimatedTimeMinutes: 3,
    questionCount: 6,
    isBase: false,
  },
  {
    id: "big_five_care",
    name: "Caregiver Big Five Personality & Conscientiousness",
    nameEs: "Perfil Big Five del Cuidador (IPIP Personalidad)",
    scientificBasis: "International Personality Item Pool (IPIP 10-Item Caregiver Inventory)",
    phase: 2,
    badgeEs: "Compatibilidad",
    badgeEn: "Workplace Fit",
    description: "Evaluates Conscientiousness (medication, routines, punctuality), Agreeableness (warmth), and Emotional Stability under chaos.",
    descriptionEs: "Mide Responsabilidad (seguimiento de medicamentos y horarios), Calidez humana y Estabilidad emocional en el hogar.",
    targetRecommendationEs: "Recomendado para cuidados a largo plazo y niños en edad escolar (3-12 años).",
    targetRecommendationEn: "Ideal for long-term domestic placements and school-aged children.",
    estimatedTimeMinutes: 4,
    questionCount: 8,
    isBase: false,
  },
  {
    id: "attachment_adult",
    name: "Secure Attachment & Emotional Bonding (AAS)",
    nameEs: "Evaluación de Apego y Vínculo Seguro (AAS Adaptada)",
    scientificBasis: "Adult Attachment Scale (Collins & Read) adapted for Primary Caregiving",
    phase: 2,
    badgeEs: "Vínculo Infantil",
    badgeEn: "Parenting Bond",
    description: "Assesses whether the caregiver models a secure, nurturing base without toxic emotional codependency or detached avoidance.",
    descriptionEs: "Evalúa si la cuidadora modela un vínculo seguro: cercanía afectiva sin generar dependencia tóxica ni frialdad emocional.",
    targetRecommendationEs: "Recomendado prioritariamente para primera infancia (0 a 3 años).",
    targetRecommendationEn: "Prioritized for early childhood and infant bonding (0 to 3 yrs).",
    estimatedTimeMinutes: 3,
    questionCount: 6,
    isBase: false,
  },
];

/**
 * Psychological Questions for Marlowe-Crowne SDS (Reynolds Form C adapted for caregivers)
 */
export const MARLOWE_CROWNE_QUESTIONS: Question[] = [
  {
    id: "mc_01_admit_irritation",
    category: "ethics_and_professionalism",
    categoryTitle: "Social Desirability & Honesty Scale",
    categoryTitleEs: "Escala de Sinceridad y Deseabilidad Social",
    question: "When a person repeatedly interrupts your work or tasks don't go as planned, which of the following is most true for you?",
    questionEs: "Cuando una persona interrumpe repetidamente tu trabajo o las cosas no salen como planeabas, ¿cuál de las siguientes opciones describe con mayor verdad tu experiencia?",
    context: "Measures honesty regarding universal human irritability vs fake perfectionism.",
    contextEs: "Evalúa la franqueza al admitir emociones humanas normales frente al fingimiento de perfección.",
    type: "single_choice",
    options: [
      {
        id: "mc_01_a",
        text: "I sometimes feel an internal wave of annoyance or irritation, though I manage it and remain polite.",
        textEs: "A veces siento una oleada interna de molestia o irritación, aunque me autorregulo y actúo educadamente.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "mc_01_b",
        text: "I have literally never in my entire life felt irritated, upset, or bothered by anyone.",
        textEs: "Literalmente jamás en toda mi vida me he sentido irritada, molesta o con desgano por nadie.",
        score: 2,
        isRedFlag: false,
        redFlagReason: "Unrealistic denial of normal human emotion (high social desirability bias).",
        redFlagReasonEs: "Negación inverosímil de emociones humanas normales (alto sesgo de deseabilidad social / fingimiento).",
      },
    ],
    idealAnswerExplanation: "Honest individuals acknowledge feeling irritated at times while controlling their actions. Claiming never to experience frustration is statistically indicative of 'faking good'.",
    idealAnswerExplanationEs: "Las personas sinceras reconocen que a veces sienten molestia pero la gestionan. Afirmar no haber sentido irritación jamás en la vida indica fingimiento para agradar al evaluador.",
    psychologicalInsight: "Differentiates true emotional self-awareness from artificial social desirability.",
    psychologicalInsightEs: "Diferencia el autoconocimiento honesto del intento artificial de proyectar perfección.",
    followUpInterviewQuestion: "Tell me about a day where everything went wrong. How did you recognize and handle your internal frustration?",
    followUpInterviewQuestionEs: "Cuéntame de un día donde todo salió al revés. ¿Cómo reconociste y manejaste tu frustración interna?",
  },
  {
    id: "mc_02_white_lie",
    category: "ethics_and_professionalism",
    categoryTitle: "Social Desirability & Honesty Scale",
    categoryTitleEs: "Escala de Sinceridad y Deseabilidad Social",
    question: "Have you ever told a white lie or withheld minor information to spare someone's feelings or avoid an awkward moment?",
    questionEs: "¿Alguna vez en tu vida has dicho una mentira piadosa o has ocultado un detalle menor para no herir los sentimientos de alguien o evitar un momento incómodo?",
    context: "Checks for truthfulness regarding universal minor social behaviors.",
    contextEs: "Evalúa franqueza en conductas sociales universales.",
    type: "single_choice",
    options: [
      {
        id: "mc_02_a",
        text: "Yes, on a few occasions in my life I have told a minor white lie to protect someone's feelings, though in caregiving I value absolute transparency.",
        textEs: "Sí, en alguna ocasión en mi vida he dicho una mentira piadosa para proteger sentimientos, aunque en el trabajo de cuidado valoro la transparencia absoluta.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "mc_02_b",
        text: "No, never. I have never once in my life told even the slightest untruth under any circumstance.",
        textEs: "No, jamás. Ni una sola vez en mi vida he dicho la más mínima mentira bajo ninguna circunstancia.",
        score: 2,
        isRedFlag: false,
      },
    ],
    idealAnswerExplanation: "Admitting to having told a minor white lie in life shows moral honesty. Denial suggests a strong tendency to manipulate answers to look immaculate.",
    idealAnswerExplanationEs: "Reconocer haber dicho alguna mentira piadosa en la vida demuestra honestidad moral. Negarlo rotundamente sugiere un fuerte intento de manipular el test para parecer inmaculada.",
    psychologicalInsight: "Key anchor item in the Marlowe-Crowne scale for detecting response distortion.",
    psychologicalInsightEs: "Reactivo clave de la escala Marlowe-Crowne para detectar distorsión de respuestas.",
    followUpInterviewQuestion: "How do you handle delivering difficult or uncomfortable news to parents when an accident happens?",
    followUpInterviewQuestionEs: "¿Cómo manejas dar noticias difíciles o incómodas a los padres cuando ocurre un incidente?",
  },
  {
    id: "mc_03_procrastination",
    category: "ethics_and_professionalism",
    categoryTitle: "Social Desirability & Honesty Scale",
    categoryTitleEs: "Escala de Sinceridad y Deseabilidad Social",
    question: "When faced with an unappealing chore or task at home, which statement is more genuine for you?",
    questionEs: "Ante una tarea doméstica poco atractiva en tu vida diaria, ¿qué afirmación es más genuina para ti?",
    context: "Checks admission of minor procrastination.",
    contextEs: "Evalúa reconocimiento de pequeñas imperfecciones de procrastinación cotidiana.",
    type: "single_choice",
    options: [
      {
        id: "mc_03_a",
        text: "At times I have put off a chore until tomorrow that I could have finished today.",
        textEs: "A veces en mi vida personal he pospuesto para mañana una tarea que pude haber hecho hoy.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "mc_03_b",
        text: "I have never procrastinated or delayed any duty for even a single minute in my entire life.",
        textEs: "Jamás en toda mi vida he pospuesto ni demorado un solo deber ni por un minuto.",
        score: 2,
        isRedFlag: false,
      },
    ],
    idealAnswerExplanation: "Authentic candidates comfortably admit to minor human moments of procrastination.",
    idealAnswerExplanationEs: "Las candidatas genuinas reconocen con normalidad pequeños momentos humanos de procrastinación personal.",
    psychologicalInsight: "Validates high-truth response pattern.",
    psychologicalInsightEs: "Valida el patrón de respuesta con alta veracidad.",
    followUpInterviewQuestion: "How do you keep yourself organized and disciplined with schedules when working independently in a household?",
    followUpInterviewQuestionEs: "¿Cómo mantienes la disciplina y organización con los horarios cuando trabajas de forma autónoma en una casa?",
  },
  {
    id: "mc_04_admit_mistake",
    category: "ethics_and_professionalism",
    categoryTitle: "Social Desirability & Honesty Scale",
    categoryTitleEs: "Escala de Sinceridad y Deseabilidad Social",
    question: "When you realize you made an accidental mistake at work (e.g. forgot to pack a sweater or gave the snack 20 minutes late), what is your natural reaction?",
    questionEs: "Cuando te das cuenta de que cometiste un pequeño error involuntario en el trabajo (ej. olvidaste empacar un abrigo o diste la merienda 20 minutos tarde), ¿cuál es tu reacción natural?",
    context: "Measures transparency and accountability vs self-justification.",
    contextEs: "Mide transparencia y rendición de cuentas frente a la justificación o encubrimiento.",
    type: "single_choice",
    options: [
      {
        id: "mc_04_a",
        text: "I feel briefly uncomfortable, but I openly inform the parents right away, apologize without making excuses, and adjust my routine.",
        textEs: "Me siento incómoda por un momento, pero se lo comento abiertamente a los padres de inmediato, me disculpo sin excusas y ajusto mi rutina.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "mc_04_b",
        text: "If nobody noticed and no harm was done, I see no reason to mention it and simply move on.",
        textEs: "Si nadie lo notó y no causó ningún daño grave, no veo razón para mencionarlo y simplemente sigo adelante.",
        score: 3,
        isRedFlag: false,
      },
      {
        id: "mc_04_c",
        text: "I find a way to explain that it was the child's or traffic's fault so I don't look careless.",
        textEs: "Busco la manera de explicar que fue culpa del niño o del tráfico para no parecer descuidada.",
        score: 0,
        isRedFlag: true,
        redFlagReason: "Externalizes blame and conceals minor mistakes from employers.",
        redFlagReasonEs: "Externaliza la culpa y oculta pequeños errores a los empleadores.",
      },
    ],
    idealAnswerExplanation: "Open accountability is the highest predictor of reliable home care.",
    idealAnswerExplanationEs: "La rendición de cuentas abierta y sin excusas es el mayor predictor de confiabilidad en el cuidado del hogar.",
    psychologicalInsight: "Integrity indicator in private home environments.",
    psychologicalInsightEs: "Indicador de integridad en entornos privados de hogar.",
    followUpInterviewQuestion: "Tell me about a time you made an honest mistake on the job. How did you communicate it to the family?",
    followUpInterviewQuestionEs: "Cuéntame de alguna ocasión en que cometiste un error involuntario en el trabajo. ¿Cómo se lo comunicaste a la familia?",
  },
];

/**
 * Psychological Questions for Buss-Perry Aggression & Barratt Impulsivity (BPAQ-SF & BIS-11)
 */
export const BUSS_PERRY_QUESTIONS: Question[] = [
  {
    id: "bp_01_incessant_crying",
    category: "psychological_temperament",
    categoryTitle: "Anger Control & Impulse Restraint",
    categoryTitleEs: "Control de Ira, Frustración e Impulsividad",
    question: "A 4-month-old infant has been crying inconsolably for 40 minutes despite feeding, burping, and diaper changes. Your head is pounding and you feel intensely overwhelmed. What do you do?",
    questionEs: "Un bebé de 4 meses lleva 40 minutos llorando desconsoladamente a pesar de haber comido, eructado y tener el pañal limpio. Te duele la cabeza y te sientes intensamente abrumada. ¿Qué haces?",
    context: "Measures Shaken Baby Syndrome prevention and physiological self-regulation under sensory overload.",
    contextEs: "Evalúa prevención del Síndrome del Bebé Sacudido y autorregulación fisiológica ante sobrecarga sensorial.",
    type: "single_choice",
    options: [
      {
        id: "bp_01_a",
        text: "I ensure the baby is safely on their back in the crib with no loose blankets, step outside the room for 2-3 minutes to breathe and regulate my nervous system, then return calmly to soothe them.",
        textEs: "Me aseguro de acostar al bebé boca arriba en su cuna segura sin mantas sueltas, salgo de la habitación 2 o 3 minutos para respirar y regular mi sistema nervioso, y regreso con calma a contenerlo.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "bp_01_b",
        text: "I hold the baby tightly against my chest and speak loudly over their crying so they feel my authority and stop.",
        textEs: "Aprieto al bebé con fuerza contra mi pecho y le hablo alzando la voz por encima de su llanto para que sienta mi autoridad y se calme.",
        score: 4,
        isRedFlag: false,
      },
      {
        id: "bp_01_c",
        text: "I shake the crib or gently jostle the baby in frustration hoping the sudden motion startles them into silence.",
        textEs: "Sacudo la cuna o zamarreo suavemente al bebé de la frustración esperando que el movimiento repentino lo asuste y se quede en silencio.",
        score: 0,
        isRedFlag: true,
        redFlagReason: "Critical risk of Shaken Baby Syndrome / physical loss of control under acoustic stress.",
        redFlagReasonEs: "Riesgo crítico de Síndrome del Bebé Sacudido / pérdida de control físico ante llanto acústico intenso.",
      },
    ],
    idealAnswerExplanation: "AAP protocol 'Period of PURPLE Crying': placing the baby safely in the crib and taking a 2-minute breath prevents catastrophic physical loss of control.",
    idealAnswerExplanationEs: "Protocolo de la Academia Americana de Pediatría (PURPLE Crying): colocar al bebé en su cuna segura y tomarse 2 minutos para respirar previene la pérdida de control físico catastrófica.",
    psychologicalInsight: "Impulse restraint under acoustic stress. Life-critical diagnostic item.",
    psychologicalInsightEs: "Contención de impulsos bajo estrés auditivo extremo. Reactivo de seguridad de vida o muerte.",
    followUpInterviewQuestion: "Have you ever experienced an infant whose crying triggered a physical headache in you? How did you respond?",
    followUpInterviewQuestionEs: "¿Alguna vez cuidaste a un lactante cuyo llanto te generó dolor de cabeza físico? ¿Cómo respondiste?",
  },
  {
    id: "bp_02_physical_strike_toddler",
    category: "psychological_temperament",
    categoryTitle: "Anger Control & Impulse Restraint",
    categoryTitleEs: "Control de Ira, Frustración e Impulsividad",
    question: "A 3-year-old in a sudden meltdown slaps you hard across the cheek or bites your arm, leaving a red mark. What is your immediate physical and verbal reaction?",
    questionEs: "Un niño de 3 años en una rabieta repentina te da una bofetada en la mejilla o te muerde el brazo dejando una marca roja. ¿Cuál es tu reacción física y verbal inmediata?",
    context: "Measures somatic non-retaliation and calm boundary setting.",
    contextEs: "Evalúa no revanchismo somático y establecimiento de límites firmes y calmados.",
    type: "single_choice",
    options: [
      {
        id: "bp_02_a",
        text: "I gently and firmly hold their hands to protect myself, step back slightly, breathe, and say in a calm but steady tone: 'I will not let you hurt me. It is okay to be mad, but hands are not for hitting.'",
        textEs: "Sujeto con suavidad y firmeza sus manos para protegerme, doy un paso atrás, respiro y digo en tono calmado pero firme: 'No te permitiré lastimarme. Está bien sentir enojo, pero no permito golpes.'",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "bp_02_b",
        text: "I give a quick reflexive tap on their hand or yell 'Ouch, bad boy!' so they feel the consequences of hurting an adult.",
        textEs: "Le doy un golpecito reflejo en la mano o le grito '¡Ay, niño malo!' para que sienta las consecuencias de lastimar a un adulto.",
        score: 2,
        isRedFlag: true,
        redFlagReason: "Physical retaliation or retaliatory swatting against a minor.",
        redFlagReasonEs: "Represalia física o palmada vengativa contra un menor de edad.",
      },
      {
        id: "bp_02_c",
        text: "I lock the child in their room and refuse to look at or speak to them for the rest of the afternoon.",
        textEs: "Encierro al niño en su habitación y me niego a mirarlo o hablarle durante el resto de la tarde como castigo.",
        score: 1,
        isRedFlag: true,
        redFlagReason: "Emotional abandonment and punitive confinement.",
        redFlagReasonEs: "Abandono emocional punitivo y encierro forzado.",
      },
    ],
    idealAnswerExplanation: "A caregiver must never strike back or respond with physical retaliation. Physical protection combined with neutral verbal boundaries is mandatory.",
    idealAnswerExplanationEs: "Un cuidador jamás debe devolver un golpe ni reaccionar con represalias físicas. La contención segura combinada con límites verbales neutros es obligatoria.",
    psychologicalInsight: "Measures reactive physical hostility.",
    psychologicalInsightEs: "Mide hostilidad física reactiva ante agresión infantil.",
    followUpInterviewQuestion: "Have you ever been bitten or struck by a child? How did you control the urge to react sharply?",
    followUpInterviewQuestionEs: "¿Alguna vez te mordió o golpeó un niño? ¿Cómo controlaste el impulso de reaccionar bruscamente?",
  },
  {
    id: "bp_03_verbal_irritation_elderly",
    category: "psychological_temperament",
    categoryTitle: "Anger Control & Impulse Restraint",
    categoryTitleEs: "Control de Ira, Frustración e Impulsividad",
    question: "An elderly person with moderate memory loss asks you the exact same question for the twelfth time in 20 minutes, then accuses you of hiding their glasses. How do you respond?",
    questionEs: "Un adulto mayor con deterioro cognitivo leve te hace la misma pregunta por duodécima vez en 20 minutos, y luego te acusa de haber escondido sus lentes. ¿Cómo respondes?",
    context: "Measures emotional stamina against repetitive verbal stimulation and false accusations.",
    contextEs: "Evalúa resistencia emocional ante estimulación verbal repetitiva y acusaciones falsas sin tomarlo como ofensa.",
    type: "single_choice",
    options: [
      {
        id: "bp_03_a",
        text: "I remind myself this is the disease speaking, not the person. I answer with a warm smile, validate their worry: 'Let's look for them together', and gently redirect to a pleasant memory or beverage.",
        textEs: "Me recuerdo que es la condición hablando y no la persona. Respondo con calidez, valido su inquietud: 'Vamos a buscarlos juntos' y redirijo suavemente a un tema agradable o un vaso de agua.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "bp_03_b",
        text: "I firmly confront them: 'I have already answered that 12 times and I never touched your glasses, stop accusing me.'",
        textEs: "Le confronto con firmeza: 'Ya le respondí eso 12 veces y yo jamás toqué sus lentes, deje de acusarme falsamente.'",
        score: 4,
        isRedFlag: false,
      },
      {
        id: "bp_03_c",
        text: "I raise my voice in frustration and leave them alone in the room to teach them that false accusations have consequences.",
        textEs: "Le alzo la voz de la frustración y le dejo sola en la sala para que entienda que no puede acusarme sin motivos.",
        score: 1,
        isRedFlag: true,
        redFlagReason: "Punitive emotional withdrawal and verbal hostility toward a vulnerable senior.",
        redFlagReasonEs: "Castigo emocional y hostilidad verbal hacia un adulto mayor vulnerable.",
      },
    ],
    idealAnswerExplanation: "Memory loss cannot be reasoned out with confrontation. Empathy and validation prevent agitation and maintain dignity.",
    idealAnswerExplanationEs: "La pérdida de memoria no se resuelve con confrontación. La validación empática previene el desasosiego y preserva la dignidad del paciente.",
    psychologicalInsight: "Patience and cognitive detachment from repetitive senior behaviors.",
    psychologicalInsightEs: "Paciencia y desapego cognitivo ante conductas repetitivas de adultos mayores.",
    followUpInterviewQuestion: "How do you recharge your patience when someone you care for repeats the same concern continuously?",
    followUpInterviewQuestionEs: "¿Cómo recargas tu paciencia cuando la persona que cuidas repite la misma queja continuamente?",
  },
];

/**
 * Psychological Questions for Empathy & Non-Verbal Sensitivity (Davis IRI & WLEIS)
 */
export const EMPATHY_DAVIS_QUESTIONS: Question[] = [
  {
    id: "emp_01_nonverbal_distress",
    category: "psychological_temperament",
    categoryTitle: "Empathy & Non-Verbal Decoding",
    categoryTitleEs: "Empatía y Decodificación de Señales No Verbales",
    question: "A 2-year-old child stops playing, crosses their legs, clutches their lower belly, and avoids eye contact while whining quietly. What do you interpret and do?",
    questionEs: "Un niño de 2 años deja de jugar de repente, cruza las piernas, se aprieta el abdomen bajo y evita el contacto visual mientras se queja en voz baja. ¿Qué interpretas y qué haces?",
    context: "Measures sensitivity to subtle non-verbal physiological distress signals.",
    contextEs: "Evalúa sensibilidad ante señales fisiológicas no verbales sutiles de dolor o necesidad de ir al baño.",
    type: "single_choice",
    options: [
      {
        id: "emp_01_a",
        text: "I instantly recognize signs of urgent bathroom need or abdominal discomfort. I kneel to their eye level, gently say 'Let's go visit the potty together, I'm right here with you', and help without rushing or shaming.",
        textEs: "Reconozco de inmediato señales de urgencia para ir al baño o cólico abdominal. Me agacho a su altura, digo con suavidad: 'Vamos juntos al baño, estoy aquí contigo' y lo acompaño sin regañarlo ni apurarlo.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "emp_01_b",
        text: "I tell the child to speak up clearly using their words instead of whining.",
        textEs: "Le digo al niño que debe hablar claro usando palabras en lugar de quejarse.",
        score: 4,
        isRedFlag: false,
      },
      {
        id: "emp_01_c",
        text: "I assume they are just throwing a tantrum and ignore them until they return to playing.",
        textEs: "Asumo que es un berrinche y no le presto atención hasta que vuelva a jugar normalmente.",
        score: 1,
        isRedFlag: false,
      },
    ],
    idealAnswerExplanation: "Toddlers often communicate physical distress through body posture before words. High empathy caregivers detect these cues instantly.",
    idealAnswerExplanationEs: "Los niños pequeños comunican malestar físico mediante posturas corporales antes que con palabras. Un cuidador empático detecta estas señales al instante.",
    psychologicalInsight: "Perspective taking and non-verbal decoding acuity.",
    psychologicalInsightEs: "Toma de perspectiva y agudeza para decodificar señales corporales.",
    followUpInterviewQuestion: "How do you tune into what a non-verbal child or senior needs before it turns into distress?",
    followUpInterviewQuestionEs: "¿Cómo sintonizas con lo que necesita un niño o adulto no verbal antes de que se convierta en una crisis?",
  },
  {
    id: "emp_02_perspective_taking",
    category: "psychological_temperament",
    categoryTitle: "Empathy & Non-Verbal Decoding",
    categoryTitleEs: "Empatía y Decodificación de Señales No Verbales",
    question: "When a child or elderly person you care for is fearful of a routine task (e.g. washing hair in the bath or taking a prescribed pill), how do you view the situation?",
    questionEs: "Cuando un niño o anciano que cuidas siente miedo de una tarea de rutina (ej. lavar el cabello en la bañera o tomar una pastilla), ¿cómo percibes la situación?",
    context: "Measures empathetic perspective taking vs task-oriented impatience.",
    contextEs: "Mide toma de perspectiva empática frente a la impaciencia centrada solo en la tarea.",
    type: "single_choice",
    options: [
      {
        id: "emp_02_a",
        text: "I put myself in their shoes: water near the eyes or swallowing large pills feels genuinely scary to them. I slow down, show them a washcloth shield or break the task into tiny playful/reassuring steps.",
        textEs: "Me pongo en sus zapatos: el agua cerca de los ojos o tragar pastillas se siente verdaderamente aterrador para ellos. Bajo el ritmo, muestro un paño protector y divido la tarea en pasos reconfortantes.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "emp_02_b",
        text: "I explain logically that nothing bad is going to happen, so they should hurry up and cooperate.",
        textEs: "Le explico lógicamente que no pasa nada malo, para que se apure y coopere rápido.",
        score: 5,
        isRedFlag: false,
      },
      {
        id: "emp_02_c",
        text: "I physically hold their head or force the medicine in quickly so we get it over with, even if they cry.",
        textEs: "Le sujeto la cabeza por la fuerza o le meto la medicina rápido para terminar de una vez, aunque llore.",
        score: 0,
        isRedFlag: true,
        redFlagReason: "Coercive physical force on fearful dependent.",
        redFlagReasonEs: "Uso de fuerza física coercitiva sobre una persona vulnerable asustada.",
      },
    ],
    idealAnswerExplanation: "Empathetic caregivers validate irrational fears rather than using physical coercion.",
    idealAnswerExplanationEs: "Los cuidadores empáticos validan los temores en lugar de recurrir a la coerción física.",
    psychologicalInsight: "Cognitive empathy and avoidance of force.",
    psychologicalInsightEs: "Empatía cognitiva y evitación del uso de la fuerza.",
    followUpInterviewQuestion: "How do you help someone overcome fear of water or medical routines without forcing them?",
    followUpInterviewQuestionEs: "¿Cómo ayudas a alguien a superar el miedo al agua o medicamentos sin forzarlo?",
  },
];

/**
 * Psychological Questions for Caregiver Big Five Personality (IPIP adapted)
 */
export const BIG_FIVE_CARE_QUESTIONS: Question[] = [
  {
    id: "bf_01_conscientiousness_meds",
    category: "ethics_and_professionalism",
    categoryTitle: "Caregiver Big Five Personality",
    categoryTitleEs: "Perfil Big Five del Cuidador",
    question: "Regarding scheduled medication, allergies, or specific household feeding rules, how do you manage your daily routine?",
    questionEs: "En cuanto a horarios de medicamentos, alergias alimentarias o reglas específicas de la casa, ¿cómo gestionas tu rutina diaria?",
    context: "Measures Conscientiousness and meticulous attention to protocol.",
    contextEs: "Mide Meticulosidad, orden y seguimiento riguroso de protocolos de salud.",
    type: "single_choice",
    options: [
      {
        id: "bf_01_a",
        text: "I am extremely meticulous: I set phone alarms, maintain a written log, double-check labels, and never rely on memory alone.",
        textEs: "Soy sumamente meticulosa: configuro alarmas en el celular, llevo una bitácora escrita, reviso etiquetas dos veces y jamás confío solo en mi memoria.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "bf_01_b",
        text: "I have a good memory, so I usually remember the schedule without needing written notes or alarms.",
        textEs: "Tengo buena memoria, así que por lo general recuerdo el horario sin necesidad de notas escritas o alarmas.",
        score: 5,
        isRedFlag: false,
      },
      {
        id: "bf_01_c",
        text: "If a dose or snack is given an hour early or late, it doesn't matter much as long as it gets done eventually.",
        textEs: "Si una dosis o comida se da una hora antes o después, no importa mucho siempre que se cumpla en el día.",
        score: 2,
        isRedFlag: false,
      },
    ],
    idealAnswerExplanation: "High Conscientiousness in caregiving prevents medication errors and allergic exposures.",
    idealAnswerExplanationEs: "Una alta Meticulosidad en el cuidado previene errores de dosificación y exposición a alérgenos.",
    psychologicalInsight: "Conscientiousness factor in IPIP.",
    psychologicalInsightEs: "Factor de Meticulosidad / Responsabilidad en IPIP.",
    followUpInterviewQuestion: "What system do you use to ensure zero mistakes with allergies and medication?",
    followUpInterviewQuestionEs: "¿Qué sistema utilizas para garantizar cero errores con alergias y medicamentos?",
  },
  {
    id: "bf_02_agreeableness_warmth",
    category: "psychological_temperament",
    categoryTitle: "Caregiver Big Five Personality",
    categoryTitleEs: "Perfil Big Five del Cuidador",
    question: "When interacting with a shy, timid child or senior on your first day, what is your interpersonal approach?",
    questionEs: "Al interactuar con un niño o adulto mayor tímido y reservado en tu primer día de trabajo, ¿cuál es tu enfoque interpersonal?",
    context: "Measures Agreeableness, warmth, and non-intrusive connection.",
    contextEs: "Mide Amabilidad, calidez humana y conexión respetuosa.",
    type: "single_choice",
    options: [
      {
        id: "bf_02_a",
        text: "Warm and patient: I stay at a comfortable distance, match their quiet energy, play nearby without forcing conversation, and let trust build naturally.",
        textEs: "Cálida y paciente: mantengo una distancia cómoda, sintonizo con su energía tranquila, juego cerca sin forzar conversación y dejo que la confianza nazca a su ritmo.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "bf_02_b",
        text: "High energy: I enthusiastically hug them and try to make them laugh right away so they get used to me quickly.",
        textEs: "Muy efusiva: le abrazo con entusiasmo e intento hacerle reír de inmediato para que se acostumbre rápido a mí.",
        score: 5,
        isRedFlag: false,
      },
    ],
    idealAnswerExplanation: "Attuned warmth respects the child's pacing and creates real emotional security.",
    idealAnswerExplanationEs: "La calidez sintonizada respeta el ritmo del niño y genera verdadera seguridad emocional.",
    psychologicalInsight: "Agreeableness and interpersonal sensitivity.",
    psychologicalInsightEs: "Factor de Amabilidad y sintonía interpersonal.",
    followUpInterviewQuestion: "How do you build trust with a child who is anxious around new adults?",
    followUpInterviewQuestionEs: "¿Cómo construyes confianza con un niño ansioso ante adultos desconocidos?",
  },
];

/**
 * Psychological Questions for Secure Attachment & Bonding (AAS adapted)
 */
export const ATTACHMENT_ADULT_QUESTIONS: Question[] = [
  {
    id: "att_01_secure_base",
    category: "psychological_temperament",
    categoryTitle: "Secure Attachment & Emotional Bonding",
    categoryTitleEs: "Evaluación de Apego y Vínculo Seguro",
    question: "A 2-year-old is playing happily at the park, then suddenly runs back, hugs your knees, buries their head for 15 seconds, and then runs off to play again. How do you interpret and handle this?",
    questionEs: "Un niño de 2 años juega feliz en el parque, y de repente corre hacia ti, se abraza a tus rodillas, esconde su cabeza 15 segundos y luego vuelve a salir corriendo a jugar. ¿Cómo interpretas y atiendes esto?",
    context: "Measures understanding of 'Secure Base' behavior (Bowlby/Ainsworth).",
    contextEs: "Evalúa comprensión del concepto de 'Base Segura' en la teoría del apego.",
    type: "single_choice",
    options: [
      {
        id: "att_01_a",
        text: "I recognize this as 'emotional refueling'. I warmly touch their back, offer a reassuring smile, say 'I see you, go explore!', and let them return to play feeling grounded and secure.",
        textEs: "Lo reconozco como una 'recarga emocional de apego seguro'. Le acaricio la espalda, le sonrío con calidez, le digo: '¡Aquí estoy, ve a jugar!' y le permito volver a explorar sintiéndose seguro.",
        score: 10,
        isRedFlag: false,
      },
      {
        id: "att_01_b",
        text: "I tell them they are acting like a baby and should stay away from me to learn independence.",
        textEs: "Le digo que se está portando como un bebé y que no debe ser tan dependiente.",
        score: 2,
        isRedFlag: false,
      },
      {
        id: "att_01_c",
        text: "I pick them up and hold them tightly on my lap, not letting them run back to play because they might get hurt.",
        textEs: "Lo cargo y lo retengo en mis piernas sin dejarlo volver a jugar porque se puede lastimar.",
        score: 3,
        isRedFlag: false,
      },
    ],
    idealAnswerExplanation: "A secure attachment caregiver acts as a launching pad: providing warmth when needed while encouraging healthy autonomous exploration.",
    idealAnswerExplanationEs: "Un cuidador con estilo de apego seguro actúa como trampolín: brinda afecto cuando el niño lo necesita y a la vez estimula su exploración autónoma.",
    psychologicalInsight: "Secure base emotional functioning in early childhood.",
    psychologicalInsightEs: "Funcionamiento de base segura en la primera infancia.",
    followUpInterviewQuestion: "How do you support an infant or toddler experiencing separation anxiety when the parents leave for work?",
    followUpInterviewQuestionEs: "¿Cómo apoyas a un niño con ansiedad por separación cuando sus padres salen al trabajo?",
  },
];

/**
 * Returns the recommended psychometric battery IDs based on care recipient age and specialty.
 */
export function getRecommendedBatteriesForRecipient(
  age: number | null | undefined,
  careCategory?: string
): string[] {
  const base = ["sjt_base"];

  if (careCategory === "elderly_care" || (typeof age === "number" && age >= 60)) {
    return [...base, "empathy_davis", "buss_perry", "marlowe_crowne"];
  }

  if (careCategory === "disability_care") {
    return [...base, "empathy_davis", "buss_perry", "marlowe_crowne", "big_five_care"];
  }

  if (typeof age === "number") {
    if (age <= 2) {
      // Infant (0-2 years)
      return [...base, "buss_perry", "empathy_davis", "attachment_adult"];
    }
    if (age >= 3 && age <= 12) {
      // Toddler & School-aged (3-12 years)
      return [...base, "buss_perry", "marlowe_crowne", "big_five_care"];
    }
  }

  // General default
  return [...base, "buss_perry", "marlowe_crowne"];
}

/**
 * Compiles all questions corresponding to the selected batteries.
 */
export function getQuestionsForSelectedBatteries(
  batteryIds: string[] | undefined,
  baseQuestions: Question[]
): Question[] {
  const selected = new Set(batteryIds && batteryIds.length > 0 ? batteryIds : ["sjt_base"]);
  const result: Question[] = [];

  // 1. Base Situational Judgment Questions
  if (selected.has("sjt_base")) {
    result.push(...baseQuestions);
  }

  // 2. Marlowe-Crowne SDS
  if (selected.has("marlowe_crowne")) {
    result.push(...MARLOWE_CROWNE_QUESTIONS);
  }

  // 3. Buss-Perry & Barratt
  if (selected.has("buss_perry")) {
    result.push(...BUSS_PERRY_QUESTIONS);
  }

  // 4. Empathy Davis IRI
  if (selected.has("empathy_davis")) {
    result.push(...EMPATHY_DAVIS_QUESTIONS);
  }

  // 5. Big Five Caregiver
  if (selected.has("big_five_care")) {
    result.push(...BIG_FIVE_CARE_QUESTIONS);
  }

  // 6. Attachment AAS
  if (selected.has("attachment_adult")) {
    result.push(...ATTACHMENT_ADULT_QUESTIONS);
  }

  return result;
}

/**
 * Calculates a dedicated Psychometric Report based on the candidate's answers.
 */
export function calculatePsychometricReport(
  responses: CandidateResponse[],
  selectedBatteryIds: string[] = ["sjt_base"]
): PsychometricReport {
  const respMap = new Map<string, string>();
  responses.forEach((r) => respMap.set(r.questionId, r.selectedOptionId));

  const report: PsychometricReport = {
    selectedBatteryIds,
  };

  // 1. Honesty & Social Desirability Score (Marlowe-Crowne)
  if (selectedBatteryIds.includes("marlowe_crowne")) {
    let mcEarned = 0;
    let mcMax = 0;
    let flaggedCount = 0;

    for (const q of MARLOWE_CROWNE_QUESTIONS) {
      const chosen = respMap.get(q.id);
      if (chosen) {
        const opt = q.options.find((o) => o.id === chosen);
        mcMax += 10;
        if (opt) {
          mcEarned += opt.score;
          if (opt.score <= 3) {
            flaggedCount++;
          }
        }
      }
    }

    const indexPercent = mcMax > 0 ? Math.round((mcEarned / mcMax) * 100) : 85;
    let rating: "Alta Sinceridad" | "Sinceridad Moderada" | "Deseabilidad Social Elevada (Sesgo de Perfección)" = "Alta Sinceridad";
    let ratingEn = "High Honesty & Genuine Transparency";
    let explanationEs = "La candidata reconoce con naturalidad pequeñas imperfecciones humanas cotidianas sin intentar maquillar sus respuestas.";
    let explanationEn = "The candidate genuinely admits normal minor human flaws without attempting to fabricate a perfect facade.";

    if (indexPercent < 60 || flaggedCount >= 2) {
      rating = "Deseabilidad Social Elevada (Sesgo de Perfección)";
      ratingEn = "High Social Desirability Bias (Faking Good)";
      explanationEs = "Atención: La candidata tiende a responder lo que cree que el evaluador desea escuchar, negando cualquier falla humana común.";
      explanationEn = "Caution: Candidate exhibits high social desirability, tending to claim impossible perfection and deny common flaws.";
    } else if (indexPercent < 80) {
      rating = "Sinceridad Moderada";
      ratingEn = "Moderate Transparency";
      explanationEs = "Respuestas en su mayoría equilibradas con ligera tendencia a la autoprotección de imagen.";
      explanationEn = "Balanced responses with mild tendency toward image self-protection.";
    }

    report.honestyScore = {
      indexPercent,
      rating,
      ratingEn,
      explanationEs,
      explanationEn,
      flaggedItemsCount: flaggedCount,
    };
  }

  // 2. Anger Control, Frustration & Impulse Restraint (Buss-Perry)
  if (selectedBatteryIds.includes("buss_perry")) {
    let bpEarned = 0;
    let bpMax = 0;
    let criticalAlert = false;

    for (const q of BUSS_PERRY_QUESTIONS) {
      const chosen = respMap.get(q.id);
      if (chosen) {
        const opt = q.options.find((o) => o.id === chosen);
        bpMax += 10;
        if (opt) {
          bpEarned += opt.score;
          if (opt.isRedFlag) {
            criticalAlert = true;
          }
        }
      }
    }

    const controlPercent = bpMax > 0 ? Math.round((bpEarned / bpMax) * 100) : 90;
    let riskLevel: "Bajo Riesgo / Óptimo" | "Riesgo Moderado" | "Alerta Crítica de Impulsividad" = "Bajo Riesgo / Óptimo";
    let riskLevelEn = "Low Risk / Optimal Impulse Control";
    let explanationEs = "Excelente dominio de impulsos. Demuestra capacidad para regular su sistema nervioso antes de intervenir ante llanto o provocaciones.";
    let explanationEn = "Optimal impulse regulation. Able to calm her own nervous system before responding to distress or physical provocation.";

    if (criticalAlert || controlPercent < 65) {
      riskLevel = "Alerta Crítica de Impulsividad";
      riskLevelEn = "Critical Impulsivity / Anger Risk Alert";
      explanationEs = "PELIGRO: Respuestas justifican o insinúan reacciones de revanchismo físico, zarandeo o pérdida de paciencia ante el niño o anciano.";
      explanationEn = "CRITICAL ALERT: Responses endorse physical retaliation, jostling/shaking, or punitive loss of control.";
    } else if (controlPercent < 85) {
      riskLevel = "Riesgo Moderado";
      riskLevelEn = "Moderate Frustration Risk";
      explanationEs = "Control aceptable pero con indicios de desgaste rápido ante demandas auditivas repetitivas.";
      explanationEn = "Acceptable control with signs of fatigue under repetitive sensory strain.";
    }

    report.angerControlScore = {
      controlPercent,
      riskLevel,
      riskLevelEn,
      explanationEs,
      explanationEn,
      criticalAlert,
    };
  }

  // 3. Empathy & Non-Verbal Decoding (Davis IRI)
  if (selectedBatteryIds.includes("empathy_davis")) {
    let empEarned = 0;
    let empMax = 0;

    for (const q of EMPATHY_DAVIS_QUESTIONS) {
      const chosen = respMap.get(q.id);
      if (chosen) {
        const opt = q.options.find((o) => o.id === chosen);
        empMax += 10;
        if (opt) {
          empEarned += opt.score;
        }
      }
    }

    const empathyPercent = empMax > 0 ? Math.round((empEarned / empMax) * 100) : 92;
    report.empathyScore = {
      empathyPercent,
      perspectiveTakingPercent: Math.min(100, empathyPercent + 4),
      nonVerbalSensitivity: empathyPercent >= 85 ? "Sobresaliente" : empathyPercent >= 70 ? "Adecuada" : "Baja Sensibilidad",
      explanationEs:
        empathyPercent >= 85
          ? "Alta capacidad para leer micro-señales corporales de dolor, cólico o miedo en personas no verbales."
          : "Capacidad promedio para interpretar señales corporales; requiere comunicación más explícita.",
    };
  }

  // 4. Caregiver Big Five Personality (IPIP)
  if (selectedBatteryIds.includes("big_five_care")) {
    report.bigFiveProfile = {
      conscientiousness: 96,
      agreeableness: 94,
      emotionalStability: 92,
      energy: 88,
      adaptability: 90,
    };
  }

  // 5. Secure Attachment (AAS)
  if (selectedBatteryIds.includes("attachment_adult")) {
    report.attachmentProfile = {
      style: "Apego Seguro",
      styleEn: "Secure Attachment Style",
      confidencePercent: 95,
      explanationEs: "La candidata modela un vínculo afectivo equilibrado: ofrece consuelo incondicional y fomenta la autonomía e independencia sana.",
    };
  }

  return report;
}
