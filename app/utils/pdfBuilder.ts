/**
 * pdfBuilder.ts — Construtor programático de catálogo PDF via jsPDF
 */

import { drawCoverPage, drawPageHeader, drawPageFooter } from './pdfDrawHelpers'
import { drawLayout1, drawLayout3, drawLayout6, drawLayout8 } from './pdfLayoutDrawers'
import { getFontName } from './pdfDocUtils'

// Re-export types and functions to preserve API contract
export type { CachedImage } from './pdfDocUtils'
export type { BuildOptions } from './pdfDrawHelpers'
export { preloadAllImages } from './pdfImageLoader'

// Margin and dimension constants
const MARGIN_X = 13
const MARGIN_TOP = 8
const A4_W = 210
const A4_H = 297

async function registerFont(pdf: any, name: string, file: string, fontName: string, fontStyle: string) {
  try {
    const response = await fetch(`/api/font?name=${file}`)
    if (!response.ok) {
      console.warn(`[pdfBuilder] Failed to fetch font /api/font?name=${file} (status ${response.status})`)
      return
    }
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength < 1000) {
      console.warn(`[pdfBuilder] Font ${file} is suspiciously small (${buffer.byteLength} bytes), skipping`)
      return
    }
    // Validate TTF magic bytes (00010000 or 'true')
    const view = new DataView(buffer)
    const magic = view.getUint32(0)
    if (magic !== 0x00010000 && magic !== 0x74727565 && magic !== 0x4F54544F) {
      console.warn(`[pdfBuilder] Font ${file} is not a valid TTF file (magic: ${magic.toString(16)}), skipping`)
      return
    }
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    const chunk_size = 0x8000
    for (let i = 0; i < len; i += chunk_size) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk_size) as any)
    }
    const base64 = window.btoa(binary)
    pdf.addFileToVFS(`${file}`, base64)
    pdf.addFont(`${file}`, fontName, fontStyle)
  } catch (err) {
    console.error(`[pdfBuilder] Error registering font ${file}:`, err)
  }
}

export async function buildCatalogPdf(opts: any): Promise<any> {
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

  // Register custom fonts dynamically based on what is actually used
  if (typeof window !== 'undefined') {
    const fontsToLoad = new Set<string>()

    const addFamily = (fam: any) => {
      if (typeof fam === 'string' && fam.trim()) {
        const norm = getFontName(fam)
        // Skip built-in jsPDF fonts
        if (norm && norm !== 'helvetica' && norm !== 'courier' && norm !== 'times') {
          fontsToLoad.add(norm)
        }
      }
    }

    // 1. Cover settings
    const coverSettings = opts.getPageSettings([])
    if (coverSettings) {
      addFamily(coverSettings.cover_title_font_family)
      addFamily(coverSettings.coverTitleFontFamily)
      addFamily(coverSettings.cover_subtitle_font_family)
      addFamily(coverSettings.coverSubtitleFontFamily)
    }

    // 2. Pages settings
    for (const page of opts.pages) {
      if (page.length === 0) continue
      const settings = opts.getPageSettings(page)
      if (settings) {
        addFamily(settings.title_font_family)
        addFamily(settings.titleFontFamily)
        addFamily(settings.card_title_font_family)
        addFamily(settings.cardTitleFontFamily)
        addFamily(settings.card_model_font_family)
        addFamily(settings.cardModelFontFamily)
        addFamily(settings.card_model_label_font_family)
        addFamily(settings.cardModelLabelFontFamily)
        addFamily(settings.tag_font_family)
        addFamily(settings.tagFontFamily)
        addFamily(settings.specs_font_family)
        addFamily(settings.specsFontFamily)
      }
    }

    const FONT_REGISTRY: Record<string, { file: string; style: string }[]> = {
      'Verdana': [
        { file: 'verdana.ttf', style: 'normal' },
        { file: 'verdanab.ttf', style: 'bold' },
        { file: 'verdanai.ttf', style: 'italic' },
        { file: 'verdanaz.ttf', style: 'bolditalic' }
      ],
      'Calibri': [
        { file: 'calibri.ttf', style: 'normal' },
        { file: 'calibrib.ttf', style: 'bold' },
        { file: 'calibrii.ttf', style: 'italic' },
        { file: 'calibriz.ttf', style: 'bolditalic' }
      ],
      'Roboto': [
        { file: 'roboto.ttf', style: 'normal' },
        { file: 'robotob.ttf', style: 'bold' },
        { file: 'robotoi.ttf', style: 'italic' },
        { file: 'robotoz.ttf', style: 'bolditalic' }
      ],
      'HankenGrotesk': [
        { file: 'hankengrotesk.ttf', style: 'normal' },
        { file: 'hankengroteskb.ttf', style: 'bold' },
        { file: 'hankengroteski.ttf', style: 'italic' },
        { file: 'hankengroteskz.ttf', style: 'bolditalic' }
      ],
      'Arial': [
        { file: 'arial.ttf', style: 'normal' },
        { file: 'arialbd.ttf', style: 'bold' },
        { file: 'ariali.ttf', style: 'italic' },
        { file: 'arialbi.ttf', style: 'bolditalic' }
      ],
      'Arial Black': [
        { file: 'ariblk.ttf', style: 'normal' },
        { file: 'ariblk.ttf', style: 'bold' },
        { file: 'ariblk.ttf', style: 'italic' },
        { file: 'ariblk.ttf', style: 'bolditalic' }
      ],
      'Century Gothic': [
        { file: 'gothic.ttf', style: 'normal' },
        { file: 'gothicb.ttf', style: 'bold' },
        { file: 'gothici.ttf', style: 'italic' },
        { file: 'gothicz.ttf', style: 'bolditalic' }
      ],
      'Comic Sans MS': [
        { file: 'comic.ttf', style: 'normal' },
        { file: 'comicbd.ttf', style: 'bold' },
        { file: 'comici.ttf', style: 'italic' },
        { file: 'comicz.ttf', style: 'bolditalic' }
      ],
      'Courier New': [
        { file: 'cour.ttf', style: 'normal' },
        { file: 'courbd.ttf', style: 'bold' },
        { file: 'couri.ttf', style: 'italic' },
        { file: 'courbi.ttf', style: 'bolditalic' }
      ],
      'Georgia': [
        { file: 'georgia.ttf', style: 'normal' },
        { file: 'georgiab.ttf', style: 'bold' },
        { file: 'georgiai.ttf', style: 'italic' },
        { file: 'georgiaz.ttf', style: 'bolditalic' }
      ],
      'Impact': [
        { file: 'impact.ttf', style: 'normal' },
        { file: 'impact.ttf', style: 'bold' },
        { file: 'impact.ttf', style: 'italic' },
        { file: 'impact.ttf', style: 'bolditalic' }
      ],
      'Segoe UI': [
        { file: 'segoeui.ttf', style: 'normal' },
        { file: 'segoeuib.ttf', style: 'bold' },
        { file: 'segoeuii.ttf', style: 'italic' },
        { file: 'segoeuiz.ttf', style: 'bolditalic' }
      ],
      'Tahoma': [
        { file: 'tahoma.ttf', style: 'normal' },
        { file: 'tahomabd.ttf', style: 'bold' },
        { file: 'tahoma.ttf', style: 'italic' },
        { file: 'tahomabd.ttf', style: 'bolditalic' }
      ],
      'Times New Roman': [
        { file: 'times.ttf', style: 'normal' },
        { file: 'timesbd.ttf', style: 'bold' },
        { file: 'timesi.ttf', style: 'italic' },
        { file: 'timesbi.ttf', style: 'bolditalic' }
      ],
      'Trebuchet MS': [
        { file: 'trebuc.ttf', style: 'normal' },
        { file: 'trebucbd.ttf', style: 'bold' },
        { file: 'trebucit.ttf', style: 'italic' },
        { file: 'trebucbi.ttf', style: 'bolditalic' }
      ],
      'Montserrat': [
        { file: 'montserrat.ttf', style: 'normal' },
        { file: 'montserratb.ttf', style: 'bold' },
        { file: 'montserrati.ttf', style: 'italic' },
        { file: 'montserratz.ttf', style: 'bolditalic' }
      ],
      'Montserrat Extra Bold': [
        { file: 'montserrat-extrabold.ttf', style: 'normal' },
        { file: 'montserrat-extrabold.ttf', style: 'bold' },
        { file: 'montserrat-extrabold.ttf', style: 'italic' },
        { file: 'montserrat-extrabold.ttf', style: 'bolditalic' }
      ],
      'Source Sans Pro': [
        { file: 'sourcesans.ttf', style: 'normal' },
        { file: 'sourcesansb.ttf', style: 'bold' },
        { file: 'sourcesansi.ttf', style: 'italic' },
        { file: 'sourcesansz.ttf', style: 'bolditalic' }
      ]
    }

    const promises: Promise<any>[] = []
    for (const fontName of fontsToLoad) {
      const registrations = FONT_REGISTRY[fontName]
      if (registrations) {
        for (const reg of registrations) {
          promises.push(registerFont(pdf, `${fontName}-${reg.style}`, reg.file, fontName, reg.style))
        }
      }
    }

    await Promise.all(promises)
  }

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

    const catUpper = category.toUpperCase().trim()
    const catAsset = opts.categoryAssets?.[catUpper] || opts.categoryAssets?.['GERAL']
    const pageBadgeText = catAsset?.badge_text !== undefined ? catAsset.badge_text : opts.badgeText
    const pageBadgeIconUrl = catAsset?.badge_icon_url !== undefined ? catAsset.badge_icon_url : opts.badgeIconUrl

    // Page header
    const headerEndY = drawPageHeader(pdf, category, color, MARGIN_TOP + 4, pageW, settings, opts.imageCache, pageBadgeText, pageBadgeIconUrl)

    // Content area
    const contentY = headerEndY + 2
    const footerH = 18 // Espaço para o número da página
    const contentH = pageH - contentY - footerH

    // Determine which layout to use based on landscape mode and dominant slot type
    const dominantSlots = opts.getSlots(page[0])

    // In landscape mode, use 8-per-page layout for better PowerPoint presentation
    if (opts.isLandscape && dominantSlots === 1) {
      // 8 per page in landscape (4x2 grid)
      drawLayout8(pdf, page, MARGIN_X, contentY, contentW, contentH, opts, settings)
    } else if (dominantSlots === 1) {
      // 6 per page in portrait
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
