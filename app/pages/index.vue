<template>
  <div 
    class="bg-gray-50 text-gray-900 min-h-screen flex flex-col overflow-x-auto touch-pan-x touch-pan-y"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div 
      class="w-[1280px] mx-auto transition-transform duration-100 ease-out origin-top-left flex flex-col min-h-screen"
      :style="{ transform: `scale(${mobileZoom})`, width: '1280px' }"
    >
    <!-- Header -->
    <header class="w-full top-0 sticky z-50 shadow-sm select-none">
      <!-- Top Row (White Background) -->
      <div class="bg-white border-b border-gray-100">
        <div class="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto">
          <!-- Logo -->
          <div class="relative h-16 w-96 flex items-center">
            <img 
              alt="Qualitec Industrial" 
              class="absolute h-36 w-auto object-contain -translate-y-1/2 top-1/2 pointer-events-none"
              style="left: 160px;" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJOpxk8IRBgRW2bvQlS_z4LoXARfSvqvz2saPXY9SVEh_22Bcd1VS5ijTW9c3L5WiWT0idDIuscN94pofAxJzmGnXWNILAeSKTQdpe0NSl8pmXlo5Mo2KzPIESuDMk-6ap5WOs_icm6enTpaiHanmAbwntVxfvVTPLdAKIwMg7L88cyvuALuJQqv2-2ntPUxn3BgVkSCLfjyupjGSuOW5zhpBXbfo-ac3ZkUg-WHHUrhMMhz1XIsk_yPD5jMMWbkCwWOJV1BBvHWM"
            >
          </div>
          <!-- Top Navigation & Language Flags -->
          <nav class="flex items-center space-x-8" style="margin-right: 60px;">
            <a href="#" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.home }}</a>
            <a href="#" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.about }}</a>
            <a href="#" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.contact }}</a>

            <!-- Flags Selector -->
            <div class="flex items-center gap-2 border-l border-gray-200 pl-6 ml-2">
              <button 
                @click="currentLang = 'pt'" 
                class="p-1 rounded-md transition-all border cursor-pointer flex items-center justify-center"
                :class="currentLang === 'pt' ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'"
                title="Português (Brasil)"
              >
                <!-- SVG Flag Brazil -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-4 rounded-xs shadow-2xs object-cover" viewBox="0 0 720 504">
                  <rect width="720" height="504" fill="#009c3b"/>
                  <polygon points="360,42 678,252 360,462 42,252" fill="#ffdf00"/>
                  <circle cx="360" cy="252" r="126" fill="#002776"/>
                  <path d="M 235,260 A 136,136 0 0,1 485,244" fill="none" stroke="#ffffff" stroke-width="12"/>
                </svg>
              </button>

              <button 
                @click="currentLang = 'en'" 
                class="p-1 rounded-md transition-all border cursor-pointer flex items-center justify-center"
                :class="currentLang === 'en' ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'"
                title="English (United Kingdom)"
              >
                <!-- SVG Flag UK / England -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-4 rounded-xs shadow-2xs object-cover" viewBox="0 0 60 30">
                  <clipPath id="uk-clip"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                  <clipPath id="uk-diag"><path d="M30,15 h30 v15 z M30,15 h-30 v-15 z M30,15 h30 v-15 z M30,15 h-30 v15 z"/></clipPath>
                  <g clip-path="url(#uk-clip)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-diag)" stroke="#C8102E" stroke-width="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>
                  </g>
                </svg>
              </button>

              <button 
                @click="currentLang = 'de'" 
                class="p-1 rounded-md transition-all border cursor-pointer flex items-center justify-center"
                :class="currentLang === 'de' ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'"
                title="Deutsch (Deutschland)"
              >
                <!-- SVG Flag Germany -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-4 rounded-xs shadow-2xs object-cover" viewBox="0 0 5 3">
                  <rect width="5" height="3" fill="#000000"/>
                  <rect width="5" height="2" y="1" fill="#DD0000"/>
                  <rect width="5" height="1" y="2" fill="#FFCC00"/>
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </div>

      <!-- Bottom Row (Light Gray Background) -->
      <div class="bg-gray-100 border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-8 py-4 flex justify-center items-center">
          <nav class="flex flex-wrap justify-center items-center gap-x-20 gap-y-2">
            <button 
              v-for="segment in translatedSegments"
              :key="segment.key"
              @click="toggleSegmentFilter(segment.key)"
              class="text-sm font-medium transition-colors border-0 bg-transparent cursor-pointer p-0"
              :class="selectedSegment === segment.key 
                ? 'text-blue-700 font-bold underline underline-offset-4 decoration-2' 
                : 'text-gray-600 hover:text-gray-900'"
            >
              {{ segment.label }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Thin White Bar -->
      <div class="bg-white h-3 w-full border-b border-gray-200"></div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-8 py-6 flex-grow w-full">
      <!-- Toolbar Component -->
      <CatalogSearchToolbar 
        v-model:searchQuery="searchQuery"
        v-model:selectedCategory="selectedCategory"
        :products="products"
        :category-button-groups="categoryButtonGroups"
        :show-category-buttons="showCategoryButtons"
      />

      <!-- Product Grid -->
      <div v-if="paginatedProducts.length > 0" class="grid grid-cols-4 gap-5">
        <div v-for="product in paginatedProducts" :key="product.id">
          <ProductCard 
            :product="product" 
            @openImage="openImageModal"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 border border-dashed border-gray-300 bg-white">
        <span class="material-symbols-outlined text-5xl text-gray-400 mb-4">search_off</span>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Nenhum equipamento encontrado</h3>
        <p class="text-sm text-gray-500">Tente ajustar seus termos de busca ou filtros de categoria.</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-16 flex justify-center items-center gap-2">
        <button 
          @click="activePage = Math.max(1, activePage - 1)" 
          :disabled="activePage === 1"
          class="w-10 h-10 border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors bg-white cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <button 
          v-for="page in totalPages" 
          :key="page"
          @click="activePage = page"
          class="w-10 h-10 border font-medium text-sm transition-colors cursor-pointer"
          :class="activePage === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
        >
          {{ page }}
        </button>
        <button 
          @click="activePage = Math.min(totalPages, activePage + 1)" 
          :disabled="activePage === totalPages"
          class="w-10 h-10 border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors bg-white cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-[#f5f5f5] text-[#555555] w-full mt-20 border-t border-gray-200/50">
      <div class="max-w-7xl mx-auto py-14 flex flex-col md:flex-row justify-between gap-8 text-[13px] leading-relaxed" style="padding-left: 192px; padding-right: 210px;">
        <!-- Left Column: Address and Info -->
        <div class="flex flex-col space-y-1 text-[#666666]">
          <p class="text-[#333333] mb-1">Qualitec C S I M Ltda</p>
          <p>Rua Fazenda Monte Alegre, 367</p>
          <p>05160-060 - São Paulo - SP</p>
          <p>Tel: +55 11 3908 7100</p>
          <p>
            <a href="mailto:vendas@qualitecinstrumentos.com.br" class="hover:text-gray-900 transition-colors">vendas@qualitecinstrumentos.com.br</a>
          </p>
          <p class="pt-6 text-[#777777]">Todos os direitos reservados - 2024</p>
        </div>

        <!-- Right Column: Exclusivity info -->
        <div class="flex flex-col space-y-1 text-[#666666] md:pr-12">
          <p class="text-[#333333] mb-1">Representante Exclusivo</p>
          <p>HEROSE GmbH</p>
          <p>Generant Inc</p>
          <p>DataOnline LLC</p>
        </div>
      </div>
    </footer>



    <!-- Image Modal -->
    <div 
      v-if="modalImageSrc" 
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 md:p-8 select-none"
      @click="closeImageModal"
    >
      <div class="relative bg-white rounded-xl shadow-2xl flex flex-col max-w-4xl w-full max-h-[85vh] overflow-hidden border border-gray-100" @click.stop>
        <header class="flex flex-wrap items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/90 gap-2">
          <div class="flex items-center gap-3">
            <span v-if="modalProduct?.nameCode" class="px-2 py-0.5 text-xs font-semibold text-white rounded bg-[#376092]">{{ modalProduct.nameCode }}</span>
            <h3 v-if="modalProduct?.title" class="text-sm font-bold text-gray-800 truncate max-w-[250px] sm:max-w-[400px]">{{ modalProduct.title }}</h3>
          </div>
          <div class="flex items-center gap-1 sm:gap-2 ml-auto">
            <button @click="handleZoomOut" class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-40 border-0 bg-transparent cursor-pointer" :disabled="zoomScale <= 0.5">
              <span class="material-symbols-outlined text-xl">zoom_out</span>
            </button>
            <span class="text-xs font-semibold text-gray-500 min-w-[3.5rem] text-center">{{ Math.round(zoomScale * 100) }}%</span>
            <button @click="handleZoomIn" class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-40 border-0 bg-transparent cursor-pointer" :disabled="zoomScale >= 4">
              <span class="material-symbols-outlined text-xl">zoom_in</span>
            </button>
            <button @click="resetZoom" class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors border-0 bg-transparent cursor-pointer">
              <span class="material-symbols-outlined text-xl">restart_alt</span>
            </button>
            <div class="h-6 w-px bg-gray-200 mx-1"></div>
            <button @click="closeImageModal" class="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-500 transition-colors border-0 bg-transparent cursor-pointer">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </header>

        <div 
          class="relative flex-grow overflow-hidden flex items-center justify-center bg-gray-100/50 p-6 min-h-[300px] sm:min-h-[450px]"
          :class="zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'"
          @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp"
          @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @touchcancel="onTouchEnd" @wheel.prevent="onWheel"
        >
          <img 
            :src="modalImageSrc" 
            alt="Ampliada"
            class="max-w-full max-h-[70vh] object-contain transition-transform duration-75 select-none pointer-events-none"
            :style="{ transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)` }"
          />
        </div>
      </div>
    </div>

    <!-- Catalog Print / Config Modal -->
    <CatalogPrintModal
      :open="showPrintModal"
      :has-geral-cover="hasGeralCover"
      :listable-categories="listableCategories"
      :category-product-counts="categoryProductCounts"
      @close="closePrintModal"
      @confirm="confirmAndDownload"
      @create-quick-category="handleQuickCreateCategory"
    />

    <!-- Hidden PDF template generation -->
    <CatalogPdfTemplate 
      :is-generating="isGeneratingPdf" 
      :products="selectedProductObjects"
      :cover-category="selectedCoverCategoryOverride"
      :pdf-type="pdfTypeSelection"
      :booklet-mode="bookletModeSelection"
      @complete="isGeneratingPdf = false"
    />
    </div>

    <!-- Floating Mobile Zoom Control Widget -->
    <div class="fixed bottom-6 right-6 z-40 flex items-center bg-slate-900/90 text-white rounded-full shadow-2xl p-1.5 backdrop-blur border border-slate-700/50 select-none">
      <button 
        @click="zoomOutMobile" 
        class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors text-white border-0 bg-transparent cursor-pointer"
        title="Reduzir Zoom"
      >
        <span class="material-symbols-outlined text-lg">zoom_out</span>
      </button>

      <button 
        @click="resetZoomMobile" 
        class="px-2.5 py-1 text-xs font-mono font-bold text-blue-400 hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
        title="Resetar Zoom (100%)"
      >
        {{ Math.round(mobileZoom * 100) }}%
      </button>

      <button 
        @click="zoomInMobile" 
        class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors text-white border-0 bg-transparent cursor-pointer"
        title="Aumentar Zoom"
      >
        <span class="material-symbols-outlined text-lg">zoom_in</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCatalog } from '../composables/useCatalog'
import useCategoryColors from '../composables/useCategoryColors'
import usePdfSettings from '../composables/usePdfSettings'
import useSiteSettings from '../composables/useSiteSettings'
import useTranslations from '../composables/useTranslations'

const supabase = useSupabaseClient()
const { getCategoryColor } = useCategoryColors()
const { getPdfSettings } = usePdfSettings()
const { fetchSiteSettings } = useSiteSettings()
const { t, translatedSegments } = useTranslations()

// Mobile Page Zoom State & Touch Pinch Gestures
const mobileZoom = ref(1.0)
let touchStartDist = 0
let initialZoom = 1.0

const zoomInMobile = () => {
  mobileZoom.value = Math.min(2.5, Number((mobileZoom.value + 0.15).toFixed(2)))
}

const zoomOutMobile = () => {
  mobileZoom.value = Math.max(0.6, Number((mobileZoom.value - 0.15).toFixed(2)))
}

const resetZoomMobile = () => {
  updateMobileAutoZoom()
}

const getTouchDistance = (e: TouchEvent) => {
  if (e.touches.length < 2) return 0
  const dx = e.touches[0].clientX - e.touches[1].clientX
  const dy = e.touches[0].clientY - e.touches[1].clientY
  return Math.hypot(dx, dy)
}

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    touchStartDist = getTouchDistance(e)
    initialZoom = mobileZoom.value
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2 && touchStartDist > 0) {
    const currentDist = getTouchDistance(e)
    const factor = currentDist / touchStartDist
    const newScale = Math.min(Math.max(0.6, initialZoom * factor), 2.5)
    mobileZoom.value = Number(newScale.toFixed(2))
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  if (e.touches.length < 2) {
    touchStartDist = 0
  }
}

const {
  products,
  loading,
  loadProducts,
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
  selectedSegment,
  currentLang,
  activePage,
  availableCategories,
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
  panOffset,
  handleZoomIn,
  handleZoomOut,
  resetZoom,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onWheel,
  openImageModal,
  closeImageModal
} = useCatalog()

const toggleSegmentFilter = (segment: string) => {
  if (selectedSegment.value === segment) {
    selectedSegment.value = ''
  } else {
    selectedSegment.value = segment
  }
}

const showCategoryButtons = computed(() => {
  const geralSettings = getPdfSettings('GERAL')
  return geralSettings?.layout_settings?.show_category_buttons !== false
})

interface ButtonGroup {
  name: string
  categories: string[]
}

const categoryButtonGroups = computed<ButtonGroup[]>(() => {
  const geralSettings = getPdfSettings('GERAL')
  const groups: ButtonGroup[] = geralSettings?.layout_settings?.category_button_groups || []
  // Only return groups that have at least one category with products
  return groups.filter(g => g.categories && g.categories.length > 0)
})

const handleQuickCreateCategory = async ({ name, color, imageName, imageBlob }: any) => {
  try {
    const payload = {
      category: name,
      cover_image_url: imageName || '/placeholder.png',
      cover_image_blob: imageBlob,
      color_hex: color
    }
    const { error } = await supabase.from('category_assets').insert([payload])
    if (error) throw error

    const { data: templateSettings } = await supabase
      .from('pdf_settings')
      .select('*')
      .or('category.ilike.%VÁLVULAS DE SEGURANÇA%,category.ilike.%GERAL%')
      .order('id', { ascending: true })
      .limit(1)

    let settingsPayload: Record<string, any> = {}
    if (templateSettings && templateSettings.length > 0) {
      const source = templateSettings[0]
      const { id, created_at, ...copiedSettings } = source
      settingsPayload = {
        ...copiedSettings,
        category: name,
        layout_settings: JSON.parse(JSON.stringify(source.layout_settings || {}))
      }
    } else {
      settingsPayload = {
        category: name,
        title_font_size: '28px',
        title_position_y: '-9px'
      }
    }

    await supabase.from('pdf_settings').insert([settingsPayload])

    await fetchAssets()
    coverCategorySelection.value = 'specific'
    specificCoverCategory.value = name
    alert(`Capa da categoria "${name}" criada com sucesso!`)
  } catch (err: any) {
    console.error(err)
    alert(`Erro ao criar capa: ${err.message}`)
  }
}

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeImageModal()
}

watch(modalImageSrc, (newVal) => {
  if (newVal) {
    window.addEventListener('keydown', handleGlobalKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    window.removeEventListener('keydown', handleGlobalKeydown)
    document.body.style.overflow = ''
  }
})

const updateMobileAutoZoom = () => {
  if (typeof window !== 'undefined') {
    const screenWidth = window.innerWidth
    if (screenWidth < 1280) {
      const calculated = Number((screenWidth / 1280).toFixed(3))
      mobileZoom.value = Math.max(0.2, Math.min(1.0, calculated))
    } else {
      mobileZoom.value = 1.0
    }
  }
}

onMounted(async () => {
  updateMobileAutoZoom()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateMobileAutoZoom)
  }
  await Promise.all([
    fetchAssets(),
    loadProducts(),
    fetchSiteSettings()
  ])
})
</script>