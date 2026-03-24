import json
from typing import AsyncGenerator

class EventManager:
    """
    Utility for formatting Server-Sent Events (SSE).
    """
    
    @staticmethod
    def format_sse(data: dict, event: str = None) -> str:
        """Formats a dictionary into an SSE message string."""
        msg = f"data: {json.dumps(data)}\n\n"
        if event:
            msg = f"event: {event}\n{msg}"
        return msg

# Global instance
event_manager = EventManager()
