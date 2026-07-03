import { defineEventHandler, getQuery, createError, setHeader } from 'h3'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const filename = query.name as string
  
  if (!filename || !/^[a-zA-Z0-9_-]+\.ttf$/i.test(filename)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid font filename' })
  }

  // Try multiple locations for the font file
  const paths = [
    resolve(process.cwd(), 'public', 'fonts', filename),
    resolve(process.cwd(), 'app', 'public', 'fonts', filename),
  ]

  for (const fontPath of paths) {
    if (existsSync(fontPath)) {
      const buffer = readFileSync(fontPath)
      setHeader(event, 'Content-Type', 'font/ttf')
      setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
      return buffer
    }
  }

  throw createError({ statusCode: 404, statusMessage: `Font not found: ${filename}` })
})
