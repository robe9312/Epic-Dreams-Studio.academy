-- ============================================================
-- Epic Dreams Studio Academy V2 - Neon Postgres Schema
-- Compatible con PostgreSQL estándar (Neon, RDS, etc.)
-- ============================================================

-- 1. PERFILES DE USUARIO (opcional, si no tienes autenticación externa)
-- Si ya tienes una tabla de usuarios (por ejemplo, de Supabase Auth), 
-- comenta esta sección y ajusta las referencias a `profiles`.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROYECTOS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ESCENAS
CREATE TABLE IF NOT EXISTS public.scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    script_fountain TEXT, -- Formato Fountain nativo
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TIPOS DE PISTA (ENUM)
CREATE TYPE public.track_type AS ENUM ('narrative', 'visual', 'technical', 'training');

-- 5. CLIPS (TIMELINE TRACKS)
CREATE TABLE IF NOT EXISTS public.clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES public.scenes(id) ON DELETE CASCADE,
    track public.track_type NOT NULL,
    "content" JSONB NOT NULL, -- { text: "...", animation_id: "...", etc }
    start_time FLOAT NOT NULL DEFAULT 0.0,
    end_time FLOAT NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REGISTROS DE AGENTES (CCV CYCLE)
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL, -- Script, DP, Continuity, Director
    payload JSONB NOT NULL,    -- Inputs/Outputs del agente
    feasibility_score FLOAT CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON public.scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_clips_scene_id ON public.clips(scene_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_project_id ON public.agent_logs(project_id);

-- ============================================================
-- NOTAS IMPORTANTES PARA NEON
-- ============================================================
-- 1. Si no utilizas la tabla `profiles`, elimínala y reemplaza la columna
--    `owner_id` de `projects` por un tipo que gestione tus usuarios externamente.
-- 2. Las políticas RLS de Supabase se han eliminado. Si necesitas seguridad,
--    puedes implementarla a nivel de aplicación o con políticas de seguridad
--    de Neon (que son similares a RLS pero se gestionan de otra forma).
-- 3. Para actualizar automáticamente `updated_at`, puedes crear un trigger
--    (opcional) o manejarlo desde la aplicación.
-- ============================================================