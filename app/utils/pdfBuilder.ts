/**
 * pdfBuilder.ts — Construtor programático de catálogo PDF via jsPDF
 */

import { drawCoverPage, drawPageHeader, drawPageFooter } from './pdfDrawHelpers'
import { drawLayout1, drawLayout3, drawLayout6 } from './pdfLayoutDrawers'

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
      console.warn(`[pdfBuilder] Failed to fetch font /api/font?name=${file}`)
      return
    }
    const buffer = await response.arrayBuffer()
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

  // Register custom fonts
  if (typeof window !== 'undefined') {
    await Promise.all([
      // Verdana
      registerFont(pdf, 'Verdana-Regular', 'verdana.ttf', 'Verdana', 'normal'),
      registerFont(pdf, 'Verdana-Bold', 'verdanab.ttf', 'Verdana', 'bold'),
      registerFont(pdf, 'Verdana-Italic', 'verdanai.ttf', 'Verdana', 'italic'),
      registerFont(pdf, 'Verdana-BoldItalic', 'verdanaz.ttf', 'Verdana', 'bolditalic'),
      // Calibri
      registerFont(pdf, 'Calibri-Regular', 'calibri.ttf', 'Calibri', 'normal'),
      registerFont(pdf, 'Calibri-Bold', 'calibrib.ttf', 'Calibri', 'bold'),
      registerFont(pdf, 'Calibri-Italic', 'calibrii.ttf', 'Calibri', 'italic'),
      registerFont(pdf, 'Calibri-BoldItalic', 'calibriz.ttf', 'Calibri', 'bolditalic'),
      // Roboto
      registerFont(pdf, 'Roboto-Regular', 'roboto.ttf', 'Roboto', 'normal'),
      registerFont(pdf, 'Roboto-Bold', 'robotob.ttf', 'Roboto', 'bold'),
      registerFont(pdf, 'Roboto-Italic', 'robotoi.ttf', 'Roboto', 'italic'),
      registerFont(pdf, 'Roboto-BoldItalic', 'robotoz.ttf', 'Roboto', 'bolditalic'),
      // Inter
      registerFont(pdf, 'Inter-Regular', 'inter.ttf', 'Inter', 'normal'),
      registerFont(pdf, 'Inter-Bold', 'interb.ttf', 'Inter', 'bold'),
      registerFont(pdf, 'Inter-Italic', 'interi.ttf', 'Inter', 'italic'),
      registerFont(pdf, 'Inter-BoldItalic', 'interz.ttf', 'Inter', 'bolditalic'),
      // Outfit
      registerFont(pdf, 'Outfit-Regular', 'outfit.ttf', 'Outfit', 'normal'),
      registerFont(pdf, 'Outfit-Bold', 'outfitb.ttf', 'Outfit', 'bold'),
      registerFont(pdf, 'Outfit-Italic', 'outfiti.ttf', 'Outfit', 'italic'),
      registerFont(pdf, 'Outfit-BoldItalic', 'outfitz.ttf', 'Outfit', 'bolditalic'),
      // Hanken Grotesk
      registerFont(pdf, 'Hanken-Regular', 'hankengrotesk.ttf', 'HankenGrotesk', 'normal'),
      registerFont(pdf, 'Hanken-Bold', 'hankengroteskb.ttf', 'HankenGrotesk', 'bold'),
      registerFont(pdf, 'Hanken-Italic', 'hankengroteski.ttf', 'HankenGrotesk', 'italic'),
      registerFont(pdf, 'Hanken-BoldItalic', 'hankengroteskz.ttf', 'HankenGrotesk', 'bolditalic'),
    ])
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
