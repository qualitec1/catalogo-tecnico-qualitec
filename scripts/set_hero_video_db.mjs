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

async function setHeroVideoConfig() {
  console.log('--- CONFIGURANDO HERO VIDEO OFICIAL NO BANCO DE DADOS ---')
  const { data: geral, error: fetchErr } = await admin
    .from('pdf_settings')
    .select('id, layout_settings')
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
    hero_bg_type: 'video',
    hero_bg_video_url: 'https://video.wixstatic.com/video/e6a741_2b669bc80a4a48fd9ada437c1e0827b7/720p/mp4/file.mp4',
    hero_bg_image_url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_geral.png'
  }

  currentLayout.site_settings = updatedSiteSettings

  const { error: updateErr } = await admin
    .from('pdf_settings')
    .update({ layout_settings: currentLayout })
    .eq('category', 'GERAL')

  if (updateErr) {
    console.error('Falha ao atualizar configurações no banco:', updateErr)
    return
  }

  console.log('✅ hero_bg_type=video e hero_bg_video_url salvos com sucesso!')
}

setHeroVideoConfig().catch(console.error)
