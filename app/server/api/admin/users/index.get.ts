import { defineEventHandler, createError, sendError } from 'h3'
import { requireMasterAdmin } from '../../../utils/requireMasterAdmin'
import { supabaseAdmin } from '../../../utils/supabaseAdmin'

export interface AdminUserListItem {
  id: string
  email: string
  fullName: string
  role: 'master_admin' | 'admin' | 'user'
  isActive: boolean
  isPending: boolean
  totpEnabled: boolean
  createdAt: string
  lastSignInAt: string | null
}

export default defineEventHandler(async (event) => {
  // 1. Somente Master Admin pode listar todos os administradores e seus detalhes
  await requireMasterAdmin(event)

  if (!supabaseAdmin) {
    return sendError(event, createError({
      statusCode: 503,
      statusMessage: 'Supabase admin client unavailable'
    }))
  }

  try {
    // 2. Buscar todos os profiles administrativos (admin e master_admin)
    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, is_active, created_at')
      .in('role', ['admin', 'master_admin'])
      .order('created_at', { ascending: true })

    if (profileErr) {
      console.error('[AdminUsers] Error querying profiles:', profileErr.message)
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: 'Falha ao buscar perfis administrativos'
      }))
    }

    // 3. Buscar usuários do Supabase Auth para obter e-mail e status de convite
    const { data: authUsersData, error: authUsersErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (authUsersErr) {
      console.error('[AdminUsers] Error listing auth users:', authUsersErr.message)
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: 'Falha ao listar contas de autenticação'
      }))
    }

    const authUsersMap = new Map<string, any>()
    for (const u of authUsersData.users || []) {
      authUsersMap.set(u.id, u)
    }

    // 4. Buscar status de 2FA
    const { data: totpList } = await supabaseAdmin
      .from('totp_secrets')
      .select('user_id, enabled')
      .eq('enabled', true)

    const totpSet = new Set<string>((totpList || []).map((t: any) => t.user_id))

    // 5. Correlacionar e formatar lista segura
    const result: AdminUserListItem[] = (profiles || []).map((p: any) => {
      const authUser = authUsersMap.get(p.id)
      const email = authUser?.email || 'Sem e-mail'
      // Convite pendente se o perfil está com is_active = false e nunca logou, ou nunca confirmou e-mail
      const isPending = Boolean(
        !p.is_active ||
        (authUser && !authUser.last_sign_in_at && (!authUser.email_confirmed_at || authUser.invited_at))
      )

      return {
        id: p.id,
        email,
        fullName: p.full_name || authUser?.user_metadata?.full_name || 'Administrador',
        role: p.role,
        isActive: p.is_active,
        isPending,
        totpEnabled: totpSet.has(p.id),
        createdAt: p.created_at || authUser?.created_at || new Date().toISOString(),
        lastSignInAt: authUser?.last_sign_in_at || null
      }
    })

    return {
      success: true,
      users: result
    }
  } catch (err: any) {
    console.error('[AdminUsers] Unexpected error:', err)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Erro interno ao consultar lista de administradores'
    }))
  }
})
