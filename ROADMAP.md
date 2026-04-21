# 🗺️ ROADMAP.md - zoom-app (SPH_Partilhas)

## 📖 Visão Geral
Aplicativo integrado ao Zoom Marketplace com sincronização via WebSocket e precisão de milissegundos para gerir e compartilhar tempo.

## 📌 Status Atual
**Data:** 19 de Abril de 2026
**Fase:** Preparação para Submissão e Segurança (Fase 4)
**Resumo:** O frontend e backend estão integrados via OAuth. Os testes de carga validaram a latência e a lógica WebSocket está operante. 

## 🎯 Próximos Passos
1. [ ] Revisar fluxos finais de testes de carga e latência para sincronização extrema (delta correction).
2. [ ] Preparar build final de produção para o Frontend (Next.js) e Backend (FastAPI).
3. [ ] Submeter o app para aprovação no Zoom App Marketplace.

## 🛠️ Instruções de Execução (Como Deve Ser Feito)
- **Gestor:** Gemini (Arquiteto de Software e PM)
- **Programador:** Qwen Local Coder (1.5B/0.5B via Ollama)
- **Regras:**
  - Todo o código deve ser gerado completo, sem abreviações.
  - Aplicar rigorosamente princípios Clean Code, SOLID e KISS.
  - Este `ROADMAP.md` DEVE ser atualizado automaticamente após cada nova funcionalidade implementada.
