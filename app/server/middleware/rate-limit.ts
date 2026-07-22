// Middleware de rate limiting para proteção contra força bruta e DDoS
import { createError, sendError, getRequestIP } from 'h3'

// Armazena tentativas por IP (em produção usar Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Configurações de rate limit por rota
const rateLimitConfig: Record<string, { maxRequests: number; windowMs: number }> = {
  '/api/auth/login': { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 tentativas em 15 min
  '/api/auth/register': { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 tentativas em 1 hora
  '/api/upload-r2': { maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads por minuto
  '/api/admin/products': { maxRequests: 100, windowMs: 60 * 1000 }, // 100 req por minuto
}

// Limpa entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export default defineEventHandler(async (event) => {
  const path = event.path
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'

  // Encontra configuração de rate limit para esta rota
  const config = Object.entries(rateLimitConfig).find(([route]) => 
    path.startsWith(route)
  )?.[1]

  if (!config) {
    return // Rota sem rate limit configurado
  }

  const key = `${ip}:${path}`
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || record.resetAt < now) {
    // Primeira requisição ou janela expirada
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs
    })
    return
  }

  if (record.count >= config.maxRequests) {
    // Limite excedido
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    
    // Log tentativa de abuso
    console.warn(`[Rate Limit] IP ${ip} exceeded limit on ${path}`)
    
    event.node.res.setHeader('Retry-After', retryAfter.toString())
    event.node.res.setHeader('X-RateLimit-Limit', config.maxRequests.toString())
    event.node.res.setHeader('X-RateLimit-Remaining', '0')
    event.node.res.setHeader('X-RateLimit-Reset', record.resetAt.toString())

    return sendError(event, createError({
      statusCode: 429,
      statusMessage: `Too many requests. Try again in ${retryAfter} seconds.`
    }))
  }

  // Incrementa contador
  record.count++
  
  // Adiciona headers informativos
  event.node.res.setHeader('X-RateLimit-Limit', config.maxRequests.toString())
  event.node.res.setHeader('X-RateLimit-Remaining', (config.maxRequests - record.count).toString())
  event.node.res.setHeader('X-RateLimit-Reset', record.resetAt.toString())
})
