<template>
  <div class="wm-card overflow-hidden">
    <!-- Barra superior do Ranking -->
    <div class="p-3 sm:p-4 border-b border-[var(--wm-border)] flex flex-wrap items-center justify-between gap-3 bg-[var(--wm-surface-2)]">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px] text-amber-500">leaderboard</span>
        <h3 class="font-bold text-sm text-[var(--wm-text)]">
          Ranking dos Itens Mais Caros (Saldo Pendente)
        </h3>
        <span class="wm-badge wm-badge--neutral">
          {{ items.length }} {{ items.length === 1 ? 'item pendente' : 'itens pendentes' }}
        </span>
      </div>

      <!-- Critério de ordenação do Ranking -->
      <div class="flex items-center gap-3 text-xs">
        <span class="wm-muted">Ordenar ranking por:</span>
        <div class="inline-flex rounded-lg border border-[var(--wm-border)] bg-[var(--wm-surface)] p-0.5">
          <button
            type="button"
            class="px-2.5 py-1 rounded-md text-xs font-semibold transition-colors"
            :class="mode === 'total' ? 'bg-[var(--wm-accent)] text-white' : 'text-[var(--wm-muted)] hover:text-[var(--wm-text)]'"
            @click="emit('update:mode', 'total')"
          >
            Valor Total Pendente
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-md text-xs font-semibold transition-colors"
            :class="mode === 'unit' ? 'bg-[var(--wm-accent)] text-white' : 'text-[var(--wm-muted)] hover:text-[var(--wm-text)]'"
            @click="emit('update:mode', 'unit')"
          >
            Preço Unitário
          </button>
        </div>

        <label class="flex items-center gap-1.5 wm-muted ml-2">
          <span>Exibir:</span>
          <select v-model="pageSize" class="wm-input text-xs py-1 px-2 w-auto">
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
            <option :value="300">Todos ({{ items.length }})</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Tabela de Ranking -->
    <div class="overflow-x-auto">
      <table class="wm-table">
        <thead>
          <tr>
            <th class="w-16 text-center">Posição</th>
            <th class="w-36">Part Number</th>
            <th class="w-24">Código</th>
            <th class="min-w-[280px]">Descrição do Produto</th>
            <th class="w-24 text-center">Origem</th>
            <th class="min-w-[150px]">Filial / Região</th>
            <th class="w-24">Pedido ITK</th>
            <th class="w-28">Ped. Cliente</th>
            <th class="w-28 wm-num">Qtd Pendente</th>
            <th class="w-32 wm-num" :class="{ 'font-black text-[var(--wm-accent)]': mode === 'unit' }">
              Preço Unitário
            </th>
            <th class="w-36 wm-num" :class="{ 'font-black text-[var(--wm-accent)]': mode === 'total' }">
              Valor Total Pendente
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in pagedItems"
            :key="row.key"
            class="hover:bg-[var(--wm-surface-2)]/60 transition-colors"
          >
            <!-- Posição com destaque para Top 3 -->
            <td class="text-center">
              <span
                class="inline-flex items-center justify-center font-bold font-mono text-xs w-7 h-7 rounded-full"
                :class="rankBadgeClass((currentPage - 1) * pageSize + idx + 1)"
              >
                #{{ (currentPage - 1) * pageSize + idx + 1 }}
              </span>
            </td>

            <!-- Part Number -->
            <td class="font-mono text-xs font-bold text-[var(--wm-text)]">
              {{ row.item.partNumber || '—' }}
            </td>

            <!-- Código ITK -->
            <td class="font-mono text-[11px] wm-muted">
              {{ row.item.productCode }}
            </td>

            <!-- Descrição -->
            <td>
              <div class="font-medium text-xs text-[var(--wm-text)] max-w-md leading-tight">
                {{ row.item.description }}
              </div>
            </td>

            <!-- Origem -->
            <td class="text-center">
              <span :class="originClass(row.item.origin)">
                {{ row.item.origin }}
              </span>
            </td>

            <!-- Filial / Região -->
            <td>
              <div class="text-xs font-semibold text-[var(--wm-text)]">{{ row.order.branch }}</div>
              <div class="text-[10px] wm-muted">{{ row.order.region }}</div>
            </td>

            <!-- Pedido ITK -->
            <td>
              <span class="font-mono font-bold text-xs text-[var(--wm-accent)]">
                {{ row.order.itkCode }}
              </span>
            </td>

            <!-- Pedido Cliente -->
            <td>
              <span class="font-mono text-xs wm-muted">
                {{ row.order.clientOrder || '—' }}
              </span>
            </td>

            <!-- Qtd Pendente -->
            <td class="wm-num font-mono text-xs font-bold text-[var(--wm-danger)]">
              {{ formatQty(row.item.qtyPending) }}
              <span class="text-[10px] font-normal wm-muted ml-0.5">{{ row.item.unit || 'UN' }}</span>
            </td>

            <!-- Preço Unitário -->
            <td class="wm-num font-mono text-xs" :class="mode === 'unit' ? 'font-bold text-[var(--wm-accent)]' : 'wm-muted'">
              {{ formatBRL(row.item.unitPrice) }}
            </td>

            <!-- Valor Total Pendente -->
            <td class="wm-num font-mono text-xs font-bold" :class="mode === 'total' ? 'text-[var(--wm-accent)] text-sm' : 'text-[var(--wm-text)]'">
              {{ formatBRL(row.item.totalPending) }}
            </td>
          </tr>

          <!-- Estado Vazio -->
          <tr v-if="items.length === 0">
            <td colspan="11" class="py-12 text-center wm-muted">
              <span class="material-symbols-outlined text-4xl block mb-2 opacity-50">leaderboard</span>
              <p class="font-semibold text-sm">Nenhum item pendente encontrado com os filtros atuais.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação do Ranking -->
    <div
      v-if="totalPages > 1"
      class="p-3 border-t border-[var(--wm-border)] flex items-center justify-between text-xs bg-[var(--wm-surface-2)]"
    >
      <div class="wm-muted">
        Exibindo {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize, items.length) }} de {{ items.length }} itens pendentes
      </div>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="wm-btn wm-btn--ghost py-1 px-2 text-xs"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Anterior
        </button>
        <span class="px-2 font-mono font-semibold text-[var(--wm-text)]">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          type="button"
          class="wm-btn wm-btn--ghost py-1 px-2 text-xs"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Próxima
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { WmRankingMode, WmRankedItem } from '../composables/useWmPendingOrders'
import { formatBRL, formatQty, originClass } from '../utils/wmPendingFormat'

const props = defineProps<{
  items: WmRankedItem[]
  mode: WmRankingMode
}>()

const emit = defineEmits<{
  'update:mode': [mode: WmRankingMode]
}>()

const pageSize = ref(50)
const currentPage = ref(1)

watch(() => props.items, () => {
  currentPage.value = 1
})

const totalPages = computed(() => Math.ceil(props.items.length / pageSize.value) || 1)

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.items.slice(start, start + pageSize.value)
})

function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-amber-400 text-slate-900 shadow-sm'
  if (rank === 2) return 'bg-slate-300 text-slate-900 shadow-sm'
  if (rank === 3) return 'bg-amber-700 text-white shadow-sm'
  return 'bg-[var(--wm-surface-3)] text-[var(--wm-muted)]'
}
</script>
