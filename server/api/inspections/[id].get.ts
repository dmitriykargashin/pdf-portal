export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  const session = await requireAuth(event)
  
  const inspectionId = getRouterParam(event, 'id')
  
  if (!inspectionId) {
    throw createError({
      statusCode: 400,
      message: 'Inspection ID is required'
    })
  }

  const data = await inspectionsDb.findById(inspectionId)

  if (!data) {
    throw createError({
      statusCode: 404,
      message: 'Inspection not found'
    })
  }

  // Check agent access
  if (session.role === 'agent' && session.agentId !== data.agent_id) {
    throw createError({
      statusCode: 403,
      message: 'You do not have access to this inspection'
    })
  }

  // Get agent data
  const agent = await agentsDb.findById(data.agent_id)

  return {
    inspection: {
      id: data.id,
      agentId: data.agent_id,
      inspectionDate: data.inspection_date,
      propertyAddress: data.property_address,
      status: data.status,
      inspectorName: data.inspector_name,
      notes: data.notes,
      createdAt: data.created_at,
      agent: agent ? {
        fullName: agent.full_name,
        email: agent.email,
        phone: agent.phone,
        brokerageName: agent.brokerage_name
      } : undefined
    }
  }
})
