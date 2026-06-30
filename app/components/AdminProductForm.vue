<template>
  <div class="bg-white border border-gray-200 rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] relative overflow-hidden h-fit">
    <div class="h-1 bg-blue-600 w-full absolute top-0 left-0"></div>
    <div class="p-6">
      <h3 class="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">
        {{ isEdit ? `Editar Equipamento (ID: ${localProduct.id})` : 'Cadastro de Novo Produto' }}
      </h3>
      
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Equipamento</label>
          <input v-model="localProduct.title" class="w-full border border-gray-300 rounded p-3 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all bg-white" placeholder="Ex: Válvula Esfera Monobloco" type="text" required />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Modelo / SKU</label>
            <input v-model="localProduct.nameCode" class="w-full border border-gray-300 rounded p-3 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all bg-white" placeholder="QT-500-2024" type="text" required />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Categoria</label>
            <input v-model="localProduct.category" class="w-full border border-gray-300 rounded p-3 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all bg-white" placeholder="Ex: VÁLVULAS" type="text" required />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Imagem Técnica</label>
            <div @click="triggerFileInput('imgInput')" class="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded h-28 relative bg-white">
              <input type="file" ref="imgInput" class="hidden" accept="image/*" @change="handleImageUpload" />
              <span v-if="!localProduct.imageName" class="material-symbols-outlined text-gray-400 mb-2">image</span>
              <span class="text-xs font-semibold text-gray-500 text-center truncate w-full px-2">
                {{ localProduct.imageName || 'Upload JPG/PNG' }}
              </span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Datasheet (Upload PDF)</label>
            <div @click="triggerFileInput('pdfInput')" class="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded h-28 relative mb-2 bg-white">
              <input type="file" ref="pdfInput" class="hidden" accept="application/pdf" @change="handleDatasheetUpload" />
              <span v-if="!localProduct.datasheetName" class="material-symbols-outlined text-gray-400 mb-2">picture_as_pdf</span>
              <span class="text-xs font-semibold text-gray-500 text-center truncate w-full px-2">
                {{ localProduct.datasheetName || 'Upload PDF' }}
              </span>
            </div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 text-[10px]">OU Link Direto (Ex: Website)</label>
            <input v-model="localProduct.datasheetUrl" class="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white" placeholder="https://exemplo.com/datasheet.pdf" type="text" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Marcador / Tag</label>
            <input v-model="localProduct.tag" class="w-full border border-gray-300 rounded p-3 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all bg-white" placeholder="Ex: NOVO" type="text" required />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Layout de Exibição</label>
            <select v-model="localProduct.layoutSlots" class="w-full border border-gray-300 rounded p-3 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all appearance-none bg-white">
              <option :value="3">Padrão (2 por página)</option>
              <option :value="6">Destaque Hero (1 por página)</option>
              <option :value="1">Lista Compacta (6 por página)</option>
            </select>
          </div>
        </div>

        <!-- Image Customization Sliders Grid -->
        <div class="bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
          <div class="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
            <span class="material-symbols-outlined text-base">info</span>
            <span>Ajuste da Imagem (Exclusivo para o PDF)</span>
          </div>
          <p class="text-[10px] text-gray-500 leading-relaxed bg-white/50 p-2 rounded border border-gray-200">
            <strong>Escala:</strong> Zoom da foto. | 
            <strong>Offset X:</strong> Valores negativos movem para a <strong>Esquerda</strong>, positivos para a <strong>Direita</strong>. | 
            <strong>Offset Y:</strong> Valores negativos movem para <strong>Cima</strong>, positivos para <strong>Baixo</strong>.
          </p>
          
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Escala Imagem</label>
              <div class="flex items-center space-x-2 border border-gray-300 rounded p-2.5 h-[50px] bg-white">
                <input v-model.number="localProduct.imageScale" type="range" min="0.2" max="3.0" step="0.05" class="flex-grow accent-blue-600" />
                <span class="text-xs font-bold font-mono text-gray-600 shrink-0 w-10 text-right">{{ localProduct.imageScale || 1.0 }}x</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Offset X (Horiz)</label>
              <div class="flex items-center space-x-2 border border-gray-300 rounded p-2.5 h-[50px] bg-white">
                <input v-model.number="localProduct.imageOffsetX" type="range" min="-200" max="200" step="2" class="flex-grow accent-blue-600" />
                <span class="text-xs font-bold font-mono text-gray-600 shrink-0 w-12 text-right">{{ localProduct.imageOffsetX || 0 }}px</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Offset Y (Vert)</label>
              <div class="flex items-center space-x-2 border border-gray-300 rounded p-2.5 h-[50px] bg-white">
                <input v-model.number="localProduct.imageOffsetY" type="range" min="-200" max="200" step="2" class="flex-grow accent-blue-600" />
                <span class="text-xs font-bold font-mono text-gray-600 shrink-0 w-12 text-right">{{ localProduct.imageOffsetY || 0 }}px</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Cor da Categoria</label>
          <div class="flex space-x-3 items-center">
            <!-- Circled presets -->
            <div class="flex space-x-2 items-center h-[46px]">
              <button 
                v-for="(color, idx) in colorOptions" 
                :key="idx"
                @click="selectPresetColor(idx)"
                :class="[
                  color.bgClass,
                  (colorIndex === idx && !customColorActive) ? 'ring-2 ring-offset-2 ring-blue-600' : 'ring-1 ring-gray-300'
                ]"
                class="w-8 h-8 rounded-full transition-all" 
                type="button"
                :title="color.name"
              ></button>
            </div>
            
            <div class="h-6 w-px bg-gray-300"></div>

            <!-- Custom HEX picker/input -->
            <div class="flex items-center space-x-2">
              <input 
                v-model="customColorHex" 
                type="color" 
                @input="applyCustomColor" 
                class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded-full" 
              />
              <input 
                v-model="customColorHex" 
                type="text" 
                placeholder="#376092" 
                @input="applyCustomColor"
                class="border border-gray-300 px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none w-28 text-center bg-white font-mono rounded" 
              />
            </div>
          </div>
        </div>

        <!-- Dynamic Specifications Area -->
        <div class="border-t border-gray-200 pt-4">
          <label class="block text-xs font-bold text-gray-500 uppercase mb-3">Especificações Técnicas</label>
          <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
            <div v-for="(spec, index) in localProduct.specs" :key="index" class="flex gap-2 items-center">
              <input v-model="spec.label" class="w-1/2 border border-gray-300 rounded p-2 text-xs bg-white" placeholder="Ex: Diâmetro" type="text" required />
              <input v-model="spec.value" class="w-1/2 border border-gray-300 rounded p-2 text-xs bg-white" placeholder="Ex: 2.1/2" type="text" required />
              <button type="button" @click="removeSpecItem(index)" class="p-1 text-red-650 hover:bg-red-50 rounded transition-colors">
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
          <button type="button" @click="addSpecItem" class="mt-2 flex items-center text-xs text-blue-650 hover:text-blue-700 transition-colors font-medium">
            <span class="material-symbols-outlined text-sm mr-1">add</span> Adicionar Item
          </button>
        </div>

        <div class="flex space-x-3 pt-4 border-t border-gray-200">
          <button v-if="isEdit" type="button" @click="$emit('cancel')" class="w-1/2 border border-gray-300 text-gray-750 py-3 font-semibold text-xs rounded hover:bg-gray-50 transition-colors">
            CANCELAR
          </button>
          <button type="submit" :disabled="saving" :class="isEdit ? 'w-1/2' : 'w-full'" class="bg-blue-600 text-white py-3 font-semibold text-xs hover:bg-blue-700 transition-all rounded disabled:opacity-50">
            {{ saving ? 'SALVANDO...' : (isEdit ? 'SALVAR ALTERAÇÕES' : 'SALVAR NO CATÁLOGO') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Spec {
  label: string
  value: string
}

interface ProductPayload {
  id?: number
  title: string
  nameCode: string
  category: string
  tag: string
  layoutSlots: number
  imageName: string
  imageBlob: string | null
  datasheetName: string
  datasheetBlob: string | null
  datasheetUrl: string
  specs: Spec[]
  bgClass?: string
  imageScale?: number
  imageOffsetX?: number
  imageOffsetY?: number
}

const props = withDefaults(defineProps<{
  product?: ProductPayload
  saving?: boolean
  isEdit?: boolean
}>(), {
  saving: false,
  isEdit: false
})

const emit = defineEmits<{
  (e: 'submit', payload: { product: ProductPayload, colorIndex: number }): void
  (e: 'cancel'): void
  }>()

const getInitialProduct = (): ProductPayload => ({
  title: '',
  nameCode: '',
  category: '',
  tag: 'NOVO',
  layoutSlots: 3,
  imageName: '',
  imageBlob: null,
  datasheetName: '',
  datasheetBlob: null,
  datasheetUrl: '',
  imageScale: 1.0,
  imageOffsetX: 0,
  imageOffsetY: 0,
  specs: [
    { label: 'Diâmetro Nominal', value: '1.1/2" ou 2.1/2"' },
    { label: 'Pressão de Trabalho', value: '14 bar (200 psi)' }
  ]
})

const localProduct = ref<ProductPayload>(props.product ? JSON.parse(JSON.stringify(props.product)) : getInitialProduct())
const colorIndex = ref(0)
const customColorActive = ref(false)
const customColorHex = ref('#376092')

const colorOptions = [
  { bgClass: 'bg-secondary', tagColor: 'text-[#005db7]', name: 'Azul' },
  { bgClass: 'bg-tertiary-container', tagColor: 'text-[#003d0b]', name: 'Verde' },
  { bgClass: 'bg-error', tagColor: 'text-[#ba1a1a]', name: 'Vermelho' },
  { bgClass: 'bg-primary-container', tagColor: 'text-[#003366]', name: 'Azul Escuro' }
]

// Determine colorIndex and customColor from bgClass
const mapBgClassToColorState = (bgClass?: string) => {
  if (!bgClass) {
    colorIndex.value = 0
    customColorActive.value = false
    return
  }
  
  const index = colorOptions.findIndex(c => c.bgClass === bgClass)
  if (index >= 0) {
    colorIndex.value = index
    customColorActive.value = false
  } else {
    // It's a custom hex color!
    customColorActive.value = true
    
    // Extract hex from bgClass (it could be like '#376092' or 'bg-[#376092]')
    if (bgClass.startsWith('#')) {
      customColorHex.value = bgClass
    } else {
      const match = bgClass.match(/bg-\[#([0-9a-fA-F]{6})\]/)
      if (match) {
        customColorHex.value = `#${match[1]}`
      } else {
        customColorHex.value = bgClass // fallback
      }
    }
  }
}

const selectPresetColor = (idx: number) => {
  colorIndex.value = idx
  customColorActive.value = false
}

const applyCustomColor = () => {
  customColorActive.value = true
}

watch(() => props.product, (newVal) => {
  if (newVal) {
    localProduct.value = JSON.parse(JSON.stringify(newVal))
    mapBgClassToColorState(newVal.bgClass)
  } else {
    localProduct.value = getInitialProduct()
    colorIndex.value = 0
    customColorActive.value = false
  }
}, { deep: true })

onMounted(() => {
  if (props.product) {
    mapBgClassToColorState(props.product.bgClass)
  }
})

const imgInput = ref<HTMLInputElement | null>(null)
const pdfInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = (refName: 'imgInput' | 'pdfInput') => {
  if (refName === 'imgInput' && imgInput.value) {
    imgInput.value.click()
  } else if (refName === 'pdfInput' && pdfInput.value) {
    pdfInput.value.click()
  }
}

const handleImageUpload = (event: Event) => {
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
    localProduct.value.imageName = file.name
    localProduct.value.imageBlob = '\\x' + hex
  }
  reader.readAsArrayBuffer(file)
}

const handleDatasheetUpload = (event: Event) => {
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
    localProduct.value.datasheetName = file.name
    localProduct.value.datasheetBlob = '\\x' + hex
  }
  reader.readAsArrayBuffer(file)
}

const addSpecItem = () => {
  localProduct.value.specs.push({ label: '', value: '' })
}

const removeSpecItem = (index: number) => {
  localProduct.value.specs.splice(index, 1)
}

const handleSubmit = () => {
  emit('submit', {
    product: {
      ...localProduct.value,
      bgClass: customColorActive.value ? customColorHex.value : colorOptions[colorIndex.value].bgClass,
      tagColorClass: customColorActive.value ? `text-[${customColorHex.value}]` : colorOptions[colorIndex.value].tagColor
    },
    colorIndex: colorIndex.value
  })
  if (!props.isEdit) {
    // Reset form after submission if it is a creation form
    localProduct.value = getInitialProduct()
    colorIndex.value = 0
    customColorActive.value = false
  }
}
</script>
