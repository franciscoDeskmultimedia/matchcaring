import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import {
  AdCampaign,
  AdPlacement,
  AffiliateSettings,
  Candidate,
  CandidateProfile,
  CandidateResponse,
  CareCategory,
  Child,
  CustomAnswer,
  CustomQuestion,
  ParentCampaign,
  QuestionBankGroup,
  QuestionBankItem,
  RecommendedProduct,
  User,
} from "./types";
import { evaluateAssessment } from "./scoring";
import { RECOMMENDED_PRODUCTS } from "./recommendedProducts";
import { DEFAULT_QUESTION_BANK_GROUPS } from "./questionBank";
import {
  isPostgresActive,
  pgGetUserByEmail,
  pgGetUserById,
  pgCreateUser,
  pgGetUserChildren,
  pgAddUserChild,
  pgDeleteUserChild,
  pgGetAllUsers,
  pgGetCandidatesByUserId,
  pgGetCandidateById,
  pgGetCandidateByToken,
  pgCreateCandidate,
  pgUpdateCandidate,
  pgDeleteCandidate,
  pgSaveCandidateSubmission,
  pgGetAllCandidates,
  pgGetNannyTalentPool,
  pgUpdateCandidateTalentPool,
  pgGetAvailableNannyPoolForParents,
  pgCreateCandidateFromPool,
  pgGetAdCampaigns,
  pgCreateAdCampaign,
  pgUpdateAdCampaign,
  pgDeleteAdCampaign,
  pgTrackAdImpression,
  pgTrackAdClick,
  pgGetAdsForAge,
  pgGetAffiliateSettings,
  pgUpdateAffiliateSettings,
  pgGetAdminRecommendedProducts,
  pgCreateRecommendedProduct,
  pgUpdateRecommendedProduct,
  pgDeleteRecommendedProduct,
  pgGetPublicRecommendedProducts,
  pgGetUserQuestionBank,
  pgAddQuestionToBank,
  pgDeleteQuestionFromBank,
  pgGetParentCampaigns,
  pgCreateParentCampaign,
  pgDeleteParentCampaign,
} from "./postgres";

interface DatabaseSchema {
  users: User[];
  candidates: Candidate[];
  adCampaigns?: AdCampaign[];
  affiliateSettings?: AffiliateSettings;
  recommendedProducts?: RecommendedProduct[];
  userQuestionBank?: QuestionBankItem[];
  parentCampaigns?: ParentCampaign[];
}

export const DEFAULT_AD_CAMPAIGNS: AdCampaign[] = [
  {
    id: "ad_pampers_01",
    sponsorName: "Pampers Pure Harmony",
    title: "Pañales Hipoalergénicos & Toallitas Orgánicas",
    titleEs: "Pañales Hipoalergénicos & Toallitas Orgánicas",
    headline: "Protección dermatológica premium para bebés y lactantes (0 a 2 años)",
    headlineEs: "Protección dermatológica premium para bebés y lactantes (0 a 2 años)",
    description: "Cuidado delicado con 0% cloro y algodón premium. Evita dermatitis en pieles sensibles y brinda hasta 12 horas de absorción nocturna.",
    descriptionEs: "Cuidado delicado con 0% cloro y algodón premium. Evita dermatitis en pieles sensibles y brinda hasta 12 horas de absorción nocturna.",
    imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80",
    category: "diapers",
    placement: "dashboard_banner",
    targetMinAge: 0,
    targetMaxAge: 2,
    badgeText: "Patrocinador Destacado • Bebés 0-2a",
    badgeTextEs: "Patrocinador Destacado • Bebés 0-2a",
    ctaText: "Reclamar Muestra Gratis",
    ctaTextEs: "Reclamar Muestra Gratis",
    ctaUrl: "https://www.pampers.com",
    bgColor: "from-amber-500/10 via-orange-500/5 to-rose-500/10",
    active: true,
    impressions: 142,
    clicks: 19,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "ad_montessori_books_02",
    sponsorName: "Montessori Kids Club",
    title: "Cajas Sensoriales y Libros Ilustrados para Toddlers",
    titleEs: "Cajas Sensoriales y Libros Ilustrados para Toddlers",
    headline: "Estimulación cognitiva y gestión de rabietas para niños de 2 a 4 años",
    headlineEs: "Estimulación cognitiva y gestión de rabietas para niños de 2 a 4 años",
    description: "Kits mensuales de madera no tóxica y cuentos socioemocionales recomendados por psicólogos infantiles para desarrollar lenguaje y autorregulación.",
    descriptionEs: "Kits mensuales de madera no tóxica y cuentos socioemocionales recomendados por psicólogos infantiles para desarrollar lenguaje y autorregulación.",
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
    category: "books",
    placement: "dashboard_banner",
    targetMinAge: 2,
    targetMaxAge: 4,
    badgeText: "Recomendado por Psicólogos • 2-4 Años",
    badgeTextEs: "Recomendado por Psicólogos • 2-4 Años",
    ctaText: "Ver Catálogo 30% OFF",
    ctaTextEs: "Ver Catálogo 30% OFF",
    ctaUrl: "https://www.montessoriservices.com",
    bgColor: "from-sky-500/10 via-indigo-500/5 to-emerald-500/10",
    active: true,
    impressions: 215,
    clicks: 34,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "ad_aquasafe_swim_03",
    sponsorName: "AquaSafe Academy",
    title: "Prevención Acuática y Clases de Natación Infantil",
    titleEs: "Prevención Acuática y Clases de Natación Infantil",
    headline: "Supervivencia y flotación reflexiva para preescolares (3 a 6 años)",
    headlineEs: "Supervivencia y flotación reflexiva para preescolares (3 a 6 años)",
    description: "Reduce un 88% el riesgo de ahogamiento infantil con instructores certificados por la Cruz Roja y estimulación motriz temprana.",
    descriptionEs: "Reduce un 88% el riesgo de ahogamiento infantil con instructores certificados por la Cruz Roja y estimulación motriz temprana.",
    imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80",
    category: "education",
    placement: "campaign_interstitial",
    targetMinAge: 3,
    targetMaxAge: 6,
    badgeText: "Seguridad Infantil • 3-6 Años",
    badgeTextEs: "Seguridad Infantil • 3-6 Años",
    ctaText: "Agendar Clase de Prueba",
    ctaTextEs: "Agendar Clase de Prueba",
    ctaUrl: "https://www.redcross.org/take-a-class/swimming",
    bgColor: "from-teal-500/10 via-cyan-500/5 to-blue-500/10",
    active: true,
    impressions: 98,
    clicks: 12,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "ad_vitalcare_elderly_04",
    sponsorName: "VitalCare Geriatría & Teleasistencia",
    title: "Pastillero Inteligente y Sensor Anti-Caídas",
    titleEs: "Pastillero Inteligente y Sensor Anti-Caídas",
    headline: "Monitoreo de medicamentos y prevención de caídas para adultos mayores (60+ años)",
    headlineEs: "Monitoreo de medicamentos y prevención de caídas para adultos mayores (60+ años)",
    description: "Alarmas sonoras para tomas a tiempo, botón SOS para cuidadores y alertas en tiempo real al celular de la familia.",
    descriptionEs: "Alarmas sonoras para tomas a tiempo, botón SOS para cuidadores y alertas en tiempo real al celular de la familia.",
    imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80",
    category: "elderly_care",
    careCategory: "elderly_care",
    placement: "dashboard_banner",
    targetMinAge: 60,
    targetMaxAge: 120,
    badgeText: "Gerontología & Salud • Adulto Mayor",
    badgeTextEs: "Gerontología & Salud • Adulto Mayor",
    ctaText: "Ver Dispositivos y Descuento Familiar",
    ctaTextEs: "Ver Dispositivos y Descuento Familiar",
    ctaUrl: "https://www.amazon.com/s?k=smart+pill+dispenser+elderly&tag=matchcaring-20",
    bgColor: "from-emerald-500/10 via-teal-500/5 to-cyan-500/10",
    active: true,
    impressions: 112,
    clicks: 28,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "ad_neuroadapt_sensory_05",
    sponsorName: "NeuroAdapt Sensorial",
    title: "Kits de Regulación Sensorial y Comunicación SAAC",
    titleEs: "Kits de Regulación Sensorial y Comunicación SAAC",
    headline: "Herramientas clínicas de desescalada y pictogramas para TEA y neurodiversidad",
    headlineEs: "Herramientas clínicas de desescalada y pictogramas para TEA y neurodiversidad",
    description: "Desarrollados por terapeutas ocupacionales para prevenir sobrecargas sensoriales y facilitar la expresión de necesidades.",
    descriptionEs: "Desarrollados por terapeutas ocupacionales para prevenir sobrecargas sensoriales y facilitar la expresión de necesidades.",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
    category: "disability_care",
    careCategory: "disability_care",
    placement: "dashboard_banner",
    targetMinAge: 0,
    targetMaxAge: 120,
    badgeText: "Terapia Ocupacional • Neurodiversidad",
    badgeTextEs: "Terapia Ocupacional • Neurodiversidad",
    ctaText: "Explorar Recursos Terapéuticos",
    ctaTextEs: "Explorar Recursos Terapéuticos",
    ctaUrl: "https://www.amazon.com/s?k=sensory+tools+autism&tag=matchcaring-20",
    bgColor: "from-purple-500/10 via-fuchsia-500/5 to-indigo-500/10",
    active: true,
    impressions: 89,
    clicks: 22,
    createdAt: new Date().toISOString(),
  },
];

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

function ensureDbDirectory(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  ensureDbDirectory();
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = seedInitialData();
    saveDatabase(initialDb);
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const db: DatabaseSchema = JSON.parse(raw);
    let changed = false;

    if (!db.adCampaigns || db.adCampaigns.length === 0) {
      db.adCampaigns = DEFAULT_AD_CAMPAIGNS;
      changed = true;
    }

    // Ensure Super Admin user is always present with admin role
    const adminUser = db.users?.find((u) => u.email === "francisco.deskmultimedia@gmail.com");
    if (!adminUser) {
      if (!db.users) db.users = [];
      db.users.push({
        id: "usr_admin_francisco",
        email: "francisco.deskmultimedia@gmail.com",
        name: "Francisco Cornejo",
        passwordHash: "$2b$10$fDyFDE6hnr.kBcVhTNgIqeGGhPth7uDIrE7g5oxLkgsZizLjauJTO", // Phoebe2016.
        role: "admin",
        createdAt: "2026-10-04T18:00:00.000Z",
        children: [
          {
            id: "child_leo_01",
            name: "Leo",
            age: 3,
            notes: "Hijo de 3 años. Le encantan los paseos en el parque y bloques de construcción.",
          },
          {
            id: "child_mateo_02",
            name: "Mateo",
            age: 1,
            notes: "Bebé de 1 año. En etapa de gateo.",
          },
        ],
        childProfile: {
          name: "Leo",
          age: 3,
          notes: "Hijo de 3 años. Le encantan los paseos en el parque y bloques de construcción.",
        },
      });
      changed = true;
    } else if (adminUser.role !== "admin") {
      adminUser.role = "admin";
      changed = true;
    }

    // Ensure demo user has admin or parent role
    const demoUser = db.users?.find((u) => u.id === "usr_parent_demo" || u.email === "parent@example.com");
    if (demoUser && demoUser.role !== "admin") {
      demoUser.role = "admin";
      changed = true;
    }

    if (changed) {
      saveDatabase(db);
    }
    return db;
  } catch (err) {
    console.error("Error reading db.json, reinitializing seed:", err);
    const initialDb = seedInitialData();
    saveDatabase(initialDb);
    return initialDb;
  }
}

function saveDatabase(db: DatabaseSchema): void {
  ensureDbDirectory();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function seedInitialData(): DatabaseSchema {
  const superAdminUser: User = {
    id: "usr_admin_francisco",
    email: "francisco.deskmultimedia@gmail.com",
    name: "Francisco Cornejo",
    passwordHash: "$2b$10$fDyFDE6hnr.kBcVhTNgIqeGGhPth7uDIrE7g5oxLkgsZizLjauJTO", // Phoebe2016.
    role: "admin",
    createdAt: new Date().toISOString(),
    children: [
      {
        id: "child_leo_01",
        name: "Leo",
        age: 3,
        notes: "Hijo de 3 años. Le encantan los paseos en el parque y bloques de construcción.",
      },
      {
        id: "child_mateo_02",
        name: "Mateo",
        age: 1,
        notes: "Bebé de 1 año. En etapa de gateo.",
      },
    ],
    childProfile: {
      name: "Leo",
      age: 3,
      notes: "Hijo de 3 años. Le encantan los paseos en el parque y bloques de construcción.",
    },
  };

  const defaultPasswordHash = bcrypt.hashSync("password123", 10);
  const demoUserId = "usr_parent_demo";

  const defaultUser: User = {
    id: demoUserId,
    email: "parent@example.com",
    name: "Francisco Cornejo (Demo)",
    passwordHash: defaultPasswordHash,
    role: "admin",
    createdAt: new Date().toISOString(),
    children: [
      {
        id: "child_leo_01",
        name: "Leo",
        age: 3,
        notes: "Active 3-year-old son. Enjoys park walks, drawing, building blocks, and sensory sand. Working on emotional regulation during transitions.",
      },
      {
        id: "child_mateo_02",
        name: "Mateo",
        age: 1,
        notes: "1-year-old crawling infant brother. Curious oral explorer, teething, requires vigilant choking prevention and bath safety.",
      },
    ],
    childProfile: {
      name: "Leo",
      age: 3,
      notes: "Active 3-year-old son. Enjoys park walks, drawing, building blocks, and sensory sand. Working on emotional regulation during transitions.",
    },
  };

  // Sample Response 1: Maria Gonzalez (High score / Exceptional)
  const mariaResponses: CandidateResponse[] = [
    { questionId: "psy_01_frustration", selectedOptionId: "psy_01_a" },
    { questionId: "psy_02_tantrum_public", selectedOptionId: "psy_02_a" },
    { questionId: "psy_03_repetitive_stress", selectedOptionId: "psy_03_a" },
    { questionId: "safe_01_choking_prevention", selectedOptionId: "safe_01_a" },
    { questionId: "safe_02_water_safety", selectedOptionId: "safe_02_a" },
    { questionId: "safe_03_head_injury", selectedOptionId: "safe_03_a" },
    { questionId: "dev_01_potty_accident", selectedOptionId: "dev_01_a" },
    { questionId: "dev_02_screen_time_play", selectedOptionId: "dev_02_a" },
    { questionId: "dev_03_hitting_defiance", selectedOptionId: "dev_03_a" },
    { questionId: "eth_01_smartphone_policy", selectedOptionId: "eth_01_a" },
    { questionId: "eth_02_discipline_alignment", selectedOptionId: "eth_02_a" },
    { questionId: "sit_01_allergic_reaction", selectedOptionId: "sit_01_a" },
    { questionId: "sit_02_playground_stranger", selectedOptionId: "sit_02_a" },
  ];
  const mariaResult = evaluateAssessment(mariaResponses);

  // Sample Response 2: Sarah Jenkins (Moderate / Phone watchout)
  const sarahResponses: CandidateResponse[] = [
    { questionId: "psy_01_frustration", selectedOptionId: "psy_01_b" },
    { questionId: "psy_02_tantrum_public", selectedOptionId: "psy_02_b" },
    { questionId: "psy_03_repetitive_stress", selectedOptionId: "psy_03_b" },
    { questionId: "safe_01_choking_prevention", selectedOptionId: "safe_01_a" },
    { questionId: "safe_02_water_safety", selectedOptionId: "safe_02_a" },
    { questionId: "safe_03_head_injury", selectedOptionId: "safe_03_a" },
    { questionId: "dev_01_potty_accident", selectedOptionId: "dev_01_a" },
    { questionId: "dev_02_screen_time_play", selectedOptionId: "dev_02_d" },
    { questionId: "dev_03_hitting_defiance", selectedOptionId: "dev_03_a" },
    { questionId: "eth_01_smartphone_policy", selectedOptionId: "eth_01_b" },
    { questionId: "eth_02_discipline_alignment", selectedOptionId: "eth_02_a" },
    { questionId: "sit_01_allergic_reaction", selectedOptionId: "sit_01_a" },
    { questionId: "sit_02_playground_stranger", selectedOptionId: "sit_02_a" },
  ];
  const sarahResult = evaluateAssessment(sarahResponses);

  // Sample Response 3: Elena Vance (High Risk / Physical discipline & Water safety red flags)
  const elenaResponses: CandidateResponse[] = [
    { questionId: "psy_01_frustration", selectedOptionId: "psy_01_d" },
    { questionId: "psy_02_tantrum_public", selectedOptionId: "psy_02_c" },
    { questionId: "psy_03_repetitive_stress", selectedOptionId: "psy_03_d" },
    { questionId: "safe_01_choking_prevention", selectedOptionId: "safe_01_b" },
    { questionId: "safe_02_water_safety", selectedOptionId: "safe_02_b" },
    { questionId: "safe_03_head_injury", selectedOptionId: "safe_03_b" },
    { questionId: "dev_01_potty_accident", selectedOptionId: "dev_01_c" },
    { questionId: "dev_02_screen_time_play", selectedOptionId: "dev_02_b" },
    { questionId: "dev_03_hitting_defiance", selectedOptionId: "dev_03_b" },
    { questionId: "eth_01_smartphone_policy", selectedOptionId: "eth_01_c" },
    { questionId: "eth_02_discipline_alignment", selectedOptionId: "eth_02_b" },
    { questionId: "sit_01_allergic_reaction", selectedOptionId: "sit_01_d" },
    { questionId: "sit_02_playground_stranger", selectedOptionId: "sit_02_b" },
  ];
  const elenaResult = evaluateAssessment(elenaResponses);

  const initialCandidates: Candidate[] = [
    {
      id: "cand_maria_01",
      userId: demoUserId,
      token: "tok_maria_g_8841",
      name: "Maria Gonzalez",
      roleTarget: "Full-Time Nanny for 3yo Leo",
      phone: "+1 (555) 234-5678",
      email: "maria.gonzalez.care@example.com",
      status: "completed",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      profile: {
        fullName: "Maria Gonzalez",
        phone: "+1 (555) 234-5678",
        email: "maria.gonzalez.care@example.com",
        yearsOfExperience: 6,
        hasCprCertification: true,
        cprExpirationDate: "2027-04-15",
        hasEarlyChildhoodEducation: true,
        highestEducation: "Associate Degree in Early Childhood Development",
        authorizedToWork: true,
        availableStartDate: "2026-10-15",
        preferredHourlyRate: "$28 - $32 / hr",
        personalStatement:
          "Passionate early childhood specialist with 6+ years supporting toddlers through developmental leaps, potty training, sensory exploration, and emotional co-regulation.",
      },
      responses: mariaResponses,
      result: mariaResult,
      parentNotes: "Top pick! Excellent instincts on food refusal and zero hesitation on pediatric choking. Schedule in-person play trial.",
    },
    {
      id: "cand_sarah_02",
      userId: demoUserId,
      token: "tok_sarah_j_5521",
      name: "Sarah Jenkins",
      roleTarget: "Full-Time Nanny for 3yo Leo",
      phone: "+1 (555) 345-6789",
      email: "sarah.jenkins@example.com",
      status: "completed",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      profile: {
        fullName: "Sarah Jenkins",
        phone: "+1 (555) 345-6789",
        email: "sarah.jenkins@example.com",
        yearsOfExperience: 3,
        hasCprCertification: true,
        cprExpirationDate: "2026-11-20",
        hasEarlyChildhoodEducation: false,
        highestEducation: "High School Diploma & 40hr Childcare Workshop",
        authorizedToWork: true,
        availableStartDate: "2026-10-20",
        preferredHourlyRate: "$24 / hr",
        personalStatement: "Energetic babysitter who loves outdoor activities and arts & crafts.",
      },
      responses: sarahResponses,
      result: sarahResult,
      parentNotes: "Need to probe on phone boundaries and handling public tantrums without giving in with bribes.",
    },
    {
      id: "cand_elena_03",
      userId: demoUserId,
      token: "tok_elena_v_1192",
      name: "Elena Vance",
      roleTarget: "Full-Time Nanny for 3yo Leo",
      phone: "+1 (555) 876-5432",
      email: "elena.vance@example.com",
      status: "completed",
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      profile: {
        fullName: "Elena Vance",
        phone: "+1 (555) 876-5432",
        email: "elena.vance@example.com",
        yearsOfExperience: 2,
        hasCprCertification: false,
        hasEarlyChildhoodEducation: false,
        highestEducation: "High School",
        authorizedToWork: true,
        availableStartDate: "Immediate",
        preferredHourlyRate: "$20 / hr",
        personalStatement: "Available for full time childcare.",
      },
      responses: elenaResponses,
      result: elenaResult,
      parentNotes: "DO NOT HIRE. Multiple critical red flags (swatting hands, leaving child in bath for package, hiding head injury).",
    },
    {
      id: "cand_sofia_04",
      userId: demoUserId,
      token: "tok_sofia_m_9930",
      name: "Sofia Martinez",
      roleTarget: "Full-Time Nanny for 3yo Leo",
      phone: "+1 (555) 432-1098",
      email: "sofia.martinez@example.com",
      status: "invited",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentNotes: "Referred by neighbor Laura. Sent test link today.",
    },
  ];

  return {
    users: [superAdminUser, defaultUser],
    candidates: initialCandidates,
  };
}

// User Methods
export async function getUserByEmail(email: string): Promise<User | undefined> {
  if (isPostgresActive()) return pgGetUserByEmail(email);
  const db = loadDatabase();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function getUserById(id: string): Promise<User | undefined> {
  if (isPostgresActive()) return pgGetUserById(id);
  const db = loadDatabase();
  return db.users.find((u) => u.id === id);
}

export async function createUser(userData: {
  email: string;
  name: string;
  passwordHash: string;
  childProfile?: User["childProfile"];
}): Promise<User> {
  if (isPostgresActive()) return pgCreateUser(userData);
  const db = loadDatabase();
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: userData.email,
    name: userData.name,
    passwordHash: userData.passwordHash,
    createdAt: new Date().toISOString(),
    children: [
      {
        id: `child_${Date.now()}`,
        name: userData.childProfile?.name || "Child",
        age: userData.childProfile?.age || 3,
        notes: userData.childProfile?.notes,
      },
    ],
    childProfile: userData.childProfile,
  };
  db.users.push(newUser);
  saveDatabase(db);
  return newUser;
}

// Child Management Methods
export async function getUserChildren(userId: string): Promise<Child[]> {
  if (isPostgresActive()) return pgGetUserChildren(userId);
  const user = await getUserById(userId);
  if (!user) return [];
  if (user.children && user.children.length > 0) return user.children;
  if (user.childProfile) {
    return [
      {
        id: "child_primary",
        name: user.childProfile.name,
        age: user.childProfile.age,
        notes: user.childProfile.notes,
      },
    ];
  }
  return [];
}

export async function addUserChild(
  userId: string,
  childData: { name: string; age: number; notes?: string }
): Promise<Child | undefined> {
  if (isPostgresActive()) return pgAddUserChild(userId, childData);
  const db = loadDatabase();
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return undefined;

  const newChild: Child = {
    id: `child_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: childData.name,
    age: childData.age,
    notes: childData.notes,
  };

  if (!db.users[userIndex].children) {
    db.users[userIndex].children = [];
  }
  db.users[userIndex].children.push(newChild);
  saveDatabase(db);
  return newChild;
}

export async function deleteUserChild(userId: string, childId: string): Promise<boolean> {
  if (isPostgresActive()) return pgDeleteUserChild(userId, childId);
  const db = loadDatabase();
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1 || !db.users[userIndex].children) return false;

  const initialLen = db.users[userIndex].children.length;
  db.users[userIndex].children = db.users[userIndex].children.filter((c) => c.id !== childId);
  if (db.users[userIndex].children.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// Candidate Methods
export async function getCandidatesByUserId(userId: string): Promise<Candidate[]> {
  if (isPostgresActive()) return pgGetCandidatesByUserId(userId);
  const db = loadDatabase();
  return db.candidates.filter((c) => c.userId === userId);
}

export async function getCandidateById(id: string): Promise<Candidate | undefined> {
  if (isPostgresActive()) return pgGetCandidateById(id);
  const db = loadDatabase();
  return db.candidates.find((c) => c.id === id);
}

export async function getCandidateByToken(token: string): Promise<Candidate | undefined> {
  if (isPostgresActive()) return pgGetCandidateByToken(token);
  const db = loadDatabase();
  return db.candidates.find((c) => c.token === token);
}

export async function createCandidate(data: {
  userId: string;
  name: string;
  roleTarget: string;
  targetChildren?: Child[];
  askHourlyRate?: boolean;
  phone?: string;
  email?: string;
  parentNotes?: string;
  customQuestions?: CustomQuestion[];
}): Promise<Candidate> {
  if (isPostgresActive()) return pgCreateCandidate(data);
  const db = loadDatabase();
  const token = `nanny_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
  const newCandidate: Candidate = {
    id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: data.userId,
    token,
    name: data.name,
    roleTarget: data.roleTarget,
    targetChildren: data.targetChildren,
    askHourlyRate: data.askHourlyRate ?? true,
    phone: data.phone,
    email: data.email,
    status: "invited",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentNotes: data.parentNotes,
    customQuestions: data.customQuestions || [],
  };
  db.candidates.unshift(newCandidate);
  saveDatabase(db);
  return newCandidate;
}

export async function updateCandidate(
  id: string,
  updates: Partial<Candidate>
): Promise<Candidate | undefined> {
  if (isPostgresActive()) return pgUpdateCandidate(id, updates);
  const db = loadDatabase();
  const index = db.candidates.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  db.candidates[index] = {
    ...db.candidates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  return db.candidates[index];
}

export async function deleteCandidate(id: string, userId: string): Promise<boolean> {
  if (isPostgresActive()) return pgDeleteCandidate(id, userId);
  const db = loadDatabase();
  const initialLength = db.candidates.length;
  db.candidates = db.candidates.filter((c) => !(c.id === id && c.userId === userId));
  if (db.candidates.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export async function saveCandidateSubmission(
  token: string,
  profile: CandidateProfile,
  responses: CandidateResponse[],
  customAnswers?: CustomAnswer[]
): Promise<Candidate | undefined> {
  if (isPostgresActive()) return pgSaveCandidateSubmission(token, profile, responses, customAnswers);
  const db = loadDatabase();
  const index = db.candidates.findIndex((c) => c.token === token);
  if (index === -1) return undefined;

  const result = evaluateAssessment(responses);

  db.candidates[index] = {
    ...db.candidates[index],
    name: profile.fullName || db.candidates[index].name,
    email: profile.email || db.candidates[index].email,
    phone: profile.phone || db.candidates[index].phone,
    status: "completed",
    profile,
    responses,
    result,
    customAnswers: customAnswers || [],
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  return db.candidates[index];
}

// -------------------------------------------------------------
// SUPER ADMIN & PLATFORM ANALYTICS
// -------------------------------------------------------------

export async function getAllUsers(): Promise<Omit<User, "passwordHash">[]> {
  if (isPostgresActive()) return pgGetAllUsers();
  const db = loadDatabase();
  return db.users.map(({ passwordHash, ...rest }) => rest);
}

export async function getAllCandidates(): Promise<Candidate[]> {
  if (isPostgresActive()) return pgGetAllCandidates();
  const db = loadDatabase();
  return db.candidates;
}

// -------------------------------------------------------------
// NANNY TALENT POOL (BANCO GLOBAL DE NIÑERAS EVALUADAS)
// -------------------------------------------------------------

export async function getNannyTalentPool(): Promise<Candidate[]> {
  if (isPostgresActive()) return pgGetNannyTalentPool();
  const db = loadDatabase();
  // Any candidate with completed test or explicitly marked in talent pool
  return db.candidates.filter(
    (c) => c.inTalentPool || (c.status === "completed" && c.result)
  ).sort((a, b) => (b.result?.overallScore || 0) - (a.result?.overallScore || 0));
}

export async function updateCandidateTalentPool(
  candidateId: string,
  inTalentPool: boolean,
  talentPoolStatus: "available" | "placed" | "review" = "available"
): Promise<Candidate | undefined> {
  if (isPostgresActive()) return pgUpdateCandidateTalentPool(candidateId, inTalentPool, talentPoolStatus);
  const db = loadDatabase();
  const index = db.candidates.findIndex((c) => c.id === candidateId);
  if (index === -1) return undefined;

  db.candidates[index] = {
    ...db.candidates[index],
    inTalentPool,
    talentPoolStatus,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  return db.candidates[index];
}

const SPECIALIZED_CARE_POOL: Candidate[] = [
  {
    id: "pool_beatriz_m",
    userId: "system",
    token: "tok_beatriz_m_7712",
    name: "Beatriz Mendoza",
    roleTarget: "Cuidadora Geriátrica y Adulto Mayor",
    status: "completed",
    inTalentPool: true,
    talentPoolStatus: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      fullName: "Beatriz Mendoza",
      yearsOfExperience: 9,
      hasCprCertification: true,
      hasEarlyChildhoodEducation: false,
      highestEducation: "Técnico en Enfermería & Gerontología",
      authorizedToWork: true,
      phone: "+56 9 8452 1190",
      email: "beatriz.mendoza.care@gmail.com",
      preferredHourlyRate: "$18.000 / hora",
      personalStatement: "Enfermera auxiliar con 9 años de dedicación al cuidado integral del adulto mayor. Especializada en movilización segura cama-silla, administración rigurosa de medicamentos, control de presión arterial/glicemia y acompañamiento empático en etapas de Alzheimer y demencia leve.",
    },
    result: {
      overallScore: 95,
      tier: "Exceptional Fit",
      tierEs: "Ajuste Excepcional",
      summary: "Perfil clínico sobresaliente en paciencia, empatía, control de signos vitales y manejo de situaciones críticas en adultos mayores.",
      categoryScores: {} as any,
      redFlags: [],
      generatedInterviewQuestions: [],
      completedAt: new Date().toISOString(),
    },
  },
  {
    id: "pool_valentina_r",
    userId: "system",
    token: "tok_valentina_r_3341",
    name: "Valentina Rivas",
    roleTarget: "Asistente para Personas con Discapacidad & TEA",
    status: "completed",
    inTalentPool: true,
    talentPoolStatus: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      fullName: "Valentina Rivas",
      yearsOfExperience: 6,
      hasCprCertification: true,
      hasEarlyChildhoodEducation: true,
      highestEducation: "Licenciatura en Terapia Ocupacional",
      authorizedToWork: true,
      phone: "+56 9 7319 8820",
      email: "valentina.rivas.terapia@gmail.com",
      preferredHourlyRate: "$20.000 / hora",
      personalStatement: "Terapeuta ocupacional asistente con 6 años de experiencia en apoyo a personas con TEA, síndrome de Down y discapacidad motora. Enfoque en autonomía personal, desescalada sensorial no restrictiva y uso de pictogramas/SAAC.",
    },
    result: {
      overallScore: 94,
      tier: "Exceptional Fit",
      tierEs: "Ajuste Excepcional",
      summary: "Destacada formación en neurodiversidad, regulación sensorial, fomento de la independencia y transferencias ergonómicas.",
      categoryScores: {} as any,
      redFlags: [],
      generatedInterviewQuestions: [],
      completedAt: new Date().toISOString(),
    },
  },
];

export async function getAvailableNannyPoolForParents(): Promise<Candidate[]> {
  if (isPostgresActive()) return pgGetAvailableNannyPoolForParents();
  const db = loadDatabase();
  const allCandidates = [...db.candidates, ...SPECIALIZED_CARE_POOL];
  // Filter candidates suitable for parent pool browsing
  const seenNames = new Set<string>();
  return allCandidates
    .filter((c) => {
      // Must not be flagged as high risk
      if (c.result && c.result.tier === "High Risk / Not Recommended") return false;
      // Deduplicate by name for clean pool catalog
      const nameKey = c.name.toLowerCase().trim();
      if (seenNames.has(nameKey)) return false;
      seenNames.add(nameKey);
      return true;
    })
    .sort((a, b) => (b.result?.overallScore || 85) - (a.result?.overallScore || 85));
}

export async function createCandidateFromPool(
  userId: string,
  poolCandidateId: string,
  targetChildren: Child[],
  customQuestions?: CustomQuestion[]
): Promise<Candidate | null> {
  const targetLabel =
    targetChildren.length > 1
      ? `Hermanos: ${targetChildren.map((k) => k.name).join(" + ")}`
      : targetChildren[0]
      ? `${targetChildren[0].name} (${targetChildren[0].age} años)`
      : "Cuidado Infantil";

  if (isPostgresActive()) {
    const res = await pgCreateCandidateFromPool(userId, poolCandidateId, targetLabel, targetChildren);
    return res || null;
  }

  const db = loadDatabase();
  const poolCandidate = [...db.candidates, ...SPECIALIZED_CARE_POOL].find((c) => c.id === poolCandidateId);
  if (!poolCandidate) return null;

  const cleanName = poolCandidate.name.toLowerCase().replace(/[^a-z]/g, "");
  const newToken = `tok_${cleanName}_${Math.random().toString(36).substring(2, 7)}`;

  const newCandidate: Candidate = {
    id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    token: newToken,
    name: poolCandidate.name,
    roleTarget: `Niñera para ${targetLabel}`,
    targetChildren,
    phone: poolCandidate.phone,
    email: poolCandidate.email,
    status: "invited",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: poolCandidate.profile ? { ...poolCandidate.profile } : undefined,
    parentNotes: `Seleccionada del Pool de Niñeras (${poolCandidate.profile?.yearsOfExperience || 3}+ años de exp). Link de evaluación generado.`,
    customQuestions: customQuestions || [],
  };

  db.candidates.unshift(newCandidate);
  saveDatabase(db);
  return newCandidate;
}

// -------------------------------------------------------------
// AD ENGINE & MONETIZATION
// -------------------------------------------------------------

export async function getAdCampaigns(): Promise<AdCampaign[]> {
  if (isPostgresActive()) return pgGetAdCampaigns();
  const db = loadDatabase();
  return db.adCampaigns || DEFAULT_AD_CAMPAIGNS;
}

export async function createAdCampaign(
  data: Omit<AdCampaign, "id" | "impressions" | "clicks" | "createdAt">
): Promise<AdCampaign> {
  if (isPostgresActive()) return pgCreateAdCampaign(data);
  const db = loadDatabase();
  if (!db.adCampaigns) db.adCampaigns = [];

  const newAd: AdCampaign = {
    ...data,
    id: `ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    impressions: 0,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };

  db.adCampaigns.unshift(newAd);
  saveDatabase(db);
  return newAd;
}

export async function updateAdCampaign(
  id: string,
  updates: Partial<AdCampaign>
): Promise<AdCampaign | undefined> {
  if (isPostgresActive()) return pgUpdateAdCampaign(id, updates);
  const db = loadDatabase();
  if (!db.adCampaigns) return undefined;

  const index = db.adCampaigns.findIndex((a) => a.id === id);
  if (index === -1) return undefined;

  db.adCampaigns[index] = {
    ...db.adCampaigns[index],
    ...updates,
  };

  saveDatabase(db);
  return db.adCampaigns[index];
}

export async function deleteAdCampaign(id: string): Promise<boolean> {
  if (isPostgresActive()) return pgDeleteAdCampaign(id);
  const db = loadDatabase();
  if (!db.adCampaigns) return false;

  const initialLen = db.adCampaigns.length;
  db.adCampaigns = db.adCampaigns.filter((a) => a.id !== id);
  if (db.adCampaigns.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export async function trackAdImpression(id: string): Promise<void> {
  if (isPostgresActive()) return pgTrackAdImpression(id);
  const db = loadDatabase();
  if (!db.adCampaigns) return;
  const ad = db.adCampaigns.find((a) => a.id === id);
  if (ad) {
    ad.impressions = (ad.impressions || 0) + 1;
    saveDatabase(db);
  }
}

export async function trackAdClick(id: string): Promise<void> {
  if (isPostgresActive()) return pgTrackAdClick(id);
  const db = loadDatabase();
  if (!db.adCampaigns) return;
  const ad = db.adCampaigns.find((a) => a.id === id);
  if (ad) {
    ad.clicks = (ad.clicks || 0) + 1;
    saveDatabase(db);
  }
}

export async function getAdsForAge(
  age: number,
  placement?: AdPlacement,
  careCategory?: CareCategory | "all"
): Promise<AdCampaign[]> {
  if (isPostgresActive()) return pgGetAdsForAge(age, placement);
  const db = loadDatabase();
  const ads = db.adCampaigns || DEFAULT_AD_CAMPAIGNS;

  return ads.filter((ad) => {
    if (!ad.active) return false;
    if (placement && ad.placement !== placement) return false;
    if (careCategory && careCategory !== "all") {
      if (ad.careCategory && ad.careCategory !== "all") {
        return ad.careCategory === careCategory;
      }
      return age >= ad.targetMinAge && age <= ad.targetMaxAge;
    }
    return age >= ad.targetMinAge && age <= ad.targetMaxAge;
  });
}

// -------------------------------------------------------------
// AMAZON AFFILIATE & RECOMMENDED GEAR SETTINGS
// -------------------------------------------------------------

export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettings = {
  amazonTag: "matchcaring-20",
  enabled: true,
  disclaimerTextEs: "Como asociados de Amazon, obtenemos comisiones por compras válidas sin coste adicional para ti.",
  disclaimerTextEn: "As an Amazon Associate, we earn from qualifying purchases at no extra cost to you.",
};

export function applyAmazonAffiliateTag(url: string, tag: string): string {
  if (!url || !tag) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    if (url.includes("tag=")) {
      return url.replace(/tag=[^&]+/, `tag=${encodeURIComponent(tag)}`);
    }
    return url.includes("?") ? `${url}&tag=${encodeURIComponent(tag)}` : `${url}?tag=${encodeURIComponent(tag)}`;
  }
}

export async function getAffiliateSettings(): Promise<AffiliateSettings> {
  if (isPostgresActive()) return pgGetAffiliateSettings();
  const db = loadDatabase();
  return db.affiliateSettings || DEFAULT_AFFILIATE_SETTINGS;
}

export async function updateAffiliateSettings(
  updates: Partial<AffiliateSettings>
): Promise<AffiliateSettings> {
  if (isPostgresActive()) return pgUpdateAffiliateSettings(updates);
  const db = loadDatabase();
  db.affiliateSettings = {
    ...(db.affiliateSettings || DEFAULT_AFFILIATE_SETTINGS),
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveDatabase(db);
  return db.affiliateSettings;
}

export async function getAdminRecommendedProducts(): Promise<RecommendedProduct[]> {
  if (isPostgresActive()) return pgGetAdminRecommendedProducts();
  const db = loadDatabase();
  return db.recommendedProducts || RECOMMENDED_PRODUCTS;
}

export async function createRecommendedProduct(
  data: Omit<RecommendedProduct, "id">
): Promise<RecommendedProduct> {
  if (isPostgresActive()) return pgCreateRecommendedProduct(data);
  const db = loadDatabase();
  if (!db.recommendedProducts) {
    db.recommendedProducts = [...RECOMMENDED_PRODUCTS];
  }

  const newProd: RecommendedProduct = {
    ...data,
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    active: data.active !== false,
  };

  db.recommendedProducts.unshift(newProd);
  saveDatabase(db);
  return newProd;
}

export async function updateRecommendedProduct(
  id: string,
  updates: Partial<RecommendedProduct>
): Promise<RecommendedProduct | undefined> {
  if (isPostgresActive()) return pgUpdateRecommendedProduct(id, updates);
  const db = loadDatabase();
  if (!db.recommendedProducts) {
    db.recommendedProducts = [...RECOMMENDED_PRODUCTS];
  }

  const idx = db.recommendedProducts.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;

  db.recommendedProducts[idx] = {
    ...db.recommendedProducts[idx],
    ...updates,
  };
  saveDatabase(db);
  return db.recommendedProducts[idx];
}

export async function deleteRecommendedProduct(id: string): Promise<boolean> {
  if (isPostgresActive()) return pgDeleteRecommendedProduct(id);
  const db = loadDatabase();
  if (!db.recommendedProducts) {
    db.recommendedProducts = [...RECOMMENDED_PRODUCTS];
  }

  const initialLen = db.recommendedProducts.length;
  db.recommendedProducts = db.recommendedProducts.filter((p) => p.id !== id);
  if (db.recommendedProducts.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export async function getPublicRecommendedProducts(
  childAge?: number,
  category?: string,
  careCategory?: CareCategory | "all"
): Promise<{ products: RecommendedProduct[]; settings: AffiliateSettings }> {
  if (isPostgresActive()) return pgGetPublicRecommendedProducts(category, careCategory, childAge);
  const db = loadDatabase();
  const settings = db.affiliateSettings || DEFAULT_AFFILIATE_SETTINGS;
  let products = (db.recommendedProducts || RECOMMENDED_PRODUCTS).filter((p) => p.active !== false);

  if (category && category !== "all") {
    products = products.filter((p) => p.category === category);
  }

  if (careCategory && careCategory !== "all") {
    const matching = products.filter((p) => p.careCategory === careCategory || !p.careCategory);
    if (matching.length > 0) {
      products = matching;
    }
  }

  // Inject current configured Amazon tag into all product affiliate URLs
  const tag = settings.amazonTag || "matchcaring-20";
  const mapped = products.map((p) => ({
    ...p,
    affiliateUrl: applyAmazonAffiliateTag(p.affiliateUrl, tag),
  }));

  if (childAge !== undefined && childAge !== null) {
    mapped.sort((a, b) => {
      const aMatch = childAge >= a.targetMinAge && childAge <= a.targetMaxAge ? 1 : 0;
      const bMatch = childAge >= b.targetMinAge && childAge <= b.targetMaxAge ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  return { products: mapped, settings };
}

// -------------------------------------------------------------
// QUESTION BANK MANAGEMENT
// -------------------------------------------------------------

export async function getUserQuestionBank(userId: string): Promise<QuestionBankGroup[]> {
  if (isPostgresActive()) return pgGetUserQuestionBank(userId);
  const db = loadDatabase();
  const userCustomQuestions = (db.userQuestionBank || []).filter((q) => q.userId === userId || !q.userId);

  // Clone default groups
  const groups: QuestionBankGroup[] = DEFAULT_QUESTION_BANK_GROUPS.map((g) => ({
    ...g,
    questions: [...g.questions],
  }));

  // Append user's custom group if they created custom questions
  const userOnlyQuestions = userCustomQuestions.filter((q) => q.isCustomUser);
  if (userOnlyQuestions.length > 0) {
    groups.unshift({
      id: "grp_user_saved",
      nameEs: "⭐ Mis Preguntas Guardadas",
      nameEn: "⭐ My Saved Questions",
      descriptionEs: "Preguntas personalizadas creadas por ti para reutilizar en cualquier prueba.",
      descriptionEn: "Your custom created questions ready to reuse across caregiver tests.",
      icon: "Bookmark",
      questions: userOnlyQuestions,
    });
  }

  return groups;
}

export async function addQuestionToBank(
  userId: string,
  data: Omit<QuestionBankItem, "id">
): Promise<QuestionBankItem> {
  if (isPostgresActive()) return pgAddQuestionToBank(userId, data);
  const db = loadDatabase();
  if (!db.userQuestionBank) db.userQuestionBank = [];

  const newItem: QuestionBankItem = {
    ...data,
    id: `qbank_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    isCustomUser: true,
  };

  db.userQuestionBank.unshift(newItem);
  saveDatabase(db);
  return newItem;
}

export async function deleteQuestionFromBank(userId: string, questionId: string): Promise<boolean> {
  if (isPostgresActive()) return pgDeleteQuestionFromBank(userId, questionId);
  const db = loadDatabase();
  if (!db.userQuestionBank) return false;

  const initialLen = db.userQuestionBank.length;
  db.userQuestionBank = db.userQuestionBank.filter(
    (q) => !(q.id === questionId && (q.userId === userId || !q.userId))
  );

  if (db.userQuestionBank.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// PARENT CAMPAIGNS MANAGEMENT
// -------------------------------------------------------------

export async function getParentCampaigns(userId: string): Promise<ParentCampaign[]> {
  if (isPostgresActive()) return pgGetParentCampaigns(userId);
  const db = loadDatabase();
  let campaigns = (db.parentCampaigns || []).filter((c) => c.userId === userId);

  // If no campaigns exist yet, synthesize or bootstrap default campaigns from children
  if (campaigns.length === 0) {
    const user = db.users.find((u) => u.id === userId);
    const children = user?.children || (user?.childProfile ? [{ id: "child_leo", ...user.childProfile }] : []);

    if (children.length > 0) {
      if (!db.parentCampaigns) db.parentCampaigns = [];

      // Create primary campaign
      const defaultCamp: ParentCampaign = {
        id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        title: `Campaña Principal para ${children[0].name} (${children[0].age} años)`,
        targetChildren: [children[0]],
        scheduleType: "full_time",
        expectedHourlyRate: "$25 - $30 / hr",
        startDate: "Inmediata",
        notes: `Búsqueda activa de niñera para el cuidado y desarrollo de ${children[0].name}.`,
        active: true,
        publicToken: `camp_${Math.random().toString(36).substring(2, 8)}`,
        createdAt: new Date().toISOString(),
      };
      db.parentCampaigns.push(defaultCamp);
      saveDatabase(db);
      campaigns = [defaultCamp];
    }
  }

  return campaigns;
}

export async function createParentCampaign(
  userId: string,
  data: Omit<ParentCampaign, "id" | "userId" | "createdAt" | "publicToken">
): Promise<ParentCampaign> {
  if (isPostgresActive()) return pgCreateParentCampaign(userId, data);
  const db = loadDatabase();
  if (!db.parentCampaigns) db.parentCampaigns = [];

  const newCampaign: ParentCampaign = {
    ...data,
    id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    publicToken: `camp_${Math.random().toString(36).substring(2, 8)}`,
    active: data.active !== false,
    createdAt: new Date().toISOString(),
  };

  db.parentCampaigns.unshift(newCampaign);
  saveDatabase(db);
  return newCampaign;
}

export async function deleteParentCampaign(userId: string, campaignId: string): Promise<boolean> {
  if (isPostgresActive()) return pgDeleteParentCampaign(userId, campaignId);
  const db = loadDatabase();
  if (!db.parentCampaigns) return false;

  const initialLen = db.parentCampaigns.length;
  db.parentCampaigns = db.parentCampaigns.filter(
    (c) => !(c.id === campaignId && c.userId === userId)
  );

  if (db.parentCampaigns.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}


