import { readBody, createError, sendError } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { requireAdmin } from '../../utils/requireAdmin'

// Validação de força de senha
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Senha deve ter no mínimo 8 caracteres')
  }
  
  if (password.length > 128) {
    errors.push('Senha muito longa (máximo 128 caracteres)')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número')
  }
  
  // Verifica senhas comuns
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123']
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Senha muito comum. Escolha uma senha mais forte')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export default defineEventHandler(async (event) => {
  // Apenas administradores autenticados e ativos podem registrar novos usuários
  await requireAdmin(event)

  const body = await readBody(event)
  const { email, password, role = 'user' } = body || {}

  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email and password are required' }))
  }

  // Valida formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return sendError(event, createError({ 
      statusCode: 400, 
      statusMessage: 'Email inválido' 
    }))
  }

  // Valida força da senha
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return sendError(event, createError({ 
      statusCode: 400, 
      statusMessage: passwordValidation.errors.join('. ') 
    }))
  }

  if (!supabaseAdmin) {
    console.error('register.post.ts: supabaseAdmin is not configured')
    return sendError(event, createError({ statusCode: 503, statusMessage: 'Supabase not configured on server. Contact administrator.' }))
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })

    if (error) {
      // Log interno (não expõe ao cliente)
      console.error('[Security] Registration failed:', {
        timestamp: new Date().toISOString(),
        email: email.replace(/(?<=.{2}).(?=.*@)/g, '*'), // Mascara email no log
        error_code: error.code,
        ip: event.node.req.socket.remoteAddress
      })

      const rawMessage = typeof error.message === 'string' ? error.message : 'Falha ao criar conta'
      const normalizedMessage = rawMessage.toLowerCase()
      const isAlreadyRegistered = normalizedMessage.includes('already registered') || normalizedMessage.includes('already exists')
      const statusCode = error.status || (isAlreadyRegistered ? 409 : 400)
      
      // Mensagem genérica (não expõe detalhes internos)
      const statusMessage = isAlreadyRegistered
        ? 'Usuário já cadastrado. Faça login ou recupere sua senha.'
        : 'Erro ao criar conta. Tente novamente mais tarde.'

      return sendError(event, createError({ statusCode, statusMessage }))
    }

    // Se criado com sucesso, atualizar perfil com a role definida pelo admin
    if (data.user?.id) {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        role: role === 'admin' ? 'admin' : 'user',
        is_active: true,
        updated_at: new Date().toISOString()
      })
    }

    return {
      ok: true,
      message: 'Conta criada com sucesso pelo administrador.',
      user: data.user || null
    }
  } catch (err) {
    // Log interno do erro inesperado
    console.error('[Security] Unexpected registration error:', {
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    })
    
    // Mensagem genérica para o cliente
    return sendError(event, createError({ 
      statusCode: 500, 
      statusMessage: 'Erro interno ao criar conta. Tente novamente mais tarde.' 
    }))
  }
})
