---
name: zoom-app-specialist
description: Especialista em desenvolvimento, configuração e submissão de aplicativos no Zoom App Marketplace. Use quando precisar configurar o Zoom App SDK, fluxos OAuth 2.0, permissões de rede (CORS/HTTPS) ou preparar o aplicativo para a revisão oficial de segurança do Zoom.
---

# Zoom App Specialist

Esta skill transforma o Gemini CLI em um consultor sênior para o ecossistema Zoom Workplace, garantindo que o seu aplicativo seja tecnicamente sólido e esteja em conformidade com os requisitos do Marketplace.

## 🚀 Fluxo de Inicialização de Projeto

Ao iniciar um novo Zoom App, siga esta sequência:
1. **Definição de Contexto:** Identifique se o app rodará em Reuniões (In-Meeting), Webinars ou no Cliente Principal (Main Client).
2. **Seleção de Scopes:** Escolha apenas os escopos estritamente necessários (ex: `zoomapp:inmeeting`) para evitar rejeição na revisão de segurança.
3. **Template de Infraestrutura:** Use Next.js (Frontend) e FastAPI/Node.js (Backend) com suporte nativo a HTTPS.

## 🔐 Configuração do SDK e OAuth

### Inicialização do SDK (Frontend)
Todo app Zoom deve inicializar o SDK corretamente para ganhar acesso às APIs nativas:
```typescript
import zoomSdk from '@zoom/appsdk';

async function configureZoom() {
  const config = await zoomSdk.config({
    capabilities: [
      'getMeetingContext', 
      'onMeeting', 
      'sendAppEvent' // Adicione as capacidades necessárias aqui
    ],
  });
  return config;
}
```

### Segurança de Rede (CORS e Headers)
O Zoom exige cabeçalhos de segurança rigorosos na Home URL. Configure sua resposta HTTP com:
- `Content-Security-Policy`: Deve permitir domínios do Zoom (`*.zoom.us`).
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (HSTS)

## 🛠️ Checklist de Submissão no Marketplace

Antes de solicitar a revisão, audite o projeto:
1. **HTTPS em Tudo:** Verifique se todas as URLs de Redirect e Home utilizam HTTPS.
2. **Domain Allow List:** Garanta que todos os domínios de API e assets estejam listados no painel do desenvolvedor Zoom.
3. **Política de Privacidade:** O arquivo `docs/privacy_policy.md` deve estar atualizado e acessível via URL pública.
4. **OAuth Strict Mode:** Habilite o modo restrito no painel do Zoom para evitar ataques de redirecionamento.

## 🧩 Troubleshooting Comum

- **Erro de Inicialização do SDK:** Verifique se o `zoomSdk.config()` está sendo chamado imediatamente após o carregamento da página.
- **WebSocket Desconectando:** Em dispositivos móveis, o Zoom pode suspender conexões inativas. Implemente um `heartbeat` ou `reconnect` automático.
- **Permissão Negada:** Verifique se a capacidade (capability) está listada tanto no código quanto no painel de permissões do Marketplace.
