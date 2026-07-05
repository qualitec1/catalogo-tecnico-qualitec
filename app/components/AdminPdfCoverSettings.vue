<template>
  <div class="contents">
    <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2 flex justify-between items-center">
      <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Título & Subtítulo da Capa</span>
      <button 
        type="button" 
        @click="$emit('replicate-section', ['coverTitleFontFamily', 'coverTitleFontSize', 'coverTitleBold', 'coverTitleItalic', 'coverTitleUnderline', 'coverTitleColor', 'coverTitleOffsetX', 'coverTitleOffsetY', 'coverSubtitleText', 'coverSubtitleFontFamily', 'coverSubtitleFontSize', 'coverSubtitleBold', 'coverSubtitleItalic', 'coverSubtitleUnderline', 'coverSubtitleColor', 'coverSubtitleOffsetX', 'coverSubtitleOffsetY'])" 
        class="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer flex items-center gap-1 uppercase"
      >
        <span class="material-symbols-outlined text-xs">content_copy</span>
        Replicar
      </button>
    </div>

    <!-- Seção do Título da Capa -->
    <div class="col-span-2 md:col-span-4 mt-2">
      <span class="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Configurações do Título (Nome da Categoria)</span>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
            Fonte do Título Capa
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Fonte usada para o nome da categoria na capa.">!</span>
          </label>
          <select v-model="target.coverTitleFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
            <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('coverTitleFontFamily', getGlobalValue(category, 'coverTitleFontFamily')) }}</option>
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
            Tamanho Fonte Título
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Tamanho do nome da categoria na capa (Ex: 20px).">!</span>
          </label>
          <input v-model="target.coverTitleFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('coverTitleFontSize', getGlobalValue(category, 'coverTitleFontSize')) : '20px'" />
        </div>
        <div>
          <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
            Cor do Título Capa
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor do título na capa.">!</span>
          </label>
          <div class="flex items-center gap-1.5">
            <input :value="target.coverTitleColor || getGlobalValue(category, 'coverTitleColor') || '#ffffff'" type="color" @input="(e: any) => { target.coverTitleColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
            <input v-model="target.coverTitleColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('coverTitleColor', getGlobalValue(category, 'coverTitleColor')) : '#ffffff'" />
          </div>
        </div>
        <div>
          <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
            Deslocamento X Título
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal do título. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
          </label>
          <input v-model="target.coverTitleOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('coverTitleOffsetX', getGlobalValue(category, 'coverTitleOffsetX')) : '0px'" />
        </div>
        <div>
          <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
            Deslocamento Y Título
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical do título. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
          </label>
          <input v-model="target.coverTitleOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('coverTitleOffsetY', getGlobalValue(category, 'coverTitleOffsetY')) : '0px'" />
        </div>
      </div>
    </div>

    <!-- Seção do Subtítulo da Capa -->
    <div class="col-span-2 md:col-span-4 mt-6 border-t border-dashed border-gray-200 pt-4">
      <span class="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Configurações do Subtítulo (Catálogo de Produtos)</span>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="col-span-2">
          <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
            Texto do Subtítulo
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="O texto literal a ser exibido acima do título na capa.">!</span>
          </label>
          <input v-model="target.coverSubtitleText" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-semibold" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('coverSubtitleText', getGlobalValue(category, 'coverSubtitleText')) : 'CATÁLOGO DE PRODUTOS'" />
        </div>
        <div>
          <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
            Fonte do Subtítulo
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Fonte usada para o subtítulo.">!</span>
          </label>
          <select v-model="target.coverSubtitleFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
            <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('coverSubtitleFontFamily', getGlobalValue(category, 'coverSubtitleFontFamily')) }}</option>
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
            Tamanho Fonte Subtítulo
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Tamanho do subtítulo na capa (Ex: 8px).">!</span>
          </label>
          <input v-model="target.coverSubtitleFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('coverSubtitleFontSize', getGlobalValue(category, 'coverSubtitleFontSize')) : '8px'" />
        </div>
        <div>
          <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
            Cor do Subtítulo
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor do subtítulo na capa.">!</span>
          </label>
          <div class="flex items-center gap-1.5">
            <input :value="target.coverSubtitleColor || getGlobalValue(category, 'coverSubtitleColor') || '#ffffff'" type="color" @input="(e: any) => { target.coverSubtitleColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
            <input v-model="target.coverSubtitleColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('coverSubtitleColor', getGlobalValue(category, 'coverSubtitleColor')) : '#ffffff'" />
          </div>
        </div>
        <div>
          <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
            Deslocamento X
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal do subtítulo (Valores positivos movem para DIREITA).">!</span>
          </label>
          <input v-model="target.coverSubtitleOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('coverSubtitleOffsetX', getGlobalValue(category, 'coverSubtitleOffsetX')) : '0px'" />
        </div>
        <div>
          <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
            Deslocamento Y
            <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical do subtítulo (Valores positivos movem para BAIXO).">!</span>
          </label>
          <input v-model="target.coverSubtitleOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('coverSubtitleOffsetY', getGlobalValue(category, 'coverSubtitleOffsetY')) : '0px'" />
        </div>
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

defineEmits(['replicate-section'])
</script>
