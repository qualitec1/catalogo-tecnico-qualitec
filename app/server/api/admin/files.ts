import { getQuery, createError, getMethod } from 'h3'
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
    // 1. GET: Listar arquivos enviados
    if (method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('uploaded_files')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    }

    // 2. DELETE: Excluir registro de arquivo
    if (method === 'DELETE') {
      const query = getQuery(event)
      const id = query.id as string

      if (!id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'ID do arquivo é obrigatório para exclusão'
        })
      }

      const { error } = await supabaseAdmin
        .from('uploaded_files')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    }

    throw createError({
      statusCode: 405,
      statusMessage: `Method ${method} Not Allowed`
    })
  } catch (err: any) {
    console.error(`[API admin/files] Error during ${method}:`, err.message)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Internal Server Error'
    })
  }
})
