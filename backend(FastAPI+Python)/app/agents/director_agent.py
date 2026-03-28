from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from app.agents.script_agent import ScriptAgent
from app.agents.dp_agent import DPAgent
from app.services.fountain_parser import parser
from app.services.database_service import db_service

class AgentState(TypedDict):
    """Estado compartido de la orquestación multi-agente."""
    idea: str
    script: str
    parsed_script: List[Dict[str, Any]]
    shotlist: str
    feasibility_score: float
    feedback: str
    iterations: int
    previous_context: str

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
             # Inyectar contexto previo si existe para coherencia narrativa
             idea_with_context = state["idea"]
             if state.get("previous_context"):
                 idea_with_context = f"CONTEXTO PREVIO (Escenas anteriores):\n{state['previous_context']}\n\nNUEVA IDEA:\n{state['idea']}"
             script = await self.script_agent.generate_script(idea_with_context)
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

    async def run_stream(self, idea, project_id=None, owner_id="00000000-0000-0000-0000-000000000000"):
        """
        Orquesta la producción completa y emite eventos por SSE.
        """
        from app.services.event_manager import event_manager
        
        # 1. Recuperar contexto o crear proyecto
        previous_script = ""
        if project_id:
            last_scene = db_service.get_last_scene(project_id)
            if last_scene:
                previous_script = last_scene.get("script_fountain", "")
        else:
            # Asegurar perfil de sistema si se usa el default
            if owner_id == "00000000-0000-0000-0000-000000000000":
                db_service.ensure_system_profile()
                
            project_id = db_service.create_project(
                name=f"Production: {idea[:30]}...",
                description=f"AI orchestrated production for: {idea}",
                owner_id=owner_id
            )

        graph = self.build_graph()
        initial_state = {
            "idea": idea,
            "script": "",
            "parsed_script": [],
            "shotlist": "",
            "feasibility_score": 0.0,
            "feedback": "",
            "iterations": 0,
            "previous_context": previous_script
        }

        yield event_manager.format_sse({"agent": "Director Agent", "message": "Starting production orchestration..."}, event="log")

        final_output = initial_state
        async for update in graph.astream(initial_state, stream_mode="updates"):
            for node_name, output in update.items():
                final_output.update(output)
                
                # Mapeo de nombres de nodos a mensajes amigables
                messages = {
                    "writer": "Script Agent is drafting the screenplay...",
                    "dp": "DP Agent is planning the visual language and shot list...",
                    "critic": "Critic Agent is performing a feasibility audit...",
                    "parser": "Script Parser is structuring the scene data..."
                }
                
                msg = messages.get(node_name, f"Node {node_name} complete.")
                # Si el nodo es el Critic, enviar el feedback real si existe
                if node_name == "critic" and output.get("feedback"):
                    msg = output["feedback"]
                
                yield event_manager.format_sse({"agent": node_name.capitalize() + " Agent", "message": msg}, event="log")
                
                # PERSISTENCIA: Loguear acción en BD
                if project_id:
                    db_service.log_agent_action(
                        project_id=project_id,
                        agent_name=node_name.capitalize() + "Agent",
                        payload={"output_snippet": str(output)[:200]},
                        feasibility_score=output.get("feasibility_score")
                    )

                # Si es el nodo final (parser), enviamos el resultado completo y guardamos escena
                if node_name == "parser":
                    # 2. Guardar escena final en BD
                    if project_id:
                        db_service.create_scene(
                            project_id=project_id,
                            title="Scene 1 (AI Generated)",
                            order=1,
                            script_fountain=final_output.get("script", "")
                        )

                    yield event_manager.format_sse({
                        "status": "complete",
                        "data": {
                            "script": final_output.get("script", ""),
                            "parsed_script": final_output.get("parsed_script", []),
                            "shotlist": final_output.get("shotlist", ""),
                            "score": final_output.get("feasibility_score", 100)
                        }
                    }, event="result")
