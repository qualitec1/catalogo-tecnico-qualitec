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

    <!-- Badge do Cabeçalho (PDF - Acima do Título) -->
    <div class="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded">
      <div class="flex items-center justify-between">
        <label class="block text-[10px] text-slate-700 font-bold uppercase tracking-wider">Badge Superior (Acima do Título)</label>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click="emit('open-replicate-modal', category, ['badgeText', 'badgeIconUrl', 'badgeIconSize', 'badgeFontFamily', 'badgeFontSize', 'badgeColor', 'badgePositionX', 'badgePositionY', 'badgeIconOffsetX', 'badgeIconOffsetY', 'badgeTextOffsetX', 'badgeTextOffsetY'])"
            class="text-[9px] text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider shrink-0"
            title="Replicar esta configuração de badge para outras categorias"
          >
            Replicar
          </button>
          <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help" title="Exibe um pequeno ícone e frase (texto) imediatamente acima do título da categoria nas páginas do PDF.">!</span>
        </div>
      </div>
      
      <!-- Badge Text -->
      <div class="space-y-1">
        <label class="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Texto/Palavra do Badge</label>
        <input
          v-model="category.badgeText"
          type="text"
          @input="category.hasChanges = true"
          placeholder="Ex: INSTRUMENTAÇÃO"
          class="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800"
        />
      </div>

      <!-- Badge Icon Upload -->
      <div class="space-y-1.5">
        <label class="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Ícone do Badge (PNG)</label>
        
        <div @click="triggerBadgeIconUpload" class="border border-dashed border-gray-300 p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-150 transition-colors rounded h-20 relative bg-white" title="Clique para fazer upload do ícone do badge">
          <input type="file" ref="badgeIconFileInput" class="hidden" accept="image/*" @change="handleBadgeIconChange" :disabled="uploadingBadgeIcon" />
          <div v-if="uploadingBadgeIcon" class="flex flex-col items-center">
            <span class="material-symbols-outlined animate-spin text-blue-600 mb-0.5 text-lg">sync</span>
            <span class="text-[9px] text-gray-400 font-bold uppercase">Enviando...</span>
          </div>
          <template v-else>
            <img v-if="category.badgeIconUrl" :src="category.badgeIconUrl" class="max-h-10 max-w-full object-contain" />
            <span v-else class="material-symbols-outlined text-gray-450 text-xl">image</span>
            <span class="text-[9px] text-gray-500 font-semibold uppercase mt-1">{{ category.badgeIconUrl ? 'Trocar ícone' : 'Upload PNG' }}</span>
          </template>
        </div>

        <!-- Badge Icon URL Input -->
        <div class="flex items-center gap-2">
          <input
            v-model="category.badgeIconUrl"
            type="text"
            @input="category.hasChanges = true"
            placeholder="https://exemplo.com/badge-icone.png"
            class="flex-1 border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800"
          />
          <button
            v-if="category.badgeIconUrl"
            type="button"
            @click="category.badgeIconUrl = null; category.hasChanges = true"
            class="text-red-550 hover:text-red-750 text-xs font-semibold shrink-0"
            title="Remover ícone do badge"
          >
            Remover
          </button>
        </div>
      </div>

      <!-- Ajustes Estéticos do Badge -->
      <div class="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200">
        <!-- Tamanho do Ícone -->
        <div class="space-y-1">
          <label class="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Tamanho do Ícone</label>
          <input
            v-model="category.badgeIconSize"
            type="text"
            @input="category.hasChanges = true"
            placeholder="Ex: 4.5mm"
            class="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800"
          />
        </div>

        <!-- Tamanho da Fonte -->
        <div class="space-y-1">
          <label class="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Tamanho da Fonte</label>
          <input
            v-model="category.badgeFontSize"
            type="text"
            @input="category.hasChanges = true"
            placeholder="Ex: 8pt"
            class="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800"
          />
        </div>

        <!-- Fonte da Frase -->
        <div class="space-y-1">
          <label class="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Fonte da Frase</label>
          <select
            v-model="category.badgeFontFamily"
            @change="category.hasChanges = true"
            class="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800"
          >
            <option value="Arial">Arial</option>
            <option value="Arial Black">Arial Black</option>
            <option value="Calibri">Calibri</option>
            <option value="Century Gothic">Century Gothic</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Hanken Grotesk">Hanken Grotesk</option>
            <option value="Impact">Impact</option>
            <option value="Inter">Inter</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Montserrat Extra Bold">Montserrat Extra Bold</option>
            <option value="Outfit">Outfit</option>
            <option value="Roboto">Roboto</option>
            <option value="Segoe UI">Segoe UI</option>
            <option value="Source Sans Pro">Source Sans Pro</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>

        <!-- Cor da Frase -->
        <div class="space-y-1">
          <label class="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Cor da Frase</label>
          <div class="flex items-center space-x-1">
            <input
              v-model="category.badgeColor"
              type="color"
              @change="category.hasChanges = true"
              class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded"
            />
            <input
              v-model="category.badgeColor"
              type="text"
              @input="category.hasChanges = true"
              placeholder="#334155"
              class="flex-1 border border-gray-300 rounded p-1.5 text-[10px] focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white font-mono text-slate-800 w-full"
            />
          </div>
        </div>

        <!-- Posição Geral (move tudo junto) -->
        <div class="col-span-2 pt-1.5 border-t border-slate-100">
          <label class="block text-[9px] text-blue-600 font-bold uppercase tracking-wider mb-1.5">⬛ Mover Tudo (Ícone + Frase)</label>
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-0.5">
              <label class="flex items-center text-[8px] text-gray-400 font-semibold uppercase">
                Offset X
                <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3 h-3 text-[8px] font-bold cursor-help ml-1" title="Mover lados: Valores positivos (ex: 5px) movem para a direita. Valores negativos (ex: -5px) movem para a esquerda.">!</span>
              </label>
              <input v-model="category.badgePositionX" type="text" @input="category.hasChanges = true" placeholder="0px"
                class="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800" />
            </div>
            <div class="space-y-0.5">
              <label class="flex items-center text-[8px] text-gray-400 font-semibold uppercase">
                Offset Y
                <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3 h-3 text-[8px] font-bold cursor-help ml-1" title="Mover cima/baixo: Valores positivos (ex: 5px) movem para baixo. Valores negativos (ex: -5px) movem para cima.">!</span>
              </label>
              <input v-model="category.badgePositionY" type="text" @input="category.hasChanges = true" placeholder="0px"
                class="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800" />
            </div>
          </div>
        </div>

        <!-- Posição Individual: só Ícone -->
        <div class="col-span-2 pt-1.5 border-t border-slate-100">
          <label class="block text-[9px] text-emerald-600 font-bold uppercase tracking-wider mb-1.5">🖼️ Mover só Ícone</label>
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-0.5">
              <label class="flex items-center text-[8px] text-gray-400 font-semibold uppercase">
                Offset X
                <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3 h-3 text-[8px] font-bold cursor-help ml-1" title="Mover lados: Valores positivos (ex: 5px) movem para a direita. Valores negativos (ex: -5px) movem para a esquerda.">!</span>
              </label>
              <input v-model="category.badgeIconOffsetX" type="text" @input="category.hasChanges = true" placeholder="0px"
                class="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800" />
            </div>
            <div class="space-y-0.5">
              <label class="flex items-center text-[8px] text-gray-400 font-semibold uppercase">
                Offset Y
                <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3 h-3 text-[8px] font-bold cursor-help ml-1" title="Mover cima/baixo: Valores positivos (ex: 5px) movem para baixo. Valores negativos (ex: -5px) movem para cima.">!</span>
              </label>
              <input v-model="category.badgeIconOffsetY" type="text" @input="category.hasChanges = true" placeholder="0px"
                class="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800" />
            </div>
          </div>
        </div>

        <!-- Posição Individual: só Frase -->
        <div class="col-span-2 pt-1.5 border-t border-slate-100">
          <label class="block text-[9px] text-purple-600 font-bold uppercase tracking-wider mb-1.5">✏️ Mover só Frase</label>
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-0.5">
              <label class="flex items-center text-[8px] text-gray-400 font-semibold uppercase">
                Offset X
                <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3 h-3 text-[8px] font-bold cursor-help ml-1" title="Mover lados: Valores positivos (ex: 5px) movem para a direita. Valores negativos (ex: -5px) movem para a esquerda.">!</span>
              </label>
              <input v-model="category.badgeTextOffsetX" type="text" @input="category.hasChanges = true" placeholder="0px"
                class="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800" />
            </div>
            <div class="space-y-0.5">
              <label class="flex items-center text-[8px] text-gray-400 font-semibold uppercase">
                Offset Y
                <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3 h-3 text-[8px] font-bold cursor-help ml-1" title="Mover cima/baixo: Valores positivos (ex: 5px) movem para baixo. Valores negativos (ex: -5px) movem para cima.">!</span>
              </label>
              <input v-model="category.badgeTextOffsetY" type="text" @input="category.hasChanges = true" placeholder="0px"
                class="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800" />
            </div>
          </div>
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
      <button @click="handleResetToDefaults" :disabled="saving" class="w-full py-2 border border-amber-600 text-amber-700 hover:bg-amber-50 text-xs font-bold rounded transition-colors" title="Restaura as configurações de PDF desta categoria para o padrão do sistema">
        RESTAURAR PADRÃO DO SISTEMA
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
  (e: 'open-replicate-modal', category: any, fields?: string[] | null): void
  (e: 'delete-category', id: string): void
}>()

const { getCoverImage, handleImageError } = useAdminCategorySettings()

const fileInput = ref<HTMLInputElement | null>(null)
const pdfFileInput = ref<HTMLInputElement | null>(null)
const iconFileInput = ref<HTMLInputElement | null>(null)
const badgeIconFileInput = ref<HTMLInputElement | null>(null)
const uploadingImage = ref(false)
const uploadingPdf = ref(false)
const uploadingIcon = ref(false)
const uploadingBadgeIcon = ref(false)

const triggerImageUpload = () => {
  fileInput.value?.click()
}

const triggerIconUpload = () => {
  iconFileInput.value?.click()
}

const triggerBadgeIconUpload = () => {
  badgeIconFileInput.value?.click()
}

const handleBadgeIconChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingBadgeIcon.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'Erro ao fazer upload do ícone do badge')
    }

    const data = await response.json()
    props.category.badgeIconUrl = data.url
    props.category.hasChanges = true
  } catch (error: any) {
    console.error('Error uploading badge icon to R2:', error)
    alert(`Erro no upload do ícone do badge: ${error.message || error}`)
  } finally {
    uploadingBadgeIcon.value = false
    target.value = ''
  }
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

const handleResetToDefaults = () => {
  if (!confirm('Deseja realmente restaurar todas as configurações de layout de PDF desta categoria para o padrão do sistema?\n\nIsso NÃO alterará os ajustes individuais de imagem dos produtos.')) {
    return
  }

  props.category.titleFontSize = '18px'
  props.category.titlePositionY = '-0px'
  props.category.titleColor = '#1B388F'
  props.category.imagePosition = 'right'
  props.category.cardLayoutOrder = 'image-first'
  props.category.fontSizeSpecs = '8px'
  props.category.dividerLineColor = '#cbd5e1'
  props.category.productSpacing = '25px'
  props.category.productImageOffsetY = '0px'
  props.category.productImageOffsetX = '0px'
  props.category.pdfImageScale = 1.0
  props.category.pdfImageScaleX = 1.0
  props.category.pdfImageScaleY = 1.0
  props.category.cardOffsetX = '0px'
  props.category.cardOffsetY = '0px'
  props.category.cardTitleOffsetX = '-7px'
  props.category.cardTitleOffsetY = '7px'
  props.category.cardTitleFontFamily = 'Inter'
  props.category.cardTitleBold = true
  props.category.cardTitleItalic = false
  props.category.cardTitleUnderline = false
  props.category.cardModelFontSize = '15px'
  props.category.cardModelOffsetX = '0px'
  props.category.cardModelOffsetY = '7px'
  props.category.cardModelFontFamily = 'Inter'
  props.category.cardModelBold = true
  props.category.cardModelItalic = false
  props.category.cardModelUnderline = false
  props.category.cardModelLabelFontSize = '8px'
  props.category.cardModelLabelOffsetX = '0px'
  props.category.cardModelLabelOffsetY = '0px'
  props.category.cardModelLabelFontFamily = 'Inter'
  props.category.cardModelLabelBold = false
  props.category.cardModelLabelItalic = false
  props.category.cardModelLabelUnderline = false
  props.category.cardModelLabelText = 'Modelo'
  props.category.tagFontFamily = 'Inter'
  props.category.tagFontSize = '10px'
  props.category.tagBold = false
  props.category.tagItalic = false
  props.category.tagUnderline = false
  props.category.tagOffsetX = '0px'
  props.category.tagOffsetY = '0px'
  props.category.titleFontFamily = 'Verdana'
  props.category.titleBold = true
  props.category.titleItalic = false
  props.category.titleUnderline = false
  props.category.specsFontFamily = 'Inter'
  props.category.specsBold = false
  props.category.specsItalic = false
  props.category.specsUnderline = false
  props.category.specsLabelWidth = '45%'
  props.category.specsValueWidth = '55%'
  props.category.specsPaddingY = '4px'
  props.category.specsLineStyle = 'none'
  props.category.specsLineColor = '#cbd5e1'
  props.category.specsBgColor = '#F1F1F1'
  props.category.cardTitleColor = '#ffffff'
  props.category.cardModelColor = '#ffffff'
  props.category.cardModelLabelColor = '#ffffff'
  props.category.tagColor = '#ffffff'
  props.category.specsColor = '#374151'
  props.category.specsValColor = '#000000'
  props.category.coverTitleFontFamily = 'Helvetica'
  props.category.coverTitleFontSize = '20px'
  props.category.coverTitleBold = true
  props.category.coverTitleItalic = false
  props.category.coverTitleUnderline = false
  props.category.coverTitleColor = '#ffffff'
  props.category.coverTitleOffsetX = '0px'
  props.category.coverTitleOffsetY = '0px'
  props.category.coverSubtitleText = 'CATÁLOGO DE PRODUTOS'
  props.category.coverSubtitleFontFamily = 'Helvetica'
  props.category.coverSubtitleFontSize = '8px'
  props.category.coverSubtitleBold = false
  props.category.coverSubtitleItalic = false
  props.category.coverSubtitleUnderline = false
  props.category.coverSubtitleColor = '#ffffff'
  props.category.coverSubtitleOffsetX = '0px'
  props.category.coverSubtitleOffsetY = '0px'
  props.category.logoWidth = '380px'
  props.category.logoHeight = '150px'
  props.category.logoPositionX = '-80px'
  props.category.logoPositionY = '60px'
  props.category.specsValBold = false
  props.category.specsValItalic = false
  props.category.specsValUnderline = false
  props.category.cardHeaderLayout = 'model-left'
  props.category.landscapeSettings = {}
  props.category.layout_settings = {
    "1": {
      "productImageOffsetY": "12",
      "headerHeight": "25",
      "blockGap": "1.5"
    },
    "3": {
      "specsBold": false,
      "cardOffsetX": "0px",
      "cardOffsetY": "0px",
      "specsItalic": false,
      "cardModelBold": false,
      "cardTitleBold": false,
      "fontSizeSpecs": "8px",
      "specsPaddingY": "4px",
      "productSpacing": "24px",
      "specsLineColor": "#cbd5e1",
      "specsLineStyle": "dashed",
      "specsUnderline": false,
      "cardLayoutOrder": "image-first",
      "cardModelItalic": false,
      "cardTitleItalic": false,
      "specsFontFamily": "Inter",
      "specsLabelWidth": "45%",
      "specsValueWidth": "55%",
      "cardModelOffsetX": "0px",
      "cardModelOffsetY": "0px",
      "cardTitleOffsetX": "0px",
      "cardTitleOffsetY": "0px",
      "dividerLineColor": "#cbd5e1",
      "cardModelFontSize": "24px",
      "cardModelUnderline": false,
      "cardTitleUnderline": false,
      "cardModelFontFamily": "Inter",
      "cardTitleFontFamily": "Inter",
      "productImageOffsetY": "0px",
      "headerHeight": "34",
      "blockGap": "2"
    },
    "6": {
      "cardTitleFontFamily": "Verdana",
      "headerHeight": "40",
      "blockGap": "2"
    }
  }

  props.category.hasChanges = true
}
</script>
