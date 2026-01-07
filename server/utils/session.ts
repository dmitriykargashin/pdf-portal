import type { H3Event } from 'h3'
import type { SessionUser, UserRole } from '~/types'

const SESSION_COOKIE_NAME = 'agent-portal-session'

/**
 * Get current session from cookie
 */
export async function getUserSession(event: H3Event): Promise<SessionUser | null> {
  const cookie = getCookie(event, SESSION_COOKIE_NAME)
  
  if (!cookie) {
    return null
  }

  try {
    // Decode and parse the session
    const decoded = Buffer.from(cookie, 'base64').toString('utf-8')
    const session = JSON.parse(decoded) as SessionUser
    return session
  } catch {
    // Invalid cookie, clear it
    deleteCookie(event, SESSION_COOKIE_NAME)
    return null
  }
}

/**
 * Create a new session
 */
export async function createSession(
  event: H3Event,
  user: SessionUser
): Promise<void> {
  const encoded = Buffer.from(JSON.stringify(user)).toString('base64')
  
  setCookie(event, SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

/**
 * Destroy current session
 */
export async function destroySession(event: H3Event): Promise<void> {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    path: '/'
  })
}

/**
 * Require authentication - throws 401 if not authenticated
 */
export async function requireAuth(event: H3Event): Promise<SessionUser> {
  const session = await getUserSession(event)
  
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required'
    })
  }

  return session
}

/**
 * Require specific role - throws 403 if role doesn't match
 */
export async function requireRole(
  event: H3Event,
  allowedRoles: UserRole[]
): Promise<SessionUser> {
  const session = await requireAuth(event)
  
  if (!allowedRoles.includes(session.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Insufficient permissions'
    })
  }

  return session
}

/**
 * Check if user can access agent data
 * Admin can access all, agent can only access their own
 */
export async function requireAgentAccess(
  event: H3Event,
  agentId: string
): Promise<SessionUser> {
  const session = await requireAuth(event)
  
  if (session.role === 'admin') {
    return session
  }

  if (session.role === 'agent' && session.agentId === agentId) {
    return session
  }

  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden',
    message: 'You do not have access to this agent\'s data'
  })
}
