<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6 space-y-6">
    <!-- Header & Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h2 class="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span class="material-symbols-outlined text-[#004A96]">forum</span>
          Mensagens do Chat & Formulários de Contato
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          Lista de mensagens recebidas através do widget de chat e formulários de contato do site.
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <!-- Input de Busca -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-sm">search</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar nome, e-mail, tel..." 
            class="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white font-sans text-slate-800"
          />
        </div>

        <!-- Botão Exportar CSV -->
        <button 
          @click="exportCSV" 
          :disabled="!filteredContacts.length"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors border-0 cursor-pointer shadow-xs"
        >
          <span class="material-symbols-outlined text-sm">download</span>
          Exportar CSV
        </button>
      </div>
    </div>

    <!-- Tabela de Contatos -->
    <div class="overflow-x-auto">
      <div v-if="loading" class="py-12 text-center text-slate-500 text-xs font-semibold flex items-center justify-center gap-2">
        <span class="material-symbols-outlined animate-spin text-base">sync</span>
        Carregando mensagens de contato...
      </div>

      <table v-else-if="filteredContacts.length" class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
            <th class="py-3 px-4 w-12">#</th>
            <th class="py-3 px-4">Nome Completo</th>
            <th class="py-3 px-4">E-mail</th>
            <th class="py-3 px-4">Telefone / WhatsApp</th>
            <th class="py-3 px-4">Assunto / Tipo</th>
            <th class="py-3 px-4 w-40">Data/Hora</th>
            <th class="py-3 px-4 w-28 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-sans">
          <tr v-for="(cnt, idx) in filteredContacts" :key="cnt.id || idx" class="hover:bg-slate-50/80 transition-colors">
            <td class="py-3 px-4 text-slate-400 font-mono text-[11px]">{{ idx + 1 }}</td>
            <td class="py-3 px-4 font-bold text-slate-800">
              {{ cnt.name || 'Não informado' }}
            </td>
            <td class="py-3 px-4">
              <span class="font-mono text-slate-700">{{ cnt.email }}</span>
            </td>
            <td class="py-3 px-4 text-slate-700 font-mono">
              {{ cnt.phone || '—' }}
            </td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono shadow-2xs" :class="getTypeBadgeClass(cnt.type)">
                {{ getTypeName(cnt.type, cnt.productName) }}
              </span>
            </td>
            <td class="py-3 px-4 text-slate-600 font-mono text-[11px]">
              {{ cnt.created_at ? new Date(cnt.created_at).toLocaleString('pt-BR') : 'Sem data' }}
            </td>
            <td class="py-3 px-4 text-right flex items-center justify-end gap-1">
              <button 
                @click="openDetails(cnt)" 
                class="p-1.5 text-blue-600 hover:text-blue-800 transition-colors border-0 bg-transparent cursor-pointer rounded hover:bg-blue-50"
                title="Ver detalhes da mensagem"
              >
                <span class="material-symbols-outlined text-base">visibility</span>
              </button>
              <button 
                @click="copyText(cnt.email, 'E-mail')" 
                class="p-1.5 text-slate-500 hover:text-slate-700 transition-colors border-0 bg-transparent cursor-pointer rounded hover:bg-slate-100"
                title="Copiar e-mail"
              >
                <span class="material-symbols-outlined text-base">content_copy</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Estado Vazio -->
      <div v-else class="py-12 text-center text-slate-500 space-y-2">
        <span class="material-symbols-outlined text-4xl text-slate-300">chat_error</span>
        <p class="text-xs font-semibold text-slate-700">Nenhuma mensagem registrada.</p>
        <p class="text-[11px] text-slate-500 max-w-sm mx-auto">
          As mensagens enviadas através do chat e formulário de contato do site serão listadas aqui automaticamente.
        </p>
      </div>
    </div>

    <!-- Modal de Detalhes da Mensagem -->
    <Transition name="modal">
      <div v-if="selectedContact" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" @click.self="selectedContact = null">
        <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col font-sans">
          <!-- Header -->
          <div class="bg-[#004A96] text-white px-5 py-3.5 flex justify-between items-center shrink-0">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl">account_box</span>
              <h3 class="font-bold text-sm margin-0 uppercase tracking-wide">Detalhes da Mensagem</h3>
            </div>
            <button @click="selectedContact = null" class="text-blue-200 hover:text-white transition-colors border-0 bg-transparent cursor-pointer p-1">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-5 space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Nome</span>
                <span class="font-bold text-slate-800 text-sm">{{ selectedContact.name || 'Não informado' }}</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Data/Hora</span>
                <span class="font-medium text-slate-700">{{ selectedContact.created_at ? new Date(selectedContact.created_at).toLocaleString('pt-BR') : '—' }}</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase block">E-mail</span>
                <a :href="`mailto:${selectedContact.email}`" class="font-bold text-blue-600 no-underline hover:underline">{{ selectedContact.email }}</a>
              </div>
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Telefone / WhatsApp</span>
                <span class="font-bold text-slate-800">{{ selectedContact.phone || 'Não informado' }}</span>
              </div>
              <div v-if="selectedContact.company" class="col-span-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Empresa</span>
                <span class="font-semibold text-slate-800">{{ selectedContact.company }}</span>
              </div>
              <div v-if="selectedContact.productName" class="col-span-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Equipamento / Produto Solicitado</span>
                <span class="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded inline-block border border-blue-200 mt-0.5">{{ selectedContact.productName }}</span>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mensagem enviada</span>
              <div class="p-3.5 bg-slate-100 rounded-lg text-slate-800 leading-relaxed font-sans whitespace-pre-wrap border border-slate-200">
                {{ selectedContact.message || 'Sem conteúdo de mensagem.' }}
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <a 
              v-if="selectedContact.email" 
              :href="`mailto:${selectedContact.email}?subject=Resposta Qualitec: ${encodeURIComponent(selectedContact.subject || 'Contato do Site')}`" 
              class="px-3.5 py-1.5 bg-[#004A96] hover:bg-[#00346c] text-white rounded text-xs font-bold flex items-center gap-1.5 no-underline shadow-2xs transition-colors"
            >
              <span class="material-symbols-outlined text-sm">reply</span>
              Responder por E-mail
            </a>
            <div v-else></div>

            <button 
              @click="selectedContact = null" 
              class="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded border-0 cursor-pointer transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  triggerToast?: (msg: string, type: 'success' | 'error') => void
}>()

interface ContactRecord {
  id?: string
  name: string
  email: string
  phone?: string
  company?: string
  subject?: string
  message: string
  productName?: string
  type?: string
  created_at?: string
}

const contacts = ref<ContactRecord[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedContact = ref<ContactRecord | null>(null)

const fetchContacts = async () => {
  loading.value = true
  try {
    const data = await $fetch<{ contacts?: ContactRecord[] }>('/api/admin/contacts')
    contacts.value = (data?.contacts || []).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )
  } catch (err) {
    console.error('Erro ao carregar contatos:', err)
    props.triggerToast?.('Erro ao carregar lista de contatos', 'error')
  } finally {
    loading.value = false
  }
}

const filteredContacts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return contacts.value
  return contacts.value.filter(c => 
    (c.name || '').toLowerCase().includes(query) ||
    (c.email || '').toLowerCase().includes(query) ||
    (c.phone || '').toLowerCase().includes(query) ||
    (c.message || '').toLowerCase().includes(query) ||
    (c.productName || '').toLowerCase().includes(query)
  )
})

const getTypeName = (type?: string, productName?: string) => {
  if (productName) return 'Orçamento Produto'
  if (type === 'quote') return 'Solicitação Orçamento'
  return 'Contato Chat/Site'
}

const getTypeBadgeClass = (type?: string) => {
  if (type === 'quote') return 'bg-amber-100 text-amber-800 border border-amber-200'
  return 'bg-blue-100 text-blue-800 border border-blue-200'
}

const openDetails = (cnt: ContactRecord) => {
  selectedContact.value = cnt
}

const copyText = (text: string, label: string) => {
  navigator.clipboard.writeText(text)
  props.triggerToast?.(`${label} ${text} copiado!`, 'success')
}

const exportCSV = () => {
  if (!filteredContacts.value.length) return
  let csv = 'data:text/csv;charset=utf-8,Nome,Email,Telefone,Empresa,Mensagem,DataEnvio\n'
  filteredContacts.value.forEach(item => {
    const dt = item.created_at ? new Date(item.created_at).toLocaleString('pt-BR') : ''
    const safeMsg = (item.message || '').replace(/"/g, '""').replace(/\n/g, ' ')
    csv += `"${item.name || ''}","${item.email || ''}","${item.phone || ''}","${item.company || ''}","${safeMsg}","${dt}"\n`
  })
  const encodedUri = encodeURI(csv)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `contatos_qualitec_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(fetchContacts)
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
