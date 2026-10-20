<template>
  <div class="wm-card overflow-hidden">
    <!-- Barra superior da tabela: contadores e paginação -->
    <div class="p-3 sm:p-4 border-b border-[var(--wm-border)] flex flex-wrap items-center justify-between gap-3 bg-[var(--wm-surface-2)]">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px] text-[var(--wm-accent)]">list_alt</span>
        <h3 class="font-bold text-sm text-[var(--wm-text)]">
          Listagem de Pedidos Pendentes
        </h3>
        <span class="wm-badge wm-badge--neutral">
          {{ orders.length }} {{ orders.length === 1 ? 'pedido' : 'pedidos' }}
        </span>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <button
          type="button"
          class="wm-btn wm-btn--ghost text-xs py-1 px-2.5"
          @click="toggleExpandAll"
        >
          <span class="material-symbols-outlined text-[16px]">
            {{ allExpanded ? 'unfold_less' : 'unfold_more' }}
          </span>
          {{ allExpanded ? 'Recolher Todos' : 'Expandir Todos' }}
        </button>

        <label class="flex items-center gap-1.5 wm-muted ml-2">
          <span>Exibir:</span>
          <select v-model="pageSize" class="wm-input text-xs py-1 px-2 w-auto">
            <option :value="15">15</option>
            <option :value="30">30</option>
            <option :value="50">50</option>
            <option :value="150">Todos ({{ orders.length }})</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Tabela responsiva com rolagem horizontal se necessário -->
    <div class="overflow-x-auto">
      <table class="wm-table">
        <thead>
          <tr>
            <th class="w-10 text-center">#</th>
            <th class="w-14 text-center">Itens</th>
            <th class="min-w-[150px]">Região / Filial</th>
            <th class="w-24">Pedido ITK</th>
            <th class="w-28">Pedido Cliente</th>
            <th class="w-24">Emissão</th>
            <th class="w-24 text-center">Dias Aberto</th>
            <th class="w-28 wm-num">Valor Total</th>
            <th class="w-32 wm-num">Faturado</th>
            <th class="w-32 wm-num">Pendente</th>
            <th class="w-36 text-center">Status Faturamento</th>
            <th class="min-w-[280px]">Status Logístico</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="order in pagedOrders" :key="order.itkCode">
            <tr
              class="wm-row"
              :class="{ 'wm-row--open': expandedKeys.has(order.itkCode) }"
              @click="toggleRow(order.itkCode)"
            >
              <!-- Botão Expansão -->
              <td class="text-center" @click.stop="toggleRow(order.itkCode)">
                <button
                  type="button"
                  class="p-1 rounded hover:bg-[var(--wm-surface-3)] text-[var(--wm-text)] transition-transform duration-200"
                  :title="expandedKeys.has(order.itkCode) ? 'Recolher itens' : 'Ver itens do pedido'"
                >
                  <span class="material-symbols-outlined text-[18px]">
                    {{ expandedKeys.has(order.itkCode) ? 'expand_more' : 'chevron_right' }}
                  </span>
                </button>
              </td>

              <!-- Qtd Itens -->
              <td class="text-center font-mono text-xs wm-muted">
                <span class="wm-badge wm-badge--neutral text-[10px]">
                  {{ order.items.length }}
                </span>
              </td>

              <!-- Região / Filial -->
              <td>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-bold text-xs text-[var(--wm-text)]">{{ order.branch }}</span>
                  <span
                    v-if="hasGeneric(order)"
                    class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    title="Pedido contém item genérico com customização manual do vendedor"
                  >
                    <span class="material-symbols-outlined text-[11px]">warning</span>
                    Genérico
                  </span>
                </div>
                <div class="text-[11px] wm-muted flex items-center gap-1.5 mt-0.5">
                  <span class="font-medium">{{ order.region }}</span>
                  <span v-if="order.state" class="font-mono text-[10px] px-1 rounded bg-[var(--wm-surface-3)]">
                    {{ order.state }}
                  </span>
                </div>
              </td>

              <!-- Pedido ITK -->
              <td>
                <span class="font-mono font-bold text-xs text-[var(--wm-accent)]">
                  {{ order.itkCode }}
                </span>
              </td>

              <!-- Pedido Cliente -->
              <td>
                <span class="font-mono text-xs font-semibold text-[var(--wm-text)]">
                  {{ order.clientOrder || '—' }}
                </span>
              </td>

              <!-- Emissão -->
              <td class="font-mono text-xs wm-muted">
                {{ formatIsoDate(order.issuedAt) }}
              </td>

              <!-- Dias em Aberto -->
              <td class="text-center">
                <span :class="agingClass(order.daysOpen)" class="font-mono text-xs">
                  {{ order.daysOpen }} d
                </span>
              </td>

              <!-- Valor Total -->
              <td class="wm-num font-mono text-xs">
                {{ formatBRL(order.totalValue) }}
              </td>

              <!-- Valor Faturado + Barra -->
              <td class="wm-num font-mono text-xs">
                <div class="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {{ formatBRL(order.invoicedValue) }}
                </div>
                <div class="wm-progress mt-1" :title="`${invoicedPercent(order.totalValue, order.invoicedValue)}% faturado`">
                  <span :style="{ width: `${invoicedPercent(order.totalValue, order.invoicedValue)}%` }" />
                </div>
              </td>

              <!-- Valor Pendente -->
              <td class="wm-num font-mono text-xs font-bold text-[var(--wm-accent)]">
                {{ formatBRL(order.pendingValue) }}
              </td>

              <!-- Status Faturamento -->
              <td class="text-center">
                <span :class="billingStatusClass(order.billingStatus)">
                  {{ billingStatusLabel(order.billingStatus) }}
                </span>
              </td>

              <!-- Status Logístico -->
              <td class="text-xs">
                <div v-if="order.logisticsStatus" class="flex flex-wrap gap-1.5 min-w-[260px]">
                  <span
                    v-for="(part, pIdx) in splitLogistics(order.logisticsStatus)"
                    :key="pIdx"
                    class="wm-badge wm-badge--neutral text-[10px] font-mono"
                  >
                    {{ part }}
                  </span>
                </div>
                <span v-else class="wm-muted text-[11px]">—</span>
              </td>
            </tr>

            <!-- Linha Sanfona com Subtabela de Itens -->
            <tr v-if="expandedKeys.has(order.itkCode)" :key="`sub-${order.itkCode}`">
              <td colspan="12" class="p-0 border-b border-[var(--wm-border)]">
                <WmOrderItemsSubtable :items="order.items" />
              </td>
            </tr>
          </template>

          <!-- Estado Vazio -->
          <tr v-if="orders.length === 0">
            <td colspan="12" class="py-12 text-center wm-muted">
              <span class="material-symbols-outlined text-4xl block mb-2 opacity-50">search_off</span>
              <p class="font-semibold text-sm">Nenhum pedido encontrado para os filtros selecionados.</p>
              <p class="text-xs mt-1">Tente ajustar a busca livre ou limpar os filtros aplicados.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação Inferior -->
    <div
      v-if="totalPages > 1"
      class="p-3 border-t border-[var(--wm-border)] flex items-center justify-between text-xs bg-[var(--wm-surface-2)]"
    >
      <div class="wm-muted">
        Exibindo {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize, orders.length) }} de {{ orders.length }} pedidos
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
import { isGenericItem, type WmOrderView } from '../composables/useWmPendingOrders'
import {
  agingClass,
  billingStatusClass,
  billingStatusLabel,
  formatBRL,
  formatIsoDate,
  invoicedPercent
} from '../utils/wmPendingFormat'
import WmOrderItemsSubtable from './WmOrderItemsSubtable.vue'

const props = defineProps<{ orders: WmOrderView[] }>()
const pageSize = ref(30)
const currentPage = ref(1)
const expandedKeys = ref<Set<string>>(new Set())

watch(() => props.orders, () => { currentPage.value = 1 })

const totalPages = computed(() => Math.ceil(props.orders.length / pageSize.value) || 1)
const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.orders.slice(start, start + pageSize.value)
})

const allExpanded = computed(() =>
  pagedOrders.value.length > 0 && pagedOrders.value.every((o) => expandedKeys.value.has(o.itkCode))
)

const hasGeneric = (order: WmOrderView) =>
  order.items.some((i) => (i.qtyPending > 0 || i.totalPending > 0) && isGenericItem(i))

function toggleRow(itkCode: string): void {
  const next = new Set(expandedKeys.value)
  if (next.has(itkCode)) next.delete(itkCode)
  else next.add(itkCode)
  expandedKeys.value = next
}

function toggleExpandAll(): void {
  const next = new Set(expandedKeys.value)
  if (allExpanded.value) pagedOrders.value.forEach((o) => next.delete(o.itkCode))
  else pagedOrders.value.forEach((o) => next.add(o.itkCode))
  expandedKeys.value = next
}

const splitLogistics = (str: string) => str.split('|').map((s) => s.trim()).filter(Boolean)
</script>
