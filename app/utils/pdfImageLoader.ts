import { detectFormat, cleanWhiteHalo, fitImageInBox } from './pdfDocUtils'
import type { CachedImage } from './pdfDocUtils'

function getDatasheetLinkLocal(product: any): string | null {
  if (!product) return null
  const url = product.datasheetUrl || product.datasheet_url
  if (url) return url
  const name = product.datasheetName || product.datasheet_name
  if (!name && !url) return null
  
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/datasheet?id=${product.id}`
  }
  return `/api/datasheet?id=${product.id}`
}

export async function loadSingleImage(url: string): Promise<CachedImage | null> {
  try {
    const resp = await fetch(url)
    if (!resp.ok) return null
    const blob = await resp.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    // Get natural dimensions via Image element
    const img = new Image()
    img.src = dataUrl
    await new Promise<void>(r => {
      img.onload = () => r()
      img.onerror = () => r()
    })

    let finalDataUrl = dataUrl
    if (detectFormat(dataUrl) === 'PNG' && typeof document !== 'undefined') {
      try {
        finalDataUrl = cleanWhiteHalo(dataUrl, img)
      } catch (err) {
        console.warn('[pdfBuilder] Error cleaning white halo:', err)
      }
    }

    return {
      dataUrl: finalDataUrl,
      width: img.naturalWidth || 200,
      height: img.naturalHeight || 200,
      format: detectFormat(finalDataUrl),
    }
  } catch {
    return null
  }
}

/**
 * Pre-load all product images + cover + logo in parallel.
 * Returns a Map keyed by the original URL/identifier.
 */
export async function preloadAllImages(
  products: any[],
  coverSrc: string | null,
  logoUrl: string,
  onProgress?: (loaded: number, total: number) => void,
  categoryIconUrl?: string | null,
  categoryAssets?: Record<string, any>,
  pdfType?: 'web' | 'print' | 'qrcode'
): Promise<Map<string, CachedImage>> {

  const cache = new Map<string, CachedImage>()
  const tasks: { key: string; url: string | null }[] = []

  // Logo
  if (logoUrl) {
    if (logoUrl.startsWith('data:')) {
      const img = new Image()
      img.src = logoUrl
      await new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r() })
      cache.set('__logo__', {
        dataUrl: logoUrl,
        width: img.naturalWidth || 380,
        height: img.naturalHeight || 120,
        format: detectFormat(logoUrl),
      })
    } else {
      const proxyUrl = (logoUrl.startsWith('/api/') || logoUrl.startsWith('/')) ? logoUrl : `/api/proxy-image?url=${encodeURIComponent(logoUrl)}`
      tasks.push({ key: '__logo__', url: proxyUrl })
    }
  }

  // Category-specific icons (preloaded for all unique categories in products)
  if (categoryAssets) {
    const uniqueCats = new Set<string>()
    for (const p of products) {
      if (p.category) {
        uniqueCats.add(p.category.toUpperCase().trim())
      }
    }
    for (const cat of uniqueCats) {
      const asset = categoryAssets[cat]
      if (asset) {
        const cIcon = asset.icon_url || asset.iconUrl
        if (cIcon && (cIcon.startsWith('http://') || cIcon.startsWith('https://'))) {
          tasks.push({ key: `category_icon_${cat}`, url: `/api/proxy-image?url=${encodeURIComponent(cIcon)}` })
        }
      }
    }
  }

  // Category icon (fallback/catalog-level)
  if (categoryIconUrl && (categoryIconUrl.startsWith('http://') || categoryIconUrl.startsWith('https://'))) {
    tasks.push({ key: '__category_icon__', url: `/api/proxy-image?url=${encodeURIComponent(categoryIconUrl)}` })
  }

  // Cover image
  if (coverSrc) {
    if (coverSrc.startsWith('data:')) {
      // Already a data URL — parse dimensions
      const img = new Image()
      img.src = coverSrc
      await new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r() })
      cache.set('__cover__', {
        dataUrl: coverSrc,
        width: img.naturalWidth || 400,
        height: img.naturalHeight || 300,
        format: detectFormat(coverSrc),
      })
    } else {
      const proxyUrl = (coverSrc.startsWith('/api/') || coverSrc.startsWith('/')) ? coverSrc : `/api/proxy-image?url=${encodeURIComponent(coverSrc)}`
      tasks.push({ key: '__cover__', url: proxyUrl })
    }
  }

  // Product images
  for (const p of products) {
    const key = `product_${p.id}`
    if (cache.has(key)) continue

    // If product has inline blob already
    if (p.imageBlob) {
      let dataUrl = p.imageBlob
      if (!dataUrl.startsWith('data:')) {
        const isJpg = p.image && (p.image.toLowerCase().endsWith('.jpg') || p.image.toLowerCase().endsWith('.jpeg'))
        const mime = isJpg ? 'image/jpeg' : 'image/png'
        dataUrl = `data:${mime};base64,${p.imageBlob}`
      }
      const img = new Image()
      img.src = dataUrl
      await new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r() })
      let finalDataUrl = dataUrl
      if (detectFormat(dataUrl) === 'PNG' && typeof document !== 'undefined') {
        try {
          finalDataUrl = cleanWhiteHalo(dataUrl, img)
        } catch (err) {
          console.warn('[pdfBuilder] Error cleaning white halo for blob:', err)
        }
      }
      cache.set(key, {
        dataUrl: finalDataUrl,
        width: img.naturalWidth || 400,
        height: img.naturalHeight || 300,
        format: detectFormat(finalDataUrl),
      })
      continue
    }

    if (p.image && (p.image.startsWith('http://') || p.image.startsWith('https://'))) {
      tasks.push({ key, url: `/api/proxy-image?url=${encodeURIComponent(p.image)}` })
    }
    const exUrl = p.exImageUrl || p.ex_image_url
    if (exUrl && (exUrl.startsWith('http://') || exUrl.startsWith('https://'))) {
      tasks.push({ key: `ex_${p.id}`, url: `/api/proxy-image?url=${encodeURIComponent(exUrl)}` })
    }
  }

  // Fetch all in parallel
  let loaded = 0
  const total = tasks.length
  await Promise.allSettled(
    tasks.map(async (t) => {
      if (!t.url) return
      const img = await loadSingleImage(t.url)
      loaded++
      onProgress?.(loaded, total)
      if (img) cache.set(t.key, img)
    })
  )

  // Fallback for logo if failed to load
  if (!cache.has('__logo__')) {
    const fallbackLogoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="380" height="120" viewBox="0 0 380 120"><rect width="380" height="120" rx="8" fill="%23ffffff"/><text x="20" y="70" font-family="Arial, sans-serif" font-weight="bold" font-size="48" fill="%231B388F">QUALITEC</text><text x="20" y="98" font-family="Arial, sans-serif" font-weight="600" font-size="20" fill="%23555555" letter-spacing="4">INDUSTRIAL</text></svg>`
    const fallbackImg = await loadSingleImage(fallbackLogoSvg)
    if (fallbackImg) cache.set('__logo__', fallbackImg)
  }

  // Generate QR codes in parallel if pdfType is qrcode
  if (pdfType === 'qrcode') {
    try {
      const QRCodeLib = await import('qrcode')
      await Promise.all(
        products.map(async (p) => {
          const linkUrl = getDatasheetLinkLocal(p)
          if (linkUrl) {
            try {
              const qrDataUrl = await QRCodeLib.toDataURL(linkUrl, {
                margin: 1,
                width: 150,
                errorCorrectionLevel: 'M'
              })
              cache.set(`qrcode_${p.id}`, {
                dataUrl: qrDataUrl,
                width: 150,
                height: 150,
                format: 'PNG'
              })
            } catch (qrErr) {
              console.error(`[pdfImageLoader] Error generating QR code for product ${p.id}:`, qrErr)
            }
          }
        })
      )
    } catch (err) {
      console.error('[pdfImageLoader] Failed to pre-generate QR codes:', err)
    }
  }

  return cache
}

export function addImageSafe(
  pdf: any,
  cache: Map<string, CachedImage>,
  key: string,
  x: number,
  y: number,
  maxW: number,
  maxH: number,
  scale: number = 1.0,
  prodOffX: number = 0,
  prodOffY: number = 0
) {
  const img = cache.get(key)
  if (!img) return
  const fit = fitImageInBox(img, maxW, maxH)

  const w = fit.w * scale
  const h = fit.h * scale

  // Center the scaled image inside the bounding box
  const centerX = x + (maxW - w) / 2
  const centerY = y + (maxH - h) / 2

  // Convert product offsets (in pixels) to mm
  const prodOffXmm = prodOffX * 0.264
  const prodOffYmm = prodOffY * 0.264

  const finalX = centerX + prodOffXmm
  const finalY = centerY + prodOffYmm

  try {
    pdf.addImage(img.dataUrl, img.format, finalX, finalY, w, h, undefined, 'FAST')
  } catch (e) {
    console.warn(`[pdfBuilder] Could not add image ${key}:`, e)
  }
}
