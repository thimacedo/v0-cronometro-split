from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    """Configurações da aplicação utilizando pydantic-settings para carregamento automático do .env.

    Attributes:
        ZOOM_CLIENT_ID (str): ID do cliente do Zoom App.
        ZOOM_CLIENT_SECRET (str): Segredo do cliente do Zoom App.
        ZOOM_REDIRECT_URL (str): URL de redirecionamento para o fluxo OAuth.
        ZOOM_WEBHOOK_SECRET_TOKEN (str): Token de verificação de Webhooks do Zoom.
        DATABASE_URL (Optional[str]): URL de conexão com o banco de dados.
        SUPABASE_URL (Optional[str]): URL do projeto Supabase.
        SUPABASE_KEY (Optional[str]): Chave anônima/serviço do Supabase.
    """
    ZOOM_CLIENT_ID: str = ""
    ZOOM_CLIENT_SECRET: str = ""
    ZOOM_REDIRECT_URL: str = "http://localhost:8000/api/auth/callback"
    ZOOM_WEBHOOK_SECRET_TOKEN: str = ""
    
    DATABASE_URL: Optional[str] = None
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file="E:\\Projetos\\zoom-app\\.env", extra="ignore")

@lru_cache()
def get_settings() -> Settings:
    """Retorna uma instância Singleton das configurações.

    Returns:
        Settings: Objeto de configurações carregado.
    """
    return Settings()
