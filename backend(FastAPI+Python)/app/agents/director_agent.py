from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from app.agents.script_agent import ScriptAgent
from app.agents.dp_agent import DPAgent
from app.services.fountain_parser import parser

class AgentState(TypedDict):
    """Estado compartido de la orquestación multi-agente."""
    idea: str
    script: str
    parsed_script: List[Dict[str, Any]]
    shotlist: str
    feasibility_score: float
    feedback: str
    iterations: int

class DirectorAgent:
    """
    Agente Orquestador (Director).
    Gestiona el flujo CCV (Critique-Correct-Verify) entre especialistas.
    """
    def __init__(self):
        self.script_agent = ScriptAgent()
        self.dp_agent = DPAgent()

    async def write_script_node(self, state: AgentState):
        """Nodo para generar o refinar el guion."""
        if state.get("feedback"):
             script = await self.script_agent.refined_script(state["script"], state["feedback"])
        else:
             script = await self.script_agent.generate_script(state["idea"])
        return {"script": script, "iterations": state.get("iterations", 0) + 1}

    async def plan_cinematography_node(self, state: AgentState):
        """Nodo para que el DP genere el lenguaje visual."""
        shotlist = await self.dp_agent.generate_shotlist(state["script"])
        return {"shotlist": shotlist}

    async def critique_node(self, state: AgentState):
        """Nodo de verificación de viabilidad (The Critique bit)."""
        # Lógica simplificada: Si el guion es muy corto, score bajo
        score = 90.0 if len(state["script"]) > 200 else 60.0
        feedback = ""
        if score < 85:
            feedback = "El guion es demasiado breve o vago. Añade más tensión dramática y detalles visuales."
        
        return {"feasibility_score": score, "feedback": feedback}

    async def parse_script_node(self, state: AgentState):
        """Nodo para estructurar el guion usando el formato Fountain."""
        parsed = parser.parse(state["script"])
        return {"parsed_script": parsed}

    def should_continue(self, state: AgentState):
        """Router: ¿Continuamos refinando o terminamos?"""
        if state["feasibility_score"] >= 85 or state["iterations"] >= 3:
            return "end"
        return "refine"

    def build_graph(self):
        """Construye el grafo de estados de LangGraph."""
        workflow = StateGraph(AgentState)

        # Añadir nodos
        workflow.add_node("writer", self.write_script_node)
        workflow.add_node("dp", self.plan_cinematography_node)
        workflow.add_node("critic", self.critique_node)
        workflow.add_node("parser", self.parse_script_node)

        # Definir bordes
        workflow.set_entry_point("writer")
        workflow.add_edge("writer", "dp")
        workflow.add_edge("dp", "critic")

        # Bordes condicionales
        workflow.add_conditional_edges(
            "critic",
            self.should_continue,
            {
                "refine": "writer",
                "end": "parser"
            }
        )

        workflow.add_edge("parser", END)

        return workflow.compile()
