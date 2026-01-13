import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { WizardProgress } from '@/components/wizard/WizardProgress'
import { LoadingOverlay } from '@/components/wizard/LoadingOverlay'
import { ActionCard } from '@/components/wizard/ActionCard'

import {
  startWizard,
  refineActions,
  selectTools,
  configureAuth,
  generateCode,
  activateServer,
  deployServer,
} from '@/lib/wizard-functions'
import { getSession } from '@/lib/auth-functions'
import type { Action, ToolWithCode } from '@/lib/backend-client'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
  component: WizardPage,
})

interface WizardState {
  currentStep: number
  serverId: string | null
  serverName: string
  serverDescription: string
  actions: Action[]
  selectedActions: string[]
  authType: 'none' | 'ephemeral' | 'oauth'
  oauthConfig: {
    providerUrl: string
    clientId: string
    scopes: string
  }
  generatedTools: ToolWithCode[]
  selectedTier: 'free' | 'paid'
  result: {
    mcpEndpoint?: string
    toolsCount?: number
    message?: string
  } | null
}

function WizardPage() {
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    serverId: null,
    serverName: '',
    serverDescription: '',
    actions: [],
    selectedActions: [],
    authType: 'none',
    oauthConfig: { providerUrl: '', clientId: '', scopes: '' },
    generatedTools: [],
    selectedTier: 'free',
    result: null,
  })
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Processing...')
  const [description, setDescription] = useState('')
  const [refineInput, setRefineInput] = useState('')

  // Step 1: Describe System
  async function handleDescribe() {
    if (!description.trim()) return
    setLoading(true)
    setLoadingText('Analyzing your requirements...')
    try {
      const result = await startWizard({ data: { description } })
      setState((s) => ({
        ...s,
        currentStep: 2,
        serverId: result.server_id,
        serverName: result.server_name,
        serverDescription: result.description,
        actions: result.actions,
        selectedActions: result.actions.slice(0, 3).map((a) => a.name),
      }))
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Refine actions
  async function handleRefine() {
    if (!refineInput.trim() || !state.serverId) return
    setLoading(true)
    setLoadingText('Updating actions...')
    try {
      const result = await refineActions({ data: { serverId: state.serverId, feedback: refineInput } })
      setState((s) => ({
        ...s,
        actions: result.actions,
        selectedActions: [],
      }))
      setRefineInput('')
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  function toggleAction(name: string) {
    setState((s) => {
      if (s.selectedActions.includes(name)) {
        return { ...s, selectedActions: s.selectedActions.filter((n) => n !== name) }
      }
      if (s.selectedTier === 'free' && s.selectedActions.length >= 3) {
        alert('Free tier limited to 3 actions')
        return s
      }
      return { ...s, selectedActions: [...s.selectedActions, name] }
    })
  }

  async function handleConfirmActions() {
    if (!state.serverId || state.selectedActions.length === 0) return
    setLoading(true)
    setLoadingText('Confirming tool selection...')
    try {
      await selectTools({ data: { serverId: state.serverId, selectedToolNames: state.selectedActions } })
      setState((s) => ({ ...s, currentStep: 3 }))
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Configure auth
  async function handleConfirmAuth() {
    if (!state.serverId) return
    setLoading(true)
    setLoadingText('Configuring authentication...')
    try {
      const authConfig =
        state.authType === 'oauth'
          ? {
              providerUrl: state.oauthConfig.providerUrl,
              clientId: state.oauthConfig.clientId,
              scopes: state.oauthConfig.scopes.split(',').map((s) => s.trim()),
            }
          : undefined

      await configureAuth({ data: { serverId: state.serverId, authType: state.authType, authConfig } })

      setLoadingText('Generating tool code...')
      const codeResult = await generateCode({ data: { serverId: state.serverId } })

      setState((s) => ({ ...s, currentStep: 4, generatedTools: codeResult.tools }))
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Deploy/Activate
  async function handleActivate() {
    if (!state.serverId) return
    setLoading(true)
    setLoadingText('Activating on shared runtime...')
    try {
      const result = await activateServer({ data: { serverId: state.serverId } })
      setState((s) => ({
        ...s,
        currentStep: 5,
        result: {
          mcpEndpoint: result.mcp_endpoint,
          toolsCount: result.tools_count,
        },
      }))
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeploy() {
    if (!state.serverId) return
    setLoading(true)
    setLoadingText('Deploying to dedicated VPC...')
    try {
      const result = await deployServer({ data: { serverId: state.serverId, target: 'dedicated' } })
      setState((s) => ({
        ...s,
        currentStep: 5,
        result: {
          message: result.message,
        },
      }))
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
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
      generatedTools: [],
      selectedTier: 'free',
      result: null,
    })
    setDescription('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      {loading && <LoadingOverlay text={loadingText} />}

      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            AutoMCP
          </h1>
          <p className="text-slate-400 mt-2">Build MCP servers through conversation</p>
        </header>

        <WizardProgress currentStep={state.currentStep} />

        <main className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          {/* Step 1: Describe */}
          {state.currentStep === 1 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">What should your MCP server do?</h2>
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
              <h2 className="text-xl font-semibold text-indigo-400 mb-1">{state.serverName}</h2>
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
              <h2 className="text-xl font-semibold text-white mb-2">Authentication Setup</h2>
              <p className="text-slate-400 mb-4">How should actions requiring auth be handled?</p>

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
                      onChange={() => setState((s) => ({ ...s, authType: type }))}
                      className="mr-3"
                    />
                    <span className="font-medium text-white">
                      {type === 'none' && 'No Authentication'}
                      {type === 'ephemeral' && 'Ephemeral Credentials'}
                      {type === 'oauth' && 'OAuth Integration'}
                    </span>
                    <p className="text-slate-400 text-sm mt-1 ml-6">
                      {type === 'none' && "Actions don't require auth or handle it internally"}
                      {type === 'ephemeral' && 'Credentials passed at runtime (API keys, tokens)'}
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
                        oauthConfig: { ...s.oauthConfig, providerUrl: e.target.value },
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
                        oauthConfig: { ...s.oauthConfig, clientId: e.target.value },
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
                        oauthConfig: { ...s.oauthConfig, scopes: e.target.value },
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
              <h2 className="text-xl font-semibold text-white mb-4">Ready to Launch</h2>

              <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
                <h3 className="text-indigo-400 font-semibold">{state.serverName}</h3>
                <p className="text-slate-400 text-sm">{state.serverDescription}</p>
                <div className="flex gap-8 mt-3">
                  <div>
                    <span className="text-2xl font-bold text-green-400">{state.generatedTools.length}</span>
                    <span className="text-slate-500 text-sm ml-2">Tools</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-green-400 capitalize">{state.authType}</span>
                    <span className="text-slate-500 text-sm ml-2">Auth Type</span>
                  </div>
                </div>
              </div>

              {/* Generated Code Preview */}
              <h3 className="text-slate-400 text-sm font-semibold mb-2">Generated Tool Code</h3>
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {state.generatedTools.map((tool) => (
                  <details key={tool.id} className="bg-slate-900 rounded-lg border border-slate-700">
                    <summary className="px-4 py-3 cursor-pointer hover:bg-slate-800 rounded-lg">
                      <span className="font-medium text-indigo-400">{tool.name}</span>
                      <span className="text-slate-500 text-sm ml-2">— {tool.description}</span>
                    </summary>
                    <div className="px-4 pb-4">
                      <pre className="bg-slate-950 rounded-lg p-3 text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap">
                        <code>{tool.code}</code>
                      </pre>
                    </div>
                  </details>
                ))}
              </div>

              <h3 className="text-slate-400 text-sm font-semibold mb-2">Choose Your Plan</h3>
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
                    onChange={() => setState((s) => ({ ...s, selectedTier: 'free' }))}
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
                    onChange={() => setState((s) => ({ ...s, selectedTier: 'paid' }))}
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
              <h2 className="text-xl font-semibold text-white mb-4">🎉 Your MCP Server is Active!</h2>

              <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-indigo-500 mb-6">
                {state.result.mcpEndpoint && (
                  <>
                    <p className="mb-2">
                      <strong className="text-slate-300">MCP Endpoint:</strong>{' '}
                      <code className="text-indigo-400">{state.result.mcpEndpoint}</code>
                    </p>
                    <p>
                      <strong className="text-slate-300">Tools Active:</strong>{' '}
                      <span className="text-green-400">{state.result.toolsCount}</span>
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
