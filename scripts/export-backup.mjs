import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/)
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
}

const supabaseUrl = env['SUPABASE_URL']
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['SUPABASE_KEY']
const headers = { 
  'apikey': supabaseKey, 
  'Authorization': `Bearer ${supabaseKey}`, 
  'Content-Type': 'application/json' 
}

const tables = [
  'category_assets',
  'pdf_settings',
  'pdf_templates',
  'products',
  'profiles',
  'totp_secrets',
  'daily_runs'
]

const backupData = {}

console.log('🔄 Iniciando backup do banco de dados Supabase...')

for (const table of tables) {
  try {
    // Select all rows from table
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
      method: 'GET',
      headers
    })
    
    if (res.ok) {
      const data = await res.json()
      backupData[table] = data
      console.log(`  ✅ Tabela '${table}': ${data.length} registros obtidos.`)
    } else {
      const statusText = res.statusText
      const body = await res.text()
      console.warn(`  ⚠️ Tabela '${table}' não pôde ser lida (status ${res.status}: ${statusText}). Erro: ${body}`)
    }
  } catch (err) {
    console.error(`  ❌ Falha ao obter dados da tabela '${table}':`, err)
  }
}

// Generate filename with timestamp
const pad = (n) => String(n).padStart(2, '0')
const now = new Date()
const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`

const backupsDir = path.resolve(process.cwd(), 'backups')
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true })
}

const backupFilePath = path.join(backupsDir, `backup_${timestamp}.json`)
fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8')

console.log(`\n🎉 Backup concluído com sucesso!`)
console.log(`📂 Arquivo salvo em: ${backupFilePath}`)
