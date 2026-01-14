/**
 * Backend client for calling Python backend from server functions
 * This runs server-side only
 */

import { env } from '@/env'

const BACKEND_URL = env.VITE_BACKEND_URL

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
  headers?: Record<string, string>
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`
  const config: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  if (options.body) {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

// Types matching backend schemas
export interface Action {
  name: string
  description: string
  parameters: Array<{ name: string; type: string; required?: boolean }>
  auth_required: boolean
}

export interface StartWizardResponse {
  server_id: string
  server_name: string
  description: string
  actions: Array<Action>
}

export interface RefineResponse {
  server_id: string
  actions: Array<Action>
}

export interface GenerateCodeResponse {
  server_id: string
  tools: Array<{ id: string; name: string; description: string; has_code: boolean }>
}

export interface ActivateResponse {
  server_id: string
  status: string
  mcp_endpoint: string
  tools_count: number
}

export interface CreateVPSResponse {
  server_id: string
  ip_address: string
  status: string
  message: string
}

export interface TierInfo {
  tier: string
  max_tools: number
  can_deploy: boolean
  curated_only: boolean
  curated_libraries: Array<string>
}

// Wizard API
export async function wizardStart(customerId: string, description: string): Promise<StartWizardResponse> {
  return request('/api/wizard/start', {
    method: 'POST',
    body: { customer_id: customerId, description },
  })
}

export async function wizardRefine(serverId: string, feedback: string): Promise<RefineResponse> {
  return request(`/api/wizard/${serverId}/refine`, {
    method: 'POST',
    body: { feedback },
  })
}

export async function wizardConfirmActions(serverId: string, selectedActions: Array<string>): Promise<void> {
  return request(`/api/wizard/${serverId}/tools/select`, {
    method: 'POST',
    body: { selected_tool_names: selectedActions },
  })
}

export async function wizardConfigureAuth(
  serverId: string,
  authType: string,
  authConfig?: Record<string, unknown>
): Promise<void> {
  return request(`/api/wizard/${serverId}/auth`, {
    method: 'POST',
    body: { auth_type: authType, auth_config: authConfig },
  })
}

export async function wizardGenerateCode(serverId: string): Promise<GenerateCodeResponse> {
  return request(`/api/wizard/${serverId}/generate-code`, {
    method: 'POST',
  })
}

export async function wizardGetState(serverId: string): Promise<Record<string, unknown>> {
  return request(`/api/wizard/${serverId}`)
}

// Server API
export async function serverActivate(serverId: string): Promise<ActivateResponse> {
  return request(`/api/servers/${serverId}/activate`, {
    method: 'POST',
  })
}

export async function serverCreateVPS(serverId: string): Promise<CreateVPSResponse> {
  return request(`/api/servers/${serverId}/create-vps`, {
    method: 'POST',
    body: { server_id: serverId },
  })
}

export async function getTierInfo(tier: string): Promise<TierInfo> {
  return request(`/api/servers/tier-info/${tier}`)
}
