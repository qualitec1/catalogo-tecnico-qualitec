import { getCookie, createError, sendError } from 'h3'

export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'sb-access-token')
  if (!accessToken) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'No active session' }))
  }

  if (!process.env.SUPABASE_URL) {
    return sendError(event, createError({ statusCode: 503, statusMessage: 'Supabase URL is not configured on server.' }))
  }

  // Get user info from Supabase Auth REST endpoint using access token
  const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!userRes.ok) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid session' }))
  }

  const user = await userRes.json()
  return { user }
})
