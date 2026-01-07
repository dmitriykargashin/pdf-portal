export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  // Only admins can delete agents
  await requireRole(event, ['admin'])

  const agentId = getRouterParam(event, 'id')
  
  if (!agentId) {
    throw createError({
      statusCode: 400,
      message: 'Agent ID is required'
    })
  }

  // Get agent info for audit log before deletion
  const agent = await agentsDb.findById(agentId)

  const deleted = await agentsDb.delete(agentId)

  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: 'Agent not found'
    })
  }

  await auditLog(event, 'DELETE_AGENT', 'agent', agentId, {
    agentName: agent?.full_name
  })

  return { success: true }
})
