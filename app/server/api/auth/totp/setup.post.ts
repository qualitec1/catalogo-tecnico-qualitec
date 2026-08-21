import { defineEventHandler, readBody, createError, sendError } from 'h3'
import qrcode from 'qrcode'
import { requireAdmin } from '../../../../server/utils/requireAdmin'
import { supabaseAuth } from '../../../../server/utils/supabaseAuth'
import { supabaseAdmin } from '../../../../server/utils/supabaseAdmin'
import { generateBase32Secret } from '../../../../server/utils/totp'

function buildOtpauthUrl(issuer: string, accountName: string, secret: string): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30'
  })
  return `otpauth://totp/${label}?${params.toString()}`
}

export default defineEventHandler(async (event) => {
  // 1. Validar autenticação e perfil administrativo ativo (Proteção contra IDOR)
  const adminCtx = await requireAdmin(event)
  const user = adminCtx.user
  const email = user.email || ''

  const body = await readBody(event)
  const { password } = body || {}

  if (!password) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Senha atual é obrigatória para iniciar a configuração de 2FA.'
    }))
  }

  if (!supabaseAuth || !supabaseAdmin) {
    return sendError(event, createError({
      statusCode: 503,
      statusMessage: 'Serviço de autenticação indisponível.'
    }))
  }

  // 2. Re-autenticar o administrador com sua senha atual via supabaseAuth (Anon client)
  const { error: authError } = await supabaseAuth.auth.signInWithPassword({
    email,
    password
  })

  if (authError) {
    console.warn('[Security] Tentativa inválida de setup TOTP - Senha incorreta:', {
      userId: user.id,
      timestamp: new Date().toISOString()
    })
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Senha atual incorreta.'
    }))
  }

  // 3. Verificar se o 2FA já está ativo (Bloqueio estrito de re-enrollment sem desativação prévia)
  const { data: existingTotp, error: checkError } = await supabaseAdmin
    .from('totp_secrets')
    .select('secret, enabled')
    .eq('user_id', user.id)
    .maybeSingle()

  if (checkError) {
    console.error('[Security] Error checking existing TOTP state:', checkError.message)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Erro ao verificar configuração de segurança atual.'
    }))
  }

  if (existingTotp && existingTotp.enabled === true) {
    console.warn('[Security] Tentativa de re-enrollment com 2FA já ativo bloqueada:', {
      userId: user.id,
      timestamp: new Date().toISOString()
    })
    return sendError(event, createError({
      statusCode: 409,
      statusMessage: 'A autenticação em dois fatores já está ativa nesta conta. Para configurar outro dispositivo, desative o 2FA primeiro.'
    }))
  }

  // 4. Gerar novo secret Base32 criptográfico
  const newSecret = generateBase32Secret(16)

  // 5. Gravar secret com enabled = false (PENDING / Proibido ativar antes de validar código)
  const { error: upsertError } = await supabaseAdmin
    .from('totp_secrets')
    .upsert({
      user_id: user.id,
      secret: newSecret,
      enabled: false,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (upsertError) {
    console.error('[Security] Failed to save pending TOTP secret:', upsertError.message)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Falha ao salvar chave de segurança temporária.'
    }))
  }

  // 6. Construir otpauth URI e gerar QR Code em formato Data URL
  const issuer = 'Qualitec Industrial'
  const otpauthUrl = buildOtpauthUrl(issuer, email, newSecret)

  let qrDataUrl = ''
  try {
    qrDataUrl = await qrcode.toDataURL(otpauthUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (err: any) {
    console.error('[Security] Error generating QR code image:', err.message)
  }

  // 7. Retornar dados necessários para o modal temporário
  return {
    ok: true,
    secret: newSecret,
    qrDataUrl,
    otpauthUrl
  }
})
