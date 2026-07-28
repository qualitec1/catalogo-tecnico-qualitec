<template>
  <div class="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
    <!-- Header -->
    <header class="w-full top-0 sticky z-50 shadow-sm select-none">
      <!-- Top Row (White Background) -->
      <div class="bg-white border-b border-gray-100">
        <div class="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto">
          <!-- Logo -->
          <div class="relative h-16 w-96 flex items-center">
            <img 
              alt="Qualitec Industrial" 
              class="absolute h-36 w-auto object-contain -translate-y-1/2 top-1/2"
              style="left: 160px;" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJOpxk8IRBgRW2bvQlS_z4LoXARfSvqvz2saPXY9SVEh_22Bcd1VS5ijTW9c3L5WiWT0idDIuscN94pofAxJzmGnXWNILAeSKTQdpe0NSl8pmXlo5Mo2KzPIESuDMk-6ap5WOs_icm6enTpaiHanmAbwntVxfvVTPLdAKIwMg7L88cyvuALuJQqv2-2ntPUxn3BgVkSCLfjyupjGSuOW5zhpBXbfo-ac3ZkUg-WHHUrhMMhz1XIsk_yPD5jMMWbkCwWOJV1BBvHWM"
            >
          </div>
          <!-- Top Navigation -->
          <nav class="flex items-center space-x-12" style="margin-right: 120px;">
            <a href="#" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">Home</a>
            <a href="#" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">Nossa Empresa</a>
            <a href="#" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">Contato</a>
          </nav>
        </div>
      </div>

      <!-- Bottom Row (Light Gray Background) -->
      <div class="bg-gray-100 border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-8 py-4 flex justify-center items-center">
          <nav class="flex flex-wrap justify-center items-center gap-x-20 gap-y-2">
            <a href="#" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Criôgenia</a>
            <a href="#" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Óleo & Gás</a>
            <a href="#" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Gases Técnicos</a>
            <a href="#" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Energia</a>
            <a href="#" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Açúcar & Álcool</a>
            <a href="#" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Alimentícia</a>
          </nav>
        </div>
      </div>

      <!-- Thin White Bar -->
      <div class="bg-white h-3 w-full border-b border-gray-200"></div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-8 py-10 flex-grow w-full">
      <!-- Hero Section -->
      <section class="mb-8">
        <div class="border-l-4 border-gray-700 pl-6 mb-4">
          <h1 class="text-4xl font-normal text-gray-800">Catálogo Técnico Qualitec</h1>
        </div>
        <p class="text-gray-500 text-base leading-relaxed">
          Selecione os produtos desejados para gerar seu catálogo técnico personalizado.
        </p>
      </section>

      <!-- Toolbar -->
      <div class="bg-white border border-gray-200 p-6 mb-8 shadow-sm">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <!-- Search input -->
            <div class="relative group">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input 
                v-model="searchQuery"
                class="pl-10 pr-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full sm:w-64 outline-none transition-all bg-white" 
                placeholder="BUSCAR EQUIPAMENTO..." 
                type="text"
              >
            </div>

            <!-- Category filter -->
            <div class="relative">
              <select 
                v-model="selectedCategory"
                class="pl-4 pr-10 py-2.5 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full sm:w-56 appearance-none bg-white outline-none cursor-pointer uppercase"
              >
                <option value="TODAS">CATEGORIA: TODAS</option>
                <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">expand_more</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
            <button @click="selectAll" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 border-0 bg-transparent cursor-pointer">
              <span class="material-symbols-outlined text-base">select_all</span>
              SELECIONAR TODOS
            </button>
            <button @click="clearSelection" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 border-0 bg-transparent cursor-pointer">
              <span class="material-symbols-outlined text-base">close</span>
              LIMPAR SELEÇÃO
            </button>
            <button @click="downloadCatalog" class="bg-blue-600 text-white px-6 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md border-0 cursor-pointer">
              <span class="material-symbols-outlined text-base">picture_as_pdf</span>
              BAIXAR CATÁLOGO TÉCNICO ({{ selectedProducts.size }})
            </button>
          </div>
        </div>
      </div>

      <!-- Product Grid -->
      <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="product in filteredProducts" :key="product.id">
          <ProductCard 
            :product="product" 
            :isSelected="selectedProducts.has(product.id)" 
            @toggleSelect="toggleProduct"
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
      <div class="mt-16 flex justify-center items-center gap-2">
        <button @click="activePage = Math.max(1, activePage - 1)" class="w-10 h-10 border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors bg-white cursor-pointer">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <button 
          v-for="page in 3" 
          :key="page"
          @click="activePage = page"
          class="w-10 h-10 border font-medium text-sm transition-colors cursor-pointer"
          :class="activePage === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
        >
          {{ page }}
        </button>
        <button @click="activePage = Math.min(3, activePage + 1)" class="w-10 h-10 border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors bg-white cursor-pointer">
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

    <!-- Print Settings Modal -->
    <CatalogPrintModal
      :open="showPrintModal"
      :hasGeralCover="hasGeralCover"
      :listableCategories="listableCategories"
      @close="closePrintModal"
      @confirm="confirmAndDownload"
      @create-quick-category="handleQuickCreateCategory"
    />

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
import { watch, onMounted } from 'vue'
import { useCatalog } from '../composables/useCatalog'

const supabase = useSupabaseClient()

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

onMounted(async () => {
  await Promise.all([
    fetchAssets(),
    loadProducts()
  ])
})
</script>