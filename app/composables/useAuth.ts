import type { SessionUser, LoginCredentials, AuthSession } from '~/types'

export function useAuth() {
  const user = useState<SessionUser | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isAgent = computed(() => user.value?.role === 'agent')
  const agentId = computed(() => user.value?.agentId)

  /**
   * Check current session status
   */
  async function checkSession(): Promise<AuthSession> {
    try {
      const data = await $fetch('/api/auth/session')
      user.value = data.user
      return {
        user: data.user,
        isAuthenticated: data.authenticated
      }
    } catch {
      user.value = null
      return {
        user: null,
        isAuthenticated: false
      }
    }
  }

  /**
   * Login with credentials
   */
  async function login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const data = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      
      user.value = data.user
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Login failed'
      }
    }
  }

  /**
   * Logout current user
   */
  async function logout(): Promise<void> {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      await navigateTo('/login')
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    isAgent,
    agentId,
    checkSession,
    login,
    logout
  }
}
