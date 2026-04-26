-- ============================================================
-- Epic Dreams Studio Academy V3 - Academy Extensions
-- ============================================================

-- 1. CURSOS
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail TEXT,
    instructor_name TEXT,
    instructor_avatar TEXT,
    instructor_bio TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration FLOAT,
    is_free BOOLEAN DEFAULT TRUE,
    price FLOAT,
    learning_objectives TEXT[],
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MÓDULOS
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LECCIONES
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    type TEXT CHECK (type IN ('video', 'text', 'quiz', 'project', 'interactive')),
    duration INTEGER,
    "order" INTEGER NOT NULL,
    quiz_questions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INSCRIPCIONES Y PROGRESO
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    completed_lessons TEXT[] DEFAULT '{}',
    current_lesson_id UUID,
    quiz_scores JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

-- 5. SESIONES DE MENTORÍA (OpenFang Integration)
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- director, writer, dp, editor
    messages JSONB NOT NULL DEFAULT '[]', -- [{id, sender, content, timestamp}]
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_user_id ON public.mentor_sessions(user_id);
