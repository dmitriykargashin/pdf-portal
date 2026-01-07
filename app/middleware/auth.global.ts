export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip auth check for login page
  if (to.path === '/login') {
    return
  }

  const { checkSession, isAuthenticated, isAdmin, agentId, user } = useAuth()
  
  // Only check session if we don't have user data yet or coming from login
  if (!user.value || from.path === '/login') {
    await checkSession()
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  // Check admin-only routes
  const adminRoutes = ['/admin', '/agents']
  const isAdminRoute = adminRoutes.some(route => to.path.startsWith(route))
  
  if (isAdminRoute && !isAdmin.value) {
    // Redirect agents to their portal
    return navigateTo('/portal')
  }

  // Check agent portal - agents can only access their own data
  if (to.path.startsWith('/portal') && !isAdmin.value && !agentId.value) {
    return navigateTo('/login')
  }
})
