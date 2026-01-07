import type { Agent } from '~/types'

export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  const agentId = getRouterParam(event, 'id')
  
  if (!agentId) {
    throw createError({
      statusCode: 400,
      message: 'Agent ID is required'
    })
  }

  // Check access permissions
  await requireAgentAccess(event, agentId)

  const data = await agentsDb.findById(agentId)

  if (!data) {
    throw createError({
      statusCode: 404,
      message: 'Agent not found'
    })
  }

  const agent: Agent = {
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

  return { agent }
})
