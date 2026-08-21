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

async function runMediaTests() {
  console.log('=== TESTE DE INTEGRIDADE E RENDERIZAÇÃO DE MÍDIA ===\n')

  let passed = 0
  let failed = 0

  async function checkUrl(label, url) {
    if (!url) {
      console.log(`❌ [${label}]: URL vazia`)
      failed++
      return
    }
    try {
      const res = await fetch(url)
      const contentType = res.headers.get('content-type') || ''
      const contentLength = res.headers.get('content-length')
      if (res.status === 200 && (contentType.startsWith('image/') || contentType.startsWith('video/') || contentType.startsWith('application/pdf'))) {
        console.log(`✅ [${label}]: HTTP 200 (${contentType}, ${contentLength ? contentLength + ' bytes' : 'stream'})`)
        passed++
      } else {
        console.log(`❌ [${label}]: HTTP ${res.status} (${contentType}) - URL: ${url.slice(0, 80)}...`)
        failed++
      }
    } catch (e) {
      console.log(`❌ [${label}]: Falha na requisição (${e.message})`)
      failed++
    }
  }

  // 1. Configurações gerais do site (Header Logo, Hero, Segmentos)
  const { data: geral } = await admin
    .from('pdf_settings')
    .select('layout_settings')
    .eq('category', 'GERAL')
    .single()

  const siteSettings = geral?.layout_settings?.site_settings || {}

  console.log('--- 1. CONFIGURAÇÕES VISUAIS DO SITE (pdf_settings.layout_settings.site_settings) ---')
  await checkUrl('Header Logo', siteSettings.header_logo_url)
  await checkUrl('Hero Background Image', siteSettings.hero_bg_image_url)
  await checkUrl('Segmento Criogenia', siteSettings.segment_img_criogenia)
  await checkUrl('Segmento Óleo & Gás', siteSettings.segment_img_oleo_gas)
  await checkUrl('Segmento Sucroalcooleiro', siteSettings.segment_img_sucroalcooleiro)

  // 2. Novidades da Home
  console.log('\n--- 2. CARDS DE NOVIDADES (home_news_cards) ---')
  const { data: news } = await admin
    .from('home_news_cards')
    .select('*')
    .order('id', { ascending: true })

  for (const item of news || []) {
    await checkUrl(`Novidade: ${item.title_pt}`, item.image_url)
  }

  // 3. Capas de Categorias
  console.log('\n--- 3. CAPAS DE CATEGORIAS ---')
  const categoryCovers = [
    { name: 'Sistemas', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_sistemas.png' },
    { name: 'Tubos', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_tubos.png' },
    { name: 'Válvulas', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_valvulas.png' },
    { name: 'Instrumentação', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_instrumentacao.png' },
    { name: 'Sistemas de Incêndio', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_sistemas_de_incendio.png' },
    { name: 'Catálogo Geral', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_geral.png' }
  ]
  for (const cat of categoryCovers) {
    await checkUrl(`Capa ${cat.name}`, cat.url)
  }

  // 4. Imagens de Amostra de Produtos
  console.log('\n--- 4. IMAGENS REPRESENTATIVAS DE PRODUTOS ---')
  const sampleProducts = [
    { name: 'Válvula de alívio criogênica', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_1_valvula_de_alivio_criogenica.png' },
    { name: 'Válvula de segurança criogênica', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_2_valvula_de_seguranca_criogenica.png' },
    { name: 'Painel regulador PRPD', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_3_painel_regulador_prpd.png' },
    { name: 'Canhão monitor de água', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_10_canhao_monitor_de_agua.png' },
    { name: 'Válvula dilúvio', url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_9_valvula_diluvio.png' }
  ]
  for (const prod of sampleProducts) {
    await checkUrl(`Produto: ${prod.name}`, prod.url)
  }

  console.log(`\n========================================`)
  console.log(`RESULTADO FINAL: ${passed} PASSOU / ${failed} FALHOU`)
  console.log(`========================================`)

  if (failed > 0) {
    process.exit(1)
  }
}

runMediaTests().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
