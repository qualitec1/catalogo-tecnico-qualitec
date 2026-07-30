/**
 * pdfBuilder.ts — Construtor programático de catálogo PDF via jsPDF
 */

import { drawCoverPage, drawCoverPageLandscape, drawPageHeader, drawPageFooter } from './pdfDrawHelpers'
import { drawLayout1, drawLayout3, drawLayout6 } from './pdfLayoutDrawers'
import { getFontName } from './pdfDocUtils'

// Margin and dimension constants
const MARGIN_X = 13
const MARGIN_TOP = 8
const A4_W = 210
const A4_H = 297

async function registerFont(pdf: any, name: string, file: string, fontName: string, fontStyle: string) {
  try {
    let response = await fetch(`/fonts/${file}`)
    if (!response.ok) {
      response = await fetch(`/api/font?name=${file}`)
    }
    if (!response.ok) {
      console.warn(`[pdfBuilder] Failed to fetch font /fonts/${file} or /api/font?name=${file} (status ${response.status})`)
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

  const bookletMode = opts.bookletMode || false
  
  // In booklet mode, we create landscape pages with 2 portrait pages side-by-side (scaled down)
  // In normal mode, standard portrait A4
  const physicalOrientation = bookletMode ? 'landscape' : 'portrait'
  const physicalPageW = bookletMode ? 297 : 210
  const physicalPageH = bookletMode ? 210 : 297
  
  // Logical page dimensions (always A4 portrait for layout calculation)
  const logicalPageW = 210
  const logicalPageH = 297
  const contentW = logicalPageW - MARGIN_X * 2
  const totalPages = opts.pages.length

  const pdf = new jsPDF({
    orientation: physicalOrientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
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

  // 1. Draw cover page (primeira página do PDF, não adicionar página extra)
  if (bookletMode) {
    // Booklet mode: cover is landscape page (já foi criada no jsPDF init)
    drawCoverPageLandscape(pdf, opts)
  } else {
    // Normal mode: cover is portrait page (já foi criada no jsPDF init)
    drawCoverPage(pdf, opts)
  }

  // 2. Draw product pages
  if (bookletMode) {
    // Booklet mode: 2 A4 portrait pages side-by-side on A4 landscape
    const scale = 0.707
    
    for (let pi = 0; pi < opts.pages.length; pi += 2) {
      pdf.addPage('a4', 'landscape')

      // Draw left page (pages[pi])
      const leftPage = opts.pages[pi]
      if (leftPage && leftPage.length > 0) {
        const leftSettings = opts.getPageSettings(leftPage)
        const leftCategory = leftPage[0]?.category || opts.categoryName
        const leftColor = opts.getBgColor(leftPage[0]?.bgClass, leftCategory)
        const leftDominantSlots = opts.getSlots(leftPage[0])

        // Draw at original size, but everything will be scaled by using smaller dimensions
        const scaledMarginX = MARGIN_X * scale
        const scaledMarginTop = (MARGIN_TOP + 4) * scale
        const scaledContentW = contentW * scale
        const scaledLogicalPageW = logicalPageW * scale
        const scaledLogicalPageH = logicalPageH * scale

        const leftHeaderEndY = drawPageHeader(pdf, leftCategory, leftColor, scaledMarginTop, scaledLogicalPageW, leftSettings, opts.imageCache, 0, scale, pi + 1)
        const leftContentY = leftHeaderEndY + 2 * scale
        const leftFooterH = 18 * scale
        const leftContentH = scaledLogicalPageH - leftContentY - leftFooterH

        if (leftDominantSlots === 1) {
          drawLayout6(pdf, leftPage, scaledMarginX, leftContentY, scaledContentW, leftContentH, opts, leftSettings)
        } else if (leftDominantSlots === 6) {
          drawLayout1(pdf, leftPage[0], scaledMarginX, leftContentY, scaledContentW, leftContentH, opts, leftSettings)
        } else {
          drawLayout3(pdf, leftPage, scaledMarginX, leftContentY, scaledContentW, leftContentH, opts, leftSettings)
        }

        drawPageFooter(pdf, pi + 1, totalPages, scaledLogicalPageW, scaledLogicalPageH, 0, scale)
      }

      // Draw right page (pages[pi+1])
      const rightPage = pi + 1 < opts.pages.length ? opts.pages[pi + 1] : null
      if (rightPage && rightPage.length > 0) {
        const rightSettings = opts.getPageSettings(rightPage)
        const rightCategory = rightPage[0]?.category || opts.categoryName
        const rightColor = opts.getBgColor(rightPage[0]?.bgClass, rightCategory)
        const rightDominantSlots = opts.getSlots(rightPage[0])

        const offsetX = 148.5  // Half of landscape width (297/2)
        const scaledMarginX = MARGIN_X * scale
        const scaledMarginTop = (MARGIN_TOP + 4) * scale
        const scaledContentW = contentW * scale
        const scaledLogicalPageW = logicalPageW * scale
        const scaledLogicalPageH = logicalPageH * scale

        const rightHeaderEndY = drawPageHeader(pdf, rightCategory, rightColor, scaledMarginTop, scaledLogicalPageW, rightSettings, opts.imageCache, offsetX, scale, pi + 2)
        const rightContentY = rightHeaderEndY + 2 * scale
        const rightFooterH = 18 * scale
        const rightContentH = scaledLogicalPageH - rightContentY - rightFooterH

        if (rightDominantSlots === 1) {
          drawLayout6(pdf, rightPage, offsetX + scaledMarginX, rightContentY, scaledContentW, rightContentH, opts, rightSettings)
        } else if (rightDominantSlots === 6) {
          drawLayout1(pdf, rightPage[0], offsetX + scaledMarginX, rightContentY, scaledContentW, rightContentH, opts, rightSettings)
        } else {
          drawLayout3(pdf, rightPage, offsetX + scaledMarginX, rightContentY, scaledContentW, rightContentH, opts, rightSettings)
        }

        drawPageFooter(pdf, pi + 2, totalPages, scaledLogicalPageW, scaledLogicalPageH, offsetX, scale)
      }
    }
  } else {
    // Normal mode: 1 page per physical page
    for (let pi = 0; pi < opts.pages.length; pi++) {
      const page = opts.pages[pi]
      if (page.length === 0) continue

      pdf.addPage('a4', 'portrait')

      const settings = opts.getPageSettings(page)
      const category = page[0]?.category || opts.categoryName
      const color = opts.getBgColor(page[0]?.bgClass, category)

      const headerEndY = drawPageHeader(pdf, category, color, MARGIN_TOP + 4, logicalPageW, settings, opts.imageCache, 0, 1, pi + 1)
      const contentY = headerEndY + 2
      const footerH = 18
      const contentH = logicalPageH - contentY - footerH
      const dominantSlots = opts.getSlots(page[0])

      if (dominantSlots === 1) {
        drawLayout6(pdf, page, MARGIN_X, contentY, contentW, contentH, opts, settings)
      } else if (dominantSlots === 6) {
        drawLayout1(pdf, page[0], MARGIN_X, contentY, contentW, contentH, opts, settings)
      } else {
        drawLayout3(pdf, page, MARGIN_X, contentY, contentW, contentH, opts, settings)
      }

      drawPageFooter(pdf, pi + 1, totalPages, logicalPageW, logicalPageH, 0, 1)
    }
  }

  // 3. Draw final back cover page (Última folha de todos os PDFs)
  if (opts.imageCache && opts.imageCache.has('__last_page__')) {
    pdf.addPage('a4', bookletMode ? 'landscape' : 'portrait')
    const lastImg = opts.imageCache.get('__last_page__')
    if (lastImg) {
      const lastW = bookletMode ? 297 : 210
      const lastH = bookletMode ? 210 : 297
      pdf.addImage(lastImg.dataUrl, lastImg.format || 'PNG', 0, 0, lastW, lastH)
    }
  }

  return pdf
}

