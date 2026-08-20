# Relatório de Diagnóstico e Correção — Causa Raiz Real do Login Admin e 2FA TOTP (P0)

**Projeto:** Qualitec 2.0  
**Data:** 20/08/2026  
**Status do Gate:** `PRODUCTION P0 SECURITY GATE: BLOCKED — AWAITING LOGIN FIX REVIEW`  

---

## 1. Causa Raiz Real: Contaminação de Sessão no Client Supabase

A hipótese investigada foi **plenamente comprovada por testes práticos de runtime**:

### Mecanismo do Erro:
1. **Instância Única Compartilhada:**
   O arquivo `login.post.ts` executava:
   ```typescript
   const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
   ```
2. **Contaminação da Instância (`downgrade` de role):**
   Ao chamar `signInWithPassword`, a biblioteca `@supabase/supabase-js` armazena internamente a sessão do usuário recém-autenticado naquela mesma instância do client.
3. **Injeção de Token nas Queries Subsequentes:**
   Nas chamadas seguintes efetuadas pelo mesmo client:
   ```typescript
   await supabaseAdmin.from('totp_secrets').select('secret, enabled').eq('user_id', userId)...
   ```
   O client do Supabase **substituía automaticamente o header `Authorization: Bearer <SERVICE_ROLE_KEY>` por `Authorization: Bearer <USER_ACCESS_TOKEN>`** (Role: `authenticated`).
4. **Impacto do RLS da Fase B:**
   - Para a tabela `profiles`: O usuário `authenticated` possui política explícita `SELECT` (`USING (auth.uid() = id)`), portanto a consulta funcionava.
   - Para a tabela `totp_secrets`: Na Fase B, todo acesso direto de `anon` e `authenticated` foi revogado (`REVOKE ALL ON public.totp_secrets FROM anon, authenticated`).
   - Consequentemente, o PostgREST retornava o erro PostgreSQL:
     ```
     42501 - permission denied for table totp_secrets
     ```
   - O código capturava esse `totpError` e disparava `500: Failed to read TOTP configuration`.

---

## 2. Nova Arquitetura: Separação Estrita de Clients

Para eliminar definitivamente a contaminação de sessão, a arquitetura agora separa os dois papéis em clients dedicados:

```
                  POST /api/auth/login
                           │
                           ▼
          supabaseAuth (Anon / Publishable Key)
             auth.signInWithPassword(email, pass)
                           │
                           ├─► Falha ──► 401 Credenciais inválidas
                           │
                           ▼ (user + session obtidos)
          supabaseAdmin (Service Role Pura)
             .from('profiles').select(...)
                           │
                           ├─► role !== 'admin' ou is_active !== true ──► 403 Acesso Negado
                           │
                           ▼
          supabaseAdmin (Service Role Pura)
             .from('totp_secrets').select(...)
                           │
             ┌─────────────┴──────────────┐
             ▼                            ▼
     TOTP Inexistente/Off        TOTP Ativo (enabled: true)
             │                            │
             │                    Sem código? ──► { totpRequired: true }
             │                    Código inválido? ──► 401 Inválido
             │                    Código válido? ──┐
             └─────────────┬───────────────────────┘
                           ▼
             Emissão de Cookies HttpOnly
          (sb-access-token / sb-refresh-token)
                           │
                           ▼
             HTTP 200 { user, profile, isAdmin: true }
```

### 1. `app/server/utils/supabaseAuth.ts` (Novo)
- Inicializado com `SUPABASE_ANON_KEY`.
- Finalidade exclusiva: autenticar credenciais via `signInWithPassword`.
- Nunca possui credenciais de `service_role`.

### 2. `app/server/utils/supabaseAdmin.ts` (Isolado)
- Inicializado com `SUPABASE_SERVICE_ROLE_KEY`.
- **NUNCA executa `signInWithPassword`**, garantindo que o token Service Role nunca seja sobrescrito por uma sessão de usuário.
- Finalidade exclusiva: consultas e mutações privilegiadas de backend (bypass seguro de RLS para checagens administrativas).

---

## 3. Código Antes vs. Código Depois

### Antes (`app/server/api/auth/login.post.ts` - Instância Contaminada)
```typescript
  // signInWithPassword na mesma instância que fazia queries privilegiadas
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
  // ...
  // Esta query enviava Authorization: Bearer <USER_TOKEN> (role: authenticated)
  const { data: totpRow, error: totpError } = await supabaseAdmin
    .from('totp_secrets')
    .select('secret, enabled')
    .eq('user_id', userId)
    .maybeSingle() // Falhava com 42501 (permission denied)
```

### Depois (`app/server/api/auth/login.post.ts` - Clients Desacoplados)
```typescript
  // 1. signInWithPassword via supabaseAuth (Anon client)
  const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
    email: email.trim(),
    password
  })
  if (authError || !authData?.session || !authData?.user) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Credenciais inválidas' }))
  }

  const userId = authData.user.id

  // 2. Checagem de autorização via supabaseAdmin puro (Service Role)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', userId)
    .maybeSingle()

  if (profileError || !profile || profile.role !== 'admin' || profile.is_active !== true) {
    return sendError(event, createError({ statusCode: 403, statusMessage: 'Acesso Negado...' }))
  }

  // 3. Checagem de TOTP via supabaseAdmin puro (Service Role intacta)
  const { data: totpRow, error: totpError } = await supabaseAdmin
    .from('totp_secrets')
    .select('secret, enabled')
    .eq('user_id', userId)
    .maybeSingle()

  // 4. Emissão de cookies com a sessão do authData
  setCookie(event, 'sb-access-token', authData.session.access_token, ...)
```

---

## 4. Resultados dos Testes de Verificação

Executados via `scripts/test_p0_real_login_and_roles.mjs`:

| Teste / Cenário | Descrição | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| **1** | `adminClient` (Service Role pura) acessa `totp_secrets` | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **2** | `authClient` (role `authenticated`) acessa `totp_secrets` | Bloqueado (42501) | 42501 - permission denied | **PASS** |
| **3** | Admin ativo sem registro TOTP (Estado A) | Login 200 OK + Sessão emitida | Status 200, isAdmin: true, cookies: true | **PASS** |
| **4** | Admin ativo com `enabled = false` (Estado B) | Login 200 OK + Sessão emitida | Status 200, isAdmin: true, cookies: true | **PASS** |
| **5** | Admin ativo com `enabled = true` sem código 2FA | `totpRequired: true`, sem sessão | `totpRequired: true`, cookies: false | **PASS** |
| **6** | Usuário comum (`role = 'user'`) | HTTP 403 Forbidden | Status 403 Acesso Negado | **PASS** |
| **7** | Admin inativo (`is_active = false`) | HTTP 403 Forbidden | Status 403 Acesso Negado | **PASS** |

**Total de Verificações:** **7/7 APROVADAS (100%)**  
**Build de Produção (`npm run build`):** **PASS**  
**Deploy em Produção:** **NÃO REALIZADO (Aguardando autorização)**
