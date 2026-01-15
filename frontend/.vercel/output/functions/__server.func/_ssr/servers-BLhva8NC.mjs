import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/@tanstack/react-router.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/@tanstack/react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { d as deleteServerById, l as listUserServers } from "./wizard-functions-C2GBlcq2.mjs";
import { j as env } from "./index.mjs";
import "../_libs/@apm-js-collab/code-transformer.mjs";
import "../_libs/tiny-warning.mjs";
import "../_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/@tanstack/store.mjs";
import "../_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/@tanstack/react-store.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/@tanstack/query-core.mjs";
import "./router-Z-nK48G6.mjs";
import "../_libs/@tanstack/react-router-ssr-query.mjs";
import "../_libs/@tanstack/router-ssr-query-core.mjs";
import "../_libs/@better-fetch/fetch.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/nanostores.mjs";
import "../_libs/@sentry/tanstackstart-react.mjs";
import "../_libs/@sentry/node.mjs";
import "../_libs/@opentelemetry/api.mjs";
import "../_libs/@opentelemetry/instrumentation-http.mjs";
import "../_libs/@opentelemetry/core.mjs";
import "perf_hooks";
import "../_libs/@opentelemetry/semantic-conventions.mjs";
import "url";
import "../_libs/@opentelemetry/instrumentation.mjs";
import "../_libs/@opentelemetry/api-logs.mjs";
import "path";
import "../_libs/require-in-the-middle.mjs";
import "module";
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "os";
import "../_libs/has-flag.mjs";
import "../_libs/module-details-from-path.mjs";
import "../_libs/import-in-the-middle.mjs";
import "worker_threads";
import "fs";
import "events";
import "../_libs/forwarded-parse.mjs";
import "../_libs/@sentry/core.mjs";
import "../_libs/@sentry/node-core.mjs";
import "../_libs/@opentelemetry/context-async-hooks.mjs";
import "../_libs/@sentry/opentelemetry.mjs";
import "../_libs/@opentelemetry/sdk-trace-base.mjs";
import "../_libs/@opentelemetry/resources.mjs";
import "node:diagnostics_channel";
import "node:child_process";
import "node:fs";
import "node:os";
import "node:path";
import "node:util";
import "node:readline";
import "node:events";
import "node:worker_threads";
import "diagnostics_channel";
import "node:http";
import "node:https";
import "node:zlib";
import "node:net";
import "node:tls";
import "../_libs/@opentelemetry/instrumentation-undici.mjs";
import "../_libs/@opentelemetry/instrumentation-amqplib.mjs";
import "../_libs/@opentelemetry/instrumentation-connect.mjs";
import "../_libs/@opentelemetry/instrumentation-express.mjs";
import "../_libs/minimatch.mjs";
import "../_libs/brace-expansion.mjs";
import "../_libs/balanced-match.mjs";
import "../_libs/@opentelemetry/instrumentation-generic-pool.mjs";
import "../_libs/@opentelemetry/instrumentation-graphql.mjs";
import "../_libs/@opentelemetry/instrumentation-hapi.mjs";
import "../_libs/@opentelemetry/instrumentation-kafkajs.mjs";
import "../_libs/@opentelemetry/instrumentation-koa.mjs";
import "../_libs/@opentelemetry/instrumentation-lru-memoizer.mjs";
import "../_libs/@opentelemetry/instrumentation-mongodb.mjs";
import "../_libs/@opentelemetry/instrumentation-mongoose.mjs";
import "../_libs/@opentelemetry/instrumentation-mysql.mjs";
import "../_libs/@opentelemetry/instrumentation-mysql2.mjs";
import "../_libs/@opentelemetry/sql-common.mjs";
import "../_libs/@opentelemetry/instrumentation-pg.mjs";
import "../_libs/@prisma/instrumentation.mjs";
import "../_libs/@opentelemetry/instrumentation-ioredis.mjs";
import "../_libs/@opentelemetry/redis-common.mjs";
import "../_libs/@opentelemetry/instrumentation-redis.mjs";
import "../_libs/@opentelemetry/instrumentation-tedious.mjs";
import "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/@better-auth/utils.mjs";
import "../_libs/better-call.mjs";
import "../_libs/@noble/hashes.mjs";
import "../_libs/@noble/ciphers.mjs";
import "../_libs/jose.mjs";
import "../_libs/defu.mjs";
import "../_libs/@t3-oss/env-core.mjs";
import "../_libs/kysely.mjs";
import "../_libs/drizzle-orm.mjs";
import "../_libs/pg.mjs";
import "../_libs/pg-types.mjs";
import "../_libs/postgres-array.mjs";
import "../_libs/postgres-date.mjs";
import "../_libs/postgres-interval.mjs";
import "../_libs/xtend.mjs";
import "../_libs/postgres-bytea.mjs";
import "../_libs/pg-int8.mjs";
import "dns";
import "../_libs/pg-connection-string.mjs";
import "../_libs/pg-protocol.mjs";
import "net";
import "tls";
import "../_libs/pg-cloudflare.mjs";
import "../_libs/pgpass.mjs";
import "../_libs/split2.mjs";
import "string_decoder";
import "../_libs/pg-pool.mjs";
function StatusBadge({
  server
}) {
  let color = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  let label = "Draft";
  if (server.is_deployed) {
    color = "bg-green-500/20 text-green-400 border-green-500/30";
    label = "Active";
  } else if (server.status === "ready") {
    color = "bg-blue-500/20 text-blue-400 border-blue-500/30";
    label = "Ready";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-1 text-xs rounded-full border ${color}`, children: label });
}
function ServerCard({
  server,
  onDelete,
  deleting
}) {
  const isDraft = server.status === "draft";
  const isActive = server.is_deployed;
  const fullEndpoint = server.mcp_endpoint ? `${env.VITE_BACKEND_URL}${server.mcp_endpoint}` : null;
  function generateCursorInstallLink() {
    if (!fullEndpoint) return null;
    const config = {
      url: fullEndpoint
    };
    const configJson = JSON.stringify(config);
    const base64Config = btoa(configJson);
    const installLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(server.name)}&config=${base64Config}`;
    return installLink;
  }
  function handleAddToCursor() {
    const installLink = generateCursorInstallLink();
    if (!installLink) {
      toast.error("MCP endpoint not available");
      return;
    }
    window.location.href = installLink;
    navigator.clipboard.writeText(installLink).then(() => {
      toast.success("Install link copied to clipboard!", {
        description: "Paste it into Cursor or click it to install"
      });
    });
  }
  function generateClaudeCodeCommand() {
    if (!fullEndpoint) return null;
    const command = `claude mcp add --transport http ${server.name.replace(/\s+/g, "-").toLowerCase()} ${fullEndpoint}`;
    return command;
  }
  function handleAddToClaudeCode() {
    const command = generateClaudeCodeCommand();
    if (!command) {
      toast.error("MCP endpoint not available");
      return;
    }
    navigator.clipboard.writeText(command).then(() => {
      toast.success("Command copied to clipboard!", {
        description: "Run this command in your terminal to add the MCP server to Claude Code"
      });
    });
  }
  function generateMCPJson() {
    if (!fullEndpoint) return null;
    const serverName = server.name.replace(/\s+/g, "-").toLowerCase();
    const config = {
      mcpServers: {
        [serverName]: {
          type: "http",
          url: fullEndpoint
        }
      }
    };
    return JSON.stringify(config, null, 2);
  }
  function handleCopyJson() {
    const json = generateMCPJson();
    if (!json) {
      toast.error("MCP endpoint not available");
      return;
    }
    navigator.clipboard.writeText(json).then(() => {
      toast.success("JSON configuration copied to clipboard!", {
        description: "Add this to your mcp.json file"
      });
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/server/$serverId", params: {
    serverId: server.id
  }, className: "block bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 hover:bg-slate-700/50 transition-all cursor-pointer", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-white", children: server.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 text-sm mt-1 line-clamp-2", children: server.description || "No description" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { server })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm text-slate-500 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        server.tools_count,
        " tools"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Created ",
        new Date(server.created_at).toLocaleDateString()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      isDraft && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", search: {
        serverId: server.id
      }, onClick: (e) => e.stopPropagation(), className: "px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors", children: "Continue Setup" }),
      isActive && server.mcp_endpoint && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(`${env.VITE_BACKEND_URL}${server.mcp_endpoint}`);
          toast.success("MCP URL copied!");
        }, className: "px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors", children: "Copy URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
          e.stopPropagation();
          handleCopyJson();
        }, className: "px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors", children: "Copy JSON" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
          e.stopPropagation();
          handleAddToCursor();
        }, className: "px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm rounded-lg border border-purple-500/30 transition-colors", children: "Add to Cursor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
          e.stopPropagation();
          handleAddToClaudeCode();
        }, className: "px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm rounded-lg border border-purple-500/30 transition-colors", children: "Add to Claude Code" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
        e.stopPropagation();
        onDelete(server.id);
      }, disabled: deleting, className: "px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg border border-red-500/30 transition-colors disabled:opacity-50", children: deleting ? "Deleting..." : "Delete" })
    ] })
  ] });
}
function DeleteModal({
  serverName,
  onConfirm,
  onCancel
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full mx-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: "Delete Server?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-slate-400 mb-6", children: [
      "Are you sure you want to delete",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-white", children: serverName }),
      "? This action cannot be undone."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onConfirm, className: "px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors", children: "Delete" })
    ] })
  ] }) });
}
function ServersPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const {
    data: serverList,
    isLoading
  } = useQuery({
    queryKey: ["servers"],
    queryFn: listUserServers
  });
  const servers = serverList?.servers || [];
  const deleteMutation = useMutation({
    mutationFn: (serverId) => deleteServerById({
      data: {
        serverId
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["servers"]
      });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error("Failed to delete", {
        description: error.message
      });
    }
  });
  function handleDelete(serverId) {
    const server = servers.find((s) => s.id === serverId);
    if (server) {
      setDeleteTarget(server);
    }
  }
  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  }
  const drafts = servers.filter((s) => s.status === "draft");
  const completed = servers.filter((s) => s.status !== "draft");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex justify-between items-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent", children: "My Servers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 mt-1", children: "Manage your MCP servers" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors", children: "+ New Server" })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-slate-400 py-12", children: "Loading..." }) : servers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "🚀" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-white mb-2", children: "No servers yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 mb-6", children: "Create your first MCP server to get started" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors inline-block", children: "Create Server" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
        drafts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 bg-yellow-400 rounded-full" }),
            "Drafts (",
            drafts.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: drafts.map((server) => /* @__PURE__ */ jsxRuntimeExports.jsx(ServerCard, { server, onDelete: handleDelete, deleting: deleteMutation.isPending && deleteTarget?.id === server.id }, server.id)) })
        ] }),
        completed.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 bg-green-400 rounded-full" }),
            "Servers (",
            completed.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: completed.map((server) => /* @__PURE__ */ jsxRuntimeExports.jsx(ServerCard, { server, onDelete: handleDelete, deleting: deleteMutation.isPending && deleteTarget?.id === server.id }, server.id)) })
        ] })
      ] })
    ] }),
    deleteTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteModal, { serverName: deleteTarget.name, onConfirm: confirmDelete, onCancel: () => setDeleteTarget(null) })
  ] });
}
export {
  ServersPage as component
};
