import { defineEventHandler, getQuery, getHeader, setResponseStatus, setResponseHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const videoUrl = query.url as string
  if (!videoUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url parameter' })
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
