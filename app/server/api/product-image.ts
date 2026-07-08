import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do produto é obrigatório' })
  }

  const config = useRuntimeConfig()
  const supabaseUrl = (config.public as any).supabaseUrl || process.env.SUPABASE_URL
  const supabaseKey = (config.public as any).supabaseAnonKey || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw createError({ statusCode: 500, statusMessage: 'Configuração do Supabase ausente' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase
    .from('products')
    .select('image')
    .eq('id', id)
    .single()

  if (error || !data?.image) {
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
  }

  // Se a imagem é uma URL pública (R2, wixstatic, etc), faz proxy
  if (data.image.startsWith('http://') || data.image.startsWith('https://')) {
    try {
      const res = await fetch(data.image)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const arrayBuffer = await res.arrayBuffer()
      const contentType = res.headers.get('Content-Type') || 'image/png'
      setHeader(event, 'Content-Type', contentType)
      setHeader(event, 'Cache-Control', 'public, max-age=86400')
      return Buffer.from(arrayBuffer)
    } catch (e: any) {
      throw createError({ statusCode: 502, statusMessage: 'Imagem externa indisponível' })
    }
  }

  // Caminho local (ex: /placeholder.png) — redireciona
  return sendRedirect(event, data.image)
})
