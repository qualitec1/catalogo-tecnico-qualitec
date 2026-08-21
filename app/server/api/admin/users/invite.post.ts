import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { requireMasterAdmin } from '../../../utils/requireMasterAdmin'
import { supabaseAdmin } from '../../../utils/supabaseAdmin'
import { getCanonicalAppUrl } from '../../../utils/siteUrl'
import { sendAdminInvitationEmail } from '../../../utils/adminMailer'

export default defineEventHandler(async (event) => {
  // 1. Somente Master Admin ativo pode convidar novos administradores
  const adminCtx = await requireMasterAdmin(event)
  const actorUserId = adminCtx.user.id

  const body = await readBody(event)
  const { name, email, role } = body || {}

  // 2. Validação rigorosa do payload
  if (!name || typeof name !== 'string' || !name.trim()) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Nome completo é obrigatório.'
    }))
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'E-mail informado é inválido.'
    }))
  }

  if (role !== 'admin' && role !== 'master_admin') {
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

  const normalizedEmail = email.trim().toLowerCase()
  const maskedEmail = normalizedEmail.replace(/(?<=.{2}).(?=.*@)/g, '*')

  try {
    // 3. Verificar se o usuário já possui conta ativa no sistema
    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const existingUser = usersList?.users?.find((u: any) => u.email?.toLowerCase() === normalizedEmail)

    if (existingUser && existingUser.last_sign_in_at) {
      return sendError(event, createError({
        statusCode: 409,
        statusMessage: 'Este e-mail já possui uma conta ativa no sistema.'
      }))
    }

    // 4. URL de redirecionamento canônica de produção para o e-mail
    const redirectTo = `${getCanonicalAppUrl()}/auth/aceitar-convite`

    // 5. Gerar link Auth oficial do Supabase via generateLink (SEM envio pelo Supabase)
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: normalizedEmail,
      options: {
        data: { full_name: name.trim() },
        redirectTo
      }
    })

    if (linkErr || !linkData?.user?.id) {
      console.error('[AdminUsers] Error generating invite link:', linkErr?.message)
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: linkErr?.message || 'Falha ao gerar link de convite no Supabase.'
      }))
    }

    const newUserId = linkData.user.id
    const actionLink = linkData.properties?.action_link || ''

    if (!actionLink) {
      console.error('[AdminUsers] Action link was not returned by Supabase Auth.')
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: 'Falha ao obter link de ativação gerado pelo Supabase.'
      }))
    }

    // 6. Configurar estado de convite pendente no app_metadata (protegido contra manipulação do client)
    await supabaseAdmin.auth.admin.updateUserById(newUserId, {
      app_metadata: { admin_invite_pending: true }
    })

    // 7. Provisionar perfil com is_active = false (PENDENTE até conclusão da senha)
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUserId,
        full_name: name.trim(),
        role,
        is_active: false, // ESTADO PENDENTE
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (profileErr) {
      console.error('[AdminUsers] Error upserting invited profile:', profileErr.message)
    }

    // 7. Enviar o e-mail com template institucional via SMTP Skymail (Destinatário dinâmico)
    const mailResult = await sendAdminInvitationEmail({
      toEmail: normalizedEmail,
      toName: name.trim(),
      role,
      actionLink
    })

    if (!mailResult.success) {
      console.warn('[AdminUsers] SMTP delivery failed. Invitation is pending and can be resent:', mailResult.error)
      return sendError(event, createError({
        statusCode: 502,
        statusMessage: `Convite criado, mas houve falha no envio do e-mail (${mailResult.error || 'SMTP Error'}). Você pode reenviá-lo na lista de administradores.`
      }))
    }

    // 8. Log de auditoria seguro (Zero tokens ou links expostos no log)
    const auditEvent = role === 'master_admin' ? 'MASTER_ADMIN_INVITED' : 'ADMIN_INVITED'
    console.info(`[Audit] ${auditEvent}`, {
      actor_user_id: actorUserId,
      target_user_id: newUserId,
      target_email: maskedEmail,
      role,
      transport: 'Skymail SMTP',
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      message: `Convite enviado com sucesso para ${normalizedEmail}!`,
      user: {
        id: newUserId,
        email: normalizedEmail,
        fullName: name.trim(),
        role,
        isActive: false
      }
    }
  } catch (err: any) {
    console.error('[AdminUsers] Unexpected invite error:', err)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Erro interno ao processar convite.'
    }))
  }
})
