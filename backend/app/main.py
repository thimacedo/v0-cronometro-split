from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import time
from dotenv import load_dotenv

# Importações de Core e API
from app.core.logger import setup_logger
from app.api import auth, webhooks, websockets

# 🔷 Carregamento de Configurações
env_path = os.path.join(os.path.dirname(__file__), "../../../.env")
load_dotenv(dotenv_path=env_path)

logger = setup_logger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title="SPH_Partilhas Backend", 
        description="Hub unificado para sincronização de cronómetros no Zoom.",
        version="2.0.0"
    )

    # 🛡️ Middlewares de Segurança e CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://v0-cronometro-split.vercel.app",
            "https://v0-cronometro-split.onrender.com",
            "http://localhost:3000"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' https://*.zoom.us; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.zoom.us; connect-src 'self' https://*.zoom.us wss://v0-cronometro-split.onrender.com;"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Frame-Options"] = "ALLOW-FROM https://*.zoom.us"
        return response

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        logger.info(f"🔷 {request.method} {request.url}")
        return await call_next(request)

    # 🔷 Roteamento Modular
    app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
    app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
    app.include_router(websockets.router, tags=["WebSockets"])

    @app.get("/", tags=["Status"])
    async def root():
        return HTMLResponse(content="""
            <html>
                <body style="background: #020617; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                    <div style="text-align: center; border: 1px solid #1e293b; padding: 2rem; border-radius: 1rem; background: #0f172a;">
                        <h1 style="color: #818cf8;">SPH Partilhas - API v2.0</h1>
                        <p style="color: #64748b;">Ambiente de Produção Ativo e Modularizado.</p>
                        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 1rem 0;">
                        <a href="/api/auth/login" style="color: #fb7185; text-decoration: none; font-weight: bold;">[ LOGIN ZOOM ]</a>
                    </div>
                </body>
            </html>
        """)

    @app.get("/health", tags=["Status"])
    async def health():
        return {"status": "healthy", "version": "2.0.0", "timestamp": time.time()}

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
