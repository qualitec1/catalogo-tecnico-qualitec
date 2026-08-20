import { readBody, getQuery, createError, getMethod } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { requireAdmin } from '../../utils/requireAdmin'

const ALLOWED_CATEGORY_FIELDS = [
  'category', 'cover_image_url', 'color_hex',
  'pdf_url', 'icon_url', 'badge_text', 'badge_icon_url'
]

function sanitizeCategoryPayload(input: any): Record<string, any> {
  const result: Record<string, any> = {}
  for (const field of ALLOWED_CATEGORY_FIELDS) {
    if (input[field] !== undefined) {
      result[field] = input[field]
    }
  }
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
    // 1. GET: Listar category_assets
    if (method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('category_assets')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error
      return { success: true, data: data || [] }
    }

    // 2. POST / PUT: Salvar ou renomear categoria em cascata
    if (method === 'POST' || method === 'PUT') {
      const body = await readBody(event)
      const query = getQuery(event)
      const action = query.action as string

      // Renomeação de Categoria em Cascata (Server-side)
      if (action === 'rename' || (body.oldCategory && body.newCategory)) {
        const oldCat = String(body.oldCategory || '').trim()
        const newCat = String(body.newCategory || '').trim()

        if (!oldCat || !newCat) {
          throw createError({
            statusCode: 400,
            statusMessage: 'oldCategory e newCategory são obrigatórios para renomeação'
          })
        }

        // Atualiza products, category_assets e pdf_settings sequencialmente via supabaseAdmin
        const { error: prodErr } = await supabaseAdmin
          .from('products')
          .update({ category: newCat })
          .eq('category', oldCat)

        if (prodErr) throw prodErr

        const { error: assetErr } = await supabaseAdmin
          .from('category_assets')
          .update({ category: newCat })
          .eq('category', oldCat)

        if (assetErr) throw assetErr

        const { error: pdfErr } = await supabaseAdmin
          .from('pdf_settings')
          .update({ category: newCat })
          .eq('category', oldCat)

        if (pdfErr) console.warn('[API Categories Rename PDF Warning]', pdfErr.message)

        return { success: true, message: `Categoria renomeada de "${oldCat}" para "${newCat}"` }
      }

      // Upsert / Save padrão
      const sanitized = sanitizeCategoryPayload(body)

      if (!sanitized.category) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Nome da categoria é obrigatório'
        })
      }

      const { data, error } = await supabaseAdmin
        .from('category_assets')
        .upsert(sanitized, { onConflict: 'category' })
        .select()

      if (error) throw error
      return { success: true, data }
    }

    // 3. DELETE: Excluir categoria
    if (method === 'DELETE') {
      const query = getQuery(event)
      const category = query.category as string
      const id = query.id as string

      if (!category && !id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'ID ou nome da categoria é obrigatório para exclusão'
        })
      }

      let queryBuilder = supabaseAdmin.from('category_assets').delete()
      if (id) {
        queryBuilder = queryBuilder.eq('id', id)
      } else if (category) {
        queryBuilder = queryBuilder.eq('category', category)
      }

      const { error } = await queryBuilder
      if (error) throw error

      return { success: true }
    }

    throw createError({
      statusCode: 405,
      statusMessage: `Method ${method} Not Allowed`
    })
  } catch (err: any) {
    console.error(`[API admin/categories] Error during ${method}:`, err.message)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Internal Server Error'
    })
  }
})
