export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (session) {
    await auditLog(event, 'LOGOUT', 'session', session.agentId, { role: session.role })
  }
  
  await destroySession(event)
  
  return { success: true }
})
