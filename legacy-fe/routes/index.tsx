import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'

import type { Action } from '@/lib/backend-client'
import { WizardProgress } from '@/components/wizard/WizardProgress'
import { WizardProgressIndicator } from '@/components/wizard/WizardProgressIndicator'
import { ActionCard } from '@/components/wizard/ActionCard'
import { env } from '@/env'

import {
  activateServer,
  configureAuth,
  confirmActions,
  createVPS,
  generateCode,
  getTierInfo,
  getWizardState,
  refineActions,
  startWizard,
} from '@/lib/wizard-functions'
import { getSession } from '@/lib/auth-functions'

// Wizard step to frontend step mapping
const WIZARD_STEP_MAP: Record<string, number> = {
  describe: 1,
  actions: 2,
  auth: 3,
  deploy: 4,
  complete: 5,
}

const searchSchema = z.object({
  serverId: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
  component: WizardPage,
})

interface GeneratedTool {
  id: string
  name: string
  description: string
}

interface WizardState {
  currentStep: number
  serverId: string | null
  serverName: string
  serverDescription: string
  actions: Array<Action>
  selectedActions: Array<string>
  authType: 'none' | 'ephemeral' | 'oauth'
  oauthConfig: {
    providerUrl: string
    clientId: string
    scopes: string
  }
  selectedTier: 'free' | 'paid'
  generatedTools: Array<GeneratedTool>
  result: {
    serverId?: string
    mcpEndpoint?: string
    toolsCount?: number
    message?: string
    status?: string
    ipAddress?: string
  } | null
}

function WizardPage() {
  const { serverId: initialServerId } = Route.useSearch()
  const navigate = useNavigate()

  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    serverId: initialServerId || null,
    serverName: '',
    serverDescription: '',
    actions: [],
    selectedActions: [],
    authType: 'none',
    oauthConfig: { providerUrl: '', clientId: '', scopes: '' },
    selectedTier: 'free',
    generatedTools: [],
    result: null,
  })

  const [description, setDescription] = useState('')
  const [refineInput, setRefineInput] = useState('')
  const [openapiFile, setOpenapiFile] = useState<File | null>(null)
  const [openapiSchema, setOpenapiSchema] = useState<string | null>(null)

  // Query: Get Wizard State (Resuming)
  const { data: serverState, isLoading: isLoadingState } = useQuery({
    queryKey: ['wizardState', initialServerId],
    queryFn: () => getWizardState({ data: { serverId: initialServerId! } }),
    enabled: !!initialServerId && state.currentStep === 1 && !state.serverName,
  })

  // Sync server state to local state when loaded
  useEffect(() => {
    if (serverState) {
      console.log('Restoring wizard state:', serverState)
      const step = WIZARD_STEP_MAP[serverState.wizard_step as string] || 1
      const tools = (serverState.tools || []) as Array<any>

      let actions: Array<Action> = []
      let generatedTools: Array<GeneratedTool> = []
      let selectedActions: Array<string> = []

      if (step >= 2) {
        actions = tools.map((t: any) => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters || [],
          auth_required: false,
        }))
        // Default selection logic if resuming step 2
        selectedActions = actions.slice(0, 3).map((a) => a.name)
      }

      if (step >= 4) {
        generatedTools = tools.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
        }))
      }

      setState((s) => ({
        ...s,
        currentStep: step,
        serverId: initialServerId || null,
        serverName: serverState.name as string,
        serverDescription: (serverState.description as string) || '',
        authType: (serverState.auth_type) || 'none',
        oauthConfig: (serverState.auth_config) || {
          providerUrl: '',
          clientId: '',
          scopes: '',
        },
        actions,
        selectedActions,
        generatedTools,
      }))

      const userPrompt = (serverState.meta?.user_prompt as string) || (serverState.user_prompt as string)
      if (userPrompt) {
        setDescription(userPrompt)
      } else if (step === 1 && serverState.description) {
        setDescription(serverState.description as string)
      }

      // Restore OpenAPI schema if present in draft
      const savedSchema = serverState.meta?.openapi_schema as string | undefined
      if (savedSchema) {
        setOpenapiSchema(savedSchema)
        // Create a virtual file object to show the user that a schema was loaded
        setOpenapiFile(new File([savedSchema], 'openapi-schema.json', { type: 'application/json' }))
      }
    }
  }, [serverState, initialServerId])

  // Query: Get Tier Info
  const { data: tierInfo } = useQuery({
    queryKey: ['tierInfo', 'free'],
    queryFn: () => getTierInfo({ data: { tier: 'free' } }),
    enabled: state.currentStep === 4,
  })

  // Mutation: Start Wizard
  const startWizardMutation = useMutation({
    mutationFn: ({ desc, schema }: { desc: string; schema?: string }) => 
      startWizard({ data: { description: desc, openapiSchema: schema } }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: 2,
        serverId: result.server_id,
        serverName: result.server_name,
        serverDescription: result.description,
        actions: result.actions,
        selectedActions: result.actions.slice(0, 3).map((a) => a.name),
      }))
    },
    onError: (error) => toast.error('Error', { description: error.message }),
  })

  // Mutation: Refine Actions
  const refineActionsMutation = useMutation({
    mutationFn: ({
      serverId,
      feedback,
      description: descriptionParam,
    }: {
      serverId: string
      feedback: string
      description?: string
    }) => refineActions({ data: { serverId, feedback, description: descriptionParam } }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: s.currentStep === 1 ? 2 : s.currentStep, // Move to step 2 if coming from step 1
        actions: result.actions,
        selectedActions: result.actions.slice(0, 3).map((a) => a.name), // Auto-select first 3 actions
      }))
      setRefineInput('')
    },
    onError: (error) => toast.error('Error', { description: error.message }),
  })

  // Mutation: Confirm Actions
  const confirmActionsMutation = useMutation({
    mutationFn: ({
      serverId,
      selectedActions,
    }: {
      serverId: string
      selectedActions: Array<string>
    }) => confirmActions({ data: { serverId, selectedActions } }),
    onSuccess: () => {
      setState((s) => ({ ...s, currentStep: 3 }))
    },
    onError: (error) => toast.error('Error', { description: error.message }),
  })

  // Mutation: Configure Auth & Generate Code
  // Combined for simplicity in UI flow, but better to chain properly
  const generateCodeMutation = useMutation({
    mutationFn: (serverId: string) => generateCode({ data: { serverId } }),
  })

  const configureAuthMutation = useMutation({
    mutationFn: async ({
      serverId,
      authType,
      authConfig,
    }: {
      serverId: string
      authType: string
      authConfig?: any
    }) => {
      await configureAuth({ data: { serverId, authType, authConfig } })
      return generateCodeMutation.mutateAsync(serverId)
    },
    onSuccess: (codeResult) => {
      setState((s) => ({
        ...s,
        currentStep: 4,
        generatedTools: codeResult.tools.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
        })),
      }))
    },
    onError: (error) => toast.error('Error', { description: error.message }),
  })

  // Mutation: Activate Server
  const activateServerMutation = useMutation({
    mutationFn: (serverId: string) => activateServer({ data: { serverId } }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: 5,
        result: {
          serverId: result.server_id,
          mcpEndpoint: result.mcp_endpoint,
          toolsCount: result.tools_count,
          status: result.status,
        },
      }))
    },
    onError: (error) => toast.error('Error', { description: error.message }),
  })

  // Mutation: Create VPS
  const createVPSMutation = useMutation({
    mutationFn: (serverId: string) => createVPS({ data: { serverId } }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: 5,
        result: {
          serverId: result.server_id,
          message: result.message,
          status: result.status,
          ipAddress: result.ip_address,
        },
      }))
    },
    onError: (error) => toast.error('Error', { description: error.message }),
  })

  // Handlers
  function handleDescribe() {
    if (!description.trim()) return
    
    // If we already have a serverId, refine the existing draft instead of creating a new one
    if (state.serverId) {
      refineActionsMutation.mutate({
        serverId: state.serverId,
        feedback: `Update the server based on this new description: ${description}`,
        description: description,
      })
    } else {
      // Create new draft with optional OpenAPI schema
      startWizardMutation.mutate({ 
        desc: description, 
        schema: openapiSchema || undefined 
      })
    }
  }

  // Handle OpenAPI file selection
  async function handleOpenapiFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      setOpenapiFile(null)
      setOpenapiSchema(null)
      return
    }

    // Validate file type
    const validTypes = ['application/json', 'application/x-yaml', 'text/yaml', 'text/x-yaml']
    const isValidType = validTypes.includes(file.type) || 
      file.name.endsWith('.json') || 
      file.name.endsWith('.yaml') || 
      file.name.endsWith('.yml')
    
    if (!isValidType) {
      toast.error('Invalid file type', { description: 'Please upload a JSON or YAML file' })
      e.target.value = ''
      return
    }

    setOpenapiFile(file)
    
    try {
      const content = await file.text()
      setOpenapiSchema(content)
      toast.success('File loaded', { description: file.name })
    } catch {
      toast.error('Failed to read file')
      setOpenapiFile(null)
      setOpenapiSchema(null)
    }
  }

  function clearOpenapiFile() {
    setOpenapiFile(null)
    setOpenapiSchema(null)
  }

  function handleRefine() {
    if (!refineInput.trim() || !state.serverId) return
    refineActionsMutation.mutate({
      serverId: state.serverId,
      feedback: refineInput,
    })
  }

  function toggleAction(name: string) {
    setState((s) => {
      if (s.selectedActions.includes(name)) {
        return {
          ...s,
          selectedActions: s.selectedActions.filter((n) => n !== name),
        }
      }
      if (s.selectedTier === 'free' && s.selectedActions.length >= 3) {
        toast.error('Free tier limited to 3 actions')
        return s
      }
      return { ...s, selectedActions: [...s.selectedActions, name] }
    })
  }

  function handleConfirmActions() {
    if (!state.serverId || state.selectedActions.length === 0) return
    confirmActionsMutation.mutate({
      serverId: state.serverId,
      selectedActions: state.selectedActions,
    })
  }

  function handleConfirmAuth() {
    if (!state.serverId) return
    const authConfig =
      state.authType === 'oauth'
        ? {
            providerUrl: state.oauthConfig.providerUrl,
            clientId: state.oauthConfig.clientId,
            scopes: state.oauthConfig.scopes.split(',').map((s) => s.trim()),
          }
        : undefined

    configureAuthMutation.mutate({
      serverId: state.serverId,
      authType: state.authType,
      authConfig,
    })
  }

  function handleActivate() {
    if (!state.serverId) return
    activateServerMutation.mutate(state.serverId)
  }

  function handleDeploy() {
    if (!state.serverId) return
    createVPSMutation.mutate(state.serverId)
  }

  function handleStartOver() {
    setState({
      currentStep: 1,
      serverId: null,
      serverName: '',
      serverDescription: '',
      actions: [],
      selectedActions: [],
      authType: 'none',
      oauthConfig: { providerUrl: '', clientId: '', scopes: '' },
      selectedTier: 'free',
      generatedTools: [],
      result: null,
    })
    setDescription('')
    // tierInfo cache is managed by Query, no need to clear manually unless desired
  }

  // Derive loading states for each step
  const isLoadingStep1 = isLoadingState || startWizardMutation.isPending || refineActionsMutation.isPending
  const isLoadingStep2 = refineActionsMutation.isPending || confirmActionsMutation.isPending
  const isLoadingStep3 = configureAuthMutation.isPending || generateCodeMutation.isPending
  const isLoadingStep4 = activateServerMutation.isPending || createVPSMutation.isPending

  // Determine which step is currently loading for progress indicator
  const loadingStep = isLoadingStep1 ? 1 : isLoadingStep2 ? 2 : isLoadingStep3 ? 3 : isLoadingStep4 ? 4 : null

  // Determine which steps are unlocked based on available data
  const unlockedSteps: Array<number> = []
  // Step 1 is always unlocked (can always go back to describe)
  unlockedSteps.push(1)
  // Step 2 is unlocked if we have actions/tools (serverName indicates we've started)
  if (state.actions.length > 0 || state.serverName) {
    unlockedSteps.push(2)
  }
  // Step 3 is unlocked if actions have been confirmed (selectedActions exist)
  if (state.selectedActions.length > 0) {
    unlockedSteps.push(3)
  }
  // Step 4 is unlocked if code has been generated (generatedTools exist)
  if (state.generatedTools.length > 0) {
    unlockedSteps.push(4)
  }

  // Handler for clicking on wizard steps
  function handleStepClick(step: number) {
    if (!unlockedSteps.includes(step)) return
    setState((s) => ({ ...s, currentStep: step }))
  }

  // Loading text for each step
  const getLoadingText = (step: number) => {
    if (step === 1) {
      if (startWizardMutation.isPending) return 'Analyzing your requirements...'
      if (refineActionsMutation.isPending) return 'Updating actions...'
      if (isLoadingState) return 'Resuming setup...'
    }
    if (step === 2) {
      if (refineActionsMutation.isPending) return 'Updating actions...'
      if (confirmActionsMutation.isPending) return 'Confirming tool selection...'
    }
    if (step === 3) {
      if (configureAuthMutation.isPending) return 'Configuring authentication...'
      if (generateCodeMutation.isPending) return 'Generating tool code...'
    }
    if (step === 4) {
      if (activateServerMutation.isPending) return 'Activating on shared runtime...'
      if (createVPSMutation.isPending) return 'Deploying to dedicated VPC...'
    }
    return 'Processing...'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            AutoMCP
          </h1>
          <p className="text-slate-400 mt-2">
            Build MCP servers through conversation
          </p>
        </header>

        <WizardProgress 
          currentStep={state.currentStep} 
          loadingStep={loadingStep}
          unlockedSteps={unlockedSteps}
          onStepClick={handleStepClick}
        />

        <main className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          {/* Step 1: Describe */}
          {state.currentStep === 1 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">
                  What should your MCP server do?
                </h2>
                {isLoadingStep1 && (
                  <WizardProgressIndicator
                    text={getLoadingText(1)}
                    variant="badge"
                  />
                )}
              </div>
              <p className="text-slate-400 mb-4">
                Describe the system or service you want to create.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: A server that manages my GitHub repositories..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white placeholder:text-slate-500 resize-y min-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={startWizardMutation.isPending}
              />
              
              {/* OpenAPI File Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  OpenAPI Schema (optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 relative">
                    <input
                      type="file"
                      accept=".json,.yaml,.yml,application/json,application/x-yaml"
                      onChange={handleOpenapiFileChange}
                      disabled={startWizardMutation.isPending}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>{openapiFile ? openapiFile.name : 'Upload OpenAPI spec'}</span>
                    </div>
                  </label>
                  {openapiFile && (
                    <button
                      type="button"
                      onClick={clearOpenapiFile}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {openapiSchema && (
                  <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Schema loaded ({Math.round(openapiSchema.length / 1024)}KB)
                  </p>
                )}
              </div>

              <button
                onClick={handleDescribe}
                disabled={!description.trim() || startWizardMutation.isPending}
                className="mt-4 w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {startWizardMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Generate Actions'
                )}
              </button>
            </section>
          )}

          {/* Step 2: Actions */}
          {state.currentStep === 2 && (
            <section>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-semibold text-indigo-400">
                  {state.serverName}
                </h2>
                {isLoadingStep2 && (
                  <WizardProgressIndicator
                    text={getLoadingText(2)}
                    variant="badge"
                  />
                )}
              </div>
              <p className="text-slate-400 mb-4">{state.serverDescription}</p>

              <div className="space-y-3 mb-4">
                {state.actions.map((action) => (
                  <ActionCard
                    key={action.name}
                    action={action}
                    selected={state.selectedActions.includes(action.name)}
                    disabled={confirmActionsMutation.isPending}
                    onToggle={() => toggleAction(action.name)}
                  />
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={refineInput}
                  onChange={(e) => setRefineInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !refineActionsMutation.isPending && handleRefine()}
                  placeholder="Add more actions or modify..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={refineActionsMutation.isPending}
                />
                <button
                  onClick={handleRefine}
                  disabled={!refineInput.trim() || refineActionsMutation.isPending}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                >
                  {refineActionsMutation.isPending ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Refine'
                  )}
                </button>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setState((s) => ({ ...s, currentStep: 1 }))}
                  disabled={confirmActionsMutation.isPending}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmActions}
                  disabled={state.selectedActions.length === 0 || confirmActionsMutation.isPending}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2"
                >
                  {confirmActionsMutation.isPending ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    `Configure Auth (${state.selectedActions.length}/3 Selected)`
                  )}
                </button>
              </div>
            </section>
          )}

          {/* Step 3: Auth */}
          {state.currentStep === 3 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">
                  Authentication Setup
                </h2>
                {isLoadingStep3 && (
                  <WizardProgressIndicator
                    text={getLoadingText(3)}
                    variant="badge"
                  />
                )}
              </div>
              <p className="text-slate-400 mb-4">
                How should actions requiring auth be handled?
              </p>

              <div className="space-y-3 mb-4">
                {(['none', 'ephemeral', 'oauth'] as const).map((type) => (
                  <label
                    key={type}
                    className={`block p-4 bg-slate-900 rounded-lg border cursor-pointer transition-all
                      ${state.authType === type ? 'border-indigo-500' : 'border-slate-600 hover:border-indigo-400'}`}
                  >
                    <input
                      type="radio"
                      name="auth-type"
                      value={type}
                      checked={state.authType === type}
                      onChange={() =>
                        setState((s) => ({ ...s, authType: type }))
                      }
                      className="mr-3"
                    />
                    <span className="font-medium text-white">
                      {type === 'none' && 'No Authentication'}
                      {type === 'ephemeral' && 'Ephemeral Credentials'}
                      {type === 'oauth' && 'OAuth Integration'}
                    </span>
                    <p className="text-slate-400 text-sm mt-1 ml-6">
                      {type === 'none' &&
                        "Actions don't require auth or handle it internally"}
                      {type === 'ephemeral' &&
                        'Credentials passed at runtime (API keys, tokens)'}
                      {type === 'oauth' && 'Connect to your OAuth provider'}
                    </p>
                  </label>
                ))}
              </div>

              {state.authType === 'oauth' && (
                <div className="space-y-3 mb-4 bg-slate-900 p-4 rounded-lg">
                  <input
                    type="text"
                    value={state.oauthConfig.providerUrl}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        oauthConfig: {
                          ...s.oauthConfig,
                          providerUrl: e.target.value,
                        },
                      }))
                    }
                    placeholder="OAuth Provider URL"
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                  <input
                    type="text"
                    value={state.oauthConfig.clientId}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        oauthConfig: {
                          ...s.oauthConfig,
                          clientId: e.target.value,
                        },
                      }))
                    }
                    placeholder="Client ID"
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                  <input
                    type="text"
                    value={state.oauthConfig.scopes}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        oauthConfig: {
                          ...s.oauthConfig,
                          scopes: e.target.value,
                        },
                      }))
                    }
                    placeholder="Scopes (comma-separated)"
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setState((s) => ({ ...s, currentStep: 2 }))}
                  disabled={configureAuthMutation.isPending || generateCodeMutation.isPending}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmAuth}
                  disabled={configureAuthMutation.isPending || generateCodeMutation.isPending}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2"
                >
                  {(configureAuthMutation.isPending || generateCodeMutation.isPending) ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {generateCodeMutation.isPending ? 'Generating...' : 'Configuring...'}
                    </>
                  ) : (
                    'Review & Deploy'
                  )}
                </button>
              </div>
            </section>
          )}

          {/* Step 4: Deploy */}
          {state.currentStep === 4 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Ready to Launch
                </h2>
                {isLoadingStep4 && (
                  <WizardProgressIndicator
                    text={getLoadingText(4)}
                    variant="badge"
                  />
                )}
              </div>

              <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
                <h3 className="text-indigo-400 font-semibold">
                  {state.serverName}
                </h3>
                <p className="text-slate-400 text-sm">
                  {state.serverDescription}
                </p>
                <div className="flex gap-8 mt-3">
                  <div>
                    <span className="text-2xl font-bold text-green-400">
                      {state.generatedTools.length}
                    </span>
                    <span className="text-slate-500 text-sm ml-2">Tools</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-green-400 capitalize">
                      {state.authType}
                    </span>
                    <span className="text-slate-500 text-sm ml-2">
                      Auth Type
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="text-slate-400 text-sm font-semibold mb-2">
                Choose Your Plan
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <label
                  className={`p-4 bg-slate-900 rounded-lg border cursor-pointer
                    ${state.selectedTier === 'free' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600'}`}
                >
                  <input
                    type="radio"
                    name="tier"
                    value="free"
                    checked={state.selectedTier === 'free'}
                    onChange={() =>
                      setState((s) => ({ ...s, selectedTier: 'free' }))
                    }
                    className="hidden"
                  />
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Free</span>
                    <span className="text-green-400 font-semibold">$0/mo</span>
                  </div>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>✓ Up to 3 tools</li>
                    <li>✓ Shared runtime</li>
                    <li>✓ Instant activation</li>
                  </ul>
                  {tierInfo?.curated_libraries &&
                    tierInfo.curated_libraries.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">
                          Allowed Libraries:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {tierInfo.curated_libraries.map((lib) => (
                            <span
                              key={lib}
                              className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded"
                            >
                              {lib}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </label>
                <label
                  className={`p-4 bg-slate-900 rounded-lg border cursor-pointer
                    ${state.selectedTier === 'paid' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600'}`}
                >
                  <input
                    type="radio"
                    name="tier"
                    value="paid"
                    checked={state.selectedTier === 'paid'}
                    onChange={() =>
                      setState((s) => ({ ...s, selectedTier: 'paid' }))
                    }
                    className="hidden"
                  />
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Pro</span>
                    <span className="text-green-400 font-semibold">$29/mo</span>
                  </div>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>✓ Unlimited tools</li>
                    <li>✓ Any libraries</li>
                    <li>✓ Managed VPS</li>
                  </ul>
                </label>
              </div>

              {/* Code Preview removed */}
              {state.generatedTools.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">
                    Generated Tools
                  </h3>
                  <div className="space-y-3">
                    {state.generatedTools.map((tool) => (
                      <div
                        key={tool.id}
                        className="p-3 bg-slate-900 rounded-lg border border-slate-700"
                      >
                        <div>
                          <span className="font-medium text-white">
                            {tool.name}
                          </span>
                          <span className="text-slate-500 text-sm ml-2">
                            — {tool.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setState((s) => ({ ...s, currentStep: 3 }))}
                  disabled={activateServerMutation.isPending || createVPSMutation.isPending}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
                >
                  Back
                </button>
                {state.selectedTier === 'free' ? (
                  <button
                    onClick={handleActivate}
                    disabled={activateServerMutation.isPending}
                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2"
                  >
                    {activateServerMutation.isPending ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Activating...
                      </>
                    ) : (
                      'Activate (Free)'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleDeploy}
                    disabled={createVPSMutation.isPending}
                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2"
                  >
                    {createVPSMutation.isPending ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      'Deploy (Dedicated VPC)'
                    )}
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Step 5: Result */}
          {state.currentStep === 5 && state.result && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                🎉 Your MCP Server is Active!
              </h2>

              <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-indigo-500 mb-6 space-y-3">
                {/* Server Name and Description */}
                <div>
                  <h3 className="text-lg font-semibold text-indigo-400 mb-1">
                    {state.serverName}
                  </h3>
                  {state.serverDescription && (
                    <p className="text-slate-400 text-sm">
                      {state.serverDescription}
                    </p>
                  )}
                </div>

                {/* MCP Endpoint (for activated servers) */}
                {state.result.mcpEndpoint && (
                  <div>
                    <strong className="text-slate-300 text-sm">MCP Endpoint:</strong>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="text-indigo-400 text-sm break-all bg-slate-800 px-2 py-1 rounded flex-1">
                        {`${env.VITE_BACKEND_URL}${state.result.mcpEndpoint}`}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${env.VITE_BACKEND_URL}${state.result.mcpEndpoint}`
                          )
                          toast.success('URL copied!')
                        }}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* IP Address (for VPS deployments) */}
                {state.result.ipAddress && (
                  <div>
                    <strong className="text-slate-300 text-sm">IP Address:</strong>{' '}
                    <code className="text-indigo-400 text-sm">
                      {state.result.ipAddress}
                    </code>
                  </div>
                )}

                {/* Tools Count */}
                {state.result.toolsCount !== undefined && (
                  <div>
                    <strong className="text-slate-300 text-sm">Tools Active:</strong>{' '}
                    <span className="text-green-400 font-semibold">
                      {state.result.toolsCount}
                    </span>
                  </div>
                )}

                {/* Auth Type */}
                {state.authType !== 'none' && (
                  <div>
                    <strong className="text-slate-300 text-sm">Authentication:</strong>{' '}
                    <span className="text-slate-400 capitalize">
                      {state.authType === 'ephemeral' ? 'Ephemeral Credentials' : 'OAuth Integration'}
                    </span>
                  </div>
                )}

                {/* Message (for VPS deployments) */}
                {state.result.message && (
                  <div>
                    <p className="text-slate-400 text-sm">{state.result.message}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {state.result?.serverId && (
                  <button
                    onClick={() => {
                      const serverId = state.result?.serverId
                      if (serverId) {
                        navigate({ 
                          to: '/server/$serverId', 
                          params: { serverId } 
                        })
                      }
                    }}
                    className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Go to Details
                  </button>
                )}
                <button
                  onClick={handleStartOver}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Create Another Server
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
