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
        .select('id, tag, tag_color_class, name_code, title, image, datasheet_name, datasheet_url, bg_class, card_layout, category, family, subcategory, specs, layout_slots, image_scale, image_offset_x, image_offset_y, ex_image_url')
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
          family: item.family || null,
          subcategory: item.subcategory || null,
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
        title: (product.title || '').toUpperCase().trim(),
        name_code: product.nameCode,
        category: (product.category || 'GERAL').toUpperCase().trim(),
        family: (product.family || '').trim() || null,
        subcategory: (product.subcategory || '').trim() || null,
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
        title: (product.title || '').toUpperCase().trim(),
        name_code: product.nameCode,
        category: (product.category || 'GERAL').toUpperCase().trim(),
        family: (product.family || '').trim() || null,
        subcategory: (product.subcategory || '').trim() || null,
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
        
        const titleAliases = ['title', 'tittle', 'titulo', 'nome', 'title_pt', 'nome_produto']
        const exAliases = ['ex_image_url', 'ex_url', 'ex_foto', 'foto_ex', 'ex']
        const coreColumns = [...titleAliases, 'name_code', 'sku', 'code', 'codigo', 'category', 'categoria', 'family', 'familia', 'subcategory', 'sub_category', 'subcategoria', 'subfamily', 'subfamilia', 'tag', 'layout_slots', 'image_url', 'image', 'foto', 'datasheet_url', 'specs', ...exAliases]
        
        let rawTitle = ''
        for (const alias of titleAliases) {
          if (row[alias]) {
            rawTitle = row[alias].trim()
            break
          }
        }
        const titleValue = rawTitle.toUpperCase().trim()

        // Ignorar linha de cabeçalho repetida caso exista no CSV
        const rawCatHeader = (row['category'] || row['categoria'] || '').toString().trim().toUpperCase()
        if (titleValue === 'TITLE' || rawCatHeader === 'CATEGORY' || titleValue === 'NOME' || titleValue === 'TÍTULO') {
          continue
        }

        // Resolvendo name_code (SKU) com suporte a múltiplos sinônimos
        const rawNameCode = (
          row['name_code'] ||
          row['sku'] ||
          row['code'] ||
          row['codigo'] ||
          row['cod'] ||
          row['ref'] ||
          row['reference'] ||
          titleValue ||
          `PROD-${Date.now()}-${i}`
        ).toString().trim()

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

        // Categoria informada no CSV — aceita category, categoria ou cat
        let rawCat = (row['category'] || row['categoria'] || row['cat'] || '').trim()
        if (!rawCat) {
          rawCat = 'GERAL'
        }
        let categoryValue = rawCat.toUpperCase().trim()
        let detectedLang: string | null = null

        // Garantir que especificação de Idioma exista no array specs
        const hasLangSpec = specs.some(s => {
          const lbl = (s.label || '').toLowerCase().trim()
          return lbl === 'idioma' || lbl === 'lang' || lbl === 'language' || lbl === 'sprache'
        })

        if (!hasLangSpec) {
          const fullText = (titleValue + ' ' + categoryValue).toLowerCase()
          if (fullText.includes('espanol') || fullText.includes('español') || fullText.includes('seguridad') || fullText.includes('presion') || fullText.includes('presión')) {
            detectedLang = 'es'
          } else if (fullText.includes('valve') || fullText.includes('english') || fullText.includes('safety') || fullText.includes('transmitter')) {
            detectedLang = 'en'
          } else {
            detectedLang = 'pt'
          }
          specs.push({ label: 'Idioma', value: detectedLang })
        }

        // Auto-criar categoria com o NOME EXATO se não existir no banco de dados
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
              // Copiar assets de um modelo de categoria existente
              const { data: templateAssets } = await supabase
                .from('category_assets')
                .select('*')
                .limit(1)
                .order('created_at', { ascending: true })

              let assetsPayload: Record<string, any> = {
                category: categoryValue,
                cover_image_url: null,
                color_hex: '#376092'
              }
              if (templateAssets && templateAssets.length > 0) {
                const { id, created_at, category: _cat, cover_image_url: _cImg, color_hex: _cHex, ...copiedAssets } = templateAssets[0] as any
                assetsPayload = {
                  ...copiedAssets,
                  category: categoryValue,
                  cover_image_url: null,
                  color_hex: '#376092'
                }
              }
              await supabase.from('category_assets').insert([assetsPayload])

              // Copiar pdf_settings de um modelo existente sem herdar títulos de idioma antigos
              const { data: templateSettings } = await supabase
                .from('pdf_settings')
                .select('*')
                .not('category', 'eq', 'GERAL')
                .limit(1)
                .order('created_at', { ascending: true })

              let settingsPayload: Record<string, any> = {}
              if (templateSettings && templateSettings.length > 0) {
                const { id, created_at, category: _catS, ...copiedSettings } = templateSettings[0] as any
                const clonedLayoutSettings = JSON.parse(JSON.stringify(templateSettings[0].layout_settings || {}))
                clonedLayoutSettings.cover_title_pt = categoryValue
                clonedLayoutSettings.cover_title_en = categoryValue
                clonedLayoutSettings.cover_title_es = categoryValue
                clonedLayoutSettings.cover_title_de = categoryValue

                settingsPayload = {
                  ...copiedSettings,
                  category: categoryValue,
                  layout_settings: clonedLayoutSettings
                }
              } else {
                settingsPayload = {
                  category: categoryValue,
                  orientation: 'portrait',
                  layout_settings: {
                    cover_title_pt: categoryValue,
                    cover_title_en: categoryValue,
                    cover_title_es: categoryValue,
                    cover_title_de: categoryValue
                  }
                }
              }
              await supabase.from('pdf_settings').insert([settingsPayload])
            } catch (catErr) {
              console.warn('[CSV Import] Auto-criacao de categoria aviso:', catErr)
            }
          }
        }

        // Resolver datasheet_url
        let resolvedDatasheetUrl = row['datasheet_url'] || row['datasheet'] || null
        if (resolvedDatasheetUrl && !resolvedDatasheetUrl.startsWith('http')) {
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

        // Ler family e subcategory do CSV com suporte a alias adicionais
        // family/familia: usado na coluna família (NÃO como alias de category neste ponto)
        const familyValue = (row['family'] || row['familia'] || '').trim() || null
        const subcategoryValue = (
          row['subcategory'] || row['sub_category'] || row['subcategoria'] ||
          row['subfamily'] || row['subfamilia'] || ''
        ).trim() || null

        parsedProducts.push({
          title: titleValue || rawNameCode,
          name_code: rawNameCode,
          category: categoryValue.toUpperCase().trim(),
          family: familyValue,
          subcategory: subcategoryValue,
          tag: row['tag'] || 'ATIVO',
          tag_color_class: 'text-[#005db7]',
          bg_class: 'bg-secondary',
          layout_slots: dbLayoutSlots,
          image: row['image_url'] || row['image'] || row['foto'] || '/placeholder.png',
          image_scale: 1.0,
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
        
        const { fetchAssets } = useCategoryColors()
        const { fetchPdfSettings } = usePdfSettings()
        await Promise.all([
          fetchProducts(),
          fetchAssets(),
          fetchPdfSettings()
        ])
      } catch (err: any) {
        console.error(err)
        triggerToast(`Erro ao importar CSV: ${err.message}`, 'error')
      } finally {
        importing.value = false
      }
    }
    reader.readAsText(file)
  }

  const convertTitlesAndCategoriesToUppercase = async () => {
    if (!confirm('Deseja converter os TÍTULOS e CATEGORIAS de TODOS os equipamentos cadastrados para LETRAS MAIÚSCULAS (UPPERCASE)?')) return
    loading.value = true
    try {
      const { data: allProds, error: fetchErr } = await supabase
        .from('products')
        .select('id, title, category')
      
      if (fetchErr) throw fetchErr
      if (!allProds || allProds.length === 0) {
        triggerToast('Nenhum produto cadastrado.', 'error')
        return
      }

      let updatedCount = 0
      for (const p of allProds) {
        const upperTitle = (p.title || '').toUpperCase().trim()
        const upperCat = (p.category || 'GERAL').toUpperCase().trim()
        
        if (upperTitle !== p.title || upperCat !== p.category) {
          const { error: updateErr } = await supabase
            .from('products')
            .update({ title: upperTitle, category: upperCat })
            .eq('id', p.id)
          
          if (!updateErr) updatedCount++
        }
      }

      triggerToast(`${updatedCount} equipamento(s) convertidos para LETRAS MAIÚSCULAS com sucesso!`, 'success')
      await fetchProducts()
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao converter para maiúsculas: ${err.message || err}`, 'error')
    } finally {
      loading.value = false
    }
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
    handleCsvUpload,
    convertTitlesAndCategoriesToUppercase
  }
}
