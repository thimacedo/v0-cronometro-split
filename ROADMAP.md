# 🗺️ ROADMAP.md - zoom-app (SPH_Partilhas)

## 📖 Visão Geral
Aplicativo integrado ao Zoom Marketplace com sincronização via WebSocket e precisão de milissegundos para gerir e compartilhar tempo.

## 📌 Status Atual (v2.2.1)
**Data:** 21 de Abril de 2026
**Fase:** Testes Beta e Configuração de Surface (Ativa)
**Resumo:** O sistema está online. Foco atual em ajustar a visibilidade no cliente Zoom para evitar o modo restrito "Jogar Juntos" e garantir abertura na Sidebar.

### ✅ Melhorias Recentes:
1.  **Capabilities Expanded:** Adicionado `getSupportedContexts` e `onConnect` no SDK.
2.  **Modularização:** Frontend e Backend 100% isolados e performáticos.
3.  **Security Headers:** CSP e HSTS ativos para produção.

## 🚀 Como Testar o App (Modo Desenvolvedor)
1.  **Instalação:** Use o "Installation URL" na aba *Activation* do Zoom Marketplace Dashboard.
2.  **Abertura Normal:** No Zoom Desktop, vá em `Apps` -> `My Apps` -> `Installed Apps` -> `SPH Partilhas`.
3.  **Mobile:** Abra o link de instalação no navegador do seu celular e o Zoom Mobile abrirá o App automaticamente.

## 🎯 Próximos Passos
1. [ ] **Ajuste de Surface:** Marcar "App Sidebar" no painel do Zoom para habilitar o modo de visualização padrão.
2. [ ] **Validação de OAuth:** Testar o login em uma conta Zoom diferente da conta desenvolvedora (Requer *Preview URL*).
3. [ ] **Prints e Docs:** Gerar as imagens necessárias para a submissão final.

## 🛠️ Stack de Monitoramento
- **Código:** GitHub | **Backend:** Render | **Frontend:** Vercel

## 🧩 Stack de Desenvolvimento
- **Motor Local:** Qwen Local Hub (1.5B via Ollama)
- **Especialistas:** Zoom App Specialist & Testing Skill
