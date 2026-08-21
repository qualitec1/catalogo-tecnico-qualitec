import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

if (typeof (globalThis as any).WebSocket === 'undefined') {
  ;(globalThis as any).WebSocket = ws
}

let _supabaseServer: any = null

const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (url && key) {
  _supabaseServer = createClient(
    url,
    key,
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
  console.warn('Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set for supabaseServer.')
}

export const supabaseServer = _supabaseServer
