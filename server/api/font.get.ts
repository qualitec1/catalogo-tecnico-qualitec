import { defineEventHandler, getQuery, createError } from 'h3'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const name = String(query.name || '')
  if (!name || name.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Nome de fonte inválido' })
  }

  const fontPath = resolve(process.cwd(), 'public', 'fonts', name)
  if (!existsSync(fontPath)) {
    throw createError({ statusCode: 404, statusMessage: 'Fonte não encontrada' })
  }

  const buffer = readFileSync(fontPath)
  event.node.res.setHeader('Content-Type', 'font/ttf')
  event.node.res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  return buffer
})
