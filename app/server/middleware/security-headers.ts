// Middleware para adicionar headers de segurança em todas as respostas
export default defineEventHandler((event) => {
  const headers = event.node.res

  // Previne clickjacking
  headers.setHeader('X-Frame-Options', 'DENY')

  // Previne MIME sniffing
  headers.setHeader('X-Content-Type-Options', 'nosniff')

  // XSS Protection (legacy, mas ainda útil para navegadores antigos)
  headers.setHeader('X-XSS-Protection', '1; mode=block')

  // Content Security Policy - política restritiva
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com", // unsafe-eval necessário para Nuxt dev
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://pub-*.r2.dev",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
  
  headers.setHeader('Content-Security-Policy', csp)

  // Força HTTPS em produção
  if (process.env.NODE_ENV === 'production') {
    headers.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // Controla quanto de informação do referrer é enviado
  headers.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Desabilita recursos do navegador que podem ser abusados
  headers.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
})
