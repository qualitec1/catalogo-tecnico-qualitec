<template>
  <div 
    v-if="open" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
  >
    <div class="bg-white border border-gray-200 rounded shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
      <button @click="$emit('close')" class="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
        <span class="material-symbols-outlined">close</span>
      </button>
      
      <h3 class="text-base font-bold text-slate-800 mb-2 uppercase tracking-wider flex items-center gap-2">
        <span class="material-symbols-outlined text-blue-600">picture_as_pdf</span>
        Configurar Capa do Catálogo
      </h3>
      <p class="text-xs text-gray-500 mb-4">
        Escolha qual imagem de capa e cores de cabeçalho serão aplicadas na geração do seu PDF.
      </p>

      <!-- Opções de Capa -->
      <div class="space-y-3 mb-5">
        <!-- Opção Dinâmica -->
        <label class="flex items-start gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors">
          <input type="radio" v-model="coverCategorySelection" value="dynamic" class="mt-0.5 text-blue-650" />
          <div>
            <span class="text-xs font-bold text-slate-800 uppercase block">Capa Dinâmica / Automática</span>
            <span class="text-[10px] text-gray-500 block mt-0.5">
              Usa a capa da categoria caso todos os produtos selecionados pertençam à mesma categoria. Se houver mais de uma, usará a capa Geral.
            </span>
          </div>
        </label>

        <!-- Opção Geral -->
        <label class="flex items-start gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors" :class="{ 'opacity-50': !hasGeralCover }">
          <input type="radio" v-model="coverCategorySelection" value="GERAL" :disabled="!hasGeralCover" class="mt-0.5 text-blue-650" />
          <div>
            <span class="text-xs font-bold text-slate-800 uppercase block flex items-center gap-1.5">
              Capa Geral
              <span v-if="!hasGeralCover" class="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-normal lowercase border-0">não configurada</span>
            </span>
            <span class="text-[10px] text-gray-500 block mt-0.5">
              Utiliza a imagem de capa e estilo configurados especificamente para o catálogo Geral (Todos os produtos).
            </span>
          </div>
        </label>

        <!-- Opção Específica -->
        <div class="border border-gray-200 rounded p-3 space-y-2">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="radio" v-model="coverCategorySelection" value="specific" class="text-blue-650" />
            <span class="text-xs font-bold text-slate-800 uppercase">Forçar Capa de Categoria</span>
          </label>
          <div v-if="coverCategorySelection === 'specific'" class="pl-6 pt-1">
            <select v-model="specificCoverCategory" class="w-full border border-gray-300 p-2 text-xs rounded bg-white text-slate-700 uppercase">
              <option value="" disabled>Selecione uma categoria...</option>
              <option v-for="cat in listableCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Opção: PDF para WEB ou IMPRESSÃO -->
      <div class="border-t border-gray-200 pt-4 mb-5">
        <h4 class="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">Tipo de PDF</h4>
        <p class="text-[10px] text-gray-500 mb-3">
          Escolha se o PDF terá links clicáveis ou será otimizado para impressão.
        </p>
        <div class="space-y-2">
          <label class="flex items-start gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="radio" v-model="pdfType" value="web" class="mt-0.5 text-blue-650" />
            <div>
              <span class="text-xs font-bold text-slate-800 uppercase block flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-blue-600">link</span>
                PDF para WEB
              </span>
              <span class="text-[10px] text-gray-500 block mt-0.5">
                Incluir links clicáveis "Baixar Ficha Técnica" nos cards. Ideal para visualização digital.
              </span>
            </div>
          </label>
          
          <label class="flex items-start gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="radio" v-model="pdfType" value="print" class="mt-0.5 text-blue-650" />
            <div>
              <span class="text-xs font-bold text-slate-800 uppercase block flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-gray-600">print</span>
                PDF para IMPRESSÃO
              </span>
              <span class="text-[10px] text-gray-500 block mt-0.5">
                Sem links nos cards. Layout limpo e otimizado para impressão física.
              </span>
            </div>
          </label>

          <label class="flex items-start gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="radio" v-model="pdfType" value="qrcode" class="mt-0.5 text-blue-650" />
            <div>
              <span class="text-xs font-bold text-slate-800 uppercase block flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-purple-600">qr_code_2</span>
                PDF com QR Code
              </span>
              <span class="text-[10px] text-gray-500 block mt-0.5">
                Substituir o link por um código QR nos cards. Ideal para leitura dinâmica em materiais impressos.
              </span>
            </div>
          </label>
        </div>
      </div>

      <!-- Opção: Formato de Impressão (Livreto) -->
      <div class="border-t border-gray-200 pt-4 mb-5">
        <h4 class="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">Formato de Impressão</h4>
        <p class="text-[10px] text-gray-500 mb-3">
          Escolha como as páginas serão organizadas na folha impressa.
        </p>
        <div class="space-y-2">
          <label class="flex items-start gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="radio" v-model="bookletMode" :value="false" class="mt-0.5 text-blue-650" />
            <div>
              <span class="text-xs font-bold text-slate-800 uppercase block flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-gray-600">description</span>
                Normal (1 Página por Folha)
              </span>
              <span class="text-[10px] text-gray-500 block mt-0.5">
                Cada página do PDF ocupa uma folha A4 inteira.
              </span>
            </div>
          </label>
          
          <label class="flex items-start gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="radio" v-model="bookletMode" :value="true" class="mt-0.5 text-blue-650" />
            <div>
              <span class="text-xs font-bold text-slate-800 uppercase block flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-emerald-600">auto_stories</span>
                Livreto (2 Páginas por Folha)
              </span>
              <span class="text-[10px] text-gray-500 block mt-0.5">
                Imprime 2 páginas lado a lado em cada folha A4 paisagem. Ideal para imprimir como livro pequeno.
              </span>
            </div>
          </label>
        </div>
      </div>

      <!-- Formulário rápido para Criar Nova Capa/Categoria -->
      <div class="border-t border-gray-200 pt-4 mb-5">
        <button 
          @click="showQuickCreate = !showQuickCreate" 
          class="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider flex items-center gap-1 bg-transparent border-0 cursor-pointer"
        >
          <span class="material-symbols-outlined text-sm">{{ showQuickCreate ? 'expand_less' : 'add' }}</span>
          Criar Nova Capa / Categoria
        </button>
        
        <div v-if="showQuickCreate" class="mt-4 p-4 bg-gray-50 border border-gray-200 rounded space-y-3">
          <h4 class="text-xs font-bold text-slate-700 uppercase">Novo Segmento/Categoria</h4>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome da Categoria</label>
              <input v-model="quickCatName" type="text" placeholder="Ex: RETENÇÃO" class="w-full border border-gray-300 p-2 text-xs rounded bg-white text-slate-800 uppercase" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cor Principal (HEX)</label>
              <div class="flex items-center gap-2">
                <input v-model="quickCatColor" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded-full" />
                <input v-model="quickCatColor" type="text" placeholder="#376092" class="flex-grow border border-gray-300 p-2 text-xs rounded bg-white text-slate-800 font-mono text-center" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Imagem de Capa (Upload)</label>
            <div @click="triggerQuickFileInput" class="border-2 border-dashed border-gray-300 p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-150 transition-colors rounded min-h-[70px] relative bg-white">
              <input type="file" ref="quickFileInput" class="hidden" accept="image/*" @change="handleQuickImageUpload" />
              <span v-if="!quickCatImageName" class="material-symbols-outlined text-gray-400 text-lg mb-1">image</span>
              <span class="text-[10px] font-semibold text-gray-500 text-center truncate w-full px-2">
                {{ quickCatImageName || 'Selecionar JPG/PNG' }}
              </span>
            </div>
          </div>

          <button 
            @click="handleQuickCreateCategory" 
            :disabled="creatingQuickCat || !quickCatName.trim()" 
            class="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50 border-0"
          >
            {{ creatingQuickCat ? 'Salvando...' : 'Criar e Selecionar Capa' }}
          </button>
        </div>
      </div>

      <div class="flex space-x-3">
        <button @click="$emit('close')" class="w-1/2 border border-gray-300 text-gray-700 py-2.5 text-xs font-bold rounded hover:bg-gray-50 transition-colors bg-white cursor-pointer">
          CANCELAR
        </button>
        <button 
          @click="submitConfirm" 
          :disabled="coverCategorySelection === 'specific' && !specificCoverCategory" 
          class="w-1/2 bg-blue-600 text-white py-2.5 text-xs font-bold rounded hover:bg-blue-700 transition-colors disabled:opacity-40 border-0 cursor-pointer"
        >
          CONFIRMAR E GERAR
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  open: boolean
  hasGeralCover: boolean
  listableCategories: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', payload: { selection: 'dynamic' | 'GERAL' | 'specific', specificCategory: string, pdfType: 'web' | 'print' | 'qrcode', bookletMode: boolean }): void
  (e: 'create-quick-category', payload: { name: string, color: string, imageName: string, imageBlob: string | null }): void
}>()

const coverCategorySelection = ref<'dynamic' | 'GERAL' | 'specific'>('dynamic')
const specificCoverCategory = ref('')
const pdfType = ref<'web' | 'print' | 'qrcode'>('web')
const bookletMode = ref(false)

// Quick Create State
const showQuickCreate = ref(false)
const quickCatName = ref('')
const quickCatColor = ref('#376092')
const quickCatImageName = ref('')
const quickCatImageBlob = ref<string | null>(null)
const creatingQuickCat = ref(false)
const quickFileInput = ref<HTMLInputElement | null>(null)

const triggerQuickFileInput = () => {
  quickFileInput.value?.click()
}

const handleQuickImageUpload = (event: Event) => {
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
    quickCatImageName.value = file.name
    quickCatImageBlob.value = '\\x' + hex
  }
  reader.readAsArrayBuffer(file)
}

const handleQuickCreateCategory = async () => {
  const name = quickCatName.value.toUpperCase().trim()
  if (!name) return

  creatingQuickCat.value = true
  
  // Let the parent component handle the Supabase creation logic
  emit('create-quick-category', {
    name,
    color: quickCatColor.value,
    imageName: quickCatImageName.value,
    imageBlob: quickCatImageBlob.value
  })
  
  // Parent will trigger a callback or refresh, let's reset locally
  creatingQuickCat.value = false
  quickCatName.value = ''
  quickCatImageName.value = ''
  quickCatImageBlob.value = null
  showQuickCreate.value = false
  coverCategorySelection.value = 'specific'
  specificCoverCategory.value = name
}

const submitConfirm = () => {
  emit('confirm', {
    selection: coverCategorySelection.value,
    specificCategory: specificCoverCategory.value,
    pdfType: pdfType.value,
    bookletMode: bookletMode.value
  })
}
</script>
