import os
import json
import logging
from typing import TypedDict, Annotated, List, Dict, Any, AsyncGenerator, Optional
from langgraph.graph import StateGraph, END
from app.services.groq_client import GroqClient
from app.services.database_service import db_service

logger = logging.getLogger(__name__)

class MentorState(TypedDict):
    """Estado del Mentor Agent de OpenFang."""
    user_id: str
    role: str # director, writer, dp, editor
    message: str
    history: List[Dict[str, str]]
    response: str
    lesson_id: Optional[str]
    status: str

class MentorAgent:
    """
    OpenFang Mentor Agent.
    Orquesta el feedback educativo usando identidades cinematográficas.
    """
    def __init__(self, role: str = "director"):
        self.role = role
        self.groq = GroqClient()
        self.identities = {
            "director": {
                "name": "Ana García",
                "personality": "Exigente pero inspiradora. Se enfoca en la visión global y la emoción.",
                "system_prompt": "Eres Ana García, Directora Principal en Epic Dreams Studio. Tu objetivo es mentorizar a estudiantes de cine. Sé profesional, apasionada y enfócate en la narrativa visual y el impacto emocional. Usa terminología técnica de dirección."
            },
            "writer": {
                "name": "Marco Solo",
                "personality": "Obsesionado con la estructura y los diálogos. Crítico con los clichés.",
                "system_prompt": "Eres Marco Solo, Guionista Senior. Ayuda a los estudiantes a pulir sus historias. Enfócate en la estructura de tres actos, el desarrollo de personajes y la economía de palabras. No dejes que se conformen con la primera idea."
            },
            "dp": {
                "name": "Elena Luz",
                "personality": "Técnica y detallista. Ve el mundo en términos de luz y composición.",
                "system_prompt": "Eres Elena Luz, Directora de Fotografía. Tu lenguaje es la luz, el color y la óptica. Mentoriza sobre encuadres, iluminación dramática y elección de lentes. Haz que cada plano cuente una historia visual."
            },
            "editor": {
                "name": "Víctor Corte",
                "personality": "Rápido y rítmico. Cree que la película se hace en la sala de montaje.",
                "system_prompt": "Eres Víctor Corte, Editor Jefe. Enseña sobre ritmo, raccord y el 'invisible art' del montaje. Ayuda a los estudiantes a entender cuándo cortar y por qué el ritmo es el latido del cine."
            }
        }

    async def chat_node(self, state: MentorState):
        identity = self.identities.get(state["role"], self.identities["director"])
        
        # Construir prompt con historia
        context = ""
        if state.get("history"):
            context = "Contexto de la conversación:\n"
            for msg in state["history"][-10:]: # Más contexto para mejor calidad
                role_label = "Mentor" if msg["role"] == "assistant" else "Estudiante"
                context += f"{role_label}: {msg['content']}\n"
        
        full_prompt = f"{context}\nEstudiante: {state['message']}\n\n{identity['name']}:"

        try:
            response = await self.groq.fast_completion(
                prompt=full_prompt,
                system_prompt=identity["system_prompt"]
            )
            return {"response": response, "status": "idle"}
        except Exception as e:
            logger.error(f"Error in MentorAgent chat_node: {e}")
            return {"response": "Lo siento, mi conexión con el estudio se ha interrumpido momentáneamente. ¿Podrías repetir eso?", "status": "error"}

    def build_graph(self):
        workflow = StateGraph(MentorState)
        workflow.add_node("chat", self.chat_node)
        workflow.set_entry_point("chat")
        workflow.add_edge("chat", END)
        return workflow.compile()

    async def run_chat(self, user_id: str, message: str, role: str, history: List[Dict[str, str]] = []):
        """Ejecuta una iteración de chat."""
        graph = self.build_graph()
        inputs = {
            "user_id": user_id,
            "role": role,
            "message": message,
            "history": history,
            "status": "thinking"
        }
        result = await graph.ainvoke(inputs)
        return result
