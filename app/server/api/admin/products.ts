import { readBody, getQuery, createError } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
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
      const { error, data } = await supabaseAdmin.from('products').insert([body]).select()
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

      // Remove id from body to avoid trying to update primary key
      const { id: _, ...payload } = body

      const { error, data } = await supabaseAdmin
        .from('products')
        .update(payload)
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
    console.error(`[API admin/products] Error during ${method}:`, err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Internal Server Error'
    })
  }
})
