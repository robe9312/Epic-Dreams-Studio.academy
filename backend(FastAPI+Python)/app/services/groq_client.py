import os
from typing import AsyncGenerator
from groq import AsyncGroq

class GroqClient:
    """
    Cliente optimizado para Groq LPU (Llama 3.3 70B).
    Garantiza inferencia de baja latencia con streaming nativo.
    """
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("ERR: GROQ_API_KEY no configurado en el entorno.")
        self.client = AsyncGroq(api_key=self.api_key)
        self.model = "llama-3.3-70b-versatile"

    async def stream_chat(self, prompt: str, system_prompt: str = "") -> AsyncGenerator[str, None]:
        """
        Inicia un stream de chat con Llama 3.3 70B.
        Ideal para el AI Inspector y agentes en tiempo real.
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        completion = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=2048,
            stream=True,
        )

        async for chunk in completion:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def fast_completion(self, prompt: str, system_prompt: str = "") -> str:
        """Respuesta rápida sin streaming para tareas de fondo."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.2, # Menor temperatura para lógica técnica
        )
        return response.choices[0].message.content
