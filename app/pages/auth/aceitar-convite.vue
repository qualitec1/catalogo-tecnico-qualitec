<template>
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
    <!-- Background Decor -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      <div class="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md z-10">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20 mb-4">
          <span class="material-symbols-outlined text-3xl text-white">person_add</span>
        </div>
        <h2 class="text-2xl font-black tracking-tight text-white uppercase">
          Qualitec Industrial
        </h2>
        <p class="mt-1 text-sm text-slate-400 font-medium">
          Convite para o Painel Administrativo
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-slate-900/80 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
          <!-- State: Success -->
          <div v-if="success" class="text-center space-y-4 py-2">
            <div class="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 mx-auto flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <h3 class="text-base font-bold text-white uppercase">Senha Criada com Sucesso!</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Sua conta administrativa foi configurada. Você já pode fazer login com seu e-mail e a senha que acabou de criar.
            </p>
            <div class="pt-2">
              <NuxtLink
                to="/login"
                class="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-colors"
              >
                Ir para a Tela de Login
              </NuxtLink>
            </div>
          </div>

          <!-- State: Error / Expired -->
          <div v-else-if="tokenError" class="space-y-4 text-center py-2">
            <div class="w-12 h-12 rounded-full bg-red-950 border border-red-800 text-red-400 mx-auto flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">link_off</span>
            </div>
            <h3 class="text-base font-bold text-white uppercase">Convite Inválido ou Expirado</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Este convite expirou ou o link já foi utilizado anteriormente. Por motivos de segurança, solicite um novo convite ao Master Admin da Qualitec.
            </p>
            <div class="pt-2">
              <NuxtLink
                to="/login"
                class="w-full inline-flex justify-center items-center py-2 px-4 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Voltar ao Início
              </NuxtLink>
            </div>
          </div>

          <!-- State: Password Form -->
          <form v-else class="space-y-5" @submit.prevent="handleSubmit">
            <p class="text-xs text-slate-400 leading-relaxed">
              Você foi convidado para acessar o painel administrativo da Qualitec. Crie sua senha individual e segura para ativar sua conta:
            </p>

            <div v-if="errorMessage" class="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-red-400 shrink-0">error</span>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- New Password -->
            <div>
              <label for="new-pass" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Nova Senha
              </label>
              <div class="mt-1.5 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <span class="material-symbols-outlined text-lg">lock</span>
                </div>
                <input
                  id="new-pass"
                  v-model="password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  class="block w-full pl-10 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirm-pass" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Confirmar Nova Senha
              </label>
              <div class="mt-1.5 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <span class="material-symbols-outlined text-lg">lock_reset</span>
                </div>
                <input
                  id="confirm-pass"
                  v-model="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  class="block w-full pl-10 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Requirements Indicators -->
            <div class="space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-[11px]">
              <span class="text-slate-400 font-semibold block mb-1">Requisitos de Segurança:</span>
              <div class="flex items-center gap-1.5" :class="hasMinLength ? 'text-emerald-400' : 'text-slate-500'">
                <span class="material-symbols-outlined text-xs">{{ hasMinLength ? 'check_circle' : 'radio_button_unchecked' }}</span>
                <span>Mínimo de 8 caracteres</span>
              </div>
              <div class="flex items-center gap-1.5" :class="hasUpperLower ? 'text-emerald-400' : 'text-slate-500'">
                <span class="material-symbols-outlined text-xs">{{ hasUpperLower ? 'check_circle' : 'radio_button_unchecked' }}</span>
                <span>Letras maiúsculas e minúsculas</span>
              </div>
              <div class="flex items-center gap-1.5" :class="hasNumber ? 'text-emerald-400' : 'text-slate-500'">
                <span class="material-symbols-outlined text-xs">{{ hasNumber ? 'check_circle' : 'radio_button_unchecked' }}</span>
                <span>Pelo menos um número</span>
              </div>
              <div class="flex items-center gap-1.5" :class="isMatching && password ? 'text-emerald-400' : 'text-slate-500'">
                <span class="material-symbols-outlined text-xs">{{ isMatching && password ? 'check_circle' : 'radio_button_unchecked' }}</span>
                <span>Senhas idênticas</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors"
            >
              <span v-if="loading" class="material-symbols-outlined animate-spin mr-2 text-base">progress_activity</span>
              <span>{{ loading ? 'Configurando Conta...' : 'Criar Senha e Concluir' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: false
})

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const success = ref(false)
const tokenError = ref(false)
const errorMessage = ref('')

const hasMinLength = computed(() => password.value.length >= 8)
const hasUpperLower = computed(() => /[a-z]/.test(password.value) && /[A-Z]/.test(password.value))
const hasNumber = computed(() => /[0-9]/.test(password.value))
const isMatching = computed(() => password.value === confirmPassword.value)
const isFormValid = computed(() => hasMinLength.value && hasUpperLower.value && hasNumber.value && isMatching.value)

const supabase = useSupabaseClient()

onMounted(async () => {
  // Verificar se há erro na URL do callback (hash ou query params)
  const hash = window.location.hash
  if (hash && (hash.includes('error=') || hash.includes('error_description='))) {
    tokenError.value = true
    return
  }

  // Supabase Auth processa o hash do convite automaticamente ao carregar
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    tokenError.value = true
    return
  }

  // Escutar evento de autenticação do convite
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      tokenError.value = true
    }
  })
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    errorMessage.value = 'Por favor, atenda a todos os requisitos de segurança da senha.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { data: updateData, error } = await supabase.auth.updateUser({
      password: password.value
    })

    if (error) {
      errorMessage.value = error.message || 'Falha ao definir nova senha. O convite pode ter expirado.'
      if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid')) {
        tokenError.value = true
      }
      return
    }

    // Ativação segura no servidor vinculada exclusivamente ao JWT do convidado (anti-IDOR)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    if (token) {
      await $fetch('/api/auth/complete-invite', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    }

    // Sucesso
    success.value = true
    // Deslogar sessão temporária para garantir que o usuário faça o primeiro login formal
    await supabase.auth.signOut()
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || err.message || 'Erro inesperado ao salvar senha.'
  } finally {
    loading.value = false
  }
}
</script>
