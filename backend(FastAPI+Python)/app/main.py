import os
import time
import tempfile
import httpx
import socket
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Header, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
from tenacity import retry, stop_after_attempt, wait_exponential

# Importaciones de tus servicios locales
from app.services.youtube_service import YouTubeService
from app.services.telegram_storage import TelegramStorage
from app.agents.director_agent import DirectorAgent  # Agregado

# 1. Configuración de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# 2. Modelos Pydantic
class ChatRequest(BaseModel):
    prompt: str
    model: str = "llama-3.3-70b-versatile"

# 3. Inicialización de Servicios
youtube_service = YouTubeService()
telegram_service = TelegramStorage()

# Variables de entorno
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "default_secret_change_me")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Verificación inicial de conectividad DNS
def check_network_startup():
    try:
        ip = socket.gethostbyname("api.telegram.org")
        logger.info(f"✅ Conectividad DNS establecida: {ip}")
    except Exception as e:
        logger.warning(f"⚠️ DNS no resuelto al inicio: {e}")

check_network_startup()

# --- Funciones auxiliares para Telegram ---
@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=20))
async def telegram_api_call(method: str, json_data: dict = None):
    """
    Realiza una llamada a la API de Telegram con reintentos.
    """
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=500, detail="TELEGRAM_BOT_TOKEN no configurado")
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/{method}"
    async with httpx.AsyncClient(http2=False, timeout=30.0) as client:
        response = await client.post(url, json=json_data)
        response.raise_for_status()
        return response.json()

async def procesar_update(update: dict):
    """
    Procesa una actualización del webhook de Telegram.
    """
    if "message" not in update:
        return

    message = update["message"]
    chat_id = message["chat"]["id"]
    text = message.get("text", "").strip()
    first_name = message["from"].get("first_name", "Usuario")

    # Comando /start
    if text.startswith("/start"):
        respuesta = (
            f"¡Hola {first_name}! 👋\n\n"
            "Bienvenido al bot de Epic Dreams Academy.\n"
            "Puedo ayudarte a gestionar tus archivos y contenido.\n\n"
            "Comandos disponibles:\n"
            "/start - Ver este mensaje\n"
            "/upload - Información sobre subida de archivos\n"
            "/status - Verificar estado del servidor"
        )
    # Comando /upload
    elif text.startswith("/upload"):
        respuesta = (
            "Para subir archivos, envíamelos directamente por aquí (como documento) "
            "o usa nuestra plataforma web: https://epic-dreams-studio-academy.hf.space"
        )
    # Comando /status
    elif text.startswith("/status"):
        respuesta = "✅ Servidor Epic Dreams Online y funcionando."
    # Si recibimos un archivo
    elif "document" in message:
        file_name = message["document"].get("file_name", "archivo")
        respuesta = f"He recibido tu archivo: *{file_name}*. Lo procesaremos en breve."
    # Respuesta por defecto (Echo)
    else:
        respuesta = f"Recibido: {text}. Usa /start para ver las opciones."

    # Enviar respuesta usando la función con reintentos
    await telegram_api_call("sendMessage", json_data={
        "chat_id": chat_id,
        "text": respuesta,
        "parse_mode": "Markdown"
    })

# --- Endpoints públicos ---
@app.get("/")
def home():
    return {
        "status": "Online",
        "msg": "Epic Dreams Academy API",
        "webhook_endpoint": "/webhook",
        "telegram_token_configured": bool(TELEGRAM_BOT_TOKEN)
    }

@app.get("/debug/dns")
def debug_dns():
    try:
        ip = socket.gethostbyname("api.telegram.org")
        return {"status": "OK", "ip": ip}
    except Exception as e:
        return {"status": "ERROR", "msg": str(e)}

@app.post("/api/v1/storage/upload")
async def upload_asset(file: UploadFile = File(...)):
    """
    Sube un archivo a Telegram Storage.
    """
    try:
        result = await telegram_service.upload_file(file)
        if result.get("status") == "error":
            raise HTTPException(status_code=502, detail=result.get("message"))
        return result
    except Exception as e:
        logger.error(f"Error en upload_asset: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/youtube/upload")
async def upload_to_youtube(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = "Upload via API",
    description: str = ""
):
    allowed_extensions = ['.mp4', '.mov', '.avi', '.mkv']
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Formato de video no soportado")

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    background_tasks.add_task(youtube_service.upload_video, tmp_path, title, description)
    return {"status": "processing", "message": "Subida iniciada en segundo plano"}

@app.post("/api/v1/groq/chat")
async def groq_chat(request: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY no configurada")
    try:
        client = Groq(api_key=GROQ_API_KEY)
        completion = client.chat.completions.create(
            model=request.model,
            messages=[{"role": "user", "content": request.prompt}],
            temperature=0.7,
            max_tokens=1024,
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        logger.error(f"Error en Groq: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoints de producción (agentes) ---
@app.post("/api/v2/production/generate")
async def generate_production(request: ChatRequest):
    """
    Endpoint legacy que genera un guion sin streaming.
    """
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY no configurada")
    # Implementación básica (puedes adaptar según tu lógica)
    director = DirectorAgent()
    # Aquí podrías usar run_stream pero no es necesario; se deja simple
    return {"message": "Este endpoint está obsoleto, usa /api/v2/production/stream"}

@app.get("/api/v2/production/stream")
async def stream_production(prompt: str):
    """
    Inicia la orquestación multi-agente y devuelve un stream de eventos SSE.
    """
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY no configurada")
    director = DirectorAgent()
    return StreamingResponse(
        director.run_stream(prompt),
        media_type="text/event-stream"
    )

# --- Endpoints de Telegram ---
@app.get("/api/v1/telegram/set-webhook")
async def set_webhook(request: Request):
    """
    Configura el webhook de Telegram para este Space.
    Debes llamar a este endpoint UNA VEZ después del despliegue.
    """
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=500, detail="TELEGRAM_BOT_TOKEN no configurado")

    # Detectar la URL base del Space
    base_url = str(request.base_url).rstrip("/")
    if "localhost" in base_url or "127.0.0.1" in base_url:
        return {"error": "No se puede configurar webhook desde localhost. Despliega en HF primero."}

    webhook_url = f"{base_url}/webhook"
    logger.info(f"Configurando webhook en: {webhook_url}")

    # Llamar a setWebhook de Telegram
    try:
        result = await telegram_api_call("setWebhook", json_data={
            "url": webhook_url,
            "secret_token": WEBHOOK_SECRET,
            "allowed_updates": ["message"]
        })
        return {
            "webhook_url": webhook_url,
            "telegram_response": result
        }
    except Exception as e:
        logger.error(f"Error al configurar webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/telegram/test")
async def test_telegram_message(chat_id: str = None):
    """
    Endpoint de prueba para enviar un mensaje a un chat.
    Útil para verificar que el bot puede enviar mensajes.
    """
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=500, detail="TELEGRAM_BOT_TOKEN no configurado")
    if not chat_id:
        # Intenta obtener el chat_id del entorno (opcional)
        chat_id = os.getenv("TELEGRAM_CHAT_ID")
        if not chat_id:
            raise HTTPException(status_code=400, detail="Falta chat_id como parámetro o en variables de entorno")

    try:
        result = await telegram_api_call("sendMessage", json_data={
            "chat_id": chat_id,
            "text": "🧪 Mensaje de prueba desde el servidor. Si ves esto, ¡Telegram funciona correctamente!",
            "parse_mode": "Markdown"
        })
        return {"status": "ok", "result": result}
    except Exception as e:
        logger.error(f"Error enviando mensaje de prueba: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook")
async def telegram_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_telegram_bot_api_secret_token: str = Header(None)
):
    """
    Endpoint que recibe las actualizaciones de Telegram.
    """
    # Verificación de seguridad del Webhook
    if WEBHOOK_SECRET and x_telegram_bot_api_secret_token != WEBHOOK_SECRET:
        logger.warning("Intento de acceso al webhook con token inválido")
        raise HTTPException(status_code=403, detail="Token inválido")

    update = await request.json()
    background_tasks.add_task(procesar_update, update)
    return {"ok": True}