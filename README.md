# 🎬 Epic Dreams Studio Academy

> **"Del guion al render en un solo tab."**  
> El primer ecosistema de producción cinematográfica en la nube, aumentado por IA y diseñado para la nueva era del cine independiente.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Neon](https://img.shields.io/badge/Database-Neon%20Postgres-00E599?logo=postgresql)](https://neon.tech/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange)](https://groq.com/)
[![Status](https://img.shields.io/badge/Status-MVP%20Phase-yellow)](#)

---

## 🚀 La Visión
**Epic Dreams Studio Academy V2** no es solo un editor; es un equipo de cine completo viviendo en tu navegador. Hemos fusionado una academia de cine de élite con un estudio de post-producción profesional, eliminando las barreras de hardware y coste mediante una arquitectura de agentes de IA y almacenamiento híbrido infinito.

## 🏗️ Espacios de Trabajo (Workspaces)
Inspirados en el flujo de trabajo de **DaVinci Resolve**, hemos dividido la producción en 5 contextos especializados:

1. **🟦 IDEA (Script Room):** Escritura en formato profesional **Fountain** asistida por el **Mentor Guionista**.
2. **🟨 EDIT (The Workbench):** Timeline de precisión multi-pista con sincronización de frames y edición ondulada.
3. **🟩 VISUAL (Storyboard):** Generación de frames visuales instantáneos con **FLUX.1** basándose en el guion.
4. **🟪 AUDIO (Sound Stage):** Composición de bandas sonoras con **MusicGen** y diseño sonoro automatizado.
5. **🟥 EXPORT (Deliver):** Renderizado final y publicación directa a canales de marca en **YouTube**.

## 🧠 El "Cerebro": Arquitectura Multi-Agente
Nuestra "Virtual Film Crew" utiliza **Llama 3.3 (vía Groq)** para simular departamentos reales:
- **Director Agent:** Orquesta el flujo de trabajo y realiza auditorías de viabilidad.
- **Script Agent:** Especialista en narrativa dramática y diálogos.
- **DP Agent:** Traduce escenas a planos técnicos (lentes, iluminación, encuadres).
- **Continuity Agent:** Garantiza la coherencia narrativa entre escenas.

## 🛠️ Stack Tecnológico
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand.
- **Backend:** FastAPI (Hugging Face Docker), LangGraph para orquestación de agentes.
- **Base de Datos:** Neon Postgres (Serverless SQL) con Database Branching.
- **Almacenamiento:** Sistema híbrido Telegram Bot API (Assets) + YouTube Data API v3 (Video).
- **Autenticación:** Clerk (Auth & User Profiles).

## 📡 Infraestructura Cloud
El proyecto utiliza un pipeline de despliegue continuo (CI/CD) altamente eficiente:
- **Frontend:** Desplegado en [Vercel](https://vercel.com).
- **Backend:** Desplegado en [Hugging Face Spaces](https://huggingface.co/spaces).
- **Sincronización:** GitHub Actions para el despliegue automático del backend y esquemas SQL.

## 🛠️ Configuración Rápida
Si deseas clonar y probar el entorno localmente:
```bash
# Instalar dependencias del frontend
cd frontend && npm install

# Instalar dependencias del backend
cd backend && pip install -r requirements.txt

# Configurar variables (.env)
# DATABASE_URL, GROQ_API_KEY, TELEGRAM_BOT_TOKEN, YT_REFRESH_TOKEN...
