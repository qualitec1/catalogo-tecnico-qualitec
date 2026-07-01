import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

import ws from 'ws'

// Helper to parse .env file manually
const parseEnv = () => {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found at:', envPath)
    process.exit(1)
  }
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const index = trimmed.indexOf('=')
    if (index === -1) return
    const key = trimmed.substring(0, index).trim()
    let val = trimmed.substring(index + 1).trim()
    // Strip quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1)
    }
    env[key] = val
  })
  return env
}

const env = parseEnv()

const SUPABASE_URL = env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase variables in .env. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  console.error('NOTE: You should use the SERVICE_ROLE_KEY to bypass Row Level Security during data import.')
  process.exit(1)
}

// Initialize Supabase Client with service_role key to bypass RLS
console.log('Connecting to Supabase at:', SUPABASE_URL)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: ws
  }
})

// Load migrated JSON backup
const backupPath = path.resolve(process.cwd(), 'database_backup.json')
if (!fs.existsSync(backupPath)) {
  console.error('Backup database_backup.json not found. Please run scripts/migrate-blobs-to-r2.mjs first.')
  process.exit(1)
}

console.log('Loading database_backup.json...')
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))

async function importBackup() {
  // 1. Import Category Assets
  if (backup.category_assets && backup.category_assets.length > 0) {
    console.log(`\nImporting ${backup.category_assets.length} category assets...`)
    for (const item of backup.category_assets) {
      console.log(`- Categoria: ${item.category}`)
      const { error } = await supabase.from('category_assets').upsert({
        id: item.id,
        category: item.category,
        cover_image_url: item.cover_image_url || null,
        cover_image_blob: null, // Always empty now
        color_hex: item.color_hex || '#005db7',
        created_at: item.created_at || new Date().toISOString()
      })
      if (error) {
        console.error(`Error importing category asset ${item.category}:`, error.message)
      }
    }
  }

  // 2. Import PDF Settings
  if (backup.pdf_settings && backup.pdf_settings.length > 0) {
    console.log(`\nImporting ${backup.pdf_settings.length} PDF layout settings...`)
    for (const item of backup.pdf_settings) {
      console.log(`- Configuração PDF para Categoria: ${item.category}`)
      // Prepare settings payload mapping keys
      const payload = {
        id: item.id,
        category: item.category,
        orientation: item.orientation || 'portrait',
        title_font_size: item.title_font_size || '36px',
        title_position_y: item.title_position_y || '0px',
        image_position: item.image_position || 'right',
        card_layout_order: item.card_layout_order || 'specs-first',
        font_size_specs: item.font_size_specs || '10px',
        divider_line_color: item.divider_line_color || '#cbd5e1',
        product_spacing: item.product_spacing || '24px',
        product_image_offset_y: item.product_image_offset_y || '0px',
        product_image_offset_x: item.product_image_offset_x || '0px',
        pdf_image_scale: item.pdf_image_scale !== undefined ? Number(item.pdf_image_scale) : 1.0,
        pdf_image_scale_x: item.pdf_image_scale_x !== undefined ? Number(item.pdf_image_scale_x) : 1.0,
        pdf_image_scale_y: item.pdf_image_scale_y !== undefined ? Number(item.pdf_image_scale_y) : 1.0,
        card_offset_x: item.card_offset_x || '0px',
        card_offset_y: item.card_offset_y || '0px',
        card_title_offset_x: item.card_title_offset_x || '0px',
        card_title_offset_y: item.card_title_offset_y || '0px',
        card_title_font_family: item.card_title_font_family || 'Inter',
        card_title_bold: !!item.card_title_bold,
        card_title_italic: !!item.card_title_italic,
        card_title_underline: !!item.card_title_underline,
        card_model_font_size: item.card_model_font_size || '24px',
        card_model_offset_x: item.card_model_offset_x || '0px',
        card_model_offset_y: item.card_model_offset_y || '0px',
        card_model_font_family: item.card_model_font_family || 'Inter',
        card_model_bold: !!item.card_model_bold,
        card_model_italic: !!item.card_model_italic,
        card_model_underline: !!item.card_model_underline,
        tag_font_family: item.tag_font_family || 'Inter',
        tag_font_size: item.tag_font_size || '10px',
        tag_bold: !!item.tag_bold,
        tag_italic: !!item.tag_italic,
        tag_underline: !!item.tag_underline,
        tag_offset_x: item.tag_offset_x || '0px',
        tag_offset_y: item.tag_offset_y || '0px',
        title_font_family: item.title_font_family || 'Inter',
        title_bold: !!item.title_bold,
        title_italic: !!item.title_italic,
        title_underline: !!item.title_underline,
        specs_font_family: item.specs_font_family || 'Inter',
        specs_bold: !!item.specs_bold,
        specs_italic: !!item.specs_italic,
        specs_underline: !!item.specs_underline,
        specs_label_width: item.specs_label_width || '45%',
        specs_value_width: item.specs_value_width || '55%',
        specs_padding_y: item.specs_padding_y || '4px',
        specs_line_style: item.specs_line_style || 'dashed',
        specs_line_color: item.specs_line_color || '#cbd5e1',
        layout_settings: item.layout_settings || {},
        created_at: item.created_at || new Date().toISOString()
      }
      
      const { error } = await supabase.from('pdf_settings').upsert(payload)
      if (error) {
        console.error(`Error importing pdf settings for category ${item.category}:`, error.message)
      }
    }
  }

  // 3. Import PDF Templates
  if (backup.pdf_templates && backup.pdf_templates.length > 0) {
    console.log(`\nImporting ${backup.pdf_templates.length} PDF templates...`)
    for (const item of backup.pdf_templates) {
      console.log(`- Template: ${item.name}`)
      const { error } = await supabase.from('pdf_templates').upsert({
        id: item.id,
        name: item.name,
        html_content: item.html_content,
        css_content: item.css_content || {},
        created_at: item.created_at || new Date().toISOString()
      })
      if (error) {
        console.error(`Error importing PDF template ${item.name}:`, error.message)
      }
    }
  }

  // 4. Import Products
  if (backup.products && backup.products.length > 0) {
    console.log(`\nImporting ${backup.products.length} products...`)
    for (const item of backup.products) {
      console.log(`- Produto: [${item.name_code}] ${item.title}`)
      const payload = {
        id: item.id,
        title: item.title,
        name_code: item.name_code,
        category: item.category,
        image: item.image || null,
        image_blob: null, // Always empty now
        datasheet_name: item.datasheet_name || null,
        datasheet_blob: null, // Always empty now
        datasheet_url: item.datasheet_url || null,
        tag: item.tag || 'NOVO',
        tag_color_class: item.tag_color_class || 'text-[#005db7]',
        bg_class: item.bg_class || 'bg-secondary',
        layout_slots: item.layout_slots || 3,
        card_layout: item.card_layout || null,
        specs: item.specs || [],
        image_scale: item.image_scale !== undefined ? Number(item.image_scale) : 1.0,
        image_offset_x: item.image_offset_x !== undefined ? Number(item.image_offset_x) : 0.0,
        image_offset_y: item.image_offset_y !== undefined ? Number(item.image_offset_y) : 0.0,
        created_at: item.created_at || new Date().toISOString()
      }

      const { error } = await supabase.from('products').upsert(payload)
      if (error) {
        console.error(`Error importing product ${item.title}:`, error.message)
      }
    }
  }

  console.log('\n--- Import Completed! ---')
  console.log('All available catalog data has been uploaded to Supabase.')
}

importBackup().catch((err) => {
  console.error('Import failed:', err)
})
