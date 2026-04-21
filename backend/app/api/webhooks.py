from fastapi import APIRouter, Request, HTTPException, Header, Depends
import hashlib
import hmac
import json
import time
from app.core.logger import setup_logger
from app.core.config import get_settings, Settings

# Configuração do logger e router para webhooks do projeto SPH_Partilhas
logger = setup_logger(__name__)
router = APIRouter()

@router.post("")
async def handle_zoom_webhook(
    request: Request,
    x_zm_signature: str = Header(None),
    x_zm_request_timestamp: str = Header(None),
    settings: Settings = Depends(get_settings)
):
    """🔷 Processa eventos de Webhook e Validação de URL do Zoom Marketplace.

    Este endpoint realiza a verificação de integridade baseada na assinatura HMAC SHA-256
    fornecida pelo Zoom e responde ao desafio de validação de URL do endpoint.

    Args:
        request (Request): Objeto da requisição.
        x_zm_signature (str): Assinatura recebida (Zoom Secret Token HMAC).
        x_zm_request_timestamp (str): Timestamp para proteção contra Replay Attack.
        settings (Settings): Injeção das configurações (.env).

    Returns:
        dict: JSON com tokens para validação ou status de sucesso para eventos.

    Raises:
        HTTPException: Se a assinatura for inválida (401).
    """
    body_bytes = await request.body()
    try:
        body_json = await request.json()
    except json.JSONDecodeError:
        logger.error("🔷 Erro ao decodificar JSON no Webhook.")
        raise HTTPException(status_code=400, detail="Corpo da requisição inválido.")

    # 1. Validação de Assinatura HMAC (Padrão de Segurança Zoom)
    if not verify_zoom_signature(x_zm_signature, x_zm_request_timestamp, body_bytes, settings.ZOOM_WEBHOOK_SECRET_TOKEN):
        logger.warning(f"🔷 Falha na assinatura: Sig={x_zm_signature}, TS={x_zm_request_timestamp}")
        raise HTTPException(status_code=401, detail="Assinatura de segurança inválida.")

    # 2. Desafio de Validação (URL Validation)
    event = body_json.get("event")
    if event == "endpoint.url_validation":
        plain_token = body_json["payload"]["plainToken"]
        
        # Gerar o encryptedToken esperado pelo Zoom
        hash_object = hmac.new(
            settings.ZOOM_WEBHOOK_SECRET_TOKEN.encode('utf-8'),
            plain_token.encode('utf-8'),
            hashlib.sha256
        )
        encrypted_token = hash_object.hexdigest()
        
        logger.info("🔷 Validação de URL concluída com sucesso.")
        return {
            "plainToken": plain_token,
            "encryptedToken": encrypted_token
        }

    # 3. Processamento de Eventos de Negócio
    logger.info(f"🔷 Evento recebido: {event}")
    
    # Aqui serão adicionadas as lógicas específicas (ex: meeting.started)
    return {"status": "success", "event": event}

def verify_zoom_signature(signature: str, timestamp: str, body: bytes, secret: str) -> bool:
    """🔷 Valida a assinatura HMAC-SHA256 v0 enviada pelo Zoom.

    Args:
        signature (str): Assinatura enviada no Header 'x-zm-signature'.
        timestamp (str): Timestamp enviado no Header 'x-zm-request-timestamp'.
        body (bytes): Corpo bruto da requisição (Raw bytes).
        secret (str): Webhook Secret Token definido no Zoom Marketplace.

    Returns:
        bool: Retorna True se a assinatura for verificada com sucesso.
    """
    if not signature or not timestamp or not secret:
        return False
        
    # Construção da mensagem de verificação: v0:{timestamp}:{body}
    message = f"v0:{timestamp}:{body.decode('utf-8')}"
    
    hash_for_verify = hmac.new(
        secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # O Zoom envia o hash prefixado com 'v0='
    signature_to_verify = f"v0={hash_for_verify}"
    
    return hmac.compare_digest(signature_to_verify, signature)
