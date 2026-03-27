# Epic Dreams Studio - Estado del Proyecto y Próximos Pasos

## 📍 Arquitectura y Despliegue (Notas Importantes)

- **Frontend:** Next.js App Router (Hospedado en **Vercel**)
- **Backend:** FastAPI + Python (Hospedado en **Hugging Face Spaces**)
- **Base de Datos:** Postgres Serverless (Neon)

> **⚠️ IMPORTANTE SOBRE HUGGING FACE:** Cualquier cambio realizado en el archivo `.env` local no afecta al backend en producción. Para arreglar la integración de Telegram en producción, debes realizar los cambios manualmente en la configuración (Settings > Variables and secrets) de tu Space en Hugging Face.

---

## ✅ Acciones Recientes Completadas

1. **Autenticación (Clerk):** Integrada en el Frontend usando App Router y Middleware. Vercel ahora hace builds exitosos gracias a la configuración de `.npmrc`.
2. **Timeline tipo DaVinci (Fase 1):** El componente de Frontend pasó de primitivos (left: 0%) a arquitectura basada en Canvas-DOM (píxeles absolutos, Zoom semántico con `Ctrl + Rueda`, Paneado horizontal usando transformaciones).
3. **Diagnóstico Integración Telegram:** Detectado error tipográfico en el secret del backend (`TELEGRAM_BOT_TOtuKEN` por `TELEGRAM_BOT_TOKEN`) y ausencia del `TELEGRAM_CHAT_ID`. (Se resolvieron en el `.env` local).

## ✅ Logros Estructurales de Hoy

1. **Base de Datos Neon (Clerk Webhooks):** Sincronización perfecta entre registro de usuarios en el Frontend y perfiles nativos en Neon Postgres ejecutando firmas encriptadas `svix`.
2. **Motor de Video Monetizado:** Construcción de `<Monitor />` para la sincronización perfecta IFrame-Timeline y la subida de fondo sincronizada en FastAPI.
3. **Timeline NLE Asistido:** Implementación de la agrupación magnética de ideas `appendClipAtPlayhead` y el panel nativo de sobrescritura de guiones (`ClipEditor`).

---

## 🚀 Próximos Pasos (Hoja de Ruta Pendiente)

### 1. Conexión del "Cerebro" de IA (LangGraph)

- **Falta:** El botón en el frontend de *"Generar Escena"* no está conectado al backend. Necesitamos crear la ruta API que despierte al `director_agent.py`, genere el texto, demande el video a YouTube, y le devuelva el Clip final al Zustand del web.

### 2. Timeline Avanzado (Fase UI Final)

- **Falta Drag & Drop:** Poder arrastrar los bloques manualmente a izquierda o derecha si la IA se equivocó de segundo.
- **Falta Trimming:** Poder "jalar" los bordes de un bloque para hacerlo más corto o más largo.
- **Regla de Tiempo Dinámica:** Pintar los números (0s, 10s, 20s) en la barra superior usando Canvas para que acompañe visualmente el Zoom de la rueda del ratón.

### 3. Persistencia de Proyectos

- **Falta:** Que al actualizar la página web se recupere la línea de tiempo guardada en la base de datos Neon (actualmente el frontend empieza de cero o la memoria desaparece al recargar), mediante métodos HTTP GET en Next.js.
