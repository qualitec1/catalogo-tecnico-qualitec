import { ref } from 'vue'

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
        .order('id')
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
        specs: product.specs,
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
        specs: product.specs,
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
        return h.trim()
          .replace(/^\uFEFF/, '')
          .replace(/^["']|["']$/g, '')
          .toLowerCase()
      })

      for (let i = 1; i < allRows.length; i++) {
        const values = allRows[i]
        if (values.length === 0 || (values.length === 1 && values[0] === '')) continue
        
        const row: Record<string, string> = {}
        cleanHeaders.forEach((cleanH, idx) => {
          let val = values[idx] !== undefined ? values[idx] : ''
          val = val.trim().replace(/^["']|["']$/g, '')
          row[cleanH] = val
        })
        
        const exAliases = ['ex_image_url', 'ex_url', 'ex_foto', 'foto_ex', 'ex']
        const coreColumns = ['title', 'name_code', 'category', 'tag', 'layout_slots', 'image_url', 'datasheet_url', 'specs', ...exAliases]
        const specs: { label: string, value: string }[] = []
        
        if (row['specs']) {
          row['specs'].split(';').filter(Boolean).forEach(s => {
            const parts = s.split(':')
            if (parts[0]) {
              specs.push({
                label: parts[0].trim(),
                value: parts[1] ? parts[1].trim() : ''
              })
            }
          })
        }
        
        headers.forEach((originalH, idx) => {
          const cleanH = cleanHeaders[idx]
          if (!coreColumns.includes(cleanH) && row[cleanH]) {
            specs.push({
              label: originalH.trim().replace(/^["']|["']$/g, ''),
              value: row[cleanH]
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

        const categoryValue = row['category'] ? row['category'].toUpperCase().trim() : 'GERAL'
        
        // Validar se a categoria existe no sistema
        if (!validCategories.has(categoryValue)) {
          invalidCategories.push({
            line: i + 1,
            category: row['category'] || '(vazio)'
          })
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
    deleteAllProducts,
    handleCsvUpload
  }
}
