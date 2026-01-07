// Auth type definitions
export type UserRole = 'admin' | 'agent'

export interface SessionUser {
  role: UserRole
  agentId?: string
  agentName?: string
}

export interface LoginCredentials {
  role: UserRole
  password?: string  // For admin login
  agentId?: string   // For agent login
  passcode?: string  // For agent login
}

export interface AuthSession {
  user: SessionUser | null
  isAuthenticated: boolean
}
