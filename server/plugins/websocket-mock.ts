export default defineNitroPlugin(() => {
  if (typeof globalThis.WebSocket === 'undefined') {
    globalThis.WebSocket = class {} as any
  }
})
