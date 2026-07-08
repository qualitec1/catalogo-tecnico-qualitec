<template>
  <div class="min-h-screen bg-slate-100 font-sans text-slate-800 pb-12">
    <!-- Navbar / Header -->
    <header class="bg-slate-900 text-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <span class="material-symbols-outlined text-blue-500 text-2xl">admin_panel_settings</span>
          <h1 class="text-lg font-bold uppercase tracking-wider">Painel Administrativo</h1>
        </div>
        <div class="flex items-center space-x-4">
          <NuxtLink to="/" class="text-xs text-gray-300 hover:text-white transition-colors uppercase font-bold flex items-center">
            <span class="material-symbols-outlined text-sm mr-1">arrow_back</span>
            Ver Catálogo
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <!-- Toast Alert Notification -->
      <Transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showToast" class="fixed bottom-5 right-5 z-50 flex max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 pointer-events-auto overflow-hidden" :class="toastType === 'success' ? 'border-emerald-500' : 'border-red-500'">
          <div class="p-4 flex items-start space-x-3 w-full">
            <span class="material-symbols-outlined" :class="toastType === 'success' ? 'text-emerald-500' : 'text-red-500'">
              {{ toastType === 'success' ? 'check_circle' : 'error' }}
            </span>
            <div class="flex-1">
              <p class="text-xs font-semibold text-slate-800">{{ toastMessage }}</p>
            </div>
            <button @click="showToast = false" class="text-gray-400 hover:text-gray-600 transition-colors">
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Import Error Modal -->
      <ImportErrorModal
        :show="!!importError"
        :invalid-categories="importError?.invalidCategories || []"
        :valid-categories="importError?.validCategories || []"
        @close="importError = null"
      />

      <!-- Tabs Navigation -->
      <div class="flex border-b border-gray-200 bg-white p-2 rounded shadow-sm mb-6">
        <button @click="currentTab = 'produtos'" :class="currentTab === 'produtos' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100 font-semibold'" class="px-6 py-2.5 text-xs uppercase tracking-wider rounded transition-colors mr-2 border-0">
          Equipamentos
        </button>
        <button @click="currentTab = 'categorias'" :class="currentTab === 'categorias' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100 font-semibold'" class="px-6 py-2.5 text-xs uppercase tracking-wider rounded transition-colors mr-2 border-0">
          Categorias & Customização PDF
        </button>
        <button @click="currentTab = 'arquivos'" :class="currentTab === 'arquivos' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100 font-semibold'" class="px-6 py-2.5 text-xs uppercase tracking-wider rounded transition-colors border-0">
          Upload de Arquivos
        </button>
      </div>

      <!-- Tab: Products -->
      <div v-show="currentTab === 'produtos'" class="space-y-6">
        <!-- Products Table -->
        <AdminProductTable 
          ref="productTableRef"
          :products="products" 
          :loading="loading" 
          :importing="importing"
          @edit="openEditModal" 
          @delete="deleteProduct"
          @delete-all="deleteAllProducts"
          @csv-upload="handleCsvUpload"
          @scroll-to-form="scrollToForm"
        />

        <!-- Add product Form -->
        <AdminProductForm 
          id="cadastro-form"
          :saving="saving" 
          :categories="categoryAssetsList"
          @submit="saveNewProduct" 
        />
      </div>

      <!-- Tab: Categories -->
      <div v-show="currentTab === 'categorias'">
        <AdminCategorySettings 
          :categories="categoryAssetsList" 
          :loading="loadingCategories" 
          :saving="saving"
          @create-category="saveNewCategoryAsset"
          @save-category="saveCategoryAsset"
          @delete-category="deleteCategoryAsset"
          @replicate-settings="replicateCategorySettings"
          @publish-catalog="handlePublishCatalog"
        />
      </div>

      <!-- Tab: File Manager -->
      <div v-show="currentTab === 'arquivos'">
        <AdminFileManager 
          @toast="showToastMessage"
        />
      </div>
    </main>

    <!-- Edit Product Modal -->
    <div v-if="editModalOpen" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div class="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
          <h3 class="font-bold text-sm uppercase tracking-wider flex items-center">
            <span class="material-symbols-outlined mr-2">edit_note</span>
            Editar Equipamento
          </h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-white transition-colors border-0 bg-transparent">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
          <AdminProductForm 
            :product="editingProduct" 
            :isEdit="true" 
            :saving="saving" 
            :categories="categoryAssetsList"
            @submit="saveProductEdit" 
            @cancel="closeEditModal"
          />
        </div>
      </div>
    </div>

    <!-- Hidden PDF builder in publish mode -->
    <CatalogPdfTemplate 
      :is-generating="isAdminGeneratingPdf"
      :products="adminSelectedProducts" 
      :coverCategory="adminCoverCategory"
      :forceLandscape="adminForceLandscapePdf"
      :publishMode="true"
      @complete="isAdminGeneratingPdf = false"
      @published="handleAdminPdfPublished"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAdminCategories } from '../composables/useAdminCategories'
import { useAdminProducts } from '../composables/useAdminProducts'

definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()

// Toast messages
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
const showToast = ref(false)

const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const showToastMessage = (payload: { message: string; type: 'success' | 'error' }) => {
  triggerToast(payload.message, payload.type)
}

const currentTab = ref('produtos')
const productTableRef = ref<any>(null)

// Initialize composables
const {
  categoryAssetsList,
  loadingCategories,
  fetchCategoryAssetsAdmin,
  saveCategoryAsset,
  saveNewCategoryAsset,
  deleteCategoryAsset,
  replicateCategorySettings
} = useAdminCategories(triggerToast)

const {
  products,
  loading,
  saving,
  importing,
  importError,
  fetchProducts,
  saveNewProduct,
  saveProductEdit,
  deleteProduct,
  deleteAllProducts,
  handleCsvUpload
} = useAdminProducts(triggerToast)

// Watch tab switch to fetch categories
watch(currentTab, (newTab) => {
  if (newTab === 'categorias') {
    fetchCategoryAssetsAdmin()
  }
})

// Automated PDF Generation & Publication
const isAdminGeneratingPdf = ref(false)
const adminSelectedProducts = ref<any[]>([])
const adminForceLandscapePdf = ref(false)
const adminCoverCategory = ref('')
const publishingCategory = ref<any>(null)

const handlePublishCatalog = (category: any) => {
  const catUpper = category.category.toUpperCase().trim()
  publishingCategory.value = category
  
  if (catUpper === 'GERAL') {
    adminSelectedProducts.value = products.value
    adminCoverCategory.value = 'GERAL'
  } else {
    adminSelectedProducts.value = products.value.filter(p => p.category.toUpperCase().trim() === catUpper)
    adminCoverCategory.value = category.category
  }
  
  adminForceLandscapePdf.value = category.orientation === 'landscape'
  isAdminGeneratingPdf.value = true
}

const handleAdminPdfPublished = async (url: string) => {
  if (!publishingCategory.value) return
  try {
    const catAsset = publishingCategory.value
    const { error } = await supabase
      .from('category_assets')
      .update({ pdf_url: url })
      .eq('id', catAsset.id)
      
    if (error) throw error
    triggerToast(`Catálogo oficial de "${catAsset.category}" publicado com sucesso!`, 'success')
    await fetchCategoryAssetsAdmin()
  } catch (err: any) {
    console.error('Error updating published catalog URL:', err)
    triggerToast(`Erro ao salvar URL do PDF: ${err.message}`, 'error')
  } finally {
    publishingCategory.value = null
    isAdminGeneratingPdf.value = false
  }
}

// Edit Modal
const editModalOpen = ref(false)
const editingProduct = ref<any>(null)

const openEditModal = (product: any) => {
  editingProduct.value = JSON.parse(JSON.stringify(product))
  editModalOpen.value = true
}

const closeEditModal = () => {
  editingProduct.value = null
  editModalOpen.value = false
}

const scrollToForm = () => {
  if (process.client) {
    document.getElementById('cadastro-form')?.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategoryAssetsAdmin()
})
</script>
