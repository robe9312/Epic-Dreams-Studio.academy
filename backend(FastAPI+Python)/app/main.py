import os
import time
import tempfile
import httpx
import socket
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Header, Request
from app.services.youtube_service import YouTubeService
from app.services.telegram_storage import TelegramStorage
from pydantic import BaseModel
from groq import Groq
from tenacity import retry, stop_after_attempt, wait_exponential  # <-- NUEVO: reintentos

app = FastAPI()

# Initialize services
youtube_service = YouTubeService()
telegram_service = TelegramStorage()

# --- Variables de entorno para el bot de Telegram ---
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")  # NUEVO: token secreto para webhook

# --- Root endpoint ---
@app.get("/")
def home():
    return {
        "status": "Online",
        "msg": "Epic Dreams Academy API",
        "webhook_endpoint": "/webhook"
    }

# --- verificar conectividad ---
@app.get("/debug/dns")
def debug_dns():
    try:
        # Intenta resolver api.telegram.org
        ip = socket.gethostbyname("api.telegram.org")
        return {"status": "OK", "ip": ip}
    except Exception as e:
        return {"status": "ERROR", "msg": str(e)}

# --- Network fix endpoint ---
@app.get("/api/v1/network-fix")
def network_fix():
    """Este endpoint obliga al servidor a buscar a Telegram varias veces."""
    for i in range(5):
        try:
            requests.get("https://api.telegram.org", timeout=3)
            return {"status": "✅ RED CONECTADA", "retries": i}
        except:
            time.sleep(2)
    return {"status": "❌ SIGUE SIN INTERNET", "tip": "Reinicia el Space en 'Pause' y luego 'Resume'"}

# --- Telegram storage endpoints ---
@app.post("/api/v1/storage/upload")
async def upload_asset(file: UploadFile = File(...)):
    try:
        result = await telegram_service.upload_file(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión: {str(e)}")

# --- YouTube upload endpoint (fixed parameter order) ---
@app.post("/api/v1/youtube/upload")
async def upload_to_youtube(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = "Upload via API",
    description: str = ""
):
    """
    Sube un video a YouTube. El archivo se guarda temporalmente en /tmp.
    """
    # Validar extensión de video
    allowed_extensions = ['.mp4', '.mov', '.avi', '.mkv']
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Formato de video no soportado")

    # Guardar archivo temporalmente
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # Subir en segundo plano
    background_tasks.add_task(
        youtube_service.upload_video,
        tmp_path, title, description
    )
    return {"status": "processing", "message": "Subida iniciada en segundo plano"}

# --- Groq chat endpoint ---
class ChatRequest(BaseModel):
    prompt: str
    model: str = "llama-3.3-70b-versatile"

@app.post("/api/v1/groq/chat")
async def groq_chat(request: ChatRequest):
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        completion = client.chat.completions.create(
            model=request.model,
            messages=[{"role": "user", "content": request.prompt}],
            temperature=0.7,
            max_tokens=1024,
        )
        response = completion.choices[0].message.content
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Health check ---
@app.get("/health")
def health():
    return {"groq": "OK" if os.getenv("GROQ_API_KEY") else "Falta"}

# ===========================
# INTEGRACIÓN DEL BOT DE TELEGRAM (webhook)
# ===========================

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def telegram_api_call(method: str, json_data: dict = None):
    """
    Llama a la API de Telegram con reintentos automáticos.
    Úsalo para sendMessage, sendDocument, etc.
    """
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/{method}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=json_data)
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

@app.post("/webhook")
async def telegram_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_telegram_bot_api_secret_token: str = Header(None)
):
    """
    Endpoint que Telegram llama cuando hay una actualización.
    Verifica el token secreto y procesa en segundo plano.
    """
    # Verificar token secreto
    if x_telegram_bot_api_secret_token != WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Token inválido")

    # Obtener los datos de Telegram
    update = await request.json()

    # Procesar en segundo plano (no bloquear la respuesta)
    background_tasks.add_task(procesar_update, update)

    return {"ok": True}