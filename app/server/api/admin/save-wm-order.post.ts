import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../utils/requireAdmin'

// POST /api/admin/save-wm-order
// Grava a Ordem de Compra confirmada pelo operador no banco de dados do ITKSoft
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  if (!body || !body.oc_num) {
    throw createError({ statusCode: 400, message: 'Dados da Ordem de Compra incompletos.' })
  }

  try {
    const resp = await fetch('http://127.0.0.1:5050/api/save-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const resData = await resp.json()
    return resData
  } catch (err: any) {
    return {
      success: false,
      error: `Falha ao conectar no serviço do ITKSoft (porta 5050): ${err?.message || err}`
    }
  }
})
