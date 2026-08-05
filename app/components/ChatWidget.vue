<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Chat Window Popover -->
    <Transition name="chat-popup">
      <div 
        v-if="isOpen" 
        class="mb-4 w-[360px] sm:w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans transition-all duration-300"
        style="max-height: 580px; height: 540px;"
      >
        <!-- Header -->
        <div class="bg-[#004A96] text-white p-4 flex items-center justify-between shadow-md shrink-0">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <span class="material-symbols-outlined text-white text-xl">support_agent</span>
              </div>
              <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#004A96] rounded-full"></span>
            </div>
            <div>
              <h3 class="font-bold text-sm leading-tight margin-0">{{ labels.headerTitle }}</h3>
              <p class="text-[11px] text-blue-100/90 margin-0 flex items-center gap-1 font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                {{ labels.headerSubtitle }}
              </p>
            </div>
          </div>
          <button 
            @click="toggleChat" 
            class="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white transition-colors border-0 bg-transparent cursor-pointer"
            title="Close"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <!-- Chat Body / Scroll Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          <!-- Initial Welcome Message -->
          <div class="flex items-start gap-2.5 max-w-[90%]">
            <div class="w-7 h-7 rounded-full bg-[#004A96] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
              Q
            </div>
            <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-xs text-xs text-slate-700 leading-relaxed">
              <p class="font-medium text-slate-800 margin-0">
                {{ labels.welcomeMsg }}
              </p>
              <span class="text-[10px] text-slate-400 mt-1.5 block text-right">Qualitec • {{ currentTime }}</span>
            </div>
          </div>

          <!-- Form State (Pre-chat) -->
          <div v-if="!submitted" class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3 mt-2">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider margin-0 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span class="material-symbols-outlined text-[#004A96] text-sm">edit_note</span>
              {{ labels.formTitle }}
            </h4>

            <!-- Feedback Alert -->
            <div v-if="feedback" :class="feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'" class="p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2">
              <span class="material-symbols-outlined text-sm shrink-0">{{ feedback.type === 'success' ? 'check_circle' : 'error' }}</span>
              <span>{{ feedback.message }}</span>
            </div>

            <!-- Form inputs -->
            <form @submit.prevent="handleSubmit" class="space-y-2.5">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">{{ labels.nameLabel }}</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required 
                  :placeholder="labels.namePlaceholder" 
                  class="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#004A96]/30 focus:border-[#004A96] focus:outline-none bg-white text-slate-800"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">{{ labels.emailLabel }}</label>
                  <input 
                    v-model="form.email" 
                    type="email" 
                    required 
                    :placeholder="labels.emailPlaceholder" 
                    class="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#004A96]/30 focus:border-[#004A96] focus:outline-none bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">{{ labels.phoneLabel }}</label>
                  <input 
                    v-model="form.phone" 
                    type="text" 
                    :placeholder="labels.phonePlaceholder" 
                    class="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#004A96]/30 focus:border-[#004A96] focus:outline-none bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">{{ labels.messageLabel }}</label>
                <textarea 
                  v-model="form.message" 
                  rows="3" 
                  required 
                  :placeholder="labels.messagePlaceholder" 
                  class="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#004A96]/30 focus:border-[#004A96] focus:outline-none bg-white text-slate-800 font-sans resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                :disabled="loading" 
                class="w-full py-2.5 bg-[#004A96] hover:bg-[#00346c] active:scale-[0.99] text-white font-bold text-xs rounded-lg transition-all border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
              >
                <span v-if="loading" class="material-symbols-outlined animate-spin text-base">sync</span>
                <span v-else class="material-symbols-outlined text-base">send</span>
                {{ loading ? labels.submittingBtn : labels.submitBtn }}
              </button>
            </form>
          </div>

          <!-- Submitted Confirmation Messages -->
          <template v-else>
            <!-- User Sent Message Bubble -->
            <div class="flex items-end justify-end gap-2 max-w-[90%] ml-auto">
              <div class="bg-[#004A96] text-white rounded-2xl rounded-tr-xs p-3.5 shadow-sm text-xs leading-relaxed space-y-1">
                <p class="font-semibold text-blue-100 text-[11px] margin-0">{{ form.name }} ({{ form.email }})</p>
                <p class="margin-0 font-normal whitespace-pre-wrap">{{ form.message }}</p>
                <span class="text-[9px] text-blue-200 block text-right pt-1">{{ submittedTime }}</span>
              </div>
            </div>

            <!-- Agent Response Confirmation Bubble -->
            <div class="flex items-start gap-2.5 max-w-[90%]">
              <div class="w-7 h-7 rounded-full bg-[#004A96] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                Q
              </div>
              <div class="bg-white border border-emerald-200 rounded-2xl rounded-tl-xs p-3.5 shadow-xs text-xs text-slate-700 leading-relaxed space-y-2">
                <div class="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span class="material-symbols-outlined text-base">check_circle</span>
                  <span>{{ labels.successTitle }}</span>
                </div>
                <p class="margin-0 text-slate-600">
                  {{ labels.successText(form.name, form.email, form.phone) }}
                </p>
                <div class="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                  <a 
                    :href="`mailto:vendas@qualitecinstrumentos.com.br`" 
                    class="w-full py-2 px-3 bg-[#004A96] hover:bg-[#00346c] text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors no-underline shadow-xs"
                  >
                    <span class="material-symbols-outlined text-sm">mail</span>
                    {{ labels.emailBtn }}
                  </a>
                  <button 
                    @click="resetForm" 
                    class="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] border-0 cursor-pointer transition-colors"
                  >
                    {{ labels.resetBtn }}
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer Note -->
        <div class="bg-slate-100/90 px-4 py-2 text-[10px] text-slate-500 text-center border-t border-slate-200 shrink-0 flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-xs text-slate-400">shield</span>
          {{ labels.footerNote }}
        </div>
      </div>
    </Transition>

    <!-- Floating Toggle Button & Speech Tooltip Container -->
    <div 
      class="flex items-center gap-3.5 cursor-pointer group select-none"
      :style="{
        transform: customBtnStyle?.transform || 'none'
      }"
      @click="toggleChat"
    >
      <!-- Speech Tooltip (Visible when chat is closed) -->
      <Transition name="tooltip-fade">
        <div 
          v-if="!isOpen" 
          class="relative bg-white text-[#092b5a] px-6 py-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2 transition-all duration-200 group-hover:shadow-2xl group-hover:-translate-x-0.5"
        >
          <!-- Blue Dot Indicator -->
          <span class="absolute top-3.5 right-4 w-2.5 h-2.5 rounded-full bg-[#0051ba]"></span>

          <span 
            class="font-semibold text-sm tracking-tight pr-3 text-[#092b5a] whitespace-nowrap"
            :style="{
              fontFamily: customBtnStyle?.fontFamily || 'system-ui',
              fontSize: customBtnStyle?.fontSize ? `${customBtnStyle.fontSize}` : '14px',
              fontWeight: customBtnStyle?.fontWeight || '600',
              fontStyle: customBtnStyle?.fontStyle || 'normal'
            }"
          >
            {{ displayedTooltipText }}
          </span>

          <!-- Pointer Triangle Arrow (pointing right) -->
          <div class="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[8px] border-l-white drop-shadow-xs"></div>
        </div>
      </Transition>

      <!-- Circular Icon Button -->
      <button 
        type="button"
        class="w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-full bg-[#0051ba] hover:bg-[#003f99] active:scale-95 text-white ring-4 ring-white shadow-xl flex items-center justify-center transition-all duration-200 border-0 cursor-pointer shrink-0"
        :title="labels.headerTitle"
      >
        <span class="material-symbols-outlined text-2xl sm:text-3xl transition-transform duration-300">
          {{ isOpen ? 'close' : 'chat_bubble' }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const props = defineProps<{
  buttonText?: string
  customBtnStyle?: Record<string, any>
}>()

const { currentLang } = useTranslations()

const isOpen = ref(false)
const loading = ref(false)
const submitted = ref(false)
const feedback = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const labels = computed(() => {
  const lang = (currentLang?.value || 'pt').toLowerCase()
  if (lang === 'en') {
    return {
      defaultBtnText: 'Hello! How can I help you?',
      headerTitle: 'Qualitec Customer Support',
      headerSubtitle: 'Team Online • Fast response',
      welcomeMsg: 'Hello! Please leave your contact information so we can reach you even if you leave the website.',
      formTitle: 'Fill in your details',
      nameLabel: 'Full Name *',
      namePlaceholder: 'Your full name',
      emailLabel: 'Email *',
      emailPlaceholder: 'your@email.com',
      phoneLabel: 'Contact Phone',
      phonePlaceholder: '+1 (555) 000-0000',
      messageLabel: 'How can we help you? *',
      messagePlaceholder: 'Type your message or inquiry...',
      submitBtn: 'Start Support Chat',
      submittingBtn: 'Sending...',
      successTitle: 'Message Received Successfully!',
      successText: (name: string, email: string, phone?: string) =>
        `Thank you, ${name}! Our team has received your information and will respond as soon as possible via email ${email}${phone ? ` or phone ${phone}` : ''}.`,
      emailBtn: 'Send Direct Email',
      resetBtn: 'Send another message',
      footerNote: 'Qualitec Industrial Instruments • Secure Support'
    }
  } else if (lang === 'es') {
    return {
      defaultBtnText: '¡Hola! ¿Cómo puedo ayudarte?',
      headerTitle: 'Atención al Cliente Qualitec',
      headerSubtitle: 'Equipo en Línea • Respuesta rápida',
      welcomeMsg: '¡Hola! Deja tu información de contacto para que podamos contactarte incluso si ya no estás en el sitio web.',
      formTitle: 'Completa tus datos',
      nameLabel: 'Nombre Completo *',
      namePlaceholder: 'Tu nombre completo',
      emailLabel: 'Correo Electrónico *',
      emailPlaceholder: 'tu@email.com',
      phoneLabel: 'Teléfono de Contacto',
      phonePlaceholder: '+54 9 11 0000-0000',
      messageLabel: '¿Cómo podemos ayudarte? *',
      messagePlaceholder: 'Escribe tu mensaje o consulta...',
      submitBtn: 'Iniciar Atención',
      submittingBtn: 'Enviando...',
      successTitle: '¡Mensaje Recibido con Éxito!',
      successText: (name: string, email: string, phone?: string) =>
        `¡Gracias, ${name}! Nuestro equipo ha recibido tus datos y te responderá lo antes posible a través de tu correo ${email}${phone ? ` o teléfono ${phone}` : ''}.`,
      emailBtn: 'Enviar Correo Directo',
      resetBtn: 'Enviar otro mensaje',
      footerNote: 'Qualitec Instrumentos Industriales • Atención Segura'
    }
  }

  // Default PT
  return {
    defaultBtnText: 'Olá! Como posso ajudar?',
    headerTitle: 'Atendimento Qualitec',
    headerSubtitle: 'Equipe Online • Resposta rápida',
    welcomeMsg: 'Olá! Deixe suas informações de contato para que possamos te contatar mesmo se você não estiver mais no site.',
    formTitle: 'Preencha seus dados',
    nameLabel: 'Nome Completo *',
    namePlaceholder: 'Seu nome completo',
    emailLabel: 'E-mail *',
    emailPlaceholder: 'seu@email.com',
    phoneLabel: 'Telefone de Contato',
    phonePlaceholder: '(11) 3908-7100',
    messageLabel: 'Como podemos te ajudar? *',
    messagePlaceholder: 'Digite sua mensagem ou dúvida...',
    submitBtn: 'Iniciar Atendimento',
    submittingBtn: 'Enviando...',
    successTitle: 'Mensagem Recebida com Sucesso!',
    successText: (name: string, email: string, phone?: string) =>
      `Obrigado, ${name}! Nossa equipe já recebeu seus dados e retornará o contato o mais rápido possível através do e-mail ${email}${phone ? ` ou telefone ${phone}` : ''}.`,
    emailBtn: 'Enviar E-mail Direto',
    resetBtn: 'Enviar outra mensagem',
    footerNote: 'Qualitec Instrumentos Industriais • Atendimento Seguro'
  }
})

const displayedTooltipText = computed(() => {
  const lang = (currentLang?.value || 'pt').toLowerCase()
  if (lang !== 'pt') {
    return labels.value.defaultBtnText
  }
  return props.buttonText || labels.value.defaultBtnText
})

const currentTime = computed(() => {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
})

const submittedTime = ref('')

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const handleSubmit = async () => {
  loading.value = true
  feedback.value = null

  try {
    const res = await $fetch('/api/send-email', {
      method: 'POST',
      body: {
        type: 'contact',
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: currentLang.value === 'en' ? 'Website Chat Message' : currentLang.value === 'es' ? 'Mensaje del Chat del Sitio' : 'Mensagem do Chat do Site',
        message: form.message,
        lang: currentLang.value || 'pt'
      }
    }) as any

    if (res?.success) {
      submittedTime.value = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      submitted.value = true
    }
  } catch (err: any) {
    console.error('Erro ao enviar dados do chat:', err)
    feedback.value = {
      message: err.data?.message || err.message || 'Ocorreu um erro ao enviar. Tente novamente.',
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  submitted.value = false
  feedback.value = null
  form.message = ''
}
</script>

<style scoped>
.chat-popup-enter-active,
.chat-popup-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-popup-enter-from,
.chat-popup-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.25s ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(10px) scale(0.95);
}
</style>
