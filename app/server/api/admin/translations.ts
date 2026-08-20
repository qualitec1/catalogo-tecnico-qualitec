import { readBody, createError, getMethod } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { requireAdmin } from '../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const method = getMethod(event)

  if (!supabaseAdmin) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Supabase admin client not initialized on server'
    })
  }

  try {
    // 1. GET: Listar todas as traduções
    if (method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('site_translations')
        .select('*')
        .order('key', { ascending: true })

      if (error) throw error
      return { success: true, data: data || [] }
    }

    // 2. POST / PUT: Upsert de traduções (individual ou em lote)
    if (method === 'POST' || method === 'PUT') {
      const body = await readBody(event)

      if (Array.isArray(body)) {
        const rows = body.map((item: any) => ({
          lang_code: String(item.lang_code || item.langCode || 'pt').toLowerCase().trim(),
          key: String(item.key || '').trim(),
          value: item.value ?? '',
          section: item.section || 'geral',
          updated_at: new Date().toISOString()
        })).filter(r => r.key && r.lang_code)

        if (rows.length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Nenhuma tradução válida fornecida para salvamento'
          })
        }

        const { data, error } = await supabaseAdmin
          .from('site_translations')
          .upsert(rows, { onConflict: 'lang_code,key' })
          .select()

        if (error) throw error
        return { success: true, count: data?.length || 0, data }
      }

      // Individual
      const row = {
        lang_code: String(body.lang_code || body.langCode || 'pt').toLowerCase().trim(),
        key: String(body.key || '').trim(),
        value: body.value ?? '',
        section: body.section || 'geral',
        updated_at: new Date().toISOString()
      }

      if (!row.key || !row.lang_code) {
        throw createError({
          statusCode: 400,
          statusMessage: 'key e lang_code são obrigatórios'
        })
      }

      const { data, error } = await supabaseAdmin
        .from('site_translations')
        .upsert([row], { onConflict: 'lang_code,key' })
        .select()

      if (error) throw error
      return { success: true, data }
    }

    throw createError({
      statusCode: 405,
      statusMessage: `Method ${method} Not Allowed`
    })
  } catch (err: any) {
    console.error(`[API admin/translations] Error during ${method}:`, err.message)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Internal Server Error'
    })
  }
})
