import type { Agent } from '~/types'

export default defineEventHandler(async (event) => {
  // Initialize database on first request
  await initializeDatabase()
  
  // Require admin role to list all agents
  const session = await requireAuth(event)
  
  const query = getQuery(event)
  const search = query.search as string | undefined
  const status = query.status as string | undefined

  let agents: any[]
  
  // If agent, only return their own data
  if (session.role === 'agent' && session.agentId) {
    const agent = await agentsDb.findById(session.agentId)
    agents = agent ? [agent] : []
  } else {
    agents = await agentsDb.search({ search, status })
  }

  // Transform snake_case to camelCase
  const transformedAgents: Agent[] = agents.map(row => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    brokerageName: row.brokerage_name,
    licenseNumber: row.license_number,
    address: row.address,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))

  return { agents: transformedAgents }
})
