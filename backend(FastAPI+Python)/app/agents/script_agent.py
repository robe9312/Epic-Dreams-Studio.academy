from app.services.groq_client import GroqClient

class ScriptAgent:
    """
    Agente especializado en guion cinematográfico (Scriptwriting).
    Transforma ideas crudas en formato Fountain profesional.
    """
    def __init__(self):
        self.groq = GroqClient()
        self.system_prompt = (
            "Eres un Guionista Ganador del Oscar especializado en formato Fountain. "
            "Tu objetivo es transformar descripciones de escenas en guiones literarios "
            "estructurados con encabezados (INT/EXT), personajes, diálogos y acotaciones. "
            "Responde ÚNICAMENTE con el contenido del guion en formato Fountain."
        )

    async def generate_script(self, idea: str) -> str:
        """Genera un guion basado en una idea o premisa."""
        prompt = f"Transforma esta idea en un guion Fountain: {idea}"
        script = ""
        async for chunk in self.groq.stream_chat(prompt, self.system_prompt):
            script += chunk
        return script

    async def refined_script(self, original_script: str, feedback: str) -> str:
        """Refina un guion existente basado en feedback del DirectorAgent."""
        prompt = (
            f"REFINA ESTE GUION:\n{original_script}\n\n"
            f"FEEDBACK PARA MEJORAR:\n{feedback}\n\n"
            "Devuelve la versión mejorada en formato Fountain."
        )
        refined = ""
        async for chunk in self.groq.stream_chat(prompt, self.system_prompt):
            refined += chunk
        return refined
