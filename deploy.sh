#!/bin/bash
set -e

echo "🚀 Iniciando atualização e deploy da Qualitec 2.0..."

# Garante que o script é executado no diretório onde está localizado
cd "$(dirname "$0")"

# 1. Puxa as alterações mais recentes do GitHub
echo "📥 Baixando alterações do Git..."
git pull origin main

# 2. Reconstrói a imagem Docker e atualiza o contêiner em segundo plano
echo "🐳 Reconstruindo imagem Docker e reiniciando a aplicação..."
docker compose up -d --build

# 3. Remove imagens Docker antigas/não utilizadas para economizar espaço em disco
echo "🧹 Limpando imagens antigas desnecessárias..."
docker image prune -f

echo "✅ Aplicação atualizada e rodando com sucesso!"
