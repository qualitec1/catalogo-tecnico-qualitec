<template>
  <div v-if="rendering" class="fixed top-0 left-0 w-full h-full bg-white z-[9999] overflow-auto flex flex-col items-center justify-center py-10">
    <div class="flex flex-col items-center space-y-4 max-w-md text-center px-6">
      <span class="material-symbols-outlined animate-spin text-5xl text-blue-600 mb-2">sync</span>
      <h3 class="text-xl font-bold text-slate-800">Gerando Catálogo em Alta Velocidade</h3>
      <p class="text-sm text-gray-500 font-medium min-h-[20px]">{{ progressText || 'Iniciando...' }}</p>
      <div class="w-64 bg-gray-200 h-2 rounded-full overflow-hidden shadow-inner">
        <div class="bg-blue-600 h-full transition-all duration-300 rounded-full" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <span class="text-xs font-mono font-bold text-gray-400 mt-1">{{ progressPercent }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product } from '~/components/ProductCard.vue'
import { hexToBase64 } from '../utils/image'
import { preloadAllImages, buildCatalogPdf } from '../utils/pdfBuilder'

const QUALITEC_LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJOpxk8IRBgRW2bvQlS_z4LoXARfSvqvz2saPXY9SVEh_22Bcd1VS5ijTW9c3L5WiWT0idDIuscN94pofAxJzmGnXWNILAeSKTQdpe0NSl8pmXlo5Mo2KzPIESuDMk-6ap5WOs_icm6enTpaiHanmAbwntVxfvVTPLdAKIwMg7L88cyvuALuJQqv2-2ntPUxn3BgVkSCLfjyupjGSuOW5zhpBXbfo-ac3ZkUg-WHHUrhMMhz1XIsk_yPD5jMMWbkCwWOJV1BBvHWM'

const props = defineProps<{
  products: Product[],
  isGenerating: boolean,
  forceLandscape?: boolean,
  coverCategory?: string,
  publishMode?: boolean
}>()

const emit = defineEmits(['complete', 'published'])

const supabase = useSupabaseClient()
const rendering = ref(false)
const progressText = ref('')
const progressPercent = ref(0)
const coverImageUrl = ref<string | null>(null)
const coverImageBlob = ref<string | null>(null)

// ===== Composables =====
const { getCategoryColor, getCategoryCover, fetchAssets } = useCategoryColors()
const { getPdfSettings, getLandscapePdfSettings, fetchPdfSettings } = usePdfSettings()

// ===== Computed: slot helper =====
const getSlots = (product: any) => {
  const slots = product.layoutSlots !== undefined ? product.layoutSlots : product.layout_slots
  if (slots === 6 || slots === 3 || slots === 1) return slots
  return 3
}

// ===== Computed: pages (bin-packing) =====
const pages = computed(() => {
  const groups: Record<string, Product[]> = {}
  for (const product of props.products) {
    const cat = product.category || 'Geral'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(product)
  }

  const sortedCategories = Object.keys(groups).sort((a, b) => {
    const aN = a.toUpperCase().trim()
    const bN = b.toUpperCase().trim()
    if (aN === 'VÁLVULAS' || aN === 'VALVULAS') return -1
    if (bN === 'VÁLVULAS' || bN === 'VALVULAS') return 1
    if (aN === 'INCÊNDIO' || aN === 'INCENDIO') return -1
    if (bN === 'INCÊNDIO' || bN === 'INCENDIO') return 1
    return a.localeCompare(b)
  })

  const result: Product[][] = []
  for (const cat of sortedCategories) {
    const catProducts = groups[cat]
    const catPages: { products: Product[], usedSlots: number }[] = []
    for (const product of catProducts) {
      const slots = getSlots(product)
      let foundPage = false
      for (const page of catPages) {
        if (page.usedSlots + slots <= 6) {
          page.products.push(product)
          page.usedSlots += slots
          foundPage = true
          break
        }
      }
      if (!foundPage) {
        catPages.push({ products: [product], usedSlots: slots })
      }
    }
    for (const page of catPages) result.push(page.products)
  }
  return result
})

// ===== Computed: category & color =====
const catalogCategory = computed(() => {
  if (props.coverCategory) return props.coverCategory
  if (!props.products || props.products.length === 0) return 'Catálogo'
  const categories = new Set(props.products.map(p => p.category))
  if (categories.size === 1) return props.products[0].category
  return 'Geral'
})

const catalogBgClass = computed(() => {
  const dynamicColor = getCategoryColor(catalogCategory.value)
  if (dynamicColor) return dynamicColor
  if (catalogCategory.value === 'INCÊNDIO') return '#C0504D'
  if (catalogCategory.value === 'GERAL' || catalogCategory.value === 'VÁLVULAS') return '#376092'
  if (!props.products || props.products.length === 0) return '#2563eb'
  return props.products[0].bgClass || '#376092'
})

const isLandscape = computed(() => {
  if (props.forceLandscape) return true
  const settings = getPdfSettings(catalogCategory.value)
  return settings.orientation === 'landscape'
})

// ===== Helpers =====
const getBgColor = (bgClass: string | null | undefined, category?: string) => {
  const dynamicColor = getCategoryColor(category)
  if (dynamicColor) return dynamicColor
  if (category) {
    const catUpper = category.toUpperCase().trim()
    if (catUpper === 'VÁLVULAS' || catUpper === 'VALVULAS' || catUpper === 'GERAL') return '#376092'
    if (catUpper === 'INCÊNDIO' || catUpper === 'INCENDIO') return '#C0504D'
  }
  if (!bgClass) return '#376092'
  if (bgClass.startsWith('#')) return bgClass
  const hexMatch = bgClass.match(/bg-\[#([0-9a-fA-F]{6})\]/)
  if (hexMatch) return `#${hexMatch[1]}`
  const colorMap: Record<string, string> = {
    'bg-secondary': '#005db7', 'bg-tertiary-container': '#003d0b',
    'bg-error': '#ba1a1a', 'bg-primary-container': '#003366',
    'bg-blue-600': '#2563eb', 'bg-blue-900': '#1e3a8a',
  }
  return colorMap[bgClass] || '#376092'
}

const getPageSettings = (page: Product[]) => {
  const cat = page && page.length > 0 ? page[0].category : catalogCategory.value
  const settings = isLandscape.value ? getLandscapePdfSettings(cat) : getPdfSettings(cat)
  let baseSettings = settings ? { ...settings } : {}
  
  if (page && page.length > 0) {
    const slots = getSlots(page[0])
    if (settings && settings.layout_settings && settings.layout_settings[slots]) {
      const overrides = settings.layout_settings[slots]
      for (const key of Object.keys(overrides)) {
        const val = overrides[key]
        if (val !== undefined && val !== null && val !== '') {
          const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
          baseSettings[snakeKey] = val
          baseSettings[key] = val
        }
      }
    }
  }
  return new Proxy(baseSettings, {
    get(target, prop) {
      if (typeof prop === 'string') {
        if (prop in target) return target[prop]
        const camelProp = prop.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        if (camelProp in target) return target[camelProp]
        const snakeProp = prop.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
        if (snakeProp in target) return target[snakeProp]
      }
      return target[prop as any]
    }
  })
}

const getCoverImageSrc = (): string | null => {
  const blob = coverImageBlob.value
  const url = coverImageUrl.value
  if (blob) {
    const isJpg = url && (url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg'))
    const mime = isJpg ? 'image/jpeg' : 'image/png'
    return `data:${mime};base64,${hexToBase64(blob)}`
  }
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) return url
  return null
}

const fetchCoverImage = async (category: string) => {
  const asset = getCategoryCover(category) || getCategoryCover('Geral')
  if (asset) {
    coverImageUrl.value = asset.cover_image_url
    coverImageBlob.value = asset.cover_image_blob
  } else {
    try {
      const { data } = await supabase
        .from('category_assets')
        .select('cover_image_url, cover_image_blob')
        .eq('category', category)
        .single()
      if (data) {
        coverImageUrl.value = data.cover_image_url
        coverImageBlob.value = data.cover_image_blob
      } else {
        const fallback = await supabase.from('category_assets').select('cover_image_url, cover_image_blob').eq('category', 'Geral').single()
        if (fallback.data) {
          coverImageUrl.value = fallback.data.cover_image_url
          coverImageBlob.value = fallback.data.cover_image_blob
        }
      }
    } catch (e) {
      console.error('Error fetching cover image:', e)
    }
  }
}

// ===== Watch: Generate PDF =====
watch(() => props.isGenerating, async (newVal) => {
  if (newVal && process.client) {
    rendering.value = true
    progressText.value = 'Carregando configurações...'
    progressPercent.value = 5

    try {
      // 1. Load settings
      await fetchAssets()
      await fetchPdfSettings()
      await fetchCoverImage(catalogCategory.value)

      progressText.value = 'Carregando imagens dos produtos...'
      progressPercent.value = 10

      // 2. Pre-load all images in parallel
      const coverSrc = getCoverImageSrc()
      const imageCache = await preloadAllImages(
        props.products,
        coverSrc,
        QUALITEC_LOGO_URL,
        (loaded, total) => {
          const pct = 10 + Math.round((loaded / Math.max(total, 1)) * 70)
          progressPercent.value = pct
          progressText.value = `Carregando imagens (${loaded}/${total})...`
        }
      )

      progressText.value = 'Construindo catálogo PDF...'
      progressPercent.value = 85

      // 3. Build PDF programmatically (near-instant)
      const pdf = await buildCatalogPdf({
        pages: pages.value,
        isLandscape: isLandscape.value,
        categoryName: catalogCategory.value,
        categoryColor: getBgColor(catalogBgClass.value, catalogCategory.value),
        coverImageDataUrl: coverSrc,
        logoDataUrl: QUALITEC_LOGO_URL,
        imageCache,
        getPageSettings,
        getBgColor,
        getSlots,
      })

      // 4. Save locally
      const docFilename = isLandscape.value
        ? `Catalogo_Qualitec_${catalogCategory.value.replace(/[^a-z0-9]/gi, '_')}_Slides.pdf`
        : `Catalogo_Qualitec_${catalogCategory.value.replace(/[^a-z0-9]/gi, '_')}.pdf`

      progressText.value = 'Salvando arquivo...'
      progressPercent.value = 93
      pdf.save(docFilename)

      // 5. Publish to R2 if in admin mode
      if (props.publishMode) {
        progressText.value = 'Publicando no servidor...'
        progressPercent.value = 96
        try {
          const pdfBlob = pdf.output('blob')
          const file = new File(
            [pdfBlob],
            `${catalogCategory.value.replace(/[^a-z0-9]/gi, '_')}_OfficialCatalog.pdf`,
            { type: 'application/pdf' }
          )
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/upload-r2', {
            method: 'POST',
            body: formData,
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.statusMessage || 'Erro ao fazer upload')
          }
          const data = await response.json()
          progressText.value = 'Publicação concluída!'
          progressPercent.value = 99
          emit('published', data.url)
        } catch (uploadErr: any) {
          console.error('Error uploading PDF to R2:', uploadErr)
          alert(`Erro ao publicar catálogo: ${uploadErr.message || uploadErr}`)
        }
      }
    } catch (err: any) {
      console.error('[CatalogPdfTemplate] Erro fatal ao gerar PDF:', err)
      alert(`Erro na geração do PDF: ${err.message || err}`)
    } finally {
      progressText.value = 'Concluído!'
      progressPercent.value = 100
      rendering.value = false
      emit('complete')
    }
  }
})
</script>
