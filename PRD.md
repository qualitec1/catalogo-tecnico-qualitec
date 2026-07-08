# PRD — Sistema de Catálogo Técnico Qualitec

## 1. Visão Geral do Produto

O sistema é uma aplicação web para geração e gestão de catálogos técnicos de equipamentos industriais da empresa Qualitec. Permite que usuários públicos naveguem e filtrem produtos, selecionem itens e baixem catálogos em PDF personalizados. Administradores gerenciam o catálogo completo via painel restrito.

**Stack:**
- Frontend: Nuxt 3 (Vue 3) + TailwindCSS
- Backend: Nitro (servidor do Nuxt) com API routes
- Banco de dados: Supabase (PostgreSQL)
- Storage de arquivos: Cloudflare R2 (S3-compatible)
- Geração de PDF: jsPDF (client-side)

---

## 2. Usuários e Papéis

| Papel | Acesso | Identificação |
|---|---|---|
| Visitante Público | Página de catálogo (`/`) | Sem autenticação |
| Administrador | Painel admin (`/admin-secreto-x9f2`) | Email + senha + TOTP opcional |

---

## 3. Módulos do Sistema

### 3.1 Página de Catálogo Público (`/`)

**Objetivo:** Permitir que visitantes explorem o catálogo de equipamentos e gerem PDFs personalizados.

**Funcionalidades:**

**Listagem de Produtos**
- Carrega todos os produtos do Supabase (`products`) ordenados por ID
- Exibe cards com: imagem, código do modelo (`name_code`), título, tag colorida, categoria e specs técnicas
- Pré-seleciona todos os produtos ao carregar
- Há uma regra de negócio hardcoded: o produto `TRANS-15554` é sempre posicionado no topo da lista

**Filtros**
- Busca por texto: filtra por `title`, `name_code` e `tag`
- Filtro por categoria: dropdown com todas as categorias únicas do banco
- Paginação básica (3 páginas)

**Seleção de Produtos**
- Cada card possui checkbox de seleção
- Botões "Selecionar Todos" e "Limpar Seleção" operam sobre os produtos filtrados
- O contador de selecionados aparece nos botões de download

**Download de Catálogo**
- Botão "Baixar Catálogo Técnico" → abre modal `CatalogPrintModal`
- Botão "Baixar em Power Point" → mesmo modal, mas com flag de landscape
- O modal pede qual capa usar:
  - **Dinâmica**: usa a capa da categoria se todos os produtos selecionados forem da mesma; senão usa "GERAL"
  - **GERAL**: força capa geral
  - **Específica**: admin pode criar capas por categoria

**Lógica de PDF Inteligente (Cache)**
- Se o usuário selecionar todos os produtos de uma categoria E essa categoria tiver um PDF publicado (`pdf_url` em `category_assets`), o sistema abre diretamente o PDF publicado em nova aba, sem regenerar
- Caso contrário, aciona a geração do PDF on-the-fly via `CatalogPdfTemplate`

**Modal de Imagem Ampliada**
- Clique na imagem de qualquer produto abre modal com zoom/pan
- Suporte a mouse (drag), touch (mobile) e scroll do mouse
- Zoom de 50% a 400%, com botões de controle e reset

---

### 3.2 Painel Administrativo (`/admin-secreto-x9f2`)

URL deliberadamente ofuscada para segurança por obscuridade. Requer autenticação.

**Aba Equipamentos**

Gerenciamento completo de produtos:

- **Tabela de Produtos**: lista todos com ações de editar e excluir por linha; botão para excluir todos
- **Formulário de Cadastro**: campos para título, código, categoria, tag, imagem, datasheet, specs técnicas, layout, escala/offset da imagem
- **Modal de Edição**: mesmo formulário em modal com produto pré-preenchido
- **Importação CSV**: upload de arquivo `.csv` para importação em massa

**Formato do CSV de importação:**

| Coluna | Obrigatório | Descrição |
|---|---|---|
| `title` | sim | Nome do equipamento |
| `name_code` | sim | Código do modelo |
| `category` | sim | Categoria (convertida para maiúsculas) |
| `tag` | não | Label (ex: "NOVO", "ATIVO") |
| `layout_slots` | não | 1 = 6/pág, 2 = 2/pág, 6 = 1/pág |
| `image_url` | não | URL pública da imagem |
| `datasheet_url` | não | URL do PDF do datasheet |
| `specs` | não | Formato `Label:Valor;Label2:Valor2` |
| `ex_image_url` | não | URL de imagem auxiliar |
| Colunas extras | não | Viram specs automaticamente |

O parser CSV suporta delimitador `;` ou `,` e campos com aspas.

**Aba Categorias & Customização PDF**

Gerenciamento de categorias e design do catálogo:

- Criar, editar e excluir categorias
- Ao renomear uma categoria, todos os produtos daquela categoria são atualizados automaticamente
- Replicar configurações de uma categoria para várias outras (seleção de campos específicos)
- Publicar catálogo oficial: gera PDF e salva a URL em `category_assets.pdf_url`

**Subcomponentes de configuração de PDF por categoria:**
- `AdminCategoryBaseSettings`: nome, cor, imagem de capa, ícone, badge
- `AdminCategoryPdfSettings`: configurações gerais de layout do PDF
- `AdminPdfCardSettings`: layout do card (offsets, tamanhos, posições)
- `AdminPdfCoverSettings`: tipografia e posicionamento da capa
- `AdminPdfFontStylesSettings`: família, tamanho, negrito/itálico/sublinhado por elemento
- `AdminPdfLayoutSettings`: layout por número de produtos por página
- `AdminPdfLogoSettings`: dimensões e posição do logo
- `AdminPdfSpecsSettings`: largura de colunas, espaçamento, estilo de linha
- `AdminPdfTitleSettings`: tipografia do título da categoria no header

---

### 3.3 Sistema de Autenticação

**Fluxo de Login:**
1. POST `/api/auth/login` com `email`, `password` e `totp` (opcional)
2. Supabase Auth valida credenciais via `signInWithPassword`
3. Se o usuário tiver TOTP habilitado (`totp_secrets.enabled = true`), o código TOTP é validado no servidor antes de conceder acesso
4. Em caso de sucesso, dois cookies HTTPOnly são setados:
   - `sb-access-token` (expira em `session.expires_in`, padrão 1h)
   - `sb-refresh-token` (expira em 30 dias)
5. Retorna dados básicos do usuário

**TOTP (2FA):**
- Implementação própria sem biblioteca externa (HMAC-SHA1)
- Janela de tolerância de ±2 períodos (60s de margem)
- Compatível com apps TOTP padrão (Google Authenticator, etc.)
- Setup via POST `/api/auth/totp/setup`

**Middleware de Rota:**
- `middleware/auth.ts` protege todas as rotas exceto `/` e `/login`
- Valida sessão via GET `/api/auth/session` antes de carregar a rota
- Redireciona para `/login?redirect=...` se não autenticado

**Refresh de Token:**
- POST `/api/auth/refresh` renova o access token usando o refresh token do cookie

---

### 3.4 Geração de PDF

**Engine:** jsPDF, geração 100% client-side no browser.

**Estrutura do documento:**

```
PDF
├── Capa (cover page)
│   ├── Imagem de fundo da categoria
│   ├── Logo da empresa
│   ├── Título da categoria
│   ├── Subtítulo
│   └── Badge opcional (ícone + texto)
└── Páginas de produtos (uma por grupo)
    ├── Header (cor da categoria + título + badge)
    ├── Conteúdo (layout baseado em slots)
    └── Footer (número da página / total)
```

**Layouts de produto por página:**

| `layout_slots` no banco | Produtos/página | Função |
|---|---|---|
| 1 | 6 produtos | `drawLayout6` |
| 3 | 2 produtos | `drawLayout3` (padrão) |
| 6 | 1 produto | `drawLayout1` |

**Orientações:**
- Portrait: A4 210×297mm
- Landscape: A4 297×210mm (ativado por categoria ou pelo botão PowerPoint)
- `landscape_settings` no banco permite sobrescrever qualquer configuração de portrait para o modo paisagem

**Registro de fontes:**
- Fontes carregadas sob demanda via `/api/font?name=<arquivo.ttf>`
- Apenas as fontes efetivamente usadas nas configurações ativas são carregadas
- Validação de magic bytes TTF para evitar arquivos corrompidos
- Fontes disponíveis: Inter, Verdana, Roboto, Calibri, HankenGrotesk, Outfit, e mais

**Configurações por categoria (`pdf_settings`):**
Mais de 100 campos configuráveis incluindo:
- Tipografia por elemento (título, modelo, tag, specs, capa)
- Cores por elemento
- Posicionamentos e offsets (x, y)
- Escala de imagem do produto (global, por eixo)
- Layout de cards (image-first / specs-first)
- Posição da imagem (left / right)
- Estilos de linha separadora
- Configurações por número de slots (layout_settings JSONB)

---

### 3.5 Upload de Imagens

**Endpoint:** POST `/api/upload-r2`

- Recebe arquivo via `multipart/form-data` (campo `file`)
- Sanitiza o nome: lowercase, remove acentos, substitui caracteres especiais por `_`
- Gera nome único: `{timestamp}_{random6chars}_{nome-sanitizado}.ext`
- Faz upload para Cloudflare R2 via AWS S3 SDK
- Retorna URL pública: `{R2_PUBLIC_URL}/{filename}`

**Configuração necessária:**
```
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ENDPOINT
R2_BUCKET_NAME
R2_PUBLIC_URL
```

---

### 3.6 APIs do Servidor

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login com email/senha/TOTP | Público |
| POST | `/api/auth/logout` | Logout (limpa cookies) | Público |
| GET | `/api/auth/session` | Verifica sessão atual | Público |
| POST | `/api/auth/refresh` | Renova access token | Público |
| POST | `/api/auth/register` | Cria novo usuário (admin) | Servidor |
| POST | `/api/auth/totp/setup` | Configura TOTP para usuário | Autenticado |
| POST | `/api/admin/products` | Cria produto | Servidor |
| PUT | `/api/admin/products?id=` | Atualiza produto | Servidor |
| DELETE | `/api/admin/products?id=` | Remove produto (ou `id=all`) | Servidor |
| GET | `/api/product-image?id=` | Proxy de imagem do produto | Público |
| GET | `/api/proxy-image?url=` | Proxy genérico para imagens externas | Público |
| GET | `/api/font?name=` | Serve fontes TTF do servidor | Público |
| GET | `/api/datasheet` | Serve datasheets | Público |
| POST | `/api/upload-r2` | Upload de arquivo para R2 | Servidor |

---

## 4. Modelo de Dados

### `products`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | bigint (identity) | PK auto-incremento |
| `title` | text | Nome completo do equipamento |
| `name_code` | text | Código do modelo (ex: TRANS-15554) |
| `category` | text | Categoria em maiúsculas |
| `image` | text | URL ou caminho da imagem principal |
| `datasheet_name` | text | Nome do arquivo de datasheet |
| `datasheet_url` | text | URL do datasheet |
| `tag` | text | Label de status (padrão: "NOVO") |
| `tag_color_class` | text | Classe CSS da cor da tag |
| `bg_class` | text | Classe CSS do fundo do card |
| `layout_slots` | int | Controla produtos por página no PDF |
| `specs` | jsonb | Array `[{label, value}]` de especificações |
| `image_scale` | numeric | Escala da imagem no PDF (padrão: 1.0) |
| `image_offset_x/y` | numeric | Offset da imagem no PDF |
| `sort_order` | int | Ordenação manual (não usada atualmente) |
| `card_layout` | text | Override de layout específico do produto |
| `ex_image_url` | text | URL de imagem auxiliar/alternativa |
| `model3d_url` | text | URL de modelo 3D (futuro) |

### `category_assets`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | PK |
| `category` | text (unique) | Nome da categoria |
| `cover_image_url` | text | URL da imagem de capa |
| `cover_image_blob` | bytea | Blob da imagem de capa (armazenamento legado) |
| `color_hex` | text | Cor primária da categoria |
| `pdf_url` | text | URL do PDF oficial publicado |
| `icon_url` | text | URL do ícone da categoria |
| `badge_text` | text | Texto do badge na capa |
| `badge_icon_url` | text | URL do ícone do badge |

### `pdf_settings`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | PK |
| `category` | text (unique) | Referência à categoria |
| `orientation` | text | `portrait` ou `landscape` |
| `layout_settings` | jsonb | Config por número de slots (`{"1":{...}, "3":{...}, "6":{...}}`) |
| `landscape_settings` | jsonb | Overrides de portrait para modo paisagem |
| + ~90 campos | variados | Tipografia, cores, posições, escalas, estilos |

### `pdf_templates`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | Nome do template |
| `html_content` | text | Conteúdo HTML (não usado ativamente) |
| `css_content` | jsonb | Configurações CSS |

### `profiles`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | FK para `auth.users` |
| `full_name` | text | Nome completo |
| `avatar_url` | text | URL do avatar |
| `phone` | text | Telefone |
| `bio` | text | Bio |

### `totp_secrets`
| Campo | Tipo | Descrição |
|---|---|---|
| `user_id` | uuid (PK) | FK para `auth.users` |
| `secret` | text | Secret TOTP em base32 |
| `enabled` | boolean | Se 2FA está ativo |

---

## 5. Catálogo Atual de Produtos

73 produtos em 12 categorias:

| Categoria | Qtd |
|---|---|
| SISTEMAS DE CONTROLE DE PRESSAO | 17 |
| VÁLVULAS GLOBO | 8 |
| REGULADORES DE PRESSAO | 8 |
| VÁLVULAS DE ALÍVIO CRIOGÊNICA | 8 |
| VÁLVULAS RETENÇÃO | 7 |
| INSTRUMENTAÇÃO – TRANSMISSORES PRESSÃO | 4 |
| INSTRUMENTAÇÃO - MANÔMETROS | 4 |
| VÁLVULAS DE SEGURANÇA CRIOGÊNICA | 4 |
| VÁLVULAS DE ESFERA | 4 |
| INSTRUMENTAÇÃO – TEMPERATURA | 4 |
| VÁLVULAS GAVETA | 3 |
| VÁLVULAS DIVERSORAS – 3 VIAS | 2 |

---

## 6. Fluxos Principais

### Fluxo: Usuário baixa catálogo PDF

```
1. Usuário acessa /
2. Sistema carrega produtos e assets de categoria do Supabase
3. Todos os produtos são pré-selecionados
4. Usuário filtra e/ou altera seleção
5. Clica em "Baixar Catálogo Técnico"
6. Modal pergunta qual capa usar
7. Sistema verifica:
   a. Se seleção = todos da categoria + PDF publicado existe → abre URL do R2
   b. Caso contrário → aciona CatalogPdfTemplate
8. CatalogPdfTemplate:
   a. Carrega configurações de PDF da categoria (pdf_settings)
   b. Carrega assets da categoria (category_assets)
   c. Pré-carrega todas as imagens dos produtos via proxy
   d. Registra fontes necessárias via /api/font
   e. Chama buildCatalogPdf()
   f. jsPDF monta documento: capa + páginas por categoria
   g. Aciona download do arquivo .pdf
```

### Fluxo: Admin publica catálogo oficial

```
1. Admin acessa /admin-secreto-x9f2 (autenticado)
2. Na aba Categorias, clica em "Publicar Catálogo" de uma categoria
3. Sistema pega todos os produtos daquela categoria
4. Aciona CatalogPdfTemplate em modo publishMode=true
5. PDF gerado client-side
6. PDF enviado via POST /api/upload-r2 para o Cloudflare R2
7. URL pública retornada é salva em category_assets.pdf_url
8. Próximas visitas que selecionarem todos os produtos daquela categoria
   receberão o PDF publicado diretamente, sem regenerar
```

### Fluxo: Admin importa produtos via CSV

```
1. Admin faz upload do arquivo .csv
2. Sistema detecta delimitador (;  ou ,)
3. Parser próprio lida com campos com aspas e quebras de linha
4. Headers mapeados: title, name_code, category, tag, layout_slots,
   image_url, datasheet_url, specs, ex_image_url
5. Colunas extras (fora do mapeamento padrão) viram specs automaticamente
6. layout_slots convertido: CSV 1→DB 6, CSV 2→DB 3, CSV 6→DB 1
7. Todos os registros inseridos em batch no Supabase
8. Lista de produtos recarregada
```

---

## 7. Pontos de Atenção e Débitos Técnicos

### Segurança
- 5 tabelas sem RLS habilitado (`products`, `category_assets`, `pdf_settings`, `pdf_templates`, `totp_secrets`) — qualquer pessoa com a anon key pode ler e modificar dados
- A URL do painel admin é o único mecanismo de segurança por obscuridade para a rota — não há verificação de role/permissão no backend
- API routes de admin (`/api/admin/products`) não verificam autenticação explicitamente — dependem da obscuridade da URL
- Secrets TOTP armazenados em texto claro na tabela (sem criptografia adicional)

### Arquitetura
- Geração de PDF 100% client-side: pode ser lento ou falhar em dispositivos com pouca memória com catálogos grandes
- Imagens de capa armazenadas como `bytea` no banco (legado) — migração para R2/URL em andamento
- `model3d_url` no schema de produtos indica funcionalidade de visualização 3D não implementada
- `pdf_templates` existe mas não é usada ativamente na geração

### Consistência de Dados
- Relação entre `products.category` e `category_assets.category` é por texto (não FK) — renomeações dependem de update manual em cascata (implementado no admin)
- `pdf_settings.category` igualmente por texto sem FK

---

## 8. Variáveis de Ambiente Necessárias

```env
# Supabase
SUPABASE_URL=
SUPABASE_KEY=           # anon key (client-side)
SUPABASE_SERVICE_KEY=   # service key (server-side)

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
R2_ACCOUNT_ID=          # opcional
```


📊 Banco de Dados (6 Tabelas)
products (73 produtos) - 12 categorias ativas
category_assets (14 categorias) - capas, cores, badges
pdf_settings (17 configurações) - 100+ campos de customização por categoria
pdf_templates (1 template)
profiles (0 usuários) - com RLS ativado
totp_secrets (0 configs) - autenticação 2FA
🏗️ Arquitetura Técnica
Frontend: Nuxt 3 + Vue 3 + TailwindCSS
Backend: Supabase (Postgres) + Cloudflare R2 (storage)
PDF: jsPDF (client-side) com 100+ configurações granulares
Auth: Supabase Auth + TOTP opcional
Deployment: Static site generation
✨ Funcionalidades Principais
1. Catálogo Público (/)

73 produtos em grid responsivo
Busca e filtro por categoria
Seleção múltipla de produtos
Modal de zoom de imagens avançado
Geração de PDF customizado client-side
Geração de PowerPoint (placeholder)
2. Painel Admin (/admin-secreto-x9f2)

CRUD completo de produtos
Importação CSV inteligente
Upload R2 para imagens/datasheets
Customização PDF granular (100+ campos):
3 densidades: Geral / Retrato / Paisagem
Herança de configurações
Fontes (20+ famílias)
Cores, tamanhos, posições
Layouts (1/2/6 produtos por página)
Badges personalizados
Especificações técnicas estilizadas
Offsets X/Y para cada elemento
Publicação de catálogos oficiais por categoria
3. Geração PDF Client-Side

3 modos de layout: 1/página (6 slots), 2/página (3 slots), 6/página (1 slot)
Orientação: Portrait / Landscape
Capa personalizada por categoria com logo
Cards de produto com:
Título do produto
Código/modelo (SKU)
Imagem com escala individual
Tabela de especificações técnicas
Badge/tag customizável
Bloco azul (header) e cinza (specs) com offsets independentes
Fontes dinâmicas carregadas via API
Herança de configurações (Geral → Densidade)
4. Sistema de Badges

Texto + ícone personalizáveis
Posicionamento independente
14 categorias configuradas
📐 Estrutura de Configurações PDF
GERAL (base)
  ├─ RETRATO (herda de GERAL)
  └─ PAISAGEM (herda de GERAL)
Cada densidade tem 100+ campos:

Orientação, layout, fontes, cores
Posicionamento de elementos (X/Y offsets)
Estilização (bold, italic, underline)
Dimensões de blocos (header, specs)
Logo, capa, título, subtítulo
Badges, tags, divisores
Especificações técnicas
🔐 Segurança
⚠️ RLS DESABILITADO em 5 tabelas públicas (categoria, produtos, PDF settings)
Auth opcional (login + TOTP)
Admin panel em rota secreta
Service role key para migrations
📦 Inventário Atual
73 produtos distribuídos em:
SISTEMAS DE CONTROLE DE PRESSAO (17)
VÁLVULAS GLOBO (8)
REGULADORES DE PRESSAO (8)
VÁLVULAS DE ALÍVIO CRIOGÊNICA (8)
VÁLVULAS RETENÇÃO (7)
E mais 7 categorias...

🛠️ Scripts de Manutenção
Migração de blobs para R2
Import/export de backup
Download de fontes
Upload de modelos 3D
Migrations SQL (26 arquivos)