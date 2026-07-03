<template>
  <div class="space-y-6">
    <!-- Header with Create Category -->
    <div class="bg-white border border-gray-200 p-6 rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] relative overflow-hidden flex justify-between items-center">
      <div class="h-1 bg-blue-600 w-full absolute top-0 left-0"></div>
      <div>
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Categorias de Equipamentos</h3>
        <p class="text-xs text-gray-500 font-medium">Cadastre novas categorias ou configure os aspectos visuais e de PDF.</p>
      </div>
      <div class="flex items-center space-x-3">
        <select v-model="newCategorySegmentType" class="border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded bg-white text-slate-700">
          <option value="especifica">Categoria Específica</option>
          <option value="geral" :disabled="hasGeralCategory">Capa Geral (GERAL)</option>
        </select>
        <input 
          v-model="newCategoryName" 
          type="text" 
          placeholder="Nome da Categoria..." 
          :disabled="newCategorySegmentType === 'geral'"
          class="border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-48 bg-white disabled:bg-gray-150 disabled:text-gray-400" 
        />
        <button @click="handleCreateCategory" :disabled="saving || (newCategorySegmentType === 'especifica' && !newCategoryName.trim())" class="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50 border-0">
          <span class="material-symbols-outlined text-sm mr-1.5">add</span>
          Nova Categoria
        </button>
      </div>
    </div>

    <!-- Category list loading state -->
    <div v-if="loading" class="bg-white border border-gray-200 p-12 rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-gray-500">
      <span class="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
      <span class="text-xs uppercase tracking-wider">Carregando categorias...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="localCategories.length === 0" class="bg-white border border-gray-200 p-12 rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] text-center text-gray-500 border-dashed">
      <span class="material-symbols-outlined text-3xl mb-2">category</span>
      <p class="text-xs uppercase tracking-wider">Nenhuma categoria cadastrada</p>
    </div>

    <!-- Category list with layout configurations -->
    <div v-else class="grid grid-cols-1 gap-6">
      <div v-for="category in localCategories" :key="category.id" class="bg-white border border-gray-200 rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] p-6 relative">
        <div class="flex flex-col lg:flex-row gap-6 justify-between">
          <!-- Left side: Category identification, Cover image and color -->
          <AdminCategoryBaseSettings
            :category="category"
            :saving="saving"
            @save-category="$emit('save-category', $event)"
            @publish-catalog="$emit('publish-catalog', $event)"
            @open-replicate-modal="openReplicateModal"
            @delete-category="$emit('delete-category', $event)"
          />

          <!-- Right side: PDF Layout Configuration (Collapsible) -->
          <AdminCategoryPdfSettings
            :category="category"
          />
        </div>
      </div>
    </div>

    <!-- Replicate Modal Component -->
    <AdminCategoryReplicateModal
      :open="replicateModalOpen"
      :category="sourceCategory"
      :categories="localCategories"
      :saving="saving"
      @close="closeReplicateModal"
      @replicate="handleReplicate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Category {
  id: string
  category: string
  originalCategory: string
  coverImageUrl: string
  coverImageBlob?: string | null
  colorHex: string
  pdfUrl?: string | null
  uploading: boolean
  hasChanges: boolean
  [key: string]: any
}

const props = defineProps<{
  categories: Category[]
  loading: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  (e: 'create-category', name: string): void
  (e: 'save-category', category: Category): void
  (e: 'delete-category', id: string): void
  (e: 'replicate-settings', payload: { source: Category, targetIds: string[], fields: string[] | null }): void
  (e: 'publish-catalog', category: Category): void
}>()

const newCategoryName = ref('')
const newCategorySegmentType = ref<'especifica' | 'geral'>('especifica')

const hasGeralCategory = computed(() => {
  return props.categories.some(c => c.category.toUpperCase().trim() === 'GERAL')
})

watch(newCategorySegmentType, (val) => {
  if (val === 'geral') {
    newCategoryName.value = 'GERAL'
  } else {
    newCategoryName.value = ''
  }
})

const localCategories = ref<Category[]>([])
watch(() => props.categories, (newVal) => {
  localCategories.value = JSON.parse(JSON.stringify(newVal || []))
}, { immediate: true, deep: true })

const handleCreateCategory = () => {
  let name = ''
  if (newCategorySegmentType.value === 'geral') {
    name = 'GERAL'
  } else {
    name = newCategoryName.value.trim()
  }
  
  if (name) {
    emit('create-category', name)
    newCategoryName.value = ''
    newCategorySegmentType.value = 'especifica'
  }
}

// Replicate Modal logic
const replicateModalOpen = ref(false)
const sourceCategory = ref<Category | null>(null)

const openReplicateModal = (category: Category) => {
  sourceCategory.value = category
  replicateModalOpen.value = true
}

const closeReplicateModal = () => {
  sourceCategory.value = null
  replicateModalOpen.value = false
}

const handleReplicate = (payload: { source: Category, targetIds: string[], fields: string[] | null }) => {
  emit('replicate-settings', payload)
  closeReplicateModal()
}
</script>