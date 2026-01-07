export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  // Only admins can view dashboard activity
  await requireRole(event, ['admin'])

  // Get recent audit logs as activity
  const allLogs = await auditLogsDb.findAll()
  const filteredLogs = allLogs
    .filter(log => ['UPLOAD_DOC', 'CREATE_INSPECTION', 'CREATE_AGENT'].includes(log.action))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  const activity = filteredLogs.map(log => {
    let type: 'upload' | 'inspection' | 'agent' = 'agent'
    let description = ''

    switch (log.action) {
      case 'UPLOAD_DOC':
        type = 'upload'
        description = `Document "${log.metadata?.title || 'Unknown'}" uploaded`
        break
      case 'CREATE_INSPECTION':
        type = 'inspection'
        description = `Inspection created for ${log.metadata?.propertyAddress || 'Unknown address'}`
        break
      case 'CREATE_AGENT':
        type = 'agent'
        description = `Agent "${log.metadata?.agentName || 'Unknown'}" created`
        break
    }

    return {
      id: log.id,
      type,
      description,
      timestamp: log.created_at,
      actorRole: log.actor_role
    }
  })

  return { activity }
})
