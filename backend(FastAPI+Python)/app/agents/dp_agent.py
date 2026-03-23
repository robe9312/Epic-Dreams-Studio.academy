from app.services.groq_client import GroqClient

class DPAgent:
    """
    Agente de Fotografía (Director of Photography).
    Genera Shot Lists, esquemas de iluminación y configuraciones ópticas.
    """
    def __init__(self):
        self.groq = GroqClient()
        self.system_prompt = (
            "Eres un Director de Fotografía (DP) de élite. "
            "Tu tarea es analizar guiones y generar un Shot List técnico que incluya: "
            "Tipo de plano (MCU, WS, etc.), Movimiento de cámara, Lente (35mm, 85mm) "
            "y un esquema de iluminación simplificado (SVG o texto descriptivo)."
        )

    async def generate_shotlist(self, script_segment: str) -> str:
        """Genera una lista de planos basada en un fragmento de guion."""
        prompt = f"Crea el Shot List técnico para esta escena:\n{script_segment}"
        shotlist = ""
        async for chunk in self.groq.stream_chat(prompt, self.system_prompt):
            shotlist += chunk
        return shotlist
