# Guía Definitiva de Migración a Vercel con PostgreSQL (Neon)
## MatchCaring Bio — Plataforma de Diagnóstico Psicológico y Selección de Cuidados

---

## 1. ¿Por qué es necesaria la migración en Vercel?

Actualmente en tu Mac, el proyecto corre en desarrollo utilizando archivos JSON locales (`data/db.json`). En un entorno local esto funciona porque el disco duro es permanente.

Sin embargo, en **Vercel**:
> [!WARNING]
> **El sistema de archivos de Vercel es efímero y de solo lectura:**
> Las Serverless Functions de Vercel se apagan y se encienden bajo demanda. Cualquier archivo local escrito en el servidor se borra cuando la función finaliza, y dos usuarios simultáneos caerían en servidores independientes sin compartir información.

Para que **MatchCaring Bio** guarde de forma permanente todos los usuarios, candidatas evaluadas, informes psicológicos, anuncios publicitarios y campañas familiares en producción, se requiere una base de datos relacional serverless con **Neon PostgreSQL**.

---

## 1.1. Arquitectura de Conexión en Código: Motor Dual Inteligente

El proyecto cuenta con una integración nativa en tiempo real implementada en:
- [`src/lib/postgres.ts`](file:///Users/franciscocornejo/Desktop/Projects/personelBio/src/lib/postgres.ts): Driver de conexión directa con PostgreSQL mediante `pg` (node-postgres), con pool de conexiones (`Pool`) optimizado para Serverless y SSL `{ rejectUnauthorized: false }`.
- [`src/lib/db.ts`](file:///Users/franciscocornejo/Desktop/Projects/personelBio/src/lib/db.ts): Capa de acceso a datos unificada que detecta automáticamente el entorno.

### ¿Cómo se conecta el proyecto a PostgreSQL en vez de SQLite/JSON?

```mermaid
graph TD
    API["Cualquier Endpoint de API (/api/auth, /api/candidates, etc.)"] --> DB["src/lib/db.ts"]
    DB --> Check{"¿Existe POSTGRES_URL o DATABASE_URL?"}
    Check -- "SÍ (Producción Vercel o .env.local)" --> PG["src/lib/postgres.ts -> Neon PostgreSQL (SSL)"]
    Check -- "NO (Desarrollo local sin DB)" --> Local["data/db.json (Fallback local)"]
    PG --> Query["Lectura / Escritura en Neon Cloud"]
```

### Características Clave de la Conexión:

1. **Detección Automática de Entorno (`isPostgresActive`):**
   Tan pronto como configuras la variable `POSTGRES_URL` (en Vercel o en tu `.env.local`), **todas las 39 operaciones de la plataforma** se desvían de inmediato a PostgreSQL:
   - Registro e inicio de sesión de usuarios (`/api/auth/*`)
   - Creación y evaluación psicológica de candidatas (`/api/candidates/*`, `/api/test/*`)
   - Campañas familiares de cuidado infantil, adulto mayor y discapacidad (`/api/campaigns/*`)
   - Anuncios publicitarios, tracking de impresiones y clics (`/api/ads/*`, `/api/admin/ads`)
   - Configuración de afiliados de Amazon y productos recomendados (`/api/affiliates`, `/api/admin/affiliates`)
   - Banco de preguntas personalizadas (`/api/question-bank`)
   - Pool de talentos y candidatas recomendadas (`/api/nanny-pool`, `/api/admin/nannies`)

2. **Esquema Autocurativo (Self-Healing DDL):**
   Al arrancar o recibir la primera petición, `ensurePostgresSchema()` verifica si las 7 tablas e índices existen en Neon. Si no existen, **las crea automáticamente** en milisegundos sin requerir scripts manuales.

3. **Pool de Conexiones Serverless:**
   Utiliza un singleton `Pool` configurado específicamente para entornos Serverless de Vercel:
   ```typescript
   globalPool = new Pool({
     connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false },
     max: 10,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 10000,
   });
   ```

4. **100% Cero Fricción en API Routes:**
   Ningún endpoint de `src/app/api/...` tuvo que modificarse, ya que todas las funciones exportadas de `db.ts` (`getUserByEmail`, `createCandidate`, `saveCandidateSubmission`, etc.) son asíncronas (`async/await`) y entregan exactamente las mismas estructuras de datos tipadas (`TypeScript`).

---

## 2. Flujo Completo de Despliegue y Migración Paso a Paso

```mermaid
graph TD
    A["1. Crear DB en Neon Tech (Serverless Postgres)"] --> B["2. Subir Código a Repositorio GitHub"]
    B --> C["3. Importar Proyecto en Vercel y Configurar Variables"]
    C --> D["4. Correr Comando Automático de Migración (npm run db:migrate)"]
    D --> E["5. Proyecto en Producción 100% Operativo en Vercel"]
    E -.-> F["Opcional: Encerar DB para Empezar de 0 (npm run db:reset)"]
```

---

### PASO 1: Crear la Base de Datos en Neon PostgreSQL (Gratuito)

1. Ingresa a [https://neon.tech](https://neon.tech) y crea una cuenta gratuita (puedes ingresar con tu cuenta de GitHub o Google).
2. Haz clic en **"Create Project"**:
   - **Project Name:** `matchcaring-db`
   - **Database Name:** `neondb` (por defecto)
   - **Region:** Selecciona la más cercana a tus usuarios (ej: `US East (Ohio)` o `US East (N. Virginia)`).
3. Una vez creado el proyecto, Neon te mostrará en pantalla la **Connection String**.
4. Asegúrate de copiar la URL con formato **Postgres connection string** con `sslmode=require`. Se verá así:
   ```text
   postgres://usuario:contraseña@ep-dry-branch-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

### PASO 2: Subir el Repositorio a GitHub

Desde la terminal en la raíz de tu proyecto local:

```bash
# 1. Verificar estado de git
git status

# 2. Agregar todos los cambios
git add .

# 3. Crear commit
git commit -m "feat: MatchCaring bio with multi-care campaigns, ads, question bank, and postgres migration"

# 4. Vincular con tu repositorio de GitHub (si no lo has vinculado antes)
git remote add origin https://github.com/tu-usuario/matchcaring-bio.git
git branch -M main
git push -u origin main
```

---

### PASO 3: Importar el Proyecto en Vercel y Configurar Variables

1. Ve a [https://vercel.com](https://vercel.com) e inicia sesión.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Selecciona tu repositorio de GitHub `matchcaring-bio` y haz clic en **"Import"**.
4. En la sección **Environment Variables**, agrega las siguientes variables obligatorias:

| Variable | Valor | Propósito |
|---|---|---|
| `POSTGRES_URL` | `postgres://usuario:pass@ep-xyz.neon.tech/neondb?sslmode=require` | Conexión directa a tu base de datos Neon. |
| `DATABASE_URL` | *(Mismo valor que `POSTGRES_URL`)* | Compatibilidad con librerías estándar. |
| `JWT_SECRET` | `matchcaring_super_secret_jwt_key_2026_production` | Clave secreta para firmar tokens de sesión. |
| `NEXT_PUBLIC_APP_URL` | `https://tu-proyecto.vercel.app` | URL pública de tu aplicación. |
| `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` | `matchcaring-20` | Tag oficial de monetización de afiliados Amazon. |

5. Haz clic en **"Deploy"**. Vercel compilará la aplicación y te entregará tu dominio `https://tu-proyecto.vercel.app`.

---

### PASO 4: Ejecutar el Comando de Migración Automática de Datos

Hemos creado un comando CLI automatizado que **crea automáticamente todas las tablas, índices e importa todos los registros** desde tu entorno local hacia Neon Postgres:

#### Opción A: Pasando la URL como variable de entorno
```bash
POSTGRES_URL="postgres://usuario:pass@ep-xyz.neon.tech/neondb?sslmode=require" npm run db:migrate
```

#### Opción B: Pasando la URL como argumento
```bash
npm run db:migrate -- --url="postgres://usuario:pass@ep-xyz.neon.tech/neondb?sslmode=require"
```

#### Opción C: Usando archivo `.env.local`
Si creas o tienes un archivo `.env.local` con `POSTGRES_URL=...`, solo ejecuta:
```bash
npm run db:migrate
```

**¿Qué hace automáticamente este comando?**
- Conecta a Neon vía SSL.
- Ejecuta el DDL creando las 7 tablas del sistema con índices optimizados:
  1. `users` (con Super Admin y roles)
  2. `candidates` (con pruebas psicológicas completas)
  3. `parent_campaigns` (para Infantil, Adulto Mayor y Discapacidad)
  4. `ad_campaigns` (anuncios monetizables con imágenes y clics)
  5. `affiliate_settings` (configuraciones globales de Amazon)
  6. `recommended_products` (catálogo de productos recomendados)
  7. `user_question_bank` (banco de preguntas personalizadas)
- Inserta / actualiza (UPSERT) los registros existentes.
- Muestra un reporte en consola confirmando que todo está listo.

---

### PASO 5: Comando para Encerar la Base de Datos (Empezar de Cero)

Cuando quieras reiniciar la plataforma limpia para empezar desde cero (por ejemplo, antes de invitar a tus primeros usuarios reales o después de hacer pruebas):

```bash
npm run db:reset
```

O si deseas encerar también tu base de datos de Neon en la nube:
```bash
POSTGRES_URL="postgres://usuario:pass@ep-xyz.neon.tech/neondb?sslmode=require" npm run db:reset
```

> [!IMPORTANT]
> **GARANTÍA DE SEGURIDAD DEL USUARIO ADMIN:**
> Al correr `npm run db:reset`, el sistema **SIEMPRE preserva al Super Administrador** con su contraseña actual:
> - **Email:** `francisco.deskmultimedia@gmail.com`
> - **Contraseña:** `Phoebe2016.`
> - **Rol:** `admin` (Acceso permanente al panel `/admin` y creación de anuncios).
>
> **Lo que se encera:**
> - Candidatas y evaluaciones psicológicas: se restablecen a **0 candidatas**.
> - Campañas familiares personalizadas: se reinician a 1 campaña limpia de ejemplo.
> - Métricas de anuncios publicitarios: se reinician a **0 impresiones y 0 clics**.
> - Preguntas temporales creadas: se reinician a las preguntas base.

---

## 3. Resumen de Comandos Rápidos

| Comando | Acción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo local en `http://localhost:3000`. |
| `npm run build` | Compila la aplicación para producción (validación de TypeScript). |
| `npm run db:migrate` | Migra e importa automáticamente el esquema y datos a PostgreSQL (Neon). |
| `npm run db:reset` | Encera la base de datos a estado cero (0 candidatas) preservando al Admin. |

---

## 4. Credenciales de Acceso

| Rol | Correo Electrónico | Contraseña | Rutas de Acceso |
|---|---|---|---|
| **Super Admin** | `francisco.deskmultimedia@gmail.com` | `Phoebe2016.` | `/admin` (Monetización, Anuncios, Afiliados, Estadísticas) y `/dashboard` |
| **Familias / Nuevos Usuarios** | *(Registran su propia cuenta)* | *(Definida por el usuario)* | `/dashboard` (Selección de Cuidados y Candidatas) |

---

## 5. Esquema SQL DDL de Referencia Técnica

Si deseas consultar o inspeccionar la estructura en la consola SQL de Neon (`SQL Editor`), este es el esquema relacional que crea automáticamente el comando:

```sql
-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios y Familias
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'parent', -- 'parent' | 'admin'
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
    status VARCHAR(32) DEFAULT 'invited', -- 'invited' | 'in_progress' | 'completed'
    target_children JSONB,
    parent_custom_questions JSONB,
    parent_custom_responses JSONB,
    profile JSONB,
    responses JSONB,
    result JSONB,
    parent_notes TEXT,
    in_talent_pool BOOLEAN DEFAULT false,
    talent_pool_status VARCHAR(32) DEFAULT 'review', -- 'review' | 'available' | 'placed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_candidates_user ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_token ON candidates(token);
CREATE INDEX IF NOT EXISTS idx_candidates_talent_pool ON candidates(in_talent_pool, talent_pool_status);

-- 3. Tabla de Campañas de Reclutamiento Familiar (Infantil, Adulto Mayor, Discapacidad)
CREATE TABLE IF NOT EXISTS parent_campaigns (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    care_category VARCHAR(64) DEFAULT 'childcare', -- 'childcare' | 'elderly_care' | 'disability_care'
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

-- 4. Tabla de Anuncios y Monetización
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
    bg_color VARCHAR(128),
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
```
