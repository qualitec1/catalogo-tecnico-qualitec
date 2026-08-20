// Middleware de autenticação server-side para proteger todas as rotas administrativas e de upload
import { requireAdmin } from '../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  const path = event.path

  // Rotas que requerem autorização estrita de administrador
  const protectedPrefixes = [
    '/api/admin',
    '/api/upload-r2'
  ]

  const isProtected = protectedPrefixes.some(prefix => path.startsWith(prefix))

  if (!isProtected) {
    return // Rota pública, continua
  }

  // Executa autorização server-side completa (Token + Profile Admin + IsActive)
  await requireAdmin(event)
})

