export interface CachedImage {
  dataUrl: string
  width: number
  height: number
  format: 'JPEG' | 'PNG'
}

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function detectFormat(dataUrl: string): 'JPEG' | 'PNG' {
  if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) return 'JPEG'
  return 'PNG'
}

/** Fit image into a box while maintaining aspect ratio, returning centered position */
export function fitImageInBox(
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

/** Parse a dimension string and return mm value. Scaled if 'px', otherwise treated as mm. */
export function dimToMm(val: string | number | undefined, fallbackMm: number): number {
  if (val === undefined || val === null || val === '') return fallbackMm
  const str = String(val).trim().replace(',', '.')
  const num = parseFloat(str)
  if (isNaN(num)) return fallbackMm
  // If explicitly pixels, convert to mm (1px ≈ 0.264mm)
  if (str.toLowerCase().endsWith('px')) {
    return num * 0.264
  }
  // Otherwise treat as millimeters directly
  return num
}

export function getFontName(fontFamily: string | undefined): string {
  if (!fontFamily) return 'helvetica'
  const f = fontFamily.toLowerCase().trim()
  if (f === 'helvetica' || f === 'helvetica neue') return 'helvetica'
  if (f.includes('verdana')) return 'Verdana'
  if (f.includes('calibri')) return 'Calibri'
  // Inter & Outfit are distributed as variable fonts only and cannot be used in jsPDF.
  // We alias them to Roboto (same sans-serif style, full static TTF available).
  if (f.includes('inter') || f.includes('outfit')) return 'Roboto'
  if (f.includes('roboto')) return 'Roboto'
  if (f.includes('hanken')) return 'HankenGrotesk'
  if (f.includes('arial black')) return 'Arial Black'
  if (f.includes('arial')) return 'Arial'
  if (f.includes('century gothic')) return 'Century Gothic'
  if (f.includes('comic sans')) return 'Comic Sans MS'
  if (f.includes('courier new')) return 'Courier New'
  if (f.includes('courier') || f.includes('mono')) return 'Courier New'
  if (f.includes('georgia')) return 'Georgia'
  if (f.includes('impact')) return 'Impact'
  if (f.includes('segoe ui')) return 'Segoe UI'
  if (f.includes('tahoma')) return 'Tahoma'
  if (f.includes('times new roman')) return 'Times New Roman'
  if (f.includes('times') || f.includes('serif')) return 'Times New Roman'
  if (f.includes('trebuchet')) return 'Trebuchet MS'
  if (f.includes('montserrat extra bold')) return 'Montserrat Extra Bold'
  if (f.includes('montserrat')) return 'Montserrat'
  if (f.includes('source sans')) return 'Source Sans Pro'
  return 'helvetica' // Default sans-serif fallback
}

export function sanitizePdfText(text: string | null | undefined): string {
  if (!text) return ''
  let str = String(text)
  // Replace HTML entities
  str = str.replace(/&deg;/gi, '°')
           .replace(/&ordm;/gi, '°')
           .replace(/&plusmn;/gi, '±')
           .replace(/&nbsp;/gi, ' ')
  // Replace non-breaking spaces
  str = str.replace(/\u00a0/g, ' ')
  // Replace masculine ordinal indicator 'º' (U+00BA) with degree sign '°' (U+00B0)
  str = str.replace(/º/g, '°')
  return str
}

export function getFontStyle(bold: boolean | undefined, italic: boolean | undefined): string {
  if (bold && italic) return 'bolditalic'
  if (bold) return 'bold'
  if (italic) return 'italic'
  return 'normal'
}

export function drawTextUnderline(
  pdf: any,
  text: string,
  textX: number,
  textY: number,
  fontSizePt: number,
  color: string | [number, number, number],
  align: 'left' | 'right' = 'left'
) {
  const textWidth = pdf.getTextWidth(text)
  setDrawRgb(pdf, color as string)
  const thickness = Math.max(0.1, fontSizePt * 0.015)
  pdf.setLineWidth(thickness)
  const lineY = textY + 0.4
  const startX = align === 'right' ? textX - textWidth : textX
  pdf.line(startX, lineY, startX + textWidth, lineY)
}

export function parseFontSizePt(val: string | number | undefined, fallbackPt: number): number {
  if (val === undefined || val === null || val === '') return fallbackPt
  const str = String(val).trim()
  const num = parseFloat(str)
  if (isNaN(num)) return fallbackPt
  // If explicitly pixels, convert to pt (1px ≈ 0.75pt)
  if (str.toLowerCase().endsWith('px')) return num * 0.75
  // If explicitly pt, use directly
  if (str.toLowerCase().endsWith('pt')) return num
  // Plain number: treat as pt directly (most admin inputs store px strings; if no unit assume pt)
  return num
}

/** Truncate text to fit within maxWidth (mm) at current font */
export function truncateText(pdf: any, text: string, maxWidth: number): string {
  const lines = pdf.splitTextToSize(text, maxWidth)
  return lines[0] || text
}

export function cleanWhiteHalo(dataUrl: string, imgEl: HTMLImageElement): string {
  const canvas = document.createElement('canvas')
  canvas.width = imgEl.naturalWidth || imgEl.width
  canvas.height = imgEl.naturalHeight || imgEl.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  
  ctx.drawImage(imgEl, 0, 0)
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imgData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i+1]
    const b = data[i+2]
    const a = data[i+3]
    
    if (a > 0 && a < 255) {
      if (r > 200 && g > 200 && b > 200) {
        const maxVal = Math.max(r, g, b)
        if (maxVal > 220) {
          data[i+3] = 0 // fully transparent
        } else {
          const factor = (maxVal - 200) / 20
          data[i+3] = Math.max(0, Math.round(a * (1 - factor)))
        }
      }
    }
  }
  
  ctx.putImageData(imgData, 0, 0)
  
  // Auto-crop and auto-padding to ensure uniform product proportions
  try {
    let minX = canvas.width
    let maxX = 0
    let minY = canvas.height
    let maxY = 0
    let hasContent = false

    // Ignore outermost 1% to prevent edge noise or scanner lines from blocking the crop
    const borderIgnore = Math.max(2, Math.round(canvas.width * 0.01))

    for (let y = borderIgnore; y < canvas.height - borderIgnore; y++) {
      for (let x = borderIgnore; x < canvas.width - borderIgnore; x++) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx+1]
        const b = data[idx+2]
        const a = data[idx+3]

        // Treat as background if transparent (a < 30) or extremely light/white (r,g,b > 240)
        const isBg = a < 30 || (r > 240 && g > 240 && b > 240)
        if (!isBg) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
          hasContent = true
        }
      }
    }

    if (hasContent) {
      const w = maxX - minX + 1
      const h = maxY - minY + 1

      if (w > 5 && h > 5) {
        // Target: product should fill at most 80% of width or height of the original canvas
        const targetW = canvas.width
        const targetH = canvas.height
        const maxAllowedW = targetW * 0.8
        const maxAllowedH = targetH * 0.8

        let scale = Math.min(maxAllowedW / w, maxAllowedH / h)
        // Cap upscaling to avoid pixelation on very small images
        scale = Math.min(scale, 2.0)

        const newW = w * scale
        const newH = h * scale

        const canvas2 = document.createElement('canvas')
        canvas2.width = targetW
        canvas2.height = targetH
        const ctx2 = canvas2.getContext('2d')
        if (ctx2) {
          const destX = (targetW - newW) / 2
          const destY = (targetH - newH) / 2
          ctx2.drawImage(canvas, minX, minY, w, h, destX, destY, newW, newH)
          return canvas2.toDataURL('image/png')
        }
      }
    }
  } catch (err) {
    console.warn('[pdfDocUtils] Error during auto-crop/padding:', err)
  }
  
  return canvas.toDataURL('image/png')
}

export function setFillRgb(pdf: any, hex: string) {
  const [r, g, b] = hexToRgb(hex)
  pdf.setFillColor(r, g, b)
}

export function setTextRgb(pdf: any, hex: string) {
  const [r, g, b] = hexToRgb(hex)
  pdf.setTextColor(r, g, b)
}

export function setDrawRgb(pdf: any, hex: string) {
  const [r, g, b] = hexToRgb(hex)
  pdf.setDrawColor(r, g, b)
}
