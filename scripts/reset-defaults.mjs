import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/)
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
}

const supabaseUrl = env['SUPABASE_URL']
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['SUPABASE_KEY']
const headers = { 
  'apikey': supabaseKey, 
  'Authorization': `Bearer ${supabaseKey}`, 
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
}

async function run() {
  console.log('🔄 Iniciando redefinição das configurações de imagem para o padrão do sistema...')

  // 1. Reset products table
  try {
    console.log('  👉 Redefinindo tabela \'products\'...')
    const res = await fetch(`${supabaseUrl}/rest/v1/products?id=gt.0`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        image_scale: 1,
        image_offset_x: 0,
        image_offset_y: 0,
        booklet_image_scale: 1,
        booklet_image_offset_x: 0,
        booklet_image_offset_y: 0
      })
    })

    if (res.ok) {
      console.log('  ✅ Tabela \'products\' redefinida com sucesso para os padrões.')
    } else {
      const errText = await res.text()
      console.error(`  ❌ Erro ao redefinir \'products\': ${res.status} - ${errText}`)
    }
  } catch (err) {
    console.error('  ❌ Falha de rede ao redefinir \'products\':', err)
  }

  // 2. Reset pdf_settings table
  try {
    console.log('  👉 Buscando registros de \'pdf_settings\'...')
    const fetchRes = await fetch(`${supabaseUrl}/rest/v1/pdf_settings?select=*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    if (fetchRes.ok) {
      const rows = await fetchRes.json()
      console.log(`  🔍 Encontrados ${rows.length} registros em \'pdf_settings\'. Ajustando...`)

      for (const row of rows) {
        const updatedLayoutSettings = row.layout_settings ? { ...row.layout_settings } : {}
        
        for (const layoutId in updatedLayoutSettings) {
          if (updatedLayoutSettings[layoutId]) {
            updatedLayoutSettings[layoutId].productImageOffsetX = "0"
            updatedLayoutSettings[layoutId].productImageOffsetY = "0"
            if (updatedLayoutSettings[layoutId].pdfImageScale !== undefined) updatedLayoutSettings[layoutId].pdfImageScale = 1
            if (updatedLayoutSettings[layoutId].pdfImageScaleX !== undefined) updatedLayoutSettings[layoutId].pdfImageScaleX = 1
            if (updatedLayoutSettings[layoutId].pdfImageScaleY !== undefined) updatedLayoutSettings[layoutId].pdfImageScaleY = 1
          }
        }

        const updateBody = {
          product_image_offset_x: "0px",
          product_image_offset_y: "0px",
          pdf_image_scale: 1,
          pdf_image_scale_x: 1,
          pdf_image_scale_y: 1,
          booklet_product_image_offset_x: "0px",
          booklet_product_image_offset_y: "0px",
          booklet_pdf_image_scale: 1,
          booklet_pdf_image_scale_x: 1,
          booklet_pdf_image_scale_y: 1,
          layout_settings: updatedLayoutSettings
        }

        const updateRes = await fetch(`${supabaseUrl}/rest/v1/pdf_settings?id=eq.${row.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updateBody)
        })

        if (updateRes.ok) {
          console.log(`    ✅ Configuração de PDF para a categoria '${row.category}' redefinida com sucesso.`)
        } else {
          const errText = await updateRes.text()
          console.warn(`    ⚠️ Erro ao atualizar categoria '${row.category}': ${updateRes.status} - ${errText}`)
        }
      }
    } else {
      const errText = await fetchRes.text()
      console.error(`  ❌ Erro ao buscar \'pdf_settings\': ${fetchRes.status} - ${errText}`)
    }
  } catch (err) {
    console.error('  ❌ Falha de rede ao redefinir \'pdf_settings\':', err)
  }

  console.log('\n🎉 Redefinição concluída!')
}

run()
