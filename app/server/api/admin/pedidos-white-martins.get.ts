import { defineEventHandler, setResponseHeader } from 'h3'
import { requireAdmin } from '../../utils/requireAdmin'
import { listWmPendingOrders } from '../../services/wmPendingOrders'

// GET /api/admin/pedidos-white-martins
// Protegido duas vezes: middleware server/auth.ts (/api/admin) + requireAdmin explícito.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return await listWmPendingOrders()
})
