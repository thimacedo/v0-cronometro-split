# Política de Privacidade - SPH Partilhas (Zoom App)
**Última Atualização: 21 de Abril de 2026**

## 1. Introdução
O **SPH Partilhas** ("nós", "nosso" ou "o App") é uma aplicação de cronômetro sincronizado desenvolvida exclusivamente para a plataforma Zoom. Estamos comprometidos em proteger a privacidade e a segurança dos usuários que utilizam nosso serviço durante reuniões.

## 2. Dados que Coletamos
Para fornecer as funcionalidades de sincronização em tempo real, coletamos apenas os dados estritamente necessários através das APIs oficiais do Zoom:
*   **Contexto da Reunião (Meeting UUID):** Um identificador único e anônimo da reunião, utilizado para criar "salas" virtuais de sincronização via WebSockets.
*   **Tokens de Autenticação (OAuth):** Tokens de acesso e atualização necessários para validar a instalação do App e garantir que apenas usuários autorizados acessem o serviço.
*   **Ações do Usuário:** Registros técnicos básicos de interações com o cronômetro (clicar em Iniciar, Pausar ou Reiniciar) para manter todos os participantes sincronizados.

**Nota Crítica de Privacidade:** O SPH Partilhas **NÃO** acessa, processa ou armazena áudio, vídeo, conteúdo de chat, transcrições, listas de participantes ou qualquer dado de identificação pessoal (PII) além do estritamente autorizado via escopos OAuth.

## 3. Como Utilizamos os Dados
Os dados coletados são utilizados exclusivamente para:
*   Manter o estado do cronômetro idêntico para todos os participantes de uma mesma reunião.
*   Autenticar o acesso e garantir a conformidade com os termos de uso do Zoom Marketplace.

## 4. Retenção e Exclusão de Dados
*   **Retenção:** Os identificadores de reunião (Meeting UUID) e estados de cronômetro são mantidos apenas durante a sessão ativa e excluídos automaticamente após 24 horas do encerramento da reunião.
*   **Desinstalação:** Quando você desinstala o App através do Zoom Marketplace, recebemos uma notificação oficial (webhook de deautenticação) que remove imediatamente todos os tokens associados à sua conta de nossa base de dados.

## 5. Segurança da Informação
*   **Em Trânsito:** Todos os dados trafegam através de conexões criptografadas de última geração (HTTPS e WSS com TLS 1.2+).
*   **Em Repouso:** Os tokens e metadados técnicos são armazenados em infraestrutura segura e isolada (Supabase/PostgreSQL), com acesso restrito e monitoramento contínuo.

## 6. Compartilhamento com Terceiros
Nós **não** vendemos, trocamos ou compartilhamos dados de usuários do Zoom com terceiros para fins de marketing ou qualquer outro propósito comercial. O compartilhamento ocorre apenas com provedores de infraestrutura técnica essencial (como serviços de hospedagem e banco de dados) sob rigorosos termos de confidencialidade.

## 7. Conformidade com o Zoom Marketplace
Esta política foi escrita em conformidade com as diretrizes de privacidade da Zoom Video Communications, Inc. e destina-se a garantir a total transparência sobre o fluxo de dados no ecossistema Zoom Workplace.

## 8. Contato
Para dúvidas sobre privacidade ou solicitações de remoção de dados, entre em contato através do e-mail de suporte configurado no seu painel de desenvolvedor.
