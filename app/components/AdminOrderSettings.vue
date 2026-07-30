<template>
  <div class="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="border-b border-gray-200 pb-4 flex justify-between items-center flex-wrap gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600">swap_vert</span>
          Ajuste de Ordem de Exibição
        </h2>
        <p class="text-xs text-gray-500 mt-1">
          Defina a sequência exata em que as categorias e equipamentos aparecerão no site e no catálogo PDF.
        </p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="activeSubTab = 'categorias'"
          :class="activeSubTab === 'categorias' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold'"
          class="px-4 py-2 text-xs uppercase tracking-wider rounded transition-colors border-0 cursor-pointer flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-base">category</span>
          Categorias
        </button>
        <button 
          @click="activeSubTab = 'produtos'"
          :class="activeSubTab === 'produtos' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold'"
          class="px-4 py-2 text-xs uppercase tracking-wider rounded transition-colors border-0 cursor-pointer flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-base">inventory_2</span>
          Equipamentos
        </button>
      </div>
    </div>

    <!-- SEÇÃO 1: ORDENAÇÃO DE CATEGORIAS -->
    <div v-if="activeSubTab === 'categorias'" class="space-y-4">
      <!-- Toggle de exibição dos botões no site -->
      <div class="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
        <div>
          <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <span class="material-symbols-outlined text-blue-600 text-base">smart_button</span>
            Exibir Botões de Atalho de Categoria no Site
          </h4>
          <p class="text-xs text-slate-500 mt-0.5">Exibe uma barra de botões interativos com cada categoria abaixo da caixa de busca no catálogo público.</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="showCategoryButtons" class="sr-only peer">
          <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div class="flex justify-between items-center pt-2">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <span class="material-symbols-outlined text-gray-500">format_list_numbered</span>
          Ordem das Categorias no Catálogo
        </h3>
        <button 
          @click="saveCategoriesOrder" 
          :disabled="savingCategories"
          class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 border-0 cursor-pointer shadow-sm"
        >
          <span class="material-symbols-outlined text-base">{{ savingCategories ? 'sync' : 'save' }}</span>
          {{ savingCategories ? 'Salvando...' : 'Salvar Ordem das Categorias' }}
        </button>
      </div>

      <div v-if="loadingCategories" class="py-12 text-center text-gray-400">
        <span class="material-symbols-outlined animate-spin text-3xl mb-2 text-blue-600">sync</span>
        <p class="text-xs">Carregando categorias...</p>
      </div>

      <div v-else-if="categoriesList.length === 0" class="py-8 text-center text-gray-500 border border-dashed rounded">
        Nenhuma categoria encontrada.
      </div>

      <div v-else class="space-y-2 max-w-3xl">
        <div 
          v-for="(cat, idx) in categoriesList" 
          :key="cat"
          class="flex items-center justify-between p-3 bg-slate-50 border border-gray-200 rounded hover:border-blue-300 transition-colors"
        >
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
              {{ idx + 1 }}
            </span>
            <span class="text-sm font-semibold text-slate-800 uppercase">{{ cat }}</span>
          </div>

          <div class="flex items-center gap-2">
            <button 
              @click="moveCategoryUp(idx)"
              :disabled="idx === 0"
              class="p-1.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent border-0 bg-transparent cursor-pointer"
              title="Mover para cima"
            >
              <span class="material-symbols-outlined text-lg">arrow_upward</span>
            </button>
            <button 
              @click="moveCategoryDown(idx)"
              :disabled="idx === categoriesList.length - 1"
              class="p-1.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent border-0 bg-transparent cursor-pointer"
              title="Mover para baixo"
            >
              <span class="material-symbols-outlined text-lg">arrow_downward</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SEÇÃO 2: ORDENAÇÃO DE PRODUTOS -->
    <div v-if="activeSubTab === 'produtos'" class="space-y-4">
      <div class="flex justify-between items-center flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-gray-500">inventory_2</span>
            Ordem dos Equipamentos
          </h3>
          <!-- Seletor de Categoria -->
          <select 
            v-model="selectedCategory" 
            class="border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 outline-none focus:border-blue-500 uppercase"
          >
            <option value="TODAS">-- TODAS AS CATEGORIAS --</option>
            <option v-for="cat in categoriesList" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <button 
          @click="saveProductsOrder" 
          :disabled="savingProducts"
          class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 border-0 cursor-pointer shadow-sm"
        >
          <span class="material-symbols-outlined text-base">{{ savingProducts ? 'sync' : 'save' }}</span>
          {{ savingProducts ? 'Salvando...' : 'Salvar Ordem dos Equipamentos' }}
        </button>
      </div>

      <div v-if="loadingProducts" class="py-12 text-center text-gray-400">
        <span class="material-symbols-outlined animate-spin text-3xl mb-2 text-blue-600">sync</span>
        <p class="text-xs">Carregando equipamentos...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="py-8 text-center text-gray-500 border border-dashed rounded">
        Nenhum equipamento encontrado nesta categoria.
      </div>

      <div v-else class="space-y-2 max-w-4xl max-h-[600px] overflow-y-auto pr-1">
        <div 
          v-for="(prod, idx) in filteredProducts" 
          :key="prod.id"
          class="flex items-center justify-between p-3 bg-slate-50 border border-gray-200 rounded hover:border-blue-300 transition-colors gap-4"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {{ idx + 1 }}
            </span>
            <!-- Imagem Miniatura -->
            <div class="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center p-1 flex-shrink-0">
              <img :src="prod.image || '/placeholder.png'" class="max-w-full max-h-full object-contain" alt="" />
            </div>
            <!-- Info -->
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded">{{ prod.nameCode }}</span>
                <span class="text-xs font-semibold text-slate-500 uppercase truncate">{{ prod.category }}</span>
              </div>
              <p class="text-xs font-medium text-slate-800 truncate mt-0.5">{{ prod.title }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <button 
              @click="moveProductUp(idx)"
              :disabled="idx === 0"
              class="p-1.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent border-0 bg-transparent cursor-pointer"
              title="Mover para cima"
            >
              <span class="material-symbols-outlined text-lg">arrow_upward</span>
            </button>
            <button 
              @click="moveProductDown(idx)"
              :disabled="idx === filteredProducts.length - 1"
              class="p-1.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent border-0 bg-transparent cursor-pointer"
              title="Mover para baixo"
            >
              <span class="material-symbols-outlined text-lg">arrow_downward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  triggerToast?: (msg: string, type?: 'success' | 'error') => void
}>()

const supabase = useSupabaseClient()

const activeSubTab = ref<'categorias' | 'produtos'>('categorias')

// ===== CATEGORIAS =====
const categoriesList = ref<string[]>([])
const showCategoryButtons = ref(true)
const loadingCategories = ref(true)
const savingCategories = ref(false)

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const { data: catData } = await supabase.from('category_assets').select('category')
    const { data: prodData } = await supabase.from('products').select('category')
    const { data: pdfData } = await supabase.from('pdf_settings').select('category, layout_settings')

    const geralSetting = (pdfData || []).find((s: any) => s.category === 'GERAL')
    const savedOrder: string[] = geralSetting?.layout_settings?.category_order || []
    showCategoryButtons.value = geralSetting?.layout_settings?.show_category_buttons !== false

    const validCategoriesSet = new Set<string>()
    ;(catData || []).forEach((c: any) => {
      if (c.category && c.category.toUpperCase().trim() !== 'GERAL') {
        validCategoriesSet.add(c.category.toUpperCase().trim())
      }
    })
    ;(prodData || []).forEach((p: any) => {
      if (p.category && p.category.toUpperCase().trim() !== 'GERAL') {
        validCategoriesSet.add(p.category.toUpperCase().trim())
      }
    })

    const ordered: string[] = []
    for (const savedCat of savedOrder) {
      const upperSaved = savedCat.toUpperCase().trim()
      if (validCategoriesSet.has(upperSaved)) {
        ordered.push(upperSaved)
        validCategoriesSet.delete(upperSaved)
      }
    }
    const remaining = Array.from(validCategoriesSet).sort()
    categoriesList.value = [...ordered, ...remaining]
  } catch (err: any) {
    console.error('[AdminOrderSettings] Error loading categories:', err)
  } finally {
    loadingCategories.value = false
  }
}

const moveCategoryUp = (index: number) => {
  if (index <= 0) return
  const temp = categoriesList.value[index]
  categoriesList.value[index] = categoriesList.value[index - 1]
  categoriesList.value[index - 1] = temp
}

const moveCategoryDown = (index: number) => {
  if (index >= categoriesList.value.length - 1) return
  const temp = categoriesList.value[index]
  categoriesList.value[index] = categoriesList.value[index + 1]
  categoriesList.value[index + 1] = temp
}

const saveCategoriesOrder = async () => {
  savingCategories.value = true
  try {
    const { data: geralData } = await supabase
      .from('pdf_settings')
      .select('id, layout_settings')
      .eq('category', 'GERAL')
      .single()

    const currentLayout = geralData?.layout_settings || {}
    currentLayout.category_order = categoriesList.value
    currentLayout.show_category_buttons = showCategoryButtons.value

    if (geralData?.id) {
      await supabase
        .from('pdf_settings')
        .update({ layout_settings: currentLayout })
        .eq('id', geralData.id)
    } else {
      await supabase
        .from('pdf_settings')
        .insert([{ category: 'GERAL', layout_settings: currentLayout }])
    }

    props.triggerToast?.('Ordem e configurações das categorias salvas com sucesso!', 'success')
  } catch (err: any) {
    console.error('[AdminOrderSettings] Error saving category order:', err)
    props.triggerToast?.(`Erro ao salvar ordem das categorias: ${err.message || err}`, 'error')
  } finally {
    savingCategories.value = false
  }
}

// ===== PRODUTOS =====
interface ProductOrder {
  id: number
  nameCode: string
  title: string
  category: string
  image: string
  sortOrder: number
}

const productsList = ref<ProductOrder[]>([])
const selectedCategory = ref<string>('TODAS')
const loadingProducts = ref(true)
const savingProducts = ref(false)

const loadProducts = async () => {
  loadingProducts.value = true
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name_code, title, category, image, sort_order')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })

    if (error) throw error
    if (data) {
      productsList.value = data.map((p: any) => ({
        id: p.id,
        nameCode: p.name_code,
        title: p.title,
        category: p.category,
        image: p.image,
        sortOrder: p.sort_order || 0
      }))
    }
  } catch (err: any) {
    console.error('[AdminOrderSettings] Error loading products:', err)
  } finally {
    loadingProducts.value = false
  }
}

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'TODAS') return productsList.value
  return productsList.value.filter(p => p.category === selectedCategory.value)
})

const moveProductUp = (filteredIdx: number) => {
  if (filteredIdx <= 0) return
  const currentItem = filteredProducts.value[filteredIdx]
  const prevItem = filteredProducts.value[filteredIdx - 1]

  const mainIdxCurrent = productsList.value.findIndex(p => p.id === currentItem.id)
  const mainIdxPrev = productsList.value.findIndex(p => p.id === prevItem.id)

  if (mainIdxCurrent !== -1 && mainIdxPrev !== -1) {
    const temp = productsList.value[mainIdxCurrent]
    productsList.value[mainIdxCurrent] = productsList.value[mainIdxPrev]
    productsList.value[mainIdxPrev] = temp
  }
}

const moveProductDown = (filteredIdx: number) => {
  if (filteredIdx >= filteredProducts.value.length - 1) return
  const currentItem = filteredProducts.value[filteredIdx]
  const nextItem = filteredProducts.value[filteredIdx + 1]

  const mainIdxCurrent = productsList.value.findIndex(p => p.id === currentItem.id)
  const mainIdxNext = productsList.value.findIndex(p => p.id === nextItem.id)

  if (mainIdxCurrent !== -1 && mainIdxNext !== -1) {
    const temp = productsList.value[mainIdxCurrent]
    productsList.value[mainIdxCurrent] = productsList.value[mainIdxNext]
    productsList.value[mainIdxNext] = temp
  }
}

const saveProductsOrder = async () => {
  savingProducts.value = true
  try {
    for (let i = 0; i < productsList.value.length; i++) {
      const prod = productsList.value[i]
      prod.sortOrder = i + 1
      await supabase
        .from('products')
        .update({ sort_order: i + 1 })
        .eq('id', prod.id)
    }

    props.triggerToast?.('Ordem dos equipamentos salva com sucesso!', 'success')
  } catch (err: any) {
    console.error('[AdminOrderSettings] Error saving products order:', err)
    props.triggerToast?.(`Erro ao salvar ordem dos equipamentos: ${err.message || err}`, 'error')
  } finally {
    savingProducts.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>
