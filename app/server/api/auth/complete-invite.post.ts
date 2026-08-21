import { defineEventHandler, getCookie, getHeader, createError, sendError } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  // 1. Obter o access token da sessão de convite ativa
  let accessToken = getCookie(event, 'sb-access-token')
  if (!accessToken) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim()
    }
  }

  if (!accessToken) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Sessão de convite não identificada. Por favor, acesse novamente através do link do e-mail.'
    }))
  }

  if (!supabaseAdmin) {
    return sendError(event, createError({
      statusCode: 503,
      statusMessage: 'Serviço de autenticação indisponível.'
    }))
  }

  // 2. Validar token no Supabase Auth (Garantia anti-IDOR — identidade extraída exclusivamente do JWT)
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)

  if (authError || !user?.id) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Convite inválido ou expirado.'
    }))
  }

  const userId = user.id

  // 3. Consultar usuário autenticado via service_role para verificação segura do app_metadata
  const { data: authUserData, error: adminUserError } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (adminUserError || !authUserData?.user) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Conta de autenticação não encontrada.'
    }))
  }

  const authUser = authUserData.user

  // 4. VERIFICAÇÃO ESTREITA: Exige que o convite esteja de fato pendente (app_metadata.admin_invite_pending === true)
  // Protege contra auto-reativação de administradores desativados que ainda possuem credenciais no Auth.
  const isInvitePending = authUser.app_metadata?.admin_invite_pending === true

  if (!isInvitePending) {
    console.warn('[Security] Blocked attempt to complete-invite on non-pending or already-completed account:', {
      userId,
      email: authUser.email?.replace(/(?<=.{2}).(?=.*@)/g, '*'),
      appMetadata: authUser.app_metadata
    })

    return sendError(event, createError({
      statusCode: 403,
      statusMessage: 'Operação negada: Esta conta não possui um convite pendente de ativação. Não é permitida a auto-reativação de contas desativadas.'
    }))
  }

  // 5. Buscar perfil do convidado
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', userId)
    .maybeSingle()

  if (profileErr || !profile) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: 'Perfil de administrador não encontrado para este convite.'
    }))
  }

  // 6. Somente perfis administrativos legítimos são ativados
  const isEligibleRole = profile.role === 'admin' || profile.role === 'master_admin'
  if (!isEligibleRole) {
    return sendError(event, createError({
      statusCode: 403,
      statusMessage: 'Perfil não elegível para ativação administrativa.'
    }))
  }

  // 7. Ativar conta definitivamente (is_active = true)
  const { error: updateErr } = await supabaseAdmin
    .from('profiles')
    .update({
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (updateErr) {
    console.error('[AdminUsers] Error activating invited profile:', updateErr.message)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Falha ao ativar perfil administrativo.'
    }))
  }

  // 8. Desmarcar o estado pendente no app_metadata (garante idempotência e bloqueia auto-reativação futura)
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...authUser.app_metadata,
      admin_invite_pending: false
    }
  })

  // 9. Log de auditoria
  console.info('[Audit] INVITE_ACCEPTED', {
    target_user_id: userId,
    target_email: authUser.email?.replace(/(?<=.{2}).(?=.*@)/g, '*'),
    role: profile.role,
    timestamp: new Date().toISOString()
  })

  return {
    ok: true,
    message: 'Conta administrativa ativada com sucesso!'
  }
})
