<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center space-x-3">
          <span class="material-symbols-outlined text-slate-800 text-2xl">manage_accounts</span>
          <h2 class="text-base font-bold uppercase tracking-wider text-slate-800">
            Administradores do Sistema
          </h2>
        </div>
        <p class="text-xs text-slate-500">
          Gerencie os membros da equipe com acesso ao painel e envie convites por e-mail.
        </p>
      </div>

      <!-- Action Button (Apenas Master Admin) -->
      <div>
        <button
          v-if="isMasterAdmin"
          @click="openInviteModal"
          class="bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold px-4 py-2.5 rounded shadow-sm flex items-center gap-1.5 transition-colors border-0 cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">person_add</span>
          Adicionar Administrador
        </button>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-lg animate-spin text-blue-600">sync</span>
        Carregando lista de administradores...
      </div>

      <div v-else-if="users.length === 0" class="p-8 text-center text-xs text-slate-500">
        Nenhum administrador encontrado.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th class="py-3 px-4">Administrador</th>
              <th class="py-3 px-4">Nível de Acesso</th>
              <th class="py-3 px-4">Status da Conta</th>
              <th class="py-3 px-4">2FA / TOTP</th>
              <th class="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-xs">
            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/80 transition-colors">
              <!-- Name & Email -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-800">{{ user.fullName }}</div>
                <div class="text-[11px] text-slate-500 font-mono">{{ user.email }}</div>
              </td>

              <!-- Role Badge -->
              <td class="py-3.5 px-4">
                <span
                  :class="user.role === 'master_admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'"
                  class="px-2.5 py-1 text-[11px] font-bold rounded-full border inline-flex items-center gap-1 shadow-xs"
                >
                  <span class="material-symbols-outlined text-xs">{{ user.role === 'master_admin' ? 'stars' : 'shield' }}</span>
                  {{ user.role === 'master_admin' ? 'Master Admin' : 'Administrador' }}
                </span>
              </td>

              <!-- Account Status Badge -->
              <td class="py-3.5 px-4">
                <span
                  v-if="user.isPending"
                  class="bg-amber-50 text-amber-700 border-amber-200 px-2.5 py-1 text-[11px] font-bold rounded-full border inline-flex items-center gap-1"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Convite Pendente
                </span>
                <span
                  v-else-if="user.isActive"
                  class="bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-1 text-[11px] font-bold rounded-full border inline-flex items-center gap-1"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Ativo
                </span>
                <span
                  v-else
                  class="bg-slate-100 text-slate-600 border-slate-200 px-2.5 py-1 text-[11px] font-bold rounded-full border inline-flex items-center gap-1"
                >
                  Inativo
                </span>
              </td>

              <!-- 2FA Badge -->
              <td class="py-3.5 px-4">
                <span
                  :class="user.totpEnabled ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-50 border-slate-200'"
                  class="px-2 py-0.5 text-[10px] font-bold rounded border inline-flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-xs">{{ user.totpEnabled ? 'lock' : 'lock_open' }}</span>
                  {{ user.totpEnabled ? 'Ativado' : 'Não configurado' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="inline-flex items-center gap-2">
                  <!-- Reenviar Convite (Se Pendente) -->
                  <button
                    v-if="user.isPending && isMasterAdmin"
                    @click="handleResendInvite(user.email)"
                    :disabled="resendingEmail === user.email"
                    class="text-[11px] uppercase font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span v-if="resendingEmail === user.email" class="material-symbols-outlined text-xs animate-spin">sync</span>
                    <span v-else class="material-symbols-outlined text-xs">send</span>
                    Reenviar
                  </button>

                  <!-- Toggle Ativo/Inativo -->
                  <button
                    v-if="!user.isPending && isMasterAdmin && user.id !== currentUserId"
                    @click="handleToggleStatus(user)"
                    :disabled="updatingUserId === user.id"
                    :class="user.isActive ? 'text-red-700 bg-red-50 hover:bg-red-100 border-red-200' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'"
                    class="text-[11px] uppercase font-bold border px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    {{ user.isActive ? 'Desativar' : 'Ativar' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Adicionar Administrador -->
    <div v-if="inviteModalOpen" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200 overflow-hidden flex flex-col">
        <div class="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
          <div class="flex items-center space-x-2">
            <span class="material-symbols-outlined text-blue-400">person_add</span>
            <h3 class="font-bold text-sm uppercase tracking-wider">Convidar Administrador</h3>
          </div>
          <button @click="closeInviteModal" class="text-gray-400 hover:text-white transition-colors bg-transparent border-0 cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form class="p-6 space-y-4" @submit.prevent="handleSubmitInvite">
          <p class="text-xs text-slate-600 leading-relaxed">
            O novo administrador receberá um link oficial de convite por e-mail para criar sua própria senha com segurança.
          </p>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase">Nome Completo</label>
            <input
              v-model="inviteName"
              type="text"
              required
              placeholder="Ex: Marco Silva"
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase">E-mail Corporativo</label>
            <input
              v-model="inviteEmail"
              type="email"
              required
              placeholder="marco@qualitec.ind.br"
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase">Nível de Acesso</label>
            <select
              v-model="inviteRole"
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="admin">Administrador</option>
              <option value="master_admin">Master Admin</option>
            </select>
          </div>

          <div v-if="inviteError" class="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {{ inviteError }}
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button @click="closeInviteModal" type="button" class="px-4 py-2 text-xs uppercase font-bold text-slate-600 hover:bg-slate-100 rounded border border-gray-300">
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="inviteLoading || !inviteName || !inviteEmail"
              class="px-4 py-2 text-xs uppercase font-bold bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <span v-if="inviteLoading" class="material-symbols-outlined text-sm animate-spin">sync</span>
              Enviar Convite
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  triggerToast?: (message: string, type: 'success' | 'error') => void
}>()

const users = ref<any[]>([])
const loading = ref(false)
const isMasterAdmin = ref(false)
const currentUserId = ref('')

const inviteModalOpen = ref(false)
const inviteName = ref('')
const inviteEmail = ref('')
const inviteRole = ref<'admin' | 'master_admin'>('admin')
const inviteLoading = ref(false)
const inviteError = ref<string | null>(null)

const resendingEmail = ref<string | null>(null)
const updatingUserId = ref<string | null>(null)

const fetchUsers = async () => {
  loading.value = true
  try {
    const sessionRes = await $fetch<any>('/api/auth/session')
    isMasterAdmin.value = Boolean(sessionRes?.isMasterAdmin)
    currentUserId.value = sessionRes?.user?.id || ''

    const res = await $fetch<{ success: boolean; users: any[] }>('/api/admin/users')
    if (res?.success) {
      users.value = res.users || []
    }
  } catch (err: any) {
    console.error('Failed to fetch admin users:', err)
  } finally {
    loading.value = false
  }
}

const openInviteModal = () => {
  inviteName.value = ''
  inviteEmail.value = ''
  inviteRole.value = 'admin'
  inviteError.value = null
  inviteModalOpen.value = true
}

const closeInviteModal = () => {
  inviteModalOpen.value = false
  inviteError.value = null
}

const handleSubmitInvite = async () => {
  if (!inviteName.value || !inviteEmail.value) return
  inviteLoading.value = true
  inviteError.value = null
  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/users/invite', {
      method: 'POST',
      body: {
        name: inviteName.value,
        email: inviteEmail.value,
        role: inviteRole.value
      }
    })
    if (res?.success) {
      props.triggerToast?.(res.message || 'Convite enviado com sucesso!', 'success')
      closeInviteModal()
      await fetchUsers()
    }
  } catch (err: any) {
    inviteError.value = err.data?.statusMessage || err.message || 'Falha ao enviar convite.'
  } finally {
    inviteLoading.value = false
  }
}

const handleResendInvite = async (email: string) => {
  resendingEmail.value = email
  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/users/resend-invite', {
      method: 'POST',
      body: { email }
    })
    if (res?.success) {
      props.triggerToast?.(res.message || 'Convite reenviado com sucesso.', 'success')
    }
  } catch (err: any) {
    props.triggerToast?.(err.data?.statusMessage || 'Erro ao reenviar convite.', 'error')
  } finally {
    resendingEmail.value = null
  }
}

const handleToggleStatus = async (user: any) => {
  updatingUserId.value = user.id
  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/users/status', {
      method: 'PATCH',
      body: {
        userId: user.id,
        isActive: !user.isActive
      }
    })
    if (res?.success) {
      user.isActive = !user.isActive
      props.triggerToast?.(res.message || 'Status atualizado com sucesso.', 'success')
    }
  } catch (err: any) {
    props.triggerToast?.(err.data?.statusMessage || 'Erro ao atualizar status.', 'error')
  } finally {
    updatingUserId.value = null
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
