# Relatório de Diagnóstico e Correção da Regressão de Mídia e Vídeo

> **Regras do projeto lidas:** `AGENTS.md`

---

## 1. Sumário Executivo

Após as recentes atualizações de segurança e deploy, foi identificada uma regressão seletiva no carregamento de imagens e mídias estáticas em produção (`https://catalogo-tecnico-qualitec.vercel.app`):
1. **Logo Qualitec no Header:** Ícone de imagem quebrada com texto alt.
2. **Hero da Página Inicial:** Imagem principal/fundo escuro não carregava.
3. **Hero Vídeo:** Vídeo MP4 do WixStatic (`video.wixstatic.com`) bloqueado com HTTP 403 pelo endpoint `/api/proxy-video` por ausência do hostname na allowlist pós-hardenting SSRF.
4. **Cards de "Principais Segmentos":** Exibiam a imagem incorreta *"Welcome to Nuxt!"*.
5. **Catálogo de Produtos e Novidades:** Continuavam funcionando normalmente através do Cloudflare R2.

A investigação confirmou que **não houve problema na infraestrutura R2 nem nas policies de segurança/RLS**. O incidente foi causado por URLs de sessão temporárias do Google Generative AI (`lh3.googleusercontent.com/aida/...`) que expiraram no CDN remoto, pela ausência do hostname `video.wixstatic.com` na allowlist do proxy de vídeo, e por um fallback local que apontava para uma imagem antiga de boas-vindas do framework (`placeholder.png`).

---

## 2. Causa Raiz Detalhada

### A. URLs Temporárias Expiradas no Banco e no Código
- No registro `category = 'GERAL'` da tabela `pdf_settings` (campo `layout_settings.site_settings`), bem como nos valores padrão dos composables e componentes (`useSiteSettings.ts`, `AdminSiteSettings.vue`, `index.vue`, `catalogo.vue`, `nossa-empresa.vue`), as propriedades visuais haviam sido gravadas com links gerados em sessões temporárias:
  - `header_logo_url`: `https://lh3.googleusercontent.com/aida/AP1WRLvb_lGcig...` $\rightarrow$ **HTTP 403 Forbidden** (Sessão Google expirada).
  - `hero_bg_image_url`: `https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhX...` $\rightarrow$ **HTTP 403 Forbidden** (Sessão Google expirada).
  - `segment_img_criogenia`, `segment_img_oleo_gas`, `segment_img_sucroalcooleiro`: `https://lh3.googleusercontent.com/aida/...` $\rightarrow$ **HTTP 403 Forbidden**.

### B. Por que aparecia "Welcome to Nuxt!" nos cards de segmentos
1. O frontend (`index.vue`) envia as URLs remotas para o endpoint `/api/proxy-image?url=...`.
2. Como o servidor da Google retornou HTTP 403, o proxy local respondeu HTTP 404.
3. A tag `<img>` no Vue disparou o evento `@error="handleImgError"`, que continha: `img.src = '/placeholder.png'`.
4. No arquivo estático `public/placeholder.png` do repositório, o binário original de 53 KB continha uma captura de tela da tela padrão do Nuxt.js (*"Welcome to Nuxt!"*).
5. Como resultado, todas as imagens que falhavam caíam no fallback visual do Nuxt.

### C. Bloqueio do Vídeo do Hero no Proxy SSRF
- O vídeo oficial do Hero é: `https://video.wixstatic.com/video/e6a741_2b669bc80a4a48fd9ada437c1e0827b7/720p/mp4/file.mp4`.
- A allowlist inicial do `proxy-video.ts` continha apenas R2, Cloudflare, YouTube e Vimeo.
- O hostname exato `video.wixstatic.com` foi bloqueado com **HTTP 403 Forbidden** com mensagem `"Domínio não permitido para proxy de vídeo"`.

---

## 3. Mapeamento de Mídias e Correções Aplicadas

| Elemento | Causa da Falha | Origem Canônica / Correção Aplicada | Status Pós-Correção |
| :--- | :--- | :--- | :--- |
| **Logo Cabeçalho** | URL Google temporária (403) | `https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/1785536986887_0a3ga6_qualitec_logo.png` + fallback `/images/email/qualitec-logo.png` | ✅ HTTP 200 (image/png) |
| **Hero Background Poster** | URL Google temporária (403) | `https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_geral.png` | ✅ HTTP 200 (image/png) |
| **Hero Vídeo MP4** | Hostname fora da allowlist | Adicionado `video.wixstatic.com` estritamente na allowlist de `app/server/api/proxy-video.ts` com suporte completo a streaming e Range requests | ✅ HTTP 200 / 206 (video/mp4) |
| **Segmento Criogenia** | URL Google temporária (403) | `https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_valvulas.png` | ✅ HTTP 200 (image/png) |
| **Segmento Óleo & Gás** | URL Google temporária (403) | `https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_instrumentacao.png` | ✅ HTTP 200 (image/png) |
| **Segmento Sucroalcooleiro** | URL Google temporária (403) | `https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_sistemas.png` | ✅ HTTP 200 (image/png) |
| **Fallback `placeholder.png`** | Imagem Nuxt antiga | Substituído por PNG 1x1 transparente e neutro | ✅ Neutro & Limpo |
| **Novidades da Home** | N/A | `https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/...` (permanentes no R2) | ✅ HTTP 200 (image/png) |
| **Catálogo de Produtos** | N/A | `https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/...` | ✅ HTTP 200 (image/png) |
| **PDFs Técnicos** | N/A | Cloudflare R2 + Template com Logo Qualitec Oficial | ✅ HTTP 200 (image/png) |

---

## 4. Alterações Realizadas nos Arquivos

1. `d:\site qualitec\app\server\api\proxy-video.ts`:
   - Adicionou `video.wixstatic.com` explicitamente à allowlist de domínios permitidos.
   - Encaminha headers `Range` para a origem, repassando status HTTP 206 (Partial Content), `Content-Range`, `Accept-Ranges`, `Content-Length` e `Content-Type: video/mp4`.
   - Mantém bloqueio estrito contra localhost, 127.0.0.1, 169.254.x.x, redes privadas (10.x, 172.16-31.x, 192.168.x) e protocolos não HTTP/HTTPS.
2. `d:\site qualitec\app\composables\useSiteSettings.ts`:
   - Configurado `hero_bg_type: 'video'` e `hero_bg_video_url: 'https://video.wixstatic.com/video/e6a741_2b669bc80a4a48fd9ada437c1e0827b7/720p/mp4/file.mp4'`.
3. `d:\site qualitec\app\components\AdminSiteSettings.vue`:
   - Atualizado defaults e prévias com suporte ao vídeo Wix e fallback poster R2.
4. `d:\site qualitec\app\pages\index.vue`:
   - Refatorada a inicialização do vídeo HTML5: attributes `autoplay`, `loop`, `muted`, `playsinline`, `object-fit: cover`, garantindo playback contínuo sem `AbortError`.
5. `d:\site qualitec\public\placeholder.png` & `app/public/placeholder.png`:
   - Substituído o screenshot do Nuxt por buffer neutro transparente.

---

## 5. Validação e Testes Automatizados

### A. Teste Abrangente de Vídeo e Streaming (`scratch/test_hero_video_comprehensive.mjs`)
```
=====================================================
TESTES DETALHADOS DE VÍDEO DO HERO E PROXY DE STREAMING
=====================================================

--- 1. TESTE DIRETO NA ORIGEM WIX ---
Status: 200 OK
Content-Type: video/mp4
Content-Length: 3684679 bytes
Accept-Ranges: bytes
✅ Origem direta Wix OK!

--- 2. TESTE FULL GET VIA PROXY-VIDEO ---
Proxy Status: 200 OK
Proxy Content-Type: video/mp4
Proxy Content-Length: 3684679 bytes
Proxy Accept-Ranges: bytes
Bytes recebidos pelo cliente: 3684679
Assinatura ftyp MP4 válida: true
✅ Proxy Full GET OK!

--- 3. TESTE RANGE REQUEST VIA PROXY-VIDEO (Range: bytes=0-1023) ---
Range Status: 206 Partial Content
Range Content-Type: video/mp4
Range Content-Length: 1024 bytes
Range Content-Range: bytes 0-1023/3684679
Range Accept-Ranges: bytes
Bytes da fatia Range: 1024
✅ Range Request suportado com sucesso!

--- 4. TESTES DE SEGURANÇA E PROTEÇÃO SSRF ---
🔒 [BLOQUEADO] Localhost -> HTTP 403
🔒 [BLOQUEADO] IP 127.0.0.1 -> HTTP 403
🔒 [BLOQUEADO] AWS Metadata 169.254.169.254 -> HTTP 403
🔒 [BLOQUEADO] Rede Privada 10.0.0.1 -> HTTP 403
🔒 [BLOQUEADO] Rede Privada 192.168.1.1 -> HTTP 403
🔒 [BLOQUEADO] Domínio Externo Desconhecido -> HTTP 403
🔒 [BLOQUEADO] Wix Falso/Typosquat -> HTTP 403
🔒 [BLOQUEADO] Protocolo file:// -> HTTP 403

=====================================================
RESULTADO FINAL: 11 PASSOU / 0 FALHOU
=====================================================
```

### B. Teste Real no Navegador (DOM & Video Element)
```json
{
  "exists": true,
  "currentSrc": "http://localhost:3000/api/proxy-video?url=https%3A%2F%2Fvideo.wixstatic.com%2Fvideo%2Fe6a741_2b669bc80a4a48fd9ada437c1e0827b7%2F720p%2Fmp4%2Ffile.mp4",
  "networkState": 2,
  "readyState": 4,
  "videoWidth": 1280,
  "videoHeight": 720,
  "paused": false,
  "currentTime": 2.45,
  "muted": true,
  "autoplay": true,
  "loop": true,
  "playsInline": true,
  "computedStyle": {
    "objectFit": "cover",
    "position": "absolute",
    "zIndex": "10",
    "opacity": "1"
  }
}
```

### C. Suite de Testes de Imagens e Mídia (`scripts/test_media_rendering.mjs`)
- **19 PASSOU / 0 FALHOU**

### D. Auditoria de Segurança (`npm run security:check`)
- **0 problemas críticos encontrados**

### E. Build de Produção (`npm run build`)
- **Build complete! Sucesso com código 0.**

---

## 6. Estado de Segurança e Conformidade
- **P0 Security Preservado:** RLS, policies e isolamento `service_role` intactos.
- **Master Admin & 2FA:** 100% ativos e validados.
- **Proteção SSRF:** Proxies possuem verificação estrita de allowlist.
- **Limite de 300 Linhas:** Respeitado em todos os handlers (`proxy-video.ts`: 88 linhas).
- **Sem Deploy/Commit:** Aguardando revisão explícita do usuário.
