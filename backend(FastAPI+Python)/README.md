---
title: Epic Dreams Backend
emoji: 🔥
colorFrom: purple
colorTo: red
sdk: docker
pinned: false
license: mit
---

# 🚀 Epic Dreams Studio Academy: AI Backend Engine 

Motor de orquestación cinematográfica con agentes de IA que gestiona producción completa desde guion hasta storyboard.

## 🧠 Arquitectura de Agentes
- **Director Agent**: Orquesta flujo CCV (Critique-Correct-Verify)
- **Script Agent**: Especialista guionismo formato Fountain
- **DP Agent**: Genera Shot Lists técnicos
- **Continuity Agent**: Garantiza coherencia narrativa

## 🛠️ Stack Tecnológico
- **FastAPI + Python 3.12**
- **Groq LPU (Llama 3.3)** - <1s latencia
- **Neon Postgres** - Serverless PostgreSQL
- **Almacenamiento**: Telegram Bot API + YouTube Data API v3

## 📡 Endpoints API
- `GET /health` - Diagnóstico completo
- `POST /api/v1/ai/chat` - Chat con mentores IA
- `GET /api/v2/production/stream` - Orquestación multi-agente SSE
- `POST /api/v1/storage/upload` - Upload assets cloud
- `POST /api/v1/ai/generate-storyboard` - Generación frames FLUX.1

---
**Epic Dreams Studio Academy V2** - *Del guion al render en un solo tab.* 🎬