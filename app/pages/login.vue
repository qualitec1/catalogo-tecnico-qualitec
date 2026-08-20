<template>
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
    <!-- Background Decor -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      <div class="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md z-10">
      <!-- Logo / Title -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20 mb-4">
          <span class="material-symbols-outlined text-3xl text-white">lock</span>
        </div>
        <h2 class="text-2xl font-black tracking-tight text-white uppercase">
          Qualitec Industrial
        </h2>
        <p class="mt-1 text-sm text-slate-400 font-medium">
          Acesso Restrito ao Painel Administrativo
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-slate-900/80 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
          <!-- Alert Box -->
          <div
            v-if="errorMessage"
            class="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/60 flex items-start space-x-3 text-red-200 text-sm"
          >
            <span class="material-symbols-outlined text-red-400 text-xl shrink-0">error</span>
            <span class="font-medium">{{ errorMessage }}</span>
          </div>

          <form class="space-y-5" @submit.prevent="handleSubmit">
            <!-- Email -->
            <div>
              <label for="email" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                E-mail Administrativo
              </label>
              <div class="mt-1.5 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <span class="material-symbols-outlined text-lg">mail</span>
                </div>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="admin@qualitec.ind.br"
                  class="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Senha de Acesso
              </label>
              <div class="mt-1.5 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <span class="material-symbols-outlined text-lg">key</span>
                </div>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  placeholder="••••••••••••"
                  class="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <!-- 2FA TOTP Code (Optional / Conditional) -->
            <div v-if="requiresTotp || showTotpInput" class="transition-all duration-300">
              <label for="totp" class="block text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center justify-between">
                <span>Código 2FA / Autenticador</span>
                <span class="text-[10px] font-normal text-slate-400">6 dígitos</span>
              </label>
              <div class="mt-1.5 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-500">
                  <span class="material-symbols-outlined text-lg">shield</span>
                </div>
                <input
                  id="totp"
                  v-model="totp"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="6"
                  placeholder="123456"
                  class="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-cyan-800/80 rounded-lg text-sm text-white font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div v-else class="text-right">
              <button
                type="button"
                @click="showTotpInput = true"
                class="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Possui autenticação em 2 fatores (2FA)?
              </button>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="isLoading" class="material-symbols-outlined animate-spin mr-2 text-lg">progress_activity</span>
                <span>{{ isLoading ? 'Autenticando...' : 'Entrar no Sistema' }}</span>
              </button>
            </div>
          </form>

          <!-- Back to site -->
          <div class="mt-6 text-center border-t border-slate-800/80 pt-4">
            <NuxtLink
              to="/"
              class="text-xs font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center"
            >
              <span class="material-symbols-outlined text-sm mr-1">arrow_back</span>
              Voltar ao Catálogo Público
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false
})

const route = useRoute()
const email = ref('')
const password = ref('')
const totp = ref('')
const requiresTotp = ref(false)
const showTotpInput = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Preencha o e-mail e a senha.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const payload: { email: string; password: string; totp?: string } = {
      email: email.value.trim(),
      password: password.value
    }

    if (totp.value.trim()) {
      payload.totp = totp.value.trim()
    }

    const response = await $fetch<{ user?: any; totpRequired?: boolean; error?: string }>('/api/auth/login', {
      method: 'POST',
      body: payload
    })

    if (response?.totpRequired) {
      requiresTotp.value = true
      showTotpInput.value = true
      errorMessage.value = 'Código 2FA obrigatório para esta conta. Insira o código de 6 dígitos.'
      isLoading.value = false
      return
    }

    // Valida se o usuário logado possui perfil ativo de administrador
    const session = await $fetch<{ user?: any; isAdmin?: boolean }>('/api/auth/session')

    if (!session?.isAdmin) {
      errorMessage.value = 'Acesso Negado: Sua conta não possui permissão de administrador ativo.'
      isLoading.value = false
      return
    }

    // Redirecionamento após login
    const target = (route.query.redirect as string) || '/admin-secreto-x9f2'
    await navigateTo(target)
  } catch (err: any) {
    console.error('Login error:', err)
    const message = err?.data?.statusMessage || err?.data?.message || err?.message || 'Falha na autenticação. Verifique suas credenciais.'
    errorMessage.value = message
  } finally {
    isLoading.value = false
  }
}
</script>
