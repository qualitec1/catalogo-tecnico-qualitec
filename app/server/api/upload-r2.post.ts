import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readMultipartFormData, createError } from 'h3'

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

  // Generate a unique filename using a timestamp and a short random hash to prevent collisions
  const extensionIndex = originalName.lastIndexOf('.')
  const extension = extensionIndex !== -1 ? originalName.substring(extensionIndex) : ''
  const baseName = extensionIndex !== -1 ? originalName.substring(0, extensionIndex) : originalName
  
  const cleanBaseName = baseName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9_-]/g, '_')   // Replace spaces and special characters with underscore

  const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanBaseName}${extension}`

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
        Key: uniqueName,
        Body: fileData,
        ContentType: contentType,
      })
    )

    // Build the public URL using the configured public URL base
    const publicUrlBase = r2Config.publicUrl || `https://pub-${r2Config.accountId}.r2.dev`
    const formattedUrlBase = publicUrlBase.endsWith('/') ? publicUrlBase : `${publicUrlBase}/`
    const publicUrl = `${formattedUrlBase}${uniqueName}`

    return {
      success: true,
      url: publicUrl,
      filename: uniqueName,
      originalName: originalName,
    }
  } catch (error: any) {
    console.error('Error uploading to Cloudflare R2:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Erro ao enviar arquivo para o Cloudflare R2: ${error.message || error}`,
    })
  }
})
