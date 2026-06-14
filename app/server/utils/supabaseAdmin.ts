import 'dotenv/config'
import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

// Do not throw on import time to allow dev server to start when envs are missing.
// Export `supabaseAdmin` as `null` when config is not present; endpoints should
// handle the absence and return proper errors. This prevents an uncaught
// exception during module initialization.
let _supabaseAdmin: any = null

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  _supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false
      },
      realtime: {
        transport: ws
      }
    }
  )
} else {
  // Informative warning for developer
  // eslint-disable-next-line no-console
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. supabaseAdmin will be null.')
}

export const supabaseAdmin = _supabaseAdmin
