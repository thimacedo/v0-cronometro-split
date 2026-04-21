import httpx
import time
from typing import Optional, Dict, Any
from app.core.config import get_settings
from app.core.logger import setup_logger

# Inicialização do logger para operações de banco de dados no SPH_Partilhas
logger = setup_logger(__name__)

class SupabaseManager:
    """🔷 Gerencia a persistência de dados do SPH_Partilhas (Timer State & OAuth).

    Utiliza a API REST do Supabase com fallback para memória local caso a URL não esteja configurada.
    """

    def __init__(self):
        settings = get_settings()
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        self.error_log_path = r'E:\Projetos\zoom-app\error.log'
        
        # Fallback de persistência em memória para sessões ativas
        self.memory_db: Dict[str, Dict[str, Any]] = {}

    async def save_timer_state(self, meeting_id: str, phase: str, time_elapsed: int, is_running: bool) -> bool:
        """🔷 Guarda o estado do cronómetro com precisão de milissegundos."""
        server_ts = time.time()
        
        payload = {
            "meeting_id": meeting_id,
            "phase": phase,
            "time_elapsed": time_elapsed,
            "is_running": is_running,
            "last_update_timestamp": server_ts
        }

        # 1. Tenta persistência em Memória (Garante funcionamento imediato)
        self.memory_db[meeting_id] = payload
        logger.info(f"🔷 Estado sincronizado em MEMÓRIA para {meeting_id}")

        # 2. Tenta persistência no Supabase se configurado
        if self.url and "your_supabase_url" not in self.url:
            endpoint = f"{self.url}/rest/v1/timer_states"
            params = {"on_conflict": "meeting_id"}
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(endpoint, json={**payload, "updated_at": "now()"}, headers=self.headers, params=params)
                    if response.status_code in [200, 201]:
                        logger.info(f"🔷 Estado persistido no Supabase para {meeting_id}")
                        return True
            except Exception as e:
                self._log_error(f"Supabase Error: {str(e)}")
        
        return True

    async def get_timer_state(self, meeting_id: str) -> Optional[Dict[str, Any]]:
        """🔷 Recupera o estado persistido (Memória -> Supabase)."""
        # 1. Tenta Memória
        if meeting_id in self.memory_db:
            logger.info(f"🔷 Estado recuperado da MEMÓRIA para {meeting_id}")
            return self.memory_db[meeting_id]

        # 2. Tenta Supabase
        if self.url and "your_supabase_url" not in self.url:
            endpoint = f"{self.url}/rest/v1/timer_states"
            params = {"meeting_id": f"eq.{meeting_id}", "select": "*"}
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(endpoint, headers=self.headers, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        if data:
                            self.memory_db[meeting_id] = data[0] # Alimenta a memória
                            return data[0]
            except Exception as e:
                self._log_error(f"Supabase Fetch Error: {str(e)}")
        
        return None

    def _log_error(self, message: str):
        """🔷 Regista erros críticos no error.log local."""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        try:
            with open(self.error_log_path, 'a', encoding='utf-8') as f:
                f.write(f"{timestamp} - DATABASE_ERROR - {message}\n")
        except Exception as log_err:
            logger.critical(f"🔷 Falha ao escrever no log: {str(log_err)}")

# Instância Singleton do SPH_Partilhas
db_manager = SupabaseManager()
