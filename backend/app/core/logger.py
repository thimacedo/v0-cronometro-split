import logging
import os
from datetime import datetime

# Definindo o caminho bruto para o log no Windows
LOG_FILE = r'E:\Projetos\zoom-app\error.log'

def setup_logger(name: str) -> logging.Logger:
    """Configura um logger centralizado para captura de erros e atividades.

    Args:
        name (str): Nome do módulo que está gerando o log.

    Returns:
        logging.Logger: Objeto logger configurado com handlers de arquivo e console.

    Raises:
        OSError: Se houver falha na criação ou acesso ao arquivo de log.
    """
    try:
        logger = logging.getLogger(name)
        logger.setLevel(logging.DEBUG)

        # Formato do Log
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        # Handler para Arquivo (Append mode)
        file_handler = logging.FileHandler(LOG_FILE, encoding='utf-8')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        # Handler para Console
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        return logger
    except Exception as e:
        print(f"CRITICAL ERROR: Falha ao configurar logger: {str(e)}")
        raise
