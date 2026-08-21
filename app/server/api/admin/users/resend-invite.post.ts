import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { requireMasterAdmin } from '../../../utils/requireMasterAdmin'
import { supabaseAdmin } from '../../../utils/supabaseAdmin'
import { getCanonicalAppUrl } from '../../../utils/siteUrl'
import { sendAdminInvitationEmail } from '../../../utils/adminMailer'

export default defineEventHandler(async (event) => {
  // 1. Somente Master Admin pode reenviar convites
  const adminCtx = await requireMasterAdmin(event)
  const actorUserId = adminCtx.user.id

  const body = await readBody(event)
  const { email } = body || {}

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'E-mail informado é inválido.'
    }))
  }

  if (!supabaseAdmin) {
    return sendError(event, createError({
      statusCode: 503,
      statusMessage: 'Serviço Supabase indisponível.'
    }))
  }

  const normalizedEmail = email.trim().toLowerCase()
  const maskedEmail = normalizedEmail.replace(/(?<=.{2}).(?=.*@)/g, '*')
  const redirectTo = `${getCanonicalAppUrl()}/auth/aceitar-convite`

  try {
    // 2. Buscar perfil existente para obter nome e role
    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const targetUser = usersList?.users?.find((u: any) => u.email?.toLowerCase() === normalizedEmail)

    if (!targetUser) {
      return sendError(event, createError({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado no sistema.'
      }))
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, role, is_active')
      .eq('id', targetUser.id)
      .maybeSingle()

    const role = profile?.role === 'master_admin' ? 'master_admin' : 'admin'
    const fullName = profile?.full_name || targetUser.user_metadata?.full_name || 'Administrador'

    // 3. Gerar novo link oficial via generateLink
    let linkResult = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: normalizedEmail,
      options: {
        data: { full_name: fullName },
        redirectTo
      }
    })

    // Caso o usuário já tenha sido confirmado no Auth mas esteja pendente no perfil, gerar magiclink
    if (linkResult.error && linkResult.error.message.toLowerCase().includes('already')) {
      linkResult = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: normalizedEmail,
        options: {
          data: { full_name: fullName },
          redirectTo
        }
      })
    }

    if (linkResult.error || !linkResult.data) {
      console.error('[AdminUsers] Error generating resend invite link:', linkResult.error?.message)
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: linkResult.error?.message || 'Falha ao gerar novo link de convite.'
      }))
    }

    const actionLink = linkResult.data.properties?.action_link || ''
    if (!actionLink) {
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: 'Link de ativação não retornado pelo Supabase.'
      }))
    }

    // 4. Garantir marcação de convite pendente no app_metadata
    await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      app_metadata: { admin_invite_pending: true }
    })

    // 5. Enviar e-mail via Skymail SMTP
    const mailResult = await sendAdminInvitationEmail({
      toEmail: normalizedEmail,
      toName: fullName,
      role,
      actionLink
    })

    if (!mailResult.success) {
      return sendError(event, createError({
        statusCode: 502,
        statusMessage: `Falha no transporte SMTP ao enviar e-mail: ${mailResult.error || 'Erro de envio'}.`
      }))
    }

    // 5. Log de auditoria estruturado
    console.info('[Audit] INVITE_RESENT', {
      actor_user_id: actorUserId,
      target_user_id: targetUser.id,
      target_email: maskedEmail,
      transport: 'Skymail SMTP',
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      message: 'Convite reenviado com sucesso via Skymail SMTP.'
    }
  } catch (err: any) {
    console.error('[AdminUsers] Unexpected resend invite error:', err)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Erro ao processar reenvio de convite.'
    }))
  }
})
