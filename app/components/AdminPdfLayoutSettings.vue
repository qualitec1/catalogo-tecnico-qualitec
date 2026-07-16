<template>
  <div class="contents">
    <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2 flex justify-between items-center">
      <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Disposição Geral & Alinhamento</span>
      <button 
        type="button" 
        @click="$emit('replicate-section', ['imagePosition', 'cardHeaderLayout', 'cardLayoutOrder', 'productSpacing', 'productImageOffsetY', 'productImageOffsetX'])" 
        class="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer flex items-center gap-1 uppercase"
      >
        <span class="material-symbols-outlined text-xs">content_copy</span>
        Replicar
      </button>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Alinhamento Foto
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Define se as fotos dos produtos serão exibidas na esquerda, direita ou centro do card.">!</span>
      </label>
      <select v-model="target.imagePosition" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('imagePosition', getGlobalValue(category, 'imagePosition')) }}</option>
        <option value="right">Direita</option>
        <option value="left">Esquerda</option>
        <option value="center">Centralizado</option>
      </select>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Posição do Cabeçalho Card
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Inverte as posições do Modelo (VS-0080) e Tag/Status (CO2) no cabeçalho do card.">!</span>
      </label>
      <select v-model="target.cardHeaderLayout" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('cardHeaderLayout', getGlobalValue(category, 'cardHeaderLayout')) }}</option>
        <option value="model-left">Modelo à Esq. / Tag à Dir.</option>
        <option value="model-right">Tag à Esq. / Modelo à Dir.</option>
      </select>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Ordem do Layout
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Altera a ordem no card de 2 produtos: se a ficha técnica (specs) ou a imagem aparece primeiro.">!</span>
      </label>
      <select v-model="target.cardLayoutOrder" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('cardLayoutOrder', getGlobalValue(category, 'cardLayoutOrder')) }}</option>
        <option value="specs-first">Ficha Técnica Primeiro</option>
        <option value="image-first">Imagem Primeiro</option>
      </select>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Espaçamento Entre Itens
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Espaço vertical de separação entre os produtos em uma página (Ex: 24px).">!</span>
      </label>
      <input v-model="target.productSpacing" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('productSpacing', getGlobalValue(category, 'productSpacing')) : '24px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Foto Deslocamento Y
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical das fotos dos produtos. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -10px).">!</span>
      </label>
      <input v-model="target.productImageOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('productImageOffsetY', getGlobalValue(category, 'productImageOffsetY')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Foto Deslocamento X (Padrão)
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal padrão das fotos dos produtos. Pode ser sobrescrito individualmente por produto. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 10px, -10px).">!</span>
      </label>
      <input v-model="target.productImageOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('productImageOffsetX', getGlobalValue(category, 'productImageOffsetX')) : '0px'" />
    </div>

    <!-- Scale group -->
    <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2 flex justify-between items-center">
      <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Dimensões da Imagem Padrão</span>
      <button 
        type="button" 
        @click="$emit('replicate-section', ['pdfImageScale', 'pdfImageScaleX', 'pdfImageScaleY'])" 
        class="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer flex items-center gap-1 uppercase"
      >
        <span class="material-symbols-outlined text-xs">content_copy</span>
        Replicar
      </button>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Escala Proporcional
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Escala os 4 cantos da imagem de forma proporcional (Ex: 1.2 para aumentar 20%, 0.8 para reduzir 20%).">!</span>
      </label>
      <input v-model="target.pdfImageScale" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('pdfImageScale', getGlobalValue(category, 'pdfImageScale')) : '1.0'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Escala Horizontal
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Aumenta ou diminui a dimensão horizontal (largura) da imagem.">!</span>
      </label>
      <input v-model="target.pdfImageScaleX" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('pdfImageScaleX', getGlobalValue(category, 'pdfImageScaleX')) : '1.0'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Escala Vertical
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Aumenta ou diminui a dimensão vertical (altura) da imagem.">!</span>
      </label>
      <input v-model="target.pdfImageScaleY" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('pdfImageScaleY', getGlobalValue(category, 'pdfImageScaleY')) : '1.0'" />
    </div>

    <!-- Booklet Scale group -->
    <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2 flex justify-between items-center">
      <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Dimensões & Offsets (Modo Livreto / Booklet)</span>
      <button 
        type="button" 
        @click="$emit('replicate-section', ['bookletPdfImageScale', 'bookletPdfImageScaleX', 'bookletPdfImageScaleY', 'bookletProductImageOffsetX', 'bookletProductImageOffsetY'])" 
        class="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 bg-transparent border-0 cursor-pointer flex items-center gap-1 uppercase"
      >
        <span class="material-symbols-outlined text-xs">content_copy</span>
        Replicar
      </button>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Livreto Escala Proporcional
      </label>
      <input v-model="target.bookletPdfImageScale" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('bookletPdfImageScale', getGlobalValue(category, 'bookletPdfImageScale')) : '1.0'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Livreto Escala Horizontal
      </label>
      <input v-model="target.bookletPdfImageScaleX" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('bookletPdfImageScaleX', getGlobalValue(category, 'bookletPdfImageScaleX')) : '1.0'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Livreto Escala Vertical
      </label>
      <input v-model="target.bookletPdfImageScaleY" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('bookletPdfImageScaleY', getGlobalValue(category, 'bookletPdfImageScaleY')) : '1.0'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Livreto Deslocamento X
      </label>
      <input v-model="target.bookletProductImageOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('bookletProductImageOffsetX', getGlobalValue(category, 'bookletProductImageOffsetX')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Livreto Deslocamento Y
      </label>
      <input v-model="target.bookletProductImageOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('bookletProductImageOffsetY', getGlobalValue(category, 'bookletProductImageOffsetY')) : '0px'" />
    </div>
    <div class="hidden md:block"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  target: any
  category: any
  density: string
  getGlobalValue: (category: any, fieldName: string) => any
  translateValue: (fieldName: string, value: any) => string
}>()

defineEmits(['replicate-section'])
</script>
