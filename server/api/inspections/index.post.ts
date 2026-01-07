import type { InspectionCreateInput } from '~/types'

export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  // Only admins can create inspections
  await requireRole(event, ['admin'])

  const body = await readBody<InspectionCreateInput>(event)

  // Validate required fields
  if (!body.agentId || !body.inspectionDate || !body.propertyAddress || !body.inspectorName) {
    throw createError({
      statusCode: 400,
      message: 'Agent ID, inspection date, property address, and inspector name are required'
    })
  }

  // Verify agent exists
  const agent = await agentsDb.findById(body.agentId)

  if (!agent) {
    throw createError({
      statusCode: 400,
      message: 'Invalid agent ID'
    })
  }

  const data = await inspectionsDb.create({
    agent_id: body.agentId,
    inspection_date: body.inspectionDate,
    property_address: body.propertyAddress,
    status: body.status || 'scheduled',
    inspector_name: body.inspectorName,
    notes: body.notes
  })

  await auditLog(event, 'CREATE_INSPECTION', 'inspection', data.id, {
    agentId: body.agentId,
    agentName: agent.full_name,
    propertyAddress: body.propertyAddress
  })

  return {
    inspection: {
      id: data.id,
      agentId: data.agent_id,
      inspectionDate: data.inspection_date,
      propertyAddress: data.property_address,
      status: data.status,
      inspectorName: data.inspector_name,
      notes: data.notes,
      createdAt: data.created_at
    }
  }
})
