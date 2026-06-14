import { readBody, createError, sendError } from 'h3'
import { supabaseAdmin } from '../../../utils/supabaseAdmin'
import { normalizeBase32, generateBase32Secret } from '../../../utils/totp'

function buildOtpauthUrl(issuer: string, accountName: string, secret: string) {
  const label = encodeURIComponent(`${issuer}:${accountName}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  })
  return `otpauth://totp/${label}?${params.toString()}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, seed, generate } = body || {}

  if (!email || !password || (!seed && !generate)) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email, password and TOTP seed are required' }))
  }

  let normalizedSeed: string
  if (generate) {
    normalizedSeed = generateBase32Secret(16)
  } else {
    try {
      normalizedSeed = normalizeBase32(seed)
    } catch (error) {
      return sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid TOTP secret seed' }))
    }
  }

  if (!supabaseAdmin) {
    return sendError(event, createError({ statusCode: 503, statusMessage: 'Supabase not configured on server. Contact administrator.' }))
  }

  let signInResult = await supabaseAdmin.auth.signInWithPassword({ email, password })

  if (signInResult.error?.message?.includes('Email not confirmed')) {
    const listUsersResult = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (!listUsersResult.error) {
      const user = listUsersResult.data?.users?.find((user) => user.email === email)
      if (user?.id) {
        const confirmResult = await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true })
        if (!confirmResult.error) {
          signInResult = await supabaseAdmin.auth.signInWithPassword({ email, password })
        }
      }
    }
  }

  if (signInResult.error || !signInResult.data?.user?.id) {
    return sendError(event, createError({ statusCode: 401, statusMessage: signInResult.error?.message || 'Invalid credentials' }))
  }

  const userId = signInResult.data.user.id

  const { error: upsertError } = await supabaseAdmin
    .from('totp_secrets')
    .upsert({ user_id: userId, secret: normalizedSeed, enabled: true, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

  if (upsertError) {
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Failed to enable TOTP' }))
  }

  // Build otpauth URL and attempt to generate a QR code data URL if possible
  const issuer = process.env.NEXT_PUBLIC_APP_NAME || process.env.APP_NAME || 'organizze'
  const otpauth = buildOtpauthUrl(issuer, email, normalizedSeed)

  // Try dynamic import of qrcode to avoid crashing when dependency not installed
  let qrDataUrl: string | null = null
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const qrcode = await import('qrcode')
    if (qrcode && typeof qrcode.toDataURL === 'function') {
      qrDataUrl = await qrcode.toDataURL(otpauth)
    }
  } catch (e) {
    // QR generation is optional; continue without it
    // eslint-disable-next-line no-console
    console.warn('qrcode not available, skipping QR generation')
    qrDataUrl = null
  }

  return {
    ok: true,
    message: 'TOTP enabled. Use the secret seed in your authenticator app.',
    seed: normalizedSeed,
    otpauth_url: otpauth,
    qr_data_url: qrDataUrl
  }
})
