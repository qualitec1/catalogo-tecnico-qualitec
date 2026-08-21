import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const useSupabaseClient = (): SupabaseClient => {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$supabase) {
    return nuxtApp.$supabase as SupabaseClient
  }

  const runtimeConfig = useRuntimeConfig()
  const url = (runtimeConfig.public as any)?.supabaseUrl || (import.meta.server ? process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL : '')
  const key = (runtimeConfig.public as any)?.supabaseAnonKey || (import.meta.server ? process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY : '')

  if (url && key) {
    const client = import.meta.server
      ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
      : createClient(url, key)
    nuxtApp.provide('supabase', client)
    return client
  }

  return nuxtApp.$supabase as SupabaseClient
}
