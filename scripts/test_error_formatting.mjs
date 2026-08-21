// Import/define formatApiErrorMessage logic to test
function formatApiErrorMessage(err, fallbackContext = 'Erro na operação') {
  if (!err) return fallbackContext

  const statusCode = err?.statusCode || err?.data?.statusCode || err?.response?.status || err?.status
  
  const rawMessage = typeof err === 'string' 
    ? err 
    : String(err?.data?.statusMessage || err?.data?.message || err?.statusMessage || err?.message || '')

  const lowerRaw = rawMessage.toLowerCase()

  // 1. Identificar 403 Forbidden / Permissão revogada / Admin desativado
  const is403 = statusCode === 403 || 
    rawMessage.includes('403') || 
    lowerRaw.includes('forbidden') || 
    lowerRaw.includes('privileges') ||
    lowerRaw.includes('acesso negado') ||
    lowerRaw.includes('permissão') ||
    lowerRaw.includes('não possui privilégios')

  if (is403) {
    return 'Acesso Negado (403): Sua conta foi desativada ou não possui mais permissões de administrador para salvar alterações. Faça login novamente com uma conta autorizada.'
  }

  // 2. Identificar 401 Unauthorized / Sessão expirada
  const is401 = statusCode === 401 || 
    rawMessage.includes('401') || 
    lowerRaw.includes('unauthorized') || 
    lowerRaw.includes('session') ||
    lowerRaw.includes('autenticação')

  if (is401) {
    return 'Sessão Expirada (401): Sua sessão expirou ou é inválida. Por favor, faça login novamente no painel.'
  }

  // 3. Identificar 429 Rate Limit / Bloqueio temporário
  const is429 = statusCode === 429 || 
    rawMessage.includes('429') || 
    lowerRaw.includes('too many requests') ||
    lowerRaw.includes('limite')

  if (is429) {
    return 'Limite de Tentativas (429): Muitas requisições em pouco tempo. Aguarde alguns instantes antes de tentar novamente.'
  }

  // 4. Identificar mensagem legível enviada pelo backend (que não seja a URL bruta do fetch)
  const isRawFetchUrl = /^\s*\[(POST|GET|PUT|PATCH|DELETE)\]/i.test(rawMessage)
  if (rawMessage && !isRawFetchUrl) {
    if (rawMessage.startsWith(fallbackContext)) {
      return rawMessage
    }
    return `${fallbackContext}: ${rawMessage}`
  }

  // 5. Fallback com código de status amigável
  if (statusCode) {
    return `${fallbackContext} (Código ${statusCode}). Verifique suas permissões ou tente novamente.`
  }

  return fallbackContext
}

console.log('======================================================================')
console.log('QUALITEC 2.0 — TESTE DE TRATAMENTO E FORMATAÇÃO DE ERROS')
console.log('======================================================================\n')

const testCases = [
  {
    name: 'Raw fetch 403 error string from ofetch',
    input: '[POST] "/api/admin/settings": 403',
    fallback: 'Erro ao salvar configurações',
    expectedContains: 'Acesso Negado (403)'
  },
  {
    name: 'Error object with statusCode 403',
    input: { statusCode: 403, message: 'Forbidden: You do not have administrative privileges.' },
    fallback: 'Erro ao salvar configurações',
    expectedContains: 'Acesso Negado (403)'
  },
  {
    name: 'Raw composite message passed by component on 403',
    input: 'Erro ao salvar configurações: [POST] "/api/admin/settings": 403',
    fallback: 'Erro ao salvar configurações',
    expectedContains: 'Acesso Negado (403)'
  },
  {
    name: '401 session expired error',
    input: '[GET] "/api/admin/users": 401',
    fallback: 'Erro ao carregar dados',
    expectedContains: 'Sessão Expirada (401)'
  },
  {
    name: '429 rate limit exceeded',
    input: { statusCode: 429, message: 'Too many requests. Try again in 60 seconds.' },
    fallback: 'Erro no envio',
    expectedContains: 'Limite de Tentativas (429)'
  },
  {
    name: 'Readable backend validation error',
    input: { data: { statusMessage: 'Categoria da configuração é obrigatória' } },
    fallback: 'Erro ao salvar configurações',
    expectedContains: 'Categoria da configuração é obrigatória'
  }
]

let allPassed = true
const results = []

for (const tc of testCases) {
  const formatted = formatApiErrorMessage(tc.input, tc.fallback)
  const passed = formatted.includes(tc.expectedContains)
  if (!passed) allPassed = false
  results.push({
    Teste: tc.name,
    Entrada: typeof tc.input === 'object' ? JSON.stringify(tc.input) : tc.input,
    Resultado: formatted,
    Status: passed ? 'PASS' : 'FAIL'
  })
}

console.table(results)

if (allPassed) {
  console.log('\n🎉 TODOS OS TESTES DE FORMATAÇÃO DE ERRO PASSARAM COM SUCESSO!')
} else {
  console.error('\n❌ Houve falha em algum teste de formatação de erro.')
  process.exit(1)
}
