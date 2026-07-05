import { 
  dimToMm, 
  setFillRgb, 
  setDrawRgb, 
  setTextRgb, 
  parseFontSizePt, 
  getFontName, 
  getFontStyle, 
  drawTextUnderline, 
  truncateText 
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
  isLandscape: boolean
  categoryName: string
  categoryColor: string
  coverImageDataUrl: string | null
  logoDataUrl: string | null
  categoryIconUrl?: string | null
  imageCache: Map<string, CachedImage>
  getPageSettings: (page: any[]) => any
  getBgColor: (bgClass: string | null | undefined, category?: string) => string
  getSlots: (product: any) => number
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

export function drawDatasheetLink(pdf: any, product: any, x: number, y: number, alignRight: boolean) {
  const linkUrl = getDatasheetLink(product)
  if (!linkUrl) return

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(6.5)
  pdf.setTextColor(37, 99, 235) // blue-600

  const linkText = 'Baixar Ficha Técnica'
  const textWidth = pdf.getTextWidth(linkText)
  
  const textX = alignRight ? x - textWidth : x
  const textY = y

  pdf.text(linkText, textX, textY)
  
  // Underline
  pdf.setDrawColor(37, 99, 235)
  pdf.setLineWidth(0.12)
  pdf.line(textX, textY + 0.5, textX + textWidth, textY + 0.5)

  // Clickable hotspot in PDF
  pdf.link(textX, textY - 2.2, textWidth, 2.8, { url: linkUrl })
}

export function drawCoverPage(pdf: any, opts: BuildOptions) {
  const pageW = opts.isLandscape ? A4_H : A4_W
  const pageH = opts.isLandscape ? A4_W : A4_H
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
  const bandTop = opts.isLandscape ? 98 : 143
  const bandBottom = opts.isLandscape ? pageH - 16 : pageH - 21
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
  const blockTop = opts.isLandscape ? 74 : 117
  const blockW = opts.isLandscape ? 160 : 146
  const blockH = opts.isLandscape ? 50 : 58
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

export function drawPageHeader(
  pdf: any,
  category: string,
  color: string,
  y: number,
  pageW: number,
  settings: any,
  imageCache?: Map<string, CachedImage>,
  badgeText?: string | null,
  badgeIconUrl?: string | null
): number {
  const fontSize = parseFontSizePt(settings.title_font_size, 22)
  const offsetY = dimToMm(settings.title_position_y || settings.titlePositionY, 0)
  
  const titleColor = settings.title_color || settings.titleColor || color
  const fontName = getFontName(settings.title_font_family || settings.titleFontFamily)
  const fontStyle = getFontStyle(settings.title_bold || settings.titleBold, settings.title_italic || settings.titleItalic)

  // 1. Draw badge above the category title if defined
  let badgeOffsetY = 0
  const catKey = category.toUpperCase().trim()
  const badgeIconKey = `badge_icon_${catKey}`
  const hasBadgeIcon = imageCache && (imageCache.has(badgeIconKey) || imageCache.has('__badge_icon__'))

  if (badgeText || hasBadgeIcon) {
    const badgeOffX = dimToMm(settings.badge_position_x || settings.badgePositionX, 0)
    const badgeOffY = dimToMm(settings.badge_position_y || settings.badgePositionY, 0)
    const baseBadgeY = y + offsetY + badgeOffY
    const baseBadgeX = MARGIN_X + badgeOffX

    const badgeIconSize = dimToMm(settings.badge_icon_size || settings.badgeIconSize, 4.5)
    const badgeFont = getFontName(settings.badge_font_family || settings.badgeFontFamily)
    const badgeSize = parseFontSizePt(settings.badge_font_size || settings.badgeFontSize, 8)
    const badgeColor = settings.badge_color || settings.badgeColor || '#334155'

    // Individual offsets for icon and text
    const iconOffX = dimToMm(settings.badge_icon_offset_x || settings.badgeIconOffsetX, 0)
    const iconOffY = dimToMm(settings.badge_icon_offset_y || settings.badgeIconOffsetY, 0)
    const textOffX = dimToMm(settings.badge_text_offset_x || settings.badgeTextOffsetX, 0)
    const textOffY = dimToMm(settings.badge_text_offset_y || settings.badgeTextOffsetY, 0)

    // Track where text starts (after icon)
    let textStartX = baseBadgeX

    // Draw badge icon if present in imageCache
    if (imageCache) {
      const activeIconKey = imageCache.has(badgeIconKey) ? badgeIconKey : (imageCache.has('__badge_icon__') ? '__badge_icon__' : null)
      if (activeIconKey) {
        const iconDrawX = baseBadgeX + iconOffX
        const iconDrawY = baseBadgeY - badgeIconSize + 0.7 + iconOffY
        addImageSafe(pdf, imageCache, activeIconKey, iconDrawX, iconDrawY, badgeIconSize, badgeIconSize)
        textStartX = baseBadgeX + badgeIconSize + 2
      }
    }

    // Draw badge text if present
    if (badgeText) {
      pdf.setFont(badgeFont, 'normal')
      pdf.setFontSize(badgeSize)
      setTextRgb(pdf, badgeColor)
      pdf.text(badgeText, textStartX + textOffX, baseBadgeY - 0.5 + textOffY)
    }

    badgeOffsetY = 8 // shift main title down by 8mm
  }

  // 2. Draw category icon and main category title
  setTextRgb(pdf, titleColor)
  pdf.setFont(fontName, fontStyle)
  pdf.setFontSize(fontSize)
  
  const iconSize = fontSize * 0.45 + 4  // roughly matches title height
  let textX = MARGIN_X

  if (imageCache && imageCache.has('__category_icon__')) {
    const iconY = y + offsetY + badgeOffsetY
    addImageSafe(pdf, imageCache, '__category_icon__', textX, iconY, iconSize, iconSize)
    textX = MARGIN_X + iconSize + 2
  }

  const textY = y + offsetY + badgeOffsetY + fontSize * 0.35
  const catUpper = category.toUpperCase()
  
  pdf.text(catUpper, textX, textY)

  // Draw underline manually if configured
  if (settings.title_underline || settings.titleUnderline) {
    const textWidth = pdf.getTextWidth(catUpper)
    setDrawRgb(pdf, titleColor)
    pdf.setLineWidth(0.2)
    const lineY = textY + 0.8
    pdf.line(textX, lineY, textX + textWidth, lineY)
  }

  return y + offsetY + badgeOffsetY + fontSize * 0.45 + 4
}

export function drawPageFooter(pdf: any, pageNum: number, totalPages: number, pageW: number, pageH: number) {
  // Page footer information and divider line disabled at the user's request
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
  imageCache: Map<string, CachedImage> | null = null
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

  const hasExLogo = exImageKey && imageCache && imageCache.has(exImageKey)
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

    const labelLines = pdf.splitTextToSize(spec.label || '', labelW - 2) as string[]
    const valueLines = pdf.splitTextToSize(spec.value || '', currentSpecsValW) as string[]
    const numLines = Math.max(labelLines.length, valueLines.length)
    
    const rowHeight = (numLines - 1) * lineSpacing + 2.5
    if (curY + rowHeight + rowPad > y + maxH) break

    const labelFont = getFontName(settings.specs_font_family || settings.specsFontFamily)
    const labelStyle = getFontStyle(settings.specs_bold || settings.specsBold, settings.specs_italic || settings.specsItalic)
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
      pdf.text(product.nameCode || '', x + 3 + modelOffX, y + 8.5 + modelOffY)
      if (settings.card_model_underline || settings.cardModelUnderline) {
        drawTextUnderline(pdf, product.nameCode || '', x + 3 + modelOffX, y + 8.5 + modelOffY, modelSize, modelColorHex, 'left')
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
      
      // Calculate maximum allowed title width dynamically to prevent unnecessary truncation
      pdf.setFont(modelFont, modelStyle)
      pdf.setFontSize(modelSize)
      const mWidth = pdf.getTextWidth(product.nameCode || '')
      pdf.setFont(modelLabelFont, modelLabelStyle)
      pdf.setFontSize(modelLabelSize)
      const lWidth = pdf.getTextWidth(modelLabelText)
      const maxTitleW = Math.max(w - Math.max(mWidth, lWidth) - 8, 20)
      
      pdf.setFont(titleFont, titleStyle)
      pdf.setFontSize(tSize1)
      const title = truncateText(pdf, product.title || '', maxTitleW)
      pdf.text(title, x + w - 3 + titleOffX, y + 8 + titleOffY, { align: 'right' })
      if (settings.card_title_underline || settings.cardTitleUnderline) {
        drawTextUnderline(pdf, title, x + w - 3 + titleOffX, y + 8 + titleOffY, tSize1, titleColorHex, 'right')
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
      
      // Calculate maximum allowed title width dynamically to prevent unnecessary truncation
      pdf.setFont(modelFont, modelStyle)
      pdf.setFontSize(modelSize2)
      const mWidth2 = pdf.getTextWidth(product.nameCode || '')
      pdf.setFont(modelLabelFont, modelLabelStyle)
      pdf.setFontSize(modelLabelSize)
      const lWidth2 = pdf.getTextWidth(modelLabelText)
      const maxTitleW2 = Math.max(w - Math.max(mWidth2, lWidth2) - 8, 20)
      
      pdf.setFont(titleFont, titleStyle)
      pdf.setFontSize(tSize2)
      const title2 = truncateText(pdf, product.title || '', maxTitleW2)
      pdf.text(title2, x + 3 + titleOffX, y + 8 + titleOffY)
      if (settings.card_title_underline || settings.cardTitleUnderline) {
        drawTextUnderline(pdf, title2, x + 3 + titleOffX, y + 8 + titleOffY, tSize2, titleColorHex, 'left')
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
      pdf.text(product.nameCode || '', x + w - 3 + modelOffX, y + 8.5 + modelOffY, { align: 'right' })
      if (settings.card_model_underline || settings.cardModelUnderline) {
        drawTextUnderline(pdf, product.nameCode || '', x + w - 3 + modelOffX, y + 8.5 + modelOffY, modelSize2, modelColorHex, 'right')
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
      pdf.text(product.nameCode || '', x + w - 3 + modelOffX, y + 5 + modelSize * 0.45 + modelOffY, { align: 'right' })
      if (settings.card_model_underline || settings.cardModelUnderline) {
        drawTextUnderline(pdf, product.nameCode || '', x + w - 3 + modelOffX, y + 5 + modelSize * 0.45 + modelOffY, modelSize, modelColorHex, 'right')
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
      pdf.text(product.nameCode || '', x + 3 + modelOffX, y + 5 + modelSize * 0.45 + modelOffY)
      if (settings.card_model_underline || settings.cardModelUnderline) {
        drawTextUnderline(pdf, product.nameCode || '', x + 3 + modelOffX, y + 5 + modelSize * 0.45 + modelOffY, modelSize, modelColorHex, 'left')
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
