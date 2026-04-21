# 🗺️ ROADMAP.md - zoom-app (SPH_Partilhas)

## 📖 Visão Geral
Aplicativo integrado ao Zoom Marketplace com sincronização via WebSocket e precisão de milissegundos para gerir e compartilhar tempo.

## 📌 Status Atual (v2.0.0)
**Data:** 21 de Abril de 2026
**Fase:** Produção e Modularização (Concluída)
**Resumo:** O projeto foi totalmente refatorado e modularizado. O backend (FastAPI) e o frontend (Next.js) estão 100% sincronizados e online.

### ✅ Melhorias Implementadas:
1.  **Arquitetura Modular (Frontend):**
    *   Criação de Hooks Customizados (`useTimerSocket`) para isolar a lógica de rede.
    *   Criação de Componentes Atômicos (`TimerDisplay`, `TimerControls`, `PhaseSelector`) para maior performance.
2.  **Arquitetura Modular (Backend):**
    *   Divisão em pacotes: `api/` (rotas), `services/` (lógica) e `core/` (infra).
    *   Gestão de WebSockets isolada no `ConnectionManager`.
3.  **Segurança e Infra:**
    *   Cabeçalhos de Segurança (CSP, HSTS, X-Frame) injetados para conformidade Zoom.
    *   Dockerfile otimizado para deploy no Render.
    *   Configuração unificada no GitHub para CI/CD automático.

## 🎯 Próximos Passos
1. [ ] **Monitoramento via Render MCP:** Ativar a extensão no Gemini CLI para acompanhar logs online.
2. [ ] **Testes em Dispositivos Móveis:** Validar a experiência de toque e latência no App Zoom (iOS/Android).
3. [ ] **Submissão Marketplace:** Preencher o questionário técnico do Zoom com base nos novos cabeçalhos de segurança.

## 🛠️ Configurações de Produção
- **Frontend:** `https://v0-cronometro-split.vercel.app` (Vercel)
- **Backend:** `https://v0-cronometro-split.onrender.com` (Render)
- **Repo:** `thimacedo/v0-cronometro-split`

## 🧩 Stack de Desenvolvimento
- **Motor Local:** Qwen Local Hub (1.5B via Ollama)
- **Especialistas:** Zoom App Specialist Skill & Testing Skill
