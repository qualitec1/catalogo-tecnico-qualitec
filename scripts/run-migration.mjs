// Script para executar a migration via API REST do Supabase
// Rode: node scripts/run-migration.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const sql = `ALTER TABLE category_assets ADD COLUMN IF NOT EXISTS icon_url TEXT;`

console.log('Running migration...')
console.log('SQL:', sql)

const { data, error } = await supabase.rpc('exec_sql', { query: sql }).catch(() => ({ data: null, error: { message: 'RPC not available' } }))

if (error) {
  // Fallback: try using the REST API directly
  console.log('RPC failed, trying direct fetch...')
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  })
  const result = await response.text()
  console.log('Response status:', response.status)
  console.log('Response:', result)
} else {
  console.log('Migration succeeded:', data)
}
