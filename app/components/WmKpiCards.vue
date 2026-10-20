<template>
  <section aria-label="Indicadores" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3.5">
    <article
      v-for="(card, idx) in cards"
      :key="card.id"
      class="wm-card wm-kpi p-4 flex flex-col justify-between gap-3 relative transition-all duration-200"
      :class="{
        'cursor-pointer hover:border-amber-500': card.clickable,
        'ring-2 ring-amber-500 border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20': card.id === 'generic' && onlyGeneric
      }"
      :style="{ animationDelay: `${idx * 45}ms` }"
      @click="card.clickable ? emit('toggle-generic') : null"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="flex flex-col">
          <span class="text-[11px] font-semibold uppercase tracking-wider wm-muted leading-tight">{{ card.label }}</span>
          <span
            v-if="card.id === 'generic'"
            class="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full w-fit"
            :class="onlyGeneric ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'"
          >
            {{ onlyGeneric ? 'Filtro Ativo (Clique p/ Limpar)' : 'Clique p/ Filtrar' }}
          </span>
        </div>
        <span class="wm-kpi-icon shrink-0" :style="{ background: card.gradient, color: card.glow }">
          <span class="material-symbols-outlined text-[20px] text-white">{{ card.icon }}</span>
        </span>
      </div>
      <div>
        <p class="wm-heading text-lg xl:text-xl font-bold leading-tight">{{ card.value }}</p>
        <p class="text-xs wm-muted mt-1 leading-snug">{{ card.hint }}</p>
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

const props = defineProps<{
  kpis: WmKpis
  onlyGeneric?: boolean
}>()

const emit = defineEmits<{
  'toggle-generic': []
}>()

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
      id: 'generic', label: 'Itens Genéricos / Requer Atenção', icon: 'warning',
      value: `${plural(k.generic?.ordersCount ?? 0, 'pedido', 'pedidos')} (${k.generic?.itemsCount ?? 0} itens)`,
      hint: `${formatBRL(k.generic?.value ?? 0)} pendentes com customização manual`,
      gradient: 'linear-gradient(135deg,#f59e0b,#ea580c)', glow: '#f59e0b',
      clickable: true
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
