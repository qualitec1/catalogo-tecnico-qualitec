import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

// Polyfill seguro de WebSocket para Node.js < 22 no runtime SSR do Nitro
if (typeof (globalThis as any).WebSocket === 'undefined') {
  ;(globalThis as any).WebSocket = ws
}

let _supabaseAuth: any = null

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

if (supabaseUrl && anonKey) {
  _supabaseAuth = createClient(
    supabaseUrl,
    anonKey,
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
  console.warn('[Security] SUPABASE_URL or SUPABASE_ANON_KEY not set. supabaseAuth is null.')
}

export const supabaseAuth = _supabaseAuth
