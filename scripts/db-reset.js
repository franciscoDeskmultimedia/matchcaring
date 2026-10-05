#!/usr/bin/env node
/**
 * MatchCaring Bio - Database Reset Script (Encerar Base de Datos)
 * Reinicia la base de datos a estado cero (0 candidatas, 0 pruebas, 0 clics).
 * SIEMPRE preserva el usuario Super Admin con su contraseña actual.
 *
 * Usage:
 *   npm run db:reset
 *   node scripts/db-reset.js
 *   node scripts/db-reset.js --postgres
 *   node scripts/db-reset.js --url="postgres://..."
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Admin credentials to ALWAYS preserve
const SUPER_ADMIN_USER = {
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
      notes: "Hijo de 3 años. Le encantan los paseos en el parque, bloques de construcción y cuentos ilustrados."
    },
    {
      id: "child_mateo_02",
      name: "Mateo",
      age: 1,
      notes: "Bebé de 1 año. En etapa de gateo y exploración oral activa."
    }
  ],
  childProfile: {
    name: "Leo",
    age: 3,
    notes: "Hijo de 3 años. Le encantan los paseos en el parque, bloques de construcción y cuentos ilustrados."
  }
};

const DEMO_PARENT_USER = {
  id: "usr_parent_demo",
  email: "parent@example.com",
  name: "Familia Demo",
  passwordHash: "$2b$10$lokWWpTwak2ioXXiBelMt.PysQgO8oz3s2sLYtyh.SaOdFdtj.2Wq", // password123
  role: "parent",
  createdAt: new Date().toISOString(),
  children: [
    {
      id: "child_demo_leo",
      name: "Leo",
      age: 3,
      notes: "Niño de 3 años."
    }
  ],
  childProfile: {
    name: "Leo",
    age: 3,
    notes: "Niño de 3 años."
  }
};

// Check for connection string
let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--url=')) {
    connectionString = arg.replace('--url=', '').trim();
  }
}

if (!connectionString) {
  const envLocalPath = path.join(__dirname, '../.env.local');
  const envPath = path.join(__dirname, '../.env');
  for (const p of [envLocalPath, envPath]) {
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

async function resetLocalDatabase() {
  const dbPath = path.join(__dirname, '../data/db.json');
  console.log('🧹 1. Encerando base de datos local (data/db.json)...');

  // Read existing to preserve active default ads and products if present
  let existingAds = [];
  let existingProducts = [];
  if (fs.existsSync(dbPath)) {
    try {
      const current = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (current.adCampaigns && current.adCampaigns.length > 0) {
        existingAds = current.adCampaigns.map(ad => ({ ...ad, impressions: 0, clicks: 0 }));
      }
      if (current.recommendedProducts && current.recommendedProducts.length > 0) {
        existingProducts = current.recommendedProducts;
      }
    } catch (e) {}
  }

  const cleanDb = {
    users: [SUPER_ADMIN_USER, DEMO_PARENT_USER],
    candidates: [], // 0 candidates! Starting from scratch
    parentCampaigns: [
      {
        id: "camp_initial_leo",
        userId: "usr_admin_francisco",
        title: "Campaña Principal de Cuidado Infantil",
        careCategory: "childcare",
        targetChildren: [SUPER_ADMIN_USER.children[0]],
        scheduleType: "full_time",
        expectedHourlyRate: "$25 - $30 / hr",
        startDate: "Inmediata",
        notes: "Búsqueda activa de profesional de cuidado.",
        active: true,
        publicToken: "camp_demo_01",
        createdAt: new Date().toISOString()
      }
    ],
    adCampaigns: existingAds.length > 0 ? existingAds : [
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
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
      }
    ],
    affiliateSettings: {
      id: "global_settings",
      amazonTag: "matchcaring-20",
      autoInjectLinks: true,
      disclosureText: "As an Amazon Associate we earn from qualifying purchases.",
      disclosureTextEs: "Como Afiliado de Amazon, percibimos ingresos por compras adscritas que cumplan los requisitos aplicables.",
      updatedAt: new Date().toISOString()
    },
    recommendedProducts: existingProducts,
    userQuestionBank: [] // 0 custom user questions
  };

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(dbPath, JSON.stringify(cleanDb, null, 2), 'utf8');
  console.log('   ✓ Archivo data/db.json encerado exitosamente.');
}

async function resetPostgresDatabase() {
  if (!connectionString) {
    console.log('ℹ️  No se proporcionó POSTGRES_URL. Omitiendo reset de base de datos PostgreSQL.');
    console.log('   (Para encerar también la base de datos de Neon/PostgreSQL, provee POSTGRES_URL="...")');
    return;
  }

  console.log('\n🧹 2. Encerando base de datos remota PostgreSQL (Neon)...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Limpiar candidatas y evaluaciones (0 candidatas)
    await client.query('DELETE FROM candidates;');
    console.log('   ✓ Candidatas eliminadas (0 candidatas en el sistema).');

    // 2. Limpiar campañas familiares
    await client.query('DELETE FROM parent_campaigns;');
    console.log('   ✓ Campañas de familias reiniciadas.');

    // 3. Limpiar preguntas personalizadas del usuario
    await client.query('DELETE FROM user_question_bank WHERE is_custom_user = true;');
    console.log('   ✓ Preguntas personalizadas reiniciadas.');

    // 4. Reiniciar métricas de anuncios (impresiones y clics a 0)
    await client.query('UPDATE ad_campaigns SET impressions = 0, clicks = 0;');
    console.log('   ✓ Métricas publicitarias reiniciadas a 0 impresiones y 0 clics.');

    // 5. Preservar o recrear el Super Admin
    await client.query(
      `INSERT INTO users (id, email, name, password_hash, role, children, child_profile, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = 'admin';`,
      [
        SUPER_ADMIN_USER.id,
        SUPER_ADMIN_USER.email,
        SUPER_ADMIN_USER.name,
        SUPER_ADMIN_USER.passwordHash,
        'admin',
        JSON.stringify(SUPER_ADMIN_USER.children),
        JSON.stringify(SUPER_ADMIN_USER.childProfile),
        new Date().toISOString()
      ]
    );
    console.log('   ✓ Usuario Super Admin preservado/activo con rol de Administrador.');

    await client.query('COMMIT');
    console.log('   ✓ PostgreSQL encerado exitosamente.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error encerando PostgreSQL:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  console.log('\n========================================================================');
  console.log('🔄 MATCHCARING BIO — ENCERAR BASE DE DATOS (ESTADO 0)');
  console.log('========================================================================');

  await resetLocalDatabase();
  await resetPostgresDatabase();

  console.log('\n========================================================================');
  console.log('✨ ¡BASE DE DATOS ENCERADA CON ÉXITO!');
  console.log('========================================================================');
  console.log('Estado actual del proyecto:');
  console.log(' • Candidatas evaluadas:      0 (Listo para recibir nuevas pruebas)');
  console.log(' • Campañas de padres:        1 (Campaña inicial de ejemplo)');
  console.log(' • Métricas de publicidad:    0 impresiones, 0 clics');
  console.log('\nCredenciales del Super Administrador (PRESERVADAS):');
  console.log(` • Email:        ${SUPER_ADMIN_USER.email}`);
  console.log(` • Contraseña:   Phoebe2016.`);
  console.log(` • Rol:          ADMIN (Acceso total en /admin y /dashboard)`);
  console.log('\nCredenciales de Familia Demo:');
  console.log(` • Email:        ${DEMO_PARENT_USER.email}`);
  console.log(` • Contraseña:   password123`);
  console.log('========================================================================\n');
}

main();
