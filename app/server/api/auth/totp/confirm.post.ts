import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { requireAdmin } from '../../../../server/utils/requireAdmin'
import { supabaseAdmin } from '../../../../server/utils/supabaseAdmin'
import { verifyTOTP } from '../../../../server/utils/totp'

export default defineEventHandler(async (event) => {
  // 1. Validar autenticação e perfil administrativo ativo (Proteção contra IDOR)
  const adminCtx = await requireAdmin(event)
  const userId = adminCtx.user.id

  const body = await readBody(event)
  const { code } = body || {}

  if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Informe um código de verificação válido de 6 dígitos numéricos.'
    }))
  }

  if (!supabaseAdmin) {
    return sendError(event, createError({
      statusCode: 503,
      statusMessage: 'Serviço de autenticação indisponível.'
    }))
  }

  // 2. Buscar chave pendente cadastrada na tabela totp_secrets
  const { data: totpRow, error: totpError } = await supabaseAdmin
    .from('totp_secrets')
    .select('secret, enabled')
    .eq('user_id', userId)
    .maybeSingle()

  if (totpError || !totpRow || !totpRow.secret) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Configuração de 2FA não encontrada. Inicie o processo novamente gerando um novo QR Code.'
    }))
  }

  // 3. Validar o código de 6 dígitos fornecido pelo usuário
  const isCodeValid = verifyTOTP(totpRow.secret, code.trim())
  if (!isCodeValid) {
    console.warn('[Security] Código TOTP de confirmação inválido:', {
      userId,
      timestamp: new Date().toISOString()
    })
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Código de autenticação incorreto. Verifique o relógio do seu celular e tente novamente.'
    }))
  }

  // 4. Somente após a validação criptográfica bem-sucedida, ativar o 2FA (enabled = true)
  const { error: updateError } = await supabaseAdmin
    .from('totp_secrets')
    .update({
      enabled: true,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (updateError) {
    console.error('[Security] Failed to activate TOTP:', updateError.message)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Erro ao salvar ativação do 2FA.'
    }))
  }

  console.info('[Security] 2FA/TOTP successfully activated for user:', {
    userId,
    timestamp: new Date().toISOString()
  })

  return {
    ok: true,
    enabled: true,
    message: 'Autenticação em dois fatores ativada com sucesso!'
  }
})
