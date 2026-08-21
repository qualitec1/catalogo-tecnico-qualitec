/**
 * Retorna a URL canônica do projeto para envio em e-mails e redirecionamentos seguros.
 * Em produção, utiliza obrigatoriamente a URL de produção (nunca localhost).
 */
export function getCanonicalAppUrl(): string {
  const url = process.env.APP_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://catalogo-tecnico-qualitec.vercel.app'
  return url.replace(/\/+$/, '')
}
