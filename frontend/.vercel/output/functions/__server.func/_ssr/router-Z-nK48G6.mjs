import { w as redirect } from "../_libs/@tanstack/router-core.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, b as createFileRoute, l as lazyRouteComponent, H as HeadContent, S as Scripts, L as Link } from "../_libs/@tanstack/react-router.mjs";
import { s as setupRouterSsrQueryIntegration } from "../_libs/@tanstack/react-router-ssr-query.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { t as toast, T as Toaster } from "../_libs/sonner.mjs";
import { u as localizeUrl, v as deLocalizeUrl, k as getLocale, b as createServerFn, T as TSS_SERVER_FUNCTION, m as locales, n as setLocale, q as getServerFnById, o as getBaseURL, p as capitalizeFirstLetter, t as trackMessageCall } from "./index.mjs";
import { c as createFetch } from "../_libs/@better-fetch/fetch.mjs";
import { b as QueryClient, c as QueryCache, e as MutationCache } from "../_libs/@tanstack/query-core.mjs";
import { C as CircleAlert, R as RefreshCw, M as Menu, L as LogOut, X, H as House, S as Server } from "../_libs/lucide-react.mjs";
import { l as listenKeys, o as onMount, a as atom } from "../_libs/nanostores.mjs";
import { i as init } from "../_libs/@sentry/tanstackstart-react.mjs";
import { o as object, s as string } from "../_libs/zod.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/@tanstack/store.mjs";
import "../_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/tiny-warning.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/@apm-js-collab/code-transformer.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/@tanstack/react-store.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/@tanstack/react-query.mjs";
import "../_libs/@tanstack/router-ssr-query-core.mjs";
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
function getContext() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error("Something went wrong", {
          description: error.message
        });
      }
    }),
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error("Failed to load data", {
          description: error.message
        });
      }
    })
  });
  return {
    queryClient
  };
}
const en_language_label = (
  /** @type {(inputs: {}) => LocalizedString} */
  (() => {
    return (
      /** @type {LocalizedString} */
      `Language`
    );
  })
);
const de_language_label = (
  /** @type {(inputs: {}) => LocalizedString} */
  (() => {
    return (
      /** @type {LocalizedString} */
      `Sprache`
    );
  })
);
const language_label = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("language_label", locale);
  if (locale === "en") return en_language_label();
  return de_language_label();
};
const en_current_locale = (
  /** @type {(inputs: { locale: NonNullable<unknown> }) => LocalizedString} */
  ((i) => {
    return (
      /** @type {LocalizedString} */
      `Current locale: ${i?.locale}`
    );
  })
);
const de_current_locale = (
  /** @type {(inputs: { locale: NonNullable<unknown> }) => LocalizedString} */
  ((i) => {
    return (
      /** @type {LocalizedString} */
      `Aktuelle Sprache: ${i?.locale}`
    );
  })
);
const current_locale = /* @__NO_SIDE_EFFECTS__ */ (inputs, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("current_locale", locale);
  if (locale === "en") return en_current_locale(inputs);
  return de_current_locale(inputs);
};
function ParaglideLocaleSwitcher() {
  const currentLocale = getLocale();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: {
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        color: "inherit"
      },
      "aria-label": /* @__PURE__ */ language_label(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { opacity: 0.85 }, children: /* @__PURE__ */ current_locale({ locale: currentLocale }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: "0.25rem" }, children: locales.map((locale) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setLocale(locale),
            "aria-pressed": locale === currentLocale,
            style: {
              cursor: "pointer",
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: locale === currentLocale ? "#0f172a" : "transparent",
              color: locale === currentLocale ? "#f8fafc" : "inherit",
              fontWeight: locale === currentLocale ? 700 : 500,
              letterSpacing: "0.01em"
            },
            children: locale.toUpperCase()
          },
          locale
        )) })
      ]
    }
  );
}
const redirectPlugin = {
  id: "redirect",
  name: "Redirect",
  hooks: { onSuccess(context) {
    if (context.data?.url && context.data?.redirect) {
      if (typeof window !== "undefined" && window.location) {
        if (window.location) try {
          window.location.href = context.data.url;
        } catch {
        }
      }
    }
  } }
};
const PROTO_POLLUTION_PATTERNS = {
  proto: /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
  constructor: /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
  protoShort: /"__proto__"\s*:/,
  constructorShort: /"constructor"\s*:/
};
const JSON_SIGNATURE = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
const SPECIAL_VALUES = {
  true: true,
  false: false,
  null: null,
  undefined: void 0,
  nan: NaN,
  infinity: Number.POSITIVE_INFINITY,
  "-infinity": Number.NEGATIVE_INFINITY
};
const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}
function parseISODate(value) {
  const match = ISO_DATE_REGEX.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second, ms, offsetSign, offsetHour, offsetMinute] = match;
  let date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), ms ? parseInt(ms.padEnd(3, "0"), 10) : 0));
  if (offsetSign) {
    const offset = (parseInt(offsetHour, 10) * 60 + parseInt(offsetMinute, 10)) * (offsetSign === "+" ? -1 : 1);
    date.setUTCMinutes(date.getUTCMinutes() + offset);
  }
  return isValidDate(date) ? date : null;
}
function betterJSONParse(value, options = {}) {
  const { strict = false, warnings = false, reviver, parseDates = true } = options;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed.length > 0 && trimmed[0] === '"' && trimmed.endsWith('"') && !trimmed.slice(1, -1).includes('"')) return trimmed.slice(1, -1);
  const lowerValue = trimmed.toLowerCase();
  if (lowerValue.length <= 9 && lowerValue in SPECIAL_VALUES) return SPECIAL_VALUES[lowerValue];
  if (!JSON_SIGNATURE.test(trimmed)) {
    if (strict) throw new SyntaxError("[better-json] Invalid JSON");
    return value;
  }
  if (Object.entries(PROTO_POLLUTION_PATTERNS).some(([key, pattern]) => {
    const matches = pattern.test(trimmed);
    if (matches && warnings) console.warn(`[better-json] Detected potential prototype pollution attempt using ${key} pattern`);
    return matches;
  }) && strict) throw new Error("[better-json] Potential prototype pollution attempt detected");
  try {
    const secureReviver = (key, value$1) => {
      if (key === "__proto__" || key === "constructor" && value$1 && typeof value$1 === "object" && "prototype" in value$1) {
        if (warnings) console.warn(`[better-json] Dropping "${key}" key to prevent prototype pollution`);
        return;
      }
      if (parseDates && typeof value$1 === "string") {
        const date = parseISODate(value$1);
        if (date) return date;
      }
      return reviver ? reviver(key, value$1) : value$1;
    };
    return JSON.parse(trimmed, secureReviver);
  } catch (error) {
    if (strict) throw error;
    return value;
  }
}
function parseJSON(value, options = { strict: true }) {
  return betterJSONParse(value, options);
}
const isServer = () => typeof window === "undefined";
const useAuthQuery = (initializedAtom, path, $fetch, options) => {
  const value = atom({
    data: null,
    error: null,
    isPending: true,
    isRefetching: false,
    refetch: (queryParams) => fn(queryParams)
  });
  const fn = async (queryParams) => {
    return new Promise((resolve) => {
      const opts = typeof options === "function" ? options({
        data: value.get().data,
        error: value.get().error,
        isPending: value.get().isPending
      }) : options;
      $fetch(path, {
        ...opts,
        query: {
          ...opts?.query,
          ...queryParams?.query
        },
        async onSuccess(context) {
          value.set({
            data: context.data,
            error: null,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          });
          await opts?.onSuccess?.(context);
        },
        async onError(context) {
          const { request } = context;
          const retryAttempts = typeof request.retry === "number" ? request.retry : request.retry?.attempts;
          const retryAttempt = request.retryAttempt || 0;
          if (retryAttempts && retryAttempt < retryAttempts) return;
          value.set({
            error: context.error,
            data: null,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          });
          await opts?.onError?.(context);
        },
        async onRequest(context) {
          const currentValue = value.get();
          value.set({
            isPending: currentValue.data === null,
            data: currentValue.data,
            error: null,
            isRefetching: true,
            refetch: value.value.refetch
          });
          await opts?.onRequest?.(context);
        }
      }).catch((error) => {
        value.set({
          error,
          data: null,
          isPending: false,
          isRefetching: false,
          refetch: value.value.refetch
        });
      }).finally(() => {
        resolve(void 0);
      });
    });
  };
  initializedAtom = Array.isArray(initializedAtom) ? initializedAtom : [initializedAtom];
  let isMounted = false;
  for (const initAtom of initializedAtom) initAtom.subscribe(async () => {
    if (isServer()) return;
    if (isMounted) await fn();
    else onMount(value, () => {
      const timeoutId = setTimeout(async () => {
        if (!isMounted) {
          await fn();
          isMounted = true;
        }
      }, 0);
      return () => {
        value.off();
        initAtom.off();
        clearTimeout(timeoutId);
      };
    });
  });
  return value;
};
const kBroadcastChannel = /* @__PURE__ */ Symbol.for("better-auth:broadcast-channel");
const now$1 = () => Math.floor(Date.now() / 1e3);
var WindowBroadcastChannel = class {
  listeners = /* @__PURE__ */ new Set();
  name;
  constructor(name = "better-auth.message") {
    this.name = name;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  post(message) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.name, JSON.stringify({
        ...message,
        timestamp: now$1()
      }));
    } catch {
    }
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const handler = (event) => {
      if (event.key !== this.name) return;
      const message = JSON.parse(event.newValue ?? "{}");
      if (message?.event !== "session" || !message?.data) return;
      this.listeners.forEach((listener) => listener(message));
    };
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  }
};
function getGlobalBroadcastChannel(name = "better-auth.message") {
  if (!globalThis[kBroadcastChannel]) globalThis[kBroadcastChannel] = new WindowBroadcastChannel(name);
  return globalThis[kBroadcastChannel];
}
const kFocusManager = /* @__PURE__ */ Symbol.for("better-auth:focus-manager");
var WindowFocusManager = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setFocused(focused) {
    this.listeners.forEach((listener) => listener(focused));
  }
  setup() {
    if (typeof window === "undefined" || typeof document === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const visibilityHandler = () => {
      if (document.visibilityState === "visible") this.setFocused(true);
    };
    document.addEventListener("visibilitychange", visibilityHandler, false);
    return () => {
      document.removeEventListener("visibilitychange", visibilityHandler, false);
    };
  }
};
function getGlobalFocusManager() {
  if (!globalThis[kFocusManager]) globalThis[kFocusManager] = new WindowFocusManager();
  return globalThis[kFocusManager];
}
const kOnlineManager = /* @__PURE__ */ Symbol.for("better-auth:online-manager");
var WindowOnlineManager = class {
  listeners = /* @__PURE__ */ new Set();
  isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setOnline(online) {
    this.isOnline = online;
    this.listeners.forEach((listener) => listener(online));
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const onOnline = () => this.setOnline(true);
    const onOffline = () => this.setOnline(false);
    window.addEventListener("online", onOnline, false);
    window.addEventListener("offline", onOffline, false);
    return () => {
      window.removeEventListener("online", onOnline, false);
      window.removeEventListener("offline", onOffline, false);
    };
  }
};
function getGlobalOnlineManager() {
  if (!globalThis[kOnlineManager]) globalThis[kOnlineManager] = new WindowOnlineManager();
  return globalThis[kOnlineManager];
}
const now = () => Math.floor(Date.now() / 1e3);
const FOCUS_REFETCH_RATE_LIMIT_SECONDS = 5;
function createSessionRefreshManager(opts) {
  const { sessionAtom, sessionSignal, $fetch, options = {} } = opts;
  const refetchInterval = options.sessionOptions?.refetchInterval ?? 0;
  const refetchOnWindowFocus = options.sessionOptions?.refetchOnWindowFocus ?? true;
  const refetchWhenOffline = options.sessionOptions?.refetchWhenOffline ?? false;
  const state = {
    lastSync: 0,
    lastSessionRequest: 0,
    cachedSession: void 0
  };
  const shouldRefetch = () => {
    return refetchWhenOffline || getGlobalOnlineManager().isOnline;
  };
  const triggerRefetch = (event) => {
    if (!shouldRefetch()) return;
    if (event?.event === "storage") {
      state.lastSync = now();
      sessionSignal.set(!sessionSignal.get());
      return;
    }
    const currentSession = sessionAtom.get();
    if (event?.event === "poll") {
      state.lastSessionRequest = now();
      $fetch("/get-session").then((res) => {
        if (res.error) sessionAtom.set({
          ...currentSession,
          data: null,
          error: res.error
        });
        else sessionAtom.set({
          ...currentSession,
          data: res.data,
          error: null
        });
        state.lastSync = now();
        sessionSignal.set(!sessionSignal.get());
      }).catch(() => {
      });
      return;
    }
    if (event?.event === "visibilitychange") {
      if (now() - state.lastSessionRequest < FOCUS_REFETCH_RATE_LIMIT_SECONDS) return;
      state.lastSessionRequest = now();
    }
    if (currentSession?.data === null || currentSession?.data === void 0 || event?.event === "visibilitychange") {
      state.lastSync = now();
      sessionSignal.set(!sessionSignal.get());
    }
  };
  const broadcastSessionUpdate = (trigger) => {
    getGlobalBroadcastChannel().post({
      event: "session",
      data: { trigger },
      clientId: Math.random().toString(36).substring(7)
    });
  };
  const setupPolling = () => {
    if (refetchInterval && refetchInterval > 0) state.pollInterval = setInterval(() => {
      if (sessionAtom.get()?.data) triggerRefetch({ event: "poll" });
    }, refetchInterval * 1e3);
  };
  const setupBroadcast = () => {
    state.unsubscribeBroadcast = getGlobalBroadcastChannel().subscribe(() => {
      triggerRefetch({ event: "storage" });
    });
  };
  const setupFocusRefetch = () => {
    if (!refetchOnWindowFocus) return;
    state.unsubscribeFocus = getGlobalFocusManager().subscribe(() => {
      triggerRefetch({ event: "visibilitychange" });
    });
  };
  const setupOnlineRefetch = () => {
    state.unsubscribeOnline = getGlobalOnlineManager().subscribe((online) => {
      if (online) triggerRefetch({ event: "visibilitychange" });
    });
  };
  const init2 = () => {
    setupPolling();
    setupBroadcast();
    setupFocusRefetch();
    setupOnlineRefetch();
    getGlobalBroadcastChannel().setup();
    getGlobalFocusManager().setup();
    getGlobalOnlineManager().setup();
  };
  const cleanup = () => {
    if (state.pollInterval) {
      clearInterval(state.pollInterval);
      state.pollInterval = void 0;
    }
    if (state.unsubscribeBroadcast) {
      state.unsubscribeBroadcast();
      state.unsubscribeBroadcast = void 0;
    }
    if (state.unsubscribeFocus) {
      state.unsubscribeFocus();
      state.unsubscribeFocus = void 0;
    }
    if (state.unsubscribeOnline) {
      state.unsubscribeOnline();
      state.unsubscribeOnline = void 0;
    }
    state.lastSync = 0;
    state.lastSessionRequest = 0;
    state.cachedSession = void 0;
  };
  return {
    init: init2,
    cleanup,
    triggerRefetch,
    broadcastSessionUpdate
  };
}
function getSessionAtom($fetch, options) {
  const $signal = atom(false);
  const session = useAuthQuery($signal, "/get-session", $fetch, { method: "GET" });
  onMount(session, () => {
    const refreshManager = createSessionRefreshManager({
      sessionAtom: session,
      sessionSignal: $signal,
      $fetch,
      options
    });
    refreshManager.init();
    return () => {
      refreshManager.cleanup();
    };
  });
  return {
    session,
    $sessionSignal: $signal
  };
}
const getClientConfig = (options, loadEnv) => {
  const isCredentialsSupported = "credentials" in Request.prototype;
  const baseURL = getBaseURL(options?.baseURL, options?.basePath, void 0) ?? "/api/auth";
  const pluginsFetchPlugins = [];
  const lifeCyclePlugin = {
    id: "lifecycle-hooks",
    name: "lifecycle-hooks",
    hooks: {
      onSuccess: options?.fetchOptions?.onSuccess,
      onError: options?.fetchOptions?.onError,
      onRequest: options?.fetchOptions?.onRequest,
      onResponse: options?.fetchOptions?.onResponse
    }
  };
  const { onSuccess: _onSuccess, onError: _onError, onRequest: _onRequest, onResponse: _onResponse, ...restOfFetchOptions } = {};
  const $fetch = createFetch({
    baseURL,
    ...isCredentialsSupported ? { credentials: "include" } : {},
    method: "GET",
    jsonParser(text) {
      if (!text) return null;
      return parseJSON(text, { strict: false });
    },
    customFetchImpl: fetch,
    ...restOfFetchOptions,
    plugins: [
      lifeCyclePlugin,
      ...restOfFetchOptions.plugins || [],
      ...[redirectPlugin],
      ...pluginsFetchPlugins
    ]
  });
  const { $sessionSignal, session } = getSessionAtom($fetch, options);
  const plugins = [];
  let pluginsActions = {};
  let pluginsAtoms = {
    $sessionSignal,
    session
  };
  let pluginPathMethods = {
    "/sign-out": "POST",
    "/revoke-sessions": "POST",
    "/revoke-other-sessions": "POST",
    "/delete-user": "POST"
  };
  const atomListeners = [{
    signal: "$sessionSignal",
    matcher(path) {
      return path === "/sign-out" || path === "/update-user" || path === "/sign-up/email" || path === "/sign-in/email" || path === "/delete-user" || path === "/verify-email" || path === "/revoke-sessions" || path === "/revoke-session" || path === "/change-email";
    }
  }];
  for (const plugin of plugins) {
    if (plugin.getAtoms) Object.assign(pluginsAtoms, plugin.getAtoms?.($fetch));
    if (plugin.pathMethods) Object.assign(pluginPathMethods, plugin.pathMethods);
    if (plugin.atomListeners) atomListeners.push(...plugin.atomListeners);
  }
  const $store = {
    notify: (signal) => {
      pluginsAtoms[signal].set(!pluginsAtoms[signal].get());
    },
    listen: (signal, listener) => {
      pluginsAtoms[signal].subscribe(listener);
    },
    atoms: pluginsAtoms
  };
  for (const plugin of plugins) if (plugin.getActions) Object.assign(pluginsActions, plugin.getActions?.($fetch, $store, options));
  return {
    get baseURL() {
      return baseURL;
    },
    pluginsActions,
    pluginsAtoms,
    pluginPathMethods,
    atomListeners,
    $fetch,
    $store
  };
};
function isAtom(value) {
  return typeof value === "object" && value !== null && "get" in value && typeof value.get === "function" && "lc" in value && typeof value.lc === "number";
}
function getMethod(path, knownPathMethods, args) {
  const method = knownPathMethods[path];
  const { fetchOptions, query: _query, ...body } = args || {};
  if (method) return method;
  if (fetchOptions?.method) return fetchOptions.method;
  if (body && Object.keys(body).length > 0) return "POST";
  return "GET";
}
function createDynamicPathProxy(routes, client, knownPathMethods, atoms, atomListeners) {
  function createProxy(path = []) {
    return new Proxy(function() {
    }, {
      get(_, prop) {
        if (typeof prop !== "string") return;
        if (prop === "then" || prop === "catch" || prop === "finally") return;
        const fullPath = [...path, prop];
        let current = routes;
        for (const segment of fullPath) if (current && typeof current === "object" && segment in current) current = current[segment];
        else {
          current = void 0;
          break;
        }
        if (typeof current === "function") return current;
        if (isAtom(current)) return current;
        return createProxy(fullPath);
      },
      apply: async (_, __, args) => {
        const routePath = "/" + path.map((segment) => segment.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)).join("/");
        const arg = args[0] || {};
        const fetchOptions = args[1] || {};
        const { query, fetchOptions: argFetchOptions, ...body } = arg;
        const options = {
          ...fetchOptions,
          ...argFetchOptions
        };
        const method = getMethod(routePath, knownPathMethods, arg);
        return await client(routePath, {
          ...options,
          body: method === "GET" ? void 0 : {
            ...body,
            ...options?.body || {}
          },
          query: query || options?.query,
          method,
          async onSuccess(context) {
            await options?.onSuccess?.(context);
            if (!atomListeners || options.disableSignal) return;
            const matches = atomListeners.filter((s) => s.matcher(routePath));
            if (!matches.length) return;
            const visited = /* @__PURE__ */ new Set();
            for (const match of matches) {
              const signal = atoms[match.signal];
              if (!signal) return;
              if (visited.has(match.signal)) continue;
              visited.add(match.signal);
              const val = signal.get();
              setTimeout(() => {
                signal.set(!val);
              }, 10);
            }
          }
        });
      }
    });
  }
  return createProxy();
}
function useStore(store, options = {}) {
  let snapshotRef = reactExports.useRef(store.get());
  const { keys, deps = [store, keys] } = options;
  let subscribe = reactExports.useCallback((onChange) => {
    const emitChange = (value) => {
      if (snapshotRef.current === value) return;
      snapshotRef.current = value;
      onChange();
    };
    emitChange(store.value);
    if (keys?.length) return listenKeys(store, keys, emitChange);
    return store.listen(emitChange);
  }, deps);
  let get = () => snapshotRef.current;
  return reactExports.useSyncExternalStore(subscribe, get, get);
}
function getAtomKey(str) {
  return `use${capitalizeFirstLetter(str)}`;
}
function createAuthClient(options) {
  const { pluginPathMethods, pluginsActions, pluginsAtoms, $fetch, $store, atomListeners } = getClientConfig(options);
  let resolvedHooks = {};
  for (const [key, value] of Object.entries(pluginsAtoms)) resolvedHooks[getAtomKey(key)] = () => useStore(value);
  return createDynamicPathProxy({
    ...pluginsActions,
    ...resolvedHooks,
    $fetch,
    $store
  }, $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
const authClient = createAuthClient();
function getUserProfileFromSession(session) {
  if (!session?.user) {
    return null;
  }
  const { name, email, emailVerified } = session.user;
  if (!name || !email) {
    return null;
  }
  return {
    name,
    email,
    emailVerified: emailVerified ?? false
  };
}
function Header() {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const { data: session } = authClient.useSession();
  const userProfile = getUserProfileFromSession(session);
  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/login";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsOpen(true),
            className: "p-2 hover:bg-gray-700 rounded-lg transition-colors",
            "aria-label": "Open menu",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { size: 24 })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "ml-4 text-xl font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "AutoMCP" }) })
      ] }),
      userProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1", children: [
          userProfile.name && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-medium", children: userProfile.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300", children: userProfile.email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleLogout,
            className: "p-2 hover:bg-gray-700 rounded-lg transition-colors",
            "aria-label": "Logout",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 20 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "aside",
      {
        className: `fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Navigation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setIsOpen(false),
                className: "p-2 hover:bg-gray-800 rounded-lg transition-colors",
                "aria-label": "Close menu",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 24 })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex-1 p-4 overflow-y-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/",
                onClick: () => setIsOpen(false),
                className: "flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2",
                activeProps: {
                  className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(House, { size: 20 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "New Server" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/servers",
                onClick: () => setIsOpen(false),
                className: "flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2",
                activeProps: {
                  className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { size: 20 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "My Servers" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-gray-700 bg-gray-800 flex flex-col gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ParaglideLocaleSwitcher, {}) })
        ]
      }
    )
  ] });
}
const appCss = "/assets/styles-BBEtuspI.css";
const Route$5 = createRootRouteWithContext()({
  beforeLoad: async () => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", getLocale());
    }
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "AutoMCP"
      }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: getLocale(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
const createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getSession = createServerFn({
  method: "GET"
}).handler(createSsrRpc("95157ba31abb992c00ac2beccb2e4247e5ba2ecf450dbdb41c4d45752298083c"));
const $$splitComponentImporter$4 = () => import("./servers-BLhva8NC.mjs");
const Route$4 = createFileRoute("/servers")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({
        to: "/login"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./register-CKar05lz.mjs");
const Route$3 = createFileRoute("/register")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./login-C9WHtCJw.mjs");
const Route$2 = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-Cj1ConZB.mjs");
const searchSchema = object({
  serverId: string().optional()
});
const Route$1 = createFileRoute("/")({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({
        to: "/login"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./server._serverId-BTJRn1Al.mjs");
const Route = createFileRoute("/server/$serverId")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({
        to: "/login"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const ServersRoute = Route$4.update({
  id: "/servers",
  path: "/servers",
  getParentRoute: () => Route$5
});
const RegisterRoute = Route$3.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$5
});
const LoginRoute = Route$2.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$5
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$5
});
const ServerServerIdRoute = Route.update({
  id: "/server/$serverId",
  path: "/server/$serverId",
  getParentRoute: () => Route$5
});
const rootRouteChildren = {
  IndexRoute,
  LoginRoute,
  RegisterRoute,
  ServersRoute,
  ServerServerIdRoute
};
const routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[400px] w-full flex-col items-center justify-center gap-6 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex max-w-md flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm dark:border-red-900/50 dark:bg-red-950/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-red-100 p-3 dark:bg-red-900/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-6 w-6 text-red-600 dark:text-red-400" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Something went wrong" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: error.message || "An unexpected error occurred. Please try again." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => {
          router2.invalidate();
        },
        className: "mt-4 flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700/50",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
          "Try Again"
        ]
      }
    )
  ] }) });
}
const getRouter = () => {
  const rqContext = getContext();
  const router2 = createRouter({
    routeTree,
    context: {
      ...rqContext
    },
    // Paraglide URL rewrite docs: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#rewrite-url
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url)
    },
    defaultPreload: "intent",
    defaultErrorComponent: DefaultErrorComponent
  });
  setupRouterSsrQueryIntegration({ router: router2, queryClient: rqContext.queryClient });
  if (!router2.isServer) {
    init({
      dsn: "",
      integrations: [],
      tracesSampleRate: 1,
      sendDefaultPii: true
    });
  }
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as R,
  authClient as a,
  Route$1 as b,
  createSsrRpc as c,
  router as r
};
