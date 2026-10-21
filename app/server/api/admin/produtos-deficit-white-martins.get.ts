import { defineEventHandler, setResponseHeader } from 'h3'
import { requireAdmin } from '../../utils/requireAdmin'
import { supabaseAdmin } from '../../utils/supabaseAdmin'
import type { WmProductsDeficitPayload } from '../../types/wmProductsDeficit'

// GET /api/admin/produtos-deficit-white-martins
export default defineEventHandler(async (event): Promise<WmProductsDeficitPayload> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')

  // 1. Tentar ler do Supabase (Funciona 100% em Produção na Vercel e Local)
  try {
    const { data, error } = await supabaseAdmin
      .from('wm_deficit_snapshot')
      .select('payload')
      .eq('id', 'current')
      .maybeSingle()

    if (!error && data?.payload?.produtos?.length) {
      return data.payload as WmProductsDeficitPayload
    }
  } catch (err: any) {
    // Tabela ainda não criada ou fallback necessário
  }

  // 2. Fallback de Arquivos Físicos Locais / Estáticos
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
      path.resolve(process.cwd(), 'app/public/data/wm_produtos_deficit.json'),
      path.resolve(process.cwd(), 'public/data/wm_produtos_deficit.json'),
      path.resolve(process.cwd(), 'docs/wm_produtos_deficit.json'),
      path.resolve(process.cwd(), 'wm_produtos_deficit.json'),
      path.resolve(process.cwd(), '../app/public/data/wm_produtos_deficit.json'),
      path.resolve(process.cwd(), '../public/data/wm_produtos_deficit.json'),
      path.resolve(process.cwd(), '../docs/wm_produtos_deficit.json')
    ]

    for (const jsonPath of candidatePaths) {
      if (await exists(jsonPath)) {
        const raw = await fs.readFile(jsonPath, 'utf-8')
        const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''))
        if (parsed && Array.isArray(parsed.produtos) && parsed.produtos.length > 0) {
          return parsed
        }
      }
    }
  } catch (err: any) {
    console.error('Erro ao ler fallback local de deficit:', err)
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
