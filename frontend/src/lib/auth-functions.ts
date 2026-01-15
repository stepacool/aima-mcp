import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth'

// Get current user session
export const getSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest()
    if (!request) {
      return null
    }
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

// Get current user profile from session data
export async function getCurrentUser(): Promise<UserProfile | null> {
  // This function can be used client-side with the auth client
  // The actual implementation will use authClient.useSession() hook
  // This is a utility function for type safety and consistency
  return null // Client-side should use authClient.useSession() directly
}

// Get email verification status label
export function getEmailVerificationLabel(verified: boolean): string {
  return verified ? 'Verified' : 'Unverified'
}
