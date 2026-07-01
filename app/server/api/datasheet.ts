if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class {} as any
}
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID do produto é obrigatório',
    })
  }

  const config = useRuntimeConfig()
  const supabaseUrl = (config.public as any).supabaseUrl || process.env.SUPABASE_URL
  const supabaseKey = (config.public as any).supabaseAnonKey || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuração do Supabase ausente',
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Fetch product datasheet blob
  const { data, error } = await supabase
    .from('products')
    .select('title, name_code, datasheet_name, datasheet_blob')
    .eq('id', id)
    .single()

  if (error || !data || !data.datasheet_blob) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Datasheet não encontrado para este produto',
    })
  }

  // Convert postgres bytea string (starting with \x) or raw buffer
  let pdfBuffer: Buffer
  if (typeof data.datasheet_blob === 'string') {
    const hex = data.datasheet_blob.replace(/^\\x/, '')
    pdfBuffer = Buffer.from(hex, 'hex')
  } else {
    pdfBuffer = Buffer.from(data.datasheet_blob)
  }

  const filename = data.datasheet_name || `datasheet_${data.name_code || id}.pdf`

  // Send PDF response headers
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`)
  
  return pdfBuffer
})