import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/@tanstack/react-router.mjs";
import { a as useQuery, b as useMutation } from "../_libs/@tanstack/react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { d as deleteServerById, i as getServerDetailsById } from "./wizard-functions-C2GBlcq2.mjs";
import { j as env } from "./index.mjs";
import { R as Route } from "./router-Z-nK48G6.mjs";
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
import "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/@better-auth/utils.mjs";
import "../_libs/better-call.mjs";
import "../_libs/@noble/hashes.mjs";
import "../_libs/@noble/ciphers.mjs";
import "../_libs/@better-fetch/fetch.mjs";
import "../_libs/jose.mjs";
import "../_libs/defu.mjs";
import "../_libs/@t3-oss/env-core.mjs";
import "../_libs/kysely.mjs";
import "../_libs/drizzle-orm.mjs";
import "../_libs/pg.mjs";
import "events";
import "../_libs/pg-types.mjs";
import "../_libs/postgres-array.mjs";
import "../_libs/postgres-date.mjs";
import "../_libs/postgres-interval.mjs";
import "../_libs/xtend.mjs";
import "../_libs/postgres-bytea.mjs";
import "../_libs/pg-int8.mjs";
import "dns";
import "../_libs/pg-connection-string.mjs";
import "fs";
import "../_libs/pg-protocol.mjs";
import "net";
import "tls";
import "../_libs/pg-cloudflare.mjs";
import "../_libs/pgpass.mjs";
import "path";
import "../_libs/split2.mjs";
import "string_decoder";
import "../_libs/pg-pool.mjs";
import "../_libs/@tanstack/react-router-ssr-query.mjs";
import "../_libs/@tanstack/router-ssr-query-core.mjs";
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 text-sm rounded-full border ${color}`, children: label });
}
function DeleteModal({
  serverName,
  onConfirm,
  onCancel,
  loading
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, disabled: loading, className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onConfirm, disabled: loading, className: "px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50", children: loading ? "Deleting..." : "Delete" })
    ] })
  ] }) });
}
function ServerDetailPage() {
  const {
    serverId
  } = Route.useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = reactExports.useState(false);
  const {
    data: server,
    isLoading
  } = useQuery({
    queryKey: ["server", serverId],
    queryFn: () => getServerDetailsById({
      data: {
        serverId
      }
    })
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteServerById({
      data: {
        serverId: id
      }
    }),
    onSuccess: () => {
      navigate({
        to: "/servers"
      });
    },
    onError: (error) => {
      toast.error("Failed to delete", {
        description: error.message
      });
      setShowDeleteModal(false);
    }
  });
  function handleDelete() {
    deleteMutation.mutate(serverId);
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-400", children: "Loading..." }) });
  }
  if (!server) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-white mb-2", children: "Server not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/servers", className: "text-indigo-400 hover:text-indigo-300", children: "← Back to servers" })
    ] }) });
  }
  const isDraft = server.status === "draft";
  const fullEndpoint = server.mcp_endpoint ? `${env.VITE_BACKEND_URL}${server.mcp_endpoint}` : null;
  function generateCursorInstallLink() {
    if (!fullEndpoint || !server) return null;
    const config = {
      url: fullEndpoint
    };
    const configJson = JSON.stringify(config);
    const base64Config = btoa(configJson);
    const serverName = server.name;
    const installLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
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
    if (!fullEndpoint || !server) return null;
    const serverName = server.name.replace(/\s+/g, "-").toLowerCase();
    const command = `claude mcp add --transport http ${serverName} ${fullEndpoint}`;
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
    if (!fullEndpoint || !server) return null;
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/servers", className: "text-slate-400 hover:text-white text-sm mb-4 inline-block", children: "← Back to servers" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-white", children: server.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 mt-1", children: server.description || "No description" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { server })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-500 text-sm", children: "Tools" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-semibold text-white", children: server.tools.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-500 text-sm", children: "Auth Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-semibold text-white capitalize", children: server.auth_type })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-500 text-sm", children: "Tier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-semibold text-white capitalize", children: server.tier })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-500 text-sm", children: "Created" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-white", children: new Date(server.created_at).toLocaleDateString() })
          ] })
        ] }),
        fullEndpoint && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 rounded-lg p-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-500 text-sm mb-2", children: "MCP Endpoint" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-indigo-400 flex-1 truncate", children: fullEndpoint }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              navigator.clipboard.writeText(fullEndpoint);
              toast.success("URL copied!");
            }, className: "px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors", children: "Copy" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
          isDraft && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", search: {
            serverId: server.id
          }, className: "px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors", children: "Continue Setup" }),
          server.is_deployed && fullEndpoint && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddToCursor, className: "px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-semibold rounded-lg border border-purple-500/30 transition-colors", children: "Add to Cursor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddToClaudeCode, className: "px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-semibold rounded-lg border border-purple-500/30 transition-colors", children: "Add to Claude Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCopyJson, className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors", children: "Copy JSON" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowDeleteModal(true), className: "px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg border border-red-500/30 transition-colors", children: "Delete Server" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-800 rounded-xl border border-slate-700 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-white mb-4", children: [
          "Tools (",
          server.tools.length,
          ")"
        ] }),
        server.tools.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400", children: "No tools defined yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: server.tools.map((tool) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-white", children: tool.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 text-sm mt-1", children: tool.description })
            ] }),
            tool.has_code && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded", children: "Code ✓" })
          ] }),
          tool.parameters.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "Parameters: " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300", children: tool.parameters.map((p) => p.name).join(", ") })
          ] })
        ] }, tool.id)) })
      ] })
    ] }),
    showDeleteModal && /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteModal, { serverName: server.name, onConfirm: handleDelete, onCancel: () => setShowDeleteModal(false), loading: deleteMutation.isPending })
  ] });
}
export {
  ServerDetailPage as component
};
