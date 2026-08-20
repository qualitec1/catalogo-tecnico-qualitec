import dotenv from 'dotenv'
dotenv.config()

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

console.log('====================================================')
console.log('QUALITEC 2.0 — P0 API SECURITY CONTRACT TEST SUITE')
console.log(`Target: ${BASE_URL}`)
console.log('====================================================\n')

const ADMIN_ENDPOINTS = [
  { url: '/api/admin/contacts', method: 'GET' },
  { url: '/api/admin/subscribers', method: 'GET' },
  { url: '/api/admin/products', method: 'GET' },
  { url: '/api/admin/products', method: 'POST', body: { title: 'ATTACK' } },
  { url: '/api/admin/categories', method: 'GET' },
  { url: '/api/admin/categories', method: 'POST', body: { category: 'ATTACK' } },
  { url: '/api/admin/settings', method: 'GET' },
  { url: '/api/admin/settings', method: 'POST', body: { category: 'ATTACK' } },
  { url: '/api/admin/translations', method: 'GET' },
  { url: '/api/admin/translations', method: 'POST', body: [{ key: 'test', lang_code: 'pt', value: 'x' }] },
  { url: '/api/admin/news', method: 'GET' },
  { url: '/api/admin/news', method: 'POST', body: { id: 1, title_pt: 'x' } },
  { url: '/api/admin/files', method: 'GET' },
  { url: '/api/auth/register', method: 'POST', body: { email: 'hacker@test.com', pass: 'blocked' } }
]

async function runApiTests() {
  const results = []

  console.log('--- TEST GROUP: ANONYMOUS ACCESS TO ADMIN APIS (Expected: 401 Unauthorized) ---')

  for (const ep of ADMIN_ENDPOINTS) {
    try {
      const opts = {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' }
      }
      if (ep.body) {
        opts.body = JSON.stringify(ep.body)
      }

      const res = await fetch(`${BASE_URL}${ep.url}`, opts)
      const passed = res.status === 401

      results.push({
        endpoint: `${ep.method} ${ep.url}`,
        roleTested: 'anonymous',
        expectedStatus: 401,
        actualStatus: res.status,
        result: passed ? 'PASS' : 'FAIL',
        details: passed ? 'Correctly rejected with 401' : `UNEXPECTED: Got status ${res.status}`
      })
    } catch (err) {
      results.push({
        endpoint: `${ep.method} ${ep.url}`,
        roleTested: 'anonymous',
        expectedStatus: 401,
        actualStatus: 'ERROR',
        result: 'FAIL',
        details: err.message
      })
    }
  }

  console.table(results)

  const failed = results.filter(r => r.result === 'FAIL')
  console.log(`\nTotal Endpoints Tested: ${results.length} | PASSED: ${results.length - failed.length} | FAILED: ${failed.length}`)

  if (failed.length === 0) {
    console.log('\n🎉 ALL ANONYMOUS P0 API TESTS PASSED WITH 401 UNAUTHORIZED!')
  } else {
    console.log('\n❌ SOME API CONTRACT TESTS FAILED.')
  }
}

runApiTests().catch(console.error)
