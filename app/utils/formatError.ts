/**
 * Utilitário para formatação e tratamento de erros de API no frontend.
 * Garante que erros de autorização (403), sessão expirada (401), rate limit (429)
 * e mensagens do servidor sejam exibidos de forma clara, amigável e explicativa.
 */
export function formatApiErrorMessage(err: any, fallbackContext: string = 'Erro na operação'): string {
  if (!err) return fallbackContext

  // Extrair código de status se disponível
  const statusCode = err?.statusCode || err?.data?.statusCode || err?.response?.status || err?.status
  
  // Extrair mensagem bruta
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
    // Se a mensagem já começa com contexto de erro, retorna direto
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
