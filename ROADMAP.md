# 🚀 Roadmap & Planejamento — caiOs Platform

Este documento consolida o planejamento tático de evolução técnica, segurança e novas funcionalidades da plataforma **caiOs**.

---

## 📌 Visão Geral dos Próximos Marcos

| Fase | Módulo | Recurso / Funcionalidade | Status |
| :--- | :--- | :--- | :--- |
| **Fase 1** | **Segurança & Auth** | **Implementação de 2FA / TOTP (Google Authenticator/Authy)** | 🟡 **Agendado / Em Roadmap** |
| **Fase 1** | **Segurança & Auth** | Persistência de Sessões no Redis (com revogação remota) | 🟡 Agendado |
| **Fase 1** | **Segurança & Auth** | Rate Limiting e Proteção Brute-Force no Login | 🟡 Agendado |
| **Fase 1** | **Segurança & Auth** | Hashing de Senhas com Argon2id / Bcrypt | 🟡 Agendado |
| **Fase 2** | **Storage & Mídia** | Upload Direto de Arquivos via S3 / Cloudflare R2 Presigned URLs | 🔵 Planejado |
| **Fase 2** | **Inteligência** | Expansão de Fontes OSINT e Geofencing Avançado no Rio de Janeiro | 🔵 Planejado |
| **Fase 3** | **Assistente & IA** | Suporte a Embeddings de Longo Prazo via Vector DB (`pgvector`) | 🟢 Em Avaliação |

---

## 🛡️ Detalhamento: Implementação de TOTP (2FA)

A inclusão da Autenticação Multi-Fator por tempo de uso (**TOTP**) foi adicionada como item prioritário do Roadmap de Segurança para a próxima sprint backend.

### Especificação do Fluxo TOTP:

1. **Setup e Geração de Segredo (`/v1/auth/totp/setup`):**
   - Geração de segredo único base32 por usuário/dispositivo usando biblioteca `otplib`.
   - Emissão de QR Code compatível com Google Authenticator, Authy e 1Password (`otpauth://totp/caiOs:...`).
   - Armazenamento do segredo criptografado no banco de dados.

2. **Validação e Ativação (`/v1/auth/totp/enable`):**
   - Usuário digita o código de 6 dígitos gerado pelo aplicativo.
   - O backend valida a janela de tempo e ativa a flag `totp_enabled: true`.
   - Geração de 8 **códigos de recuperação de emergência** (Recovery Codes) para uso caso o usuário perca o dispositivo.

3. **Desafio de Autenticação no Login (`/v1/auth/login`):**
   - Etapa 1: Validação de Senha + Geofencing Zero-Trust.
   - Etapa 2: Se `totp_enabled == true`, retorna status `202 Accepted` solicitando o `totp_token`.
   - O Cookie final de 6 horas só é gerado e retornado após a validação bem-sucedida do token TOTP de 6 dígitos.

---

## 📅 Histórico de Atualizações do Roadmap
- **2026-08-02:** Inclusão oficial do módulo de **Autenticação TOTP (2FA)** e arquitetura de sessões via **Redis**.
