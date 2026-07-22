# Script de verificação de segurança para Windows PowerShell
# Execute com: powershell -ExecutionPolicy Bypass -File scripts/security-check.ps1

Write-Host "🔒 Iniciando verificação de segurança..." -ForegroundColor Cyan
Write-Host ""

$Issues = 0

# 1. Verifica se .env está no gitignore
Write-Host "1️⃣ Verificando .gitignore..." -ForegroundColor Yellow
if (Select-String -Path .gitignore -Pattern "^\.env$" -Quiet) {
    Write-Host "✓ .env está no .gitignore" -ForegroundColor Green
} else {
    Write-Host "✗ .env NÃO está no .gitignore" -ForegroundColor Red
    $Issues++
}

# 2. Verifica se .env está commitado
Write-Host ""
Write-Host "2️⃣ Verificando se .env está no Git..." -ForegroundColor Yellow
$envInGit = git ls-files --error-unmatch .env 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✗ CRÍTICO: .env está commitado no Git!" -ForegroundColor Red
    Write-Host "  Execute: git rm --cached .env && git commit -m 'Remove .env'" -ForegroundColor Yellow
    $Issues++
} else {
    Write-Host "✓ .env não está commitado" -ForegroundColor Green
}

# 3. Verifica dependências vulneráveis
Write-Host ""
Write-Host "3️⃣ Verificando dependências (npm audit)..." -ForegroundColor Yellow
$auditResult = npm audit --audit-level=moderate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Nenhuma vulnerabilidade moderada ou acima encontrada" -ForegroundColor Green
} else {
    Write-Host "⚠ Vulnerabilidades encontradas nas dependências" -ForegroundColor Yellow
    Write-Host "  Execute: npm audit fix" -ForegroundColor Yellow
    $Issues++
}

# 4. Verifica se middlewares existem
Write-Host ""
Write-Host "4️⃣ Verificando middlewares de segurança..." -ForegroundColor Yellow
$middlewares = @(
    "app/server/middleware/auth.ts",
    "app/server/middleware/rate-limit.ts",
    "app/server/middleware/security-headers.ts"
)

foreach ($middleware in $middlewares) {
    if (Test-Path $middleware) {
        Write-Host "✓ $middleware existe" -ForegroundColor Green
    } else {
        Write-Host "✗ $middleware NÃO encontrado" -ForegroundColor Red
        $Issues++
    }
}

# 5. Verifica secrets hardcoded no código
Write-Host ""
Write-Host "5️⃣ Buscando secrets hardcoded..." -ForegroundColor Yellow
$secretsFound = Select-String -Path "*.ts","*.js","*.vue" `
    -Pattern '(password|secret|api_key|token).*=.*[''"][a-zA-Z0-9]{10,}' `
    -Exclude "security-check.ps1","security-check.sh" `
    -Recurse `
    -ErrorAction SilentlyContinue

if ($null -eq $secretsFound) {
    Write-Host "✓ Nenhum secret hardcoded encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠ Possíveis secrets hardcoded encontrados:" -ForegroundColor Yellow
    $secretsFound | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    $Issues++
}

# 6. Verifica uso de eval ou Function (code injection)
Write-Host ""
Write-Host "6️⃣ Buscando eval() ou Function()..." -ForegroundColor Yellow
$evalFound = Select-String -Path "*.ts","*.js","*.vue" `
    -Pattern '(eval\(|Function\()' `
    -Recurse `
    -ErrorAction SilentlyContinue `
    | Where-Object { $_.Path -notmatch 'node_modules|\.nuxt|\.output' }

if ($null -eq $evalFound) {
    Write-Host "✓ Nenhum eval() ou Function() encontrado" -ForegroundColor Green
} else {
    Write-Host "✗ eval() ou Function() encontrado (risco de code injection):" -ForegroundColor Red
    $evalFound | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $Issues++
}

# 7. Verifica v-html (XSS risk)
Write-Host ""
Write-Host "7️⃣ Buscando v-html (risco XSS)..." -ForegroundColor Yellow
$vhtmlFound = Select-String -Path "*.vue" `
    -Pattern 'v-html' `
    -Recurse `
    -ErrorAction SilentlyContinue `
    | Where-Object { $_.Path -notmatch 'node_modules|\.nuxt|\.output' }

if ($null -eq $vhtmlFound) {
    Write-Host "✓ Nenhum v-html encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠ v-html encontrado (verifique sanitização):" -ForegroundColor Yellow
    $vhtmlFound | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    $Issues++
}

# 8. Verifica console.log em produção
Write-Host ""
Write-Host "8️⃣ Buscando console.log..." -ForegroundColor Yellow
$consoleCount = (Select-String -Path "*.ts","*.js","*.vue" `
    -Pattern 'console\.(log|error|warn|info)' `
    -Recurse `
    -ErrorAction SilentlyContinue `
    | Where-Object { $_.Path -notmatch 'node_modules|\.nuxt|\.output|security-check' }).Count

if ($consoleCount -eq 0) {
    Write-Host "✓ Nenhum console.log encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠ $consoleCount console.log encontrados" -ForegroundColor Yellow
    Write-Host "  Considere remover ou substituir por logger em produção" -ForegroundColor Yellow
}

# Resumo
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 RESUMO DA VERIFICAÇÃO" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($Issues -eq 0) {
    Write-Host "✓ Nenhum problema crítico encontrado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Recomendações:"
    Write-Host "  • Execute testes manuais de segurança"
    Write-Host "  • Revise logs de autenticação regularmente"
    Write-Host "  • Mantenha dependências atualizadas"
    exit 0
} else {
    Write-Host "✗ $Issues problema(s) encontrado(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ação necessária:"
    Write-Host "  • Revise os problemas listados acima"
    Write-Host "  • Consulte INSTRUCOES_SEGURANCA_CRITICAS.md"
    Write-Host "  • Aplique as correções recomendadas"
    exit 1
}
