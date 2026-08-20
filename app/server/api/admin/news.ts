import { readBody, createError, getMethod } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { requireAdmin } from '../../utils/requireAdmin'

const ALLOWED_NEWS_FIELDS = [
  'id', 'title_pt', 'title_en', 'title_es', 'image_url',
  'link_type', 'link_value', 'link_label_pt', 'link_label_en',
  'link_label_es', 'show_link_button'
]

function sanitizeNewsPayload(input: any): Record<string, any> {
  const result: Record<string, any> = {}
  for (const field of ALLOWED_NEWS_FIELDS) {
    if (input[field] !== undefined) {
      result[field] = input[field]
    }
  }
  result.updated_at = new Date().toISOString()
  return result
}

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
    // 1. GET: Listar os cards de notícias
    if (method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('home_news_cards')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      return { success: true, data: data || [] }
    }

    // 2. POST / PUT: Upsert de card de notícias
    if (method === 'POST' || method === 'PUT') {
      const body = await readBody(event)

      if (Array.isArray(body)) {
        const rows = body.map(sanitizeNewsPayload)
        const { data, error } = await supabaseAdmin
          .from('home_news_cards')
          .upsert(rows, { onConflict: 'id' })
          .select()

        if (error) throw error
        return { success: true, count: data?.length || 0, data }
      }

      const sanitized = sanitizeNewsPayload(body)
      if (!sanitized.id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'ID do card (1, 2 ou 3) é obrigatório'
        })
      }

      const { data, error } = await supabaseAdmin
        .from('home_news_cards')
        .upsert([sanitized], { onConflict: 'id' })
        .select()

      if (error) throw error
      return { success: true, data }
    }

    throw createError({
      statusCode: 405,
      statusMessage: `Method ${method} Not Allowed`
    })
  } catch (err: any) {
    console.error(`[API admin/news] Error during ${method}:`, err.message)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Internal Server Error'
    })
  }
})
