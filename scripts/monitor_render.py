import httpx
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = "rnd_0qiHXFiAPhrTNoU82U1TeIazVJ0v"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def check_render_services():
    print("\n--- MONITORAMENTO RENDER ---")
    try:
        with httpx.Client() as client:
            response = client.get("https://api.render.com/v1/services", headers=HEADERS)
            if response.status_code == 200:
                services = response.json()
                for s in services:
                    svc = s['service']
                    print(f"Status: [{svc['repo'].split('/')[-1]}] -> {svc['status'].upper()}")
            else:
                print(f"Erro ao acessar API: {response.status_code}")
    except Exception as e:
        print(f"Erro de conexão: {str(e)}")

if __name__ == "__main__":
    check_render_services()
