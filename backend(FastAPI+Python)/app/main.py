import os
import urllib.parse
from typing import Dict, Any, Optional, List
import time
import tempfile
import httpx
import socket
import logging
import asyncio
import replicate
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Header, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from groq import AsyncGroq
from tenacity import retry, stop_after_attempt, wait_exponential

# Importaciones locales
from app.services.database_service import db_service
from app.services.youtube_service import YouTubeService
from app.services.telegram_storage import TelegramStorage
from app.agents.director_agent import DirectorAgent

telegram_service = TelegramStorage()

# ── Logs ──────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Epic Dreams Academy API", version="2.0.1")

# ── Security ──────────────────────────────────────────────────────────────────
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def verify_api_key(request: Request, api_key: str = Depends(api_key_header)):
    expected_key = os.getenv("EPIC_DREAMS_API_KEY")
    if not expected_key:
        return # Allow if no key is configured in env (for initial setup)
    
    # Fallback to query param if header is missing (for EventSource)
    token = api_key or request.query_params.get("api_key")
    
    if token != expected_key:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    return token

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
WEBHOOK_SECRET     = os.getenv("WEBHOOK_SECRET")

# ── Singletons ────────────────────────────────────────────────────────────────
youtube_service = YouTubeService()
_groq_client: AsyncGroq | None = None

def get_groq_client() -> AsyncGroq:
    global _groq_client
    if _groq_client is None:
        if not GROQ_API_KEY:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        _groq_client = AsyncGroq(api_key=GROQ_API_KEY)
    return _groq_client

# ── ARRANQUE SEGURO (Evita el Loop de Hugging Face) ───────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Iniciando Epic Dreams Backend...")
    # El chequeo de red se hace en segundo plano para NO bloquear el puerto 7860
    asyncio.create_task(check_network_async())

async def check_network_async():
    try:
        loop = asyncio.get_event_loop()
        ip = await loop.run_in_executor(None, socket.gethostbyname, "api.telegram.org")
        logger.info(f"✅ Red lista: api.telegram.org -> {ip}")
    except Exception as e:
        logger.warning(f"⚠️ Red no disponible todavía: {e}")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PUBLIC ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/")
def home():
    return {
        "status": "Online",
        "service": "Epic Dreams Academy API",
        "version": "2.0.1",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "Running",
        "database": "Neon Postgres Ready" if os.getenv("DATABASE_URL") else "Missing DB URL",
        "ai": "Ready" if GROQ_API_KEY else "Missing Groq Key"
    }

# --- STORAGE ---
@app.post("/api/v1/storage/upload")
async def upload_asset(file: UploadFile = File(...)):
    try:
        result = await telegram_service.upload_file(file)
        if result.get("status") == "error":
            raise HTTPException(status_code=502, detail=result.get("message"))
        return result
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- YOUTUBE (CORREGIDO) ---
@app.post("/api/v1/youtube/upload")
async def upload_to_youtube(
    file: UploadFile = File(...),
    title: str = "Epic Dreams Render",
    description: str = "Generado con Epic Dreams Academy"
):
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        result = await asyncio.to_thread(youtube_service.upload_video, tmp_path, title, description)
        return {"status": "success", "video": result}
    except Exception as e:
        logger.error(f"Error YouTube: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

# --- PRODUCTION STREAM ---
@app.get("/api/v2/production/stream")
async def stream_production(prompt: str, project_id: str = None, api_key: str = Depends(verify_api_key)):
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt requerido")
    
    director = DirectorAgent()
    return StreamingResponse(
        director.run_stream(prompt, project_id=project_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )

# --- STORYBOARD (FLUX) ---
@app.post("/api/v1/ai/generate-storyboard")
async def generate_storyboard(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    prompt = payload.get("prompt")
    scene_id = payload.get("scene_id")
    if not prompt: raise HTTPException(status_code=400, detail="Prompt missing")
    
    safe_prompt = urllib.parse.quote(prompt)
    image_url = f"https://image.pollinations.ai/prompt/{safe_prompt}?width=1280&height=720&model=flux&nologo=true"
    
    if scene_id:
        try:
            db_service.save_storyboard(scene_id, image_url, prompt)
        except Exception as e:
            logger.error(f"DB Error: {e}")
            
    return {"status": "success", "image_url": image_url}

# --- MUSIC (REPLICATE) ---
@app.post("/api/v1/ai/generate-music")
async def generate_music(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    prompt = payload.get("prompt")
    project_id = payload.get("project_id")
    if not prompt: raise HTTPException(status_code=400, detail="Prompt missing")
    
    token = os.getenv("REPLICATE_API_TOKEN")
    if not token:
        logger.warning("Token lacking, using placeholder")
        audio_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    else:
        try:
            output = replicate.run(
                "meta/musicgen:671ac645ce5e52d1d00ef3b78223c03c2a3734e6",
                input={"prompt": prompt, "model_version": "stereo-large", "duration": 15}
            )
            audio_url = output if isinstance(output, str) else output[0]
        except Exception as e:
            logger.error(f"Replicate error: {e}")
            audio_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

    if project_id:
        try:
            db_service.save_soundtrack(project_id, audio_url, prompt)
        except Exception as e:
            logger.error(f"DB Error: {e}")
            
    return {"status": "success", "audio_url": audio_url, "description": prompt}

@app.get("/api/v1/projects/{project_id}/assets")
async def get_project_assets(project_id: str, api_key: str = Depends(verify_api_key)):
    return db_service.get_project_assets(project_id)

@app.patch("/api/v2/production/clips/{clip_id}")
async def update_production_clip(clip_id: str, data: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    success = db_service.update_clip(clip_id, data)
    if not success: raise HTTPException(status_code=500, detail="DB Update failed")
    return {"status": "success", "clip_id": clip_id}