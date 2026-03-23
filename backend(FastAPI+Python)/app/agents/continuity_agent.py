from app.services.groq_client import GroqClient

class ContinuityAgent:
    """
    Agente de Continuidad (Script Supervisor).
    Audita el raccord, la lógica temporal y la coherencia de producción.
    """
    def __init__(self):
        self.groq = GroqClient()
        self.system_prompt = (
            "Eres un Supervisor de Continuidad (Script Supervisor) meticuloso. "
            "Tu misión es detectar errores de raccord, incoherencias temporales "
            "o problemas de lógica narrativa en guiones cinematográficos."
        )

    async def audit_script(self, script: str) -> str:
        """Realiza una auditoría de continuidad sobre el guion."""
        prompt = f"AUDITA ESTE GUION POR ERRORES DE LÓGICA O CONTINUIDAD:\n{script}"
        audit_report = ""
        async for chunk in self.groq.stream_chat(prompt, self.system_prompt):
            audit_report += chunk
        return audit_report
