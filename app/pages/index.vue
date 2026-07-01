<template>
  <div class="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white w-full top-0 sticky z-50 border-b border-gray-200 shadow-sm">
      <div class="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto">
        <div class="flex items-center">
          <img alt="Qualitec Industrial" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJOpxk8IRBgRW2bvQlS_z4LoXARfSvqvz2saPXY9SVEh_22Bcd1VS5ijTW9c3L5WiWT0idDIuscN94pofAxJzmGnXWNILAeSKTQdpe0NSl8pmXlo5Mo2KzPIESuDMk-6ap5WOs_icm6enTpaiHanmAbwntVxfvVTPLdAKIwMg7L88cyvuALuJQqv2-2ntPUxn3BgVkSCLfjyupjGSuOW5zhpBXbfo-ac3ZkUg-WHHUrhMMhz1XIsk_yPD5jMMWbkCwWOJV1BBvHWM">
        </div>
        <nav class="hidden md:flex items-center h-full">
          <a class="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1 cursor-pointer" href="#">Catálogo</a>
        </nav>
        <div class="w-24"></div>
      </div>
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
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                search
              </span>
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
                <option 
                  v-for="cat in availableCategories" 
                  :key="cat" 
                  :value="cat"
                >
                  {{ cat }}
                </option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                expand_more
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
            <button 
              @click="selectAll" 
              class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-base">select_all</span>
              SELECIONAR TODOS
            </button>
            
            <button 
              @click="clearSelection" 
              class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-base">close</span>
              LIMPAR SELEÇÃO
            </button>
            
            <button 
              @click="downloadCatalog"
              class="bg-blue-600 text-white px-6 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md"
            >
              <span class="material-symbols-outlined text-base">picture_as_pdf</span>
              BAIXAR CATÁLOGO TÉCNICO ({{ selectedProducts.size }})
            </button>
            
            <button 
              @click="downloadPowerPoint"
              class="bg-slate-800 text-white px-6 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-slate-900 transition-all shadow-md"
            >
              <span class="material-symbols-outlined text-base">slideshow</span>
              BAIXAR EM POWER POINT ({{ selectedProducts.size }})
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
        <button 
          @click="activePage = Math.max(1, activePage - 1)"
          class="w-10 h-10 border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        
        <button 
          v-for="page in 3" 
          :key="page"
          @click="activePage = page"
          class="w-10 h-10 border font-medium text-sm transition-colors"
          :class="activePage === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
        >
          {{ page }}
        </button>
        
        <button 
          @click="activePage = Math.min(3, activePage + 1)"
          class="w-10 h-10 border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-blue-900 text-white w-full mt-20">
      <div class="flex flex-col md:flex-row justify-between items-center py-8 px-8 max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row items-center gap-4 md:gap-12 mb-6 md:mb-0 text-center md:text-left">
          <span class="text-xl font-bold">Qualitec</span>
          <p class="text-sm opacity-70">Qualitec © 2024 - Todos os direitos reservados.</p>
        </div>
        <nav class="flex flex-wrap justify-center gap-8">
          <a class="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer" href="#">Normas Técnicas</a>
          <a class="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer" href="#">Documentação</a>
          <a class="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer" href="#">Termos de Uso</a>
        </nav>
      </div>
    </footer>

    <!-- Modal de Imagem -->
    <div 
      v-if="modalImageSrc" 
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 md:p-8 select-none"
      @click="closeImageModal"
    >
      <!-- Card do Modal -->
      <div 
        class="relative bg-white rounded-xl shadow-2xl flex flex-col max-w-4xl w-full max-h-[85vh] overflow-hidden border border-gray-100"
        @click.stop
      >
        <!-- Cabeçalho / Barra de Ferramentas -->
        <header class="flex flex-wrap items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/90 gap-2">
          <!-- Título/Modelo do Produto -->
          <div class="flex items-center gap-3">
            <span 
              v-if="modalProduct?.nameCode" 
              class="px-2 py-0.5 text-xs font-semibold text-white rounded bg-[#376092]"
            >
              {{ modalProduct.nameCode }}
            </span>
            <h3 v-if="modalProduct?.title" class="text-sm font-bold text-gray-800 truncate max-w-[250px] sm:max-w-[400px]">
              {{ modalProduct.title }}
            </h3>
          </div>

          <!-- Controles de Zoom -->
          <div class="flex items-center gap-1 sm:gap-2 ml-auto">
            <!-- Zoom Out -->
            <button 
              @click="handleZoomOut" 
              class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              title="Diminuir Zoom"
              :disabled="zoomScale <= 0.5"
            >
              <span class="material-symbols-outlined text-xl">zoom_out</span>
            </button>

            <!-- Nível de Zoom -->
            <span class="text-xs font-semibold text-gray-500 min-w-[3.5rem] text-center">
              {{ Math.round(zoomScale * 100) }}%
            </span>

            <!-- Zoom In -->
            <button 
              @click="handleZoomIn" 
              class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              title="Aumentar Zoom"
              :disabled="zoomScale >= 4"
            >
              <span class="material-symbols-outlined text-xl">zoom_in</span>
            </button>

            <!-- Resetar -->
            <button 
              @click="resetZoom" 
              class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors flex items-center justify-center"
              title="Ajustar à Tela"
            >
              <span class="material-symbols-outlined text-xl">restart_alt</span>
            </button>

            <div class="h-6 w-px bg-gray-200 mx-1"></div>

            <!-- Fechar -->
            <button 
              @click="closeImageModal" 
              class="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-500 transition-colors flex items-center justify-center"
              title="Fechar"
            >
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </header>

        <!-- Área de Visualização da Imagem -->
        <div 
          class="relative flex-grow overflow-hidden flex items-center justify-center bg-gray-100/50 p-6 min-h-[300px] sm:min-h-[450px]"
          :class="zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @wheel.prevent="onWheel"
        >
          <!-- Mensagem de ajuda para arrastar -->
          <div 
            v-if="zoomScale > 1" 
            class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full pointer-events-none backdrop-blur-sm tracking-wider font-medium uppercase z-10 flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-xs">pan_tool</span> Arraste para mover
          </div>

          <!-- Imagem com Transformações -->
          <img 
            :src="modalImageSrc" 
            :alt="modalProduct?.title || 'Imagem ampliada'" 
            class="max-w-full max-h-[55vh] object-contain select-none transition-transform duration-100 ease-out will-change-transform rounded-sm shadow-sm bg-white p-2"
            :style="{ 
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
              touchAction: zoomScale > 1 ? 'none' : 'auto'
            }"
            @click.stop
          >
        </div>
      </div>
    </div>

    <!-- Modal de Opções de Impressão -->
    <div 
      v-if="showPrintModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div class="bg-white border border-gray-200 rounded shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button @click="closePrintModal" class="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
          <span class="material-symbols-outlined">close</span>
        </button>
        
        <h3 class="text-base font-bold text-slate-800 mb-2 uppercase tracking-wider flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600">picture_as_pdf</span>
          Configurar Capa do Catálogo
        </h3>
        <p class="text-xs text-gray-500 mb-4">
          Escolha qual imagem de capa e cores de cabeçalho serão aplicadas na geração do seu PDF.
        </p>

        <!-- Opções de Capa -->
        <div class="space-y-3 mb-5">
          <!-- Opção Dinâmica -->
          <label class="flex items-start gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="radio" v-model="coverCategorySelection" value="dynamic" class="mt-0.5 text-blue-650" />
            <div>
              <span class="text-xs font-bold text-slate-800 uppercase block">Capa Dinâmica / Automática</span>
              <span class="text-[10px] text-gray-500 block mt-0.5">
                Usa a capa da categoria caso todos os produtos selecionados pertençam à mesma categoria. Se houver mais de uma, usará a capa Geral.
              </span>
            </div>
          </label>

          <!-- Opção Geral -->
          <label class="flex items-start gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors" :class="{ 'opacity-50': !hasGeralCover }">
            <input type="radio" v-model="coverCategorySelection" value="GERAL" :disabled="!hasGeralCover" class="mt-0.5 text-blue-650" />
            <div>
              <span class="text-xs font-bold text-slate-800 uppercase block flex items-center gap-1.5">
                Capa Geral
                <span v-if="!hasGeralCover" class="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-normal lowercase">não configurada</span>
              </span>
              <span class="text-[10px] text-gray-500 block mt-0.5">
                Utiliza a imagem de capa e estilo configurados especificamente para o catálogo Geral (Todos os produtos).
              </span>
            </div>
          </label>

          <!-- Opção Específica -->
          <div class="border border-gray-200 rounded p-3 space-y-2">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="radio" v-model="coverCategorySelection" value="specific" class="text-blue-650" />
              <span class="text-xs font-bold text-slate-800 uppercase">Forçar Capa de Categoria</span>
            </label>
            <div v-if="coverCategorySelection === 'specific'" class="pl-6 pt-1">
              <select v-model="specificCoverCategory" class="w-full border border-gray-300 p-2 text-xs rounded bg-white text-slate-700 uppercase">
                <option value="" disabled>Selecione uma categoria...</option>
                <option v-for="cat in listableCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Formulário rápido para Criar Nova Capa/Categoria -->
        <div class="border-t border-gray-200 pt-4 mb-5">
          <button 
            @click="showQuickCreate = !showQuickCreate" 
            class="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider flex items-center gap-1 bg-transparent border-0 cursor-pointer"
          >
            <span class="material-symbols-outlined text-sm">{{ showQuickCreate ? 'expand_less' : 'add' }}</span>
            Criar Nova Capa / Categoria
          </button>
          
          <div v-if="showQuickCreate" class="mt-4 p-4 bg-gray-50 border border-gray-200 rounded space-y-3">
            <h4 class="text-xs font-bold text-slate-700 uppercase">Novo Segmento/Categoria</h4>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome da Categoria</label>
                <input v-model="quickCatName" type="text" placeholder="Ex: RETENÇÃO" class="w-full border border-gray-300 p-2 text-xs rounded bg-white text-slate-800 uppercase" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cor Principal (HEX)</label>
                <div class="flex items-center gap-2">
                  <input v-model="quickCatColor" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded-full" />
                  <input v-model="quickCatColor" type="text" placeholder="#376092" class="flex-grow border border-gray-300 p-2 text-xs rounded bg-white text-slate-800 font-mono text-center" />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Imagem de Capa (Upload)</label>
              <div @click="triggerQuickFileInput" class="border-2 border-dashed border-gray-300 p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-150 transition-colors rounded min-h-[70px] relative bg-white">
                <input type="file" ref="quickFileInput" class="hidden" accept="image/*" @change="handleQuickImageUpload" />
                <span v-if="!quickCatImageName" class="material-symbols-outlined text-gray-400 text-lg mb-1">image</span>
                <span class="text-[10px] font-semibold text-gray-500 text-center truncate w-full px-2">
                  {{ quickCatImageName || 'Selecionar JPG/PNG' }}
                </span>
              </div>
            </div>

            <button 
              @click="handleQuickCreateCategory" 
              :disabled="creatingQuickCat || !quickCatName.trim()" 
              class="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ creatingQuickCat ? 'Salvando...' : 'Criar e Selecionar Capa' }}
            </button>
          </div>
        </div>

        <div class="flex space-x-3">
          <button @click="closePrintModal" class="w-1/2 border border-gray-300 text-gray-700 py-2.5 text-xs font-bold rounded hover:bg-gray-50 transition-colors">
            CANCELAR
          </button>
          <button 
            @click="confirmAndDownload" 
            :disabled="coverCategorySelection === 'specific' && !specificCoverCategory" 
            class="w-1/2 bg-blue-600 text-white py-2.5 text-xs font-bold rounded hover:bg-blue-700 transition-colors disabled:opacity-40"
          >
            CONFIRMAR E GERAR
          </button>
        </div>
      </div>
    </div>

    <!-- Catalog PDF Template Component -->
    <CatalogPdfTemplate 
      :is-generating="isGeneratingPdf" 
      :products="selectedProductObjects"
      :force-landscape="forceLandscapePdf"
      :cover-category="selectedCoverCategoryOverride"
      @complete="isGeneratingPdf = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Product } from '~/components/ProductCard.vue'
import { hexToBase64 } from '../utils/image'

const supabase = useSupabaseClient()
const { categoryAssets, fetchAssets } = useCategoryColors()

onMounted(async () => {
  await fetchAssets()
})

const showPrintModal = ref(false)
const coverCategorySelection = ref<'dynamic' | 'GERAL' | 'specific'>('dynamic')
const specificCoverCategory = ref('')
const printPendingLandscape = ref(false)
const selectedCoverCategoryOverride = ref<string | undefined>(undefined)

// Quick category creation refs
const showQuickCreate = ref(false)
const quickCatName = ref('')
const quickCatColor = ref('#376092')
const quickCatImageName = ref('')
const quickCatImageBlob = ref<string | null>(null)
const creatingQuickCat = ref(false)
const quickFileInput = ref<HTMLInputElement | null>(null)

const hasGeralCover = computed(() => {
  return !!categoryAssets.value['GERAL']
})

const listableCategories = computed(() => {
  return Object.keys(categoryAssets.value).filter(k => k !== 'GERAL').sort()
})

const triggerQuickFileInput = () => {
  if (quickFileInput.value) {
    quickFileInput.value.click()
  }
}

const handleQuickImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer
    const uint8 = new Uint8Array(arrayBuffer)
    let hex = ''
    for (let i = 0; i < uint8.length; i++) {
      const h = uint8[i].toString(16)
      hex += h.length === 1 ? '0' + h : h
    }
    quickCatImageName.value = file.name
    quickCatImageBlob.value = '\\x' + hex
  }
  reader.readAsArrayBuffer(file)
}

const handleQuickCreateCategory = async () => {
  const name = quickCatName.value.toUpperCase().trim()
  if (!name) return

  creatingQuickCat.value = true
  try {
    const payload = {
      category: name,
      cover_image_url: quickCatImageName.value || '/placeholder.png',
      cover_image_blob: quickCatImageBlob.value,
      color_hex: quickCatColor.value
    }
    const { error } = await supabase.from('category_assets').insert([payload])
    if (error) throw error

    // Create default settings in pdf_settings
    await supabase.from('pdf_settings').insert([{
      category: name,
      title_font_size: '36px',
      title_position_y: '0px',
      image_position: 'right',
      card_layout_order: 'specs-first',
      font_size_specs: '10px',
      divider_line_color: '#cbd5e1'
    }])

    // Refresh category colors composable
    await fetchAssets()

    // Select the new category as specific cover category
    coverCategorySelection.value = 'specific'
    specificCoverCategory.value = name

    // Reset quick create form
    quickCatName.value = ''
    quickCatImageName.value = ''
    quickCatImageBlob.value = null
    showQuickCreate.value = false
    alert(`Capa da categoria "${name}" criada com sucesso!`)
  } catch (err: any) {
    console.error(err)
    alert(`Erro ao criar capa: ${err.message}`)
  } finally {
    creatingQuickCat.value = false
  }
}

const closePrintModal = () => {
  showPrintModal.value = false
  showQuickCreate.value = false
}

const confirmAndDownload = () => {
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

  // Se houver um PDF estático pré-salvo para esta categoria e o usuário estiver baixando o catálogo completo dela
  if (asset && asset.pdfUrl) {
    const productsInCat = products.value.filter(p => p.category.toUpperCase().trim() === catUpper)
    const selectedInCat = selectedProductObjects.value.filter(p => p.category.toUpperCase().trim() === catUpper)
    
    // Se selecionou todos os produtos daquela categoria ou se for o catálogo GERAL completo
    const isFullCategoryDownload = catUpper === 'GERAL' || selectedInCat.length >= productsInCat.length
    
    if (isFullCategoryDownload) {
      console.log(`[index] Download direto do PDF estático da categoria ${targetCat}:`, asset.pdfUrl)
      window.open(asset.pdfUrl, '_blank')
      showPrintModal.value = false
      showQuickCreate.value = false
      return
    }
  }

  // Fallback: Gerar dinamicamente no navegador
  if (coverCategorySelection.value === 'dynamic') {
    selectedCoverCategoryOverride.value = undefined
  } else if (coverCategorySelection.value === 'GERAL') {
    selectedCoverCategoryOverride.value = 'GERAL'
  } else if (coverCategorySelection.value === 'specific') {
    selectedCoverCategoryOverride.value = specificCoverCategory.value
  }

  forceLandscapePdf.value = printPendingLandscape.value
  isGeneratingPdf.value = true
  showPrintModal.value = false
  showQuickCreate.value = false
}

// Search and Category state
const searchQuery = ref('')
const selectedCategory = ref('TODAS')
const activePage = ref(1)
const modalImageSrc = ref<string | null>(null)
const modalProduct = ref<Product | null>(null)
const zoomScale = ref(1)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const panOffset = ref({ x: 0, y: 0 })
const isGeneratingPdf = ref(false)
const forceLandscapePdf = ref(false)

// Dynamic categories computed from loaded products
const availableCategories = computed(() => {
  const items = products.value || []
  const cats = new Set<string>()
  items.forEach(p => {
    if (p.category) {
      cats.add(p.category.toUpperCase().trim())
    }
  })
  return Array.from(cats).sort()
})

// Fetch products from Supabase
const { data: products } = await useAsyncData<Product[]>('products', async () => {
  console.log('[useAsyncData] Fetching products from Supabase...')
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, tag, tag_color_class, name_code, title, image, image_blob, datasheet_name, datasheet_url, bg_class, card_layout, category, specs, layout_slots, image_scale, image_offset_x, image_offset_y')
      .order('id')
    
    if (error) {
      console.error('[useAsyncData] Supabase query error:', error)
      throw error
    }
    
    if (data) {
      console.log('[useAsyncData] Supabase returned rows:', data.length)
      const mapped = data.map((item: any) => ({
        id: item.id,
        tag: item.tag || 'NOVO',
        tagColorClass: item.tag_color_class || 'text-[#005db7]',
        nameCode: item.name_code,
        title: item.title,
        description: '',
        image: item.image,
        imageBlob: item.image_blob ? hexToBase64(item.image_blob) : null,
        datasheetName: item.datasheet_name,
        datasheetUrl: item.datasheet_url,
        bgClass: item.bg_class || 'bg-secondary',
        cardLayout: item.card_layout,
        category: item.category,
        specs: item.specs || [],
        layoutSlots: item.layout_slots || 3,
        imageScale: item.image_scale !== null ? Number(item.image_scale) : 1.0,
        imageOffsetX: item.image_offset_x !== null ? Number(item.image_offset_x) : 0,
        imageOffsetY: item.image_offset_y !== null ? Number(item.image_offset_y) : 0
      })) as Product[]
      
      // Coloca o TRANS-15554 como primeiro item
      const trans15554Index = mapped.findIndex(p => p.nameCode === 'TRANS-15554')
      if (trans15554Index > 0) {
        const [trans15554] = mapped.splice(trans15554Index, 1)
        mapped.unshift(trans15554)
      }
      
      return mapped
    }
  } catch (err) {
    console.error('[useAsyncData] Caught exception during fetch:', err)
    throw err
  }
  return []
})

// Selected products subset
const selectedProductObjects = computed(() => {
  const items = products.value || []
  return items.filter(p => selectedProducts.value.has(p.id))
})

// Initial selection: all products are selected
const selectedProducts = ref<Set<number>>(new Set())

// Pre-select all products once they are loaded
watch(products, (newProducts) => {
  if (newProducts && selectedProducts.value.size === 0) {
    newProducts.forEach(p => selectedProducts.value.add(p.id))
  }
}, { immediate: true })

// Filtering logic
const filteredProducts = computed(() => {
  const items = products.value || []
  return items.filter(product => {
    // Filter by Category
    if (selectedCategory.value !== 'TODAS' && product.category !== selectedCategory.value) {
      return false
    }

    // Filter by Search Query
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

// Toggle product selection
const toggleProduct = (id: number) => {
  if (selectedProducts.value.has(id)) {
    selectedProducts.value.delete(id)
  } else {
    selectedProducts.value.add(id)
  }
}

// Select all currently filtered products
const selectAll = () => {
  filteredProducts.value.forEach(product => {
    selectedProducts.value.add(product.id)
  })
}

// Clear selection of currently filtered products
const clearSelection = () => {
  filteredProducts.value.forEach(product => {
    selectedProducts.value.delete(product.id)
  })
}

// Download action
const downloadCatalog = () => {
  if (selectedProducts.value.size === 0) {
    alert('Nenhum equipamento selecionado para download.')
    return
  }
  printPendingLandscape.value = false
  showPrintModal.value = true
}

const downloadPowerPoint = () => {
  if (selectedProducts.value.size === 0) {
    alert('Nenhum equipamento selecionado para download.')
    return
  }
  printPendingLandscape.value = true
  showPrintModal.value = true
}

// Image modal functions
const handleZoomIn = () => {
  zoomScale.value = Math.min(zoomScale.value + 0.25, 4)
}

const handleZoomOut = () => {
  zoomScale.value = Math.max(zoomScale.value - 0.25, 0.5)
  if (zoomScale.value <= 1) {
    resetPan()
  }
}

const resetZoom = () => {
  zoomScale.value = 1
  resetPan()
}

const resetPan = () => {
  panOffset.value = { x: 0, y: 0 }
}

const onMouseDown = (e: MouseEvent) => {
  if (zoomScale.value <= 1) return
  isDragging.value = true
  dragStart.value = { x: e.clientX - panOffset.value.x, y: e.clientY - panOffset.value.y }
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  panOffset.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y
  }
}

const onMouseUp = () => {
  isDragging.value = false
}

const onTouchStart = (e: TouchEvent) => {
  if (zoomScale.value <= 1 || e.touches.length !== 1) return
  isDragging.value = true
  const touch = e.touches[0]
  dragStart.value = { x: touch.clientX - panOffset.value.x, y: touch.clientY - panOffset.value.y }
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || e.touches.length !== 1) return
  const touch = e.touches[0]
  panOffset.value = {
    x: touch.clientX - dragStart.value.x,
    y: touch.clientY - dragStart.value.y
  }
}

const onTouchEnd = () => {
  isDragging.value = false
}

const onWheel = (e: WheelEvent) => {
  const delta = e.deltaY < 0 ? 0.25 : -0.25
  const newScale = Math.min(Math.max(zoomScale.value + delta, 0.5), 4)
  zoomScale.value = newScale
  if (zoomScale.value <= 1) {
    resetPan()
  }
}

const getProductImage = (product: Product) => {
  if (product.imageBlob) {
    if (product.imageBlob.startsWith('data:')) return product.imageBlob
    return `data:image/png;base64,${product.imageBlob}`
  }
  if (product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
    return `/api/product-image?id=${product.id}`
  }
  return product.image || 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Produto'
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

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeImageModal()
  }
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
</script>