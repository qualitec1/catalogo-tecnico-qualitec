<template>
  <div class="bg-slate-50 text-slate-800 min-h-screen relative pb-32">
    <!-- SideNavBar Component -->
    <AdminSidebar v-model="currentTab" @csv-click="triggerCsvInput" />

    <!-- Main Content Area -->
    <main class="ml-64 p-8">
      <!-- Header -->
      <header class="flex justify-between items-center mb-10">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">
            {{ currentTab === 'categorias' ? 'Gerenciar Categorias & Capas' : 'Administração do Catálogo' }}
          </h2>
          <p class="text-slate-500 text-sm mt-1">
            {{ currentTab === 'categorias' ? 'Personalize as capas de download e as cores de cabeçalho de cada categoria.' : 'Gerencie os parâmetros técnicos e visuais dos ativos industriais.' }}
          </p>
        </div>
        <div class="flex space-x-4">
          <a href="/" target="_blank" class="flex items-center px-4 py-2 border border-gray-300 text-slate-700 font-semibold text-xs rounded hover:bg-gray-100 transition-colors no-underline">
            <span class="material-symbols-outlined mr-2 text-sm">visibility</span>
            Ver Catálogo
          </a>
          <button v-if="currentTab === 'produtos'" @click="scrollToForm" class="flex items-center px-6 py-2 bg-blue-600 text-white font-semibold text-xs rounded hover:bg-blue-700 transition-colors shadow-sm">
            <span class="material-symbols-outlined mr-2 text-sm">add</span>
            Novo Cadastro
          </button>
        </div>
      </header>

      <!-- Form and Table Grid -->
      <div v-if="currentTab === 'produtos'" class="grid grid-cols-12 gap-6">
        <!-- Cadastro de Produto Form (Asymmetric Left Column) -->
        <section id="cadastro-form" class="col-span-12 lg:col-span-5">
          <AdminProductForm 
            :saving="saving" 
            @submit="saveNewProduct" 
          />
        </section>

        <!-- Product Table Management (Right Column) -->
        <section class="col-span-12 lg:col-span-7">
          <AdminProductTable 
            :products="products"
            :loading="loading"
            :importing="importing"
            @edit="openEditModal"
            @delete="deleteProduct"
          @delete-all="deleteAllProducts"
          @csv-upload="handleCsvUpload"
          ref="productTableRef"
        />
      </section>
    </div>

    <!-- Categories & Covers Management View -->
    <div class="else-if-categorias" v-else-if="currentTab === 'categorias'">
      <AdminCategorySettings 
        :categories="categoryAssetsList"
        :loading="loadingCategories"
        :saving="saving"
        @create-category="saveNewCategoryAsset"
        @save-category="saveCategoryAsset"
        @delete-category="deleteCategoryAsset"
        @replicate-settings="replicateCategorySettings"
      />
    </div>
    </main>

    <!-- Footer -->
    <footer class="ml-64 bg-slate-900 border-t border-slate-800 absolute bottom-0 w-[calc(100%-16rem)]">
      <div class="flex flex-col md:flex-row justify-between items-center py-6 px-8 max-w-7xl mx-auto text-slate-400 text-xs">
        <span class="text-white font-bold text-sm">Qualitec</span>
        <p class="mt-4 md:mt-0">Qualitec © 2024 - Todos os direitos reservados.</p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a class="text-slate-400 hover:text-white transition-opacity duration-200" href="#">Normas Técnicas</a>
          <a class="text-slate-400 hover:text-white transition-opacity duration-200" href="#">Documentação</a>
          <a class="text-slate-400 hover:text-white transition-opacity duration-200" href="#">Termos de Uso</a>
        </div>
      </div>
    </footer>

    <!-- EDIT PRODUCT MODAL DIALOG -->
    <div v-if="editModalOpen" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div class="bg-white border border-gray-200 rounded shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button @click="closeEditModal" class="absolute top-4 right-4 p-1 hover:bg-gray-150 rounded text-gray-400 hover:text-gray-600 z-10">
          <span class="material-symbols-outlined">close</span>
        </button>
        <AdminProductForm 
          :product="editingProduct"
          :saving="saving"
          :is-edit="true"
          @submit="saveProductEdit"
          @cancel="closeEditModal"
        />
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition name="fade">
      <div v-if="showToast" :class="toastType === 'success' ? 'bg-emerald-650' : 'bg-red-650'" class="fixed bottom-10 right-10 z-[9999] text-white px-6 py-4 rounded shadow-2xl flex items-center space-x-3 transition-all duration-300">
        <span class="material-symbols-outlined">{{ toastType === 'success' ? 'check_circle' : 'error' }}</span>
        <span class="font-bold text-sm text-white">{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { hexToBase64 } from '../utils/image'

definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()

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

const currentTab = ref('produtos')
const categoryAssetsList = ref<any[]>([])
const loadingCategories = ref(false)
const productTableRef = ref<any>(null)

const triggerCsvInput = () => {
  if (productTableRef.value) {
    productTableRef.value.triggerCsvInput()
  }
}

const fetchCategoryAssetsAdmin = async () => {
  loadingCategories.value = true
  const { data: assets } = await supabase.from('category_assets').select('*').order('category')
  const { data: pdfSettingsData } = await supabase.from('pdf_settings').select('*')
  
  if (assets) {
    categoryAssetsList.value = assets.map((item: any) => {
      const settings = pdfSettingsData?.find((s: any) => s.category.toUpperCase().trim() === item.category.toUpperCase().trim()) || {}
      return {
        id: item.id,
        category: item.category,
        originalCategory: item.category,
        coverImageUrl: item.cover_image_url,
        coverImageBlob: item.cover_image_blob ? hexToBase64(item.cover_image_blob) : null,
        colorHex: item.color_hex || '#376092',
        
        pdfSettingsId: settings.id,
        titleFontSize: settings.title_font_size || '36px',
        titlePositionY: settings.title_position_y || '0px',
        imagePosition: settings.image_position || 'right',
        cardLayoutOrder: settings.card_layout_order || 'specs-first',
        fontSizeSpecs: settings.font_size_specs || '10px',
        dividerLineColor: settings.divider_line_color || '#cbd5e1',
        productSpacing: settings.product_spacing || '24px',
        productImageOffsetY: settings.product_image_offset_y || '0px',
        productImageOffsetX: settings.product_image_offset_x || '0px',
        cardOffsetX: settings.card_offset_x || '0px',
        cardOffsetY: settings.card_offset_y || '0px',
        cardTitleOffsetX: settings.card_title_offset_x || '0px',
        cardTitleOffsetY: settings.card_title_offset_y || '0px',
        cardModelFontSize: settings.card_model_font_size || '24px',
        cardModelOffsetX: settings.card_model_offset_x || '0px',
        cardModelOffsetY: settings.card_model_offset_y || '0px',
        titleFontFamily: settings.title_font_family || 'Inter',
        cardTitleFontFamily: settings.card_title_font_family || 'Inter',
        cardModelFontFamily: settings.card_model_font_family || 'Inter',
        specsFontFamily: settings.specs_font_family || 'Inter',
        logoWidth: settings.logo_width || '240px',
        logoHeight: settings.logo_height || '75px',
        logoPositionX: settings.logo_position_x || '60px',
        logoPositionY: settings.logo_position_y || '60px',
        specsLabelWidth: settings.specs_label_width || '45%',
        specsValueWidth: settings.specs_value_width || '55%',
        specsPaddingY: settings.specs_padding_y || '4px',
        specsLineStyle: settings.specs_line_style || 'dashed',
        specsLineColor: settings.specs_line_color || '#cbd5e1',
        layout_settings: settings.layout_settings || {},
        titleBold: !!settings.title_bold,
        titleItalic: !!settings.title_italic,
        titleUnderline: !!settings.title_underline,
        cardTitleBold: !!settings.card_title_bold,
        cardTitleItalic: !!settings.card_title_italic,
        cardTitleUnderline: !!settings.card_title_underline,
        cardModelBold: !!settings.card_model_bold,
        cardModelItalic: !!settings.card_model_italic,
        cardModelUnderline: !!settings.card_model_underline,
        specsBold: !!settings.specs_bold,
        specsItalic: !!settings.specs_italic,
        specsUnderline: !!settings.specs_underline,
        specsValBold: !!settings.specs_val_bold,
        specsValItalic: !!settings.specs_val_italic,
        specsValUnderline: !!settings.specs_val_underline,
        cardHeaderLayout: settings.card_header_layout || 'model-left',
        tagFontFamily: settings.tag_font_family || 'Inter',
        tagFontSize: settings.tag_font_size || '10px',
        tagBold: settings.tag_bold !== null ? !!settings.tag_bold : true,
        tagItalic: !!settings.tag_italic,
        tagUnderline: !!settings.tag_underline,
        tagOffsetX: settings.tag_offset_x || '0px',
        tagOffsetY: settings.tag_offset_y || '0px',
        orientation: settings.orientation || 'portrait',
        pdfImageScale: settings.pdf_image_scale !== undefined && settings.pdf_image_scale !== null ? Number(settings.pdf_image_scale) : 1.0,
        pdfImageScaleX: settings.pdf_image_scale_x !== undefined && settings.pdf_image_scale_x !== null ? Number(settings.pdf_image_scale_x) : 1.0,
        pdfImageScaleY: settings.pdf_image_scale_y !== undefined && settings.pdf_image_scale_y !== null ? Number(settings.pdf_image_scale_y) : 1.0,
        landscapeSettings: (() => {
          let ls = settings.landscape_settings
          if (typeof ls === 'string') { try { ls = JSON.parse(ls) } catch { ls = null } }
          return ls || {}
        })(),
        
        uploading: false,
        hasChanges: false
      }
    })
  }
  loadingCategories.value = false
}

// Watch tab switches to reload category list
watch(currentTab, (newTab) => {
  if (newTab === 'categorias') {
    fetchCategoryAssetsAdmin()
  }
})

// Save Category Asset & PDF Settings
const saveCategoryAsset = async (catAsset: any) => {
  saving.value = true
  try {
    const originalCat = catAsset.originalCategory.toUpperCase().trim()
    const newCat = catAsset.category.toUpperCase().trim()
    const hasNameChanged = originalCat !== newCat

    if (hasNameChanged && !newCat) {
      throw new Error('O nome da categoria não pode estar em branco.')
    }

    let dbBlob = catAsset.coverImageBlob
    if (dbBlob && !dbBlob.startsWith('\\x')) {
      // Convert base64 back to hex string
      const binary = atob(dbBlob)
      let hex = ''
      for (let i = 0; i < binary.length; i++) {
        const h = binary.charCodeAt(i).toString(16)
        hex += h.length === 1 ? '0' + h : h
      }
      dbBlob = '\\x' + hex
    }

    // 1. Update category_assets
    const assetPayload = {
      category: newCat,
      cover_image_url: catAsset.coverImageUrl,
      cover_image_blob: dbBlob,
      color_hex: catAsset.colorHex
    }
    const { error: assetError } = await supabase
      .from('category_assets')
      .update(assetPayload)
      .eq('id', catAsset.id)
      
    if (assetError) throw assetError

    // 2. If name changed, update the foreign references / categories in other tables
    if (hasNameChanged) {
      // Update products table
      const { error: productsUpdateError } = await supabase
        .from('products')
        .update({ category: newCat })
        .eq('category', originalCat)
      
      if (productsUpdateError) throw productsUpdateError
    }

    // 3. Update pdf_settings
    const settingsPayload = {
      category: newCat,
      title_font_size: catAsset.titleFontSize,
      title_position_y: catAsset.titlePositionY,
      image_position: catAsset.imagePosition,
      card_layout_order: catAsset.cardLayoutOrder,
      font_size_specs: catAsset.fontSizeSpecs,
      divider_line_color: catAsset.dividerLineColor,
      product_spacing: catAsset.productSpacing,
      product_image_offset_y: catAsset.productImageOffsetY,
      product_image_offset_x: catAsset.productImageOffsetX,
      card_offset_x: catAsset.cardOffsetX,
      card_offset_y: catAsset.cardOffsetY,
      card_title_offset_x: catAsset.cardTitleOffsetX,
      card_title_offset_y: catAsset.cardTitleOffsetY,
      card_model_font_size: catAsset.cardModelFontSize,
      card_model_offset_x: catAsset.cardModelOffsetX,
      card_model_offset_y: catAsset.cardModelOffsetY,
      title_font_family: catAsset.titleFontFamily,
      card_title_font_family: catAsset.cardTitleFontFamily,
      card_model_font_family: catAsset.cardModelFontFamily,
      specs_font_family: catAsset.specsFontFamily,
      logo_width: catAsset.logoWidth,
      logo_height: catAsset.logoHeight,
      logo_position_x: catAsset.logoPositionX,
      logo_position_y: catAsset.logoPositionY,
      specs_label_width: catAsset.specsLabelWidth,
      specs_value_width: catAsset.specsValueWidth,
      specs_padding_y: catAsset.specsPaddingY,
      specs_line_style: catAsset.specsLineStyle,
      specs_line_color: catAsset.specsLineColor,
      layout_settings: catAsset.layout_settings || {},
      title_bold: catAsset.titleBold,
      title_italic: catAsset.titleItalic,
      title_underline: catAsset.titleUnderline,
      card_title_bold: catAsset.cardTitleBold,
      card_title_italic: catAsset.cardTitleItalic,
      card_title_underline: catAsset.cardTitleUnderline,
      card_model_bold: catAsset.cardModelBold,
      card_model_italic: catAsset.cardModelItalic,
      card_model_underline: catAsset.cardModelUnderline,
      specs_bold: catAsset.specsBold,
      specs_italic: catAsset.specsItalic,
      specs_underline: catAsset.specsUnderline,
      specs_val_bold: catAsset.specsValBold,
      specs_val_italic: catAsset.specsValItalic,
      specs_val_underline: catAsset.specsValUnderline,
      card_header_layout: catAsset.cardHeaderLayout,
      tag_font_family: catAsset.tagFontFamily,
      tag_font_size: catAsset.tagFontSize,
      tag_bold: catAsset.tagBold,
      tag_italic: catAsset.tagItalic,
      tag_underline: catAsset.tagUnderline,
      tag_offset_x: catAsset.tagOffsetX,
      tag_offset_y: catAsset.tagOffsetY,
      orientation: catAsset.orientation || 'portrait',
      pdf_image_scale: catAsset.pdfImageScale !== undefined && catAsset.pdfImageScale !== null ? Number(catAsset.pdfImageScale) : 1.0,
      pdf_image_scale_x: catAsset.pdfImageScaleX !== undefined && catAsset.pdfImageScaleX !== null ? Number(catAsset.pdfImageScaleX) : 1.0,
      pdf_image_scale_y: catAsset.pdfImageScaleY !== undefined && catAsset.pdfImageScaleY !== null ? Number(catAsset.pdfImageScaleY) : 1.0,
      landscape_settings: catAsset.landscapeSettings && Object.keys(catAsset.landscapeSettings).length > 0
        ? catAsset.landscapeSettings
        : null
    }
    
    if (catAsset.pdfSettingsId) {
      const { error: settingsError } = await supabase
        .from('pdf_settings')
        .update(settingsPayload)
        .eq('id', catAsset.pdfSettingsId)
      if (settingsError) throw settingsError
    } else {
      const { error: settingsError } = await supabase
        .from('pdf_settings')
        .insert([settingsPayload])
      if (settingsError) throw settingsError
    }
      
    triggerToast(`Configurações da categoria ${newCat} atualizadas com sucesso!`, 'success')
    catAsset.hasChanges = false
    catAsset.originalCategory = newCat
    
    // Refresh dynamic composable states in parallel
    const { fetchAssets } = useCategoryColors()
    const { fetchPdfSettings } = usePdfSettings()
    await Promise.all([
      fetchAssets(),
      fetchPdfSettings(),
      fetchCategoryAssetsAdmin()
    ])
  } catch (err: any) {
    console.error(err)
    triggerToast(`Erro ao atualizar categoria: ${err.message}`, 'error')
  } finally {
    saving.value = false
  }
}

// Replicate Category PDF Layout Settings
const replicateCategorySettings = async ({ source, targetIds }: { source: any, targetIds: string[] }) => {
  saving.value = true
  try {
    for (const targetId of targetIds) {
      const targetCat = categoryAssetsList.value.find(c => c.id === targetId)
      if (!targetCat) continue

      const payload = {
        category: targetCat.category,
        title_font_size: source.titleFontSize,
        title_position_y: source.titlePositionY,
        image_position: source.imagePosition,
        card_layout_order: source.cardLayoutOrder,
        font_size_specs: source.fontSizeSpecs,
        divider_line_color: source.dividerLineColor,
        product_spacing: source.productSpacing,
        product_image_offset_y: source.productImageOffsetY,
        product_image_offset_x: source.productImageOffsetX,
        card_offset_x: source.cardOffsetX,
        card_offset_y: source.cardOffsetY,
        card_title_offset_x: source.cardTitleOffsetX,
        card_title_offset_y: source.cardTitleOffsetY,
        card_model_font_size: source.cardModelFontSize,
        card_model_offset_x: source.cardModelOffsetX,
        card_model_offset_y: source.cardModelOffsetY,
        title_font_family: source.titleFontFamily,
        card_title_font_family: source.cardTitleFontFamily,
        card_model_font_family: source.cardModelFontFamily,
        specs_font_family: source.specsFontFamily,
        logo_width: source.logoWidth,
        logo_height: source.logoHeight,
        logo_position_x: source.logoPositionX,
        logo_position_y: source.logoPositionY,
        specs_label_width: source.specsLabelWidth,
        specs_value_width: source.specsValueWidth,
        specs_padding_y: source.specsPaddingY,
        specs_line_style: source.specsLineStyle,
        specs_line_color: source.specsLineColor,
        layout_settings: source.layout_settings || {},
        title_bold: source.titleBold,
        title_italic: source.titleItalic,
        title_underline: source.titleUnderline,
        card_title_bold: source.cardTitleBold,
        card_title_italic: source.cardTitleItalic,
        card_title_underline: source.cardTitleUnderline,
        card_model_bold: source.cardModelBold,
        card_model_italic: source.cardModelItalic,
        card_model_underline: source.cardModelUnderline,
        specs_bold: source.specsBold,
        specs_italic: source.specsItalic,
        specs_underline: source.specsUnderline,
        specs_val_bold: source.specsValBold,
        specs_val_italic: source.specsValItalic,
        specs_val_underline: source.specsValUnderline,
        card_header_layout: source.cardHeaderLayout,
        tag_font_family: source.tagFontFamily,
        tag_font_size: source.tagFontSize,
        tag_bold: source.tagBold,
        tag_italic: source.tagItalic,
        tag_underline: source.tagUnderline,
        tag_offset_x: source.tagOffsetX,
        tag_offset_y: source.tagOffsetY,
        orientation: source.orientation || 'portrait',
        pdf_image_scale: source.pdfImageScale !== undefined && source.pdfImageScale !== null ? Number(source.pdfImageScale) : 1.0,
        pdf_image_scale_x: source.pdfImageScaleX !== undefined && source.pdfImageScaleX !== null ? Number(source.pdfImageScaleX) : 1.0,
        pdf_image_scale_y: source.pdfImageScaleY !== undefined && source.pdfImageScaleY !== null ? Number(source.pdfImageScaleY) : 1.0,
        landscape_settings: source.landscapeSettings && Object.keys(source.landscapeSettings).length > 0
          ? source.landscapeSettings
          : null
      }

      if (targetCat.pdfSettingsId) {
        const { error: settingsError } = await supabase
          .from('pdf_settings')
          .update(payload)
          .eq('id', targetCat.pdfSettingsId)
        if (settingsError) throw settingsError
      } else {
        const { error: settingsError } = await supabase
          .from('pdf_settings')
          .insert([payload])
        if (settingsError) throw settingsError
      }
    }

    triggerToast('Configurações de layout replicadas com sucesso!', 'success')

    const { fetchPdfSettings } = usePdfSettings()
    await fetchPdfSettings()
    await fetchCategoryAssetsAdmin()
  } catch (err: any) {
    console.error(err)
    triggerToast(`Erro ao replicar configurações: ${err.message}`, 'error')
  } finally {
    saving.value = false
  }
}

// Save new category
const saveNewCategoryAsset = async (name: string) => {
  saving.value = true
  try {
    const catName = name.toUpperCase().trim()
    const payload = {
      category: catName,
      cover_image_url: '/placeholder.png',
      color_hex: '#376092'
    }
    const { error } = await supabase.from('category_assets').insert([payload])
    if (error) throw error
    
    // Create default settings in pdf_settings
    await supabase.from('pdf_settings').insert([{
      category: catName,
      title_font_size: '36px',
      title_position_y: '0px',
      image_position: 'right',
      card_layout_order: 'specs-first',
      font_size_specs: '10px',
      divider_line_color: '#cbd5e1',
      product_spacing: '24px',
      product_image_offset_y: '0px',
      product_image_offset_x: '0px',
      card_offset_x: '0px',
      card_offset_y: '0px',
      card_title_offset_x: '0px',
      card_title_offset_y: '0px',
      card_model_font_size: '24px',
      card_model_offset_x: '0px',
      card_model_offset_y: '0px',
      title_bold: false,
      title_italic: false,
      title_underline: false,
      card_title_bold: false,
      card_title_italic: false,
      card_title_underline: false,
      card_model_bold: false,
      card_model_italic: false,
      card_model_underline: false,
      specs_bold: false,
      specs_italic: false,
      specs_underline: false,
      specs_val_bold: false,
      specs_val_italic: false,
      specs_val_underline: false,
      card_header_layout: 'model-left',
      tag_font_family: 'Inter',
      tag_font_size: '10px',
      tag_bold: true,
      tag_italic: false,
      tag_underline: false,
      tag_offset_x: '0px',
      tag_offset_y: '0px',
      orientation: 'portrait',
      pdf_image_scale: 1.0,
      pdf_image_scale_x: 1.0,
      pdf_image_scale_y: 1.0,
      landscape_settings: null
    }])
    
    triggerToast('Nova categoria criada com sucesso!', 'success')
    const { fetchAssets } = useCategoryColors()
    const { fetchPdfSettings } = usePdfSettings()
    await Promise.all([
      fetchCategoryAssetsAdmin(),
      fetchAssets(),
      fetchPdfSettings()
    ])
  } catch (err: any) {
    console.error(err)
    triggerToast(`Erro ao criar categoria: ${err.message}`, 'error')
  } finally {
    saving.value = false
  }
}

// Database States
const products = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const importing = ref(false)

// Editing Modal States
const editModalOpen = ref(false)
const editingProduct = ref<any>(null)

const fetchProducts = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, tag, tag_color_class, name_code, title, image, image_blob, datasheet_name, datasheet_url, bg_class, card_layout, category, specs, layout_slots, image_scale, image_offset_x, image_offset_y')
      .order('id')
    if (error) throw error
    if (data) {
      products.value = data.map((item: any) => ({
        id: item.id,
        tag: item.tag || 'NOVO',
        tagColorClass: item.tag_color_class || 'text-[#005db7]',
        nameCode: item.name_code,
        title: item.title,
        description: '',
        image: item.image,
        imageBlob: item.image_blob ? hexToBase64(item.image_blob) : null,
        datasheetName: item.datasheet_name,
        datasheetBlob: null,
        datasheetUrl: item.datasheet_url,
        bgClass: item.bg_class || 'bg-secondary',
        cardLayout: item.card_layout,
        category: item.category,
        specs: item.specs || [],
        layoutSlots: item.layout_slots || 3,
        imageScale: item.image_scale !== null ? Number(item.image_scale) : 1.0,
        imageOffsetX: item.image_offset_x !== null ? Number(item.image_offset_x) : 0,
        imageOffsetY: item.image_offset_y !== null ? Number(item.image_offset_y) : 0
      }))
    }
  } catch (err: any) {
    console.error('Error fetching products:', err)
    triggerToast(`Erro ao carregar produtos: ${err.message || err}`, 'error')
  } finally {
    loading.value = false
  }
}

// Color schemes matching Tailwind configurations
const colorOptions = [
  { bgClass: 'bg-secondary', tagColor: 'text-[#005db7]', name: 'Azul' },
  { bgClass: 'bg-tertiary-container', tagColor: 'text-[#003d0b]', name: 'Verde' },
  { bgClass: 'bg-error', tagColor: 'text-[#ba1a1a]', name: 'Vermelho' },
  { bgClass: 'bg-primary-container', tagColor: 'text-[#003366]', name: 'Azul Escuro' }
]

// Add new product submit handler
const saveNewProduct = async ({ product, colorIndex }: { product: any, colorIndex: number }) => {
  saving.value = true
  try {
    const selectedColor = colorOptions[colorIndex]
    const payload = {
      title: product.title,
      name_code: product.nameCode,
      category: product.category.toUpperCase().trim(),
      image: product.imageName ? `/${product.imageName}` : 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Produto',
      image_blob: product.imageBlob,
      datasheet_name: product.datasheetName || null,
      datasheet_blob: product.datasheetBlob || null,
      datasheet_url: product.datasheetUrl || null,
      tag: product.tag,
      tag_color_class: selectedColor.tagColor,
      bg_class: selectedColor.bgClass,
      layout_slots: product.layoutSlots,
      specs: product.specs,
      image_scale: product.imageScale || 1.0,
      image_offset_x: product.imageOffsetX || 0,
      image_offset_y: product.imageOffsetY || 0
    }

    const { error } = await supabase.from('products').insert([payload])
    if (error) throw error

    triggerToast('Equipamento cadastrado com sucesso!', 'success')
    await fetchProducts()
  } catch (err: any) {
    console.error(err)
    triggerToast(`Erro ao cadastrar produto: ${err.message}`, 'error')
  } finally {
    saving.value = false
  }
}

// Edit actions
const openEditModal = (product: any) => {
  editingProduct.value = JSON.parse(JSON.stringify(product))
  editModalOpen.value = true
}

const closeEditModal = () => {
  editingProduct.value = null
  editModalOpen.value = false
}

const saveProductEdit = async ({ product, colorIndex }: { product: any, colorIndex: number }) => {
  saving.value = true
  try {
    const selectedColor = colorOptions[colorIndex]
    const payload = {
      title: product.title,
      name_code: product.nameCode,
      category: product.category.toUpperCase().trim(),
      tag: product.tag,
      tag_color_class: selectedColor.tagColor,
      bg_class: selectedColor.bgClass,
      layout_slots: product.layoutSlots,
      specs: product.specs,
      image_scale: product.imageScale || 1.0,
      image_offset_x: product.imageOffsetX || 0,
      image_offset_y: product.imageOffsetY || 0
    }
    
    // Add conditional updates for images/PDFs if uploaded newly
    if (product.imageBlob && product.imageBlob.startsWith('\\x')) {
      Object.assign(payload, {
        image: `/${product.imageName}`,
        image_blob: product.imageBlob
      })
    }
    if (product.datasheetBlob && product.datasheetBlob.startsWith('\\x')) {
      Object.assign(payload, {
        datasheet_name: product.datasheetName,
        datasheet_blob: product.datasheetBlob
      })
    }
    if (product.datasheetUrl) {
      Object.assign(payload, {
        datasheet_url: product.datasheetUrl
      })
    }

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', product.id)
      
    if (error) throw error

    triggerToast('Equipamento atualizado com sucesso!', 'success')
    closeEditModal()
    await fetchProducts()
  } catch (err: any) {
    console.error(err)
    triggerToast(`Erro ao atualizar produto: ${err.message}`, 'error')
  } finally {
    saving.value = false
  }
}

// Delete actions
const deleteProduct = async (id: number) => {
  if (confirm('Deseja realmente remover este equipamento?')) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      triggerToast('Equipamento removido do catálogo.', 'success')
      await fetchProducts()
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao remover produto: ${err.message}`, 'error')
    }
  }
}

// Helper to parse a CSV line supporting delimiters and quotes
const parseCsvLine = (line: string, delimiter: string) => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result.map(val => {
    let clean = val
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.substring(1, clean.length - 1)
    }
    return clean.replace(/""/g, '"')
  })
}

// Robust character-by-character CSV parser that supports quotes, delimiters, and newlines inside cells
const parseFullCsv = (text: string, delimiter: string): string[][] => {
  const result: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"'
        i++ // Skip double quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentField.trim())
      currentField = ''
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++ // Skip \n
      }
      currentRow.push(currentField.trim())
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        result.push(currentRow)
      }
      currentRow = []
      currentField = ''
    } else {
      currentField += char
    }
  }
  
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    result.push(currentRow)
  }
  
  return result
}

// Bulk CSV Import Logic
const handleCsvUpload = async (file: File) => {
  importing.value = true
  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = e.target?.result as string
    if (!text || !text.trim()) {
      triggerToast('O arquivo CSV está vazio.', 'error')
      importing.value = false
      return
    }

    const delimiter = text.includes(';') ? ';' : ','
    const allRows = parseFullCsv(text, delimiter)
    if (allRows.length === 0) {
      triggerToast('O arquivo CSV está vazio.', 'error')
      importing.value = false
      return
    }

    const headers = allRows[0]
    const parsedProducts = []
    
    for (let i = 1; i < allRows.length; i++) {
      const values = allRows[i]
      if (values.length === 0 || (values.length === 1 && values[0] === '')) continue
      
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => {
        row[h] = values[idx] !== undefined ? values[idx] : ''
      })
      
      // Core columns
      const coreColumns = ['title', 'name_code', 'category', 'tag', 'layout_slots', 'image_url', 'datasheet_url', 'specs']
      const specs: { label: string, value: string }[] = []
      
      // 1. Process specs column if present (fallback)
      if (row['specs']) {
        row['specs'].split(';').filter(Boolean).forEach(s => {
          const parts = s.split(':')
          if (parts[0]) {
            specs.push({
              label: parts[0].trim(),
              value: parts[1] ? parts[1].trim() : ''
            })
          }
        })
      }
      
      // 2. Process all other columns as individual specifications (dynamic columns)
      headers.forEach(h => {
        if (!coreColumns.includes(h) && row[h]) {
          specs.push({
            label: h,
            value: row[h]
          })
        }
      })
      
      const csvSlots = parseInt(row['layout_slots']) || 3
      let dbLayoutSlots = 3 // default to 2 products per page (3 slots)
      if (csvSlots === 1) {
        dbLayoutSlots = 6 // 1 product per page = 6 slots
      } else if (csvSlots === 2) {
        dbLayoutSlots = 3 // 2 products per page = 3 slots
      } else if (csvSlots === 6) {
        dbLayoutSlots = 1 // 6 products per page = 1 slot
      }

      parsedProducts.push({
        title: row['title'],
        name_code: row['name_code'],
        category: row['category'] ? row['category'].toUpperCase().trim() : 'GERAL',
        tag: row['tag'] || 'ATIVO',
        tag_color_class: 'text-[#005db7]',
        bg_class: 'bg-secondary',
        layout_slots: dbLayoutSlots,
        image: row['image_url'] || 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Produto',
        datasheet_url: row['datasheet_url'] || null,
        specs: specs
      })
    }
    
    try {
      const { error } = await supabase.from('products').insert(parsedProducts)
      if (error) throw error
      triggerToast(`${parsedProducts.length} produtos importados com sucesso!`, 'success')
      await fetchProducts()
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao importar CSV: ${err.message}`, 'error')
    } finally {
      importing.value = false
    }
  }
  reader.readAsText(file)
}

// Delete all products
const deleteAllProducts = async () => {
  loading.value = true
  try {
    const { error } = await supabase.from('products').delete().neq('id', 0)
    if (error) throw error
    triggerToast('Todos os produtos foram removidos do catálogo com sucesso!', 'success')
    await fetchProducts()
  } catch (err: any) {
    console.error(err)
    triggerToast(`Erro ao remover todos os produtos: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// Delete category asset and settings
const deleteCategoryAsset = async (id: string) => {
  saving.value = true
  try {
    const catAsset = categoryAssetsList.value.find(c => c.id === id)
    if (!catAsset) return
    const catName = catAsset.category.toUpperCase().trim()

    // 1. Delete category assets
    const { error: assetError } = await supabase.from('category_assets').delete().eq('id', id)
    if (assetError) throw assetError

    // 2. Delete pdf settings
    const { error: settingsError } = await supabase.from('pdf_settings').delete().eq('category', catName)
    if (settingsError) throw settingsError

    triggerToast(`Categoria "${catName}" excluída com sucesso!`, 'success')
    
    const { fetchAssets } = useCategoryColors()
    const { fetchPdfSettings } = usePdfSettings()
    await Promise.all([
      fetchAssets(),
      fetchPdfSettings(),
      fetchCategoryAssetsAdmin()
    ])
  } catch (err: any) {
    console.error(err)
    triggerToast(`Erro ao excluir categoria: ${err.message}`, 'error')
  } finally {
    saving.value = false
  }
}

// Smooth scroll to creation form
const scrollToForm = () => {
  if (process.client) {
    document.getElementById('cadastro-form')?.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  fetchProducts()
})
</script>
