/**
 * MatchCaring Bio - Migration Script from JSON to PostgreSQL
 * Run: POSTGRES_URL="your-neon-postgres-url" node scripts/migrate-to-postgres.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: Debes proporcionar la variable de entorno POSTGRES_URL o DATABASE_URL.");
  console.log("Ejemplo: POSTGRES_URL=\"postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require\" node scripts/migrate-to-postgres.js");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const dbPath = path.join(__dirname, '../data/db.json');
  if (!fs.existsSync(dbPath)) {
    console.error('db.json no encontrado en data/db.json');
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando migración a PostgreSQL...');
    await client.query('BEGIN');

    // 1. Migrar Usuarios
    console.log(`👤 Migrando ${rawData.users?.length || 0} usuarios...`);
    for (const u of rawData.users || []) {
      await client.query(
        `INSERT INTO users (id, email, name, password_hash, role, children, child_profile, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           role = EXCLUDED.role,
           children = EXCLUDED.children,
           child_profile = EXCLUDED.child_profile;`,
        [
          u.id,
          u.email,
          u.name,
          u.passwordHash,
          u.role || 'parent',
          JSON.stringify(u.children || []),
          JSON.stringify(u.childProfile || null),
          u.createdAt || new Date().toISOString()
        ]
      );
    }

    // 2. Migrar Candidatas
    console.log(`📋 Migrando ${rawData.candidates?.length || 0} candidatas/evaluaciones...`);
    for (const c of rawData.candidates || []) {
      await client.query(
        `INSERT INTO candidates (
           id, user_id, token, name, role_target, phone, email, status,
           target_children, parent_custom_questions, parent_custom_responses,
           profile, responses, result, parent_notes, in_talent_pool, talent_pool_status,
           created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (id) DO NOTHING;`,
        [
          c.id,
          c.userId,
          c.token,
          c.name,
          c.roleTarget,
          c.phone || null,
          c.email || null,
          c.status || 'invited',
          JSON.stringify(c.targetChildren || null),
          JSON.stringify(c.parentCustomQuestions || null),
          JSON.stringify(c.parentCustomResponses || null),
          JSON.stringify(c.profile || null),
          JSON.stringify(c.responses || null),
          JSON.stringify(c.result || null),
          c.parentNotes || null,
          c.inTalentPool || false,
          c.talentPoolStatus || 'review',
          c.createdAt || new Date().toISOString(),
          c.updatedAt || new Date().toISOString()
        ]
      );
    }

    // 3. Migrar Campañas Publicitarias
    console.log(`📢 Migrando ${rawData.adCampaigns?.length || 0} anuncios publicitarios...`);
    for (const ad of rawData.adCampaigns || []) {
      await client.query(
        `INSERT INTO ad_campaigns (
           id, sponsor_name, title, title_es, headline, headline_es, description, description_es,
           image_url, category, placement, target_min_age, target_max_age, badge_text, badge_text_es,
           cta_text, cta_text_es, cta_url, bg_color, active, impressions, clicks, created_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
         ON CONFLICT (id) DO NOTHING;`,
        [
          ad.id,
          ad.sponsorName,
          ad.title,
          ad.titleEs || ad.title,
          ad.headline,
          ad.headlineEs || ad.headline,
          ad.description,
          ad.descriptionEs || ad.description,
          ad.imageUrl || null,
          ad.category || 'gear',
          ad.placement || 'dashboard_banner',
          ad.targetMinAge ?? 0,
          ad.targetMaxAge ?? 6,
          ad.badgeText || null,
          ad.badgeTextEs || null,
          ad.ctaText,
          ad.ctaTextEs || null,
          ad.ctaUrl,
          ad.bgColor || null,
          ad.active !== false,
          ad.impressions || 0,
          ad.clicks || 0,
          ad.createdAt || new Date().toISOString()
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Migración a PostgreSQL finalizada con éxito.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error fatal durante la migración:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
