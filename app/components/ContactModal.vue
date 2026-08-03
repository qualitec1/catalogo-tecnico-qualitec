<template>
  <Transition name="modal">
    <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4" @click.self="close">
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col">
        <!-- Header -->
        <div class="bg-[#004A96] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-2xl">mail</span>
            <div>
              <h3 class="font-bold text-sm uppercase tracking-wider margin-0">
                {{ productName ? 'Solicitar Orçamento' : 'Fale Conosco / Contato' }}
              </h3>
              <p v-if="productName" class="text-[11px] text-blue-100 margin-0 truncate max-w-[280px]">
                Item: {{ productName }}
              </p>
            </div>
          </div>
          <button @click="close" class="text-blue-200 hover:text-white transition-colors border-0 bg-transparent cursor-pointer p-1">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Feedback Alert -->
          <div v-if="feedback" :class="feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'" class="p-3 rounded-lg border text-xs font-medium flex items-center gap-2">
            <span class="material-symbols-outlined text-base shrink-0">{{ feedback.type === 'success' ? 'check_circle' : 'error' }}</span>
            <span>{{ feedback.message }}</span>
          </div>

          <!-- Nome -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">Nome Completo *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="Digite seu nome..." 
              class="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
            />
          </div>

          <!-- Email & Telefone -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">E-mail de Contato *</label>
              <input 
                v-model="form.email" 
                type="email" 
                required 
                placeholder="seu@email.com" 
                class="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Telefone / WhatsApp</label>
              <input 
                v-model="form.phone" 
                type="text" 
                placeholder="(11) 99999-9999" 
                class="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              />
            </div>
          </div>

          <!-- Empresa & Assunto -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Empresa</label>
              <input 
                v-model="form.company" 
                type="text" 
                placeholder="Nome da sua empresa" 
                class="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Assunto</label>
              <input 
                v-model="form.subject" 
                type="text" 
                :placeholder="productName ? 'Orçamento de equipamento' : 'Dúvida técnica / comercial'" 
                class="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              />
            </div>
          </div>

          <!-- Mensagem -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">Mensagem / Observações *</label>
            <textarea 
              v-model="form.message" 
              rows="3" 
              required 
              placeholder="Descreva sua necessidade ou solicitação..." 
              class="w-full border border-slate-300 rounded p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white font-sans"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              @click="close" 
              class="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded transition-colors cursor-pointer bg-white"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="loading" 
              class="px-5 py-2 bg-[#004A96] hover:bg-[#00346c] text-white font-semibold text-xs rounded transition-colors border-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <span v-if="loading" class="material-symbols-outlined animate-spin text-sm">sync</span>
              <span v-else class="material-symbols-outlined text-sm">send</span>
              {{ loading ? 'Enviando...' : 'Enviar Mensagem' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

const props = defineProps<{
  open: boolean
  productName?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const loading = ref(false)
const feedback = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: ''
})

watch(() => props.open, (newVal) => {
  if (newVal) {
    feedback.value = null
    if (props.productName && !form.subject) {
      form.subject = `Orçamento: ${props.productName}`
    }
  }
})

const close = () => {
  emit('close')
}

const handleSubmit = async () => {
  loading.value = true
  feedback.value = null

  try {
    const res = await $fetch('/api/send-email', {
      method: 'POST',
      body: {
        type: props.productName ? 'quote' : 'contact',
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        subject: form.subject || (props.productName ? `Orçamento: ${props.productName}` : 'Contato do Site'),
        message: form.message,
        productName: props.productName || ''
      }
    }) as any

    if (res?.success) {
      feedback.value = {
        message: res.message || 'Mensagem enviada com sucesso! Em breve entraremos em contato.',
        type: 'success'
      }
      form.name = ''
      form.email = ''
      form.phone = ''
      form.company = ''
      form.subject = ''
      form.message = ''
      setTimeout(() => {
        close()
      }, 2500)
    }
  } catch (err: any) {
    console.error('Erro ao enviar e-mail de contato:', err)
    feedback.value = {
      message: err.data?.message || err.message || 'Erro ao enviar mensagem via e-mail. Tente novamente.',
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}
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
