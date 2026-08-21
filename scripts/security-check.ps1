# Script de Verificacao de Seguranca do Projeto Qualitec
Write-Host "Iniciando verificacao de seguranca..." -ForegroundColor Cyan

$Issues = 0

# 1. Verifica variaveis de ambiente
Write-Host ""
Write-Host "1. Verificando configuracao do .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "CHANGE_THIS" -or $envContent -match "your-") {
        Write-Host "[ALERTA] Valores placeholder detectados no .env" -ForegroundColor Yellow
        $Issues++
    } else {
        Write-Host "[OK] .env configurado" -ForegroundColor Green
    }
} else {
    Write-Host "[FALHA] .env nao encontrado!" -ForegroundColor Red
    $Issues++
}

# 2. Verifica .gitignore
Write-Host ""
Write-Host "2. Verificando .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    if ($gitignore -match "^\.env" -or $gitignore -match "\n\.env") {
        Write-Host "[OK] .env esta no .gitignore" -ForegroundColor Green
    } else {
        Write-Host "[FALHA] .env NAO esta no .gitignore!" -ForegroundColor Red
        $Issues++
    }
} else {
    Write-Host "[FALHA] .gitignore nao encontrado!" -ForegroundColor Red
    $Issues++
}

# 3. Verifica endpoints criticos
Write-Host ""
Write-Host "3. Verificando existencia de endpoints de autenticacao..." -ForegroundColor Yellow
$endpoints = @(
    "app/server/api/auth/login.post.ts",
    "app/server/api/auth/logout.post.ts",
    "app/server/api/auth/refresh.post.ts",
    "app/server/api/auth/session.get.ts",
    "app/server/api/auth/totp/setup.post.ts",
    "app/server/api/auth/totp/confirm.post.ts",
    "app/server/api/auth/totp/disable.post.ts"
)

foreach ($endpoint in $endpoints) {
    if (Test-Path $endpoint) {
        Write-Host "[OK] $endpoint existe" -ForegroundColor Green
    } else {
        Write-Host "[FALHA] $endpoint NAO encontrado" -ForegroundColor Red
        $Issues++
    }
}

# 4. Verifica middlewares
Write-Host ""
Write-Host "4. Verificando middlewares..." -ForegroundColor Yellow
$middlewares = @(
    "app/middleware/admin.ts"
)

foreach ($middleware in $middlewares) {
    if (Test-Path $middleware) {
        Write-Host "[OK] $middleware existe" -ForegroundColor Green
    } else {
        Write-Host "[FALHA] $middleware NAO encontrado" -ForegroundColor Red
        $Issues++
    }
}

# 5. Verifica secrets hardcoded no codigo
Write-Host ""
Write-Host "5. Buscando secrets hardcoded..." -ForegroundColor Yellow
$secretsFound = Get-ChildItem -Path "app","server" -Include *.ts,*.js,*.vue -Recurse -File -ErrorAction SilentlyContinue | `
    Select-String -Pattern '(password|secret|api_key|token)\s*=\s*[''"][a-zA-Z0-9]{20,}[''"]' -ErrorAction SilentlyContinue

if ($null -eq $secretsFound) {
    Write-Host "[OK] Nenhum secret hardcoded encontrado" -ForegroundColor Green
} else {
    Write-Host "[ALERTA] Possiveis secrets hardcoded encontrados:" -ForegroundColor Yellow
    $secretsFound | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}

# Resumo
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO DA VERIFICACAO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($Issues -eq 0) {
    Write-Host "[OK] Nenhum problema critico encontrado!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[FALHA] $Issues problema(s) encontrado(s)" -ForegroundColor Red
    exit 1
}
