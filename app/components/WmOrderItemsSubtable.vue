<template>
  <div class="p-3 bg-[var(--wm-surface-2)] border-t border-[var(--wm-border)]">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-[var(--wm-accent)]">inventory_2</span>
        <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--wm-text)]">
          Itens do Pedido ({{ items.length }})
        </h4>
      </div>
      <div class="text-[11px] wm-muted flex items-center gap-3">
        <span>Itens Pendentes: <strong class="text-[var(--wm-warning)]">{{ pendingItemsCount }}</strong></span>
        <span>Saldo Pendente: <strong class="text-[var(--wm-accent)]">{{ formatBRL(totalPendingSum) }}</strong></span>
      </div>
    </div>

    <div class="overflow-x-auto rounded-lg border border-[var(--wm-border)] bg-[var(--wm-surface)]">
      <table class="wm-table wm-subtable">
        <thead>
          <tr>
            <th class="w-12 text-center">Seq</th>
            <th>Part Number</th>
            <th>Código</th>
            <th>Descrição do Produto</th>
            <th class="text-center">Origem</th>
            <th class="text-center">UN</th>
            <th class="wm-num">Qtd Pedida</th>
            <th class="wm-num">Qtd Faturada</th>
            <th class="wm-num">Qtd Pendente</th>
            <th class="wm-num">Preço Unitário</th>
            <th class="wm-num">Valor Pendente</th>
            <th class="text-center">Documentos</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.seq"
            :class="item.qtyPending > 0 ? 'bg-transparent' : 'opacity-60 bg-[var(--wm-surface-2)]/50'"
          >
            <td class="text-center font-mono text-[11px] wm-muted">{{ item.seq }}</td>
            <td class="font-mono text-xs font-semibold text-[var(--wm-text)]">
              {{ item.partNumber || '—' }}
            </td>
            <td class="font-mono text-[11px] wm-muted">{{ item.productCode }}</td>
            <td>
              <div class="font-medium text-xs text-[var(--wm-text)] leading-tight">{{ item.description }}</div>
              <div v-if="item.clientOrderItem" class="text-[10px] wm-muted mt-0.5">
                Item Ped. Cliente: #{{ item.clientOrderItem }}
              </div>
            </td>
            <td class="text-center">
              <span :class="originClass(item.origin)">
                {{ item.origin }}
              </span>
            </td>
            <td class="text-center font-mono text-[11px] wm-muted">{{ item.unit || 'UN' }}</td>
            <td class="wm-num font-mono">{{ formatQty(item.qtyOrdered) }}</td>
            <td class="wm-num font-mono text-emerald-600 dark:text-emerald-400">
              {{ formatQty(item.qtyInvoiced) }}
            </td>
            <td class="wm-num font-mono font-bold" :class="item.qtyPending > 0 ? 'text-[var(--wm-danger)]' : 'wm-muted'">
              {{ formatQty(item.qtyPending) }}
            </td>
            <td class="wm-num font-mono">{{ formatBRL(item.unitPrice) }}</td>
            <td class="wm-num font-mono font-bold" :class="item.totalPending > 0 ? 'text-[var(--wm-accent)]' : 'wm-muted'">
              {{ formatBRL(item.totalPending) }}
            </td>
            <td class="text-center text-[10px] wm-muted font-mono whitespace-nowrap">
              <span v-if="item.invoiceNumber" class="wm-badge wm-badge--neutral mr-1" title="Nota Fiscal Emitida">
                NF {{ item.invoiceNumber }}
              </span>
              <span v-if="item.preInvoice" class="wm-badge wm-badge--warning" title="Pré-Nota">
                PN {{ item.preInvoice }}
              </span>
              <span v-if="!item.invoiceNumber && !item.preInvoice">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WmPendingItem } from '../types/wmPendingOrders'
import { formatBRL, formatQty, originClass } from '../utils/wmPendingFormat'

const props = defineProps<{
  items: WmPendingItem[]
}>()

const pendingItemsCount = computed(() => props.items.filter((i) => i.qtyPending > 0).length)
const totalPendingSum = computed(() => props.items.reduce((acc, i) => acc + i.totalPending, 0))
</script>
