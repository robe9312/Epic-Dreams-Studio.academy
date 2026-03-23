import os
import time
import tempfile
import httpx
import socket
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Header, Request
from pydantic import BaseModel
from groq import Groq
from tenacity import retry, stop_after_attempt, wait_exponential

# Importaciones de tus servicios locales
from app.services.youtube_service import YouTubeService
from app.services.telegram_storage import TelegramStorage

# 1. Configuración de Logs (Fundamental para ver errores en la consola de HF)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# 2. Definición de Modelos Pydantic (Deben estar antes de los endpoints)
class ChatRequest(BaseModel):
    prompt: str
    model: str = "llama-3.3-70b-versatile"

# 3. Inicialización de Servicios
youtube_service = YouTubeService()
telegram_service = TelegramStorage()

# Variables de entorno
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# --- Verificación de Conectividad al Arrastre ---
def check_network_startup():
    try:
        # Intenta resolver api.telegram.org para "despertar" el DNS del Space
        ip = socket.gethostbyname("api.telegram.org")
        logger.info(f"✅ Conectividad DNS establecida: {ip}")
    except Exception as e:
        logger.warning(f"⚠️ DNS no resuelto al inicio: {e}")

check_network_startup()

# --- Endpoints ---

@app.get("/")
def home():
    return {
        "status": "Online",
        "msg": "Epic Dreams Academy API",
        "webhook_endpoint": "/webhook"
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
    try:
        # Usamos el servicio de Telegram que ya tienes corregido con HTTP/1.1
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

# --- Integración Webhook Telegram ---

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=20))
async def telegram_api_call(method: str, json_data: dict = None):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/{method}"
    # CRÍTICO: http2=False para evitar bloqueos en el proxy de Hugging Face
    async with httpx.AsyncClient(http2=False, timeout=30.0) as client:
        response = await client.post(url, json=json_data)
        response.raise_for_status()
        return response.json()

async def procesar_update(update: dict):
    """
    Lógica principal del bot: responde a mensajes, maneja comandos, etc.
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

# --- Endpoint para activar el Webhook ---
@app.get("/api/v1/telegram/set-webhook")
async def set_webhook(request: Request):
    """
    Configura la URL de este Space como webhook en Telegram.
    Llama a esto una vez después de desplegar.
    """
    # Detectar la URL base del Space dinámicamente o usar hardcoded si se prefiere
    base_url = str(request.base_url).rstrip("/")
    if "localhost" in base_url or "127.0.0.1" in base_url:
        return {"error": "No se puede configurar webhook desde localhost. Despliega en HF primero."}

    webhook_url = f"{base_url}/webhook"

    # Llamar a setWebhook de Telegram
    result = await telegram_api_call("setWebhook", json_data={
        "url": webhook_url,
        "secret_token": WEBHOOK_SECRET,
        "allowed_updates": ["message"]
    })

    return {
        "webhook_url": webhook_url,
        "telegram_response": result
    }

from app.agents.director_agent import DirectorAgent

# ... (dentro de los endpoints)

@app.post("/api/v2/production/generate")
async def generate_production(request: ChatRequest):
    """
    Inicia el ciclo de orquestación multi-agente para generar un guion y shotlist.
    """
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY no configurada")
    
    try:
        director = DirectorAgent()
        graph = director.build_graph()
        
        # Ejecutar el grafo de estados
        final_state = await graph.ainvoke({
            "idea": request.prompt,
            "script": "",
            "parsed_script": [],
            "shotlist": "",
            "feasibility_score": 0.0,
            "feedback": "",
            "iterations": 0
        })
        
        return {
            "status": "success",
            "data": {
                "script": final_state["script"],
                "parsed_script": final_state["parsed_script"],
                "shotlist": final_state["shotlist"],
                "score": final_state["feasibility_score"]
            }
        }
    except Exception as e:
        logger.error(f"Error en generación de producción: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook")
async def telegram_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_telegram_bot_api_secret_token: str = Header(None)
):
    # Verificación de seguridad del Webhook
    if WEBHOOK_SECRET and x_telegram_bot_api_secret_token != WEBHOOK_SECRET:
        logger.warning("Intento de acceso al webhook con token inválido")
        raise HTTPException(status_code=403, detail="Token inválido")

    update = await request.json()
    background_tasks.add_task(procesar_update, update)
    return {"ok": True}