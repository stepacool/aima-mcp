import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/@tanstack/react-router.mjs";
import { a as authClient } from "./router-Z-nK48G6.mjs";
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
import "../_libs/@tanstack/react-router-ssr-query.mjs";
import "../_libs/@tanstack/react-query.mjs";
import "../_libs/@tanstack/query-core.mjs";
import "../_libs/@tanstack/router-ssr-query-core.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/@better-auth/utils.mjs";
import "../_libs/better-call.mjs";
import "../_libs/zod.mjs";
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
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [googleLoading, setGoogleLoading] = reactExports.useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const {
        error: error2
      } = await authClient.signIn.email({
        email,
        password
      });
      if (error2) {
        setError(error2.message || "Login failed");
      } else {
        navigate({
          to: "/"
        });
      }
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }
  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/"
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent", children: "AutoMCP" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 mt-2", children: "Sign in to your account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-800 rounded-2xl p-6 border border-slate-700", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleGoogleSignIn, disabled: googleLoading || loading, className: "w-full py-3 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-800 font-semibold rounded-lg transition-colors flex items-center justify-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
        ] }),
        googleLoading ? "Signing in..." : "Continue with Google"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-slate-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 bg-slate-800 text-slate-400", children: "or" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-slate-300 text-sm font-medium mb-2", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500", placeholder: "you@example.com" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-slate-300 text-sm font-medium mb-2", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500", placeholder: "••••••••" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading || googleLoading, className: "w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors", children: loading ? "Signing in..." : "Sign In" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-center text-slate-400 text-sm", children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", className: "text-indigo-400 hover:text-indigo-300", children: "Register" })
      ] })
    ] })
  ] }) });
}
export {
  LoginPage as component
};
