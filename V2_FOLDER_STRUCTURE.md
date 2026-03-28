# Epic Dreams Studio Academy V2 - Folder Structure

## 🎭 Frontend (Next.js 15 + Tailwind + Zustand)

- `app/` - Next.js App Router
  - `(auth)/` - Login/Registration
  - `(dashboard)/` - Main workbench layout
  - `studio/` - The core workbench page
- `components/` - Atomic & Compositional UI
  - `ui/` - Shadcn/Radix primitives (dark mode)
  - `studio/`
    - `Canvas.tsx` - 16:9 Preview area
    - `Inspector.tsx` - Metadata & AI Agent feedback
    - `Timeline/`
      - `Timeline.tsx` - Main multi-track container
      - `Track.tsx` - Individual track logic
      - `Playhead.tsx` - The sincronization bar
- `store/` - Zustand global state
  - `useTimelineStore.ts` - Tracks, clips, playhead state
  - `useAgentStore.ts` - Agents status and logs
- `services/` - API Clients (Supabase, Backend)

## 🐍 Backend (FastAPI + Python 3.12)

- `app/`
  - `api/` - REST Endpoints
  - `agents/` - LangGraph Orchestration
    - `script_agent.py` - Narrative Logic
    - `dp_agent.py` - Cinematography Logic
    - `continuity_agent.py` - Audit Logic
    - `director_agent.py` - CCV Cycle Manager
  - `services/`
    - `groq_client.py` - LPU Optimized Inference
    - `supabase_service.py` - Database operations
  - `models/` - Pydantic & SQL schemas
- `requirements.txt` - Python dependencies

## 🗄️ Database (neon)

- `migrations/` - SQL versioning
- `v2_schema.sql` - Core data model
