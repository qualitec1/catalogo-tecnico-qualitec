import dotenv from 'dotenv'
dotenv.config()

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

console.log('====================================================')
console.log('QUALITEC 2.0 — PUBLIC CATALOG NON-REGRESSION SUITE')
console.log(`Target: ${BASE_URL}`)
console.log('====================================================\n')

const PUBLIC_ROUTES = [
  { url: '/', label: 'Home Page' },
  { url: '/catalogo', label: 'Catálogo de Equipamentos' },
  { url: '/nossa-empresa', label: 'Página Institucional Nossa Empresa' },
  { url: '/login', label: 'Página de Login Administrativo' },
  { url: '/api/font?name=calibri.ttf', label: 'API Font Helper' },
]

async function runPublicTests() {
  const results = []

  for (const route of PUBLIC_ROUTES) {
    try {
      const res = await fetch(`${BASE_URL}${route.url}`)
      const text = await res.text()
      const isOk = res.status === 200 && text.length > 50

      results.push({
        route: route.url,
        label: route.label,
        status: res.status,
        contentLength: text.length,
        result: isOk ? 'PASS' : 'FAIL',
        details: isOk ? 'Loaded successfully with content' : `Failed: status=${res.status}`
      })
    } catch (err) {
      results.push({
        route: route.url,
        label: route.label,
        status: 'FETCH_ERROR',
        contentLength: 0,
        result: 'FAIL',
        details: err.message
      })
    }
  }

  console.table(results)

  const failed = results.filter(r => r.result === 'FAIL')
  console.log(`\nTotal Routes: ${results.length} | PASSED: ${results.length - failed.length} | FAILED: ${failed.length}`)

  if (failed.length === 0) {
    console.log('\n🎉 ALL PUBLIC CATALOG ROUTES ARE FULLY FUNCTIONAL!')
  } else {
    console.log('\n❌ SOME PUBLIC ROUTES ENCOUNTERED ISSUES.')
  }
}

runPublicTests().catch(console.error)
