import { H3Event, getCookie, getHeader, createError } from 'h3'
import { supabaseAdmin } from './supabaseAdmin'

export interface AdminUserContext {
  user: {
    id: string
    email?: string
    [key: string]: any
  }
  profile: {
    role: string
    is_active: boolean
    [key: string]: any
  }
}

/**
 * Valida se a requisição atual possui uma sessão válida de administrador ativo.
 * Lança 401 se não autenticado e 403 se autenticado mas não autorizado (role !== 'admin' ou is_active !== true).
 */
export async function requireAdmin(event: H3Event): Promise<AdminUserContext> {
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
    console.error('[requireAdmin] supabaseAdmin is not initialized.')
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

  // 3. Consultar perfil e autorização administrativa
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.warn('[requireAdmin] Could not verify profiles table/columns:', profileError.message)
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Administrative profile not found or unverified.'
    })
  }

  // Se não existir registro no profiles ou não for admin ativo -> 403 Forbidden
  if (!profile || profile.role !== 'admin' || profile.is_active !== true) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: You do not have administrative privileges.'
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
