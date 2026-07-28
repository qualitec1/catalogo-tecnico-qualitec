// Middleware de autenticação para proteger rotas administrativas
import { getCookie, createError, sendError } from 'h3'
import { supabaseAdmin } from '../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  const path = event.path

  // Rotas que requerem autenticação
  const protectedRoutes = [
    '/api/admin/',
    '/api/upload-r2'
  ]

  const isProtected = protectedRoutes.some(route => path.startsWith(route))

  if (!isProtected) {
    return // Rota pública, continua
  }

  // Em modo de desenvolvimento, ignora a autenticação para facilitar os testes locais
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  // Verifica token de acesso
  const accessToken = getCookie(event, 'sb-access-token')

  if (!accessToken) {
    return sendError(event, createError({ 
      statusCode: 401, 
      statusMessage: 'Authentication required' 
    }))
  }

  if (!supabaseAdmin) {
    return sendError(event, createError({ 
      statusCode: 503, 
      statusMessage: 'Authentication service unavailable' 
    }))
  }

  try {
    // Valida o token com Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken)

    if (error || !user) {
      return sendError(event, createError({ 
        statusCode: 401, 
        statusMessage: 'Invalid or expired session' 
      }))
    }

    // Adiciona user ao contexto do evento para uso posterior
    event.context.user = user

  } catch (err: any) {
    console.error('[Auth Middleware] Error:', err.message)
    return sendError(event, createError({ 
      statusCode: 401, 
      statusMessage: 'Authentication failed' 
    }))
  }
})
