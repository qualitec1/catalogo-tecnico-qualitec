// Plugin Nitro: Define WebSocket global no servidor Node < 22 para o Supabase Realtime
import ws from 'ws'

export default defineNitroPlugin(() => {
  if (typeof (globalThis as any).WebSocket === 'undefined') {
    ;(globalThis as any).WebSocket = ws
  }
})
