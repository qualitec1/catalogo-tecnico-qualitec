import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readMultipartFormData, createError } from 'h3'

// Configuração de tipos de arquivo permitidos
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  'application/pdf': ['.pdf'],
  'model/gltf-binary': ['.glb'],
  'model/gltf+json': ['.gltf']
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

function validateFile(data: Buffer, contentType: string, filename: string): { valid: boolean; error?: string } {
  // Valida tamanho
  if (data.length > MAX_FILE_SIZE) {
    return { valid: false, error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` }
  }

  // Valida extensão
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).flat()
  
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: `Tipo de arquivo não permitido. Permitidos: ${allowedExtensions.join(', ')}` }
  }

  // Valida MIME type
  if (!ALLOWED_FILE_TYPES[contentType as keyof typeof ALLOWED_FILE_TYPES]) {
    return { valid: false, error: 'Tipo MIME não permitido' }
  }

  // Valida magic bytes para prevenir upload de executáveis disfarçados
  const magicBytes = data.slice(0, 4)
  
  // Bloqueia executáveis comuns
  const dangerousSignatures = [
    Buffer.from([0x4D, 0x5A]), // .exe (MZ)
    Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF executables
    Buffer.from([0x23, 0x21]), // Scripts (#!)
  ]
  
  for (const signature of dangerousSignatures) {
    if (magicBytes.slice(0, signature.length).equals(signature)) {
      return { valid: false, error: 'Tipo de arquivo perigoso detectado' }
    }
  }

  return { valid: true }
}

function sanitizeFilename(filename: string): string {
  // Remove path traversal
  const basename = filename.split(/[/\\]/).pop() || 'file'
  
  // Sanitiza caracteres perigosos
  return basename
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9._-]/g, '_')   // Replace special chars
    .replace(/_+/g, '_')             // Replace multiple underscores
    .replace(/^_|_$/g, '')           // Remove leading/trailing underscores
    .substring(0, 255)               // Limit length
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const r2Config = config.r2

  if (!r2Config.accessKeyId || !r2Config.secretAccessKey || !r2Config.endpoint || !r2Config.bucketName) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Cloudflare R2 não está totalmente configurado no servidor.',
    })
  }

  // Parse multipart form data
  const multipart = await readMultipartFormData(event)
  if (!multipart || multipart.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nenhum arquivo enviado.',
    })
  }

  // Find the file in the multipart fields (usually named 'file')
  const fileField = multipart.find((item) => item.name === 'file')
  if (!fileField || !fileField.data || !fileField.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'O campo "file" é obrigatório no envio.',
    })
  }

  const fileData = fileField.data
  const originalName = fileField.filename
  const contentType = fileField.type || 'application/octet-stream'

  // Validação de segurança
  const validation = validateFile(fileData, contentType, originalName)
  if (!validation.valid) {
    console.warn('[Security] File upload rejected:', {
      timestamp: new Date().toISOString(),
      filename: originalName,
      reason: validation.error,
      size: fileData.length,
      contentType,
      ip: event.node.req.socket.remoteAddress
    })
    
    throw createError({
      statusCode: 400,
      statusMessage: validation.error,
    })
  }

  // Check if custom name was provided
  const customNameField = multipart.find((item) => item.name === 'customName')
  const customName = customNameField ? customNameField.data.toString('utf-8').trim() : ''

  // Sanitiza nome do arquivo
  const sanitizedOriginalName = sanitizeFilename(originalName)
  const extensionIndex = sanitizedOriginalName.lastIndexOf('.')
  const extension = extensionIndex !== -1 ? sanitizedOriginalName.substring(extensionIndex) : ''
  
  let finalName: string
  
  if (customName) {
    const cleanCustomName = sanitizeFilename(customName)
    finalName = `${cleanCustomName}${extension}`
  } else {
    const baseName = extensionIndex !== -1 ? sanitizedOriginalName.substring(0, extensionIndex) : sanitizedOriginalName
    finalName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${baseName}${extension}`
  }

  // Initialize S3 client for Cloudflare R2
  const s3 = new S3Client({
    region: 'auto',
    endpoint: r2Config.endpoint,
    credentials: {
      accessKeyId: r2Config.accessKeyId,
      secretAccessKey: r2Config.secretAccessKey,
    },
  })

  // Upload the file buffer to Cloudflare R2
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: finalName,
        Body: fileData,
        ContentType: contentType,
      })
    )

    // Log upload bem-sucedido
    console.info('[Security] File uploaded:', {
      timestamp: new Date().toISOString(),
      filename: finalName,
      size: fileData.length,
      contentType,
      user: event.context.user?.id || 'unknown',
      ip: event.node.req.socket.remoteAddress
    })

    // Build the public URL using the configured public URL base
    const publicUrlBase = r2Config.publicUrl || `https://pub-${r2Config.accountId}.r2.dev`
    const formattedUrlBase = publicUrlBase.endsWith('/') ? publicUrlBase : `${publicUrlBase}/`
    const publicUrl = `${formattedUrlBase}${finalName}`

    return {
      success: true,
      url: publicUrl,
      filename: finalName,
      originalName: originalName,
    }
  } catch (error: any) {
    console.error('[Security] R2 upload error:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      filename: finalName
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao enviar arquivo. Tente novamente mais tarde.',
    })
  }
})
