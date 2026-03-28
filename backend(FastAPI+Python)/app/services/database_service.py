# backend/app/services/database_service.py
import os
import logging
from typing import Dict, Any, Optional, List
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

    def get_last_scene(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene la última escena creada de un proyecto para dar contexto a la IA."""
        try:
            with self.get_session() as session:
                result = session.execute(
                    text("""
                        SELECT id, title, "order", script_fountain, created_at
                        FROM scenes
                        WHERE project_id = :project_id
                        ORDER BY "order" DESC
                        LIMIT 1
                    """),
                    {"project_id": project_id}
                )
                row = result.fetchone()
                return dict(row._mapping) if row else None
        except SQLAlchemyError as e:
            logger.error(f"Error obteniendo última escena: {e}")
            return None

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

    def update_clip(self, clip_id: str, data: Dict[str, Any]) -> bool:
        """Actualiza atributos dinámicos de un clip en Neon."""
        if not data:
            return False
            
        fields = []
        params = {"clip_id": clip_id}
        
        # Mapear nombres entre frontend (camelCase) y backend (snake_case) si es necesario
        mapping = {
            "startTime": "start_time",
            "endTime": "end_time",
            "track": "track",
            "content": "content",
            "order": "order"
        }
        
        for k, v in data.items():
            db_key = mapping.get(k, k)
            if db_key in ["start_time", "end_time", "track", "content", "order"]:
                fields.append(f"\"{db_key}\" = :{db_key}")
                params[db_key] = v
        
        if not fields:
            return False
            
        sql = text(f"UPDATE public.clips SET {', '.join(fields)}, updated_at = NOW() WHERE id = :clip_id")
        
        try:
            with self.get_session() as session:
                session.execute(sql, params)
                session.commit()
                return True
        except Exception as e:
            logger.error(f"Error actualizando clip: {e}")
            return False

    def save_storyboard(self, scene_id: str, image_url: str, prompt: str) -> bool:
        """Guarda un frame de storyboard en Neon."""
        sql = text("INSERT INTO public.storyboards (scene_id, image_url, prompt) VALUES (:scene_id, :image_url, :prompt)")
        try:
            with self.get_session() as session:
                session.execute(sql, {"scene_id": scene_id, "image_url": image_url, "prompt": prompt})
                session.commit()
                return True
        except Exception as e:
            logger.error(f"Error saving storyboard: {e}")
            return False

    def save_soundtrack(self, project_id: str, audio_url: str, description: str, type: str = 'music') -> bool:
        """Guarda un soundtrack en Neon."""
        sql = text("INSERT INTO public.soundtracks (project_id, audio_url, description, type) VALUES (:project_id, :audio_url, :description, :type)")
        try:
            with self.get_session() as session:
                session.execute(sql, {"project_id": project_id, "audio_url": audio_url, "description": description, "type": type})
                session.commit()
                return True
        except Exception as e:
            logger.error(f"Error saving soundtrack: {e}")
            return False

    def get_project_assets(self, project_id: str) -> Dict[str, Any]:
        """Recupera todos los assets (storyboards y soundtracks) de un proyecto."""
        try:
            with self.get_session() as session:
                # Get storyboards through scenes
                sb_sql = text("""
                    SELECT s.scene_id, s.image_url, s.prompt 
                    FROM public.storyboards s
                    JOIN public.scenes sc ON s.scene_id = sc.id
                    WHERE sc.project_id = :project_id
                """)
                storyboards = session.execute(sb_sql, {"project_id": project_id}).mappings().all()
                
                # Get soundtracks
                st_sql = text("SELECT id, audio_url, description, type FROM public.soundtracks WHERE project_id = :project_id")
                soundtracks = session.execute(st_sql, {"project_id": project_id}).mappings().all()
                
                return {
                    "storyboards": [dict(row) for row in storyboards],
                    "soundtracks": [dict(row) for row in soundtracks]
                }
        except Exception as e:
            logger.error(f"Error getting project assets: {e}")
            return {"storyboards": [], "soundtracks": []}

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
    def ensure_system_profile(self) -> bool:
        """Asegura que el perfil de sistema (zero UUID) existe para acciones automáticas."""
        return self.upsert_profile(
            user_id="00000000-0000-0000-0000-000000000000",
            email="system@epicdreams.studio",
            username="system",
            full_name="Epic Dreams System"
        )

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