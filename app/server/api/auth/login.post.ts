import { readBody, setCookie, createError, sendError } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { verifyTOTP } from '../../utils/totp'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, totp } = body || {}

  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email and password are required' }))
  }

  if (!supabaseAdmin) {
    return sendError(event, createError({ statusCode: 503, statusMessage: 'Supabase not configured on server. Contact administrator.' }))
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
  if (error || !data?.session) {
    // Log tentativa falha (importante para detecção de ataques)
    console.warn('[Security] Failed login attempt:', {
      timestamp: new Date().toISOString(),
      email: email.replace(/(?<=.{2}).(?=.*@)/g, '*'), // Mascara email
      ip: event.node.req.socket.remoteAddress,
      error: error?.message
    })
    
    // Mensagem genérica (não revela se o email existe)
    return sendError(event, createError({ 
      statusCode: 401, 
      statusMessage: 'Credenciais inválidas' 
    }))
  }

  // Log de login bem-sucedido
  console.info('[Security] Successful login:', {
    timestamp: new Date().toISOString(),
    email: email.replace(/(?<=.{2}).(?=.*@)/g, '*'),
    user_id: data.user?.id,
    ip: event.node.req.socket.remoteAddress,
    totp_required: false
  })

  const userId = data.user?.id
  if (userId) {
    const { data: totpRow, error: totpError } = await supabaseAdmin
      .from('totp_secrets')
      .select('secret, enabled')
      .eq('user_id', userId)
      .maybeSingle()

    if (totpError) {
      return sendError(event, createError({ statusCode: 500, statusMessage: 'Failed to read TOTP configuration' }))
    }

    if (totpRow?.enabled) {
      if (!totp) {
        return sendError(event, createError({ statusCode: 401, statusMessage: 'TOTP code required' }))
      }

      const valid = verifyTOTP(totpRow.secret, String(totp))
      if (!valid) {
        return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid TOTP code' }))
      }
    }
  }

  const session = data.session
  const accessToken = session.access_token
  const refreshToken = session.refresh_token

  const secure = process.env.NODE_ENV === 'production'
  const cookieOpts = {
    httpOnly: true,
    secure,
    sameSite: 'strict' as const,
    path: '/'
  }

  setCookie(event, 'sb-access-token', accessToken, {
    ...cookieOpts,
    maxAge: session.expires_in || 60 * 60
  })

  setCookie(event, 'sb-refresh-token', refreshToken, {
    ...cookieOpts,
    maxAge: 60 * 60 * 24 * 30
  })

  return {
    user: {
      id: data.user?.id,
      email: data.user?.email,
      email_confirmed_at: data.user?.email_confirmed_at
    }
  }
})
