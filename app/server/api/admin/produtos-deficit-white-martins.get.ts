import { defineEventHandler, setResponseHeader } from 'h3'
import { requireAdmin } from '../../utils/requireAdmin'
import type { WmProductsDeficitPayload } from '../../types/wmProductsDeficit'

// GET /api/admin/produtos-deficit-white-martins
export default defineEventHandler(async (event): Promise<WmProductsDeficitPayload> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')

  try {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const jsonPath = path.resolve(process.cwd(), 'docs/wm_produtos_deficit.json')
    const raw = await fs.readFile(jsonPath, 'utf-8')
    return JSON.parse(raw.replace(/^\uFEFF/, ''))
  } catch (err: any) {
    return {
      synced_at: new Date().toISOString(),
      total_produtos: 0,
      produtos_com_deficit: 0,
      produtos_com_estoque_ok: 0,
      total_pecas_faltantes: 0,
      produtos: []
    }
  }
})
