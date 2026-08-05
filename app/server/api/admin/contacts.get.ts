import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NUXT_PUBLIC_SUPABASE_URL ||
      (config.public as any)?.supabaseUrl ||
      ''

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY ||
      (config.public as any)?.supabaseAnonKey ||
      ''

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[API Contacts] SUPABASE_URL ou Chave não configuradas no servidor.')
      return { contacts: [] }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    let combinedContacts: Array<any> = []

    // 1. Tentar buscar na nova tabela dedicada 'contact_submissions'
    const { data: tableData, error: tableError } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (!tableError && tableData && tableData.length > 0) {
      combinedContacts = tableData.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        company: item.company,
        subject: item.subject,
        message: item.message,
        productName: item.product_name,
        type: item.type || 'contact',
        created_at: item.created_at
      }))
    }

    // 2. Buscar no JSON legado 'pdf_settings' (category = 'GERAL')
    const { data: legacyData } = await supabase
      .from('pdf_settings')
      .select('layout_settings')
      .eq('category', 'GERAL')
      .maybeSingle()

    const legacyContacts = legacyData?.layout_settings?.contact_submissions || []

    // 3. Mesclar mantendo IDs únicos
    const contactMap = new Map<string, any>()

    for (const c of legacyContacts) {
      if (c) {
        const id = c.id || c.created_at || Math.random().toString()
        contactMap.set(id, c)
      }
    }

    for (const c of combinedContacts) {
      if (c) {
        contactMap.set(c.id, c)
      }
    }

    const finalContacts = Array.from(contactMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return { contacts: finalContacts }
  } catch (err: any) {
    console.error('[API Contacts Error]', err)
    return { contacts: [] }
  }
})

