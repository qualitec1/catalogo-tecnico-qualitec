import { H3Event, getCookie, getHeader, createError } from 'h3'
import { supabaseAdmin } from './supabaseAdmin'
import type { AdminUserContext } from './requireAdmin'

/**
 * Valida se a requisição atual possui uma sessão válida exclusivamente de MASTER_ADMIN ativo.
 * Lança 401 se não autenticado e 403 se não for master_admin ativo.
 */
export async function requireMasterAdmin(event: H3Event): Promise<AdminUserContext> {
  // 1. Obter o access token do cookie ou do header Authorization
  let accessToken = getCookie(event, 'sb-access-token')
  if (!accessToken) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim()
    }
  }

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required. Please login.'
    })
  }

  if (!supabaseAdmin) {
    console.error('[requireMasterAdmin] supabaseAdmin is not initialized.')
    throw createError({
      statusCode: 503,
      statusMessage: 'Authentication service unavailable.'
    })
  }

  // 2. Validar token com o Supabase Auth
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)

  if (authError || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired session. Please login again.'
    })
  }

  // 3. Consultar perfil e autorização de Master Admin
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.warn('[requireMasterAdmin] Could not verify profiles table/columns:', profileError.message)
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Profile not found or unverified.'
    })
  }

  // Apenas 'master_admin' ativo é autorizado
  if (!profile || profile.role !== 'master_admin' || profile.is_active !== true) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Esta operação requer privilégios exclusivos de Master Admin.'
    })
  }

  // 4. Anexar ao contexto para uso no handler
  event.context.user = user
  event.context.adminProfile = profile

  return {
    user,
    profile
  }
}
