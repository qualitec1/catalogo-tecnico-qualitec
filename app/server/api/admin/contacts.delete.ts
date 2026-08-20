import { getQuery, createError } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { requireAdmin } from '../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const id = query.id as string

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID do contato é obrigatório'
    })
  }

  if (!supabaseAdmin) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Supabase admin client not initialized on server'
    })
  }

  try {
    // 1. Tentar deletar da tabela dedicada
    const { error } = await supabaseAdmin
      .from('contact_submissions')
      .delete()
      .eq('id', id)

    if (error) {
      console.warn('[API Delete Contact] Table delete error:', error.message)
    }

    // 2. Deletar do JSON legado caso exista
    const { data: legacyData } = await supabaseAdmin
      .from('pdf_settings')
      .select('id, layout_settings')
      .eq('category', 'GERAL')
      .maybeSingle()

    if (legacyData?.layout_settings?.contact_submissions) {
      const list = legacyData.layout_settings.contact_submissions.filter((c: any) => c.id !== id)
      await supabaseAdmin
        .from('pdf_settings')
        .update({
          layout_settings: {
            ...legacyData.layout_settings,
            contact_submissions: list
          }
        })
        .eq('id', legacyData.id)
    }

    return { success: true }
  } catch (err: any) {
    console.error('[API Delete Contact Error]', err.message)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao excluir contato'
    })
  }
})
