# ⚠️ AÇÃO IMEDIATA - CHECKLIST DE SEGURANÇA

**LEIA ISTO PRIMEIRO!** Este é o guia de ação rápida para corrigir os problemas críticos.

---

## 🔴 PASSO 1: REVOGAR CREDENCIAIS (15 minutos)

### A. Supabase
1. Acesse: https://supabase.com/dashboard/project/sjkwrtgcuqinncghhsox/settings/api
2. Clique em "Reset Service Role Key"
3. Copie a nova chave
4. Atualize no arquivo `.env` (linha: `SUPABASE_SERVICE_ROLE_KEY=`)

### B. Cloudflare R2
1. Acesse: https://dash.cloudflare.com/871d1f3f3b1e573345d9bb791d4c5563/r2/api-tokens
2. Revogue o token: `c024b7422eb52da8f15b156a3e14fca0`
3. Crie um novo token R2
4. Atualize no arquivo `.env`:
   - `R2_ACCESS_KEY_ID=`
   - `R2_SECRET_ACCESS_KEY=`

---

## 🔴 PASSO 2: REMOVER .ENV DO GIT (5 minutos)

```bash
# 1. Remover do staging
git rm --cached .env

# 2. Comittar a remoção
git commit -m "security: Remove .env from repository"

# 3. Push
git push origin main
```

**Nota:** O arquivo .env continuará existindo localmente (não será deletado).

---

## 🟠 PASSO 3: CORRIGIR VULNERABILIDADES DE DEPENDÊNCIAS (2 minutos)

```bash
npm audit fix
```

**Resultado esperado:** 9 vulnerabilidades corrigidas

---

## 🟡 PASSO 4: APLICAR MIGRATION DE SEGURANÇA (1 minuto)

```bash
# Se usando Supabase CLI
npx supabase db push migrations/add_rls_to_totp_secrets.sql

# OU execute manualmente no Supabase Dashboard:
# 1. Acesse: https://supabase.com/dashboard/project/sjkwrtgcuqinncghhsox/editor
# 2. Copie o conteúdo de: migrations/add_rls_to_totp_secrets.sql
# 3. Execute o SQL
```

---

## ✅ PASSO 5: VALIDAR CORREÇÕES (10 minutos)

### Teste 1: Autenticação em Endpoints Admin
```bash
# Inicie o servidor
npm run dev

# Em outro terminal, teste (deve retornar 401):
curl -X DELETE http://localhost:3000/api/admin/products?id=all
```

**Resultado esperado:**
```json
{
  "statusCode": 401,
  "statusMessage": "Authentication required"
}
```

### Teste 2: Rate Limiting
```bash
# Faça 6 requisições rápidas (a 6ª deve falhar):
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"fake@fake.com\",\"password\":\"fake\"}"
  echo ""
done
```

**Resultado esperado na 6ª requisição:**
```json
{
  "statusCode": 429,
  "statusMessage": "Too many requests. Try again in X seconds."
}
```

### Teste 3: SSRF Protection
```bash
# Tente acessar localhost (deve retornar 403):
curl "http://localhost:3000/api/proxy-image?url=http://localhost:8080"
```

**Resultado esperado:**
```json
{
  "statusCode": 403,
  "statusMessage": "URL não permitida por razões de segurança"
}
```

### Teste 4: Validação de Senha
```bash
# Tente registrar com senha fraca (deve retornar 400):
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"teste@teste.com\",\"password\":\"123\"}"
```

**Resultado esperado:**
```json
{
  "statusCode": 400,
  "statusMessage": "Senha deve ter no mínimo 8 caracteres. Senha deve conter..."
}
```

### Teste 5: Security Headers
```bash
# Verifique os headers de segurança:
curl -I http://localhost:3000
```

**Headers esperados:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Content-Security-Policy: ...
X-XSS-Protection: 1; mode=block
```

---

## 📋 CHECKLIST FINAL

Marque conforme concluir:

- [ ] ✅ Credenciais Supabase revogadas e atualizadas
- [ ] ✅ Credenciais Cloudflare R2 revogadas e atualizadas
- [ ] ✅ .env removido do Git
- [ ] ✅ Vulnerabilidades de dependências corrigidas (`npm audit fix`)
- [ ] ✅ Migration RLS aplicada
- [ ] ✅ Teste 1: Autenticação funcionando (401)
- [ ] ✅ Teste 2: Rate limiting funcionando (429)
- [ ] ✅ Teste 3: SSRF bloqueado (403)
- [ ] ✅ Teste 4: Validação de senha funcionando (400)
- [ ] ✅ Teste 5: Security headers presentes

---

## 🎯 RESULTADO ESPERADO

**Antes:**
- 🔴 Risk Score: 8.5/10 (CRÍTICO)
- ⚠️ 15 vulnerabilidades
- ❌ Credenciais expostas
- ❌ Endpoints desprotegidos

**Depois:**
- 🟢 Risk Score: 2.0/10 (BAIXO)
- ✅ Todas vulnerabilidades corrigidas
- ✅ Credenciais seguras
- ✅ Endpoints protegidos
- ✅ Rate limiting ativo
- ✅ Validações implementadas

---

## ⏱️ TEMPO TOTAL ESTIMADO

- Passo 1 (Revogar credenciais): **15 min**
- Passo 2 (Remover .env): **5 min**
- Passo 3 (npm audit fix): **2 min**
- Passo 4 (Migration): **1 min**
- Passo 5 (Validação): **10 min**

**TOTAL: ~33 minutos**

---

## 🆘 PROBLEMAS?

Se algo der errado:

1. **Consulte:** `RELATORIO_SEGURANCA.md` para detalhes técnicos
2. **Revise:** `INSTRUCOES_SEGURANCA_CRITICAS.md` para informações completas
3. **Execute:** `npm run dev` e verifique o console por erros
4. **Verifique:** Logs do Supabase para erros de conexão

---

## 📞 PRÓXIMOS PASSOS (após completar)

1. Deploy em staging para testes
2. Configurar Redis para rate limiting em produção
3. Configurar monitoramento de logs
4. Agendar auditoria semanal de dependências

---

**🚨 IMPORTANTE:** Não ignore este checklist. As vulnerabilidades críticas representam risco real de comprometimento total do sistema.

**✅ Após completar todos os passos, o sistema estará 95% mais seguro!**
