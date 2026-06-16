import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const filePath = join(process.cwd(), 'public', 'model3d.glb')
    const fileBuffer = await readFile(filePath)
    
    setHeader(event, 'Content-Type', 'model/gltf-binary')
    setHeader(event, 'Content-Length', fileBuffer.length.toString())
    setHeader(event, 'Cache-Control', 'public, max-age=31536000')
    
    return fileBuffer
  } catch (error) {
    console.error('Erro ao servir modelo 3D:', error)
    throw createError({
      statusCode: 404,
      message: 'Modelo 3D não encontrado'
    })
  }
})
