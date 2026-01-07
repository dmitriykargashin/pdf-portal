import type { AuditLog } from '~/types'

export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  // Only admins can view audit logs
  await requireRole(event, ['admin'])
  
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 50
  const entityType = query.entityType as string | undefined
  const action = query.action as string | undefined

  const data = await auditLogsDb.search({ 
    entityType, 
    action, 
    limit 
  })

  const logs: AuditLog[] = data.map(row => ({
    id: row.id,
    actorRole: row.actor_role,
    actorId: row.actor_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata,
    createdAt: row.created_at
  }))

  return { logs }
})
