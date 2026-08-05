import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = (config.public as any)?.supabaseUrl || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || (config.public as any)?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[API Contacts] SUPABASE_URL ou Chave não configuradas.')
      return { contacts: [] }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('pdf_settings')
      .select('layout_settings')
      .eq('category', 'GERAL')
      .maybeSingle()

    if (error) {
      console.error('[API Contacts Error]', error)
      return { contacts: [] }
    }

    if (!data) {
      return { contacts: [] }
    }

    const contacts = data.layout_settings?.contact_submissions || []
    return { contacts }
  } catch (err: any) {
    console.error('[API Contacts Error]', err)
    return { contacts: [] }
  }
})
