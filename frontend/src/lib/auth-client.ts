import { createAuthClient } from 'better-auth/react'
import type { UserProfile } from './auth-functions'

export const authClient = createAuthClient()

// Helper to extract user profile from session
export function getUserProfileFromSession(session: { user?: { name?: string | null; email?: string | null; emailVerified?: boolean | null } } | null): UserProfile | null {
  if (!session?.user) {
    return null
  }

  const { name, email, emailVerified } = session.user

  if (!name || !email) {
    return null
  }

  return {
    name,
    email,
    emailVerified: emailVerified ?? false,
  }
}
