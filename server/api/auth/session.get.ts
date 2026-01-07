export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  return {
    authenticated: !!session,
    user: session
  }
})
