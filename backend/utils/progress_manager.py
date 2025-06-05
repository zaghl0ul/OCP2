import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ProgressManager:
    """Manage WebSocket connections and send progress updates."""

    def __init__(self):
        self.connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, project_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections.setdefault(project_id, []).append(websocket)
        logger.info(f"WebSocket connected for project {project_id}")

    def disconnect(self, project_id: str, websocket: WebSocket):
        websockets = self.connections.get(project_id)
        if websockets and websocket in websockets:
            websockets.remove(websocket)
            logger.info(f"WebSocket disconnected for project {project_id}")

    async def send_progress(self, project_id: str, event: str, progress: int):
        """Send a progress update to all sockets for a project."""
        websockets = self.connections.get(project_id, [])
        data = {"event": event, "progress": progress}
        for ws in list(websockets):
            try:
                await ws.send_json(data)
            except Exception as e:
                logger.error(f"Failed to send progress to {project_id}: {e}")
                try:
                    await ws.close()
                except Exception:
                    pass
                self.disconnect(project_id, ws)
