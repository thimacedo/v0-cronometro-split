from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import time
import json
import os
import base64
import httpx
from dotenv import load_dotenv

# Importações internas do projeto SPH_Partilhas
from app.core.logger import setup_logger
from app.core.database import db_manager
from app.api import auth, webhooks

# 🔷 CORREÇÃO: Caminho do .env
env_path = os.path.join(os.path.dirname(__file__), "../../../.env")
load_dotenv(dotenv_path=env_path)

logger = setup_logger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meeting_id: str):
        try:
            await websocket.accept()
            if meeting_id not in self.active_connections:
                self.active_connections[meeting_id] = []
            self.active_connections[meeting_id].append(websocket)
            logger.info(f"🔷 WebSocket: Cliente {meeting_id} conectado.")
        except Exception as e:
            logger.error(f"🔷 Erro ao conectar WebSocket {meeting_id}: {str(e)}")

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
                    logger.error(f"🔷 Falha no broadcast {meeting_id}: {str(e)}")

manager = ConnectionManager()

def create_app() -> FastAPI:
    app = FastAPI(title="SPH_Partilhas Backend", version="1.6.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        logger.info(f"🔷 Request: {request.method} {request.url}")
        return await call_next(request)

    # 🔷 CORREÇÃO DO LOOP: A rota raiz agora serve uma página simples de status ou proxy
    @app.get("/")
    async def root(request: Request):
        return HTMLResponse(content="""
            <html>
                <body style="background: #020617; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                    <div style="text-align: center; border: 1px solid #1e293b; padding: 2rem; border-radius: 1rem; background: #0f172a;">
                        <h1 style="color: #818cf8;">SPH Partilhas - Backend Ready</h1>
                        <p style="color: #64748b;">O backend está ativo e o túnel ngrok está operando.</p>
                        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 1rem 0;">
                        <a href="/api/auth/login" style="color: #fb7185; text-decoration: none; font-weight: bold;">[ CLIQUE AQUI PARA TESTAR LOGIN ]</a>
                    </div>
                </body>
            </html>
        """)

    @app.get("/health")
    async def health():
        return {"status": "healthy", "timestamp": time.time()}

    @app.get("/api/auth/login")
    async def auth_login():
        client_id = os.getenv("ZOOM_CLIENT_ID")
        redirect_uri = os.getenv("ZOOM_REDIRECT_URL")
        zoom_url = f"https://zoom.us/oauth/authorize?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}"
        return RedirectResponse(url=zoom_url)

    @app.get("/api/auth/callback")
    async def auth_callback(code: str):
        client_id = os.getenv("ZOOM_CLIENT_ID")
        client_secret = os.getenv("ZOOM_CLIENT_SECRET")
        redirect_uri = os.getenv("ZOOM_REDIRECT_URL")
        auth_header = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
        headers = {"Authorization": f"Basic {auth_header}", "Content-Type": "application/x-www-form-urlencoded"}
        data = {"grant_type": "authorization_code", "code": code, "redirect_uri": redirect_uri}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post("https://zoom.us/oauth/token", headers=headers, data=data)
                if response.status_code == 200:
                    return {"status": "success", "data": response.json()}
                raise HTTPException(status_code=response.status_code, detail=response.text)
        except Exception as e:
            logger.error(f"🔷 OAuth Error: {str(e)}")
            raise HTTPException(status_code=500, detail="Erro no fluxo OAuth.")

    @app.websocket("/ws/{meeting_id}")
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
                    await db_manager.save_timer_state(meeting_id=meeting_id, phase=str(payload.get("phase", "Fase 1")), time_elapsed=int(payload.get("time_elapsed", 0)), is_running=is_running)
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
                        sync_msg = {"action": "sync_state", "timestamp": server_now, "payload": {"is_running": state.get("is_running", False), "phase": state.get("phase", "Fase 1"), "time_elapsed": current_time}}
                    else:
                        sync_msg = {"action": "sync_state", "timestamp": server_now, "payload": {"is_running": False, "phase": "Fase 1", "time_elapsed": 0}}
                    await websocket.send_text(json.dumps(sync_msg))

        except WebSocketDisconnect:
            manager.disconnect(websocket, meeting_id)
        except Exception as e:
            logger.error(f"🔷 WebSocket Error {meeting_id}: {str(e)}")
            manager.disconnect(websocket, meeting_id)

    app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
