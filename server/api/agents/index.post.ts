import type { AgentCreateInput } from '~/types'

export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  // Only admins can create agents
  await requireRole(event, ['admin'])

  const body = await readBody<AgentCreateInput>(event)

  // Validate required fields
  if (!body.fullName || !body.email || !body.phone || !body.brokerageName) {
    throw createError({
      statusCode: 400,
      message: 'Full name, email, phone, and brokerage name are required'
    })
  }

  const data = await agentsDb.create({
    full_name: body.fullName,
    email: body.email,
    phone: body.phone,
    brokerage_name: body.brokerageName,
    license_number: body.licenseNumber,
    address: body.address,
    status: body.status || 'active'
  })

  await auditLog(event, 'CREATE_AGENT', 'agent', data.id, {
    agentName: body.fullName,
    email: body.email
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
