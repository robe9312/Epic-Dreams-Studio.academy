# backend/app/services/telegram_storage.py
import os
import httpx
from fastapi import UploadFile

class TelegramStorage:
    def __init__(self):
        self.token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = os.getenv("TELEGRAM_CHAT_ID")
        # Timeout extendido para evitar fallos por latencia de red en Spaces
        self.timeout = httpx.Timeout(30.0, connect=15.0)

    async def upload_file(self, file: UploadFile):
        """Sube un archivo a Telegram y devuelve el ID único."""
        url = f"https://api.telegram.org/bot{self.token}/sendDocument"
        try:
            content = await file.read()
            files = {'document': (file.filename, content)}
            data = {'chat_id': self.chat_id, 'caption': f"Asset: {file.filename}"}
            
            # Forzamos http2=False para compatibilidad con el proxy de Hugging Face
            async with httpx.AsyncClient(http2=False, timeout=self.timeout) as client:
                response = await client.post(url, data=data, files=files)
                result = response.json()

            if result.get("ok"):
                file_id = result["result"]["document"]["file_id"]
                return {"status": "success", "file_id": file_id, "filename": file.filename}
            else:
                return {"status": "error", "message": result.get("description")}
        except Exception as e:
            return {"status": "error", "message": f"Network Error: {str(e)}"}

    async def get_download_url(self, file_id: str):
        """Genera el enlace de descarga para un archivo guardado."""
        get_file_url = f"https://api.telegram.org/bot{self.token}/getFile?file_id={file_id}"
        async with httpx.AsyncClient(http2=False, timeout=self.timeout) as client:
            response = await client.get(get_file_url)
            result = response.json()

        if result.get("ok"):
            file_path = result["result"]["file_path"]
            return f"https://api.telegram.org/file/bot{self.token}/{file_path}"
        return None