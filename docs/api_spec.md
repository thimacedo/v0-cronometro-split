# Especificação da API (API Spec) - SPH_Partilhas

## Visão Geral
Esta especificação detalha os endpoints RESTful e as interfaces de comunicação WebSocket para o backend FastAPI do aplicativo de cronómetro sincronizado no Zoom.

## 1. Endpoints REST (HTTP)

### 1.1. Receção de Webhooks do Zoom
Endpoint responsável por processar eventos assíncronos enviados pela plataforma Zoom e realizar a validação de URL do Marketplace.

**URL:** `/webhook`
**Método:** `POST`
**Autenticação:** Validação de assinatura HMAC SHA-256 (Zoom Secret Token).

#### Cabeçalhos da Requisição (Headers)
| Nome | Tipo | Descrição | Obrigatório |
| :--- | :--- | :--- | :--- |
| `x-zm-signature` | `string` | Assinatura HMAC SHA-256 gerada pelo Zoom. | Sim |
| `x-zm-request-timestamp` | `string` | Timestamp da requisição para prevenção de ataques de repetição. | Sim |

#### Corpo da Requisição (JSON)
```json
{
  "event": "string",
  "event_ts": "integer",
  "payload": {
    "plainToken": "string", 
    "object": "object"
  }
}
```

#### Respostas (HTTP Status Codes)
* **200 OK:** Evento recebido e processado com sucesso. Para validação de URL, retorna o JSON com o `encryptedToken`.
* **401 Unauthorized:** Falha na validação da assinatura criptográfica do cabeçalho `x-zm-signature`.
* **500 Internal Server Error:** Falha de processamento interno (registada no ficheiro de log local).

---

## 2. Interface WebSocket (Sincronização em Tempo Real)

### 2.1. Conexão da Sala de Reunião
Estabelece uma ligação persistente para difusão (broadcast) bidirecional dos estados do cronómetro entre todos os participantes da mesma reunião.

**URL:** `/ws/{meeting_id}`
**Protocolo:** `ws://`

#### Parâmetros de Rota (Path Parameters)
| Nome | Tipo | Descrição | Obrigatório |
| :--- | :--- | :--- | :--- |
| `meeting_id` | `string` | O identificador único da reunião (Meeting UUID) obtido no frontend via `zoomSdk.getMeetingContext()`. | Sim |

### 2.2. Eventos e Estrutura de Mensagens (JSON)
Todas as mensagens trafegadas pelo canal WebSocket devem respeitar uma estrutura padronizada.

#### 2.2.1. Payload Base
```json
{
  "action": "string",
  "timestamp": "float",
  "payload": "object"
}
```

#### 2.2.2. Ações Suportadas

**A. Iniciar / Retomar Cronómetro**
```json
{
  "action": "start",
  "timestamp": 1713631456.123,
  "payload": {
    "phase": 1,
    "time_elapsed": 0
  }
}
```

**B. Pausar Cronómetro**
```json
{
  "action": "pause",
  "timestamp": 1713631500.456,
  "payload": {
    "phase": 1,
    "time_elapsed": 44333
  }
}
```

**C. Reiniciar Cronómetro (Reset)**
```json
{
  "action": "reset",
  "timestamp": 1713631600.000,
  "payload": {}
}
```

**D. Solicitação de Sincronização de Estado**
```json
{
  "action": "request_sync",
  "timestamp": 1713631650.000,
  "payload": {}
}
```

**E. Resposta de Sincronização de Estado**
```json
{
  "action": "sync_state",
  "timestamp": 1713631650.100,
  "payload": {
    "is_running": true,
    "current_phase": 1,
    "time_elapsed": 12500,
    "last_update_timestamp": 1713631637.500
  }
}
```
