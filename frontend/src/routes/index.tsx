import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import type { Action } from '@/lib/backend-client'
import { WizardProgress } from '@/components/wizard/WizardProgress'
import { LoadingOverlay } from '@/components/wizard/LoadingOverlay'
import { ActionCard } from '@/components/wizard/ActionCard'

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
    mcpEndpoint?: string
    toolsCount?: number
    message?: string
  } | null
}

function WizardPage() {
  const { serverId: initialServerId } = Route.useSearch()

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
    mutationFn: (desc: string) => startWizard({ data: { description: desc } }),
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
    onError: (error) => alert(`Error: ${error.message}`),
  })

  // Mutation: Refine Actions
  const refineActionsMutation = useMutation({
    mutationFn: ({
      serverId,
      feedback,
      description,
    }: {
      serverId: string
      feedback: string
      description?: string
    }) => refineActions({ data: { serverId, feedback, description } }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: s.currentStep === 1 ? 2 : s.currentStep, // Move to step 2 if coming from step 1
        actions: result.actions,
        selectedActions: result.actions.slice(0, 3).map((a) => a.name), // Auto-select first 3 actions
      }))
      setRefineInput('')
    },
    onError: (error) => alert(`Error: ${error.message}`),
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
    onError: (error) => alert(`Error: ${error.message}`),
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
    onError: (error) => alert(`Error: ${error.message}`),
  })

  // Mutation: Activate Server
  const activateServerMutation = useMutation({
    mutationFn: (serverId: string) => activateServer({ data: { serverId } }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: 5,
        result: {
          mcpEndpoint: result.mcp_endpoint,
          toolsCount: result.tools_count,
        },
      }))
    },
    onError: (error) => alert(`Error: ${error.message}`),
  })

  // Mutation: Create VPS
  const createVPSMutation = useMutation({
    mutationFn: (serverId: string) => createVPS({ data: { serverId } }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: 5,
        result: {
          message: result.message,
        },
      }))
    },
    onError: (error) => alert(`Error: ${error.message}`),
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
      // Create new draft
      startWizardMutation.mutate(description)
    }
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
        alert('Free tier limited to 3 actions')
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

  // Derive global loading state
  const isGlobalLoading =
    isLoadingState ||
    startWizardMutation.isPending ||
    refineActionsMutation.isPending ||
    confirmActionsMutation.isPending ||
    configureAuthMutation.isPending ||
    generateCodeMutation.isPending ||
    activateServerMutation.isPending ||
    createVPSMutation.isPending

  const loadingText = startWizardMutation.isPending
    ? 'Analyzing your requirements...'
    : refineActionsMutation.isPending
      ? 'Updating actions...'
      : confirmActionsMutation.isPending
        ? 'Confirming tool selection...'
        : configureAuthMutation.isPending
          ? 'Configuring authentication...'
          : generateCodeMutation.isPending
            ? 'Generating tool code...'
            : activateServerMutation.isPending
              ? 'Activating on shared runtime...'
              : createVPSMutation.isPending
                ? 'Deploying to dedicated VPC...'
                : isLoadingState
                  ? 'Resuming setup...'
                  : 'Processing...'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      {isGlobalLoading && <LoadingOverlay text={loadingText} />}

      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            AutoMCP
          </h1>
          <p className="text-slate-400 mt-2">
            Build MCP servers through conversation
          </p>
        </header>

        <WizardProgress currentStep={state.currentStep} />

        <main className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          {/* Step 1: Describe */}
          {state.currentStep === 1 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                What should your MCP server do?
              </h2>
              <p className="text-slate-400 mb-4">
                Describe the system or service you want to create.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: A server that manages my GitHub repositories..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white placeholder:text-slate-500 resize-y min-h-[120px]"
              />
              <button
                onClick={handleDescribe}
                className="mt-4 w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors"
              >
                Generate Actions
              </button>
            </section>
          )}

          {/* Step 2: Actions */}
          {state.currentStep === 2 && (
            <section>
              <h2 className="text-xl font-semibold text-indigo-400 mb-1">
                {state.serverName}
              </h2>
              <p className="text-slate-400 mb-4">{state.serverDescription}</p>

              <div className="space-y-3 mb-4">
                {state.actions.map((action) => (
                  <ActionCard
                    key={action.name}
                    action={action}
                    selected={state.selectedActions.includes(action.name)}
                    disabled={false}
                    onToggle={() => toggleAction(action.name)}
                  />
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={refineInput}
                  onChange={(e) => setRefineInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  placeholder="Add more actions or modify..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
                <button
                  onClick={handleRefine}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Refine
                </button>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setState((s) => ({ ...s, currentStep: 1 }))}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmActions}
                  disabled={state.selectedActions.length === 0}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold rounded-lg"
                >
                  Configure Auth ({state.selectedActions.length}/3 Selected)
                </button>
              </div>
            </section>
          )}

          {/* Step 3: Auth */}
          {state.currentStep === 3 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                Authentication Setup
              </h2>
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
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmAuth}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg"
                >
                  Review & Deploy
                </button>
              </div>
            </section>
          )}

          {/* Step 4: Deploy */}
          {state.currentStep === 4 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                Ready to Launch
              </h2>

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
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Back
                </button>
                {state.selectedTier === 'free' ? (
                  <button
                    onClick={handleActivate}
                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg"
                  >
                    Activate (Free)
                  </button>
                ) : (
                  <button
                    onClick={handleDeploy}
                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg"
                  >
                    Deploy (Dedicated VPC)
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

              <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-indigo-500 mb-6">
                {state.result.mcpEndpoint && (
                  <>
                    <p className="mb-2">
                      <strong className="text-slate-300">MCP Endpoint:</strong>{' '}
                      <code className="text-indigo-400">
                        {state.result.mcpEndpoint}
                      </code>
                    </p>
                    <p>
                      <strong className="text-slate-300">Tools Active:</strong>{' '}
                      <span className="text-green-400">
                        {state.result.toolsCount}
                      </span>
                    </p>
                  </>
                )}
                {state.result.message && !state.result.mcpEndpoint && (
                  <p className="text-slate-400">{state.result.message}</p>
                )}
              </div>

              <button
                onClick={handleStartOver}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Create Another Server
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
