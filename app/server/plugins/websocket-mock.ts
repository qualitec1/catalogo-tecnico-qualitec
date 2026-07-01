// Este plugin era necessário para mockar WebSocket no Node < 22.
// Agora o app/plugins/supabase.ts usa o pacote 'ws' diretamente como
// transport do Supabase Realtime, tornando este mock desnecessário.
export default defineNitroPlugin(() => {
  // noop — WebSocket handled by app/plugins/supabase.ts
})

