import { config } from 'dotenv'

config()

const sql = `
ALTER TABLE public.pdf_settings 
ADD COLUMN IF NOT EXISTS card_model_label_font_size TEXT DEFAULT '8px',
ADD COLUMN IF NOT EXISTS card_model_label_offset_x TEXT DEFAULT '0px',
ADD COLUMN IF NOT EXISTS card_model_label_offset_y TEXT DEFAULT '0px',
ADD COLUMN IF NOT EXISTS card_model_label_font_family TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS card_model_label_bold BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS card_model_label_italic BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS card_model_label_underline BOOLEAN DEFAULT false;
`

console.log('Running migration via direct fetch to exec_sql RPC...')
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
