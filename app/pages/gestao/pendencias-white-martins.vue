<template>
  <div :class="['wm-root', isDarkMode ? 'wm-theme-dark' : 'wm-theme-light']">
    <!-- Cabeçalho Executivo do Painel -->
    <header class="border-b border-[var(--wm-border)] bg-[var(--wm-surface)]/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div class="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <!-- Marca e Título -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <span class="material-symbols-outlined text-[22px]">analytics</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="wm-heading text-base sm:text-lg font-bold text-[var(--wm-text)] leading-tight">
                White Martins — Gestão de Pendências
              </h1>
              <span class="wm-badge wm-badge--info text-[10px]">ITKSoft</span>
            </div>
            <p class="text-xs wm-muted mt-0.5">
              Qualitec Industrial &bull; Acompanhamento de Pedidos e Itens em Aberto
              <span v-if="syncedAt" class="hidden sm:inline">
                &bull; Sincronizado em {{ formatIsoDate(syncedAt) }}
              </span>
            </p>
          </div>
        </div>

        <!-- Ações do Cabeçalho -->
        <div class="flex items-center gap-2">
          <!-- Botão Atualizar -->
          <button
            type="button"
            class="wm-btn wm-btn--ghost text-xs py-1.5 px-3"
            :disabled="loading"
            title="Recarregar dados"
            @click="load"
          >
            <span class="material-symbols-outlined text-[16px]" :class="{ 'animate-spin': loading }">
              refresh
            </span>
            <span class="hidden sm:inline">Atualizar</span>
          </button>

          <!-- Toggle Dark / Light Mode -->
          <button
            type="button"
            class="wm-btn wm-btn--ghost text-xs py-1.5 px-2.5"
            :title="isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'"
            @click="toggleTheme"
          >
            <span class="material-symbols-outlined text-[18px]">
              {{ isDarkMode ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>

          <!-- Voltar ao Painel Admin -->
          <NuxtLink
            to="/admin-secreto-x9f2"
            class="wm-btn wm-btn--ghost text-xs py-1.5 px-3 no-underline"
          >
            <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span class="hidden md:inline">Painel Admin</span>
          </NuxtLink>

          <!-- Exportar Dados -->
          <WmExportButton :orders="filteredOrders" :disabled="loading || filteredOrders.length === 0" />
        </div>
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <main class="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Alerta de Erro -->
      <div
        v-if="errorMessage"
        class="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-between text-xs"
      >
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">error</span>
          <span>{{ errorMessage }}</span>
        </div>
        <button type="button" class="underline font-bold" @click="load">Tentar novamente</button>
      </div>

      <!-- Estado de Carregamento -->
      <div v-if="loading && orders.length === 0" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <div v-for="i in 6" :key="i" class="h-28 wm-card wm-skeleton" />
        </div>
        <div class="h-24 wm-card wm-skeleton" />
        <div class="h-96 wm-card wm-skeleton" />
      </div>

      <template v-else>
        <!-- Cards de Indicadores (KPIs) -->
        <WmKpiCards :kpis="kpis" />

        <!-- Barra de Filtros Interativos -->
        <WmFiltersBar
          :filters="filters"
          :branch-options="branchOptions"
          :result-count="activeTab === 'pedidos' ? filteredOrders.length : rankedItems.length"
          :result-label="activeTab === 'pedidos' ? (filteredOrders.length === 1 ? 'pedido' : 'pedidos') : (rankedItems.length === 1 ? 'item' : 'itens')"
          :has-active-filters="hasActiveFilters"
          @reset="resetFilters"
        />

        <!-- Navegação de Abas -->
        <div class="flex items-center justify-between border-b border-[var(--wm-border)] pb-2">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="wm-tab"
              :class="{ 'wm-tab--active': activeTab === 'pedidos' }"
              @click="activeTab = 'pedidos'"
            >
              <span class="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Pedidos Pendentes</span>
              <span class="wm-badge wm-badge--neutral text-[10px]">
                {{ filteredOrders.length }}
              </span>
            </button>

            <button
              type="button"
              class="wm-tab"
              :class="{ 'wm-tab--active': activeTab === 'ranking' }"
              @click="activeTab = 'ranking'"
            >
              <span class="material-symbols-outlined text-[18px]">leaderboard</span>
              <span>Itens Mais Caros</span>
              <span class="wm-badge wm-badge--neutral text-[10px]">
                {{ rankedItems.length }}
              </span>
            </button>
          </div>

          <div class="text-xs wm-muted hidden sm:block">
            Mostrando resultados conforme os filtros aplicados
          </div>
        </div>

        <!-- Visualização da Aba Ativa -->
        <div v-show="activeTab === 'pedidos'">
          <WmOrdersTable :orders="filteredOrders" />
        </div>

        <div v-show="activeTab === 'ranking'">
          <WmRankingTable
            :items="rankedItems"
            :mode="rankingMode"
            @update:mode="rankingMode = $event"
          />
        </div>
      </template>
    </main>

    <!-- Rodapé -->
    <footer class="border-t border-[var(--wm-border)] py-6 text-center text-xs wm-muted">
      Qualitec Industrial &copy; {{ new Date().getFullYear() }} &bull; Painel Interno de Gestão White Martins
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useWmPendingOrders } from '../../composables/useWmPendingOrders'
import { formatIsoDate } from '../../utils/wmPendingFormat'
import WmExportButton from '../../components/WmExportButton.vue'
import WmFiltersBar from '../../components/WmFiltersBar.vue'
import WmKpiCards from '../../components/WmKpiCards.vue'
import WmOrdersTable from '../../components/WmOrdersTable.vue'
import WmRankingTable from '../../components/WmRankingTable.vue'
import '../../assets/css/wmDashboard.css'

definePageMeta({
  layout: false,
  middleware: ['admin']
})

useHead({
  title: 'White Martins — Gestão de Pedidos Pendentes | Qualitec Industrial',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
  ]
})

const activeTab = ref<'pedidos' | 'ranking'>('pedidos')
const isDarkMode = ref(true)

const {
  orders,
  syncedAt,
  loading,
  errorMessage,
  filters,
  rankingMode,
  branchOptions,
  filteredOrders,
  kpis,
  rankedItems,
  hasActiveFilters,
  load,
  resetFilters
} = useWmPendingOrders()

function toggleTheme(): void {
  isDarkMode.value = !isDarkMode.value
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('wm_theme', isDarkMode.value ? 'dark' : 'light')
  }
}

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('wm_theme')
    if (saved) isDarkMode.value = saved === 'dark'
  }
  load()
})
</script>
