import 'dotenv/config'
import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

// Client exclusivo para operações administrativas / service_role no servidor.
// Configurado sem persistência de sessão para evitar contaminação em ambiente server-side.
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
