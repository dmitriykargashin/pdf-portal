export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  // Only admins can view dashboard stats
  await requireRole(event, ['admin'])

  // Get all agents
  const agents = await agentsDb.findAll()
  const totalAgents = agents.length
  const activeAgents = agents.filter(a => a.status === 'active').length

  // Get inspections this month
  const inspectionsThisMonth = await inspectionsDb.countThisMonth()

  // Get total documents
  const documents = await documentsDb.findAll()
  const documentsUploaded = documents.length

  return {
    stats: {
      totalAgents,
      activeAgents,
      inspectionsThisMonth,
      documentsUploaded
    }
  }
})
