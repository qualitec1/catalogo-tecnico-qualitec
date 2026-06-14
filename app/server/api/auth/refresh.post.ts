import { getCookie, setCookie, createError, sendError } from 'h3'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'sb-refresh-token')
  if (!refreshToken) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'No refresh token' }))
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return sendError(event, createError({ statusCode: 503, statusMessage: 'Supabase service role key is not configured on server.' }))
  }

  // Use Supabase REST token endpoint to exchange refresh token for new session
  const url = `${process.env.SUPABASE_URL}/auth/v1/token`
  const params = new URLSearchParams()
  params.append('grant_type', 'refresh_token')
  params.append('refresh_token', refreshToken)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    },
    body: params.toString()
  })

  if (!res.ok) {
    // Clear cookies on failure
    setCookie(event, 'sb-access-token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 })
    setCookie(event, 'sb-refresh-token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 })
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Failed to refresh session' }))
  }

  const data = await res.json()
  const accessToken = data.access_token
  const newRefreshToken = data.refresh_token
  const expiresIn = data.expires_in

  setCookie(event, 'sb-access-token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: expiresIn || 3600 })
  setCookie(event, 'sb-refresh-token', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24 * 30 })

  // Return safe user info by calling /auth/v1/user
  const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${accessToken}` } })
  const user = await userRes.json()

  return { user }
})
