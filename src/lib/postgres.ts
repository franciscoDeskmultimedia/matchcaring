import { Pool } from "pg";
import {
  AdCampaign,
  AdPlacement,
  AffiliateSettings,
  Candidate,
  CandidateProfile,
  CandidateResponse,
  CareCategory,
  Child,
  ParentCampaign,
  QuestionBankGroup,
  QuestionBankItem,
  RecommendedProduct,
  User,
} from "./types";
import { evaluateAssessment } from "./scoring";
import { DEFAULT_QUESTION_BANK_GROUPS } from "./questionBank";
import { RECOMMENDED_PRODUCTS } from "./recommendedProducts";

// Singleton pool pattern for Next.js Serverless Functions
let globalPool: Pool | null = null;
let schemaEnsured = false;

export function isPostgresActive(): boolean {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

export function getPostgresPool(): Pool {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("POSTGRES_URL or DATABASE_URL is not set");
    }
    globalPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return globalPool;
}

// Super Admin definition to always preserve
const SUPER_ADMIN = {
  id: "usr_admin_francisco",
  email: "francisco.deskmultimedia@gmail.com",
  name: "Francisco Cornejo",
  passwordHash: "$2b$10$fDyFDE6hnr.kBcVhTNgIqeGGhPth7uDIrE7g5oxLkgsZizLjauJTO", // Phoebe2016.
  role: "admin",
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

export async function ensurePostgresSchema(): Promise<void> {
  if (schemaEnsured || !isPostgresActive()) return;

  const pool = getPostgresPool();
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(32) DEFAULT 'parent',
          children JSONB DEFAULT '[]'::jsonb,
          child_profile JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      CREATE TABLE IF NOT EXISTS candidates (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(64) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          role_target VARCHAR(255) NOT NULL,
          phone VARCHAR(64),
          email VARCHAR(255),
          status VARCHAR(32) DEFAULT 'invited',
          target_children JSONB,
          parent_custom_questions JSONB,
          parent_custom_responses JSONB,
          profile JSONB,
          responses JSONB,
          result JSONB,
          parent_notes TEXT,
          in_talent_pool BOOLEAN DEFAULT false,
          talent_pool_status VARCHAR(32) DEFAULT 'review',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_candidates_user ON candidates(user_id);
      CREATE INDEX IF NOT EXISTS idx_candidates_token ON candidates(token);
      ALTER TABLE candidates ADD COLUMN IF NOT EXISTS campaign_id VARCHAR(64);
      CREATE INDEX IF NOT EXISTS idx_candidates_campaign ON candidates(campaign_id);

      CREATE TABLE IF NOT EXISTS parent_campaigns (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          care_category VARCHAR(64) DEFAULT 'childcare',
          target_children JSONB,
          schedule_type VARCHAR(64),
          expected_hourly_rate VARCHAR(64),
          start_date VARCHAR(64),
          notes TEXT,
          active BOOLEAN DEFAULT true,
          public_token VARCHAR(64),
          share_code VARCHAR(64),
          shared_with_emails JSONB DEFAULT '[]'::jsonb,
          shared_with_user_ids JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE parent_campaigns ADD COLUMN IF NOT EXISTS share_code VARCHAR(64);
      ALTER TABLE parent_campaigns ADD COLUMN IF NOT EXISTS shared_with_emails JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE parent_campaigns ADD COLUMN IF NOT EXISTS shared_with_user_ids JSONB DEFAULT '[]'::jsonb;

      CREATE TABLE IF NOT EXISTS ad_campaigns (
          id VARCHAR(64) PRIMARY KEY,
          sponsor_name VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          title_es VARCHAR(255),
          headline VARCHAR(255) NOT NULL,
          headline_es VARCHAR(255),
          description TEXT,
          description_es TEXT,
          image_url TEXT,
          category VARCHAR(64) NOT NULL,
          placement VARCHAR(64) NOT NULL,
          target_min_age INT DEFAULT 0,
          target_max_age INT DEFAULT 120,
          badge_text VARCHAR(128),
          badge_text_es VARCHAR(128),
          cta_text VARCHAR(128) NOT NULL,
          cta_text_es VARCHAR(128),
          cta_url TEXT NOT NULL,
          bg_color VARCHAR(128) DEFAULT 'from-amber-500/10 via-orange-500/5 to-rose-500/10',
          active BOOLEAN DEFAULT true,
          impressions INT DEFAULT 0,
          clicks INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS affiliate_settings (
          id VARCHAR(64) PRIMARY KEY,
          amazon_tag VARCHAR(64) NOT NULL DEFAULT 'matchcaring-20',
          auto_inject_links BOOLEAN DEFAULT true,
          disclosure_text TEXT,
          disclosure_text_es TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recommended_products (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          title_es VARCHAR(255),
          description TEXT,
          description_es TEXT,
          image_url TEXT,
          category VARCHAR(64) NOT NULL,
          care_category VARCHAR(64) DEFAULT 'childcare',
          target_min_age INT DEFAULT 0,
          target_max_age INT DEFAULT 18,
          badge_text VARCHAR(128),
          badge_text_es VARCHAR(128),
          asin VARCHAR(64),
          price_estimate VARCHAR(64),
          affiliate_url TEXT NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_question_bank (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64),
          group_id VARCHAR(64),
          care_category VARCHAR(64),
          group_name_es VARCHAR(255),
          group_name_en VARCHAR(255),
          prompt TEXT NOT NULL,
          prompt_es TEXT NOT NULL,
          type VARCHAR(32) NOT NULL,
          options JSONB,
          options_es JSONB,
          required BOOLEAN DEFAULT true,
          category VARCHAR(64),
          is_custom_user BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure Super Admin exists in Postgres
    await client.query(
      `INSERT INTO users (id, email, name, password_hash, role, children, child_profile, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         role = 'admin',
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash;`,
      [
        SUPER_ADMIN.id,
        SUPER_ADMIN.email,
        SUPER_ADMIN.name,
        SUPER_ADMIN.passwordHash,
        "admin",
        JSON.stringify(SUPER_ADMIN.children),
        JSON.stringify(SUPER_ADMIN.childProfile),
        new Date().toISOString(),
      ]
    );

    schemaEnsured = true;
  } catch (err) {
    console.error("Error ensuring Postgres schema:", err);
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------

function mapUserRow(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    role: row.role || "parent",
    children: typeof row.children === "string" ? JSON.parse(row.children) : row.children || [],
    childProfile: typeof row.child_profile === "string" ? JSON.parse(row.child_profile) : row.child_profile || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function pgGetUserByEmail(email: string): Promise<User | undefined> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", [email]);
  if (res.rows.length === 0) return undefined;
  return mapUserRow(res.rows[0]);
}

export async function pgGetUserById(id: string): Promise<User | undefined> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
  if (res.rows.length === 0) return undefined;
  return mapUserRow(res.rows[0]);
}

export async function pgCreateUser(userData: {
  email: string;
  name: string;
  passwordHash: string;
  children?: Child[];
  childProfile?: { name: string; age: number; notes?: string };
  role?: "parent" | "admin";
}): Promise<User> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const role = userData.role || "parent";
  const children = userData.children || [];
  const childProfile = userData.childProfile || (children.length > 0 ? children[0] : null);

  const res = await pool.query(
    `INSERT INTO users (id, email, name, password_hash, role, children, child_profile, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     RETURNING *`,
    [
      id,
      userData.email.toLowerCase(),
      userData.name,
      userData.passwordHash,
      role,
      JSON.stringify(children),
      JSON.stringify(childProfile),
      now,
    ]
  );

  return mapUserRow(res.rows[0]);
}

export async function pgGetUserChildren(userId: string): Promise<Child[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT children, child_profile FROM users WHERE id = $1 LIMIT 1", [userId]);
  if (res.rows.length === 0) return [];
  const row = res.rows[0];
  const children = typeof row.children === "string" ? JSON.parse(row.children) : row.children || [];
  if (children.length > 0) return children;
  if (row.child_profile) {
    const cp = typeof row.child_profile === "string" ? JSON.parse(row.child_profile) : row.child_profile;
    return [{ id: "child_primary", name: cp.name, age: cp.age, notes: cp.notes }];
  }
  return [];
}

export async function pgAddUserChild(userId: string, child: Omit<Child, "id">): Promise<Child> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const current = await pgGetUserChildren(userId);
  const newChild: Child = {
    ...child,
    id: `child_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
  const updated = [...current, newChild];

  await pool.query(
    `UPDATE users SET children = $1, child_profile = $2, updated_at = NOW() WHERE id = $3`,
    [JSON.stringify(updated), JSON.stringify(updated[0]), userId]
  );
  return newChild;
}

export async function pgDeleteUserChild(userId: string, childId: string): Promise<boolean> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const current = await pgGetUserChildren(userId);
  const updated = current.filter((c) => c.id !== childId);
  if (updated.length === current.length) return false;

  await pool.query(
    `UPDATE users SET children = $1, child_profile = $2, updated_at = NOW() WHERE id = $3`,
    [JSON.stringify(updated), updated.length > 0 ? JSON.stringify(updated[0]) : null, userId]
  );
  return true;
}

export async function pgGetAllUsers(): Promise<Omit<User, "passwordHash">[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT id, email, name, role, children, child_profile, created_at FROM users ORDER BY created_at DESC");
  return res.rows.map((row) => {
    const u = mapUserRow(row);
    const { passwordHash, ...rest } = u;
    return rest;
  });
}

// -------------------------------------------------------------
// CANDIDATE OPERATIONS
// -------------------------------------------------------------

function mapCandidateRow(row: any): Candidate {
  return {
    id: row.id,
    userId: row.user_id,
    campaignId: row.campaign_id || undefined,
    token: row.token,
    name: row.name,
    roleTarget: row.role_target,
    phone: row.phone || undefined,
    email: row.email || undefined,
    status: row.status,
    targetChildren: typeof row.target_children === "string" ? JSON.parse(row.target_children) : row.target_children || undefined,
    customQuestions: typeof row.parent_custom_questions === "string" ? JSON.parse(row.parent_custom_questions) : row.parent_custom_questions || undefined,
    customAnswers: typeof row.parent_custom_responses === "string" ? JSON.parse(row.parent_custom_responses) : row.parent_custom_responses || undefined,
    profile: typeof row.profile === "string" ? JSON.parse(row.profile) : row.profile || undefined,
    responses: typeof row.responses === "string" ? JSON.parse(row.responses) : row.responses || undefined,
    result: typeof row.result === "string" ? JSON.parse(row.result) : row.result || undefined,
    parentNotes: row.parent_notes || undefined,
    inTalentPool: row.in_talent_pool || false,
    talentPoolStatus: row.talent_pool_status || "review",
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function pgGetCandidatesByUserId(userId: string): Promise<Candidate[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();

  // Find all campaign owner IDs accessible to this user (owned or shared)
  const accessibleCampaigns = await pgGetParentCampaigns(userId);
  const userIds = Array.from(new Set([userId, ...accessibleCampaigns.map((c) => c.userId)]));

  const res = await pool.query(
    "SELECT * FROM candidates WHERE user_id = ANY($1::text[]) ORDER BY created_at DESC",
    [userIds]
  );
  return res.rows.map(mapCandidateRow);
}

export async function pgGetCandidateById(id: string): Promise<Candidate | undefined> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT * FROM candidates WHERE id = $1 LIMIT 1", [id]);
  if (res.rows.length === 0) return undefined;
  return mapCandidateRow(res.rows[0]);
}

export async function pgGetCandidateByToken(token: string): Promise<Candidate | undefined> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT * FROM candidates WHERE token = $1 LIMIT 1", [token]);
  if (res.rows.length === 0) return undefined;
  return mapCandidateRow(res.rows[0]);
}

export async function pgCreateCandidate(data: {
  userId: string;
  campaignId?: string;
  name: string;
  roleTarget: string;
  phone?: string;
  email?: string;
  parentNotes?: string;
  targetChildren?: Child[];
  parentCustomQuestions?: any[];
}): Promise<Candidate> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const id = `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const token = `tok_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const res = await pool.query(
    `INSERT INTO candidates (
       id, user_id, campaign_id, token, name, role_target, phone, email, status,
       target_children, parent_custom_questions, parent_notes, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'invited', $9, $10, $11, $12, $12)
     RETURNING *`,
    [
      id,
      data.userId,
      data.campaignId || null,
      token,
      data.name,
      data.roleTarget,
      data.phone || null,
      data.email || null,
      JSON.stringify(data.targetChildren || null),
      JSON.stringify(data.parentCustomQuestions || null),
      data.parentNotes || null,
      now,
    ]
  );
  return mapCandidateRow(res.rows[0]);
}

export async function pgUpdateCandidate(
  id: string,
  updates: Partial<Candidate>
): Promise<Candidate | undefined> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const current = await pgGetCandidateById(id);
  if (!current) return undefined;

  const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
  await pool.query(
    `UPDATE candidates SET
       name = $1, role_target = $2, phone = $3, email = $4, status = $5,
       parent_notes = $6, in_talent_pool = $7, talent_pool_status = $8,
       updated_at = NOW()
     WHERE id = $9`,
    [
      merged.name,
      merged.roleTarget,
      merged.phone || null,
      merged.email || null,
      merged.status,
      merged.parentNotes || null,
      merged.inTalentPool || false,
      merged.talentPoolStatus || "review",
      id,
    ]
  );
  return merged;
}

export async function pgDeleteCandidate(id: string, userId: string): Promise<boolean> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("DELETE FROM candidates WHERE id = $1 AND user_id = $2", [id, userId]);
  return (res.rowCount ?? 0) > 0;
}

export async function pgSaveCandidateSubmission(
  token: string,
  profile: CandidateProfile,
  responses: CandidateResponse[],
  parentCustomResponses?: any[]
): Promise<Candidate | undefined> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const candidate = await pgGetCandidateByToken(token);
  if (!candidate) return undefined;

  const result = evaluateAssessment(responses);
  const now = new Date().toISOString();

  const res = await pool.query(
    `UPDATE candidates SET
       profile = $1,
       responses = $2,
       result = $3,
       parent_custom_responses = $4,
       status = 'completed',
       updated_at = $5
     WHERE token = $6
     RETURNING *`,
    [
      JSON.stringify(profile),
      JSON.stringify(responses),
      JSON.stringify(result),
      JSON.stringify(parentCustomResponses || null),
      now,
      token,
    ]
  );
  return mapCandidateRow(res.rows[0]);
}

export async function pgGetAllCandidates(): Promise<Candidate[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT * FROM candidates ORDER BY created_at DESC");
  return res.rows.map(mapCandidateRow);
}

export async function pgGetNannyTalentPool(): Promise<Candidate[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query(
    "SELECT * FROM candidates WHERE in_talent_pool = true OR status = 'completed' ORDER BY created_at DESC"
  );
  return res.rows.map(mapCandidateRow);
}

export async function pgUpdateCandidateTalentPool(
  candidateId: string,
  inTalentPool: boolean,
  status: "review" | "available" | "placed" = "review"
): Promise<Candidate | undefined> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query(
    `UPDATE candidates SET in_talent_pool = $1, talent_pool_status = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [inTalentPool, status, candidateId]
  );
  if (res.rows.length === 0) return undefined;
  return mapCandidateRow(res.rows[0]);
}

export async function pgGetAvailableNannyPoolForParents(): Promise<Candidate[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query(
    "SELECT * FROM candidates WHERE in_talent_pool = true AND talent_pool_status = 'available' ORDER BY updated_at DESC"
  );
  return res.rows.map(mapCandidateRow);
}

export async function pgCreateCandidateFromPool(
  parentUserId: string,
  poolCandidateId: string,
  roleTarget: string,
  targetChildren?: Child[]
): Promise<Candidate | undefined> {
  await ensurePostgresSchema();
  const candidate = await pgGetCandidateById(poolCandidateId);
  if (!candidate) return undefined;

  const pool = getPostgresPool();
  const newId = `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newToken = `tok_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const res = await pool.query(
    `INSERT INTO candidates (
       id, user_id, token, name, role_target, phone, email, status,
       target_children, profile, responses, result, parent_notes,
       in_talent_pool, talent_pool_status, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,false,'review',$14,$14)
     RETURNING *`,
    [
      newId,
      parentUserId,
      newToken,
      candidate.name,
      roleTarget,
      candidate.phone || null,
      candidate.email || null,
      candidate.status,
      JSON.stringify(targetChildren || candidate.targetChildren || null),
      JSON.stringify(candidate.profile || null),
      JSON.stringify(candidate.responses || null),
      JSON.stringify(candidate.result || null),
      `Agregada directamente desde el Pool Público de Niñeras (${candidate.name}).`,
      now,
    ]
  );
  return mapCandidateRow(res.rows[0]);
}

// -------------------------------------------------------------
// AD CAMPAIGNS
// -------------------------------------------------------------

function mapAdRow(row: any): AdCampaign {
  return {
    id: row.id,
    sponsorName: row.sponsor_name,
    title: row.title,
    titleEs: row.title_es || undefined,
    headline: row.headline,
    headlineEs: row.headline_es || undefined,
    description: row.description,
    descriptionEs: row.description_es || undefined,
    imageUrl: row.image_url || undefined,
    category: row.category,
    placement: row.placement,
    targetMinAge: row.target_min_age,
    targetMaxAge: row.target_max_age,
    badgeText: row.badge_text || undefined,
    badgeTextEs: row.badge_text_es || undefined,
    ctaText: row.cta_text,
    ctaTextEs: row.cta_text_es || undefined,
    ctaUrl: row.cta_url,
    bgColor: row.bg_color || undefined,
    active: row.active !== false,
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function pgGetAdCampaigns(): Promise<AdCampaign[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT * FROM ad_campaigns ORDER BY created_at DESC");
  return res.rows.map(mapAdRow);
}

export async function pgCreateAdCampaign(
  data: Omit<AdCampaign, "id" | "impressions" | "clicks" | "createdAt">
): Promise<AdCampaign> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const id = `ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const res = await pool.query(
    `INSERT INTO ad_campaigns (
       id, sponsor_name, title, title_es, headline, headline_es, description, description_es,
       image_url, category, placement, target_min_age, target_max_age, badge_text, badge_text_es,
       cta_text, cta_text_es, cta_url, bg_color, active, impressions, clicks, created_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,0,0,$21)
     RETURNING *`,
    [
      id,
      data.sponsorName,
      data.title,
      data.titleEs || null,
      data.headline,
      data.headlineEs || null,
      data.description,
      data.descriptionEs || null,
      data.imageUrl || null,
      data.category,
      data.placement,
      data.targetMinAge ?? 0,
      data.targetMaxAge ?? 120,
      data.badgeText || null,
      data.badgeTextEs || null,
      data.ctaText,
      data.ctaTextEs || null,
      data.ctaUrl,
      data.bgColor || null,
      data.active !== false,
      now,
    ]
  );
  return mapAdRow(res.rows[0]);
}

export async function pgUpdateAdCampaign(
  id: string,
  data: Partial<AdCampaign>
): Promise<AdCampaign | undefined> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const current = (await pool.query("SELECT * FROM ad_campaigns WHERE id = $1 LIMIT 1", [id])).rows[0];
  if (!current) return undefined;

  const merged = { ...mapAdRow(current), ...data };
  await pool.query(
    `UPDATE ad_campaigns SET
       sponsor_name = $1, title = $2, title_es = $3, headline = $4, headline_es = $5,
       description = $6, description_es = $7, image_url = $8, category = $9, placement = $10,
       target_min_age = $11, target_max_age = $12, badge_text = $13, badge_text_es = $14,
       cta_text = $15, cta_text_es = $16, cta_url = $17, bg_color = $18, active = $19
     WHERE id = $20`,
    [
      merged.sponsorName,
      merged.title,
      merged.titleEs || null,
      merged.headline,
      merged.headlineEs || null,
      merged.description,
      merged.descriptionEs || null,
      merged.imageUrl || null,
      merged.category,
      merged.placement,
      merged.targetMinAge,
      merged.targetMaxAge,
      merged.badgeText || null,
      merged.badgeTextEs || null,
      merged.ctaText,
      merged.ctaTextEs || null,
      merged.ctaUrl,
      merged.bgColor || null,
      merged.active,
      id,
    ]
  );
  return merged;
}

export async function pgDeleteAdCampaign(id: string): Promise<boolean> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("DELETE FROM ad_campaigns WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function pgTrackAdImpression(id: string): Promise<void> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  await pool.query("UPDATE ad_campaigns SET impressions = impressions + 1 WHERE id = $1", [id]);
}

export async function pgTrackAdClick(id: string): Promise<void> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  await pool.query("UPDATE ad_campaigns SET clicks = clicks + 1 WHERE id = $1", [id]);
}

export async function pgGetAdsForAge(
  childAge?: number,
  placement: AdPlacement = "dashboard_banner"
): Promise<AdCampaign[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query(
    "SELECT * FROM ad_campaigns WHERE active = true AND placement = $1 ORDER BY created_at DESC",
    [placement]
  );
  let ads = res.rows.map(mapAdRow);
  if (childAge !== undefined && childAge !== null) {
    ads = ads.filter((ad) => childAge >= ad.targetMinAge && childAge <= ad.targetMaxAge);
  }
  return ads;
}

// -------------------------------------------------------------
// AFFILIATE SETTINGS & PRODUCTS
// -------------------------------------------------------------

export async function pgGetAffiliateSettings(): Promise<AffiliateSettings> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT * FROM affiliate_settings WHERE id = 'global_settings' LIMIT 1");
  if (res.rows.length === 0) {
    return {
      amazonTag: "matchcaring-20",
      enabled: true,
      disclaimerTextEn: "As an Amazon Associate, we earn from qualifying purchases at no extra cost to you.",
      disclaimerTextEs: "Como asociados de Amazon, obtenemos comisiones por compras válidas sin coste adicional para ti.",
    };
  }
  const row = res.rows[0];
  return {
    amazonTag: row.amazon_tag || "matchcaring-20",
    enabled: row.auto_inject_links !== false,
    disclaimerTextEn: row.disclosure_text || "As an Amazon Associate, we earn from qualifying purchases at no extra cost to you.",
    disclaimerTextEs: row.disclosure_text_es || "Como asociados de Amazon, obtenemos comisiones por compras válidas sin coste adicional para ti.",
  };
}

export async function pgUpdateAffiliateSettings(data: Partial<AffiliateSettings>): Promise<AffiliateSettings> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const current = await pgGetAffiliateSettings();
  const updated: AffiliateSettings = { ...current, ...data };

  await pool.query(
    `INSERT INTO affiliate_settings (id, amazon_tag, auto_inject_links, disclosure_text, disclosure_text_es, updated_at)
     VALUES ('global_settings', $1, $2, $3, $4, NOW())
     ON CONFLICT (id) DO UPDATE SET
       amazon_tag = EXCLUDED.amazon_tag,
       auto_inject_links = EXCLUDED.auto_inject_links,
       disclosure_text = EXCLUDED.disclosure_text,
       disclosure_text_es = EXCLUDED.disclosure_text_es,
       updated_at = NOW()`,
    [
      updated.amazonTag,
      updated.enabled !== false,
      updated.disclaimerTextEn || null,
      updated.disclaimerTextEs || null,
    ]
  );
  return updated;
}

function mapProductRow(row: any): RecommendedProduct {
  return {
    id: row.id,
    title: row.title,
    titleEs: row.title_es || row.title,
    description: row.description || "",
    descriptionEs: row.description_es || row.description || "",
    imageUrl: row.image_url || "",
    category: row.category,
    careCategory: row.care_category || "childcare",
    categoryLabelEs: row.category_label_es || "Recomendado",
    categoryLabelEn: row.category_label_en || "Recommended",
    targetMinAge: row.target_min_age ?? 0,
    targetMaxAge: row.target_max_age ?? 18,
    ageBadge: row.age_badge || "",
    ageBadgeEs: row.age_badge_es || "",
    pedagogicalBenefitEs: row.pedagogical_benefit_es || "",
    pedagogicalBenefitEn: row.pedagogical_benefit_en || "",
    affiliateUrl: row.affiliate_url,
    priceEstimate: row.price_estimate || "",
    rating: Number(row.rating) || 4.8,
    reviewCount: Number(row.review_count) || 120,
    badge: row.badge_text || undefined,
    badgeEs: row.badge_text_es || undefined,
    active: row.active !== false,
  };
}

export async function pgGetAdminRecommendedProducts(): Promise<RecommendedProduct[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT * FROM recommended_products ORDER BY created_at DESC");
  if (res.rows.length === 0) {
    return RECOMMENDED_PRODUCTS;
  }
  return res.rows.map(mapProductRow);
}

export async function pgCreateRecommendedProduct(
  data: Omit<RecommendedProduct, "id">
): Promise<RecommendedProduct> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const res = await pool.query(
    `INSERT INTO recommended_products (
       id, title, title_es, description, description_es, image_url, category, care_category,
       target_min_age, target_max_age, badge_text, badge_text_es, price_estimate,
       affiliate_url, active, created_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
     RETURNING *`,
    [
      id,
      data.title,
      data.titleEs || null,
      data.description,
      data.descriptionEs || null,
      data.imageUrl || null,
      data.category,
      data.careCategory || "childcare",
      data.targetMinAge ?? 0,
      data.targetMaxAge ?? 18,
      data.badge || null,
      data.badgeEs || null,
      data.priceEstimate || null,
      data.affiliateUrl,
      data.active !== false,
    ]
  );
  return mapProductRow(res.rows[0]);
}

export async function pgUpdateRecommendedProduct(
  id: string,
  data: Partial<RecommendedProduct>
): Promise<RecommendedProduct | undefined> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT * FROM recommended_products WHERE id = $1 LIMIT 1", [id]);
  if (res.rows.length === 0) return undefined;

  const current = mapProductRow(res.rows[0]);
  const merged = { ...current, ...data };
  await pool.query(
    `UPDATE recommended_products SET
       title = $1, title_es = $2, description = $3, description_es = $4, image_url = $5,
       category = $6, care_category = $7, target_min_age = $8, target_max_age = $9,
       badge_text = $10, badge_text_es = $11, price_estimate = $12,
       affiliate_url = $13, active = $14
     WHERE id = $15`,
    [
      merged.title,
      merged.titleEs || null,
      merged.description,
      merged.descriptionEs || null,
      merged.imageUrl || null,
      merged.category,
      merged.careCategory,
      merged.targetMinAge,
      merged.targetMaxAge,
      merged.badge || null,
      merged.badgeEs || null,
      merged.priceEstimate || null,
      merged.affiliateUrl,
      merged.active,
      id,
    ]
  );
  return merged;
}

export async function pgDeleteRecommendedProduct(id: string): Promise<boolean> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("DELETE FROM recommended_products WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function pgGetPublicRecommendedProducts(
  category?: string,
  careCategory?: CareCategory | "all",
  childAge?: number
): Promise<{ products: RecommendedProduct[]; settings: AffiliateSettings }> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const settings = await pgGetAffiliateSettings();
  const res = await pool.query("SELECT * FROM recommended_products WHERE active = true ORDER BY created_at DESC");
  let products = res.rows.length > 0 ? res.rows.map(mapProductRow) : RECOMMENDED_PRODUCTS;

  if (category && category !== "all") {
    products = products.filter((p) => p.category === category);
  }
  if (careCategory && careCategory !== "all") {
    const matching = products.filter((p) => p.careCategory === careCategory || !p.careCategory);
    if (matching.length > 0) products = matching;
  }

  // Inject current configured Amazon tag into all product affiliate URLs
  const tag = settings.amazonTag || "matchcaring-20";
  const mapped = products.map((p) => {
    let url = p.affiliateUrl;
    if (url.includes("amazon.com") || url.includes("amzn.to")) {
      try {
        const u = new URL(url);
        u.searchParams.set("tag", tag);
        url = u.toString();
      } catch (e) {}
    }
    return { ...p, affiliateUrl: url };
  });

  return { products: mapped, settings };
}

// -------------------------------------------------------------
// QUESTION BANK OPERATIONS
// -------------------------------------------------------------

function mapQuestionRow(row: any): QuestionBankItem {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    groupId: row.group_id || undefined,
    careCategory: row.care_category || "childcare",
    groupNameEs: row.group_name_es || undefined,
    groupNameEn: row.group_name_en || undefined,
    prompt: row.prompt,
    promptEs: row.prompt_es,
    type: row.type,
    options: typeof row.options === "string" ? JSON.parse(row.options) : row.options || undefined,
    optionsEs: typeof row.options_es === "string" ? JSON.parse(row.options_es) : row.options_es || undefined,
    required: row.required !== false,
    isCustomUser: row.is_custom_user || false,
  };
}

export async function pgGetUserQuestionBank(userId: string): Promise<QuestionBankGroup[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("SELECT * FROM user_question_bank WHERE user_id = $1 OR user_id IS NULL", [userId]);
  const userCustomQuestions = res.rows.map(mapQuestionRow);

  const groups: QuestionBankGroup[] = DEFAULT_QUESTION_BANK_GROUPS.map((g) => ({
    ...g,
    questions: [...g.questions],
  }));

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

export async function pgAddQuestionToBank(
  userId: string,
  data: Omit<QuestionBankItem, "id">
): Promise<QuestionBankItem> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const id = `qbank_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const res = await pool.query(
    `INSERT INTO user_question_bank (
       id, user_id, group_id, care_category, group_name_es, group_name_en,
       prompt, prompt_es, type, options, options_es, required, is_custom_user, created_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,NOW())
     RETURNING *`,
    [
      id,
      userId,
      data.groupId || null,
      data.careCategory || "childcare",
      data.groupNameEs || null,
      data.groupNameEn || null,
      data.prompt,
      data.promptEs || data.prompt,
      data.type,
      JSON.stringify(data.options || []),
      JSON.stringify(data.optionsEs || []),
      data.required !== false,
    ]
  );
  return mapQuestionRow(res.rows[0]);
}

export async function pgDeleteQuestionFromBank(userId: string, questionId: string): Promise<boolean> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query("DELETE FROM user_question_bank WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)", [
    questionId,
    userId,
  ]);
  return (res.rowCount ?? 0) > 0;
}

// -------------------------------------------------------------
// PARENT CAMPAIGNS OPERATIONS
// -------------------------------------------------------------

function mapCampaignRow(row: any): ParentCampaign {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    careCategory: row.care_category || "childcare",
    targetChildren: typeof row.target_children === "string" ? JSON.parse(row.target_children) : row.target_children || [],
    scheduleType: row.schedule_type || undefined,
    expectedHourlyRate: row.expected_hourly_rate || undefined,
    startDate: row.start_date || undefined,
    notes: row.notes || undefined,
    active: row.active !== false,
    publicToken: row.public_token || undefined,
    shareCode: row.share_code || undefined,
    sharedWithEmails: typeof row.shared_with_emails === "string" ? JSON.parse(row.shared_with_emails) : row.shared_with_emails || [],
    sharedWithUserIds: typeof row.shared_with_user_ids === "string" ? JSON.parse(row.shared_with_user_ids) : row.shared_with_user_ids || [],
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function pgGetParentCampaigns(userId: string): Promise<ParentCampaign[]> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();

  const userRes = await pool.query("SELECT email FROM users WHERE id = $1 LIMIT 1", [userId]);
  const userEmail = (userRes.rows[0]?.email || "").toLowerCase();

  const res = await pool.query(
    `SELECT * FROM parent_campaigns
     WHERE user_id = $1
        OR shared_with_user_ids @> to_jsonb($1::text)
        OR (CASE WHEN $2 != '' THEN shared_with_emails @> to_jsonb($2::text) ELSE false END)
     ORDER BY created_at DESC`,
    [userId, userEmail]
  );
  let campaigns = res.rows.map(mapCampaignRow);

  if (campaigns.length === 0) {
    const user = await pgGetUserById(userId);
    const children = user?.children || [];
    if (children.length > 0) {
      const defaultCamp = await pgCreateParentCampaign(userId, {
        title: `Campaña Principal para ${children[0].name} (${children[0].age} años)`,
        careCategory: "childcare",
        targetChildren: [children[0]],
        scheduleType: "full_time",
        expectedHourlyRate: "$25 - $30 / hr",
        startDate: "Inmediata",
        notes: `Búsqueda activa de profesional de cuidado para ${children[0].name}.`,
        active: true,
      });
      campaigns = [defaultCamp];
    }
  }
  return campaigns;
}

export async function pgCreateParentCampaign(
  userId: string,
  data: Omit<ParentCampaign, "id" | "userId" | "createdAt" | "publicToken">
): Promise<ParentCampaign> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const id = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const publicToken = `camp_${Math.random().toString(36).substring(2, 8)}`;
  const shareCode = `MC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const res = await pool.query(
    `INSERT INTO parent_campaigns (
       id, user_id, title, care_category, target_children, schedule_type,
       expected_hourly_rate, start_date, notes, active, public_token, share_code,
       shared_with_emails, shared_with_user_ids, created_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
     RETURNING *`,
    [
      id,
      userId,
      data.title,
      data.careCategory || "childcare",
      JSON.stringify(data.targetChildren || []),
      data.scheduleType || "full_time",
      data.expectedHourlyRate || "$25 - $30 / hr",
      data.startDate || "Inmediata",
      data.notes || null,
      data.active !== false,
      publicToken,
      data.shareCode || shareCode,
      JSON.stringify(data.sharedWithEmails || []),
      JSON.stringify(data.sharedWithUserIds || []),
    ]
  );
  return mapCampaignRow(res.rows[0]);
}

export async function pgShareParentCampaign(
  campaignId: string,
  emailToShare: string,
  currentUserId: string
): Promise<{ success: boolean; campaign?: ParentCampaign; message?: string }> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const cleanEmail = emailToShare.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: "Email is required" };
  }

  const res = await pool.query("SELECT * FROM parent_campaigns WHERE id = $1 LIMIT 1", [campaignId]);
  if (res.rows.length === 0) {
    return { success: false, message: "Campaign not found" };
  }

  const campaign = mapCampaignRow(res.rows[0]);
  const isOwner = campaign.userId === currentUserId;
  const isShared = (campaign.sharedWithUserIds || []).includes(currentUserId);
  if (!isOwner && !isShared) {
    return { success: false, message: "Unauthorized to share this campaign" };
  }

  const emails = Array.from(new Set([...(campaign.sharedWithEmails || []), cleanEmail]));

  // Check if a registered user with this email exists
  const userMatch = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", [cleanEmail]);
  let userIds = campaign.sharedWithUserIds || [];
  if (userMatch.rows.length > 0) {
    userIds = Array.from(new Set([...userIds, userMatch.rows[0].id]));
  }

  const updated = await pool.query(
    `UPDATE parent_campaigns SET
       shared_with_emails = $1,
       shared_with_user_ids = $2
     WHERE id = $3
     RETURNING *`,
    [JSON.stringify(emails), JSON.stringify(userIds), campaignId]
  );

  return { success: true, campaign: mapCampaignRow(updated.rows[0]) };
}

export async function pgJoinParentCampaignByCode(
  code: string,
  userId: string,
  userEmail?: string
): Promise<{ success: boolean; campaign?: ParentCampaign; message?: string }> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const cleanCode = code.trim().toUpperCase();

  const res = await pool.query(
    "SELECT * FROM parent_campaigns WHERE UPPER(share_code) = $1 OR id = $2 OR public_token = $2 LIMIT 1",
    [cleanCode, code.trim()]
  );
  if (res.rows.length === 0) {
    return { success: false, message: "Invalid campaign code or campaign not found" };
  }

  const campaign = mapCampaignRow(res.rows[0]);
  const userIds = Array.from(new Set([...(campaign.sharedWithUserIds || []), userId]));
  const emails = userEmail
    ? Array.from(new Set([...(campaign.sharedWithEmails || []), userEmail.trim().toLowerCase()]))
    : campaign.sharedWithEmails || [];

  const updated = await pool.query(
    `UPDATE parent_campaigns SET
       shared_with_user_ids = $1,
       shared_with_emails = $2
     WHERE id = $3
     RETURNING *`,
    [JSON.stringify(userIds), JSON.stringify(emails), campaign.id]
  );

  return { success: true, campaign: mapCampaignRow(updated.rows[0]) };
}

export async function pgDeleteParentCampaign(userId: string, campaignId: string): Promise<boolean> {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  const res = await pool.query(
    "DELETE FROM parent_campaigns WHERE id = $1 AND (user_id = $2 OR shared_with_user_ids @> to_jsonb($2::text))",
    [campaignId, userId]
  );
  return (res.rowCount ?? 0) > 0;
}
