import { ref, computed } from 'vue'

export interface AuthCredentials {
  email: string
  password: string
  totp?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: null | {
    id?: string
    email?: string
    email_confirmed_at?: string | null
  }
}

const authState = ref<AuthState>({
  isAuthenticated: false,
  user: null
})

export const useAuth = () => {
  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const user = computed(() => authState.value.user)

  const login = async (credentials: AuthCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Falha no login')
      }

      const data = await response.json()

      authState.value = {
        isAuthenticated: true,
        user: data.user || null
      }

      return true
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      authState.value = {
        isAuthenticated: false,
        user: null
      }
      return false
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    authState.value = {
      isAuthenticated: false,
      user: null
    }
  }

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (!response.ok) {
        authState.value = { isAuthenticated: false, user: null }
        return
      }

      const data = await response.json()
      authState.value = {
        isAuthenticated: true,
        user: data.user || null
      }
    } catch {
      authState.value = { isAuthenticated: false, user: null }
    }
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    fetchSession
  }
}
