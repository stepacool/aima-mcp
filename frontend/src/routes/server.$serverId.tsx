import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import type { MCPServerDetails } from '@/lib/backend-client'
import { getSession } from '@/lib/auth-functions'
import { deleteServerById, getServerDetailsById } from '@/lib/wizard-functions'
import { env } from '@/env'

export const Route = createFileRoute('/server/$serverId')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
  component: ServerDetailPage,
})

// Status badge component
function StatusBadge({ server }: { server: MCPServerDetails }) {
  let color = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  let label = 'Draft'

  if (server.is_deployed) {
    color = 'bg-green-500/20 text-green-400 border-green-500/30'
    label = 'Active'
  } else if (server.status === 'ready') {
    color = 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    label = 'Ready'
  }

  return (
    <span className={`px-3 py-1 text-sm rounded-full border ${color}`}>
      {label}
    </span>
  )
}

// Delete confirmation modal
function DeleteModal({
  serverName,
  onConfirm,
  onCancel,
  loading,
}: {
  serverName: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-white mb-2">
          Delete Server?
        </h3>
        <p className="text-slate-400 mb-6">
          Are you sure you want to delete{' '}
          <strong className="text-white">{serverName}</strong>? This action
          cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ServerDetailPage() {
  const { serverId } = Route.useParams()
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: server, isLoading } = useQuery<MCPServerDetails>({
    queryKey: ['server', serverId],
    queryFn: () => getServerDetailsById({ data: { serverId } }),
  })

  const deleteMutation = useMutation({
    mutationFn: (serverId: string) => deleteServerById({ data: { serverId } }),
    onSuccess: () => {
      navigate({ to: '/servers' })
    },
    onError: (error) => {
      alert(`Failed to delete: ${error.message}`)
      setShowDeleteModal(false)
    },
  })

  async function handleDelete() {
    deleteMutation.mutate(serverId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!server) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Server not found
          </h2>
          <Link to="/servers" className="text-indigo-400 hover:text-indigo-300">
            ← Back to servers
          </Link>
        </div>
      </div>
    )
  }

  const isDraft = server.status === 'draft'
  const fullEndpoint = server.mcp_endpoint
    ? `${env.VITE_BACKEND_URL}${server.mcp_endpoint}`
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/servers"
            className="text-slate-400 hover:text-white text-sm mb-4 inline-block"
          >
            ← Back to servers
          </Link>
        </div>

        {/* Server Info Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{server.name}</h1>
              <p className="text-slate-400 mt-1">
                {server.description || 'No description'}
              </p>
            </div>
            <StatusBadge server={server} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-slate-500 text-sm">Tools</div>
              <div className="text-xl font-semibold text-white">
                {server.tools.length}
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-slate-500 text-sm">Auth Type</div>
              <div className="text-xl font-semibold text-white capitalize">
                {server.auth_type}
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-slate-500 text-sm">Tier</div>
              <div className="text-xl font-semibold text-white capitalize">
                {server.tier}
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-slate-500 text-sm">Created</div>
              <div className="text-sm font-medium text-white">
                {new Date(server.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* MCP Endpoint */}
          {fullEndpoint && (
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <div className="text-slate-500 text-sm mb-2">MCP Endpoint</div>
              <div className="flex items-center gap-2">
                <code className="text-indigo-400 flex-1 truncate">
                  {fullEndpoint}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fullEndpoint)
                    alert('URL copied!')
                  }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {isDraft && (
              <Link
                to="/"
                search={{ serverId: server.id }}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors"
              >
                Continue Setup
              </Link>
            )}

            {server.is_deployed && (
              <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-semibold rounded-lg border border-purple-500/30 transition-colors">
                Add to Tools
              </button>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg border border-red-500/30 transition-colors"
            >
              Delete Server
            </button>
          </div>
        </div>

        {/* Tools Section */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Tools ({server.tools.length})
          </h2>
          {server.tools.length === 0 ? (
            <p className="text-slate-400">No tools defined yet</p>
          ) : (
            <div className="space-y-3">
              {server.tools.map((tool) => (
                <div key={tool.id} className="bg-slate-900 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{tool.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        {tool.description}
                      </p>
                    </div>
                    {tool.has_code && (
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                        Code ✓
                      </span>
                    )}
                  </div>
                  {tool.parameters.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="text-slate-500">Parameters: </span>
                      <span className="text-slate-300">
                        {tool.parameters.map((p) => p.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          serverName={server.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
