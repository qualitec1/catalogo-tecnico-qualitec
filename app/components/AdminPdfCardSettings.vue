<template>
  <div class="contents">
    <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2">
      <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Ajustes Finos do Card (Modelo/Título)</span>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Deslocamento X
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal de todo o bloco de informações. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 10px, -10px).">!</span>
      </label>
      <input v-model="target.cardOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardOffsetX', getGlobalValue(category, 'cardOffsetX')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Deslocamento Y
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical de todo o bloco de informações. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -10px).">!</span>
      </label>
      <input v-model="target.cardOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardOffsetY', getGlobalValue(category, 'cardOffsetY')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Título Desloc. X
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal apenas do título do produto. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.cardTitleOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="0px" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Título Desloc. Y
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical apenas do título do produto. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.cardTitleOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="0px" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Fonte do Título Card
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada no título do produto nos cards do PDF.">!</span>
      </label>
      <select v-model="target.cardTitleFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('cardTitleFontFamily', getGlobalValue(category, 'cardTitleFontFamily')) }}</option>
        <option value="Inter">Inter</option>
        <option value="Hanken Grotesk">Hanken Grotesk</option>
        <option value="Roboto">Roboto</option>
        <option value="Outfit">Outfit</option>
        <option value="Verdana">Verdana</option>
        <option value="Calibri">Calibri</option>
      </select>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Fonte do Modelo Card
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada no código do modelo (SKU) nos cards do PDF.">!</span>
      </label>
      <select v-model="target.cardModelFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('cardModelFontFamily', getGlobalValue(category, 'cardModelFontFamily')) }}</option>
        <option value="Inter">Inter</option>
        <option value="Hanken Grotesk">Hanken Grotesk</option>
        <option value="Roboto">Roboto</option>
        <option value="Outfit">Outfit</option>
        <option value="Verdana">Verdana</option>
        <option value="Calibri">Calibri</option>
      </select>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Tamanho Fonte Modelo
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Tamanho do texto do código do modelo (SKU) no card (Ex: 24px).">!</span>
      </label>
      <input v-model="target.cardModelFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelFontSize', getGlobalValue(category, 'cardModelFontSize')) : '24px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Modelo Desloc. X
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal apenas do código do modelo (SKU) no card. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.cardModelOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelOffsetX', getGlobalValue(category, 'cardModelOffsetX')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Modelo Desloc. Y
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical apenas do código do modelo (SKU) no card. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.cardModelOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelOffsetY', getGlobalValue(category, 'cardModelOffsetY')) : '0px'" />
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
</script>
