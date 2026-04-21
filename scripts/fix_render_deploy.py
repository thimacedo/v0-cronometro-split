import httpx
import sys
import os

# Configurações do Render extraídas do ambiente
RENDER_API_KEY = "rnd_0qiHXFiAPhrTNoU82U1TeIazVJ0v"
SERVICE_ID = "srv-d7jrd6hj2pic73f192o0"

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def fix_render_config():
    """🔷 Corrige a configuração do Render para usar Python/FastAPI em vez de Node.js."""
    url = f"https://api.render.com/v1/services/{SERVICE_ID}"
    
    # Payload para forçar o ambiente Python e os comandos corretos
    data = {
        "serviceDetails": {
            "env": "python3",
            "buildCommand": "pip install -r backend/requirements.txt",
            "startCommand": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000"
        }
    }
    
    print(f"🔷 Atualizando serviço {SERVICE_ID} para Python...")
    response = httpx.patch(url, json=data, headers=headers)
    
    if response.status_code == 200:
        print("✅ Configuração atualizada com sucesso!")
        trigger_deploy()
    else:
        print(f"❌ Erro ao atualizar: {response.status_code}")
        print(response.text)

def trigger_deploy():
    """🔷 Dispara um novo deploy com a configuração corrigida."""
    url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys"
    print("🔷 Disparando novo deploy...")
    response = httpx.post(url, headers=headers)
    
    if response.status_code in [200, 201]:
        print("🚀 Deploy disparado! O Backend do SPH Partilhas está sendo reiniciado corretamente.")
    else:
        print(f"❌ Erro ao disparar deploy: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    fix_render_config()
