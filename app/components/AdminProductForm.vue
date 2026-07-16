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
          <input v-model="localProduct.title" class="w-full border border-gray-300 rounded p-3 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all bg-white text-slate-800" placeholder="Ex: Válvula Esfera Monobloco" type="text" required />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Modelo / SKU</label>
            <input v-model="localProduct.nameCode" class="w-full border border-gray-300 rounded p-3 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all bg-white text-slate-800" placeholder="QT-500-2024" type="text" required />
          </div>
           <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Categoria</label>
            <div class="relative">
              <select v-model="localProduct.category" class="w-full border border-gray-300 rounded p-3 pr-10 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all bg-white text-slate-800 cursor-pointer appearance-none" required>
                <option value="" disabled>Selecione uma categoria...</option>
                <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <span class="material-symbols-outlined text-lg">arrow_drop_down</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Imagem Técnica</label>
            
            <div @click="triggerFileInput('imgInput')" class="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded h-28 relative bg-white" title="Clique para fazer upload de arquivo">
              <input type="file" ref="imgInput" class="hidden" accept="image/*" @change="handleImageUpload" :disabled="uploadingImage" />
              <div v-if="uploadingImage" class="flex flex-col items-center">
                <span class="material-symbols-outlined animate-spin text-blue-600 mb-2">sync</span>
                <span class="text-[10px] text-gray-400 font-bold uppercase">Enviando...</span>
              </div>
              <template v-else>
                <img v-if="localProduct.imageBlob || localProduct.image" :src="getProductImagePreview(localProduct)" class="max-h-16 object-contain" />
                <span v-else class="material-symbols-outlined text-gray-400 mb-2">image</span>
                <span class="text-xs font-semibold text-gray-500 text-center truncate w-full px-2 mt-1">
                  {{ localProduct.imageName || 'Upload JPG/PNG' }}
                </span>
              </template>
            </div>

            <div class="mt-2 space-y-1">
              <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ou insira o link da imagem (URL)</label>
              <input 
                v-model="localProduct.image" 
                type="text" 
                @input="localProduct.imageBlob = null; localProduct.imageName = localProduct.image ? 'Imagem via Link' : ''" 
                placeholder="https://exemplo.com/produto.jpg" 
                class="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800 font-mono" 
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Datasheet (Upload PDF)</label>
            <div @click="triggerFileInput('pdfInput')" class="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded h-28 relative mb-2 bg-white">
              <input type="file" ref="pdfInput" class="hidden" accept="application/pdf" @change="handleDatasheetUpload" :disabled="uploadingPdf" />
              <div v-if="uploadingPdf" class="flex flex-col items-center">
                <span class="material-symbols-outlined animate-spin text-blue-600 mb-2">sync</span>
                <span class="text-[10px] text-gray-400 font-bold uppercase">Enviando...</span>
              </div>
              <template v-else>
                <span v-if="!localProduct.datasheetName" class="material-symbols-outlined text-gray-400 mb-2">picture_as_pdf</span>
                <span class="text-xs font-semibold text-gray-500 text-center truncate w-full px-2">
                  {{ localProduct.datasheetName || 'Upload PDF' }}
                </span>
              </template>
            </div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 text-[10px]">OU Link Direto (Ex: Website)</label>
            <input v-model="localProduct.datasheetUrl" class="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800" placeholder="https://exemplo.com/datasheet.pdf" type="text" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Marcador / Tag</label>
            <input v-model="localProduct.tag" class="w-full border border-gray-300 rounded p-3 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all bg-white text-slate-800" placeholder="Ex: NOVO" type="text" required />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Layout de Exibição</label>
            <div class="relative">
              <select v-model="localProduct.layoutSlots" class="w-full border border-gray-300 rounded p-3 pr-10 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all appearance-none bg-white text-slate-800 cursor-pointer">
                <option :value="3">Padrão (2 por página)</option>
                <option :value="6">Destaque Hero (1 por página)</option>
                <option :value="1">Lista Compacta (6 por página)</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <span class="material-symbols-outlined text-lg">arrow_drop_down</span>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Selo EX (URL Imagem)</label>
            <input v-model="localProduct.exImageUrl" class="w-full border border-gray-300 rounded p-3 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all bg-white text-slate-800" placeholder="https://exemplo.com/ex.png" type="text" />
          </div>
        </div>

        <!-- Image Customization Sliders Grid (Vertical) -->
        <div class="bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
          <div class="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
            <span class="material-symbols-outlined text-base">settings</span>
            <span>Ajuste da Imagem (PDF Vertical / Retrato)</span>
          </div>
          <p class="text-[10px] text-gray-500 leading-relaxed bg-white/50 p-2 rounded border border-gray-200">
            <strong>Escala:</strong> Zoom da foto. | 
            <strong>Offset X:</strong> Valores negativos movem para a <strong>Esquerda</strong>, positivos para a <strong>Direita</strong>. | 
            <strong>Offset Y:</strong> Valores negativos movem para <strong>Cima</strong>, positivos para <strong>Baixo</strong>.
          </p>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Escala Imagem</label>
                <span class="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{{ localProduct.imageScale !== undefined ? localProduct.imageScale : 1.0 }}x</span>
              </div>
              <div class="flex items-center border border-gray-300 rounded px-3 py-2 bg-white h-[46px]">
                <input v-model.number="localProduct.imageScale" type="range" min="0.2" max="3.0" step="0.05" class="w-full accent-blue-600 cursor-pointer" />
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Offset X (Horiz)</label>
                <span class="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{{ localProduct.imageOffsetX || 0 }}px</span>
              </div>
              <div class="flex items-center border border-gray-300 rounded px-3 py-2 bg-white h-[46px]">
                <input v-model.number="localProduct.imageOffsetX" type="range" min="-200" max="200" step="2" class="w-full accent-blue-600 cursor-pointer" />
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Offset Y (Vert)</label>
                <span class="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{{ localProduct.imageOffsetY || 0 }}px</span>
              </div>
              <div class="flex items-center border border-gray-300 rounded px-3 py-2 bg-white h-[46px]">
                <input v-model.number="localProduct.imageOffsetY" type="range" min="-200" max="200" step="2" class="w-full accent-blue-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <!-- Image Customization Sliders Grid (Booklet) -->
        <div class="bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
          <div class="flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
            <span class="material-symbols-outlined text-base">menu_book</span>
            <span>Ajuste da Imagem (PDF Livreto / Booklet)</span>
          </div>
          <p class="text-[10px] text-gray-500 leading-relaxed bg-white/50 p-2 rounded border border-gray-200">
            Ajustes exclusivos para quando o produto for gerado no layout de <strong>Livreto (A4 Paisagem Dobrável)</strong>.
          </p>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Escala Livreto</label>
                <span class="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{{ localProduct.bookletImageScale !== undefined ? localProduct.bookletImageScale : 1.0 }}x</span>
              </div>
              <div class="flex items-center border border-gray-300 rounded px-3 py-2 bg-white h-[46px]">
                <input v-model.number="localProduct.bookletImageScale" type="range" min="0.2" max="3.0" step="0.05" class="w-full accent-indigo-600 cursor-pointer" />
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Offset X Livreto</label>
                <span class="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{{ localProduct.bookletImageOffsetX || 0 }}px</span>
              </div>
              <div class="flex items-center border border-gray-300 rounded px-3 py-2 bg-white h-[46px]">
                <input v-model.number="localProduct.bookletImageOffsetX" type="range" min="-200" max="200" step="2" class="w-full accent-indigo-600 cursor-pointer" />
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Offset Y Livreto</label>
                <span class="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{{ localProduct.bookletImageOffsetY || 0 }}px</span>
              </div>
              <div class="flex items-center border border-gray-300 rounded px-3 py-2 bg-white h-[46px]">
                <input v-model.number="localProduct.bookletImageOffsetY" type="range" min="-200" max="200" step="2" class="w-full accent-indigo-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <!-- Specs Form Subcomponent -->
        <AdminProductSpecsForm :specs="localProduct.specs" />

        <div class="flex space-x-3 pt-4 border-t border-gray-200">
          <button v-if="isEdit" type="button" @click="$emit('cancel')" class="w-1/2 border border-gray-300 text-gray-750 py-3 font-semibold text-xs rounded hover:bg-gray-50 transition-colors bg-white cursor-pointer">
            CANCELAR
          </button>
          <button type="submit" :disabled="saving" :class="isEdit ? 'w-1/2' : 'w-full'" class="bg-blue-600 text-white py-3 font-semibold text-xs hover:bg-blue-700 transition-all rounded disabled:opacity-50 border-0 cursor-pointer">
            {{ saving ? 'SALVANDO...' : (isEdit ? 'SALVAR ALTERAÇÕES' : 'SALVAR NO CATÁLOGO') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminProductForm } from '../composables/useAdminProductForm'

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
  image?: string | null
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
  exImageUrl?: string | null
  tagColorClass?: string
}

const props = withDefaults(defineProps<{
  product?: ProductPayload
  saving?: boolean
  isEdit?: boolean
  categories?: any[]
}>(), {
  saving: false,
  isEdit: false,
  categories: () => []
})

const emit = defineEmits<{
  (e: 'submit', payload: { product: ProductPayload, colorIndex: number }): void
  (e: 'cancel'): void
}>()

import { computed } from 'vue'

const uniqueCategories = computed(() => {
  const list = new Set<string>()
  if (props.categories) {
    props.categories.forEach(c => {
      if (c.category) {
        list.add(c.category.toUpperCase().trim())
      }
    })
  }
  if (localProduct.value?.category) {
    list.add(localProduct.value.category.toUpperCase().trim())
  }
  return Array.from(list).sort()
})

const {
  localProduct,
  uploadingImage,
  uploadingPdf,
  imgInput,
  pdfInput,
  getProductImagePreview,
  triggerFileInput,
  handleImageUpload,
  handleDatasheetUpload,
  handleSubmit
} = useAdminProductForm(props, emit)
</script>
