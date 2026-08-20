import { readBody, getQuery, createError, getMethod } from 'h3'
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
    // 1. GET: Buscar configurações (GERAL ou todas)
    if (method === 'GET') {
      const query = getQuery(event)
      const category = (query.category as string) || 'GERAL'

      const { data, error } = await supabaseAdmin
        .from('pdf_settings')
        .select('*')
        .eq('category', category)
        .maybeSingle()

      if (error) throw error
      return { success: true, data }
    }

    // 2. POST / PUT: Salvar configurações
    if (method === 'POST' || method === 'PUT') {
      const body = await readBody(event)
      const category = String(body.category || 'GERAL').trim()

      if (!category) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Categoria da configuração é obrigatória'
        })
      }

      // Se payload contém id, remover para upsert limpo por category
      const { id: _, ...payload } = body

      const { data, error } = await supabaseAdmin
        .from('pdf_settings')
        .upsert(
          {
            ...payload,
            category
          },
          { onConflict: 'category' }
        )
        .select()

      if (error) throw error
      return { success: true, data }
    }

    throw createError({
      statusCode: 405,
      statusMessage: `Method ${method} Not Allowed`
    })
  } catch (err: any) {
    console.error(`[API admin/settings] Error during ${method}:`, err.message)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Internal Server Error'
    })
  }
})
