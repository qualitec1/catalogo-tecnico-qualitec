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

export function sanitizeSpecValue(val: string | null | undefined, label?: string): string {
  if (!val) return ''
  let str = String(val).trim()
  // Replace temperature / degree symbol variants with standard degree sign ° (U+00B0)
  str = str.replace(/[\u1D52\u1D48\u00BA\u02DAº]/g, '°')
  str = str.replace(/&deg;/gi, '°')
           .replace(/&ordm;/gi, '°')
           .replace(/&plusmn;/gi, '±')
           .replace(/&nbsp;/gi, ' ')
  str = str.replace(/\u00a0/g, ' ')
  str = str.replace(/(\d+)\s*C\b/g, '$1 °C')
  str = str.replace(/\s*°\s*C/g, ' °C')
  str = str.replace(/°\s*°/g, '°')

  // Clean duplicate quotes
  str = str.replace(/"{2,}/g, '"')

  // Fix diameter / inch quote missing on diameter, connection or dimension items
  const normLabel = label ? label.toLowerCase().trim() : ''
  const isDiameterOrConnection = /diâmetro|diametro|diámetro|conexão|conexao|conexión|conexion|nenndurchmesser|nennweite|durchmesser|prozessanschluss|anschluss|diameter|size|connection|rating|medida|tamanho|polegada|inch/i.test(normLabel)
  const containsInchQuote = str.includes('"')

  if (isDiameterOrConnection || containsInchQuote || str.includes('|')) {
    const ensureInchQuote = (token: string): string => {
      let t = token.trim().replace(/"{2,}/g, '"')
      if (!t) return token
      if (t.endsWith('"')) return t

      // Match numbers, fractions or mixed fractions e.g. 1/2, 3/4, 1.1/2, 1.1/4, 2.1/2, 1, 2, 3
      if (/(?:^|\s|\(|\b)(\d+(?:[\.\-\s]\d+)?(?:\/\d+)?|\d+\/\d+)$/.test(t)) {
        if (!/(?:mm|cm|m|°c|c|bar|psi|pn\d+|dn\d+)$/i.test(t)) {
          return t + '"'
        }
      }
      return t
    }

    if (str.includes('|')) {
      const parts = str.split('|')
      const hasAnyQuote = isDiameterOrConnection || parts.some(p => p.includes('"'))
      if (hasAnyQuote) {
        str = parts.map(p => ensureInchQuote(p)).join(' | ')
      }
    } else if (str.includes('~')) {
      const parts = str.split('~')
      const hasAnyQuote = isDiameterOrConnection || parts.some(p => p.includes('"'))
      if (hasAnyQuote) {
        str = parts.map(p => ensureInchQuote(p)).join(' ~ ')
      }
    } else if (isDiameterOrConnection || containsInchQuote) {
      str = ensureInchQuote(str)
    }

    // Fix parenthesis missing internal quote e.g. (3/8" ~ 2) -> (3/8" ~ 2")
    str = str.replace(/(\d+(?:[\.\-\s]\d+)?(?:\/\d+)?)\)/g, '$1")')
  }

  str = str.replace(/[ \t]{2,}/g, ' ')
  return str
}

export function sanitizePdfText(text: string | null | undefined, label?: string): string {
  if (!text) return ''
  return sanitizeSpecValue(text, label)
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
  try {
    const origW = imgEl.naturalWidth || imgEl.width || 400
    const origH = imgEl.naturalHeight || imgEl.height || 300
    if (origW <= 0 || origH <= 0) return dataUrl

    // Cap initial canvas max dimension to 800px to ensure ultra-fast processing and zero memory crashes on high-res (10MB+) images
    const maxDim = 800
    let drawW = origW
    let drawH = origH
    if (origW > maxDim || origH > maxDim) {
      if (origW > origH) {
        drawW = maxDim
        drawH = Math.round(maxDim * (origH / origW))
      } else {
        drawH = maxDim
        drawW = Math.round(maxDim * (origW / origH))
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = drawW
    canvas.height = drawH
    const ctx = canvas.getContext('2d')
    if (!ctx) return dataUrl

    ctx.drawImage(imgEl, 0, 0, drawW, drawH)
    const imgData = ctx.getImageData(0, 0, drawW, drawH)
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
    let minX = drawW
    let maxX = 0
    let minY = drawH
    let maxY = 0
    let hasContent = false

    const borderIgnore = Math.max(2, Math.round(drawW * 0.01))

    for (let y = borderIgnore; y < drawH - borderIgnore; y++) {
      for (let x = borderIgnore; x < drawW - borderIgnore; x++) {
        const idx = (y * drawW + x) * 4
        const r = data[idx]
        const g = data[idx+1]
        const b = data[idx+2]
        const a = data[idx+3]

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
        let targetW: number
        let targetH: number

        if (w > h) {
          targetW = 700
          targetH = Math.round(700 * (h / w))
        } else {
          targetH = 700
          targetW = Math.round(700 * (w / h))
        }

        const canvas2 = document.createElement('canvas')
        canvas2.width = targetW
        canvas2.height = targetH
        const ctx2 = canvas2.getContext('2d')
        if (ctx2) {
          ctx2.drawImage(canvas, minX, minY, w, h, 0, 0, targetW, targetH)
          return canvas2.toDataURL('image/png')
        }
      }
    }

    return canvas.toDataURL('image/png')
  } catch (err) {
    console.warn('[pdfDocUtils] Error during cleanWhiteHalo:', err)
    return dataUrl
  }
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

export function isSpecLabelHidden(label: string | null | undefined): boolean {
  if (!label) return true
  const norm = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  const hiddenExact = [
    'idioma', 'lang', 'language', 'category_display',
    'industria', 'industry', 'branche', 'sektor', 'sector',
    'secteur', 'segmento', 'segment', 'setor', 'setores'
  ]

  if (hiddenExact.includes(norm)) return true

  if (
    norm.startsWith('industri') ||
    norm.startsWith('branche') ||
    norm.startsWith('segment') ||
    norm.startsWith('sektor') ||
    norm.startsWith('setor')
  ) {
    return true
  }

  return false
}

