import type { InspectionUpdateInput } from '~/types'

export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  // Only admins can update inspections
  await requireRole(event, ['admin'])

  const inspectionId = getRouterParam(event, 'id')
  
  if (!inspectionId) {
    throw createError({
      statusCode: 400,
      message: 'Inspection ID is required'
    })
  }

  const body = await readBody<Partial<InspectionUpdateInput>>(event)

  // Build update object
  const updateData: Record<string, unknown> = {}

  if (body.inspectionDate !== undefined) updateData.inspection_date = body.inspectionDate
  if (body.propertyAddress !== undefined) updateData.property_address = body.propertyAddress
  if (body.status !== undefined) updateData.status = body.status
  if (body.inspectorName !== undefined) updateData.inspector_name = body.inspectorName
  if (body.notes !== undefined) updateData.notes = body.notes

  const data = await inspectionsDb.update(inspectionId, updateData)

  if (!data) {
    throw createError({
      statusCode: 404,
      message: 'Inspection not found'
    })
  }

  await auditLog(event, 'UPDATE_INSPECTION', 'inspection', inspectionId, {
    updatedFields: Object.keys(body)
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
