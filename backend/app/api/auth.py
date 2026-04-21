from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
import httpx
from app.core.config import get_settings, Settings
from app.core.logger import setup_logger

# Configuração do logger e router para autenticação
logger = setup_logger(__name__)
router = APIRouter()

@router.get("/login")
async def login(settings: Settings = Depends(get_settings)):
    """Inicia o fluxo de autorização do Zoom redirecionando o usuário.

    Args:
        settings (Settings): Configurações globais injetadas.

    Returns:
        RedirectResponse: Redirecionamento para o endpoint OAuth do Zoom.
    """
    zoom_auth_url = (
        f"https://zoom.us/oauth/authorize?response_type=code"
        f"&client_id={settings.ZOOM_CLIENT_ID}"
        f"&redirect_uri={settings.ZOOM_REDIRECT_URL}"
    )
    logger.info("Iniciando fluxo de autorização Zoom.")
    return RedirectResponse(url=zoom_auth_url)

@router.get("/callback")
async def callback(code: str, settings: Settings = Depends(get_settings)):
    """Lida com a resposta do Zoom após o consentimento do usuário.

    Args:
        code (str): Código de autorização retornado pelo Zoom.
        settings (Settings): Configurações globais injetadas.

    Returns:
        dict: Resposta de sucesso ou dados do token.

    Raises:
        HTTPException: Em caso de falha na troca do código por token.
    """
    token_url = "https://zoom.us/oauth/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.ZOOM_REDIRECT_URL
    }
    
    auth = (settings.ZOOM_CLIENT_ID, settings.ZOOM_CLIENT_SECRET)
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data, auth=auth)
            
            if response.status_code != 200:
                logger.error(f"Falha ao trocar código por token Zoom: {response.text}")
                raise HTTPException(status_code=400, detail="Erro na autenticação com Zoom.")
            
            token_data = response.json()
            logger.info("Token Zoom obtido com sucesso.")
            # Aqui, futuramente, salvaremos o token no banco de dados
            return {
                "message": "Autenticação concluída com sucesso!",
                "access_token": token_data.get("access_token"),
                "refresh_token": token_data.get("refresh_token")
            }
    except Exception as e:
        logger.error(f"Erro inesperado no callback OAuth: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno no servidor de autenticação.")
