# Relatório de Auditoria de Segurança Defensiva e Pentest Não Destrutivo
**Alvo:** Qualitec 2.0 (`https://catalogo-tecnico-qualitec.vercel.app/` / Repositório e Infraestrutura Supabase / R2)  
**Data da Auditoria:** 20/08/2026  
**Tipo de Teste:** Caixa-Cinza (Análise de Código-Fonte, Histórico Git e Validação Não Destrutiva em Produção)  
**Classificação:** ESTRITAMENTE CONFIDENCIAL / RELATÓRIO DE SEGURANÇA  

---

## 1. Sumário Executivo e Situação Geral

Esta auditoria de segurança foi realizada de forma **estritamente não destrutiva** e em conformidade com o princípio de prova mínima, analisando o código-fonte, o histórico de versões Git, o schema do Supabase e o comportamento do ambiente de produção hospedado na Vercel.

### 1.1 Quantitativo de Vulnerabilidades por Severidade

```text
=====================================================
SITUAÇÃO GERAL DE SEGURANÇA
=====================================================
CRITICAL : 4  (Exposição de PII, Admin sem Auth, RLS desativado, Registro Admin Público)
HIGH     : 3  (SSRF Proxy Vídeo, Injeção HTML em E-mails, Exposição no Histórico Git)
MEDIUM   : 5  (Mass Assignment, CSP Fraca, Bypass Rate Limit, Upload SVG, Exposição Robots)
LOW      : 3  (Endpoints Duplicados, Código Legado, Issuer TOTP Incorreto)
INFO     : 2  (Dependências vulneráveis registradas no npm audit, Hardening)
-----------------------------------------------------
TOTAL    : 17 Achados Registrados
=====================================================
```

### 1.2 Top 10 Riscos Imediatos (Ordenados por Impacto e Exposição)

1. **SEC-001 [CRITICAL] — Exposição Pública de Dados Pessoais (PII / Leads / Newsletter) via APIs Administrativas:**
   Os endpoints `/api/admin/contacts` e `/api/admin/subscribers` possuem exceção explícita no middleware de autenticação, retornando dados de clientes (nome, e-mail, telefone, empresa, mensagem) em requisições anônimas.
2. **SEC-002 [CRITICAL] — Painel Administrativo `/admin-secreto-x9f2` Acessível sem Autenticação:**
   A rota administrativa não possui guards de autenticação ativos no cliente e no servidor, confiando apenas no segredo da URL (*Security through Obscurity*).
3. **SEC-003 [CRITICAL] — Row Level Security (RLS) Desabilitado nas Tabelas Principais do Supabase:**
   A migração `20260701175717_disable_rls_for_public_tables.sql` desativou o RLS de `products`, `category_assets`, `pdf_settings` e `pdf_templates`, permitindo escrita, alteração e exclusão direta via chave pública `anon`.
4. **SEC-004 [CRITICAL] — Endpoint de Registro de Administrador `/api/auth/register` Aberto Publicamente:**
   Qualquer visitante anônimo pode enviar uma requisição `POST` e criar uma conta de usuário com e-mail confirmado no Supabase (`admin.createUser`).
5. **SEC-005 [HIGH] — SSRF Completo no Endpoint `/api/proxy-video`:**
   O endpoint aceita qualquer URL externa via parâmetro `?url=` e realiza requisição `fetch()` sem validação de domínio, protocolo ou IP de rede interna.
6. **SEC-006 [HIGH] — Injeção de HTML nos Templates de E-mail em `/api/send-email`:**
   Entradas fornecidas pelo usuário em formulários de contato e chat são concatenadas diretamente em tags HTML dos e-mails transacionais enviados via SMTP.
7. **SEC-007 [HIGH] — Exposição de Informações Sensíveis e Pooler URL no Histórico Git:**
   Histórico do repositório contém URLs de pooler PostgreSQL, referências de projeto Supabase e arquivos de auditoria anteriores.
8. **SEC-008 [MEDIUM] — Mass Assignment em Operações de Produtos (`/api/admin/products`):**
   O endpoint aceita o payload HTTP integral do cliente e o envia diretamente para `supabaseAdmin.from('products').insert([body])` ou `.update(payload)` sem whitelist de colunas.
9. **SEC-009 [MEDIUM] — Rate Limiting Ineficaz em Nuvem Serverless e Ausência no Envio de E-mails:**
   O rate limit armazena contadores na memória RAM local do processo Node.js (não compartilhado entre instâncias Vercel) e confia no header `X-Forwarded-For`, além de não proteger `/api/send-email`.
10. **SEC-010 [MEDIUM] — Content Security Policy (CSP) Permissiva (`unsafe-inline` e `unsafe-eval`):**
    O cabeçalho CSP permite execução de scripts inline e avaliação dinâmica de strings no cliente.

---

## 2. Realidade Observada vs Documentação

| Componente / Regra | Documentação (PRD / Arquitetura) | Comportamento Real no Código e Produção | Veredito de Segurança |
| :--- | :--- | :--- | :---: |
| **Painel Administrativo** | "Acessível apenas com login, senha e TOTP" | A rota `/admin-secreto-x9f2` renderiza diretamente no navegador sem exigir login ou sessão. | 🚨 **Divergência Crítica** |
| **APIs Administrativas** | "Protegidas por middleware de auth com cookie HttpOnly" | `/api/admin/contacts` e `/api/admin/subscribers` possuem exceção explícita (`return`) no middleware. | 🚨 **Divergência Crítica** |
| **RLS no Banco de Dados** | "Políticas de segurança ativas no Supabase" | RLS explicitamente **desabilitado** em `products`, `category_assets` e `pdf_settings`. | 🚨 **Divergência Crítica** |
| **Criação de Usuários** | "Acesso restrito à equipe autorizada" | `/api/auth/register` cria usuários confirmados via Service Role Key sem autenticação prévia. | 🚨 **Divergência Crítica** |
| **Proxy de Vídeo** | "Proxy de mídia para vídeos institucionais" | Proxy arbitrário sem whitelist (`proxy-video.ts`), vulnerável a SSRF. | ⚠️ **Divergência Alta** |
| **Armazenamento de Senhas/2FA** | "2FA TOTP obrigatório" | 2FA implementado, porém o painel admin e o banco podem ser manipulados sem passar pelo login. | ⚠️ **Controle Ineficaz** |

---

## 3. Auditoria do Painel Administrativo (`/admin-secreto-x9f2`)

* **Acesso Anônimo:** **CONFIRMADO.** Acessível via browser em sessão anônima limpa (sem cookies).
* **Guards de Rota no Cliente:** O arquivo `app/pages/admin-secreto-x9f2.vue` possui apenas `definePageMeta({ layout: false })`. Não possui `middleware: ['auth']`. O arquivo `middleware/auth.ts` existente na raiz não é executado automaticamente pelo Nuxt devido à configuração `srcDir: 'app'`.
* **Guards no Servidor:** O SSR do Nuxt entrega o HTML e o bundle da página administrativa para qualquer visitante.
* **Comunicação com o Banco:** Ao abrir o painel, a interface invoca diretamente o SDK do Supabase (`useSupabaseClient()`) utilizando a chave pública `anonKey`. Como o RLS está desabilitado, a interface carrega categorias, produtos e configurações sem necessidade de token de autenticação.
* **Classificação do Painel:** **TOTALMENTE PÚBLICO (Segurança baseada unicamente em URL não listada).**

---

## 4. Mapeamento da Superfície de API e Testes Não Destrutivos

Todos os endpoints localizados em `app/server/api/` foram avaliados:

| Método | Endpoint | Acesso Anônimo | Autenticação | Retorna Dados Sensíveis? | Altera Estado? | Status HTTP Testado | Risco |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `GET` | `/api/admin/contacts` | **SIM** | **NÃO (Bypass)** | **SIM (PII / Mensagens)** | Não | `200 OK` | **CRITICAL** |
| `GET` | `/api/admin/subscribers` | **SIM** | **NÃO (Bypass)** | **SIM (E-mails)** | Não | `200 OK` | **CRITICAL** |
| `POST` | `/api/auth/register` | **SIM** | **NÃO** | Cria usuário admin | **SIM** | `404` (em GET) / `POST` aberto | **CRITICAL** |
| `POST` | `/api/auth/login` | SIM | Pública | Emite cookies de sessão | Não | `POST` ativo | **INFO** |
| `GET` | `/api/auth/session` | SIM | Cookie `sb-access-token` | Dados do usuário logado | Não | `401 Unauthorized` | **OK** |
| `POST` | `/api/auth/refresh` | SIM | Cookie `sb-refresh-token` | Novos tokens | Não | `401 / 400` sem cookie | **OK** |
| `POST` | `/api/auth/logout` | SIM | Pública | Limpa cookies | Não | `200 OK` | **OK** |
| `POST` | `/api/auth/totp/setup` | SIM | Senha no payload | Segredo TOTP e QR Code | **SIM** | `400 / 401` sem senha | **MEDIUM** |
| `POST` | `/api/auth/totp.setup` | SIM | Senha no payload | (Duplicata legada) | **SIM** | `400 / 401` sem senha | **LOW** |
| `POST` | `/api/admin/products` | NÃO | Sim (`auth.ts`) | Não | **SIM** | `401 Unauthorized` | **OK** |
| `PUT` | `/api/admin/products` | NÃO | Sim (`auth.ts`) | Não | **SIM** | `401 Unauthorized` | **OK** |
| `DELETE`| `/api/admin/products` | NÃO | Sim (`auth.ts`) | Não | **SIM** | `401 Unauthorized` | **OK** |
| `POST` | `/api/upload-r2` | NÃO | Sim (`auth.ts`) | Não | **SIM** | `401 Unauthorized` | **OK** |
| `POST` | `/api/send-email` | SIM | Pública | Não | **SIM (Envia e-mail e grava DB)**| `400` sem body | **HIGH** |
| `GET` | `/api/proxy-video` | **SIM** | **NÃO** | Proxy de conteúdo web | Não | `200 OK` (com URL externa) | **HIGH** |
| `GET` | `/api/proxy-image` | SIM | Whitelist | Proxy de imagem | Não | `403` fora da whitelist | **OK** |
| `GET` | `/api/product-image` | SIM | Whitelist | Proxy de imagem | Não | `404` para ID inválido | **OK** |
| `GET` | `/api/datasheet` | SIM | Pública | Entrega PDF | Não | `404` para ID inválido | **OK** |
| `GET` | `/api/font` | SIM | Regex TTF | Entrega fonte | Não | `400` para nome fora da regex | **OK** |

---

## 5. Auditoria de Banco de Dados e Row Level Security (RLS)

### 5.1 Matriz de RLS por Tabela

| Tabela | RLS Habilitado? | `anon` SELECT | `anon` INSERT | `anon` UPDATE | `anon` DELETE | `authenticated` | `service_role` | Avaliação de Risco |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `products` | ❌ **NÃO** | ✅ Permitido | ✅ **Permitido** | ✅ **Permitido** | ✅ **Permitido** | Total | Total | **CRITICAL (Escrita anônima aberta)** |
| `category_assets` | ❌ **NÃO** | ✅ Permitido | ✅ **Permitido** | ✅ **Permitido** | ✅ **Permitido** | Total | Total | **CRITICAL (Escrita anônima aberta)** |
| `pdf_settings` | ❌ **NÃO** | ✅ Permitido | ✅ **Permitido** | ✅ **Permitido** | ✅ **Permitido** | Total | Total | **CRITICAL (Escrita anônima aberta)** |
| `pdf_templates` | ❌ **NÃO** | ✅ Permitido | ✅ **Permitido** | ✅ **Permitido** | ✅ **Permitido** | Total | Total | **HIGH (Escrita anônima aberta)** |
| `newsletter_subscribers`| ✅ **SIM** | ❌ Bloqueado | ✅ Permitido | ❌ Bloqueado | ❌ Bloqueado | Leitura/Delete | Total | **OK no Banco** *(Vaza via API Nitro)* |
| `contact_submissions` | ✅ **SIM** | ❌ Bloqueado | ✅ Permitido | ❌ Bloqueado | ❌ Bloqueado | Leitura/All | Total | **OK no Banco** *(Vaza via API Nitro)* |
| `site_translations` | ❌ **NÃO** | ✅ Permitido | ✅ **Permitido** | ✅ **Permitido** | ✅ **Permitido** | Total | Total | **HIGH (Manipulação de textos)** |
| `home_news_cards` | ❌ **NÃO** | ✅ Permitido | ✅ **Permitido** | ✅ **Permitido** | ✅ **Permitido** | Total | Total | **HIGH (Manipulação de links)** |
| `uploaded_files` | ❌ **NÃO** | ✅ Permitido | ❌ (via R2 API)| ✅ **Permitido** | ✅ **Permitido** | Total | Total | **MEDIUM** |
| `totp_secrets` | ⚠️ **PARCIAL** | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | Próprio `uid` | Total | **MEDIUM (Migration fora da CLI)** |
| `profiles` | ✅ **SIM** | ❌ Bloqueado | ❌ Bloqueado | Próprio `uid` | ❌ Bloqueado | Próprio `uid` | Total | **OK** |
| `daily_runs` | ❌ **NÃO** | ✅ Permitido | ✅ Permitido | ❌ | ❌ | Total | Total | **LOW** |

### 5.2 Evidência no Código de Desativação de RLS
Arquivo `supabase/migrations/20260701175717_disable_rls_for_public_tables.sql`:
```sql
-- Disable RLS for public tables so they can be managed anonymously from the secret admin panel
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates DISABLE ROW LEVEL SECURITY;
```
*Impacto:* Qualquer pessoa com a `anon key` (que é pública no bundle) pode enviar comandos REST `DELETE` ou `PATCH` diretamente para `https://<supabase-url>/rest/v1/products` e apagar ou desfigurar o catálogo.

---

## 6. Auditoria de Autenticação, Autorização e 2FA

### 6.1 Registro de Administradores (`/api/auth/register`)
* O endpoint utiliza `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })`.
* Não há verificação se quem está chamando a rota já é um administrador.
* A rota está protegida unicamente pelo rate limit em memória (3 requisições por hora por IP).
* **Impacto:** Permite que atacantes criem contas válidas diretamente na base de autenticação do Supabase.

### 6.2 Verificação de Roles e Autorização
* O middleware `app/server/middleware/auth.ts` verifica apenas:
  ```ts
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken)
  if (error || !user) { /* 401 */ }
  ```
* Não existe verificação de perfil (`profile.role === 'admin'`), claim no JWT ou tabela de permissões.
* **Impacto:** Se qualquer usuário for registrado no Supabase (por exemplo, via signup público ou registro), ele passa a ter acesso a todos os endpoints administrativos que exigem autenticação.

### 6.3 2FA / TOTP
* O algoritmo TOTP segue a RFC 6238 e está implementado com segurança em `app/server/utils/totp.ts`.
* Existem dois arquivos de rota idênticos: `app/server/api/auth/totp/setup.post.ts` e `app/server/api/auth/totp.setup.post.ts`.
* Ambos possuem fallback de nome de emissor (`issuer`) hardcoded como `'organizze'` caso `APP_NAME` não esteja definido:
  ```ts
  const issuer = process.env.NEXT_PUBLIC_APP_NAME || process.env.APP_NAME || 'organizze'
  ```

---

## 7. Secrets no Repositório e no Histórico Git

### 7.1 Estado do Repositório Atual (`HEAD`)
* Não existem arquivos `.env`, `.env.local` ou `.env.production` commitados no HEAD do repositório.
* `nuxt.config.ts` lê `SUPABASE_SERVICE_ROLE_KEY` e credenciais do Cloudflare R2 exclusivamente de `process.env` no servidor.
* A chave `SUPABASE_SERVICE_ROLE_KEY` **não está exposta** no bundle client-side.

### 7.2 Análise do Histórico Git
* Foram identificadas referências a projetos Supabase e credenciais de infraestrutura em commits anteriores:
  * ID do projeto Supabase: `sjkwrtgcuqinncghhsox`
  * String de conexão PostgreSQL de pooler AWS exposta em arquivos de scripts/documentação:
    `postgresql://postgres.sjkwrtgcuqinncghhsox@aws-1-ca-central-1.pooler.supabase.com:5432/postgres`
  * Scripts de migração com referências diretas à Service Role Key.
* **Recomendação:** Rotação completa da senha do banco de dados e da Service Role Key no painel do Supabase.

---

## 8. Arquivos Públicos, Source Maps e Informações Expostas

* **Robots.txt (`https://catalogo-tecnico-qualitec.vercel.app/robots.txt`):**
  ```text
  User-Agent: *
  Disallow:
  ```
  Permite a indexação de todo o domínio. Se a URL do painel `/admin-secreto-x9f2` for vazada em algum link ou log público, motores de busca indexarão a página administrativa.
* **Arquivos de Configuração (.env, .git):**
  * `GET /.env` → Retornou `404 Not Found` (Protegido pela Vercel).
  * `GET /.git/config` → Retornou `404 Not Found` (Protegido pela Vercel).
* **Pasta Legada `recovery_catalog/`:**
  * Contém 15 arquivos de código fonte duplicados na raiz do projeto. Não são servidos diretamente, mas aumentam a superfície de manutenção e confusão técnica.

---

## 9. Análise de Vulnerabilidades Específicas

### 9.1 SSRF (Server-Side Request Forgery) em `/api/proxy-video`
* **Código Fonte (`app/server/api/proxy-video.ts`):**
  ```ts
  export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const videoUrl = query.url as string
    // Nenhuma validação de URL ou domínio
    const response = await fetch(videoUrl, { headers: reqHeaders })
    return response.body
  })
  ```
* **Teste em Produção:** Requisição para `/api/proxy-video?url=https://example.com` executada com sucesso, retornando o HTML do domínio remoto com status `200`.
* **Impacto:** Permite que o servidor da Vercel seja utilizado como proxy anônimo para acessar recursos externos ou realizar varreduras em portas internas de infraestrutura.

### 9.2 Injeção de HTML em E-mails (`app/server/api/send-email.post.ts`)
* **Código Fonte:**
  ```ts
  subject: `[QUALITEC SITE] ${titleSubject} - ${name || email}`,
  // ...
  <td style="padding: 10px; border: 1px solid #e2e8f0;">${name || 'Não informado'}</td>
  // ...
  <p style="margin: 0; white-space: pre-wrap; color: #334155;">${message || 'Sem mensagem adicional.'}</p>
  ```
* **Impacto:** Como as variáveis `name`, `company`, `phone`, `subject` e `message` não passam por sanitização contra entidades HTML (ex: `<script>`, `<a>`, `<iframe>`), um atacante pode injetar links maliciosos, formulários falsos de login (*phishing*) ou alterar completamente a formatação dos e-mails recebidos pela equipe de vendas e pelos clientes.

### 9.3 Mass Assignment em `/api/admin/products.ts`
* **Código Fonte:**
  ```ts
  if (method === 'POST') {
    const body = await readBody(event)
    const { error, data } = await supabaseAdmin.from('products').insert([body]).select()
  }
  ```
* **Impacto:** Não há validação de campos permitidos (*whitelist*). Campos internos, colunas de ordenação ou metadados podem ser injetados no banco de dados.

### 9.4 Rate Limiting e IP Spoofing
* **Código Fonte (`app/server/middleware/rate-limit.ts`):**
  ```ts
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  ```
* **Impacto:**
  1. Em ambientes serverless multi-instância (Vercel), a memória `Map` é recriada por container/lambda, tornando os limites fáceis de contornar ao disparar requisições concorrentes.
  2. Como a função aceita cegamente o header `X-Forwarded-For`, atacantes podem forjar IPs aleatórios para evitar o bloqueio.
  3. O endpoint crítico `/api/send-email` **não está presente** no objeto `rateLimitConfig`, permitindo potencial abuso de envio de e-mails via SMTP.

---

## 10. Matriz de Testes de Contrato de Segurança

| Teste Realizado | Comportamento Esperado | Comportamento Observado | Veredito |
| :--- | :---: | :---: | :---: |
| `anon GET /api/admin/contacts` | `401 Unauthorized` | `200 OK` (Retornou lista de leads com PII) | ❌ **FALHA CRÍTICA** |
| `anon GET /api/admin/subscribers` | `401 Unauthorized` | `200 OK` (Retornou lista de e-mails) | ❌ **FALHA CRÍTICA** |
| `anon GET /admin-secreto-x9f2` | Redirect para `/login` | `200 OK` (Painel carrega totalmente) | ❌ **FALHA CRÍTICA** |
| `anon GET /api/auth/session` | `401 Unauthorized` | `401 Unauthorized` | ✅ **SUCESSO** |
| `anon POST /api/upload-r2` | `401 Unauthorized` | `401 Unauthorized` | ✅ **SUCESSO** |
| `anon GET /api/proxy-video` | `400/403` (Validação) | `200 OK` (Faz proxy de qualquer URL) | ❌ **FALHA ALTA** |
| `anon GET /robots.txt` | Disallow em admin | `Disallow:` (Totalmente aberto) | ⚠️ **ALERTA** |
| `anon GET /.env` | `404 / 403` | `404 Not Found` | ✅ **SUCESSO** |
| `anon GET /.git/config` | `404 / 403` | `404 Not Found` | ✅ **SUCESSO** |
| `anon GET /api/font?name=hack.ttf`| `400 / 404` | `400 Invalid font filename` (Regex OK) | ✅ **SUCESSO** |

---

## 11. Detalhamento Formal dos Achados

### SEC-001 — Exposição Pública de Dados Pessoais (PII) de Contatos e Leads
* **Severidade:** **CRITICAL**
* **Status:** **CONFIRMADO EM PRODUÇÃO**
* **Componente:** API Nitro / Middleware de Autenticação
* **URL/Arquivo:** `https://catalogo-tecnico-qualitec.vercel.app/api/admin/contacts` e `app/server/middleware/auth.ts` (linhas 9-16)
* **Descrição:** O middleware de autenticação contém uma lista de exceções explícitas (`allowedAdminReadRoutes`) que permite o acesso anônimo sem verificação de cookies de sessão. O endpoint lê a tabela `contact_submissions` e retorna nomes completos, e-mails, telefones, empresas e mensagens enviadas pelos clientes.
* **Pré-condições:** Nenhuma. Acesso via requisição HTTP GET comum.
* **Evidência (Amostra com PII Redigida):**
  ```json
  {
    "contacts": [
      {
        "id": "cnt_1785951911240_y69u7",
        "name": "tes***",
        "type": "contact",
        "email": "tes***@gmail.com",
        "phone": "11983******",
        "company": "",
        "message": "comentario test",
        "subject": "Mensagem do Chat do Site",
        "created_at": "2026-08-05T17:45:11.240Z"
      },
      {
        "id": "cnt_1785927789903_l971l",
        "name": "SAMUEL B. T.***",
        "type": "contact",
        "email": "samuel.t***@gmail.com",
        "phone": "11951******",
        "company": "",
        "message": "teste",
        "created_at": "2026-08-05T11:03:09.903Z"
      }
    ]
  }
  ```
* **Impacto Real:** Violação direta de privacidade (LGPD), vazamento de dados comerciais e perda de confidencialidade de leads de vendas.
* **Cenário de Exploração:** Um atacante ou concorrente faz uma requisição `GET` periódica ao endpoint e extrai a base de clientes e orçamentos da Qualitec.
* **Dados Afetados:** Tabela `contact_submissions` e JSON legado em `pdf_settings`.
* **Teste Executado:** Requisição `GET` não destrutiva observando retorno `200 OK` com dados reais.
* **Recomendação Futura:** Remover a rota da lista de exceções em `app/server/middleware/auth.ts` e exigir token válido `sb-access-token`.

---

### SEC-002 — Exposição Pública de Lista de E-mails de Inscritos na Newsletter
* **Severidade:** **CRITICAL**
* **Status:** **CONFIRMADO EM PRODUÇÃO**
* **Componente:** API Nitro / Middleware de Autenticação
* **URL/Arquivo:** `https://catalogo-tecnico-qualitec.vercel.app/api/admin/subscribers` e `app/server/middleware/auth.ts` (linhas 9-16)
* **Descrição:** O endpoint de inscritos na newsletter também foi inserido na lista de exceções do middleware, respondendo abertamente com toda a lista de e-mails cadastrados.
* **Evidência (Amostra com PII Redigida):**
  ```json
  {
    "subscribers": [
      {
        "email": "samuel.t***@gmail.com",
        "lang": "pt",
        "subscribed_at": "2026-08-04T18:59:54.081+00:00"
      },
      {
        "email": "vendas2@qualitec.ind.br",
        "lang": "pt",
        "subscribed_at": "2026-08-04T14:41:17.1+00:00"
      }
    ]
  }
  ```
* **Impacto Real:** Vazamento da lista de e-mails de marketing para terceiros.
* **Recomendação Futura:** Proteger o endpoint com o middleware de autenticação.

---

### SEC-003 — Painel Administrativo Sem Proteção de Autenticação
* **Severidade:** **CRITICAL**
* **Status:** **CONFIRMADO EM PRODUÇÃO**
* **Componente:** Frontend Nuxt / Páginas
* **URL/Arquivo:** `https://catalogo-tecnico-qualitec.vercel.app/admin-secreto-x9f2` e `app/pages/admin-secreto-x9f2.vue`
* **Descrição:** A página administrativa é renderizada sem qualquer verificação de estado de autenticação ou sessão do usuário. O arquivo `middleware/auth.ts` na raiz do repositório não é aplicado às páginas do diretório `app/`.
* **Impacto Real:** Qualquer pessoa que acesse a URL obtém acesso visual ao painel completo (gerenciador de arquivos, reordenação de produtos, personalização de layout, traduções).
* **Recomendação Futura:** Mover o middleware para `app/middleware/auth.ts`, aplicar `definePageMeta({ middleware: ['auth'] })` e condicionar a renderização à existência de sessão ativa.

---

### SEC-004 — RLS Desabilitado no Banco de Dados (Permissão de Escrita Pública)
* **Severidade:** **CRITICAL**
* **Status:** **CONFIRMADO PELO CÓDIGO E SCHEMA**
* **Componente:** Supabase PostgreSQL / Migrações
* **URL/Arquivo:** `supabase/migrations/20260701175717_disable_rls_for_public_tables.sql`
* **Descrição:** O comando `ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;` foi executado para permitir que o painel admin manipulasse produtos sem autenticação. Isso torna o endpoint REST do Supabase aberto para `INSERT`, `UPDATE` e `DELETE` usando apenas a chave pública `anon`.
* **Teste que NÃO foi executado por segurança:** Requisições de escrita/deleção direta no Supabase em produção.
* **Impacto Real:** Qualquer visitante pode deletar ou modificar produtos, categorias e configurações visuais do site via REST do Supabase.
* **Recomendação Futura:** Habilitar RLS em todas as tabelas públicas e criar políticas que permitam `SELECT` público e restrinjam `INSERT/UPDATE/DELETE` a usuários autenticados ou `service_role`.

---

### SEC-005 — Registro Não Autorizado de Usuários Administrativos
* **Severidade:** **CRITICAL**
* **Status:** **CONFIRMADO PELO CÓDIGO**
* **Componente:** API Nitro / Auth
* **URL/Arquivo:** `app/server/api/auth/register.post.ts`
* **Descrição:** A API aceita qualquer solicitação `POST` com e-mail e senha e executa `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })`. Não há validação de convite, secret ou sessão de admin existente.
* **Impacto Real:** Visitantes anônimos podem criar contas no Supabase com confirmação automática de e-mail.
* **Recomendação Futura:** Proteger `/api/auth/register` com verificação de autenticação de administrador existente ou desativar o registro público.

---

### SEC-006 — SSRF Irrestrito no Proxy de Vídeos
* **Severidade:** **HIGH**
* **Status:** **CONFIRMADO EM PRODUÇÃO**
* **Componente:** API Nitro / Proxy
* **URL/Arquivo:** `https://catalogo-tecnico-qualitec.vercel.app/api/proxy-video` e `app/server/api/proxy-video.ts`
* **Descrição:** O endpoint recebe qualquer URL no parâmetro `?url=` e realiza requisição `fetch()` direta sem filtrar protocolos, domínios ou faixas de IP privadas.
* **Evidência:** Requisição `GET /api/proxy-video?url=https://example.com` retornou com sucesso o conteúdo remoto.
* **Impacto Real:** O servidor pode ser utilizado para varredura de portas em serviços internos ou como vetor de ataque a terceiros.
* **Recomendação Futura:** Implementar whitelist estrita de domínios (YouTube, Vimeo, Cloudflare R2) idêntica à utilizada em `proxy-image.ts`.

---

### SEC-007 — Injeção de HTML nos E-mails Transacionais
* **Severidade:** **HIGH**
* **Status:** **CONFIRMADO PELO CÓDIGO**
* **Componente:** API Nitro / SMTP
* **URL/Arquivo:** `app/server/api/send-email.post.ts` (linhas 746-815)
* **Descrição:** Variáveis de formulários (`name`, `company`, `message`, `phone`, `subject`) são concatenadas diretamente em template strings HTML sem escape de caracteres `< > " ' &`.
* **Impacto Real:** Envio de e-mails com conteúdo arbitrário, desfiguração visual e injeção de links maliciosos para a equipe de atendimento ou para clientes.
* **Recomendação Futura:** Criar uma função de sanitização de HTML (`escapeHtml(text)`) e aplicá-la a todas as variáveis injetadas nos templates de e-mail.

---

### SEC-008 — Mass Assignment no Gerenciador de Produtos
* **Severidade:** **MEDIUM**
* **Status:** **CONFIRMADO PELO CÓDIGO**
* **Componente:** API Nitro / Admin
* **URL/Arquivo:** `app/server/api/admin/products.ts` (linhas 17 e 39)
* **Descrição:** Os métodos `POST` e `PUT` recebem o corpo da requisição sem validação de campos permitidos e o passam diretamente para os métodos `.insert([body])` e `.update(payload)` do Supabase.
* **Impacto Real:** Permite a injeção ou modificação de colunas não previstas na interface.
* **Recomendação Futura:** Utilizar schema de validação (ex: Zod) com campos explicitamente permitidos (*whitelist*).

---

### SEC-009 — Rate Limiting Ineficaz em Ambiente Serverless
* **Severidade:** **MEDIUM**
* **Status:** **CONFIRMADO PELO CÓDIGO**
* **Componente:** Middleware Nitro
* **URL/Arquivo:** `app/server/middleware/rate-limit.ts`
* **Descrição:** O rate limit armazena dados em um objeto `Map` na memória da instância local do Node.js, não sendo compartilhado entre lambdas serverless da Vercel. Além disso, aceita o header `X-Forwarded-For` do cliente e não protege a rota de envio de e-mails (`/api/send-email`).
* **Impacto Real:** Facilidade de evasão de rate limit para força bruta em login e risco de spam/abuso no envio de e-mails.
* **Recomendação Futura:** Adicionar Upstash Redis ou KV distribuído para controle de requisições e incluir `/api/send-email` nas rotas protegidas.

---

### SEC-010 — Permissões Excessivas na Política CSP
* **Severidade:** **MEDIUM**
* **Status:** **CONFIRMADO EM PRODUÇÃO E CÓDIGO**
* **Componente:** Middleware Nitro / Headers
* **URL/Arquivo:** `app/server/middleware/security-headers.ts` (linha 20)
* **Descrição:** O cabeçalho `Content-Security-Policy` inclui `'unsafe-inline'` e `'unsafe-eval'` na diretiva `script-src`.
* **Impacto Real:** Reduz a eficácia da proteção contra vulnerabilidades de Cross-Site Scripting (XSS).
* **Recomendação Futura:** Remover `'unsafe-eval'` e migrar scripts inline para hashes ou nonces criptográficos.

---

### SEC-011 — Permissão de Upload de Arquivos SVG sem Sanitização
* **Severidade:** **MEDIUM**
* **Status:** **CONFIRMADO PELO CÓDIGO**
* **Componente:** API Nitro / Upload
* **URL/Arquivo:** `app/server/api/upload-r2.post.ts` (linha 9)
* **Descrição:** O endpoint permite upload de `image/svg+xml`. Arquivos SVG podem conter tags `<script>` e manipuladores de eventos JavaScript, que são executados se abertos diretamente no navegador a partir do domínio público.
* **Impacto Real:** Stored XSS caso um SVG malicioso seja aberto diretamente pelo navegador do usuário.
* **Recomendação Futura:** Sanitizar SVGs com DOMPurify no servidor antes do upload ou configurar o cabeçalho `Content-Disposition: attachment` para arquivos SVG servidos pela CDN.

---

### SEC-012 — Exposição Global de Rotas no Arquivo Robots.txt
* **Severidade:** **MEDIUM**
* **Status:** **CONFIRMADO EM PRODUÇÃO**
* **Componente:** Arquivos Estáticos
* **URL/Arquivo:** `https://catalogo-tecnico-qualitec.vercel.app/robots.txt`
* **Descrição:** O arquivo `robots.txt` contém `Disallow:` em branco, permitindo que qualquer rastreador indexe todas as páginas do site, incluindo rotas administrativas.
* **Recomendação Futura:** Adicionar `Disallow: /admin-secreto-x9f2` e `Disallow: /api/` no arquivo `robots.txt`.

---

### SEC-013 — Endpoints Duplicados de Configuração TOTP
* **Severidade:** **LOW**
* **Status:** **CONFIRMADO PELO CÓDIGO**
* **Componente:** API Nitro
* **URL/Arquivo:** `app/server/api/auth/totp/setup.post.ts` e `app/server/api/auth/totp.setup.post.ts`
* **Descrição:** Existem dois endpoints ativos para a mesma finalidade, gerando duplicação de lógica e divergências sutis de validação.
* **Recomendação Futura:** Remover o arquivo redundante `totp.setup.post.ts`.

---

## 12. Respostas Objetivas às 28 Questões de Auditoria

1. **Um visitante consegue acessar o painel?**  
   **SIM.** A rota `/admin-secreto-x9f2` abre diretamente sem validação de sessão.
2. **Um visitante consegue ler dados administrativos?**  
   **SIM.** `/api/admin/contacts` e `/api/admin/subscribers` retornam dados sem autenticação.
3. **Um visitante consegue alterar produtos?**  
   **SIM.** O RLS da tabela `products` está desabilitado, permitindo mutações via REST do Supabase.
4. **Um visitante consegue alterar categorias?**  
   **SIM.** O RLS da tabela `category_assets` está desabilitado.
5. **Um visitante consegue alterar configurações do site?**  
   **SIM.** O RLS da tabela `pdf_settings` está desabilitado.
6. **Um visitante consegue alterar traduções?**  
   **SIM.** A tabela `site_translations` não possui restrição de RLS para escrita via anon key.
7. **Um visitante consegue acessar leads?**  
   **SIM.** O endpoint `/api/admin/contacts` está público.
8. **Um visitante consegue acessar newsletter?**  
   **SIM.** O endpoint `/api/admin/subscribers` está público.
9. **Um visitante consegue fazer upload?**  
   **NÃO.** O endpoint `/api/upload-r2` está protegido pelo middleware de autenticação (retorna `401`).
10. **Um usuário autenticado qualquer vira admin?**  
    **SIM.** O middleware apenas checa se `user != null`, sem validar roles ou perfis administrativos.
11. **É possível criar admin sem autorização?**  
    **SIM.** O endpoint `/api/auth/register` permite criação de contas confirmadas via Service Role.
12. **Existe Service Role no frontend?**  
    **NÃO.** A chave está restrita a variáveis de ambiente do servidor Nitro.
13. **Algum segredo esteve no histórico Git?**  
    **SIM.** Referências de projetos e strings de conexão PostgreSQL do Supabase foram encontradas no histórico.
14. **Credenciais R2 estiveram públicas?**  
    **NÃO.** Apenas os nomes das variáveis e exemplos figuraram nos commits.
15. **SMTP password esteve pública?**  
    **NÃO.** Apenas exemplos com placeholders.
16. **Existem RPCs inseguras?**  
    **NÃO.** Nenhuma RPC customizada com privilégios perigosos foi identificada em produção.
17. **Existem functions SECURITY DEFINER perigosas?**  
    **NÃO.** As funções existentes são utilitárias (`handle_new_user`).
18. **Existe SSRF?**  
    **SIM.** No endpoint `/api/proxy-video` (confirmado live).
19. **Existe XSS?**  
    **PROVÁVEL.** Injeção de HTML nos e-mails e upload de SVG não sanitizado.
20. **Existe CSRF?**  
    **BAIXO RISCO.** Os cookies de sessão utilizam `SameSite=strict` / `SameSite=Lax`.
21. **Existe CORS inseguro?**  
    **NÃO.** O CORS nas APIs está restrito ou não envia `Access-Control-Allow-Origin: *` com credenciais.
22. **Existe path traversal?**  
    **NÃO.** O endpoint `/api/font` utiliza validação estrita via regex e `upload-r2` sanitiza nomes.
23. **Existe mass assignment?**  
    **SIM.** No endpoint `/api/admin/products`.
24. **Existem endpoints esquecidos?**  
    **SIM.** Duplicata `/api/auth/totp.setup.post.ts` e `server/api/font.get.ts` legado.
25. **Existem arquivos sensíveis publicamente acessíveis?**  
    **NÃO.** Arquivos `.env` e `.git` retornam `404` em produção.
26. **Existem dependências vulneráveis exploráveis?**  
    **SIM.** Alertas de severidade alta em pacotes transitivos do ecossistema Nuxt/Vite apontados no `npm audit`.
27. **Existem dados pessoais expostos?**  
    **SIM.** Nomes, e-mails, telefones e mensagens de clientes expostos em `/api/admin/contacts` e `/api/admin/subscribers`.
28. **O projeto pode permanecer publicado com segurança no estado atual?**  
    **NÃO.** A publicação no estado atual representa risco crítico de vazamento de dados e desfiguração.

---

## 13. Security Release Gate

```text
=====================================================
RESULTADO FINAL DA AVALIAÇÃO DE SEGURANÇA
=====================================================

[ ❌ ] Painel Administrativo Protegido
[ ❌ ] APIs Administrativas Protegidas
[ ❌ ] Row Level Security (RLS) Ativo
[ ❌ ] Proteção de Dados Pessoais (Leads / Newsletter)
[ ❌ ] Controle de Registro de Usuários
[ ❌ ] Proteção contra SSRF

VEREDITO FINAL: BLOCKED (PUBLICAÇÃO BLOQUEADA)
=====================================================
Motivo: Identificadas 4 vulnerabilidades CRÍTICAS e 3 de severidade ALTA
que permitem acesso anônimo a dados pessoais, alteração do catálogo sem login
e execução de requisições arbitrárias via SSRF.
=====================================================
```

---

## 14. Plano de Remediação (Sem Execução Nesta Etapa)

### P0 — Imediato (Correções Críticas para Liberação Básica)
1. **Bloquear APIs de Contatos e Newsletter:**
   * *Arquivos:* `app/server/middleware/auth.ts`.
   * *Ação:* Remover as rotas `/api/admin/contacts` e `/api/admin/subscribers` da lista `allowedAdminReadRoutes`.
2. **Proteger o Painel Administrativo com Middleware:**
   * *Arquivos:* `app/pages/admin-secreto-x9f2.vue` e `app/middleware/auth.ts`.
   * *Ação:* Mover o middleware de autenticação para `app/middleware/auth.ts` e declarar `definePageMeta({ middleware: ['auth'] })` na página.
3. **Reativar Row Level Security (RLS) no Supabase:**
   * *Migrations:* Criar nova migração SQL executando `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` para `products`, `category_assets`, `pdf_settings`, `pdf_templates`, `site_translations` e `home_news_cards`, adicionando policies restritivas de escrita.
4. **Proteger ou Desativar `/api/auth/register`:**
   * *Arquivos:* `app/server/api/auth/register.post.ts`.
   * *Ação:* Exigir que o chamador possua sessão autenticada com perfil de administrador.

### P1 — Antes da Próxima Publicação (Severidade Alta)
1. **Corrigir SSRF em `/api/proxy-video`:**
   * *Arquivos:* `app/server/api/proxy-video.ts`.
   * *Ação:* Aplicar a mesma função `isAllowedUrl()` com whitelist de domínios presente em `proxy-image.ts`.
2. **Sanitizar Variáveis em Templates de E-mail:**
   * *Arquivos:* `app/server/api/send-email.post.ts`.
   * *Ação:* Criar função utilitária de escape HTML e encapsular todas as interpolações (`${escapeHtml(name)}`, etc.).
3. **Rotacionar Credenciais do Supabase:**
   * *Ação no Dashboard Supabase:* Resetar a `Service Role Key` e a senha do banco de dados devido à presença de referências históricas no Git.

### P2 — Hardening (Severidade Média)
1. **Implementar Whitelist / Zod em `/api/admin/products`:**
   * *Arquivos:* `app/server/api/admin/products.ts`.
2. **Implementar Rate Limiting Distribuído e Proteger `/api/send-email`:**
   * *Arquivos:* `app/server/middleware/rate-limit.ts`.
3. **Sanitização de Uploads SVG:**
   * *Arquivos:* `app/server/api/upload-r2.post.ts`.
4. **Atualizar `robots.txt`:**
   * *Arquivos:* `app/public/robots.txt` e `public/robots.txt` adicionando `Disallow: /admin-secreto-x9f2`.

### P3 — Melhorias e Limpeza Técnica (Severidade Baixa / Info)
1. **Excluir Pasta Legada e Duplicatas:**
   * Remover pasta `recovery_catalog/`, `server/api/font.get.ts` (na raiz) e `app/server/api/auth/totp.setup.post.ts`.
2. **Corrigir Fallback de Issuer do TOTP:**
   * Substituir `'organizze'` por `'Qualitec'` nos utilitários de autenticação.
3. **Executar `npm audit fix`:**
   * Atualizar dependências transitivas vulneráveis sem quebrar compatibilidade.

---
*Relatório gerado exclusivamente para diagnóstico e auditoria. Nenhuma alteração foi realizada no código-fonte, banco de dados ou ambiente de produção durante este procedimento.*
