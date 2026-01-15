import { d as diag, p as propagation, a as context, t as trace, S as SpanStatusCode, T as TraceFlags, f as SpanKind } from "../@opentelemetry/api.mjs";
import { s as srcExports } from "../@opentelemetry/instrumentation-http.mjs";
import { d as defineIntegration, g as getClient, h as hasSpansEnabled, S as SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, a as getIsolationScope, b as getDefaultIsolationScope, c as debug, s as spanToJSON, e as SEMANTIC_ATTRIBUTE_SENTRY_OP, f as captureException, i as getRootSpan, j as SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE, k as SEMANTIC_ATTRIBUTE_CACHE_HIT, l as SEMANTIC_ATTRIBUTE_CACHE_KEY, t as truncate, m as SDK_VERSION, r as replaceExports, n as startSpanManual, o as SPAN_STATUS_ERROR, p as consoleSandbox, q as isThenable, u as handleCallbackErrors, v as addNonEnumerableProperty, w as getActiveSpan, _ as _INTERNAL_getSpanForToolCallId, x as withScope, y as _INTERNAL_cleanupToolCallSpan, z as addVercelAiProcessors, A as _INTERNAL_shouldSkipAiProviderWrapping, B as instrumentOpenAiClient, O as OPENAI_INTEGRATION_NAME, C as ANTHROPIC_AI_INTEGRATION_NAME, D as instrumentAnthropicAiClient, G as GOOGLE_GENAI_INTEGRATION_NAME, E as instrumentGoogleGenAIClient, F as _INTERNAL_skipAiProviderWrapping, H as createLangChainCallbackHandler, L as LANGCHAIN_INTEGRATION_NAME, I as instrumentStateGraphCompile, J as LANGGRAPH_INTEGRATION_NAME, K as flush, M as applySdkMetadata } from "./core.mjs";
import { g as generateInstrumentOnce, S as SentryHttpInstrumentation, h as httpServerIntegration, a as httpServerSpansIntegration, N as NODE_VERSION, b as addOriginToSpan, c as getRequestUrl, d as SentryNodeFetchInstrumentation, i as instrumentWhenWrapped, s as setupOpenTelemetryLogger, e as SentryContextManager, f as getDefaultIntegrations$1, j as init$1, v as validateOpenTelemetrySetup } from "./node-core.mjs";
import { s as srcExports$1 } from "../@opentelemetry/instrumentation-undici.mjs";
import { s as srcExports$i } from "../@opentelemetry/instrumentation-amqplib.mjs";
import { I as InstrumentationBase, a as InstrumentationNodeModuleDefinition, s as safeExecuteInTheMiddle, b as InstrumentationNodeModuleFile, i as isWrapped } from "../@opentelemetry/instrumentation.mjs";
import { s as srcExports$f } from "../@opentelemetry/instrumentation-connect.mjs";
import { s as srcExports$2 } from "../@opentelemetry/instrumentation-express.mjs";
import * as diagnosticsChannel from "node:diagnostics_channel";
import diagnosticsChannel__default from "node:diagnostics_channel";
import { m as minimatch } from "../minimatch.mjs";
import { n as getRPCMetadata, R as RPCType } from "../@opentelemetry/core.mjs";
import { g as ATTR_HTTP_ROUTE, c as ATTR_SERVICE_NAME, h as ATTR_HTTP_REQUEST_METHOD, i as ATTR_HTTP_RESPONSE_STATUS_CODE, S as SEMATTRS_HTTP_ROUTE, j as ATTR_DB_NAMESPACE, k as ATTR_SERVER_ADDRESS, l as ATTR_SERVER_PORT, m as ATTR_DB_OPERATION_NAME, n as ATTR_DB_QUERY_TEXT, o as ATTR_DB_SYSTEM_NAME, p as ATTR_DB_RESPONSE_STATUS_CODE, q as ATTR_ERROR_TYPE, s as ATTR_DB_COLLECTION_NAME, t as ATTR_SERVICE_VERSION, u as SEMRESATTRS_SERVICE_NAMESPACE } from "../@opentelemetry/semantic-conventions.mjs";
import * as net from "node:net";
import { s as srcExports$h } from "../@opentelemetry/instrumentation-generic-pool.mjs";
import { s as srcExports$3 } from "../@opentelemetry/instrumentation-graphql.mjs";
import { S as SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, a as SentrySpanProcessor, b as SentrySampler, c as SentryPropagator } from "./opentelemetry.mjs";
import { s as srcExports$d } from "../@opentelemetry/instrumentation-hapi.mjs";
import { s as srcExports$4 } from "../@opentelemetry/instrumentation-kafkajs.mjs";
import { s as srcExports$e } from "../@opentelemetry/instrumentation-koa.mjs";
import { s as srcExports$5 } from "../@opentelemetry/instrumentation-lru-memoizer.mjs";
import { s as srcExports$6 } from "../@opentelemetry/instrumentation-mongodb.mjs";
import { s as srcExports$7 } from "../@opentelemetry/instrumentation-mongoose.mjs";
import { s as srcExports$8 } from "../@opentelemetry/instrumentation-mysql.mjs";
import { s as srcExports$9 } from "../@opentelemetry/instrumentation-mysql2.mjs";
import { s as srcExports$c } from "../@opentelemetry/instrumentation-pg.mjs";
import { P as PrismaInstrumentation } from "../@prisma/instrumentation.mjs";
import { s as srcExports$a } from "../@opentelemetry/instrumentation-ioredis.mjs";
import { s as srcExports$b } from "../@opentelemetry/instrumentation-redis.mjs";
import { s as srcExports$g } from "../@opentelemetry/instrumentation-tedious.mjs";
import { B as BasicTracerProvider } from "../@opentelemetry/sdk-trace-base.mjs";
import { d as defaultResource, r as resourceFromAttributes } from "../@opentelemetry/resources.mjs";
const INTEGRATION_NAME$n = "Http";
const INSTRUMENTATION_NAME = "@opentelemetry_sentry-patched/instrumentation-http";
const instrumentSentryHttp = generateInstrumentOnce(
  `${INTEGRATION_NAME$n}.sentry`,
  (options) => {
    return new SentryHttpInstrumentation(options);
  }
);
const instrumentOtelHttp = generateInstrumentOnce(INTEGRATION_NAME$n, (config2) => {
  const instrumentation = new srcExports.HttpInstrumentation({
    ...config2,
    // This is hard-coded and can never be overridden by the user
    disableIncomingRequestInstrumentation: true
  });
  try {
    instrumentation["_diag"] = diag.createComponentLogger({
      namespace: INSTRUMENTATION_NAME
    });
    instrumentation.instrumentationName = INSTRUMENTATION_NAME;
  } catch {
  }
  return instrumentation;
});
function _shouldUseOtelHttpInstrumentation(options, clientOptions = {}) {
  if (typeof options.spans === "boolean") {
    return options.spans;
  }
  if (clientOptions.skipOpenTelemetrySetup) {
    return false;
  }
  if (!hasSpansEnabled(clientOptions) && NODE_VERSION.major >= 22) {
    return false;
  }
  return true;
}
const httpIntegration = defineIntegration((options = {}) => {
  const spans = options.spans ?? true;
  const disableIncomingRequestSpans = options.disableIncomingRequestSpans;
  const serverOptions = {
    sessions: options.trackIncomingRequestsAsSessions,
    sessionFlushingDelayMS: options.sessionFlushingDelayMS,
    ignoreRequestBody: options.ignoreIncomingRequestBody,
    maxRequestBodySize: options.maxIncomingRequestBodySize
  };
  const serverSpansOptions = {
    ignoreIncomingRequests: options.ignoreIncomingRequests,
    ignoreStaticAssets: options.ignoreStaticAssets,
    ignoreStatusCodes: options.dropSpansForIncomingRequestStatusCodes,
    instrumentation: options.instrumentation,
    onSpanCreated: options.incomingRequestSpanHook
  };
  const server = httpServerIntegration(serverOptions);
  const serverSpans = httpServerSpansIntegration(serverSpansOptions);
  const enableServerSpans = spans && !disableIncomingRequestSpans;
  return {
    name: INTEGRATION_NAME$n,
    setup(client) {
      const clientOptions = client.getOptions();
      if (enableServerSpans && hasSpansEnabled(clientOptions)) {
        serverSpans.setup(client);
      }
    },
    setupOnce() {
      const clientOptions = getClient()?.getOptions() || {};
      const useOtelHttpInstrumentation = _shouldUseOtelHttpInstrumentation(options, clientOptions);
      server.setupOnce();
      const sentryHttpInstrumentationOptions = {
        breadcrumbs: options.breadcrumbs,
        propagateTraceInOutgoingRequests: !useOtelHttpInstrumentation,
        ignoreOutgoingRequests: options.ignoreOutgoingRequests
      };
      instrumentSentryHttp(sentryHttpInstrumentationOptions);
      if (useOtelHttpInstrumentation) {
        const instrumentationConfig = getConfigWithDefaults$1(options);
        instrumentOtelHttp(instrumentationConfig);
      }
    },
    processEvent(event) {
      return serverSpans.processEvent(event);
    }
  };
});
function getConfigWithDefaults$1(options = {}) {
  const instrumentationConfig = {
    ignoreOutgoingRequestHook: (request) => {
      const url = getRequestUrl(request);
      if (!url) {
        return false;
      }
      const _ignoreOutgoingRequests = options.ignoreOutgoingRequests;
      if (_ignoreOutgoingRequests?.(url, request)) {
        return true;
      }
      return false;
    },
    requireParentforOutgoingSpans: false,
    requestHook: (span, req) => {
      addOriginToSpan(span, "auto.http.otel.http");
      options.instrumentation?.requestHook?.(span, req);
    },
    responseHook: (span, res) => {
      options.instrumentation?.responseHook?.(span, res);
    },
    applyCustomAttributesOnSpan: (span, request, response) => {
      options.instrumentation?.applyCustomAttributesOnSpan?.(span, request, response);
    }
  };
  return instrumentationConfig;
}
const INTEGRATION_NAME$m = "NodeFetch";
const instrumentOtelNodeFetch = generateInstrumentOnce(
  INTEGRATION_NAME$m,
  srcExports$1.UndiciInstrumentation,
  (options) => {
    return getConfigWithDefaults(options);
  }
);
const instrumentSentryNodeFetch = generateInstrumentOnce(
  `${INTEGRATION_NAME$m}.sentry`,
  SentryNodeFetchInstrumentation,
  (options) => {
    return options;
  }
);
const _nativeNodeFetchIntegration = ((options = {}) => {
  return {
    name: "NodeFetch",
    setupOnce() {
      const instrumentSpans = _shouldInstrumentSpans(options, getClient()?.getOptions());
      if (instrumentSpans) {
        instrumentOtelNodeFetch(options);
      }
      instrumentSentryNodeFetch(options);
    }
  };
});
const nativeNodeFetchIntegration = defineIntegration(_nativeNodeFetchIntegration);
function getAbsoluteUrl(origin, path = "/") {
  const url = `${origin}`;
  if (url.endsWith("/") && path.startsWith("/")) {
    return `${url}${path.slice(1)}`;
  }
  if (!url.endsWith("/") && !path.startsWith("/")) {
    return `${url}/${path.slice(1)}`;
  }
  return `${url}${path}`;
}
function _shouldInstrumentSpans(options, clientOptions = {}) {
  return typeof options.spans === "boolean" ? options.spans : !clientOptions.skipOpenTelemetrySetup && hasSpansEnabled(clientOptions);
}
function getConfigWithDefaults(options = {}) {
  const instrumentationConfig = {
    requireParentforSpans: false,
    ignoreRequestHook: (request) => {
      const url = getAbsoluteUrl(request.origin, request.path);
      const _ignoreOutgoingRequests = options.ignoreOutgoingRequests;
      const shouldIgnore = _ignoreOutgoingRequests && url && _ignoreOutgoingRequests(url);
      return !!shouldIgnore;
    },
    startSpanHook: () => {
      return {
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.node_fetch"
      };
    },
    requestHook: options.requestHook,
    responseHook: options.responseHook
  };
  return instrumentationConfig;
}
const DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
const INTEGRATION_NAME$l = "Express";
function requestHook(span) {
  addOriginToSpan(span, "auto.http.otel.express");
  const attributes = spanToJSON(span).data;
  const type = attributes["express.type"];
  if (type) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, `${type}.express`);
  }
  const name = attributes["express.name"];
  if (typeof name === "string") {
    span.updateName(name);
  }
}
function spanNameHook(info, defaultName) {
  if (getIsolationScope() === getDefaultIsolationScope()) {
    DEBUG_BUILD && debug.warn("Isolation scope is still default isolation scope - skipping setting transactionName");
    return defaultName;
  }
  if (info.layerType === "request_handler") {
    const req = info.request;
    const method = req.method ? req.method.toUpperCase() : "GET";
    getIsolationScope().setTransactionName(`${method} ${info.route}`);
  }
  return defaultName;
}
const instrumentExpress = generateInstrumentOnce(
  INTEGRATION_NAME$l,
  () => new srcExports$2.ExpressInstrumentation({
    requestHook: (span) => requestHook(span),
    spanNameHook: (info, defaultName) => spanNameHook(info, defaultName)
  })
);
const _expressIntegration = (() => {
  return {
    name: INTEGRATION_NAME$l,
    setupOnce() {
      instrumentExpress();
    }
  };
});
const expressIntegration = defineIntegration(_expressIntegration);
const PACKAGE_NAME$2 = "@fastify/otel";
const PACKAGE_VERSION$2 = "0.8.0";
const SUPPORTED_VERSIONS$2 = ">=4.0.0 <6";
const FASTIFY_HOOKS = [
  "onRequest",
  "preParsing",
  "preValidation",
  "preHandler",
  "preSerialization",
  "onSend",
  "onResponse",
  "onError"
];
const ATTRIBUTE_NAMES = {
  HOOK_NAME: "hook.name",
  FASTIFY_TYPE: "fastify.type",
  HOOK_CALLBACK_NAME: "hook.callback.name",
  ROOT: "fastify.root"
};
const HOOK_TYPES = {
  ROUTE: "route-hook",
  INSTANCE: "hook",
  HANDLER: "request-handler"
};
const ANONYMOUS_FUNCTION_NAME = "anonymous";
const kInstrumentation = /* @__PURE__ */ Symbol("fastify otel instance");
const kRequestSpan = /* @__PURE__ */ Symbol("fastify otel request spans");
const kRequestContext = /* @__PURE__ */ Symbol("fastify otel request context");
const kAddHookOriginal = /* @__PURE__ */ Symbol("fastify otel addhook original");
const kSetNotFoundOriginal = /* @__PURE__ */ Symbol("fastify otel setnotfound original");
const kIgnorePaths = /* @__PURE__ */ Symbol("fastify otel ignore path");
class FastifyOtelInstrumentation extends InstrumentationBase {
  constructor(config2) {
    super(PACKAGE_NAME$2, PACKAGE_VERSION$2, config2);
    this.servername = config2?.servername ?? process.env.OTEL_SERVICE_NAME ?? "fastify";
    this[kIgnorePaths] = null;
    this._logger = diag.createComponentLogger({ namespace: PACKAGE_NAME$2 });
    if (config2?.ignorePaths != null || process.env.OTEL_FASTIFY_IGNORE_PATHS != null) {
      const ignorePaths = config2?.ignorePaths ?? process.env.OTEL_FASTIFY_IGNORE_PATHS;
      if ((typeof ignorePaths !== "string" || ignorePaths.length === 0) && typeof ignorePaths !== "function") {
        throw new TypeError("ignorePaths must be a string or a function");
      }
      const globMatcher = minimatch;
      this[kIgnorePaths] = (routeOptions) => {
        if (typeof ignorePaths === "function") {
          return ignorePaths(routeOptions);
        } else {
          return globMatcher(routeOptions.url, ignorePaths);
        }
      };
    }
  }
  enable() {
    if (this._handleInitialization === void 0 && this.getConfig().registerOnInitialization) {
      const FastifyInstrumentationPlugin = this.plugin();
      this._handleInitialization = (message) => {
        message.fastify.register(FastifyInstrumentationPlugin);
      };
      diagnosticsChannel__default.subscribe("fastify.initialization", this._handleInitialization);
    }
    return super.enable();
  }
  disable() {
    if (this._handleInitialization) {
      diagnosticsChannel__default.unsubscribe("fastify.initialization", this._handleInitialization);
      this._handleInitialization = void 0;
    }
    return super.disable();
  }
  // We do not do patching in this instrumentation
  init() {
    return [];
  }
  plugin() {
    const instrumentation = this;
    FastifyInstrumentationPlugin[/* @__PURE__ */ Symbol.for("skip-override")] = true;
    FastifyInstrumentationPlugin[/* @__PURE__ */ Symbol.for("fastify.display-name")] = "@fastify/otel";
    FastifyInstrumentationPlugin[/* @__PURE__ */ Symbol.for("plugin-meta")] = {
      fastify: SUPPORTED_VERSIONS$2,
      name: "@fastify/otel"
    };
    return FastifyInstrumentationPlugin;
    function FastifyInstrumentationPlugin(instance, opts, done) {
      instance.decorate(kInstrumentation, instrumentation);
      instance.decorate(kAddHookOriginal, instance.addHook);
      instance.decorate(kSetNotFoundOriginal, instance.setNotFoundHandler);
      instance.decorateRequest("opentelemetry", function openetelemetry() {
        const ctx = this[kRequestContext];
        const span = this[kRequestSpan];
        return {
          span,
          tracer: instrumentation.tracer,
          context: ctx,
          inject: (carrier, setter) => {
            return propagation.inject(ctx, carrier, setter);
          },
          extract: (carrier, getter) => {
            return propagation.extract(ctx, carrier, getter);
          }
        };
      });
      instance.decorateRequest(kRequestSpan, null);
      instance.decorateRequest(kRequestContext, null);
      instance.addHook("onRoute", function(routeOptions) {
        if (instrumentation[kIgnorePaths]?.(routeOptions) === true) {
          instrumentation._logger.debug(
            `Ignoring route instrumentation ${routeOptions.method} ${routeOptions.url} because it matches the ignore path`
          );
          return;
        }
        for (const hook of FASTIFY_HOOKS) {
          if (routeOptions[hook] != null) {
            const handlerLike = routeOptions[hook];
            if (typeof handlerLike === "function") {
              routeOptions[hook] = handlerWrapper(handlerLike, {
                [ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
                [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route -> ${hook}`,
                [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.ROUTE,
                [ATTR_HTTP_ROUTE]: routeOptions.url,
                [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handlerLike.name?.length > 0 ? handlerLike.name : ANONYMOUS_FUNCTION_NAME
              });
            } else if (Array.isArray(handlerLike)) {
              const wrappedHandlers = [];
              for (const handler of handlerLike) {
                wrappedHandlers.push(
                  handlerWrapper(handler, {
                    [ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
                    [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route -> ${hook}`,
                    [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.ROUTE,
                    [ATTR_HTTP_ROUTE]: routeOptions.url,
                    [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handler.name?.length > 0 ? handler.name : ANONYMOUS_FUNCTION_NAME
                  })
                );
              }
              routeOptions[hook] = wrappedHandlers;
            }
          }
        }
        if (routeOptions.onSend != null) {
          routeOptions.onSend = Array.isArray(routeOptions.onSend) ? [...routeOptions.onSend, onSendHook] : [routeOptions.onSend, onSendHook];
        } else {
          routeOptions.onSend = onSendHook;
        }
        if (routeOptions.onError != null) {
          routeOptions.onError = Array.isArray(routeOptions.onError) ? [...routeOptions.onError, onErrorHook] : [routeOptions.onError, onErrorHook];
        } else {
          routeOptions.onError = onErrorHook;
        }
        routeOptions.handler = handlerWrapper(routeOptions.handler, {
          [ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
          [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route-handler`,
          [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.HANDLER,
          [ATTR_HTTP_ROUTE]: routeOptions.url,
          [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: routeOptions.handler.name.length > 0 ? routeOptions.handler.name : ANONYMOUS_FUNCTION_NAME
        });
      });
      instance.addHook("onRequest", function(request, _reply, hookDone) {
        if (this[kInstrumentation].isEnabled() === false) {
          return hookDone();
        } else if (this[kInstrumentation][kIgnorePaths]?.({
          url: request.url,
          method: request.method
        }) === true) {
          this[kInstrumentation]._logger.debug(
            `Ignoring request ${request.method} ${request.url} because it matches the ignore path`
          );
          return hookDone();
        }
        let ctx = context.active();
        if (trace.getSpan(ctx) == null) {
          ctx = propagation.extract(ctx, request.headers);
        }
        const rpcMetadata = getRPCMetadata(ctx);
        if (request.routeOptions.url != null && rpcMetadata?.type === RPCType.HTTP) {
          rpcMetadata.route = request.routeOptions.url;
        }
        const span = this[kInstrumentation].tracer.startSpan(
          "request",
          {
            attributes: {
              [ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
              [ATTRIBUTE_NAMES.ROOT]: "@fastify/otel",
              [ATTR_HTTP_ROUTE]: request.url,
              [ATTR_HTTP_REQUEST_METHOD]: request.method
            }
          },
          ctx
        );
        request[kRequestContext] = trace.setSpan(ctx, span);
        request[kRequestSpan] = span;
        context.with(request[kRequestContext], () => {
          hookDone();
        });
      });
      instance.addHook("onResponse", function(request, reply, hookDone) {
        const span = request[kRequestSpan];
        if (span != null) {
          span.setStatus({
            code: SpanStatusCode.OK,
            message: "OK"
          });
          span.setAttributes({
            [ATTR_HTTP_RESPONSE_STATUS_CODE]: 404
          });
          span.end();
        }
        request[kRequestSpan] = null;
        hookDone();
      });
      instance.addHook = addHookPatched;
      instance.setNotFoundHandler = setNotFoundHandlerPatched;
      done();
      function onSendHook(request, reply, payload, hookDone) {
        const span = request[kRequestSpan];
        if (span != null) {
          if (reply.statusCode < 500) {
            span.setStatus({
              code: SpanStatusCode.OK,
              message: "OK"
            });
          }
          span.setAttributes({
            [ATTR_HTTP_RESPONSE_STATUS_CODE]: reply.statusCode
          });
          span.end();
        }
        request[kRequestSpan] = null;
        hookDone(null, payload);
      }
      function onErrorHook(request, reply, error, hookDone) {
        const span = request[kRequestSpan];
        if (span != null) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message
          });
          span.recordException(error);
        }
        hookDone();
      }
      function addHookPatched(name, hook) {
        const addHookOriginal = this[kAddHookOriginal];
        if (FASTIFY_HOOKS.includes(name)) {
          return addHookOriginal.call(
            this,
            name,
            handlerWrapper(hook, {
              [ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
              [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - ${name}`,
              [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
              [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hook.name?.length > 0 ? hook.name : ANONYMOUS_FUNCTION_NAME
            })
          );
        } else {
          return addHookOriginal.call(this, name, hook);
        }
      }
      function setNotFoundHandlerPatched(hooks, handler) {
        const setNotFoundHandlerOriginal = this[kSetNotFoundOriginal];
        if (typeof hooks === "function") {
          handler = handlerWrapper(hooks, {
            [ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
            [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler`,
            [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
            [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.name?.length > 0 ? hooks.name : ANONYMOUS_FUNCTION_NAME
          });
          setNotFoundHandlerOriginal.call(this, handler);
        } else {
          if (hooks.preValidation != null) {
            hooks.preValidation = handlerWrapper(hooks.preValidation, {
              [ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
              [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler - preValidation`,
              [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
              [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.preValidation.name?.length > 0 ? hooks.preValidation.name : ANONYMOUS_FUNCTION_NAME
            });
          }
          if (hooks.preHandler != null) {
            hooks.preHandler = handlerWrapper(hooks.preHandler, {
              [ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
              [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler - preHandler`,
              [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
              [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.preHandler.name?.length > 0 ? hooks.preHandler.name : ANONYMOUS_FUNCTION_NAME
            });
          }
          handler = handlerWrapper(handler, {
            [ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
            [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler`,
            [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
            [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handler.name?.length > 0 ? handler.name : ANONYMOUS_FUNCTION_NAME
          });
          setNotFoundHandlerOriginal.call(this, hooks, handler);
        }
      }
      function handlerWrapper(handler, spanAttributes = {}) {
        return function handlerWrapped(...args) {
          const instrumentation2 = this[kInstrumentation];
          const [request] = args;
          if (instrumentation2.isEnabled() === false) {
            return handler.call(this, ...args);
          }
          const ctx = request[kRequestContext] ?? context.active();
          const span = instrumentation2.tracer.startSpan(
            `handler - ${handler.name?.length > 0 ? handler.name : this.pluginName ?? ANONYMOUS_FUNCTION_NAME}`,
            {
              attributes: spanAttributes
            },
            ctx
          );
          return context.with(
            trace.setSpan(ctx, span),
            function() {
              try {
                const res = handler.call(this, ...args);
                if (typeof res?.then === "function") {
                  return res.then(
                    (result) => {
                      span.end();
                      return result;
                    },
                    (error) => {
                      span.setStatus({
                        code: SpanStatusCode.ERROR,
                        message: error.message
                      });
                      span.recordException(error);
                      span.end();
                      return Promise.reject(error);
                    }
                  );
                }
                span.end();
                return res;
              } catch (error) {
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: error.message
                });
                span.recordException(error);
                span.end();
                throw error;
              }
            },
            this
          );
        };
      }
    }
  }
}
var AttributeNames$1;
(function(AttributeNames2) {
  const FASTIFY_NAME = "fastify.name";
  AttributeNames2["FASTIFY_NAME"] = FASTIFY_NAME;
  const FASTIFY_TYPE = "fastify.type";
  AttributeNames2["FASTIFY_TYPE"] = FASTIFY_TYPE;
  const HOOK_NAME = "hook.name";
  AttributeNames2["HOOK_NAME"] = HOOK_NAME;
  const PLUGIN_NAME = "plugin.name";
  AttributeNames2["PLUGIN_NAME"] = PLUGIN_NAME;
})(AttributeNames$1 || (AttributeNames$1 = {}));
var FastifyTypes;
(function(FastifyTypes2) {
  const MIDDLEWARE = "middleware";
  FastifyTypes2["MIDDLEWARE"] = MIDDLEWARE;
  const REQUEST_HANDLER = "request_handler";
  FastifyTypes2["REQUEST_HANDLER"] = REQUEST_HANDLER;
})(FastifyTypes || (FastifyTypes = {}));
var FastifyNames;
(function(FastifyNames2) {
  const MIDDLEWARE = "middleware";
  FastifyNames2["MIDDLEWARE"] = MIDDLEWARE;
  const REQUEST_HANDLER = "request handler";
  FastifyNames2["REQUEST_HANDLER"] = REQUEST_HANDLER;
})(FastifyNames || (FastifyNames = {}));
const spanRequestSymbol = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.fastify.request_active_span");
function startSpan(reply, tracer, spanName, spanAttributes = {}) {
  const span = tracer.startSpan(spanName, { attributes: spanAttributes });
  const spans = reply[spanRequestSymbol] || [];
  spans.push(span);
  Object.defineProperty(reply, spanRequestSymbol, {
    enumerable: false,
    configurable: true,
    value: spans
  });
  return span;
}
function endSpan(reply, err) {
  const spans = reply[spanRequestSymbol] || [];
  if (!spans.length) {
    return;
  }
  spans.forEach((span) => {
    if (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message
      });
      span.recordException(err);
    }
    span.end();
  });
  delete reply[spanRequestSymbol];
}
function safeExecuteInTheMiddleMaybePromise(execute, onFinish, preventThrowingError) {
  let error;
  let result = void 0;
  try {
    result = execute();
    if (isPromise(result)) {
      result.then(
        (res) => onFinish(void 0, res),
        (err) => onFinish(err)
      );
    }
  } catch (e) {
    error = e;
  } finally {
    if (!isPromise(result)) {
      onFinish(error, result);
      if (error && true) {
        throw error;
      }
    }
    return result;
  }
}
function isPromise(val) {
  return typeof val === "object" && val && typeof Object.getOwnPropertyDescriptor(val, "then")?.value === "function" || false;
}
const PACKAGE_VERSION$1 = "0.1.0";
const PACKAGE_NAME$1 = "@sentry/instrumentation-fastify-v3";
const ANONYMOUS_NAME = "anonymous";
const hooksNamesToWrap = /* @__PURE__ */ new Set([
  "onTimeout",
  "onRequest",
  "preParsing",
  "preValidation",
  "preSerialization",
  "preHandler",
  "onSend",
  "onResponse",
  "onError"
]);
class FastifyInstrumentationV3 extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$1, PACKAGE_VERSION$1, config2);
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition("fastify", [">=3.0.0 <4"], (moduleExports) => {
        return this._patchConstructor(moduleExports);
      })
    ];
  }
  _hookOnRequest() {
    const instrumentation = this;
    return function onRequest(request, reply, done) {
      if (!instrumentation.isEnabled()) {
        return done();
      }
      instrumentation._wrap(reply, "send", instrumentation._patchSend());
      const anyRequest = request;
      const rpcMetadata = getRPCMetadata(context.active());
      const routeName = anyRequest.routeOptions ? anyRequest.routeOptions.url : request.routerPath;
      if (routeName && rpcMetadata?.type === RPCType.HTTP) {
        rpcMetadata.route = routeName;
      }
      const method = request.method || "GET";
      getIsolationScope().setTransactionName(`${method} ${routeName}`);
      done();
    };
  }
  _wrapHandler(pluginName, hookName, original, syncFunctionWithDone) {
    const instrumentation = this;
    this._diag.debug("Patching fastify route.handler function");
    return function(...args) {
      if (!instrumentation.isEnabled()) {
        return original.apply(this, args);
      }
      const name = original.name || pluginName || ANONYMOUS_NAME;
      const spanName = `${FastifyNames.MIDDLEWARE} - ${name}`;
      const reply = args[1];
      const span = startSpan(reply, instrumentation.tracer, spanName, {
        [AttributeNames$1.FASTIFY_TYPE]: FastifyTypes.MIDDLEWARE,
        [AttributeNames$1.PLUGIN_NAME]: pluginName,
        [AttributeNames$1.HOOK_NAME]: hookName
      });
      const origDone = syncFunctionWithDone && args[args.length - 1];
      if (origDone) {
        args[args.length - 1] = function(...doneArgs) {
          endSpan(reply);
          origDone.apply(this, doneArgs);
        };
      }
      return context.with(trace.setSpan(context.active(), span), () => {
        return safeExecuteInTheMiddleMaybePromise(
          () => {
            return original.apply(this, args);
          },
          (err) => {
            if (err instanceof Error) {
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: err.message
              });
              span.recordException(err);
            }
            if (!syncFunctionWithDone) {
              endSpan(reply);
            }
          }
        );
      });
    };
  }
  _wrapAddHook() {
    const instrumentation = this;
    this._diag.debug("Patching fastify server.addHook function");
    return function(original) {
      return function wrappedAddHook(...args) {
        const name = args[0];
        const handler = args[1];
        const pluginName = this.pluginName;
        if (!hooksNamesToWrap.has(name)) {
          return original.apply(this, args);
        }
        const syncFunctionWithDone = typeof args[args.length - 1] === "function" && handler.constructor.name !== "AsyncFunction";
        return original.apply(this, [
          name,
          instrumentation._wrapHandler(pluginName, name, handler, syncFunctionWithDone)
        ]);
      };
    };
  }
  _patchConstructor(moduleExports) {
    const instrumentation = this;
    function fastify(...args) {
      const app = moduleExports.fastify.apply(this, args);
      app.addHook("onRequest", instrumentation._hookOnRequest());
      app.addHook("preHandler", instrumentation._hookPreHandler());
      instrumentClient$1();
      instrumentation._wrap(app, "addHook", instrumentation._wrapAddHook());
      return app;
    }
    if (moduleExports.errorCodes !== void 0) {
      fastify.errorCodes = moduleExports.errorCodes;
    }
    fastify.fastify = fastify;
    fastify.default = fastify;
    return fastify;
  }
  _patchSend() {
    const instrumentation = this;
    this._diag.debug("Patching fastify reply.send function");
    return function patchSend(original) {
      return function send(...args) {
        const maybeError = args[0];
        if (!instrumentation.isEnabled()) {
          return original.apply(this, args);
        }
        return safeExecuteInTheMiddle(
          () => {
            return original.apply(this, args);
          },
          (err) => {
            if (!err && maybeError instanceof Error) {
              err = maybeError;
            }
            endSpan(this, err);
          }
        );
      };
    };
  }
  _hookPreHandler() {
    const instrumentation = this;
    this._diag.debug("Patching fastify preHandler function");
    return function preHandler(request, reply, done) {
      if (!instrumentation.isEnabled()) {
        return done();
      }
      const anyRequest = request;
      const handler = anyRequest.routeOptions?.handler || anyRequest.context?.handler;
      const handlerName = handler?.name.startsWith("bound ") ? handler.name.substring(6) : handler?.name;
      const spanName = `${FastifyNames.REQUEST_HANDLER} - ${handlerName || this.pluginName || ANONYMOUS_NAME}`;
      const spanAttributes = {
        [AttributeNames$1.PLUGIN_NAME]: this.pluginName,
        [AttributeNames$1.FASTIFY_TYPE]: FastifyTypes.REQUEST_HANDLER,
        // eslint-disable-next-line deprecation/deprecation
        [SEMATTRS_HTTP_ROUTE]: anyRequest.routeOptions ? anyRequest.routeOptions.url : request.routerPath
      };
      if (handlerName) {
        spanAttributes[AttributeNames$1.FASTIFY_NAME] = handlerName;
      }
      const span = startSpan(reply, instrumentation.tracer, spanName, spanAttributes);
      addFastifyV3SpanAttributes(span);
      const { requestHook: requestHook2 } = instrumentation.getConfig();
      if (requestHook2) {
        safeExecuteInTheMiddle(
          () => requestHook2(span, { request }),
          (e) => {
            if (e) {
              instrumentation._diag.error("request hook failed", e);
            }
          },
          true
        );
      }
      return context.with(trace.setSpan(context.active(), span), () => {
        done();
      });
    };
  }
}
function instrumentClient$1() {
  const client = getClient();
  if (client) {
    client.on("spanStart", (span) => {
      addFastifyV3SpanAttributes(span);
    });
  }
}
function addFastifyV3SpanAttributes(span) {
  const attributes = spanToJSON(span).data;
  const type = attributes["fastify.type"];
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) {
    return;
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.fastify",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.fastify`
  });
  const name = attributes["fastify.name"] || attributes["plugin.name"] || attributes["hook.name"];
  if (typeof name === "string") {
    const updatedName = name.replace(/^fastify -> /, "").replace(/^@fastify\/otel -> /, "");
    span.updateName(updatedName);
  }
}
const INTEGRATION_NAME$k = "Fastify";
const instrumentFastifyV3 = generateInstrumentOnce(
  `${INTEGRATION_NAME$k}.v3`,
  () => new FastifyInstrumentationV3()
);
function getFastifyIntegration() {
  const client = getClient();
  if (!client) {
    return void 0;
  } else {
    return client.getIntegrationByName(INTEGRATION_NAME$k);
  }
}
function handleFastifyError(error, request, reply, handlerOrigin) {
  const shouldHandleError = getFastifyIntegration()?.getShouldHandleError() || defaultShouldHandleError;
  if (handlerOrigin === "diagnostics-channel") {
    this.diagnosticsChannelExists = true;
  }
  if (this.diagnosticsChannelExists && handlerOrigin === "onError-hook") {
    DEBUG_BUILD && debug.warn(
      "Fastify error handler was already registered via diagnostics channel.",
      "You can safely remove `setupFastifyErrorHandler` call and set `shouldHandleError` on the integration options."
    );
    return;
  }
  if (shouldHandleError(error, request, reply)) {
    captureException(error, { mechanism: { handled: false, type: "auto.function.fastify" } });
  }
}
const instrumentFastify = generateInstrumentOnce(`${INTEGRATION_NAME$k}.v5`, () => {
  const fastifyOtelInstrumentationInstance = new FastifyOtelInstrumentation();
  const plugin = fastifyOtelInstrumentationInstance.plugin();
  diagnosticsChannel.subscribe("fastify.initialization", (message) => {
    const fastifyInstance = message.fastify;
    fastifyInstance?.register(plugin).after((err) => {
      if (err) {
        DEBUG_BUILD && debug.error("Failed to setup Fastify instrumentation", err);
      } else {
        instrumentClient();
        if (fastifyInstance) {
          instrumentOnRequest(fastifyInstance);
        }
      }
    });
  });
  diagnosticsChannel.subscribe("tracing:fastify.request.handler:error", (message) => {
    const { error, request, reply } = message;
    handleFastifyError.call(handleFastifyError, error, request, reply, "diagnostics-channel");
  });
  return fastifyOtelInstrumentationInstance;
});
const _fastifyIntegration = (({ shouldHandleError }) => {
  let _shouldHandleError;
  return {
    name: INTEGRATION_NAME$k,
    setupOnce() {
      _shouldHandleError = shouldHandleError || defaultShouldHandleError;
      instrumentFastifyV3();
      instrumentFastify();
    },
    getShouldHandleError() {
      return _shouldHandleError;
    },
    setShouldHandleError(fn) {
      _shouldHandleError = fn;
    }
  };
});
const fastifyIntegration = defineIntegration(
  (options = {}) => _fastifyIntegration(options)
);
function defaultShouldHandleError(_error, _request, reply) {
  const statusCode = reply.statusCode;
  return statusCode >= 500 || statusCode <= 299;
}
function addFastifySpanAttributes(span) {
  const spanJSON = spanToJSON(span);
  const spanName = spanJSON.description;
  const attributes = spanJSON.data;
  const type = attributes["fastify.type"];
  const isHook = type === "hook";
  const isHandler = type === spanName?.startsWith("handler -");
  const isRequestHandler = spanName === "request" || type === "request-handler";
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !isHandler && !isRequestHandler && !isHook) {
    return;
  }
  const opPrefix = isHook ? "hook" : isHandler ? "middleware" : isRequestHandler ? "request-handler" : "<unknown>";
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.fastify",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${opPrefix}.fastify`
  });
  const attrName = attributes["fastify.name"] || attributes["plugin.name"] || attributes["hook.name"];
  if (typeof attrName === "string") {
    const updatedName = attrName.replace(/^fastify -> /, "").replace(/^@fastify\/otel -> /, "");
    span.updateName(updatedName);
  }
}
function instrumentClient() {
  const client = getClient();
  if (client) {
    client.on("spanStart", (span) => {
      addFastifySpanAttributes(span);
    });
  }
}
function instrumentOnRequest(fastify) {
  fastify.addHook("onRequest", async (request, _reply) => {
    if (request.opentelemetry) {
      const { span } = request.opentelemetry();
      if (span) {
        addFastifySpanAttributes(span);
      }
    }
    const routeName = request.routeOptions?.url;
    const method = request.method || "GET";
    getIsolationScope().setTransactionName(`${method} ${routeName}`);
  });
}
const INTEGRATION_NAME$j = "Graphql";
const instrumentGraphql = generateInstrumentOnce(
  INTEGRATION_NAME$j,
  srcExports$3.GraphQLInstrumentation,
  (_options) => {
    const options = getOptionsWithDefaults(_options);
    return {
      ...options,
      responseHook(span, result) {
        addOriginToSpan(span, "auto.graphql.otel.graphql");
        const resultWithMaybeError = result;
        if (resultWithMaybeError.errors?.length && !spanToJSON(span).status) {
          span.setStatus({ code: SpanStatusCode.ERROR });
        }
        const attributes = spanToJSON(span).data;
        const operationType = attributes["graphql.operation.type"];
        const operationName = attributes["graphql.operation.name"];
        if (options.useOperationNameForRootSpan && operationType) {
          const rootSpan = getRootSpan(span);
          const rootSpanAttributes = spanToJSON(rootSpan).data;
          const existingOperations = rootSpanAttributes[SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION] || [];
          const newOperation = operationName ? `${operationType} ${operationName}` : `${operationType}`;
          if (Array.isArray(existingOperations)) {
            existingOperations.push(newOperation);
            rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, existingOperations);
          } else if (typeof existingOperations === "string") {
            rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, [existingOperations, newOperation]);
          } else {
            rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, newOperation);
          }
          if (!spanToJSON(rootSpan).data["original-description"]) {
            rootSpan.setAttribute("original-description", spanToJSON(rootSpan).description);
          }
          rootSpan.updateName(
            `${spanToJSON(rootSpan).data["original-description"]} (${getGraphqlOperationNamesFromAttribute(
              existingOperations
            )})`
          );
        }
      }
    };
  }
);
const _graphqlIntegration = ((options = {}) => {
  return {
    name: INTEGRATION_NAME$j,
    setupOnce() {
      instrumentGraphql(getOptionsWithDefaults(options));
    }
  };
});
const graphqlIntegration = defineIntegration(_graphqlIntegration);
function getOptionsWithDefaults(options) {
  return {
    ignoreResolveSpans: true,
    ignoreTrivialResolveSpans: true,
    useOperationNameForRootSpan: true,
    ...options
  };
}
function getGraphqlOperationNamesFromAttribute(attr) {
  if (Array.isArray(attr)) {
    const sorted = attr.slice().sort();
    if (sorted.length <= 5) {
      return sorted.join(", ");
    } else {
      return `${sorted.slice(0, 5).join(", ")}, +${sorted.length - 5}`;
    }
  }
  return `${attr}`;
}
const INTEGRATION_NAME$i = "Kafka";
const instrumentKafka = generateInstrumentOnce(
  INTEGRATION_NAME$i,
  () => new srcExports$4.KafkaJsInstrumentation({
    consumerHook(span) {
      addOriginToSpan(span, "auto.kafkajs.otel.consumer");
    },
    producerHook(span) {
      addOriginToSpan(span, "auto.kafkajs.otel.producer");
    }
  })
);
const _kafkaIntegration = (() => {
  return {
    name: INTEGRATION_NAME$i,
    setupOnce() {
      instrumentKafka();
    }
  };
});
const kafkaIntegration = defineIntegration(_kafkaIntegration);
const INTEGRATION_NAME$h = "LruMemoizer";
const instrumentLruMemoizer = generateInstrumentOnce(INTEGRATION_NAME$h, () => new srcExports$5.LruMemoizerInstrumentation());
const _lruMemoizerIntegration = (() => {
  return {
    name: INTEGRATION_NAME$h,
    setupOnce() {
      instrumentLruMemoizer();
    }
  };
});
const lruMemoizerIntegration = defineIntegration(_lruMemoizerIntegration);
const INTEGRATION_NAME$g = "Mongo";
const instrumentMongo = generateInstrumentOnce(
  INTEGRATION_NAME$g,
  () => new srcExports$6.MongoDBInstrumentation({
    dbStatementSerializer: _defaultDbStatementSerializer,
    responseHook(span) {
      addOriginToSpan(span, "auto.db.otel.mongo");
    }
  })
);
function _defaultDbStatementSerializer(commandObj) {
  const resultObj = _scrubStatement(commandObj);
  return JSON.stringify(resultObj);
}
function _scrubStatement(value) {
  if (Array.isArray(value)) {
    return value.map((element) => _scrubStatement(element));
  }
  if (isCommandObj(value)) {
    const initial = {};
    return Object.entries(value).map(([key, element]) => [key, _scrubStatement(element)]).reduce((prev, current) => {
      if (isCommandEntry(current)) {
        prev[current[0]] = current[1];
      }
      return prev;
    }, initial);
  }
  return "?";
}
function isCommandObj(value) {
  return typeof value === "object" && value !== null && !isBuffer(value);
}
function isBuffer(value) {
  let isBuffer2 = false;
  if (typeof Buffer !== "undefined") {
    isBuffer2 = Buffer.isBuffer(value);
  }
  return isBuffer2;
}
function isCommandEntry(value) {
  return Array.isArray(value);
}
const _mongoIntegration = (() => {
  return {
    name: INTEGRATION_NAME$g,
    setupOnce() {
      instrumentMongo();
    }
  };
});
const mongoIntegration = defineIntegration(_mongoIntegration);
const INTEGRATION_NAME$f = "Mongoose";
const instrumentMongoose = generateInstrumentOnce(
  INTEGRATION_NAME$f,
  () => new srcExports$7.MongooseInstrumentation({
    responseHook(span) {
      addOriginToSpan(span, "auto.db.otel.mongoose");
    }
  })
);
const _mongooseIntegration = (() => {
  return {
    name: INTEGRATION_NAME$f,
    setupOnce() {
      instrumentMongoose();
    }
  };
});
const mongooseIntegration = defineIntegration(_mongooseIntegration);
const INTEGRATION_NAME$e = "Mysql";
const instrumentMysql = generateInstrumentOnce(INTEGRATION_NAME$e, () => new srcExports$8.MySQLInstrumentation({}));
const _mysqlIntegration = (() => {
  return {
    name: INTEGRATION_NAME$e,
    setupOnce() {
      instrumentMysql();
    }
  };
});
const mysqlIntegration = defineIntegration(_mysqlIntegration);
const INTEGRATION_NAME$d = "Mysql2";
const instrumentMysql2 = generateInstrumentOnce(
  INTEGRATION_NAME$d,
  () => new srcExports$9.MySQL2Instrumentation({
    responseHook(span) {
      addOriginToSpan(span, "auto.db.otel.mysql2");
    }
  })
);
const _mysql2Integration = (() => {
  return {
    name: INTEGRATION_NAME$d,
    setupOnce() {
      instrumentMysql2();
    }
  };
});
const mysql2Integration = defineIntegration(_mysql2Integration);
const SINGLE_ARG_COMMANDS = ["get", "set", "setex"];
const GET_COMMANDS = ["get", "mget"];
const SET_COMMANDS = ["set", "setex"];
function isInCommands(redisCommands, command) {
  return redisCommands.includes(command.toLowerCase());
}
function getCacheOperation(command) {
  if (isInCommands(GET_COMMANDS, command)) {
    return "cache.get";
  } else if (isInCommands(SET_COMMANDS, command)) {
    return "cache.put";
  } else {
    return void 0;
  }
}
function keyHasPrefix(key, prefixes) {
  return prefixes.some((prefix) => key.startsWith(prefix));
}
function getCacheKeySafely(redisCommand, cmdArgs) {
  try {
    if (cmdArgs.length === 0) {
      return void 0;
    }
    const processArg = (arg) => {
      if (typeof arg === "string" || typeof arg === "number" || Buffer.isBuffer(arg)) {
        return [arg.toString()];
      } else if (Array.isArray(arg)) {
        return flatten(arg.map((arg2) => processArg(arg2)));
      } else {
        return ["<unknown>"];
      }
    };
    const firstArg = cmdArgs[0];
    if (isInCommands(SINGLE_ARG_COMMANDS, redisCommand) && firstArg != null) {
      return processArg(firstArg);
    }
    return flatten(cmdArgs.map((arg) => processArg(arg)));
  } catch {
    return void 0;
  }
}
function shouldConsiderForCache(redisCommand, keys, prefixes) {
  if (!getCacheOperation(redisCommand)) {
    return false;
  }
  for (const key of keys) {
    if (keyHasPrefix(key, prefixes)) {
      return true;
    }
  }
  return false;
}
function calculateCacheItemSize(response) {
  const getSize = (value) => {
    try {
      if (Buffer.isBuffer(value)) return value.byteLength;
      else if (typeof value === "string") return value.length;
      else if (typeof value === "number") return value.toString().length;
      else if (value === null || value === void 0) return 0;
      return JSON.stringify(value).length;
    } catch {
      return void 0;
    }
  };
  return Array.isArray(response) ? response.reduce((acc, curr) => {
    const size = getSize(curr);
    return typeof size === "number" ? acc !== void 0 ? acc + size : size : acc;
  }, 0) : getSize(response);
}
function flatten(input) {
  const result = [];
  const flattenHelper = (input2) => {
    input2.forEach((el) => {
      if (Array.isArray(el)) {
        flattenHelper(el);
      } else {
        result.push(el);
      }
    });
  };
  flattenHelper(input);
  return result;
}
const INTEGRATION_NAME$c = "Redis";
let _redisOptions = {};
const cacheResponseHook = (span, redisCommand, cmdArgs, response) => {
  span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.redis");
  const safeKey = getCacheKeySafely(redisCommand, cmdArgs);
  const cacheOperation = getCacheOperation(redisCommand);
  if (!safeKey || !cacheOperation || !_redisOptions.cachePrefixes || !shouldConsiderForCache(redisCommand, safeKey, _redisOptions.cachePrefixes)) {
    return;
  }
  const networkPeerAddress = spanToJSON(span).data["net.peer.name"];
  const networkPeerPort = spanToJSON(span).data["net.peer.port"];
  if (networkPeerPort && networkPeerAddress) {
    span.setAttributes({ "network.peer.address": networkPeerAddress, "network.peer.port": networkPeerPort });
  }
  const cacheItemSize = calculateCacheItemSize(response);
  if (cacheItemSize) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE, cacheItemSize);
  }
  if (isInCommands(GET_COMMANDS, redisCommand) && cacheItemSize !== void 0) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_CACHE_HIT, cacheItemSize > 0);
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: cacheOperation,
    [SEMANTIC_ATTRIBUTE_CACHE_KEY]: safeKey
  });
  const spanDescription = safeKey.join(", ");
  span.updateName(
    _redisOptions.maxCacheKeyLength ? truncate(spanDescription, _redisOptions.maxCacheKeyLength) : spanDescription
  );
};
const instrumentIORedis = generateInstrumentOnce(`${INTEGRATION_NAME$c}.IORedis`, () => {
  return new srcExports$a.IORedisInstrumentation({
    responseHook: cacheResponseHook
  });
});
const instrumentRedisModule = generateInstrumentOnce(`${INTEGRATION_NAME$c}.Redis`, () => {
  return new srcExports$b.RedisInstrumentation({
    responseHook: cacheResponseHook
  });
});
const instrumentRedis = Object.assign(
  () => {
    instrumentIORedis();
    instrumentRedisModule();
  },
  { id: INTEGRATION_NAME$c }
);
const _redisIntegration = ((options = {}) => {
  return {
    name: INTEGRATION_NAME$c,
    setupOnce() {
      _redisOptions = options;
      instrumentRedis();
    }
  };
});
const redisIntegration = defineIntegration(_redisIntegration);
const INTEGRATION_NAME$b = "Postgres";
const instrumentPostgres = generateInstrumentOnce(
  INTEGRATION_NAME$b,
  () => new srcExports$c.PgInstrumentation({
    requireParentSpan: true,
    requestHook(span) {
      addOriginToSpan(span, "auto.db.otel.postgres");
    }
  })
);
const _postgresIntegration = (() => {
  return {
    name: INTEGRATION_NAME$b,
    setupOnce() {
      instrumentPostgres();
    }
  };
});
const postgresIntegration = defineIntegration(_postgresIntegration);
const INTEGRATION_NAME$a = "PostgresJs";
const SUPPORTED_VERSIONS$1 = [">=3.0.0 <4"];
const SQL_OPERATION_REGEX = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i;
const CONNECTION_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol("sentryPostgresConnectionContext");
const INSTRUMENTED_MARKER = /* @__PURE__ */ Symbol.for("sentry.instrumented.postgresjs");
const QUERY_FROM_INSTRUMENTED_SQL = /* @__PURE__ */ Symbol.for("sentry.query.from.instrumented.sql");
const instrumentPostgresJs = generateInstrumentOnce(
  INTEGRATION_NAME$a,
  (options) => new PostgresJsInstrumentation({
    requireParentSpan: options?.requireParentSpan ?? true,
    requestHook: options?.requestHook
  })
);
class PostgresJsInstrumentation extends InstrumentationBase {
  constructor(config2) {
    super("sentry-postgres-js", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by patching the postgres module.
   * Uses two complementary approaches:
   * 1. Main function wrapper: instruments sql instances created AFTER instrumentation is set up (CJS + ESM)
   * 2. Query.prototype patch: fallback for sql instances created BEFORE instrumentation (CJS only)
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition(
      "postgres",
      SUPPORTED_VERSIONS$1,
      (exports$1) => {
        try {
          return this._patchPostgres(exports$1);
        } catch (e) {
          DEBUG_BUILD && debug.error("Failed to patch postgres module:", e);
          return exports$1;
        }
      },
      (exports$1) => exports$1
    );
    ["src", "cf/src", "cjs/src"].forEach((path) => {
      module.files.push(
        new InstrumentationNodeModuleFile(
          `postgres/${path}/query.js`,
          SUPPORTED_VERSIONS$1,
          this._patchQueryPrototype.bind(this),
          this._unpatchQueryPrototype.bind(this)
        )
      );
    });
    return module;
  }
  /**
   * Patches the postgres module by wrapping the main export function.
   * This intercepts the creation of sql instances and instruments them.
   */
  _patchPostgres(exports$1) {
    const isFunction = typeof exports$1 === "function";
    const Original = isFunction ? exports$1 : exports$1.default;
    if (typeof Original !== "function") {
      DEBUG_BUILD && debug.warn("postgres module does not export a function. Skipping instrumentation.");
      return exports$1;
    }
    const self = this;
    const WrappedPostgres = function(...args) {
      const sql = Reflect.construct(Original, args);
      if (!sql || typeof sql !== "function") {
        DEBUG_BUILD && debug.warn("postgres() did not return a valid instance");
        return sql;
      }
      return self._instrumentSqlInstance(sql);
    };
    Object.setPrototypeOf(WrappedPostgres, Original);
    Object.setPrototypeOf(WrappedPostgres.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedPostgres, key, descriptor);
        }
      }
    }
    if (isFunction) {
      return WrappedPostgres;
    } else {
      replaceExports(exports$1, "default", WrappedPostgres);
      return exports$1;
    }
  }
  /**
   * Wraps query-returning methods (unsafe, file) to ensure their queries are instrumented.
   */
  _wrapQueryMethod(original, target, proxiedSql) {
    const self = this;
    return function(...args) {
      const query = Reflect.apply(original, target, args);
      if (query && typeof query === "object" && "handle" in query) {
        self._wrapSingleQueryHandle(query, proxiedSql);
      }
      return query;
    };
  }
  /**
   * Wraps callback-based methods (begin, reserve) to recursively instrument Sql instances.
   * Note: These methods can also be used as tagged templates, which we pass through unchanged.
   *
   * Savepoint is not wrapped to avoid complex nested transaction instrumentation issues.
   * Queries within savepoint callbacks are still instrumented through the parent transaction's Sql instance.
   */
  _wrapCallbackMethod(original, target, parentSqlInstance) {
    const self = this;
    return function(...args) {
      const parentContext = parentSqlInstance[CONNECTION_CONTEXT_SYMBOL];
      const isCallbackBased = typeof args[args.length - 1] === "function";
      if (!isCallbackBased) {
        const result = Reflect.apply(original, target, args);
        if (result && typeof result.then === "function") {
          return result.then((sqlInstance) => {
            return self._instrumentSqlInstance(sqlInstance, parentContext);
          });
        }
        return result;
      }
      const callback = args.length === 1 ? args[0] : args[1];
      const wrappedCallback = function(sqlInstance) {
        const instrumentedSql = self._instrumentSqlInstance(sqlInstance, parentContext);
        return callback(instrumentedSql);
      };
      const newArgs = args.length === 1 ? [wrappedCallback] : [args[0], wrappedCallback];
      return Reflect.apply(original, target, newArgs);
    };
  }
  /**
   * Sets connection context attributes on a span.
   */
  _setConnectionAttributes(span, connectionContext) {
    if (!connectionContext) {
      return;
    }
    if (connectionContext.ATTR_DB_NAMESPACE) {
      span.setAttribute(ATTR_DB_NAMESPACE, connectionContext.ATTR_DB_NAMESPACE);
    }
    if (connectionContext.ATTR_SERVER_ADDRESS) {
      span.setAttribute(ATTR_SERVER_ADDRESS, connectionContext.ATTR_SERVER_ADDRESS);
    }
    if (connectionContext.ATTR_SERVER_PORT !== void 0) {
      const portNumber = parseInt(connectionContext.ATTR_SERVER_PORT, 10);
      if (!isNaN(portNumber)) {
        span.setAttribute(ATTR_SERVER_PORT, portNumber);
      }
    }
  }
  /**
   * Extracts DB operation name from SQL query and sets it on the span.
   */
  _setOperationName(span, sanitizedQuery, command) {
    if (command) {
      span.setAttribute(ATTR_DB_OPERATION_NAME, command);
      return;
    }
    const operationMatch = sanitizedQuery?.match(SQL_OPERATION_REGEX);
    if (operationMatch?.[1]) {
      span.setAttribute(ATTR_DB_OPERATION_NAME, operationMatch[1].toUpperCase());
    }
  }
  /**
   * Extracts and stores connection context from sql.options.
   */
  _attachConnectionContext(sql, proxiedSql) {
    const sqlInstance = sql;
    if (!sqlInstance.options || typeof sqlInstance.options !== "object") {
      return;
    }
    const opts = sqlInstance.options;
    const host = opts.host?.[0] || "localhost";
    const port = opts.port?.[0] || 5432;
    const connectionContext = {
      ATTR_DB_NAMESPACE: typeof opts.database === "string" && opts.database !== "" ? opts.database : void 0,
      ATTR_SERVER_ADDRESS: host,
      ATTR_SERVER_PORT: String(port)
    };
    proxiedSql[CONNECTION_CONTEXT_SYMBOL] = connectionContext;
  }
  /**
   * Instruments a sql instance by wrapping its query execution methods.
   */
  _instrumentSqlInstance(sql, parentConnectionContext) {
    if (sql[INSTRUMENTED_MARKER]) {
      return sql;
    }
    const self = this;
    const proxiedSql = new Proxy(sql, {
      apply(target, thisArg, argumentsList) {
        const query = Reflect.apply(target, thisArg, argumentsList);
        if (query && typeof query === "object" && "handle" in query) {
          self._wrapSingleQueryHandle(query, proxiedSql);
        }
        return query;
      },
      get(target, prop) {
        const original = target[prop];
        if (typeof prop !== "string" || typeof original !== "function") {
          return original;
        }
        if (prop === "unsafe" || prop === "file") {
          return self._wrapQueryMethod(original, target, proxiedSql);
        }
        if (prop === "begin" || prop === "reserve") {
          return self._wrapCallbackMethod(original, target, proxiedSql);
        }
        return original;
      }
    });
    if (parentConnectionContext) {
      proxiedSql[CONNECTION_CONTEXT_SYMBOL] = parentConnectionContext;
    } else {
      this._attachConnectionContext(sql, proxiedSql);
    }
    sql[INSTRUMENTED_MARKER] = true;
    proxiedSql[INSTRUMENTED_MARKER] = true;
    return proxiedSql;
  }
  /**
   * Wraps a single query's handle method to create spans.
   */
  _wrapSingleQueryHandle(query, sqlInstance) {
    if (query.handle?.__sentryWrapped) {
      return;
    }
    query[QUERY_FROM_INSTRUMENTED_SQL] = true;
    const originalHandle = query.handle;
    const self = this;
    const wrappedHandle = async function(...args) {
      if (!self._shouldCreateSpans()) {
        return originalHandle.apply(this, args);
      }
      const fullQuery = self._reconstructQuery(query.strings);
      const sanitizedSqlQuery = self._sanitizeSqlQuery(fullQuery);
      return startSpanManual(
        {
          name: sanitizedSqlQuery || "postgresjs.query",
          op: "db"
        },
        (span) => {
          addOriginToSpan(span, "auto.db.postgresjs");
          span.setAttributes({
            [ATTR_DB_SYSTEM_NAME]: "postgres",
            [ATTR_DB_QUERY_TEXT]: sanitizedSqlQuery
          });
          const connectionContext = sqlInstance ? sqlInstance[CONNECTION_CONTEXT_SYMBOL] : void 0;
          self._setConnectionAttributes(span, connectionContext);
          const config2 = self.getConfig();
          const { requestHook: requestHook2 } = config2;
          if (requestHook2) {
            safeExecuteInTheMiddle(
              () => requestHook2(span, sanitizedSqlQuery, connectionContext),
              (e) => {
                if (e) {
                  span.setAttribute("sentry.hook.error", "requestHook failed");
                  DEBUG_BUILD && debug.error(`Error in requestHook for ${INTEGRATION_NAME$a} integration:`, e);
                }
              },
              true
            );
          }
          const queryWithCallbacks = this;
          queryWithCallbacks.resolve = new Proxy(queryWithCallbacks.resolve, {
            apply: (resolveTarget, resolveThisArg, resolveArgs) => {
              try {
                self._setOperationName(span, sanitizedSqlQuery, resolveArgs?.[0]?.command);
                span.end();
              } catch (e) {
                DEBUG_BUILD && debug.error("Error ending span in resolve callback:", e);
              }
              return Reflect.apply(resolveTarget, resolveThisArg, resolveArgs);
            }
          });
          queryWithCallbacks.reject = new Proxy(queryWithCallbacks.reject, {
            apply: (rejectTarget, rejectThisArg, rejectArgs) => {
              try {
                span.setStatus({
                  code: SPAN_STATUS_ERROR,
                  message: rejectArgs?.[0]?.message || "unknown_error"
                });
                span.setAttribute(ATTR_DB_RESPONSE_STATUS_CODE, rejectArgs?.[0]?.code || "unknown");
                span.setAttribute(ATTR_ERROR_TYPE, rejectArgs?.[0]?.name || "unknown");
                self._setOperationName(span, sanitizedSqlQuery);
                span.end();
              } catch (e) {
                DEBUG_BUILD && debug.error("Error ending span in reject callback:", e);
              }
              return Reflect.apply(rejectTarget, rejectThisArg, rejectArgs);
            }
          });
          try {
            return originalHandle.apply(this, args);
          } catch (e) {
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message: e instanceof Error ? e.message : "unknown_error"
            });
            span.end();
            throw e;
          }
        }
      );
    };
    wrappedHandle.__sentryWrapped = true;
    query.handle = wrappedHandle;
  }
  /**
   * Determines whether a span should be created based on the current context.
   * If `requireParentSpan` is set to true in the configuration, a span will
   * only be created if there is a parent span available.
   */
  _shouldCreateSpans() {
    const config2 = this.getConfig();
    const hasParentSpan = trace.getSpan(context.active()) !== void 0;
    return hasParentSpan || !config2.requireParentSpan;
  }
  /**
   * Reconstructs the full SQL query from template strings with PostgreSQL placeholders.
   *
   * For sql`SELECT * FROM users WHERE id = ${123} AND name = ${'foo'}`:
   *   strings = ["SELECT * FROM users WHERE id = ", " AND name = ", ""]
   *   returns: "SELECT * FROM users WHERE id = $1 AND name = $2"
   */
  _reconstructQuery(strings) {
    if (!strings?.length) {
      return void 0;
    }
    if (strings.length === 1) {
      return strings[0] || void 0;
    }
    return strings.reduce((acc, str, i) => i === 0 ? str : `${acc}$${i}${str}`, "");
  }
  /**
   * Sanitize SQL query as per the OTEL semantic conventions
   * https://opentelemetry.io/docs/specs/semconv/database/database-spans/#sanitization-of-dbquerytext
   *
   * PostgreSQL $n placeholders are preserved per OTEL spec - they're parameterized queries,
   * not sensitive literals. Only actual values (strings, numbers, booleans) are sanitized.
   */
  _sanitizeSqlQuery(sqlQuery) {
    if (!sqlQuery) {
      return "Unknown SQL Query";
    }
    return sqlQuery.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;\s*$/, "").replace(/\s+/g, " ").trim().replace(/\bX'[0-9A-Fa-f]*'/gi, "?").replace(/\bB'[01]*'/gi, "?").replace(/'(?:[^']|'')*'/g, "?").replace(/\b0x[0-9A-Fa-f]+/gi, "?").replace(/\b(?:TRUE|FALSE)\b/gi, "?").replace(/-?\b\d+\.?\d*[eE][+-]?\d+\b/g, "?").replace(/-?\b\d+\.\d+\b/g, "?").replace(/-?\.\d+\b/g, "?").replace(new RegExp("(?<!\\$)-?\\b\\d+\\b", "g"), "?").replace(/\bIN\b\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/gi, "IN (?)").replace(/\bIN\b\s*\(\s*\$\d+(?:\s*,\s*\$\d+)*\s*\)/gi, "IN ($?)");
  }
  /**
   * Fallback patch for Query.prototype.handle to instrument queries from pre-existing sql instances.
   * This catches queries from sql instances created BEFORE Sentry was initialized (CJS only).
   *
   * Note: Queries from pre-existing instances won't have connection context (database, host, port)
   * because the sql instance wasn't created through our instrumented wrapper.
   */
  _patchQueryPrototype(moduleExports) {
    const self = this;
    const originalHandle = moduleExports.Query.prototype.handle;
    moduleExports.Query.prototype.handle = async function(...args) {
      if (this[QUERY_FROM_INSTRUMENTED_SQL]) {
        return originalHandle.apply(this, args);
      }
      if (!self._shouldCreateSpans()) {
        return originalHandle.apply(this, args);
      }
      const fullQuery = self._reconstructQuery(this.strings);
      const sanitizedSqlQuery = self._sanitizeSqlQuery(fullQuery);
      return startSpanManual(
        {
          name: sanitizedSqlQuery || "postgresjs.query",
          op: "db"
        },
        (span) => {
          addOriginToSpan(span, "auto.db.postgresjs");
          span.setAttributes({
            [ATTR_DB_SYSTEM_NAME]: "postgres",
            [ATTR_DB_QUERY_TEXT]: sanitizedSqlQuery
          });
          const config2 = self.getConfig();
          const { requestHook: requestHook2 } = config2;
          if (requestHook2) {
            safeExecuteInTheMiddle(
              () => requestHook2(span, sanitizedSqlQuery, void 0),
              (e) => {
                if (e) {
                  span.setAttribute("sentry.hook.error", "requestHook failed");
                  DEBUG_BUILD && debug.error(`Error in requestHook for ${INTEGRATION_NAME$a} integration:`, e);
                }
              },
              true
            );
          }
          const originalResolve = this.resolve;
          this.resolve = new Proxy(originalResolve, {
            apply: (resolveTarget, resolveThisArg, resolveArgs) => {
              try {
                self._setOperationName(span, sanitizedSqlQuery, resolveArgs?.[0]?.command);
                span.end();
              } catch (e) {
                DEBUG_BUILD && debug.error("Error ending span in resolve callback:", e);
              }
              return Reflect.apply(resolveTarget, resolveThisArg, resolveArgs);
            }
          });
          const originalReject = this.reject;
          this.reject = new Proxy(originalReject, {
            apply: (rejectTarget, rejectThisArg, rejectArgs) => {
              try {
                span.setStatus({
                  code: SPAN_STATUS_ERROR,
                  message: rejectArgs?.[0]?.message || "unknown_error"
                });
                span.setAttribute(ATTR_DB_RESPONSE_STATUS_CODE, rejectArgs?.[0]?.code || "unknown");
                span.setAttribute(ATTR_ERROR_TYPE, rejectArgs?.[0]?.name || "unknown");
                self._setOperationName(span, sanitizedSqlQuery);
                span.end();
              } catch (e) {
                DEBUG_BUILD && debug.error("Error ending span in reject callback:", e);
              }
              return Reflect.apply(rejectTarget, rejectThisArg, rejectArgs);
            }
          });
          try {
            return originalHandle.apply(this, args);
          } catch (e) {
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message: e instanceof Error ? e.message : "unknown_error"
            });
            span.end();
            throw e;
          }
        }
      );
    };
    moduleExports.Query.prototype.handle.__sentry_original__ = originalHandle;
    return moduleExports;
  }
  /**
   * Restores the original Query.prototype.handle method.
   */
  _unpatchQueryPrototype(moduleExports) {
    if (moduleExports.Query.prototype.handle.__sentry_original__) {
      moduleExports.Query.prototype.handle = moduleExports.Query.prototype.handle.__sentry_original__;
    }
    return moduleExports;
  }
}
const _postgresJsIntegration = ((options) => {
  return {
    name: INTEGRATION_NAME$a,
    setupOnce() {
      instrumentPostgresJs(options);
    }
  };
});
const postgresJsIntegration = defineIntegration(_postgresJsIntegration);
const INTEGRATION_NAME$9 = "Prisma";
function isPrismaV6TracingHelper(helper) {
  return !!helper && typeof helper === "object" && "dispatchEngineSpans" in helper;
}
function getPrismaTracingHelper() {
  const prismaInstrumentationObject = globalThis.PRISMA_INSTRUMENTATION;
  const prismaTracingHelper = prismaInstrumentationObject && typeof prismaInstrumentationObject === "object" && "helper" in prismaInstrumentationObject ? prismaInstrumentationObject.helper : void 0;
  return prismaTracingHelper;
}
class SentryPrismaInteropInstrumentation extends PrismaInstrumentation {
  constructor() {
    super();
  }
  enable() {
    super.enable();
    const prismaTracingHelper = getPrismaTracingHelper();
    if (isPrismaV6TracingHelper(prismaTracingHelper)) {
      prismaTracingHelper.createEngineSpan = (engineSpanEvent) => {
        const tracer = trace.getTracer("prismaV5Compatibility");
        const initialIdGenerator = tracer._idGenerator;
        if (!initialIdGenerator) {
          consoleSandbox(() => {
            console.warn(
              "[Sentry] Could not find _idGenerator on tracer, skipping Prisma v5 compatibility - some Prisma spans may be missing!"
            );
          });
          return;
        }
        try {
          engineSpanEvent.spans.forEach((engineSpan) => {
            const kind = engineSpanKindToOTELSpanKind(engineSpan.kind);
            const parentSpanId = engineSpan.parent_span_id;
            const spanId = engineSpan.span_id;
            const traceId = engineSpan.trace_id;
            const links = engineSpan.links?.map((link) => {
              return {
                context: {
                  traceId: link.trace_id,
                  spanId: link.span_id,
                  traceFlags: TraceFlags.SAMPLED
                }
              };
            });
            const ctx = trace.setSpanContext(context.active(), {
              traceId,
              spanId: parentSpanId,
              traceFlags: TraceFlags.SAMPLED
            });
            context.with(ctx, () => {
              const temporaryIdGenerator = {
                generateTraceId: () => {
                  return traceId;
                },
                generateSpanId: () => {
                  return spanId;
                }
              };
              tracer._idGenerator = temporaryIdGenerator;
              const span = tracer.startSpan(engineSpan.name, {
                kind,
                links,
                startTime: engineSpan.start_time,
                attributes: engineSpan.attributes
              });
              span.end(engineSpan.end_time);
              tracer._idGenerator = initialIdGenerator;
            });
          });
        } finally {
          tracer._idGenerator = initialIdGenerator;
        }
      };
    }
  }
}
function engineSpanKindToOTELSpanKind(engineSpanKind) {
  switch (engineSpanKind) {
    case "client":
      return SpanKind.CLIENT;
    case "internal":
    default:
      return SpanKind.INTERNAL;
  }
}
const instrumentPrisma = generateInstrumentOnce(INTEGRATION_NAME$9, (_options) => {
  return new SentryPrismaInteropInstrumentation();
});
const prismaIntegration = defineIntegration((_options) => {
  return {
    name: INTEGRATION_NAME$9,
    setupOnce() {
      instrumentPrisma();
    },
    setup(client) {
      if (!getPrismaTracingHelper()) {
        return;
      }
      client.on("spanStart", (span) => {
        const spanJSON = spanToJSON(span);
        if (spanJSON.description?.startsWith("prisma:")) {
          span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.prisma");
        }
        if (spanJSON.description === "prisma:engine:db_query" && spanJSON.data["db.query.text"]) {
          span.updateName(spanJSON.data["db.query.text"]);
        }
        if (spanJSON.description === "prisma:engine:db_query" && !spanJSON.data["db.system"]) {
          span.setAttribute("db.system", "prisma");
        }
      });
    }
  };
});
const INTEGRATION_NAME$8 = "Hapi";
const instrumentHapi = generateInstrumentOnce(INTEGRATION_NAME$8, () => new srcExports$d.HapiInstrumentation());
const _hapiIntegration = (() => {
  return {
    name: INTEGRATION_NAME$8,
    setupOnce() {
      instrumentHapi();
    }
  };
});
const hapiIntegration = defineIntegration(_hapiIntegration);
const AttributeNames = {
  HONO_TYPE: "hono.type",
  HONO_NAME: "hono.name"
};
const HonoTypes = {
  MIDDLEWARE: "middleware",
  REQUEST_HANDLER: "request_handler"
};
const PACKAGE_NAME = "@sentry/instrumentation-hono";
const PACKAGE_VERSION = "0.0.1";
class HonoInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME, PACKAGE_VERSION, config2);
  }
  /**
   * Initialize the instrumentation.
   */
  init() {
    return [
      new InstrumentationNodeModuleDefinition("hono", [">=4.0.0 <5"], (moduleExports) => this._patch(moduleExports))
    ];
  }
  /**
   * Patches the module exports to instrument Hono.
   */
  _patch(moduleExports) {
    const instrumentation = this;
    class WrappedHono extends moduleExports.Hono {
      constructor(...args) {
        super(...args);
        instrumentation._wrap(this, "get", instrumentation._patchHandler());
        instrumentation._wrap(this, "post", instrumentation._patchHandler());
        instrumentation._wrap(this, "put", instrumentation._patchHandler());
        instrumentation._wrap(this, "delete", instrumentation._patchHandler());
        instrumentation._wrap(this, "options", instrumentation._patchHandler());
        instrumentation._wrap(this, "patch", instrumentation._patchHandler());
        instrumentation._wrap(this, "all", instrumentation._patchHandler());
        instrumentation._wrap(this, "on", instrumentation._patchOnHandler());
        instrumentation._wrap(this, "use", instrumentation._patchMiddlewareHandler());
      }
    }
    try {
      moduleExports.Hono = WrappedHono;
    } catch {
      return { ...moduleExports, Hono: WrappedHono };
    }
    return moduleExports;
  }
  /**
   * Patches the route handler to instrument it.
   */
  _patchHandler() {
    const instrumentation = this;
    return function(original) {
      return function wrappedHandler(...args) {
        if (typeof args[0] === "string") {
          const path = args[0];
          if (args.length === 1) {
            return original.apply(this, [path]);
          }
          const handlers = args.slice(1);
          return original.apply(this, [
            path,
            ...handlers.map((handler) => instrumentation._wrapHandler(handler))
          ]);
        }
        return original.apply(
          this,
          args.map((handler) => instrumentation._wrapHandler(handler))
        );
      };
    };
  }
  /**
   * Patches the 'on' handler to instrument it.
   */
  _patchOnHandler() {
    const instrumentation = this;
    return function(original) {
      return function wrappedHandler(...args) {
        const handlers = args.slice(2);
        return original.apply(this, [
          ...args.slice(0, 2),
          ...handlers.map((handler) => instrumentation._wrapHandler(handler))
        ]);
      };
    };
  }
  /**
   * Patches the middleware handler to instrument it.
   */
  _patchMiddlewareHandler() {
    const instrumentation = this;
    return function(original) {
      return function wrappedHandler(...args) {
        if (typeof args[0] === "string") {
          const path = args[0];
          if (args.length === 1) {
            return original.apply(this, [path]);
          }
          const handlers = args.slice(1);
          return original.apply(this, [
            path,
            ...handlers.map((handler) => instrumentation._wrapHandler(handler))
          ]);
        }
        return original.apply(
          this,
          args.map((handler) => instrumentation._wrapHandler(handler))
        );
      };
    };
  }
  /**
   * Wraps a handler or middleware handler to apply instrumentation.
   */
  _wrapHandler(handler) {
    const instrumentation = this;
    return function(c, next) {
      if (!instrumentation.isEnabled()) {
        return handler.apply(this, [c, next]);
      }
      const path = c.req.path;
      const span = instrumentation.tracer.startSpan(path);
      return context.with(trace.setSpan(context.active(), span), () => {
        return instrumentation._safeExecute(
          () => {
            const result = handler.apply(this, [c, next]);
            if (isThenable(result)) {
              return result.then((result2) => {
                const type = instrumentation._determineHandlerType(result2);
                span.setAttributes({
                  [AttributeNames.HONO_TYPE]: type,
                  [AttributeNames.HONO_NAME]: type === HonoTypes.REQUEST_HANDLER ? path : handler.name || "anonymous"
                });
                instrumentation.getConfig().responseHook?.(span);
                return result2;
              });
            } else {
              const type = instrumentation._determineHandlerType(result);
              span.setAttributes({
                [AttributeNames.HONO_TYPE]: type,
                [AttributeNames.HONO_NAME]: type === HonoTypes.REQUEST_HANDLER ? path : handler.name || "anonymous"
              });
              instrumentation.getConfig().responseHook?.(span);
              return result;
            }
          },
          () => span.end(),
          (error) => {
            instrumentation._handleError(span, error);
            span.end();
          }
        );
      });
    };
  }
  /**
   * Safely executes a function and handles errors.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _safeExecute(execute, onSuccess, onFailure) {
    try {
      const result = execute();
      if (isThenable(result)) {
        result.then(
          () => onSuccess(),
          (error) => onFailure(error)
        );
      } else {
        onSuccess();
      }
      return result;
    } catch (error) {
      onFailure(error);
      throw error;
    }
  }
  /**
   * Determines the handler type based on the result.
   * @param result
   * @private
   */
  _determineHandlerType(result) {
    return result === void 0 ? HonoTypes.MIDDLEWARE : HonoTypes.REQUEST_HANDLER;
  }
  /**
   * Handles errors by setting the span status and recording the exception.
   */
  _handleError(span, error) {
    if (error instanceof Error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      span.recordException(error);
    }
  }
}
const INTEGRATION_NAME$7 = "Hono";
function addHonoSpanAttributes(span) {
  const attributes = spanToJSON(span).data;
  const type = attributes[AttributeNames.HONO_TYPE];
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) {
    return;
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.hono",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.hono`
  });
  const name = attributes[AttributeNames.HONO_NAME];
  if (typeof name === "string") {
    span.updateName(name);
  }
  if (getIsolationScope() === getDefaultIsolationScope()) {
    DEBUG_BUILD && debug.warn("Isolation scope is default isolation scope - skipping setting transactionName");
    return;
  }
  const route = attributes[ATTR_HTTP_ROUTE];
  const method = attributes[ATTR_HTTP_REQUEST_METHOD];
  if (typeof route === "string" && typeof method === "string") {
    getIsolationScope().setTransactionName(`${method} ${route}`);
  }
}
const instrumentHono = generateInstrumentOnce(
  INTEGRATION_NAME$7,
  () => new HonoInstrumentation({
    responseHook: (span) => {
      addHonoSpanAttributes(span);
    }
  })
);
const _honoIntegration = (() => {
  return {
    name: INTEGRATION_NAME$7,
    setupOnce() {
      instrumentHono();
    }
  };
});
const honoIntegration = defineIntegration(_honoIntegration);
const INTEGRATION_NAME$6 = "Koa";
const instrumentKoa = generateInstrumentOnce(
  INTEGRATION_NAME$6,
  srcExports$e.KoaInstrumentation,
  (options = {}) => {
    return {
      ignoreLayersType: options.ignoreLayersType,
      requestHook(span, info) {
        addOriginToSpan(span, "auto.http.otel.koa");
        const attributes = spanToJSON(span).data;
        const type = attributes["koa.type"];
        if (type) {
          span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, `${type}.koa`);
        }
        const name = attributes["koa.name"];
        if (typeof name === "string") {
          span.updateName(name || "< unknown >");
        }
        if (getIsolationScope() === getDefaultIsolationScope()) {
          DEBUG_BUILD && debug.warn("Isolation scope is default isolation scope - skipping setting transactionName");
          return;
        }
        const route = attributes[ATTR_HTTP_ROUTE];
        const method = info.context?.request?.method?.toUpperCase() || "GET";
        if (route) {
          getIsolationScope().setTransactionName(`${method} ${route}`);
        }
      }
    };
  }
);
const _koaIntegration = ((options = {}) => {
  return {
    name: INTEGRATION_NAME$6,
    setupOnce() {
      instrumentKoa(options);
    }
  };
});
const koaIntegration = defineIntegration(_koaIntegration);
const INTEGRATION_NAME$5 = "Connect";
const instrumentConnect = generateInstrumentOnce(INTEGRATION_NAME$5, () => new srcExports$f.ConnectInstrumentation());
const _connectIntegration = (() => {
  return {
    name: INTEGRATION_NAME$5,
    setupOnce() {
      instrumentConnect();
    }
  };
});
const connectIntegration = defineIntegration(_connectIntegration);
const TEDIUS_INSTRUMENTED_METHODS = /* @__PURE__ */ new Set([
  "callProcedure",
  "execSql",
  "execSqlBatch",
  "execBulkLoad",
  "prepare",
  "execute"
]);
const INTEGRATION_NAME$4 = "Tedious";
const instrumentTedious = generateInstrumentOnce(INTEGRATION_NAME$4, () => new srcExports$g.TediousInstrumentation({}));
const _tediousIntegration = (() => {
  let instrumentationWrappedCallback;
  return {
    name: INTEGRATION_NAME$4,
    setupOnce() {
      const instrumentation = instrumentTedious();
      instrumentationWrappedCallback = instrumentWhenWrapped(instrumentation);
    },
    setup(client) {
      instrumentationWrappedCallback?.(
        () => client.on("spanStart", (span) => {
          const { description, data } = spanToJSON(span);
          if (!description || data["db.system"] !== "mssql") {
            return;
          }
          const operation = description.split(" ")[0] || "";
          if (TEDIUS_INSTRUMENTED_METHODS.has(operation)) {
            span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.tedious");
          }
        })
      );
    }
  };
});
const tediousIntegration = defineIntegration(_tediousIntegration);
const INTEGRATION_NAME$3 = "GenericPool";
const instrumentGenericPool = generateInstrumentOnce(INTEGRATION_NAME$3, () => new srcExports$h.GenericPoolInstrumentation({}));
const _genericPoolIntegration = (() => {
  let instrumentationWrappedCallback;
  return {
    name: INTEGRATION_NAME$3,
    setupOnce() {
      const instrumentation = instrumentGenericPool();
      instrumentationWrappedCallback = instrumentWhenWrapped(instrumentation);
    },
    setup(client) {
      instrumentationWrappedCallback?.(
        () => client.on("spanStart", (span) => {
          const spanJSON = spanToJSON(span);
          const spanDescription = spanJSON.description;
          const isGenericPoolSpan = spanDescription === "generic-pool.aquire" || spanDescription === "generic-pool.acquire";
          if (isGenericPoolSpan) {
            span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.generic_pool");
          }
        })
      );
    }
  };
});
const genericPoolIntegration = defineIntegration(_genericPoolIntegration);
const INTEGRATION_NAME$2 = "Amqplib";
const config$1 = {
  consumeEndHook: (span) => {
    addOriginToSpan(span, "auto.amqplib.otel.consumer");
  },
  publishHook: (span) => {
    addOriginToSpan(span, "auto.amqplib.otel.publisher");
  }
};
const instrumentAmqplib = generateInstrumentOnce(INTEGRATION_NAME$2, () => new srcExports$i.AmqplibInstrumentation(config$1));
const _amqplibIntegration = (() => {
  return {
    name: INTEGRATION_NAME$2,
    setupOnce() {
      instrumentAmqplib();
    }
  };
});
const amqplibIntegration = defineIntegration(_amqplibIntegration);
const INTEGRATION_NAME$1 = "VercelAI";
const SUPPORTED_VERSIONS = [">=3.0.0 <7"];
const INSTRUMENTED_METHODS = [
  "generateText",
  "streamText",
  "generateObject",
  "streamObject",
  "embed",
  "embedMany"
];
function isToolError(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const candidate = obj;
  return "type" in candidate && "error" in candidate && "toolName" in candidate && "toolCallId" in candidate && candidate.type === "tool-error" && candidate.error instanceof Error;
}
function checkResultForToolErrors(result) {
  if (typeof result !== "object" || result === null || !("content" in result)) {
    return;
  }
  const resultObj = result;
  if (!Array.isArray(resultObj.content)) {
    return;
  }
  for (const item of resultObj.content) {
    if (isToolError(item)) {
      const associatedSpan = _INTERNAL_getSpanForToolCallId(item.toolCallId);
      if (associatedSpan) {
        const spanContext = associatedSpan.spanContext();
        withScope((scope) => {
          scope.setContext("trace", {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId
          });
          scope.setTag("vercel.ai.tool.name", item.toolName);
          scope.setTag("vercel.ai.tool.callId", item.toolCallId);
          scope.setLevel("error");
          captureException(item.error, {
            mechanism: {
              type: "auto.vercelai.otel",
              handled: false
            }
          });
        });
        _INTERNAL_cleanupToolCallSpan(item.toolCallId);
      } else {
        withScope((scope) => {
          scope.setTag("vercel.ai.tool.name", item.toolName);
          scope.setTag("vercel.ai.tool.callId", item.toolCallId);
          scope.setLevel("error");
          captureException(item.error, {
            mechanism: {
              type: "auto.vercelai.otel",
              handled: false
            }
          });
        });
      }
    }
  }
}
function determineRecordingSettings(integrationRecordingOptions, methodTelemetryOptions, telemetryExplicitlyEnabled, defaultRecordingEnabled) {
  const recordInputs = integrationRecordingOptions?.recordInputs !== void 0 ? integrationRecordingOptions.recordInputs : methodTelemetryOptions.recordInputs !== void 0 ? methodTelemetryOptions.recordInputs : telemetryExplicitlyEnabled === true ? true : defaultRecordingEnabled;
  const recordOutputs = integrationRecordingOptions?.recordOutputs !== void 0 ? integrationRecordingOptions.recordOutputs : methodTelemetryOptions.recordOutputs !== void 0 ? methodTelemetryOptions.recordOutputs : telemetryExplicitlyEnabled === true ? true : defaultRecordingEnabled;
  return { recordInputs, recordOutputs };
}
class SentryVercelAiInstrumentation extends InstrumentationBase {
  __init() {
    this._isPatched = false;
  }
  __init2() {
    this._callbacks = [];
  }
  constructor(config2 = {}) {
    super("@sentry/instrumentation-vercel-ai", SDK_VERSION, config2);
    SentryVercelAiInstrumentation.prototype.__init.call(this);
    SentryVercelAiInstrumentation.prototype.__init2.call(this);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition("ai", SUPPORTED_VERSIONS, this._patch.bind(this));
    return module;
  }
  /**
   * Call the provided callback when the module is patched.
   * If it has already been patched, the callback will be called immediately.
   */
  callWhenPatched(callback) {
    if (this._isPatched) {
      callback();
    } else {
      this._callbacks.push(callback);
    }
  }
  /**
   * Patches module exports to enable Vercel AI telemetry.
   */
  _patch(moduleExports) {
    this._isPatched = true;
    this._callbacks.forEach((callback) => callback());
    this._callbacks = [];
    const generatePatch = (originalMethod) => {
      return new Proxy(originalMethod, {
        apply: (target, thisArg, args) => {
          const existingExperimentalTelemetry = args[0].experimental_telemetry || {};
          const isEnabled = existingExperimentalTelemetry.isEnabled;
          const client = getClient();
          const integration = client?.getIntegrationByName(INTEGRATION_NAME$1);
          const integrationOptions = integration?.options;
          const shouldRecordInputsAndOutputs = integration ? Boolean(client?.getOptions().sendDefaultPii) : false;
          const { recordInputs, recordOutputs } = determineRecordingSettings(
            integrationOptions,
            existingExperimentalTelemetry,
            isEnabled,
            shouldRecordInputsAndOutputs
          );
          args[0].experimental_telemetry = {
            ...existingExperimentalTelemetry,
            isEnabled: isEnabled !== void 0 ? isEnabled : true,
            recordInputs,
            recordOutputs
          };
          return handleCallbackErrors(
            () => Reflect.apply(target, thisArg, args),
            (error) => {
              if (error && typeof error === "object") {
                addNonEnumerableProperty(error, "_sentry_active_span", getActiveSpan());
              }
            },
            () => {
            },
            (result) => {
              checkResultForToolErrors(result);
            }
          );
        }
      });
    };
    if (Object.prototype.toString.call(moduleExports) === "[object Module]") {
      for (const method of INSTRUMENTED_METHODS) {
        moduleExports[method] = generatePatch(moduleExports[method]);
      }
      return moduleExports;
    } else {
      const patchedModuleExports = INSTRUMENTED_METHODS.reduce((acc, curr) => {
        acc[curr] = generatePatch(moduleExports[curr]);
        return acc;
      }, {});
      return { ...moduleExports, ...patchedModuleExports };
    }
  }
}
const instrumentVercelAi = generateInstrumentOnce(INTEGRATION_NAME$1, () => new SentryVercelAiInstrumentation({}));
function shouldForceIntegration(client) {
  const modules = client.getIntegrationByName("Modules");
  return !!modules?.getModules?.()?.ai;
}
const _vercelAIIntegration = ((options = {}) => {
  let instrumentation;
  return {
    name: INTEGRATION_NAME$1,
    options,
    setupOnce() {
      instrumentation = instrumentVercelAi();
    },
    afterAllSetup(client) {
      const shouldForce = options.force ?? shouldForceIntegration(client);
      if (shouldForce) {
        addVercelAiProcessors(client);
      } else {
        instrumentation?.callWhenPatched(() => addVercelAiProcessors(client));
      }
    }
  };
});
const vercelAIIntegration = defineIntegration(_vercelAIIntegration);
const supportedVersions$4 = [">=4.0.0 <7"];
class SentryOpenAiInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-openai", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition("openai", supportedVersions$4, this._patch.bind(this));
    return module;
  }
  /**
   * Core patch logic applying instrumentation to the OpenAI and AzureOpenAI client constructors.
   */
  _patch(exports$1) {
    let result = exports$1;
    result = this._patchClient(result, "OpenAI");
    result = this._patchClient(result, "AzureOpenAI");
    return result;
  }
  /**
   * Patch logic applying instrumentation to the specified client constructor.
   */
  _patchClient(exports$1, exportKey) {
    const Original = exports$1[exportKey];
    if (!Original) {
      return exports$1;
    }
    const config2 = this.getConfig();
    const WrappedOpenAI = function(...args) {
      if (_INTERNAL_shouldSkipAiProviderWrapping(OPENAI_INTEGRATION_NAME)) {
        return Reflect.construct(Original, args);
      }
      const instance = Reflect.construct(Original, args);
      const client = getClient();
      const defaultPii = Boolean(client?.getOptions().sendDefaultPii);
      const recordInputs = config2.recordInputs ?? defaultPii;
      const recordOutputs = config2.recordOutputs ?? defaultPii;
      return instrumentOpenAiClient(instance, {
        recordInputs,
        recordOutputs
      });
    };
    Object.setPrototypeOf(WrappedOpenAI, Original);
    Object.setPrototypeOf(WrappedOpenAI.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedOpenAI, key, descriptor);
        }
      }
    }
    try {
      exports$1[exportKey] = WrappedOpenAI;
    } catch (error) {
      Object.defineProperty(exports$1, exportKey, {
        value: WrappedOpenAI,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    if (exports$1.default === Original) {
      try {
        exports$1.default = WrappedOpenAI;
      } catch (error) {
        Object.defineProperty(exports$1, "default", {
          value: WrappedOpenAI,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    }
    return exports$1;
  }
}
const instrumentOpenAi = generateInstrumentOnce(
  OPENAI_INTEGRATION_NAME,
  (options) => new SentryOpenAiInstrumentation(options)
);
const _openAiIntegration = ((options = {}) => {
  return {
    name: OPENAI_INTEGRATION_NAME,
    setupOnce() {
      instrumentOpenAi(options);
    }
  };
});
const openAIIntegration = defineIntegration(_openAiIntegration);
const supportedVersions$3 = [">=0.19.2 <1.0.0"];
class SentryAnthropicAiInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-anthropic-ai", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition(
      "@anthropic-ai/sdk",
      supportedVersions$3,
      this._patch.bind(this)
    );
    return module;
  }
  /**
   * Core patch logic applying instrumentation to the Anthropic AI client constructor.
   */
  _patch(exports$1) {
    const Original = exports$1.Anthropic;
    const config2 = this.getConfig();
    const WrappedAnthropic = function(...args) {
      if (_INTERNAL_shouldSkipAiProviderWrapping(ANTHROPIC_AI_INTEGRATION_NAME)) {
        return Reflect.construct(Original, args);
      }
      const instance = Reflect.construct(Original, args);
      const client = getClient();
      const defaultPii = Boolean(client?.getOptions().sendDefaultPii);
      const recordInputs = config2.recordInputs ?? defaultPii;
      const recordOutputs = config2.recordOutputs ?? defaultPii;
      return instrumentAnthropicAiClient(instance, {
        recordInputs,
        recordOutputs
      });
    };
    Object.setPrototypeOf(WrappedAnthropic, Original);
    Object.setPrototypeOf(WrappedAnthropic.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedAnthropic, key, descriptor);
        }
      }
    }
    try {
      exports$1.Anthropic = WrappedAnthropic;
    } catch (error) {
      Object.defineProperty(exports$1, "Anthropic", {
        value: WrappedAnthropic,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    if (exports$1.default === Original) {
      try {
        exports$1.default = WrappedAnthropic;
      } catch (error) {
        Object.defineProperty(exports$1, "default", {
          value: WrappedAnthropic,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    }
    return exports$1;
  }
}
const instrumentAnthropicAi = generateInstrumentOnce(
  ANTHROPIC_AI_INTEGRATION_NAME,
  (options) => new SentryAnthropicAiInstrumentation(options)
);
const _anthropicAIIntegration = ((options = {}) => {
  return {
    name: ANTHROPIC_AI_INTEGRATION_NAME,
    options,
    setupOnce() {
      instrumentAnthropicAi(options);
    }
  };
});
const anthropicAIIntegration = defineIntegration(_anthropicAIIntegration);
const supportedVersions$2 = [">=0.10.0 <2"];
class SentryGoogleGenAiInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-google-genai", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition(
      "@google/genai",
      supportedVersions$2,
      (exports$1) => this._patch(exports$1),
      (exports$1) => exports$1,
      // In CJS, @google/genai re-exports from (dist/node/index.cjs) file.
      // Patching only the root module sometimes misses the real implementation or
      // gets overwritten when that file is loaded. We add a file-level patch so that
      // _patch runs again on the concrete implementation
      [
        new InstrumentationNodeModuleFile(
          "@google/genai/dist/node/index.cjs",
          supportedVersions$2,
          (exports$1) => this._patch(exports$1),
          (exports$1) => exports$1
        )
      ]
    );
    return module;
  }
  /**
   * Core patch logic applying instrumentation to the Google GenAI client constructor.
   */
  _patch(exports$1) {
    const Original = exports$1.GoogleGenAI;
    const config2 = this.getConfig();
    if (typeof Original !== "function") {
      return exports$1;
    }
    const WrappedGoogleGenAI = function(...args) {
      if (_INTERNAL_shouldSkipAiProviderWrapping(GOOGLE_GENAI_INTEGRATION_NAME)) {
        return Reflect.construct(Original, args);
      }
      const instance = Reflect.construct(Original, args);
      const client = getClient();
      const defaultPii = Boolean(client?.getOptions().sendDefaultPii);
      const typedConfig = config2;
      const recordInputs = typedConfig?.recordInputs ?? defaultPii;
      const recordOutputs = typedConfig?.recordOutputs ?? defaultPii;
      return instrumentGoogleGenAIClient(instance, {
        recordInputs,
        recordOutputs
      });
    };
    Object.setPrototypeOf(WrappedGoogleGenAI, Original);
    Object.setPrototypeOf(WrappedGoogleGenAI.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedGoogleGenAI, key, descriptor);
        }
      }
    }
    replaceExports(exports$1, "GoogleGenAI", WrappedGoogleGenAI);
    return exports$1;
  }
}
const instrumentGoogleGenAI = generateInstrumentOnce(
  GOOGLE_GENAI_INTEGRATION_NAME,
  (options) => new SentryGoogleGenAiInstrumentation(options)
);
const _googleGenAIIntegration = ((options = {}) => {
  return {
    name: GOOGLE_GENAI_INTEGRATION_NAME,
    setupOnce() {
      instrumentGoogleGenAI(options);
    }
  };
});
const googleGenAIIntegration = defineIntegration(_googleGenAIIntegration);
const supportedVersions$1 = [">=0.1.0 <2.0.0"];
function augmentCallbackHandlers(handlers, sentryHandler) {
  if (!handlers) {
    return [sentryHandler];
  }
  if (Array.isArray(handlers)) {
    if (handlers.includes(sentryHandler)) {
      return handlers;
    }
    return [...handlers, sentryHandler];
  }
  if (typeof handlers === "object") {
    return [handlers, sentryHandler];
  }
  return handlers;
}
function wrapRunnableMethod(originalMethod, sentryHandler, _methodName) {
  return new Proxy(originalMethod, {
    apply(target, thisArg, args) {
      const optionsIndex = 1;
      let options = args[optionsIndex];
      if (!options || typeof options !== "object" || Array.isArray(options)) {
        options = {};
        args[optionsIndex] = options;
      }
      const existingCallbacks = options.callbacks;
      const augmentedCallbacks = augmentCallbackHandlers(existingCallbacks, sentryHandler);
      options.callbacks = augmentedCallbacks;
      return Reflect.apply(target, thisArg, args);
    }
  });
}
class SentryLangChainInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-langchain", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   * We patch the BaseChatModel class methods to inject callbacks
   *
   * We hook into provider packages (@langchain/anthropic, @langchain/openai, etc.)
   * because @langchain/core is often bundled and not loaded as a separate module
   */
  init() {
    const modules = [];
    const providerPackages = [
      "@langchain/anthropic",
      "@langchain/openai",
      "@langchain/google-genai",
      "@langchain/mistralai",
      "@langchain/google-vertexai",
      "@langchain/groq"
    ];
    for (const packageName of providerPackages) {
      modules.push(
        new InstrumentationNodeModuleDefinition(
          packageName,
          supportedVersions$1,
          this._patch.bind(this),
          (exports$1) => exports$1,
          [
            new InstrumentationNodeModuleFile(
              `${packageName}/dist/index.cjs`,
              supportedVersions$1,
              this._patch.bind(this),
              (exports$1) => exports$1
            )
          ]
        )
      );
    }
    modules.push(
      new InstrumentationNodeModuleDefinition(
        "langchain",
        supportedVersions$1,
        this._patch.bind(this),
        (exports$1) => exports$1,
        [
          // To catch the CJS build that contains ConfigurableModel / initChatModel for v1
          new InstrumentationNodeModuleFile(
            "langchain/dist/chat_models/universal.cjs",
            supportedVersions$1,
            this._patch.bind(this),
            (exports$1) => exports$1
          )
        ]
      )
    );
    return modules;
  }
  /**
   * Core patch logic - patches chat model methods to inject Sentry callbacks
   * This is called when a LangChain provider package is loaded
   */
  _patch(exports$1) {
    _INTERNAL_skipAiProviderWrapping([
      OPENAI_INTEGRATION_NAME,
      ANTHROPIC_AI_INTEGRATION_NAME,
      GOOGLE_GENAI_INTEGRATION_NAME
    ]);
    const client = getClient();
    const defaultPii = Boolean(client?.getOptions().sendDefaultPii);
    const config2 = this.getConfig();
    const recordInputs = config2?.recordInputs ?? defaultPii;
    const recordOutputs = config2?.recordOutputs ?? defaultPii;
    const sentryHandler = createLangChainCallbackHandler({
      recordInputs,
      recordOutputs
    });
    this._patchRunnableMethods(exports$1, sentryHandler);
    return exports$1;
  }
  /**
   * Patches chat model methods (invoke, stream, batch) to inject Sentry callbacks
   * Finds a chat model class from the provider package exports and patches its prototype methods
   */
  _patchRunnableMethods(exports$1, sentryHandler) {
    const knownChatModelNames = [
      "ChatAnthropic",
      "ChatOpenAI",
      "ChatGoogleGenerativeAI",
      "ChatMistralAI",
      "ChatVertexAI",
      "ChatGroq",
      "ConfigurableModel"
    ];
    const exportsToPatch = exports$1.universal_exports ?? exports$1;
    const chatModelClass = Object.values(exportsToPatch).find((exp) => {
      return typeof exp === "function" && knownChatModelNames.includes(exp.name);
    });
    if (!chatModelClass) {
      return;
    }
    const targetProto = chatModelClass.prototype;
    const methodsToPatch = ["invoke", "stream", "batch"];
    for (const methodName of methodsToPatch) {
      const method = targetProto[methodName];
      if (typeof method === "function") {
        targetProto[methodName] = wrapRunnableMethod(
          method,
          sentryHandler
        );
      }
    }
  }
}
const instrumentLangChain = generateInstrumentOnce(
  LANGCHAIN_INTEGRATION_NAME,
  (options) => new SentryLangChainInstrumentation(options)
);
const _langChainIntegration = ((options = {}) => {
  return {
    name: LANGCHAIN_INTEGRATION_NAME,
    setupOnce() {
      instrumentLangChain(options);
    }
  };
});
const langChainIntegration = defineIntegration(_langChainIntegration);
const supportedVersions = [">=0.0.0 <2.0.0"];
class SentryLangGraphInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-langgraph", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition(
      "@langchain/langgraph",
      supportedVersions,
      this._patch.bind(this),
      (exports$1) => exports$1,
      [
        new InstrumentationNodeModuleFile(
          /**
           * In CJS, LangGraph packages re-export from dist/index.cjs files.
           * Patching only the root module sometimes misses the real implementation or
           * gets overwritten when that file is loaded. We add a file-level patch so that
           * _patch runs again on the concrete implementation
           */
          "@langchain/langgraph/dist/index.cjs",
          supportedVersions,
          this._patch.bind(this),
          (exports$1) => exports$1
        )
      ]
    );
    return module;
  }
  /**
   * Core patch logic applying instrumentation to the LangGraph module.
   */
  _patch(exports$1) {
    const client = getClient();
    const defaultPii = Boolean(client?.getOptions().sendDefaultPii);
    const config2 = this.getConfig();
    const recordInputs = config2.recordInputs ?? defaultPii;
    const recordOutputs = config2.recordOutputs ?? defaultPii;
    const options = {
      recordInputs,
      recordOutputs
    };
    if (exports$1.StateGraph && typeof exports$1.StateGraph === "function") {
      const StateGraph = exports$1.StateGraph;
      StateGraph.prototype.compile = instrumentStateGraphCompile(
        StateGraph.prototype.compile,
        options
      );
    }
    return exports$1;
  }
}
const instrumentLangGraph = generateInstrumentOnce(
  LANGGRAPH_INTEGRATION_NAME,
  (options) => new SentryLangGraphInstrumentation(options)
);
const _langGraphIntegration = ((options = {}) => {
  return {
    name: LANGGRAPH_INTEGRATION_NAME,
    setupOnce() {
      instrumentLangGraph(options);
    }
  };
});
const langGraphIntegration = defineIntegration(_langGraphIntegration);
function patchFirestore(tracer, firestoreSupportedVersions2, wrap, unwrap, config2) {
  const defaultFirestoreSpanCreationHook = () => {
  };
  let firestoreSpanCreationHook = defaultFirestoreSpanCreationHook;
  const configFirestoreSpanCreationHook = config2.firestoreSpanCreationHook;
  if (typeof configFirestoreSpanCreationHook === "function") {
    firestoreSpanCreationHook = (span) => {
      safeExecuteInTheMiddle(
        () => configFirestoreSpanCreationHook(span),
        (error) => {
          if (!error) {
            return;
          }
          diag.error(error?.message);
        },
        true
      );
    };
  }
  const moduleFirestoreCJS = new InstrumentationNodeModuleDefinition(
    "@firebase/firestore",
    firestoreSupportedVersions2,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (moduleExports) => wrapMethods(moduleExports, wrap, unwrap, tracer, firestoreSpanCreationHook)
  );
  const files = [
    "@firebase/firestore/dist/lite/index.node.cjs.js",
    "@firebase/firestore/dist/lite/index.node.mjs.js",
    "@firebase/firestore/dist/lite/index.rn.esm2017.js",
    "@firebase/firestore/dist/lite/index.cjs.js"
  ];
  for (const file of files) {
    moduleFirestoreCJS.files.push(
      new InstrumentationNodeModuleFile(
        file,
        firestoreSupportedVersions2,
        (moduleExports) => wrapMethods(moduleExports, wrap, unwrap, tracer, firestoreSpanCreationHook),
        (moduleExports) => unwrapMethods(moduleExports, unwrap)
      )
    );
  }
  return moduleFirestoreCJS;
}
function wrapMethods(moduleExports, wrap, unwrap, tracer, firestoreSpanCreationHook) {
  unwrapMethods(moduleExports, unwrap);
  wrap(moduleExports, "addDoc", patchAddDoc(tracer, firestoreSpanCreationHook));
  wrap(moduleExports, "getDocs", patchGetDocs(tracer, firestoreSpanCreationHook));
  wrap(moduleExports, "setDoc", patchSetDoc(tracer, firestoreSpanCreationHook));
  wrap(moduleExports, "deleteDoc", patchDeleteDoc(tracer, firestoreSpanCreationHook));
  return moduleExports;
}
function unwrapMethods(moduleExports, unwrap) {
  for (const method of ["addDoc", "getDocs", "setDoc", "deleteDoc"]) {
    if (isWrapped(moduleExports[method])) {
      unwrap(moduleExports, method);
    }
  }
  return moduleExports;
}
function patchAddDoc(tracer, firestoreSpanCreationHook) {
  return function addDoc(original) {
    return function(reference, data) {
      const span = startDBSpan(tracer, "addDoc", reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return original(reference, data);
      });
    };
  };
}
function patchDeleteDoc(tracer, firestoreSpanCreationHook) {
  return function deleteDoc(original) {
    return function(reference) {
      const span = startDBSpan(tracer, "deleteDoc", reference.parent || reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return original(reference);
      });
    };
  };
}
function patchGetDocs(tracer, firestoreSpanCreationHook) {
  return function getDocs(original) {
    return function(reference) {
      const span = startDBSpan(tracer, "getDocs", reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return original(reference);
      });
    };
  };
}
function patchSetDoc(tracer, firestoreSpanCreationHook) {
  return function setDoc(original) {
    return function(reference, data, options) {
      const span = startDBSpan(tracer, "setDoc", reference.parent || reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return typeof options !== "undefined" ? original(reference, data, options) : original(reference, data);
      });
    };
  };
}
function executeContextWithSpan(span, callback) {
  return context.with(trace.setSpan(context.active(), span), () => {
    return safeExecuteInTheMiddle(
      () => {
        return callback();
      },
      (err) => {
        if (err) {
          span.recordException(err);
        }
        span.end();
      },
      true
    );
  });
}
function startDBSpan(tracer, spanName, reference) {
  const span = tracer.startSpan(`${spanName} ${reference.path}`, { kind: SpanKind.CLIENT });
  addAttributes(span, reference);
  span.setAttribute(ATTR_DB_OPERATION_NAME, spanName);
  return span;
}
function getPortAndAddress(settings) {
  let address;
  let port;
  if (typeof settings.host === "string") {
    if (settings.host.startsWith("[")) {
      if (settings.host.endsWith("]")) {
        address = settings.host.replace(/^\[|\]$/g, "");
      } else if (settings.host.includes("]:")) {
        const lastColonIndex = settings.host.lastIndexOf(":");
        if (lastColonIndex !== -1) {
          address = settings.host.slice(1, lastColonIndex).replace(/^\[|\]$/g, "");
          port = settings.host.slice(lastColonIndex + 1);
        }
      }
    } else {
      if (net.isIPv6(settings.host)) {
        address = settings.host;
      } else {
        const lastColonIndex = settings.host.lastIndexOf(":");
        if (lastColonIndex !== -1) {
          address = settings.host.slice(0, lastColonIndex);
          port = settings.host.slice(lastColonIndex + 1);
        } else {
          address = settings.host;
        }
      }
    }
  }
  return {
    address,
    port: port ? parseInt(port, 10) : void 0
  };
}
function addAttributes(span, reference) {
  const firestoreApp = reference.firestore.app;
  const firestoreOptions = firestoreApp.options;
  const json = reference.firestore.toJSON() || {};
  const settings = json.settings || {};
  const attributes = {
    [ATTR_DB_COLLECTION_NAME]: reference.path,
    [ATTR_DB_NAMESPACE]: firestoreApp.name,
    [ATTR_DB_SYSTEM_NAME]: "firebase.firestore",
    "firebase.firestore.type": reference.type,
    "firebase.firestore.options.projectId": firestoreOptions.projectId,
    "firebase.firestore.options.appId": firestoreOptions.appId,
    "firebase.firestore.options.messagingSenderId": firestoreOptions.messagingSenderId,
    "firebase.firestore.options.storageBucket": firestoreOptions.storageBucket
  };
  const { address, port } = getPortAndAddress(settings);
  if (address) {
    attributes[ATTR_SERVER_ADDRESS] = address;
  }
  if (port) {
    attributes[ATTR_SERVER_PORT] = port;
  }
  span.setAttributes(attributes);
}
function patchFunctions(tracer, functionsSupportedVersions2, wrap, unwrap, config2) {
  let requestHook2 = () => {
  };
  let responseHook = () => {
  };
  const errorHook = config2.functions?.errorHook;
  const configRequestHook = config2.functions?.requestHook;
  const configResponseHook = config2.functions?.responseHook;
  if (typeof configResponseHook === "function") {
    responseHook = (span, err) => {
      safeExecuteInTheMiddle(
        () => configResponseHook(span, err),
        (error) => {
          if (!error) {
            return;
          }
          diag.error(error?.message);
        },
        true
      );
    };
  }
  if (typeof configRequestHook === "function") {
    requestHook2 = (span) => {
      safeExecuteInTheMiddle(
        () => configRequestHook(span),
        (error) => {
          if (!error) {
            return;
          }
          diag.error(error?.message);
        },
        true
      );
    };
  }
  const moduleFunctionsCJS = new InstrumentationNodeModuleDefinition("firebase-functions", functionsSupportedVersions2);
  const modulesToInstrument = [
    { name: "firebase-functions/lib/v2/providers/https.js", triggerType: "function" },
    { name: "firebase-functions/lib/v2/providers/firestore.js", triggerType: "firestore" },
    { name: "firebase-functions/lib/v2/providers/scheduler.js", triggerType: "scheduler" },
    { name: "firebase-functions/lib/v2/storage.js", triggerType: "storage" }
  ];
  modulesToInstrument.forEach(({ name, triggerType }) => {
    moduleFunctionsCJS.files.push(
      new InstrumentationNodeModuleFile(
        name,
        functionsSupportedVersions2,
        (moduleExports) => wrapCommonFunctions(
          moduleExports,
          wrap,
          unwrap,
          tracer,
          { requestHook: requestHook2, responseHook, errorHook },
          triggerType
        ),
        (moduleExports) => unwrapCommonFunctions(moduleExports, unwrap)
      )
    );
  });
  return moduleFunctionsCJS;
}
function patchV2Functions(tracer, functionsConfig, triggerType) {
  return function v2FunctionsWrapper(original) {
    return function(...args) {
      const handler = typeof args[0] === "function" ? args[0] : args[1];
      const documentOrOptions = typeof args[0] === "function" ? void 0 : args[0];
      if (!handler) {
        return original.call(this, ...args);
      }
      const wrappedHandler = async function(...handlerArgs) {
        const functionName = process.env.FUNCTION_TARGET || process.env.K_SERVICE || "unknown";
        const span = tracer.startSpan(`firebase.function.${triggerType}`, {
          kind: SpanKind.SERVER
        });
        const attributes = {
          "faas.name": functionName,
          "faas.trigger": triggerType,
          "faas.provider": "firebase"
        };
        if (process.env.GCLOUD_PROJECT) {
          attributes["cloud.project_id"] = process.env.GCLOUD_PROJECT;
        }
        if (process.env.EVENTARC_CLOUD_EVENT_SOURCE) {
          attributes["cloud.event_source"] = process.env.EVENTARC_CLOUD_EVENT_SOURCE;
        }
        span.setAttributes(attributes);
        functionsConfig?.requestHook?.(span);
        return context.with(trace.setSpan(context.active(), span), async () => {
          let error;
          let result;
          try {
            result = await handler.apply(this, handlerArgs);
          } catch (e) {
            error = e;
          }
          functionsConfig?.responseHook?.(span, error);
          if (error) {
            span.recordException(error);
          }
          span.end();
          if (error) {
            await functionsConfig?.errorHook?.(span, error);
            throw error;
          }
          return result;
        });
      };
      if (documentOrOptions) {
        return original.call(this, documentOrOptions, wrappedHandler);
      } else {
        return original.call(this, wrappedHandler);
      }
    };
  };
}
function wrapCommonFunctions(moduleExports, wrap, unwrap, tracer, functionsConfig, triggerType) {
  unwrapCommonFunctions(moduleExports, unwrap);
  switch (triggerType) {
    case "function":
      wrap(moduleExports, "onRequest", patchV2Functions(tracer, functionsConfig, "http.request"));
      wrap(moduleExports, "onCall", patchV2Functions(tracer, functionsConfig, "http.call"));
      break;
    case "firestore":
      wrap(moduleExports, "onDocumentCreated", patchV2Functions(tracer, functionsConfig, "firestore.document.created"));
      wrap(moduleExports, "onDocumentUpdated", patchV2Functions(tracer, functionsConfig, "firestore.document.updated"));
      wrap(moduleExports, "onDocumentDeleted", patchV2Functions(tracer, functionsConfig, "firestore.document.deleted"));
      wrap(moduleExports, "onDocumentWritten", patchV2Functions(tracer, functionsConfig, "firestore.document.written"));
      wrap(
        moduleExports,
        "onDocumentCreatedWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.created")
      );
      wrap(
        moduleExports,
        "onDocumentUpdatedWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.updated")
      );
      wrap(
        moduleExports,
        "onDocumentDeletedWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.deleted")
      );
      wrap(
        moduleExports,
        "onDocumentWrittenWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.written")
      );
      break;
    case "scheduler":
      wrap(moduleExports, "onSchedule", patchV2Functions(tracer, functionsConfig, "scheduler.scheduled"));
      break;
    case "storage":
      wrap(moduleExports, "onObjectFinalized", patchV2Functions(tracer, functionsConfig, "storage.object.finalized"));
      wrap(moduleExports, "onObjectArchived", patchV2Functions(tracer, functionsConfig, "storage.object.archived"));
      wrap(moduleExports, "onObjectDeleted", patchV2Functions(tracer, functionsConfig, "storage.object.deleted"));
      wrap(
        moduleExports,
        "onObjectMetadataUpdated",
        patchV2Functions(tracer, functionsConfig, "storage.object.metadataUpdated")
      );
      break;
  }
  return moduleExports;
}
function unwrapCommonFunctions(moduleExports, unwrap) {
  const methods = [
    "onSchedule",
    "onRequest",
    "onCall",
    "onObjectFinalized",
    "onObjectArchived",
    "onObjectDeleted",
    "onObjectMetadataUpdated",
    "onDocumentCreated",
    "onDocumentUpdated",
    "onDocumentDeleted",
    "onDocumentWritten",
    "onDocumentCreatedWithAuthContext",
    "onDocumentUpdatedWithAuthContext",
    "onDocumentDeletedWithAuthContext",
    "onDocumentWrittenWithAuthContext"
  ];
  for (const method of methods) {
    if (isWrapped(moduleExports[method])) {
      unwrap(moduleExports, method);
    }
  }
  return moduleExports;
}
const DefaultFirebaseInstrumentationConfig = {};
const firestoreSupportedVersions = [">=3.0.0 <5"];
const functionsSupportedVersions = [">=6.0.0 <7"];
class FirebaseInstrumentation extends InstrumentationBase {
  constructor(config2 = DefaultFirebaseInstrumentationConfig) {
    super("@sentry/instrumentation-firebase", SDK_VERSION, config2);
  }
  /**
   * sets config
   * @param config
   */
  setConfig(config2 = {}) {
    super.setConfig({ ...DefaultFirebaseInstrumentationConfig, ...config2 });
  }
  /**
   *
   * @protected
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  init() {
    const modules = [];
    modules.push(patchFirestore(this.tracer, firestoreSupportedVersions, this._wrap, this._unwrap, this.getConfig()));
    modules.push(patchFunctions(this.tracer, functionsSupportedVersions, this._wrap, this._unwrap, this.getConfig()));
    return modules;
  }
}
const INTEGRATION_NAME = "Firebase";
const config = {
  firestoreSpanCreationHook: (span) => {
    addOriginToSpan(span, "auto.firebase.otel.firestore");
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "db.query");
  },
  functions: {
    requestHook: (span) => {
      addOriginToSpan(span, "auto.firebase.otel.functions");
      span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "http.request");
    },
    errorHook: async (_, error) => {
      if (error) {
        captureException(error, {
          mechanism: {
            type: "auto.firebase.otel.functions",
            handled: false
          }
        });
        await flush(2e3);
      }
    }
  }
};
const instrumentFirebase = generateInstrumentOnce(INTEGRATION_NAME, () => new FirebaseInstrumentation(config));
const _firebaseIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentFirebase();
    }
  };
});
const firebaseIntegration = defineIntegration(_firebaseIntegration);
function getAutoPerformanceIntegrations() {
  return [
    expressIntegration(),
    fastifyIntegration(),
    graphqlIntegration(),
    honoIntegration(),
    mongoIntegration(),
    mongooseIntegration(),
    mysqlIntegration(),
    mysql2Integration(),
    redisIntegration(),
    postgresIntegration(),
    prismaIntegration(),
    hapiIntegration(),
    koaIntegration(),
    connectIntegration(),
    tediousIntegration(),
    genericPoolIntegration(),
    kafkaIntegration(),
    amqplibIntegration(),
    lruMemoizerIntegration(),
    // AI providers
    // LangChain must come first to disable AI provider integrations before they instrument
    langChainIntegration(),
    langGraphIntegration(),
    vercelAIIntegration(),
    openAIIntegration(),
    anthropicAIIntegration(),
    googleGenAIIntegration(),
    postgresJsIntegration(),
    firebaseIntegration()
  ];
}
const MAX_MAX_SPAN_WAIT_DURATION = 1e6;
function initOpenTelemetry(client, options = {}) {
  if (client.getOptions().debug) {
    setupOpenTelemetryLogger();
  }
  const [provider, asyncLocalStorageLookup] = setupOtel(client, options);
  client.traceProvider = provider;
  client.asyncLocalStorageLookup = asyncLocalStorageLookup;
}
function setupOtel(client, options = {}) {
  const provider = new BasicTracerProvider({
    sampler: new SentrySampler(client),
    resource: defaultResource().merge(
      resourceFromAttributes({
        [ATTR_SERVICE_NAME]: "node",
        // eslint-disable-next-line deprecation/deprecation
        [SEMRESATTRS_SERVICE_NAMESPACE]: "sentry",
        [ATTR_SERVICE_VERSION]: SDK_VERSION
      })
    ),
    forceFlushTimeoutMillis: 500,
    spanProcessors: [
      new SentrySpanProcessor({
        timeout: _clampSpanProcessorTimeout(client.getOptions().maxSpanWaitDuration)
      }),
      ...options.spanProcessors || []
    ]
  });
  trace.setGlobalTracerProvider(provider);
  propagation.setGlobalPropagator(new SentryPropagator());
  const ctxManager = new SentryContextManager();
  context.setGlobalContextManager(ctxManager);
  return [provider, ctxManager.getAsyncLocalStorageLookup()];
}
function _clampSpanProcessorTimeout(maxSpanWaitDuration) {
  if (maxSpanWaitDuration == null) {
    return void 0;
  }
  if (maxSpanWaitDuration > MAX_MAX_SPAN_WAIT_DURATION) {
    DEBUG_BUILD && debug.warn(`\`maxSpanWaitDuration\` is too high, using the maximum value of ${MAX_MAX_SPAN_WAIT_DURATION}`);
    return MAX_MAX_SPAN_WAIT_DURATION;
  } else if (maxSpanWaitDuration <= 0 || Number.isNaN(maxSpanWaitDuration)) {
    DEBUG_BUILD && debug.warn("`maxSpanWaitDuration` must be a positive number, using default value instead.");
    return void 0;
  }
  return maxSpanWaitDuration;
}
function getDefaultIntegrationsWithoutPerformance() {
  const nodeCoreIntegrations = getDefaultIntegrations$1();
  return nodeCoreIntegrations.filter((integration) => integration.name !== "Http" && integration.name !== "NodeFetch").concat(httpIntegration(), nativeNodeFetchIntegration());
}
function getDefaultIntegrations(options) {
  return [
    ...getDefaultIntegrationsWithoutPerformance(),
    // We only add performance integrations if tracing is enabled
    // Note that this means that without tracing enabled, e.g. `expressIntegration()` will not be added
    // This means that generally request isolation will work (because that is done by httpIntegration)
    // But `transactionName` will not be set automatically
    ...hasSpansEnabled(options) ? getAutoPerformanceIntegrations() : []
  ];
}
function init(options = {}) {
  return _init(options, getDefaultIntegrations);
}
function _init(options = {}, getDefaultIntegrationsImpl) {
  applySdkMetadata(options, "node");
  const client = init$1({
    ...options,
    // Only use Node SDK defaults if none provided
    defaultIntegrations: options.defaultIntegrations ?? getDefaultIntegrationsImpl(options)
  });
  if (client && !options.skipOpenTelemetrySetup) {
    initOpenTelemetry(client, {
      spanProcessors: options.openTelemetrySpanProcessors
    });
    validateOpenTelemetrySetup();
  }
  return client;
}
export {
  getDefaultIntegrations as g,
  init as i
};
