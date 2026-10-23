import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { requireAdmin } from '../../utils/requireAdmin'

// POST /api/admin/parse-wm-pdf
// Recebe 1 ou múltiplos arquivos PDF da White Martins e processa no motor local
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado.' })
  }

  const results = []

  const engineUrl = (process.env.WM_ENGINE_URL || 'http://127.0.0.1:5050').replace(/\/+$/, '')

  for (const part of parts) {
    // Processa apenas arquivos PDF
    const isPdf = (part.filename && part.filename.toLowerCase().endsWith('.pdf')) ||
                  part.type === 'application/pdf' ||
                  part.name === 'pdf' ||
                  part.name === 'files'

    if (isPdf && part.data && part.data.length > 0) {
      const filename = part.filename || 'ordem_compra.pdf'
      try {
        const resp = await fetch(`${engineUrl}/api/process-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/pdf',
            'X-Filename': encodeURIComponent(filename)
          },
          body: part.data
        })

        if (!resp.ok) {
          const errText = await resp.text()
          results.push({
            filename,
            status: 'ERROR',
            error: `Erro HTTP ${resp.status} do motor de leitura: ${errText}`
          })
          continue
        }

        const data = await resp.json()
        results.push({
          filename,
          status: 'SUCCESS',
          data
        })
      } catch (err: any) {
        results.push({
          filename,
          status: 'ERROR',
          error: `Falha ao conectar no motor de leitura (${engineUrl}): ${err?.message || err}. Em produção na Vercel, certifique-se de que o túnel/serviço local está ativo (WM_ENGINE_URL).`
        })
      }
    }
  }

  return {
    success: true,
    total_received: parts.length,
    total_processed: results.length,
    results
  }
})
