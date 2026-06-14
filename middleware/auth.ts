export default defineNuxtRouteMiddleware(async (to, from) => {
  // routes that don't need auth
  const publicPaths = ['/login', '/']
  if (publicPaths.includes(to.path)) return

  try {
    // server-side check via API
    const res = await $fetch('/api/auth/session')
    if (!res?.user) {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  } catch (err) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
