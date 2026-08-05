# Stage 1: Build da aplicação Nuxt
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de pacotes para otimização do cache de camadas
COPY package*.json ./

# Instala todas as dependências (necessárias para o build)
RUN npm ci

# Copia o código-fonte
COPY . .

# Compila a aplicação Nuxt (gerando o servidor standalone Nitro em .output)
RUN npm run build

# Stage 2: Imagem final leve de execução em Produção
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copia apenas o build compilado standalone do Nitro
COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
