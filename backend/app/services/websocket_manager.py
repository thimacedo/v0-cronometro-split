from typing import Dict, List
from fastapi import WebSocket
import time
import json
from app.core.logger import setup_logger

logger = setup_logger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meeting_id: str):
        await websocket.accept()
        if meeting_id not in self.active_connections:
            self.active_connections[meeting_id] = []
        self.active_connections[meeting_id].append(websocket)
        logger.info(f"🔷 WebSocket: Cliente {meeting_id} conectado.")

    def disconnect(self, websocket: WebSocket, meeting_id: str):
        if meeting_id in self.active_connections:
            if websocket in self.active_connections[meeting_id]:
                self.active_connections[meeting_id].remove(websocket)
            if not self.active_connections[meeting_id]:
                del self.active_connections[meeting_id]
        logger.info(f"🔷 WebSocket: Cliente {meeting_id} desconectado.")

    async def broadcast(self, message: dict, meeting_id: str):
        if meeting_id in self.active_connections:
            message["timestamp"] = time.time()
            msg_json = json.dumps(message)
            for connection in self.active_connections[meeting_id]:
                try:
                    await connection.send_text(msg_json)
                except Exception as e:
                    logger.error(f"🔷 Erro no broadcast para {meeting_id}: {str(e)}")

manager = ConnectionManager()
