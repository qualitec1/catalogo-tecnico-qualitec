import { ref, computed, watch, nextTick } from 'vue'

export interface Product {
  id: number
  tag: string
  tagColorClass: string
  nameCode: string
  title: string
  description: string
  image: string
  imageBlob: string | null
  datasheetName: string | null
  datasheetUrl: string | null
  bgClass: string
  cardLayout: any
  category: string
  family: string | null
  subcategory: string | null
  specs: any[]
  layoutSlots: number
  imageScale: number
  imageOffsetX: number
  imageOffsetY: number
  exImageUrl?: string | null
  ex_image_url?: string | null
}

export function useCatalog() {
  const supabase = useSupabaseClient()
  const { categoryAssets, fetchAssets, getCategoryColor } = useCategoryColors()

  const products = useState<Product[]>('catalog-products', () => [])
  const loading = useState<boolean>('catalog-loading', () => true)

  const showPrintModal = ref(false)
  const coverCategorySelection = ref<'dynamic' | 'GERAL' | 'specific'>('dynamic')
  const specificCoverCategory = ref('')
  const selectedCoverCategoryOverride = ref<string | undefined>(undefined)
  const pdfTypeSelection = ref<'web' | 'print' | 'qrcode'>('web')
  const bookletModeSelection = ref(false)

  const hasGeralCover = computed(() => {
    return !!categoryAssets.value['GERAL']
  })

  const listableCategories = computed(() => {
    const cats = new Set<string>()
    products.value.forEach(p => {
      if (p.category && p.category.toUpperCase().trim() !== 'GERAL') {
        cats.add(p.category.toUpperCase().trim())
      }
    })
    const geralSettings = getPdfSettings('GERAL')
    const savedCategoryOrder: string[] = geralSettings?.layout_settings?.category_order || []

    return Array.from(cats).sort((a, b) => {
      if (savedCategoryOrder && savedCategoryOrder.length > 0) {
        const idxA = savedCategoryOrder.indexOf(a)
        const idxB = savedCategoryOrder.indexOf(b)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        if (idxA !== -1) return -1
        if (idxB !== -1) return 1
      }
      return a.localeCompare(b)
    })
  })

  const loadProducts = async () => {
    loading.value = true
    try {
      fetchPdfSettings()
      const { data, error } = await supabase
        .from('products')
        .select('id, tag, tag_color_class, name_code, title, image, datasheet_name, datasheet_url, bg_class, card_layout, category, family, subcategory, specs, layout_slots, image_scale, image_offset_x, image_offset_y, ex_image_url')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true })
      
      if (error) throw error
      if (data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          tag: item.tag || 'NOVO',
          tagColorClass: item.tag_color_class || 'text-[#005db7]',
          nameCode: item.name_code,
          title: item.title,
          description: '',
          image: item.image,
          imageBlob: null,
          datasheetName: item.datasheet_name,
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
          exImageUrl: item.ex_image_url,
          ex_image_url: item.ex_image_url
        })) as Product[]
        
        const transIndex = mapped.findIndex(p => p.nameCode === 'TRANS-15554')
        if (transIndex > 0) {
          const [trans] = mapped.splice(transIndex, 1)
          mapped.unshift(trans)
        }
        products.value = mapped
      }
    } catch (err) {
      console.error('[useCatalog] Error loading products:', err)
    } finally {
      loading.value = false
    }
  }

  // Selected products
  const selectedProducts = ref<Set<number>>(new Set())
  const selectedProductObjects = computed(() => {
    return (filteredProducts.value || []).filter(p => selectedProducts.value.has(p.id))
  })

  // Search, Categories, Sectors & Language
  const searchQuery = ref('')
  const selectedCategory = ref('TODAS')
  const selectedFamily = ref('')
  const selectedSubcategory = ref('')
  const selectedSegment = ref('')
  const { currentLang } = useTranslations()
  const activePage = ref(1)

  const { getPdfSettings, fetchPdfSettings } = usePdfSettings()

  const normalizeText = (text: string) => {
    return (text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, 'e')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const availableCategories = computed(() => {
    const cats = new Set<string>()
    products.value.forEach(p => {
      if (p.category) {
        cats.add(p.category.toUpperCase().trim())
      }
    })
    const geralSettings = getPdfSettings('GERAL')
    const savedCategoryOrder: string[] = geralSettings?.layout_settings?.category_order || []

    return Array.from(cats).sort((a, b) => {
      if (savedCategoryOrder && savedCategoryOrder.length > 0) {
        const idxA = savedCategoryOrder.indexOf(a)
        const idxB = savedCategoryOrder.indexOf(b)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        if (idxA !== -1) return -1
        if (idxB !== -1) return 1
      }
      return a.localeCompare(b)
    })
  })

  const getProductLanguage = (product: any): string => {
    const langSpec = (product.specs || []).find((s: any) => {
      const lbl = normalizeText(s.label)
      return lbl.includes('idioma') || lbl.includes('lang') || lbl.includes('language') || lbl.includes('sprache')
    })
    if (langSpec && langSpec.value) {
      const normVal = normalizeText(langSpec.value)
      if (normVal === 'es' || normVal.includes('espanol') || normVal.includes('spanish') || normVal.includes('esp')) return 'es'
      if (normVal === 'de' || normVal.includes('alem') || normVal.includes('deutsch') || normVal.includes('german')) return 'es'
      if (normVal === 'en' || normVal.includes('ing') || normVal.includes('english') || normVal.includes('uk') || normVal.includes('us')) return 'en'
      if (normVal === 'pt' || normVal.includes('portugues') || normVal.includes('brazil') || normVal.includes('br') || normVal === 'idioma') return 'pt'
    }

    // Fallback: detect Spanish or English keywords in title or category (not spec labels)
    const titleAndCat = ((product.title || '') + ' ' + (product.category || '')).toLowerCase()
    
    // Spanish language indicators
    if (
      titleAndCat.includes('espanol') || titleAndCat.includes('español') || titleAndCat.includes('seguridad') ||
      titleAndCat.includes('presion') || titleAndCat.includes('presión') || titleAndCat.includes('transmisor') ||
      titleAndCat.includes('criogenica') || titleAndCat.includes('criogénica')
    ) {
      return 'es'
    }
    
    // English language indicators
    if (
      titleAndCat.includes('cryogenic valve') || titleAndCat.includes('safety valve') || titleAndCat.includes('globe valve') ||
      titleAndCat.includes('3-way valve') || titleAndCat.includes('pressure transmitter') || titleAndCat.includes('english')
    ) {
      return 'en'
    }
    
    return 'pt'
  }

  const languageFilteredProducts = computed(() => {
    const targetLang = currentLang.value || 'pt'
    return products.value.filter(product => {
      const pLang = getProductLanguage(product)
      return pLang === targetLang
    })
  })

  // Build mega menu tree structure: Category -> Family -> Subcategory
  const megaMenuTree = computed(() => {
    const tree: { category: string; color: string; families: { name: string; subcategories: string[] }[] }[] = []
    const catMap = new Map<string, Map<string, Set<string>>>()

    // Mapear famílias e subcategorias dos produtos existentes (filtrados por idioma se houver produtos no idioma, ou todos se não houver)
    const prods = languageFilteredProducts.value.length > 0 ? languageFilteredProducts.value : products.value
    prods.forEach(p => {
      if (!p.category || p.category.toUpperCase().trim() === 'GERAL') return
      const cat = p.category.toUpperCase().trim()
      if (!catMap.has(cat)) catMap.set(cat, new Map())
      const famMap = catMap.get(cat)!
      const fam = (p.family || '').trim() || (p.subcategory ? p.category : '')
      const sub = (p.subcategory || '').trim()
      if (fam) {
        if (!famMap.has(fam)) famMap.set(fam, new Set())
        if (sub) famMap.get(fam)!.add(sub)
      } else if (sub) {
        if (!famMap.has(cat)) famMap.set(cat, new Set())
        famMap.get(cat)!.add(sub)
      }
    })

    const geralSettings = getPdfSettings('GERAL')
    const savedCategoryOrder: string[] = geralSettings?.layout_settings?.category_order || []

    const sortedCats = Array.from(catMap.keys()).sort((a, b) => {
      if (savedCategoryOrder.length > 0) {
        const idxA = savedCategoryOrder.indexOf(a)
        const idxB = savedCategoryOrder.indexOf(b)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        if (idxA !== -1) return -1
        if (idxB !== -1) return 1
      }
      return a.localeCompare(b)
    })

    for (const cat of sortedCats) {
      const famMap = catMap.get(cat)!
      const families = Array.from(famMap.entries()).map(([famName, subs]) => ({
        name: famName,
        subcategories: Array.from(subs).sort()
      })).sort((a, b) => a.name.localeCompare(b.name))

      tree.push({
        category: cat,
        color: getCategoryColor(cat) || '#376092',
        families
      })
    }
    return tree
  })

  const filteredProducts = computed(() => {
    return languageFilteredProducts.value.filter(product => {
      // 1. Category Filter
      if (selectedCategory.value !== 'TODAS' && product.category !== selectedCategory.value) {
        return false
      }

      // 1b. Family Filter
      if (selectedFamily.value && (product.family || '').trim() !== selectedFamily.value) {
        return false
      }

      // 1c. Subcategory Filter
      if (selectedSubcategory.value && (product.subcategory || '').trim() !== selectedSubcategory.value) {
        return false
      }

      // 2. Sector / Segment Filter
      if (selectedSegment.value.trim() !== '') {
        const sectorSynonymsMap: Record<string, string[]> = {
          'criogenia': ['criogenia', 'cryogenics', 'kryotechnik'],
          'oleo e gas': ['oleo e gas', 'oleo & gas', 'oil & gas', 'oil and gas', 'ol & gas', 'ol und gas', 'petroleo y gas', 'petroleo & gas'],
          'gases tecnicos': ['gases tecnicos', 'technical gases', 'technische gase'],
          'energia': ['energia', 'energy', 'energie'],
          'acucar e alcool': ['acucar e alcool', 'acucar & alcool', 'sugar & ethanol', 'sugar and ethanol', 'sugar & alcohol', 'sugar and alcohol', 'zucker & alkohol', 'zucker und alkohol', 'azucar y alcohol', 'azucar & alcohol'],
          'alimenticia': ['alimenticia', 'food industry', 'food', 'lebensmittel', 'alimentaria', 'alimentos']
        }

        const normKey = normalizeText(selectedSegment.value)
        let segSynonyms = [normKey]
        for (const [key, synonyms] of Object.entries(sectorSynonymsMap)) {
          const normSyns = synonyms.map(s => normalizeText(s))
          if (normalizeText(key) === normKey || normSyns.includes(normKey)) {
            segSynonyms = normSyns
            break
          }
        }
        
        const matchesTitle = segSynonyms.some(syn => normalizeText(product.title).includes(syn))
        const matchesCode = segSynonyms.some(syn => normalizeText(product.nameCode).includes(syn))
        const matchesTag = segSynonyms.some(syn => normalizeText(product.tag).includes(syn))
        const matchesCategory = segSynonyms.some(syn => normalizeText(product.category).includes(syn))
        const matchesDescription = segSynonyms.some(syn => normalizeText(product.description).includes(syn))
        
        const matchesSpecs = (product.specs || []).some(spec => {
          const nLabel = normalizeText(spec.label)
          const nVal = normalizeText(spec.value)
          return segSynonyms.some(syn => nLabel.includes(syn) || nVal.includes(syn))
        })

        if (!matchesTitle && !matchesCode && !matchesTag && !matchesCategory && !matchesDescription && !matchesSpecs) {
          return false
        }
      }

      // 3. Search Query Filter
      if (searchQuery.value.trim() !== '') {
        const query = normalizeText(searchQuery.value)
        const matchesTitle = normalizeText(product.title).includes(query)
        const matchesCode = normalizeText(product.nameCode).includes(query)
        const matchesTag = normalizeText(product.tag).includes(query)
        const matchesCategory = normalizeText(product.category).includes(query)
        const matchesDescription = normalizeText(product.description).includes(query)
        const matchesSpecs = (product.specs || []).some(spec => {
          return normalizeText(spec.label).includes(query) || normalizeText(spec.value).includes(query)
        })

        if (!matchesTitle && !matchesCode && !matchesTag && !matchesCategory && !matchesDescription && !matchesSpecs) {
          return false
        }
      }

      return true
    })
  })

  // Pre-select all filtered products whenever filteredProducts updates
  watch(filteredProducts, (newProds) => {
    if (newProds && newProds.length > 0) {
      const newSet = new Set<number>()
      newProds.forEach(p => newSet.add(p.id))
      selectedProducts.value = newSet
    }
  }, { immediate: true })

  const paginatedProducts = computed(() => {
    const start = (activePage.value - 1) * 28
    return filteredProducts.value.slice(start, start + 28)
  })

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredProducts.value.length / 28))
  })

  const categoryProductCounts = computed(() => {
    const counts: Record<string, number> = {}
    ;(filteredProducts.value || []).forEach(p => {
      if (p.category) {
        const catKey = p.category.toUpperCase().trim()
        counts[catKey] = (counts[catKey] || 0) + 1
      }
    })
    return counts
  })

  watch([searchQuery, selectedCategory, selectedFamily, selectedSubcategory, selectedSegment, currentLang], () => {
    activePage.value = 1
  })

  const toggleProduct = (id: number) => {
    if (selectedProducts.value.has(id)) {
      selectedProducts.value.delete(id)
    } else {
      selectedProducts.value.add(id)
    }
  }

  const selectAll = () => {
    filteredProducts.value.forEach(product => {
      selectedProducts.value.add(product.id)
    })
  }

  const clearSelection = () => {
    filteredProducts.value.forEach(product => {
      selectedProducts.value.delete(product.id)
    })
  }

  // PDF Download State & Orchestration
  const isGeneratingPdf = ref(false)

  const downloadCatalog = () => {
    if (selectedProducts.value.size === 0) {
      alert('Nenhum equipamento selecionado para download.')
      return
    }
    showPrintModal.value = true
  }

  const closePrintModal = () => {
    showPrintModal.value = false
  }

  const confirmAndDownload = async (payload?: {
    selection: 'dynamic' | 'GERAL' | 'specific',
    specificCategory: string,
    productFilterMode?: 'all' | 'category',
    filterCategory?: string,
    filterCategories?: string[],
    pdfType: 'web' | 'print' | 'qrcode',
    bookletMode: boolean
  }) => {
    if (payload) {
      coverCategorySelection.value = payload.selection
      specificCoverCategory.value = payload.specificCategory
      pdfTypeSelection.value = payload.pdfType
      bookletModeSelection.value = payload.bookletMode

      if (payload.productFilterMode === 'category') {
        // Support multi-category filter
        const cats = payload.filterCategories && payload.filterCategories.length > 0
          ? payload.filterCategories
          : (payload.filterCategory ? [payload.filterCategory] : [])
        if (cats.length > 0) {
          const catUppers = cats.map(c => c.toUpperCase().trim())
          const matchingProds = filteredProducts.value.filter(p => p.category && catUppers.includes(p.category.toUpperCase().trim()))
          selectedProducts.value = new Set(matchingProds.map(p => p.id))
        }
      } else if (payload.productFilterMode === 'all') {
        selectedProducts.value = new Set(filteredProducts.value.map(p => p.id))
      }
    }
    let targetCat = 'GERAL'
    if (coverCategorySelection.value === 'specific') {
      targetCat = specificCoverCategory.value
    } else if (coverCategorySelection.value === 'dynamic') {
      const categories = new Set(selectedProductObjects.value.map(p => p.category))
      if (categories.size === 1) {
        targetCat = Array.from(categories)[0]
      } else {
        targetCat = 'GERAL'
      }
    } else if (coverCategorySelection.value === 'GERAL') {
      targetCat = 'GERAL'
    }

    // Only use pre-rendered static PDF link when mode is dynamic (auto) and entire category is selected
    if (coverCategorySelection.value === 'dynamic') {
      const catUpper = targetCat.toUpperCase().trim()
      const asset = categoryAssets.value[catUpper]

      if (asset && asset.pdfUrl) {
        const productsInCat = products.value.filter(p => p.category.toUpperCase().trim() === catUpper)
        const selectedInCat = selectedProductObjects.value.filter(p => p.category.toUpperCase().trim() === catUpper)
        const isFullCategoryDownload = catUpper === 'GERAL' || selectedInCat.length >= productsInCat.length
        
        if (isFullCategoryDownload) {
          window.open(asset.pdfUrl, '_blank')
          showPrintModal.value = false
          return
        }
      }
    }

    if (coverCategorySelection.value === 'dynamic') {
      selectedCoverCategoryOverride.value = undefined
    } else if (coverCategorySelection.value === 'GERAL') {
      selectedCoverCategoryOverride.value = 'GERAL'
    } else if (coverCategorySelection.value === 'specific') {
      selectedCoverCategoryOverride.value = specificCoverCategory.value
    }

    // Force reset + nextTick to guarantee the watcher in CatalogPdfTemplate fires
    // even if isGeneratingPdf was already true from a previous generation
    isGeneratingPdf.value = false
    await nextTick()
    isGeneratingPdf.value = true
    showPrintModal.value = false
  }

  // Zoom and Pan for Image Modal
  const modalImageSrc = ref<string | null>(null)
  const modalProduct = ref<Product | null>(null)
  const zoomScale = ref(1)
  const isDragging = ref(false)
  const dragStart = ref({ x: 0, y: 0 })
  const panOffset = ref({ x: 0, y: 0 })

  const handleZoomIn = () => { zoomScale.value = Math.min(zoomScale.value + 0.25, 4) }
  const handleZoomOut = () => {
    zoomScale.value = Math.max(zoomScale.value - 0.25, 0.5)
    if (zoomScale.value <= 1) resetPan()
  }
  const resetZoom = () => { zoomScale.value = 1; resetPan() }
  const resetPan = () => { panOffset.value = { x: 0, y: 0 } }

  const onMouseDown = (e: MouseEvent) => {
    if (zoomScale.value <= 1) return
    isDragging.value = true
    dragStart.value = { x: e.clientX - panOffset.value.x, y: e.clientY - panOffset.value.y }
  }
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return
    panOffset.value = { x: e.clientX - dragStart.value.x, y: e.clientY - dragStart.value.y }
  }
  const onMouseUp = () => { isDragging.value = false }

  const onTouchStart = (e: TouchEvent) => {
    if (zoomScale.value <= 1 || e.touches.length !== 1) return
    isDragging.value = true
    const touch = e.touches[0]
    dragStart.value = { x: touch.clientX - panOffset.value.x, y: touch.clientY - panOffset.value.y }
  }
  const onTouchMove = (e: TouchEvent) => {
    if (!isDragging.value || e.touches.length !== 1) return
    const touch = e.touches[0]
    panOffset.value = { x: touch.clientX - dragStart.value.x, y: touch.clientY - dragStart.value.y }
  }
  const onTouchEnd = () => { isDragging.value = false }

  const onWheel = (e: WheelEvent) => {
    const delta = e.deltaY < 0 ? 0.25 : -0.25
    zoomScale.value = Math.min(Math.max(zoomScale.value + delta, 0.5), 4)
    if (zoomScale.value <= 1) resetPan()
  }

  const getProductImage = (product: Product) => {
    if (product.image && product.image !== '') return product.image
    return '/placeholder.png'
  }

  const openImageModal = (product: Product) => {
    modalProduct.value = product
    modalImageSrc.value = getProductImage(product)
    resetZoom()
  }

  const closeImageModal = () => {
    modalImageSrc.value = null
    modalProduct.value = null
    resetZoom()
  }

  return {
    products,
    loading,
    loadProducts,
    categoryAssets,
    fetchAssets,
    showPrintModal,
    coverCategorySelection,
    specificCoverCategory,
    selectedCoverCategoryOverride,
    hasGeralCover,
    listableCategories,
    categoryProductCounts,
    selectedProducts,
    selectedProductObjects,
    searchQuery,
    selectedCategory,
    selectedFamily,
    selectedSubcategory,
    selectedSegment,
    currentLang,
    activePage,
    availableCategories,
    megaMenuTree,
    languageFilteredProducts,
    filteredProducts,
    paginatedProducts,
    totalPages,
    toggleProduct,
    selectAll,
    clearSelection,
    isGeneratingPdf,
    pdfTypeSelection,
    bookletModeSelection,
    downloadCatalog,
    closePrintModal,
    confirmAndDownload,
    modalImageSrc,
    modalProduct,
    zoomScale,
    isDragging,
    panOffset,
    handleZoomIn,
    handleZoomOut,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onWheel,
    getProductImage,
    openImageModal,
    closeImageModal
  }
}
