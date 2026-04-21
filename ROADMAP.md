# 🗺️ ROADMAP.md - zoom-app (SPH_Partilhas)

## 📖 Visão Geral
Aplicativo integrado ao Zoom Marketplace com sincronização via WebSocket e precisão de milissegundos para gerir e compartilhar tempo.

## 📌 Status Atual (v2.1.0)
**Data:** 21 de Abril de 2026
**Fase:** Infraestrutura e Governança de Segredos (Ativa)
**Resumo:** O sistema está modularizado e online. Iniciamos a integração de ferramentas de monitoramento profissional via MCP (Model Context Protocol).

### ✅ Melhorias Recentes:
1.  **Refatoração v2.0:** Modularização completa de Frontend e Backend.
2.  **Segurança Zoom:** Injeção de headers CSP e HSTS.
3.  **Deploy:** Unificação de repositório e deploy automático (Vercel/Render).

## 🎯 Próximos Passos
1. [ ] **Integração MCP:** Ativar os servidores MCP do Render e Vercel para monitoramento via terminal.
2. [ ] **Gestão de Segredos:** Configurar as variáveis de ambiente de produção (`NEXT_PUBLIC_API_URL`) nos painéis online.
3. [ ] **Limpeza de .env:** Remover chaves obsoletas (`NGROK_URL`) para evitar confusão.

## 🛠️ Infraestrutura de Monitoramento (MCP)
- **Render MCP:** `npx -y @render-oss/render-mcp-server` (Requer `RENDER_API_KEY`)
- **Vercel MCP:** `npx -y @vercel/mcp-server` (Requer `VERCEL_TOKEN`)

## 🔐 Variáveis de Ambiente Críticas
- **Frontend (Vercel):** `ZOOM_CLIENT_ID`, `NEXT_PUBLIC_API_URL`
- **Backend (Render):** `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_REDIRECT_URL`, `SUPABASE_URL`, `SUPABASE_KEY`

## 🧩 Stack de Desenvolvimento
- **Motor Local:** Qwen Local Hub (1.5B via Ollama)
- **Especialistas:** Zoom App Specialist, Testing & Code-Review
