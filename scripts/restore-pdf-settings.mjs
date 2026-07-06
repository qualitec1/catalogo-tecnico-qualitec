import fs from 'fs'

const envPath = 'd:/qualitec 2.0/.env'
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/)
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
}

const supabaseUrl = env['SUPABASE_URL']
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['SUPABASE_KEY']
const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' }

// Load backup
const backupPath = 'd:/qualitec 2.0/scripts/pdf_settings_backup_20260705.json'
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))

console.log(`📂 Backup carregado: ${backup.length} categorias`)
console.log('🔄 Restaurando configurações originais...\n')

let success = 0, errors = 0
for (const row of backup) {
  const { id, ...updatePayload } = row
  // Remove created_at to avoid conflicts
  delete updatePayload.created_at

  const updateRes = await fetch(
    `${supabaseUrl}/rest/v1/pdf_settings?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(updatePayload)
    }
  )
  if (updateRes.ok) {
    console.log(`  ✅ ${row.category}`)
    success++
  } else {
    const err = await updateRes.text()
    console.error(`  ❌ ${row.category}: ${err}`)
    errors++
  }
}

console.log(`\n🎉 Restauração concluída! ${success} categorias restauradas, ${errors} erros.`)
