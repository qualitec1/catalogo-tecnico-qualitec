import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const useSupabaseClient = (): SupabaseClient => {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$supabase) {
    return nuxtApp.$supabase as SupabaseClient
  }

  const runtimeConfig = useRuntimeConfig()
  const url = (runtimeConfig.public as any)?.supabaseUrl
  const key = (runtimeConfig.public as any)?.supabaseAnonKey

  if (url && key) {
    const client = createClient(url, key)
    nuxtApp.provide('supabase', client)
    return client
  }

  return nuxtApp.$supabase as SupabaseClient
}

