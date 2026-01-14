import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { MCPServerListItem } from '@/lib/backend-client'
import { getSession } from '@/lib/auth-functions'
import { deleteServerById, listUserServers } from '@/lib/wizard-functions'
import { env } from '@/env'

export const Route = createFileRoute('/servers')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
  component: ServersPage,
})

// Status badge component
function StatusBadge({ server }: { server: MCPServerListItem }) {
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
    <span className={`px-2 py-1 text-xs rounded-full border ${color}`}>
      {label}
    </span>
  )
}

// Server card component
function ServerCard({
  server,
  onDelete,
  deleting,
}: {
  server: MCPServerListItem
  onDelete: (id: string) => void
  deleting: boolean
}) {
  const isDraft = server.status === 'draft'
  const isActive = server.is_deployed
  const fullEndpoint = server.mcp_endpoint
    ? `${env.VITE_BACKEND_URL}${server.mcp_endpoint}`
    : null

  // Generate Cursor MCP install link
  function generateCursorInstallLink() {
    if (!fullEndpoint) return null

    // Create MCP config for HTTP/SSE transport
    const config = {
      url: fullEndpoint,
    }

    // Base64 encode the config
    const configJson = JSON.stringify(config)
    const base64Config = btoa(configJson)

    // Generate the install link
    const installLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(server.name)}&config=${base64Config}`
    return installLink
  }

  function handleAddToCursor() {
    const installLink = generateCursorInstallLink()
    if (!installLink) {
      toast.error('MCP endpoint not available')
      return
    }

    // Try to open the deeplink
    window.location.href = installLink

    // Fallback: copy link to clipboard if deeplink doesn't work
    navigator.clipboard.writeText(installLink).then(() => {
      toast.success('Install link copied to clipboard!', {
        description: 'Paste it into Cursor or click it to install',
      })
    })
  }

  // Generate Claude Code MCP install command
  function generateClaudeCodeCommand() {
    if (!fullEndpoint) return null

    // Generate CLI command
    const command = `claude mcp add --transport http ${server.name.replace(/\s+/g, '-').toLowerCase()} ${fullEndpoint}`
    return command
  }

  function handleAddToClaudeCode() {
    const command = generateClaudeCodeCommand()
    if (!command) {
      toast.error('MCP endpoint not available')
      return
    }

    // Copy command to clipboard
    navigator.clipboard.writeText(command).then(() => {
      toast.success('Command copied to clipboard!', {
        description: 'Run this command in your terminal to add the MCP server to Claude Code',
      })
    })
  }

  // Generate MCP JSON configuration
  function generateMCPJson() {
    if (!fullEndpoint) return null

    const serverName = server.name.replace(/\s+/g, '-').toLowerCase()
    const config = {
      mcpServers: {
        [serverName]: {
          type: 'http',
          url: fullEndpoint,
        },
      },
    }

    return JSON.stringify(config, null, 2)
  }

  function handleCopyJson() {
    const json = generateMCPJson()
    if (!json) {
      toast.error('MCP endpoint not available')
      return
    }

    // Copy JSON to clipboard
    navigator.clipboard.writeText(json).then(() => {
      toast.success('JSON configuration copied to clipboard!', {
        description: 'Add this to your mcp.json file',
      })
    })
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{server.name}</h3>
          <p className="text-slate-400 text-sm mt-1 line-clamp-2">
            {server.description || 'No description'}
          </p>
        </div>
        <StatusBadge server={server} />
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
        <span>{server.tools_count} tools</span>
        <span>•</span>
        <span>Created {new Date(server.created_at).toLocaleDateString()}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {isDraft && (
          <Link
            to="/"
            search={{ serverId: server.id }}
            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors"
          >
            Continue Setup
          </Link>
        )}

        {isActive && server.mcp_endpoint && (
          <>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${env.VITE_BACKEND_URL}${server.mcp_endpoint}`,
                )
                toast.success('MCP URL copied!')
              }}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
            >
              Copy URL
            </button>
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
            >
              Copy JSON
            </button>
            <button
              onClick={handleAddToCursor}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm rounded-lg border border-purple-500/30 transition-colors"
            >
              Add to Cursor
            </button>
            <button
              onClick={handleAddToClaudeCode}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm rounded-lg border border-purple-500/30 transition-colors"
            >
              Add to Claude Code
            </button>

          </>
        )}

        <Link
          to="/server/$serverId"
          params={{ serverId: server.id }}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
        >
          View Details
        </Link>

        <button
          onClick={() => onDelete(server.id)}
          disabled={deleting}
          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg border border-red-500/30 transition-colors disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

// Delete confirmation modal
function DeleteModal({
  serverName,
  onConfirm,
  onCancel,
}: {
  serverName: string
  onConfirm: () => void
  onCancel: () => void
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
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function ServersPage() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<MCPServerListItem | null>(
    null,
  )

  const { data: serverList, isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: listUserServers,
  })

  // We assume the backend returns { servers: MCPServerListItem[] } based on previous code usage:
  // setServers(response.servers)
  const servers = serverList?.servers || []

  const deleteMutation = useMutation({
    mutationFn: (serverId: string) => deleteServerById({ data: { serverId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] })
      setDeleteTarget(null)
    },
    onError: (error) => {
      toast.error('Failed to delete', { description: error.message })
    },
  })

  function handleDelete(serverId: string) {
    const server = servers.find((s) => s.id === serverId)
    if (server) {
      setDeleteTarget(server)
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id)
  }

  const drafts = servers.filter((s) => s.status === 'draft')
  const completed = servers.filter((s) => s.status !== 'draft')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              My Servers
            </h1>
            <p className="text-slate-400 mt-1">Manage your MCP servers</p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors"
          >
            + New Server
          </Link>
        </header>

        {isLoading ? (
          <div className="text-center text-slate-400 py-12">Loading...</div>
        ) : servers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No servers yet
            </h2>
            <p className="text-slate-400 mb-6">
              Create your first MCP server to get started
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors inline-block"
            >
              Create Server
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {drafts.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Drafts ({drafts.length})
                </h2>
                <div className="grid gap-4">
                  {drafts.map((server) => (
                    <ServerCard
                      key={server.id}
                      server={server}
                      onDelete={handleDelete}
                      deleting={
                        deleteMutation.isPending &&
                        deleteTarget?.id === server.id
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Servers ({completed.length})
                </h2>
                <div className="grid gap-4">
                  {completed.map((server) => (
                    <ServerCard
                      key={server.id}
                      server={server}
                      onDelete={handleDelete}
                      deleting={
                        deleteMutation.isPending &&
                        deleteTarget?.id === server.id
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          serverName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
