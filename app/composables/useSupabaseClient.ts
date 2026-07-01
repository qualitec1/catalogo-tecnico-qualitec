// Composable que substitui o useSupabaseClient() do @nuxtjs/supabase.
// Utiliza o cliente Supabase injetado pelo plugin app/plugins/supabase.ts,
// que configura corretamente o transport WebSocket tanto no servidor quanto no browser.
import type { SupabaseClient } from '@supabase/supabase-js'

export const useSupabaseClient = (): SupabaseClient => {
  const { $supabase } = useNuxtApp()
  return $supabase as SupabaseClient
}
