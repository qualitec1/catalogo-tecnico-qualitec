import { defineEventHandler, getQuery, getHeader, setResponseStatus, setResponseHeader, createError } from 'h3'

const ALLOWED_DOMAINS = [
  'video.wixstatic.com',
  'pub-25a6482a064a4590a456d3dd2a76114b.r2.dev',
  'r2.dev',
  'supabase.co',
  'cloudflarestorage.com',
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'vimeo.com',
  'player.vimeo.com',
  'lh3.googleusercontent.com',
  'googleusercontent.com'
]

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    const hostname = url.hostname.toLowerCase()
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return false
    if (hostname.match(/^10\.|^172\.(1[6-9]|2[0-9]|3[01])\.|^192\.168\./)) return false
    if (hostname.startsWith('169.254.')) return false
    return ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const videoUrl = query.url as string
  if (!videoUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url parameter' })
  }

  if (!isAllowedUrl(videoUrl)) {
    throw createError({ statusCode: 403, statusMessage: 'Domínio não permitido para proxy de vídeo' })
  }

  try {
    const reqHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }

    const range = getHeader(event, 'range')
    if (range) {
      reqHeaders['range'] = range
    }

    const response = await fetch(videoUrl, {
      headers: reqHeaders,
    })

    setResponseStatus(event, response.status)

    // Forward essential media headers
    const headersToForward = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'last-modified',
      'etag'
    ]

    headersToForward.forEach((h) => {
      const val = response.headers.get(h)
      if (val) {
        setResponseHeader(event, h, val)
      }
    })

    if (!response.headers.get('content-type')) {
      setResponseHeader(event, 'content-type', 'video/mp4')
    }
    setResponseHeader(event, 'accept-ranges', 'bytes')

    return response.body
  } catch (err: any) {
    console.error('[proxy-video] Error streaming video:', err)
    throw createError({ statusCode: 502, statusMessage: `Failed to proxy video: ${err.message}` })
  }
})
