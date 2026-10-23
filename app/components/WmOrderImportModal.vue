<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
    @click.self="emit('close')"
    @keydown.esc="emit('close')"
  >
    <div
      class="wm-card relative w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[var(--wm-border)] bg-[var(--wm-surface)] text-[var(--wm-text)]"
    >
      <!-- Cabecalho do Modal -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--wm-border)] bg-[var(--wm-surface-2)] shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <span class="material-symbols-outlined text-[22px]">upload_file</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="wm-heading text-base sm:text-lg font-bold text-[var(--wm-text)] leading-tight">
                Leitor e Importador de Ordens de Compra (PDF)
              </h2>
              <span class="wm-badge wm-badge--info text-[10px]">White Martins &bull; ITKSoft</span>
            </div>
            <p class="text-xs wm-muted mt-0.5">
              Extracao nativa SAP &bull; Desambiguacao &bull; Herose 06388 &bull; Filtro de Genericos &bull; Anti-Duplicidade
            </p>
          </div>
        </div>

        <button
          type="button"
          class="wm-btn wm-btn--ghost text-xs p-2 rounded-lg text-[var(--wm-muted)] hover:text-[var(--wm-text)]"
          title="Fechar"
          @click="emit('close')"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Corpo com Scroll -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Zona de Drag & Drop (Suporta 1 ou Multiplos PDFs) -->
        <div
          class="border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer relative overflow-hidden"
          :class="[
            isDragging
              ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-[0.99]'
              : 'border-[var(--wm-border)] hover:border-blue-500/60 bg-[var(--wm-surface-2)]/50 hover:bg-[var(--wm-surface-2)]'
          ]"
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept=".pdf"
            class="hidden"
            @change="handleFileSelect"
          />

          <div class="flex flex-col items-center justify-center gap-2">
            <div class="w-12 h-12 rounded-full bg-blue-500/15 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-1">
              <span class="material-symbols-outlined text-[28px]">picture_as_pdf</span>
            </div>
            <div class="wm-heading text-sm sm:text-base font-bold">
              Arraste e solte <span class="text-blue-500">1 ou multiplos arquivos PDF</span> da White Martins aqui
            </div>
            <p class="text-xs wm-muted max-w-md">
              Aceita os PDFs originais emitidos pelo SAP da White Martins. Leitura instantanea sem custos de LLM/tokens.
            </p>
            <div class="mt-2">
              <button
                type="button"
                class="wm-btn wm-btn--primary text-xs py-1.5 px-4"
                :disabled="isUploading"
                @click.stop="triggerFileInput"
              >
                <span class="material-symbols-outlined text-[16px]">add</span>
                <span>Selecionar PDFs do Computador</span>
              </button>
            </div>
          </div>

          <!-- Spinner durante upload/processamento -->
          <div
            v-if="isUploading"
            class="absolute inset-0 bg-[var(--wm-surface)]/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10"
          >
            <span class="material-symbols-outlined text-blue-500 text-[36px] animate-spin">sync</span>
            <div class="text-xs font-bold">Auditando PDFs no ITKSoft...</div>
            <div class="text-[11px] wm-muted">Checando duplicidade, filiais, itens e modelos Herose 06388</div>
          </div>
        </div>

        <!-- Barra de Selecao de OCs Multiplas (Se houver arquivos carregados) -->
        <div v-if="ordersQueue.length > 0" class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--wm-border)] pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider wm-muted">
                Ordens Processadas ({{ ordersQueue.length }})
              </span>
              <span class="wm-badge wm-badge--neutral text-[10px]">
                {{ readyCount }} prontas &bull; {{ duplicateCount }} duplicadas
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="wm-btn wm-btn--ghost text-xs py-1 px-2.5 text-blue-500"
                @click="triggerFileInput"
              >
                <span class="material-symbols-outlined text-[14px]">add</span>
                <span>Adicionar mais</span>
              </button>
              <button
                type="button"
                class="wm-btn wm-btn--ghost text-xs py-1 px-2 text-red-500 hover:text-red-400"
                title="Limpar fila de importacao"
                @click="clearQueue"
              >
                <span class="material-symbols-outlined text-[14px]">delete</span>
                <span>Limpar todos</span>
              </button>
            </div>
          </div>

          <!-- Pilulas / Chips Horizontais de Selecao -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              v-for="(item, index) in ordersQueue"
              :key="index"
              type="button"
              class="wm-btn text-xs py-1.5 px-3 rounded-xl flex items-center gap-2 shrink-0 transition-all"
              :class="[
                activeOrderIndex === index
                  ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-300 font-bold shadow-xs'
                  : 'wm-btn--ghost'
              ]"
              @click="activeOrderIndex = index"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="[
                  item.data?.duplicidade?.existe
                    ? 'bg-red-500'
                    : item.status === 'ERROR'
                      ? 'bg-red-500'
                      : 'bg-emerald-500'
                ]"
              />
              <span class="font-mono font-semibold">
                {{ item.data?.oc_num ? `OC: ${item.data.oc_num}` : item.filename }}
              </span>
              <span v-if="item.data?.total_oc" class="text-[10px] wm-muted">
                R$ {{ item.data.total_oc.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
              </span>
              <span
                v-if="item.savedSuccess"
                class="material-symbols-outlined text-emerald-500 text-[14px]"
                title="Pedido gravado no ITKSoft"
              >
                check_circle
              </span>
            </button>
          </div>
        </div>

        <!-- Revisao Detalhada da OC Ativa -->
        <div v-if="currentOrder" class="space-y-4">
          <!-- Banner de Erro na Extracao do Arquivo -->
          <div
            v-if="currentOrder.status === 'ERROR'"
            class="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-2 text-xs"
          >
            <span class="material-symbols-outlined text-[20px]">error</span>
            <span><b>Erro ao processar {{ currentOrder.filename }}:</b> {{ currentOrder.error }}</span>
          </div>

          <template v-else-if="currentOrder.data">
            <!-- Card Executivo da OC -->
            <div class="p-5 rounded-2xl border border-[var(--wm-border)] bg-[var(--wm-surface-2)]/60 space-y-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                      OC: {{ currentOrder.data.oc_num || 'NAO IDENTIFICADO' }}
                    </span>
                    <span v-if="currentOrder.data.data_emissao" class="text-xs wm-muted">
                      Emissao: {{ currentOrder.data.data_emissao }}
                    </span>
                  </div>
                  <h3 class="wm-heading text-lg font-bold text-[var(--wm-text)] mt-1.5">
                    {{ currentOrder.data.filial?.nome_fantasia || 'FILIAL NAO IDENTIFICADA NO ITK' }}
                  </h3>
                  <p class="text-xs wm-muted">
                    CNPJ de Entrega: <span class="font-mono">{{ currentOrder.data.cnpj_entrega || '-' }}</span>
                  </p>
                </div>

                <div class="text-right">
                  <div class="text-[11px] font-semibold uppercase tracking-wider wm-muted">Valor Total da OC</div>
                  <div class="wm-heading text-2xl font-extrabold text-emerald-500 font-mono">
                    R$ {{ (currentOrder.data.total_oc || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                  </div>
                </div>
              </div>

              <!-- Metadados da OC -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--wm-border)] text-xs">
                <div>
                  <span class="wm-muted block text-[10px] uppercase font-semibold">Comprador</span>
                  <span class="font-medium truncate block" :title="currentOrder.data.comprador">{{ currentOrder.data.comprador || '-' }}</span>
                  <span class="wm-muted text-[11px] font-mono truncate block">{{ currentOrder.data.email_comprador || '' }}</span>
                </div>
                <div>
                  <span class="wm-muted block text-[10px] uppercase font-semibold">Condicao / Frete</span>
                  <span class="font-medium block">{{ currentOrder.data.cond_pgto || '-' }}</span>
                  <span class="wm-muted text-[11px] block">{{ currentOrder.data.incoterms || 'FOB' }}</span>
                </div>
                <div>
                  <span class="wm-muted block text-[10px] uppercase font-semibold">Vendedor ITKSoft</span>
                  <span class="font-medium text-blue-500 block">
                    {{ currentOrder.data.vendedor?.nome || 'QUALITEC (00000219)' }}
                  </span>
                </div>
                <div>
                  <span class="wm-muted block text-[10px] uppercase font-semibold">Status Anti-Duplicidade</span>
                  <span
                    class="font-bold flex items-center gap-1 mt-0.5"
                    :class="currentOrder.data.duplicidade?.existe ? 'text-red-500' : 'text-emerald-500'"
                  >
                    <span class="material-symbols-outlined text-[14px]">
                      {{ currentOrder.data.duplicidade?.existe ? 'block' : 'verified' }}
                    </span>
                    {{ currentOrder.data.duplicidade?.existe ? 'Ja Cadastrado' : 'Inedito (Liberado)' }}
                  </span>
                </div>
              </div>

              <!-- Banners de Alerta da OC -->
              <!-- Alerta 1: Bloqueio por Duplicidade -->
              <div
                v-if="currentOrder.data.duplicidade?.existe"
                class="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 flex items-start gap-2.5 text-xs"
              >
                <span class="material-symbols-outlined text-[20px] shrink-0 mt-0.5">block</span>
                <div>
                  <div class="font-bold uppercase tracking-wider">RECUSA POR DUPLICIDADE (Anti-Duplicidade ITK)</div>
                  <div class="mt-0.5">{{ currentOrder.data.duplicidade.msg }}</div>
                </div>
              </div>

              <!-- Alerta 2: Regra de Prazo de Entrega < 20 dias -->
              <div
                v-if="hasLeadTimeAlert(currentOrder.data)"
                class="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-start gap-2.5 text-xs"
              >
                <span class="material-symbols-outlined text-[20px] shrink-0 mt-0.5">warning</span>
                <div>
                  <div class="font-bold uppercase tracking-wider">REGRA DE PRAZO APLICADA (&lt; 20 DIAS)</div>
                  <div class="mt-0.5">
                    A White Martins solicitou entrega com prazo inferior a 20 dias da data atual. Conforme a regra padrao da Qualitec, <b>a data da OC NAO sera gravada</b> no pedido e prevalecera o prazo padrao fabril (20 a 30 dias).
                  </div>
                </div>
              </div>

              <!-- Sucesso de Gravacao -->
              <div
                v-if="currentOrder.savedSuccess"
                class="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-between text-xs"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[20px]">check_circle</span>
                  <span><b>Sucesso:</b> Ordem de Compra gravada no ITKSoft sob o Pedido <b>{{ currentOrder.savedPedidoNum }}</b>!</span>
                </div>
              </div>
            </div>

            <!-- Tabela dos Itens da OC -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="text-xs font-bold uppercase tracking-wider wm-muted">
                  Itens Discriminados na Ordem de Compra ({{ currentOrder.data.itens?.length || 0 }})
                </div>
                <div class="text-[11px] wm-muted">
                  Legenda: <span class="text-emerald-500 font-bold">&bull; Confirmado (Verde)</span> &bull;
                  <span class="text-amber-500 font-bold">&bull; Ambiguo (Amarelo)</span> &bull;
                  <span class="text-orange-500 font-bold">&bull; Sem Registro (Laranja)</span>
                </div>
              </div>

              <div class="overflow-x-auto rounded-xl border border-[var(--wm-border)] bg-[var(--wm-surface)]">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-[var(--wm-border)] bg-[var(--wm-surface-2)] text-[11px] wm-muted uppercase tracking-wider">
                      <th class="py-2.5 px-3">Seq</th>
                      <th class="py-2.5 px-3">Recurso WM</th>
                      <th class="py-2.5 px-3">Descricao na OC</th>
                      <th class="py-2.5 px-2 text-center">Qtd</th>
                      <th class="py-2.5 px-3">Unitario OC</th>
                      <th class="py-2.5 px-3">Produto Qualitec (De-Para)</th>
                      <th class="py-2.5 px-3">Part Number / ITK</th>
                      <th class="py-2.5 px-3">Status / Auditoria</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[var(--wm-border)]">
                    <tr
                      v-for="it in currentOrder.data.itens"
                      :key="it.seq"
                      class="hover:bg-[var(--wm-surface-2)]/50 transition-colors"
                    >
                      <td class="py-3 px-3 font-mono font-semibold wm-muted">{{ it.seq }}</td>
                      <td class="py-3 px-3 font-mono font-bold text-blue-500">{{ it.recurso }}</td>
                      <td class="py-3 px-3 max-w-xs">
                        <div class="font-medium text-[var(--wm-text)] leading-snug">{{ it.desc_oc }}</div>
                        <div class="text-[11px] wm-muted mt-0.5 line-clamp-2" :title="it.caracteristicas">{{ it.caracteristicas || '-' }}</div>
                      </td>
                      <td class="py-3 px-2 text-center font-bold font-mono">{{ it.qtd }}</td>
                      <td class="py-3 px-3 font-mono font-semibold whitespace-nowrap">
                        <div>R$ {{ it.preco_unitario_oc?.toFixed(2) }}</div>
                        <div
                          v-if="it.variacao_preco"
                          class="text-[10px] mt-0.5"
                          :class="Math.abs(it.variacao_preco.diff_perc) > 2 ? 'text-amber-500 font-bold' : 'wm-muted'"
                        >
                          Tab: R$ {{ it.variacao_preco.preco_tabela?.toFixed(2) }} ({{ it.variacao_preco.diff_perc > 0 ? '+' : '' }}{{ it.variacao_preco.diff_perc }}%)
                        </div>
                      </td>

                      <!-- Produto Qualitec (De-Para) & Selecao de Candidato -->
                      <td class="py-3 px-3 max-w-xs">
                        <!-- Dropdown de Selecao para Ambiguos -->
                        <div v-if="it.opcoes_candidatas && it.opcoes_candidatas.length > 0" class="space-y-1">
                          <span class="text-[10px] font-bold text-amber-500 uppercase">Selecione a Variacao:</span>
                          <select
                            class="wm-input text-xs py-1 px-2 w-full text-xs font-medium"
                            :value="it.sugestao_cod_itk || ''"
                            @change="onCandidateChange(it, $event)"
                          >
                            <option value="">-- Escolha uma das {{ it.opcoes_candidatas.length }} opcoes --</option>
                            <option
                              v-for="cand in it.opcoes_candidatas"
                              :key="cand.cod_itk"
                              :value="cand.cod_itk"
                            >
                              {{ cand.part_number }} - {{ cand.desc }}
                            </option>
                          </select>
                        </div>

                        <!-- Produto Confirmado -->
                        <div v-else-if="it.sugestao_desc_qualitec && !it.sugestao_desc_qualitec.includes('Sem registro')" class="font-medium text-emerald-600 dark:text-emerald-400 leading-snug">
                          {{ it.sugestao_desc_qualitec }}
                        </div>

                        <!-- Sem Registro Fisico (Itens Genericos ou Ineditos) -->
                        <div v-else class="text-orange-500 dark:text-orange-400 font-semibold">
                          <div>Sem registro fisico</div>
                          <div class="text-[10px] wm-muted">(historico generico ou inedito)</div>
                        </div>
                      </td>

                      <!-- Part Number / ITK -->
                      <td class="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                        <template v-if="it.sugestao_part_number">
                          <div class="font-bold">{{ it.sugestao_part_number }}</div>
                          <div class="wm-muted text-[10px]">ITK: {{ it.sugestao_cod_itk }}</div>
                        </template>
                        <span v-else class="wm-muted">-</span>
                      </td>

                      <!-- Status / Auditoria -->
                      <td class="py-3 px-3">
                        <span
                          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                          :class="[
                            it.badge_cor === 'green'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : it.badge_cor === 'yellow'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                          ]"
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            :class="[
                              it.badge_cor === 'green'
                                ? 'bg-emerald-500'
                                : it.badge_cor === 'yellow'
                                  ? 'bg-amber-500'
                                  : 'bg-orange-500'
                            ]"
                          />
                          {{
                            it.badge_cor === 'green'
                              ? 'Confirmado'
                              : it.badge_cor === 'yellow'
                                ? 'Revisar (Ambiguo)'
                                : 'Sem Historico'
                          }}
                        </span>
                        <div class="text-[10px] wm-muted mt-1 max-w-[200px] leading-tight">
                          <b v-if="it.regra_desambiguacao_aplicada" class="text-amber-500 block">
                            {{ it.regra_desambiguacao_aplicada }}
                          </b>
                          {{ it.mensagem_auditoria }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </div>

        <!-- Estado Inicial Vazio -->
        <div v-else class="text-center py-12 wm-muted text-xs">
          Nenhuma Ordem de Compra carregada no momento. Arraste ou selecione arquivos PDF acima para iniciar a leitura.
        </div>
      </div>

      <!-- Rodape com Acoes -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[var(--wm-border)] bg-[var(--wm-surface-2)] shrink-0">
        <button
          type="button"
          class="wm-btn wm-btn--ghost text-xs"
          @click="emit('close')"
        >
          Fechar
        </button>

        <div class="flex items-center gap-2">
          <span v-if="currentOrder?.data?.duplicidade?.existe" class="text-xs text-red-500 font-bold hidden sm:inline">
            Gravacao Bloqueada (Duplicidade no ITKSoft)
          </span>

          <button
            v-if="ordersQueue.length > 1 && canSaveCurrent"
            type="button"
            class="wm-btn wm-btn--ghost text-xs text-blue-500"
            :disabled="isSaving"
            @click="saveAllValidOrders"
          >
            <span>Gravar Todas Validas ({{ readyCount }})</span>
          </button>

          <button
            type="button"
            class="wm-btn wm-btn--primary text-xs py-2 px-5"
            :disabled="!canSaveCurrent || isSaving"
            @click="saveCurrentOrder"
          >
            <span v-if="isSaving" class="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span v-else class="material-symbols-outlined text-[16px]">check</span>
            <span>{{ isSaving ? 'Gravando no ITKSoft...' : 'Confirmar e Gravar Pedido no ITK' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  'close': []
  'order-imported': [order: any]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const isSaving = ref(false)

interface OrderQueueItem {
  filename: string
  status: 'SUCCESS' | 'ERROR'
  data?: any
  error?: string
  savedSuccess?: boolean
  savedPedidoNum?: string
}

const ordersQueue = ref<OrderQueueItem[]>([])
const activeOrderIndex = ref(0)

const currentOrder = computed(() => {
  if (ordersQueue.value.length === 0) return null
  return ordersQueue.value[activeOrderIndex.value] || ordersQueue.value[0]
})

const readyCount = computed(() => {
  return ordersQueue.value.filter(o => o.data && !o.data.duplicidade?.existe && !o.savedSuccess).length
})

const duplicateCount = computed(() => {
  return ordersQueue.value.filter(o => o.data?.duplicidade?.existe).length
})

const canSaveCurrent = computed(() => {
  if (!currentOrder.value || !currentOrder.value.data) return false
  if (currentOrder.value.data.duplicidade?.existe) return false
  if (currentOrder.value.savedSuccess) return false
  return true
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function clearQueue() {
  ordersQueue.value = []
  activeOrderIndex.value = 0
}

function hasLeadTimeAlert(data: any): boolean {
  if (!data || !data.itens) return false
  return data.itens.some((it: any) => it.status_prazo === 'REJEITADO_MENOR_20_DIAS')
}

function onCandidateChange(it: any, event: Event) {
  const select = event.target as HTMLSelectElement
  const codItk = select.value
  if (!codItk) {
    it.sugestao_part_number = null
    it.sugestao_cod_itk = null
    it.sugestao_desc_qualitec = null
    it.badge_cor = 'yellow'
    return
  }
  const cand = it.opcoes_candidatas?.find((c: any) => c.cod_itk === codItk)
  if (cand) {
    it.sugestao_part_number = cand.part_number
    it.sugestao_cod_itk = cand.cod_itk
    it.sugestao_desc_qualitec = cand.desc
    it.badge_cor = 'green'
    it.regra_desambiguacao_aplicada = `Selecionado manualmente pelo operador: ${cand.part_number}`
  }
}

async function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    await processFiles(Array.from(target.files))
    target.value = ''
  }
}

async function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const pdfs = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.pdf'))
    if (pdfs.length > 0) {
      await processFiles(pdfs)
    } else {
      alert('Por favor, envie arquivos em formato PDF.')
    }
  }
}

async function processFiles(files: File[]) {
  isUploading.value = true
  const formData = new FormData()
  files.forEach(f => {
    formData.append('pdf', f, f.name)
  })

  try {
    const res = await $fetch<any>('/api/admin/parse-wm-pdf', {
      method: 'POST',
      body: formData
    })

    if (res && res.results) {
      res.results.forEach((r: any) => {
        const existingIdx = ordersQueue.value.findIndex(o => o.filename === r.filename)
        if (existingIdx >= 0) {
          ordersQueue.value[existingIdx] = r
        } else {
          ordersQueue.value.push(r)
        }
      })
      activeOrderIndex.value = Math.max(0, ordersQueue.value.length - res.results.length)
    }
  } catch (err: any) {
    alert(`Erro ao processar PDFs: ${err?.message || err}`)
  } finally {
    isUploading.value = false
  }
}

async function saveCurrentOrder() {
  if (!currentOrder.value || !currentOrder.value.data) return
  const data = currentOrder.value.data
  if (data.duplicidade?.existe) {
    alert('Gravacao bloqueada: Esta OC ja se encontra cadastrada no ITKSoft.')
    return
  }

  const filialNome = data.filial ? data.filial.nome_fantasia : 'White Martins'
  const confirmMsg = `Confirma a gravacao da Ordem de Compra ${data.oc_num} para ${filialNome} no ITKSoft?`
  if (!confirm(confirmMsg)) return

  isSaving.value = true
  try {
    const res = await $fetch<any>('/api/admin/save-wm-order', {
      method: 'POST',
      body: data
    })

    if (res && res.success) {
      currentOrder.value.savedSuccess = true
      currentOrder.value.savedPedidoNum = res.codigo_itk || res.pedido_itk || data.oc_num
      alert(`Sucesso! Pedido OC ${data.oc_num} gravado com sucesso no ITKSoft sob o Pedido ${currentOrder.value.savedPedidoNum}!`)
      emit('order-imported', data)
    } else {
      alert(`Erro ao gravar no ITK: ${res?.error || 'Falha desconhecida.'}`)
    }
  } catch (err: any) {
    alert(`Falha na requisicao de gravacao: ${err?.message || err}`)
  } finally {
    isSaving.value = false
  }
}

async function saveAllValidOrders() {
  const validOrders = ordersQueue.value.filter(o => o.data && !o.data.duplicidade?.existe && !o.savedSuccess)
  if (validOrders.length === 0) return

  if (!confirm(`Confirma a gravacao de ${validOrders.length} Ordens de Compra simultaneamente no ITKSoft?`)) return

  isSaving.value = true
  let successCount = 0
  for (const ord of validOrders) {
    try {
      const res = await $fetch<any>('/api/admin/save-wm-order', {
        method: 'POST',
        body: ord.data
      })
      if (res && res.success) {
        ord.savedSuccess = true
        ord.savedPedidoNum = res.codigo_itk || ord.data.oc_num
        successCount++
      }
    } catch (e) {
      console.error('Erro ao gravar pedido:', ord.data.oc_num, e)
    }
  }

  isSaving.value = false
  alert(`Processo concluido: ${successCount} de ${validOrders.length} pedidos gravados com sucesso no ITKSoft!`)
  emit('order-imported', null)
}
</script>
