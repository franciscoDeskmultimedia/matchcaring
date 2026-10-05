#!/usr/bin/env node
/**
 * MatchCaring Bio - Database Migration Script
 * Migrates local SQLite/JSON data (data/db.json) to PostgreSQL (Neon, Vercel Postgres, Supabase).
 *
 * Usage:
 *   npm run db:migrate
 *   node scripts/db-migrate.js
 *   POSTGRES_URL="postgres://..." npm run db:migrate
 *   node scripts/db-migrate.js --url="postgres://..."
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// 1. Detect connection string from args, env, or .env.local
let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--url=')) {
    connectionString = arg.replace('--url=', '').trim();
  }
}

if (!connectionString) {
  const envLocalPath = path.join(__dirname, '../.env.local');
  const envPath = path.join(__dirname, '../.env');
  const checkPaths = [envLocalPath, envPath];

  for (const p of checkPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('POSTGRES_URL=') || trimmed.startsWith('DATABASE_URL=')) {
          connectionString = trimmed.split('=')[1].replace(/^["']|["']$/g, '').trim();
          if (connectionString) break;
        }
      }
    }
    if (connectionString) break;
  }
}

if (!connectionString) {
  console.log(`
========================================================================
⚠️  MatchCaring Bio - Migración a PostgreSQL
========================================================================
No se encontró la cadena de conexión a PostgreSQL.

Para migrar a Neon / Vercel Postgres, ejecuta:
  POSTGRES_URL="postgres://usuario:pass@ep-xyz.neon.tech/neondb?sslmode=require" npm run db:migrate

O pásala como argumento:
  npm run db:migrate -- --url="postgres://usuario:pass@ep-xyz.neon.tech/neondb?sslmode=require"

Para crear una base de datos gratis en Neon:
  1. Ve a https://neon.tech y crea un proyecto gratuito.
  2. Copia la Connection String (asegúrate de que incluya ?sslmode=require).
  3. Ejecuta el comando anterior.
========================================================================
`);
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const DDL_STATEMENTS = `
-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios y Familias
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

-- 2. Tabla de Candidatas / Niñeras / Evaluaciones Psicológicas
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
CREATE INDEX IF NOT EXISTS idx_candidates_talent_pool ON candidates(in_talent_pool, talent_pool_status);

-- 3. Tabla de Campañas de Reclutamiento por Padres
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_parent_campaigns_user ON parent_campaigns(user_id);

-- 4. Tabla de Publicidad y Monetización
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
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_age ON ad_campaigns(target_min_age, target_max_age, active);

-- 5. Tabla de Configuración de Afiliados Amazon
CREATE TABLE IF NOT EXISTS affiliate_settings (
    id VARCHAR(64) PRIMARY KEY,
    amazon_tag VARCHAR(64) NOT NULL DEFAULT 'matchcaring-20',
    auto_inject_links BOOLEAN DEFAULT true,
    disclosure_text TEXT,
    disclosure_text_es TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Productos Recomendados de Afiliados
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

-- 7. Tabla del Banco de Preguntas Personalizadas de Usuarios
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
`;

async function runMigration() {
  const client = await pool.connect();
  console.log('\n========================================================================');
  console.log('🚀 MATCHCARING BIO — MIGRACIÓN A POSTGRESQL (NEON / VERCEL)');
  console.log('========================================================================');

  try {
    // 1. Probar conexión y crear tablas DDL
    console.log('📦 1/8. Verificando esquema y creando tablas si no existen...');
    await client.query(DDL_STATEMENTS);
    console.log('   ✓ Tablas e índices verificados correctamente.');

    // 2. Cargar datos locales
    const dbPath = path.join(__dirname, '../data/db.json');
    if (!fs.existsSync(dbPath)) {
      console.log('⚠️  No se encontró data/db.json. Se crearán tablas limpias.');
      return;
    }

    const rawData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    await client.query('BEGIN');

    // 3. Migrar Usuarios (Siempre asegurando el Admin)
    const users = rawData.users || [];
    // Asegurar que el Super Admin esté presente
    const adminExists = users.some(u => u.email === 'francisco.deskmultimedia@gmail.com');
    if (!adminExists) {
      users.push({
        id: 'usr_admin_francisco',
        email: 'francisco.deskmultimedia@gmail.com',
        name: 'Francisco Cornejo',
        passwordHash: '$2b$10$fDyFDE6hnr.kBcVhTNgIqeGGhPth7uDIrE7g5oxLkgsZizLjauJTO',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
    }

    console.log(`👤 2/8. Migrando ${users.length} usuarios (incluye Super Admin)...`);
    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, email, name, password_hash, role, children, child_profile, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           role = EXCLUDED.role,
           name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash,
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
    console.log('   ✓ Usuarios migrados.');

    // 4. Migrar Candidatas
    const candidates = rawData.candidates || [];
    console.log(`📋 3/8. Migrando ${candidates.length} candidatas/evaluaciones...`);
    for (const c of candidates) {
      await client.query(
        `INSERT INTO candidates (
           id, user_id, token, name, role_target, phone, email, status,
           target_children, parent_custom_questions, parent_custom_responses,
           profile, responses, result, parent_notes, in_talent_pool, talent_pool_status,
           created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           profile = EXCLUDED.profile,
           responses = EXCLUDED.responses,
           result = EXCLUDED.result,
           in_talent_pool = EXCLUDED.in_talent_pool,
           talent_pool_status = EXCLUDED.talent_pool_status,
           parent_notes = EXCLUDED.parent_notes;`,
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
    console.log('   ✓ Candidatas migradas.');

    // 5. Migrar Campañas de Padres
    const parentCampaigns = rawData.parentCampaigns || [];
    console.log(`🎯 4/8. Migrando ${parentCampaigns.length} campañas de selección familiar...`);
    for (const pc of parentCampaigns) {
      await client.query(
        `INSERT INTO parent_campaigns (
           id, user_id, title, care_category, target_children, schedule_type,
           expected_hourly_rate, start_date, notes, active, public_token, created_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           care_category = EXCLUDED.care_category,
           active = EXCLUDED.active;`,
        [
          pc.id,
          pc.userId,
          pc.title,
          pc.careCategory || 'childcare',
          JSON.stringify(pc.targetChildren || []),
          pc.scheduleType || 'full_time',
          pc.expectedHourlyRate || '$25 - $30 / hr',
          pc.startDate || 'Inmediata',
          pc.notes || null,
          pc.active !== false,
          pc.publicToken || pc.id,
          pc.createdAt || new Date().toISOString()
        ]
      );
    }
    console.log('   ✓ Campañas familiares migradas.');

    // 6. Migrar Anuncios Publicitarios
    const adCampaigns = rawData.adCampaigns || [];
    console.log(`📢 5/8. Migrando ${adCampaigns.length} anuncios publicitarios...`);
    for (const ad of adCampaigns) {
      await client.query(
        `INSERT INTO ad_campaigns (
           id, sponsor_name, title, title_es, headline, headline_es, description, description_es,
           image_url, category, placement, target_min_age, target_max_age, badge_text, badge_text_es,
           cta_text, cta_text_es, cta_url, bg_color, active, impressions, clicks, created_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
         ON CONFLICT (id) DO UPDATE SET
           sponsor_name = EXCLUDED.sponsor_name,
           title = EXCLUDED.title,
           title_es = EXCLUDED.title_es,
           image_url = EXCLUDED.image_url,
           active = EXCLUDED.active,
           impressions = EXCLUDED.impressions,
           clicks = EXCLUDED.clicks;`,
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
          ad.targetMaxAge ?? 120,
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
    console.log('   ✓ Anuncios publicitarios migrados.');

    // 7. Migrar Configuración de Afiliados
    const affiliateSettings = rawData.affiliateSettings || { amazonTag: 'matchcaring-20', autoInjectLinks: true };
    console.log('🛍️  6/8. Migrando configuración de afiliados Amazon...');
    await client.query(
      `INSERT INTO affiliate_settings (id, amazon_tag, auto_inject_links, disclosure_text, disclosure_text_es, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         amazon_tag = EXCLUDED.amazon_tag,
         auto_inject_links = EXCLUDED.auto_inject_links;`,
      [
        'global_settings',
        affiliateSettings.amazonTag || 'matchcaring-20',
        affiliateSettings.autoInjectLinks !== false,
        affiliateSettings.disclosureText || null,
        affiliateSettings.disclosureTextEs || null,
        new Date().toISOString()
      ]
    );
    console.log('   ✓ Configuración de afiliados migrada.');

    // 8. Migrar Productos Recomendados
    const recommendedProducts = rawData.recommendedProducts || [];
    console.log(`📦 7/8. Migrando ${recommendedProducts.length} productos recomendados...`);
    for (const p of recommendedProducts) {
      await client.query(
        `INSERT INTO recommended_products (
           id, title, title_es, description, description_es, image_url, category, care_category,
           target_min_age, target_max_age, badge_text, badge_text_es, asin, price_estimate,
           affiliate_url, active, created_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           title_es = EXCLUDED.title_es,
           image_url = EXCLUDED.image_url,
           affiliate_url = EXCLUDED.affiliate_url,
           active = EXCLUDED.active;`,
        [
          p.id,
          p.title,
          p.titleEs || p.title,
          p.description,
          p.descriptionEs || p.description,
          p.imageUrl || null,
          p.category || 'toys',
          p.careCategory || 'childcare',
          p.targetMinAge ?? 0,
          p.targetMaxAge ?? 18,
          p.badgeText || null,
          p.badgeTextEs || null,
          p.asin || null,
          p.priceEstimate || null,
          p.affiliateUrl,
          p.active !== false,
          p.createdAt || new Date().toISOString()
        ]
      );
    }
    console.log('   ✓ Productos recomendados migrados.');

    // 9. Migrar Preguntas Guardadas del Banco
    const userQuestions = rawData.userQuestionBank || [];
    console.log(`📚 8/8. Migrando ${userQuestions.length} preguntas personalizadas del banco...`);
    for (const q of userQuestions) {
      await client.query(
        `INSERT INTO user_question_bank (
           id, user_id, group_id, care_category, group_name_es, group_name_en,
           prompt, prompt_es, type, options, options_es, required, category, is_custom_user, created_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id) DO NOTHING;`,
        [
          q.id,
          q.userId || null,
          q.groupId || null,
          q.careCategory || 'childcare',
          q.groupNameEs || null,
          q.groupNameEn || null,
          q.prompt,
          q.promptEs || q.prompt,
          q.type || 'multiple_choice',
          JSON.stringify(q.options || []),
          JSON.stringify(q.optionsEs || []),
          q.required !== false,
          q.category || null,
          q.isCustomUser || false,
          q.createdAt || new Date().toISOString()
        ]
      );
    }
    console.log('   ✓ Preguntas del banco migradas.');

    await client.query('COMMIT');
    console.log('\n========================================================================');
    console.log('✅ ¡MIGRACIÓN COMPLETADA CON ÉXITO!');
    console.log('========================================================================');
    console.log('Detalles de la migración:');
    console.log(` • Usuarios:               ${users.length} (Super Admin: francisco.deskmultimedia@gmail.com)`);
    console.log(` • Candidatas/Tests:       ${candidates.length}`);
    console.log(` • Campañas Familiares:    ${parentCampaigns.length}`);
    console.log(` • Anuncios Publicitarios: ${adCampaigns.length}`);
    console.log(` • Productos Afiliados:    ${recommendedProducts.length}`);
    console.log(` • Preguntas en Banco:     ${userQuestions.length}`);
    console.log('\nTu base de datos PostgreSQL en Neon está 100% lista para Vercel.');
    console.log('========================================================================\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ ERROR DURANTE LA MIGRACIÓN:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
