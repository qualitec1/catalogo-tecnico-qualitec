import { useState } from '#app'

export interface SiteVisualSettings {
  // Botão "Ver Documentação"
  btn_doc_bg_color: string
  btn_doc_hover_color: string
  btn_doc_text_color: string
  btn_doc_font_family: string
  btn_doc_font_size: string
  btn_doc_bold: boolean
  btn_doc_italic: boolean
  btn_doc_uppercase: boolean
  btn_doc_border_radius: string
  btn_doc_text: string
  // Tag da Categoria
  card_tag_font_size: string
  card_tag_font_family: string
  card_tag_bold: boolean
  card_tag_italic: boolean
  // Tabela de Especificações
  card_specs_bg_color: string
  card_specs_label_color: string
  card_specs_value_color: string
  card_specs_font_family: string
  card_specs_label_font_size: string
  card_specs_value_font_size: string
}

const defaults: SiteVisualSettings = {
  btn_doc_bg_color: '#376092',
  btn_doc_hover_color: '#2b4c74',
  btn_doc_text_color: '#ffffff',
  btn_doc_font_family: 'system-ui',
  btn_doc_font_size: '12px',
  btn_doc_bold: true,
  btn_doc_italic: false,
  btn_doc_uppercase: true,
  btn_doc_border_radius: '4px',
  btn_doc_text: 'VER DOCUMENTAÇÃO',
  card_tag_font_size: '11px',
  card_tag_font_family: 'system-ui',
  card_tag_bold: true,
  card_tag_italic: false,
  card_specs_bg_color: '#f3f4f6',
  card_specs_label_color: '#374151',
  card_specs_value_color: '#111827',
  card_specs_font_family: 'system-ui',
  card_specs_label_font_size: '11px',
  card_specs_value_font_size: '12px',
}

export default function useSiteSettings() {
  const siteSettings = useState<SiteVisualSettings>('site-visual-settings', () => ({ ...defaults }))
  const loaded = useState<boolean>('site-visual-settings-loaded', () => false)
  const supabase = useSupabaseClient()

  const fetchSiteSettings = async () => {
    if (loaded.value) return
    try {
      const { data } = await supabase
        .from('pdf_settings')
        .select('layout_settings')
        .eq('category', 'GERAL')
        .single()

      if (data?.layout_settings?.site_settings) {
        const saved = data.layout_settings.site_settings
        const merged = { ...defaults }
        Object.keys(defaults).forEach(key => {
          if (saved[key] !== undefined) {
            (merged as any)[key] = saved[key]
          }
        })
        siteSettings.value = merged
      }
      loaded.value = true
    } catch (e) {
      console.error('[useSiteSettings] Error loading site settings:', e)
    }
  }

  return {
    siteSettings,
    fetchSiteSettings,
  }
}
