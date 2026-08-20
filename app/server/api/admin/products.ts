import { readBody, getQuery, createError, getMethod } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { requireAdmin } from '../../utils/requireAdmin'

const ALLOWED_PRODUCT_FIELDS = [
  'title', 'name_code', 'category', 'family', 'subcategory',
  'image', 'datasheet_name', 'datasheet_url', 'tag', 'tag_color_class',
  'bg_class', 'layout_slots', 'specs', 'image_scale', 'image_offset_x',
  'image_offset_y', 'sort_order', 'card_layout', 'ex_image_url', 'model3d_url'
]

function sanitizeProductPayload(input: any): Record<string, any> {
  const result: Record<string, any> = {}
  for (const field of ALLOWED_PRODUCT_FIELDS) {
    if (input[field] !== undefined) {
      result[field] = input[field]
    }
  }
  return result
}

export default defineEventHandler(async (event) => {
  // Defesa em profundidade: valida se o usuário é administrador ativo
  await requireAdmin(event)

  const method = getMethod(event)
  
  if (!supabaseAdmin) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Supabase admin client not initialized on server'
    })
  }

  try {
    if (method === 'POST') {
      const body = await readBody(event)

      // Suporte a inserção única ou em lote (batch/CSV import)
      if (Array.isArray(body)) {
        const sanitizedList = body.map(sanitizeProductPayload)
        const { error, data } = await supabaseAdmin.from('products').insert(sanitizedList).select()
        if (error) throw error
        return { success: true, count: data?.length || 0, data }
      }

      const sanitized = sanitizeProductPayload(body)
      const { error, data } = await supabaseAdmin.from('products').insert([sanitized]).select()
      if (error) throw error
      return { success: true, data }
    }
    
    if (method === 'PUT') {
      const body = await readBody(event)
      const query = getQuery(event)
      const id = query.id || body.id

      if (!id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Product ID is required for update'
        })
      }

      const sanitized = sanitizeProductPayload(body)
      const { error, data } = await supabaseAdmin
        .from('products')
        .update(sanitized)
        .eq('id', id)
        .select()

      if (error) throw error
      return { success: true, data }
    }

    if (method === 'DELETE') {
      const query = getQuery(event)
      const id = query.id

      if (id === 'all') {
        const { error } = await supabaseAdmin.from('products').delete().neq('id', 0)
        if (error) throw error
        return { success: true }
      }

      if (!id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Product ID is required for deletion'
        })
      }

      const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
      if (error) throw error
      return { success: true }
    }

    throw createError({
      statusCode: 405,
      statusMessage: `Method ${method} Not Allowed`
    })
  } catch (err: any) {
    console.error(`[API admin/products] Error during ${method}:`, err.message)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Internal Server Error'
    })
  }
})

