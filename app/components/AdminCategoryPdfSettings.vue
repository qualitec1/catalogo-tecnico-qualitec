<template>
  <div class="w-full lg:w-2/3 border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-6 space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center pb-2 border-b border-gray-200">
      <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
        <span class="material-symbols-outlined text-base mr-1.5">picture_as_pdf</span>
        Customização do PDF
      </h4>
    </div>

    <!-- Configure Layout Dropdown -->
    <div class="relative inline-block">
      <button
        @click="togglePdfMenuOpen(category.id)"
        class="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded border border-blue-600 transition-all flex items-center gap-1 outline-none"
        type="button"
      >
        <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
        <span>
          {{ isPdfSettingsOpen(category.id) ? '↕ Editando Vertical' : 'Configurar Layout PDF' }}
        </span>
        <span class="material-symbols-outlined text-sm">{{ isPdfMenuOpen(category.id) ? 'expand_less' : 'expand_more' }}</span>
      </button>
      
      <!-- Dropdown Menu -->
      <div
        v-if="isPdfMenuOpen(category.id)"
        class="absolute right-0 mt-1 z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[220px] overflow-hidden"
      >
        <button
          @click="openPdfPanel(category.id, 'portrait')"
          class="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-50 flex items-center gap-2 transition-colors border-0"
          :class="isPdfSettingsOpen(category.id) ? 'text-blue-600 bg-blue-50' : 'text-slate-700'"
        >
          <span class="material-symbols-outlined text-sm">crop_portrait</span>
          ↕ Configurar Layout <strong>Vertical</strong>
        </button>
        <div v-if="isPdfSettingsOpen(category.id)" class="border-t border-gray-100"></div>
        <button
          v-if="isPdfSettingsOpen(category.id)"
          @click="closePdfPanel(category.id)"
          class="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 text-gray-500 transition-colors border-0"
        >
          <span class="material-symbols-outlined text-sm">close</span>
          Ocultar Painel
        </button>
      </div>
    </div>

    <!-- Collapsible Settings Panel -->
    <div v-show="isPdfSettingsOpen(category.id)" class="space-y-4 border-2 p-4 rounded transition-all duration-300 text-xs border-gray-200 bg-gray-50"
    >
      <!-- Active Mode Indicator -->
      <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
        <span class="material-symbols-outlined text-base text-blue-600">crop_portrait</span>
        <span class="text-[11px] font-bold uppercase tracking-wider text-blue-600">
          ↕ Configurações Verticais (Retrato)
        </span>
      </div>

      <!-- Density selection tabs -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b pb-2 pt-1 border-gray-200">
        <div class="flex flex-wrap gap-1.5">
          <button
            type="button"
            @click="setEditDensity(category.id, 'geral')"
            class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 border-0"
            :class="getEditDensity(category.id) === 'geral'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-gray-300 hover:bg-gray-50'"
          >
            Configurações Gerais
          </button>
          <button
            type="button"
            @click="setEditDensity(category.id, '6')"
            class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 border-0"
            :class="getEditDensity(category.id) === '6'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-gray-300 hover:bg-gray-50'"
          >
            1 por Página (Grande)
          </button>
          <button
            type="button"
            @click="setEditDensity(category.id, '3')"
            class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 border-0"
            :class="getEditDensity(category.id) === '3'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-gray-300 hover:bg-gray-50'"
          >
            2 por Página (Médio)
          </button>
          <button
            type="button"
            @click="setEditDensity(category.id, '1')"
            class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 border-0"
            :class="getEditDensity(category.id) === '1'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-gray-300 hover:bg-gray-50'"
          >
            6 por Página (Pequeno)
          </button>
        </div>
        
        <!-- Apply density to global button -->
        <button
          v-if="getEditDensity(category.id) !== 'geral'"
          type="button"
          @click="applyDensityToGlobal(category)"
          class="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 hover:text-emerald-800 transition-all flex items-center gap-1 shadow-sm shrink-0"
        >
          <span class="material-symbols-outlined text-xs">public</span>
          Tornar Padrão Global
        </button>
      </div>

      <!-- Settings Grid sections -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminPdfTitleSettings 
          :target="getDensityTarget(category)" 
          :category="category" 
          :density="getEditDensity(category.id)"
          :getGlobalValue="getGlobalValue"
          :translateValue="translateValue"
          @replicate-section="handleReplicateSection"
        />

        <AdminPdfCoverSettings 
          :target="getDensityTarget(category)" 
          :category="category" 
          :density="getEditDensity(category.id)"
          :getGlobalValue="getGlobalValue"
          :translateValue="translateValue"
          @replicate-section="handleReplicateSection"
        />

        <AdminPdfLogoSettings 
          :target="getDensityTarget(category)" 
          :category="category" 
          :density="getEditDensity(category.id)"
          :getGlobalValue="getGlobalValue"
          :translateValue="translateValue"
          @replicate-section="handleReplicateSection"
        />

        <AdminPdfLayoutSettings 
          :target="getDensityTarget(category)" 
          :category="category" 
          :density="getEditDensity(category.id)"
          :getGlobalValue="getGlobalValue"
          :translateValue="translateValue"
          @replicate-section="handleReplicateSection"
        />

        <AdminPdfCardSettings 
          :target="getDensityTarget(category)" 
          :category="category" 
          :density="getEditDensity(category.id)"
          :getGlobalValue="getGlobalValue"
          :translateValue="translateValue"
          @replicate-section="handleReplicateSection"
        />

        <AdminPdfSpecsSettings 
          :target="getDensityTarget(category)" 
          :category="category" 
          :density="getEditDensity(category.id)"
          :getGlobalValue="getGlobalValue"
          :translateValue="translateValue"
          @replicate-section="handleReplicateSection"
        />
      </div>

      <!-- Text Font styles grid -->
      <AdminPdfFontStylesSettings 
        :target="getDensityTarget(category)" 
        :category="category" 
        :density="getEditDensity(category.id)"
        :getGlobalValue="getGlobalValue"
        :translateValue="translateValue"
        @replicate-section="handleReplicateSection"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminCategorySettings } from '../composables/useAdminCategorySettings'

const props = defineProps<{
  category: any
}>()

const emit = defineEmits<{
  (e: 'replicate-section', data: { fields: string[], density: string }): void
}>()

const handleReplicateSection = (fields: string[]) => {
  const density = getEditDensity(props.category.id)
  console.log('🟡 [AdminCategoryPdfSettings] Received replicate-section event from child, forwarding:', {
    fields,
    density,
    categoryId: props.category.id
  })
  emit('replicate-section', { fields, density })
}

const {
  isPdfSettingsOpen,
  isPdfMenuOpen,
  togglePdfMenuOpen,
  openPdfPanel,
  closePdfPanel,
  getEditDensity,
  setEditDensity,
  getGlobalValue,
  getDensityTarget,
  translateValue,
  applyDensityToGlobal
} = useAdminCategorySettings()
</script>
