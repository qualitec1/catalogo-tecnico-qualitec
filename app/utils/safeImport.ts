/**
 * Helper to safely execute dynamic imports with automatic retry and stale chunk recovery.
 * If a deployment update on Vercel purges an old chunk, this reloads the page to fetch fresh assets.
 */
export async function safeImport<T>(importFn: () => Promise<T>, retries = 3, delay = 300): Promise<T> {
  try {
    return await importFn()
  } catch (err: any) {
    const isChunkError = 
      err?.name === 'TypeError' ||
      err?.message?.includes('Failed to fetch dynamically imported module') ||
      err?.message?.includes('Importing a module script failed')

    if (isChunkError && retries > 0) {
      console.warn(`[safeImport] Retrying dynamic import... (${retries} attempts left)`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return safeImport(importFn, retries - 1, delay * 2)
    }

    if (isChunkError && typeof window !== 'undefined') {
      console.error('[safeImport] Failed to load module chunk due to deployment update. Reloading page...')
      window.location.reload()
    }

    throw err
  }
}
