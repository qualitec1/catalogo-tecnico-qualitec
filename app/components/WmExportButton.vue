<template>
  <div class="relative inline-block text-left" ref="containerRef">
    <button
      type="button"
      class="wm-btn wm-btn--primary shadow-sm"
      :disabled="disabled || isExporting"
      @click="isOpen = !isOpen"
    >
      <span class="material-symbols-outlined text-[18px]">
        {{ isExporting ? 'hourglass_top' : 'download' }}
      </span>
      <span>Exportar</span>
      <span class="material-symbols-outlined text-[16px] transition-transform" :class="{ 'rotate-180': isOpen }">
        arrow_drop_down
      </span>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-[var(--wm-border)] bg-[var(--wm-surface)] p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        type="button"
        class="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--wm-surface-2)] text-[var(--wm-text)] flex items-center gap-2.5 transition-colors border-0 cursor-pointer"
        @click="handleExport('xls')"
      >
        <span class="material-symbols-outlined text-emerald-500 text-[20px]">table_view</span>
        <div>
          <div class="font-bold">Planilha Excel (.xls)</div>
          <div class="text-[10px] wm-muted">Formatado com estilos e colunas</div>
        </div>
      </button>

      <button
        type="button"
        class="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--wm-surface-2)] text-[var(--wm-text)] flex items-center gap-2.5 transition-colors border-0 cursor-pointer"
        @click="handleExport('csv')"
      >
        <span class="material-symbols-outlined text-blue-500 text-[20px]">description</span>
        <div>
          <div class="font-bold">Arquivo CSV (.csv)</div>
          <div class="text-[10px] wm-muted">Padrão Excel pt-BR (ponto e vírgula)</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { WmOrderView } from '../composables/useWmPendingOrders'
import { downloadTable, type ExportFormat } from '../utils/tableExport'
import { wmExportColumns, type WmExportRow } from '../utils/wmPendingExportColumns'

const props = defineProps<{
  orders: WmOrderView[]
  disabled?: boolean
}>()

const isOpen = ref(false)
const isExporting = ref(false)
const containerRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent): void {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
})

function handleExport(format: ExportFormat): void {
  isOpen.value = false
  isExporting.value = true

  try {
    const rows: WmExportRow[] = []
    for (const order of props.orders) {
      for (const item of order.items) {
        rows.push({ order, item })
      }
    }

    const todayStr = new Date().toISOString().slice(0, 10)
    const fileName = `pendencias_white_martins_${todayStr}`
    downloadTable(wmExportColumns, rows, format, fileName)
  } catch (err) {
    console.error('Falha ao exportar:', err)
  } finally {
    isExporting.value = false
  }
}
</script>
