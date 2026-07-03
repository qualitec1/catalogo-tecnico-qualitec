<template>
  <div class="contents">
    <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2">
      <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Configurações do Título da Categoria</span>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Fonte do Título
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Altera a família de fonte do título principal da categoria na capa e cabeçalhos do PDF.">!</span>
      </label>
      <select v-model="target.titleFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('titleFontFamily', getGlobalValue(category, 'titleFontFamily')) }}</option>
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
        Tamanho Fonte Título
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Define o tamanho da fonte do título principal no cabeçalho das páginas (Ex: 36px).">!</span>
      </label>
      <input v-model="target.titleFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('titleFontSize', getGlobalValue(category, 'titleFontSize')) : '36px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Título Posição Y
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Ajusta o deslocamento vertical do título da página. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -5px).">!</span>
      </label>
      <input v-model="target.titlePositionY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('titlePositionY', getGlobalValue(category, 'titlePositionY')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Cor do Título
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor personalizada do título principal da página. Se deixado em branco, herdará a cor principal da categoria (Ex: #376092).">!</span>
      </label>
      <div class="flex gap-1.5 items-center">
        <input :value="target.titleColor || getGlobalValue(category, 'titleColor') || category.colorHex" type="color" @input="(e: any) => { target.titleColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
        <input v-model="target.titleColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('titleColor', getGlobalValue(category, 'titleColor')) : category.colorHex" />
      </div>
    </div>
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
