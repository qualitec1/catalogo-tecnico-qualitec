import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Client exclusivo para autenticação pública / signInWithPassword via anon key.
// Configurado sem persistência de sessão para evitar contaminação em ambiente server-side.
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
      }
    }
  )
} else {
  // eslint-disable-next-line no-console
  console.warn('[Security] SUPABASE_URL or SUPABASE_ANON_KEY not set. supabaseAuth is null.')
}

export const supabaseAuth = _supabaseAuth
