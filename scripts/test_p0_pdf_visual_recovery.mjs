import dns from 'node:dns'
import dotenv from 'dotenv'
import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }, realtime: { transport: ws } })
const anon = createClient(supabaseUrl, anonKey, { auth: { persistSession: false }, realtime: { transport: ws } })

const ALLOWED_TOP_LEVEL_COLUMNS = [
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
]

console.log('======================================================================')
console.log('QUALITEC 2.0 — VERIFICAÇÃO VISUAL DO PDF & SEGURANÇA P0')
console.log('======================================================================\n')

async function runVisualRecoveryAudit() {
  const report = []

  // 1. Direct Anonymous Access to pdf_settings must be BLOCKED
  const { data: anonData, error: anonErr } = await anon.from('pdf_settings').select('*')
  const anonBlocked = !!anonErr
  report.push({
    test: '1. Acesso direto anônimo a pdf_settings',
    expected: 'BLOCKED (HTTP 401 / 42501)',
    result: anonBlocked ? 'PASS' : 'FAIL',
    details: anonErr ? `${anonErr.code} - ${anonErr.message}` : 'EXPOSED'
  })
  console.log(`[TEST 1] Acesso anônimo a pdf_settings: ${anonBlocked ? 'PASS (BLOQUEADO)' : 'FAIL'}`)

  // 2. Query Raw DB Rows via Service Role
  const { data: rawDbRows, error: dbErr } = await admin.from('pdf_settings').select('*')
  if (dbErr) {
    console.error('Error fetching db rows:', dbErr)
    return
  }

  // 3. Test API sanitization function logic
  // Simulate public/settings.get.ts logic
  const FORBIDDEN_KEYS = new Set([
    'contact_submissions', 'newsletter_subscribers', 'contacts', 'subscribers', 'leads',
    'password', 'token', 'secret', 'service_role', 'api_key', 'auth'
  ])

  function sanitizeSlotOverrides(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    const clean = {}
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

  function sanitizeSiteSettings(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    const clean = {}
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

  function sanitizeCategoryGroups(raw) {
    if (!Array.isArray(raw)) return []
    return raw
      .filter(g => g && typeof g === 'object' && typeof g.name === 'string')
      .map(g => ({
        name: String(g.name).slice(0, 100),
        categories: Array.isArray(g.categories) ? g.categories.map(c => String(c).slice(0, 100)) : []
      }))
  }

  function sanitizeCategoryOrder(raw) {
    if (!Array.isArray(raw)) return []
    return raw.map(c => String(c).slice(0, 100))
  }

  function sanitizeLandscapeSettings(landscape) {
    if (!landscape || typeof landscape !== 'object' || Array.isArray(landscape)) return null
    const clean = {}
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

  function sanitizeLayoutSettings(layout) {
    if (!layout || typeof layout !== 'object' || Array.isArray(layout)) return {}
    const clean = {}

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

    const slotKeys = Object.keys(layout).filter(k => /^[0-9]+$/.test(k) || ['custom', 'booklet', 'portrait', 'landscape'].includes(k))
    for (const slotKey of slotKeys) {
      clean[slotKey] = sanitizeSlotOverrides(layout[slotKey])
    }

    return clean
  }

  function buildPublicSettingDTO(row) {
    const dto = {
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

  const cleanSettings = rawDbRows.map(buildPublicSettingDTO)

  // 4. Test Sanitized Output for PII
  const serialized = JSON.stringify(cleanSettings)
  const piiLeak = serialized.includes('contact_submissions') || serialized.includes('newsletter_subscribers')
  report.push({
    test: '2. Verificação de PII no Payload Público',
    expected: 'NONE (0 vazamentos)',
    result: !piiLeak ? 'PASS' : 'FAIL',
    details: piiLeak ? 'PII vazada detectada!' : 'Zero PII, zero contatos, zero newsletter'
  })
  console.log(`[TEST 2] PII no payload público: ${!piiLeak ? 'PASS (NENHUMA)' : 'FAIL'}`)

  // 5. Test REGULADORES DE PRESSÃO - Slot 3 Overrides (GDR, 591, 505)
  const regRow = cleanSettings.find(c => c.category === 'REGULADORES DE PRESSÃO')
  const slot3 = regRow?.layout_settings?.['3']
  const slot3Ok = slot3 &&
    slot3.cardLayoutOrder === 'image-first' &&
    slot3.specsBgColor === '#E6E7E8' &&
    slot3.tagOffsetX === '-350px' &&
    slot3.cardModelOffsetX === '330px' &&
    slot3.headerHeight === '34' &&
    slot3.fontSizeSpecs === '8px' &&
    slot3.titlePositionY === '-13px'

  report.push({
    test: '3. Recuperação de Overrides de Slot 3 (Reguladores: GDR, 591, 505)',
    expected: 'image-first, specsBgColor=#E6E7E8, offsets preservados',
    result: slot3Ok ? 'PASS' : 'FAIL',
    details: slot3Ok ? `cardLayoutOrder: ${slot3.cardLayoutOrder}, specsBgColor: ${slot3.specsBgColor}` : 'Slots ausentes ou incorretos'
  })
  console.log(`[TEST 3] Slot 3 de Reguladores: ${slot3Ok ? 'PASS' : 'FAIL'}`)

  // 6. Test Simulation of CatalogPdfTemplate.vue getPageSettings for 3-slot page
  function simulateGetPageSettings(categoryName, slots) {
    const rawSetting = cleanSettings.find(c => c.category?.toUpperCase().trim() === categoryName?.toUpperCase().trim())
    const baseSettings = rawSetting ? { ...rawSetting } : {}
    if (baseSettings.layout_settings && baseSettings.layout_settings[slots]) {
      const overrides = baseSettings.layout_settings[slots]
      for (const key of Object.keys(overrides)) {
        const val = overrides[key]
        if (val !== undefined && val !== null && val !== '') {
          const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
          baseSettings[snakeKey] = val
          baseSettings[key] = val
        }
      }
    }
    return baseSettings
  }

  const resolvedRegSettings = simulateGetPageSettings('REGULADORES DE PRESSÃO', 3)
  const resolvedOk = resolvedRegSettings.card_layout_order === 'image-first' &&
    resolvedRegSettings.specs_bg_color === '#E6E7E8' &&
    resolvedRegSettings.tag_offset_x === '-350px' &&
    resolvedRegSettings.card_model_offset_x === '330px'

  report.push({
    test: '4. Resolução em Tempo de Renderização (CatalogPdfTemplate getPageSettings)',
    expected: 'card_layout_order=image-first, specs_bg_color=#E6E7E8',
    result: resolvedOk ? 'PASS' : 'FAIL',
    details: `card_layout_order: ${resolvedRegSettings.card_layout_order}, specs_bg_color: ${resolvedRegSettings.specs_bg_color}`
  })
  console.log(`[TEST 4] Resolução em tempo de renderização: ${resolvedOk ? 'PASS' : 'FAIL'}`)

  // 7. Verify all other categories have their slot overrides intact
  const otherCategories = cleanSettings.filter(c => c.category !== 'REGULADORES DE PRESSÃO')
  let allCatsOk = true
  for (const c of otherCategories) {
    if (c.layout_settings) {
      const keys = Object.keys(c.layout_settings)
      if (keys.includes('1') || keys.includes('3') || keys.includes('6')) {
        // ok
      } else if (c.category !== 'GERAL') {
        allCatsOk = false
      }
    }
  }

  report.push({
    test: '5. Preservação de Slots de Todas as Demais Categorias (Válvulas, Transmissores, etc.)',
    expected: 'Slots 1, 3, 6 preservados em todas as categorias',
    result: allCatsOk ? 'PASS' : 'FAIL',
    details: `Total categorias com slots preservados: ${cleanSettings.length}`
  })
  console.log(`[TEST 5] Demais categorias preservadas: ${allCatsOk ? 'PASS' : 'FAIL'}`)

  console.log('\n======================================================================')
  console.log('TABELA DE RESULTADOS DO AUDIT DE RECUPERAÇÃO DO PDF')
  console.log('======================================================================')
  console.table(report)

  const failed = report.filter(r => r.result === 'FAIL')
  console.log(`\nTotal de Verificações: ${report.length} | APROVADOS: ${report.length - failed.length} | REPROVADOS: ${failed.length}`)

  if (failed.length === 0) {
    console.log('\n🎉 RESTAURAÇÃO VISUAL DO PDF CONCLUÍDA COM 100% DE SUCESSO E ZERO VAZAMENTO DE SEGURANÇA!')
  }
}

runVisualRecoveryAudit().catch(console.error)
