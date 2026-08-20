import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  // Exige administrador autenticado e ativo
  await requireAdmin(event)

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

    // 2. Buscar no JSON legado 'pdf_settings' (varrendo todas as linhas de configuração)
    const contactMap = new Map<string, any>()

    const { data: legacyRows } = await supabase
      .from('pdf_settings')
      .select('layout_settings')

    if (legacyRows && legacyRows.length > 0) {
      for (const row of legacyRows) {
        const cnts = row.layout_settings?.contact_submissions
        if (Array.isArray(cnts)) {
          for (const c of cnts) {
            if (c) {
              const id = c.id || c.created_at || Math.random().toString()
              contactMap.set(id, c)
            }
          }
        }
      }
    }

    // 3. Mesclar dados da nova tabela
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

