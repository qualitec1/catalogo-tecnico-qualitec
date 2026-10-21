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

    const exists = async (p: string) => {
      try {
        await fs.access(p)
        return true
      } catch {
        return false
      }
    }

    const candidatePaths = [
      path.resolve(process.cwd(), 'docs/wm_produtos_deficit.json'),
      path.resolve(process.cwd(), 'public/data/wm_produtos_deficit.json'),
      path.resolve(process.cwd(), 'wm_produtos_deficit.json'),
      path.resolve(process.cwd(), '../docs/wm_produtos_deficit.json'),
      path.resolve(process.cwd(), '../public/data/wm_produtos_deficit.json')
    ]

    for (const jsonPath of candidatePaths) {
      if (await exists(jsonPath)) {
        const raw = await fs.readFile(jsonPath, 'utf-8')
        const data = JSON.parse(raw.replace(/^\uFEFF/, ''))
        if (data && Array.isArray(data.produtos) && data.produtos.length > 0) {
          return data
        }
      }
    }
  } catch (err: any) {
    console.error('Erro ao ler wm_produtos_deficit.json:', err)
  }

  return {
    synced_at: new Date().toISOString(),
    total_produtos: 0,
    produtos_com_deficit: 0,
    produtos_com_estoque_ok: 0,
    total_pecas_faltantes: 0,
    produtos: []
  }
})
