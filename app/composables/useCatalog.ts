import { ref, computed, watch } from 'vue'

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
  const { categoryAssets, fetchAssets } = useCategoryColors()

  const products = ref<Product[]>([])
  const loading = ref(true)

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
    return Object.keys(categoryAssets.value).filter(k => k !== 'GERAL').sort()
  })

  const loadProducts = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, tag, tag_color_class, name_code, title, image, datasheet_name, datasheet_url, bg_class, card_layout, category, specs, layout_slots, image_scale, image_offset_x, image_offset_y, ex_image_url')
        .order('id')
      
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
    return products.value.filter(p => selectedProducts.value.has(p.id))
  })

  // Pre-select all products once loaded
  watch(products, (newProducts) => {
    if (newProducts && selectedProducts.value.size === 0) {
      newProducts.forEach(p => selectedProducts.value.add(p.id))
    }
  }, { immediate: true })

  // Search & Categories
  const searchQuery = ref('')
  const selectedCategory = ref('TODAS')
  const activePage = ref(1)

  const availableCategories = computed(() => {
    const cats = new Set<string>()
    products.value.forEach(p => {
      if (p.category) {
        cats.add(p.category.toUpperCase().trim())
      }
    })
    return Array.from(cats).sort()
  })

  const filteredProducts = computed(() => {
    return products.value.filter(product => {
      if (selectedCategory.value !== 'TODAS' && product.category !== selectedCategory.value) {
        return false
      }
      if (searchQuery.value.trim() !== '') {
        const query = searchQuery.value.toLowerCase()
        const matchesTitle = product.title.toLowerCase().includes(query)
        const matchesCode = product.nameCode.toLowerCase().includes(query)
        const matchesTag = product.tag.toLowerCase().includes(query)
        return matchesTitle || matchesCode || matchesTag
      }
      return true
    })
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

  const confirmAndDownload = (payload?: { selection: 'dynamic' | 'GERAL' | 'specific', specificCategory: string, pdfType: 'web' | 'print' | 'qrcode', bookletMode: boolean }) => {
    if (payload) {
      coverCategorySelection.value = payload.selection
      specificCoverCategory.value = payload.specificCategory
      pdfTypeSelection.value = payload.pdfType
      bookletModeSelection.value = payload.bookletMode
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

    if (coverCategorySelection.value === 'dynamic') {
      selectedCoverCategoryOverride.value = undefined
    } else if (coverCategorySelection.value === 'GERAL') {
      selectedCoverCategoryOverride.value = 'GERAL'
    } else if (coverCategorySelection.value === 'specific') {
      selectedCoverCategoryOverride.value = specificCoverCategory.value
    }

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
    selectedProducts,
    selectedProductObjects,
    searchQuery,
    selectedCategory,
    activePage,
    availableCategories,
    filteredProducts,
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
