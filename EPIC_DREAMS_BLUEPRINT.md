# 🎬 Epic Dreams Studio Academy: Sovereign Cinema Blueprint

> **"Del guion al render en un solo tab."**
> Guía Maestra de Arquitectura, Visión y Estado del Proyecto. Este documento sirve como punto de verdad absoluto para mantener el contexto en sesiones de desarrollo y revisiones externas.

> [!IMPORTANT]
> **Contexto Expandido:** Toda la documentación profunda y el conocimiento acumulado de Epic Dreams reside en **NotebookLM**. Siempre que sea posible, se recomienda consultar el cuaderno para recuperar contexto histórico o decisiones de diseño complejas.

---

## 🚀 1. La Visión Principal
**Epic Dreams Studio Academy** es un ecosistema de co-creación narrativa impulsado por IA. Su propósito es democratizar la producción cinematográfica independiente proporcionando un "equipo de cine virtual" (Virtual Film Crew) en el navegador. Elimina las barreras de hardware de alto rendimiento y costos excesivos de renderizado mediante una arquitectura soberana y de bajo costo.

---

## 🏛️ 2. Arquitectura del Sistema (La "Trinidad Sagrada")
Para garantizar escalabilidad, colaboración en tiempo real y evitar problemas de memoria (OOM) típicos en generación multimedia con IA, el proyecto se divide en tres pilares:

### A. El Cuerpo (Frontend)
- **Framework:** Next.js 14/15 (App Router) con TypeScript.
- **Estado Global:** Zustand (para el timeline, orquestación de agentes y UI).
- **Estilos y Animación:** Tailwind CSS, Radix UI (Shadcn), Framer Motion.
- **Colaboración:** Yjs + Tiptap (para edición colaborativa en el Script Room).
- **Despliegue:** Vercel.

### B. El Cerebro (Backend)
- **Framework:** FastAPI con Python 3.12.
- **Orquestación:** LangGraph y **OpenFang Agent OS** para manejar la lógica de los agentes especialistas de forma autónoma.
- **Inferencia LLM:** Groq (Llama 3.3 70B) para latencia ultrabaja en la toma de decisiones.

### C. Los Músculos (Microservicios de Generación)
Desplegados en **Hugging Face Spaces** para delegar la carga computacional intensiva:
- **Space A (Brain):** Orquestación principal del backend y base de datos relacional.
- **Space B (Visual Studio):** Generación de storyboards y video (FLUX.1, Wan-2.1, HunyuanVideo).
- **Space C (Audio Studio):** Síntesis de voz (Fish-Speech) y música generativa (MusicGen / Replicate).

---

## 🗄️ 3. Estrategia de Almacenamiento Zero-Cost (AssetRouter)
Para mantener los costos operativos cercanos a cero, se implementa una arquitectura híbrida de almacenamiento:
1. **API de Bots de Telegram:** Actúa como una "nube infinita" para almacenar activos intermedios temporales (imágenes de storyboards, clips de audio sueltos).
2. **YouTube Data API v3:** Se usa como hosting (CDN) de los renders finales subiendo los videos en modo *unlisted*. Esto evita enormes costos de servidores de video.
3. **Neon Postgres:** Base de datos Serverless SQL principal para la persistencia del estado de los proyectos, metadatos y esquemas relacionales.

---

## 🛠️ 4. Espacios de Trabajo (Workspaces)
Inspirado en flujos profesionales como DaVinci Resolve, el proceso de producción ocurre en 5 contextos:
1. **🟦 IDEA (Script Room):** Editor en formato Fountain con mentoría narrativa.
2. **🟩 VISUAL (Storyboard):** Generación instantánea de keyframes basados en el guion.
3. **🟨 EDIT (The Workbench):** Timeline de edición no lineal, sincronización de frames y gestión de pistas.
4. **🟪 AUDIO (Sound Stage):** Composición de música de fondo y diseño sonoro automatizado.
5. **🎓 ACADEMY (Mentor Hall):** Espacio educativo con mentores IA especializados (Director, Guionista, DP, Editor) impulsado por **OpenFang**.
6. **🟥 EXPORT (Deliver):** Concatenación con FFmpeg en el backend, render final y distribución.

---

## 🤖 5. Arquitectura Multi-Agente (Virtual Film Crew)
Gestionada mediante la sinergia de **LangGraph** y **OpenFang Agent OS** para operar en esquemas 24/7 y reducir latencia en WebSockets:
- **Director Agent:** Supervisa todo el ciclo (CCV - Co-Creation Cycle), audita viabilidad técnica.
- **Script Agent:** Especialista en ritmo narrativo, diálogo y arcos de personajes.
- **DP Agent (Director de Fotografía):** Traduce descripciones emocionales a planos técnicos (lentes, encuadres, iluminación).
- **Continuity Agent:** Mantiene la coherencia visual y narrativa entre escenas.
- **Mentor Agent (OpenFang):** Sistema de tutoría reactiva con 4 personalidades cinematográficas (Ana García, Marco Solo, Elena Luz, Víctor Corte).

---

## ✅ 6. Estado Actual y Logros (Lo Ya Logrado)
- **Integración de OpenFang:** CLI inicializado globalmente (`openfang init`) y lógica de mentores activa.
- **Sistema Multi-Workspace:** Interfaces base integradas, incluyendo la nueva **Academy**.
- **Persistencia Cloud:** Neon DB funcional guardando storyboards y bandas sonoras.
- **Integraciones AI Funcionales:** 
  - Generación de Storyboards mediante FLUX.1.
  - Chat de Mentores especializado con **Llama 3.3 70B** vía Groq.
- **Estabilidad de Build:** Corrección de errores de tipos en el timeline y autenticación provisional (Mocked) para agilizar el desarrollo.

---

## 🚧 7. Hoja de Ruta (Roadmap) y Próximos Pasos Inmediatos

### Tareas Inmediatas (Foco Actual)
- [x] Timeline: Implementar sistema robusto de **Drag & Drop** para clips.
- [x] Timeline: Funcionalidad de **Trimming** (recorte) de clips.
- [x] Timeline: Regla de tiempo dinámica (**Dynamic Time Ruler**) basada en Canvas.
- [x] Autenticación: Implementación base con Auth.js (actualmente en modo Mocked para desarrollo rápido).
- [ ] Academy: Fix del Chat de Mentores (Bug de reactividad/streaming).
- [ ] Academy: Implementar "Optimistic UI" y estados de carga ("Thinking...") para mentores.
- [ ] Studio: Botón de "Nueva Producción" / Reset de Timeline.
- [ ] UI/UX: Suavizar transiciones entre workspaces y refinar el badge de "Invitado".
- [ ] Academy: Generación de contenido dinámico de lecciones mediante agentes.

### Fases Estratégicas
- **Fase 1 (Validación):** Terminar landing page, flujo principal de co-creación y validar en comunidades (Reddit, IndieHackers).
- **Fase 2 (Crecimiento):** Integrar exportación real a YouTube, sistema de suscripciones y comunidad.
- **Fase 3 (Expansión):** Marketplace de prompts/agentes y Certificación Profesional (CaaS - Cinema as a Service).

---

## 🧪 8. Auditoría de UI/UX y Funcionalidad Agéntica (Audit - Abril 2026)

### ✅ Fortalezas (Premium Feel)
- **Estética DAW:** El Studio logra una inmersión profesional técnica excelente.
- **Orquestación Real:** El flujo de agentes es visible y funcional en el feed.
- **Tipografía:** Excelente tono cinematográfico en la landing.

### ⚠️ Puntos Críticos y Fallos Detectados
- **Fallo de Generación (Visual/Audio):** Los Workspaces de Storyboard y Música fallan en producción por URLs hardcodeadas y falta de sincronización con el backend de Hugging Face.
- **Idea Workspace (Mockup):** El chat del Director y el parsing de guiones son simulaciones con `setTimeout`. No hay conexión real con el LLM en esta vista.
- **Sync de Mentores (Academy):** Bug de reactividad corregido, pero requiere monitoreo de conectividad con el backend.

## 🚀 9. Plan de Acción: Sesión 2 (Estabilización y Poder Real)
1. **Centralización de API:** Mover todas las llamadas a variables de entorno para evitar fallos de conectividad.
2. **Director Real:** Integrar el streaming de Groq/DirectorAgent en el Script Room para eliminar el mockup de "Idea".
3. **Orquestación OpenFang:** Implementar el parsing de escenas real en el backend para generar clips automáticos en el timeline.
4. **Health Monitor:** Añadir indicador visual de estado del backend (HF Space) para mejorar la UX.
5. **Configuración de Autenticación:** Migrar del modo "Invitado" a Auth.js real (Google OAuth + Middleware).

---
*Este documento debe ser consultado y actualizado a medida que la arquitectura evolucione, asegurando que cualquier agente de IA o desarrollador humano entienda la visión global del proyecto.*
