import { config } from 'dotenv'

config()

const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
  method: 'GET',
  headers: {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
  }
})

const data = await response.json()
console.log('Available RPCs:', Object.keys(data.paths).filter(p => p.includes('/rpc/')))
