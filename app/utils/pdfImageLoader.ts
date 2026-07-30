import { detectFormat, cleanWhiteHalo, fitImageInBox } from './pdfDocUtils'
import type { CachedImage } from './pdfDocUtils'
import { LAST_PAGE_DATA_URL } from './lastPageData'

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

export async function loadSingleImage(url: string, skipHalo: boolean = false, fallbackUrl?: string): Promise<CachedImage | null> {
  try {
    let resp = await fetch(url).catch(() => null)
    if ((!resp || !resp.ok) && fallbackUrl && fallbackUrl !== url) {
      resp = await fetch(fallbackUrl).catch(() => null)
    }
    if (!resp || !resp.ok) return null

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
    let finalWidth = img.naturalWidth || 200
    let finalHeight = img.naturalHeight || 200

    if (!skipHalo && typeof document !== 'undefined') {
      try {
        const cleaned = cleanWhiteHalo(dataUrl, img)
        if (cleaned) {
          finalDataUrl = cleaned
          const finalImg = new Image()
          finalImg.src = finalDataUrl
          await new Promise<void>(r => {
            finalImg.onload = () => r()
            finalImg.onerror = () => r()
          })
          finalWidth = finalImg.naturalWidth || img.naturalWidth || 700
          finalHeight = finalImg.naturalHeight || img.naturalHeight || 700
        }
      } catch (err) {
        console.warn('[pdfBuilder] Error cleaning white halo:', err)
      }
    }

    return {
      dataUrl: finalDataUrl,
      width: finalWidth,
      height: finalHeight,
      format: detectFormat(finalDataUrl),
    }
  } catch (err) {
    console.error('[pdfImageLoader] Failed to load image from url:', url, err)
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
  const tasks: { key: string; url: string | null; fallbackUrl?: string }[] = []

  // Preload default placeholder fallback image
  const placeholderImg = await loadSingleImage('/placeholder.png', true).catch(() => null)
  if (placeholderImg) {
    cache.set('__placeholder__', placeholderImg)
  }

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
      tasks.push({ key: '__logo__', url: proxyUrl, fallbackUrl: logoUrl })
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
          tasks.push({ key: `category_icon_${cat}`, url: `/api/proxy-image?url=${encodeURIComponent(cIcon)}`, fallbackUrl: cIcon })
        }
      }
    }
  }

  // Category icon (fallback/catalog-level)
  if (categoryIconUrl && (categoryIconUrl.startsWith('http://') || categoryIconUrl.startsWith('https://'))) {
    tasks.push({ key: '__category_icon__', url: `/api/proxy-image?url=${encodeURIComponent(categoryIconUrl)}`, fallbackUrl: categoryIconUrl })
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
      tasks.push({ key: '__cover__', url: proxyUrl, fallbackUrl: coverSrc })
    }
  }

  // Last page (última folha)
  if (LAST_PAGE_DATA_URL) {
    const img = new Image()
    img.src = LAST_PAGE_DATA_URL
    await new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r() })
    cache.set('__last_page__', {
      dataUrl: LAST_PAGE_DATA_URL,
      width: img.naturalWidth || 2480,
      height: img.naturalHeight || 3508,
      format: 'PNG',
    })
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
      let finalWidth = img.naturalWidth || 400
      let finalHeight = img.naturalHeight || 300
      if (typeof document !== 'undefined') {
        try {
          const cleaned = cleanWhiteHalo(dataUrl, img)
          if (cleaned) {
            finalDataUrl = cleaned
            const finalImg = new Image()
            finalImg.src = finalDataUrl
            await new Promise<void>(r => {
              finalImg.onload = () => r()
              finalImg.onerror = () => r()
            })
            finalWidth = finalImg.naturalWidth || img.naturalWidth || 700
            finalHeight = finalImg.naturalHeight || img.naturalHeight || 700
          }
        } catch (err) {
          console.warn('[pdfBuilder] Error cleaning white halo for blob:', err)
        }
      }
      cache.set(key, {
        dataUrl: finalDataUrl,
        width: finalWidth,
        height: finalHeight,
        format: detectFormat(finalDataUrl),
      })
      continue
    }

    if (p.image && typeof p.image === 'string') {
      const trimmedImg = p.image.trim()
      if (trimmedImg.startsWith('data:')) {
        const img = new Image()
        img.src = trimmedImg
        await new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r() })
        cache.set(key, {
          dataUrl: trimmedImg,
          width: img.naturalWidth || 400,
          height: img.naturalHeight || 300,
          format: detectFormat(trimmedImg),
        })
      } else if (trimmedImg.startsWith('http://') || trimmedImg.startsWith('https://')) {
        tasks.push({ 
          key, 
          url: `/api/proxy-image?url=${encodeURIComponent(trimmedImg)}`,
          fallbackUrl: trimmedImg 
        })
      } else if (trimmedImg.startsWith('/')) {
        tasks.push({ key, url: trimmedImg, fallbackUrl: trimmedImg })
      }
    }

    const exUrl = p.exImageUrl || p.ex_image_url
    if (exUrl && typeof exUrl === 'string') {
      const trimmedEx = exUrl.trim()
      if (trimmedEx.startsWith('http://') || trimmedEx.startsWith('https://')) {
        tasks.push({ 
          key: `ex_${p.id}`, 
          url: `/api/proxy-image?url=${encodeURIComponent(trimmedEx)}`,
          fallbackUrl: trimmedEx
        })
      } else if (trimmedEx.startsWith('/')) {
        tasks.push({ key: `ex_${p.id}`, url: trimmedEx, fallbackUrl: trimmedEx })
      }
    }
  }

  // Fetch all in parallel with fallback support
  let loaded = 0
  const total = tasks.length
  await Promise.allSettled(
    tasks.map(async (t) => {
      if (!t.url) return
      const isDocPage = t.key === '__logo__' || t.key === '__cover__' || t.key === '__last_page__' || t.key.startsWith('category_icon_')
      let img = await loadSingleImage(t.url, isDocPage, t.fallbackUrl)
      if (!img && t.fallbackUrl && t.fallbackUrl !== t.url) {
        img = await loadSingleImage(t.fallbackUrl, isDocPage)
      }
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
  prodOffY: number = 0,
  globalScaleX: number = 1.0,
  globalScaleY: number = 1.0,
  clipX?: number,
  clipY?: number,
  clipW?: number,
  clipH?: number,
  alignTop: boolean = false,
  alignBottom: boolean = false
) {
  let img = cache.get(key)
  if (!img && key.startsWith('product_')) {
    img = cache.get('__placeholder__')
  }
  if (!img) return
  
  let w: number, h: number
  const imgRatio = img.width / img.height

  if (alignTop) {
    // Fit to width first (to keep horizontal size uniform and filling the box)
    w = maxW * scale * globalScaleX
    h = w / imgRatio

    // Allow height to overflow the box (maxH) by up to 11mm (into the green banner area)
    // but scale down if it would exceed that limit to prevent overlapping specs table.
    const limitH = maxH + 11
    if (h > limitH) {
      h = limitH
      w = h * imgRatio
    }
  } else {
    // Normal fitting (center-aligned both ways or bottom-aligned)
    const fit = fitImageInBox(img, maxW, maxH)
    w = fit.w * scale * globalScaleX
    h = fit.h * scale * globalScaleY

    if (w > maxW) {
      const ratio = maxW / w
      w = maxW
      h = h * ratio
    }
    if (h > maxH) {
      const ratio = maxH / h
      h = maxH
      w = w * ratio
    }
  }

  // Center the scaled image inside the bounding box horizontally
  const centerX = x + (maxW - w) / 2
  
  // Center, top-align, or bottom-align vertically
  let centerY: number
  if (alignBottom) {
    centerY = y + maxH - h
  } else if (alignTop) {
    centerY = y
  } else {
    centerY = y + (maxH - h) / 2
  }

  // Convert product offsets (in pixels) to mm
  const prodOffXmm = prodOffX * 0.264
  const prodOffYmm = prodOffY * 0.264

  const finalX = centerX + prodOffXmm
  const finalY = centerY + prodOffYmm

  try {
    // Draw the image without any clipping to ensure it is never cut off
    pdf.addImage(img.dataUrl, img.format, finalX, finalY, w, h, undefined, 'FAST')
  } catch (e) {
    console.warn(`[pdfBuilder] Could not add image ${key}:`, e)
  }
}
