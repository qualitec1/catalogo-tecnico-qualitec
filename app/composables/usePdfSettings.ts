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
  title_font_size: '18px',
  title_position_y: '-0px',
  image_position: 'right',
  card_layout_order: 'image-first',
  font_size_specs: '8px',
  divider_line_color: '#cbd5e1',
  badge_icon_size: '4.5mm',
  badge_font_family: 'Inter',
  badge_font_size: '8pt',
  badge_color: '#334155',
  badge_position_x: '0px',
  badge_position_y: '0px',
  badge_icon_offset_x: '0px',
  badge_icon_offset_y: '0px',
  badge_text_offset_x: '0px',
  badge_text_offset_y: '0px',
  logo_width: '380px',
  logo_height: '150px',
  logo_position_x: '-80px',
  logo_position_y: '60px',
  specs_val_bold: false,
  specs_val_italic: false,
  specs_val_underline: false,
  card_header_layout: 'model-left',
  tag_font_family: 'Inter',
  tag_font_size: '10px',
  tag_bold: false,
  tag_italic: false,
  tag_underline: false,
  tag_offset_x: '0px',
  tag_offset_y: '0px',
  pdf_image_scale: 1.0,
  pdf_image_scale_x: 1.0,
  pdf_image_scale_y: 1.0,
  product_image_offset_x: '0px',
  product_image_offset_y: '0px',
  card_offset_x: '0px',
  card_offset_y: '0px',
  card_title_offset_x: '-7px',
  card_title_offset_y: '7px',
  card_title_font_family: 'Inter',
  card_title_bold: true,
  card_title_italic: false,
  card_title_underline: false,
  card_title_font_size: '14px',
  card_model_font_size: '15px',
  card_model_offset_x: '0px',
  card_model_offset_y: '7px',
  card_model_font_family: 'Inter',
  card_model_bold: true,
  card_model_italic: false,
  card_model_underline: false,
  title_font_family: 'Verdana',
  title_bold: true,
  title_italic: false,
  title_underline: false,
  specs_font_family: 'Inter',
  specs_bold: false,
  specs_italic: false,
  specs_underline: false,
  specs_label_width: '45%',
  specs_value_width: '55%',
  specs_padding_y: '4px',
  specs_line_style: 'none',
  specs_line_color: '#cbd5e1',
  specs_bg_color: '#F1F1F1',
  title_color: '#1B388F',
  product_spacing: '25px',
  card_model_label_font_size: '8px',
  card_model_label_offset_x: '0px',
  card_model_label_offset_y: '0px',
  card_model_label_font_family: 'Inter',
  card_model_label_bold: false,
  card_model_label_italic: false,
  card_model_label_underline: false,
  card_title_color: '#ffffff',
  card_model_color: '#ffffff',
  card_model_label_color: '#ffffff',
  card_model_label_text: 'Modelo',
  tag_color: '#ffffff',
  specs_color: '#374151',
  specs_val_color: '#000000',
  cover_title_font_family: 'Helvetica',
  cover_title_font_size: '20px',
  cover_title_bold: true,
  cover_title_italic: false,
  cover_title_underline: false,
  cover_title_color: '#ffffff',
  cover_title_offset_x: '0px',
  cover_title_offset_y: '0px',
  cover_subtitle_text: 'CATÁLOGO DE PRODUTOS',
  cover_subtitle_font_family: 'Helvetica',
  cover_subtitle_font_size: '8px',
  cover_subtitle_bold: false,
  cover_subtitle_italic: false,
  cover_subtitle_underline: false,
  cover_subtitle_color: '#ffffff',
  cover_subtitle_offset_x: '0px',
  cover_subtitle_offset_y: '0px',
  layout_settings: {
    "1": {
      "productImageOffsetY": "12",
      "headerHeight": "25",
      "blockGap": "1.5"
    },
    "3": {
      "specsBold": false,
      "cardOffsetX": "0px",
      "cardOffsetY": "0px",
      "specsItalic": false,
      "cardModelBold": false,
      "cardTitleBold": false,
      "fontSizeSpecs": "8px",
      "specsPaddingY": "4px",
      "productSpacing": "24px",
      "specsLineColor": "#cbd5e1",
      "specsLineStyle": "dashed",
      "specsUnderline": false,
      "cardLayoutOrder": "image-first",
      "cardModelItalic": false,
      "cardTitleItalic": false,
      "specsFontFamily": "Inter",
      "specsLabelWidth": "45%",
      "specsValueWidth": "55%",
      "cardModelOffsetX": "0px",
      "cardModelOffsetY": "0px",
      "cardTitleOffsetX": "0px",
      "cardTitleOffsetY": "0px",
      "dividerLineColor": "#cbd5e1",
      "cardModelFontSize": "24px",
      "cardModelUnderline": false,
      "cardTitleUnderline": false,
      "cardModelFontFamily": "Inter",
      "cardTitleFontFamily": "Inter",
      "productImageOffsetY": "0px",
      "headerHeight": "34",
      "blockGap": "2"
    },
    "6": {
      "cardTitleFontFamily": "Verdana",
      "headerHeight": "40",
      "blockGap": "2"
    }
  }
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
              title_font_family: item.title_font_family || 'Inter',
              title_bold: item.title_bold !== null ? !!item.title_bold : false,
              title_italic: !!item.title_italic,
              title_underline: !!item.title_underline,
              badge_icon_size: item.badge_icon_size || '4.5mm',
              badge_font_family: item.badge_font_family || 'Inter',
              badge_font_size: item.badge_font_size || '8pt',
              badge_color: item.badge_color || '#334155',
              badge_position_x: item.badge_position_x || '0px',
              badge_position_y: item.badge_position_y || '0px',
              badge_icon_offset_x: item.badge_icon_offset_x || '0px',
              badge_icon_offset_y: item.badge_icon_offset_y || '0px',
              badge_text_offset_x: item.badge_text_offset_x || '0px',
              badge_text_offset_y: item.badge_text_offset_y || '0px',
              image_position: item.image_position || 'right',
              card_layout_order: item.card_layout_order || 'image-first',
              font_size_specs: item.font_size_specs || '8px',
              divider_line_color: item.divider_line_color || '#cbd5e1',
              specs_val_bold: !!item.specs_val_bold,
              specs_val_italic: !!item.specs_val_italic,
              specs_val_underline: !!item.specs_val_underline,
              card_header_layout: item.card_header_layout || 'model-left',
              tag_font_family: item.tag_font_family || 'Inter',
              tag_font_size: item.tag_font_size || '10px',
              tag_bold: item.tag_bold !== null ? !!item.tag_bold : false,
              tag_italic: !!item.tag_italic,
              tag_underline: !!item.tag_underline,
              tag_offset_x: item.tag_offset_x || '0px',
              tag_offset_y: item.tag_offset_y || '0px',
              orientation: item.orientation || 'portrait',
              pdf_image_scale: item.pdf_image_scale !== undefined && item.pdf_image_scale !== null ? Number(item.pdf_image_scale) : 1.0,
              pdf_image_scale_x: item.pdf_image_scale_x !== undefined && item.pdf_image_scale_x !== null ? Number(item.pdf_image_scale_x) : 1.0,
              pdf_image_scale_y: item.pdf_image_scale_y !== undefined && item.pdf_image_scale_y !== null ? Number(item.pdf_image_scale_y) : 1.0,
              product_image_offset_x: item.product_image_offset_x || '0px',
              product_image_offset_y: item.product_image_offset_y || '0px',
              specs_bg_color: item.specs_bg_color || '#F1F1F1',
              title_color: item.title_color || '#1B388F',
              card_model_label_font_size: item.card_model_label_font_size || '8px',
              card_model_label_offset_x: item.card_model_label_offset_x || '0px',
              card_model_label_offset_y: item.card_model_label_offset_y || '0px',
              card_model_label_font_family: item.card_model_label_font_family || 'Inter',
              card_model_label_bold: item.card_model_label_bold !== null ? !!item.card_model_label_bold : false,
              card_model_label_italic: !!item.card_model_label_italic,
              card_model_label_underline: !!item.card_model_label_underline,
              card_title_color: item.card_title_color || '#ffffff',
              card_title_font_size: item.card_title_font_size || '14px',
              card_model_color: item.card_model_color || '#ffffff',
              card_model_label_color: item.card_model_label_color || '#ffffff',
              card_model_label_text: item.card_model_label_text || 'Modelo',
              tag_color: item.tag_color || '#ffffff',
              specs_color: item.specs_color || '#374151',
              specs_val_color: item.specs_val_color || '#000000',
              cover_title_font_family: item.cover_title_font_family || 'Helvetica',
              cover_title_font_size: item.cover_title_font_size || '20px',
              cover_title_bold: item.cover_title_bold !== null ? !!item.cover_title_bold : true,
              cover_title_italic: !!item.cover_title_italic,
              cover_title_underline: !!item.cover_title_underline,
              cover_title_color: item.cover_title_color || '#ffffff',
              cover_title_offset_x: item.cover_title_offset_x || '0px',
              cover_title_offset_y: item.cover_title_offset_y || '0px',
              cover_subtitle_text: item.cover_subtitle_text || 'CATÁLOGO DE PRODUTOS',
              cover_subtitle_font_family: item.cover_subtitle_font_family || 'Helvetica',
              cover_subtitle_font_size: item.cover_subtitle_font_size || '8px',
              cover_subtitle_bold: item.cover_subtitle_bold !== null ? !!item.cover_subtitle_bold : false,
              cover_subtitle_italic: !!item.cover_subtitle_italic,
              cover_subtitle_underline: !!item.cover_subtitle_underline,
              cover_subtitle_color: item.cover_subtitle_color || '#ffffff',
              cover_subtitle_offset_x: item.cover_subtitle_offset_x || '0px',
              cover_subtitle_offset_y: item.cover_subtitle_offset_y || '0px',
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