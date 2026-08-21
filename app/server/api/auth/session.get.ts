import { getCookie, getHeader, createError, sendError } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  let accessToken = getCookie(event, 'sb-access-token')
  if (!accessToken) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim()
    }
  }

  if (!accessToken) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'No active session' }))
  }

  if (!supabaseAdmin) {
    return sendError(event, createError({ statusCode: 503, statusMessage: 'Supabase is not configured on server.' }))
  }

  // Obter informações do usuário a partir do token
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)

  if (authError || !user) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid session' }))
  }

  // Consultar perfil e autorização
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  const isActive = profile?.is_active === true
  const isMasterAdmin = profile?.role === 'master_admin' && isActive
  const isAdmin = (profile?.role === 'admin' || isMasterAdmin) && isActive

  return {
    user,
    profile: profile || null,
    isAdmin,
    isMasterAdmin
  }
})
