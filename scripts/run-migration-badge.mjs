import { config } from 'dotenv'

config()

const sql = `
ALTER TABLE public.category_assets ADD COLUMN IF NOT EXISTS badge_text TEXT DEFAULT NULL;
ALTER TABLE public.category_assets ADD COLUMN IF NOT EXISTS badge_icon_url TEXT DEFAULT NULL;
NOTIFY pgrst, 'reload schema';
`

console.log('Running migration via direct REST API...')
console.log('SQL:', sql)

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

