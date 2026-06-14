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
              id: item.id,
              category: item.category,
              title_font_size: item.title_font_size || '36px',
              title_position_y: item.title_position_y || '0px',
              image_position: item.image_position || 'right',
              card_layout_order: item.card_layout_order || 'specs-first',
              font_size_specs: item.font_size_specs || '10px',
              divider_line_color: item.divider_line_color || '#cbd5e1'
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
      divider_line_color: '#cbd5e1'
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