import { 
  dimToMm, 
  setFillRgb, 
  setDrawRgb 
} from './pdfDocUtils'
import { addImageSafe } from './pdfImageLoader'
import { 
  drawColoredHeader, 
  drawSpecsTable, 
  drawDatasheetLink,
  drawDatasheetQrCode
} from './pdfDrawHelpers'
import type { BuildOptions } from './pdfDrawHelpers'

/** Returns true if the value was explicitly set (non-empty, non-null) */
function hasDim(val: any): boolean {
  return val !== undefined && val !== null && val !== ''
}

/** Parse a dimension for sizing (width/height) with a 1mm minimum */
function parseSizeDim(val: any, fallback: number): number {
  if (!hasDim(val)) return fallback
  const mm = dimToMm(val, fallback)
  // If result is implausibly small (<1mm), treat as unconfigured → use fallback
  return mm >= 1 ? mm : fallback
}

// ========================== Layout: slots=3 (2 per page) ==========================

export function drawLayout3(
  pdf: any,
  products: any[],
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  opts: BuildOptions,
  settings: any
) {
  const scale = opts.bookletMode ? 0.707 : 1
  const spacing = dimToMm(settings.product_spacing || settings.productSpacing, 4)
  const cardH = (contentH - spacing) / 2
  const offX = dimToMm(settings.product_image_offset_x || settings.productImageOffsetX, 0)
  const offY = dimToMm(settings.product_image_offset_y || settings.productImageOffsetY, 0)

  const isImageLeft = (settings.image_position || settings.imagePosition) === 'left' ||
                      (settings.card_layout_order || settings.cardLayoutOrder) === 'image-first'

  // Block positioning / sizing overrides
  const defaultHeaderH = 18
  const defaultSpecsW = 110

  const blockGap = dimToMm(settings.block_gap || settings.blockGap, 1.5)
  const hh = settings.header_height ?? settings.headerHeight
  const hw = settings.header_width ?? settings.headerWidth
  const sh = settings.specs_height ?? settings.specsHeight
  const sw = settings.specs_width ?? settings.specsWidth

  const headerH = parseSizeDim(hh, defaultHeaderH)
  const headerW = parseSizeDim(hw, defaultSpecsW)
  const autoSpecsH = cardH - headerH - blockGap
  const specsH = parseSizeDim(sh, autoSpecsH)
  const specsW = parseSizeDim(sw, defaultSpecsW)

  const headerOffX = dimToMm(settings.header_offset_x || settings.headerOffsetX, 0)
  const headerOffY = dimToMm(settings.header_offset_y || settings.headerOffsetY, 0)
  const specsOffX = dimToMm(settings.specs_offset_x || settings.specsOffsetX, 0)
  const specsOffY = dimToMm(settings.specs_offset_y || settings.specsOffsetY, 0)

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const cardY = contentY + i * (cardH + spacing)
    const color = opts.getBgColor(product.bgClass || product.bg_class, product.category)

    const imgW = contentW - defaultSpecsW - 6

    const specsX = isImageLeft ? contentX + imgW + 6 : contentX
    const imgX = isImageLeft ? contentX : contentX + defaultSpecsW + 6

    // Draw grey specs block background starting below header + gap
    const specsBg = settings.specs_bg_color || settings.specsBgColor || '#f3f4f6'
    setFillRgb(pdf, specsBg)
    pdf.rect(specsX + specsOffX, cardY + headerH + blockGap + specsOffY, specsW, specsH, 'F')

    // Draw blue header block
    drawColoredHeader(pdf, product, specsX + headerOffX, cardY + headerOffY, headerW, headerH, color, settings, false)

    // Draw specs table inside grey block (increased maxH for booklet mode)
    drawSpecsTable(
      pdf,
      product.specs,
      specsX + specsOffX,
      cardY + headerH + blockGap + specsOffY + 1,
      specsW,
      opts.pdfType === 'qrcode' ? specsH - 20 * scale : specsH - 8 * scale,  // Reduced space for specs if QR code is present
      settings,
      false,
      product.exImageUrl || product.ex_image_url ? `ex_${product.id}` : null,
      opts.imageCache,
      !!(product.exImageUrl || product.ex_image_url) // hasExImage
    )

    // Draw datasheet link or QR Code at the bottom of grey block
    if (opts.pdfType === 'qrcode') {
      drawDatasheetQrCode(
        pdf,
        product,
        specsX + specsOffX,
        cardY + headerH + blockGap + specsOffY,
        specsW,
        specsH,
        opts.imageCache,
        scale
      )
    } else {
      drawDatasheetLink(pdf, product, specsX + specsOffX + specsW - 4, cardY + headerH + blockGap + specsOffY + specsH - 5 * scale, true, opts.forPrint, scale)
    }

    // Draw EX logo if present (positioned on the side of the header banner)
    const exKey = `ex_${product.id}`
    if (opts.imageCache.has(exKey)) {
      const exW = 12 * scale
      const exX = isImageLeft 
        ? specsX + headerOffX - exW - 2 * scale 
        : specsX + headerOffX + headerW + 2 * scale
      const exY = cardY + headerOffY + 1.5 * scale
      addImageSafe(pdf, opts.imageCache, exKey, exX, exY, exW, exW)
    }

    // Calculate final scale: Global PDF scale × Individual product scale
    const globalScale = (settings.pdf_image_scale !== undefined && settings.pdf_image_scale !== null) ? Number(settings.pdf_image_scale) : 1.0
    const individualScale = (product.imageScale !== undefined && product.imageScale !== null) ? Number(product.imageScale) : ((product.image_scale !== undefined && product.image_scale !== null) ? Number(product.image_scale) : 1.0)
    const finalScale = globalScale * individualScale

    addImageSafe(
      pdf,
      opts.imageCache,
      `product_${product.id}`,
      imgX + offX,
      cardY + 4 + offY,
      imgW,
      cardH - 8,
      finalScale,
      (product.imageOffsetX !== undefined && product.imageOffsetX !== null) ? Number(product.imageOffsetX) : ((product.image_offset_x !== undefined && product.image_offset_x !== null) ? Number(product.image_offset_x) : 0),
      (product.imageOffsetY !== undefined && product.imageOffsetY !== null) ? Number(product.imageOffsetY) : ((product.image_offset_y !== undefined && product.image_offset_y !== null) ? Number(product.image_offset_y) : 0)
    )

    // Não desenhar linha divisória se qualquer produto tiver imagem EX
    const hasExImage = products.some(p => p.ex_image_url || p.exImageUrl)
    if (i === 0 && products.length > 1 && !hasExImage) {
      const divColor = settings.divider_line_color || '#cbd5e1'
      setDrawRgb(pdf, divColor)
      pdf.setLineWidth(0.2)
      const divY = cardY + cardH + spacing / 2
      pdf.line(contentX, divY, contentX + contentW, divY)
    }
  }
}

// ========================== Layout: slots=1 (6 per page) ==========================

export function drawLayout6(
  pdf: any,
  products: any[],
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  opts: BuildOptions,
  settings: any
) {
  const scale = opts.bookletMode ? 0.707 : 1
  const cols = 3
  const rows = 2
  const gapX = 4
  const spacing = dimToMm(settings.product_spacing || settings.productSpacing, 4)
  const gapY = spacing
  const cellW = (contentW - gapX * (cols - 1)) / cols
  const cellH = (contentH - gapY * (rows - 1)) / rows

  const offX = dimToMm(settings.product_image_offset_x || settings.productImageOffsetX, 0)
  const offY = dimToMm(settings.product_image_offset_y || settings.productImageOffsetY, 0)

  const isSpecsFirst = (settings.card_layout_order || settings.cardLayoutOrder) === 'specs-first'

  // Block positioning / sizing overrides
  const defaultHeaderH = 12
  const hh6 = settings.header_height ?? settings.headerHeight
  const hw6 = settings.header_width ?? settings.headerWidth
  const headerH = parseSizeDim(hh6, defaultHeaderH)
  const headerW = parseSizeDim(hw6, cellW)

  const headerOffX = dimToMm(settings.header_offset_x || settings.headerOffsetX, 0)
  const headerOffY = dimToMm(settings.header_offset_y || settings.headerOffsetY, 0)
  const specsOffX = dimToMm(settings.specs_offset_x || settings.specsOffsetX, 0)
  const specsOffY = dimToMm(settings.specs_offset_y || settings.specsOffsetY, 0)

  const blockGap = dimToMm(settings.block_gap || settings.blockGap, 1.0)

  for (let i = 0; i < products.length && i < 6; i++) {
    const product = products[i]
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = contentX + col * (cellW + gapX)
    const y = contentY + row * (cellH + gapY)
    const color = opts.getBgColor(product.bgClass || product.bg_class, product.category)

    const imgH = cellH * 0.32
    const defaultSpecsH = cellH - imgH - headerH - blockGap - 2

    const sh6 = settings.specs_height ?? settings.specsHeight
    const sw6 = settings.specs_width ?? settings.specsWidth
    const specsH = parseSizeDim(sh6, defaultSpecsH)
    const specsW = parseSizeDim(sw6, cellW)

    const imgCellY = isSpecsFirst ? y + headerH + blockGap + specsH + 1 : y + 1
    const headerCellY = isSpecsFirst ? y : y + imgH
    const specsCellY = isSpecsFirst ? y + headerH + blockGap : y + imgH + headerH + blockGap

    // Draw blue header block
    drawColoredHeader(pdf, product, x + headerOffX, headerCellY + headerOffY, headerW, headerH, color, settings, true)

    // Draw grey specs block background (border removed for cleaner look)
    const specsBg = settings.specs_bg_color || settings.specsBgColor || '#ffffff'
    setFillRgb(pdf, specsBg)
    pdf.rect(x + specsOffX, specsCellY + specsOffY, specsW, specsH, 'F')
    // setDrawRgb(pdf, '#e5e7eb')
    // pdf.setLineWidth(0.15)
    // pdf.rect(x + specsOffX, specsCellY + specsOffY, specsW, specsH, 'S')

    // Draw specs table inside grey block (increased maxH for booklet mode)
    drawSpecsTable(
      pdf,
      product.specs,
      x + 1 + specsOffX,
      specsCellY + specsOffY,
      specsW - 2,
      opts.pdfType === 'qrcode' ? specsH - 15 * scale : specsH - 8 * scale,  // Reduced to specsH - 8 * scale to leave clearance for the link at specsH - 5 * scale
      settings,
      true,
      product.exImageUrl || product.ex_image_url ? `ex_${product.id}` : null,
      opts.imageCache,
      !!(product.exImageUrl || product.ex_image_url) // hasExImage
    )

    // Draw datasheet link or QR Code at the bottom of grey block
    if (opts.pdfType === 'qrcode') {
      drawDatasheetQrCode(
        pdf,
        product,
        x + specsOffX,
        specsCellY + specsOffY,
        specsW,
        specsH,
        opts.imageCache,
        scale
      )
    } else {
      drawDatasheetLink(pdf, product, x + specsOffX + specsW - 2, specsCellY + specsOffY + specsH - 5 * scale, true, opts.forPrint, scale)
    }

    // Draw EX logo if present (positioned above the header banner on the right side)
    const exKey = `ex_${product.id}`
    if (opts.imageCache.has(exKey)) {
      const exW = 9 * scale
      const exX = x + headerOffX + headerW - exW - 2 * scale
      const exY = headerCellY + headerOffY - exW - 1.5 * scale
      addImageSafe(pdf, opts.imageCache, exKey, exX, exY, exW, exW)
    }

    // Calculate final scale: Global PDF scale × Individual product scale
    const globalScale = (settings.pdf_image_scale !== undefined && settings.pdf_image_scale !== null) ? Number(settings.pdf_image_scale) : 1.0
    const individualScale = (product.imageScale !== undefined && product.imageScale !== null) ? Number(product.imageScale) : ((product.image_scale !== undefined && product.image_scale !== null) ? Number(product.image_scale) : 1.0)
    const finalScale = globalScale * individualScale

    addImageSafe(
      pdf,
      opts.imageCache,
      `product_${product.id}`,
      x + 2 + offX,
      imgCellY + offY,
      cellW - 4,
      imgH - 2,
      finalScale,
      (product.imageOffsetX !== undefined && product.imageOffsetX !== null) ? Number(product.imageOffsetX) : ((product.image_offset_x !== undefined && product.image_offset_x !== null) ? Number(product.image_offset_x) : 0),
      (product.imageOffsetY !== undefined && product.imageOffsetY !== null) ? Number(product.imageOffsetY) : ((product.image_offset_y !== undefined && product.image_offset_y !== null) ? Number(product.image_offset_y) : 0)
    )
  }

  // Não desenhar linhas divisórias se qualquer produto tiver imagem EX
  const hasExImage = products.some(p => p.ex_image_url || p.exImageUrl)
  if (products.length > 3 && !hasExImage) {
    const divColor = settings.divider_line_color || settings.dividerLineColor || '#cbd5e1'
    setDrawRgb(pdf, divColor)
    pdf.setLineWidth(0.2)
    const divY = contentY + cellH + spacing / 2
    for (let col = 0; col < 3; col++) {
      const x = contentX + col * (cellW + gapX)
      pdf.line(x, divY, x + cellW, divY)
    }
  }
}

// ========================== Layout: slots=6 (1 per page) ==========================

export function drawLayout1(
  pdf: any,
  product: any,
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  opts: BuildOptions,
  settings: any
) {
  const scale = opts.bookletMode ? 0.707 : 1
  const color = opts.getBgColor(product.bgClass || product.bg_class, product.category)
  const offX = dimToMm(settings.product_image_offset_x || settings.productImageOffsetX, 0)
  const offY = dimToMm(settings.product_image_offset_y || settings.productImageOffsetY, 0)

  const isSpecsFirst = (settings.card_layout_order || settings.cardLayoutOrder) === 'specs-first'

  const imgH = contentH * 0.50
  const cardH = contentH - imgH - 6
  const defaultHeaderH = 22

  const blockGap = dimToMm(settings.block_gap || settings.blockGap, 2.0)
  const hh1 = settings.header_height ?? settings.headerHeight
  const hw1 = settings.header_width ?? settings.headerWidth
  const sh1 = settings.specs_height ?? settings.specsHeight
  const sw1 = settings.specs_width ?? settings.specsWidth

  const headerH = parseSizeDim(hh1, defaultHeaderH)
  const headerW = parseSizeDim(hw1, contentW)
  const autoSpecsH = cardH - headerH - blockGap
  const specsH = parseSizeDim(sh1, autoSpecsH)
  const specsW = parseSizeDim(sw1, contentW)

  const imgY = isSpecsFirst ? contentY + cardH + 4 : contentY + 2
  const cardY = isSpecsFirst ? contentY : contentY + imgH + 4

  const headerOffX = dimToMm(settings.header_offset_x || settings.headerOffsetX, 0)
  const headerOffY = dimToMm(settings.header_offset_y || settings.headerOffsetY, 0)
  const specsOffX = dimToMm(settings.specs_offset_x || settings.specsOffsetX, 0)
  const specsOffY = dimToMm(settings.specs_offset_y || settings.specsOffsetY, 0)

  // Draw blue header block
  drawColoredHeader(pdf, product, contentX + headerOffX, cardY + headerOffY, headerW, headerH, color, settings, false)

  // Draw grey specs block background
  const specsBg = settings.specs_bg_color || settings.specsBgColor || '#f3f4f6'
  setFillRgb(pdf, specsBg)
  pdf.rect(contentX + specsOffX, cardY + headerH + blockGap + specsOffY, specsW, specsH, 'F')

  // Draw specs table inside grey block (increased maxH for booklet mode)
  drawSpecsTable(
    pdf,
    product.specs,
    contentX + 4 + specsOffX,
    cardY + headerH + blockGap + specsOffY + 1,
    specsW - 8,
    opts.pdfType === 'qrcode' ? specsH - 20 * scale : specsH - 8 * scale,  // Reduced space for specs if QR code is present
    settings,
    false,
    product.exImageUrl || product.ex_image_url ? `ex_${product.id}` : null,
    opts.imageCache,
    !!(product.exImageUrl || product.ex_image_url)
  )

  // Draw datasheet link or QR Code at the bottom of grey block
  if (opts.pdfType === 'qrcode') {
    drawDatasheetQrCode(
      pdf,
      product,
      contentX + specsOffX,
      cardY + headerH + blockGap + specsOffY,
      specsW,
      specsH,
      opts.imageCache,
      scale
    )
  } else {
    drawDatasheetLink(pdf, product, contentX + specsOffX + specsW - 5, cardY + headerH + blockGap + specsOffY + specsH - 5 * scale, true, opts.forPrint, scale)
  }

  // Draw EX logo if present (positioned above the header banner on the right side)
  const exKey = `ex_${product.id}`
  if (opts.imageCache.has(exKey)) {
    const exW = 14 * scale
    const exX = contentX + headerOffX + headerW - exW - 4 * scale
    const exY = cardY + headerOffY - exW - 3 * scale
    addImageSafe(pdf, opts.imageCache, exKey, exX, exY, exW, exW)
  }

  // Calculate final scale: Global PDF scale × Individual product scale
  const globalScale = (settings.pdf_image_scale !== undefined && settings.pdf_image_scale !== null) ? Number(settings.pdf_image_scale) : 1.0
  const individualScale = (product.imageScale !== undefined && product.imageScale !== null) ? Number(product.imageScale) : ((product.image_scale !== undefined && product.image_scale !== null) ? Number(product.image_scale) : 1.0)
  const finalScale = globalScale * individualScale

  addImageSafe(
    pdf,
    opts.imageCache,
    `product_${product.id}`,
    contentX + 10 + offX,
    imgY + offY,
    contentW - 20,
    imgH - 4,
    finalScale,
    (product.imageOffsetX !== undefined && product.imageOffsetX !== null) ? Number(product.imageOffsetX) : ((product.image_offset_x !== undefined && product.image_offset_x !== null) ? Number(product.image_offset_x) : 0),
    (product.imageOffsetY !== undefined && product.imageOffsetY !== null) ? Number(product.imageOffsetY) : ((product.image_offset_y !== undefined && product.image_offset_y !== null) ? Number(product.image_offset_y) : 0)
  )
}
