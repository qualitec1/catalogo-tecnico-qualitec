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

async function updateGeralMediaSettings() {
  console.log('--- ATUALIZANDO URLS DE MÍDIA NA CATEGORIA GERAL DO BANCO ---')

  const { data: geral, error: fetchErr } = await admin
    .from('pdf_settings')
    .select('id, layout_settings')
    .eq('category', 'GERAL')
    .single()

  if (fetchErr || !geral) {
    console.error('Falha ao buscar registro GERAL:', fetchErr)
    return
  }

  const currentLayout = geral.layout_settings || {}
  const currentSiteSettings = currentLayout.site_settings || {}

  const updatedSiteSettings = {
    ...currentSiteSettings,
    header_logo_url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/1785536986887_0a3ga6_qualitec_logo.png',
    hero_bg_image_url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_geral.png',
    segment_img_criogenia: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_valvulas.png',
    segment_img_oleo_gas: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_instrumentacao.png',
    segment_img_sucroalcooleiro: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_sistemas.png'
  }

  currentLayout.site_settings = updatedSiteSettings

  const { error: updateErr } = await admin
    .from('pdf_settings')
    .update({
      layout_settings: currentLayout
    })
    .eq('category', 'GERAL')

  if (updateErr) {
    console.error('Falha ao atualizar GERAL no banco:', updateErr)
    return
  }

  console.log('✅ Configurações de mídia atualizadas no banco com URLs R2 permanentes!')
}

updateGeralMediaSettings().catch(console.error)
