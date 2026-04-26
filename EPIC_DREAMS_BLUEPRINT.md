# 🎬 Epic Dreams Studio Academy: Sovereign Cinema Blueprint

> **"Del guion al render en un solo tab."**
> Guía Maestra de Arquitectura, Visión y Estado del Proyecto. Este documento sirve como punto de verdad absoluto para mantener el contexto en sesiones de desarrollo y revisiones externas.

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
3. **🟨 EDIT (The Workbench):** Timeline de edición no lineal, sincronización de frames y gestión de pistas (enfoque principal actual).
4. **🟪 AUDIO (Sound Stage):** Composición de música de fondo y diseño sonoro automatizado.
5. **🟥 EXPORT (Deliver):** Concatenación con FFmpeg en el backend, render final y distribución.

---

## 🤖 5. Arquitectura Multi-Agente (Virtual Film Crew)
Gestionada mediante la sinergia de **LangGraph** y **OpenFang Agent OS** para operar en esquemas 24/7 y reducir latencia en WebSockets:
- **Director Agent:** Supervisa todo el ciclo (CCV - Co-Creation Cycle), audita viabilidad técnica.
- **Script Agent:** Especialista en ritmo narrativo, diálogo y arcos de personajes.
- **DP Agent (Director de Fotografía):** Traduce descripciones emocionales a planos técnicos (lentes, encuadres, iluminación).
- **Continuity Agent:** Mantiene la coherencia visual y narrativa entre escenas.

---

## ✅ 6. Estado Actual y Logros (Lo Ya Logrado)
- **Integración de OpenFang:** CLI inicializado globalmente (`openfang init`) en el entorno como núcleo operativo de los agentes.
- **Sistema Multi-Workspace:** Interfaces base (Idea, Visual, Audio, Edit, Export) integradas.
- **Persistencia Cloud:** Neon DB funcional guardando storyboards y bandas sonoras con sincronización asíncrona.
- **Integraciones AI Funcionales:** 
  - Generación de Storyboards mediante FLUX.1.
  - Integración real de MusicGen vía Replicate para bandas sonoras.
- **Estabilidad de Build:** Corrección de importaciones y bugs críticos (ej. `useAcademyStore`, accesibilidad, sesión del backend).

---

## 🚧 7. Hoja de Ruta (Roadmap) y Próximos Pasos Inmediatos

### Tareas Inmediatas (Foco Actual)
- [ ] Timeline: Implementar sistema robusto de **Drag & Drop** para clips.
- [ ] Timeline: Funcionalidad de **Trimming** (recorte) de clips.
- [x] Timeline: Regla de tiempo dinámica (**Dynamic Time Ruler**) basada en Canvas.
- [ ] Autenticación de Usuarios (Clerk o Neon Auth).

### Fases Estratégicas
- **Fase 1 (Validación):** Terminar landing page, flujo principal de co-creación y validar en comunidades (Reddit, IndieHackers).
- **Fase 2 (Monetización y Rendimiento):** Integración con Stripe y desarrollo final del *AssetRouter* (Telegram+YouTube). *(Nota: La integración base del framework OpenFang ya está completada)*.
- **Fase 3 (Expansión):** Marketplace de prompts/agentes y Certificación Profesional (CaaS - Cinema as a Service).

---
*Este documento debe ser consultado y actualizado a medida que la arquitectura evolucione, asegurando que cualquier agente de IA o desarrollador humano entienda la visión global del proyecto.*
