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
            @open3dModel="open3dModal"
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

    <!-- Modal 3D -->
    <div
      v-if="modal3dUrl"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      @click="close3dModal"
    >
      <div class="relative w-full max-w-3xl" @click.stop>
        <button
          @click="close3dModal"
          class="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <span class="material-symbols-outlined text-3xl">close</span>
        </button>
        <div class="bg-white rounded-lg overflow-hidden shadow-2xl" style="height: 520px;">
          <ModelViewer3D :src="modal3dUrl" alt="Modelo 3D do produto" />
        </div>
      </div>
    </div>

    <!-- Modal de Imagem -->
    <div 
      v-if="modalImageSrc" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      @click="closeImageModal"
    >
      <div class="relative max-w-2xl max-h-[70vh] w-full">
        <button 
          @click="closeImageModal"
          class="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <span class="material-symbols-outlined text-3xl">close</span>
        </button>
        <img 
          :src="modalImageSrc" 
          :alt="'Imagem ampliada'" 
          class="w-full h-full object-contain bg-white rounded-lg shadow-2xl p-4"
          @click.stop
        >
      </div>
    </div>

    <!-- Catalog PDF Template Component -->
    <CatalogPdfTemplate 
      :is-generating="isGeneratingPdf" 
      :products="selectedProductObjects"
      :force-landscape="forceLandscapePdf"
      @complete="isGeneratingPdf = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product } from '~/components/ProductCard.vue'
import { hexToBase64 } from '../utils/image'

const supabase = useSupabaseClient()

// Search and Category state
const searchQuery = ref('')
const selectedCategory = ref('TODAS')
const activePage = ref(1)
const modalImageSrc = ref<string | null>(null)
const modal3dUrl = ref<string | null>(null)
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
  const { data } = await supabase
    .from('products')
    .select('id, tag, tag_color_class, name_code, title, image, image_blob, datasheet_name, datasheet_url, bg_class, card_layout, category, specs, layout_slots, image_scale, image_offset_x, image_offset_y, model3d_url')
    .order('id')
  if (data) {
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
      imageOffsetY: item.image_offset_y !== null ? Number(item.image_offset_y) : 0,
      model3dUrl: item.model3d_url || null
    })) as Product[]
    
    // Coloca o TRANS-15554 como primeiro item
    const trans15554Index = mapped.findIndex(p => p.nameCode === 'TRANS-15554')
    if (trans15554Index > 0) {
      const [trans15554] = mapped.splice(trans15554Index, 1)
      mapped.unshift(trans15554)
    }
    
    return mapped
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
  forceLandscapePdf.value = false
  isGeneratingPdf.value = true
}

const downloadPowerPoint = () => {
  if (selectedProducts.value.size === 0) {
    alert('Nenhum equipamento selecionado para download.')
    return
  }
  forceLandscapePdf.value = true
  isGeneratingPdf.value = true
}

// Image modal functions
const openImageModal = (src: string) => {
  modalImageSrc.value = src
}

const closeImageModal = () => {
  modalImageSrc.value = null
}

// 3D modal functions
const open3dModal = (url: string) => {
  modal3dUrl.value = url
}

const close3dModal = () => {
  modal3dUrl.value = null
}
</script>