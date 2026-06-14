import { readBody, createError, sendError } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body || {}

  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email and password are required' }))
  }

  if (!supabaseAdmin) {
    console.error('register.post.ts: supabaseAdmin is not configured')
    return sendError(event, createError({ statusCode: 503, statusMessage: 'Supabase not configured on server. Contact administrator.' }))
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })

    if (error) {
      console.error('register.post.ts: supabase createUser error', {
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details,
        hint: error.hint,
        error_id: error.error_id || error.requestId || null,
      })

      const rawMessage = typeof error.message === 'string' ? error.message : 'Falha ao criar conta'
      const normalizedMessage = rawMessage.toLowerCase()
      const isAlreadyRegistered = normalizedMessage.includes('already registered') || normalizedMessage.includes('already exists')
      const statusCode = error.status || (isAlreadyRegistered ? 409 : 400)
      const statusMessage = isAlreadyRegistered
        ? 'Usuário já cadastrado. Faça login ou recupere sua senha.'
        : statusCode >= 500
          ? 'Erro interno ao criar conta. Verifique a configuração do Supabase.'
          : rawMessage

      return sendError(event, createError({ statusCode, statusMessage }))
    }

    return {
      ok: true,
      message: 'Conta criada com sucesso. Faça login.',
      user: data.user || null
    }
  } catch (err) {
    console.error('register.post.ts: unexpected error', err)
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Unexpected server error while creating account' }))
  }
})
