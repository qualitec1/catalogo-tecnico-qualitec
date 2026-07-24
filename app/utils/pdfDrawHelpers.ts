import { 
  dimToMm, 
  setFillRgb, 
  setDrawRgb, 
  setTextRgb, 
  parseFontSizePt, 
  getFontName, 
  getFontStyle, 
  drawTextUnderline, 
  truncateText,
  sanitizePdfText
} from './pdfDocUtils'
import { addImageSafe } from './pdfImageLoader'
import type { CachedImage } from './pdfDocUtils'

// A4 dimensions in mm
const A4_W = 210
const A4_H = 297
const MARGIN_X = 13
const MARGIN_BOTTOM = 8

export interface BuildOptions {
  pages: any[][]
  categoryName: string
  categoryColor: string
  coverImageDataUrl: string | null
  logoDataUrl: string | null
  categoryIconUrl?: string | null
  imageCache: Map<string, CachedImage>
  getPageSettings: (page: any[]) => any
  getBgColor: (bgClass: string | null | undefined, category?: string) => string
  getSlots: (product: any) => number
  forPrint?: boolean
  pdfType?: 'web' | 'print' | 'qrcode'
}

export function getDatasheetLink(product: any): string | null {
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

export function drawDatasheetLink(pdf: any, product: any, x: number, y: number, alignRight: boolean, forPrint: boolean = false, scale: number = 1) {
  // Skip rendering the link if PDF is for print mode
  if (forPrint) return
  
  const linkUrl = getDatasheetLink(product)
  if (!linkUrl) return

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(6.5 * scale)
  pdf.setTextColor(156, 163, 175) // Cinza claro #9CA3AF (gray-400)

  const linkText = 'Especificações Técnicas'
  const textWidth = pdf.getTextWidth(linkText)
  
  const iconW = 2.2 * scale
  const iconH = 2.2 * scale
  const gap = 1.2 * scale
  const totalW = textWidth + gap + iconW
  
  const textX = alignRight ? x - totalW : x
  const textY = y
  const iconX = textX + textWidth + gap
  const iconY = textY - 2.2 * scale // Align bottom of icon tray with text baseline (textY)

  // Draw text
  pdf.text(linkText, textX, textY)
  
  // Draw vector download icon
  pdf.setDrawColor(156, 163, 175)
  pdf.setLineWidth(0.18 * scale)
  
  // Tray
  pdf.line(iconX, iconY + 1.2 * scale, iconX, iconY + 2.2 * scale)
  pdf.line(iconX, iconY + 2.2 * scale, iconX + iconW, iconY + 2.2 * scale)
  pdf.line(iconX + iconW, iconY + 1.2 * scale, iconX + iconW, iconY + 2.2 * scale)
  
  // Arrow
  const centerX = iconX + iconW / 2
  pdf.line(centerX, iconY, centerX, iconY + 1.6 * scale)
  pdf.line(centerX - 0.6 * scale, iconY + 1.0 * scale, centerX, iconY + 1.6 * scale)
  pdf.line(centerX + 0.6 * scale, iconY + 1.0 * scale, centerX, iconY + 1.6 * scale)
  
  // Clickable hotspot in PDF (covers text + icon)
  pdf.link(textX, textY - 2.2 * scale, totalW, 2.8 * scale, { url: linkUrl })
}

export function drawDatasheetQrCode(
  pdf: any,
  product: any,
  x: number,
  y: number,
  w: number,
  h: number,
  imageCache: Map<string, CachedImage>,
  scale: number = 1
) {
  const key = `qrcode_${product.id}`
  const qrImg = imageCache.get(key)
  if (!qrImg) return

  // Determine QR code size based on specs block width
  // If specs block is narrow (layout 6), make QR code smaller (e.g. 11mm)
  // If specs block is wide (layouts 1 & 3), make QR code larger (e.g. 15mm)
  const qrSize = (w < 80 ? 11 : 15) * scale
  
  // Position QR code in the bottom-right corner of the specs block
  // with a small margin of 2mm
  const qrX = x + w - qrSize - 2 * scale
  const qrY = y + h - qrSize - 2 * scale

  try {
    pdf.addImage(qrImg.dataUrl, qrImg.format, qrX, qrY, qrSize, qrSize, undefined, 'FAST')
    
    // Also make the QR code image clickable!
    const linkUrl = getDatasheetLink(product)
    if (linkUrl) {
      pdf.link(qrX, qrY, qrSize, qrSize, { url: linkUrl })
    }
  } catch (e) {
    console.warn(`[pdfBuilder] Could not add QR code for product ${product.id}:`, e)
  }
}

export function drawCoverPage(pdf: any, opts: BuildOptions) {
  const pageW = A4_W
  const pageH = A4_H
  const color = opts.categoryColor

  const settings = opts.getPageSettings([])

  const logoWidth = dimToMm(settings.logo_width || settings.logoWidth, 64)
  const logoHeight = dimToMm(settings.logo_height || settings.logoHeight, 20)
  const posX = dimToMm(settings.logo_position_x || settings.logoPositionX, 16)
  const posY = dimToMm(settings.logo_position_y || settings.logoPositionY, 16)

  const logoX = pageW - logoWidth - posX
  const logoY = posY

  // 1. Logo — top right
  addImageSafe(pdf, opts.imageCache, '__logo__', logoX, logoY, logoWidth, logoHeight)

  // 2. Gray band background
  const bandTop = 143
  const bandBottom = pageH - 21
  setFillRgb(pdf, '#f0f2f5')
  pdf.rect(0, bandTop, pageW, bandBottom - bandTop, 'F')

  // Cover Subtitle settings
  const subText = settings.cover_subtitle_text || settings.coverSubtitleText || 'CATÁLOGO DE PRODUTOS'
  const subFont = getFontName(settings.cover_subtitle_font_family || settings.coverSubtitleFontFamily)
  const subStyle = getFontStyle(settings.cover_subtitle_bold || settings.coverSubtitleBold, settings.cover_subtitle_italic || settings.coverSubtitleItalic)
  const subSize = parseFontSizePt(settings.cover_subtitle_font_size || settings.coverSubtitleFontSize, 8)
  const subColor = settings.cover_subtitle_color || settings.coverSubtitleColor || '#ffffff'
  const subOffX = dimToMm(settings.cover_subtitle_offset_x || settings.coverSubtitleOffsetX, 0)
  const subOffY = dimToMm(settings.cover_subtitle_offset_y || settings.coverSubtitleOffsetY, 0)

  // Cover Title settings
  const titleFont = getFontName(settings.cover_title_font_family || settings.coverTitleFontFamily)
  const titleStyle = getFontStyle(settings.cover_title_bold || settings.coverTitleBold, settings.cover_title_italic || settings.coverTitleItalic)
  const titleSize = parseFontSizePt(settings.cover_title_font_size || settings.coverTitleFontSize, 20)
  const titleColor = settings.cover_title_color || settings.coverTitleColor || '#ffffff'
  const titleOffX = dimToMm(settings.cover_title_offset_x || settings.coverTitleOffsetX, 0)
  const titleOffY = dimToMm(settings.cover_title_offset_y || settings.coverTitleOffsetY, 0)

  // 3. Colored category block
  const blockTop = 117
  const blockW = 146
  const blockH = 58
  setFillRgb(pdf, color)
  pdf.rect(0, blockTop, blockW, blockH, 'F')

  // Text inside block
  const textX = 13
  
  // Render Subtitle
  pdf.setFont(subFont, subStyle)
  pdf.setFontSize(subSize)
  pdf.setTextColor(subColor)
  const subX = textX + subOffX
  const subY = blockTop + 14 + subOffY
  pdf.text(subText, subX, subY)
  if (settings.cover_subtitle_underline || settings.coverSubtitleUnderline) {
    drawTextUnderline(pdf, subText, subX, subY, subSize, subColor, 'left')
  }

  // Render Title
  pdf.setFont(titleFont, titleStyle)
  pdf.setFontSize(titleSize)
  pdf.setTextColor(titleColor)
  const catName = opts.categoryName === 'VÁLVULAS'
    ? 'VÁLVULAS DE SEGURANÇA E ALÍVIO'
    : opts.categoryName.toUpperCase()
  const titleLines = pdf.splitTextToSize(catName, blockW - 26)
  const mainTitleX = textX + titleOffX
  const mainTitleY = blockTop + 24 + titleOffY
  pdf.text(titleLines, mainTitleX, mainTitleY)
  if (settings.cover_title_underline || settings.coverTitleUnderline) {
    let currentY = mainTitleY
    const lineSpacing = titleSize * 0.35 + 0.5
    for (let i = 0; i < titleLines.length; i++) {
      drawTextUnderline(pdf, titleLines[i], mainTitleX, currentY + (i * lineSpacing), titleSize, titleColor, 'left')
    }
  }

  // 4. Cover image — bottom right
  const imgAreaW = 122
  const imgAreaH = 90
  const imgX = pageW - imgAreaW - 11
  const imgY = pageH - imgAreaH - 24
  addImageSafe(pdf, opts.imageCache, '__cover__', imgX, imgY, imgAreaW, imgAreaH)

  // 5. Website footer
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(156, 163, 175)
  const footerY = pageH - 13
  pdf.text('w w w . q u a l i t e c . i n d . b r', 16, footerY)
}

export function drawCoverPageScaled(pdf: any, opts: BuildOptions, offsetX: number, scale: number) {
  const pageW = A4_W
  const pageH = A4_H
  const color = opts.categoryColor

  const settings = opts.getPageSettings([])

  const logoWidth = dimToMm(settings.logo_width || settings.logoWidth, 64) * scale
  const logoHeight = dimToMm(settings.logo_height || settings.logoHeight, 20) * scale
  const posX = dimToMm(settings.logo_position_x || settings.logoPositionX, 16) * scale
  const posY = dimToMm(settings.logo_position_y || settings.logoPositionY, 16) * scale

  const logoX = offsetX + (pageW * scale) - logoWidth - posX
  const logoY = posY

  // 1. Logo — top right
  addImageSafe(pdf, opts.imageCache, '__logo__', logoX, logoY, logoWidth, logoHeight)

  // 2. Gray band background
  const bandTop = 143 * scale
  const bandBottom = (pageH - 21) * scale
  setFillRgb(pdf, '#f0f2f5')
  pdf.rect(offsetX, bandTop, pageW * scale, bandBottom - bandTop, 'F')

  // Cover Subtitle settings
  const subText = settings.cover_subtitle_text || settings.coverSubtitleText || 'CATÁLOGO DE PRODUTOS'
  const subFont = getFontName(settings.cover_subtitle_font_family || settings.coverSubtitleFontFamily)
  const subStyle = getFontStyle(settings.cover_subtitle_bold || settings.coverSubtitleBold, settings.cover_subtitle_italic || settings.coverSubtitleItalic)
  const subSize = parseFontSizePt(settings.cover_subtitle_font_size || settings.coverSubtitleFontSize, 8) * scale
  const subColor = settings.cover_subtitle_color || settings.coverSubtitleColor || '#ffffff'
  const subOffX = dimToMm(settings.cover_subtitle_offset_x || settings.coverSubtitleOffsetX, 0) * scale
  const subOffY = dimToMm(settings.cover_subtitle_offset_y || settings.coverSubtitleOffsetY, 0) * scale

  // Cover Title settings
  const titleFont = getFontName(settings.cover_title_font_family || settings.coverTitleFontFamily)
  const titleStyle = getFontStyle(settings.cover_title_bold || settings.coverTitleBold, settings.cover_title_italic || settings.coverTitleItalic)
  const titleSize = parseFontSizePt(settings.cover_title_font_size || settings.coverTitleFontSize, 20) * scale
  const titleColor = settings.cover_title_color || settings.coverTitleColor || '#ffffff'
  const titleOffX = dimToMm(settings.cover_title_offset_x || settings.coverTitleOffsetX, 0) * scale
  const titleOffY = dimToMm(settings.cover_title_offset_y || settings.coverTitleOffsetY, 0) * scale

  // 3. Colored category block
  const blockTop = 117 * scale
  const blockW = 146 * scale
  const blockH = 58 * scale
  setFillRgb(pdf, color)
  pdf.rect(offsetX, blockTop, blockW, blockH, 'F')

  // Text inside block
  const textX = offsetX + 13 * scale
  
  // Render Subtitle
  pdf.setFont(subFont, subStyle)
  pdf.setFontSize(subSize)
  pdf.setTextColor(subColor)
  const subX = textX + subOffX
  const subY = blockTop + 14 * scale + subOffY
  pdf.text(subText, subX, subY)
  if (settings.cover_subtitle_underline || settings.coverSubtitleUnderline) {
    drawTextUnderline(pdf, subText, subX, subY, subSize, subColor, 'left')
  }

  // Render Title
  pdf.setFont(titleFont, titleStyle)
  pdf.setFontSize(titleSize)
  pdf.setTextColor(titleColor)
  const catName = opts.categoryName === 'VÁLVULAS'
    ? 'VÁLVULAS DE SEGURANÇA E ALÍVIO'
    : opts.categoryName.toUpperCase()
  const titleLines = pdf.splitTextToSize(catName, blockW - 26 * scale)
  const mainTitleX = textX + titleOffX
  const mainTitleY = blockTop + 24 * scale + titleOffY
  pdf.text(titleLines, mainTitleX, mainTitleY)
  if (settings.cover_title_underline || settings.coverTitleUnderline) {
    let currentY = mainTitleY
    const lineSpacing = titleSize * 0.35 + 0.5 * scale
    for (let i = 0; i < titleLines.length; i++) {
      drawTextUnderline(pdf, titleLines[i], mainTitleX, currentY + (i * lineSpacing), titleSize, titleColor, 'left')
    }
  }

  // 4. Cover image — bottom right
  const imgAreaW = 122 * scale
  const imgAreaH = 90 * scale
  const imgX = offsetX + (pageW * scale) - imgAreaW - 11 * scale
  const imgY = (pageH - 90 - 24) * scale
  addImageSafe(pdf, opts.imageCache, '__cover__', imgX, imgY, imgAreaW, imgAreaH)

  // 5. Website footer
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7 * scale)
  pdf.setTextColor(156, 163, 175)
  const footerY = (pageH - 13) * scale
  pdf.text('w w w . q u a l i t e c . i n d . b r', offsetX + 16 * scale, footerY)
}

export function drawCoverPageLandscape(pdf: any, opts: BuildOptions) {
  // Landscape page: 297x210mm
  // Layout adaptado do retrato para paisagem:
  // - Bloco colorido: lado ESQUERDO (~57% largura × ~57% altura)
  // - Banda cinza: parte INFERIOR da página, largura COMPLETA
  // - Logo: canto superior DIREITO
  // - Imagem do produto: dentro da banda cinza, lado DIREITO
  
  const pageW = 297  // Landscape width
  const pageH = 210  // Landscape height
  const color = opts.categoryColor
  const settings = opts.getPageSettings([])

  // 1. Banda cinza - parte INFERIOR, largura COMPLETA (desenhada primeiro, fica atrás do bloco)
  const bandTop = pageH * 0.48  // ~100mm, começa a 48% da altura
  const bandBottom = pageH - 15  // 15mm acima do fundo para o footer
  setFillRgb(pdf, '#f0f2f5')
  pdf.rect(0, bandTop, pageW, bandBottom - bandTop, 'F')

  // 2. Bloco colorido - lado ESQUERDO, mais abaixo e menor altura
  const blockX = 0
  const blockY = 50  // Começa mais abaixo (deslocado do topo)
  const blockW = pageW * 0.50   // ~148.5mm (50% da largura - metade)
  const blockH = 70   // Altura reduzida (~70mm)
  
  setFillRgb(pdf, color)
  pdf.rect(blockX, blockY, blockW, blockH, 'F')

  // 3. Logo - canto superior DIREITO (fora do bloco colorido)
  const logoWidth = dimToMm(settings.logo_width || settings.logoWidth, 64)
  const logoHeight = dimToMm(settings.logo_height || settings.logoHeight, 20)
  const logoPosXFromRight = dimToMm(settings.logo_position_x || settings.logoPositionX, 16)
  const logoPosYFromTop = dimToMm(settings.logo_position_y || settings.logoPositionY, 16)
  
  const logoX = pageW - logoWidth - logoPosXFromRight
  const logoY = logoPosYFromTop

  addImageSafe(pdf, opts.imageCache, '__logo__', logoX, logoY, logoWidth, logoHeight)

  // 4. Textos dentro do bloco colorido (centralizados verticalmente no bloco)
  const subText = settings.cover_subtitle_text || settings.coverSubtitleText || 'CATÁLOGO DE PRODUTOS'
  const subFont = getFontName(settings.cover_subtitle_font_family || settings.coverSubtitleFontFamily)
  const subStyle = getFontStyle(settings.cover_subtitle_bold || settings.coverSubtitleBold, settings.cover_subtitle_italic || settings.coverSubtitleItalic)
  const subSize = parseFontSizePt(settings.cover_subtitle_font_size || settings.coverSubtitleFontSize, 8)
  const subColor = settings.cover_subtitle_color || settings.coverSubtitleColor || '#ffffff'
  const subOffX = dimToMm(settings.cover_subtitle_offset_x || settings.coverSubtitleOffsetX, 0)
  const subOffY = dimToMm(settings.cover_subtitle_offset_y || settings.coverSubtitleOffsetY, 0)

  const titleFont = getFontName(settings.cover_title_font_family || settings.coverTitleFontFamily)
  const titleStyle = getFontStyle(settings.cover_title_bold || settings.coverTitleBold, settings.cover_title_italic || settings.coverTitleItalic)
  const titleSize = parseFontSizePt(settings.cover_title_font_size || settings.coverTitleFontSize, 20)
  const titleColor = settings.cover_title_color || settings.coverTitleColor || '#ffffff'
  const titleOffX = dimToMm(settings.cover_title_offset_x || settings.coverTitleOffsetX, 0)
  const titleOffY = dimToMm(settings.cover_title_offset_y || settings.coverTitleOffsetY, 0)

  const textX = 20  // Margem esquerda dentro do bloco
  
  // Posicionar textos dentro do bloco colorido (coordenadas ABSOLUTAS)
  const subX = blockX + textX + subOffX
  const subY = blockY + 20 + subOffY  // 20mm do topo do bloco
  
  // Render Subtitle
  pdf.setFont(subFont, subStyle)
  pdf.setFontSize(subSize)
  setTextRgb(pdf, subColor)
  pdf.text(subText, subX, subY)
  if (settings.cover_subtitle_underline || settings.coverSubtitleUnderline) {
    drawTextUnderline(pdf, subText, subX, subY, subSize, subColor, 'left')
  }

  // Render Title
  pdf.setFont(titleFont, titleStyle)
  pdf.setFontSize(titleSize)
  setTextRgb(pdf, titleColor)
  const catName = opts.categoryName === 'VÁLVULAS'
    ? 'VÁLVULAS DE SEGURANÇA E ALÍVIO'
    : opts.categoryName.toUpperCase()
  const titleLines = pdf.splitTextToSize(catName, blockW - 40)
  const mainTitleX = blockX + textX + titleOffX
  const mainTitleY = blockY + 40 + titleOffY  // 40mm do topo do bloco (abaixo do subtitle)
  pdf.text(titleLines, mainTitleX, mainTitleY)
  if (settings.cover_title_underline || settings.coverTitleUnderline) {
    let currentY = mainTitleY
    const lineSpacing = titleSize * 0.35 + 0.5
    for (let i = 0; i < titleLines.length; i++) {
      drawTextUnderline(pdf, titleLines[i], mainTitleX, currentY + (i * lineSpacing), titleSize, titleColor, 'left')
    }
  }

  // 5. Imagem do produto — dentro da banda cinza, centralizada na metade DIREITA
  const bandH = bandBottom - bandTop
  const imgAreaW = 90
  const imgAreaH = 90
  const halfPageW = pageW / 2
  const imgX = halfPageW + (halfPageW - imgAreaW) / 2  // Centralizado na metade direita da página
  const imgY = bandTop + (bandH - imgAreaH) / 2        // Centralizado verticalmente na banda cinza
  addImageSafe(pdf, opts.imageCache, '__cover__', imgX, imgY, imgAreaW, imgAreaH)

  // 6. Website footer - canto inferior esquerdo
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(156, 163, 175)
  const footerY = pageH - 10
  pdf.text('w w w . q u a l i t e c . i n d . b r', 20, footerY)
}

export function drawPageHeader(
  pdf: any,
  category: string,
  color: string,
  y: number,
  pageW: number,
  settings: any,
  imageCache?: Map<string, CachedImage>,
  offsetX: number = 0,
  scale: number = 1
): number {
  const fontSize = parseFontSizePt(settings.title_font_size, 22) * scale
  const offsetY = dimToMm(settings.title_position_y || settings.titlePositionY, 0) * scale
  
  const titleColor = settings.title_color || settings.titleColor || color
  const fontName = getFontName(settings.title_font_family || settings.titleFontFamily)
  const fontStyle = getFontStyle(settings.title_bold || settings.titleBold, settings.title_italic || settings.titleItalic)

  setTextRgb(pdf, titleColor)
  pdf.setFont(fontName, fontStyle)
  pdf.setFontSize(fontSize)
  
  const iconSize = (fontSize * 0.45 + 4) * scale
  let textX = offsetX + MARGIN_X * scale

  if (imageCache && imageCache.has('__category_icon__')) {
    const iconY = y + offsetY
    addImageSafe(pdf, imageCache, '__category_icon__', textX, iconY, iconSize, iconSize)
    textX = offsetX + (MARGIN_X + iconSize / scale + 2) * scale
  }

  const textY = y + offsetY + fontSize * 0.35
  const catUpper = category.toUpperCase()
  
  pdf.text(catUpper, textX, textY)

  // Draw underline manually if configured
  if (settings.title_underline || settings.titleUnderline) {
    const textWidth = pdf.getTextWidth(catUpper)
    setDrawRgb(pdf, titleColor)
    pdf.setLineWidth(0.2 * scale)
    const lineY = textY + 0.8 * scale
    pdf.line(textX, lineY, textX + textWidth, lineY)
  }

  return y + offsetY + fontSize * 0.45 + 4 * scale
}

export function drawPageFooter(pdf: any, pageNum: number, totalPages: number, pageW: number, pageH: number, offsetX: number = 0, scale: number = 1) {
  const textY = pageH - 6 * scale
  const marginFromEdge = 5 * scale
  
  // Desenhar número da página: esquerda se ímpar, direita se par
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12 * scale)
  pdf.setTextColor(180, 180, 180)
  
  const pageText = String(pageNum).padStart(2, '0')
  const pageTextWidth = pdf.getTextWidth(pageText)
  
  const pageTextX = pageNum % 2 === 1 
    ? offsetX + marginFromEdge
    : offsetX + pageW - pageTextWidth - marginFromEdge
  
  // Desenhar linha cinza acima do número
  const lineY = textY - 5 * scale
  const lineLength = 15 * scale
  const lineX = pageNum % 2 === 1
    ? offsetX + marginFromEdge
    : offsetX + pageW - lineLength - marginFromEdge
  
  pdf.setDrawColor(180, 180, 180)
  pdf.setLineWidth(0.1 * scale)
  pdf.line(lineX, lineY, lineX + lineLength, lineY)
  
  // Desenhar o número da página
  pdf.text(pageText, pageTextX, textY)
  
  // Adicionar email (ímpares) ou site (pares) no lado oposto
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9 * scale)
  pdf.setTextColor(180, 180, 180)
  
  if (pageNum % 2 === 1) {
    // Página ímpar: email à direita
    const emailText = 'v e n d a s @ q u a l i t e c . i n d . b r'
    const emailWidth = pdf.getTextWidth(emailText)
    pdf.text(emailText, offsetX + pageW - emailWidth - marginFromEdge, textY)
  } else {
    // Página par: site à esquerda
    const siteText = 'w w w . q u a l i t e c . i n d . b r'
    pdf.text(siteText, offsetX + marginFromEdge, textY)
  }
}

export function drawSpecsTable(
  pdf: any,
  specs: { label: string; value: string }[],
  x: number,
  y: number,
  w: number,
  maxH: number,
  settings: any,
  compact: boolean,
  exImageKey: string | null = null,
  imageCache: Map<string, CachedImage> | null = null,
  hasExImage: boolean = false
): number {
  if (!specs || specs.length === 0) return y

  let labelPct = 0.45
  let valuePct = 0.55

  if (settings) {
    const sLabelWidth = settings.specs_label_width || settings.specsLabelWidth
    const sValueWidth = settings.specs_value_width || settings.specsValueWidth

    if (sLabelWidth) {
      const parsedLabel = parseFloat(sLabelWidth)
      if (!isNaN(parsedLabel)) {
        labelPct = parsedLabel > 1 ? parsedLabel / 100 : parsedLabel
      }
    }
    
    if (sValueWidth) {
      const parsedValue = parseFloat(sValueWidth)
      if (!isNaN(parsedValue)) {
        valuePct = parsedValue > 1 ? parsedValue / 100 : parsedValue
      }
    }
  }

  const labelW = w * labelPct
  const valueW = w * valuePct
  const lineEndX = x + Math.min(w, labelW + valueW)

  const rowPad = compact ? 1.2 : 2.0
  const fontSize = compact ? 6 : 7.5
  const lineSpacing = fontSize * 0.35 + 0.5
  const lineColor = settings.specs_line_color || '#cbd5e1'
  const lineStyle = settings.specs_line_style || 'dashed'

  const hasExLogo = false
  const exW = compact ? 8 : 12

  pdf.setFontSize(fontSize)
  let curY = y + rowPad

  if (hasExLogo) {
    const exX = x + w - exW - 1
    const exY = y + rowPad
    addImageSafe(pdf, imageCache!, exImageKey!, exX, exY, exW, exW)
  }

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]
    const currentSpecsValW = hasExLogo ? (valueW - exW - 1) : (valueW - 2)

    const labelText = sanitizePdfText(spec.label)
    const valueText = sanitizePdfText(spec.value)

    const labelLines = pdf.splitTextToSize(labelText, labelW - 2) as string[]
    const valueLines = pdf.splitTextToSize(valueText, currentSpecsValW) as string[]
    const numLines = Math.max(labelLines.length, valueLines.length)
    
    const rowHeight = (numLines - 1) * lineSpacing + 2.5
    if (curY + rowHeight + rowPad > y + maxH) break

    const labelFont = getFontName(settings.specs_font_family || settings.specsFontFamily)
    const labelStyle = getFontStyle(settings.specs_bold || settings.specsBold, settings.specs_italic || settings.specsItalic)
    pdf.setFont(labelFont, labelStyle)
    const sColor = settings.specs_color || settings.specsColor || '#6b7280'
    pdf.setTextColor(sColor)
    for (let idx = 0; idx < labelLines.length; idx++) {
      const lineY = curY + 2.5 + idx * lineSpacing
      pdf.text(labelLines[idx], x + 1, lineY)
      if (settings.specs_underline || settings.specsUnderline) {
        drawTextUnderline(pdf, labelLines[idx], x + 1, lineY, fontSize, sColor, 'left')
      }
    }

    const valFont = getFontName(settings.specs_font_family || settings.specsFontFamily)
    const valStyle = getFontStyle(settings.specs_val_bold || settings.specsValBold, settings.specs_val_italic || settings.specsValItalic)
    pdf.setFont(valFont, valStyle)
    const sValColor = settings.specs_val_color || settings.specsValColor || '#111827'
    pdf.setTextColor(sValColor)
    for (let idx = 0; idx < valueLines.length; idx++) {
      const lineY = curY + 2.5 + idx * lineSpacing
      pdf.text(valueLines[idx], x + labelW + 1, lineY)
      if (settings.specs_val_underline || settings.specsValUnderline) {
        drawTextUnderline(pdf, valueLines[idx], x + labelW + 1, lineY, fontSize, sValColor, 'left')
      }
    }

    curY += rowHeight + rowPad * 2

    // Desenhar linhas normalmente (não apagar se tiver imagem EX)
    if (i < specs.length - 1 && lineStyle !== 'none') {
      setDrawRgb(pdf, lineColor)
      pdf.setLineWidth(0.15)
      
      if (lineStyle === 'dashed') {
        const dashLen = 1.5
        const gapLen = 1.0
        let dx = x
        while (dx < lineEndX) {
          pdf.line(dx, curY - rowPad, Math.min(dx + dashLen, lineEndX), curY - rowPad)
          dx += dashLen + gapLen
        }
      } else if (lineStyle === 'dotted') {
        const dotGap = 0.8
        let dx = x
        while (dx < lineEndX) {
          pdf.line(dx, curY - rowPad, dx + 0.1, curY - rowPad)
          dx += dotGap
        }
      } else {
        pdf.line(x, curY - rowPad, lineEndX, curY - rowPad)
      }
    }
  }

  return curY
}

export function drawColoredHeader(
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
  setFillRgb(pdf, color)
  pdf.rect(x, y, w, h, 'F')

  pdf.setTextColor(255, 255, 255)

  const titleFont = getFontName(settings.card_title_font_family || settings.cardTitleFontFamily)
  const titleStyle = getFontStyle(settings.card_title_bold || settings.cardTitleBold, settings.card_title_italic || settings.cardTitleItalic)
  
  const modelFont = getFontName(settings.card_model_font_family || settings.cardModelFontFamily)
  const modelStyle = getFontStyle(settings.card_model_bold || settings.cardModelBold, settings.card_model_italic || settings.cardModelItalic)
  
  const tagFont = getFontName(settings.tag_font_family || settings.tagFontFamily)
  const tagStyle = getFontStyle(settings.tag_bold || settings.tagBold, settings.tag_italic || settings.tagItalic)
  const tagSize = parseFontSizePt(settings.tag_font_size || settings.tagFontSize, 6)

  const modelLabelFont = getFontName(settings.card_model_label_font_family || settings.cardModelLabelFontFamily || settings.card_model_font_family || settings.cardModelFontFamily)
  const modelLabelStyle = getFontStyle(settings.card_model_label_bold || settings.cardModelLabelBold, settings.card_model_label_italic || settings.cardModelLabelItalic)
  const modelLabelSize = parseFontSizePt(settings.card_model_label_font_size || settings.cardModelLabelFontSize, compact ? 5.33 : 7.33)
  const modelLabelText: string = settings.card_model_label_text || settings.cardModelLabelText || 'Modelo'

  const titleOffX = dimToMm(settings.card_title_offset_x || settings.cardTitleOffsetX, 0)
  const titleOffY = dimToMm(settings.card_title_offset_y || settings.cardTitleOffsetY, 0)
  const modelOffX = dimToMm(settings.card_model_offset_x || settings.cardModelOffsetX, 0)
  const modelOffY = dimToMm(settings.card_model_offset_y || settings.cardModelOffsetY, 0)
  const modelLabelOffX = dimToMm(settings.card_model_label_offset_x || settings.cardModelLabelOffsetX, 0)
  const modelLabelOffY = dimToMm(settings.card_model_label_offset_y || settings.cardModelLabelOffsetY, 0)
  const tagOffX = dimToMm(settings.tag_offset_x || settings.tagOffsetX, 0)
  const tagOffY = dimToMm(settings.tag_offset_y || settings.tagOffsetY, 0)

  const titleColorHex = settings.card_title_color || settings.cardTitleColor || '#ffffff'
  const modelColorHex = settings.card_model_color || settings.cardModelColor || '#ffffff'
  const modelLabelColorHex = settings.card_model_label_color || settings.cardModelLabelColor || '#ffffff'
  const tagColorHex = settings.tag_color || settings.tagColor || '#ffffff'

  const isModelRight = (settings.card_header_layout || settings.cardHeaderLayout) === 'model-right'

  if (compact) {
    if (isModelRight) {
      pdf.setFont(modelLabelFont, modelLabelStyle)
      pdf.setFontSize(modelLabelSize)
      pdf.setTextColor(modelLabelColorHex)
      pdf.text(modelLabelText, x + 3 + modelOffX + modelLabelOffX, y + 4 + modelOffY + modelLabelOffY)
      if (settings.card_model_label_underline || settings.cardModelLabelUnderline) {
        drawTextUnderline(pdf, modelLabelText, x + 3 + modelOffX + modelLabelOffX, y + 4 + modelOffY + modelLabelOffY, modelLabelSize, modelLabelColorHex, 'left')
      }
      
      pdf.setFont(modelFont, modelStyle)
      const modelSize = parseFontSizePt(settings.card_model_font_size || settings.cardModelFontSize, 14)
      pdf.setFontSize(modelSize)
      pdf.setTextColor(modelColorHex)
      pdf.text(product.nameCode || product.name_code || '', x + 3 + modelOffX, y + 8.5 + modelOffY)
      if (settings.card_model_underline || settings.cardModelUnderline) {
        drawTextUnderline(pdf, product.nameCode || product.name_code || '', x + 3 + modelOffX, y + 8.5 + modelOffY, modelSize, modelColorHex, 'left')
      }

      if (product.tag) {
        pdf.setFont(tagFont, tagStyle)
        pdf.setFontSize(tagSize)
        pdf.setTextColor(tagColorHex)
        pdf.text(product.tag, x + w - 3 + tagOffX, y + 4.5 + tagOffY, { align: 'right' })
        if (settings.tag_underline || settings.tagUnderline) {
          drawTextUnderline(pdf, product.tag, x + w - 3 + tagOffX, y + 4.5 + tagOffY, tagSize, tagColorHex, 'right')
        }
      }

      pdf.setFont(titleFont, titleStyle)
      const tSize1 = parseFontSizePt(settings.card_title_font_size || settings.cardTitleFontSize, 5)
      pdf.setFontSize(tSize1)
      pdf.setTextColor(titleColorHex)
      const titleLines1: string[] = pdf.splitTextToSize(product.title || '', w - 6)
      const titleDisplay1 = titleLines1.slice(0, 2) // max 2 lines
      const lineH1 = tSize1 * 0.352 // pt -> mm
      const titleStartY1 = y + 8 + titleOffY - (titleDisplay1.length - 1) * lineH1
      titleDisplay1.forEach((line: string, i: number) => {
        pdf.text(line, x + w - 3 + titleOffX, titleStartY1 + i * lineH1, { align: 'right' })
      })
      if (settings.card_title_underline || settings.cardTitleUnderline) {
        drawTextUnderline(pdf, titleDisplay1[0] || '', x + w - 3 + titleOffX, titleStartY1, tSize1, titleColorHex, 'right')
      }
    } else {
      const modelSize2 = parseFontSizePt(settings.card_model_font_size || settings.cardModelFontSize, 14)
      if (product.tag) {
        pdf.setFont(tagFont, tagStyle)
        pdf.setFontSize(tagSize)
        pdf.setTextColor(tagColorHex)
        pdf.text(product.tag, x + 3 + tagOffX, y + 4.5 + tagOffY)
        if (settings.tag_underline || settings.tagUnderline) {
          drawTextUnderline(pdf, product.tag, x + 3 + tagOffX, y + 4.5 + tagOffY, tagSize, tagColorHex, 'left')
        }
      }

      pdf.setFont(titleFont, titleStyle)
      const tSize2 = parseFontSizePt(settings.card_title_font_size || settings.cardTitleFontSize, 5)
      pdf.setFontSize(tSize2)
      pdf.setTextColor(titleColorHex)
      const titleLines2: string[] = pdf.splitTextToSize(product.title || '', w - 6)
      const titleDisplay2 = titleLines2.slice(0, 2) // max 2 lines
      const lineH2 = tSize2 * 0.352 // pt -> mm
      const titleStartY2 = y + 8 + titleOffY - (titleDisplay2.length - 1) * lineH2
      titleDisplay2.forEach((line: string, i: number) => {
        pdf.text(line, x + 3 + titleOffX, titleStartY2 + i * lineH2)
      })
      if (settings.card_title_underline || settings.cardTitleUnderline) {
        drawTextUnderline(pdf, titleDisplay2[0] || '', x + 3 + titleOffX, titleStartY2, tSize2, titleColorHex, 'left')
      }

      pdf.setFont(modelLabelFont, modelLabelStyle)
      pdf.setFontSize(modelLabelSize)
      pdf.setTextColor(modelLabelColorHex)
      pdf.text(modelLabelText, x + w - 3 + modelOffX + modelLabelOffX, y + 4 + modelOffY + modelLabelOffY, { align: 'right' })
      if (settings.card_model_label_underline || settings.cardModelLabelUnderline) {
        drawTextUnderline(pdf, modelLabelText, x + w - 3 + modelOffX + modelLabelOffX, y + 4 + modelOffY + modelLabelOffY, modelLabelSize, modelLabelColorHex, 'right')
      }
      
      pdf.setFont(modelFont, modelStyle)
      pdf.setFontSize(modelSize2)
      pdf.setTextColor(modelColorHex)
      pdf.text(product.nameCode || product.name_code || '', x + w - 3 + modelOffX, y + 8.5 + modelOffY, { align: 'right' })
      if (settings.card_model_underline || settings.cardModelUnderline) {
        drawTextUnderline(pdf, product.nameCode || product.name_code || '', x + w - 3 + modelOffX, y + 8.5 + modelOffY, modelSize2, modelColorHex, 'right')
      }
    }
  } else {
    const modelSize = parseFontSizePt(settings.card_model_font_size || settings.cardModelFontSize, 16)

    if (isModelRight) {
      if (product.tag) {
        pdf.setFont(tagFont, tagStyle)
        pdf.setFontSize(tagSize)
        pdf.setTextColor(tagColorHex)
        pdf.text(product.tag, x + 3 + tagOffX, y + 5 + tagOffY)
        if (settings.tag_underline || settings.tagUnderline) {
          drawTextUnderline(pdf, product.tag, x + 3 + tagOffX, y + 5 + tagOffY, tagSize, tagColorHex, 'left')
        }
      }

      pdf.setFont(modelLabelFont, modelLabelStyle)
      pdf.setFontSize(modelLabelSize)
      pdf.setTextColor(modelLabelColorHex)
      pdf.text(modelLabelText.toUpperCase(), x + w - 3 + modelOffX + modelLabelOffX, y + 5 + modelOffY + modelLabelOffY, { align: 'right' })
      if (settings.card_model_label_underline || settings.cardModelLabelUnderline) {
        drawTextUnderline(pdf, modelLabelText.toUpperCase(), x + w - 3 + modelOffX + modelLabelOffX, y + 5 + modelOffY + modelLabelOffY, modelLabelSize, modelLabelColorHex, 'right')
      }

      pdf.setFont(modelFont, modelStyle)
      pdf.setFontSize(modelSize)
      pdf.setTextColor(modelColorHex)
      pdf.text(product.nameCode || product.name_code || '', x + w - 3 + modelOffX, y + 5 + modelSize * 0.45 + modelOffY, { align: 'right' })
      if (settings.card_model_underline || settings.cardModelUnderline) {
        drawTextUnderline(pdf, product.nameCode || product.name_code || '', x + w - 3 + modelOffX, y + 5 + modelSize * 0.45 + modelOffY, modelSize, modelColorHex, 'right')
      }
    } else {
      pdf.setFont(modelLabelFont, modelLabelStyle)
      pdf.setFontSize(modelLabelSize)
      pdf.setTextColor(modelLabelColorHex)
      pdf.text(modelLabelText.toUpperCase(), x + 3 + modelOffX + modelLabelOffX, y + 5 + modelOffY + modelLabelOffY)
      if (settings.card_model_label_underline || settings.cardModelLabelUnderline) {
        drawTextUnderline(pdf, modelLabelText.toUpperCase(), x + 3 + modelOffX + modelLabelOffX, y + 5 + modelOffY + modelLabelOffY, modelLabelSize, modelLabelColorHex, 'left')
      }

      pdf.setFont(modelFont, modelStyle)
      pdf.setFontSize(modelSize)
      pdf.setTextColor(modelColorHex)
      pdf.text(product.nameCode || product.name_code || '', x + 3 + modelOffX, y + 5 + modelSize * 0.45 + modelOffY)
      if (settings.card_model_underline || settings.cardModelUnderline) {
        drawTextUnderline(pdf, product.nameCode || product.name_code || '', x + 3 + modelOffX, y + 5 + modelSize * 0.45 + modelOffY, modelSize, modelColorHex, 'left')
      }

      if (product.tag) {
        pdf.setFont(tagFont, tagStyle)
        pdf.setFontSize(tagSize)
        pdf.setTextColor(tagColorHex)
        pdf.text(product.tag, x + w - 3 + tagOffX, y + 5 + tagOffY, { align: 'right' })
        if (settings.tag_underline || settings.tagUnderline) {
          drawTextUnderline(pdf, product.tag, x + w - 3 + tagOffX, y + 5 + tagOffY, tagSize, tagColorHex, 'right')
        }
      }
    }

    pdf.setFont(titleFont, titleStyle)
    const tSize3 = parseFontSizePt(settings.card_title_font_size || settings.cardTitleFontSize, 8)
    pdf.setFontSize(tSize3)
    pdf.setTextColor(titleColorHex)
    const titleText = truncateText(pdf, product.title || '', w - 8)
    pdf.text(titleText, x + 3 + titleOffX, y + h - 3 + titleOffY)
    if (settings.card_title_underline || settings.cardTitleUnderline) {
      drawTextUnderline(pdf, titleText, x + 3 + titleOffX, y + h - 3 + titleOffY, tSize3, titleColorHex, 'left')
    }
  }
}
