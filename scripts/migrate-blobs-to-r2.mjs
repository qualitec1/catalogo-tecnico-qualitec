import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Helper to parse .env file manually
const parseEnv = () => {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found at:', envPath)
    process.exit(1)
  }
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const index = trimmed.indexOf('=')
    if (index === -1) return
    const key = trimmed.substring(0, index).trim()
    let val = trimmed.substring(index + 1).trim()
    // Strip quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1)
    }
    env[key] = val
  })
  return env
}

const env = parseEnv()

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = env.R2_BUCKET_NAME
const R2_ENDPOINT = env.R2_ENDPOINT
const R2_PUBLIC_URL = env.R2_PUBLIC_URL

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error('Missing R2 variables in .env. Please check R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET_NAME, and R2_PUBLIC_URL.')
  process.exit(1)
}

// Initialize S3 client for Cloudflare R2
const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

// Build formatted public url base
const publicUrlBase = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL : `${R2_PUBLIC_URL}/`

// Load JSON backup
const backupPath = path.resolve(process.cwd(), 'database_backup.json')
if (!fs.existsSync(backupPath)) {
  console.error('Backup database_backup.json not found at:', backupPath)
  process.exit(1)
}

console.log('Loading database_backup.json...')
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))

// Helper to convert hex blob string ('\x8950...' or '8950...') to Buffer
const hexToBuffer = (hexStr) => {
  const cleanHex = hexStr.replace(/^\\x/, '')
  return Buffer.from(cleanHex, 'hex')
}

// Helper to upload buffer to R2
const uploadToR2 = async (key, buffer, contentType) => {
  console.log(`Uploading ${key} to Cloudflare R2 (${(buffer.length / 1024).toFixed(2)} KB)...`)
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )
  return `${publicUrlBase}${key}`
}

async function migrate() {
  let productsMigrated = 0
  let categoryAssetsMigrated = 0

  // 1. Migrate products
  if (backup.products && Array.isArray(backup.products)) {
    console.log(`Processing ${backup.products.length} products...`)
    for (const product of backup.products) {
      // Migrate Product Image
      if (product.image_blob) {
        try {
          const buffer = hexToBuffer(product.image_blob)
          const isJpg = product.image && (product.image.toLowerCase().endsWith('.jpg') || product.image.toLowerCase().endsWith('.jpeg'))
          const extension = isJpg ? '.jpg' : '.png'
          const contentType = isJpg ? 'image/jpeg' : 'image/png'
          
          const cleanName = (product.title || `product_${product.id}`)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9_-]/g, '_')
          const key = `products/image_${product.id}_${cleanName}${extension}`

          const url = await uploadToR2(key, buffer, contentType)
          product.image = url
          product.image_blob = null
          productsMigrated++
        } catch (e) {
          console.error(`Failed to migrate image for product id ${product.id}:`, e)
        }
      }

      // Migrate Product Datasheet (PDF)
      if (product.datasheet_blob) {
        try {
          const buffer = hexToBuffer(product.datasheet_blob)
          const cleanName = (product.datasheet_name || `datasheet_${product.id}.pdf`)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9_-]/g, '_')
          const key = `datasheets/datasheet_${product.id}_${cleanName}` // already includes .pdf usually

          const url = await uploadToR2(key, buffer, 'application/pdf')
          product.datasheet_url = url
          product.datasheet_blob = null
          productsMigrated++
        } catch (e) {
          console.error(`Failed to migrate datasheet for product id ${product.id}:`, e)
        }
      }
    }
  }

  // 2. Migrate category assets
  if (backup.category_assets && Array.isArray(backup.category_assets)) {
    console.log(`Processing ${backup.category_assets.length} category assets...`)
    for (const category of backup.category_assets) {
      if (category.cover_image_blob) {
        try {
          const buffer = hexToBuffer(category.cover_image_blob)
          const isJpg = category.cover_image_url && (category.cover_image_url.toLowerCase().endsWith('.jpg') || category.cover_image_url.toLowerCase().endsWith('.jpeg'))
          const extension = isJpg ? '.jpg' : '.png'
          const contentType = isJpg ? 'image/jpeg' : 'image/png'

          const cleanName = (category.category || `category_${category.id}`)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9_-]/g, '_')
          const key = `categories/cover_${cleanName}${extension}`

          const url = await uploadToR2(key, buffer, contentType)
          category.cover_image_url = url
          category.cover_image_blob = null
          categoryAssetsMigrated++
        } catch (e) {
          console.error(`Failed to migrate cover image for category id ${category.id}:`, e)
        }
      }
    }
  }

  // Write a backup of original JSON first
  const originalBackupPath = path.resolve(process.cwd(), 'database_backup_original.json')
  if (!fs.existsSync(originalBackupPath)) {
    console.log('Saving backup of original file to database_backup_original.json...')
    fs.copyFileSync(backupPath, originalBackupPath)
  }

  // Save migrated JSON
  console.log('Writing migrated JSON back to database_backup.json...')
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))

  console.log('\n--- Migration Completed successfully! ---')
  console.log(`Total Product assets migrated to R2: ${productsMigrated}`)
  console.log(`Total Category covers migrated to R2: ${categoryAssetsMigrated}`)
  const oldSize = fs.statSync(originalBackupPath).size / (1024 * 1024)
  const newSize = fs.statSync(backupPath).size / (1024 * 1024)
  console.log(`JSON Backup file size reduced from ${oldSize.toFixed(2)} MB to ${newSize.toFixed(2)} MB!`)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
})
