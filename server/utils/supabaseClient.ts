import 'dotenv/config'
import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  // allow client-side code to still build; this file is for server-side public calls
  console.warn('Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set')
}

export const supabaseServer = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '',
  {
    realtime: {
      transport: ws
    }
  }
)
