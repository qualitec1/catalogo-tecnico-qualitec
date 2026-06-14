import { setCookie, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const secure = process.env.NODE_ENV === 'production'

  // Clear cookies. If Supabase Admin is available the server could also revoke tokens.
  setCookie(event, 'sb-access-token', '', { httpOnly: true, secure, sameSite: 'strict', path: '/', maxAge: 0 })
  setCookie(event, 'sb-refresh-token', '', { httpOnly: true, secure, sameSite: 'strict', path: '/', maxAge: 0 })

  return { ok: true }
})
