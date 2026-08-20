import { defineEventHandler, readBody, setCookie, createError, sendError } from 'h3'
import { supabaseAuth } from '../../utils/supabaseAuth'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { verifyTOTP } from '../../utils/totp'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, totp } = body || {}

  // 1. Validação inicial de campos obrigatórios
  if (!email || !password) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Email and password are required'
    }))
  }

  // 2. Verificação de inicialização dos clients
  if (!supabaseAuth || !supabaseAdmin) {
    console.error('[Security] Supabase clients not initialized. Check server env configuration.')
    return sendError(event, createError({
      statusCode: 503,
      statusMessage: 'Supabase not configured on server. Contact administrator.'
    }))
  }

  const maskedEmail = email.replace(/(?<=.{2}).(?=.*@)/g, '*')
  const clientIp = event.node.req.socket.remoteAddress

  // 3. Autenticação primária de credenciais no Supabase Auth via client isolado (supabaseAuth)
  const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
    email: email.trim(),
    password
  })

  if (authError || !authData?.session || !authData?.user) {
    console.warn('[Security] Failed login attempt:', {
      timestamp: new Date().toISOString(),
      email: maskedEmail,
      ip: clientIp,
      error: authError?.message
    })

    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Credenciais inválidas'
    }))
  }

  const userId = authData.user.id
  console.info('[Security] Password authentication successful:', {
    timestamp: new Date().toISOString(),
    email: maskedEmail,
    userId,
    ip: clientIp
  })

  // 4. Verificação estrita de autorização em profiles via client privilegiado (supabaseAdmin)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    console.error('[Security] Error querying profile during login:', profileError.message)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Failed to verify user profile'
    }))
  }

  if (!profile || profile.role !== 'admin' || profile.is_active !== true) {
    console.warn('[Security] Login blocked - User is not an active admin:', {
      userId,
      email: maskedEmail,
      role: profile?.role || 'none',
      isActive: profile?.is_active || false
    })

    return sendError(event, createError({
      statusCode: 403,
      statusMessage: 'Acesso Negado: Esta conta não possui privilégios de administrador ativo.'
    }))
  }

  // 5. Verificação de 2FA TOTP via client privilegiado (supabaseAdmin)
  // Estado A: Registro inexistente (totpRow === null, totpError === null) -> TOTP desativado
  // Estado B: Registro existe com enabled === false -> TOTP desativado
  // Estado C: Registro existe com enabled === true -> TOTP obrigatório
  const { data: totpRow, error: totpError } = await supabaseAdmin
    .from('totp_secrets')
    .select('secret, enabled')
    .eq('user_id', userId)
    .maybeSingle()

  if (totpError) {
    console.error('[Security] Failed to read TOTP configuration:', totpError)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Failed to read TOTP configuration'
    }))
  }

  const isTotpEnabled = Boolean(totpRow && totpRow.enabled === true && totpRow.secret)

  if (isTotpEnabled) {
    if (!totp) {
      // Estado C: TOTP exigido mas não fornecido
      return {
        totpRequired: true,
        message: 'Código 2FA / Autenticador obrigatório.'
      }
    }

    const isTotpValid = verifyTOTP(totpRow.secret, String(totp))
    if (!isTotpValid) {
      console.warn('[Security] Invalid TOTP code submitted:', {
        userId,
        email: maskedEmail,
        ip: clientIp
      })

      return sendError(event, createError({
        statusCode: 401,
        statusMessage: 'Código 2FA / Autenticador inválido'
      }))
    }
  }

  // 6. Emissão de Cookies de Sessão HTTP-Only Seguros com a sessão do supabaseAuth
  const session = authData.session
  const secure = process.env.NODE_ENV === 'production'
  const cookieOpts = {
    httpOnly: true,
    secure,
    sameSite: 'strict' as const,
    path: '/'
  }

  setCookie(event, 'sb-access-token', session.access_token, {
    ...cookieOpts,
    maxAge: session.expires_in || 60 * 60
  })

  setCookie(event, 'sb-refresh-token', session.refresh_token, {
    ...cookieOpts,
    maxAge: 60 * 60 * 24 * 30
  })

  // 7. Registro de log de login bem-sucedido final
  console.info('[Security] Successful login:', {
    timestamp: new Date().toISOString(),
    email: maskedEmail,
    userId,
    ip: clientIp,
    totpVerified: isTotpEnabled
  })

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email,
      email_confirmed_at: authData.user.email_confirmed_at
    },
    profile,
    isAdmin: true
  }
})
