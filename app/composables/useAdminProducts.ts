import { ref } from 'vue'
import { sanitizeSpecValue } from '~/utils/pdfDocUtils'
import { cleanupDuplicateCategories } from './useAdminCategories'

export function useAdminProducts(triggerToast: (msg: string, type?: 'success' | 'error') => void) {
  const supabase = useSupabaseClient()
  const products = ref<any[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const importing = ref(false)
  const importError = ref<{ invalidCategories: { line: number; category: string }[], validCategories: string[] } | null>(null)

  const fetchProducts = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, tag, tag_color_class, name_code, title, image, datasheet_name, datasheet_url, bg_class, card_layout, category, specs, layout_slots, image_scale, image_offset_x, image_offset_y, ex_image_url')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true })
      if (error) throw error
      if (data) {
        products.value = data.map((item: any) => ({
          id: item.id,
          tag: item.tag || 'NOVO',
          tagColorClass: item.tag_color_class || 'text-[#005db7]',
          nameCode: item.name_code,
          title: item.title,
          description: '',
          image: item.image,
          imageBlob: null,
          datasheetName: item.datasheet_name,
          datasheetBlob: null,
          datasheetUrl: item.datasheet_url,
          bgClass: item.bg_class || 'bg-secondary',
          cardLayout: item.card_layout,
          category: item.category,
          specs: item.specs || [],
          layoutSlots: item.layout_slots || 3,
          imageScale: item.image_scale !== null ? Number(item.image_scale) : 1.0,
          imageOffsetX: item.image_offset_x !== null ? Number(item.image_offset_x) : 0,
          imageOffsetY: item.image_offset_y !== null ? Number(item.image_offset_y) : 0,
          bookletImageScale: item.booklet_image_scale !== null && item.booklet_image_scale !== undefined ? Number(item.booklet_image_scale) : 1.0,
          bookletImageOffsetX: item.booklet_image_offset_x !== null && item.booklet_image_offset_x !== undefined ? Number(item.booklet_image_offset_x) : 0,
          bookletImageOffsetY: item.booklet_image_offset_y !== null && item.booklet_image_offset_y !== undefined ? Number(item.booklet_image_offset_y) : 0,
          exImageUrl: item.ex_image_url || null
        }))
      }
    } catch (err: any) {
      console.error('Error fetching products:', err)
      triggerToast(`Erro ao carregar produtos: ${err.message || err}`, 'error')
    } finally {
      loading.value = false
    }
  }

  const colorOptions = [
    { bgClass: 'bg-secondary', tagColor: 'text-[#005db7]', name: 'Azul' },
    { bgClass: 'bg-tertiary-container', tagColor: 'text-[#003d0b]', name: 'Verde' },
    { bgClass: 'bg-error', tagColor: 'text-[#ba1a1a]', name: 'Vermelho' },
    { bgClass: 'bg-primary-container', tagColor: 'text-[#003366]', name: 'Azul Escuro' }
  ]

  const saveNewProduct = async ({ product, colorIndex = 0 }: { product: any, colorIndex?: number }) => {
    saving.value = true
    try {
      const selectedColor = colorOptions[colorIndex] || colorOptions[0]
      const bgClass = product.bgClass || selectedColor.bgClass
      const tagColorClass = product.tagColorClass || selectedColor.tagColor
      const payload = {
        title: product.title,
        name_code: product.nameCode,
        category: product.category.toUpperCase().trim(),
        image: product.image || '/placeholder.png',
        datasheet_name: product.datasheetName || null,
        datasheet_url: product.datasheetUrl || null,
        tag: product.tag,
        tag_color_class: tagColorClass,
        bg_class: bgClass,
        layout_slots: product.layoutSlots,
        specs: (product.specs || []).map((s: any) => ({ label: s.label, value: sanitizeSpecValue(s.value, s.label) })),
        image_scale: product.imageScale || 1.0,
        image_offset_x: product.imageOffsetX || 0,
        image_offset_y: product.imageOffsetY || 0,
        booklet_image_scale: product.bookletImageScale !== undefined ? product.bookletImageScale : 1.0,
        booklet_image_offset_x: product.bookletImageOffsetX !== undefined ? product.bookletImageOffsetX : 0,
        booklet_image_offset_y: product.bookletImageOffsetY !== undefined ? product.bookletImageOffsetY : 0,
        ex_image_url: product.exImageUrl || null
      }

      const { error } = await supabase.from('products').insert([payload])
      if (error) throw error

      triggerToast('Equipamento cadastrado com sucesso!', 'success')
      await fetchProducts()
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao cadastrar produto: ${err.message}`, 'error')
    } finally {
      saving.value = false
    }
  }

  const saveProductEdit = async ({ product, colorIndex = 0 }: { product: any, colorIndex?: number }) => {
    saving.value = true
    try {
      const selectedColor = colorOptions[colorIndex] || colorOptions[0]
      const bgClass = product.bgClass || selectedColor.bgClass
      const tagColorClass = product.tagColorClass || selectedColor.tagColor
      const payload: any = {
        title: product.title,
        name_code: product.nameCode,
        category: product.category.toUpperCase().trim(),
        tag: product.tag,
        tag_color_class: tagColorClass,
        bg_class: bgClass,
        layout_slots: product.layoutSlots,
        specs: (product.specs || []).map((s: any) => ({ label: s.label, value: sanitizeSpecValue(s.value, s.label) })),
        image_scale: product.imageScale || 1.0,
        image_offset_x: product.imageOffsetX || 0,
        image_offset_y: product.imageOffsetY || 0,
        booklet_image_scale: product.bookletImageScale !== undefined ? product.bookletImageScale : 1.0,
        booklet_image_offset_x: product.bookletImageOffsetX !== undefined ? product.bookletImageOffsetX : 0,
        booklet_image_offset_y: product.bookletImageOffsetY !== undefined ? product.bookletImageOffsetY : 0,
        ex_image_url: product.exImageUrl || null
      }
      
      // Atualizar imagem se fornecida
      if (product.image) {
        payload.image = product.image
      }

      // Atualizar datasheet se fornecido
      if (product.datasheetUrl) {
        payload.datasheet_url = product.datasheetUrl
        payload.datasheet_name = product.datasheetName
      } else if (product.datasheetUrl === null) {
        // Remover datasheet explicitamente
        payload.datasheet_url = null
        payload.datasheet_name = null
      }

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id)
        
      if (error) throw error

      triggerToast('Equipamento atualizado com sucesso!', 'success')
      await fetchProducts()
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao atualizar produto: ${err.message}`, 'error')
    } finally {
      saving.value = false
    }
  }

  const deleteProduct = async (id: number) => {
    if (confirm('Deseja realmente remover este equipamento?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) throw error
        triggerToast('Equipamento removido do catálogo.', 'success')
        await fetchProducts()
      } catch (err: any) {
        console.error(err)
        triggerToast(`Erro ao remover produto: ${err.message || err}`, 'error')
      }
    }
  }

  const deleteMultipleProducts = async (ids: number[]) => {
    if (!ids || ids.length === 0) return
    if (confirm(`Deseja realmente remover os ${ids.length} equipamentos selecionados? Esta ação não pode ser desfeita.`)) {
      loading.value = true
      try {
        const { error } = await supabase.from('products').delete().in('id', ids)
        if (error) throw error
        triggerToast(`${ids.length} equipamentos removidos com sucesso!`, 'success')
        await fetchProducts()
      } catch (err: any) {
        console.error(err)
        triggerToast(`Erro ao remover equipamentos selecionados: ${err.message || err}`, 'error')
      } finally {
        loading.value = false
      }
    }
  }

  const deleteAllProducts = async () => {
    if (confirm('Deseja realmente remover TODOS os produtos do catálogo? Esta ação não pode ser desfeita.')) {
      loading.value = true
      try {
        const { error } = await supabase.from('products').delete().neq('id', 0)
        if (error) throw error
        triggerToast('Todos os produtos foram removidos do catálogo com sucesso!', 'success')
        await fetchProducts()
      } catch (err: any) {
        console.error(err)
        triggerToast(`Erro ao remover todos os produtos: ${err.message}`, 'error')
      } finally {
        loading.value = false
      }
    }
  }

  const parseFullCsv = (text: string, delimiter: string): string[][] => {
    const result: string[][] = []
    let currentRow: string[] = []
    let currentField = ''
    let inQuotes = false
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === delimiter && !inQuotes) {
        currentRow.push(currentField.trim())
        currentField = ''
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++
        }
        currentRow.push(currentField.trim())
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
          result.push(currentRow)
        }
        currentRow = []
        currentField = ''
      } else {
        currentField += char
      }
    }
    
    if (currentField !== '' || currentRow.length > 0) {
      currentRow.push(currentField.trim())
      result.push(currentRow)
    }
    
    return result
  }

  const handleCsvUpload = async (file: File) => {
    importing.value = true
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      if (!text || !text.trim()) {
        triggerToast('O arquivo CSV está vazio.', 'error')
        importing.value = false
        return
      }

      const delimiter = text.includes(';') ? ';' : ','
      const allRows = parseFullCsv(text, delimiter)
      if (allRows.length === 0) {
        triggerToast('O arquivo CSV está vazio.', 'error')
        importing.value = false
        return
      }

      // Buscar categorias válidas do banco
      let validCategories: Set<string>
      try {
        await cleanupDuplicateCategories(supabase)
        const { data: categoriesData, error: catError } = await supabase
          .from('pdf_settings')
          .select('category')
        
        if (catError) throw catError
        
        validCategories = new Set(
          (categoriesData || []).map((c: any) => c.category.toUpperCase().trim())
        )
        
        if (validCategories.size === 0) {
          triggerToast('Nenhuma categoria encontrada no sistema.', 'error')
          importing.value = false
          return
        }
      } catch (err: any) {
        console.error('Erro ao buscar categorias:', err)
        triggerToast(`Erro ao validar categorias: ${err.message}`, 'error')
        importing.value = false
        return
      }

      const headers = allRows[0]
      const parsedProducts = []
      const invalidCategories: { line: number, category: string }[] = []
      
      const cleanHeaders = headers.map(h => {
        let label = h.trim().replace(/^\uFEFF/, '')
        if ((label.startsWith('"') && label.endsWith('"')) || (label.startsWith("'") && label.endsWith("'"))) {
          label = label.slice(1, -1).trim()
        }
        return label.toLowerCase()
      })

      for (let i = 1; i < allRows.length; i++) {
        const values = allRows[i]
        if (values.length === 0 || (values.length === 1 && values[0] === '')) continue
        
        const row: Record<string, string> = {}
        cleanHeaders.forEach((cleanH, idx) => {
          let val = values[idx] !== undefined ? values[idx] : ''
          val = val.trim()
          // Only strip surrounding quotes if the cell is completely wrapped in a single pair of quotes
          if ((val.startsWith('"') && val.endsWith('"') && (val.match(/"/g) || []).length === 2) ||
              (val.startsWith("'") && val.endsWith("'") && (val.match(/'/g) || []).length === 2)) {
            val = val.slice(1, -1).trim()
          }
          row[cleanH] = val
        })
        
        const exAliases = ['ex_image_url', 'ex_url', 'ex_foto', 'foto_ex', 'ex']
        const coreColumns = ['title', 'name_code', 'category', 'tag', 'layout_slots', 'image_url', 'datasheet_url', 'specs', ...exAliases]
        const specs: { label: string, value: string }[] = []
        
        if (row['specs']) {
          row['specs'].split(';').filter(Boolean).forEach(s => {
            const parts = s.split(':')
            if (parts[0]) {
              const specLabel = parts[0].trim()
              const rawVal = parts[1] ? parts[1].trim() : ''
              specs.push({
                label: specLabel,
                value: sanitizeSpecValue(rawVal, specLabel)
              })
            }
          })
        }
        
        headers.forEach((originalH, idx) => {
          const cleanH = cleanHeaders[idx]
          if (!coreColumns.includes(cleanH) && row[cleanH]) {
            let origLabel = originalH.trim()
            if ((origLabel.startsWith('"') && origLabel.endsWith('"')) || (origLabel.startsWith("'") && origLabel.endsWith("'"))) {
              origLabel = origLabel.slice(1, -1).trim()
            }
            specs.push({
              label: origLabel,
              value: sanitizeSpecValue(row[cleanH], origLabel)
            })
          }
        })
        
        const csvSlots = parseInt(row['layout_slots']) || 3
        let dbLayoutSlots = 3
        if (csvSlots === 1) {
          dbLayoutSlots = 6
        } else if (csvSlots === 2) {
          dbLayoutSlots = 3
        } else if (csvSlots === 6) {
          dbLayoutSlots = 1
        }

        let exImageUrlVal: string | null = null
        for (const alias of exAliases) {
          if (row[alias]) {
            exImageUrlVal = row[alias].trim()
            break
          }
        }

        let rawCat = row['category'] ? row['category'].trim() : 'GERAL'
        const normRawCat = (rawCat || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        let categoryValue = rawCat.toUpperCase().trim()
        let detectedLang: string | null = null

        // Mapeamento de sinonimos e traducoes de categorias (Ex: VÁLVULAS DE SEGURIDAD -> VÁLVULAS DE SEGURANÇA)
        const categoryAliasesMap: Record<string, { base: string; lang: string }> = {
          '3-WAY VALVE': { base: 'VÁLVULAS 3 VIAS', lang: 'en' },
          '3-WAY VALVES': { base: 'VÁLVULAS 3 VIAS', lang: 'en' },
          '3 WAY VALVE': { base: 'VÁLVULAS 3 VIAS', lang: 'en' },
          '3 WAY VALVES': { base: 'VÁLVULAS 3 VIAS', lang: 'en' },
          'VÁLVULAS 3 VÍAS': { base: 'VÁLVULAS 3 VIAS', lang: 'es' },
          'VALVULAS 3 VIAS': { base: 'VÁLVULAS 3 VIAS', lang: 'pt' },

          'CRYOGENIC VALVE': { base: 'VÁLVULAS CRIOGÊNICAS', lang: 'en' },
          'CRYOGENIC VALVES': { base: 'VÁLVULAS CRIOGÊNICAS', lang: 'en' },
          'VÁLVULAS CRIOGÉNICAS': { base: 'VÁLVULAS CRIOGÊNICAS', lang: 'es' },
          'VALVULAS CRIOGENICAS': { base: 'VÁLVULAS CRIOGÊNICAS', lang: 'pt' },

          'SAFETY VALVE': { base: 'VÁLVULAS DE SEGURANÇA', lang: 'en' },
          'SAFETY VALVES': { base: 'VÁLVULAS DE SEGURANÇA', lang: 'en' },
          'VÁLVULAS DE SEGURIDAD': { base: 'VÁLVULAS DE SEGURANÇA', lang: 'es' },
          'VALVULAS DE SEGURIDAD': { base: 'VÁLVULAS DE SEGURANÇA', lang: 'es' },
          'VALVULAS DE SEGURANCA': { base: 'VÁLVULAS DE SEGURANÇA', lang: 'pt' },

          'GLOBE VALVE': { base: 'VÁLVULAS GLOBO', lang: 'en' },
          'GLOBE VALVES': { base: 'VÁLVULAS GLOBO', lang: 'en' },
          'VALVULAS GLOBO': { base: 'VÁLVULAS GLOBO', lang: 'pt' },

          'PRESSURE TRANSMITTER': { base: 'TRANSMISSORES DE PRESSÃO', lang: 'en' },
          'PRESSURE TRANSMITTERS': { base: 'TRANSMISSORES DE PRESSÃO', lang: 'en' },
          'TRANSMISORES DE PRESIÓN': { base: 'TRANSMISSORES DE PRESSÃO', lang: 'es' },
          'TRANSMISORES DE PRESION': { base: 'TRANSMISSORES DE PRESSÃO', lang: 'es' },
          'TRANSMISSORES DE PRESSAO': { base: 'TRANSMISSORES DE PRESSÃO', lang: 'pt' },

          'GERAL': { base: 'GERAL', lang: 'pt' },
          'GENERAL': { base: 'GERAL', lang: 'en' }
        }

        // 1. Check aliases map using normalized strings
        for (const [aliasKey, aliasData] of Object.entries(categoryAliasesMap)) {
          const normAlias = aliasKey
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          if (normAlias === normRawCat) {
            categoryValue = aliasData.base
            detectedLang = aliasData.lang
            break
          }
        }

        // 2. If no alias match, match normalized string against existing validCategories from DB
        if (!detectedLang) {
          for (const existingCat of validCategories) {
            const normExisting = existingCat
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
            if (normExisting === normRawCat) {
              categoryValue = existingCat
              break
            }
          }
        }

        // 3. Ensure explicit language spec exists in specs array
        const hasLangSpec = specs.some(s => {
          const lbl = (s.label || '').toLowerCase().trim()
          return lbl === 'idioma' || lbl === 'lang' || lbl === 'language' || lbl === 'sprache'
        })

        if (!hasLangSpec) {
          if (!detectedLang) {
            const fullText = ((row['title'] || '') + ' ' + rawCat).toLowerCase()
            if (fullText.includes('espanol') || fullText.includes('español') || fullText.includes('seguridad') || fullText.includes('presion') || fullText.includes('presión')) {
              detectedLang = 'es'
            } else if (fullText.includes('valve') || fullText.includes('english') || fullText.includes('safety') || fullText.includes('transmitter')) {
              detectedLang = 'en'
            } else {
              detectedLang = 'pt'
            }
          }
          specs.push({ label: 'Idioma', value: detectedLang })
        }

        // Auto-criar categoria se realmente não existir no banco (mesmo após normalização)
        if (!validCategories.has(categoryValue)) {
          const normCatValue = categoryValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
          const matchedDB = Array.from(validCategories).find(c => {
            return c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim() === normCatValue
          })

          if (matchedDB) {
            categoryValue = matchedDB
          } else if (categoryValue && categoryValue !== '(VAZIO)') {
            validCategories.add(categoryValue)
            try {
              await supabase.from('category_assets').insert([{
                category: categoryValue,
                cover_image_url: '/placeholder.png',
                color_hex: '#005db7'
              }])
              await supabase.from('pdf_settings').insert([{
                category: categoryValue,
                orientation: 'portrait'
              }])
            } catch (catErr) {
              console.warn('[CSV Import] Auto-criacao de categoria aviso:', catErr)
            }
          } else {
            invalidCategories.push({
              line: i + 1,
              category: row['category'] || '(vazio)'
            })
          }
        }

        // Resolver datasheet_url: se for nome de arquivo, buscar no storage
        let resolvedDatasheetUrl = row['datasheet_url'] || null
        if (resolvedDatasheetUrl && !resolvedDatasheetUrl.startsWith('http')) {
          // É uma referência de arquivo, tentar buscar no storage
          const fileRef = resolvedDatasheetUrl.trim()
          const { data: fileData } = await supabase
            .from('uploaded_files')
            .select('file_url')
            .ilike('original_filename', fileRef)
            .limit(1)
            .single()
          
          if (fileData?.file_url) {
            resolvedDatasheetUrl = fileData.file_url
          }
        }

        parsedProducts.push({
          title: row['title'],
          name_code: row['name_code'],
          category: categoryValue,
          tag: row['tag'] || 'ATIVO',
          tag_color_class: 'text-[#005db7]',
          bg_class: 'bg-secondary',
          layout_slots: dbLayoutSlots,
          image: row['image_url'] || '/placeholder.png',
          image_scale: 1.0,  // Escala padrão de imagem
          booklet_image_scale: 1.0,
          booklet_image_offset_x: 0,
          booklet_image_offset_y: 0,
          datasheet_url: resolvedDatasheetUrl,
          ex_image_url: exImageUrlVal,
          specs: specs
        })
      }
      
      // Se houver categorias inválidas, rejeitar TODO o import
      if (invalidCategories.length > 0) {
        importError.value = {
          invalidCategories,
          validCategories: Array.from(validCategories).sort()
        }
        importing.value = false
        return
      }
      
      if (parsedProducts.length === 0) {
        triggerToast('Nenhum produto válido para importar.', 'error')
        importing.value = false
        return
      }
      
      try {
        const { error } = await supabase.from('products').insert(parsedProducts)
        if (error) throw error
        triggerToast(`${parsedProducts.length} produtos importados com sucesso!`, 'success')
        await fetchProducts()
      } catch (err: any) {
        console.error(err)
        triggerToast(`Erro ao importar CSV: ${err.message}`, 'error')
      } finally {
        importing.value = false
      }
    }
    reader.readAsText(file)
  }

  return {
    products,
    loading,
    saving,
    importing,
    importError,
    colorOptions,
    fetchProducts,
    saveNewProduct,
    saveProductEdit,
    deleteProduct,
    deleteMultipleProducts,
    deleteAllProducts,
    handleCsvUpload
  }
}
