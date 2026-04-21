from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from app.services.websocket_manager import manager
from app.core.database import db_manager
from app.core.logger import setup_logger
import time

logger = setup_logger(__name__)
router = APIRouter()

@router.websocket("/ws/{meeting_id}")
async def websocket_endpoint(websocket: WebSocket, meeting_id: str):
    await manager.connect(websocket, meeting_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            action = message.get("action")
            payload = message.get("payload", {})
            
            if action in ["start", "pause", "reset"]:
                is_running = (action == "start")
                await db_manager.save_timer_state(
                    meeting_id=meeting_id, 
                    phase=str(payload.get("phase", "Fase 1")), 
                    time_elapsed=int(payload.get("time_elapsed", 0)), 
                    is_running=is_running
                )
                message["payload"]["is_running"] = is_running
                await manager.broadcast(message, meeting_id)

            elif action == "request_sync":
                state = await db_manager.get_timer_state(meeting_id)
                server_now = time.time()
                if state:
                    current_time = state.get("time_elapsed", 0)
                    if state.get("is_running"):
                        delta = (server_now - state.get("last_update_timestamp", server_now)) * 1000
                        current_time += int(delta)
                    sync_msg = {
                        "action": "sync_state", 
                        "timestamp": server_now, 
                        "payload": {
                            "is_running": state.get("is_running", False), 
                            "phase": state.get("phase", "Fase 1"), 
                            "time_elapsed": current_time
                        }
                    }
                else:
                    sync_msg = {
                        "action": "sync_state", 
                        "timestamp": server_now, 
                        "payload": {"is_running": False, "phase": "Fase 1", "time_elapsed": 0}
                    }
                await websocket.send_text(json.dumps(sync_msg))

    except WebSocketDisconnect:
        manager.disconnect(websocket, meeting_id)
    except Exception as e:
        logger.error(f"🔷 Erro no WebSocket {meeting_id}: {str(e)}")
        manager.disconnect(websocket, meeting_id)
