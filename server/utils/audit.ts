import type { H3Event } from 'h3'
import type { AuditAction, AuditLogCreateInput, EntityType } from '~/types'

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  event: H3Event,
  input: AuditLogCreateInput
): Promise<void> {
  try {
    await auditLogsDb.create({
      actor_role: input.actorRole,
      actor_id: input.actorId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      metadata: input.metadata
    })
  } catch (error) {
    // Log error but don't throw - audit logging should not block operations
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Helper to create audit log from session
 */
export async function auditLog(
  event: H3Event,
  action: AuditAction,
  entityType: EntityType,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const session = await getUserSession(event)
  
  await createAuditLog(event, {
    actorRole: session?.role || 'admin',
    actorId: session?.agentId,
    action,
    entityType,
    entityId,
    metadata
  })
}
