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

---

## 🚀 Próximos Pasos (Hoja de Ruta)

### 1. Aplicar los Fixes de Telegram en Hugging Face (Prioridad)
- Ir a la configuración de tu Space en Hugging Face.
- Modificar el Secret de `TELEGRAM_BOT_TOtuKEN` a `TELEGRAM_BOT_TOKEN`.
- Agregar un Secret nuevo `TELEGRAM_CHAT_ID` con valor `7233326306`.
- Reiniciar el Space y volver a configurar el Webhook ejecutando una petición a `TU_URL_DE_HF/api/v1/telegram/set-webhook`.

### 2. Timeline (Fase 2)
- Programar funcionalidad "Drag and Drop" para mover clips entre pistas libremente usando coordenadas actualizadas.
- Implementar bordes ajustables en los clips para "recortar" (Trim) la duración.
- Dibujar una **Regla de Tiempo Dinámica** superior (SVG o Canvas) cuyos intervalos se actualicen al hacer Zoom in/out.

### 3. Autenticación y Flujos
- Finalizar las rutas protegidas a nivel backend verificando el token generado por Clerk.

### 4. Orquestador de IA (LangGraph)
- Consolidar la interfaz gráfica del Workbench con el orquestador (`director_agent.py`) para consumir el ciclo de evaluación y crear pistas narrativas, de cámara y continuidad de forma semiautomática.
