import type { LoginCredentials, SessionUser } from '~/types'

export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  const body = await readBody<LoginCredentials>(event)
  const config = useRuntimeConfig()

  if (!body.role) {
    throw createError({
      statusCode: 400,
      message: 'Role is required'
    })
  }

  // Admin login
  if (body.role === 'admin') {
    if (!body.password) {
      throw createError({
        statusCode: 400,
        message: 'Password is required for admin login'
      })
    }

    if (body.password !== config.adminPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid password'
      })
    }

    const user: SessionUser = {
      role: 'admin'
    }

    await createSession(event, user)
    await auditLog(event, 'LOGIN', 'session', undefined, { role: 'admin' })

    return { success: true, user }
  }

  // Agent login
  if (body.role === 'agent') {
    if (!body.agentId || !body.passcode) {
      throw createError({
        statusCode: 400,
        message: 'Email and passcode are required'
      })
    }

    if (body.passcode !== config.agentPasscode) {
      throw createError({
        statusCode: 401,
        message: 'Invalid passcode'
      })
    }

    // Verify agent exists - lookup by email (case-insensitive)
    const agent = await agentsDb.findByEmail(body.agentId.toLowerCase())

    if (!agent) {
      throw createError({
        statusCode: 401,
        message: 'Agent not found. Please check your email address.'
      })
    }

    const user: SessionUser = {
      role: 'agent',
      agentId: agent.id,
      agentName: agent.full_name
    }

    await createSession(event, user)
    await auditLog(event, 'LOGIN', 'session', agent.id, { role: 'agent', agentName: agent.full_name })

    return { success: true, user }
  }

  throw createError({
    statusCode: 400,
    message: 'Invalid role'
  })
})
