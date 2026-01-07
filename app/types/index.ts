// Re-export all types
export * from './agent'
export * from './document'
export * from './inspection'
export * from './audit'
export * from './auth'

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Dashboard stats
export interface DashboardStats {
  totalAgents: number
  activeAgents: number
  inspectionsThisMonth: number
  documentsUploaded: number
}

export interface RecentActivity {
  id: string
  type: 'upload' | 'inspection' | 'agent'
  description: string
  timestamp: string
  actorRole: string
}
