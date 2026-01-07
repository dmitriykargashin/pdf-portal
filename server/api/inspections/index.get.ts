import type { Inspection } from '~/types'

export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  const session = await requireAuth(event)
  
  const query = getQuery(event)
  const agentId = query.agentId as string | undefined
  const status = query.status as string | undefined

  // If agent, only return their own inspections
  const effectiveAgentId = session.role === 'agent' ? session.agentId : agentId

  if (!effectiveAgentId && session.role === 'agent') {
    throw createError({
      statusCode: 400,
      message: 'Agent ID is required'
    })
  }

  const data = await inspectionsDb.search({ 
    agentId: effectiveAgentId, 
    status 
  })

  // Enrich with agent data
  const inspections = await Promise.all(data.map(async (row) => {
    const agent = await agentsDb.findById(row.agent_id)
    
    return {
      id: row.id,
      agentId: row.agent_id,
      inspectionDate: row.inspection_date,
      propertyAddress: row.property_address,
      status: row.status,
      inspectorName: row.inspector_name,
      notes: row.notes,
      createdAt: row.created_at,
      agent: agent ? {
        fullName: agent.full_name,
        email: agent.email,
        phone: agent.phone,
        brokerageName: agent.brokerage_name
      } : undefined
    }
  }))

  return { inspections }
})
