import { getQuery, createError, setHeader } from 'h3'

// Whitelist de domínios permitidos para prevenir SSRF
const ALLOWED_DOMAINS = [
  'pub-25a6482a064a4590a456d3dd2a76114b.r2.dev', // Cloudflare R2
  'static.wixstatic.com', // Wix (se usado)
  'images.unsplash.com', // Unsplash (se usado)
  'lh3.googleusercontent.com',
  'googleusercontent.com',
  // Adicione outros domínios confiáveis aqui
]

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    
    // Bloqueia protocolos perigosos
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false
    }

    // Bloqueia IPs privados e localhost (previne SSRF)
    const hostname = url.hostname.toLowerCase()
    
    // Localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return false
    }

    // IPs privados (RFC 1918)
    if (hostname.match(/^10\.|^172\.(1[6-9]|2[0-9]|3[01])\.|^192\.168\./)) {
      return false
    }

    // Link-local
    if (hostname.startsWith('169.254.')) {
      return false
    }

    // Metadata endpoints (AWS, GCP, Azure)
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return false
    }

    // Verifica se o domínio está na whitelist
    return ALLOWED_DOMAINS.some(allowed => 
      hostname === allowed || hostname.endsWith(`.${allowed}`)
    )
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL da imagem é obrigatória',
    })
  }

  // Se a URL for um placeholder local ou caminho relativo, redirecionar ou tratar
  if (url.startsWith('/')) {
    return sendRedirect(event, url)
  }

  // Validação SSRF
  if (!isAllowedUrl(url)) {
    console.warn(`[SSRF Prevention] Blocked URL: ${url}`)
    throw createError({
      statusCode: 403,
      statusMessage: 'URL não permitida por razões de segurança',
    })
  }

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Falha ao baixar imagem remota: ${res.statusText}`)

    const contentType = res.headers.get('Content-Type') || 'image/png'
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable') // Cache de 1 ano
    
    // CORS mais restritivo - permite apenas origem do próprio site
    const origin = event.node.req.headers.origin
    const config = useRuntimeConfig()
    const allowedOrigins = [
      config.public.supabaseUrl,
      'http://localhost:3000',
      'http://localhost:5173'
    ]
    
    if (origin && allowedOrigins.includes(origin)) {
      setHeader(event, 'Access-Control-Allow-Origin', origin)
    }

    return buffer
  } catch (error: any) {
    console.error('[API proxy-image] Erro ao carregar imagem:', url, error.message)
    throw createError({
      statusCode: 404,
      statusMessage: 'Imagem não encontrada ou inacessível',
    })
  }
})
