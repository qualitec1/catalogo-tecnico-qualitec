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
  // Banner Principal (Hero Section)
  hero_bg_type: 'image' | 'video'
  hero_bg_image_url: string
  hero_bg_video_url: string
  hero_card_text: string
  hero_card_bg_color: string
  hero_card_text_color: string
  hero_card_position: 'left' | 'center' | 'right'
  hero_card_vertical_align: 'top' | 'center' | 'bottom'
  hero_card_position_mode: 'custom' | 'preset'
  hero_card_offset_x: number
  hero_card_offset_y: number
  hero_card_opacity: number
  hero_card_extend_bottom: boolean
  // Logotipo do Cabeçalho (Header Logo)
  header_logo_url: string
  header_logo_height: number
  header_logo_offset_x: number
  header_logo_offset_y: number
  // Imagens dos Cards de Principais Segmentos (Home)
  segment_img_criogenia: string
  segment_img_oleo_gas: string
  segment_img_sucroalcooleiro: string
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
  hero_bg_type: 'image',
  hero_bg_image_url: 'https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhXgSbL5PCfgd-rVegzYgpPNJgtHn0Ea6Nm0tVayzLhjzQkKmbYMugrdMebtxFro3tlHv1N8ozueW3IWAmerLpn5BMh0-V4suiSBYyv-_1zhWqzLrg3b4d-rpkTVAeU22eoHKYZCmNp_AZySP90gelzHtlnS-8x3nRmtLSJEw4C0yhBjOP0LTv8cqJJere8bX1erK4A1HpU_AQV5WthPlinuCGSknmAf4oBmhbRpEqOyxTA2YAMo',
  hero_bg_video_url: '',
  hero_card_text: '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “',
  hero_card_bg_color: '#74b934',
  hero_card_text_color: '#ffffff',
  hero_card_position: 'left',
  hero_card_vertical_align: 'center',
  hero_card_position_mode: 'custom',
  hero_card_offset_x: 18,
  hero_card_offset_y: 45,
  hero_card_opacity: 85,
  hero_card_extend_bottom: true,
  header_logo_url: 'https://lh3.googleusercontent.com/aida/AP1WRLvb_lGcigKW6su6LN_Xd0Bf0AXsewLIulAi0GxcP_qLjBKDQwKkr4TLJgHAmnOXZ_CnTBIs1fPQUk9wsPoaEnw1KIo3G_pm2AD72CQGZpdCmL0me0d5Nw3sO0Jq1oNeH0TPtE84vraycYx20zMTmWG9t98pFKFcZH8ovF5vpsN6YK6J2ZqjcN6pDWW8byB81uqO2z6Crk115D73Mm9qXI78ObCCnUJ9BmIfEJoVkKB3TB8-KPNPPQ8kG9Y',
  header_logo_height: 48,
  header_logo_offset_x: 0,
  header_logo_offset_y: 0,
  segment_img_criogenia: 'https://lh3.googleusercontent.com/aida/AP1WRLsDWV00WRL33tuhAG3BPA8GTPcBz-pfzYJ5QGz2_CFnkvCSprf16WTZORxqYJd3VFMaSLF81Wdm-S9-UEVYwRS6IZjDh4VV8WwGm6i7fTQgU4oSmP9IGxRBZnXvSg-lgNzx7dHLh96NV6al1sI8sdEOoVx6IZCUOcKyTMikgpuW736a8c-W4OfY41ayLpgc1yRxJm4ux29KF3X6Vl4DjzUrBJhQVrk6zwaVUJrs9k2kRxWzoaJlEeyRARs',
  segment_img_oleo_gas: 'https://lh3.googleusercontent.com/aida/AP1WRLtMAi3za4oatqWzMuvla-WvZQlt9FguAx22h8nx9U6lR8p142s5QcL4EPPE0ligkQbqZ0q-ZYW-hqDRV2uJVGv0NMmhiEuyzJbKk7sUfZpHHA4_sz8P-TyC7QparCuJFeAeovwFTiSEpumRpFGJg-y1rdhCKN1ensV_n46sSPNrBJMqn7MqzXsxs1FqEOTTk7iB0mQ42_IaiLxVLi8QHfDnmf1qJl39Y9bqn9spftMGhs_woAvKg85Vgk0',
  segment_img_sucroalcooleiro: 'https://lh3.googleusercontent.com/aida/AP1WRLtx-24uZLAzxnTShKPl8Wv12JS85bEMJBe8sqHO25f6hSfCDYWD7dOd3t0TS1qSXQfoEmpRejEnBgmszPULohKQhnktzaTJxNZlqCZtWMl_i2qHHdWBFpI5OD1WyuR3zn6bDrno3XOkEm5_52rNlHCVRUzbbVXx-6T9Fq-atHYsA-bfuEzXbOwh0ibv0HAdlvONto1p0-R41aQY_ZMMGGD6KANY4mawEiSd7OT1CHuJeCgTozkzRuxGGg',
}

export default function useSiteSettings() {
  const siteSettings = useState<SiteVisualSettings>('site-visual-settings', () => ({ ...defaults }))
  const loaded = useState<boolean>('site-visual-settings-loaded', () => false)
  const supabase = useSupabaseClient()

  const fetchSiteSettings = async (force = false) => {
    if (loaded.value && !force) return
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
