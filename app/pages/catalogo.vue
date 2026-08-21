<template>
  <div class="bg-gray-50 text-gray-900 min-h-screen flex flex-col w-full max-w-[2560px] mx-auto shadow-sm">
    <!-- Header -->
    <header class="w-full top-0 sticky z-50 shadow-sm select-none">
      <!-- Top Row (White Background) -->
      <div class="bg-white border-b border-gray-100">
        <div class="flex justify-between items-center h-16 px-8 max-w-[2560px] w-full mx-auto">
          <!-- Logo -->
          <div class="flex items-center h-full overflow-visible">
            <NuxtLink to="/" class="flex items-center h-full overflow-visible">
              <img 
                alt="Qualitec Industrial" 
                class="w-auto object-contain cursor-pointer pointer-events-none transition-transform duration-150 select-none" 
                :src="siteSettings.header_logo_url || 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/1785536986887_0a3ga6_qualitec_logo.png'"
                :style="{
                  height: `${siteSettings.header_logo_height || 48}px`,
                  transform: `translate(${siteSettings.header_logo_offset_x || 0}px, ${siteSettings.header_logo_offset_y || 0}px)`
                }"
              >
            </NuxtLink>
          </div>
          <!-- Top Navigation & Language Flags -->
          <nav class="flex items-center space-x-6" style="margin-right: 60px;">
            <!-- Header Search (Lupa de Pesquisa) -->
            <div class="relative flex items-center">
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 w-0"
                enter-to-class="opacity-100 w-56 sm:w-64"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 w-56 sm:w-64"
                leave-to-class="opacity-0 w-0"
              >
                <div v-if="isSearchOpen" class="flex items-center bg-gray-100 rounded-full px-3 py-1 border border-gray-300 shadow-inner overflow-hidden">
                  <span class="material-symbols-outlined text-gray-400 text-base mr-1 select-none">search</span>
                  <input
                    ref="searchInputRef"
                    v-model="searchQuery"
                    type="text"
                    :placeholder="t.searchPlaceholder || 'Buscar equipamento...'"
                    class="bg-transparent text-xs text-gray-800 outline-none w-36 sm:w-44 py-0.5"
                    @keyup.esc="closeSearch"
                  />
                  <button 
                    @click="closeSearch" 
                    class="text-gray-400 hover:text-gray-700 text-xs ml-1.5 border-0 bg-transparent cursor-pointer flex items-center justify-center p-0.5"
                    title="Fechar busca"
                  >
                    <span class="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>

                <button
                  v-else
                  @click="toggleSearch"
                  class="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-blue-700 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center"
                  title="Buscar no catálogo"
                >
                  <span class="material-symbols-outlined text-xl">search</span>
                </button>
              </Transition>
            </div>

            <NuxtLink to="/" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.home }}</NuxtLink>
            <NuxtLink to="/catalogo" @click="resetAllFilters" class="text-sm font-normal text-blue-700 font-bold transition-colors cursor-pointer">{{ t.catalog }}</NuxtLink>
            <NuxtLink to="/nossa-empresa" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.about }}</NuxtLink>
            <a href="/#contato" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.contact }}</a>

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
                @click="currentLang = 'es'" 
                class="p-1 rounded-md transition-all border cursor-pointer flex items-center justify-center"
                :class="currentLang === 'es' ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'"
                title="Español (España)"
              >
                <!-- SVG Flag Spain -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-4 rounded-xs shadow-2xs object-cover" viewBox="0 0 750 500">
                  <rect width="750" height="500" fill="#c60b1e"/>
                  <rect width="750" height="250" y="125" fill="#ffc400"/>
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </div>

      <!-- Mega Menu (replaces segment bar) -->
      <MegaMenu
        :menu-tree="megaMenuTree"
        :selected-category="selectedCategory"
        :selected-family="selectedFamily"
        :selected-subcategory="selectedSubcategory"
        @select="handleMegaMenuSelect"
      />

      <!-- Thin White Bar -->
      <div class="bg-white h-3 w-full border-b border-gray-200"></div>
    </header>



    <!-- Main Content -->
    <main class="max-w-[2560px] w-full mx-auto px-6 py-6 flex-grow">

      <!-- Product Grid (4 items per row on desktop) -->
      <div 
        v-if="paginatedProducts.length > 0" 
        class="responsive-catalog-grid"
        :style="{ 
          columnGap: `${siteSettings.catalog_grid_gap_x ?? 20}px`, 
          rowGap: `${siteSettings.catalog_grid_gap_y ?? 20}px` 
        }"
      >
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
    <AppFooter />

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
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useCatalog } from '../composables/useCatalog'
import useCategoryColors from '../composables/useCategoryColors'
import usePdfSettings from '../composables/usePdfSettings'
import useSiteSettings from '../composables/useSiteSettings'
import useTranslations, { useTranslationsAdmin } from '../composables/useTranslations'

const supabase = useSupabaseClient()
const { getCategoryColor } = useCategoryColors()
const { getPdfSettings } = usePdfSettings()
const { siteSettings, fetchSiteSettings } = useSiteSettings()
await useAsyncData('site-settings', () => fetchSiteSettings())
const { t, translatedSegments } = useTranslations()
const { fetchTranslationsFromDB } = useTranslationsAdmin()

// Configure viewport to render desktop 1280px layout auto-fitted on mobile with pinch-zoom support
useHead({
  title: 'Qualitec Industrial | Catálogo Técnico',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=yes' }
  ]
})

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

const isSearchOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const closeSearch = () => {
  searchQuery.value = ''
  isSearchOpen.value = false
}

const handleMegaMenuSelect = (payload: { category: string; family: string; subcategory: string }) => {
  selectedCategory.value = payload.category
  selectedFamily.value = payload.family
  selectedSubcategory.value = payload.subcategory
}

const resetAllFilters = () => {
  selectedCategory.value = 'TODAS'
  selectedFamily.value = ''
  selectedSubcategory.value = ''
  selectedSegment.value = ''
  searchQuery.value = ''
  activePage.value = 1
  isSearchOpen.value = false
  if (Object.keys(route.query).length > 0) {
    navigateTo('/catalogo', { replace: true })
  }
}

const clearFilter = (level: 'category' | 'family' | 'subcategory' | 'search' | 'all') => {
  if (level === 'all') {
    resetAllFilters()
  } else if (level === 'category') {
    selectedCategory.value = 'TODAS'
    selectedFamily.value = ''
    selectedSubcategory.value = ''
  } else if (level === 'family') {
    selectedFamily.value = ''
    selectedSubcategory.value = ''
  } else if (level === 'subcategory') {
    selectedSubcategory.value = ''
  } else if (level === 'search') {
    searchQuery.value = ''
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

const route = useRoute()

const applyRouteQuery = () => {
  searchQuery.value = route.query.q ? String(route.query.q) : ''
  selectedCategory.value = route.query.cat ? String(route.query.cat) : 'TODAS'
  selectedSegment.value = route.query.segment ? String(route.query.segment) : (route.query.segmento ? String(route.query.segmento) : '')
  selectedFamily.value = route.query.family ? String(route.query.family) : ''
  selectedSubcategory.value = route.query.subcategory ? String(route.query.subcategory) : ''
  activePage.value = 1
  if (!route.query.q) {
    isSearchOpen.value = false
  }
}

watch(() => route.query, () => {
  applyRouteQuery()
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    fetchAssets(),
    loadProducts(),
    fetchSiteSettings(),
    fetchTranslationsFromDB(),
  ])
  applyRouteQuery()
})
</script>

<style scoped>
.responsive-catalog-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 540px) {
  .responsive-catalog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .responsive-catalog-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .responsive-catalog-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
