import os
import time
import tempfile
import httpx
import socket
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Header, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import APIKeyHeader
from app.services.database_service import db_service
from pydantic import BaseModel
from groq import AsyncGroq
from tenacity import retry, stop_after_attempt, wait_exponential

from app.services.youtube_service import YouTubeService
from app.services.telegram_storage import TelegramStorage
from app.agents.director_agent import DirectorAgent

# ── Logs ──────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Epic Dreams Academy API", version="2.0.0")

# ── Security ──────────────────────────────────────────────────────────────────
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def verify_api_key(api_key: str = Depends(api_key_header)):
    expected_key = os.getenv("EPIC_DREAMS_API_KEY")
    if not expected_key:
        return # Allow if no key is configured in env (for initial setup)
    if api_key != expected_key:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    return api_key

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Relaxed for MVP/Vercel previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic models ───────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    prompt: str
    model: str = "llama-3.3-70b-versatile"

# ── Env vars ──────────────────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GROQ_API_KEY       = os.getenv("GROQ_API_KEY")
WEBHOOK_SECRET     = os.getenv("WEBHOOK_SECRET")          # No default — must be set explicitly

# ── Singleton services ────────────────────────────────────────────────────────
youtube_service  = YouTubeService()
telegram_service = TelegramStorage()
_groq_client: AsyncGroq | None = None

def get_groq_client() -> AsyncGroq:
    """Return a singleton AsyncGroq client."""
    global _groq_client
    if _groq_client is None:
        if not GROQ_API_KEY:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        _groq_client = AsyncGroq(api_key=GROQ_API_KEY)
    return _groq_client

# ── Network startup check ─────────────────────────────────────────────────────
def check_network_startup():
    try:
        ip = socket.gethostbyname("api.telegram.org")
        logger.info(f"✅ DNS OK: {ip}")
    except Exception as e:
        logger.warning(f"⚠️ DNS not resolved at startup: {e}")

check_network_startup()

# ── Telegram helpers ──────────────────────────────────────────────────────────
@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=20))
async def telegram_api_call(method: str, json_data: dict = None):
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=500, detail="TELEGRAM_BOT_TOKEN not configured")
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/{method}"
    async with httpx.AsyncClient(http2=False, timeout=30.0) as client:
        response = await client.post(url, json=json_data)
        response.raise_for_status()
        return response.json()

async def procesar_update(update: dict):
    if "message" not in update:
        return
    message    = update["message"]
    chat_id    = message["chat"]["id"]
    text       = message.get("text", "").strip()
    first_name = message["from"].get("first_name", "Usuario")

    if text.startswith("/start"):
        respuesta = (
            f"¡Hola {first_name}! 👋\n\n"
            "Bienvenido al bot de Epic Dreams Academy.\n\n"
            "Comandos:\n"
            "/start  - Ver este mensaje\n"
            "/upload - Info sobre subida de archivos\n"
            "/status - Estado del servidor"
        )
    elif text.startswith("/upload"):
        respuesta = (
            "Para subir archivos envíalos directamente aquí (como documento) "
            "o usa la plataforma: https://epic-dreams-studio-academy.hf.space"
        )
    elif text.startswith("/status"):
        respuesta = "✅ Servidor Epic Dreams Online."
    elif "document" in message:
        file_name = message["document"].get("file_name", "archivo")
        respuesta = f"He recibido: *{file_name}*. Lo procesaremos en breve."
    else:
        respuesta = f"Recibido: {text}. Usa /start para ver opciones."

    await telegram_api_call("sendMessage", json_data={
        "chat_id": chat_id,
        "text": respuesta,
        "parse_mode": "Markdown"
    })

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PUBLIC ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/")
def home():
    return {
        "status": "Online",
        "service": "Epic Dreams Academy API v2",
        "docs": "/docs",
    }

@app.get("/debug/dns")
def debug_dns():
    try:
        ip = socket.gethostbyname("api.telegram.org")
        return {"status": "OK", "ip": ip}
    except Exception as e:
        return {"status": "ERROR", "msg": str(e)}

# ── Storage ───────────────────────────────────────────────────────────────────

@app.post("/api/v1/storage/upload")
async def upload_asset(file: UploadFile = File(...)):
    try:
        result = await telegram_service.upload_file(file)
        if result.get("status") == "error":
            raise HTTPException(status_code=502, detail=result.get("message"))
        return result
    except Exception as e:
        logger.error(f"upload_asset error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/youtube/upload")
async def upload_to_youtube(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = "Upload via API",
    description: str = ""
):
    allowed = ['.mp4', '.mov', '.avi', '.mkv']
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported video format")

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    background_tasks.add_task(youtube_service.upload_video, tmp_path, title, description)
    return {"status": "processing", "message": "Upload started in background"}

# ── Groq Chat ─────────────────────────────────────────────────────────────────

@app.post("/api/v1/groq/chat")
async def groq_chat(request: ChatRequest):
    client = get_groq_client()
    try:
        completion = await client.chat.completions.create(
            model=request.model,
            messages=[{"role": "user", "content": request.prompt}],
            temperature=0.7,
            max_tokens=1024,
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        logger.error(f"Groq chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Production / Multi-Agent ──────────────────────────────────────────────────

@app.get("/api/v2/production/stream")
async def stream_production(prompt: str, api_key: str = Depends(verify_api_key)):
    """
    Main AI Studio endpoint.
    Triggers multi-agent orchestration (Script → DP → Critic → Parser)
    and returns Server-Sent Events consumed by the frontend.
    """
    if not prompt or not prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    director = DirectorAgent()
    return StreamingResponse(
        director.run_stream(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )

# ── Telegram ──────────────────────────────────────────────────────────────────

@app.get("/api/v1/telegram/set-webhook")
async def set_webhook(request: Request):
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=500, detail="TELEGRAM_BOT_TOKEN not configured")

    base_url = str(request.base_url).rstrip("/")
    if "localhost" in base_url or "127.0.0.1" in base_url:
        return {"error": "Cannot set webhook from localhost. Deploy to HF first."}

    webhook_url = f"{base_url}/webhook"
    logger.info(f"Setting webhook: {webhook_url}")

    try:
        result = await telegram_api_call("setWebhook", json_data={
            "url": webhook_url,
            "secret_token": WEBHOOK_SECRET,
            "allowed_updates": ["message"]
        })
        return {"webhook_url": webhook_url, "telegram_response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/telegram/test")
async def test_telegram_message(chat_id: str = None):
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=500, detail="TELEGRAM_BOT_TOKEN not configured")
    if not chat_id:
        chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not chat_id:
        raise HTTPException(status_code=400, detail="chat_id required")

    try:
        result = await telegram_api_call("sendMessage", json_data={
            "chat_id": chat_id,
            "text": "🧪 Test message from Epic Dreams server. Telegram is working!",
            "parse_mode": "Markdown"
        })
        return {"status": "ok", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook")
async def telegram_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_telegram_bot_api_secret_token: str = Header(None)
):
    if WEBHOOK_SECRET and x_telegram_bot_api_secret_token != WEBHOOK_SECRET:
        logger.warning("Webhook access attempt with invalid token")
        raise HTTPException(status_code=403, detail="Invalid token")

    update = await request.json()
    background_tasks.add_task(procesar_update, update)
    return {"ok": True}