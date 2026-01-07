import type { AgentUpdateInput } from '~/types'

export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  // Only admins can update agents
  await requireRole(event, ['admin'])

  const agentId = getRouterParam(event, 'id')
  
  if (!agentId) {
    throw createError({
      statusCode: 400,
      message: 'Agent ID is required'
    })
  }

  const body = await readBody<Partial<AgentUpdateInput>>(event)

  // Build update object
  const updateData: Record<string, unknown> = {}

  if (body.fullName !== undefined) updateData.full_name = body.fullName
  if (body.email !== undefined) updateData.email = body.email
  if (body.phone !== undefined) updateData.phone = body.phone
  if (body.brokerageName !== undefined) updateData.brokerage_name = body.brokerageName
  if (body.licenseNumber !== undefined) updateData.license_number = body.licenseNumber
  if (body.address !== undefined) updateData.address = body.address
  if (body.status !== undefined) updateData.status = body.status

  const data = await agentsDb.update(agentId, updateData)

  if (!data) {
    throw createError({
      statusCode: 404,
      message: 'Agent not found'
    })
  }

  await auditLog(event, 'UPDATE_AGENT', 'agent', agentId, {
    updatedFields: Object.keys(body)
  })

  return {
    agent: {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      brokerageName: data.brokerage_name,
      licenseNumber: data.license_number,
      address: data.address,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }
})
