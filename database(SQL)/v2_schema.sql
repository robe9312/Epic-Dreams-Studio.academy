-- Epic Dreams Studio Academy V2 - Supabase Schema
-- Target: Creative Workbench MVP

-- 1. PROYECTOS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ESCENAS
CREATE TABLE IF NOT EXISTS public.scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    script_fountain TEXT, -- Formato Fuente nativo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLIPS (TIMELINE TRACKS)
-- Tracks: NARRATIVE, VISUAL, TECHNICAL, TRAINING
CREATE TYPE track_type AS ENUM ('narrative', 'visual', 'technical', 'training');

CREATE TABLE IF NOT EXISTS public.clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID REFERENCES public.scenes(id) ON DELETE CASCADE,
    track track_type NOT NULL,
    "content" JSONB NOT NULL, -- { text: "...", animation_id: "...", etc }
    start_time FLOAT NOT NULL DEFAULT 0.0,
    end_time FLOAT NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AGENT LOGS (CCV CYCLE)
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL, -- Script, DP, Continuity, Director
    payload JSONB NOT NULL,    -- Inputs/Outputs del agente
    feasibility_score FLOAT CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- Poliza simple: El dueño puede hacer todo
CREATE POLICY "Users can manage their own projects" ON public.projects
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage scenes from their projects" ON public.scenes
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.projects WHERE projects.id = scenes.project_id AND projects.owner_id = auth.uid()
    ));

CREATE POLICY "Users can manage clips from their projects" ON public.clips
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.scenes 
        JOIN public.projects ON projects.id = scenes.project_id 
        WHERE scenes.id = clips.scene_id AND projects.owner_id = auth.uid()
    ));
