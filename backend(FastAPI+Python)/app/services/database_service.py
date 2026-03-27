# backend/app/services/database_service.py
import os
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

class DatabaseService:
    """
    Servicio para interactuar con la base de datos Neon PostgreSQL.
    Utiliza SQLAlchemy con sesiones síncronas, compatibles con FastAPI.
    """
    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL")
        if not self.db_url:
            logger.warning("DATABASE_URL no configurada. El servicio de BD no estará disponible.")
            self.engine = None
            self.SessionLocal = None
            return

        # Configuración recomendada para Neon: pool de conexiones optimizado
        self.engine = create_engine(
            self.db_url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,  # Verifica conexiones muertas
            echo=False  # Cambia a True para depuración
        )
        self.SessionLocal = sessionmaker(bind=self.engine, autoflush=False, autocommit=False)

    def test_connection(self) -> Dict[str, Any]:
        """Prueba la conexión a la base de datos."""
        if not self.engine:
            return {"status": "error", "message": "Falta DATABASE_URL"}
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT current_database(), version()"))
                row = result.fetchone()
                return {
                    "status": "success",
                    "database": row[0],
                    "version": row[1].split()[0]
                }
        except Exception as e:
            logger.error(f"Error de conexión a BD: {e}")
            return {"status": "error", "message": str(e)}

    def get_session(self) -> Session:
        """Retorna una nueva sesión de BD. El llamante debe cerrarla."""
        if not self.SessionLocal:
            raise RuntimeError("Base de datos no disponible")
        return self.SessionLocal()

    # ==================== MÉTODOS PARA PROYECTOS ====================
    def create_project(self, name: str, description: str, owner_id: str) -> Optional[str]:
        """
        Crea un nuevo proyecto.
        Retorna el UUID del proyecto o None si falla.
        """
        try:
            with self.get_session() as session:
                result = session.execute(
                    text("""
                        INSERT INTO projects (name, description, owner_id)
                        VALUES (:name, :description, :owner_id)
                        RETURNING id
                    """),
                    {"name": name, "description": description, "owner_id": owner_id}
                )
                project_id = result.scalar_one()
                session.commit()
                return str(project_id)
        except SQLAlchemyError as e:
            logger.error(f"Error creando proyecto: {e}")
            return None

    def get_projects_by_owner(self, owner_id: str) -> List[Dict[str, Any]]:
        """Obtiene todos los proyectos de un usuario."""
        try:
            with self.get_session() as session:
                result = session.execute(
                    text("""
                        SELECT id, name, description, created_at, updated_at
                        FROM projects
                        WHERE owner_id = :owner_id
                        ORDER BY created_at DESC
                    """),
                    {"owner_id": owner_id}
                )
                return [dict(row._mapping) for row in result]
        except SQLAlchemyError as e:
            logger.error(f"Error obteniendo proyectos: {e}")
            return []

    # ==================== MÉTODOS PARA ESCENAS ====================
    def create_scene(self, project_id: str, title: str, order: int, script_fountain: str = "") -> Optional[str]:
        """Crea una nueva escena en un proyecto."""
        try:
            with self.get_session() as session:
                result = session.execute(
                    text("""
                        INSERT INTO scenes (project_id, title, "order", script_fountain)
                        VALUES (:project_id, :title, :order, :script_fountain)
                        RETURNING id
                    """),
                    {"project_id": project_id, "title": title, "order": order, "script_fountain": script_fountain}
                )
                scene_id = result.scalar_one()
                session.commit()
                return str(scene_id)
        except SQLAlchemyError as e:
            logger.error(f"Error creando escena: {e}")
            return None

    def get_scenes_by_project(self, project_id: str) -> List[Dict[str, Any]]:
        """Obtiene todas las escenas de un proyecto, ordenadas por 'order'."""
        try:
            with self.get_session() as session:
                result = session.execute(
                    text("""
                        SELECT id, title, "order", script_fountain, created_at
                        FROM scenes
                        WHERE project_id = :project_id
                        ORDER BY "order"
                    """),
                    {"project_id": project_id}
                )
                return [dict(row._mapping) for row in result]
        except SQLAlchemyError as e:
            logger.error(f"Error obteniendo escenas: {e}")
            return []

    # ==================== MÉTODOS PARA CLIPS ====================
    def create_clip(self, scene_id: str, track: str, content: Dict, start_time: float, end_time: float, order: int) -> Optional[str]:
        """Crea un clip en una escena."""
        try:
            with self.get_session() as session:
                result = session.execute(
                    text("""
                        INSERT INTO clips (scene_id, track, content, start_time, end_time, "order")
                        VALUES (:scene_id, :track, :content, :start_time, :end_time, :order)
                        RETURNING id
                    """),
                    {
                        "scene_id": scene_id,
                        "track": track,
                        "content": content,
                        "start_time": start_time,
                        "end_time": end_time,
                        "order": order
                    }
                )
                clip_id = result.scalar_one()
                session.commit()
                return str(clip_id)
        except SQLAlchemyError as e:
            logger.error(f"Error creando clip: {e}")
            return None

    # ==================== MÉTODOS PARA AGENT_LOGS ====================
    def log_agent_action(self, project_id: str, agent_name: str, payload: Dict, feasibility_score: Optional[float] = None) -> bool:
        """Registra una acción de un agente en el ciclo CCV."""
        try:
            with self.get_session() as session:
                session.execute(
                    text("""
                        INSERT INTO agent_logs (project_id, agent_name, payload, feasibility_score)
                        VALUES (:project_id, :agent_name, :payload, :feasibility_score)
                    """),
                    {
                        "project_id": project_id,
                        "agent_name": agent_name,
                        "payload": payload,
                        "feasibility_score": feasibility_score
                    }
                )
                session.commit()
                return True
        except SQLAlchemyError as e:
            logger.error(f"Error registrando log de agente: {e}")
            return False

    # ==================== MÉTODOS PARA PERFILES (si se usa) ====================
    def upsert_profile(self, user_id: str, email: str, username: str, full_name: str) -> bool:
        """Crea o actualiza un perfil basado en el ID de Clerk."""
        try:
            with self.get_session() as session:
                session.execute(
                    text("""
                        INSERT INTO profiles (id, email, username, full_name)
                        VALUES (:id, :email, :username, :full_name)
                        ON CONFLICT (id) DO UPDATE SET 
                            email = EXCLUDED.email,
                            username = COALESCE(EXCLUDED.username, profiles.username),
                            full_name = COALESCE(EXCLUDED.full_name, profiles.full_name)
                    """),
                    {
                        "id": user_id, 
                        "email": email, 
                        "username": username, 
                        "full_name": full_name
                    }
                )
                session.commit()
                return True
        except SQLAlchemyError as e:
            logger.error(f"Error upserting profile: {e}")
            return False

    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene un perfil por su UUID."""
        try:
            with self.get_session() as session:
                result = session.execute(
                    text("SELECT id, email, username, full_name, plan_type, created_at FROM profiles WHERE id = :id"),
                    {"id": user_id}
                )
                row = result.fetchone()
                return dict(row._mapping) if row else None
        except SQLAlchemyError as e:
            logger.error(f"Error obteniendo perfil: {e}")
            return None

# Instancia global para uso en toda la aplicación
db_service = DatabaseService()