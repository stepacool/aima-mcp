import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth'

// Get current user session
export const getSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    return session
  },
)

// User profile type definition
export interface UserProfile {
  name: string
  email: string
  emailVerified: boolean
}

// Get email verification status label
export function getEmailVerificationLabel(verified: boolean): string {
  return verified ? 'Verified' : 'Unverified'
}
