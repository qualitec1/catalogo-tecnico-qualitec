import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

// Polyfill seguro de WebSocket para Node.js < 22 no runtime SSR do Nitro
if (typeof (globalThis as any).WebSocket === 'undefined') {
  ;(globalThis as any).WebSocket = ws
}

let _supabaseAdmin: any = null

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (supabaseUrl && serviceRoleKey) {
  _supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      realtime: {
        transport: ws
      }
    }
  )
} else {
  // eslint-disable-next-line no-console
  console.warn('[Security] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. supabaseAdmin is null.')
}

export const supabaseAdmin = _supabaseAdmin
