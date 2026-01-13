import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import * as backend from '@/lib/backend-client'

// Get current session for auth checks
async function getSession() {
  const request = getRequest()
  if (!request) {
    throw new Error('Unauthorized')
  }
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

// Start wizard - describe system
export const startWizard = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ description: z.string() }))
  .handler(async ({ data }) => {
    const session = await getSession()
    return backend.wizardStart(session.user.id, data.description)
  })

// Refine actions
export const refineActions = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ serverId: z.string(), feedback: z.string() }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.wizardRefine(data.serverId, data.feedback)
  })

// Select which tools to keep
export const selectTools = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ serverId: z.string(), selectedToolNames: z.array(z.string()) }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.wizardSelectTools(data.serverId, data.selectedToolNames)
  })

// Configure auth
export const configureAuth = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ 
    serverId: z.string(), 
    authType: z.string(), 
    authConfig: z.record(z.unknown()).optional() 
  }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.wizardConfigureAuth(data.serverId, data.authType, data.authConfig)
  })

// Generate code
export const generateCode = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ serverId: z.string() }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.wizardGenerateCode(data.serverId)
  })

// Get wizard state
export const getWizardState = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ serverId: z.string() }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.wizardGetState(data.serverId)
  })

// Activate on shared runtime (free tier)
export const activateServer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ serverId: z.string() }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.serverActivate(data.serverId)
  })

// Deploy to dedicated VPC (paid tier)
export const deployServer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ serverId: z.string(), target: z.string().default('dedicated') }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.serverDeploy(data.serverId, data.target)
  })

// Get tier info
export const getTierInfo = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tier: z.string() }))
  .handler(async ({ data }) => {
    return backend.getTierInfo(data.tier)
  })
