<template>
  <div class="w-full lg:w-1/3 space-y-4">
    <!-- Category Color and Name -->
    <div class="flex items-center space-x-3">
      <span class="w-6 h-6 rounded-full border border-gray-300 shadow-sm" :style="{ backgroundColor: category.colorHex }"></span>
      <input 
        v-model="category.category" 
        type="text" 
        :disabled="category.originalCategory.toUpperCase().trim() === 'GERAL'"
        @input="category.hasChanges = true" 
        class="font-bold text-lg text-slate-800 focus:outline-none focus:border-b focus:border-blue-600 border-b border-transparent bg-transparent w-full uppercase disabled:opacity-75" 
      />
      <span v-if="category.originalCategory.toUpperCase().trim() === 'GERAL'" class="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap">
        Capa Geral
      </span>
    </div>

    <!-- Hex Color Picker -->
    <div class="space-y-2">
      <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor da Categoria (Código Hex)</label>
      <div class="flex items-center space-x-2">
        <input v-model="category.colorHex" type="color" @change="category.hasChanges = true" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded-full" />
        <input v-model="category.colorHex" type="text" @input="category.hasChanges = true" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono" />
      </div>
    </div>

    <!-- Category Icon (PDF Header) -->
    <div class="space-y-2">
      <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ícone do Cabeçalho (PDF)</label>
      <p class="text-[9px] text-gray-400 leading-tight">Aparece no canto superior esquerdo de cada página do catálogo, ao lado do título da categoria.</p>

      <!-- Icon Upload Box -->
      <div @click="triggerIconUpload" class="border-2 border-dashed border-gray-300 p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded h-24 relative bg-white" title="Clique para fazer upload do ícone">
        <input type="file" ref="iconFileInput" class="hidden" accept="image/*" @change="handleIconChange" :disabled="uploadingIcon" />
        <div v-if="uploadingIcon" class="flex flex-col items-center">
          <span class="material-symbols-outlined animate-spin text-blue-600 mb-1">sync</span>
          <span class="text-[10px] text-gray-400 font-bold uppercase">Enviando...</span>
        </div>
        <template v-else>
          <img v-if="category.iconUrl" :src="category.iconUrl" class="max-h-12 max-w-full object-contain" @error="handleImageError" />
          <span v-else class="material-symbols-outlined text-gray-400 text-2xl mb-1">category</span>
          <span class="text-[10px] text-gray-500 font-semibold uppercase mt-1">{{ category.iconUrl ? 'Trocar ícone' : 'Upload JPG/PNG' }}</span>
        </template>
      </div>

      <!-- Icon URL Input -->
      <div class="space-y-1">
        <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ou link do ícone (URL)</label>
        <div class="flex items-center gap-2">
          <input
            v-model="category.iconUrl"
            type="text"
            @input="category.hasChanges = true"
            placeholder="https://exemplo.com/icone.png"
            class="flex-1 border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800"
          />
          <button
            v-if="category.iconUrl"
            type="button"
            @click="category.iconUrl = null; category.hasChanges = true"
            class="text-red-500 hover:text-red-700 text-xs font-semibold shrink-0"
            title="Remover ícone"
          >
            Remover
          </button>
        </div>
      </div>
    </div>

    <!-- Category Cover Image -->
    <div class="space-y-2">
      <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Capa da Categoria</label>
      
      <!-- Upload Box -->
      <div @click="triggerImageUpload" class="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded h-28 relative bg-white" title="Clique para fazer upload de arquivo">
        <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleImageChange" :disabled="uploadingImage" />
        <div v-if="uploadingImage" class="flex flex-col items-center">
          <span class="material-symbols-outlined animate-spin text-blue-600 mb-2">sync</span>
          <span class="text-[10px] text-gray-400 font-bold uppercase">Enviando...</span>
        </div>
        <template v-else>
          <img v-if="category.coverImageBlob || category.coverImageUrl" :src="getCoverImage(category)" class="max-h-16 object-contain" @error="handleImageError" />
          <span v-else class="material-symbols-outlined text-gray-500 text-2xl mb-1">image</span>
          <span class="text-[10px] text-gray-500 font-semibold uppercase mt-1">Fazer Upload (JPG/PNG)</span>
        </template>
      </div>

      <!-- Link Input -->
      <div class="space-y-1">
        <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ou insira o link da imagem (URL)</label>
        <input 
          v-model="category.coverImageUrl" 
          type="text" 
          @input="category.coverImageBlob = null; category.hasChanges = true" 
          placeholder="https://exemplo.com/imagem.jpg" 
          class="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800" 
        />
      </div>
    </div>

    <!-- Static PDF Settings -->
    <div class="space-y-2 pt-2 border-t border-gray-200">
      <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Catálogo PDF Pronto (Download Direto)</label>
      
      <!-- PDF Upload button -->
      <div class="flex items-center space-x-2">
        <button 
          type="button"
          @click="triggerPdfUpload"
          :disabled="uploadingPdf"
          class="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-slate-700 text-xs font-semibold rounded transition-colors disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-sm mr-1">upload_file</span>
          {{ uploadingPdf ? 'Enviando...' : (category.pdfUrl ? 'Substituir PDF' : 'Upload PDF') }}
        </button>
        <input 
          type="file" 
          ref="pdfFileInput" 
          class="hidden" 
          accept="application/pdf" 
          @change="handlePdfChange" 
        />
        
        <button 
          v-if="category.pdfUrl"
          type="button"
          @click="removePdfUrl"
          class="text-red-650 hover:text-red-750 text-xs font-semibold"
          title="Remover PDF estático"
        >
          Remover
        </button>
      </div>

      <!-- PDF Link text box -->
      <div class="space-y-1">
        <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ou Link Direto do PDF (URL)</label>
        <input 
          v-model="category.pdfUrl" 
          type="text" 
          @input="category.hasChanges = true" 
          placeholder="https://exemplo.com/catalogo.pdf" 
          class="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800 font-mono" 
        />
      </div>
    </div>

    <!-- Actions block -->
    <div class="pt-4 border-t border-gray-200 flex flex-col gap-2">
      <button @click="$emit('save-category', category)" :disabled="saving || !category.hasChanges" class="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded transition-colors disabled:opacity-40">
        SALVAR ALTERAÇÕES
      </button>
      <button 
        @click="$emit('publish-catalog', category)" 
        :disabled="saving"
        class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1.5"
        title="Gera o PDF com o layout atual e o publica como arquivo estático oficial"
      >
        <span class="material-symbols-outlined text-sm">publish</span>
        ATUALIZAR PDF OFICIAL
      </button>
      <button @click="$emit('open-replicate-modal', category)" class="w-full py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded transition-colors">
        REPLICAR LAYOUT PDF
      </button>
      <button @click="confirmDelete" class="w-full py-2 border border-red-600 text-red-650 hover:bg-red-50 text-xs font-bold rounded transition-colors">
        EXCLUIR CATEGORIA
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAdminCategorySettings } from '../composables/useAdminCategorySettings'

const props = defineProps<{
  category: any
  saving: boolean
}>()

const emit = defineEmits<{
  (e: 'save-category', category: any): void
  (e: 'publish-catalog', category: any): void
  (e: 'open-replicate-modal', category: any): void
  (e: 'delete-category', id: string): void
}>()

const { getCoverImage, handleImageError } = useAdminCategorySettings()

const fileInput = ref<HTMLInputElement | null>(null)
const pdfFileInput = ref<HTMLInputElement | null>(null)
const iconFileInput = ref<HTMLInputElement | null>(null)
const uploadingImage = ref(false)
const uploadingPdf = ref(false)
const uploadingIcon = ref(false)

const triggerImageUpload = () => {
  fileInput.value?.click()
}

const triggerIconUpload = () => {
  iconFileInput.value?.click()
}

const handleIconChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingIcon.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'Erro ao fazer upload do ícone')
    }

    const data = await response.json()
    props.category.iconUrl = data.url
    props.category.hasChanges = true
  } catch (error: any) {
    console.error('Error uploading category icon to R2:', error)
    alert(`Erro no upload do ícone: ${error.message || error}`)
  } finally {
    uploadingIcon.value = false
    target.value = ''
  }
}

const handleImageChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingImage.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'Erro ao fazer upload da capa')
    }

    const data = await response.json()
    props.category.coverImageUrl = data.url
    props.category.coverImageBlob = null
    props.category.hasChanges = true
  } catch (error: any) {
    console.error('Error uploading category cover to R2:', error)
    alert(`Erro no upload da capa: ${error.message || error}`)
  } finally {
    uploadingImage.value = false
    target.value = ''
  }
}

const triggerPdfUpload = () => {
  pdfFileInput.value?.click()
}

const handlePdfChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingPdf.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'Erro ao fazer upload do PDF')
    }

    const data = await response.json()
    props.category.pdfUrl = data.url
    props.category.hasChanges = true
  } catch (error: any) {
    console.error('Error uploading category PDF to R2:', error)
    alert(`Erro no upload do PDF: ${error.message || error}`)
  } finally {
    uploadingPdf.value = false
    target.value = ''
  }
}

const removePdfUrl = () => {
  props.category.pdfUrl = null
  props.category.hasChanges = true
}

const confirmDelete = () => {
  if (confirm(`Deseja realmente excluir a categoria "${props.category.category}"? Isso removerá a categoria e todas as suas configurações visuais de PDF.`)) {
    emit('delete-category', props.category.id)
  }
}
</script>
