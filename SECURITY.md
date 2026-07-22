# 🔒 Política de Segurança

## Versões Suportadas

| Versão | Suportada          |
| ------ | ------------------ |
| 1.x.x  | :white_check_mark: |

## Reportando uma Vulnerabilidade

**Por favor, NÃO reporte vulnerabilidades de segurança através de issues públicas do GitHub.**

Se você descobrir uma vulnerabilidade de segurança neste projeto, envie um email para:

📧 **[SEU-EMAIL-DE-SEGURANÇA]**

Inclua as seguintes informações:
- Tipo de problema (ex: SSRF, SQL injection, XSS, etc.)
- Localização completa do código vulnerável (arquivo, linha)
- Configuração especial necessária para reproduzir o problema
- Passos detalhados para reproduzir a vulnerabilidade
- Prova de conceito ou código de exploit (se possível)
- Impacto potencial da vulnerabilidade

### O que esperar:

- Confirmaremos o recebimento do seu relatório em **24 horas**
- Forneceremos uma avaliação inicial em **72 horas**
- Manteremos você atualizado sobre o progresso da correção
- Creditaremos você publicamente pela descoberta (se desejar)

## Práticas de Segurança Implementadas

### ✅ Autenticação e Autorização
- [x] Autenticação JWT via Supabase
- [x] TOTP/2FA para autenticação de dois fatores
- [x] Middleware de autenticação em rotas administrativas
- [x] Row Level Security (RLS) no banco de dados
- [x] Proteção constant-time em comparações TOTP

### ✅ Proteção contra Ataques
- [x] **SSRF Prevention:** Whitelist de domínios em proxy de imagens
- [x] **Rate Limiting:** Proteção contra força bruta e DDoS
- [x] **File Upload Validation:** Validação de tipo, tamanho e magic bytes
- [x] **SQL Injection:** Uso de prepared statements via Supabase
- [x] **XSS Protection:** Nenhum uso de v-html ou dangerouslySetInnerHTML
- [x] **Path Traversal:** Sanitização de nomes de arquivo
- [x] **Code Injection:** Nenhum uso de eval() ou Function()

### ✅ Segurança de Dados
- [x] Credenciais nunca hardcoded no código
- [x] Secrets armazenados em variáveis de ambiente
- [x] .env no .gitignore
- [x] Logging de eventos de segurança (login, upload, etc.)
- [x] Mascaramento de dados sensíveis em logs

### ✅ Headers de Segurança
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Content-Security-Policy
- [x] Strict-Transport-Security (produção)
- [x] Referrer-Policy
- [x] Permissions-Policy

### ✅ Validação de Input
- [x] Validação de força de senha
- [x] Validação de formato de email
- [x] Validação de tipos de arquivo permitidos
- [x] Limite de tamanho de upload
- [x] Sanitização de inputs do usuário

## Checklist de Segurança para Deploy

Antes de fazer deploy em produção, verifique:

- [ ] Todas as credenciais de desenvolvimento foram revogadas
- [ ] Novas credenciais de produção foram geradas
- [ ] .env não está commitado no Git
- [ ] NODE_ENV=production está configurado
- [ ] HTTPS está habilitado
- [ ] Migrations de segurança foram aplicadas
- [ ] Rate limiting está configurado com Redis (não memória)
- [ ] Logs de segurança estão sendo monitorados
- [ ] Backup automatizado está configurado
- [ ] Dependências foram auditadas (npm audit)

## Ferramentas de Segurança

Execute regularmente:

```bash
# Verificação automatizada
bash scripts/security-check.sh

# Auditoria de dependências
npm audit

# Correção automática de vulnerabilidades
npm audit fix

# Análise estática de código (se configurado)
npm run lint
```

## Contato de Segurança

Para questões de segurança não urgentes, use:
- 📧 Email: [SEU-EMAIL]
- 💬 [Outro canal de comunicação seguro]

## Histórico de Vulnerabilidades

Nenhuma vulnerabilidade foi reportada publicamente até o momento.

---

**Última atualização:** 22 de Julho de 2026
