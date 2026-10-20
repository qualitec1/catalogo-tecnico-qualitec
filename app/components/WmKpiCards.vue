<template>
  <section aria-label="Indicadores" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
    <article
      v-for="(card, idx) in cards"
      :key="card.id"
      class="wm-card wm-kpi p-4 flex flex-col gap-3"
      :style="{ animationDelay: `${idx * 60}ms` }"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-semibold uppercase tracking-wider wm-muted leading-tight">{{ card.label }}</span>
        <span class="wm-kpi-icon" :style="{ background: card.gradient, color: card.glow }">
          <span class="material-symbols-outlined text-[20px] text-white">{{ card.icon }}</span>
        </span>
      </div>
      <div>
        <p class="wm-heading text-xl font-bold leading-tight">{{ card.value }}</p>
        <p class="text-xs wm-muted mt-1">{{ card.hint }}</p>
      </div>
      <div v-if="card.share !== undefined" class="wm-progress" :title="`${card.share}% do valor pendente`">
        <span :style="{ width: `${card.share}%` }" />
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WmKpis } from '../composables/useWmPendingOrders'
import { formatBRL } from '../utils/wmPendingFormat'

const props = defineProps<{ kpis: WmKpis }>()

const share = (part: number) =>
  props.kpis.pendingTotal > 0 ? Math.round((part / props.kpis.pendingTotal) * 100) : 0

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const cards = computed(() => {
  const k = props.kpis
  return [
    {
      id: 'pending', label: 'Total pendente a faturar', icon: 'payments',
      value: formatBRL(k.pendingTotal), hint: 'Saldo em aberto dos pedidos filtrados',
      gradient: 'linear-gradient(135deg,#2563eb,#0ea5e9)', glow: '#2563eb'
    },
    {
      id: 'orders', label: 'Pedidos em aberto', icon: 'receipt_long',
      value: plural(k.openOrders, 'pedido', 'pedidos'), hint: `${k.preInvoice} com pré-nota gerada`,
      gradient: 'linear-gradient(135deg,#0f766e,#14b8a6)', glow: '#0f766e'
    },
    {
      id: 'full', label: '100% pendentes (sem NF)', icon: 'hourglass_top',
      value: plural(k.fullyPending, 'pedido', 'pedidos'), hint: 'Nenhuma quantidade faturada',
      gradient: 'linear-gradient(135deg,#dc2626,#f97316)', glow: '#dc2626'
    },
    {
      id: 'partial', label: 'Parcialmente faturados', icon: 'incomplete_circle',
      value: plural(k.partial, 'pedido', 'pedidos'), hint: 'Com saldo remanescente',
      gradient: 'linear-gradient(135deg,#d97706,#facc15)', glow: '#d97706'
    },
    {
      id: 'imported', label: 'Itens importados pendentes', icon: 'public',
      value: formatBRL(k.imported.value), hint: plural(k.imported.count, 'item', 'itens'),
      gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)', glow: '#7c3aed', share: share(k.imported.value)
    },
    {
      id: 'national', label: 'Itens nacionais pendentes', icon: 'flag',
      value: formatBRL(k.national.value), hint: plural(k.national.count, 'item', 'itens'),
      gradient: 'linear-gradient(135deg,#059669,#22c55e)', glow: '#059669', share: share(k.national.value)
    }
  ]
})
</script>
