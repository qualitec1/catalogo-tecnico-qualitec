import dns from 'node:dns'
import dotenv from 'dotenv'

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}
dotenv.config()

const PROD_URL = 'https://catalogo-tecnico-qualitec.vercel.app'
const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

async function adminFetch(endpoint, options = {}) {
  const url = `${supabaseUrl}/rest/v1/${endpoint}`
  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch { data = text }
  return { status: res.status, ok: res.ok, data }
}

async function anonFetch(endpoint, options = {}) {
  const url = `${supabaseUrl}/rest/v1/${endpoint}`
  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch { data = text }
  return { status: res.status, ok: res.ok, data }
}

console.log('====================================================')
console.log('QUALITEC 2.0 — REVALIDAÇÃO PÓS-FASE A EM PRODUÇÃO')
console.log(`Target: ${PROD_URL}`)
console.log('====================================================\n')

async function runRevalidation() {
  const report = {}

  // 1. Public Pages
  console.log('--- 1. VERIFYING PUBLIC PAGES ---')
  const pages = [
    { name: 'Home (/)', path: '/' },
    { name: 'Catálogo (/catalogo)', path: '/catalogo' },
    { name: 'Nossa Empresa (/nossa-empresa)', path: '/nossa-empresa' },
    { name: 'Login (/login)', path: '/login' }
  ]

  report.pages = []
  for (const pg of pages) {
    try {
      const res = await fetch(`${PROD_URL}${pg.path}`, { signal: AbortSignal.timeout(15000) })
      const ok = res.status === 200
      report.pages.push({ page: pg.name, status: res.status, ok })
      console.log(`[${pg.name}] HTTP ${res.status} -> ${ok ? 'PASS' : 'FAIL'}`)
    } catch (err) {
      report.pages.push({ page: pg.name, error: err.message, ok: false })
      console.log(`[${pg.name}] Error: ${err.message} -> FAIL`)
    }
  }

  // 2. /api/public/settings Verification
  console.log('\n--- 2. VERIFYING /api/public/settings ---')
  try {
    const res = await fetch(`${PROD_URL}/api/public/settings`, { signal: AbortSignal.timeout(15000) })
    const data = await res.json()
    const count = Array.isArray(data.settings) ? data.settings.length : 0
    const raw = JSON.stringify(data)

    const hasPii = raw.includes('contact_submissions') ||
                   raw.includes('newsletter_subscribers') ||
                   raw.includes('vendas2@') ||
                   raw.includes('password') ||
                   raw.includes('secret') ||
                   raw.includes('service_role') ||
                   raw.includes('eyJ')

    report.publicSettings = {
      status: res.status,
      count,
      zeroPii: !hasPii,
      pass: res.status === 200 && count > 0 && !hasPii
    }
    console.log(`HTTP Status: ${res.status}`)
    console.log(`Settings count: ${count}`)
    console.log(`Zero PII Leaks: ${!hasPii ? 'PASS (NONE)' : 'FAIL (FOUND)'}`)
  } catch (err) {
    report.publicSettings = { pass: false, error: err.message }
    console.error('Error fetching /api/public/settings:', err.message)
  }

  // 3. Anonymous Access to Protected APIs (Expected: 401)
  console.log('\n--- 3. ANONYMOUS ACCESS TO ADMIN APIS (EXPECTED: 401) ---')
  const anonChecks = [
    { url: '/api/admin/contacts', method: 'GET' },
    { url: '/api/admin/subscribers', method: 'GET' },
    { url: '/api/admin/products', method: 'GET' },
    { url: '/api/admin/categories', method: 'GET' },
    { url: '/api/admin/settings', method: 'GET' },
    { url: '/api/auth/register', method: 'POST', body: { email: 'blocked@test.com', pass: 'blocked' } },
    { url: '/api/auth/session', method: 'GET' }
  ]

  report.anonApiChecks = []
  for (const chk of anonChecks) {
    try {
      const res = await fetch(`${PROD_URL}${chk.url}`, {
        method: chk.method,
        headers: chk.body ? { 'Content-Type': 'application/json' } : {},
        body: chk.body ? JSON.stringify(chk.body) : undefined,
        signal: AbortSignal.timeout(15000)
      })
      const is401 = res.status === 401
      report.anonApiChecks.push({ endpoint: `${chk.method} ${chk.url}`, status: res.status, pass: is401 })
      console.log(`[${chk.method} ${chk.url}] HTTP ${res.status} (Expected: 401) -> ${is401 ? 'PASS' : 'FAIL'}`)
    } catch (err) {
      report.anonApiChecks.push({ endpoint: `${chk.method} ${chk.url}`, error: err.message, pass: false })
      console.log(`[${chk.method} ${chk.url}] Error: ${err.message} -> FAIL`)
    }
  }

  // 4. Admin Account & Database State Verification
  console.log('\n--- 4. ADMIN USER & PERMISSION VERIFICATION ---')
  try {
    const { data: profiles, ok } = await adminFetch('profiles?role=eq.admin&is_active=eq.true&select=id,full_name,role,is_active')
    console.log('Active Admin Profiles in DB:', profiles)
    const adminUser = Array.isArray(profiles) ? profiles.find(p => p.role === 'admin' && p.is_active === true) : null

    report.adminProfile = {
      found: !!adminUser,
      role: adminUser?.role || null,
      isActive: adminUser?.is_active || false,
      pass: !!adminUser && adminUser.role === 'admin' && adminUser.is_active === true
    }
    console.log(`Admin recognized: ${report.adminProfile.pass ? 'PASS' : 'FAIL'}`)
  } catch (err) {
    report.adminProfile = { pass: false, error: err.message }
  }

  // 5. Canary Test: Public Contact Form Submission
  console.log('\n--- 5. CANARY TEST: CONTACT FORM SUBMISSION ---')
  const canaryContactEmail = `canary_contact_${Date.now()}@qualitecinstrumentos.com.br`
  try {
    const res = await fetch(`${PROD_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'contact',
        name: 'CANARY_TEST_P0',
        email: canaryContactEmail,
        phone: '+55 11 99999-0000',
        company: 'Qualitec Test Lab',
        subject: 'Canary Test P0 Security Verification',
        message: 'Non-destructive automated verification canary.'
      }),
      signal: AbortSignal.timeout(20000)
    })

    const data = await res.json()
    console.log('Contact response:', res.status, data)

    // Check if inserted in contact_submissions via adminFetch
    const { data: dbContacts } = await adminFetch(`contact_submissions?email=eq.${canaryContactEmail}&select=id,name,email,status,created_at`)
    const dbContact = Array.isArray(dbContacts) ? dbContacts[0] : null
    console.log('Contact DB Record:', dbContact)

    report.contactTest = {
      smtpStatus: res.status === 200,
      persisted: data.persisted === true && !!dbContact?.id,
      pass: res.status === 200 && data.persisted === true && !!dbContact?.id
    }

    // Cleanup canary record
    if (dbContact?.id) {
      await adminFetch(`contact_submissions?id=eq.${dbContact.id}`, { method: 'DELETE' })
      console.log('✓ Cleaned up canary contact record.')
    }
  } catch (err) {
    report.contactTest = { pass: false, error: err.message }
    console.error('Error in contact canary:', err.message)
  }

  // 6. Canary Test: Public Newsletter Subscription
  console.log('\n--- 6. CANARY TEST: NEWSLETTER SUBSCRIPTION ---')
  const canaryNewsEmail = `canary_news_${Date.now()}@qualitecinstrumentos.com.br`
  try {
    const res = await fetch(`${PROD_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'newsletter',
        email: canaryNewsEmail,
        lang: 'pt'
      }),
      signal: AbortSignal.timeout(20000)
    })

    const data = await res.json()
    console.log('Newsletter response:', res.status, data)

    // Check if inserted in newsletter_subscribers via adminFetch
    const { data: dbNewsList } = await adminFetch(`newsletter_subscribers?email=eq.${canaryNewsEmail}&select=id,email,lang,created_at`)
    const dbNews = Array.isArray(dbNewsList) ? dbNewsList[0] : null
    console.log('Newsletter DB Record:', dbNews)

    report.newsletterTest = {
      smtpStatus: res.status === 200,
      persisted: data.persisted === true && !!dbNews?.id,
      pass: res.status === 200 && data.persisted === true && !!dbNews?.id
    }

    // Cleanup canary record
    if (dbNews?.id) {
      await adminFetch(`newsletter_subscribers?id=eq.${dbNews.id}`, { method: 'DELETE' })
      console.log('✓ Cleaned up canary newsletter record.')
    }
  } catch (err) {
    report.newsletterTest = { pass: false, error: err.message }
    console.error('Error in newsletter canary:', err.message)
  }

  // 7. Verify Zero Writes to legacy pdf_settings.layout_settings
  console.log('\n--- 7. CHECKING LEGACY pdf_settings PII PURITY ---')
  const { data: geralRows } = await adminFetch('pdf_settings?category=eq.GERAL&select=layout_settings')
  const geralRow = Array.isArray(geralRows) ? geralRows[0] : null
  const geralLayout = geralRow?.layout_settings || {}
  const hasCanaryInPdf = JSON.stringify(geralLayout).includes('canary_')

  report.legacyPdfSettings = {
    newWrites: !hasCanaryInPdf,
    pass: !hasCanaryInPdf
  }
  console.log(`New canary writes in pdf_settings.layout_settings: ${hasCanaryInPdf ? 'FOUND (FAIL)' : 'ZERO (PASS)'}`)

  // 8. Admin APIs Accessible to Authenticated Admin
  console.log('\n--- 8. ADMIN DATA LOAD VERIFICATION ---')
  const { data: productsData } = await adminFetch('products?limit=1&select=id,title')
  const { data: categoriesData } = await adminFetch('category_assets?limit=1&select=id,category')
  const { data: settingsData } = await adminFetch('pdf_settings?limit=1&select=id,category')
  const { data: contactsData } = await adminFetch('contact_submissions?limit=1&select=id')
  const { data: subscribersData } = await adminFetch('newsletter_subscribers?limit=1&select=id')

  report.adminDataLoads = {
    products: Array.isArray(productsData) && productsData.length > 0,
    categories: Array.isArray(categoriesData) && categoriesData.length > 0,
    settings: Array.isArray(settingsData) && settingsData.length > 0,
    contacts: Array.isArray(contactsData),
    subscribers: Array.isArray(subscribersData),
    pass: Array.isArray(productsData) && Array.isArray(categoriesData) && Array.isArray(settingsData)
  }
  console.log('Admin Data Loads:', report.adminDataLoads)

  // Final Summary
  console.log('\n====================================================')
  console.log('REVALIDATION FINAL REPORT SUMMARY')
  console.log('====================================================')
  console.log(JSON.stringify(report, null, 2))
}

runRevalidation().catch(console.error)
