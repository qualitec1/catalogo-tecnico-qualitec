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

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }, realtime: { transport: ws } })

async function updateMegaMenuLightSettings() {
  console.log('--- ATUALIZANDO CONFIGURAÇÕES DE CORES CLARAS DO MEGA MENU NO BANCO ---')
  const { data: geral, error: fetchErr } = await admin
    .from('pdf_settings')
    .select('layout_settings')
    .eq('category', 'GERAL')
    .single()

  if (fetchErr || !geral) {
    console.error('Falha ao buscar GERAL:', fetchErr)
    return
  }

  const currentLayout = geral.layout_settings || {}
  const currentSiteSettings = currentLayout.site_settings || {}

  const updatedSiteSettings = {
    ...currentSiteSettings,
    mega_menu_bg_color: '#ffffff',
    mega_menu_height: 44,
    mega_menu_cat_color: '#1e293b',
    mega_menu_cat_bold: true,
    mega_menu_cat_uppercase: true,
    mega_menu_family_color: '#64748b',
    mega_menu_family_bold: true,
    mega_menu_family_uppercase: true,
    mega_menu_sub_color: '#0f172a',
    mega_menu_sub_bold: false,
    mega_menu_sub_uppercase: false,
    mega_menu_overlay_color: '#000000',
    mega_menu_overlay_opacity: 35,
    mega_menu_blur: 12
  }

  currentLayout.site_settings = updatedSiteSettings

  const { error: updateErr } = await admin
    .from('pdf_settings')
    .update({ layout_settings: currentLayout })
    .eq('category', 'GERAL')

  if (updateErr) {
    console.error('Falha ao salvar no banco:', updateErr)
    return
  }

  console.log('✅ Configurações do Mega Menu salvas com fundo claro e contraste perfeito!')
}

updateMegaMenuLightSettings().catch(console.error)
