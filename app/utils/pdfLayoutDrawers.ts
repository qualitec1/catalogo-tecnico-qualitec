import { 
  dimToMm, 
  setFillRgb, 
  setDrawRgb 
} from './pdfDocUtils'
import { addImageSafe } from './pdfImageLoader'
import { 
  drawColoredHeader, 
  drawSpecsTable, 
  drawDatasheetLink 
} from './pdfDrawHelpers'
import type { BuildOptions } from './pdfDrawHelpers'

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
  const spacing = dimToMm(settings.product_spacing || settings.productSpacing, 4)
  const cardH = products.length === 1 ? contentH : (contentH - spacing) / 2
  const offX = dimToMm(settings.product_image_offset_x || settings.productImageOffsetX, 0)
  const offY = dimToMm(settings.product_image_offset_y || settings.productImageOffsetY, 0)

  const isImageLeft = (settings.image_position || settings.imagePosition) === 'left' ||
                      (settings.card_layout_order || settings.cardLayoutOrder) === 'image-first'

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const cardY = contentY + i * (cardH + spacing)
    const color = opts.getBgColor(product.bgClass, product.category)

    const specsW = 110
    const imgW = contentW - specsW - 6
    const headerH = 18

    const specsX = isImageLeft ? contentX + imgW + 6 : contentX
    const imgX = isImageLeft ? contentX : contentX + specsW + 6

    const specsBg = settings.specs_bg_color || settings.specsBgColor || '#f3f4f6'
    setFillRgb(pdf, specsBg)
    pdf.rect(specsX, cardY, specsW, cardH, 'F')

    drawColoredHeader(pdf, product, specsX, cardY, specsW, headerH, color, settings, false)

    drawSpecsTable(
      pdf,
      product.specs,
      specsX,
      cardY + headerH + 1,
      specsW,
      cardH - headerH - 18,
      settings,
      false,
      product.exImageUrl || product.ex_image_url ? `ex_${product.id}` : null,
      opts.imageCache
    )

    drawDatasheetLink(pdf, product, specsX + specsW - 4, cardY + cardH - 13, true)

    addImageSafe(
      pdf,
      opts.imageCache,
      `product_${product.id}`,
      imgX + offX,
      cardY + 4 + offY,
      imgW,
      cardH - 8,
      product.imageScale !== undefined ? Number(product.imageScale) : 1.0,
      product.imageOffsetX !== undefined ? Number(product.imageOffsetX) : 0,
      product.imageOffsetY !== undefined ? Number(product.imageOffsetY) : 0
    )

    if (i === 0 && products.length > 1) {
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

    const imgCellY = isSpecsFirst ? y + headerH + specsH + 1 : y + 1
    const headerCellY = isSpecsFirst ? y : y + imgH
    const specsCellY = isSpecsFirst ? y + headerH : y + imgH + headerH

    drawColoredHeader(pdf, product, x, headerCellY, cellW, headerH, color, settings, true)

    const specsBg = settings.specs_bg_color || settings.specsBgColor || '#ffffff'
    setFillRgb(pdf, specsBg)
    pdf.rect(x, specsCellY, cellW, specsH, 'F')
    setDrawRgb(pdf, '#e5e7eb')
    pdf.setLineWidth(0.15)
    pdf.rect(x, specsCellY, cellW, specsH, 'S')

    drawSpecsTable(
      pdf,
      product.specs,
      x + 1,
      specsCellY,
      cellW - 2,
      specsH - 17,
      settings,
      true,
      product.exImageUrl || product.ex_image_url ? `ex_${product.id}` : null,
      opts.imageCache
    )

    drawDatasheetLink(pdf, product, x + cellW - 2, specsCellY + specsH - 12.5, true)

    addImageSafe(
      pdf,
      opts.imageCache,
      `product_${product.id}`,
      x + 2 + offX,
      imgCellY + offY,
      cellW - 4,
      imgH - 2,
      product.imageScale !== undefined ? Number(product.imageScale) : 1.0,
      product.imageOffsetX !== undefined ? Number(product.imageOffsetX) : 0,
      product.imageOffsetY !== undefined ? Number(product.imageOffsetY) : 0
    )
  }

  if (products.length > 3) {
    setDrawRgb(pdf, '#9ca3af')
    pdf.setLineWidth(0.15)
    const divY = contentY + (contentH / 2)
    pdf.line(contentX, divY, contentX + contentW, divY)
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
  const color = opts.getBgColor(product.bgClass, product.category)
  const offX = dimToMm(settings.product_image_offset_x || settings.productImageOffsetX, 0)
  const offY = dimToMm(settings.product_image_offset_y || settings.productImageOffsetY, 0)

  const isSpecsFirst = (settings.card_layout_order || settings.cardLayoutOrder) === 'specs-first'

  const imgH = contentH * 0.50
  const cardH = contentH - imgH - 6
  const headerH = 22

  const imgY = isSpecsFirst ? contentY + cardH + 4 : contentY + 2
  const cardY = isSpecsFirst ? contentY : contentY + imgH + 4

  drawColoredHeader(pdf, product, contentX, cardY, contentW, headerH, color, settings, false)

  const specsBg = settings.specs_bg_color || settings.specsBgColor || '#f3f4f6'
  setFillRgb(pdf, specsBg)
  pdf.rect(contentX, cardY + headerH, contentW, cardH - headerH, 'F')

  drawSpecsTable(
    pdf,
    product.specs,
    contentX + 4,
    cardY + headerH,
    contentW - 8,
    cardH - headerH - 18,
    settings,
    false,
    product.exImageUrl || product.ex_image_url ? `ex_${product.id}` : null,
    opts.imageCache
  )

  drawDatasheetLink(pdf, product, contentX + contentW - 5, cardY + cardH - 14, true)

  addImageSafe(
    pdf,
    opts.imageCache,
    `product_${product.id}`,
    contentX + 10 + offX,
    imgY + offY,
    contentW - 20,
    imgH - 4,
    product.imageScale !== undefined ? Number(product.imageScale) : 1.0,
    product.imageOffsetX !== undefined ? Number(product.imageOffsetX) : 0,
    product.imageOffsetY !== undefined ? Number(product.imageOffsetY) : 0
  )
}
