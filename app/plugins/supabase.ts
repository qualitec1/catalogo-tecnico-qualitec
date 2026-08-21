// Plugin Nuxt: inicializa o cliente Supabase
// No servidor: usa cliente leve sem WebSocket e sem persistência
// No browser: usa WebSocket nativo
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(async (nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  if (import.meta.server) {
    // Popula runtimeConfig.public no servidor a partir do process.env
    const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || (runtimeConfig.public as any).supabaseUrl
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || (runtimeConfig.public as any).supabaseAnonKey

    if (url) (runtimeConfig.public as any).supabaseUrl = url
    if (key) (runtimeConfig.public as any).supabaseAnonKey = key
  }

  const supabaseUrl =
    ((runtimeConfig.public as any)?.supabaseUrl as string) ||
    (import.meta.server ? process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL : '') ||
    ''
  const supabaseAnonKey =
    ((runtimeConfig.public as any)?.supabaseAnonKey as string) ||
    (import.meta.server ? process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY : '') ||
    ''

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[supabase plugin] supabaseUrl ou supabaseAnonKey não definidos no runtimeConfig.public ou env.')
  }

  // Compartilha o token de acesso HttpOnly do servidor para o cliente
  const tokenState = useState<string | null>('supabase-token', () => {
    if (import.meta.server) {
      return useCookie('sb-access-token').value || null
    }
    return null
  })

  let client: SupabaseClient | null = null

  if (supabaseUrl && supabaseAnonKey) {
    if (import.meta.server) {
      client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      })

      if (tokenState.value) {
        await client.auth.setSession({ access_token: tokenState.value, refresh_token: '' })
      }
    } else {
      client = createClient(supabaseUrl, supabaseAnonKey)

      if (tokenState.value) {
        await client.auth.setSession({ access_token: tokenState.value, refresh_token: '' })
      }
    }
  }

  return {
    provide: {
      supabase: client
    }
  }
})
