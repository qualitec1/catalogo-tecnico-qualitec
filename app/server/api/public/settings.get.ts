import { defineEventHandler } from 'h3'
import { supabaseAdmin } from '../../utils/supabaseAdmin'

// 1. Colunas de nível superior estritamente permitidas e consultadas no Supabase
export const ALLOWED_TOP_LEVEL_COLUMNS = [
  'id', 'category', 'orientation', 'title_font_size', 'title_position_y',
  'image_position', 'card_layout_order', 'font_size_specs', 'divider_line_color',
  'product_spacing', 'product_image_offset_y', 'product_image_offset_x',
  'pdf_image_scale', 'pdf_image_scale_x', 'pdf_image_scale_y', 'card_offset_x',
  'card_offset_y', 'card_title_offset_x', 'card_title_offset_y',
  'card_title_font_family', 'card_title_bold', 'card_title_italic',
  'card_title_underline', 'card_model_font_size', 'card_model_offset_x',
  'card_model_offset_y', 'card_model_font_family', 'card_model_bold',
  'card_model_italic', 'card_model_underline', 'tag_font_family',
  'tag_font_size', 'tag_bold', 'tag_italic', 'tag_underline', 'tag_offset_x',
  'tag_offset_y', 'title_font_family', 'title_bold', 'title_italic',
  'title_underline', 'specs_font_family', 'specs_bold', 'specs_italic',
  'specs_underline', 'specs_label_width', 'specs_value_width',
  'specs_padding_y', 'specs_line_style', 'specs_line_color', 'created_at',
  'logo_width', 'logo_height', 'logo_position_x', 'logo_position_y',
  'landscape_settings', 'specs_val_bold', 'specs_val_italic',
  'specs_val_underline', 'card_header_layout', 'specs_bg_color',
  'title_color', 'card_model_label_font_size', 'card_model_label_offset_x',
  'card_model_label_offset_y', 'card_model_label_font_family',
  'card_model_label_bold', 'card_model_label_italic',
  'card_model_label_underline', 'card_title_color', 'card_model_color',
  'card_model_label_color', 'tag_color', 'specs_color', 'specs_val_color',
  'cover_title_font_family', 'cover_title_font_size', 'cover_title_bold',
  'cover_title_italic', 'cover_title_underline', 'cover_title_color',
  'cover_title_offset_x', 'cover_title_offset_y', 'cover_subtitle_text',
  'cover_subtitle_font_family', 'cover_subtitle_font_size',
  'cover_subtitle_bold', 'cover_subtitle_italic',
  'cover_subtitle_underline', 'cover_subtitle_color',
  'cover_subtitle_offset_x', 'cover_subtitle_offset_y', 'badge_icon_size',
  'badge_font_family', 'badge_font_size', 'badge_color', 'badge_position_x',
  'badge_position_y', 'badge_icon_offset_x', 'badge_icon_offset_y',
  'badge_text_offset_x', 'badge_text_offset_y', 'card_model_label_text',
  'card_title_font_size', 'booklet_pdf_image_scale',
  'booklet_pdf_image_scale_x', 'booklet_pdf_image_scale_y',
  'booklet_product_image_offset_x', 'booklet_product_image_offset_y',
  'layout_settings'
] as const

// 2. Chaves proibidas que nunca devem ser expostas publicamente (PII / Segredos)
const FORBIDDEN_KEYS = new Set([
  'contact_submissions', 'newsletter_subscribers', 'contacts', 'subscribers', 'leads',
  'password', 'token', 'secret', 'service_role', 'api_key', 'auth'
])

// 3. Sanitização profunda de blocos de slots e overrides de layout do PDF (e.g. slots '1', '3', '6')
function sanitizeSlotOverrides(raw: any): Record<string, any> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const clean: Record<string, any> = {}
  for (const key of Object.keys(raw)) {
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 80)
    if (!sanitizedKey) continue
    const val = raw[key]
    if (typeof val === 'string') {
      clean[sanitizedKey] = val.slice(0, 500)
    } else if (typeof val === 'number') {
      clean[sanitizedKey] = Number.isFinite(val) ? val : 0
    } else if (typeof val === 'boolean') {
      clean[sanitizedKey] = val
    }
  }
  return clean
}

// 4. Sanitização profunda de site_settings (Permite propriedades visuais escalares, bloqueia PII)
function sanitizeSiteSettings(raw: any): Record<string, any> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const clean: Record<string, any> = {}
  for (const key of Object.keys(raw)) {
    const lower = key.toLowerCase().trim()
    if (FORBIDDEN_KEYS.has(lower)) continue
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 80)
    if (!sanitizedKey) continue
    const val = raw[key]
    if (typeof val === 'string') {
      clean[sanitizedKey] = val.slice(0, 5000)
    } else if (typeof val === 'number') {
      clean[sanitizedKey] = Number.isFinite(val) ? val : 0
    } else if (typeof val === 'boolean') {
      clean[sanitizedKey] = val
    }
  }
  return clean
}

// 5. Sanitização profunda de category_button_groups
function sanitizeCategoryGroups(raw: any): Array<{ name: string; categories: string[] }> {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(g => g && typeof g === 'object' && typeof g.name === 'string')
    .map(g => ({
      name: String(g.name).slice(0, 100),
      categories: Array.isArray(g.categories) ? g.categories.map(c => String(c).slice(0, 100)) : []
    }))
}

// 6. Sanitização profunda de category_order
function sanitizeCategoryOrder(raw: any): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map(c => String(c).slice(0, 100))
}

// 7. Sanitização profunda de landscape_settings
function sanitizeLandscapeSettings(landscape: any): Record<string, any> | null {
  if (!landscape || typeof landscape !== 'object' || Array.isArray(landscape)) return null
  const clean: Record<string, any> = {}
  for (const key of Object.keys(landscape)) {
    const val = landscape[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      clean[key] = sanitizeSlotOverrides(val)
    } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      clean[key] = val
    }
  }
  return clean
}

// 8. Sanitização profunda do objeto layout_settings
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

  // Preservar todos os slots de layout do PDF ('1', '2', '3', '4', '6', 'custom', 'booklet', etc.)
  const slotKeys = Object.keys(layout).filter(k => /^[0-9]+$/.test(k) || ['custom', 'booklet', 'portrait', 'landscape'].includes(k))
  for (const slotKey of slotKeys) {
    clean[slotKey] = sanitizeSlotOverrides(layout[slotKey])
  }

  return clean
}

// 9. Construção determinística do DTO público com mapeamento explícito de campos
function buildPublicSettingDTO(row: any): Record<string, any> {
  const dto: Record<string, any> = {
    category: String(row.category || 'GERAL'),
    orientation: String(row.orientation || 'portrait'),
    layout_settings: sanitizeLayoutSettings(row.layout_settings)
  }

  if (row.landscape_settings) {
    dto.landscape_settings = sanitizeLandscapeSettings(row.landscape_settings)
  }

  for (const col of ALLOWED_TOP_LEVEL_COLUMNS) {
    if (col !== 'layout_settings' && col !== 'landscape_settings' && col !== 'category' && col !== 'orientation') {
      if (row[col] !== undefined && row[col] !== null) {
        dto[col] = row[col]
      }
    }
  }

  return dto
}

// 10. Handler Nitro Principal
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
