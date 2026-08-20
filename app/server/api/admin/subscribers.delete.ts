import { getQuery, createError } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { requireAdmin } from '../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const email = (query.email as string)?.toLowerCase().trim()

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'E-mail do inscrito é obrigatório'
    })
  }

  if (!supabaseAdmin) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Supabase admin client not initialized on server'
    })
  }

  try {
    // 1. Deletar da tabela dedicada
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .delete()
      .eq('email', email)

    if (error) {
      console.warn('[API Delete Subscriber] Table delete error:', error.message)
    }

    // 2. Deletar do JSON legado
    const { data: legacyData } = await supabaseAdmin
      .from('pdf_settings')
      .select('id, layout_settings')
      .eq('category', 'GERAL')
      .maybeSingle()

    if (legacyData?.layout_settings?.newsletter_subscribers) {
      const list = legacyData.layout_settings.newsletter_subscribers.filter(
        (s: any) => s.email?.toLowerCase().trim() !== email
      )
      await supabaseAdmin
        .from('pdf_settings')
        .update({
          layout_settings: {
            ...legacyData.layout_settings,
            newsletter_subscribers: list
          }
        })
        .eq('id', legacyData.id)
    }

    return { success: true }
  } catch (err: any) {
    console.error('[API Delete Subscriber Error]', err.message)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao excluir inscrito da newsletter'
    })
  }
})
