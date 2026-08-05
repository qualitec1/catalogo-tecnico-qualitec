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
  // Arredondamento e Espaçamento dos Cards do Catálogo
  card_border_radius: number
  catalog_grid_gap_x: number
  catalog_grid_gap_y: number
  // Barra do Mega Menu (Header do Catálogo)
  mega_menu_bg_color: string
  mega_menu_height: number
  // Botões de Categoria (Abas no Header)
  mega_menu_cat_font_family: string
  mega_menu_cat_font_size: number
  mega_menu_cat_color: string
  mega_menu_cat_bold: boolean
  mega_menu_cat_italic: boolean
  mega_menu_cat_uppercase: boolean
  // Família no Mega Menu
  mega_menu_family_font_family: string
  mega_menu_family_font_size: number
  mega_menu_family_color: string
  mega_menu_family_bold: boolean
  mega_menu_family_italic: boolean
  mega_menu_family_uppercase: boolean
  // Subcategoria no Mega Menu
  mega_menu_sub_font_family: string
  mega_menu_sub_font_size: number
  mega_menu_sub_color: string
  mega_menu_sub_bold: boolean
  mega_menu_sub_italic: boolean
  mega_menu_sub_uppercase: boolean
  // Banner Principal (Hero Section)
  hero_bg_type: 'image' | 'video'
  hero_bg_image_url: string
  hero_bg_video_url: string
  hero_card_text: string
  hero_card_text_pt: string
  hero_card_text_en: string
  hero_card_text_es: string
  hero_card_text_offset_y: number
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
  // Cores e Dimensões das Seções da Home
  sec_segmentos_bg: string
  sec_segmentos_ptop: number
  sec_segmentos_pbot: number
  sec_segmentos_min_height: number
  sec_novidades_bg: string
  sec_novidades_ptop: number
  sec_novidades_pbot: number
  sec_novidades_min_height: number
  sec_newsletter_bg: string
  sec_newsletter_ptop: number
  sec_newsletter_pbot: number
  sec_newsletter_min_height: number
  // Cards de Principais Segmentos
  seg_card_img_height: number
  seg_caption_bg: string
  seg_caption_opacity: number
  seg_caption_height: number
  seg_caption_color: string
  // Cards de Novidades
  news_card_height: number
  news_img_height: number
  news_caption_bg: string
  news_caption_opacity: number
  news_caption_height: number
  news_caption_color: string
  // Rodapé (Footer)
  footer_bg: string
  footer_ptop: number
  footer_pbot: number
  footer_border_top_color: string
  // 11 Frases do Rodapé
  footer_p1_text: string
  footer_p1_font: string
  footer_p1_size: number
  footer_p1_color: string
  footer_p1_offset_x: number
  footer_p1_offset_y: number
  footer_p1_bold: boolean
  footer_p1_italic: boolean
  footer_p2_text: string
  footer_p2_font: string
  footer_p2_size: number
  footer_p2_color: string
  footer_p2_offset_x: number
  footer_p2_offset_y: number
  footer_p2_bold: boolean
  footer_p2_italic: boolean
  footer_p3_text: string
  footer_p3_font: string
  footer_p3_size: number
  footer_p3_color: string
  footer_p3_offset_x: number
  footer_p3_offset_y: number
  footer_p3_bold: boolean
  footer_p3_italic: boolean
  footer_p4_text: string
  footer_p4_font: string
  footer_p4_size: number
  footer_p4_color: string
  footer_p4_offset_x: number
  footer_p4_offset_y: number
  footer_p4_bold: boolean
  footer_p4_italic: boolean
  footer_p5_text: string
  footer_p5_font: string
  footer_p5_size: number
  footer_p5_color: string
  footer_p5_offset_x: number
  footer_p5_offset_y: number
  footer_p5_bold: boolean
  footer_p5_italic: boolean
  footer_p6_text: string
  footer_p6_font: string
  footer_p6_size: number
  footer_p6_color: string
  footer_p6_offset_x: number
  footer_p6_offset_y: number
  footer_p6_bold: boolean
  footer_p6_italic: boolean
  footer_p7_text: string
  footer_p7_font: string
  footer_p7_size: number
  footer_p7_color: string
  footer_p7_offset_x: number
  footer_p7_offset_y: number
  footer_p7_bold: boolean
  footer_p7_italic: boolean
  footer_p8_text: string
  footer_p8_font: string
  footer_p8_size: number
  footer_p8_color: string
  footer_p8_offset_x: number
  footer_p8_offset_y: number
  footer_p8_bold: boolean
  footer_p8_italic: boolean
  footer_p9_text: string
  footer_p9_font: string
  footer_p9_size: number
  footer_p9_color: string
  footer_p9_offset_x: number
  footer_p9_offset_y: number
  footer_p9_bold: boolean
  footer_p9_italic: boolean
  footer_p10_text: string
  footer_p10_font: string
  footer_p10_size: number
  footer_p10_color: string
  footer_p10_offset_x: number
  footer_p10_offset_y: number
  footer_p10_bold: boolean
  footer_p10_italic: boolean
  footer_p11_text: string
  footer_p11_font: string
  footer_p11_size: number
  footer_p11_color: string
  footer_p11_offset_x: number
  footer_p11_offset_y: number
  footer_p11_bold: boolean
  footer_p11_italic: boolean
  // Página Nossa Empresa (Institucional)
  about_hero_bg_url?: string
  about_hero_bg_opacity?: number
  about_hero_badge_text?: string
  about_hero_title?: string
  about_hero_text?: string
  about_hero_btn_solutions_text?: string
  about_hero_btn_specialist_text?: string
  about_who_badge_text?: string
  about_who_title?: string
  about_who_text?: string
  about_who_img_url?: string
  about_who_bg_color?: string
  about_who_stat1_number?: string
  about_who_stat1_label?: string
  about_who_stat2_number?: string
  about_who_stat2_label?: string
  about_who_stat3_number?: string
  about_who_stat3_label?: string
  about_brands_title?: string
  about_brands_text?: string
  about_brands_bg_color?: string
  about_sectors_title?: string
  about_sectors_text?: string
  about_sectors_bg_color?: string
  about_why_title?: string
  about_why_text?: string
  about_why_bg_color?: string
  about_commitment_title?: string
  about_commitment_text?: string
  about_commitment_bg_color?: string
  about_cta_title?: string
  about_cta_text?: string
  about_cta_btn_quote_text?: string
  about_cta_btn_specialist_text?: string
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
  card_border_radius: 0,
  catalog_grid_gap_x: 20,
  catalog_grid_gap_y: 20,
  mega_menu_bg_color: '#1d1d1f',
  mega_menu_height: 44,
  mega_menu_cat_font_family: 'system-ui',
  mega_menu_cat_font_size: 12,
  mega_menu_cat_color: '#ffffff',
  mega_menu_cat_bold: true,
  mega_menu_cat_italic: false,
  mega_menu_cat_uppercase: true,
  mega_menu_family_font_family: 'system-ui',
  mega_menu_family_font_size: 12,
  mega_menu_family_color: '#6e6e73',
  mega_menu_family_bold: false,
  mega_menu_family_italic: false,
  mega_menu_family_uppercase: false,
  mega_menu_sub_font_family: 'system-ui',
  mega_menu_sub_font_size: 13,
  mega_menu_sub_color: '#1d1d1f',
  mega_menu_sub_bold: true,
  mega_menu_sub_italic: false,
  mega_menu_sub_uppercase: false,
  hero_bg_type: 'image',
  hero_bg_image_url: 'https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhXgSbL5PCfgd-rVegzYgpPNJgtHn0Ea6Nm0tVayzLhjzQkKmbYMugrdMebtxFro3tlHv1N8ozueW3IWAmerLpn5BMh0-V4suiSBYyv-_1zhWqzLrg3b4d-rpkTVAeU22eoHKYZCmNp_AZySP90gelzHtlnS-8x3nRmtLSJEw4C0yhBjOP0LTv8cqJJere8bX1erK4A1HpU_AQV5WthPlinuCGSknmAf4oBmhbRpEqOyxTA2YAMo',
  hero_bg_video_url: '',
  hero_card_text: '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “',
  hero_card_text_pt: '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “',
  hero_card_text_en: '“ Your daily challenge, we solve every day with safety and reliability “',
  hero_card_text_es: '“ Su desafío diario, lo resolvemos todos los días con seguridad y confiabilidad “',
  hero_card_text_offset_y: 0,
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
  sec_segmentos_bg: '#ffffff',
  sec_segmentos_ptop: 20,
  sec_segmentos_pbot: 24,
  sec_segmentos_min_height: 0,
  sec_novidades_bg: '#f0f0f0',
  sec_novidades_ptop: 36,
  sec_novidades_pbot: 44,
  sec_novidades_min_height: 0,
  sec_newsletter_bg: '#ffffff',
  sec_newsletter_ptop: 30,
  sec_newsletter_pbot: 40,
  sec_newsletter_min_height: 0,
  seg_card_img_height: 165,
  seg_caption_bg: '#ffffff',
  seg_caption_opacity: 82,
  seg_caption_height: 48,
  seg_caption_color: '#333333',
  news_card_height: 165,
  news_img_height: 165,
  news_caption_bg: '#ffffff',
  news_caption_opacity: 82,
  news_caption_height: 48,
  news_caption_color: '#333333',
  footer_bg: '#eeebe9',
  footer_ptop: 28,
  footer_pbot: 28,
  footer_border_top_color: '#c2c6d3',
  footer_p1_text: 'Qualitec C S I M Ltda',
  footer_p1_font: 'system-ui',
  footer_p1_size: 12,
  footer_p1_color: '#1c1b1b',
  footer_p1_offset_x: 0,
  footer_p1_offset_y: 0,
  footer_p1_bold: true,
  footer_p1_italic: false,
  footer_p2_text: 'Rua Fazenda Monte Alegre, 367',
  footer_p2_font: 'system-ui',
  footer_p2_size: 12,
  footer_p2_color: '#424751',
  footer_p2_offset_x: 0,
  footer_p2_offset_y: 0,
  footer_p2_bold: false,
  footer_p2_italic: false,
  footer_p3_text: '05160-060 - São Paulo - SP',
  footer_p3_font: 'system-ui',
  footer_p3_size: 12,
  footer_p3_color: '#424751',
  footer_p3_offset_x: 0,
  footer_p3_offset_y: 0,
  footer_p3_bold: false,
  footer_p3_italic: false,
  footer_p4_text: 'Tel: +55 11 3908 7100',
  footer_p4_font: 'system-ui',
  footer_p4_size: 12,
  footer_p4_color: '#424751',
  footer_p4_offset_x: 0,
  footer_p4_offset_y: 0,
  footer_p4_bold: false,
  footer_p4_italic: false,
  footer_p5_text: 'vendas@qualitecinstrumentos.com.br',
  footer_p5_font: 'system-ui',
  footer_p5_size: 12,
  footer_p5_color: '#004A96',
  footer_p5_offset_x: 0,
  footer_p5_offset_y: 0,
  footer_p5_bold: true,
  footer_p5_italic: false,
  footer_p6_text: 'Todos os direitos reservados - 2024',
  footer_p6_font: 'system-ui',
  footer_p6_size: 11,
  footer_p6_color: '#888888',
  footer_p6_offset_x: 0,
  footer_p6_offset_y: 0,
  footer_p6_bold: false,
  footer_p6_italic: false,
  footer_p7_text: 'Representante Exclusivo',
  footer_p7_font: 'system-ui',
  footer_p7_size: 12,
  footer_p7_color: '#1c1b1b',
  footer_p7_offset_x: 0,
  footer_p7_offset_y: 0,
  footer_p7_bold: true,
  footer_p7_italic: false,
  footer_p8_text: 'HEROSE GmbH',
  footer_p8_font: 'system-ui',
  footer_p8_size: 12,
  footer_p8_color: '#424751',
  footer_p8_offset_x: 0,
  footer_p8_offset_y: 0,
  footer_p8_bold: false,
  footer_p8_italic: false,
  footer_p9_text: 'Generant Inc',
  footer_p9_font: 'system-ui',
  footer_p9_size: 12,
  footer_p9_color: '#424751',
  footer_p9_offset_x: 0,
  footer_p9_offset_y: 0,
  footer_p9_bold: false,
  footer_p9_italic: false,
  footer_p10_text: 'DataOnline LLC',
  footer_p10_font: 'system-ui',
  footer_p10_size: 12,
  footer_p10_color: '#424751',
  footer_p10_offset_x: 0,
  footer_p10_offset_y: 0,
  footer_p10_bold: false,
  footer_p10_italic: false,
  footer_p11_text: 'Como posso lhe ajudar?',
  footer_p11_font: 'system-ui',
  footer_p11_size: 14,
  footer_p11_color: '#ffffff',
  footer_p11_offset_x: 0,
  footer_p11_offset_y: 0,
  footer_p11_bold: true,
  footer_p11_italic: false,
  about_hero_bg_url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_1_valvula_de_alivio_criogenica.png',
  about_hero_bg_opacity: 70,
  about_hero_badge_text: 'QUALITEC C S I M LTDA | ENGENHARIA & INSTRUMENTAÇÃO',
  about_hero_title: 'Soluções técnicas para processos industriais críticos',
  about_hero_text: 'A Qualitec fornece instrumentação, válvulas e suporte técnico para aplicações que exigem segurança, precisão e confiabilidade.',
  about_hero_btn_solutions_text: 'Conheça nossas soluções',
  about_hero_btn_specialist_text: 'Fale com um especialista',
  about_who_badge_text: 'SOBRE A QUALITEC',
  about_who_title: 'Tecnologia, conhecimento técnico e atendimento próximo',
  about_who_text: 'A Qualitec C S I M Ltda atua no fornecimento de instrumentação industrial, válvulas e soluções para controle de pressão e processos. Com atendimento técnico-comercial especializado, conectamos indústrias brasileiras a equipamentos de alta confiabilidade para aplicações em criogenia, gases industriais, óleo & gás, energia, alimentos e outros processos críticos.',
  about_who_img_url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_1_valvula_de_alivio_criogenica.png',
  about_who_bg_color: '#ffffff',
  about_who_stat1_number: '100%',
  about_who_stat1_label: 'Suporte Técnico Especializado',
  about_who_stat2_number: 'CGA E4.1',
  about_who_stat2_label: 'Padrão de Limpeza Oxigênio',
  about_who_stat3_number: 'Global',
  about_who_stat3_label: 'Parceiros Internacionais',
  about_brands_title: 'Tecnologia global, suporte técnico local',
  about_brands_text: 'Trabalhamos com fabricantes reconhecidos internacionalmente, oferecendo produtos, documentação técnica e apoio para a definição da configuração mais adequada a cada processo.',
  about_brands_bg_color: '#f8fafc',
  about_sectors_title: 'Setores Atendidos',
  about_sectors_text: 'Equipamentos e válvulas configurados rigorosamente conforme os requisitos de cada segmento.',
  about_sectors_bg_color: '#ffffff',
  about_why_title: 'Por que escolher a Qualitec?',
  about_why_text: 'Combinamos portfólio de classe mundial, agilidade de atendimento e equipe de engenharia para apoiar sua planta em qualquer desafio.',
  about_why_bg_color: '#0f172a',
  about_commitment_title: 'Mais do que fornecer produtos, ajudamos a especificar soluções.',
  about_commitment_text: 'Cada processo possui requisitos próprios. Nossa equipe apoia a avaliação de pressão, temperatura, fluido, materiais, conexões, normas e certificações para que o equipamento selecionado seja adequado à operação.',
  about_commitment_bg_color: '#004A96',
  about_cta_title: 'Precisa de apoio para especificar seu equipamento?',
  about_cta_text: 'Nossa equipe está pronta para entender sua aplicação e indicar a solução mais adequada.',
  about_cta_btn_quote_text: 'Solicitar cotação',
  about_cta_btn_specialist_text: 'Falar com um especialista',
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
