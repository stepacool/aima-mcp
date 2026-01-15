import { s as srcExports } from "../@opentelemetry/context-async-hooks.mjs";
import { s as shouldPropagateTraceForUrl, w as wrapContextManagerClass, g as getTraceContextForScope, o as openTelemetrySetupCheck, d as setOpenTelemetryContextAsyncContextStrategy, e as enhanceDscWithOpenTelemetryRootSpanName, f as setupEventContextTrace } from "./opentelemetry.mjs";
import { a as context, c as createContextKey, p as propagation, f as SpanKind, t as trace, d as diag, D as DiagLogLevel } from "../@opentelemetry/api.mjs";
import { c as debug, v as addNonEnumerableProperty, g as getClient, a as getIsolationScope, N as httpRequestToRequestData, P as stripUrlQueryAndFragment, Q as withIsolationScope, R as generateSpanId, T as getCurrentScope, U as parseStringToURLObject, V as httpHeadersToSpanAttributes, S as SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, e as SEMANTIC_ATTRIBUTE_SENTRY_OP, W as getSpanStatusFromHttpCode, o as SPAN_STATUS_ERROR, X as parseBaggageHeader, Y as objectToBaggageHeader, Z as addBreadcrumb, $ as getBreadcrumbLogLevelFromHttpStatusCode, a0 as getTraceData, a1 as isError, a2 as parseUrl, a3 as getSanitizedUrlString, m as SDK_VERSION, a4 as LRUMap, d as defineIntegration, a5 as parseSemver, a6 as snipLine, p as consoleSandbox, f as captureException, a7 as withActiveSpan, a8 as isMatchingPattern, a9 as serializeEnvelope, aa as suppressTracing, ab as startSession, ac as endSession, ad as createTransport, ae as dirname$1, af as createStackParser, ag as nodeStackLineParser, ah as GLOBAL_OBJ, ai as ServerRuntimeClient, M as applySdkMetadata, aj as _INTERNAL_flushLogsBuffer, ak as _INTERNAL_clearAiProviderSkips, al as inboundFiltersIntegration, am as functionToStringIntegration, an as linkedErrorsIntegration, ao as requestDataIntegration, ap as consoleIntegration, h as hasSpansEnabled, aq as stackParserFromStackParserOptions, ar as getIntegrationsToSetup, as as propagationContextFromHeaders } from "./core.mjs";
import * as diagnosticsChannel from "node:diagnostics_channel";
import { subscribe, unsubscribe } from "node:diagnostics_channel";
import { execFile } from "node:child_process";
import { readdir, readFile, createReadStream, existsSync, readFileSync } from "node:fs";
import * as os from "node:os";
import { join, dirname, posix, sep } from "node:path";
import * as util from "node:util";
import { promisify } from "node:util";
import { createInterface } from "node:readline";
import { c as registerInstrumentations, I as InstrumentationBase, a as InstrumentationNodeModuleDefinition } from "../@opentelemetry/instrumentation.mjs";
import { errorMonitor } from "node:events";
import { R as RPCType, p as setRPCMetadata, k as isTracingSuppressed, n as getRPCMetadata } from "../@opentelemetry/core.mjs";
import { v as SEMATTRS_NET_HOST_IP, w as SEMATTRS_NET_HOST_PORT, x as SEMATTRS_NET_PEER_IP, y as SEMATTRS_HTTP_STATUS_CODE, g as ATTR_HTTP_ROUTE, i as ATTR_HTTP_RESPONSE_STATUS_CODE } from "../@opentelemetry/semantic-conventions.mjs";
import { Worker } from "node:worker_threads";
import * as diagch from "diagnostics_channel";
import { isMainThread, threadId } from "worker_threads";
import * as http from "node:http";
import * as nodeHTTPS from "node:https";
import { Readable } from "node:stream";
import { createGzip } from "node:zlib";
import * as net from "node:net";
import * as tls from "node:tls";
import { i as importInTheMiddleExports } from "../import-in-the-middle.mjs";
import * as moduleModule from "module";
const INSTRUMENTED = {};
function generateInstrumentOnce(name, creatorOrClass, optionsCallback) {
  if (optionsCallback) {
    return _generateInstrumentOnceWithOptions(
      name,
      creatorOrClass,
      optionsCallback
    );
  }
  return _generateInstrumentOnce(name, creatorOrClass);
}
function _generateInstrumentOnce(name, creator) {
  return Object.assign(
    (options) => {
      const instrumented = INSTRUMENTED[name];
      if (instrumented) {
        if (options) {
          instrumented.setConfig(options);
        }
        return instrumented;
      }
      const instrumentation = creator(options);
      INSTRUMENTED[name] = instrumentation;
      registerInstrumentations({
        instrumentations: [instrumentation]
      });
      return instrumentation;
    },
    { id: name }
  );
}
function _generateInstrumentOnceWithOptions(name, instrumentationClass, optionsCallback) {
  return Object.assign(
    (_options) => {
      const options = optionsCallback(_options);
      const instrumented = INSTRUMENTED[name];
      if (instrumented) {
        instrumented.setConfig(options);
        return instrumented;
      }
      const instrumentation = new instrumentationClass(options);
      INSTRUMENTED[name] = instrumentation;
      registerInstrumentations({
        instrumentations: [instrumentation]
      });
      return instrumentation;
    },
    { id: name }
  );
}
function instrumentWhenWrapped(instrumentation) {
  let isWrapped = false;
  let callbacks = [];
  if (!hasWrap(instrumentation)) {
    isWrapped = true;
  } else {
    const originalWrap = instrumentation["_wrap"];
    instrumentation["_wrap"] = (...args) => {
      isWrapped = true;
      callbacks.forEach((callback) => callback());
      callbacks = [];
      return originalWrap(...args);
    };
  }
  const registerCallback = (callback) => {
    if (isWrapped) {
      callback();
    } else {
      callbacks.push(callback);
    }
  };
  return registerCallback;
}
function hasWrap(instrumentation) {
  return typeof instrumentation["_wrap"] === "function";
}
const DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
const INSTRUMENTATION_NAME = "@sentry/instrumentation-http";
const MAX_BODY_BYTE_LENGTH = 1024 * 1024;
const HTTP_SERVER_INSTRUMENTED_KEY = createContextKey("sentry_http_server_instrumented");
const INTEGRATION_NAME$d = "Http.Server";
const clientToRequestSessionAggregatesMap = /* @__PURE__ */ new Map();
const wrappedEmitFns = /* @__PURE__ */ new WeakSet();
function addStartSpanCallback(request, callback) {
  addNonEnumerableProperty(request, "_startSpanCallback", new WeakRef(callback));
}
const _httpServerIntegration = ((options = {}) => {
  const _options = {
    sessions: options.sessions ?? true,
    sessionFlushingDelayMS: options.sessionFlushingDelayMS ?? 6e4,
    maxRequestBodySize: options.maxRequestBodySize ?? "medium",
    ignoreRequestBody: options.ignoreRequestBody
  };
  return {
    name: INTEGRATION_NAME$d,
    setupOnce() {
      const onHttpServerRequestStart = ((_data) => {
        const data = _data;
        instrumentServer(data.server, _options);
      });
      subscribe("http.server.request.start", onHttpServerRequestStart);
    },
    afterAllSetup(client) {
      if (DEBUG_BUILD && client.getIntegrationByName("Http")) {
        debug.warn(
          "It seems that you have manually added `httpServerIntegration` while `httpIntegration` is also present. Make sure to remove `httpServerIntegration` when adding `httpIntegration`."
        );
      }
    }
  };
});
const httpServerIntegration = _httpServerIntegration;
function instrumentServer(server, {
  ignoreRequestBody,
  maxRequestBodySize,
  sessions,
  sessionFlushingDelayMS
}) {
  const originalEmit = server.emit;
  if (wrappedEmitFns.has(originalEmit)) {
    return;
  }
  const newEmit = new Proxy(originalEmit, {
    apply(target, thisArg, args) {
      if (args[0] !== "request") {
        return target.apply(thisArg, args);
      }
      const client = getClient();
      if (context.active().getValue(HTTP_SERVER_INSTRUMENTED_KEY) || !client) {
        return target.apply(thisArg, args);
      }
      DEBUG_BUILD && debug.log(INTEGRATION_NAME$d, "Handling incoming request");
      const isolationScope = getIsolationScope().clone();
      const request = args[1];
      const response = args[2];
      const normalizedRequest = httpRequestToRequestData(request);
      const ipAddress = request.ip || request.socket?.remoteAddress;
      const url = request.url || "/";
      if (maxRequestBodySize !== "none" && !ignoreRequestBody?.(url, request)) {
        patchRequestToCaptureBody(request, isolationScope, maxRequestBodySize);
      }
      isolationScope.setSDKProcessingMetadata({ normalizedRequest, ipAddress });
      const httpMethod = (request.method || "GET").toUpperCase();
      const httpTargetWithoutQueryFragment = stripUrlQueryAndFragment(url);
      const bestEffortTransactionName = `${httpMethod} ${httpTargetWithoutQueryFragment}`;
      isolationScope.setTransactionName(bestEffortTransactionName);
      if (sessions && client) {
        recordRequestSession(client, {
          requestIsolationScope: isolationScope,
          response,
          sessionFlushingDelayMS: sessionFlushingDelayMS ?? 6e4
        });
      }
      return withIsolationScope(isolationScope, () => {
        getCurrentScope().getPropagationContext().propagationSpanId = generateSpanId();
        const ctx = propagation.extract(context.active(), normalizedRequest.headers).setValue(HTTP_SERVER_INSTRUMENTED_KEY, true);
        return context.with(ctx, () => {
          client.emit("httpServerRequest", request, response, normalizedRequest);
          const callback = request._startSpanCallback?.deref();
          if (callback) {
            return callback(() => target.apply(thisArg, args));
          }
          return target.apply(thisArg, args);
        });
      });
    }
  });
  wrappedEmitFns.add(newEmit);
  server.emit = newEmit;
}
function recordRequestSession(client, {
  requestIsolationScope,
  response,
  sessionFlushingDelayMS
}) {
  requestIsolationScope.setSDKProcessingMetadata({
    requestSession: { status: "ok" }
  });
  response.once("close", () => {
    const requestSession = requestIsolationScope.getScopeData().sdkProcessingMetadata.requestSession;
    if (client && requestSession) {
      DEBUG_BUILD && debug.log(`Recorded request session with status: ${requestSession.status}`);
      const roundedDate = /* @__PURE__ */ new Date();
      roundedDate.setSeconds(0, 0);
      const dateBucketKey = roundedDate.toISOString();
      const existingClientAggregate = clientToRequestSessionAggregatesMap.get(client);
      const bucket = existingClientAggregate?.[dateBucketKey] || { exited: 0, crashed: 0, errored: 0 };
      bucket[{ ok: "exited", crashed: "crashed", errored: "errored" }[requestSession.status]]++;
      if (existingClientAggregate) {
        existingClientAggregate[dateBucketKey] = bucket;
      } else {
        DEBUG_BUILD && debug.log("Opened new request session aggregate.");
        const newClientAggregate = { [dateBucketKey]: bucket };
        clientToRequestSessionAggregatesMap.set(client, newClientAggregate);
        const flushPendingClientAggregates = () => {
          clearTimeout(timeout);
          unregisterClientFlushHook();
          clientToRequestSessionAggregatesMap.delete(client);
          const aggregatePayload = Object.entries(newClientAggregate).map(
            ([timestamp, value]) => ({
              started: timestamp,
              exited: value.exited,
              errored: value.errored,
              crashed: value.crashed
            })
          );
          client.sendSession({ aggregates: aggregatePayload });
        };
        const unregisterClientFlushHook = client.on("flush", () => {
          DEBUG_BUILD && debug.log("Sending request session aggregate due to client flush");
          flushPendingClientAggregates();
        });
        const timeout = setTimeout(() => {
          DEBUG_BUILD && debug.log("Sending request session aggregate due to flushing schedule");
          flushPendingClientAggregates();
        }, sessionFlushingDelayMS).unref();
      }
    }
  });
}
function patchRequestToCaptureBody(req, isolationScope, maxIncomingRequestBodySize) {
  let bodyByteLength = 0;
  const chunks = [];
  DEBUG_BUILD && debug.log(INTEGRATION_NAME$d, "Patching request.on");
  const callbackMap = /* @__PURE__ */ new WeakMap();
  const maxBodySize = maxIncomingRequestBodySize === "small" ? 1e3 : maxIncomingRequestBodySize === "medium" ? 1e4 : MAX_BODY_BYTE_LENGTH;
  try {
    req.on = new Proxy(req.on, {
      apply: (target, thisArg, args) => {
        const [event, listener, ...restArgs] = args;
        if (event === "data") {
          DEBUG_BUILD && debug.log(INTEGRATION_NAME$d, `Handling request.on("data") with maximum body size of ${maxBodySize}b`);
          const callback = new Proxy(listener, {
            apply: (target2, thisArg2, args2) => {
              try {
                const chunk = args2[0];
                const bufferifiedChunk = Buffer.from(chunk);
                if (bodyByteLength < maxBodySize) {
                  chunks.push(bufferifiedChunk);
                  bodyByteLength += bufferifiedChunk.byteLength;
                } else if (DEBUG_BUILD) {
                  debug.log(
                    INTEGRATION_NAME$d,
                    `Dropping request body chunk because maximum body length of ${maxBodySize}b is exceeded.`
                  );
                }
              } catch (err) {
                DEBUG_BUILD && debug.error(INTEGRATION_NAME$d, "Encountered error while storing body chunk.");
              }
              return Reflect.apply(target2, thisArg2, args2);
            }
          });
          callbackMap.set(listener, callback);
          return Reflect.apply(target, thisArg, [event, callback, ...restArgs]);
        }
        return Reflect.apply(target, thisArg, args);
      }
    });
    req.off = new Proxy(req.off, {
      apply: (target, thisArg, args) => {
        const [, listener] = args;
        const callback = callbackMap.get(listener);
        if (callback) {
          callbackMap.delete(listener);
          const modifiedArgs = args.slice();
          modifiedArgs[1] = callback;
          return Reflect.apply(target, thisArg, modifiedArgs);
        }
        return Reflect.apply(target, thisArg, args);
      }
    });
    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf-8");
        if (body) {
          const bodyByteLength2 = Buffer.byteLength(body, "utf-8");
          const truncatedBody = bodyByteLength2 > maxBodySize ? `${Buffer.from(body).subarray(0, maxBodySize - 3).toString("utf-8")}...` : body;
          isolationScope.setSDKProcessingMetadata({ normalizedRequest: { data: truncatedBody } });
        }
      } catch (error) {
        if (DEBUG_BUILD) {
          debug.error(INTEGRATION_NAME$d, "Error building captured request body", error);
        }
      }
    });
  } catch (error) {
    if (DEBUG_BUILD) {
      debug.error(INTEGRATION_NAME$d, "Error patching request to capture body", error);
    }
  }
}
const INTEGRATION_NAME$c = "Http.ServerSpans";
const _httpServerSpansIntegration = ((options = {}) => {
  const ignoreStaticAssets = options.ignoreStaticAssets ?? true;
  const ignoreIncomingRequests = options.ignoreIncomingRequests;
  const ignoreStatusCodes = options.ignoreStatusCodes ?? [
    [401, 404],
    // 300 and 304 are possibly valid status codes we do not want to filter
    [301, 303],
    [305, 399]
  ];
  const { onSpanCreated } = options;
  const { requestHook, responseHook, applyCustomAttributesOnSpan } = options.instrumentation ?? {};
  return {
    name: INTEGRATION_NAME$c,
    setup(client) {
      if (typeof __SENTRY_TRACING__ !== "undefined" && !__SENTRY_TRACING__) {
        return;
      }
      client.on("httpServerRequest", (_request, _response, normalizedRequest) => {
        const request = _request;
        const response = _response;
        const startSpan = (next) => {
          if (shouldIgnoreSpansForIncomingRequest(request, {
            ignoreStaticAssets,
            ignoreIncomingRequests
          })) {
            DEBUG_BUILD && debug.log(INTEGRATION_NAME$c, "Skipping span creation for incoming request", request.url);
            return next();
          }
          const fullUrl = normalizedRequest.url || request.url || "/";
          const urlObj = parseStringToURLObject(fullUrl);
          const headers = request.headers;
          const userAgent = headers["user-agent"];
          const ips = headers["x-forwarded-for"];
          const httpVersion = request.httpVersion;
          const host = headers.host;
          const hostname = host?.replace(/^(.*)(:[0-9]{1,5})/, "$1") || "localhost";
          const tracer = client.tracer;
          const scheme = fullUrl.startsWith("https") ? "https" : "http";
          const method = normalizedRequest.method || request.method?.toUpperCase() || "GET";
          const httpTargetWithoutQueryFragment = urlObj ? urlObj.pathname : stripUrlQueryAndFragment(fullUrl);
          const bestEffortTransactionName = `${method} ${httpTargetWithoutQueryFragment}`;
          const span = tracer.startSpan(bestEffortTransactionName, {
            kind: SpanKind.SERVER,
            attributes: {
              // Sentry specific attributes
              [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.server",
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.http",
              "sentry.http.prefetch": isKnownPrefetchRequest(request) || void 0,
              // Old Semantic Conventions attributes - added for compatibility with what `@opentelemetry/instrumentation-http` output before
              "http.url": fullUrl,
              "http.method": normalizedRequest.method,
              "http.target": urlObj ? `${urlObj.pathname}${urlObj.search}` : httpTargetWithoutQueryFragment,
              "http.host": host,
              "net.host.name": hostname,
              "http.client_ip": typeof ips === "string" ? ips.split(",")[0] : void 0,
              "http.user_agent": userAgent,
              "http.scheme": scheme,
              "http.flavor": httpVersion,
              "net.transport": httpVersion?.toUpperCase() === "QUIC" ? "ip_udp" : "ip_tcp",
              ...getRequestContentLengthAttribute(request),
              ...httpHeadersToSpanAttributes(
                normalizedRequest.headers || {},
                client.getOptions().sendDefaultPii ?? false
              )
            }
          });
          requestHook?.(span, request);
          responseHook?.(span, response);
          applyCustomAttributesOnSpan?.(span, request, response);
          onSpanCreated?.(span, request, response);
          const rpcMetadata = {
            type: RPCType.HTTP,
            span
          };
          return context.with(setRPCMetadata(trace.setSpan(context.active(), span), rpcMetadata), () => {
            context.bind(context.active(), request);
            context.bind(context.active(), response);
            let isEnded = false;
            function endSpan(status) {
              if (isEnded) {
                return;
              }
              isEnded = true;
              const newAttributes = getIncomingRequestAttributesOnResponse(request, response);
              span.setAttributes(newAttributes);
              span.setStatus(status);
              span.end();
              const route = newAttributes["http.route"];
              if (route) {
                getIsolationScope().setTransactionName(`${request.method?.toUpperCase() || "GET"} ${route}`);
              }
            }
            response.on("close", () => {
              endSpan(getSpanStatusFromHttpCode(response.statusCode));
            });
            response.on(errorMonitor, () => {
              const httpStatus = getSpanStatusFromHttpCode(response.statusCode);
              endSpan(httpStatus.code === SPAN_STATUS_ERROR ? httpStatus : { code: SPAN_STATUS_ERROR });
            });
            return next();
          });
        };
        addStartSpanCallback(request, startSpan);
      });
    },
    processEvent(event) {
      if (event.type === "transaction") {
        const statusCode = event.contexts?.trace?.data?.["http.response.status_code"];
        if (typeof statusCode === "number") {
          const shouldDrop = shouldFilterStatusCode(statusCode, ignoreStatusCodes);
          if (shouldDrop) {
            DEBUG_BUILD && debug.log("Dropping transaction due to status code", statusCode);
            return null;
          }
        }
      }
      return event;
    },
    afterAllSetup(client) {
      if (!DEBUG_BUILD) {
        return;
      }
      if (client.getIntegrationByName("Http")) {
        debug.warn(
          "It seems that you have manually added `httpServerSpansIntergation` while `httpIntegration` is also present. Make sure to remove `httpIntegration` when adding `httpServerSpansIntegration`."
        );
      }
      if (!client.getIntegrationByName("Http.Server")) {
        debug.error(
          "It seems that you have manually added `httpServerSpansIntergation` without adding `httpServerIntegration`. This is a requiement for spans to be created - please add the `httpServerIntegration` integration."
        );
      }
    }
  };
});
const httpServerSpansIntegration = _httpServerSpansIntegration;
function isKnownPrefetchRequest(req) {
  return req.headers["next-router-prefetch"] === "1";
}
function isStaticAssetRequest(urlPath) {
  const path = stripUrlQueryAndFragment(urlPath);
  if (path.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webp|avif)$/)) {
    return true;
  }
  if (path.match(/^\/(robots\.txt|sitemap\.xml|manifest\.json|browserconfig\.xml)$/)) {
    return true;
  }
  return false;
}
function shouldIgnoreSpansForIncomingRequest(request, {
  ignoreStaticAssets,
  ignoreIncomingRequests
}) {
  if (isTracingSuppressed(context.active())) {
    return true;
  }
  const urlPath = request.url;
  const method = request.method?.toUpperCase();
  if (method === "OPTIONS" || method === "HEAD" || !urlPath) {
    return true;
  }
  if (ignoreStaticAssets && method === "GET" && isStaticAssetRequest(urlPath)) {
    return true;
  }
  if (ignoreIncomingRequests?.(urlPath, request)) {
    return true;
  }
  return false;
}
function getRequestContentLengthAttribute(request) {
  const length = getContentLength(request.headers);
  if (length == null) {
    return {};
  }
  if (isCompressed(request.headers)) {
    return {
      ["http.request_content_length"]: length
    };
  } else {
    return {
      ["http.request_content_length_uncompressed"]: length
    };
  }
}
function getContentLength(headers) {
  const contentLengthHeader = headers["content-length"];
  if (contentLengthHeader === void 0) return null;
  const contentLength = parseInt(contentLengthHeader, 10);
  if (isNaN(contentLength)) return null;
  return contentLength;
}
function isCompressed(headers) {
  const encoding = headers["content-encoding"];
  return !!encoding && encoding !== "identity";
}
function getIncomingRequestAttributesOnResponse(request, response) {
  const { socket } = request;
  const { statusCode, statusMessage } = response;
  const newAttributes = {
    [ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode,
    // eslint-disable-next-line deprecation/deprecation
    [SEMATTRS_HTTP_STATUS_CODE]: statusCode,
    "http.status_text": statusMessage?.toUpperCase()
  };
  const rpcMetadata = getRPCMetadata(context.active());
  if (socket) {
    const { localAddress, localPort, remoteAddress, remotePort } = socket;
    newAttributes[SEMATTRS_NET_HOST_IP] = localAddress;
    newAttributes[SEMATTRS_NET_HOST_PORT] = localPort;
    newAttributes[SEMATTRS_NET_PEER_IP] = remoteAddress;
    newAttributes["net.peer.port"] = remotePort;
  }
  newAttributes[SEMATTRS_HTTP_STATUS_CODE] = statusCode;
  newAttributes["http.status_text"] = (statusMessage || "").toUpperCase();
  if (rpcMetadata?.type === RPCType.HTTP && rpcMetadata.route !== void 0) {
    const routeName = rpcMetadata.route;
    newAttributes[ATTR_HTTP_ROUTE] = routeName;
  }
  return newAttributes;
}
function shouldFilterStatusCode(statusCode, dropForStatusCodes) {
  return dropForStatusCodes.some((code) => {
    if (typeof code === "number") {
      return code === statusCode;
    }
    const [min, max] = code;
    return statusCode >= min && statusCode <= max;
  });
}
function getRequestUrl$1(requestOptions) {
  const protocol = requestOptions.protocol || "";
  const hostname = requestOptions.hostname || requestOptions.host || "";
  const port = !requestOptions.port || requestOptions.port === 80 || requestOptions.port === 443 || /^(.*):(\d+)$/.test(hostname) ? "" : `:${requestOptions.port}`;
  const path = requestOptions.path ? requestOptions.path : "/";
  return `${protocol}//${hostname}${port}${path}`;
}
function mergeBaggageHeaders(existing, baggage) {
  if (!existing) {
    return baggage;
  }
  const existingBaggageEntries = parseBaggageHeader(existing);
  const newBaggageEntries = parseBaggageHeader(baggage);
  if (!newBaggageEntries) {
    return existing;
  }
  const mergedBaggageEntries = { ...existingBaggageEntries };
  Object.entries(newBaggageEntries).forEach(([key, value]) => {
    if (!mergedBaggageEntries[key]) {
      mergedBaggageEntries[key] = value;
    }
  });
  return objectToBaggageHeader(mergedBaggageEntries);
}
function addRequestBreadcrumb$1(request, response) {
  const data = getBreadcrumbData$1(request);
  const statusCode = response?.statusCode;
  const level = getBreadcrumbLogLevelFromHttpStatusCode(statusCode);
  addBreadcrumb(
    {
      category: "http",
      data: {
        status_code: statusCode,
        ...data
      },
      type: "http",
      level
    },
    {
      event: "response",
      request,
      response
    }
  );
}
function addTracePropagationHeadersToOutgoingRequest(request, propagationDecisionMap) {
  const url = getRequestUrl(request);
  const { tracePropagationTargets, propagateTraceparent } = getClient()?.getOptions() || {};
  const headersToAdd = shouldPropagateTraceForUrl(url, tracePropagationTargets, propagationDecisionMap) ? getTraceData({ propagateTraceparent }) : void 0;
  if (!headersToAdd) {
    return;
  }
  const { "sentry-trace": sentryTrace, baggage, traceparent } = headersToAdd;
  if (sentryTrace && !request.getHeader("sentry-trace")) {
    try {
      request.setHeader("sentry-trace", sentryTrace);
      DEBUG_BUILD && debug.log(INSTRUMENTATION_NAME, "Added sentry-trace header to outgoing request");
    } catch (error) {
      DEBUG_BUILD && debug.error(
        INSTRUMENTATION_NAME,
        "Failed to add sentry-trace header to outgoing request:",
        isError(error) ? error.message : "Unknown error"
      );
    }
  }
  if (traceparent && !request.getHeader("traceparent")) {
    try {
      request.setHeader("traceparent", traceparent);
      DEBUG_BUILD && debug.log(INSTRUMENTATION_NAME, "Added traceparent header to outgoing request");
    } catch (error) {
      DEBUG_BUILD && debug.error(
        INSTRUMENTATION_NAME,
        "Failed to add traceparent header to outgoing request:",
        isError(error) ? error.message : "Unknown error"
      );
    }
  }
  if (baggage) {
    const newBaggage = mergeBaggageHeaders(request.getHeader("baggage"), baggage);
    if (newBaggage) {
      try {
        request.setHeader("baggage", newBaggage);
        DEBUG_BUILD && debug.log(INSTRUMENTATION_NAME, "Added baggage header to outgoing request");
      } catch (error) {
        DEBUG_BUILD && debug.error(
          INSTRUMENTATION_NAME,
          "Failed to add baggage header to outgoing request:",
          isError(error) ? error.message : "Unknown error"
        );
      }
    }
  }
}
function getBreadcrumbData$1(request) {
  try {
    const host = request.getHeader("host") || request.host;
    const url = new URL(request.path, `${request.protocol}//${host}`);
    const parsedUrl = parseUrl(url.toString());
    const data = {
      url: getSanitizedUrlString(parsedUrl),
      "http.method": request.method || "GET"
    };
    if (parsedUrl.search) {
      data["http.query"] = parsedUrl.search;
    }
    if (parsedUrl.hash) {
      data["http.fragment"] = parsedUrl.hash;
    }
    return data;
  } catch {
    return {};
  }
}
function getRequestOptions(request) {
  return {
    method: request.method,
    protocol: request.protocol,
    host: request.host,
    hostname: request.host,
    path: request.path,
    headers: request.getHeaders()
  };
}
function getRequestUrl(request) {
  const hostname = request.getHeader("host") || request.host;
  const protocol = request.protocol;
  const path = request.path;
  return `${protocol}//${hostname}${path}`;
}
class SentryHttpInstrumentation extends InstrumentationBase {
  constructor(config = {}) {
    super(INSTRUMENTATION_NAME, SDK_VERSION, config);
    this._propagationDecisionMap = new LRUMap(100);
    this._ignoreOutgoingRequestsMap = /* @__PURE__ */ new WeakMap();
  }
  /** @inheritdoc */
  init() {
    let hasRegisteredHandlers = false;
    const onHttpClientResponseFinish = ((_data) => {
      const data = _data;
      this._onOutgoingRequestFinish(data.request, data.response);
    });
    const onHttpClientRequestError = ((_data) => {
      const data = _data;
      this._onOutgoingRequestFinish(data.request, void 0);
    });
    const onHttpClientRequestCreated = ((_data) => {
      const data = _data;
      this._onOutgoingRequestCreated(data.request);
    });
    const wrap = (moduleExports) => {
      if (hasRegisteredHandlers) {
        return moduleExports;
      }
      hasRegisteredHandlers = true;
      subscribe("http.client.response.finish", onHttpClientResponseFinish);
      subscribe("http.client.request.error", onHttpClientRequestError);
      if (this.getConfig().propagateTraceInOutgoingRequests) {
        subscribe("http.client.request.created", onHttpClientRequestCreated);
      }
      return moduleExports;
    };
    const unwrap = () => {
      unsubscribe("http.client.response.finish", onHttpClientResponseFinish);
      unsubscribe("http.client.request.error", onHttpClientRequestError);
      unsubscribe("http.client.request.created", onHttpClientRequestCreated);
    };
    return [
      new InstrumentationNodeModuleDefinition("http", ["*"], wrap, unwrap),
      new InstrumentationNodeModuleDefinition("https", ["*"], wrap, unwrap)
    ];
  }
  /**
   * This is triggered when an outgoing request finishes.
   * It has access to the final request and response objects.
   */
  _onOutgoingRequestFinish(request, response) {
    DEBUG_BUILD && debug.log(INSTRUMENTATION_NAME, "Handling finished outgoing request");
    const _breadcrumbs = this.getConfig().breadcrumbs;
    const breadCrumbsEnabled = typeof _breadcrumbs === "undefined" ? true : _breadcrumbs;
    const shouldIgnore = this._ignoreOutgoingRequestsMap.get(request) ?? this._shouldIgnoreOutgoingRequest(request);
    this._ignoreOutgoingRequestsMap.set(request, shouldIgnore);
    if (breadCrumbsEnabled && !shouldIgnore) {
      addRequestBreadcrumb$1(request, response);
    }
  }
  /**
   * This is triggered when an outgoing request is created.
   * It has access to the request object, and can mutate it before the request is sent.
   */
  _onOutgoingRequestCreated(request) {
    const shouldIgnore = this._ignoreOutgoingRequestsMap.get(request) ?? this._shouldIgnoreOutgoingRequest(request);
    this._ignoreOutgoingRequestsMap.set(request, shouldIgnore);
    if (shouldIgnore) {
      return;
    }
    addTracePropagationHeadersToOutgoingRequest(request, this._propagationDecisionMap);
  }
  /**
   * Check if the given outgoing request should be ignored.
   */
  _shouldIgnoreOutgoingRequest(request) {
    if (isTracingSuppressed(context.active())) {
      return true;
    }
    const ignoreOutgoingRequests = this.getConfig().ignoreOutgoingRequests;
    if (!ignoreOutgoingRequests) {
      return false;
    }
    const options = getRequestOptions(request);
    const url = getRequestUrl$1(request);
    return ignoreOutgoingRequests(url, options);
  }
}
const INTEGRATION_NAME$b = "Http";
const instrumentSentryHttp = generateInstrumentOnce(
  `${INTEGRATION_NAME$b}.sentry`,
  (options) => {
    return new SentryHttpInstrumentation(options);
  }
);
const httpIntegration = defineIntegration((options = {}) => {
  const serverOptions = {
    sessions: options.trackIncomingRequestsAsSessions,
    sessionFlushingDelayMS: options.sessionFlushingDelayMS,
    ignoreRequestBody: options.ignoreIncomingRequestBody,
    maxRequestBodySize: options.maxIncomingRequestBodySize
  };
  const serverSpansOptions = {
    ignoreIncomingRequests: options.ignoreIncomingRequests,
    ignoreStaticAssets: options.ignoreStaticAssets,
    ignoreStatusCodes: options.dropSpansForIncomingRequestStatusCodes
  };
  const httpInstrumentationOptions = {
    breadcrumbs: options.breadcrumbs,
    propagateTraceInOutgoingRequests: true,
    ignoreOutgoingRequests: options.ignoreOutgoingRequests
  };
  const server = httpServerIntegration(serverOptions);
  const serverSpans = httpServerSpansIntegration(serverSpansOptions);
  const spans = options.spans ?? false;
  const disableIncomingRequestSpans = options.disableIncomingRequestSpans ?? false;
  const enabledServerSpans = spans && !disableIncomingRequestSpans;
  return {
    name: INTEGRATION_NAME$b,
    setup(client) {
      if (enabledServerSpans) {
        serverSpans.setup(client);
      }
    },
    setupOnce() {
      server.setupOnce();
      instrumentSentryHttp(httpInstrumentationOptions);
    },
    processEvent(event) {
      return serverSpans.processEvent(event);
    }
  };
});
const NODE_VERSION = parseSemver(process.versions.node);
const NODE_MAJOR = NODE_VERSION.major;
const NODE_MINOR = NODE_VERSION.minor;
const SENTRY_TRACE_HEADER = "sentry-trace";
const SENTRY_BAGGAGE_HEADER = "baggage";
const BAGGAGE_HEADER_REGEX = /baggage: (.*)\r\n/;
class SentryNodeFetchInstrumentation extends InstrumentationBase {
  // Keep ref to avoid https://github.com/nodejs/node/issues/42170 bug and for
  // unsubscribing.
  constructor(config = {}) {
    super("@sentry/instrumentation-node-fetch", SDK_VERSION, config);
    this._channelSubs = [];
    this._propagationDecisionMap = new LRUMap(100);
    this._ignoreOutgoingRequestsMap = /* @__PURE__ */ new WeakMap();
  }
  /** No need to instrument files/modules. */
  init() {
    return void 0;
  }
  /** Disable the instrumentation. */
  disable() {
    super.disable();
    this._channelSubs.forEach((sub) => sub.unsubscribe());
    this._channelSubs = [];
  }
  /** Enable the instrumentation. */
  enable() {
    super.enable();
    this._channelSubs = this._channelSubs || [];
    if (this._channelSubs.length > 0) {
      return;
    }
    this._subscribeToChannel("undici:request:create", this._onRequestCreated.bind(this));
    this._subscribeToChannel("undici:request:headers", this._onResponseHeaders.bind(this));
  }
  /**
   * This method is called when a request is created.
   * You can still mutate the request here before it is sent.
   */
  // eslint-disable-next-line complexity
  _onRequestCreated({ request }) {
    const config = this.getConfig();
    const enabled = config.enabled !== false;
    if (!enabled) {
      return;
    }
    const shouldIgnore = this._shouldIgnoreOutgoingRequest(request);
    this._ignoreOutgoingRequestsMap.set(request, shouldIgnore);
    if (shouldIgnore) {
      return;
    }
    const url = getAbsoluteUrl(request.origin, request.path);
    const { tracePropagationTargets, propagateTraceparent } = getClient()?.getOptions() || {};
    const addedHeaders = shouldPropagateTraceForUrl(url, tracePropagationTargets, this._propagationDecisionMap) ? getTraceData({ propagateTraceparent }) : void 0;
    if (!addedHeaders) {
      return;
    }
    const { "sentry-trace": sentryTrace, baggage, traceparent } = addedHeaders;
    if (Array.isArray(request.headers)) {
      const requestHeaders = request.headers;
      if (sentryTrace && !requestHeaders.includes(SENTRY_TRACE_HEADER)) {
        requestHeaders.push(SENTRY_TRACE_HEADER, sentryTrace);
      }
      if (traceparent && !requestHeaders.includes("traceparent")) {
        requestHeaders.push("traceparent", traceparent);
      }
      const existingBaggagePos = requestHeaders.findIndex((header) => header === SENTRY_BAGGAGE_HEADER);
      if (baggage && existingBaggagePos === -1) {
        requestHeaders.push(SENTRY_BAGGAGE_HEADER, baggage);
      } else if (baggage) {
        const existingBaggage = requestHeaders[existingBaggagePos + 1];
        const merged = mergeBaggageHeaders(existingBaggage, baggage);
        if (merged) {
          requestHeaders[existingBaggagePos + 1] = merged;
        }
      }
    } else {
      const requestHeaders = request.headers;
      if (sentryTrace && !requestHeaders.includes(`${SENTRY_TRACE_HEADER}:`)) {
        request.headers += `${SENTRY_TRACE_HEADER}: ${sentryTrace}\r
`;
      }
      if (traceparent && !requestHeaders.includes("traceparent:")) {
        request.headers += `traceparent: ${traceparent}\r
`;
      }
      const existingBaggage = request.headers.match(BAGGAGE_HEADER_REGEX)?.[1];
      if (baggage && !existingBaggage) {
        request.headers += `${SENTRY_BAGGAGE_HEADER}: ${baggage}\r
`;
      } else if (baggage) {
        const merged = mergeBaggageHeaders(existingBaggage, baggage);
        if (merged) {
          request.headers = request.headers.replace(BAGGAGE_HEADER_REGEX, `baggage: ${merged}\r
`);
        }
      }
    }
  }
  /**
   * This method is called when a response is received.
   */
  _onResponseHeaders({ request, response }) {
    const config = this.getConfig();
    const enabled = config.enabled !== false;
    if (!enabled) {
      return;
    }
    const _breadcrumbs = config.breadcrumbs;
    const breadCrumbsEnabled = typeof _breadcrumbs === "undefined" ? true : _breadcrumbs;
    const shouldIgnore = this._ignoreOutgoingRequestsMap.get(request);
    if (breadCrumbsEnabled && !shouldIgnore) {
      addRequestBreadcrumb(request, response);
    }
  }
  /** Subscribe to a diagnostics channel. */
  _subscribeToChannel(diagnosticChannel, onMessage) {
    const useNewSubscribe = NODE_MAJOR > 18 || NODE_MAJOR === 18 && NODE_MINOR >= 19;
    let unsubscribe2;
    if (useNewSubscribe) {
      diagch.subscribe?.(diagnosticChannel, onMessage);
      unsubscribe2 = () => diagch.unsubscribe?.(diagnosticChannel, onMessage);
    } else {
      const channel = diagch.channel(diagnosticChannel);
      channel.subscribe(onMessage);
      unsubscribe2 = () => channel.unsubscribe(onMessage);
    }
    this._channelSubs.push({
      name: diagnosticChannel,
      unsubscribe: unsubscribe2
    });
  }
  /**
   * Check if the given outgoing request should be ignored.
   */
  _shouldIgnoreOutgoingRequest(request) {
    if (isTracingSuppressed(context.active())) {
      return true;
    }
    const url = getAbsoluteUrl(request.origin, request.path);
    const ignoreOutgoingRequests = this.getConfig().ignoreOutgoingRequests;
    if (typeof ignoreOutgoingRequests !== "function" || !url) {
      return false;
    }
    return ignoreOutgoingRequests(url);
  }
}
function addRequestBreadcrumb(request, response) {
  const data = getBreadcrumbData(request);
  const statusCode = response.statusCode;
  const level = getBreadcrumbLogLevelFromHttpStatusCode(statusCode);
  addBreadcrumb(
    {
      category: "http",
      data: {
        status_code: statusCode,
        ...data
      },
      type: "http",
      level
    },
    {
      event: "response",
      request,
      response
    }
  );
}
function getBreadcrumbData(request) {
  try {
    const url = getAbsoluteUrl(request.origin, request.path);
    const parsedUrl = parseUrl(url);
    const data = {
      url: getSanitizedUrlString(parsedUrl),
      "http.method": request.method || "GET"
    };
    if (parsedUrl.search) {
      data["http.query"] = parsedUrl.search;
    }
    if (parsedUrl.hash) {
      data["http.fragment"] = parsedUrl.hash;
    }
    return data;
  } catch {
    return {};
  }
}
function getAbsoluteUrl(origin, path = "/") {
  try {
    const url = new URL(path, origin);
    return url.toString();
  } catch {
    const url = `${origin}`;
    if (url.endsWith("/") && path.startsWith("/")) {
      return `${url}${path.slice(1)}`;
    }
    if (!url.endsWith("/") && !path.startsWith("/")) {
      return `${url}/${path.slice(1)}`;
    }
    return `${url}${path}`;
  }
}
const INTEGRATION_NAME$a = "NodeFetch";
const instrumentSentryNodeFetch = generateInstrumentOnce(
  `${INTEGRATION_NAME$a}.sentry`,
  SentryNodeFetchInstrumentation,
  (options) => {
    return options;
  }
);
const _nativeNodeFetchIntegration = ((options = {}) => {
  return {
    name: "NodeFetch",
    setupOnce() {
      instrumentSentryNodeFetch(options);
    }
  };
});
const nativeNodeFetchIntegration = defineIntegration(_nativeNodeFetchIntegration);
const readFileAsync = promisify(readFile);
const readDirAsync = promisify(readdir);
const INTEGRATION_NAME$9 = "Context";
const _nodeContextIntegration = ((options = {}) => {
  let cachedContext;
  const _options = {
    app: true,
    os: true,
    device: true,
    culture: true,
    cloudResource: true,
    ...options
  };
  async function addContext(event) {
    if (cachedContext === void 0) {
      cachedContext = _getContexts();
    }
    const updatedContext = _updateContext(await cachedContext);
    event.contexts = {
      ...event.contexts,
      app: { ...updatedContext.app, ...event.contexts?.app },
      os: { ...updatedContext.os, ...event.contexts?.os },
      device: { ...updatedContext.device, ...event.contexts?.device },
      culture: { ...updatedContext.culture, ...event.contexts?.culture },
      cloud_resource: { ...updatedContext.cloud_resource, ...event.contexts?.cloud_resource }
    };
    return event;
  }
  async function _getContexts() {
    const contexts = {};
    if (_options.os) {
      contexts.os = await getOsContext();
    }
    if (_options.app) {
      contexts.app = getAppContext();
    }
    if (_options.device) {
      contexts.device = getDeviceContext(_options.device);
    }
    if (_options.culture) {
      const culture = getCultureContext();
      if (culture) {
        contexts.culture = culture;
      }
    }
    if (_options.cloudResource) {
      contexts.cloud_resource = getCloudResourceContext();
    }
    return contexts;
  }
  return {
    name: INTEGRATION_NAME$9,
    processEvent(event) {
      return addContext(event);
    }
  };
});
const nodeContextIntegration = defineIntegration(_nodeContextIntegration);
function _updateContext(contexts) {
  if (contexts.app?.app_memory) {
    contexts.app.app_memory = process.memoryUsage().rss;
  }
  if (contexts.app?.free_memory && typeof process.availableMemory === "function") {
    const freeMemory = process.availableMemory?.();
    if (freeMemory != null) {
      contexts.app.free_memory = freeMemory;
    }
  }
  if (contexts.device?.free_memory) {
    contexts.device.free_memory = os.freemem();
  }
  return contexts;
}
async function getOsContext() {
  const platformId = os.platform();
  switch (platformId) {
    case "darwin":
      return getDarwinInfo();
    case "linux":
      return getLinuxInfo();
    default:
      return {
        name: PLATFORM_NAMES[platformId] || platformId,
        version: os.release()
      };
  }
}
function getCultureContext() {
  try {
    if (typeof process.versions.icu !== "string") {
      return;
    }
    const january = /* @__PURE__ */ new Date(9e8);
    const spanish = new Intl.DateTimeFormat("es", { month: "long" });
    if (spanish.format(january) === "enero") {
      const options = Intl.DateTimeFormat().resolvedOptions();
      return {
        locale: options.locale,
        timezone: options.timeZone
      };
    }
  } catch {
  }
  return;
}
function getAppContext() {
  const app_memory = process.memoryUsage().rss;
  const app_start_time = new Date(Date.now() - process.uptime() * 1e3).toISOString();
  const appContext = { app_start_time, app_memory };
  if (typeof process.availableMemory === "function") {
    const freeMemory = process.availableMemory?.();
    if (freeMemory != null) {
      appContext.free_memory = freeMemory;
    }
  }
  return appContext;
}
function getDeviceContext(deviceOpt) {
  const device = {};
  let uptime;
  try {
    uptime = os.uptime();
  } catch {
  }
  if (typeof uptime === "number") {
    device.boot_time = new Date(Date.now() - uptime * 1e3).toISOString();
  }
  device.arch = os.arch();
  if (deviceOpt === true || deviceOpt.memory) {
    device.memory_size = os.totalmem();
    device.free_memory = os.freemem();
  }
  if (deviceOpt === true || deviceOpt.cpu) {
    const cpuInfo = os.cpus();
    const firstCpu = cpuInfo?.[0];
    if (firstCpu) {
      device.processor_count = cpuInfo.length;
      device.cpu_description = firstCpu.model;
      device.processor_frequency = firstCpu.speed;
    }
  }
  return device;
}
const PLATFORM_NAMES = {
  aix: "IBM AIX",
  freebsd: "FreeBSD",
  openbsd: "OpenBSD",
  sunos: "SunOS",
  win32: "Windows",
  ohos: "OpenHarmony",
  android: "Android"
};
const LINUX_DISTROS = [
  { name: "fedora-release", distros: ["Fedora"] },
  { name: "redhat-release", distros: ["Red Hat Linux", "Centos"] },
  { name: "redhat_version", distros: ["Red Hat Linux"] },
  { name: "SuSE-release", distros: ["SUSE Linux"] },
  { name: "lsb-release", distros: ["Ubuntu Linux", "Arch Linux"] },
  { name: "debian_version", distros: ["Debian"] },
  { name: "debian_release", distros: ["Debian"] },
  { name: "arch-release", distros: ["Arch Linux"] },
  { name: "gentoo-release", distros: ["Gentoo Linux"] },
  { name: "novell-release", distros: ["SUSE Linux"] },
  { name: "alpine-release", distros: ["Alpine Linux"] }
];
const LINUX_VERSIONS = {
  alpine: (content) => content,
  arch: (content) => matchFirst(/distrib_release=(.*)/, content),
  centos: (content) => matchFirst(/release ([^ ]+)/, content),
  debian: (content) => content,
  fedora: (content) => matchFirst(/release (..)/, content),
  mint: (content) => matchFirst(/distrib_release=(.*)/, content),
  red: (content) => matchFirst(/release ([^ ]+)/, content),
  suse: (content) => matchFirst(/VERSION = (.*)\n/, content),
  ubuntu: (content) => matchFirst(/distrib_release=(.*)/, content)
};
function matchFirst(regex, text) {
  const match = regex.exec(text);
  return match ? match[1] : void 0;
}
async function getDarwinInfo() {
  const darwinInfo = {
    kernel_version: os.release(),
    name: "Mac OS X",
    version: `10.${Number(os.release().split(".")[0]) - 4}`
  };
  try {
    const output = await new Promise((resolve, reject) => {
      execFile("/usr/bin/sw_vers", (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
    darwinInfo.name = matchFirst(/^ProductName:\s+(.*)$/m, output);
    darwinInfo.version = matchFirst(/^ProductVersion:\s+(.*)$/m, output);
    darwinInfo.build = matchFirst(/^BuildVersion:\s+(.*)$/m, output);
  } catch {
  }
  return darwinInfo;
}
function getLinuxDistroId(name) {
  return name.split(" ")[0].toLowerCase();
}
async function getLinuxInfo() {
  const linuxInfo = {
    kernel_version: os.release(),
    name: "Linux"
  };
  try {
    const etcFiles = await readDirAsync("/etc");
    const distroFile = LINUX_DISTROS.find((file) => etcFiles.includes(file.name));
    if (!distroFile) {
      return linuxInfo;
    }
    const distroPath = join("/etc", distroFile.name);
    const contents = (await readFileAsync(distroPath, { encoding: "utf-8" })).toLowerCase();
    const { distros } = distroFile;
    linuxInfo.name = distros.find((d) => contents.indexOf(getLinuxDistroId(d)) >= 0) || distros[0];
    const id = getLinuxDistroId(linuxInfo.name);
    linuxInfo.version = LINUX_VERSIONS[id]?.(contents);
  } catch {
  }
  return linuxInfo;
}
function getCloudResourceContext() {
  if (process.env.VERCEL) {
    return {
      "cloud.provider": "vercel",
      "cloud.region": process.env.VERCEL_REGION
    };
  } else if (process.env.AWS_REGION) {
    return {
      "cloud.provider": "aws",
      "cloud.region": process.env.AWS_REGION,
      "cloud.platform": process.env.AWS_EXECUTION_ENV
    };
  } else if (process.env.GCP_PROJECT) {
    return {
      "cloud.provider": "gcp"
    };
  } else if (process.env.ALIYUN_REGION_ID) {
    return {
      "cloud.provider": "alibaba_cloud",
      "cloud.region": process.env.ALIYUN_REGION_ID
    };
  } else if (process.env.WEBSITE_SITE_NAME && process.env.REGION_NAME) {
    return {
      "cloud.provider": "azure",
      "cloud.region": process.env.REGION_NAME
    };
  } else if (process.env.IBM_CLOUD_REGION) {
    return {
      "cloud.provider": "ibm_cloud",
      "cloud.region": process.env.IBM_CLOUD_REGION
    };
  } else if (process.env.TENCENTCLOUD_REGION) {
    return {
      "cloud.provider": "tencent_cloud",
      "cloud.region": process.env.TENCENTCLOUD_REGION,
      "cloud.account.id": process.env.TENCENTCLOUD_APPID,
      "cloud.availability_zone": process.env.TENCENTCLOUD_ZONE
    };
  } else if (process.env.NETLIFY) {
    return {
      "cloud.provider": "netlify"
    };
  } else if (process.env.FLY_REGION) {
    return {
      "cloud.provider": "fly.io",
      "cloud.region": process.env.FLY_REGION
    };
  } else if (process.env.DYNO) {
    return {
      "cloud.provider": "heroku"
    };
  } else {
    return void 0;
  }
}
const LRU_FILE_CONTENTS_CACHE = new LRUMap(10);
const LRU_FILE_CONTENTS_FS_READ_FAILED = new LRUMap(20);
const DEFAULT_LINES_OF_CONTEXT = 7;
const INTEGRATION_NAME$8 = "ContextLines";
const MAX_CONTEXTLINES_COLNO = 1e3;
const MAX_CONTEXTLINES_LINENO = 1e4;
function emplace(map, key, contents) {
  const value = map.get(key);
  if (value === void 0) {
    map.set(key, contents);
    return contents;
  }
  return value;
}
function shouldSkipContextLinesForFile(path) {
  if (path.startsWith("node:")) return true;
  if (path.endsWith(".min.js")) return true;
  if (path.endsWith(".min.cjs")) return true;
  if (path.endsWith(".min.mjs")) return true;
  if (path.startsWith("data:")) return true;
  return false;
}
function shouldSkipContextLinesForFrame(frame) {
  if (frame.lineno !== void 0 && frame.lineno > MAX_CONTEXTLINES_LINENO) return true;
  if (frame.colno !== void 0 && frame.colno > MAX_CONTEXTLINES_COLNO) return true;
  return false;
}
function rangeExistsInContentCache(file, range) {
  const contents = LRU_FILE_CONTENTS_CACHE.get(file);
  if (contents === void 0) return false;
  for (let i = range[0]; i <= range[1]; i++) {
    if (contents[i] === void 0) {
      return false;
    }
  }
  return true;
}
function makeLineReaderRanges(lines, linecontext) {
  if (!lines.length) {
    return [];
  }
  let i = 0;
  const line = lines[0];
  if (typeof line !== "number") {
    return [];
  }
  let current = makeContextRange(line, linecontext);
  const out = [];
  while (true) {
    if (i === lines.length - 1) {
      out.push(current);
      break;
    }
    const next = lines[i + 1];
    if (typeof next !== "number") {
      break;
    }
    if (next <= current[1]) {
      current[1] = next + linecontext;
    } else {
      out.push(current);
      current = makeContextRange(next, linecontext);
    }
    i++;
  }
  return out;
}
function getContextLinesFromFile(path, ranges, output) {
  return new Promise((resolve, _reject) => {
    const stream = createReadStream(path);
    const lineReaded = createInterface({
      input: stream
    });
    function destroyStreamAndResolve() {
      stream.destroy();
      resolve();
    }
    let lineNumber = 0;
    let currentRangeIndex = 0;
    const range = ranges[currentRangeIndex];
    if (range === void 0) {
      destroyStreamAndResolve();
      return;
    }
    let rangeStart = range[0];
    let rangeEnd = range[1];
    function onStreamError(e) {
      LRU_FILE_CONTENTS_FS_READ_FAILED.set(path, 1);
      DEBUG_BUILD && debug.error(`Failed to read file: ${path}. Error: ${e}`);
      lineReaded.close();
      lineReaded.removeAllListeners();
      destroyStreamAndResolve();
    }
    stream.on("error", onStreamError);
    lineReaded.on("error", onStreamError);
    lineReaded.on("close", destroyStreamAndResolve);
    lineReaded.on("line", (line) => {
      lineNumber++;
      if (lineNumber < rangeStart) return;
      output[lineNumber] = snipLine(line, 0);
      if (lineNumber >= rangeEnd) {
        if (currentRangeIndex === ranges.length - 1) {
          lineReaded.close();
          lineReaded.removeAllListeners();
          return;
        }
        currentRangeIndex++;
        const range2 = ranges[currentRangeIndex];
        if (range2 === void 0) {
          lineReaded.close();
          lineReaded.removeAllListeners();
          return;
        }
        rangeStart = range2[0];
        rangeEnd = range2[1];
      }
    });
  });
}
async function addSourceContext(event, contextLines) {
  const filesToLines = {};
  if (contextLines > 0 && event.exception?.values) {
    for (const exception of event.exception.values) {
      if (!exception.stacktrace?.frames?.length) {
        continue;
      }
      for (let i = exception.stacktrace.frames.length - 1; i >= 0; i--) {
        const frame = exception.stacktrace.frames[i];
        const filename = frame?.filename;
        if (!frame || typeof filename !== "string" || typeof frame.lineno !== "number" || shouldSkipContextLinesForFile(filename) || shouldSkipContextLinesForFrame(frame)) {
          continue;
        }
        const filesToLinesOutput = filesToLines[filename];
        if (!filesToLinesOutput) filesToLines[filename] = [];
        filesToLines[filename].push(frame.lineno);
      }
    }
  }
  const files = Object.keys(filesToLines);
  if (files.length == 0) {
    return event;
  }
  const readlinePromises = [];
  for (const file of files) {
    if (LRU_FILE_CONTENTS_FS_READ_FAILED.get(file)) {
      continue;
    }
    const filesToLineRanges = filesToLines[file];
    if (!filesToLineRanges) {
      continue;
    }
    filesToLineRanges.sort((a, b) => a - b);
    const ranges = makeLineReaderRanges(filesToLineRanges, contextLines);
    if (ranges.every((r) => rangeExistsInContentCache(file, r))) {
      continue;
    }
    const cache = emplace(LRU_FILE_CONTENTS_CACHE, file, {});
    readlinePromises.push(getContextLinesFromFile(file, ranges, cache));
  }
  await Promise.all(readlinePromises).catch(() => {
    DEBUG_BUILD && debug.log("Failed to read one or more source files and resolve context lines");
  });
  if (contextLines > 0 && event.exception?.values) {
    for (const exception of event.exception.values) {
      if (exception.stacktrace?.frames && exception.stacktrace.frames.length > 0) {
        addSourceContextToFrames(exception.stacktrace.frames, contextLines, LRU_FILE_CONTENTS_CACHE);
      }
    }
  }
  return event;
}
function addSourceContextToFrames(frames, contextLines, cache) {
  for (const frame of frames) {
    if (frame.filename && frame.context_line === void 0 && typeof frame.lineno === "number") {
      const contents = cache.get(frame.filename);
      if (contents === void 0) {
        continue;
      }
      addContextToFrame(frame.lineno, frame, contextLines, contents);
    }
  }
}
function clearLineContext(frame) {
  delete frame.pre_context;
  delete frame.context_line;
  delete frame.post_context;
}
function addContextToFrame(lineno, frame, contextLines, contents) {
  if (frame.lineno === void 0 || contents === void 0) {
    DEBUG_BUILD && debug.error("Cannot resolve context for frame with no lineno or file contents");
    return;
  }
  frame.pre_context = [];
  for (let i = makeRangeStart(lineno, contextLines); i < lineno; i++) {
    const line = contents[i];
    if (line === void 0) {
      clearLineContext(frame);
      DEBUG_BUILD && debug.error(`Could not find line ${i} in file ${frame.filename}`);
      return;
    }
    frame.pre_context.push(line);
  }
  if (contents[lineno] === void 0) {
    clearLineContext(frame);
    DEBUG_BUILD && debug.error(`Could not find line ${lineno} in file ${frame.filename}`);
    return;
  }
  frame.context_line = contents[lineno];
  const end = makeRangeEnd(lineno, contextLines);
  frame.post_context = [];
  for (let i = lineno + 1; i <= end; i++) {
    const line = contents[i];
    if (line === void 0) {
      break;
    }
    frame.post_context.push(line);
  }
}
function makeRangeStart(line, linecontext) {
  return Math.max(1, line - linecontext);
}
function makeRangeEnd(line, linecontext) {
  return line + linecontext;
}
function makeContextRange(line, linecontext) {
  return [makeRangeStart(line, linecontext), makeRangeEnd(line, linecontext)];
}
const _contextLinesIntegration = ((options = {}) => {
  const contextLines = options.frameContextLines !== void 0 ? options.frameContextLines : DEFAULT_LINES_OF_CONTEXT;
  return {
    name: INTEGRATION_NAME$8,
    processEvent(event) {
      return addSourceContext(event, contextLines);
    }
  };
});
const contextLinesIntegration = defineIntegration(_contextLinesIntegration);
let cachedDebuggerEnabled;
async function isDebuggerEnabled() {
  if (cachedDebuggerEnabled === void 0) {
    try {
      const inspector = await import("node:inspector");
      cachedDebuggerEnabled = !!inspector.url();
    } catch {
      cachedDebuggerEnabled = false;
    }
  }
  return cachedDebuggerEnabled;
}
const LOCAL_VARIABLES_KEY = "__SENTRY_ERROR_LOCAL_VARIABLES__";
function createRateLimiter(maxPerSecond, enable, disable) {
  let count = 0;
  let retrySeconds = 5;
  let disabledTimeout = 0;
  setInterval(() => {
    if (disabledTimeout === 0) {
      if (count > maxPerSecond) {
        retrySeconds *= 2;
        disable(retrySeconds);
        if (retrySeconds > 86400) {
          retrySeconds = 86400;
        }
        disabledTimeout = retrySeconds;
      }
    } else {
      disabledTimeout -= 1;
      if (disabledTimeout === 0) {
        enable();
      }
    }
    count = 0;
  }, 1e3).unref();
  return () => {
    count += 1;
  };
}
function isAnonymous(name) {
  return name !== void 0 && (name.length === 0 || name === "?" || name === "<anonymous>");
}
function functionNamesMatch(a, b) {
  return a === b || `Object.${a}` === b || a === `Object.${b}` || isAnonymous(a) && isAnonymous(b);
}
const base64WorkerScript = "LyohIEBzZW50cnkvbm9kZS1jb3JlIDEwLjMzLjAgKGZiOWRkMWUpIHwgaHR0cHM6Ly9naXRodWIuY29tL2dldHNlbnRyeS9zZW50cnktamF2YXNjcmlwdCAqLwppbXBvcnR7U2Vzc2lvbiBhcyBlfWZyb20ibm9kZTppbnNwZWN0b3IvcHJvbWlzZXMiO2ltcG9ydHt3b3JrZXJEYXRhIGFzIHR9ZnJvbSJub2RlOndvcmtlcl90aHJlYWRzIjtjb25zdCBuPWdsb2JhbFRoaXMsaT17fTtjb25zdCBvPSJfX1NFTlRSWV9FUlJPUl9MT0NBTF9WQVJJQUJMRVNfXyI7Y29uc3QgYT10O2Z1bmN0aW9uIHMoLi4uZSl7YS5kZWJ1ZyYmZnVuY3Rpb24oZSl7aWYoISgiY29uc29sZSJpbiBuKSlyZXR1cm4gZSgpO2NvbnN0IHQ9bi5jb25zb2xlLG89e30sYT1PYmplY3Qua2V5cyhpKTthLmZvckVhY2goZT0+e2NvbnN0IG49aVtlXTtvW2VdPXRbZV0sdFtlXT1ufSk7dHJ5e3JldHVybiBlKCl9ZmluYWxseXthLmZvckVhY2goZT0+e3RbZV09b1tlXX0pfX0oKCk9PmNvbnNvbGUubG9nKCJbTG9jYWxWYXJpYWJsZXMgV29ya2VyXSIsLi4uZSkpfWFzeW5jIGZ1bmN0aW9uIGMoZSx0LG4saSl7Y29uc3Qgbz1hd2FpdCBlLnBvc3QoIlJ1bnRpbWUuZ2V0UHJvcGVydGllcyIse29iamVjdElkOnQsb3duUHJvcGVydGllczohMH0pO2lbbl09by5yZXN1bHQuZmlsdGVyKGU9PiJsZW5ndGgiIT09ZS5uYW1lJiYhaXNOYU4ocGFyc2VJbnQoZS5uYW1lLDEwKSkpLnNvcnQoKGUsdCk9PnBhcnNlSW50KGUubmFtZSwxMCktcGFyc2VJbnQodC5uYW1lLDEwKSkubWFwKGU9PmUudmFsdWU/LnZhbHVlKX1hc3luYyBmdW5jdGlvbiByKGUsdCxuLGkpe2NvbnN0IG89YXdhaXQgZS5wb3N0KCJSdW50aW1lLmdldFByb3BlcnRpZXMiLHtvYmplY3RJZDp0LG93blByb3BlcnRpZXM6ITB9KTtpW25dPW8ucmVzdWx0Lm1hcChlPT5bZS5uYW1lLGUudmFsdWU/LnZhbHVlXSkucmVkdWNlKChlLFt0LG5dKT0+KGVbdF09bixlKSx7fSl9ZnVuY3Rpb24gdShlLHQpe2UudmFsdWUmJigidmFsdWUiaW4gZS52YWx1ZT92b2lkIDA9PT1lLnZhbHVlLnZhbHVlfHxudWxsPT09ZS52YWx1ZS52YWx1ZT90W2UubmFtZV09YDwke2UudmFsdWUudmFsdWV9PmA6dFtlLm5hbWVdPWUudmFsdWUudmFsdWU6ImRlc2NyaXB0aW9uImluIGUudmFsdWUmJiJmdW5jdGlvbiIhPT1lLnZhbHVlLnR5cGU/dFtlLm5hbWVdPWA8JHtlLnZhbHVlLmRlc2NyaXB0aW9ufT5gOiJ1bmRlZmluZWQiPT09ZS52YWx1ZS50eXBlJiYodFtlLm5hbWVdPSI8dW5kZWZpbmVkPiIpKX1hc3luYyBmdW5jdGlvbiBsKGUsdCl7Y29uc3Qgbj1hd2FpdCBlLnBvc3QoIlJ1bnRpbWUuZ2V0UHJvcGVydGllcyIse29iamVjdElkOnQsb3duUHJvcGVydGllczohMH0pLGk9e307Zm9yKGNvbnN0IHQgb2Ygbi5yZXN1bHQpaWYodC52YWx1ZT8ub2JqZWN0SWQmJiJBcnJheSI9PT10LnZhbHVlLmNsYXNzTmFtZSl7Y29uc3Qgbj10LnZhbHVlLm9iamVjdElkO2F3YWl0IGMoZSxuLHQubmFtZSxpKX1lbHNlIGlmKHQudmFsdWU/Lm9iamVjdElkJiYiT2JqZWN0Ij09PXQudmFsdWUuY2xhc3NOYW1lKXtjb25zdCBuPXQudmFsdWUub2JqZWN0SWQ7YXdhaXQgcihlLG4sdC5uYW1lLGkpfWVsc2UgdC52YWx1ZSYmdSh0LGkpO3JldHVybiBpfWxldCBmOyhhc3luYyBmdW5jdGlvbigpe2NvbnN0IHQ9bmV3IGU7dC5jb25uZWN0VG9NYWluVGhyZWFkKCkscygiQ29ubmVjdGVkIHRvIG1haW4gdGhyZWFkIik7bGV0IG49ITE7dC5vbigiRGVidWdnZXIucmVzdW1lZCIsKCk9PntuPSExfSksdC5vbigiRGVidWdnZXIucGF1c2VkIixlPT57bj0hMCxhc3luYyBmdW5jdGlvbihlLHtyZWFzb246dCxkYXRhOntvYmplY3RJZDpufSxjYWxsRnJhbWVzOml9KXtpZigiZXhjZXB0aW9uIiE9PXQmJiJwcm9taXNlUmVqZWN0aW9uIiE9PXQpcmV0dXJuO2lmKGY/LigpLG51bGw9PW4pcmV0dXJuO2NvbnN0IGE9W107Zm9yKGxldCB0PTA7dDxpLmxlbmd0aDt0Kyspe2NvbnN0e3Njb3BlQ2hhaW46bixmdW5jdGlvbk5hbWU6byx0aGlzOnN9PWlbdF0sYz1uLmZpbmQoZT0+ImxvY2FsIj09PWUudHlwZSkscj0iZ2xvYmFsIiE9PXMuY2xhc3NOYW1lJiZzLmNsYXNzTmFtZT9gJHtzLmNsYXNzTmFtZX0uJHtvfWA6bztpZih2b2lkIDA9PT1jPy5vYmplY3Qub2JqZWN0SWQpYVt0XT17ZnVuY3Rpb246cn07ZWxzZXtjb25zdCBuPWF3YWl0IGwoZSxjLm9iamVjdC5vYmplY3RJZCk7YVt0XT17ZnVuY3Rpb246cix2YXJzOm59fX1hd2FpdCBlLnBvc3QoIlJ1bnRpbWUuY2FsbEZ1bmN0aW9uT24iLHtmdW5jdGlvbkRlY2xhcmF0aW9uOmBmdW5jdGlvbigpIHsgdGhpcy4ke299ID0gdGhpcy4ke299IHx8ICR7SlNPTi5zdHJpbmdpZnkoYSl9OyB9YCxzaWxlbnQ6ITAsb2JqZWN0SWQ6bn0pLGF3YWl0IGUucG9zdCgiUnVudGltZS5yZWxlYXNlT2JqZWN0Iix7b2JqZWN0SWQ6bn0pfSh0LGUucGFyYW1zKS50aGVuKGFzeW5jKCk9PntuJiZhd2FpdCB0LnBvc3QoIkRlYnVnZ2VyLnJlc3VtZSIpfSxhc3luYyBlPT57biYmYXdhaXQgdC5wb3N0KCJEZWJ1Z2dlci5yZXN1bWUiKX0pfSksYXdhaXQgdC5wb3N0KCJEZWJ1Z2dlci5lbmFibGUiKTtjb25zdCBpPSExIT09YS5jYXB0dXJlQWxsRXhjZXB0aW9ucztpZihhd2FpdCB0LnBvc3QoIkRlYnVnZ2VyLnNldFBhdXNlT25FeGNlcHRpb25zIix7c3RhdGU6aT8iYWxsIjoidW5jYXVnaHQifSksaSl7Y29uc3QgZT1hLm1heEV4Y2VwdGlvbnNQZXJTZWNvbmR8fDUwO2Y9ZnVuY3Rpb24oZSx0LG4pe2xldCBpPTAsbz01LGE9MDtyZXR1cm4gc2V0SW50ZXJ2YWwoKCk9PnswPT09YT9pPmUmJihvKj0yLG4obyksbz44NjQwMCYmKG89ODY0MDApLGE9byk6KGEtPTEsMD09PWEmJnQoKSksaT0wfSwxZTMpLnVucmVmKCksKCk9PntpKz0xfX0oZSxhc3luYygpPT57cygiUmF0ZS1saW1pdCBsaWZ0ZWQuIiksYXdhaXQgdC5wb3N0KCJEZWJ1Z2dlci5zZXRQYXVzZU9uRXhjZXB0aW9ucyIse3N0YXRlOiJhbGwifSl9LGFzeW5jIGU9PntzKGBSYXRlLWxpbWl0IGV4Y2VlZGVkLiBEaXNhYmxpbmcgY2FwdHVyaW5nIG9mIGNhdWdodCBleGNlcHRpb25zIGZvciAke2V9IHNlY29uZHMuYCksYXdhaXQgdC5wb3N0KCJEZWJ1Z2dlci5zZXRQYXVzZU9uRXhjZXB0aW9ucyIse3N0YXRlOiJ1bmNhdWdodCJ9KX0pfX0pKCkuY2F0Y2goZT0+e3MoIkZhaWxlZCB0byBzdGFydCBkZWJ1Z2dlciIsZSl9KSxzZXRJbnRlcnZhbCgoKT0+e30sMWU0KTs=";
function log(...args) {
  debug.log("[LocalVariables]", ...args);
}
const localVariablesAsyncIntegration = defineIntegration(((integrationOptions = {}) => {
  function addLocalVariablesToException(exception, localVariables) {
    const frames = (exception.stacktrace?.frames || []).filter((frame) => frame.function !== "new Promise");
    for (let i = 0; i < frames.length; i++) {
      const frameIndex = frames.length - i - 1;
      const frameLocalVariables = localVariables[i];
      const frame = frames[frameIndex];
      if (!frame || !frameLocalVariables) {
        break;
      }
      if (
        // We need to have vars to add
        frameLocalVariables.vars === void 0 || // Only skip out-of-app frames if includeOutOfAppFrames is not true
        frame.in_app === false && integrationOptions.includeOutOfAppFrames !== true || // The function names need to match
        !functionNamesMatch(frame.function, frameLocalVariables.function)
      ) {
        continue;
      }
      frame.vars = frameLocalVariables.vars;
    }
  }
  function addLocalVariablesToEvent(event, hint) {
    if (hint.originalException && typeof hint.originalException === "object" && LOCAL_VARIABLES_KEY in hint.originalException && Array.isArray(hint.originalException[LOCAL_VARIABLES_KEY])) {
      for (const exception of event.exception?.values || []) {
        addLocalVariablesToException(exception, hint.originalException[LOCAL_VARIABLES_KEY]);
      }
      hint.originalException[LOCAL_VARIABLES_KEY] = void 0;
    }
    return event;
  }
  async function startInspector() {
    const inspector = await import("node:inspector");
    if (!inspector.url()) {
      inspector.open(0);
    }
  }
  function startWorker(options) {
    const worker = new Worker(new URL(`data:application/javascript;base64,${base64WorkerScript}`), {
      workerData: options,
      // We don't want any Node args to be passed to the worker
      execArgv: [],
      env: { ...process.env, NODE_OPTIONS: void 0 }
    });
    process.on("exit", () => {
      worker.terminate();
    });
    worker.once("error", (err) => {
      log("Worker error", err);
    });
    worker.once("exit", (code) => {
      log("Worker exit", code);
    });
    worker.unref();
  }
  return {
    name: "LocalVariablesAsync",
    async setup(client) {
      const clientOptions = client.getOptions();
      if (!clientOptions.includeLocalVariables) {
        return;
      }
      if (await isDebuggerEnabled()) {
        debug.warn("Local variables capture has been disabled because the debugger was already enabled");
        return;
      }
      const options = {
        ...integrationOptions,
        debug: debug.isEnabled()
      };
      startInspector().then(
        () => {
          try {
            startWorker(options);
          } catch (e) {
            debug.error("Failed to start worker", e);
          }
        },
        (e) => {
          debug.error("Failed to start inspector", e);
        }
      );
    },
    processEvent(event, hint) {
      return addLocalVariablesToEvent(event, hint);
    }
  };
}));
function hashFrames(frames) {
  if (frames === void 0) {
    return;
  }
  return frames.slice(-10).reduce((acc, frame) => `${acc},${frame.function},${frame.lineno},${frame.colno}`, "");
}
function hashFromStack(stackParser, stack) {
  if (stack === void 0) {
    return void 0;
  }
  return hashFrames(stackParser(stack, 1));
}
function createCallbackList(complete) {
  let callbacks = [];
  let completedCalled = false;
  function checkedComplete(result) {
    callbacks = [];
    if (completedCalled) {
      return;
    }
    completedCalled = true;
    complete(result);
  }
  callbacks.push(checkedComplete);
  function add(fn) {
    callbacks.push(fn);
  }
  function next(result) {
    const popped = callbacks.pop() || checkedComplete;
    try {
      popped(result);
    } catch {
      checkedComplete(result);
    }
  }
  return { add, next };
}
class AsyncSession {
  /** Throws if inspector API is not available */
  constructor(_session) {
    this._session = _session;
  }
  static async create(orDefault) {
    if (orDefault) {
      return orDefault;
    }
    const inspector = await import("node:inspector");
    return new AsyncSession(new inspector.Session());
  }
  /** @inheritdoc */
  configureAndConnect(onPause, captureAll) {
    this._session.connect();
    this._session.on("Debugger.paused", (event) => {
      onPause(event, () => {
        this._session.post("Debugger.resume");
      });
    });
    this._session.post("Debugger.enable");
    this._session.post("Debugger.setPauseOnExceptions", { state: captureAll ? "all" : "uncaught" });
  }
  setPauseOnExceptions(captureAll) {
    this._session.post("Debugger.setPauseOnExceptions", { state: captureAll ? "all" : "uncaught" });
  }
  /** @inheritdoc */
  getLocalVariables(objectId, complete) {
    this._getProperties(objectId, (props) => {
      const { add, next } = createCallbackList(complete);
      for (const prop of props) {
        if (prop.value?.objectId && prop.value.className === "Array") {
          const id = prop.value.objectId;
          add((vars) => this._unrollArray(id, prop.name, vars, next));
        } else if (prop.value?.objectId && prop.value.className === "Object") {
          const id = prop.value.objectId;
          add((vars) => this._unrollObject(id, prop.name, vars, next));
        } else if (prop.value) {
          add((vars) => this._unrollOther(prop, vars, next));
        }
      }
      next({});
    });
  }
  /**
   * Gets all the PropertyDescriptors of an object
   */
  _getProperties(objectId, next) {
    this._session.post(
      "Runtime.getProperties",
      {
        objectId,
        ownProperties: true
      },
      (err, params) => {
        if (err) {
          next([]);
        } else {
          next(params.result);
        }
      }
    );
  }
  /**
   * Unrolls an array property
   */
  _unrollArray(objectId, name, vars, next) {
    this._getProperties(objectId, (props) => {
      vars[name] = props.filter((v) => v.name !== "length" && !isNaN(parseInt(v.name, 10))).sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10)).map((v) => v.value?.value);
      next(vars);
    });
  }
  /**
   * Unrolls an object property
   */
  _unrollObject(objectId, name, vars, next) {
    this._getProperties(objectId, (props) => {
      vars[name] = props.map((v) => [v.name, v.value?.value]).reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
      next(vars);
    });
  }
  /**
   * Unrolls other properties
   */
  _unrollOther(prop, vars, next) {
    if (prop.value) {
      if ("value" in prop.value) {
        if (prop.value.value === void 0 || prop.value.value === null) {
          vars[prop.name] = `<${prop.value.value}>`;
        } else {
          vars[prop.name] = prop.value.value;
        }
      } else if ("description" in prop.value && prop.value.type !== "function") {
        vars[prop.name] = `<${prop.value.description}>`;
      } else if (prop.value.type === "undefined") {
        vars[prop.name] = "<undefined>";
      }
    }
    next(vars);
  }
}
const INTEGRATION_NAME$7 = "LocalVariables";
const _localVariablesSyncIntegration = ((options = {}, sessionOverride) => {
  const cachedFrames = new LRUMap(20);
  let rateLimiter;
  let shouldProcessEvent = false;
  function addLocalVariablesToException(exception) {
    const hash = hashFrames(exception.stacktrace?.frames);
    if (hash === void 0) {
      return;
    }
    const cachedFrame = cachedFrames.remove(hash);
    if (cachedFrame === void 0) {
      return;
    }
    const frames = (exception.stacktrace?.frames || []).filter((frame) => frame.function !== "new Promise");
    for (let i = 0; i < frames.length; i++) {
      const frameIndex = frames.length - i - 1;
      const cachedFrameVariable = cachedFrame[i];
      const frameVariable = frames[frameIndex];
      if (!frameVariable || !cachedFrameVariable) {
        break;
      }
      if (
        // We need to have vars to add
        cachedFrameVariable.vars === void 0 || // Only skip out-of-app frames if includeOutOfAppFrames is not true
        frameVariable.in_app === false && options.includeOutOfAppFrames !== true || // The function names need to match
        !functionNamesMatch(frameVariable.function, cachedFrameVariable.function)
      ) {
        continue;
      }
      frameVariable.vars = cachedFrameVariable.vars;
    }
  }
  function addLocalVariablesToEvent(event) {
    for (const exception of event.exception?.values || []) {
      addLocalVariablesToException(exception);
    }
    return event;
  }
  let setupPromise;
  async function setup() {
    const client = getClient();
    const clientOptions = client?.getOptions();
    if (!clientOptions?.includeLocalVariables) {
      return;
    }
    const unsupportedNodeVersion = NODE_MAJOR < 18;
    if (unsupportedNodeVersion) {
      debug.log("The `LocalVariables` integration is only supported on Node >= v18.");
      return;
    }
    if (await isDebuggerEnabled()) {
      debug.warn("Local variables capture has been disabled because the debugger was already enabled");
      return;
    }
    try {
      const session = await AsyncSession.create(sessionOverride);
      const handlePaused = (stackParser, { params: { reason, data, callFrames } }, complete) => {
        if (reason !== "exception" && reason !== "promiseRejection") {
          complete();
          return;
        }
        rateLimiter?.();
        const exceptionHash = hashFromStack(stackParser, data.description);
        if (exceptionHash == void 0) {
          complete();
          return;
        }
        const { add, next } = createCallbackList((frames) => {
          cachedFrames.set(exceptionHash, frames);
          complete();
        });
        for (let i = 0; i < Math.min(callFrames.length, 5); i++) {
          const { scopeChain, functionName, this: obj } = callFrames[i];
          const localScope = scopeChain.find((scope) => scope.type === "local");
          const fn = obj.className === "global" || !obj.className ? functionName : `${obj.className}.${functionName}`;
          if (localScope?.object.objectId === void 0) {
            add((frames) => {
              frames[i] = { function: fn };
              next(frames);
            });
          } else {
            const id = localScope.object.objectId;
            add(
              (frames) => session.getLocalVariables(id, (vars) => {
                frames[i] = { function: fn, vars };
                next(frames);
              })
            );
          }
        }
        next([]);
      };
      const captureAll = options.captureAllExceptions !== false;
      session.configureAndConnect(
        (ev, complete) => handlePaused(clientOptions.stackParser, ev, complete),
        captureAll
      );
      if (captureAll) {
        const max = options.maxExceptionsPerSecond || 50;
        rateLimiter = createRateLimiter(
          max,
          () => {
            debug.log("Local variables rate-limit lifted.");
            session.setPauseOnExceptions(true);
          },
          (seconds) => {
            debug.log(
              `Local variables rate-limit exceeded. Disabling capturing of caught exceptions for ${seconds} seconds.`
            );
            session.setPauseOnExceptions(false);
          }
        );
      }
      shouldProcessEvent = true;
    } catch (error) {
      debug.log("The `LocalVariables` integration failed to start.", error);
    }
  }
  return {
    name: INTEGRATION_NAME$7,
    setupOnce() {
      setupPromise = setup();
    },
    async processEvent(event) {
      await setupPromise;
      if (shouldProcessEvent) {
        return addLocalVariablesToEvent(event);
      }
      return event;
    },
    // These are entirely for testing
    _getCachedFramesCount() {
      return cachedFrames.size;
    },
    _getFirstCachedFrame() {
      return cachedFrames.values()[0];
    }
  };
});
const localVariablesSyncIntegration = defineIntegration(_localVariablesSyncIntegration);
const localVariablesIntegration = (options = {}) => {
  return NODE_VERSION.major < 19 ? localVariablesSyncIntegration(options) : localVariablesAsyncIntegration(options);
};
function isCjs() {
  try {
    return typeof module !== "undefined" && typeof module.exports !== "undefined";
  } catch {
    return false;
  }
}
let hasWarnedAboutNodeVersion;
function supportsEsmLoaderHooks() {
  if (isCjs()) {
    return false;
  }
  if (NODE_MAJOR >= 21 || NODE_MAJOR === 20 && NODE_MINOR >= 6 || NODE_MAJOR === 18 && NODE_MINOR >= 19) {
    return true;
  }
  if (!hasWarnedAboutNodeVersion) {
    hasWarnedAboutNodeVersion = true;
    consoleSandbox(() => {
      console.warn(
        `[Sentry] You are using Node.js v${process.versions.node} in ESM mode ("import syntax"). The Sentry Node.js SDK is not compatible with ESM in Node.js versions before 18.19.0 or before 20.6.0. Please either build your application with CommonJS ("require() syntax"), or upgrade your Node.js version.`
      );
    });
  }
  return false;
}
let moduleCache;
const INTEGRATION_NAME$6 = "Modules";
const SERVER_MODULES = typeof __SENTRY_SERVER_MODULES__ === "undefined" ? {} : __SENTRY_SERVER_MODULES__;
const _modulesIntegration = (() => {
  return {
    name: INTEGRATION_NAME$6,
    processEvent(event) {
      event.modules = {
        ...event.modules,
        ..._getModules()
      };
      return event;
    },
    getModules: _getModules
  };
});
const modulesIntegration = _modulesIntegration;
function getRequireCachePaths() {
  try {
    return require.cache ? Object.keys(require.cache) : [];
  } catch {
    return [];
  }
}
function collectModules() {
  return {
    ...SERVER_MODULES,
    ...getModulesFromPackageJson(),
    ...isCjs() ? collectRequireModules() : {}
  };
}
function collectRequireModules() {
  const mainPaths = require.main?.paths || [];
  const paths = getRequireCachePaths();
  const infos = {};
  const seen = /* @__PURE__ */ new Set();
  paths.forEach((path) => {
    let dir = path;
    const updir = () => {
      const orig = dir;
      dir = dirname(orig);
      if (!dir || orig === dir || seen.has(orig)) {
        return void 0;
      }
      if (mainPaths.indexOf(dir) < 0) {
        return updir();
      }
      const pkgfile = join(orig, "package.json");
      seen.add(orig);
      if (!existsSync(pkgfile)) {
        return updir();
      }
      try {
        const info = JSON.parse(readFileSync(pkgfile, "utf8"));
        infos[info.name] = info.version;
      } catch {
      }
    };
    updir();
  });
  return infos;
}
function _getModules() {
  if (!moduleCache) {
    moduleCache = collectModules();
  }
  return moduleCache;
}
function getPackageJson() {
  try {
    const filePath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(filePath, "utf8"));
    return packageJson;
  } catch {
    return {};
  }
}
function getModulesFromPackageJson() {
  const packageJson = getPackageJson();
  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
}
const DEFAULT_SHUTDOWN_TIMEOUT = 2e3;
function logAndExitProcess(error) {
  consoleSandbox(() => {
    console.error(error);
  });
  const client = getClient();
  if (client === void 0) {
    DEBUG_BUILD && debug.warn("No NodeClient was defined, we are exiting the process now.");
    global.process.exit(1);
    return;
  }
  const options = client.getOptions();
  const timeout = options?.shutdownTimeout && options.shutdownTimeout > 0 ? options.shutdownTimeout : DEFAULT_SHUTDOWN_TIMEOUT;
  client.close(timeout).then(
    (result) => {
      if (!result) {
        DEBUG_BUILD && debug.warn("We reached the timeout for emptying the request buffer, still exiting now!");
      }
      global.process.exit(1);
    },
    (error2) => {
      DEBUG_BUILD && debug.error(error2);
    }
  );
}
const INTEGRATION_NAME$5 = "OnUncaughtException";
const onUncaughtExceptionIntegration = defineIntegration((options = {}) => {
  const optionsWithDefaults = {
    exitEvenIfOtherHandlersAreRegistered: false,
    ...options
  };
  return {
    name: INTEGRATION_NAME$5,
    setup(client) {
      if (!isMainThread) {
        return;
      }
      global.process.on("uncaughtException", makeErrorHandler(client, optionsWithDefaults));
    }
  };
});
function makeErrorHandler(client, options) {
  const timeout = 2e3;
  let caughtFirstError = false;
  let caughtSecondError = false;
  let calledFatalError = false;
  let firstError;
  const clientOptions = client.getOptions();
  return Object.assign(
    (error) => {
      let onFatalError = logAndExitProcess;
      if (options.onFatalError) {
        onFatalError = options.onFatalError;
      } else if (clientOptions.onFatalError) {
        onFatalError = clientOptions.onFatalError;
      }
      const userProvidedListenersCount = global.process.listeners("uncaughtException").filter(
        (listener) => {
          return (
            // as soon as we're using domains this listener is attached by node itself
            listener.name !== "domainUncaughtExceptionClear" && // the handler we register for tracing
            listener.tag !== "sentry_tracingErrorCallback" && // the handler we register in this integration
            listener._errorHandler !== true
          );
        }
      ).length;
      const processWouldExit = userProvidedListenersCount === 0;
      const shouldApplyFatalHandlingLogic = options.exitEvenIfOtherHandlersAreRegistered || processWouldExit;
      if (!caughtFirstError) {
        firstError = error;
        caughtFirstError = true;
        if (getClient() === client) {
          captureException(error, {
            originalException: error,
            captureContext: {
              level: "fatal"
            },
            mechanism: {
              handled: false,
              type: "auto.node.onuncaughtexception"
            }
          });
        }
        if (!calledFatalError && shouldApplyFatalHandlingLogic) {
          calledFatalError = true;
          onFatalError(error);
        }
      } else {
        if (shouldApplyFatalHandlingLogic) {
          if (calledFatalError) {
            DEBUG_BUILD && debug.warn(
              "uncaught exception after calling fatal error shutdown callback - this is bad! forcing shutdown"
            );
            logAndExitProcess(error);
          } else if (!caughtSecondError) {
            caughtSecondError = true;
            setTimeout(() => {
              if (!calledFatalError) {
                calledFatalError = true;
                onFatalError(firstError, error);
              }
            }, timeout);
          }
        }
      }
    },
    { _errorHandler: true }
  );
}
const INTEGRATION_NAME$4 = "OnUnhandledRejection";
const DEFAULT_IGNORES = [
  {
    name: "AI_NoOutputGeneratedError"
    // When stream aborts in Vercel AI SDK, Vercel flush() fails with an error
  }
];
const _onUnhandledRejectionIntegration = ((options = {}) => {
  const opts = {
    mode: options.mode ?? "warn",
    ignore: [...DEFAULT_IGNORES, ...options.ignore ?? []]
  };
  return {
    name: INTEGRATION_NAME$4,
    setup(client) {
      global.process.on("unhandledRejection", makeUnhandledPromiseHandler(client, opts));
    }
  };
});
const onUnhandledRejectionIntegration = defineIntegration(_onUnhandledRejectionIntegration);
function extractErrorInfo(reason) {
  if (typeof reason !== "object" || reason === null) {
    return { name: "", message: String(reason ?? "") };
  }
  const errorLike = reason;
  const name = typeof errorLike.name === "string" ? errorLike.name : "";
  const message = typeof errorLike.message === "string" ? errorLike.message : String(reason);
  return { name, message };
}
function isMatchingReason(matcher, errorInfo) {
  const nameMatches = matcher.name === void 0 || isMatchingPattern(errorInfo.name, matcher.name, true);
  const messageMatches = matcher.message === void 0 || isMatchingPattern(errorInfo.message, matcher.message);
  return nameMatches && messageMatches;
}
function matchesIgnore(list, reason) {
  const errorInfo = extractErrorInfo(reason);
  return list.some((matcher) => isMatchingReason(matcher, errorInfo));
}
function makeUnhandledPromiseHandler(client, options) {
  return function sendUnhandledPromise(reason, promise) {
    if (getClient() !== client) {
      return;
    }
    if (matchesIgnore(options.ignore ?? [], reason)) {
      return;
    }
    const level = options.mode === "strict" ? "fatal" : "error";
    const activeSpanForError = reason && typeof reason === "object" ? reason._sentry_active_span : void 0;
    const activeSpanWrapper = activeSpanForError ? (fn) => withActiveSpan(activeSpanForError, fn) : (fn) => fn();
    activeSpanWrapper(() => {
      captureException(reason, {
        originalException: promise,
        captureContext: {
          extra: { unhandledPromiseRejection: true },
          level
        },
        mechanism: {
          handled: false,
          type: "auto.node.onunhandledrejection"
        }
      });
    });
    handleRejection(reason, options.mode);
  };
}
function handleRejection(reason, mode) {
  const rejectionWarning = "This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason:";
  if (mode === "warn") {
    consoleSandbox(() => {
      console.warn(rejectionWarning);
      console.error(reason && typeof reason === "object" && "stack" in reason ? reason.stack : reason);
    });
  } else if (mode === "strict") {
    consoleSandbox(() => {
      console.warn(rejectionWarning);
    });
    logAndExitProcess(reason);
  }
}
const INTEGRATION_NAME$3 = "Spotlight";
const _spotlightIntegration = ((options = {}) => {
  const _options = {
    sidecarUrl: options.sidecarUrl || "http://localhost:8969/stream"
  };
  return {
    name: INTEGRATION_NAME$3,
    setup(client) {
      try {
        if (true) {
          debug.warn("[Spotlight] It seems you're not in dev mode. Do you really want to have Spotlight enabled?");
        }
      } catch {
      }
      connectToSpotlight(client, _options);
    }
  };
});
const spotlightIntegration = defineIntegration(_spotlightIntegration);
function connectToSpotlight(client, options) {
  const spotlightUrl = parseSidecarUrl(options.sidecarUrl);
  if (!spotlightUrl) {
    return;
  }
  let failedRequests = 0;
  client.on("beforeEnvelope", (envelope) => {
    if (failedRequests > 3) {
      debug.warn("[Spotlight] Disabled Sentry -> Spotlight integration due to too many failed requests");
      return;
    }
    const serializedEnvelope = serializeEnvelope(envelope);
    suppressTracing(() => {
      const req = http.request(
        {
          method: "POST",
          path: spotlightUrl.pathname,
          hostname: spotlightUrl.hostname,
          port: spotlightUrl.port,
          headers: {
            "Content-Type": "application/x-sentry-envelope"
          }
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
            failedRequests = 0;
          }
          res.on("data", () => {
          });
          res.on("end", () => {
          });
          res.setEncoding("utf8");
        }
      );
      req.on("error", () => {
        failedRequests++;
        debug.warn("[Spotlight] Failed to send envelope to Spotlight Sidecar");
      });
      req.write(serializedEnvelope);
      req.end();
    });
  });
}
function parseSidecarUrl(url) {
  try {
    return new URL(`${url}`);
  } catch {
    debug.warn(`[Spotlight] Invalid sidecar URL: ${url}`);
    return void 0;
  }
}
const INTEGRATION_NAME$2 = "NodeSystemError";
function isSystemError(error) {
  if (!(error instanceof Error)) {
    return false;
  }
  if (!("errno" in error) || typeof error.errno !== "number") {
    return false;
  }
  return util.getSystemErrorMap().has(error.errno);
}
const systemErrorIntegration = defineIntegration((options = {}) => {
  return {
    name: INTEGRATION_NAME$2,
    processEvent: (event, hint, client) => {
      if (!isSystemError(hint.originalException)) {
        return event;
      }
      const error = hint.originalException;
      const errorContext = {
        ...error
      };
      if (!client.getOptions().sendDefaultPii && options.includePaths !== true) {
        delete errorContext.path;
        delete errorContext.dest;
      }
      event.contexts = {
        ...event.contexts,
        node_system_error: errorContext
      };
      for (const exception of event.exception?.values || []) {
        if (exception.value) {
          if (error.path && exception.value.includes(error.path)) {
            exception.value = exception.value.replace(`'${error.path}'`, "").trim();
          }
          if (error.dest && exception.value.includes(error.dest)) {
            exception.value = exception.value.replace(`'${error.dest}'`, "").trim();
          }
        }
      }
      return event;
    }
  };
});
const INTEGRATION_NAME$1 = "ChildProcess";
const childProcessIntegration = defineIntegration((options = {}) => {
  return {
    name: INTEGRATION_NAME$1,
    setup() {
      diagnosticsChannel.channel("child_process").subscribe((event) => {
        if (event && typeof event === "object" && "process" in event) {
          captureChildProcessEvents(event.process, options);
        }
      });
      diagnosticsChannel.channel("worker_threads").subscribe((event) => {
        if (event && typeof event === "object" && "worker" in event) {
          captureWorkerThreadEvents(event.worker, options);
        }
      });
    }
  };
});
function captureChildProcessEvents(child, options) {
  let hasExited = false;
  let data;
  child.on("spawn", () => {
    if (child.spawnfile === "/usr/bin/sw_vers") {
      hasExited = true;
      return;
    }
    data = { spawnfile: child.spawnfile };
    if (options.includeChildProcessArgs) {
      data.spawnargs = child.spawnargs;
    }
  }).on("exit", (code) => {
    if (!hasExited) {
      hasExited = true;
      if (code !== null && code !== 0) {
        addBreadcrumb({
          category: "child_process",
          message: `Child process exited with code '${code}'`,
          level: code === 0 ? "info" : "warning",
          data
        });
      }
    }
  }).on("error", (error) => {
    if (!hasExited) {
      hasExited = true;
      addBreadcrumb({
        category: "child_process",
        message: `Child process errored with '${error.message}'`,
        level: "error",
        data
      });
    }
  });
}
function captureWorkerThreadEvents(worker, options) {
  let threadId2;
  worker.on("online", () => {
    threadId2 = worker.threadId;
  }).on("error", (error) => {
    if (options.captureWorkerErrors !== false) {
      captureException(error, {
        mechanism: { type: "auto.child_process.worker_thread", handled: false, data: { threadId: String(threadId2) } }
      });
    } else {
      addBreadcrumb({
        category: "worker_thread",
        message: `Worker thread errored with '${error.message}'`,
        level: "error",
        data: { threadId: threadId2 }
      });
    }
  });
}
const SentryContextManager = wrapContextManagerClass(srcExports.AsyncLocalStorageContextManager);
function setupOpenTelemetryLogger() {
  diag.disable();
  diag.setLogger(
    {
      error: debug.error,
      warn: debug.warn,
      info: debug.log,
      debug: debug.log,
      verbose: debug.log
    },
    DiagLogLevel.DEBUG
  );
}
const INTEGRATION_NAME = "ProcessSession";
const processSessionIntegration = defineIntegration(() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      startSession();
      process.on("beforeExit", () => {
        const session = getIsolationScope().getSession();
        if (session?.status !== "ok") {
          endSession();
        }
      });
    }
  };
});
const INTERNAL = /* @__PURE__ */ Symbol("AgentBaseInternalState");
class Agent extends http.Agent {
  // Set by `http.Agent` - missing from `@types/node`
  constructor(opts) {
    super(opts);
    this[INTERNAL] = {};
  }
  /**
   * Determine whether this is an `http` or `https` request.
   */
  isSecureEndpoint(options) {
    if (options) {
      if (typeof options.secureEndpoint === "boolean") {
        return options.secureEndpoint;
      }
      if (typeof options.protocol === "string") {
        return options.protocol === "https:";
      }
    }
    const { stack } = new Error();
    if (typeof stack !== "string") return false;
    return stack.split("\n").some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
  }
  createSocket(req, options, cb) {
    const connectOpts = {
      ...options,
      secureEndpoint: this.isSecureEndpoint(options)
    };
    Promise.resolve().then(() => this.connect(req, connectOpts)).then((socket) => {
      if (socket instanceof http.Agent) {
        return socket.addRequest(req, connectOpts);
      }
      this[INTERNAL].currentSocket = socket;
      super.createSocket(req, options, cb);
    }, cb);
  }
  createConnection() {
    const socket = this[INTERNAL].currentSocket;
    this[INTERNAL].currentSocket = void 0;
    if (!socket) {
      throw new Error("No socket was returned in the `connect()` function");
    }
    return socket;
  }
  get defaultPort() {
    return this[INTERNAL].defaultPort ?? (this.protocol === "https:" ? 443 : 80);
  }
  set defaultPort(v) {
    if (this[INTERNAL]) {
      this[INTERNAL].defaultPort = v;
    }
  }
  get protocol() {
    return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? "https:" : "http:");
  }
  set protocol(v) {
    if (this[INTERNAL]) {
      this[INTERNAL].protocol = v;
    }
  }
}
function debugLog$1(...args) {
  debug.log("[https-proxy-agent:parse-proxy-response]", ...args);
}
function parseProxyResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffersLength = 0;
    const buffers = [];
    function read() {
      const b = socket.read();
      if (b) ondata(b);
      else socket.once("readable", read);
    }
    function cleanup() {
      socket.removeListener("end", onend);
      socket.removeListener("error", onerror);
      socket.removeListener("readable", read);
    }
    function onend() {
      cleanup();
      debugLog$1("onend");
      reject(new Error("Proxy connection ended before receiving CONNECT response"));
    }
    function onerror(err) {
      cleanup();
      debugLog$1("onerror %o", err);
      reject(err);
    }
    function ondata(b) {
      buffers.push(b);
      buffersLength += b.length;
      const buffered = Buffer.concat(buffers, buffersLength);
      const endOfHeaders = buffered.indexOf("\r\n\r\n");
      if (endOfHeaders === -1) {
        debugLog$1("have not received end of HTTP headers yet...");
        read();
        return;
      }
      const headerParts = buffered.subarray(0, endOfHeaders).toString("ascii").split("\r\n");
      const firstLine = headerParts.shift();
      if (!firstLine) {
        socket.destroy();
        return reject(new Error("No header received from proxy CONNECT response"));
      }
      const firstLineParts = firstLine.split(" ");
      const statusCode = +(firstLineParts[1] || 0);
      const statusText = firstLineParts.slice(2).join(" ");
      const headers = {};
      for (const header of headerParts) {
        if (!header) continue;
        const firstColon = header.indexOf(":");
        if (firstColon === -1) {
          socket.destroy();
          return reject(new Error(`Invalid header from proxy CONNECT response: "${header}"`));
        }
        const key = header.slice(0, firstColon).toLowerCase();
        const value = header.slice(firstColon + 1).trimStart();
        const current = headers[key];
        if (typeof current === "string") {
          headers[key] = [current, value];
        } else if (Array.isArray(current)) {
          current.push(value);
        } else {
          headers[key] = value;
        }
      }
      debugLog$1("got proxy server response: %o %o", firstLine, headers);
      cleanup();
      resolve({
        connect: {
          statusCode,
          statusText,
          headers
        },
        buffered
      });
    }
    socket.on("error", onerror);
    socket.on("end", onend);
    read();
  });
}
function debugLog(...args) {
  debug.log("[https-proxy-agent]", ...args);
}
class HttpsProxyAgent extends Agent {
  static __initStatic() {
    this.protocols = ["http", "https"];
  }
  constructor(proxy, opts) {
    super(opts);
    this.options = {};
    this.proxy = typeof proxy === "string" ? new URL(proxy) : proxy;
    this.proxyHeaders = opts?.headers ?? {};
    debugLog("Creating new HttpsProxyAgent instance: %o", this.proxy.href);
    const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, "");
    const port = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
    this.connectOpts = {
      // Attempt to negotiate http/1.1 for proxy servers that support http/2
      ALPNProtocols: ["http/1.1"],
      ...opts ? omit(opts, "headers") : null,
      host,
      port
    };
  }
  /**
   * Called when the node-core HTTP client library is creating a
   * new HTTP request.
   */
  async connect(req, opts) {
    const { proxy } = this;
    if (!opts.host) {
      throw new TypeError('No "host" provided');
    }
    let socket;
    if (proxy.protocol === "https:") {
      debugLog("Creating `tls.Socket`: %o", this.connectOpts);
      const servername = this.connectOpts.servername || this.connectOpts.host;
      socket = tls.connect({
        ...this.connectOpts,
        servername: servername && net.isIP(servername) ? void 0 : servername
      });
    } else {
      debugLog("Creating `net.Socket`: %o", this.connectOpts);
      socket = net.connect(this.connectOpts);
    }
    const headers = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
    const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
    let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r
`;
    if (proxy.username || proxy.password) {
      const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
      headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
    }
    headers.Host = `${host}:${opts.port}`;
    if (!headers["Proxy-Connection"]) {
      headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
    }
    for (const name of Object.keys(headers)) {
      payload += `${name}: ${headers[name]}\r
`;
    }
    const proxyResponsePromise = parseProxyResponse(socket);
    socket.write(`${payload}\r
`);
    const { connect, buffered } = await proxyResponsePromise;
    req.emit("proxyConnect", connect);
    this.emit("proxyConnect", connect, req);
    if (connect.statusCode === 200) {
      req.once("socket", resume);
      if (opts.secureEndpoint) {
        debugLog("Upgrading socket connection to TLS");
        const servername = opts.servername || opts.host;
        return tls.connect({
          ...omit(opts, "host", "path", "port"),
          socket,
          servername: net.isIP(servername) ? void 0 : servername
        });
      }
      return socket;
    }
    socket.destroy();
    const fakeSocket = new net.Socket({ writable: false });
    fakeSocket.readable = true;
    req.once("socket", (s) => {
      debugLog("Replaying proxy buffer for failed request");
      s.push(buffered);
      s.push(null);
    });
    return fakeSocket;
  }
}
HttpsProxyAgent.__initStatic();
function resume(socket) {
  socket.resume();
}
function omit(obj, ...keys) {
  const ret = {};
  let key;
  for (key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
}
const GZIP_THRESHOLD = 1024 * 32;
function streamFromBody(body) {
  return new Readable({
    read() {
      this.push(body);
      this.push(null);
    }
  });
}
function makeNodeTransport(options) {
  let urlSegments;
  try {
    urlSegments = new URL(options.url);
  } catch (e) {
    consoleSandbox(() => {
      console.warn(
        "[@sentry/node]: Invalid dsn or tunnel option, will not send any events. The tunnel option must be a full URL when used."
      );
    });
    return createTransport(options, () => Promise.resolve({}));
  }
  const isHttps = urlSegments.protocol === "https:";
  const proxy = applyNoProxyOption(
    urlSegments,
    options.proxy || (isHttps ? process.env.https_proxy : void 0) || process.env.http_proxy
  );
  const nativeHttpModule = isHttps ? nodeHTTPS : http;
  const keepAlive = options.keepAlive === void 0 ? false : options.keepAlive;
  const agent = proxy ? new HttpsProxyAgent(proxy) : new nativeHttpModule.Agent({ keepAlive, maxSockets: 30, timeout: 2e3 });
  const requestExecutor = createRequestExecutor(options, options.httpModule ?? nativeHttpModule, agent);
  return createTransport(options, requestExecutor);
}
function applyNoProxyOption(transportUrlSegments, proxy) {
  const { no_proxy } = process.env;
  const urlIsExemptFromProxy = no_proxy?.split(",").some(
    (exemption) => transportUrlSegments.host.endsWith(exemption) || transportUrlSegments.hostname.endsWith(exemption)
  );
  if (urlIsExemptFromProxy) {
    return void 0;
  } else {
    return proxy;
  }
}
function createRequestExecutor(options, httpModule, agent) {
  const { hostname, pathname, port, protocol, search } = new URL(options.url);
  return function makeRequest(request) {
    return new Promise((resolve, reject) => {
      suppressTracing(() => {
        let body = streamFromBody(request.body);
        const headers = { ...options.headers };
        if (request.body.length > GZIP_THRESHOLD) {
          headers["content-encoding"] = "gzip";
          body = body.pipe(createGzip());
        }
        const hostnameIsIPv6 = hostname.startsWith("[");
        const req = httpModule.request(
          {
            method: "POST",
            agent,
            headers,
            // Remove "[" and "]" from IPv6 hostnames
            hostname: hostnameIsIPv6 ? hostname.slice(1, -1) : hostname,
            path: `${pathname}${search}`,
            port,
            protocol,
            ca: options.caCerts
          },
          (res) => {
            res.on("data", () => {
            });
            res.on("end", () => {
            });
            res.setEncoding("utf8");
            const retryAfterHeader = res.headers["retry-after"] ?? null;
            const rateLimitsHeader = res.headers["x-sentry-rate-limits"] ?? null;
            resolve({
              statusCode: res.statusCode,
              headers: {
                "retry-after": retryAfterHeader,
                "x-sentry-rate-limits": Array.isArray(rateLimitsHeader) ? rateLimitsHeader[0] || null : rateLimitsHeader
              }
            });
          }
        );
        req.on("error", reject);
        body.pipe(req);
      });
    });
  };
}
const FALSY_ENV_VALUES = /* @__PURE__ */ new Set(["false", "f", "n", "no", "off", "0"]);
const TRUTHY_ENV_VALUES = /* @__PURE__ */ new Set(["true", "t", "y", "yes", "on", "1"]);
function envToBool(value, options) {
  const normalized = String(value).toLowerCase();
  if (FALSY_ENV_VALUES.has(normalized)) {
    return false;
  }
  if (TRUTHY_ENV_VALUES.has(normalized)) {
    return true;
  }
  return options?.strict ? null : Boolean(value);
}
function normalizeWindowsPath(path) {
  return path.replace(/^[A-Z]:/, "").replace(/\\/g, "/");
}
function createGetModuleFromFilename(basePath = process.argv[1] ? dirname$1(process.argv[1]) : process.cwd(), isWindows = sep === "\\") {
  const normalizedBase = isWindows ? normalizeWindowsPath(basePath) : basePath;
  return (filename) => {
    if (!filename) {
      return;
    }
    const normalizedFilename = isWindows ? normalizeWindowsPath(filename) : filename;
    let { dir, base: file, ext } = posix.parse(normalizedFilename);
    if (ext === ".js" || ext === ".mjs" || ext === ".cjs") {
      file = file.slice(0, ext.length * -1);
    }
    const decodedFile = decodeURIComponent(file);
    if (!dir) {
      dir = ".";
    }
    const n = dir.lastIndexOf("/node_modules");
    if (n > -1) {
      return `${dir.slice(n + 14).replace(/\//g, ".")}:${decodedFile}`;
    }
    if (dir.startsWith(normalizedBase)) {
      const moduleName = dir.slice(normalizedBase.length + 1).replace(/\//g, ".");
      return moduleName ? `${moduleName}:${decodedFile}` : decodedFile;
    }
    return decodedFile;
  };
}
function getSentryRelease(fallback) {
  if (process.env.SENTRY_RELEASE) {
    return process.env.SENTRY_RELEASE;
  }
  if (GLOBAL_OBJ.SENTRY_RELEASE?.id) {
    return GLOBAL_OBJ.SENTRY_RELEASE.id;
  }
  const possibleReleaseNameOfGitProvider = (
    // GitHub Actions - https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables
    process.env["GITHUB_SHA"] || // GitLab CI - https://docs.gitlab.com/ee/ci/variables/predefined_variables.html
    process.env["CI_MERGE_REQUEST_SOURCE_BRANCH_SHA"] || process.env["CI_BUILD_REF"] || process.env["CI_COMMIT_SHA"] || // Bitbucket - https://support.atlassian.com/bitbucket-cloud/docs/variables-and-secrets/
    process.env["BITBUCKET_COMMIT"]
  );
  const possibleReleaseNameOfCiProvidersWithSpecificEnvVar = (
    // AppVeyor - https://www.appveyor.com/docs/environment-variables/
    process.env["APPVEYOR_PULL_REQUEST_HEAD_COMMIT"] || process.env["APPVEYOR_REPO_COMMIT"] || // AWS CodeBuild - https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html
    process.env["CODEBUILD_RESOLVED_SOURCE_VERSION"] || // AWS Amplify - https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html
    process.env["AWS_COMMIT_ID"] || // Azure Pipelines - https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml
    process.env["BUILD_SOURCEVERSION"] || // Bitrise - https://devcenter.bitrise.io/builds/available-environment-variables/
    process.env["GIT_CLONE_COMMIT_HASH"] || // Buddy CI - https://buddy.works/docs/pipelines/environment-variables#default-environment-variables
    process.env["BUDDY_EXECUTION_REVISION"] || // Builtkite - https://buildkite.com/docs/pipelines/environment-variables
    process.env["BUILDKITE_COMMIT"] || // CircleCI - https://circleci.com/docs/variables/
    process.env["CIRCLE_SHA1"] || // Cirrus CI - https://cirrus-ci.org/guide/writing-tasks/#environment-variables
    process.env["CIRRUS_CHANGE_IN_REPO"] || // Codefresh - https://codefresh.io/docs/docs/codefresh-yaml/variables/
    process.env["CF_REVISION"] || // Codemagic - https://docs.codemagic.io/yaml-basic-configuration/environment-variables/
    process.env["CM_COMMIT"] || // Cloudflare Pages - https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables
    process.env["CF_PAGES_COMMIT_SHA"] || // Drone - https://docs.drone.io/pipeline/environment/reference/
    process.env["DRONE_COMMIT_SHA"] || // Flightcontrol - https://www.flightcontrol.dev/docs/guides/flightcontrol/environment-variables#built-in-environment-variables
    process.env["FC_GIT_COMMIT_SHA"] || // Heroku #1 https://devcenter.heroku.com/articles/heroku-ci
    process.env["HEROKU_TEST_RUN_COMMIT_VERSION"] || // Heroku #2 https://docs.sentry.io/product/integrations/deployment/heroku/#configure-releases
    process.env["HEROKU_SLUG_COMMIT"] || // Railway - https://docs.railway.app/reference/variables#git-variables
    process.env["RAILWAY_GIT_COMMIT_SHA"] || // Render - https://render.com/docs/environment-variables
    process.env["RENDER_GIT_COMMIT"] || // Semaphore CI - https://docs.semaphoreci.com/ci-cd-environment/environment-variables
    process.env["SEMAPHORE_GIT_SHA"] || // TravisCI - https://docs.travis-ci.com/user/environment-variables/#default-environment-variables
    process.env["TRAVIS_PULL_REQUEST_SHA"] || // Vercel - https://vercel.com/docs/v2/build-step#system-environment-variables
    process.env["VERCEL_GIT_COMMIT_SHA"] || process.env["VERCEL_GITHUB_COMMIT_SHA"] || process.env["VERCEL_GITLAB_COMMIT_SHA"] || process.env["VERCEL_BITBUCKET_COMMIT_SHA"] || // Zeit (now known as Vercel)
    process.env["ZEIT_GITHUB_COMMIT_SHA"] || process.env["ZEIT_GITLAB_COMMIT_SHA"] || process.env["ZEIT_BITBUCKET_COMMIT_SHA"]
  );
  const possibleReleaseNameOfCiProvidersWithGenericEnvVar = (
    // CloudBees CodeShip - https://docs.cloudbees.com/docs/cloudbees-codeship/latest/pro-builds-and-configuration/environment-variables
    process.env["CI_COMMIT_ID"] || // Coolify - https://coolify.io/docs/knowledge-base/environment-variables
    process.env["SOURCE_COMMIT"] || // Heroku #3 https://devcenter.heroku.com/changelog-items/630
    process.env["SOURCE_VERSION"] || // Jenkins - https://plugins.jenkins.io/git/#environment-variables
    process.env["GIT_COMMIT"] || // Netlify - https://docs.netlify.com/configure-builds/environment-variables/#build-metadata
    process.env["COMMIT_REF"] || // TeamCity - https://www.jetbrains.com/help/teamcity/predefined-build-parameters.html
    process.env["BUILD_VCS_NUMBER"] || // Woodpecker CI - https://woodpecker-ci.org/docs/usage/environment
    process.env["CI_COMMIT_SHA"]
  );
  return possibleReleaseNameOfGitProvider || possibleReleaseNameOfCiProvidersWithSpecificEnvVar || possibleReleaseNameOfCiProvidersWithGenericEnvVar || fallback;
}
const defaultStackParser = createStackParser(nodeStackLineParser(createGetModuleFromFilename()));
const DEFAULT_CLIENT_REPORT_FLUSH_INTERVAL_MS = 6e4;
class NodeClient extends ServerRuntimeClient {
  constructor(options) {
    const serverName = options.includeServerName === false ? void 0 : options.serverName || global.process.env.SENTRY_NAME || os.hostname();
    const clientOptions = {
      ...options,
      platform: "node",
      runtime: { name: "node", version: global.process.version },
      serverName
    };
    if (options.openTelemetryInstrumentations) {
      registerInstrumentations({
        instrumentations: options.openTelemetryInstrumentations
      });
    }
    applySdkMetadata(clientOptions, "node");
    debug.log(`Initializing Sentry: process: ${process.pid}, thread: ${isMainThread ? "main" : `worker-${threadId}`}.`);
    super(clientOptions);
    if (this.getOptions().enableLogs) {
      this._logOnExitFlushListener = () => {
        _INTERNAL_flushLogsBuffer(this);
      };
      if (serverName) {
        this.on("beforeCaptureLog", (log2) => {
          log2.attributes = {
            ...log2.attributes,
            "server.address": serverName
          };
        });
      }
      process.on("beforeExit", this._logOnExitFlushListener);
    }
  }
  /** Get the OTEL tracer. */
  get tracer() {
    if (this._tracer) {
      return this._tracer;
    }
    const name = "@sentry/node";
    const version = SDK_VERSION;
    const tracer = trace.getTracer(name, version);
    this._tracer = tracer;
    return tracer;
  }
  /** @inheritDoc */
  // @ts-expect-error - PromiseLike is a subset of Promise
  async flush(timeout) {
    await this.traceProvider?.forceFlush();
    if (this.getOptions().sendClientReports) {
      this._flushOutcomes();
    }
    return super.flush(timeout);
  }
  /** @inheritDoc */
  // @ts-expect-error - PromiseLike is a subset of Promise
  async close(timeout) {
    if (this._clientReportInterval) {
      clearInterval(this._clientReportInterval);
    }
    if (this._clientReportOnExitFlushListener) {
      process.off("beforeExit", this._clientReportOnExitFlushListener);
    }
    if (this._logOnExitFlushListener) {
      process.off("beforeExit", this._logOnExitFlushListener);
    }
    const allEventsSent = await super.close(timeout);
    if (this.traceProvider) {
      await this.traceProvider.shutdown();
    }
    return allEventsSent;
  }
  /**
   * Will start tracking client reports for this client.
   *
   * NOTICE: This method will create an interval that is periodically called and attach a `process.on('beforeExit')`
   * hook. To clean up these resources, call `.close()` when you no longer intend to use the client. Not doing so will
   * result in a memory leak.
   */
  // The reason client reports need to be manually activated with this method instead of just enabling them in a
  // constructor, is that if users periodically and unboundedly create new clients, we will create more and more
  // intervals and beforeExit listeners, thus leaking memory. In these situations, users are required to call
  // `client.close()` in order to dispose of the acquired resources.
  // We assume that calling this method in Sentry.init() is a sensible default, because calling Sentry.init() over and
  // over again would also result in memory leaks.
  // Note: We have experimented with using `FinalizationRegisty` to clear the interval when the client is garbage
  // collected, but it did not work, because the cleanup function never got called.
  startClientReportTracking() {
    const clientOptions = this.getOptions();
    if (clientOptions.sendClientReports) {
      this._clientReportOnExitFlushListener = () => {
        this._flushOutcomes();
      };
      this._clientReportInterval = setInterval(() => {
        DEBUG_BUILD && debug.log("Flushing client reports based on interval.");
        this._flushOutcomes();
      }, clientOptions.clientReportFlushInterval ?? DEFAULT_CLIENT_REPORT_FLUSH_INTERVAL_MS).unref();
      process.on("beforeExit", this._clientReportOnExitFlushListener);
    }
  }
  /** @inheritDoc */
  _setupIntegrations() {
    _INTERNAL_clearAiProviderSkips();
    super._setupIntegrations();
  }
  /** Custom implementation for OTEL, so we can handle scope-span linking. */
  _getTraceInfoFromScope(scope) {
    if (!scope) {
      return [void 0, void 0];
    }
    return getTraceContextForScope(this, scope);
  }
}
function initializeEsmLoader() {
  if (!supportsEsmLoaderHooks()) {
    return;
  }
  if (!GLOBAL_OBJ._sentryEsmLoaderHookRegistered) {
    GLOBAL_OBJ._sentryEsmLoaderHookRegistered = true;
    try {
      const { addHookMessagePort } = importInTheMiddleExports.createAddHookMessageChannel();
      moduleModule.register("import-in-the-middle/hook.mjs", import.meta.url, {
        data: { addHookMessagePort, include: [] },
        transferList: [addHookMessagePort]
      });
    } catch (error) {
      debug.warn("Failed to register 'import-in-the-middle' hook", error);
    }
  }
}
function getDefaultIntegrations() {
  return [
    // Common
    // TODO(v11): Replace with `eventFiltersIntegration` once we remove the deprecated `inboundFiltersIntegration`
    // eslint-disable-next-line deprecation/deprecation
    inboundFiltersIntegration(),
    functionToStringIntegration(),
    linkedErrorsIntegration(),
    requestDataIntegration(),
    systemErrorIntegration(),
    // Native Wrappers
    consoleIntegration(),
    httpIntegration(),
    nativeNodeFetchIntegration(),
    // Global Handlers
    onUncaughtExceptionIntegration(),
    onUnhandledRejectionIntegration(),
    // Event Info
    contextLinesIntegration(),
    localVariablesIntegration(),
    nodeContextIntegration(),
    childProcessIntegration(),
    processSessionIntegration(),
    modulesIntegration()
  ];
}
function init(options = {}) {
  return _init(options, getDefaultIntegrations);
}
function _init(_options = {}, getDefaultIntegrationsImpl) {
  const options = getClientOptions(_options, getDefaultIntegrationsImpl);
  if (options.debug === true) {
    if (DEBUG_BUILD) {
      debug.enable();
    } else {
      consoleSandbox(() => {
        console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.");
      });
    }
  }
  if (options.registerEsmLoaderHooks !== false) {
    initializeEsmLoader();
  }
  setOpenTelemetryContextAsyncContextStrategy();
  const scope = getCurrentScope();
  scope.update(options.initialScope);
  if (options.spotlight && !options.integrations.some(({ name }) => name === INTEGRATION_NAME$3)) {
    options.integrations.push(
      spotlightIntegration({
        sidecarUrl: typeof options.spotlight === "string" ? options.spotlight : void 0
      })
    );
  }
  applySdkMetadata(options, "node-core");
  const client = new NodeClient(options);
  getCurrentScope().setClient(client);
  client.init();
  GLOBAL_OBJ._sentryInjectLoaderHookRegister?.();
  debug.log(`SDK initialized from ${isCjs() ? "CommonJS" : "ESM"}`);
  client.startClientReportTracking();
  updateScopeFromEnvVariables();
  enhanceDscWithOpenTelemetryRootSpanName(client);
  setupEventContextTrace(client);
  if (process.env.VERCEL) {
    process.on("SIGTERM", async () => {
      await client.flush(200);
    });
  }
  return client;
}
function validateOpenTelemetrySetup() {
  if (!DEBUG_BUILD) {
    return;
  }
  const setup = openTelemetrySetupCheck();
  const required = ["SentryContextManager", "SentryPropagator"];
  if (hasSpansEnabled()) {
    required.push("SentrySpanProcessor");
  }
  for (const k of required) {
    if (!setup.includes(k)) {
      debug.error(
        `You have to set up the ${k}. Without this, the OpenTelemetry & Sentry integration will not work properly.`
      );
    }
  }
  if (!setup.includes("SentrySampler")) {
    debug.warn(
      "You have to set up the SentrySampler. Without this, the OpenTelemetry & Sentry integration may still work, but sample rates set for the Sentry SDK will not be respected. If you use a custom sampler, make sure to use `wrapSamplingDecision`."
    );
  }
}
function getClientOptions(options, getDefaultIntegrationsImpl) {
  const release = getRelease(options.release);
  let spotlight;
  if (options.spotlight === false) {
    spotlight = false;
  } else if (typeof options.spotlight === "string") {
    spotlight = options.spotlight;
  } else {
    const envBool = envToBool(process.env.SENTRY_SPOTLIGHT, { strict: true });
    const envUrl = envBool === null && process.env.SENTRY_SPOTLIGHT ? process.env.SENTRY_SPOTLIGHT : void 0;
    spotlight = options.spotlight === true ? envUrl ?? true : envBool ?? envUrl;
  }
  const tracesSampleRate = getTracesSampleRate(options.tracesSampleRate);
  const mergedOptions = {
    ...options,
    dsn: options.dsn ?? process.env.SENTRY_DSN,
    environment: options.environment ?? process.env.SENTRY_ENVIRONMENT,
    sendClientReports: options.sendClientReports ?? true,
    transport: options.transport ?? makeNodeTransport,
    stackParser: stackParserFromStackParserOptions(options.stackParser || defaultStackParser),
    release,
    tracesSampleRate,
    spotlight,
    debug: envToBool(options.debug ?? process.env.SENTRY_DEBUG)
  };
  const integrations = options.integrations;
  const defaultIntegrations = options.defaultIntegrations ?? getDefaultIntegrationsImpl(mergedOptions);
  return {
    ...mergedOptions,
    integrations: getIntegrationsToSetup({
      defaultIntegrations,
      integrations
    })
  };
}
function getRelease(release) {
  if (release !== void 0) {
    return release;
  }
  const detectedRelease = getSentryRelease();
  if (detectedRelease !== void 0) {
    return detectedRelease;
  }
  return void 0;
}
function getTracesSampleRate(tracesSampleRate) {
  if (tracesSampleRate !== void 0) {
    return tracesSampleRate;
  }
  const sampleRateFromEnv = process.env.SENTRY_TRACES_SAMPLE_RATE;
  if (!sampleRateFromEnv) {
    return void 0;
  }
  const parsed = parseFloat(sampleRateFromEnv);
  return isFinite(parsed) ? parsed : void 0;
}
function updateScopeFromEnvVariables() {
  if (envToBool(process.env.SENTRY_USE_ENVIRONMENT) !== false) {
    const sentryTraceEnv = process.env.SENTRY_TRACE;
    const baggageEnv = process.env.SENTRY_BAGGAGE;
    const propagationContext = propagationContextFromHeaders(sentryTraceEnv, baggageEnv);
    getCurrentScope().setPropagationContext(propagationContext);
  }
}
function addOriginToSpan(span, origin) {
  span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, origin);
}
export {
  NODE_VERSION as N,
  SentryHttpInstrumentation as S,
  httpServerSpansIntegration as a,
  addOriginToSpan as b,
  getRequestUrl$1 as c,
  SentryNodeFetchInstrumentation as d,
  SentryContextManager as e,
  getDefaultIntegrations as f,
  generateInstrumentOnce as g,
  httpServerIntegration as h,
  instrumentWhenWrapped as i,
  init as j,
  setupOpenTelemetryLogger as s,
  validateOpenTelemetrySetup as v
};
