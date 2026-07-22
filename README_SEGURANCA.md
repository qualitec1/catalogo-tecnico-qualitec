# 🛡️ Guia Rápido de Segurança - Qualitec Catálogo

## 📚 Documentos de Segurança

Este projeto possui 4 documentos principais de segurança:

1. **RELATORIO_SEGURANCA.md** - Relatório completo de auditoria
2. **INSTRUCOES_SEGURANCA_CRITICAS.md** - Ações imediatas necessárias
3. **SECURITY.md** - Política de segurança e como reportar vulnerabilidades
4. **Este arquivo** - Guia rápido de referência

## ⚡ Ação Imediata Necessária

Se você está vendo isso pela primeira vez:

1. **Leia** `INSTRUCOES_SEGURANCA_CRITICAS.md` AGORA
2. **Revogue** as credenciais expostas no .env
3. **Execute** as correções críticas

## 🔧 Correções Implementadas

### Middlewares Criados

```
app/server/middleware/
├── auth.ts              # Proteção de rotas administrativas
├── rate-limit.ts        # Proteção contra força bruta
└── security-headers.ts  # Headers de segurança HTTP
```

### Validações Adicionadas

- ✅ Validação de força de senha em registro
- ✅ Validação de tipos de arquivo em upload
- ✅ Proteção SSRF em proxy de imagens
- ✅ Sanitização de nomes de arquivo
- ✅ Comparação constant-time em TOTP

### Migration de Segurança

```sql
-- migrations/add_rls_to_totp_secrets.sql
-- Adiciona Row Level Security na tabela totp_secrets
```

## 🧪 Como Testar

```bash
# 1. Execute o script de verificação
bash scripts/security-check.sh

# 2. Teste autenticação (deve retornar 401)
curl -X DELETE http://localhost:3000/api/admin/products?id=all

# 3. Teste rate limiting (6ª requisição deve retornar 429)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"fake@fake.com","password":"fake"}'
done

# 4. Teste SSRF protection (deve retornar 403)
curl "http://localhost:3000/api/proxy-image?url=http://localhost:8080"

# 5. Teste validação de senha fraca (deve retornar 400)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123"}'
```

## 📋 Checklist de Deploy

Antes de ir para produção:

- [ ] Credenciais revogadas e renovadas
- [ ] .env removido do Git
- [ ] Migration RLS aplicada
- [ ] Rate limiting configurado com Redis
- [ ] HTTPS habilitado
- [ ] NODE_ENV=production
- [ ] Logs de segurança monitorados
- [ ] npm audit executado

## 🚨 Problemas Críticos Encontrados

### 1. Credenciais Expostas 🔴
**Arquivo:** `.env` commitado no Git  
**Ação:** Revogar TODAS as credenciais imediatamente

### 2. Endpoints Sem Autenticação 🔴
**Arquivo:** `app/server/api/admin/products.ts`  
**Ação:** Middleware de auth criado

### 3. SSRF Vulnerability 🔴
**Arquivo:** `app/server/api/proxy-image.ts`  
**Ação:** Whitelist de domínios implementada

### 4. Ausência de Rate Limiting 🟠
**Todos os endpoints**  
**Ação:** Middleware de rate limiting criado

### 5. Validação de Upload Fraca 🟠
**Arquivo:** `app/server/api/upload-r2.post.ts`  
**Ação:** Validação completa implementada

## 📞 Próximos Passos

1. **Urgente:** Aplicar correções críticas (INSTRUCOES_SEGURANCA_CRITICAS.md)
2. **Importante:** Testar todas as correções
3. **Recomendado:** Configurar monitoramento contínuo
4. **Manutenção:** Executar `npm audit` semanalmente

## 🔗 Links Úteis

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Supabase Security: https://supabase.com/docs/guides/auth/row-level-security
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/

## 📊 Status da Segurança

**Antes das Correções:** 🔴 CRÍTICO (Score: 8.5/10)  
**Após as Correções:** 🟢 BAIXO (Score: 2.0/10 esperado)

---

**Dúvidas?** Consulte os outros documentos de segurança ou entre em contato com a equipe de segurança.
