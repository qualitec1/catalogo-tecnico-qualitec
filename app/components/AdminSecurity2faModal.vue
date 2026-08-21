<template>
  <div>
    <!-- Modal: Setup 2FA (Multi-etapas) -->
    <div v-if="setupOpen" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
          <div class="flex items-center space-x-2">
            <span class="material-symbols-outlined text-blue-400">security</span>
            <h3 class="font-bold text-sm uppercase tracking-wider">Ativar Autenticação em 2 Fatores</h3>
          </div>
          <button @click="$emit('close-setup')" class="text-gray-400 hover:text-white transition-colors bg-transparent border-0 cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          <!-- Step 1: Confirmação de Senha -->
          <div v-if="setupStep === 1" class="space-y-4">
            <p class="text-xs text-slate-600 leading-relaxed">
              Por motivos de segurança, confirme a senha atual da sua conta administrativa antes de gerar a chave de segurança.
            </p>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 uppercase">Senha Atual</label>
              <input
                v-model="passwordInput"
                type="password"
                placeholder="Digite sua senha atual"
                class="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                @keyup.enter="handleSetupPassword"
              />
            </div>

            <div v-if="setupError" class="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {{ setupError }}
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button @click="$emit('close-setup')" class="px-4 py-2 text-xs uppercase font-bold text-slate-600 hover:bg-slate-100 rounded border border-gray-300">
                Cancelar
              </button>
              <button
                @click="handleSetupPassword"
                :disabled="setupLoading || !passwordInput"
                class="px-4 py-2 text-xs uppercase font-bold bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 flex items-center gap-1.5"
              >
                <span v-if="setupLoading" class="material-symbols-outlined text-sm animate-spin">sync</span>
                Continuar
              </button>
            </div>
          </div>

          <!-- Step 2: Escanear QR Code e Digitar Código -->
          <div v-else-if="setupStep === 2" class="space-y-4">
            <p class="text-xs text-slate-600">
              Abra seu aplicativo autenticador (Google Authenticator, Microsoft Authenticator) e escaneie o QR Code abaixo:
            </p>

            <div class="flex justify-center p-3 bg-slate-50 border border-gray-200 rounded-lg">
              <img v-if="setupQrUrl" :src="setupQrUrl" alt="QR Code 2FA" class="w-44 h-44 rounded" />
              <div v-else class="w-44 h-44 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                Carregando QR...
              </div>
            </div>

            <div class="space-y-1 bg-gray-50 p-2.5 rounded border border-gray-200">
              <span class="text-[11px] font-bold text-slate-600 block uppercase">Não consegue escanear? Digite a chave:</span>
              <div class="flex items-center justify-between">
                <code class="text-xs font-mono font-bold text-blue-700 tracking-wider select-all">{{ setupSecret }}</code>
                <button
                  @click="copySecret"
                  class="text-[11px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 border-0 bg-transparent cursor-pointer"
                >
                  <span class="material-symbols-outlined text-sm">{{ copiedSecret ? 'check' : 'content_copy' }}</span>
                  {{ copiedSecret ? 'Copiado!' : 'Copiar' }}
                </button>
              </div>
            </div>

            <div class="space-y-1.5 pt-2">
              <label class="block text-xs font-bold text-slate-700 uppercase">Código de 6 Dígitos do Aplicativo</label>
              <input
                v-model="setupCodeInput"
                type="text"
                maxlength="6"
                placeholder="000000"
                class="w-full text-center tracking-widest text-lg font-mono font-bold px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                @keyup.enter="handleSetupCode"
              />
            </div>

            <div v-if="setupError" class="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {{ setupError }}
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button @click="$emit('close-setup')" class="px-4 py-2 text-xs uppercase font-bold text-slate-600 hover:bg-slate-100 rounded border border-gray-300">
                Cancelar
              </button>
              <button
                @click="handleSetupCode"
                :disabled="setupLoading || setupCodeInput.length !== 6"
                class="px-4 py-2 text-xs uppercase font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded disabled:opacity-50 flex items-center gap-1.5"
              >
                <span v-if="setupLoading" class="material-symbols-outlined text-sm animate-spin">sync</span>
                Confirmar e Ativar 2FA
              </button>
            </div>
          </div>

          <!-- Step 3: Sucesso -->
          <div v-else-if="setupStep === 3" class="text-center py-4 space-y-3">
            <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <h4 class="text-sm font-bold text-slate-800 uppercase">2FA Ativado com Sucesso!</h4>
            <p class="text-xs text-slate-600 max-w-xs mx-auto">
              Sua conta agora está protegida. O código de 6 dígitos será solicitado nos próximos logins.
            </p>
            <div class="pt-2">
              <button @click="$emit('close-setup')" class="px-6 py-2 text-xs uppercase font-bold bg-slate-900 hover:bg-slate-800 text-white rounded">
                Concluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Desativar 2FA -->
    <div v-if="disableOpen" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200 overflow-hidden flex flex-col">
        <div class="bg-red-900 text-white p-4 flex justify-between items-center shrink-0">
          <div class="flex items-center space-x-2">
            <span class="material-symbols-outlined text-red-300">warning</span>
            <h3 class="font-bold text-sm uppercase tracking-wider">Desativar Autenticação em 2 Fatores</h3>
          </div>
          <button @click="$emit('close-disable')" class="text-gray-400 hover:text-white transition-colors bg-transparent border-0 cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <p class="text-xs text-slate-600 leading-relaxed">
            Ao desativar o 2FA, sua conta voltará a exigir apenas e-mail e senha no login. Digite sua senha atual e o código de 6 dígitos do aplicativo.
          </p>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase">Senha Atual</label>
            <input
              v-model="disablePassword"
              type="password"
              placeholder="Digite sua senha"
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase">Código 2FA Atual (6 dígitos)</label>
            <input
              v-model="disableCode"
              type="text"
              maxlength="6"
              placeholder="000000"
              class="w-full text-center tracking-widest text-lg font-mono font-bold px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div v-if="disableError" class="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {{ disableError }}
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button @click="$emit('close-disable')" class="px-4 py-2 text-xs uppercase font-bold text-slate-600 hover:bg-slate-100 rounded border border-gray-300">
              Cancelar
            </button>
            <button
              @click="handleDisable"
              :disabled="disableLoading || !disablePassword || disableCode.length !== 6"
              class="px-4 py-2 text-xs uppercase font-bold bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 flex items-center gap-1.5"
            >
              <span v-if="disableLoading" class="material-symbols-outlined text-sm animate-spin">sync</span>
              Confirmar Desativação
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  setupOpen: boolean
  setupStep: 1 | 2 | 3
  setupSecret: string
  setupQrUrl: string
  setupLoading: boolean
  setupError: string | null
  disableOpen: boolean
  disableLoading: boolean
  disableError: string | null
}>()

const emit = defineEmits<{
  (e: 'close-setup'): void
  (e: 'submit-password', pass: string): void
  (e: 'submit-code', code: string): void
  (e: 'close-disable'): void
  (e: 'submit-disable', payload: { pass: string; code: string }): void
}>()

const passwordInput = ref('')
const setupCodeInput = ref('')
const copiedSecret = ref(false)
const disablePassword = ref('')
const disableCode = ref('')

const handleSetupPassword = () => {
  if (!passwordInput.value) return
  emit('submit-password', passwordInput.value)
}

const handleSetupCode = () => {
  if (setupCodeInput.value.length !== 6) return
  emit('submit-code', setupCodeInput.value)
}

const copySecret = async () => {
  if (!props.setupSecret) return
  try {
    await navigator.clipboard.writeText(props.setupSecret)
    copiedSecret.value = true
    setTimeout(() => { copiedSecret.value = false }, 2000)
  } catch (e) {
    console.error('Failed to copy secret:', e)
  }
}

const handleDisable = () => {
  if (!disablePassword.value || disableCode.value.length !== 6) return
  emit('submit-disable', { pass: disablePassword.value, code: disableCode.value })
}
</script>
