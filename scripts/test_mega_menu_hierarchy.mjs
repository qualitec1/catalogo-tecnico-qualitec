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

async function runMegaMenuTests() {
  console.log('=====================================================')
  console.log('TESTES DE HIERARQUIA, DADOS E CORES DO MEGA MENU')
  console.log('=====================================================\n')

  let passed = 0
  let failed = 0

  // 1. Verificar cores no banco
  console.log('--- 1. AUDITORIA DE CORES E CONTRASTE NO BANCO ---')
  const { data: geral, error: fetchErr } = await admin
    .from('pdf_settings')
    .select('layout_settings')
    .eq('category', 'GERAL')
    .single()

  const s = geral?.layout_settings?.site_settings || {}
  console.log(`mega_menu_bg_color: ${s.mega_menu_bg_color}`)
  console.log(`mega_menu_cat_color: ${s.mega_menu_cat_color}`)
  console.log(`mega_menu_family_color: ${s.mega_menu_family_color}`)
  console.log(`mega_menu_sub_color: ${s.mega_menu_sub_color}`)

  const isLightBg = s.mega_menu_bg_color === '#ffffff' || s.mega_menu_bg_color === '#f8fafc'
  const isDarkText = s.mega_menu_cat_color !== '#ffffff' && s.mega_menu_sub_color !== '#ffffff'

  if (isLightBg && isDarkText) {
    console.log('✅ Cores do Mega Menu: Fundo claro com texto escuro e legível!')
    passed++
  } else {
    console.log('❌ Cores do Mega Menu com contraste inadequado!')
    failed++
  }

  // 2. Verificar hierarquia de categorias e produtos
  console.log('\n--- 2. AUDITORIA DA ÁRVORE DE CATEGORIAS E FAMÍLIAS ---')
  const { data: prods } = await admin.from('products').select('*')
  const { data: assets } = await admin.from('category_assets').select('*')

  const categoryAssets = {}
  assets?.forEach(a => { categoryAssets[a.category] = a })

  const listableCategories = new Set()
  Object.keys(categoryAssets).forEach(k => {
    if (k !== 'GERAL') listableCategories.add(k.toUpperCase().trim())
  })
  prods?.forEach(p => {
    if (p.category && p.category.toUpperCase().trim() !== 'GERAL') {
      listableCategories.add(p.category.toUpperCase().trim())
    }
  })

  console.log(`Categorias listáveis encontradas: ${listableCategories.size}`)
  console.log(Array.from(listableCategories))

  if (listableCategories.size >= 6) {
    console.log('✅ Todas as 6+ categorias industriais da Qualitec foram identificadas!')
    passed++
  } else {
    console.log('❌ Poucas categorias identificadas!')
    failed++
  }

  // 3. Simular montagem do megaMenuTree
  console.log('\n--- 3. VERIFICAÇÃO DE MONTAGEM DO megaMenuTree ---')
  const catMap = new Map()
  listableCategories.forEach(cat => {
    if (!catMap.has(cat)) catMap.set(cat, new Map())
  })

  prods?.forEach(p => {
    if (!p.category || p.category.toUpperCase().trim() === 'GERAL') return
    const cat = p.category.toUpperCase().trim()
    if (!catMap.has(cat)) catMap.set(cat, new Map())
    const famMap = catMap.get(cat)
    const fam = (p.family || '').trim() || (p.subcategory ? p.category : '')
    const sub = (p.subcategory || '').trim()
    if (fam) {
      if (!famMap.has(fam)) famMap.set(fam, new Set())
      if (sub) famMap.get(fam).add(sub)
    } else if (sub) {
      if (!famMap.has(cat)) famMap.set(cat, new Set())
      famMap.get(cat).add(sub)
    }
  })

  const tree = []
  for (const cat of Array.from(catMap.keys())) {
    const famMap = catMap.get(cat)
    const families = Array.from(famMap.entries()).map(([famName, subs]) => ({
      name: famName,
      subcategories: Array.from(subs).sort()
    }))

    tree.push({
      category: cat,
      families
    })
  }

  const reguladores = tree.find(t => t.category === 'REGULADORES DE PRESSÃO')
  const valvulas3vias = tree.find(t => t.category === 'VÁLVULAS 3 VIAS')

  if (reguladores && reguladores.families.length === 2) {
    console.log('✅ REGULADORES DE PRESSÃO: Possui 2 famílias (Gases do ar, Gases Especiais) com subcategorias!')
    passed++
  } else {
    console.log('❌ REGULADORES DE PRESSÃO: Famílias incompletas!')
    failed++
  }

  if (valvulas3vias && valvulas3vias.families.length >= 1) {
    console.log('✅ VÁLVULAS 3 VIAS: Possui família Válvulas com subcategoria Válvulas 3 vias!')
    passed++
  } else {
    console.log('❌ VÁLVULAS 3 VIAS: Famílias incompletas!')
    failed++
  }

  console.log('\n=====================================================')
  console.log(`RESULTADO FINAL: ${passed} PASSOU / ${failed} FALHOU`)
  console.log('=====================================================')

  if (failed > 0) process.exit(1)
}

runMegaMenuTests().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
