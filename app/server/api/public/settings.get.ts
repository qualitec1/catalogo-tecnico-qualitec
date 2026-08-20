import { defineEventHandler } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'

// 1. Colunas de nível superior estritamente permitidas e consultadas no Supabase
export const ALLOWED_TOP_LEVEL_COLUMNS = [
  'id',
  'category',
  'orientation',
  'title_font_size',
  'title_position_y',
  'image_position',
  'card_layout_order',
  'font_size_specs',
  'divider_line_color',
  'product_spacing',
  'product_image_offset_y',
  'product_image_offset_x',
  'pdf_image_scale',
  'pdf_image_scale_x',
  'pdf_image_scale_y',
  'card_offset_x',
  'card_offset_y',
  'card_title_offset_x',
  'card_title_offset_y',
  'card_title_font_family',
  'card_title_bold',
  'card_title_italic',
  'card_title_underline',
  'card_model_font_size',
  'card_model_offset_x',
  'card_model_offset_y',
  'card_model_font_family',
  'card_model_bold',
  'card_model_italic',
  'card_model_underline',
  'tag_font_family',
  'tag_font_size',
  'tag_bold',
  'tag_italic',
  'tag_underline',
  'tag_offset_x',
  'tag_offset_y',
  'title_font_family',
  'title_bold',
  'title_italic',
  'title_underline',
  'specs_font_family',
  'specs_bold',
  'specs_italic',
  'specs_underline',
  'specs_label_width',
  'specs_value_width',
  'specs_padding_y',
  'specs_line_style',
  'specs_line_color',
  'layout_settings',
  'created_at'
] as const

// 2. Propriedades visuais estritamente permitidas no objeto site_settings
const ALLOWED_SITE_SETTINGS_KEYS = [
  'btn_doc_bg_color', 'btn_doc_hover_color', 'btn_doc_text_color', 'btn_doc_font_family',
  'btn_doc_font_size', 'btn_doc_bold', 'btn_doc_italic', 'btn_doc_uppercase',
  'btn_doc_border_radius', 'btn_doc_text', 'card_tag_font_size', 'card_tag_font_family',
  'card_tag_bold', 'card_tag_italic', 'card_specs_bg_color', 'card_specs_label_color',
  'card_specs_value_color', 'card_specs_font_family', 'card_specs_label_font_size',
  'card_specs_value_font_size', 'card_border_radius', 'catalog_grid_gap_x', 'catalog_grid_gap_y',
  'mega_menu_bg_color', 'mega_menu_height', 'mega_menu_blur', 'mega_menu_overlay_opacity',
  'mega_menu_overlay_color', 'mega_menu_cat_font_family', 'mega_menu_cat_font_size',
  'mega_menu_cat_color', 'mega_menu_cat_bold', 'mega_menu_cat_italic', 'mega_menu_cat_uppercase',
  'mega_menu_family_font_family', 'mega_menu_family_font_size', 'mega_menu_family_color',
  'mega_menu_family_bold', 'mega_menu_family_italic', 'mega_menu_family_uppercase',
  'company_name', 'logo_url', 'logo_width', 'logo_height', 'logo_mobile_width', 'logo_mobile_height'
] as const

// 3. Sanitização profunda de site_settings
function sanitizeSiteSettings(raw: any): Record<string, any> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const clean: Record<string, any> = {}
  for (const key of ALLOWED_SITE_SETTINGS_KEYS) {
    if (raw[key] !== undefined && raw[key] !== null) {
      const val = raw[key]
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        clean[key] = val
      }
    }
  }
  return clean
}

// 4. Sanitização profunda de category_button_groups
function sanitizeCategoryGroups(raw: any): Array<{ name: string; categories: string[] }> {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(g => g && typeof g === 'object' && typeof g.name === 'string')
    .map(g => ({
      name: String(g.name).slice(0, 100),
      categories: Array.isArray(g.categories) ? g.categories.map(c => String(c).slice(0, 100)) : []
    }))
}

// 5. Sanitização profunda de category_order
function sanitizeCategoryOrder(raw: any): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map(c => String(c).slice(0, 100))
}

// 6. Sanitização profunda do objeto layout_settings
function sanitizeLayoutSettings(layout: any): Record<string, any> {
  if (!layout || typeof layout !== 'object' || Array.isArray(layout)) return {}
  
  const clean: Record<string, any> = {}

  if (layout.site_settings) {
    clean.site_settings = sanitizeSiteSettings(layout.site_settings)
  }
  if (layout.category_order) {
    clean.category_order = sanitizeCategoryOrder(layout.category_order)
  }
  if (typeof layout.show_category_buttons === 'boolean') {
    clean.show_category_buttons = layout.show_category_buttons
  }
  if (layout.category_button_groups) {
    clean.category_button_groups = sanitizeCategoryGroups(layout.category_button_groups)
  }

  const allowedStringKeys = [
    'cover_title_pt', 'cover_title_en', 'cover_title_es', 'cover_title_de',
    'cover_subtitle_pt', 'cover_subtitle_en', 'cover_subtitle_es', 'cover_subtitle_de',
    'intro_image_url', 'header_text', 'footer_text'
  ]
  for (const k of allowedStringKeys) {
    if (typeof layout[k] === 'string') {
      clean[k] = layout[k].slice(0, 500)
    }
  }

  return clean
}

// 7. Construção determinística do DTO público com mapeamento explícito de campos
function buildPublicSettingDTO(row: any): Record<string, any> {
  const dto: Record<string, any> = {
    category: String(row.category || 'GERAL'),
    orientation: String(row.orientation || 'portrait'),
    layout_settings: sanitizeLayoutSettings(row.layout_settings)
  }

  for (const col of ALLOWED_TOP_LEVEL_COLUMNS) {
    if (col !== 'layout_settings' && col !== 'category' && col !== 'orientation') {
      if (row[col] !== undefined && row[col] !== null) {
        dto[col] = row[col]
      }
    }
  }

  return dto
}

// 8. Handler Nitro Principal
export default defineEventHandler(async () => {
  if (!supabaseAdmin) {
    console.warn('[PublicSettings] supabaseAdmin not initialized.')
    return { settings: [] }
  }

  try {
    const selectQuery = ALLOWED_TOP_LEVEL_COLUMNS.join(', ')
    const { data, error } = await supabaseAdmin
      .from('pdf_settings')
      .select(selectQuery)

    if (error) {
      console.warn('[PublicSettings] Error querying pdf_settings:', error.message)
      return { settings: [] }
    }

    const cleanSettings = (data || []).map(buildPublicSettingDTO)
    return { settings: cleanSettings }
  } catch (err: any) {
    console.error('[PublicSettings] Internal error:', err)
    return { settings: [] }
  }
})
