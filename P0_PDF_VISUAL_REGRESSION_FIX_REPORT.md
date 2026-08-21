# Relatório de Diagnóstico e Correção — Regressão Visual do PDF e Preservação de Segurança P0

**Projeto:** Qualitec 2.0  
**Data:** 20/08/2026  
**Commit Pré-P0 de Referência:** `df98d91` (`feat(settings): personalizacao da area de busca, input, faixas divisorias e reset de filtros no catalogo`)  
**Status:** `AWAITING USER REVIEW`  
**Deploy em Produção:** `NOT PERFORMED`  

---

## 1. Diagnóstico e Causa Raiz

### A. Investigação do Banco de Dados
- **Os valores do banco de dados foram alterados?** **NÃO.**  
  Todas as configurações de layout, dimensões, offsets, cores e tipografia de todas as 7 categorias (incluindo `REGULADORES DE PRESSÃO`, `GERAL`, `VÁLVULAS DE SEGURANÇA`, `TRANSMISSORES DE PRESSÃO`, etc.) permanecem **100% intactas no banco de dados Supabase**.

### B. Investigação do Código do Gerador de PDF
- **O código de renderização do PDF foi alterado no P0?** **NÃO.**  
  `app/utils/pdfBuilder.ts`, `app/utils/pdfDrawHelpers.ts`, `app/utils/pdfLayoutDrawers.ts`, `app/utils/pdfDocUtils.ts` e `app/config/defaultPdfSettings.ts` têm `git diff` vazio em relação ao commit pré-P0 `df98d91`.

### C. A Causa Raiz Real:
No fluxo anterior ao P0, o composable `usePdfSettings.ts` consultava diretamente a tabela `pdf_settings` (`.from('pdf_settings').select('*')`).  
Após a aplicação do P0, o acesso público direto foi bloqueado por RLS e a leitura foi canalizada através do endpoint seguro `/api/public/settings.get.ts`.

Entretanto, a sanitização inicial introduzida em `/api/public/settings.get.ts` filtrava estritamente o objeto `layout_settings` e a lista de colunas de nível superior, **omitindo**:
1. **Os blocos de slots numéricos do PDF:** As chaves de slots `'1'`, `'2'`, `'3'`, `'4'`, `'6'` em `layout_settings` (que definem overrides específicos por quantidade de produtos na página, tais como `cardLayoutOrder: 'image-first'`, `specsBgColor: '#E6E7E8'`, `tagOffsetX: '-350px'`, `cardModelOffsetX: '330px'`, `headerHeight: '34'`, `fontSizeSpecs: '8px'`, `titlePositionY: '-13px'`).
2. **58 colunas de nível superior de estilização:** `specs_bg_color`, `title_color`, `specs_val_bold`, `landscape_settings`, `card_title_font_size`, `logo_width`, `logo_height`, `badge_icon_size`, etc.
3. **Propriedades visuais do site em `site_settings`**.

Como consequência, ao gerar o PDF para páginas com 3 produtos (como **REGULADORES DE PRESSÃO: GDR, 591, 505**), `CatalogPdfTemplate.vue` tentava ler `settings.layout_settings['3']` e recebia `undefined`, recorrendo aos fallbacks genéricos de default e provocando o desalinhamento visual observado.

---

## 2. Comparativo de Campos Omitidos vs. Recuperados

| Propriedade / Slot | Estado no Banco | Estado Anterior pós-P0 | Estado Atual Corrigido | Impacto Visual no PDF |
| :--- | :---: | :---: | :---: | :--- |
| `layout_settings['3'].cardLayoutOrder` | `image-first` | *omitido (undefined)* | `image-first` | Inversão/Ordem correta de imagem e tabela |
| `layout_settings['3'].specsBgColor` | `#E6E7E8` | *omitido (undefined)* | `#E6E7E8` | Fundo cinza das especificações técnicas |
| `layout_settings['3'].tagOffsetX` | `-350px` | *omitido (undefined)* | `-350px` | Posição horizontal da tag de categoria |
| `layout_settings['3'].cardModelOffsetX` | `330px` | *omitido (undefined)* | `330px` | Posição horizontal do modelo do produto |
| `layout_settings['3'].headerHeight` | `34` | *omitido (undefined)* | `34` | Altura do cabeçalho do card do produto |
| `layout_settings['3'].titlePositionY` | `-13px` | *omitido (undefined)* | `-13px` | Posição vertical do título do card |
| `layout_settings['3'].specsLineStyle` | `dotted` | *omitido (undefined)* | `dotted` | Estilo pontilhado das linhas de specs |
| `layout_settings['1']` (Slot 1) | Objeto JSON | *omitido (undefined)* | Preservado | Layout para produtos de página cheia |
| `layout_settings['6']` (Slot 6) | Objeto JSON | *omitido (undefined)* | Preservado | Layout para produtos compactos de 6 slots |
| `specs_bg_color` (Top-level) | `#F1F1F1` | *omitido* | `#F1F1F1` | Cor de fundo padrão de specs |
| `title_color` (Top-level) | `#7F7F7F` | *omitido* | `#7F7F7F` | Cor do título principal |
| `landscape_settings` (JSONB) | Objeto JSON | *omitido* | Preservado | Configurações para orientação paisagem |
| `site_settings` (236 chaves) | 236 chaves | 45 chaves | 236 chaves | Cores, faixas, botões e estilos do site |

---

## 3. Mudanças Realizadas em `app/server/api/public/settings.get.ts`

1. **`ALLOWED_TOP_LEVEL_COLUMNS`:**  
   Expandida para incluir todas as 110 colunas visuais legítimas de `public.pdf_settings` (incluindo `landscape_settings`).
2. **`sanitizeSlotOverrides`:**  
   Implementada sanitização profunda recursiva para todos os blocos de slots (`'1'`, `'2'`, `'3'`, `'4'`, `'6'`, `'custom'`, `'booklet'`, etc.), permitindo apenas valores primitivos (strings de até 500 caracteres, números finitos e booleanos).
3. **`sanitizeSiteSettings`:**  
   Sanitização estrita que permite todas as chaves visuais escalares (strings, números, booleanos) e **bloqueia ativamente qualquer chave de PII ou credencial** (`contact_submissions`, `newsletter_subscribers`, `contacts`, `subscribers`, `leads`, `password`, `token`, `secret`, `service_role`).
4. **Isolamento de PII Legada:**  
   Garantido que os arrays legados `contact_submissions` e `newsletter_subscribers` contidos em `GERAL` **nunca sejam serializados nem retornados pelo endpoint público**.

---

## 4. Auditoria de Segurança e RLS

| Verificação de Segurança | Estado |
| :--- | :---: |
| **RLS na tabela `pdf_settings`** | **ATIVO (100%)** |
| **Acesso direto `anon` a `pdf_settings`** | **BLOQUEADO (`42501 permission denied`)** |
| **Acesso direto `authenticated` a `pdf_settings`** | **BLOQUEADO (`42501 permission denied`)** |
| **Vazamento de PII em `/api/public/settings`** | **NENHUM (Zero leads / Zero contatos)** |
| **Exposição de Secrets / Service Role / Tokens** | **NENHUMA** |
| **Validação de Administrador em endpoints `/api/admin/*`** | **INTACTA (`401/403`)** |
| **Separação `supabaseAuth` e `supabaseAdmin`** | **INTACTA** |

---

## 5. Resultados dos Testes Automatizados

Executados localmente via `scripts/test_p0_pdf_visual_recovery.mjs`:
- `1. Acesso direto anônimo a pdf_settings`: **PASS (BLOQUEADO)**
- `2. Verificação de PII no Payload Público`: **PASS (NONE)**
- `3. Recuperação de Overrides de Slot 3 (Reguladores: GDR, 591, 505)`: **PASS (image-first, #E6E7E8)**
- `4. Resolução em Tempo de Renderização (CatalogPdfTemplate getPageSettings)`: **PASS**
- `5. Preservação de Slots de Todas as Demais Categorias`: **PASS (7/7 categorias)**

**Build de Produção Local (`npm run build`):** **PASS (Código 0)**  
**Deploy em Produção:** **NÃO REALIZADO (Aguardando revisão)**
