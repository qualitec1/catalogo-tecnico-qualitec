<template>
  <div class="space-y-4">
    <!-- Mini Cards de Indicadores do Balanço -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <!-- Total Peças Faltantes -->
      <div class="wm-card p-4 flex items-center gap-3 bg-[var(--wm-surface-2)]">
        <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
          <span class="material-symbols-outlined text-[22px]">inventory_2</span>
        </div>
        <div>
          <div class="text-xs wm-muted font-medium">Peças Faltantes no Estoque</div>
          <div class="text-lg font-bold text-red-500 font-mono">
            {{ formatNumber(totalPecasFaltantes) }} un
          </div>
          <div class="text-[11px] wm-muted">Necessárias para quitar tudo</div>
        </div>
      </div>

      <!-- Produtos com Déficit -->
      <div class="wm-card p-4 flex items-center gap-3 bg-[var(--wm-surface-2)]">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <span class="material-symbols-outlined text-[22px]">warning</span>
        </div>
        <div>
          <div class="text-xs wm-muted font-medium">Produtos com Falta</div>
          <div class="text-lg font-bold text-amber-500 font-mono">
            {{ produtosComDeficit }} produtos
          </div>
          <div class="text-[11px] wm-muted">Requerem compra/produção</div>
        </div>
      </div>

      <!-- Produtos com Estoque OK -->
      <div class="wm-card p-4 flex items-center gap-3 bg-[var(--wm-surface-2)]">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <span class="material-symbols-outlined text-[22px]">check_circle</span>
        </div>
        <div>
          <div class="text-xs wm-muted font-medium">Estoque Suficiente</div>
          <div class="text-lg font-bold text-emerald-500 font-mono">
            {{ produtosComEstoqueOk }} produtos
          </div>
          <div class="text-[11px] wm-muted">Prontos para faturar/liberar</div>
        </div>
      </div>

      <!-- Valor Financeiro Represado -->
      <div class="wm-card p-4 flex items-center gap-3 bg-[var(--wm-surface-2)]">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <span class="material-symbols-outlined text-[22px]">attach_money</span>
        </div>
        <div>
          <div class="text-xs wm-muted font-medium">Valor em Aberto nos Produtos</div>
          <div class="text-lg font-bold text-[var(--wm-text)] font-mono">
            {{ formatCurrency(valorTotalPendente) }}
          </div>
          <div class="text-[11px] wm-muted">Total de pendências somadas</div>
        </div>
      </div>
    </div>

    <!-- Tabela Card Principal -->
    <div class="wm-card overflow-hidden">
      <!-- Barra Superior de Controle e Filtros -->
      <div class="p-3.5 sm:p-4 border-b border-[var(--wm-border)] flex flex-wrap items-center justify-between gap-3 bg-[var(--wm-surface-2)]">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-blue-500">balance</span>
          <h3 class="font-bold text-sm text-[var(--wm-text)]">
            Balanço por Produto — Demanda Somada vs. Estoque ITK
          </h3>
          <span class="wm-badge wm-badge--neutral text-[10px]">
            {{ sortedAndFilteredList.length }} produtos
          </span>
        </div>

        <!-- Controles: Filtro de Status + Busca + Exportar -->
        <div class="flex flex-wrap items-center gap-2.5 text-xs">
          <!-- Filtro de Situação -->
          <div class="inline-flex rounded-lg border border-[var(--wm-border)] bg-[var(--wm-surface)] p-0.5">
            <button
              type="button"
              class="px-2.5 py-1 rounded-md font-semibold transition-colors"
              :class="filterStatus === 'all' ? 'bg-[var(--wm-accent)] text-white' : 'wm-muted hover:text-[var(--wm-text)]'"
              @click="filterStatus = 'all'"
            >
              Todos ({{ items.length }})
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-md font-semibold transition-colors"
              :class="filterStatus === 'deficit' ? 'bg-red-500 text-white' : 'wm-muted hover:text-[var(--wm-text)]'"
              @click="filterStatus = 'deficit'"
            >
              Falta no Estoque ({{ produtosComDeficit }})
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-md font-semibold transition-colors"
              :class="filterStatus === 'ok' ? 'bg-emerald-600 text-white' : 'wm-muted hover:text-[var(--wm-text)]'"
              @click="filterStatus = 'ok'"
            >
              Estoque OK ({{ produtosComEstoqueOk }})
            </button>
          </div>

          <!-- Busca Rápida -->
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] wm-muted">search</span>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar produto, código ou PN..."
              class="wm-input text-xs pl-8 pr-2.5 py-1 w-48 sm:w-60"
            />
          </div>

          <!-- Exportar CSV -->
          <button
            type="button"
            class="wm-btn wm-btn--ghost text-xs py-1 px-2.5"
            @click="exportCsv"
          >
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span class="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      <!-- Tabela com Ordenação Interativa no Cabeçalho -->
      <div class="overflow-x-auto">
        <table class="wm-table">
          <thead>
            <tr>
              <th class="w-10 text-center">#</th>

              <!-- Cód. ITK (Ordenação Numérica) -->
              <th
                class="w-28 cursor-pointer select-none transition-colors hover:bg-[var(--wm-surface-2)]"
                :class="{ 'text-[var(--wm-accent)] font-bold': sortKey === 'cod_produto' }"
                title="Clique para ordenar por Código ITK (ordem numérica)"
                @click="handleSort('cod_produto')"
              >
                <div class="flex items-center gap-1">
                  <span>Cód. ITK</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'cod_produto' ? 'text-[var(--wm-accent)]' : 'opacity-30'">
                    {{ sortKey === 'cod_produto' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>

              <!-- Part Number (Ordenação Alfabética) -->
              <th
                class="w-36 cursor-pointer select-none transition-colors hover:bg-[var(--wm-surface-2)]"
                :class="{ 'text-[var(--wm-accent)] font-bold': sortKey === 'part_number' }"
                title="Clique para ordenar por Part Number (ordem alfabética)"
                @click="handleSort('part_number')"
              >
                <div class="flex items-center gap-1">
                  <span>Part Number</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'part_number' ? 'text-[var(--wm-accent)]' : 'opacity-30'">
                    {{ sortKey === 'part_number' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>

              <!-- Descrição do Produto (Ordenação Alfabética) -->
              <th
                class="min-w-[280px] cursor-pointer select-none transition-colors hover:bg-[var(--wm-surface-2)]"
                :class="{ 'text-[var(--wm-accent)] font-bold': sortKey === 'descricao' }"
                title="Clique para ordenar por Descrição (ordem alfabética)"
                @click="handleSort('descricao')"
              >
                <div class="flex items-center gap-1">
                  <span>Descrição do Produto</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'descricao' ? 'text-[var(--wm-accent)]' : 'opacity-30'">
                    {{ sortKey === 'descricao' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>

              <!-- Origem (Ordenação Alfabética) -->
              <th
                class="w-24 text-center cursor-pointer select-none transition-colors hover:bg-[var(--wm-surface-2)]"
                :class="{ 'text-[var(--wm-accent)] font-bold': sortKey === 'origem' }"
                title="Clique para ordenar por Origem (ordem alfabética)"
                @click="handleSort('origem')"
              >
                <div class="flex items-center justify-center gap-1">
                  <span>Origem</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'origem' ? 'text-[var(--wm-accent)]' : 'opacity-30'">
                    {{ sortKey === 'origem' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>

              <!-- Nº Pedidos (Ordenação Numérica) -->
              <th
                class="w-28 text-center cursor-pointer select-none transition-colors hover:bg-[var(--wm-surface-2)]"
                :class="{ 'text-[var(--wm-accent)] font-bold': sortKey === 'pedidos_count' }"
                title="Clique para ordenar por Quantidade de Pedidos (ordem numérica)"
                @click="handleSort('pedidos_count')"
              >
                <div class="flex items-center justify-center gap-1">
                  <span>Nº Pedidos</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'pedidos_count' ? 'text-[var(--wm-accent)]' : 'opacity-30'">
                    {{ sortKey === 'pedidos_count' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>

              <!-- Demanda Total (Ordenação Numérica) -->
              <th
                class="w-28 wm-num cursor-pointer select-none transition-colors hover:bg-[var(--wm-surface-2)]"
                :class="{ 'text-[var(--wm-accent)] font-bold': sortKey === 'qtd_pendente' }"
                title="Clique para ordenar por Demanda Total (ordem numérica)"
                @click="handleSort('qtd_pendente')"
              >
                <div class="flex items-center justify-end gap-1">
                  <span>Demanda Total</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'qtd_pendente' ? 'text-[var(--wm-accent)]' : 'opacity-30'">
                    {{ sortKey === 'qtd_pendente' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>

              <!-- Saldo Físico (Ordenação Numérica) -->
              <th
                class="w-28 wm-num cursor-pointer select-none transition-colors hover:bg-[var(--wm-surface-2)]"
                :class="{ 'text-[var(--wm-accent)] font-bold': sortKey === 'saldo_estoque' }"
                title="Clique para ordenar por Saldo Físico (ordem numérica)"
                @click="handleSort('saldo_estoque')"
              >
                <div class="flex items-center justify-end gap-1">
                  <span>Saldo Físico</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'saldo_estoque' ? 'text-[var(--wm-accent)]' : 'opacity-30'">
                    {{ sortKey === 'saldo_estoque' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>

              <!-- Disp. Livre (Ordenação Numérica) -->
              <th
                class="w-28 wm-num cursor-pointer select-none transition-colors hover:bg-[var(--wm-surface-2)]"
                :class="{ 'text-[var(--wm-accent)] font-bold': sortKey === 'disponivel_estoque' }"
                title="Clique para ordenar por Disponível Livre (ordem numérica)"
                @click="handleSort('disponivel_estoque')"
              >
                <div class="flex items-center justify-end gap-1">
                  <span>Disp. Livre</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'disponivel_estoque' ? 'text-[var(--wm-accent)]' : 'opacity-30'">
                    {{ sortKey === 'disponivel_estoque' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>

              <!-- Falta p/ Quitar (Ordenação Numérica) -->
              <th
                class="w-32 wm-num font-black text-red-500 cursor-pointer select-none transition-colors hover:bg-red-500/10"
                :class="{ 'underline decoration-2': sortKey === 'falta_para_quitar' }"
                title="Clique para ordenar por Falta p/ Quitar (ordem numérica)"
                @click="handleSort('falta_para_quitar')"
              >
                <div class="flex items-center justify-end gap-1">
                  <span>Falta p/ Quitar</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'falta_para_quitar' ? 'text-red-500 font-bold' : 'opacity-40'">
                    {{ sortKey === 'falta_para_quitar' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>

              <!-- Valor Pendente (Ordenação Numérica) -->
              <th
                class="w-32 wm-num cursor-pointer select-none transition-colors hover:bg-[var(--wm-surface-2)]"
                :class="{ 'text-[var(--wm-accent)] font-bold': sortKey === 'valor_pendente' }"
                title="Clique para ordenar por Valor Pendente (ordem numérica)"
                @click="handleSort('valor_pendente')"
              >
                <div class="flex items-center justify-end gap-1">
                  <span>Valor Pendente</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'valor_pendente' ? 'text-[var(--wm-accent)]' : 'opacity-30'">
                    {{ sortKey === 'valor_pendente' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>

              <!-- Situação (Ordenação Alfabética) -->
              <th
                class="w-28 text-center cursor-pointer select-none transition-colors hover:bg-[var(--wm-surface-2)]"
                :class="{ 'text-[var(--wm-accent)] font-bold': sortKey === 'situacao' }"
                title="Clique para ordenar por Situação (ordem alfabética)"
                @click="handleSort('situacao')"
              >
                <div class="flex items-center justify-center gap-1">
                  <span>Situação</span>
                  <span class="material-symbols-outlined text-[15px]" :class="sortKey === 'situacao' ? 'text-[var(--wm-accent)]' : 'opacity-30'">
                    {{ sortKey === 'situacao' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(prod, idx) in pagedItems" :key="prod.cod_produto">
              <tr
                class="hover:bg-[var(--wm-surface-2)]/60 transition-colors cursor-pointer"
                :class="[
                  expandedProducts.has(prod.cod_produto) ? 'bg-[var(--wm-surface-2)]/40' : '',
                  isGenericProduct(prod) ? 'bg-amber-500/[0.05] border-l-4 border-l-amber-500' : ''
                ]"
                @click="toggleExpand(prod.cod_produto)"
              >
                <!-- Botão de Expandir -->
                <td class="text-center">
                  <span
                    class="material-symbols-outlined text-[18px] wm-muted transition-transform"
                    :class="{ 'rotate-90 text-[var(--wm-accent)]': expandedProducts.has(prod.cod_produto) }"
                  >
                    chevron_right
                  </span>
                </td>

                <!-- Código ITK -->
                <td class="font-mono text-xs font-semibold text-[var(--wm-text)]">
                  {{ prod.cod_produto }}
                </td>

                <!-- Part Number (com destaque e badge de Genérico se aplicável) -->
                <td>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      class="font-mono text-xs font-bold"
                      :class="isGenericProduct(prod) ? 'text-amber-700 dark:text-amber-400 font-extrabold' : 'text-[var(--wm-text)]'"
                    >
                      {{ prod.part_number || '—' }}
                    </span>
                    <span
                      v-if="isGenericProduct(prod)"
                      class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm"
                      title="Item cadastrado como Genérico no ITKSoft"
                    >
                      <span class="material-symbols-outlined text-[11px]">warning</span>
                      Genérico
                    </span>
                  </div>
                </td>

                <!-- Descrição do Produto (com descrição explicativa para itens genéricos) -->
                <td>
                  <div class="font-medium text-xs text-[var(--wm-text)] leading-snug">
                    {{ prod.descricao }}
                  </div>
                  <!-- Explicação visual para itens genéricos -->
                  <div
                    v-if="isGenericProduct(prod)"
                    class="mt-1 flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 w-fit"
                  >
                    <span class="material-symbols-outlined text-[13px] text-amber-600 dark:text-amber-400">info</span>
                    <span>{{ getGenericDescription(prod) }}</span>
                  </div>
                  <div class="text-[10px] wm-muted mt-0.5">
                    Unidade: {{ prod.unidade }}
                  </div>
                </td>

                <!-- Origem -->
                <td class="text-center">
                  <span
                    class="wm-badge text-[10px]"
                    :class="prod.origem === 'Importado' ? 'wm-badge--purple' : 'wm-badge--green'"
                  >
                    {{ prod.origem }}
                  </span>
                </td>

                <!-- Pedidos vinculados -->
                <td class="text-center font-mono text-xs font-semibold">
                  {{ prod.pedidos_count }} {{ prod.pedidos_count === 1 ? 'pedido' : 'pedidos' }}
                </td>

                <!-- Demanda Total Pendente -->
                <td class="wm-num font-mono text-xs font-bold text-[var(--wm-text)]">
                  {{ formatNumber(prod.qtd_pendente) }}
                </td>

                <!-- Saldo Físico -->
                <td class="wm-num font-mono text-xs" :class="prod.saldo_estoque > 0 ? 'text-emerald-500 font-bold' : 'wm-muted'">
                  {{ formatNumber(prod.saldo_estoque) }}
                </td>

                <!-- Disponível Livre -->
                <td class="wm-num font-mono text-xs" :class="prod.disponivel_estoque > 0 ? 'text-emerald-500' : 'text-amber-500'">
                  {{ formatNumber(prod.disponivel_estoque) }}
                </td>

                <!-- QUANTO FALTA PARA QUITAR -->
                <td class="wm-num font-mono text-xs font-black">
                  <span v-if="prod.falta_para_quitar > 0" class="text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                    -{{ formatNumber(prod.falta_para_quitar) }}
                  </span>
                  <span v-else class="text-emerald-500">
                    0.0 (Cobre 100%)
                  </span>
                </td>

                <!-- Valor Pendente -->
                <td class="wm-num font-mono text-xs font-bold text-[var(--wm-text)]">
                  {{ formatCurrency(prod.valor_pendente) }}
                </td>

                <!-- Situação Badge -->
                <td class="text-center">
                  <span
                    class="wm-badge text-[10px]"
                    :class="prod.falta_para_quitar > 0 ? 'wm-badge--danger' : 'wm-badge--success'"
                  >
                    {{ prod.falta_para_quitar > 0 ? 'Falta Estoque' : 'Estoque OK' }}
                  </span>
                </td>
              </tr>

              <!-- Linha Expandida (Sanfona com os pedidos que compraram este produto) -->
              <tr v-if="expandedProducts.has(prod.cod_produto)" class="bg-[var(--wm-surface-2)]/80">
                <td colspan="12" class="p-3 sm:p-4 border-b border-[var(--wm-border)]">
                  <div class="space-y-2.5">
                    <div class="flex items-center justify-between text-xs font-bold text-[var(--wm-text)]">
                      <span class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-[16px] text-[var(--wm-accent)]">receipt</span>
                        Pedidos da White Martins com este produto pendente ({{ prod.pedidos.length }}):
                      </span>
                    </div>

                    <!-- Aviso específico de item genérico na sanfona -->
                    <div
                      v-if="isGenericProduct(prod)"
                      class="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2"
                    >
                      <span class="material-symbols-outlined text-[18px] text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">info</span>
                      <div>
                        <div class="font-bold">Item com Cadastro Genérico no ITK ({{ prod.part_number }})</div>
                        <div class="text-[11px] opacity-90 mt-0.5">
                          Este item utiliza um código guarda-chuva no sistema. Consulte o pedido de compra do cliente e as observações comerciais para confirmar as dimensões, conexões e calibrações exatas solicitadas.
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                      <div
                        v-for="ped in prod.pedidos"
                        :key="ped.codigo_itk + (ped.pedido_cliente || '')"
                        class="p-2.5 rounded-lg border border-[var(--wm-border)] bg-[var(--wm-surface)] flex justify-between items-center"
                      >
                        <div>
                          <div class="font-bold text-[var(--wm-text)]">
                            PO: {{ ped.pedido_cliente || 'Sem PO' }} &bull; ITK: {{ ped.codigo_itk }}
                          </div>
                          <div class="wm-muted text-[11px]">
                            Filial: {{ ped.filial }} &bull; Emissão: {{ ped.emissao || '—' }}
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="font-mono font-bold text-red-500">
                            {{ formatNumber(ped.qtd_pendente) }} un
                          </div>
                          <div class="wm-muted text-[11px] font-mono">
                            {{ formatCurrency(ped.valor_pendente) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Paginação / Rodapé da Tabela -->
      <div class="p-3.5 border-t border-[var(--wm-border)] flex flex-wrap items-center justify-between gap-3 text-xs wm-muted bg-[var(--wm-surface-2)]">
        <div>
          Exibindo {{ sortedAndFilteredList.length === 0 ? 0 : (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize, sortedAndFilteredList.length) }} de {{ sortedAndFilteredList.length }} produtos
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="wm-btn wm-btn--ghost py-1 px-2 text-xs"
            :disabled="currentPage <= 1"
            @click="currentPage--"
          >
            Anterior
          </button>
          <span class="font-mono">{{ currentPage }} / {{ totalPages || 1 }}</span>
          <button
            type="button"
            class="wm-btn wm-btn--ghost py-1 px-2 text-xs"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WmProductDeficitItem } from '../types/wmProductsDeficit'

const props = defineProps<{
  items: WmProductDeficitItem[]
  totalPecasFaltantes: number
  produtosComDeficit: number
  produtosComEstoqueOk: number
}>()

// Itens Genéricos conhecidos no ITK
const GENERIC_PRODUCT_CODES = ['00001646', '00002503', '00002802'] as const

function isGenericProduct(prod: WmProductDeficitItem): boolean {
  if (!prod) return false
  const cod = String(prod.cod_produto || '').trim()
  if (GENERIC_PRODUCT_CODES.includes(cod as any)) return true

  const pn = String(prod.part_number || '').toUpperCase().trim()
  if (pn === '00 PSV GEN' || pn === 'COMPTES INDUSTRIAIS' || pn === 'TUBO INDUSTRIAL' || pn.includes('GEN')) {
    return true
  }

  const desc = String(prod.descricao || '').toUpperCase().trim()
  if (desc.startsWith('GEN ') || desc.includes('GENERICO') || desc.includes('GENÉRICO')) {
    return true
  }

  return false
}

function getGenericDescription(prod: WmProductDeficitItem): string {
  const cod = String(prod.cod_produto || '').trim()
  const pn = String(prod.part_number || '').toUpperCase().trim()

  if (cod === '00001646' || pn === '00 PSV GEN') {
    return 'Cadastro Genérico ITK • Válvulas de Segurança com calibrações/pressões específicas no pedido'
  }
  if (cod === '00002802' || pn === 'TUBO INDUSTRIAL') {
    return 'Cadastro Genérico ITK • Tubulações industriais cortadas sob medida conforme PO'
  }
  if (cod === '00002503' || pn === 'COMPTES INDUSTRIAIS') {
    return 'Cadastro Genérico ITK • Componentes e peças especiais customizadas no pedido'
  }
  return 'Cadastro Genérico ITK • Especificação técnica definida nas ordens de cada pedido'
}

// Tipos de ordenação de colunas
type SortColumnKey =
  | 'cod_produto'
  | 'part_number'
  | 'descricao'
  | 'origem'
  | 'pedidos_count'
  | 'qtd_pendente'
  | 'saldo_estoque'
  | 'disponivel_estoque'
  | 'falta_para_quitar'
  | 'valor_pendente'
  | 'situacao'

// Colunas com ordenação puramente numérica
const NUMERIC_COLUMNS = new Set<SortColumnKey>([
  'cod_produto',
  'pedidos_count',
  'qtd_pendente',
  'saldo_estoque',
  'disponivel_estoque',
  'falta_para_quitar',
  'valor_pendente'
])

const filterStatus = ref<'all' | 'deficit' | 'ok'>('all')
const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const expandedProducts = ref(new Set<string>())

// Estado de ordenação das colunas
const sortKey = ref<SortColumnKey>('falta_para_quitar')
const sortOrder = ref<'asc' | 'desc'>('desc')

function handleSort(col: SortColumnKey) {
  if (sortKey.value === col) {
    // Inverte a direção se já for a coluna ativa
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Nova coluna selecionada: define direção inicial inteligente
    sortKey.value = col
    if (col === 'cod_produto' || !NUMERIC_COLUMNS.has(col)) {
      // Código ITK e colunas alfabéticas começam em 'asc' (A-Z / 1-9)
      sortOrder.value = 'asc'
    } else {
      // Demais colunas numéricas começam em 'desc' (maiores valores primeiro)
      sortOrder.value = 'desc'
    }
  }
  // Ao alterar a ordenação, volta para a primeira página
  currentPage.value = 1
}

function toggleExpand(cod: string) {
  if (expandedProducts.value.has(cod)) {
    expandedProducts.value.delete(cod)
  } else {
    expandedProducts.value.add(cod)
  }
}

const valorTotalPendente = computed(() => {
  return props.items.reduce((acc, p) => acc + (p.valor_pendente || 0), 0)
})

// 1. Filtragem por Status e Termo de Busca
const filteredList = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return props.items.filter((p) => {
    if (filterStatus.value === 'deficit' && p.falta_para_quitar <= 0) return false
    if (filterStatus.value === 'ok' && p.falta_para_quitar > 0) return false

    if (term) {
      const matchCod = (p.cod_produto || '').toLowerCase().includes(term)
      const matchDesc = (p.descricao || '').toLowerCase().includes(term)
      const matchPn = (p.part_number || '').toLowerCase().includes(term)
      if (!matchCod && !matchDesc && !matchPn) return false
    }

    return true
  })
})

// 2. Ordenação Interativa (Numérica nas colunas especificadas, Alfabética nas demais)
const sortedAndFilteredList = computed(() => {
  const list = [...filteredList.value]
  const key = sortKey.value
  const multiplier = sortOrder.value === 'asc' ? 1 : -1

  if (NUMERIC_COLUMNS.has(key)) {
    list.sort((a, b) => {
      let valA = 0
      let valB = 0
      if (key === 'cod_produto') {
        valA = Number(a.cod_produto) || 0
        valB = Number(b.cod_produto) || 0
      } else {
        valA = Number((a as any)[key]) || 0
        valB = Number((b as any)[key]) || 0
      }
      return (valA - valB) * multiplier
    })
  } else {
    list.sort((a, b) => {
      let strA = ''
      let strB = ''
      if (key === 'situacao') {
        strA = a.falta_para_quitar > 0 ? 'Falta Estoque' : 'Estoque OK'
        strB = b.falta_para_quitar > 0 ? 'Falta Estoque' : 'Estoque OK'
      } else {
        strA = String((a as any)[key] || '')
        strB = String((b as any)[key] || '')
      }
      return strA.localeCompare(strB, 'pt-BR', { sensitivity: 'base', numeric: true }) * multiplier
    })
  }

  return list
})

const totalPages = computed(() => Math.ceil(sortedAndFilteredList.value.length / pageSize.value))

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedAndFilteredList.value.slice(start, start + pageSize.value)
})

function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return '0.0'
  return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'R$ 0,00'
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function exportCsv() {
  const headers = [
    'Codigo ITK',
    'Part Number',
    'Item Generico',
    'Descricao',
    'Origem',
    'Qtd Pedidos',
    'Demanda Total',
    'Saldo Fisico',
    'Disponivel Livre',
    'Falta p/ Quitar',
    'Valor Pendente (R$)',
    'Situacao'
  ]
  const rows = sortedAndFilteredList.value.map((p) => [
    p.cod_produto,
    p.part_number || '',
    isGenericProduct(p) ? 'Sim (Item Genérico)' : 'Não',
    `"${(p.descricao || '').replace(/"/g, '""')}"`,
    p.origem,
    p.pedidos_count,
    p.qtd_pendente,
    p.saldo_estoque,
    p.disponivel_estoque,
    p.falta_para_quitar,
    p.valor_pendente.toFixed(2),
    p.falta_para_quitar > 0 ? 'Falta Estoque' : 'Estoque OK'
  ])
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `balanco_produtos_deficit_white_martins_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
