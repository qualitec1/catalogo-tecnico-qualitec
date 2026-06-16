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
  [key: string]: any
}

export default function usePdfSettings() {
  const pdfSettings = useState<Record<string, PdfSettings>>('pdf-layout-settings', () => ({}))
  const supabase = useSupabaseClient()

  const fetchPdfSettings = async () => {
    try {
      const { data } = await supabase.from('pdf_settings').select('*')
      if (data) {
        const mapping: Record<string, PdfSettings> = {}
        for (const item of data) {
          if (item.category) {
            mapping[item.category.toUpperCase().trim()] = {
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
              orientation: item.orientation || 'portrait'
            }
          }
        }
        pdfSettings.value = mapping
      }
    } catch (e) {
      console.error('Failed to fetch pdf settings:', e)
    }
  }

  const getPdfSettings = (category?: string) => {
    const defaultSettings: PdfSettings = {
      category: 'Geral',
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
      orientation: 'portrait'
    }
    if (!category) return defaultSettings
    const catUpper = category.toUpperCase().trim()
    return pdfSettings.value[catUpper] || pdfSettings.value['GERAL'] || defaultSettings
  }

  return {
    pdfSettings,
    fetchPdfSettings,
    getPdfSettings
  }
}