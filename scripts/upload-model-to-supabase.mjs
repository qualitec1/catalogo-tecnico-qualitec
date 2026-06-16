import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carrega variáveis de ambiente do .env
const envPath = join(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrado no .env')
  process.exit(1)
}

async function uploadModel() {
  console.log('📦 Iniciando upload do modelo 3D...')
  
  const filePath = join(__dirname, '..', 'public', 'model3d.glb')
  const fileBuffer = readFileSync(filePath)
  const fileSizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2)
  
  console.log(`📁 Arquivo: model3d.glb (${fileSizeMB} MB)`)
  
  // Upload usando fetch direto
  const uploadUrl = `${supabaseUrl}/storage/v1/object/product-models/model3d.glb`
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'model/gltf-binary',
      'x-upsert': 'true'
    },
    body: fileBuffer
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error('❌ Erro no upload:', error)
    process.exit(1)
  }
  
  console.log('✅ Upload concluído com sucesso!')
  
  // URL pública
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/product-models/model3d.glb`
  
  console.log('\n📎 URL pública do modelo:')
  console.log(publicUrl)
  
  console.log('\n📝 Rode este SQL no Supabase para atualizar o produto:')
  console.log(`UPDATE products`)
  console.log(`SET model3d_url = '${publicUrl}'`)
  console.log(`WHERE name_code = 'TRANS-15554';`)
}

uploadModel().catch(console.error)
