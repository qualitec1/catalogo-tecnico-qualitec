<template>
  <section aria-label="Filtros" class="wm-card p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 items-end">
      <div class="sm:col-span-2 lg:col-span-4 xl:col-span-2">
        <label class="wm-label" for="wm-filter-search">Busca livre</label>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] wm-muted">search</span>
          <input
            id="wm-filter-search"
            v-model="filters.search"
            type="search"
            class="wm-input pl-9"
            placeholder="Pedido ITK, pedido cliente, produto ou part number"
          >
        </div>
      </div>

      <div>
        <label class="wm-label" for="wm-filter-region">Região</label>
        <select id="wm-filter-region" v-model="filters.region" class="wm-input">
          <option value="">Todas</option>
          <option v-for="r in WM_REGIONS" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <div>
        <label class="wm-label" for="wm-filter-branch">Filial</label>
        <select id="wm-filter-branch" v-model="filters.branch" class="wm-input">
          <option value="">Todas</option>
          <option v-for="b in branchOptions" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>

      <div>
        <label class="wm-label" for="wm-filter-status">Status</label>
        <select id="wm-filter-status" v-model="filters.status" class="wm-input">
          <option value="">Todos</option>
          <option v-for="s in WM_BILLING_STATUSES" :key="s" :value="s">{{ billingStatusLabel(s) }}</option>
        </select>
      </div>

      <div>
        <label class="wm-label" for="wm-filter-origin">Origem</label>
        <select id="wm-filter-origin" v-model="filters.origin" class="wm-input">
          <option value="">Todas</option>
          <option v-for="o in WM_ORIGINS" :key="o" :value="o">{{ o }}</option>
        </select>
      </div>

      <div>
        <label class="wm-label" for="wm-filter-sort">Ordenação</label>
        <select id="wm-filter-sort" v-model="filters.sort" class="wm-input">
          <option value="oldest">Mais antigos primeiro</option>
          <option value="newest">Mais recentes primeiro</option>
          <option value="pending_desc">Maior valor pendente</option>
        </select>
      </div>

      <div class="flex gap-2">
        <div class="flex-1 min-w-0">
          <label class="wm-label" for="wm-filter-from">De</label>
          <input id="wm-filter-from" v-model="filters.dateFrom" type="date" class="wm-input px-2">
        </div>
        <div class="flex-1 min-w-0">
          <label class="wm-label" for="wm-filter-to">Até</label>
          <input id="wm-filter-to" v-model="filters.dateTo" type="date" class="wm-input px-2">
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[var(--wm-border)]">
      <p class="text-xs wm-muted">
        <strong class="wm-accent">{{ resultCount }}</strong> {{ resultLabel }} encontrados
      </p>
      <button
        id="wm-filter-reset"
        type="button"
        class="wm-btn wm-btn--ghost text-xs"
        :disabled="!hasActiveFilters"
        @click="emit('reset')"
      >
        <span class="material-symbols-outlined text-[16px]">filter_alt_off</span>
        Limpar filtros
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { WM_BILLING_STATUSES, WM_ORIGINS, WM_REGIONS } from '../../shared/types/wmPendingOrders'
import type { WmFilters } from '../composables/useWmPendingOrders'
import { billingStatusLabel } from '../utils/wmPendingFormat'

defineProps<{
  filters: WmFilters
  branchOptions: string[]
  resultCount: number
  resultLabel: string
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{ reset: [] }>()
</script>
