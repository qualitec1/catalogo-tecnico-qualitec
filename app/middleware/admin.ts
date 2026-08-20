export default defineNuxtRouteMiddleware(async (to, from) => {
  // Rotas públicas que não necessitam de verificação de admin
  const publicPaths = ['/login', '/', '/catalogo', '/nossa-empresa']
  if (publicPaths.includes(to.path)) {
    return
  }

  try {
    // Validação server-side via API de sessão
    const res = await $fetch<{ user?: any; isAdmin?: boolean; profile?: any }>('/api/auth/session')
    
    // Se não houver usuário ou não for admin ativo -> Redireciona para /login
    if (!res?.user || !res?.isAdmin) {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  } catch (err) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
