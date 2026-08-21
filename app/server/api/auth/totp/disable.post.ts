import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { requireAdmin } from '../../../../server/utils/requireAdmin'
import { supabaseAuth } from '../../../../server/utils/supabaseAuth'
import { supabaseAdmin } from '../../../../server/utils/supabaseAdmin'
import { verifyTOTP } from '../../../../server/utils/totp'

export default defineEventHandler(async (event) => {
  // 1. Validar autenticação e perfil administrativo ativo (Proteção contra IDOR)
  const adminCtx = await requireAdmin(event)
  const user = adminCtx.user
  const email = user.email || ''

  const body = await readBody(event)
  const { password, code } = body || {}

  if (!password || !code) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Senha atual e código 2FA de 6 dígitos são obrigatórios para desativação.'
    }))
  }

  if (!supabaseAuth || !supabaseAdmin) {
    return sendError(event, createError({
      statusCode: 503,
      statusMessage: 'Serviço de autenticação indisponível.'
    }))
  }

  // 2. Re-autenticar o administrador com sua senha atual via supabaseAuth (Anon client)
  const { error: authError } = await supabaseAuth.auth.signInWithPassword({
    email,
    password
  })

  if (authError) {
    console.warn('[Security] Tentativa de desativação 2FA com senha incorreta:', {
      userId: user.id,
      timestamp: new Date().toISOString()
    })
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Senha atual incorreta.'
    }))
  }

  // 3. Buscar chave 2FA ativa na tabela totp_secrets
  const { data: totpRow, error: totpError } = await supabaseAdmin
    .from('totp_secrets')
    .select('secret, enabled')
    .eq('user_id', user.id)
    .maybeSingle()

  if (totpError || !totpRow || !totpRow.enabled || !totpRow.secret) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'A autenticação em dois fatores não está ativa nesta conta.'
    }))
  }

  // 4. Validar o código 2FA fornecido
  const isCodeValid = verifyTOTP(totpRow.secret, String(code).trim())
  if (!isCodeValid) {
    console.warn('[Security] Tentativa de desativação 2FA com código TOTP incorreto:', {
      userId: user.id,
      timestamp: new Date().toISOString()
    })
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Código 2FA incorreto.'
    }))
  }

  // 5. Remover definitivamente o registro de totp_secrets para evitar reutilização
  const { error: deleteError } = await supabaseAdmin
    .from('totp_secrets')
    .delete()
    .eq('user_id', user.id)

  if (deleteError) {
    console.error('[Security] Failed to delete TOTP secret upon disable:', deleteError.message)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Erro ao desativar 2FA no banco de dados.'
    }))
  }

  console.info('[Security] 2FA/TOTP successfully disabled for user:', {
    userId: user.id,
    timestamp: new Date().toISOString()
  })

  return {
    ok: true,
    enabled: false,
    message: 'Autenticação em dois fatores desativada com sucesso.'
  }
})
