import httpx
import hmac
import hashlib
import json
import asyncio
import websockets
from dotenv import load_dotenv
import os
import traceback

# Carrega ambiente para os testes
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))

BASE_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000/ws/test-meeting-uuid"
WEBHOOK_SECRET = os.getenv("ZOOM_WEBHOOK_SECRET_TOKEN")

async def test_oauth_login():
    """Testa se o endpoint de login redireciona corretamente para o Zoom."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/auth/login", follow_redirects=False)
        assert response.status_code == 307
        assert "zoom.us/oauth/authorize" in response.headers["location"]
        print("✅ OAuth Login: Redirecionamento correto.")

async def test_webhook_validation():
    """Testa o desafio de validação de URL do Webhook do Zoom."""
    plain_token = "test-token-123"
    payload = {
        "event": "endpoint.url_validation",
        "payload": {"plainToken": plain_token}
    }
    
    timestamp = str(int(asyncio.get_event_loop().time()))
    message = f"v0:{timestamp}:{json.dumps(payload, separators=(',', ':'))}"
    
    hash_object = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    )
    signature = f"v0={hash_object.hexdigest()}"
    
    headers = {
        "x-zm-signature": signature,
        "x-zm-request-timestamp": timestamp,
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BASE_URL}/api/webhooks", json=payload, headers=headers)
        if response.status_code != 200:
            print(f"❌ Webhook Error: {response.status_code} - {response.text}")
        assert response.status_code == 200
        data = response.json()
        assert data["plainToken"] == plain_token
        print("✅ Webhook: Validação de URL funcionando.")

async def test_websocket_sync():
    """Testa a sincronização bidirecional via WebSocket."""
    async with websockets.connect(WS_URL) as websocket:
        start_msg = {
            "action": "start",
            "payload": {"phase": "Fase 1", "time_elapsed": 5000}
        }
        await websocket.send(json.dumps(start_msg))
        
        response = await websocket.recv()
        data = json.loads(response)
        assert data["action"] == "start"
        print("✅ WebSocket: Ação de START sincronizada.")

        sync_req = {"action": "request_sync", "payload": {}}
        await websocket.send(json.dumps(sync_req))
        
        response = await websocket.recv()
        data = json.loads(response)
        assert data["action"] == "sync_state"
        print("✅ WebSocket: Sincronização de estado (Delta Sync) funcionando.")

async def run_all_tests():
    print("🚀 Iniciando Testes de Integração SPH_Partilhas...\n")
    try:
        await test_oauth_login()
        await test_webhook_validation()
        await test_websocket_sync()
        print("\n🏆 Todos os testes de integração passaram com sucesso!")
    except Exception as e:
        print(f"\n❌ Falha nos testes: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run_all_tests())
