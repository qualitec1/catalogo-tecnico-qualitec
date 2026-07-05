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
  const num = parseFloat(String(val))
  if (isNaN(num)) return fallbackPt
  // Convert px to pt (1px ≈ 0.75pt)
  return num * 0.75
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
