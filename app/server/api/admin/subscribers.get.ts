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
      console.warn('[API Subscribers] SUPABASE_URL ou Chave não configuradas no servidor.')
      return { subscribers: [] }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    let combinedSubscribers: Array<{ email: string; lang: string; subscribed_at: string }> = []

    // 1. Tentar buscar na nova tabela dedicada 'newsletter_subscribers'
    const { data: tableData, error: tableError } = await supabase
      .from('newsletter_subscribers')
      .select('email, lang, created_at')
      .order('created_at', { ascending: false })

    if (!tableError && tableData && tableData.length > 0) {
      combinedSubscribers = tableData.map(item => ({
        email: item.email,
        lang: item.lang || 'pt',
        subscribed_at: item.created_at
      }))
    }

    // 2. Buscar no JSON legado 'pdf_settings' (varrendo todas as linhas de configuração)
    const emailMap = new Map<string, { email: string; lang: string; subscribed_at: string }>()

    const { data: legacyRows } = await supabase
      .from('pdf_settings')
      .select('layout_settings')

    if (legacyRows && legacyRows.length > 0) {
      for (const row of legacyRows) {
        const subs = row.layout_settings?.newsletter_subscribers
        if (Array.isArray(subs)) {
          for (const sub of subs) {
            if (sub?.email) {
              const norm = sub.email.toLowerCase().trim()
              emailMap.set(norm, {
                email: norm,
                lang: sub.lang || 'pt',
                subscribed_at: sub.subscribed_at || new Date().toISOString()
              })
            }
          }
        }
      }
    }

    // 3. Mesclar dados da nova tabela
    for (const sub of combinedSubscribers) {
      if (sub?.email) {
        const norm = sub.email.toLowerCase().trim()
        emailMap.set(norm, {
          email: norm,
          lang: sub.lang || 'pt',
          subscribed_at: sub.subscribed_at || new Date().toISOString()
        })
      }
    }

    const finalSubscribers = Array.from(emailMap.values()).sort(
      (a, b) => new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime()
    )

    return { subscribers: finalSubscribers }
  } catch (err: any) {
    console.error('[API Subscribers Error]', err)
    return { subscribers: [] }
  }
})

