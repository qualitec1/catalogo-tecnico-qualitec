import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { requireMasterAdmin } from '../../../utils/requireMasterAdmin'
import { supabaseAdmin } from '../../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  // 1. Somente Master Admin pode alterar status ou papéis de outros administradores
  const adminCtx = await requireMasterAdmin(event)
  const actorUserId = adminCtx.user.id

  const body = await readBody(event)
  const { userId, isActive, role } = body || {}

  if (!userId || typeof userId !== 'string') {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'ID do usuário é obrigatório.'
    }))
  }

  if (isActive === undefined && role === undefined) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Informe pelo menos um campo para atualização (isActive ou role).'
    }))
  }

  if (role !== undefined && role !== 'admin' && role !== 'master_admin') {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Nível inválido. Selecione "admin" ou "master_admin".'
    }))
  }

  if (!supabaseAdmin) {
    return sendError(event, createError({
      statusCode: 503,
      statusMessage: 'Serviço Supabase indisponível.'
    }))
  }

  // 2. Buscar perfil do usuário alvo
  const { data: targetProfile, error: targetErr } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', userId)
    .maybeSingle()

  if (targetErr || !targetProfile) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: 'Perfil do usuário não encontrado.'
    }))
  }

  // 3. Proteção contra Auto-Bloqueio (Self-lockout)
  if (userId === actorUserId) {
    if (isActive === false) {
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: 'Você não pode desativar sua própria conta de Master Admin.'
      }))
    }
    if (role !== undefined && role !== 'master_admin') {
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: 'Você não pode remover seus próprios privilégios de Master Admin.'
      }))
    }
  }

  // 4. Proteção do Último Master Admin Ativo (Last-Master Protection)
  const isTargetActiveMaster = targetProfile.role === 'master_admin' && targetProfile.is_active === true
  const willDeactivateMaster = isTargetActiveMaster && isActive === false
  const willDemoteMaster = isTargetActiveMaster && role !== undefined && role !== 'master_admin'

  if (willDeactivateMaster || willDemoteMaster) {
    const { data: activeMasters, error: countErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'master_admin')
      .eq('is_active', true)

    if (countErr) {
      console.error('[AdminUsers] Error counting master admins:', countErr.message)
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: 'Erro ao verificar administradores ativos.'
      }))
    }

    if (!activeMasters || activeMasters.length <= 1) {
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: 'Operação bloqueada: O sistema deve possuir pelo menos um Master Admin ativo.'
      }))
    }
  }

  // 5. Aplicar atualizações
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString()
  }

  if (isActive !== undefined) {
    updates.is_active = Boolean(isActive)
  }

  if (role !== undefined) {
    updates.role = role
  }

  const { error: updateErr } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (updateErr) {
    console.error('[AdminUsers] Error updating profile status:', updateErr.message)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Falha ao atualizar dados no banco de dados.'
    }))
  }

  // 6. Logs estruturados de auditoria
  if (isActive !== undefined) {
    console.info(`[Audit] ${isActive ? 'ADMIN_ENABLED' : 'ADMIN_DISABLED'}`, {
      actor_user_id: actorUserId,
      target_user_id: userId,
      timestamp: new Date().toISOString()
    })
  }

  if (role !== undefined && role !== targetProfile.role) {
    console.info('[Audit] ROLE_CHANGED', {
      actor_user_id: actorUserId,
      target_user_id: userId,
      old_role: targetProfile.role,
      new_role: role,
      timestamp: new Date().toISOString()
    })
  }

  return {
    success: true,
    message: 'Status do administrador atualizado com sucesso.'
  }
})
