/**
 * pdfBuilder.ts — Construtor programático de catálogo PDF via jsPDF
 *
 * Elimina completamente o html2canvas. Todas as formas, textos e imagens são
 * desenhados diretamente na API do jsPDF, resultando em geração ultra-rápida
 * (< 5 s para 73 produtos).
 */

// ========================== Types ==========================

export interface CachedImage {
  dataUrl: string
  width: number
  height: number
  format: 'JPEG' | 'PNG'
}

export interface BuildOptions {
  pages: any[][]
  isLandscape: boolean
  categoryName: string
  categoryColor: string
  coverImageDataUrl: string | null
  logoDataUrl: string | null
  imageCache: Map<string, CachedImage>
  getPageSettings: (page: any[]) => any
  getBgColor: (bgClass: string | null | undefined, category?: string) => string
  getSlots: (product: any) => number
}

// ========================== Constants ==========================

// A4 dimensions in mm
const A4_W = 210
const A4_H = 297
const MARGIN_X = 13
const MARGIN_TOP = 8
const MARGIN_BOTTOM = 8

// ========================== Helpers ==========================

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function detectFormat(dataUrl: string): 'JPEG' | 'PNG' {
  if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) return 'JPEG'
  return 'PNG'
}

/** Fit image into a box while maintaining aspect ratio, returning centered position */
function fitImageInBox(
  img: CachedImage,
  boxW: number,
  boxH: number
): { w: number; h: number; offX: number; offY: number } {
  const imgRatio = img.width / img.height
  const boxRatio = boxW / boxH
  let w: number, h: number
  if (imgRatio > boxRatio) {
    w = boxW
    h = boxW / imgRatio
  } else {
    h = boxH
    w = boxH * imgRatio
  }
  return { w, h, offX: (boxW - w) / 2, offY: (boxH - h) / 2 }
}

/** Parse a dimension string like '10px' and return mm value */
function dimToMm(val: string | number | undefined, fallbackMm: number): number {
  if (val === undefined || val === null || val === '') return fallbackMm
  const str = String(val).trim()
  const num = parseFloat(str)
  if (isNaN(num)) return fallbackMm
  // Assume px; 1px ≈ 0.264mm at 96dpi
  return num * 0.264
}

function parseFontSizePt(val: string | number | undefined, fallbackPt: number): number {
  if (val === undefined || val === null || val === '') return fallbackPt
  const num = parseFloat(String(val))
  if (isNaN(num)) return fallbackPt
  // Convert px to pt (1px ≈ 0.75pt)
  return num * 0.75
}

/** Truncate text to fit within maxWidth (mm) at current font */
function truncateText(pdf: any, text: string, maxWidth: number): string {
  const lines = pdf.splitTextToSize(text, maxWidth)
  return lines[0] || text
}

// ========================== Image Preloader ==========================

async function loadSingleImage(url: string): Promise<CachedImage | null> {
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
    return {
      dataUrl,
      width: img.naturalWidth || 200,
      height: img.naturalHeight || 200,
      format: detectFormat(dataUrl),
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
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, CachedImage>> {
  const cache = new Map<string, CachedImage>()
  const tasks: { key: string; url: string | null }[] = []

  // Logo
  tasks.push({ key: '__logo__', url: `/api/proxy-image?url=${encodeURIComponent(logoUrl)}` })

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
      const proxyUrl = coverSrc.startsWith('/api/') ? coverSrc : `/api/proxy-image?url=${encodeURIComponent(coverSrc)}`
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
      cache.set(key, {
        dataUrl,
        width: img.naturalWidth || 400,
        height: img.naturalHeight || 300,
        format: detectFormat(dataUrl),
      })
      continue
    }

    if (p.image && (p.image.startsWith('http://') || p.image.startsWith('https://'))) {
      tasks.push({ key, url: `/api/proxy-image?url=${encodeURIComponent(p.image)}` })
    }
  }

  // Fetch all in parallel
  let loaded = 0
  const total = tasks.length
  const results = await Promise.allSettled(
    tasks.map(async (t) => {
      if (!t.url) return
      const img = await loadSingleImage(t.url)
      loaded++
      onProgress?.(loaded, total)
      if (img) cache.set(t.key, img)
    })
  )

  return cache
}

// ========================== Drawing Helpers ==========================

function setFillRgb(pdf: any, hex: string) {
  const [r, g, b] = hexToRgb(hex)
  pdf.setFillColor(r, g, b)
}

function setTextRgb(pdf: any, hex: string) {
  const [r, g, b] = hexToRgb(hex)
  pdf.setTextColor(r, g, b)
}

function setDrawRgb(pdf: any, hex: string) {
  const [r, g, b] = hexToRgb(hex)
  pdf.setDrawColor(r, g, b)
}

function addImageSafe(
  pdf: any,
  cache: Map<string, CachedImage>,
  key: string,
  x: number,
  y: number,
  maxW: number,
  maxH: number
) {
  const img = cache.get(key)
  if (!img) return
  const fit = fitImageInBox(img, maxW, maxH)
  try {
    pdf.addImage(img.dataUrl, img.format, x + fit.offX, y + fit.offY, fit.w, fit.h, undefined, 'FAST')
  } catch (e) {
    console.warn(`[pdfBuilder] Could not add image ${key}:`, e)
  }
}

// ========================== Cover Page ==========================

function drawCoverPage(pdf: any, opts: BuildOptions) {
  const pageW = opts.isLandscape ? A4_H : A4_W
  const pageH = opts.isLandscape ? A4_W : A4_H
  const color = opts.categoryColor

  // 1. Logo — top right
  const logoX = pageW - 80
  const logoY = 16
  addImageSafe(pdf, opts.imageCache, '__logo__', logoX, logoY, 64, 20)

  // 2. Gray band background
  const bandTop = opts.isLandscape ? 98 : 143
  const bandBottom = opts.isLandscape ? pageH - 16 : pageH - 21
  setFillRgb(pdf, '#f0f2f5')
  pdf.rect(0, bandTop, pageW, bandBottom - bandTop, 'F')

  // 3. Colored category block
  const blockTop = opts.isLandscape ? 74 : 117
  const blockW = opts.isLandscape ? 160 : 146
  const blockH = opts.isLandscape ? 50 : 58
  setFillRgb(pdf, color)
  pdf.rect(0, blockTop, blockW, blockH, 'F')

  // Text inside block
  const textX = 13
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(255, 255, 255)
  pdf.text('CATÁLOGO DE PRODUTOS', textX, blockTop + 14)

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)
  const catName = opts.categoryName === 'VÁLVULAS'
    ? 'VÁLVULAS DE SEGURANÇA E ALÍVIO'
    : opts.categoryName.toUpperCase()
  const titleLines = pdf.splitTextToSize(catName, blockW - 26)
  pdf.text(titleLines, textX, blockTop + 24)

  // 4. Cover image — bottom right
  const imgAreaW = opts.isLandscape ? 130 : 122
  const imgAreaH = opts.isLandscape ? 80 : 90
  const imgX = pageW - imgAreaW - 11
  const imgY = pageH - imgAreaH - (opts.isLandscape ? 18 : 24)
  addImageSafe(pdf, opts.imageCache, '__cover__', imgX, imgY, imgAreaW, imgAreaH)

  // 5. Website footer
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(156, 163, 175)
  const footerY = pageH - (opts.isLandscape ? 9 : 13)
  pdf.text('w w w . q u a l i t e c . i n d . b r', 16, footerY)
}

// ========================== Page Header & Footer ==========================

function drawPageHeader(
  pdf: any,
  category: string,
  color: string,
  y: number,
  pageW: number,
  settings: any
): number {
  const fontSize = parseFontSizePt(settings.title_font_size, 22)
  setTextRgb(pdf, color)
  pdf.setFont('helvetica', settings.title_bold ? 'bold' : 'normal')
  pdf.setFontSize(fontSize)
  pdf.text(category.toUpperCase(), MARGIN_X, y + fontSize * 0.35)
  return y + fontSize * 0.45 + 4
}

function drawPageFooter(pdf: any, pageNum: number, totalPages: number, pageW: number, pageH: number) {
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(156, 163, 175)
  setDrawRgb(pdf, '#f3f4f6')
  const footerY = pageH - MARGIN_BOTTOM + 2
  pdf.line(MARGIN_X, footerY - 3, pageW - MARGIN_X, footerY - 3)
  pdf.text(`Página ${pageNum} de ${totalPages}`, pageW / 2, footerY, { align: 'center' })
}

// ========================== Specs Table Drawing ==========================

function drawSpecsTable(
  pdf: any,
  specs: { label: string; value: string }[],
  x: number,
  y: number,
  w: number,
  maxH: number,
  settings: any,
  compact: boolean
): number {
  if (!specs || specs.length === 0) return y

  const labelW = w * 0.45
  const valueW = w * 0.55
  const rowPad = compact ? 1.2 : 2.0
  const fontSize = compact ? 6 : 7.5
  const lineColor = settings.specs_line_color || '#cbd5e1'
  const lineStyle = settings.specs_line_style || 'dashed'

  pdf.setFontSize(fontSize)
  let curY = y + rowPad

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]
    if (curY + 4 > y + maxH) break // Don't overflow

    // Label (left-aligned)
    pdf.setFont('helvetica', settings.specs_bold ? 'bold' : 'normal')
    pdf.setTextColor(107, 114, 128) // gray-500
    const labelText = truncateText(pdf, spec.label, labelW - 2)
    pdf.text(labelText, x + 1, curY + 2.5)

    // Value (right-aligned)
    pdf.setFont('helvetica', settings.specs_val_bold ? 'bold' : 'normal')
    pdf.setTextColor(17, 24, 39) // gray-900
    const valueText = truncateText(pdf, spec.value, valueW - 2)
    pdf.text(valueText, x + w - 1, curY + 2.5, { align: 'right' })

    curY += rowPad * 2 + 2.5

    // Divider line (except last row)
    if (i < specs.length - 1 && lineStyle !== 'none') {
      setDrawRgb(pdf, lineColor)
      pdf.setLineWidth(0.15)
      if (lineStyle === 'dashed') {
        // Draw dashed line manually
        const dashLen = 1.5
        const gapLen = 1.0
        let dx = x
        while (dx < x + w) {
          const end = Math.min(dx + dashLen, x + w)
          pdf.line(dx, curY - rowPad, end, curY - rowPad)
          dx += dashLen + gapLen
        }
      } else {
        pdf.line(x, curY - rowPad, x + w, curY - rowPad)
      }
    }
  }

  return curY
}

// ========================== Colored Header Block ==========================

function drawColoredHeader(
  pdf: any,
  product: any,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  settings: any,
  compact: boolean
) {
  // Colored background
  setFillRgb(pdf, color)
  pdf.rect(x, y, w, h, 'F')

  pdf.setTextColor(255, 255, 255)

  if (compact) {
    // Compact header for slots=1 (6 per page): category left, model right
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(5.5)
    pdf.text((product.category || '').toUpperCase(), x + 3, y + 4.5)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(5)
    const title = truncateText(pdf, product.title || '', w - 30)
    pdf.text(title, x + 3, y + 8)

    // Model code right
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(4)
    pdf.setTextColor(255, 255, 255)
    pdf.text('Modelo', x + w - 3, y + 4, { align: 'right' })
    pdf.setFont('helvetica', 'bold')
    const modelSize = parseFontSizePt(settings.card_model_font_size, 14)
    pdf.setFontSize(Math.min(modelSize, 12))
    pdf.text(product.nameCode || '', x + w - 3, y + 8.5, { align: 'right' })
  } else {
    // Standard header: model code + tag on top line, title below
    const modelSize = parseFontSizePt(settings.card_model_font_size, 16)

    // "Modelo" label
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(5.5)
    pdf.setTextColor(220, 220, 220)
    pdf.text('MODELO', x + 3, y + 5)

    // Model code
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(modelSize)
    pdf.setTextColor(255, 255, 255)
    pdf.text(product.nameCode || '', x + 3, y + 5 + modelSize * 0.45)

    // Tag (right side)
    if (product.tag) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(6)
      pdf.setTextColor(220, 220, 220)
      pdf.text(product.tag, x + w - 3, y + 5, { align: 'right' })
    }

    // Product title
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(255, 255, 255)
    const titleText = truncateText(pdf, product.title || '', w - 8)
    pdf.text(titleText, x + 3, y + h - 3)
  }
}

// ========================== Layout: slots=3 (2 per page) ==========================

function drawLayout3(
  pdf: any,
  products: any[],
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  opts: BuildOptions,
  settings: any
) {
  const cardH = products.length === 1 ? contentH : (contentH - 4) / 2

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const cardY = contentY + i * (cardH + 4)
    const color = opts.getBgColor(product.bgClass, product.category)

    // Layout: specs on left, image on right
    const specsW = 110
    const imgW = contentW - specsW - 6
    const headerH = 18

    // Specs card background
    setFillRgb(pdf, '#f3f4f6')
    pdf.rect(contentX, cardY, specsW, cardH, 'F')

    // Colored header
    drawColoredHeader(pdf, product, contentX, cardY, specsW, headerH, color, settings, false)

    // Specs table below header
    drawSpecsTable(
      pdf,
      product.specs,
      contentX,
      cardY + headerH + 1,
      specsW,
      cardH - headerH - 2,
      settings,
      false
    )

    // Product image on the right
    const imgX = contentX + specsW + 6
    addImageSafe(pdf, opts.imageCache, `product_${product.id}`, imgX, cardY + 4, imgW, cardH - 8)

    // Divider between products
    if (i === 0 && products.length > 1) {
      const divColor = settings.divider_line_color || '#cbd5e1'
      setDrawRgb(pdf, divColor)
      pdf.setLineWidth(0.2)
      const divY = cardY + cardH + 2
      pdf.line(contentX, divY, contentX + contentW, divY)
    }
  }
}

// ========================== Layout: slots=1 (6 per page) ==========================

function drawLayout6(
  pdf: any,
  products: any[],
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  opts: BuildOptions,
  settings: any
) {
  const cols = 3
  const rows = 2
  const gapX = 4
  const gapY = 4
  const cellW = (contentW - gapX * (cols - 1)) / cols
  const cellH = (contentH - gapY * (rows - 1)) / rows

  for (let i = 0; i < products.length && i < 6; i++) {
    const product = products[i]
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = contentX + col * (cellW + gapX)
    const y = contentY + row * (cellH + gapY)
    const color = opts.getBgColor(product.bgClass, product.category)

    const imgH = cellH * 0.32
    const headerH = 12
    const specsH = cellH - imgH - headerH - 2

    // Product image (top of cell)
    addImageSafe(pdf, opts.imageCache, `product_${product.id}`, x + 2, y + 1, cellW - 4, imgH - 2)

    // Colored header below image
    drawColoredHeader(pdf, product, x, y + imgH, cellW, headerH, color, settings, true)

    // Specs below header
    setFillRgb(pdf, '#ffffff')
    pdf.rect(x, y + imgH + headerH, cellW, specsH, 'F')
    // Thin border around specs area
    setDrawRgb(pdf, '#e5e7eb')
    pdf.setLineWidth(0.15)
    pdf.rect(x, y + imgH + headerH, cellW, specsH, 'S')

    drawSpecsTable(
      pdf,
      product.specs,
      x + 1,
      y + imgH + headerH,
      cellW - 2,
      specsH - 1,
      settings,
      true
    )
  }

  // Horizontal divider between rows (if there are products in both rows)
  if (products.length > 3) {
    setDrawRgb(pdf, '#9ca3af')
    pdf.setLineWidth(0.15)
    const divY = contentY + (contentH / 2)
    pdf.line(contentX, divY, contentX + contentW, divY)
  }
}

// ========================== Layout: slots=6 (1 per page) ==========================

function drawLayout1(
  pdf: any,
  product: any,
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  opts: BuildOptions,
  settings: any
) {
  const color = opts.getBgColor(product.bgClass, product.category)

  // Image area (top portion ~55% of space)
  const imgH = contentH * 0.50
  addImageSafe(pdf, opts.imageCache, `product_${product.id}`, contentX + 10, contentY + 2, contentW - 20, imgH - 4)

  // Specs card with colored header below the image
  const cardY = contentY + imgH + 4
  const cardH = contentH - imgH - 6
  const headerH = 22

  // Colored header
  drawColoredHeader(pdf, product, contentX, cardY, contentW, headerH, color, settings, false)

  // Specs table with gray background
  setFillRgb(pdf, '#f3f4f6')
  pdf.rect(contentX, cardY + headerH, contentW, cardH - headerH, 'F')

  drawSpecsTable(
    pdf,
    product.specs,
    contentX + 4,
    cardY + headerH,
    contentW - 8,
    cardH - headerH - 2,
    settings,
    false
  )
}

// ========================== Main Builder ==========================

export async function buildCatalogPdf(opts: BuildOptions): Promise<any> {
  const { jsPDF } = await import('jspdf')

  const orientation = opts.isLandscape ? 'landscape' : 'portrait'
  const pageW = opts.isLandscape ? A4_H : A4_W
  const pageH = opts.isLandscape ? A4_W : A4_H
  const contentW = pageW - MARGIN_X * 2
  const totalPages = opts.pages.length

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  // 1. Draw cover page
  drawCoverPage(pdf, opts)

  // 2. Draw product pages
  for (let pi = 0; pi < opts.pages.length; pi++) {
    const page = opts.pages[pi]
    if (page.length === 0) continue

    pdf.addPage('a4', orientation)

    const settings = opts.getPageSettings(page)
    const category = page[0]?.category || opts.categoryName
    const color = opts.getBgColor(page[0]?.bgClass, category)

    // Page header
    const headerEndY = drawPageHeader(pdf, category, color, MARGIN_TOP + 4, pageW, settings)

    // Content area
    const contentY = headerEndY + 2
    const footerH = 10
    const contentH = pageH - contentY - footerH

    // Determine which layout to use based on the dominant slot type
    const dominantSlots = opts.getSlots(page[0])

    if (dominantSlots === 1) {
      // 6 per page
      drawLayout6(pdf, page, MARGIN_X, contentY, contentW, contentH, opts, settings)
    } else if (dominantSlots === 6) {
      // 1 per page
      drawLayout1(pdf, page[0], MARGIN_X, contentY, contentW, contentH, opts, settings)
    } else {
      // 2 per page (default for slots=3)
      drawLayout3(pdf, page, MARGIN_X, contentY, contentW, contentH, opts, settings)
    }

    // Page footer
    drawPageFooter(pdf, pi + 1, totalPages, pageW, pageH)
  }

  return pdf
}
