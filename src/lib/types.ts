export type Role = "parent" | "recruiter";
export type Language = "en" | "es";

export type CareCategory = "childcare" | "elderly_care" | "disability_care";
export type CareRecipientType = "child" | "elderly" | "disability";

export interface CareRecipient {
  id: string;
  name: string;
  age: number; // e.g., 3, 78, 24
  type?: CareRecipientType; // "child" | "elderly" | "disability"
  relationship?: string; // "Hijo/a", "Madre/Padre", "Abuelo/a", "Familiar", "Hermano/a"
  conditions?: string[]; // e.g. ["Movilidad reducida", "Alzheimer leve", "TEA grado 2", "Diabético"]
  notes?: string;
}

export type Child = CareRecipient; // Backwards-compatible alias for Child

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role?: "admin" | "parent";
  createdAt: string;
  children: Child[];
  childProfile?: {
    name: string;
    age: number; // e.g., 3
    notes?: string;
  };
}

export type CandidateStatus =
  | "invited"
  | "in_progress"
  | "completed"
  | "under_review"
  | "interview_scheduled"
  | "hired"
  | "rejected";

export type QuestionCategory =
  | "psychological_temperament" // Frustration tolerance, emotional stability, empathy, patience
  | "safety_and_emergency"      // Choking, CPR, water safety, burns, incident escalation
  | "toddler_development_age3"  // Age 3 milestones, speech, tantrums, toilet accidents, bedtime
  | "ethics_and_professionalism"// Smartphone use, privacy/social media, punctuality, honesty
  | "situational_judgment"      // Complex dilemma scenarios
  | "sibling_and_multichild";   // Multi-child divided supervision, infant/toddler toys, sibling conflicts

export interface QuestionOption {
  id: string;
  text: string;
  textEs?: string;
  score: number; // 0 to 10
  isRedFlag?: boolean;
  redFlagReason?: string;
  redFlagReasonEs?: string;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  categoryTitle: string;
  categoryTitleEs?: string;
  question: string;
  questionEs?: string;
  context?: string;
  contextEs?: string;
  type: "single_choice" | "likert_scale" | "scenario";
  options: QuestionOption[];
  idealAnswerExplanation: string;
  idealAnswerExplanationEs?: string;
  psychologicalInsight: string;
  psychologicalInsightEs?: string;
  followUpInterviewQuestion: string;
  followUpInterviewQuestionEs?: string;
  isMultiChildOnly?: boolean;
}

export interface CandidateResponse {
  questionId: string;
  selectedOptionId: string;
  notes?: string;
}

export interface CandidateProfile {
  fullName: string;
  countryOfOrigin?: string;
  countryOfResidence?: string;
  phoneDialCode?: string;
  phone: string;
  email?: string;
  yearsOfExperience: number;
  hasCprCertification: boolean;
  cprExpirationDate?: string;
  hasEarlyChildhoodEducation: boolean;
  highestEducation: string;
  authorizedToWork: boolean;
  availableStartDate?: string;
  preferredHourlyRate?: string;
  personalStatement?: string;
}

export interface RedFlagAlert {
  questionId: string;
  questionText: string;
  questionTextEs?: string;
  candidateAnswerText: string;
  candidateAnswerTextEs?: string;
  severity: "high" | "critical";
  reason: string;
  reasonEs?: string;
  recommendedProbe: string;
  recommendedProbeEs?: string;
}

export interface CategoryScore {
  category: QuestionCategory;
  title: string;
  titleEs?: string;
  score: number; // 0 to 100
  rating: "Exceptional" | "Solid" | "Needs Attention" | "High Risk";
  ratingEs?: string;
  feedback: string;
  feedbackEs?: string;
  strengths: string[];
  strengthsEs?: string[];
  watchouts: string[];
  watchoutsEs?: string[];
}

export interface AssessmentResult {
  overallScore: number; // 0 to 100
  tier: "Exceptional Fit" | "Strong Candidate" | "Proceed with Caution" | "High Risk / Not Recommended";
  tierEs?: string;
  summary: string;
  summaryEs?: string;
  categoryScores: Record<QuestionCategory, CategoryScore>;
  redFlags: RedFlagAlert[];
  generatedInterviewQuestions: {
    category: string;
    topic: string;
    topicEs?: string;
    suggestedQuestion: string;
    suggestedQuestionEs?: string;
    rationale: string;
    rationaleEs?: string;
  }[];
  psychometricReport?: PsychometricReport;
  completedAt: string;
}

export interface PsychometricBatteryMeta {
  id: string;
  name: string;
  nameEs: string;
  scientificBasis: string;
  phase: 1 | 2;
  badgeEs: string;
  badgeEn: string;
  description: string;
  descriptionEs: string;
  targetRecommendationEs: string;
  targetRecommendationEn: string;
  estimatedTimeMinutes: number;
  questionCount: number;
  isBase?: boolean;
}

export interface PsychometricReport {
  selectedBatteryIds: string[];
  honestyScore?: {
    indexPercent: number; // 0 to 100%
    rating: "Alta Sinceridad" | "Sinceridad Moderada" | "Deseabilidad Social Elevada (Sesgo de Perfección)";
    ratingEn: string;
    explanationEs: string;
    explanationEn: string;
    flaggedItemsCount: number;
  };
  angerControlScore?: {
    controlPercent: number; // 0 to 100%
    riskLevel: "Bajo Riesgo / Óptimo" | "Riesgo Moderado" | "Alerta Crítica de Impulsividad";
    riskLevelEn: string;
    explanationEs: string;
    explanationEn: string;
    criticalAlert: boolean;
  };
  empathyScore?: {
    empathyPercent: number;
    perspectiveTakingPercent: number;
    nonVerbalSensitivity: "Sobresaliente" | "Adecuada" | "Baja Sensibilidad";
    explanationEs: string;
  };
  bigFiveProfile?: {
    conscientiousness: number; // Responsabilidad
    agreeableness: number;     // Calidez
    emotionalStability: number;// Estabilidad
    energy: number;            // Extraversión/Dinamismo
    adaptability: number;      // Flexibilidad
  };
  attachmentProfile?: {
    style: "Apego Seguro" | "Apego Ansioso" | "Apego Evitativo";
    styleEn: string;
    confidencePercent: number;
    explanationEs: string;
  };
}

export type CustomQuestionType = "multiple_choice" | "open_text";

export interface CustomQuestion {
  id: string;
  type: CustomQuestionType;
  prompt: string;
  options?: string[]; // for multiple_choice
  required?: boolean;
}

export interface CustomAnswer {
  questionId: string;
  questionPrompt: string;
  type: CustomQuestionType;
  answer: string;
}

export interface Candidate {
  id: string;
  userId: string; // The parent who created the invitation
  campaignId?: string; // Associated parent campaign
  token: string;  // Unique public URL token
  name: string;
  roleTarget: string; // e.g. "Full-Time Nanny for Leo (3yo) & Mateo (1yo)"
  targetChildren?: Child[];
  askHourlyRate?: boolean; // Parent choice: require/show hourly rate in the nanny questionnaire
  phone?: string;
  email?: string;
  status: CandidateStatus;
  createdAt: string;
  updatedAt: string;
  profile?: CandidateProfile;
  responses?: CandidateResponse[];
  result?: AssessmentResult;
  parentNotes?: string;
  customQuestions?: CustomQuestion[];
  customAnswers?: CustomAnswer[];
  selectedBatteryIds?: string[];
  inTalentPool?: boolean;
  talentPoolStatus?: "available" | "placed" | "review";
}

export type AdCategory = "diapers" | "books" | "nutrition" | "gear" | "toys" | "education" | "elderly_care" | "disability_care" | "health";
export type AdPlacement = "dashboard_banner" | "campaign_interstitial" | "popup_modal";

export interface AdCampaign {
  id: string;
  sponsorName: string;
  title: string;
  titleEs?: string;
  headline: string;
  headlineEs?: string;
  description: string;
  descriptionEs?: string;
  category: AdCategory;
  careCategory?: CareCategory | "all";
  placement: AdPlacement;
  targetMinAge: number; // e.g. 0
  targetMaxAge: number; // e.g. 2
  badgeText?: string;
  badgeTextEs?: string;
  ctaText: string;
  ctaTextEs?: string;
  ctaUrl: string;
  imageUrl?: string;
  bgColor?: string;
  active: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
}

export interface ParentCampaign {
  id: string;
  userId: string;
  title: string;
  careCategory?: CareCategory; // "childcare" | "elderly_care" | "disability_care"
  targetChildren: Child[]; // or care recipients
  scheduleType: "full_time" | "part_time" | "weekends" | "occasional";
  expectedHourlyRate?: string;
  startDate?: string;
  notes?: string;
  customQuestions?: CustomQuestion[];
  selectedBatteryIds?: string[];
  active: boolean;
  publicToken?: string;
  shareCode?: string; // Shareable code for family / recruiter co-management
  sharedWithEmails?: string[]; // Emails of users who can view & manage this campaign
  sharedWithUserIds?: string[]; // IDs of users who can view & manage this campaign
  createdAt: string;
}

export interface QuestionBankItem {
  id: string;
  userId?: string; // If set, specific to a parent user; otherwise system default
  groupId: string;
  groupNameEs: string;
  groupNameEn: string;
  type: CustomQuestionType;
  prompt: string;
  promptEs?: string;
  options?: string[];
  optionsEs?: string[];
  required?: boolean;
  isCustomUser?: boolean;
  careCategory?: CareCategory | "all";
}

export interface QuestionBankGroup {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  icon: string;
  careCategory?: CareCategory | "all";
  questions: QuestionBankItem[];
}

export interface AffiliateSettings {
  amazonTag: string; // e.g. "matchcaring-20" or user's affiliate tag
  disclaimerTextEs?: string;
  disclaimerTextEn?: string;
  enabled: boolean;
  updatedAt?: string;
}

export interface RecommendedProduct {
  id: string;
  title: string;
  titleEs: string;
  category: "activities" | "daily_use" | "safety" | "books" | "elderly" | "disability";
  careCategory?: CareCategory | "all";
  categoryLabelEs: string;
  categoryLabelEn: string;
  targetMinAge: number;
  targetMaxAge: number;
  ageBadge: string;
  ageBadgeEs: string;
  description: string;
  descriptionEs: string;
  pedagogicalBenefitEs: string;
  pedagogicalBenefitEn: string;
  imageUrl: string;
  affiliateUrl: string;
  priceEstimate: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  badgeEs?: string;
  active?: boolean;
}

