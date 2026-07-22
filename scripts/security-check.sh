#!/bin/bash

# Script de verificação de segurança
# Execute com: bash scripts/security-check.sh

echo "🔒 Iniciando verificação de segurança..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de problemas
ISSUES=0

# 1. Verifica se .env está no gitignore
echo "1️⃣ Verificando .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✓ .env está no .gitignore${NC}"
else
    echo -e "${RED}✗ .env NÃO está no .gitignore${NC}"
    ((ISSUES++))
fi

# 2. Verifica se .env está commitado
echo ""
echo "2️⃣ Verificando se .env está no Git..."
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo -e "${RED}✗ CRÍTICO: .env está commitado no Git!${NC}"
    echo "  Execute: git rm --cached .env && git commit -m 'Remove .env'"
    ((ISSUES++))
else
    echo -e "${GREEN}✓ .env não está commitado${NC}"
fi

# 3. Verifica dependências vulneráveis
echo ""
echo "3️⃣ Verificando dependências (npm audit)..."
if npm audit --audit-level=moderate > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Nenhuma vulnerabilidade moderada ou acima encontrada${NC}"
else
    echo -e "${YELLOW}⚠ Vulnerabilidades encontradas nas dependências${NC}"
    echo "  Execute: npm audit fix"
    ((ISSUES++))
fi

# 4. Verifica se middlewares existem
echo ""
echo "4️⃣ Verificando middlewares de segurança..."
MIDDLEWARES=(
    "app/server/middleware/auth.ts"
    "app/server/middleware/rate-limit.ts"
    "app/server/middleware/security-headers.ts"
)

for middleware in "${MIDDLEWARES[@]}"; do
    if [ -f "$middleware" ]; then
        echo -e "${GREEN}✓ $middleware existe${NC}"
    else
        echo -e "${RED}✗ $middleware NÃO encontrado${NC}"
        ((ISSUES++))
    fi
done

# 5. Verifica secrets hardcoded no código
echo ""
echo "5️⃣ Buscando secrets hardcoded..."
SECRETS_FOUND=$(grep -r -i -E "(password|secret|api_key|token).*=.*['\"][a-zA-Z0-9]{10,}" \
    --include="*.ts" --include="*.js" --include="*.vue" \
    --exclude-dir=node_modules --exclude-dir=.nuxt --exclude-dir=.output \
    --exclude="security-check.sh" \
    . 2>/dev/null || true)

if [ -z "$SECRETS_FOUND" ]; then
    echo -e "${GREEN}✓ Nenhum secret hardcoded encontrado${NC}"
else
    echo -e "${YELLOW}⚠ Possíveis secrets hardcoded encontrados:${NC}"
    echo "$SECRETS_FOUND"
    ((ISSUES++))
fi

# 6. Verifica uso de eval ou Function (code injection)
echo ""
echo "6️⃣ Buscando eval() ou Function()..."
EVAL_FOUND=$(grep -r -E "(eval\(|Function\()" \
    --include="*.ts" --include="*.js" --include="*.vue" \
    --exclude-dir=node_modules --exclude-dir=.nuxt --exclude-dir=.output \
    . 2>/dev/null || true)

if [ -z "$EVAL_FOUND" ]; then
    echo -e "${GREEN}✓ Nenhum eval() ou Function() encontrado${NC}"
else
    echo -e "${RED}✗ eval() ou Function() encontrado (risco de code injection):${NC}"
    echo "$EVAL_FOUND"
    ((ISSUES++))
fi

# 7. Verifica v-html (XSS risk)
echo ""
echo "7️⃣ Buscando v-html (risco XSS)..."
VHTML_FOUND=$(grep -r "v-html" \
    --include="*.vue" \
    --exclude-dir=node_modules --exclude-dir=.nuxt --exclude-dir=.output \
    . 2>/dev/null || true)

if [ -z "$VHTML_FOUND" ]; then
    echo -e "${GREEN}✓ Nenhum v-html encontrado${NC}"
else
    echo -e "${YELLOW}⚠ v-html encontrado (verifique sanitização):${NC}"
    echo "$VHTML_FOUND"
    ((ISSUES++))
fi

# 8. Verifica console.log em produção
echo ""
echo "8️⃣ Buscando console.log..."
CONSOLE_COUNT=$(grep -r -E "console\.(log|error|warn|info)" \
    --include="*.ts" --include="*.js" --include="*.vue" \
    --exclude-dir=node_modules --exclude-dir=.nuxt --exclude-dir=.output \
    --exclude="security-check.sh" \
    . 2>/dev/null | wc -l || echo "0")

if [ "$CONSOLE_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ Nenhum console.log encontrado${NC}"
else
    echo -e "${YELLOW}⚠ $CONSOLE_COUNT console.log encontrados${NC}"
    echo "  Considere remover ou substituir por logger em produção"
fi

# Resumo
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ Nenhum problema crítico encontrado!${NC}"
    echo ""
    echo "Recomendações:"
    echo "  • Execute testes manuais de segurança"
    echo "  • Revise logs de autenticação regularmente"
    echo "  • Mantenha dependências atualizadas"
    exit 0
else
    echo -e "${RED}✗ $ISSUES problema(s) encontrado(s)${NC}"
    echo ""
    echo "Ação necessária:"
    echo "  • Revise os problemas listados acima"
    echo "  • Consulte INSTRUCOES_SEGURANCA_CRITICAS.md"
    echo "  • Aplique as correções recomendadas"
    exit 1
fi
