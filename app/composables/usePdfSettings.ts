import { useState } from '#app'

export interface PdfSettings {
  id?: string
  category: string
  title_font_size: string
  title_position_y: string
  image_position: string
  card_layout_order: string
  font_size_specs: string
  divider_line_color: string
  landscape_settings?: Record<string, any> | null
  [key: string]: any
}

// Retorna os defaults compartilhados entre portrait e landscape
const getSettingsDefaults = () => ({
  title_font_size: '36px',
  title_position_y: '0px',
  image_position: 'right',
  card_layout_order: 'specs-first',
  font_size_specs: '10px',
  divider_line_color: '#cbd5e1',
  logo_width: '240px',
  logo_height: '75px',
  logo_position_x: '60px',
  logo_position_y: '60px',
  specs_val_bold: false,
  specs_val_italic: false,
  specs_val_underline: false,
  card_header_layout: 'model-left',
  tag_font_family: 'Inter',
  tag_font_size: '10px',
  tag_bold: true,
  tag_italic: false,
  tag_underline: false,
  tag_offset_x: '0px',
  tag_offset_y: '0px',
  pdf_image_scale: 1.0,
  pdf_image_scale_x: 1.0,
  pdf_image_scale_y: 1.0,
  product_image_offset_x: '0px',
  specs_bg_color: '#f3f4f6',
  title_color: '',
})

export default function usePdfSettings() {
  const pdfSettings = useState<Record<string, PdfSettings>>('pdf-layout-settings', () => ({}))
  const supabase = useSupabaseClient()

  const fetchPdfSettings = async () => {
    try {
      const { data, error } = await supabase.from('pdf_settings').select('*')
      console.log('[usePdfSettings] fetchPdfSettings called. data rows:', data?.length, 'error:', error)
      if (data) {
        const mapping: Record<string, PdfSettings> = {}
        for (const item of data) {
          if (item.category) {
            // Parse landscape_settings JSON se vier como string
            let lsRaw = item.landscape_settings
            if (typeof lsRaw === 'string') {
              try { lsRaw = JSON.parse(lsRaw) } catch { lsRaw = null }
            }

            const catKey = item.category.toUpperCase().trim()
            mapping[catKey] = {
              ...item,
              title_font_size: item.title_font_size || '36px',
              title_position_y: item.title_position_y || '0px',
              image_position: item.image_position || 'right',
              card_layout_order: item.card_layout_order || 'specs-first',
              font_size_specs: item.font_size_specs || '10px',
              divider_line_color: item.divider_line_color || '#cbd5e1',
              specs_val_bold: !!item.specs_val_bold,
              specs_val_italic: !!item.specs_val_italic,
              specs_val_underline: !!item.specs_val_underline,
              card_header_layout: item.card_header_layout || 'model-left',
              tag_font_family: item.tag_font_family || 'Inter',
              tag_font_size: item.tag_font_size || '10px',
              tag_bold: item.tag_bold !== null ? !!item.tag_bold : true,
              tag_italic: !!item.tag_italic,
              tag_underline: !!item.tag_underline,
              tag_offset_x: item.tag_offset_x || '0px',
              tag_offset_y: item.tag_offset_y || '0px',
              orientation: item.orientation || 'portrait',
              pdf_image_scale: item.pdf_image_scale !== undefined && item.pdf_image_scale !== null ? Number(item.pdf_image_scale) : 1.0,
              pdf_image_scale_x: item.pdf_image_scale_x !== undefined && item.pdf_image_scale_x !== null ? Number(item.pdf_image_scale_x) : 1.0,
              pdf_image_scale_y: item.pdf_image_scale_y !== undefined && item.pdf_image_scale_y !== null ? Number(item.pdf_image_scale_y) : 1.0,
              product_image_offset_x: item.product_image_offset_x || '0px',
              specs_bg_color: item.specs_bg_color || '#f3f4f6',
              title_color: item.title_color || '',
              landscape_settings: lsRaw || null,
            }
            console.log(`[usePdfSettings] Loaded settings for category '${catKey}':`, JSON.stringify({
              logo_width: mapping[catKey].logo_width,
              logo_height: mapping[catKey].logo_height,
              logo_position_x: mapping[catKey].logo_position_x,
              logo_position_y: mapping[catKey].logo_position_y,
              card_title_offset_x: mapping[catKey].card_title_offset_x,
              card_title_offset_y: mapping[catKey].card_title_offset_y,
              specs_line_style: mapping[catKey].specs_line_style,
              image_position: mapping[catKey].image_position,
              card_layout_order: mapping[catKey].card_layout_order,
            }))
          }
        }
        pdfSettings.value = mapping
        console.log('[usePdfSettings] Total categories loaded:', Object.keys(mapping).length, Object.keys(mapping))
      }
    } catch (e) {
      console.error('Failed to fetch pdf settings:', e)
    }
  }

  const getPdfSettings = (category?: string): PdfSettings => {
    const defaultSettings: PdfSettings = {
      category: 'Geral',
      ...getSettingsDefaults(),
      orientation: 'portrait',
      landscape_settings: null,
    }
    if (!category) {
      console.log('[usePdfSettings] getPdfSettings called with NO category, returning defaults')
      return defaultSettings
    }
    const catUpper = category.toUpperCase().trim()
    const found = pdfSettings.value[catUpper] || pdfSettings.value['GERAL'] || defaultSettings
    console.log(`[usePdfSettings] getPdfSettings('${category}') => catUpper='${catUpper}', found keys:`, Object.keys(pdfSettings.value), 'matched:', !!pdfSettings.value[catUpper], 'logo_width:', found.logo_width, 'specs_line_style:', found.specs_line_style)
    return found
  }

  /**
   * Retorna as configurações de PDF para o modo paisagem.
   * Mescla os defaults do portrait com os overrides salvos em landscape_settings.
   * Se não houver landscape_settings configurado, cai de volta para o portrait.
   */
  const getLandscapePdfSettings = (category?: string): PdfSettings => {
    const portraitSettings = getPdfSettings(category)
    const lsOverrides = portraitSettings.landscape_settings
    if (!lsOverrides || Object.keys(lsOverrides).length === 0) {
      return portraitSettings // fallback: usa portrait se landscape não configurado
    }

    // Converte os overrides do landscape (que estão em camelCase) para snake_case para sobrescrever corretamente os campos correspondentes
    const snakeOverrides: Record<string, any> = {}
    for (const key of Object.keys(lsOverrides)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      snakeOverrides[snakeKey] = lsOverrides[key]
    }

    // Mescla: portrait como base + overrides de landscape por cima
    return {
      ...portraitSettings,
      ...snakeOverrides,
      orientation: 'landscape',
    }
  }

  return {
    pdfSettings,
    fetchPdfSettings,
    getPdfSettings,
    getLandscapePdfSettings,
  }
}