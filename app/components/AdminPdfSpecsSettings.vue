<template>
  <div class="contents">
    <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2 flex justify-between items-center">
      <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Especificações Técnicas (Ficha)</span>
      <button 
        type="button" 
        @click="$emit('replicate-section', ['fontSizeSpecs', 'specsFontFamily', 'specsBold', 'specsItalic', 'specsUnderline', 'specsValBold', 'specsValItalic', 'specsValUnderline', 'specsLabelWidth', 'specsValueWidth', 'specsPaddingY', 'specsLineStyle', 'specsLineColor', 'specsBgColor', 'specsColor', 'specsValColor'])" 
        class="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer flex items-center gap-1 uppercase"
      >
        <span class="material-symbols-outlined text-xs">content_copy</span>
        Replicar
      </button>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Tamanho Fonte Specs
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Tamanho da fonte das tabelas de especificações no PDF (Ex: 10px).">!</span>
      </label>
      <input v-model="target.fontSizeSpecs" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('fontSizeSpecs', getGlobalValue(category, 'fontSizeSpecs')) : '10px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Fonte das Specs
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada no texto da tabela de especificações no PDF.">!</span>
      </label>
      <select v-model="target.specsFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('specsFontFamily', getGlobalValue(category, 'specsFontFamily')) }}</option>
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
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Cor Texto Rótulos (Specs)
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor do texto dos rótulos (labels) na tabela de especificações.">!</span>
      </label>
      <div class="flex items-center gap-1.5">
        <input :value="target.specsColor || getGlobalValue(category, 'specsColor') || '#374151'" type="color" @input="(e: any) => { target.specsColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
        <input v-model="target.specsColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('specsColor', getGlobalValue(category, 'specsColor')) : '#374151'" />
      </div>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Cor Texto Valores (Specs)
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor do texto dos valores na tabela de especificações.">!</span>
      </label>
      <div class="flex items-center gap-1.5">
        <input :value="target.specsValColor || getGlobalValue(category, 'specsValColor') || '#000000'" type="color" @input="(e: any) => { target.specsValColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
        <input v-model="target.specsValColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('specsValColor', getGlobalValue(category, 'specsValColor')) : '#000000'" />
      </div>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Largura Coluna Labels
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Largura relativa da coluna de rótulos/especificações (Ex: 45%).">!</span>
      </label>
      <input v-model="target.specsLabelWidth" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('specsLabelWidth', getGlobalValue(category, 'specsLabelWidth')) : '45%'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Largura Coluna Valores
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Largura relativa da coluna de valores/informações (Ex: 55%).">!</span>
      </label>
      <input v-model="target.specsValueWidth" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('specsValueWidth', getGlobalValue(category, 'specsValueWidth')) : '55%'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Espaçamento Interno (Y)
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Padding vertical interno das células da tabela de especificações (Ex: 4px).">!</span>
      </label>
      <input v-model="target.specsPaddingY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('specsPaddingY', getGlobalValue(category, 'specsPaddingY')) : '4px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Estilo das Linhas
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Define o desenho das linhas divisórias da tabela de especificações (Tracejado, Contínuo, Pontilhado ou Nenhum).">!</span>
      </label>
      <select v-model="target.specsLineStyle" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('specsLineStyle', getGlobalValue(category, 'specsLineStyle')) }}</option>
        <option value="dashed">Tracejado (dashed)</option>
        <option value="solid">Contínuo (solid)</option>
        <option value="dotted">Pontilhado (dotted)</option>
        <option value="none">Nenhum</option>
      </select>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Cor das Linhas
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor das linhas divisórias das especificações (Ex: #cbd5e1).">!</span>
      </label>
      <div class="flex gap-1.5 items-center">
        <input :value="target.specsLineColor || getGlobalValue(category, 'specsLineColor') || '#cbd5e1'" type="color" @input="(e: any) => { target.specsLineColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
        <input v-model="target.specsLineColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('specsLineColor', getGlobalValue(category, 'specsLineColor')) : '#cbd5e1'" />
      </div>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Fundo das Specs (Bg)
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor de fundo do box de especificações. Deixe vazio para transparente ou defina cor hex (Ex: #f3f4f6).">!</span>
      </label>
      <div class="flex gap-1.5 items-center">
        <input :value="target.specsBgColor || getGlobalValue(category, 'specsBgColor') || '#f3f4f6'" type="color" @input="(e: any) => { target.specsBgColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
        <input v-model="target.specsBgColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('specsBgColor', getGlobalValue(category, 'specsBgColor')) : '#f3f4f6'" />
      </div>
    </div>

    <!-- Divisor Geral -->
    <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2 flex justify-between items-center">
      <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Outros Detalhes do PDF</span>
      <button 
        type="button" 
        @click="$emit('replicate-section', ['dividerLineColor'])" 
        class="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer flex items-center gap-1 uppercase"
      >
        <span class="material-symbols-outlined text-xs">content_copy</span>
        Replicar
      </button>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Cor da Linha Divisória
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor da linha fina que divide as páginas dos produtos do PDF (Ex: #cbd5e1).">!</span>
      </label>
      <div class="flex gap-1.5 items-center">
        <input :value="target.dividerLineColor || getGlobalValue(category, 'dividerLineColor') || '#cbd5e1'" type="color" @input="(e: any) => { target.dividerLineColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
        <input v-model="target.dividerLineColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('dividerLineColor', getGlobalValue(category, 'dividerLineColor')) : '#cbd5e1'" />
      </div>
    </div>
    <div class="col-span-1 md:col-span-3"></div>
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
