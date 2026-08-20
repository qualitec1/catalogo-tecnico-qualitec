import dotenv from 'dotenv'
dotenv.config()

const PROD_URL = 'https://catalogo-tecnico-qualitec.vercel.app'

console.log('====================================================')
console.log('QUALITEC 2.0 — PASSO 4: SMOKE TESTS EM PRODUÇÃO')
console.log(`Target: ${PROD_URL}`)
console.log('====================================================\n')

async function runProductionSmokeTests() {
  const results = []

  // 1. Test Public Routes
  console.log('--- 1. PUBLIC ROUTES & CATALOG HEALTH ---')
  const publicPages = [
    { name: 'Home Page', path: '/' },
    { name: 'Catálogo Técnico', path: '/catalogo' },
    { name: 'Nossa Empresa', path: '/nossa-empresa' },
    { name: 'Página de Login', path: '/login' }
  ]

  for (const page of publicPages) {
    try {
      const res = await fetch(`${PROD_URL}${page.path}`, { signal: AbortSignal.timeout(15000) })
      results.push({
        test: `Page ${page.name} (${page.path})`,
        expected: '200 OK',
        result: res.status === 200 ? 'PASS' : 'FAIL',
        details: `HTTP ${res.status} ${res.statusText}`
      })
    } catch (err) {
      results.push({
        test: `Page ${page.name} (${page.path})`,
        expected: '200 OK',
        result: 'FAIL',
        details: `Error: ${err.message}`
      })
    }
  }

  // 2. Test Sanitized Public Settings API
  console.log('\n--- 2. PUBLIC SETTINGS API PURITY ---')
  try {
    const res = await fetch(`${PROD_URL}/api/public/settings`, { signal: AbortSignal.timeout(15000) })
    const data = await res.json()
    const settingsCount = Array.isArray(data.settings) ? data.settings.length : 0
    const rawJson = JSON.stringify(data)
    const hasPii = rawJson.includes('contact_submission') ||
                   rawJson.includes('newsletter_subscriber') ||
                   rawJson.includes('vendas2@') ||
                   rawJson.includes('password')

    results.push({
      test: 'GET /api/public/settings Response',
      expected: '200 OK + Clean DTO Array',
      result: res.status === 200 && settingsCount > 0 && !hasPii ? 'PASS' : 'FAIL',
      details: `HTTP ${res.status}, ${settingsCount} settings rows, Zero PII leaks: ${!hasPii ? 'SIM' : 'NÃO'}`
    })
  } catch (err) {
    results.push({
      test: 'GET /api/public/settings Response',
      expected: '200 OK + Clean DTO Array',
      result: 'FAIL',
      details: `Error: ${err.message}`
    })
  }

  // 3. Test Anonymous Access to Admin APIs (Must be 401 Unauthorized)
  console.log('\n--- 3. ANONYMOUS ACCESS TO ADMIN APIS (MUST BE 401) ---')
  const adminEndpoints = [
    { path: '/api/admin/contacts', method: 'GET' },
    { path: '/api/admin/subscribers', method: 'GET' },
    { path: '/api/admin/products', method: 'GET' },
    { path: '/api/admin/categories', method: 'GET' },
    { path: '/api/admin/settings', method: 'GET' },
    { path: '/api/admin/news', method: 'GET' },
    { path: '/api/admin/files', method: 'GET' },
    { path: '/api/auth/register', method: 'POST', body: JSON.stringify({ email: 'attacker@test.com', pass: 'blocked' }) }
  ]

  for (const ep of adminEndpoints) {
    try {
      const res = await fetch(`${PROD_URL}${ep.path}`, {
        method: ep.method,
        headers: ep.body ? { 'Content-Type': 'application/json' } : {},
        body: ep.body || undefined,
        signal: AbortSignal.timeout(15000)
      })
      results.push({
        test: `Anon ${ep.method} ${ep.path}`,
        expected: '401 Unauthorized',
        result: res.status === 401 ? 'PASS' : 'FAIL',
        details: `HTTP ${res.status} ${res.statusText}`
      })
    } catch (err) {
      results.push({
        test: `Anon ${ep.method} ${ep.path}`,
        expected: '401 Unauthorized',
        result: 'FAIL',
        details: `Error: ${err.message}`
      })
    }
  }

  // 4. Test Session Endpoint Without Token (Must be 401)
  console.log('\n--- 4. AUTH SESSION ENDPOINT ---')
  try {
    const res = await fetch(`${PROD_URL}/api/auth/session`, { signal: AbortSignal.timeout(15000) })
    results.push({
      test: 'GET /api/auth/session (No Token)',
      expected: '401 Unauthorized',
      result: res.status === 401 ? 'PASS' : 'FAIL',
      details: `HTTP ${res.status} ${res.statusText}`
    })
  } catch (err) {
    results.push({
      test: 'GET /api/auth/session (No Token)',
      expected: '401 Unauthorized',
      result: 'FAIL',
      details: `Error: ${err.message}`
    })
  }

  // Print Results Table
  console.log('\n====================================================')
  console.log('SUMMARY TABLE OF PRODUCTION SMOKE TESTS')
  console.log('====================================================')
  console.table(results)

  const failed = results.filter(r => r.result === 'FAIL')
  console.log(`\nTotal Smoke Tests: ${results.length} | PASSED: ${results.length - failed.length} | FAILED: ${failed.length}`)

  if (failed.length === 0) {
    console.log('\n🎉 ALL PRODUCTION SMOKE TESTS PASSED!')
  } else {
    console.log('\n❌ SOME SMOKE TESTS FAILED OR VERCEL IS STILL DEPLOYING.')
  }
}

runProductionSmokeTests().catch(console.error)
