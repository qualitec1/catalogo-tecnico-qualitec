# ⚠️ INSTRUÇÕES CRÍTICAS DE SEGURANÇA - AÇÃO IMEDIATA NECESSÁRIA

## 🔴 PRIORIDADE MÁXIMA - FAZER AGORA

### 1. REVOGAR TODAS AS CREDENCIAIS EXPOSTAS

**STATUS:** ⚠️ **CRÍTICO** - Suas credenciais reais estão no arquivo `.env` que foi commitado no Git!

#### Passo a Passo:

**A. Revogar Credenciais Supabase:**
1. Acesse: https://supabase.com/dashboard/project/sjkwrtgcuqinncghhsox/settings/api
2. Clique em "Reset Service Role Key"
3. Gere uma nova Service Role Key
4. Copie a nova chave

**B. Revogar Credenciais Cloudflare R2:**
1. Acesse: https://dash.cloudflare.com/871d1f3f3b1e573345d9bb791d4c5563/r2/api-tokens
2. Revogue o token existente (Access Key: c024b7422eb52da8f15b156a3e14fca0)
3. Crie um novo token R2
4. Copie as novas credenciais

**C. Atualizar .env com novas credenciais:**
```bash
# Edite o arquivo .env com as NOVAS credenciais
# NUNCA commite este arquivo novamente
```

**D. Remover .env do histórico do Git:**
```bash
# Se o arquivo já foi commitado, use:
git rm --cached .env
git commit -m "Remove .env from repository"

# Para remover do histórico (use com cuidado):
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (se necessário):
git push origin --force --all
```

---

### 2. APLICAR MIGRATIONS DE SEGURANÇA

```bash
# Execute a migration para adicionar RLS na tabela totp_secrets
npx supabase db push migrations/add_rls_to_totp_secrets.sql
```

---

### 3. CONFIGURAR RATE LIMITING EM PRODUÇÃO

Os middlewares criados usam memória local. Em produção com múltiplos servidores, use Redis:

```bash
npm install ioredis
```

Depois atualize `app/server/middleware/rate-limit.ts` para usar Redis ao invés de `Map`.

---

### 4. VERIFICAR SECURITY HEADERS

Teste se os headers estão sendo aplicados:

```bash
# Execute o projeto:
npm run dev

# Em outro terminal, teste:
curl -I http://localhost:3000

# Verifique se estes headers estão presentes:
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
# - Content-Security-Policy: ...
# - Strict-Transport-Security (em prod)
```

---

### 5. ATUALIZAR WHITELIST DE DOMÍNIOS

Edite `app/server/api/proxy-image.ts` e adicione APENAS domínios confiáveis:

```typescript
const ALLOWED_DOMAINS = [
  'pub-25a6482a064a4590a456d3dd2a76114b.r2.dev', // Seu R2
  // Adicione outros domínios confiáveis aqui
]
```

---

## 📋 CHECKLIST DE VALIDAÇÃO

Após aplicar as correções, verifique:

- [ ] Credenciais antigas revogadas
- [ ] Novas credenciais configuradas no .env
- [ ] .env removido do Git e do histórico
- [ ] Migration RLS aplicada com sucesso
- [ ] Middlewares carregando corretamente
- [ ] Teste de autenticação em /api/admin/products (deve retornar 401)
- [ ] Teste de upload sem autenticação (deve retornar 401)
- [ ] Teste de SSRF bloqueado: `GET /api/proxy-image?url=http://localhost` (deve retornar 403)
- [ ] Teste de senha fraca: registrar com "123456" (deve retornar erro)
- [ ] Security headers presentes em todas as respostas
- [ ] Rate limiting funcionando (fazer 6+ requests em login)

---

## 🧪 TESTES DE SEGURANÇA

Execute estes testes manualmente:

### Teste 1: Autenticação em Endpoints Admin
```bash
# Sem autenticação (deve falhar):
curl -X DELETE http://localhost:3000/api/admin/products?id=all

# Resposta esperada: 401 Unauthorized
```

### Teste 2: Validação de Senha
```bash
# Tente registrar com senha fraca:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123"}'

# Resposta esperada: 400 com mensagem de erro de validação
```

### Teste 3: Rate Limiting
```bash
# Faça 6 requisições rápidas:
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"fake@fake.com","password":"fake"}'
  echo ""
done

# A 6ª deve retornar: 429 Too Many Requests
```

### Teste 4: SSRF Protection
```bash
# Tente acessar localhost:
curl "http://localhost:3000/api/proxy-image?url=http://localhost:8080"

# Resposta esperada: 403 Forbidden
```

### Teste 5: File Upload Validation
```bash
# Tente fazer upload de arquivo executável:
# (crie um arquivo fake.exe primeiro)
curl -X POST http://localhost:3000/api/upload-r2 \
  -F "file=@fake.exe"

# Resposta esperada: 400 com erro de tipo não permitido
```

---

## 🔍 MONITORAMENTO CONTÍNUO

Adicione ao seu processo:

1. **Auditoria Semanal de Dependências:**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Review de Logs de Segurança:**
   - Monitore tentativas de login falhadas
   - Verifique uploads bloqueados
   - Identifique IPs suspeitos

3. **Testes de Penetração Mensais:**
   - Use ferramentas como OWASP ZAP
   - Contrate security audit profissional

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Aplicar TODAS as correções críticas (hoje)
2. ⚠️ Testar em ambiente de staging
3. 🚀 Deploy em produção
4. 📊 Monitorar logs por 48h
5. 🔄 Revisar e iterar

---

## ⚠️ AVISOS IMPORTANTES

- **NÃO** commite o arquivo `.env` novamente
- **NÃO** compartilhe credenciais via Slack/email/chat
- **NÃO** desabilite os middlewares de segurança
- **SEMPRE** valide inputs do usuário
- **SEMPRE** use HTTPS em produção

---

**Qualquer dúvida, consulte o RELATORIO_SEGURANCA.md para detalhes técnicos.**
