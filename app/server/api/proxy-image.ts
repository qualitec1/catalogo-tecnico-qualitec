import { getQuery, createError, setHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL da imagem é obrigatória',
    })
  }

  // Se a URL for um placeholder local ou caminho relativo, redirecionar ou tratar
  if (url.startsWith('/')) {
    return sendRedirect(event, url)
  }

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Falha ao baixar imagem remota: ${res.statusText}`)

    const contentType = res.headers.get('Content-Type') || 'image/png'
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable') // Cache de 1 ano
    setHeader(event, 'Access-Control-Allow-Origin', '*') // Garante CORS livre para o canvas

    return buffer
  } catch (error: any) {
    console.error('[API proxy-image] Erro ao carregar imagem:', url, error.message)
    throw createError({
      statusCode: 404,
      statusMessage: 'Imagem não encontrada ou inacessível',
    })
  }
})
