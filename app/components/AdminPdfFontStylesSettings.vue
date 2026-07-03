<template>
  <div class="pt-4 border-t border-gray-200 mt-4">
    <span class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Estilos e Decorações do Texto</span>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
      
      <!-- Título Categoria -->
      <div class="space-y-2">
        <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Título Categoria</span>
        <div class="space-y-1.5">
          <!-- Bold -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.titleBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Negrito</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
            <select v-model="target.titleBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'titleBold') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>

          <!-- Italic -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.titleItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Itálico</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
            <select v-model="target.titleItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'titleItalic') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>

          <!-- Underline -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.titleUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Sublinhado</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
            <select v-model="target.titleUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'titleUnderline') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Título Produto (Card) -->
      <div class="space-y-2">
        <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Título Produto</span>
        <div class="space-y-1.5">
          <!-- Bold -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.cardTitleBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Negrito</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
            <select v-model="target.cardTitleBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'cardTitleBold') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>

          <!-- Italic -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.cardTitleItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Itálico</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
            <select v-model="target.cardTitleItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'cardTitleItalic') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>

          <!-- Underline -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.cardTitleUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Sublinhado</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
            <select v-model="target.cardTitleUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'cardTitleUnderline') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Modelo (SKU) -->
      <div class="space-y-2">
        <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Código do Modelo</span>
        <div class="space-y-1.5">
          <!-- Bold -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.cardModelBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Negrito</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
            <select v-model="target.cardModelBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'cardModelBold') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>

          <!-- Italic -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.cardModelItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Itálico</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
            <select v-model="target.cardModelItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'cardModelItalic') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>

          <!-- Underline -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.cardModelUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Sublinhado</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
            <select v-model="target.cardModelUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'cardModelUnderline') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Specs Labels -->
      <div class="space-y-2">
        <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Tabela Specs (Rótulos)</span>
        <div class="space-y-1.5">
          <!-- Bold -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.specsBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Negrito</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
            <select v-model="target.specsBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'specsBold') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>

          <!-- Italic -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.specsItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Itálico</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
            <select v-model="target.specsItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'specsItalic') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>

          <!-- Underline -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.specsUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Sublinhado</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
            <select v-model="target.specsUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'specsUnderline') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Specs Valores -->
      <div class="space-y-2 mt-4 md:mt-0">
        <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Tabela Specs (Valores)</span>
        <div class="space-y-1.5">
          <!-- Bold -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.specsValBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Negrito</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
            <select v-model="target.specsValBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'specsValBold') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>

          <!-- Italic -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.specsValItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Itálico</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
            <select v-model="target.specsValItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'specsValItalic') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>

          <!-- Underline -->
          <div v-if="density === 'geral'">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" v-model="target.specsValUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span class="text-gray-650 font-medium">Sublinhado</span>
            </label>
          </div>
          <div v-else class="flex flex-col space-y-0.5">
            <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
            <select v-model="target.specsValUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
              <option value="">Herdado ({{ getGlobalValue(category, 'specsValUnderline') ? 'Sim' : 'Não' }})</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tag / Status -->
      <div class="space-y-2 mt-4 md:mt-0 col-span-2">
        <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Tag de Informação / Status (CO2, etc)</span>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-[9px] font-semibold text-gray-500 uppercase">Fonte Tag</label>
            <select v-model="target.tagFontFamily" @change="category.hasChanges = true" class="border border-gray-300 p-1.5 rounded bg-white text-xs w-full">
              <option v-if="density !== 'geral'" value="">Herdado ({{ getGlobalValue(category, 'tagFontFamily') }})</option>
              <option value="Inter">Inter</option>
              <option value="Hanken Grotesk">Hanken Grotesk</option>
              <option value="Roboto">Roboto</option>
              <option value="Outfit">Outfit</option>
              <option value="Verdana">Verdana</option>
              <option value="Calibri">Calibri</option>
            </select>
          </div>
          <div>
            <label class="text-[9px] font-semibold text-gray-500 uppercase">Tamanho Fonte</label>
            <input v-model="target.tagFontSize" type="text" @input="category.hasChanges = true" class="border border-gray-300 p-1.5 rounded bg-white text-xs w-full" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('tagFontSize', getGlobalValue(category, 'tagFontSize')) : '10px'" />
          </div>
          <div>
            <label class="text-[9px] font-semibold text-gray-500 uppercase">Ajuste X</label>
            <input v-model="target.tagOffsetX" type="text" @input="category.hasChanges = true" class="border border-gray-300 p-1.5 rounded bg-white text-xs w-full" placeholder="0px" />
          </div>
          <div>
            <label class="text-[9px] font-semibold text-gray-500 uppercase">Ajuste Y</label>
            <input v-model="target.tagOffsetY" type="text" @input="category.hasChanges = true" class="border border-gray-300 p-1.5 rounded bg-white text-xs w-full" placeholder="0px" />
          </div>
          <div class="col-span-2 flex flex-wrap gap-3 pt-1">
            <div v-if="density === 'geral'">
              <label class="flex items-center space-x-1.5 cursor-pointer">
                <input type="checkbox" v-model="target.tagBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                <span class="text-gray-650 font-medium">Tag Negrito</span>
              </label>
            </div>
            <div v-else class="flex flex-col space-y-0.5 w-full">
              <span class="text-gray-500 font-semibold text-[9px] uppercase">Tag Negrito</span>
              <select v-model="target.tagBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                <option value="">Herdado ({{ getGlobalValue(category, 'tagBold') ? 'Sim' : 'Não' }})</option>
                <option :value="true">Sim</option>
                <option :value="false">Não</option>
              </select>
            </div>
            <div v-if="density === 'geral'">
              <label class="flex items-center space-x-1.5 cursor-pointer">
                <input type="checkbox" v-model="target.tagItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                <span class="text-gray-650 font-medium">Tag Itálico</span>
              </label>
            </div>
            <div v-else class="flex flex-col space-y-0.5 w-full">
              <span class="text-gray-500 font-semibold text-[9px] uppercase">Tag Itálico</span>
              <select v-model="target.tagItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                <option value="">Herdado ({{ getGlobalValue(category, 'tagItalic') ? 'Sim' : 'Não' }})</option>
                <option :value="true">Sim</option>
                <option :value="false">Não</option>
              </select>
            </div>
            <div v-if="density === 'geral'">
              <label class="flex items-center space-x-1.5 cursor-pointer">
                <input type="checkbox" v-model="target.tagUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                <span class="text-gray-650 font-medium">Tag Sublinhado</span>
              </label>
            </div>
            <div v-else class="flex flex-col space-y-0.5 w-full">
              <span class="text-gray-500 font-semibold text-[9px] uppercase">Tag Sublinhado</span>
              <select v-model="target.tagUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                <option value="">Herdado ({{ getGlobalValue(category, 'tagUnderline') ? 'Sim' : 'Não' }})</option>
                <option :value="true">Sim</option>
                <option :value="false">Não</option>
              </select>
            </div>
          </div>
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
</script>
