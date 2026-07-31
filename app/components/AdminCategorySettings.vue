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

    <!-- Main category view (Toolbar + Cards) -->
    <div v-else class="space-y-6">
      <!-- Bulk Category Selection Toolbar -->
      <div class="bg-white border border-gray-200 px-6 py-3 rounded shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
          <input 
            type="checkbox" 
            :checked="selectedCategoryIds.length === localCategories.length && localCategories.length > 0"
            @change="toggleSelectAllCategories"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Selecionar Todas as Categorias ({{ selectedCategoryIds.length }}/{{ localCategories.length }})</span>
        </label>

        <button 
          v-if="selectedCategoryIds.length > 0"
          @click="confirmDeleteSelectedCategories"
          class="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded transition-colors border-0 cursor-pointer shadow-sm"
        >
          <span class="material-symbols-outlined text-sm">delete</span>
          Excluir Categorias Selecionadas ({{ selectedCategoryIds.length }})
        </button>
      </div>

      <!-- Category list with layout configurations -->
      <div class="grid grid-cols-1 gap-6">
        <div 
          v-for="category in localCategories" 
          :key="category.id" 
          class="bg-white border rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] p-6 relative transition-all"
          :class="selectedCategoryIds.includes(category.id) ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10' : 'border-gray-200'"
        >
          <div class="absolute top-4 left-4 z-10">
            <input 
              type="checkbox" 
              :value="category.id" 
              v-model="selectedCategoryIds" 
              class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              title="Selecionar Categoria"
            />
          </div>
          <div class="flex flex-col lg:flex-row gap-6 justify-between pl-6">
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
              @replicate-section="(data) => openReplicateModal(category, data.fields, data.density)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Replicate Modal Component -->
    <AdminCategoryReplicateModal
      :open="replicateModalOpen"
      :category="sourceCategory"
      :categories="localCategories"
      :saving="saving"
      :initialFields="replicateFields"
      :initialReplicateAllFields="replicateAll"
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
  (e: 'delete-multiple-categories', ids: string[]): void
  (e: 'replicate-settings', payload: { source: Category, targetIds: string[], fields: string[] | null, density?: string }): void
  (e: 'publish-catalog', category: Category): void
}>()

const selectedCategoryIds = ref<string[]>([])

const toggleSelectAllCategories = () => {
  if (selectedCategoryIds.value.length === localCategories.value.length) {
    selectedCategoryIds.value = []
  } else {
    selectedCategoryIds.value = localCategories.value.map(c => c.id)
  }
}

const confirmDeleteSelectedCategories = () => {
  if (selectedCategoryIds.value.length === 0) return
  emit('delete-multiple-categories', [...selectedCategoryIds.value])
  selectedCategoryIds.value = []
}

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
const replicateFields = ref<string[] | null>(null)
const replicateAll = ref(true)
const replicateDensity = ref<string>('geral')

const openReplicateModal = (category: Category, fields: string[] | null = null, density: string = 'geral') => {
  console.log('🚀🚀🚀 [AdminCategorySettings] openReplicateModal called!', {
    category: category?.category,
    categoryId: category?.id,
    fields,
    fieldsIsNull: fields === null,
    fieldsIsArray: Array.isArray(fields),
    density
  })
  sourceCategory.value = category
  replicateFields.value = fields
  replicateAll.value = fields === null
  replicateDensity.value = density
  replicateModalOpen.value = true
  console.log('🚀🚀🚀 [AdminCategorySettings] Modal state after open:', {
    replicateModalOpen: replicateModalOpen.value,
    sourceCategory: sourceCategory.value?.category,
    replicateFieldsCount: replicateFields.value?.length || 'ALL',
    replicateDensity: replicateDensity.value
  })
}

const closeReplicateModal = () => {
  sourceCategory.value = null
  replicateFields.value = null
  replicateAll.value = true
  replicateDensity.value = 'geral'
  replicateModalOpen.value = false
}

const handleReplicate = (payload: { source: Category, targetIds: string[], fields: string[] | null }) => {
  console.log('[AdminCategorySettings] handleReplicate called', payload, 'density:', replicateDensity.value)
  emit('replicate-settings', {
    ...payload,
    density: replicateDensity.value
  })
  closeReplicateModal()
}
</script>