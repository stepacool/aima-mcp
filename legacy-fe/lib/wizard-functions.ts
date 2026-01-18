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
  .inputValidator(z.object({ 
    description: z.string(),
    openapiSchema: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const session = await getSession()
    return backend.wizardStart(session.user.id, data.description, data.openapiSchema)
  })

// Refine actions
export const refineActions = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ serverId: z.string(), feedback: z.string(), description: z.string().optional() }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.wizardRefine(data.serverId, data.feedback, data.description)
  })

// Select which tools to keep
export const confirmActions = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({ serverId: z.string(), selectedActions: z.array(z.string()) }),
  )
  .handler(async ({ data }) => {
    await getSession()
    return backend.wizardConfirmActions(data.serverId, data.selectedActions)
  })

// Configure auth
export const configureAuth = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      serverId: z.string(),
      authType: z.string(),
      authConfig: z.record(z.string(), z.any()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await getSession()
    return backend.wizardConfigureAuth(
      data.serverId,
      data.authType,
      data.authConfig,
    )
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
    return (await backend.wizardGetState(data.serverId)) as Record<string, any>
  })

// Activate on shared runtime (free tier)
export const activateServer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ serverId: z.string() }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.serverActivate(data.serverId)
  })

// Deploy to dedicated VPC (paid tier)
export const createVPS = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ serverId: z.string() }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.serverCreateVPS(data.serverId)
  })

// Get tier info
export const getTierInfo = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tier: z.string() }))
  .handler(async ({ data }) => {
    return backend.getTierInfo(data.tier)
  })

// === Server Management Functions ===

// List all servers for current user
export const listUserServers = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getSession()
    return backend.listServers(session.user.id)
  },
)

// Get full details for a specific server
export const getServerDetailsById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ serverId: z.string() }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.getServerDetails(data.serverId)
  })

// Delete a server
export const deleteServerById = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ serverId: z.string() }))
  .handler(async ({ data }) => {
    await getSession()
    return backend.deleteServer(data.serverId)
  })
