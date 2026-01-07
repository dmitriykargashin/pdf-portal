// Audit log type definitions
export type AuditAction = 
  | 'UPLOAD_DOC' 
  | 'DELETE_DOC' 
  | 'CREATE_INSPECTION' 
  | 'UPDATE_INSPECTION'
  | 'CREATE_AGENT' 
  | 'UPDATE_AGENT'
  | 'DELETE_AGENT'
  | 'LOGIN'
  | 'LOGOUT'

export type EntityType = 'agent' | 'document' | 'inspection' | 'session'

export interface AuditLog {
  id: string
  actorRole: 'admin' | 'agent'
  actorId?: string
  action: AuditAction
  entityType: EntityType
  entityId?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface AuditLogCreateInput {
  actorRole: 'admin' | 'agent'
  actorId?: string
  action: AuditAction
  entityType: EntityType
  entityId?: string
  metadata?: Record<string, unknown>
}
