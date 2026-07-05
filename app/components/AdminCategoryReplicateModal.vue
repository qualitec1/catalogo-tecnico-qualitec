<template>
  <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
        <h3 class="font-bold text-sm uppercase tracking-wider flex items-center">
          <span class="material-symbols-outlined mr-2">content_copy</span>
          Replicar Layout do PDF
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
        <p class="font-medium text-gray-500">
          Você está copiando as configurações de layout do PDF da categoria
          <strong class="text-slate-800 font-bold uppercase">"{{ category?.category }}"</strong>
          para outras categorias. Selecione abaixo o destino:
        </p>

        <!-- Target Categories Selection -->
        <div class="space-y-2">
          <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Categorias de Destino:</span>
          <div class="grid grid-cols-2 gap-2 border border-gray-200 p-3 rounded bg-gray-50 max-h-40 overflow-y-auto">
            <label 
              v-for="cat in otherCategories" 
              :key="cat.id" 
              class="flex items-center space-x-2 p-1.5 hover:bg-white rounded cursor-pointer border border-transparent hover:border-gray-200"
            >
              <input type="checkbox" v-model="selectedTargets" :value="cat.id" class="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
              <span class="font-semibold uppercase truncate">{{ cat.category }}</span>
            </label>
          </div>
        </div>

        <!-- Mode Select (All fields or Custom) -->
        <div class="space-y-3 pt-2 border-t border-gray-100">
          <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Quais campos deseja replicar?</span>
          <div class="flex gap-4">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="radio" :value="true" v-model="replicateAllFields" class="text-blue-600 focus:ring-blue-500 w-4 h-4" />
              <span class="font-bold text-slate-800">Todas as configurações (Recomendado)</span>
            </label>
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="radio" :value="false" v-model="replicateAllFields" class="text-blue-600 focus:ring-blue-500 w-4 h-4" />
              <span class="font-bold text-slate-800">Escolher campos específicos...</span>
            </label>
          </div>
        </div>

        <!-- Custom Fields Selector -->
        <div v-if="!replicateAllFields" class="space-y-3 border border-gray-200 p-4 rounded bg-gray-50 max-h-56 overflow-y-auto">
          <div class="flex justify-between items-center pb-2 border-b border-gray-200">
            <span class="font-bold text-[10px] uppercase text-gray-500">Selecione as propriedades</span>
            <div class="space-x-2">
              <button type="button" @click="selectAll" class="text-[10px] text-blue-600 hover:underline font-semibold uppercase">Marcar Todas</button>
              <button type="button" @click="deselectAll" class="text-[10px] text-gray-500 hover:underline font-semibold uppercase">Desmarcar Todas</button>
            </div>
          </div>
          <div class="space-y-4">
            <div v-for="group in replicationGroups" :key="group.name" class="space-y-1.5">
              <span class="block font-bold text-[9px] text-slate-800 uppercase tracking-wider">{{ group.name }}</span>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <label v-for="field in group.fields" :key="field.key" class="flex items-center space-x-2">
                  <input type="checkbox" v-model="selectedFields" :value="field.key" class="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                  <span class="text-gray-600 text-[10px] font-medium">{{ field.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 p-4 border-t border-gray-200 flex justify-end space-x-3 shrink-0">
        <button 
          type="button" 
          @click="$emit('close')" 
          class="px-4 py-2 border border-gray-300 text-slate-700 bg-white rounded font-bold hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="button" 
          @click="submitReplicate" 
          :disabled="selectedTargets.length === 0 || saving"
          class="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
        >
          Replicar Layout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  open: boolean
  category: any
  categories: any[]
  saving: boolean
  initialFields?: string[] | null
  initialReplicateAllFields?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'replicate', payload: { source: any, targetIds: string[], fields: string[] | null }): void
}>()

const selectedTargets = ref<string[]>([])
const replicateAllFields = ref(true)
const selectedFields = ref<string[]>([])

watch(() => props.open, (newVal) => {
  if (newVal) {
    if (props.initialFields) {
      selectedFields.value = [...props.initialFields]
      replicateAllFields.value = !!props.initialReplicateAllFields
    } else {
      selectAll()
      replicateAllFields.value = true
    }
  }
})

const otherCategories = computed(() => {
  if (!props.category) return []
  return props.categories.filter(c => c.id !== props.category.id)
})

const replicationGroups = [
  {
    name: 'Badge / Ícone Superior',
    fields: [
      { key: 'badgeText', label: 'Texto/Frase do Badge' },
      { key: 'badgeIconUrl', label: 'URL do Ícone do Badge' },
      { key: 'badgeIconSize', label: 'Tamanho do Ícone' },
      { key: 'badgeFontFamily', label: 'Fonte da Frase' },
      { key: 'badgeFontSize', label: 'Tamanho da Fonte' },
      { key: 'badgeColor', label: 'Cor da Frase' },
      { key: 'badgePositionX', label: 'Mover Tudo: Offset X' },
      { key: 'badgePositionY', label: 'Mover Tudo: Offset Y' },
      { key: 'badgeIconOffsetX', label: 'Mover Ícone: Offset X' },
      { key: 'badgeIconOffsetY', label: 'Mover Ícone: Offset Y' },
      { key: 'badgeTextOffsetX', label: 'Mover Frase: Offset X' },
      { key: 'badgeTextOffsetY', label: 'Mover Frase: Offset Y' }
    ]
  },
  {
    name: 'Título da Categoria',
    fields: [
      { key: 'titleFontSize', label: 'Tamanho da Fonte' },
      { key: 'titlePositionY', label: 'Posição Vertical (Y)' },
      { key: 'titleColor', label: 'Cor do Título' },
      { key: 'titleFontFamily', label: 'Família da Fonte' },
      { key: 'titleBold', label: 'Negrito' },
      { key: 'titleItalic', label: 'Itálico' },
      { key: 'titleUnderline', label: 'Sublinhado' }
    ]
  },
  {
    name: 'Logotipo',
    fields: [
      { key: 'logoWidth', label: 'Largura da Logo' },
      { key: 'logoHeight', label: 'Altura da Logo' },
      { key: 'logoPositionX', label: 'Posição X' },
      { key: 'logoPositionY', label: 'Posição Y' }
    ]
  },
  {
    name: 'Disposição & Alinhamento',
    fields: [
      { key: 'imagePosition', label: 'Alinhamento da Foto' },
      { key: 'cardHeaderLayout', label: 'Layout do Cabeçalho (Modelo/Tag)' },
      { key: 'cardLayoutOrder', label: 'Ordem do Layout (Foto/Ficha)' },
      { key: 'productSpacing', label: 'Espaçamento Entre Itens' },
      { key: 'productImageOffsetX', label: 'Deslocamento Horizontal Foto' },
      { key: 'productImageOffsetY', label: 'Deslocamento Vertical Foto' },
      { key: 'pdfImageScale', label: 'Escala Proporcional Foto' },
      { key: 'pdfImageScaleX', label: 'Escala Horizontal Foto' },
      { key: 'pdfImageScaleY', label: 'Escala Vertical Foto' }
    ]
  },
  {
    name: 'Card de Produto',
    fields: [
      { key: 'cardOffsetX', label: 'Deslocamento X do Card' },
      { key: 'cardOffsetY', label: 'Deslocamento Y do Card' },
      { key: 'cardTitleOffsetX', label: 'Deslocamento X do Título' },
      { key: 'cardTitleOffsetY', label: 'Deslocamento Y do Título' },
      { key: 'cardTitleFontFamily', label: 'Fonte do Título' },
      { key: 'cardTitleBold', label: 'Negrito no Título' },
      { key: 'cardTitleItalic', label: 'Itálico no Título' },
      { key: 'cardTitleUnderline', label: 'Sublinhado no Título' },
      { key: 'cardModelFontSize', label: 'Tamanho Fonte Modelo' },
      { key: 'cardModelOffsetX', label: 'Deslocamento X do Modelo' },
      { key: 'cardModelOffsetY', label: 'Deslocamento Y do Modelo' },
      { key: 'cardModelFontFamily', label: 'Fonte do Modelo' },
      { key: 'cardModelBold', label: 'Negrito no Modelo' },
      { key: 'cardModelItalic', label: 'Itálico no Modelo' },
      { key: 'cardModelUnderline', label: 'Sublinhado no Modelo' },
      { key: 'cardModelLabelFontSize', label: 'Tamanho Fonte Rótulo Modelo' },
      { key: 'cardModelLabelOffsetX', label: 'Deslocamento X do Rótulo Modelo' },
      { key: 'cardModelLabelOffsetY', label: 'Deslocamento Y do Rótulo Modelo' },
      { key: 'cardModelLabelFontFamily', label: 'Fonte do Rótulo Modelo' },
      { key: 'cardModelLabelBold', label: 'Negrito no Rótulo Modelo' },
      { key: 'cardModelLabelItalic', label: 'Itálico no Rótulo Modelo' },
      { key: 'cardModelLabelUnderline', label: 'Sublinhado no Rótulo Modelo' },
      { key: 'cardTitleColor', label: 'Cor do Título Card' },
      { key: 'cardModelColor', label: 'Cor do Modelo Card' },
      { key: 'cardModelLabelColor', label: 'Cor do Rótulo Modelo' }
    ]
  },
  {
    name: 'Especificações (Specs)',
    fields: [
      { key: 'fontSizeSpecs', label: 'Tamanho Fonte das Specs' },
      { key: 'specsFontFamily', label: 'Fonte das Specs' },
      { key: 'specsBold', label: 'Negrito nas Labels' },
      { key: 'specsItalic', label: 'Itálico nas Labels' },
      { key: 'specsUnderline', label: 'Sublinhado nas Labels' },
      { key: 'specsValBold', label: 'Negrito nos Valores' },
      { key: 'specsValItalic', label: 'Itálico nos Valores' },
      { key: 'specsValUnderline', label: 'Sublinhado nos Valores' },
      { key: 'specsLabelWidth', label: 'Largura Coluna Labels' },
      { key: 'specsValueWidth', label: 'Largura Coluna Valores' },
      { key: 'specsPaddingY', label: 'Espaçamento Specs Y' },
      { key: 'specsLineStyle', label: 'Estilo de Linha' },
      { key: 'specsLineColor', label: 'Cor de Linha' },
      { key: 'specsBgColor', label: 'Fundo do Quadro Specs' },
      { key: 'specsColor', label: 'Cor Texto Rótulos (Specs)' },
      { key: 'specsValColor', label: 'Cor Texto Valores (Specs)' }
    ]
  },
  {
    name: 'Tag de Informação',
    fields: [
      { key: 'tagFontFamily', label: 'Fonte da Tag' },
      { key: 'tagFontSize', label: 'Tamanho Fonte da Tag' },
      { key: 'tagColor', label: 'Cor do Texto da Tag' },
      { key: 'tagBold', label: 'Negrito na Tag' },
      { key: 'tagItalic', label: 'Itálico na Tag' },
      { key: 'tagUnderline', label: 'Sublinhado na Tag' },
      { key: 'tagOffsetX', label: 'Deslocamento X da Tag' },
      { key: 'tagOffsetY', label: 'Deslocamento Y da Tag' }
    ]
  },
  {
    name: 'Capa do PDF',
    fields: [
      { key: 'coverTitleFontFamily', label: 'Fonte do Título da Capa' },
      { key: 'coverTitleFontSize', label: 'Tamanho Fonte Título Capa' },
      { key: 'coverTitleBold', label: 'Negrito no Título da Capa' },
      { key: 'coverTitleItalic', label: 'Itálico no Título da Capa' },
      { key: 'coverTitleUnderline', label: 'Sublinhado no Título da Capa' },
      { key: 'coverTitleColor', label: 'Cor do Título da Capa' },
      { key: 'coverTitleOffsetX', label: 'Deslocamento X do Título' },
      { key: 'coverTitleOffsetY', label: 'Deslocamento Y do Título' },
      { key: 'coverSubtitleText', label: 'Texto do Subtítulo da Capa' },
      { key: 'coverSubtitleFontFamily', label: 'Fonte do Subtítulo' },
      { key: 'coverSubtitleFontSize', label: 'Tamanho Fonte Subtítulo' },
      { key: 'coverSubtitleBold', label: 'Negrito no Subtítulo' },
      { key: 'coverSubtitleItalic', label: 'Itálico no Subtítulo' },
      { key: 'coverSubtitleUnderline', label: 'Sublinhado no Subtítulo' },
      { key: 'coverSubtitleColor', label: 'Cor do Subtítulo' },
      { key: 'coverSubtitleOffsetX', label: 'Deslocamento X do Subtítulo' },
      { key: 'coverSubtitleOffsetY', label: 'Deslocamento Y do Subtítulo' }
    ]
  },
  {
    name: 'Gerais do PDF',
    fields: [
      { key: 'dividerLineColor', label: 'Cor da Linha Divisória' },
      { key: 'orientation', label: 'Orientação Padrão' },
      { key: 'landscapeSettings', label: 'Configurações de Paisagem' },
      { key: 'layoutSettings', label: 'Ajustes de Layout (1, 2 e 6 por Página)' }
    ]
  }
]

const selectAll = () => {
  selectedFields.value = replicationGroups.flatMap(g => g.fields.map(f => f.key))
}

const deselectAll = () => {
  selectedFields.value = []
}

// Initial fill
selectAll()

const submitReplicate = () => {
  if (selectedTargets.value.length > 0) {
    emit('replicate', {
      source: props.category,
      targetIds: selectedTargets.value,
      fields: replicateAllFields.value ? null : selectedFields.value
    })
    selectedTargets.value = []
  }
}
</script>
