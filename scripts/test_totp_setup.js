require('dotenv/config');
const ws = require('ws');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }, realtime: { transport: ws } });

;(async () => {
  try {
    const email = 'test-qr-' + Date.now() + '@example.com'
    const password = 'TestPass123!'
    console.log('creating user', email)
    const r = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
    console.log('createUser:', { status: r.error ? r.error.status : 200, message: r.error ? r.error.message : null })

    const rootUrl = 'http://localhost:3001'
    // wait for server
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(rootUrl)
        if (res.ok) break
      } catch (e) {}
      await new Promise(r => setTimeout(r, 1000))
    }

    console.log('posting to totp setup...')
    const res = await fetch(rootUrl + '/api/auth/totp/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, generate: true })
    })
    const body = await res.text()
    console.log('status', res.status)
    try {
      console.log('json', JSON.stringify(JSON.parse(body), null, 2))
    } catch (e) {
      console.log('body', body)
    }
  } catch (err) {
    console.error(err)
  }
})()
