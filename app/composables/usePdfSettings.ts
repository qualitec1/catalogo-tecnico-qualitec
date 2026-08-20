import { useState } from '#app'
import { defaultPdfSettings } from '~/config/defaultPdfSettings'

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

// Retorna os defaults compartilhados (configurações padrão do arquivo)
const getSettingsDefaults = () => ({
  ...defaultPdfSettings
})

export default function usePdfSettings() {
  const pdfSettings = useState<Record<string, PdfSettings>>('pdf-layout-settings', () => ({}))
  const supabase = useSupabaseClient()

  const fetchPdfSettings = async () => {
    try {
      const response = await $fetch<{ settings?: any[] }>('/api/public/settings')
      const data = response?.settings || []
      console.log('[usePdfSettings] fetchPdfSettings called. data rows:', data.length)
      if (data) {
        const mapping: Record<string, PdfSettings> = {}
        for (const item of data) {
          if (item.category) {
            const catKey = item.category.toUpperCase().trim()
            mapping[catKey] = {
              ...item,
              title_font_size: item.title_font_size || '28px',
              title_position_y: item.title_position_y || '0px',
              title_font_family: item.title_font_family || 'Verdana',
              title_bold: item.title_bold !== null ? !!item.title_bold : false,
              title_italic: !!item.title_italic,
              title_underline: !!item.title_underline,
              badge_icon_size: item.badge_icon_size || '7.5mm',
              badge_font_family: item.badge_font_family || 'Verdana',
              badge_font_size: item.badge_font_size || '15pt',
              badge_color: item.badge_color || '#334155',
              badge_position_x: item.badge_position_x || '-12px',
              badge_position_y: item.badge_position_y || '35px',
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
              tag_font_family: item.tag_font_family || 'Verdana',
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
              product_image_offset_x: item.product_image_offset_x || '-10px',
              product_image_offset_y: item.product_image_offset_y || '16px',
              specs_bg_color: item.specs_bg_color || '#F1F1F1',
              title_color: item.title_color || '#1B388F',
              card_model_label_font_size: item.card_model_label_font_size || '8px',
              card_model_label_offset_x: item.card_model_label_offset_x || '0px',
              card_model_label_offset_y: item.card_model_label_offset_y || '0px',
              card_model_label_font_family: item.card_model_label_font_family || 'Verdana',
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
              cover_title_font_family: item.cover_title_font_family || 'Verdana',
              cover_title_font_size: item.cover_title_font_size || '20px',
              cover_title_bold: item.cover_title_bold !== null ? !!item.cover_title_bold : true,
              cover_title_italic: !!item.cover_title_italic,
              cover_title_underline: !!item.cover_title_underline,
              cover_title_color: item.cover_title_color || '#ffffff',
              cover_title_offset_x: item.cover_title_offset_x || '0px',
              cover_title_offset_y: item.cover_title_offset_y || '0px',
              cover_subtitle_text: item.cover_subtitle_text || 'CATÁLOGO DE PRODUTOS',
              cover_subtitle_font_family: item.cover_subtitle_font_family || 'Verdana',
              cover_subtitle_font_size: item.cover_subtitle_font_size || '8px',
              cover_subtitle_bold: item.cover_subtitle_bold !== null ? !!item.cover_subtitle_bold : false,
              cover_subtitle_italic: !!item.cover_subtitle_italic,
              cover_subtitle_underline: !!item.cover_subtitle_underline,
              cover_subtitle_color: item.cover_subtitle_color || '#ffffff',
              cover_subtitle_offset_x: item.cover_subtitle_offset_x || '0px',
              logo_width: item.logo_width || '380px',
              logo_height: item.logo_height || '200px',
              logo_position_x: item.logo_position_x || '-60px',
              logo_position_y: item.logo_position_y || '-30px',
              intro_image_url: item.intro_image_url || (item.layout_settings && (item.layout_settings.intro_image_url || item.layout_settings.introImageUrl)) || null,
              layout_settings: item.layout_settings || {},
              cover_title_pt: item.cover_title_pt || (item.layout_settings && item.layout_settings.cover_title_pt) || null,
              cover_title_en: item.cover_title_en || (item.layout_settings && item.layout_settings.cover_title_en) || null,
              cover_title_es: item.cover_title_es || (item.layout_settings && (item.layout_settings.cover_title_es || item.layout_settings.cover_title_de)) || null,
              coverTitlePt: item.cover_title_pt || (item.layout_settings && item.layout_settings.cover_title_pt) || null,
              coverTitleEn: item.cover_title_en || (item.layout_settings && item.layout_settings.cover_title_en) || null,
              coverTitleEs: item.cover_title_es || (item.layout_settings && (item.layout_settings.cover_title_es || item.layout_settings.cover_title_de)) || null,
              cover_subtitle_pt: item.cover_subtitle_pt || (item.layout_settings && item.layout_settings.cover_subtitle_pt) || null,
              cover_subtitle_en: item.cover_subtitle_en || (item.layout_settings && item.layout_settings.cover_subtitle_en) || null,
              cover_subtitle_es: item.cover_subtitle_es || (item.layout_settings && item.layout_settings.cover_subtitle_es) || null,
              coverSubtitlePt: item.cover_subtitle_pt || (item.layout_settings && item.layout_settings.cover_subtitle_pt) || null,
              coverSubtitleEn: item.cover_subtitle_en || (item.layout_settings && item.layout_settings.cover_subtitle_en) || null,
              coverSubtitleEs: item.cover_subtitle_es || (item.layout_settings && item.layout_settings.cover_subtitle_es) || null,
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

  return {
    pdfSettings,
    fetchPdfSettings,
    getPdfSettings,
  }
}
