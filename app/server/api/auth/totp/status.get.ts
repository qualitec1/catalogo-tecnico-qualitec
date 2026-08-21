import { defineEventHandler, createError, sendError } from 'h3'
import { requireAdmin } from '../../../../server/utils/requireAdmin'
import { supabaseAdmin } from '../../../../server/utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  // 1. Validar autenticação e perfil de administrador ativo via requireAdmin
  const adminCtx = await requireAdmin(event)
  const userId = adminCtx.user.id

  if (!supabaseAdmin) {
    return sendError(event, createError({
      statusCode: 503,
      statusMessage: 'Supabase admin client unavailable'
    }))
  }

  // 2. Consultar status do TOTP na tabela totp_secrets via Service Role
  const { data: totpRow, error: totpError } = await supabaseAdmin
    .from('totp_secrets')
    .select('enabled, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (totpError) {
    console.error('[Security] Error fetching TOTP status:', totpError.message)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve 2FA status'
    }))
  }

  // 3. Retornar exclusivamente o status booleano (NUNCA expor o secret)
  const isEnabled = Boolean(totpRow && totpRow.enabled === true)

  return {
    enabled: isEnabled,
    updatedAt: totpRow?.updated_at || null
  }
})
