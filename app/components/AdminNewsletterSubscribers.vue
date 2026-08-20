<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6 space-y-6">
    <!-- Header & Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h2 class="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600">mark_email_read</span>
          E-mails Cadastrados na Newsletter
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          Lista de visitantes que se inscreveram para receber a newsletter do site Qualitec.
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <!-- Input de Busca -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-sm">search</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar e-mail..." 
            class="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white font-sans text-slate-800"
          />
        </div>

        <!-- Botão Exportar CSV -->
        <button 
          @click="exportCSV" 
          :disabled="!filteredSubscribers.length"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors border-0 cursor-pointer shadow-xs"
        >
          <span class="material-symbols-outlined text-sm">download</span>
          Exportar CSV
        </button>
      </div>
    </div>

    <!-- Tabela de Inscritos -->
    <div class="overflow-x-auto">
      <div v-if="loading" class="py-12 text-center text-slate-500 text-xs font-semibold flex items-center justify-center gap-2">
        <span class="material-symbols-outlined animate-spin text-base">sync</span>
        Carregando lista de e-mails inscritos...
      </div>

      <table v-else-if="filteredSubscribers.length" class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
            <th class="py-3 px-4 w-12">#</th>
            <th class="py-3 px-4">E-mail Cadastrado</th>
            <th class="py-3 px-4 w-36">Idioma no Cadastro</th>
            <th class="py-3 px-4 w-48">Data da Inscrição</th>
            <th class="py-3 px-4 w-28 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-sans">
          <tr v-for="(sub, idx) in filteredSubscribers" :key="idx" class="hover:bg-slate-50/80 transition-colors">
            <td class="py-3 px-4 text-slate-400 font-mono text-[11px]">{{ idx + 1 }}</td>
            <td class="py-3 px-4">
              <span class="font-bold text-slate-800 font-mono text-xs">{{ sub.email }}</span>
            </td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono shadow-2xs" :class="getLangBadgeClass(sub.lang)">
                {{ (sub.lang || 'pt').toUpperCase() }}
              </span>
            </td>
            <td class="py-3 px-4 text-slate-600 font-mono text-[11px]">
              {{ sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleString('pt-BR') : 'Data não registrada' }}
            </td>
            <td class="py-3 px-4 text-right">
              <button 
                @click="copyEmail(sub.email)" 
                class="p-1 text-slate-500 hover:text-blue-600 transition-colors border-0 bg-transparent cursor-pointer"
                title="Copiar e-mail"
              >
                <span class="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Estado Vazio -->
      <div v-else class="py-12 text-center text-slate-500 space-y-2">
        <span class="material-symbols-outlined text-4xl text-slate-300">mail_lock</span>
        <p class="text-xs font-semibold text-slate-700">Nenhum e-mail inscrito encontrado.</p>
        <p class="text-[11px] text-slate-500 max-w-sm mx-auto">
          Os visitantes do site que preencherem o formulário de newsletter na página inicial aparecerão aqui automaticamente.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  triggerToast?: (msg: string, type: 'success' | 'error') => void
}>()

interface Subscriber {
  email: string
  lang: string
  subscribed_at: string
}

const subscribers = ref<Subscriber[]>([])
const loading = ref(false)
const searchQuery = ref('')

const fetchSubscribers = async () => {
  loading.value = true
  try {
    const data = await $fetch<{ subscribers?: Subscriber[] }>('/api/admin/subscribers')
    subscribers.value = (data?.subscribers || []).sort(
      (a, b) => new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime()
    )
  } catch (err) {
    console.error('Erro ao carregar inscritos:', err)
    props.triggerToast?.('Erro ao carregar lista de inscritos', 'error')
  } finally {
    loading.value = false
  }
}

const filteredSubscribers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return subscribers.value
  return subscribers.value.filter(s => s.email.toLowerCase().includes(query) || (s.lang || '').toLowerCase().includes(query))
})

const getLangBadgeClass = (lang: string) => {
  const l = (lang || 'pt').toLowerCase()
  if (l === 'en') return 'bg-blue-100 text-blue-800 border border-blue-200'
  if (l === 'es') return 'bg-amber-100 text-amber-800 border border-amber-200'
  return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
}

const copyEmail = (email: string) => {
  navigator.clipboard.writeText(email)
  props.triggerToast?.(`E-mail ${email} copiado!`, 'success')
}

const exportCSV = () => {
  if (!filteredSubscribers.value.length) return
  let csv = 'data:text/csv;charset=utf-8,Email,Idioma,DataInscricao\n'
  filteredSubscribers.value.forEach(item => {
    const dt = item.subscribed_at ? new Date(item.subscribed_at).toLocaleString('pt-BR') : ''
    csv += `"${item.email}","${item.lang || 'pt'}","${dt}"\n`
  })
  const encodedUri = encodeURI(csv)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `inscritos_newsletter_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(fetchSubscribers)
</script>
