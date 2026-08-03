<template>
  <div class="bg-white border border-gray-200 rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] relative overflow-hidden">
    <div class="h-1 bg-blue-600 w-full absolute top-0 left-0"></div>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Produtos Cadastrados</h3>
        <div class="flex items-center space-x-2">
          <input v-model="searchQuery" type="text" placeholder="Buscar produto..." class="border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-48 bg-white" />
          <button @click="triggerCsvInput" :disabled="importing" class="flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-xs rounded transition-colors disabled:opacity-50">
            <span class="material-symbols-outlined text-sm mr-1">upload_file</span>
            {{ importing ? 'Importando...' : 'Importar CSV' }}
          </button>
          <button @click="$emit('uppercase-all')" :disabled="products.length === 0" class="flex items-center px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded transition-colors disabled:opacity-50" title="Converter Títulos e Categorias de todos os equipamentos para LETRAS MAIÚSCULAS">
            <span class="material-symbols-outlined text-sm mr-1">text_fields</span>
            Maiúsculas (A-Z)
          </button>
          <button 
            v-if="selectedIds.length > 0"
            @click="confirmDeleteSelected" 
            class="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded transition-colors border-0 cursor-pointer shadow-sm"
          >
            <span class="material-symbols-outlined text-sm mr-1">delete</span>
            Excluir Selecionados ({{ selectedIds.length }})
          </button>
          <button @click="confirmDeleteAll" :disabled="products.length === 0" class="flex items-center px-3 py-1.5 border border-red-650 text-red-655 hover:bg-red-50 font-semibold text-xs rounded transition-colors disabled:opacity-50">
            <span class="material-symbols-outlined text-sm mr-1">delete_sweep</span>
            Excluir Todos
          </button>
          <input type="file" ref="csvInput" accept=".csv" class="hidden" @change="handleFileChange" />
        </div>
      </div>

      <div v-if="loading" class="py-12 flex flex-col items-center justify-center text-gray-500">
        <span class="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
        <span class="text-xs uppercase tracking-wider">Carregando catálogo...</span>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="py-12 text-center text-gray-500 border border-dashed border-gray-200 rounded">
        <span class="material-symbols-outlined text-3xl mb-2">inventory_2</span>
        <p class="text-xs uppercase tracking-wider">Nenhum equipamento cadastrado</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
              <th class="py-3 px-2 w-8">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" title="Selecionar Todos da Página" />
              </th>
              <th class="py-3 px-2">Imagem</th>
              <th class="py-3 px-2">Modelo / SKU</th>
              <th class="py-3 px-2">Nome</th>
              <th class="py-3 px-2">Categoria</th>
              <th class="py-3 px-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in paginatedProducts" :key="product.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors" :class="{ 'bg-blue-50/40': selectedIds.includes(product.id) }">
              <td class="py-3 px-2 w-8">
                <input type="checkbox" :value="product.id" v-model="selectedIds" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
              </td>
              <td class="py-3 px-2">
                <div class="w-12 h-12 flex items-center justify-center border border-gray-200 bg-white p-1 rounded overflow-hidden">
                  <img :src="getProductImage(product)" class="max-w-full max-h-full object-contain" @error="handleImageError" />
                </div>
              </td>
              <td class="py-3 px-2 font-mono font-bold text-blue-600">{{ product.nameCode }}</td>
              <td class="py-3 px-2 font-medium text-slate-800">{{ product.title }}</td>
              <td class="py-3 px-2"><span class="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">{{ product.category }}</span></td>
              <td class="py-3 px-2 text-right">
                <div class="flex justify-end space-x-1.5">
                  <button @click="$emit('edit', product)" class="p-1.5 hover:bg-gray-100 rounded text-blue-600 transition-colors" title="Editar">
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button @click="console.log('[AdminProductTable] Delete button clicked for product id:', product.id); $emit('delete', product.id)" class="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors" title="Excluir">
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-6 text-xs text-gray-500 font-medium">
          <span>Mostrando {{ startIndex + 1 }} a {{ endIndex }} de {{ (filteredProducts || []).length }} itens</span>
          <div class="flex space-x-1">
            <button @click="currentPage--" :disabled="currentPage === 1" class="px-2.5 py-1.5 border border-gray-200 hover:bg-gray-50 rounded disabled:opacity-30">
              Anterior
            </button>
            <button @click="currentPage++" :disabled="currentPage >= totalPages" class="px-2.5 py-1.5 border border-gray-200 hover:bg-gray-50 rounded disabled:opacity-30">
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Spec {
  label: string
  value: string
}

interface Product {
  id: number
  tag: string
  tagColorClass: string
  nameCode: string
  title: string
  description?: string
  image: string
  imageBlob?: string | null
  datasheetName?: string | null
  datasheetBlob?: string | null
  datasheetUrl?: string | null
  bgClass: string
  cardLayout?: string
  category: string
  specs: Spec[]
  layoutSlots: number
  imageScale?: number
  imageOffsetX?: number
  imageOffsetY?: number
}

const props = defineProps<{
  products: Product[]
  loading: boolean
  importing: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', product: Product): void
  (e: 'delete', id: number): void
  (e: 'delete-multiple', ids: number[]): void
  (e: 'delete-all'): void
  (e: 'csv-upload', file: File): void
  (e: 'uppercase-all'): void
}>()

const selectedIds = ref<number[]>([])

const confirmDeleteAll = () => {
  if (confirm('Deseja realmente REMOVER TODOS os produtos do catálogo? Esta ação é irreversível e apagará todos os itens cadastrados.')) {
    emit('delete-all')
    selectedIds.value = []
  }
}

const confirmDeleteSelected = () => {
  if (selectedIds.value.length === 0) return
  emit('delete-multiple', [...selectedIds.value])
  selectedIds.value = []
}

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 8
const csvInput = ref<HTMLInputElement | null>(null)

const filteredProducts = computed(() => {
  if (!searchQuery.value) return props.products
  const query = searchQuery.value.toLowerCase().trim()
  return props.products.filter(p => 
    p.title.toLowerCase().includes(query) || 
    p.nameCode.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query)
  )
})

const isAllSelected = computed(() => {
  if (!paginatedProducts.value || paginatedProducts.value.length === 0) return false
  return paginatedProducts.value.every(p => selectedIds.value.includes(p.id))
})

const toggleSelectAll = () => {
  const pageIds = paginatedProducts.value.map(p => p.id)
  if (isAllSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !pageIds.includes(id))
  } else {
    const set = new Set([...selectedIds.value, ...pageIds])
    selectedIds.value = Array.from(set)
  }
}

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredProducts.value.length))

const paginatedProducts = computed(() => {
  return filteredProducts.value.slice(startIndex.value, startIndex.value + itemsPerPage)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const getProductImage = (product: Product) => {
  if (product.image && product.image !== '') return product.image
  return '/placeholder.png'
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (!img.src.startsWith('data:image/svg+xml')) {
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%239ca3af">Sem Imagem</text></svg>'
  }
}

const triggerCsvInput = () => {
  if (csvInput.value) {
    csvInput.value.click()
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('csv-upload', file)
  }
  target.value = '' // Reset input
}

defineExpose({
  triggerCsvInput
})
</script>