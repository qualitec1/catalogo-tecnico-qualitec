<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div class="flex items-center space-x-3 mb-2">
        <span class="material-symbols-outlined text-slate-800 text-2xl">shield_lock</span>
        <h2 class="text-base font-bold uppercase tracking-wider text-slate-800">
          Segurança da Conta & Autenticação
        </h2>
      </div>
      <p class="text-xs text-slate-500">
        Gerencie as camadas de proteção de acesso ao painel administrativo.
      </p>
    </div>

    <!-- 2FA Status Card -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-blue-600">smartphone</span>
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800">
              Autenticação em Dois Fatores (2FA / TOTP)
            </h3>
          </div>
          <p class="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Exige um código de 6 dígitos gerado pelo aplicativo autenticador (Google Authenticator, Microsoft Authenticator ou Authy) a cada login administrativo.
          </p>
        </div>

        <!-- Status Badge & Action Button -->
        <div class="flex items-center gap-3">
          <div v-if="loading" class="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <span class="material-symbols-outlined text-base animate-spin">sync</span>
            Verificando...
          </div>
          <div v-else class="flex items-center gap-3">
            <span
              :class="is2faEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'"
              class="px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 shadow-sm"
            >
              <span class="w-2 h-2 rounded-full" :class="is2faEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
              {{ is2faEnabled ? 'Ativado' : 'Não configurado' }}
            </span>

            <button
              v-if="!is2faEnabled"
              @click="openSetupModal"
              class="bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold px-4 py-2 rounded shadow-sm flex items-center gap-1.5 transition-colors border-0 cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">add_moderator</span>
              Ativar 2FA
            </button>

            <button
              v-else
              @click="openDisableModal"
              class="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs uppercase font-bold px-4 py-2 rounded shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">remove_moderator</span>
              Desativar 2FA
            </button>
          </div>
        </div>
      </div>

      <!-- Informative Notes -->
      <div class="mt-4 pt-2 text-xs text-slate-500 flex items-start gap-2">
        <span class="material-symbols-outlined text-base text-slate-400 shrink-0">info</span>
        <span>
          Recomendado para todas as contas com privilégios de acesso aos dados de catálogo, clientes e configurações institucionais.
        </span>
      </div>
    </div>

    <!-- Modals de Setup e Disable -->
    <AdminSecurity2faModal
      :setup-open="setupModalOpen"
      :setup-step="setupStep"
      :setup-secret="setupSecret"
      :setup-qr-url="setupQrUrl"
      :setup-loading="setupLoading"
      :setup-error="setupError"
      :disable-open="disableModalOpen"
      :disable-loading="disableLoading"
      :disable-error="disableError"
      @close-setup="closeSetupModal"
      @submit-password="submitSetupPassword"
      @submit-code="submitSetupCode"
      @close-disable="closeDisableModal"
      @submit-disable="submitDisable"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  triggerToast?: (message: string, type: 'success' | 'error') => void
}>()

const loading = ref(false)
const is2faEnabled = ref(false)

// Setup Modal State
const setupModalOpen = ref(false)
const setupStep = ref<1 | 2 | 3>(1)
const setupSecret = ref('')
const setupQrUrl = ref('')
const setupLoading = ref(false)
const setupError = ref<string | null>(null)

// Disable Modal State
const disableModalOpen = ref(false)
const disableLoading = ref(false)
const disableError = ref<string | null>(null)

const fetchStatus = async () => {
  loading.value = true
  try {
    const res = await $fetch<{ enabled: boolean }>('/api/auth/totp/status')
    is2faEnabled.value = Boolean(res?.enabled)
  } catch (err: any) {
    console.error('Failed to fetch 2FA status:', err)
  } finally {
    loading.value = false
  }
}

const openSetupModal = () => {
  setupStep.value = 1
  setupSecret.value = ''
  setupQrUrl.value = ''
  setupError.value = null
  setupModalOpen.value = true
}

const closeSetupModal = () => {
  setupModalOpen.value = false
  setupSecret.value = ''
  setupQrUrl.value = ''
  setupError.value = null
}

const submitSetupPassword = async (password: string) => {
  setupLoading.value = true
  setupError.value = null
  try {
    const res = await $fetch<{ ok: boolean; secret: string; qrDataUrl: string }>('/api/auth/totp/setup', {
      method: 'POST',
      body: { password }
    })
    if (res?.ok && res.secret) {
      setupSecret.value = res.secret
      setupQrUrl.value = res.qrDataUrl || ''
      setupStep.value = 2
    }
  } catch (err: any) {
    setupError.value = err.data?.statusMessage || err.message || 'Senha incorreta.'
  } finally {
    setupLoading.value = false
  }
}

const submitSetupCode = async (code: string) => {
  setupLoading.value = true
  setupError.value = null
  try {
    const res = await $fetch<{ ok: boolean; enabled: boolean }>('/api/auth/totp/confirm', {
      method: 'POST',
      body: { code }
    })
    if (res?.ok && res.enabled) {
      is2faEnabled.value = true
      setupStep.value = 3
      props.triggerToast?.('Autenticação em dois fatores ativada com sucesso!', 'success')
    }
  } catch (err: any) {
    setupError.value = err.data?.statusMessage || err.message || 'Código 2FA incorreto.'
  } finally {
    setupLoading.value = false
  }
}

const openDisableModal = () => {
  disableError.value = null
  disableModalOpen.value = true
}

const closeDisableModal = () => {
  disableModalOpen.value = false
  disableError.value = null
}

const submitDisable = async (payload: { pass: string; code: string }) => {
  disableLoading.value = true
  disableError.value = null
  try {
    const res = await $fetch<{ ok: boolean; enabled: boolean }>('/api/auth/totp/disable', {
      method: 'POST',
      body: {
        password: payload.pass,
        code: payload.code
      }
    })
    if (res?.ok) {
      is2faEnabled.value = false
      closeDisableModal()
      props.triggerToast?.('Autenticação em dois fatores desativada com sucesso.', 'success')
    }
  } catch (err: any) {
    disableError.value = err.data?.statusMessage || err.message || 'Dados incorretos.'
  } finally {
    disableLoading.value = false
  }
}

onMounted(() => {
  fetchStatus()
})
</script>
