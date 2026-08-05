import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = (config.public as any)?.supabaseUrl || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || (config.public as any)?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[API Subscribers] SUPABASE_URL ou Chave não configuradas.')
      return { subscribers: [] }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('pdf_settings')
      .select('layout_settings')
      .eq('category', 'GERAL')
      .maybeSingle()

    if (error) {
      console.error('[API Subscribers Error]', error)
      return { subscribers: [] }
    }

    if (!data) {
      return { subscribers: [] }
    }

    const subscribers = data.layout_settings?.newsletter_subscribers || []
    return { subscribers }
  } catch (err: any) {
    console.error('[API Subscribers Error]', err)
    return { subscribers: [] }
  }
})
