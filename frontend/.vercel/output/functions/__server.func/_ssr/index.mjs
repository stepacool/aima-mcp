import { a as createMemoryHistory } from "../_libs/@tanstack/history.mjs";
import { x as defineHandlerCallback, y as parseRedirect, z as mergeHeaders, f as isRedirect, A as getOrigin$1, C as createSerializationAdapter, D as attachRouterServerSsrUtils, E as createRawStreamRPCPlugin, i as isNotFound, F as isResolvedRedirect, G as executeRewriteInput, H as defaultSerovalPlugins, I as makeSerovalPlugin, b as rootRouteId, k as transformPipeableStreamWithRouter, j as transformReadableStreamWithRouter } from "../_libs/@tanstack/router-core.mjs";
import { AsyncLocalStorage } from "node:async_hooks";
import { H as H3Event, t as toResponse, s as setCookie$1 } from "../_libs/h3-v2.mjs";
import { i as invariant } from "../_libs/tiny-invariant.mjs";
import { $ as $i, d as du, Z as Zi } from "../_libs/seroval.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { R as RouterProvider, r as renderRouterToStream } from "../_libs/@tanstack/react-router.mjs";
import { c as createRandomStringGenerator, b as binary, a as base64Url, d as createHMAC, e as base64, f as createHash, h as hex } from "../_libs/@better-auth/utils.mjs";
import { c as createMiddleware, a as createRouter$1, b as createEndpoint, A as APIError, t as toResponse$1 } from "../_libs/better-call.mjs";
import { s as string, r as record, o as object, d as boolean, e as optional, c as any, f as email, g as boolean$1, b as array, _ as _enum, n as number, h as date, i as string$1, l as looseObject, j as ipv4, k as ipv6, m as json, z } from "../_libs/zod.mjs";
import { h as hkdf, s as sha256, a as hexToBytes$1, b as scryptAsync } from "../_libs/@noble/hashes.mjs";
import { u as utf8ToBytes, b as bytesToHex, m as managedNonce, h as hexToBytes, x as xchacha20poly1305 } from "../_libs/@noble/ciphers.mjs";
import { b as betterFetch } from "../_libs/@better-fetch/fetch.mjs";
import { j as jwtVerify, J as JWTExpired, a as jwtDecrypt, c as calculateJwkThumbprint, e as encode, E as EncryptJWT, S as SignJWT, d as decodeJwt, b as decodeProtectedHeader, f as createRemoteJWKSet, i as importJWK } from "../_libs/jose.mjs";
import { c as createDefu, d as defu } from "../_libs/defu.mjs";
import { c as createEnv } from "../_libs/@t3-oss/env-core.mjs";
import { K as Kysely, S as SqliteDialect, M as MysqlDialect, P as PostgresDialect, c as MssqlDialect, s as sql$1 } from "../_libs/kysely.mjs";
import { c as count, d as desc, a as asc, i as inArray, n as notInArray, l as like, b as lt, e as lte, f as ne, g as gt, h as gte, j as eq, k as and, o as or, s as sql, p as pgTable, t as timestamp, m as text, q as boolean$2, r as drizzle } from "../_libs/drizzle-orm.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/@tanstack/store.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/@apm-js-collab/code-transformer.mjs";
import "../_libs/tiny-warning.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/@tanstack/react-store.mjs";
import "../_libs/use-sync-external-store.mjs";
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
function StartServer(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RouterProvider, { router: props.router });
}
const defaultStreamHandler = defineHandlerCallback(
  ({ request, router: router2, responseHeaders }) => renderRouterToStream({
    request,
    router: router2,
    responseHeaders,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(StartServer, { router: router2 })
  })
);
const TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
const TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
const TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for(
  "TSS_SERVER_FUNCTION_FACTORY"
);
const X_TSS_SERIALIZED = "x-tss-serialized";
const X_TSS_RAW_RESPONSE = "x-tss-raw";
const TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
const FrameType = {
  /** Seroval JSON chunk (NDJSON line) */
  JSON: 0,
  /** Raw stream data chunk */
  CHUNK: 1,
  /** Raw stream end (EOF) */
  END: 2,
  /** Raw stream error */
  ERROR: 3
};
const FRAME_HEADER_SIZE = 9;
const TSS_FRAMED_PROTOCOL_VERSION = 1;
const TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=${TSS_FRAMED_PROTOCOL_VERSION}`;
const GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
const globalObj$1 = globalThis;
if (!globalObj$1[GLOBAL_STORAGE_KEY]) {
  globalObj$1[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
}
const startStorage = globalObj$1[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn) {
  return startStorage.run(context, fn);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) {
    throw new Error(
      `No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`
    );
  }
  return context;
}
const getStartOptions = () => getStartContext().startOptions;
const getStartContextServerOnly = getStartContext;
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) {
      if (isSafeKey(key)) result[key] = target[key];
    }
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) {
      if (isSafeKey(key)) result[key] = source[key];
    }
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) {
    if (isSafeKey(key)) obj[key] = source[key];
  }
  return obj;
}
const createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") {
    resolvedOptions.method = "GET";
  }
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m) {
          if (m.options.middleware) {
            newMiddleware.push(...m.options.middleware);
          }
        } else {
          newMiddleware.push(m);
        }
      });
      const newOptions = {
        ...resolvedOptions,
        middleware: newMiddleware
      };
      const res2 = createServerFn(void 0, newOptions);
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    inputValidator: (inputValidator) => {
      const newOptions = { ...resolvedOptions, inputValidator };
      return createServerFn(void 0, newOptions);
    },
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = { ...resolvedOptions, extractedFn, serverFn };
      const resolvedMiddleware = [
        ...newOptions.middleware || [],
        serverFnBaseToMiddleware(newOptions)
      ];
      return Object.assign(
        async (opts) => {
          const result = await executeMiddleware$1(resolvedMiddleware, "client", {
            ...extractedFn,
            ...newOptions,
            data: opts?.data,
            headers: opts?.headers,
            signal: opts?.signal,
            context: createNullProtoObject()
          });
          const redirect = parseRedirect(result.error);
          if (redirect) {
            throw redirect;
          }
          if (result.error) throw result.error;
          return result.result;
        },
        {
          // This copies over the URL, function ID
          ...extractedFn,
          // The extracted function on the server-side calls
          // this function
          __executeServer: async (opts, signal) => {
            const startContext = getStartContextServerOnly();
            const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
            const ctx = {
              ...extractedFn,
              ...opts,
              // Ensure we use the full serverFnMeta from the provider file's extractedFn
              // (which has id, name, filename) rather than the partial one from SSR/client
              // callers (which only has id)
              serverFnMeta: extractedFn.serverFnMeta,
              // Use safeObjectMerge for opts.context which comes from client
              context: safeObjectMerge(
                serverContextAfterGlobalMiddlewares,
                opts.context
              ),
              signal,
              request: startContext.request
            };
            const result = await executeMiddleware$1(
              resolvedMiddleware,
              "server",
              ctx
            ).then((d) => ({
              // Only send the result and sendContext back to the client
              result: d.result,
              error: d.error,
              context: d.sendContext
            }));
            return result;
          }
        }
      );
    }
  };
  const fun = (options2) => {
    const newOptions = {
      ...resolvedOptions,
      ...options2
    };
    return createServerFn(void 0, newOptions);
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env2, opts) {
  const globalMiddlewares = getStartOptions()?.functionMiddleware || [];
  let flattenedMiddlewares = flattenMiddlewares([
    ...globalMiddlewares,
    ...middlewares
  ]);
  if (env2 === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) {
      flattenedMiddlewares = flattenedMiddlewares.filter(
        (m) => !startContext.executedRequestMiddlewares.has(m)
      );
    }
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) {
      return ctx;
    }
    try {
      if ("inputValidator" in nextMiddleware.options && nextMiddleware.options.inputValidator && env2 === "server") {
        ctx.data = await execValidator(
          nextMiddleware.options.inputValidator,
          ctx.data
        );
      }
      let middlewareFn = void 0;
      if (env2 === "client") {
        if ("client" in nextMiddleware.options) {
          middlewareFn = nextMiddleware.options.client;
        }
      } else if ("server" in nextMiddleware.options) {
        middlewareFn = nextMiddleware.options.server;
      }
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const nextCtx = {
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          };
          try {
            return await callNextMiddleware(nextCtx);
          } catch (error2) {
            return {
              ...nextCtx,
              error: error2
            };
          }
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) {
          return {
            ...ctx,
            error: result
          };
        }
        if (result instanceof Response) {
          return {
            ...ctx,
            result
          };
        }
        if (!result) {
          throw new Error(
            "User middleware returned undefined. You must call next() or return a result in your middlewares."
          );
        }
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error2) {
      return {
        ...ctx,
        error: error2
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject()
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) {
      throw new Error(
        `Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`
      );
    }
    middleware.forEach((m) => {
      if (m.options.middleware) {
        recurse(m.options.middleware, depth + 1);
      }
      if (!seen.has(m)) {
        seen.add(m);
        flattened.push(m);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues)
      throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) {
    return validator.parse(input);
  }
  if (typeof validator === "function") {
    return validator(input);
  }
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.inputValidator,
      client: async ({ next, sendContext, ...ctx }) => {
        const payload = {
          ...ctx,
          // switch the sendContext over to context
          context: sendContext
        };
        const res = await options.extractedFn?.(payload);
        return next(res);
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
function getDefaultSerovalPlugins() {
  const start = getStartOptions();
  const adapters = start?.serializationAdapters;
  return [
    ...adapters?.map(makeSerovalPlugin) ?? [],
    ...defaultSerovalPlugins
  ];
}
const GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
const globalObj = globalThis;
if (!globalObj[GLOBAL_EVENT_STORAGE_KEY]) {
  globalObj[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
}
const eventStorage = globalObj[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") {
    return headersWithSetCookie.getSetCookie();
  }
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) {
    return;
  }
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) {
    return;
  }
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) {
    response.headers.append("set-cookie", cookie);
  }
  for (const cookie of eventSetCookies) {
    response.headers.append("set-cookie", cookie);
  }
}
function attachResponseHeaders(value, event) {
  if (isPromiseLike(value)) {
    return value.then((resolved) => {
      if (resolved instanceof Response) {
        mergeEventResponseHeaders(resolved, event);
      }
      return resolved;
    });
  }
  if (value instanceof Response) {
    mergeEventResponseHeaders(value, event);
  }
  return value;
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    const h3Event = new H3Event(request);
    const response = eventStorage.run(
      { h3Event },
      () => handler(request, requestOpts)
    );
    return toResponse(attachResponseHeaders(response, h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) {
    throw new Error(
      `No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`
    );
  }
  return event.h3Event;
}
function getRequest() {
  const event = getH3Event();
  return event.req;
}
function setCookie(name, value, options) {
  const event = getH3Event();
  setCookie$1(event, name, value, options);
}
function getResponse() {
  const event = getH3Event();
  return event.res;
}
async function getStartManifest(matchedRoutes) {
  const { tsrStartManifest } = await import("./_tanstack-start-manifest_v-DCHAqReE.mjs");
  const startManifest = tsrStartManifest();
  const rootRoute = startManifest.routes[rootRouteId] = startManifest.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  let script = `import('${startManifest.clientEntry}')`;
  rootRoute.assets.push({
    tag: "script",
    attrs: {
      type: "module",
      async: true
    },
    children: script
  });
  const manifest2 = {
    routes: Object.fromEntries(
      Object.entries(startManifest.routes).flatMap(([k, v]) => {
        const result = {};
        let hasData = false;
        if (v.preloads && v.preloads.length > 0) {
          result["preloads"] = v.preloads;
          hasData = true;
        }
        if (v.assets && v.assets.length > 0) {
          result["assets"] = v.assets;
          hasData = true;
        }
        if (!hasData) {
          return [];
        }
        return [[k, result]];
      })
    )
  };
  return manifest2;
}
const textEncoder$1 = new TextEncoder();
const EMPTY_PAYLOAD = new Uint8Array(0);
function encodeFrame(type, streamId, payload) {
  const frame = new Uint8Array(FRAME_HEADER_SIZE + payload.length);
  frame[0] = type;
  frame[1] = streamId >>> 24 & 255;
  frame[2] = streamId >>> 16 & 255;
  frame[3] = streamId >>> 8 & 255;
  frame[4] = streamId & 255;
  frame[5] = payload.length >>> 24 & 255;
  frame[6] = payload.length >>> 16 & 255;
  frame[7] = payload.length >>> 8 & 255;
  frame[8] = payload.length & 255;
  frame.set(payload, FRAME_HEADER_SIZE);
  return frame;
}
function encodeJSONFrame(json2) {
  return encodeFrame(FrameType.JSON, 0, textEncoder$1.encode(json2));
}
function encodeChunkFrame(streamId, chunk) {
  return encodeFrame(FrameType.CHUNK, streamId, chunk);
}
function encodeEndFrame(streamId) {
  return encodeFrame(FrameType.END, streamId, EMPTY_PAYLOAD);
}
function encodeErrorFrame(streamId, error2) {
  const message = error2 instanceof Error ? error2.message : String(error2 ?? "Unknown error");
  return encodeFrame(FrameType.ERROR, streamId, textEncoder$1.encode(message));
}
function createMultiplexedStream(jsonStream, rawStreams) {
  let activePumps = 1 + rawStreams.size;
  let controllerRef = null;
  let cancelled = false;
  const cancelReaders = [];
  const safeEnqueue = (chunk) => {
    if (cancelled || !controllerRef) return;
    try {
      controllerRef.enqueue(chunk);
    } catch {
    }
  };
  const safeError = (err) => {
    if (cancelled || !controllerRef) return;
    try {
      controllerRef.error(err);
    } catch {
    }
  };
  const safeClose = () => {
    if (cancelled || !controllerRef) return;
    try {
      controllerRef.close();
    } catch {
    }
  };
  const checkComplete = () => {
    activePumps--;
    if (activePumps === 0) {
      safeClose();
    }
  };
  return new ReadableStream({
    start(controller) {
      controllerRef = controller;
      cancelReaders.length = 0;
      const pumpJSON = async () => {
        const reader = jsonStream.getReader();
        cancelReaders.push(() => {
          reader.cancel().catch(() => {
          });
        });
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (cancelled) break;
            if (done) break;
            safeEnqueue(encodeJSONFrame(value));
          }
        } catch (error2) {
          safeError(error2);
        } finally {
          reader.releaseLock();
          checkComplete();
        }
      };
      const pumpRawStream = async (streamId, stream) => {
        const reader = stream.getReader();
        cancelReaders.push(() => {
          reader.cancel().catch(() => {
          });
        });
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (cancelled) break;
            if (done) {
              safeEnqueue(encodeEndFrame(streamId));
              break;
            }
            safeEnqueue(encodeChunkFrame(streamId, value));
          }
        } catch (error2) {
          safeEnqueue(encodeErrorFrame(streamId, error2));
        } finally {
          reader.releaseLock();
          checkComplete();
        }
      };
      pumpJSON();
      for (const [streamId, stream] of rawStreams) {
        pumpRawStream(streamId, stream);
      }
    },
    cancel() {
      cancelled = true;
      controllerRef = null;
      for (const cancelReader of cancelReaders) {
        cancelReader();
      }
      cancelReaders.length = 0;
    }
  });
}
const manifest = { "95157ba31abb992c00ac2beccb2e4247e5ba2ecf450dbdb41c4d45752298083c": {
  functionName: "getSession_createServerFn_handler",
  importer: () => import("./auth-functions-C9BkoNNR.mjs")
}, "20ecea8294f2158adc9b747f57e5d2e5b4fd03546b8824c5554b9eefac8adea9": {
  functionName: "startWizard_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "c0fda15e75929864f177f54e5e8294d5792bcdbe988530574f2cd6486897430b": {
  functionName: "refineActions_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "09effb21f8e46823d03380fea19a542d6a3235d1c0a1ed8c23670c6f7949ec53": {
  functionName: "confirmActions_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "e3d39b5332d946ce5c426829915767cf5e584ec73ab2e1dac4ba9c43f71f2ca2": {
  functionName: "configureAuth_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "6d03678a1c2be2d629c336cfe0a10cdb99a73b1af5687819f32b0da19c89b9df": {
  functionName: "generateCode_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "0cffd6209fa817f9ed662cd50c116d1e5eceb9917ec24257cea6bb920b1ebda1": {
  functionName: "getWizardState_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "3971acf857fdc77781879ff6c71d26423e0bcb6f788a10446019471bce4394ca": {
  functionName: "activateServer_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "03472aabe338f62e2fc7f78b62345f374c528fdf616f1b6b4574dcaeef019750": {
  functionName: "createVPS_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "9cd4807d65e22809d81f1aaa89df3a20732710c2f92ca81360660209aad726a5": {
  functionName: "getTierInfo_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "333c2a7e1a8f06223cccea35aef6e21eeaf0250609d410915d4e5f07c0d32be8": {
  functionName: "listUserServers_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "b1d6df5d85e04231bbb8f605f039ce817862fb2c25e66eb62814c93fcfc96094": {
  functionName: "getServerDetailsById_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
}, "1937635825b640b99909e31eacec673b6a0c2c8207f369c69b09c3331f0546c9": {
  functionName: "deleteServerById_createServerFn_handler",
  importer: () => import("./wizard-functions-BSllm7s6.mjs")
} };
async function getServerFnById(id) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = await serverFnInfo.importer();
  if (!fnModule) {
    console.info("serverFnInfo", serverFnInfo);
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    console.info("serverFnInfo", serverFnInfo);
    console.info("fnModule", fnModule);
    throw new Error(
      `Server function module export not resolved for serverFn ID: ${id}`
    );
  }
  return action;
}
let serovalPlugins = void 0;
const textEncoder = new TextEncoder();
const FORM_DATA_CONTENT_TYPES = [
  "multipart/form-data",
  "application/x-www-form-urlencoded"
];
const MAX_PAYLOAD_SIZE = 1e6;
const handleServerAction = async ({
  request,
  context,
  serverFnId
}) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort);
  const method = request.method;
  const methodLower = method.toLowerCase();
  const url = new URL(request.url);
  const action = await getServerFnById(serverFnId);
  const isServerFn = request.headers.get("x-tsr-serverFn") === "true";
  if (!serovalPlugins) {
    serovalPlugins = getDefaultSerovalPlugins();
  }
  const contentType = request.headers.get("Content-Type");
  function parsePayload(payload) {
    const parsedPayload = du(payload, { plugins: serovalPlugins });
    return parsedPayload;
  }
  const response = await (async () => {
    try {
      let serializeResult = function(res2) {
        let nonStreamingBody = void 0;
        const alsResponse = getResponse();
        if (res2 !== void 0) {
          const rawStreams = /* @__PURE__ */ new Map();
          const rawStreamPlugin = createRawStreamRPCPlugin(
            (id, stream2) => {
              rawStreams.set(id, stream2);
            }
          );
          const plugins = [rawStreamPlugin, ...serovalPlugins || []];
          let done = false;
          const callbacks = {
            onParse: (value) => {
              nonStreamingBody = value;
            },
            onDone: () => {
              done = true;
            },
            onError: (error2) => {
              throw error2;
            }
          };
          $i(res2, {
            refs: /* @__PURE__ */ new Map(),
            plugins,
            onParse(value) {
              callbacks.onParse(value);
            },
            onDone() {
              callbacks.onDone();
            },
            onError: (error2) => {
              callbacks.onError(error2);
            }
          });
          if (done && rawStreams.size === 0) {
            return new Response(
              nonStreamingBody ? JSON.stringify(nonStreamingBody) : void 0,
              {
                status: alsResponse.status,
                statusText: alsResponse.statusText,
                headers: {
                  "Content-Type": "application/json",
                  [X_TSS_SERIALIZED]: "true"
                }
              }
            );
          }
          if (rawStreams.size > 0) {
            const jsonStream = new ReadableStream({
              start(controller2) {
                callbacks.onParse = (value) => {
                  controller2.enqueue(JSON.stringify(value) + "\n");
                };
                callbacks.onDone = () => {
                  try {
                    controller2.close();
                  } catch {
                  }
                };
                callbacks.onError = (error2) => controller2.error(error2);
                if (nonStreamingBody !== void 0) {
                  callbacks.onParse(nonStreamingBody);
                }
              }
            });
            const multiplexedStream = createMultiplexedStream(
              jsonStream,
              rawStreams
            );
            return new Response(multiplexedStream, {
              status: alsResponse.status,
              statusText: alsResponse.statusText,
              headers: {
                "Content-Type": TSS_CONTENT_TYPE_FRAMED_VERSIONED,
                [X_TSS_SERIALIZED]: "true"
              }
            });
          }
          const stream = new ReadableStream({
            start(controller2) {
              callbacks.onParse = (value) => controller2.enqueue(
                textEncoder.encode(JSON.stringify(value) + "\n")
              );
              callbacks.onDone = () => {
                try {
                  controller2.close();
                } catch (error2) {
                  controller2.error(error2);
                }
              };
              callbacks.onError = (error2) => controller2.error(error2);
              if (nonStreamingBody !== void 0) {
                callbacks.onParse(nonStreamingBody);
              }
            }
          });
          return new Response(stream, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": "application/x-ndjson",
              [X_TSS_SERIALIZED]: "true"
            }
          });
        }
        return new Response(void 0, {
          status: alsResponse.status,
          statusText: alsResponse.statusText
        });
      };
      let res = await (async () => {
        if (FORM_DATA_CONTENT_TYPES.some(
          (type) => contentType && contentType.includes(type)
        )) {
          invariant(
            methodLower !== "get",
            "GET requests with FormData payloads are not supported"
          );
          const formData = await request.formData();
          const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
          formData.delete(TSS_FORMDATA_CONTEXT);
          const params = {
            context,
            data: formData
          };
          if (typeof serializedContext === "string") {
            try {
              const parsedContext = JSON.parse(serializedContext);
              const deserializedContext = du(parsedContext, {
                plugins: serovalPlugins
              });
              if (typeof deserializedContext === "object" && deserializedContext) {
                params.context = safeObjectMerge(
                  context,
                  deserializedContext
                );
              }
            } catch (e) {
              if (false) ;
            }
          }
          return await action(params, signal);
        }
        if (methodLower === "get") {
          const payloadParam = url.searchParams.get("payload");
          if (payloadParam && payloadParam.length > MAX_PAYLOAD_SIZE) {
            throw new Error("Payload too large");
          }
          const payload2 = payloadParam ? parsePayload(JSON.parse(payloadParam)) : {};
          payload2.context = safeObjectMerge(context, payload2.context);
          return await action(payload2, signal);
        }
        if (methodLower !== "post") {
          throw new Error("expected POST method");
        }
        let jsonPayload;
        if (contentType?.includes("application/json")) {
          jsonPayload = await request.json();
        }
        const payload = jsonPayload ? parsePayload(jsonPayload) : {};
        payload.context = safeObjectMerge(payload.context, context);
        return await action(payload, signal);
      })();
      const unwrapped = res.result || res.error;
      if (isNotFound(res)) {
        res = isNotFoundResponse(res);
      }
      if (!isServerFn) {
        return unwrapped;
      }
      if (unwrapped instanceof Response) {
        if (isRedirect(unwrapped)) {
          return unwrapped;
        }
        unwrapped.headers.set(X_TSS_RAW_RESPONSE, "true");
        return unwrapped;
      }
      return serializeResult(res);
    } catch (error2) {
      if (error2 instanceof Response) {
        return error2;
      }
      if (isNotFound(error2)) {
        return isNotFoundResponse(error2);
      }
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error2);
      console.info();
      const serializedError = JSON.stringify(
        await Promise.resolve(
          Zi(error2, {
            refs: /* @__PURE__ */ new Map(),
            plugins: serovalPlugins
          })
        )
      );
      const response2 = getResponse();
      return new Response(serializedError, {
        status: response2.status ?? 500,
        statusText: response2.statusText,
        headers: {
          "Content-Type": "application/json",
          [X_TSS_SERIALIZED]: "true"
        }
      });
    }
  })();
  request.signal.removeEventListener("abort", abort);
  return response;
};
function isNotFoundResponse(error2) {
  const { headers, ...rest } = error2;
  return new Response(JSON.stringify(rest), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
const HEADERS = {
  TSS_SHELL: "X-TSS_SHELL"
};
const ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v) => {
    if (typeof v !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v)) return false;
    return !!v[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ serverFnMeta }) => ({ functionId: serverFnMeta.id }),
  fromSerializable: ({ functionId }) => {
    const fn = async (opts, signal) => {
      const serverFn = await getServerFnById(functionId);
      const result = await serverFn(opts ?? {}, signal);
      return result.result;
    };
    return fn;
  }
});
function getStartResponseHeaders(opts) {
  const headers = mergeHeaders(
    {
      "Content-Type": "text/html; charset=utf-8"
    },
    ...opts.router.state.matches.map((match) => {
      return match.headers;
    })
  );
  return headers;
}
let entriesPromise;
let manifestPromise;
async function loadEntries() {
  const routerEntry = await import("./router-Z-nK48G6.mjs").then((n) => n.r);
  const startEntry = await import("./start-HYkvq4Ni.mjs");
  return { startEntry, routerEntry };
}
function getEntries() {
  if (!entriesPromise) {
    entriesPromise = loadEntries();
  }
  return entriesPromise;
}
function getManifest(matchedRoutes) {
  if (!manifestPromise) {
    manifestPromise = getStartManifest();
  }
  return manifestPromise;
}
const ROUTER_BASEPATH = "/";
const SERVER_FN_BASE = "/_serverFn/";
const IS_PRERENDERING = process.env.TSS_PRERENDERING === "true";
const IS_SHELL_ENV = process.env.TSS_SHELL === "true";
const ERR_NO_RESPONSE = "Internal Server Error";
const ERR_NO_DEFER = "Internal Server Error";
function throwRouteHandlerError() {
  throw new Error(ERR_NO_RESPONSE);
}
function throwIfMayNotDefer() {
  throw new Error(ERR_NO_DEFER);
}
function isSpecialResponse(value) {
  return value instanceof Response || isRedirect(value);
}
function handleCtxResult(result) {
  if (isSpecialResponse(result)) {
    return { response: result };
  }
  return result;
}
function executeMiddleware(middlewares, ctx) {
  let index = -1;
  const next = async (nextCtx) => {
    if (nextCtx) {
      if (nextCtx.context) {
        ctx.context = safeObjectMerge(ctx.context, nextCtx.context);
      }
      for (const key of Object.keys(nextCtx)) {
        if (key !== "context") {
          ctx[key] = nextCtx[key];
        }
      }
    }
    index++;
    const middleware = middlewares[index];
    if (!middleware) return ctx;
    let result;
    try {
      result = await middleware({ ...ctx, next });
    } catch (err) {
      if (isSpecialResponse(err)) {
        ctx.response = err;
        return ctx;
      }
      throw err;
    }
    const normalized = handleCtxResult(result);
    if (normalized) {
      if (normalized.response !== void 0) {
        ctx.response = normalized.response;
      }
      if (normalized.context) {
        ctx.context = safeObjectMerge(ctx.context, normalized.context);
      }
    }
    return ctx;
  };
  return next();
}
function handlerToMiddleware(handler, mayDefer = false) {
  if (mayDefer) {
    return handler;
  }
  return async (ctx) => {
    const response = await handler({ ...ctx, next: throwIfMayNotDefer });
    if (!response) {
      throwRouteHandlerError();
    }
    return response;
  };
}
function createStartHandler(cb) {
  const startRequestResolver = async (request, requestOpts) => {
    let router2 = null;
    let cbWillCleanup = false;
    try {
      const url = new URL(request.url);
      const href = url.href.replace(url.origin, "");
      const origin = getOrigin$1(request);
      const entries = await getEntries();
      const startOptions = await entries.startEntry.startInstance?.getOptions() || {};
      const serializationAdapters = [
        ...startOptions.serializationAdapters || [],
        ServerFunctionSerializationAdapter
      ];
      const requestStartOptions = {
        ...startOptions,
        serializationAdapters
      };
      const flattenedRequestMiddlewares = startOptions.requestMiddleware ? flattenMiddlewares(startOptions.requestMiddleware) : [];
      const executedRequestMiddlewares = new Set(
        flattenedRequestMiddlewares
      );
      const getRouter = async () => {
        if (router2) return router2;
        router2 = await entries.routerEntry.getRouter();
        let isShell = IS_SHELL_ENV;
        if (IS_PRERENDERING && !isShell) {
          isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
        }
        const history = createMemoryHistory({
          initialEntries: [href]
        });
        router2.update({
          history,
          isShell,
          isPrerendering: IS_PRERENDERING,
          origin: router2.options.origin ?? origin,
          ...{
            defaultSsr: requestStartOptions.defaultSsr,
            serializationAdapters: [
              ...requestStartOptions.serializationAdapters,
              ...router2.options.serializationAdapters || []
            ]
          },
          basepath: ROUTER_BASEPATH
        });
        return router2;
      };
      if (SERVER_FN_BASE && url.pathname.startsWith(SERVER_FN_BASE)) {
        const serverFnId = url.pathname.slice(SERVER_FN_BASE.length).split("/")[0];
        if (!serverFnId) {
          throw new Error("Invalid server action param for serverFnId");
        }
        const serverFnHandler = async ({ context }) => {
          return runWithStartContext(
            {
              getRouter,
              startOptions: requestStartOptions,
              contextAfterGlobalMiddlewares: context,
              request,
              executedRequestMiddlewares
            },
            () => handleServerAction({
              request,
              context: requestOpts?.context,
              serverFnId
            })
          );
        };
        const middlewares2 = flattenedRequestMiddlewares.map(
          (d) => d.options.server
        );
        const ctx2 = await executeMiddleware([...middlewares2, serverFnHandler], {
          request,
          context: createNullProtoObject(requestOpts?.context)
        });
        return handleRedirectResponse(ctx2.response, request, getRouter);
      }
      const executeRouter = async (serverContext, matchedRoutes) => {
        const acceptHeader = request.headers.get("Accept") || "*/*";
        const acceptParts = acceptHeader.split(",");
        const supportedMimeTypes = ["*/*", "text/html"];
        const isSupported = supportedMimeTypes.some(
          (mimeType) => acceptParts.some((part) => part.trim().startsWith(mimeType))
        );
        if (!isSupported) {
          return Response.json(
            { error: "Only HTML requests are supported here" },
            { status: 500 }
          );
        }
        const manifest2 = await getManifest(matchedRoutes);
        const routerInstance = await getRouter();
        attachRouterServerSsrUtils({
          router: routerInstance,
          manifest: manifest2
        });
        routerInstance.update({ additionalContext: { serverContext } });
        await routerInstance.load();
        if (routerInstance.state.redirect) {
          return routerInstance.state.redirect;
        }
        await routerInstance.serverSsr.dehydrate();
        const responseHeaders = getStartResponseHeaders({
          router: routerInstance
        });
        cbWillCleanup = true;
        return cb({
          request,
          router: routerInstance,
          responseHeaders
        });
      };
      const requestHandlerMiddleware = async ({ context }) => {
        return runWithStartContext(
          {
            getRouter,
            startOptions: requestStartOptions,
            contextAfterGlobalMiddlewares: context,
            request,
            executedRequestMiddlewares
          },
          async () => {
            try {
              return await handleServerRoutes({
                getRouter,
                request,
                url,
                executeRouter,
                context,
                executedRequestMiddlewares
              });
            } catch (err) {
              if (err instanceof Response) {
                return err;
              }
              throw err;
            }
          }
        );
      };
      const middlewares = flattenedRequestMiddlewares.map(
        (d) => d.options.server
      );
      const ctx = await executeMiddleware(
        [...middlewares, requestHandlerMiddleware],
        { request, context: createNullProtoObject(requestOpts?.context) }
      );
      return handleRedirectResponse(ctx.response, request, getRouter);
    } finally {
      if (router2 && !cbWillCleanup) {
        router2.serverSsr?.cleanup();
      }
      router2 = null;
    }
  };
  return requestHandler(startRequestResolver);
}
async function handleRedirectResponse(response, request, getRouter) {
  if (!isRedirect(response)) {
    return response;
  }
  if (isResolvedRedirect(response)) {
    if (request.headers.get("x-tsr-serverFn") === "true") {
      return Response.json(
        { ...response.options, isSerializedRedirect: true },
        { headers: response.headers }
      );
    }
    return response;
  }
  const opts = response.options;
  if (opts.to && typeof opts.to === "string" && !opts.to.startsWith("/")) {
    throw new Error(
      `Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(opts)}`
    );
  }
  if (["params", "search", "hash"].some(
    (d) => typeof opts[d] === "function"
  )) {
    throw new Error(
      `Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(
        opts
      ).filter((d) => typeof opts[d] === "function").map((d) => `"${d}"`).join(", ")}`
    );
  }
  const router2 = await getRouter();
  const redirect = router2.resolveRedirect(response);
  if (request.headers.get("x-tsr-serverFn") === "true") {
    return Response.json(
      { ...response.options, isSerializedRedirect: true },
      { headers: response.headers }
    );
  }
  return redirect;
}
async function handleServerRoutes({
  getRouter,
  request,
  url,
  executeRouter,
  context,
  executedRequestMiddlewares
}) {
  const router2 = await getRouter();
  const rewrittenUrl = executeRewriteInput(router2.rewrite, url);
  const pathname = rewrittenUrl.pathname;
  const { matchedRoutes, foundRoute, routeParams } = router2.getMatchedRoutes(pathname);
  const isExactMatch = foundRoute && routeParams["**"] === void 0;
  const routeMiddlewares = [];
  for (const route of matchedRoutes) {
    const serverMiddleware = route.options.server?.middleware;
    if (serverMiddleware) {
      const flattened = flattenMiddlewares(serverMiddleware);
      for (const m of flattened) {
        if (!executedRequestMiddlewares.has(m)) {
          routeMiddlewares.push(m.options.server);
        }
      }
    }
  }
  const server2 = foundRoute?.options.server;
  if (server2?.handlers && isExactMatch) {
    const handlers = typeof server2.handlers === "function" ? server2.handlers({ createHandlers: (d) => d }) : server2.handlers;
    const requestMethod = request.method.toUpperCase();
    const handler = handlers[requestMethod] ?? handlers["ANY"];
    if (handler) {
      const mayDefer = !!foundRoute.options.component;
      if (typeof handler === "function") {
        routeMiddlewares.push(handlerToMiddleware(handler, mayDefer));
      } else {
        if (handler.middleware?.length) {
          const handlerMiddlewares = flattenMiddlewares(handler.middleware);
          for (const m of handlerMiddlewares) {
            routeMiddlewares.push(m.options.server);
          }
        }
        if (handler.handler) {
          routeMiddlewares.push(handlerToMiddleware(handler.handler, mayDefer));
        }
      }
    }
  }
  routeMiddlewares.push(
    (ctx2) => executeRouter(ctx2.context, matchedRoutes)
  );
  const ctx = await executeMiddleware(routeMiddlewares, {
    request,
    context,
    params: routeParams,
    pathname
  });
  return ctx.response;
}
const fetch = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
  return {
    async fetch(...args) {
      return await entry.fetch(...args);
    }
  };
}
const server$1 = createServerEntry({ fetch });
const baseLocale = "en";
const locales = (
  /** @type {const} */
  ["en", "de"]
);
const strategy = [
  "url"
];
let serverAsyncLocalStorage = void 0;
function overwriteServerAsyncLocalStorage(value) {
  serverAsyncLocalStorage = value;
}
globalThis.__paraglide = {};
let _locale;
let localeInitiallySet = false;
let getLocale = () => {
  let locale;
  if (serverAsyncLocalStorage) {
    const locale2 = serverAsyncLocalStorage?.getStore()?.locale;
    if (locale2) {
      return locale2;
    }
  }
  for (const strat of strategy) {
    if (strat === "baseLocale") {
      locale = baseLocale;
    } else if (isCustomStrategy(strat) && customClientStrategies.has(strat)) {
      const handler = customClientStrategies.get(strat);
      if (handler) {
        const result = handler.getLocale();
        if (result instanceof Promise) {
          continue;
        }
        locale = result;
      }
    }
    if (locale !== void 0) {
      const asserted = assertIsLocale(locale);
      if (!localeInitiallySet) {
        _locale = asserted;
        localeInitiallySet = true;
        setLocale(asserted, { reload: false });
      }
      return asserted;
    }
  }
  throw new Error("No locale found. Read the docs https://inlang.com/m/gerre34r/library-inlang-paraglideJs/errors#no-locale-found");
};
let setLocale = (newLocale, options) => {
  ({
    ...options
  });
  let currentLocale;
  try {
    currentLocale = getLocale();
  } catch {
  }
  const customSetLocalePromises = [];
  for (const strat of strategy) {
    if (strat === "baseLocale") {
      continue;
    } else if (strat === "url" && typeof window !== "undefined") {
      localizeUrl(window.location.href, {
        locale: newLocale
      }).href;
    } else if (isCustomStrategy(strat) && customClientStrategies.has(strat)) {
      const handler = customClientStrategies.get(strat);
      if (handler) {
        let result = handler.setLocale(newLocale);
        if (result instanceof Promise) {
          result = result.catch((error2) => {
            throw new Error(`Custom strategy "${strat}" setLocale failed.`, {
              cause: error2
            });
          });
          customSetLocalePromises.push(result);
        }
      }
    }
  }
  if (customSetLocalePromises.length) {
    return Promise.all(customSetLocalePromises).then(() => {
    });
  }
  return;
};
let getUrlOrigin = () => {
  if (serverAsyncLocalStorage) {
    return serverAsyncLocalStorage.getStore()?.origin ?? "http://fallback.com";
  } else if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://fallback.com";
};
function isLocale(locale) {
  if (typeof locale !== "string")
    return false;
  return !locale ? false : locales.some((item) => item.toLowerCase() === locale.toLowerCase());
}
function assertIsLocale(input) {
  if (typeof input !== "string") {
    throw new Error(`Invalid locale: ${input}. Expected a string.`);
  }
  const lowerInput = input.toLowerCase();
  const matchedLocale = locales.find((item) => item.toLowerCase() === lowerInput);
  if (!matchedLocale) {
    throw new Error(`Invalid locale: ${input}. Expected one of: ${locales.join(", ")}`);
  }
  return matchedLocale;
}
const extractLocaleFromRequest = (request) => {
  let locale;
  for (const strat of strategy) {
    if (strat === "url") {
      locale = extractLocaleFromUrl(request.url);
    } else if (strat === "globalVariable") {
      locale = _locale;
    } else if (strat === "baseLocale") {
      return baseLocale;
    } else if (strat === "localStorage") {
      continue;
    } else if (isCustomStrategy(strat)) {
      continue;
    }
    if (locale !== void 0) {
      if (!isLocale(locale)) {
        locale = void 0;
      } else {
        return assertIsLocale(locale);
      }
    }
  }
  throw new Error("No locale found. There is an error in your strategy. Try adding 'baseLocale' as the very last strategy. Read more here https://inlang.com/m/gerre34r/library-inlang-paraglideJs/errors#no-locale-found");
};
const extractLocaleFromRequestAsync = async (request) => {
  let locale;
  for (const strat of strategy) {
    if (isCustomStrategy(strat) && customServerStrategies.has(strat)) {
      const handler = customServerStrategies.get(strat);
      if (handler) {
        locale = await handler.getLocale(request);
      }
      if (locale !== void 0 && isLocale(locale)) {
        return assertIsLocale(locale);
      }
    }
  }
  locale = extractLocaleFromRequest(request);
  return assertIsLocale(locale);
};
let cachedUrl;
let cachedLocale;
function extractLocaleFromUrl(url) {
  const urlString = typeof url === "string" ? url : url.href;
  if (cachedUrl === urlString) {
    return cachedLocale;
  }
  let result;
  {
    result = defaultUrlPatternExtractLocale(url);
  }
  cachedUrl = urlString;
  cachedLocale = result;
  return result;
}
function defaultUrlPatternExtractLocale(url) {
  const urlObj = new URL(url, "http://dummy.com");
  const pathSegments = urlObj.pathname.split("/").filter(Boolean);
  if (pathSegments.length > 0) {
    const potentialLocale = pathSegments[0];
    if (isLocale(potentialLocale)) {
      return potentialLocale;
    }
  }
  return baseLocale;
}
function localizeUrl(url, options) {
  {
    return localizeUrlDefaultPattern(url, options);
  }
}
function localizeUrlDefaultPattern(url, options) {
  const urlObj = typeof url === "string" ? new URL(url, getUrlOrigin()) : new URL(url);
  const locale = options?.locale ?? getLocale();
  const currentLocale = extractLocaleFromUrl(urlObj);
  if (currentLocale === locale) {
    return urlObj;
  }
  const pathSegments = urlObj.pathname.split("/").filter(Boolean);
  if (pathSegments.length > 0 && isLocale(pathSegments[0])) {
    pathSegments.shift();
  }
  if (locale === baseLocale) {
    urlObj.pathname = "/" + pathSegments.join("/");
  } else {
    urlObj.pathname = "/" + locale + "/" + pathSegments.join("/");
  }
  return urlObj;
}
function deLocalizeUrl(url) {
  {
    return deLocalizeUrlDefaultPattern(url);
  }
}
function deLocalizeUrlDefaultPattern(url) {
  const urlObj = typeof url === "string" ? new URL(url, getUrlOrigin()) : new URL(url);
  const pathSegments = urlObj.pathname.split("/").filter(Boolean);
  if (pathSegments.length > 0 && isLocale(pathSegments[0])) {
    urlObj.pathname = "/" + pathSegments.slice(1).join("/");
  }
  return urlObj;
}
async function shouldRedirect(input = {}) {
  const locale = (
    /** @type {ReturnType<typeof assertIsLocale>} */
    await resolveLocale(input)
  );
  if (!strategy.includes("url")) {
    return { shouldRedirect: false, locale, redirectUrl: void 0 };
  }
  const currentUrl = resolveUrl(input);
  const localizedUrl = localizeUrl(currentUrl.href, { locale });
  const shouldRedirectToLocalizedUrl = normalizeUrl(localizedUrl.href) !== normalizeUrl(currentUrl.href);
  return {
    shouldRedirect: shouldRedirectToLocalizedUrl,
    locale,
    redirectUrl: shouldRedirectToLocalizedUrl ? localizedUrl : void 0
  };
}
async function resolveLocale(input) {
  if (input.locale) {
    return assertIsLocale(input.locale);
  }
  if (input.request) {
    return extractLocaleFromRequestAsync(input.request);
  }
  return getLocale();
}
function resolveUrl(input) {
  if (input.request) {
    return new URL(input.request.url);
  }
  if (input.url instanceof URL) {
    return new URL(input.url.href);
  }
  if (typeof input.url === "string") {
    return new URL(input.url, getUrlOrigin());
  }
  if (typeof window !== "undefined" && window?.location?.href) {
    return new URL(window.location.href);
  }
  throw new Error("shouldRedirect() requires either a request, an absolute URL, or must run in a browser environment.");
}
function normalizeUrl(url) {
  const urlObj = new URL(url);
  urlObj.pathname = urlObj.pathname.replace(/\/$/, "");
  return urlObj.href;
}
function trackMessageCall(safeModuleId, locale) {
  const store = serverAsyncLocalStorage?.getStore();
  if (store) {
    store.messageCalls?.add(`${safeModuleId}:${locale}`);
  }
}
const customServerStrategies = /* @__PURE__ */ new Map();
const customClientStrategies = /* @__PURE__ */ new Map();
function isCustomStrategy(strategy2) {
  return typeof strategy2 === "string" && /^custom-[A-Za-z0-9_-]+$/.test(strategy2);
}
async function paraglideMiddleware(request, resolve, callbacks) {
  if (!serverAsyncLocalStorage) {
    const { AsyncLocalStorage: AsyncLocalStorage2 } = await import("async_hooks");
    overwriteServerAsyncLocalStorage(new AsyncLocalStorage2());
  } else if (!serverAsyncLocalStorage) {
    overwriteServerAsyncLocalStorage(createMockAsyncLocalStorage());
  }
  const decision = await shouldRedirect({ request });
  const locale = decision.locale;
  const origin = new URL(request.url).origin;
  if (request.headers.get("Sec-Fetch-Dest") === "document" && decision.shouldRedirect && decision.redirectUrl) {
    const headers = {};
    if (strategy.includes("preferredLanguage")) {
      headers["Vary"] = "Accept-Language";
    }
    const response2 = new Response(null, {
      status: 307,
      headers: {
        Location: decision.redirectUrl.href,
        ...headers
      }
    });
    return response2;
  }
  let newRequest;
  if (strategy.includes("url")) {
    newRequest = new Request(deLocalizeUrl(request.url), request);
  } else {
    try {
      newRequest = new Request(request);
    } catch {
      newRequest = request;
    }
  }
  const messageCalls = /* @__PURE__ */ new Set();
  const response = await serverAsyncLocalStorage?.run({ locale, origin, messageCalls }, () => resolve({ locale, request: newRequest }));
  return response;
}
function createMockAsyncLocalStorage() {
  let currentStore = void 0;
  return {
    getStore() {
      return currentStore;
    },
    async run(store, callback) {
      currentStore = store;
      try {
        return await callback();
      } finally {
        currentStore = void 0;
      }
    }
  };
}
const AsyncLocalStoragePromise = import(
  /* @vite-ignore */
  /* webpackIgnore: true */
  "node:async_hooks"
).then((mod) => mod.AsyncLocalStorage).catch((err) => {
  if ("AsyncLocalStorage" in globalThis) return globalThis.AsyncLocalStorage;
  if (typeof window !== "undefined") return null;
  console.warn("[better-auth] Warning: AsyncLocalStorage is not available in this environment. Some features may not work as expected.");
  console.warn("[better-auth] Please read more about this warning at https://better-auth.com/docs/installation#mount-handler");
  console.warn("[better-auth] If you are using Cloudflare Workers, please see: https://developers.cloudflare.com/workers/configuration/compatibility-flags/#nodejs-compatibility-flag");
  throw err;
});
async function getAsyncLocalStorage() {
  const mod = await AsyncLocalStoragePromise;
  if (mod === null) throw new Error("getAsyncLocalStorage is only available in server code");
  else return mod;
}
const symbol$2 = /* @__PURE__ */ Symbol.for("better-auth:endpoint-context-async-storage");
let currentContextAsyncStorage = null;
const ensureAsyncStorage$2 = async () => {
  if (!currentContextAsyncStorage || globalThis[symbol$2] === void 0) {
    currentContextAsyncStorage = new (await getAsyncLocalStorage())();
    globalThis[symbol$2] = currentContextAsyncStorage;
  }
  return currentContextAsyncStorage || globalThis[symbol$2];
};
async function getCurrentAuthContext() {
  const context = (await ensureAsyncStorage$2()).getStore();
  if (!context) throw new Error("No auth context found. Please make sure you are calling this function within a `runWithEndpointContext` callback.");
  return context;
}
async function runWithEndpointContext(context, fn) {
  return (await ensureAsyncStorage$2()).run(context, fn);
}
const symbol$1 = /* @__PURE__ */ Symbol.for("better-auth:request-state-async-storage");
let requestStateAsyncStorage = null;
const ensureAsyncStorage$1 = async () => {
  if (!requestStateAsyncStorage || globalThis[symbol$1] === void 0) {
    requestStateAsyncStorage = new (await getAsyncLocalStorage())();
    globalThis[symbol$1] = requestStateAsyncStorage;
  }
  return requestStateAsyncStorage || globalThis[symbol$1];
};
async function hasRequestState() {
  return (await ensureAsyncStorage$1()).getStore() !== void 0;
}
async function getCurrentRequestState() {
  const store = (await ensureAsyncStorage$1()).getStore();
  if (!store) throw new Error("No request state found. Please make sure you are calling this function within a `runWithRequestState` callback.");
  return store;
}
async function runWithRequestState(store, fn) {
  return (await ensureAsyncStorage$1()).run(store, fn);
}
function defineRequestState(initFn) {
  const ref = Object.freeze({});
  return {
    get ref() {
      return ref;
    },
    async get() {
      const store = await getCurrentRequestState();
      if (!store.has(ref)) {
        const initialValue = await initFn();
        store.set(ref, initialValue);
        return initialValue;
      }
      return store.get(ref);
    },
    async set(value) {
      (await getCurrentRequestState()).set(ref, value);
    }
  };
}
const symbol = /* @__PURE__ */ Symbol.for("better-auth:transaction-adapter-async-storage");
let currentAdapterAsyncStorage = null;
const ensureAsyncStorage = async () => {
  if (!currentAdapterAsyncStorage || globalThis[symbol] === void 0) {
    currentAdapterAsyncStorage = new (await getAsyncLocalStorage())();
    globalThis[symbol] = currentAdapterAsyncStorage;
  }
  return currentAdapterAsyncStorage || globalThis[symbol];
};
const getCurrentAdapter = async (fallback) => {
  return ensureAsyncStorage().then((als) => {
    return als.getStore() || fallback;
  }).catch(() => {
    return fallback;
  });
};
const runWithAdapter = async (adapter, fn) => {
  let called = true;
  return ensureAsyncStorage().then((als) => {
    called = true;
    return als.run(adapter, fn);
  }).catch((err) => {
    if (!called) return fn();
    throw err;
  });
};
const runWithTransaction = async (adapter, fn) => {
  let called = true;
  return ensureAsyncStorage().then((als) => {
    called = true;
    return adapter.transaction(async (trx) => {
      return als.run(trx, fn);
    });
  }).catch((err) => {
    if (!called) return fn();
    throw err;
  });
};
const { set: setOAuthState } = defineRequestState(() => null);
const generateRandomString = createRandomStringGenerator("a-z", "0-9", "A-Z", "-_");
function constantTimeEqual(a, b) {
  if (typeof a === "string") a = new TextEncoder().encode(a);
  if (typeof b === "string") b = new TextEncoder().encode(b);
  const aBuffer = new Uint8Array(a);
  const bBuffer = new Uint8Array(b);
  let c = aBuffer.length ^ bBuffer.length;
  const length = Math.max(aBuffer.length, bBuffer.length);
  for (let i = 0; i < length; i++) c |= (i < aBuffer.length ? aBuffer[i] : 0) ^ (i < bBuffer.length ? bBuffer[i] : 0);
  return c === 0;
}
async function signJWT(payload, secret, expiresIn = 3600) {
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1e3) + expiresIn).sign(new TextEncoder().encode(secret));
}
async function verifyJWT(token, secret) {
  try {
    return (await jwtVerify(token, new TextEncoder().encode(secret))).payload;
  } catch {
    return null;
  }
}
const info = new Uint8Array([
  66,
  101,
  116,
  116,
  101,
  114,
  65,
  117,
  116,
  104,
  46,
  106,
  115,
  32,
  71,
  101,
  110,
  101,
  114,
  97,
  116,
  101,
  100,
  32,
  69,
  110,
  99,
  114,
  121,
  112,
  116,
  105,
  111,
  110,
  32,
  75,
  101,
  121
]);
const now = () => Date.now() / 1e3 | 0;
const alg = "dir";
const enc = "A256CBC-HS512";
async function symmetricEncodeJWT(payload, secret, salt, expiresIn = 3600) {
  const encryptionSecret = hkdf(sha256, new TextEncoder().encode(secret), new TextEncoder().encode(salt), info, 64);
  const thumbprint = await calculateJwkThumbprint({
    kty: "oct",
    k: encode(encryptionSecret)
  }, "sha256");
  return await new EncryptJWT(payload).setProtectedHeader({
    alg,
    enc,
    kid: thumbprint
  }).setIssuedAt().setExpirationTime(now() + expiresIn).setJti(crypto.randomUUID()).encrypt(encryptionSecret);
}
async function symmetricDecodeJWT(token, secret, salt) {
  if (!token) return null;
  try {
    const { payload } = await jwtDecrypt(token, async ({ kid }) => {
      const encryptionSecret = hkdf(sha256, new TextEncoder().encode(secret), new TextEncoder().encode(salt), info, 64);
      if (kid === void 0) return encryptionSecret;
      if (kid === await calculateJwkThumbprint({
        kty: "oct",
        k: encode(encryptionSecret)
      }, "sha256")) return encryptionSecret;
      throw new Error("no matching decryption secret");
    }, {
      clockTolerance: 15,
      keyManagementAlgorithms: [alg],
      contentEncryptionAlgorithms: [enc, "A256GCM"]
    });
    return payload;
  } catch {
    return null;
  }
}
const _envShim = /* @__PURE__ */ Object.create(null);
const _getEnv = (useShim) => globalThis.process?.env || globalThis.Deno?.env.toObject() || globalThis.__env__ || (useShim ? _envShim : globalThis);
const env$1 = new Proxy(_envShim, {
  get(_, prop) {
    return _getEnv()[prop] ?? _envShim[prop];
  },
  has(_, prop) {
    return prop in _getEnv() || prop in _envShim;
  },
  set(_, prop, value) {
    const env$12 = _getEnv(true);
    env$12[prop] = value;
    return true;
  },
  deleteProperty(_, prop) {
    if (!prop) return false;
    const env$12 = _getEnv(true);
    delete env$12[prop];
    return true;
  },
  ownKeys() {
    const env$12 = _getEnv(true);
    return Object.keys(env$12);
  }
});
function toBoolean(val) {
  return val ? val !== "false" : false;
}
const nodeENV = typeof process !== "undefined" && process.env && "production" || "";
const isProduction = nodeENV === "production";
const isDevelopment = () => nodeENV === "dev" || nodeENV === "development";
const isTest = () => nodeENV === "test" || toBoolean(env$1.TEST);
function getEnvVar(key, fallback) {
  if (typeof process !== "undefined" && process.env) return process.env[key] ?? fallback;
  if (typeof Deno !== "undefined") return Deno.env.get(key) ?? fallback;
  if (typeof Bun !== "undefined") return Bun.env[key] ?? fallback;
  return fallback;
}
function getBooleanEnvVar(key, fallback = true) {
  const value = getEnvVar(key);
  if (!value) return fallback;
  return value !== "0" && value.toLowerCase() !== "false" && value !== "";
}
const ENV = Object.freeze({
  get BETTER_AUTH_SECRET() {
    return getEnvVar("BETTER_AUTH_SECRET");
  },
  get AUTH_SECRET() {
    return getEnvVar("AUTH_SECRET");
  },
  get BETTER_AUTH_TELEMETRY() {
    return getEnvVar("BETTER_AUTH_TELEMETRY");
  },
  get BETTER_AUTH_TELEMETRY_ID() {
    return getEnvVar("BETTER_AUTH_TELEMETRY_ID");
  },
  get NODE_ENV() {
    return getEnvVar("NODE_ENV", "development");
  },
  get PACKAGE_VERSION() {
    return getEnvVar("PACKAGE_VERSION", "0.0.0");
  },
  get BETTER_AUTH_TELEMETRY_ENDPOINT() {
    return getEnvVar("BETTER_AUTH_TELEMETRY_ENDPOINT", "https://telemetry.better-auth.com/v1/track");
  }
});
const COLORS_2 = 1;
const COLORS_16 = 4;
const COLORS_256 = 8;
const COLORS_16m = 24;
const TERM_ENVS = {
  eterm: COLORS_16,
  cons25: COLORS_16,
  console: COLORS_16,
  cygwin: COLORS_16,
  dtterm: COLORS_16,
  gnome: COLORS_16,
  hurd: COLORS_16,
  jfbterm: COLORS_16,
  konsole: COLORS_16,
  kterm: COLORS_16,
  mlterm: COLORS_16,
  mosh: COLORS_16m,
  putty: COLORS_16,
  st: COLORS_16,
  "rxvt-unicode-24bit": COLORS_16m,
  terminator: COLORS_16m,
  "xterm-kitty": COLORS_16m
};
const CI_ENVS_MAP = new Map(Object.entries({
  APPVEYOR: COLORS_256,
  BUILDKITE: COLORS_256,
  CIRCLECI: COLORS_16m,
  DRONE: COLORS_256,
  GITEA_ACTIONS: COLORS_16m,
  GITHUB_ACTIONS: COLORS_16m,
  GITLAB_CI: COLORS_256,
  TRAVIS: COLORS_256
}));
const TERM_ENVS_REG_EXP = [
  /ansi/,
  /color/,
  /linux/,
  /direct/,
  /^con[0-9]*x[0-9]/,
  /^rxvt/,
  /^screen/,
  /^xterm/,
  /^vt100/,
  /^vt220/
];
function getColorDepth() {
  if (getEnvVar("FORCE_COLOR") !== void 0) switch (getEnvVar("FORCE_COLOR")) {
    case "":
    case "1":
    case "true":
      return COLORS_16;
    case "2":
      return COLORS_256;
    case "3":
      return COLORS_16m;
    default:
      return COLORS_2;
  }
  if (getEnvVar("NODE_DISABLE_COLORS") !== void 0 && getEnvVar("NODE_DISABLE_COLORS") !== "" || getEnvVar("NO_COLOR") !== void 0 && getEnvVar("NO_COLOR") !== "" || getEnvVar("TERM") === "dumb") return COLORS_2;
  if (getEnvVar("TMUX")) return COLORS_16m;
  if ("TF_BUILD" in env$1 && "AGENT_NAME" in env$1) return COLORS_16;
  if ("CI" in env$1) {
    for (const { 0: envName, 1: colors } of CI_ENVS_MAP) if (envName in env$1) return colors;
    if (getEnvVar("CI_NAME") === "codeship") return COLORS_256;
    return COLORS_2;
  }
  if ("TEAMCITY_VERSION" in env$1) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.exec(getEnvVar("TEAMCITY_VERSION")) !== null ? COLORS_16 : COLORS_2;
  switch (getEnvVar("TERM_PROGRAM")) {
    case "iTerm.app":
      if (!getEnvVar("TERM_PROGRAM_VERSION") || /^[0-2]\./.exec(getEnvVar("TERM_PROGRAM_VERSION")) !== null) return COLORS_256;
      return COLORS_16m;
    case "HyperTerm":
    case "MacTerm":
      return COLORS_16m;
    case "Apple_Terminal":
      return COLORS_256;
  }
  if (getEnvVar("COLORTERM") === "truecolor" || getEnvVar("COLORTERM") === "24bit") return COLORS_16m;
  if (getEnvVar("TERM")) {
    if (/truecolor/.exec(getEnvVar("TERM")) !== null) return COLORS_16m;
    if (/^xterm-256/.exec(getEnvVar("TERM")) !== null) return COLORS_256;
    const termEnv = getEnvVar("TERM").toLowerCase();
    if (TERM_ENVS[termEnv]) return TERM_ENVS[termEnv];
    if (TERM_ENVS_REG_EXP.some((term) => term.exec(termEnv) !== null)) return COLORS_16;
  }
  if (getEnvVar("COLORTERM")) return COLORS_16;
  return COLORS_2;
}
const TTY_COLORS = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  dim: "\x1B[2m",
  fg: {
    red: "\x1B[31m",
    green: "\x1B[32m",
    yellow: "\x1B[33m",
    blue: "\x1B[34m",
    magenta: "\x1B[35m"
  },
  bg: {
    black: "\x1B[40m"
  }
};
const levels = [
  "debug",
  "info",
  "success",
  "warn",
  "error"
];
function shouldPublishLog(currentLogLevel, logLevel) {
  return levels.indexOf(logLevel) >= levels.indexOf(currentLogLevel);
}
const levelColors = {
  info: TTY_COLORS.fg.blue,
  success: TTY_COLORS.fg.green,
  warn: TTY_COLORS.fg.yellow,
  error: TTY_COLORS.fg.red,
  debug: TTY_COLORS.fg.magenta
};
const formatMessage = (level, message, colorsEnabled) => {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  if (colorsEnabled) return `${TTY_COLORS.dim}${timestamp2}${TTY_COLORS.reset} ${levelColors[level]}${level.toUpperCase()}${TTY_COLORS.reset} ${TTY_COLORS.bright}[Better Auth]:${TTY_COLORS.reset} ${message}`;
  return `${timestamp2} ${level.toUpperCase()} [Better Auth]: ${message}`;
};
const createLogger = (options) => {
  const enabled = options?.disabled !== true;
  const logLevel = options?.level ?? "error";
  const colorsEnabled = options?.disableColors !== void 0 ? !options.disableColors : getColorDepth() !== 1;
  const LogFunc = (level, message, args = []) => {
    if (!enabled || !shouldPublishLog(logLevel, level)) return;
    const formattedMessage = formatMessage(level, message, colorsEnabled);
    if (!options || typeof options.log !== "function") {
      if (level === "error") console.error(formattedMessage, ...args);
      else if (level === "warn") console.warn(formattedMessage, ...args);
      else console.log(formattedMessage, ...args);
      return;
    }
    options.log(level === "success" ? "info" : level, message, ...args);
  };
  return {
    ...Object.fromEntries(levels.map((level) => [level, (...[message, ...args]) => LogFunc(level, message, args)])),
    get level() {
      return logLevel;
    }
  };
};
const logger = createLogger();
function deprecate(fn, message, logger$1) {
  let warned = false;
  return function(...args) {
    if (!warned) {
      (logger$1?.warn ?? console.warn)(`[Deprecation] ${message}`);
      warned = true;
    }
    return fn.apply(this, args);
  };
}
function defineErrorCodes(codes) {
  return codes;
}
const generateId$1 = (size) => {
  return createRandomStringGenerator("a-z", "A-Z", "0-9")(size || 32);
};
function safeJSONParse(data) {
  function reviver(_, value) {
    if (typeof value === "string") {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
        const date2 = new Date(value);
        if (!isNaN(date2.getTime())) return date2;
      }
    }
    return value;
  }
  try {
    if (typeof data !== "string") return data;
    return JSON.parse(data, reviver);
  } catch (e) {
    logger.error("Error parsing JSON", { error: e });
    return null;
  }
}
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const BASE_ERROR_CODES = defineErrorCodes({
  USER_NOT_FOUND: "User not found",
  FAILED_TO_CREATE_USER: "Failed to create user",
  FAILED_TO_CREATE_SESSION: "Failed to create session",
  FAILED_TO_UPDATE_USER: "Failed to update user",
  FAILED_TO_GET_SESSION: "Failed to get session",
  INVALID_PASSWORD: "Invalid password",
  INVALID_EMAIL: "Invalid email",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Social account already linked",
  PROVIDER_NOT_FOUND: "Provider not found",
  INVALID_TOKEN: "Invalid token",
  ID_TOKEN_NOT_SUPPORTED: "id_token not supported",
  FAILED_TO_GET_USER_INFO: "Failed to get user info",
  USER_EMAIL_NOT_FOUND: "User email not found",
  EMAIL_NOT_VERIFIED: "Email not verified",
  PASSWORD_TOO_SHORT: "Password too short",
  PASSWORD_TOO_LONG: "Password too long",
  USER_ALREADY_EXISTS: "User already exists.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "User already exists. Use another email.",
  EMAIL_CAN_NOT_BE_UPDATED: "Email can not be updated",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Credential account not found",
  SESSION_EXPIRED: "Session expired. Re-authenticate to perform this action.",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "You can't unlink your last account",
  ACCOUNT_NOT_FOUND: "Account not found",
  USER_ALREADY_HAS_PASSWORD: "User already has a password. Provide that to delete the account.",
  CROSS_SITE_NAVIGATION_LOGIN_BLOCKED: "Cross-site navigation login blocked. This request appears to be a CSRF attack.",
  VERIFICATION_EMAIL_NOT_ENABLED: "Verification email isn't enabled",
  EMAIL_ALREADY_VERIFIED: "Email is already verified",
  EMAIL_MISMATCH: "Email mismatch",
  SESSION_NOT_FRESH: "Session is not fresh",
  LINKED_ACCOUNT_ALREADY_EXISTS: "Linked account already exists",
  INVALID_ORIGIN: "Invalid origin",
  INVALID_CALLBACK_URL: "Invalid callbackURL",
  INVALID_REDIRECT_URL: "Invalid redirectURL",
  INVALID_ERROR_CALLBACK_URL: "Invalid errorCallbackURL",
  INVALID_NEW_USER_CALLBACK_URL: "Invalid newUserCallbackURL",
  MISSING_OR_NULL_ORIGIN: "Missing or null Origin",
  CALLBACK_URL_REQUIRED: "callbackURL is required",
  FAILED_TO_CREATE_VERIFICATION: "Unable to create verification",
  FIELD_NOT_ALLOWED: "Field not allowed to be set",
  ASYNC_VALIDATION_NOT_SUPPORTED: "Async validation is not supported",
  VALIDATION_ERROR: "Validation Error",
  MISSING_FIELD: "Field is required"
});
var BetterAuthError = class extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "BetterAuthError";
    this.message = message;
    this.cause = cause;
    this.stack = "";
  }
};
const config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64
};
async function generateKey(password, salt) {
  return await scryptAsync(password.normalize("NFKC"), salt, {
    N: config.N,
    p: config.p,
    r: config.r,
    dkLen: config.dkLen,
    maxmem: 128 * config.N * config.r * 2
  });
}
const hashPassword = async (password) => {
  const salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)));
  const key = await generateKey(password, salt);
  return `${salt}:${hex.encode(key)}`;
};
const verifyPassword$1 = async ({ hash, password }) => {
  const [salt, key] = hash.split(":");
  if (!salt || !key) throw new BetterAuthError("Invalid password hash");
  return constantTimeEqual(await generateKey(password, salt), hexToBytes$1(key));
};
const symmetricEncrypt = async ({ key, data }) => {
  const keyAsBytes = await createHash("SHA-256").digest(key);
  const dataAsBytes = utf8ToBytes(data);
  return bytesToHex(managedNonce(xchacha20poly1305)(new Uint8Array(keyAsBytes)).encrypt(dataAsBytes));
};
const symmetricDecrypt = async ({ key, data }) => {
  const keyAsBytes = await createHash("SHA-256").digest(key);
  const dataAsBytes = hexToBytes(data);
  const chacha = managedNonce(xchacha20poly1305)(new Uint8Array(keyAsBytes));
  return new TextDecoder().decode(chacha.decrypt(dataAsBytes));
};
async function generateState(c, link, additionalData) {
  const callbackURL = c.body?.callbackURL || c.context.options.baseURL;
  if (!callbackURL) throw new APIError("BAD_REQUEST", { message: "callbackURL is required" });
  const codeVerifier = generateRandomString(128);
  const state = generateRandomString(32);
  const storeStateStrategy = c.context.oauthConfig.storeStateStrategy;
  const stateData = {
    ...additionalData ? additionalData : {},
    callbackURL,
    codeVerifier,
    errorURL: c.body?.errorCallbackURL,
    newUserURL: c.body?.newUserCallbackURL,
    link,
    expiresAt: Date.now() + 600 * 1e3,
    requestSignUp: c.body?.requestSignUp,
    state
  };
  await setOAuthState(stateData);
  if (storeStateStrategy === "cookie") {
    const encryptedData = await symmetricEncrypt({
      key: c.context.secret,
      data: JSON.stringify(stateData)
    });
    const stateCookie$1 = c.context.createAuthCookie("oauth_state", { maxAge: 600 * 1e3 });
    c.setCookie(stateCookie$1.name, encryptedData, stateCookie$1.attributes);
    return {
      state,
      codeVerifier
    };
  }
  const stateCookie = c.context.createAuthCookie("state", { maxAge: 300 * 1e3 });
  await c.setSignedCookie(stateCookie.name, state, c.context.secret, stateCookie.attributes);
  const expiresAt = /* @__PURE__ */ new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  const verification = await c.context.internalAdapter.createVerificationValue({
    value: JSON.stringify(stateData),
    identifier: state,
    expiresAt
  });
  if (!verification) {
    c.context.logger.error("Unable to create verification. Make sure the database adapter is properly working and there is a verification table in the database");
    throw new APIError("INTERNAL_SERVER_ERROR", { message: "Unable to create verification" });
  }
  return {
    state: verification.identifier,
    codeVerifier
  };
}
async function parseState(c) {
  const state = c.query.state || c.body.state;
  const storeStateStrategy = c.context.oauthConfig.storeStateStrategy;
  const stateDataSchema = looseObject({
    callbackURL: string(),
    codeVerifier: string(),
    errorURL: string().optional(),
    newUserURL: string().optional(),
    expiresAt: number(),
    link: object({
      email: string(),
      userId: string$1()
    }).optional(),
    requestSignUp: boolean().optional(),
    state: string().optional()
  });
  let parsedData;
  const skipStateCookieCheck = c.context.oauthConfig?.skipStateCookieCheck;
  if (storeStateStrategy === "cookie") {
    const stateCookie = c.context.createAuthCookie("oauth_state");
    const encryptedData = c.getCookie(stateCookie.name);
    if (!encryptedData) {
      c.context.logger.error("State Mismatch. OAuth state cookie not found", { state });
      const errorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
      throw c.redirect(`${errorURL}?error=please_restart_the_process`);
    }
    try {
      const decryptedData = await symmetricDecrypt({
        key: c.context.secret,
        data: encryptedData
      });
      parsedData = stateDataSchema.parse(JSON.parse(decryptedData));
    } catch (error2) {
      c.context.logger.error("Failed to decrypt or parse OAuth state cookie", { error: error2 });
      const errorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
      throw c.redirect(`${errorURL}?error=please_restart_the_process`);
    }
    if (!c.context.oauthConfig?.skipStateCookieCheck && parsedData.state && parsedData.state !== state) {
      c.context.logger.error("State Mismatch. State parameter does not match", {
        expected: parsedData.state,
        received: state
      });
      const errorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
      throw c.redirect(`${errorURL}?error=state_mismatch`);
    }
    c.setCookie(stateCookie.name, "", { maxAge: 0 });
  } else {
    const data = await c.context.internalAdapter.findVerificationValue(state);
    if (!data) {
      c.context.logger.error("State Mismatch. Verification not found", { state });
      const errorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
      throw c.redirect(`${errorURL}?error=please_restart_the_process`);
    }
    parsedData = stateDataSchema.parse(JSON.parse(data.value));
    const stateCookie = c.context.createAuthCookie("state");
    const stateCookieValue = await c.getSignedCookie(stateCookie.name, c.context.secret);
    if (!skipStateCookieCheck && (!stateCookieValue || stateCookieValue !== state)) {
      const errorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
      throw c.redirect(`${errorURL}?error=state_mismatch`);
    }
    c.setCookie(stateCookie.name, "", { maxAge: 0 });
    await c.context.internalAdapter.deleteVerificationValue(data.id);
  }
  if (!parsedData.errorURL) parsedData.errorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
  if (parsedData.expiresAt < Date.now()) {
    const errorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
    throw c.redirect(`${errorURL}?error=please_restart_the_process`);
  }
  if (parsedData) await setOAuthState(parsedData);
  return parsedData;
}
const HIDE_METADATA = { scope: "server" };
const LOCALHOST_IP = "127.0.0.1";
function getIp(req, options) {
  if (options.advanced?.ipAddress?.disableIpTracking) return null;
  const headers = "headers" in req ? req.headers : req;
  const ipHeaders = options.advanced?.ipAddress?.ipAddressHeaders || ["x-forwarded-for"];
  for (const key of ipHeaders) {
    const value = "get" in headers ? headers.get(key) : headers[key];
    if (typeof value === "string") {
      const ip = value.split(",")[0].trim();
      if (isValidIP(ip)) return ip;
    }
  }
  if (isTest() || isDevelopment()) return LOCALHOST_IP;
  return null;
}
function isValidIP(ip) {
  if (ipv4().safeParse(ip).success) return true;
  if (ipv6().safeParse(ip).success) return true;
  return false;
}
function checkHasPath(url) {
  try {
    return (new URL(url).pathname.replace(/\/+$/, "") || "/") !== "/";
  } catch {
    throw new BetterAuthError(`Invalid base URL: ${url}. Please provide a valid base URL.`);
  }
}
function assertHasProtocol(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new BetterAuthError(`Invalid base URL: ${url}. URL must include 'http://' or 'https://'`);
  } catch (error2) {
    if (error2 instanceof BetterAuthError) throw error2;
    throw new BetterAuthError(`Invalid base URL: ${url}. Please provide a valid base URL.`, String(error2));
  }
}
function withPath(url, path = "/api/auth") {
  assertHasProtocol(url);
  if (checkHasPath(url)) return url;
  const trimmedUrl = url.replace(/\/+$/, "");
  if (!path || path === "/") return trimmedUrl;
  path = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedUrl}${path}`;
}
function validateProxyHeader(header, type) {
  if (!header || header.trim() === "") return false;
  if (type === "proto") return header === "http" || header === "https";
  if (type === "host") {
    if ([
      /\.\./,
      /\0/,
      /[\s]/,
      /^[.]/,
      /[<>'"]/,
      /javascript:/i,
      /file:/i,
      /data:/i
    ].some((pattern) => pattern.test(header))) return false;
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(:[0-9]{1,5})?$/.test(header) || /^(\d{1,3}\.){3}\d{1,3}(:[0-9]{1,5})?$/.test(header) || /^\[[0-9a-fA-F:]+\](:[0-9]{1,5})?$/.test(header) || /^localhost(:[0-9]{1,5})?$/i.test(header);
  }
  return false;
}
function getBaseURL(url, path, request, loadEnv, trustedProxyHeaders) {
  if (url) return withPath(url, path);
  {
    const fromEnv = env$1.BETTER_AUTH_URL || env$1.NEXT_PUBLIC_BETTER_AUTH_URL || env$1.PUBLIC_BETTER_AUTH_URL || env$1.NUXT_PUBLIC_BETTER_AUTH_URL || env$1.NUXT_PUBLIC_AUTH_URL || (env$1.BASE_URL !== "/" ? env$1.BASE_URL : void 0);
    if (fromEnv) return withPath(fromEnv, path);
  }
  const fromRequest = request?.headers.get("x-forwarded-host");
  const fromRequestProto = request?.headers.get("x-forwarded-proto");
  if (fromRequest && fromRequestProto && trustedProxyHeaders) {
    if (validateProxyHeader(fromRequestProto, "proto") && validateProxyHeader(fromRequest, "host")) try {
      return withPath(`${fromRequestProto}://${fromRequest}`, path);
    } catch (_error) {
    }
  }
  if (request) {
    const url$1 = getOrigin(request.url);
    if (!url$1) throw new BetterAuthError("Could not get origin from request. Please provide a valid base URL.");
    return withPath(url$1, path);
  }
  if (typeof window !== "undefined" && window.location) return withPath(window.location.origin, path);
}
function getOrigin(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin === "null" ? null : parsedUrl.origin;
  } catch {
    return null;
  }
}
function getProtocol(url) {
  try {
    return new URL(url).protocol;
  } catch {
    return null;
  }
}
function getHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
function escapeRegExpChar(char) {
  if (char === "-" || char === "^" || char === "$" || char === "+" || char === "." || char === "(" || char === ")" || char === "|" || char === "[" || char === "]" || char === "{" || char === "}" || char === "*" || char === "?" || char === "\\") return `\\${char}`;
  else return char;
}
function escapeRegExpString(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) result += escapeRegExpChar(str[i]);
  return result;
}
function transform(pattern, separator = true) {
  if (Array.isArray(pattern)) return `(?:${pattern.map((p) => `^${transform(p, separator)}$`).join("|")})`;
  let separatorSplitter = "";
  let separatorMatcher = "";
  let wildcard = ".";
  if (separator === true) {
    separatorSplitter = "/";
    separatorMatcher = "[/\\\\]";
    wildcard = "[^/\\\\]";
  } else if (separator) {
    separatorSplitter = separator;
    separatorMatcher = escapeRegExpString(separatorSplitter);
    if (separatorMatcher.length > 1) {
      separatorMatcher = `(?:${separatorMatcher})`;
      wildcard = `((?!${separatorMatcher}).)`;
    } else wildcard = `[^${separatorMatcher}]`;
  }
  let requiredSeparator = separator ? `${separatorMatcher}+?` : "";
  let optionalSeparator = separator ? `${separatorMatcher}*?` : "";
  let segments = separator ? pattern.split(separatorSplitter) : [pattern];
  let result = "";
  for (let s = 0; s < segments.length; s++) {
    let segment = segments[s];
    let nextSegment = segments[s + 1];
    let currentSeparator = "";
    if (!segment && s > 0) continue;
    if (separator) if (s === segments.length - 1) currentSeparator = optionalSeparator;
    else if (nextSegment !== "**") currentSeparator = requiredSeparator;
    else currentSeparator = "";
    if (separator && segment === "**") {
      if (currentSeparator) {
        result += s === 0 ? "" : currentSeparator;
        result += `(?:${wildcard}*?${currentSeparator})*?`;
      }
      continue;
    }
    for (let c = 0; c < segment.length; c++) {
      let char = segment[c];
      if (char === "\\") {
        if (c < segment.length - 1) {
          result += escapeRegExpChar(segment[c + 1]);
          c++;
        }
      } else if (char === "?") result += wildcard;
      else if (char === "*") result += `${wildcard}*?`;
      else result += escapeRegExpChar(char);
    }
    result += currentSeparator;
  }
  return result;
}
function isMatch(regexp, sample) {
  if (typeof sample !== "string") throw new TypeError(`Sample must be a string, but ${typeof sample} given`);
  return regexp.test(sample);
}
function wildcardMatch(pattern, options) {
  if (typeof pattern !== "string" && !Array.isArray(pattern)) throw new TypeError(`The first argument must be a single pattern string or an array of patterns, but ${typeof pattern} given`);
  if (typeof options === "string" || typeof options === "boolean") options = { separator: options };
  if (arguments.length === 2 && !(typeof options === "undefined" || typeof options === "object" && options !== null && !Array.isArray(options))) throw new TypeError(`The second argument must be an options object or a string/boolean separator, but ${typeof options} given`);
  options = options || {};
  if (options.separator === "\\") throw new Error("\\ is not a valid separator because it is used for escaping. Try setting the separator to `true` instead");
  let regexpPattern = transform(pattern, options.separator);
  let regexp = new RegExp(`^${regexpPattern}$`, options.flags);
  let fn = isMatch.bind(null, regexp);
  fn.options = options;
  fn.pattern = pattern;
  fn.regexp = regexp;
  return fn;
}
const matchesOriginPattern = (url, pattern, settings) => {
  if (url.startsWith("/")) {
    if (settings?.allowRelativePaths) return url.startsWith("/") && /^\/(?!\/|\\|%2f|%5c)[\w\-.\+/@]*(?:\?[\w\-.\+/=&%@]*)?$/.test(url);
    return false;
  }
  if (pattern.includes("*") || pattern.includes("?")) {
    if (pattern.includes("://")) return wildcardMatch(pattern)(getOrigin(url) || url);
    const host = getHost(url);
    if (!host) return false;
    return wildcardMatch(pattern)(host);
  }
  const protocol = getProtocol(url);
  return protocol === "http:" || protocol === "https:" || !protocol ? pattern === getOrigin(url) : url.startsWith(pattern);
};
const optionsMiddleware = createMiddleware(async () => {
  return {};
});
const createAuthMiddleware = createMiddleware.create({ use: [optionsMiddleware, createMiddleware(async () => {
  return {};
})] });
const use = [optionsMiddleware];
function createAuthEndpoint(pathOrOptions, handlerOrOptions, handlerOrNever) {
  const path = typeof pathOrOptions === "string" ? pathOrOptions : void 0;
  const options = typeof handlerOrOptions === "object" ? handlerOrOptions : pathOrOptions;
  const handler = typeof handlerOrOptions === "function" ? handlerOrOptions : handlerOrNever;
  if (path) return createEndpoint(path, {
    ...options,
    use: [...options?.use || [], ...use]
  }, async (ctx) => runWithEndpointContext(ctx, () => handler(ctx)));
  return createEndpoint({
    ...options,
    use: [...options?.use || [], ...use]
  }, async (ctx) => runWithEndpointContext(ctx, () => handler(ctx)));
}
function shouldSkipCSRFForBackwardCompat(ctx) {
  return ctx.context.skipOriginCheck && ctx.context.options.advanced?.disableCSRFCheck === void 0;
}
const logBackwardCompatWarning = deprecate(function logBackwardCompatWarning$1() {
}, "disableOriginCheck: true currently also disables CSRF checks. In a future version, disableOriginCheck will ONLY disable URL validation. To keep CSRF disabled, add disableCSRFCheck: true to your config.");
const originCheckMiddleware = createAuthMiddleware(async (ctx) => {
  if (ctx.request?.method === "GET" || ctx.request?.method === "OPTIONS" || ctx.request?.method === "HEAD" || !ctx.request) return;
  await validateOrigin(ctx);
  if (ctx.context.skipOriginCheck) return;
  const { body, query } = ctx;
  const callbackURL = body?.callbackURL || query?.callbackURL;
  const redirectURL = body?.redirectTo;
  const errorCallbackURL = body?.errorCallbackURL;
  const newUserCallbackURL = body?.newUserCallbackURL;
  const validateURL = (url, label) => {
    if (!url) return;
    if (!ctx.context.isTrustedOrigin(url, { allowRelativePaths: label !== "origin" })) {
      ctx.context.logger.error(`Invalid ${label}: ${url}`);
      ctx.context.logger.info(`If it's a valid URL, please add ${url} to trustedOrigins in your auth config
`, `Current list of trustedOrigins: ${ctx.context.trustedOrigins}`);
      throw new APIError("FORBIDDEN", { message: `Invalid ${label}` });
    }
  };
  callbackURL && validateURL(callbackURL, "callbackURL");
  redirectURL && validateURL(redirectURL, "redirectURL");
  errorCallbackURL && validateURL(errorCallbackURL, "errorCallbackURL");
  newUserCallbackURL && validateURL(newUserCallbackURL, "newUserCallbackURL");
});
const originCheck = (getValue) => createAuthMiddleware(async (ctx) => {
  if (!ctx.request) return;
  if (ctx.context.skipOriginCheck) return;
  const callbackURL = getValue(ctx);
  const validateURL = (url, label) => {
    if (!url) return;
    if (!ctx.context.isTrustedOrigin(url, { allowRelativePaths: label !== "origin" })) {
      ctx.context.logger.error(`Invalid ${label}: ${url}`);
      ctx.context.logger.info(`If it's a valid URL, please add ${url} to trustedOrigins in your auth config
`, `Current list of trustedOrigins: ${ctx.context.trustedOrigins}`);
      throw new APIError("FORBIDDEN", { message: `Invalid ${label}` });
    }
  };
  const callbacks = Array.isArray(callbackURL) ? callbackURL : [callbackURL];
  for (const url of callbacks) validateURL(url, "callbackURL");
});
async function validateOrigin(ctx, forceValidate = false) {
  const headers = ctx.request?.headers;
  if (!headers || !ctx.request) return;
  const originHeader = headers.get("origin") || headers.get("referer") || "";
  const useCookies = headers.has("cookie");
  if (ctx.context.skipCSRFCheck) return;
  if (shouldSkipCSRFForBackwardCompat(ctx)) {
    ctx.context.options.advanced?.disableOriginCheck === true && logBackwardCompatWarning();
    return;
  }
  if (!(forceValidate || useCookies)) return;
  if (!originHeader || originHeader === "null") throw new APIError("FORBIDDEN", { message: BASE_ERROR_CODES.MISSING_OR_NULL_ORIGIN });
  const trustedOrigins = Array.isArray(ctx.context.options.trustedOrigins) ? ctx.context.trustedOrigins : [...ctx.context.trustedOrigins, ...(await ctx.context.options.trustedOrigins?.(ctx.request))?.filter((v) => Boolean(v)) || []];
  if (!trustedOrigins.some((origin) => matchesOriginPattern(originHeader, origin))) {
    ctx.context.logger.error(`Invalid origin: ${originHeader}`);
    ctx.context.logger.info(`If it's a valid URL, please add ${originHeader} to trustedOrigins in your auth config
`, `Current list of trustedOrigins: ${trustedOrigins}`);
    throw new APIError("FORBIDDEN", { message: "Invalid origin" });
  }
}
const formCsrfMiddleware = createAuthMiddleware(async (ctx) => {
  if (!ctx.request) return;
  await validateFormCsrf(ctx);
});
async function validateFormCsrf(ctx) {
  const req = ctx.request;
  if (!req) return;
  if (ctx.context.skipCSRFCheck) return;
  if (shouldSkipCSRFForBackwardCompat(ctx)) return;
  const headers = req.headers;
  if (headers.has("cookie")) return await validateOrigin(ctx);
  const site = headers.get("Sec-Fetch-Site");
  const mode = headers.get("Sec-Fetch-Mode");
  const dest = headers.get("Sec-Fetch-Dest");
  if (Boolean(site && site.trim() || mode && mode.trim() || dest && dest.trim())) {
    if (site === "cross-site" && mode === "navigate") {
      ctx.context.logger.error("Blocked cross-site navigation login attempt (CSRF protection)", {
        secFetchSite: site,
        secFetchMode: mode,
        secFetchDest: dest
      });
      throw new APIError("FORBIDDEN", { message: BASE_ERROR_CODES.CROSS_SITE_NAVIGATION_LOGIN_BLOCKED });
    }
    return await validateOrigin(ctx, true);
  }
}
function shouldRateLimit(max, window2, rateLimitData) {
  const now2 = Date.now();
  const windowInMs = window2 * 1e3;
  return now2 - rateLimitData.lastRequest < windowInMs && rateLimitData.count >= max;
}
function rateLimitResponse(retryAfter) {
  return new Response(JSON.stringify({ message: "Too many requests. Please try again later." }), {
    status: 429,
    statusText: "Too Many Requests",
    headers: { "X-Retry-After": retryAfter.toString() }
  });
}
function getRetryAfter(lastRequest, window2) {
  const now2 = Date.now();
  const windowInMs = window2 * 1e3;
  return Math.ceil((lastRequest + windowInMs - now2) / 1e3);
}
function createDBStorage(ctx) {
  const model = "rateLimit";
  const db2 = ctx.adapter;
  return {
    get: async (key) => {
      const data = (await db2.findMany({
        model,
        where: [{
          field: "key",
          value: key
        }]
      }))[0];
      if (typeof data?.lastRequest === "bigint") data.lastRequest = Number(data.lastRequest);
      return data;
    },
    set: async (key, value, _update) => {
      try {
        if (_update) await db2.updateMany({
          model,
          where: [{
            field: "key",
            value: key
          }],
          update: {
            count: value.count,
            lastRequest: value.lastRequest
          }
        });
        else await db2.create({
          model,
          data: {
            key,
            count: value.count,
            lastRequest: value.lastRequest
          }
        });
      } catch (e) {
        ctx.logger.error("Error setting rate limit", e);
      }
    }
  };
}
const memory = /* @__PURE__ */ new Map();
function getRateLimitStorage(ctx, rateLimitSettings) {
  if (ctx.options.rateLimit?.customStorage) return ctx.options.rateLimit.customStorage;
  const storage = ctx.rateLimit.storage;
  if (storage === "secondary-storage") return {
    get: async (key) => {
      const data = await ctx.options.secondaryStorage?.get(key);
      return data ? safeJSONParse(data) : void 0;
    },
    set: async (key, value, _update) => {
      const ttl = rateLimitSettings?.window ?? ctx.options.rateLimit?.window ?? 10;
      await ctx.options.secondaryStorage?.set?.(key, JSON.stringify(value), ttl);
    }
  };
  else if (storage === "memory") return {
    async get(key) {
      const entry = memory.get(key);
      if (!entry) return;
      if (Date.now() >= entry.expiresAt) {
        memory.delete(key);
        return;
      }
      return entry.data;
    },
    async set(key, value, _update) {
      const ttl = rateLimitSettings?.window ?? ctx.options.rateLimit?.window ?? 10;
      const expiresAt = Date.now() + ttl * 1e3;
      memory.set(key, {
        data: value,
        expiresAt
      });
    }
  };
  return createDBStorage(ctx);
}
async function onRequestRateLimit(req, ctx) {
  if (!ctx.rateLimit.enabled) return;
  const path = new URL(req.url).pathname.replace(ctx.options.basePath || "/api/auth", "").replace(/\/+$/, "");
  let window2 = ctx.rateLimit.window;
  let max = ctx.rateLimit.max;
  const ip = getIp(req, ctx.options);
  if (!ip) return;
  const key = ip + path;
  const specialRule = getDefaultSpecialRules().find((rule) => rule.pathMatcher(path));
  if (specialRule) {
    window2 = specialRule.window;
    max = specialRule.max;
  }
  for (const plugin of ctx.options.plugins || []) if (plugin.rateLimit) {
    const matchedRule = plugin.rateLimit.find((rule) => rule.pathMatcher(path));
    if (matchedRule) {
      window2 = matchedRule.window;
      max = matchedRule.max;
      break;
    }
  }
  if (ctx.rateLimit.customRules) {
    const _path = Object.keys(ctx.rateLimit.customRules).find((p) => {
      if (p.includes("*")) return wildcardMatch(p)(path);
      return p === path;
    });
    if (_path) {
      const customRule = ctx.rateLimit.customRules[_path];
      const resolved = typeof customRule === "function" ? await customRule(req) : customRule;
      if (resolved) {
        window2 = resolved.window;
        max = resolved.max;
      }
      if (resolved === false) return;
    }
  }
  const storage = getRateLimitStorage(ctx, { window: window2 });
  const data = await storage.get(key);
  const now2 = Date.now();
  if (!data) await storage.set(key, {
    key,
    count: 1,
    lastRequest: now2
  });
  else {
    const timeSinceLastRequest = now2 - data.lastRequest;
    if (shouldRateLimit(max, window2, data)) return rateLimitResponse(getRetryAfter(data.lastRequest, window2));
    else if (timeSinceLastRequest > window2 * 1e3) await storage.set(key, {
      ...data,
      count: 1,
      lastRequest: now2
    }, true);
    else await storage.set(key, {
      ...data,
      count: data.count + 1,
      lastRequest: now2
    }, true);
  }
}
function getDefaultSpecialRules() {
  return [{
    pathMatcher(path) {
      return path.startsWith("/sign-in") || path.startsWith("/sign-up") || path.startsWith("/change-password") || path.startsWith("/change-email");
    },
    window: 10,
    max: 3
  }];
}
const getDate = (span, unit = "ms") => {
  return new Date(Date.now() + (unit === "sec" ? span * 1e3 : span));
};
const cache = /* @__PURE__ */ new WeakMap();
function parseOutputData(data, schema2) {
  const fields = schema2.fields;
  const parsedData = {};
  for (const key in data) {
    const field = fields[key];
    if (!field) {
      parsedData[key] = data[key];
      continue;
    }
    if (field.returned === false) continue;
    parsedData[key] = data[key];
  }
  return parsedData;
}
function getAllFields(options, table) {
  if (!cache.has(options)) cache.set(options, /* @__PURE__ */ new Map());
  const tableCache = cache.get(options);
  if (tableCache.has(table)) return tableCache.get(table);
  let schema2 = {
    ...table === "user" ? options.user?.additionalFields : {},
    ...table === "session" ? options.session?.additionalFields : {}
  };
  for (const plugin of options.plugins || []) if (plugin.schema && plugin.schema[table]) schema2 = {
    ...schema2,
    ...plugin.schema[table].fields
  };
  cache.get(options).set(table, schema2);
  return schema2;
}
function parseUserOutput(options, user) {
  return {
    ...parseOutputData(user, { fields: getAllFields(options, "user") }),
    id: user.id
  };
}
function parseAccountOutput(options, account) {
  return parseOutputData(account, { fields: getAllFields(options, "account") });
}
function parseSessionOutput(options, session) {
  return parseOutputData(session, { fields: getAllFields(options, "session") });
}
function parseInputData(data, schema2) {
  const action = schema2.action || "create";
  const fields = schema2.fields;
  const parsedData = Object.assign(/* @__PURE__ */ Object.create(null), null);
  for (const key in fields) {
    if (key in data) {
      if (fields[key].input === false) {
        if (fields[key].defaultValue !== void 0) {
          if (action !== "update") {
            parsedData[key] = fields[key].defaultValue;
            continue;
          }
        }
        if (data[key]) throw new APIError("BAD_REQUEST", { message: `${key} is not allowed to be set` });
        continue;
      }
      if (fields[key].validator?.input && data[key] !== void 0) {
        const result = fields[key].validator.input["~standard"].validate(data[key]);
        if (result instanceof Promise) throw new APIError("INTERNAL_SERVER_ERROR", { message: "Async validation is not supported for additional fields" });
        if ("issues" in result && result.issues) throw new APIError("BAD_REQUEST", { message: result.issues[0]?.message || "Validation Error" });
        parsedData[key] = result.value;
        continue;
      }
      if (fields[key].transform?.input && data[key] !== void 0) {
        parsedData[key] = fields[key].transform?.input(data[key]);
        continue;
      }
      parsedData[key] = data[key];
      continue;
    }
    if (fields[key].defaultValue !== void 0 && action === "create") {
      if (typeof fields[key].defaultValue === "function") {
        parsedData[key] = fields[key].defaultValue();
        continue;
      }
      parsedData[key] = fields[key].defaultValue;
      continue;
    }
    if (fields[key].required && action === "create") throw new APIError("BAD_REQUEST", { message: `${key} is required` });
  }
  return parsedData;
}
function parseUserInput(options, user = {}, action) {
  return parseInputData(user, {
    fields: getAllFields(options, "user"),
    action
  });
}
function parseAdditionalUserInput(options, user) {
  const schema2 = getAllFields(options, "user");
  return parseInputData(user || {}, { fields: schema2 });
}
function parseAccountInput(options, account) {
  return parseInputData(account, { fields: getAllFields(options, "account") });
}
function parseSessionInput(options, session) {
  return parseInputData(session, { fields: getAllFields(options, "session") });
}
function mergeSchema(schema2, newSchema) {
  if (!newSchema) return schema2;
  for (const table in newSchema) {
    const newModelName = newSchema[table]?.modelName;
    if (newModelName) schema2[table].modelName = newModelName;
    for (const field in schema2[table].fields) {
      const newField = newSchema[table]?.fields?.[field];
      if (!newField) continue;
      schema2[table].fields[field].fieldName = newField;
    }
  }
  return schema2;
}
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (all, symbols) => {
  let target = {};
  for (var name in all) {
    __defProp(target, name, {
      get: all[name],
      enumerable: true
    });
  }
  return target;
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
      key = keys[i];
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: ((k) => from[k]).bind(null, key),
          enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable
        });
      }
    }
  }
  return to;
};
var __reExport = (target, mod, secondTarget, symbols) => {
  __copyProps(target, mod, "default");
};
const getAuthTables = (options) => {
  const pluginSchema = (options.plugins ?? []).reduce((acc, plugin) => {
    const schema2 = plugin.schema;
    if (!schema2) return acc;
    for (const [key, value] of Object.entries(schema2)) acc[key] = {
      fields: {
        ...acc[key]?.fields,
        ...value.fields
      },
      modelName: value.modelName || key
    };
    return acc;
  }, {});
  const shouldAddRateLimitTable = options.rateLimit?.storage === "database";
  const rateLimitTable = { rateLimit: {
    modelName: options.rateLimit?.modelName || "rateLimit",
    fields: {
      key: {
        type: "string",
        fieldName: options.rateLimit?.fields?.key || "key"
      },
      count: {
        type: "number",
        fieldName: options.rateLimit?.fields?.count || "count"
      },
      lastRequest: {
        type: "number",
        bigint: true,
        fieldName: options.rateLimit?.fields?.lastRequest || "lastRequest"
      }
    }
  } };
  const { user, session, account, verification, ...pluginTables } = pluginSchema;
  const sessionTable = { session: {
    modelName: options.session?.modelName || "session",
    fields: {
      expiresAt: {
        type: "date",
        required: true,
        fieldName: options.session?.fields?.expiresAt || "expiresAt"
      },
      token: {
        type: "string",
        required: true,
        fieldName: options.session?.fields?.token || "token",
        unique: true
      },
      createdAt: {
        type: "date",
        required: true,
        fieldName: options.session?.fields?.createdAt || "createdAt",
        defaultValue: () => /* @__PURE__ */ new Date()
      },
      updatedAt: {
        type: "date",
        required: true,
        fieldName: options.session?.fields?.updatedAt || "updatedAt",
        onUpdate: () => /* @__PURE__ */ new Date()
      },
      ipAddress: {
        type: "string",
        required: false,
        fieldName: options.session?.fields?.ipAddress || "ipAddress"
      },
      userAgent: {
        type: "string",
        required: false,
        fieldName: options.session?.fields?.userAgent || "userAgent"
      },
      userId: {
        type: "string",
        fieldName: options.session?.fields?.userId || "userId",
        references: {
          model: options.user?.modelName || "user",
          field: "id",
          onDelete: "cascade"
        },
        required: true,
        index: true
      },
      ...session?.fields,
      ...options.session?.additionalFields
    },
    order: 2
  } };
  return {
    user: {
      modelName: options.user?.modelName || "user",
      fields: {
        name: {
          type: "string",
          required: true,
          fieldName: options.user?.fields?.name || "name",
          sortable: true
        },
        email: {
          type: "string",
          unique: true,
          required: true,
          fieldName: options.user?.fields?.email || "email",
          sortable: true
        },
        emailVerified: {
          type: "boolean",
          defaultValue: false,
          required: true,
          fieldName: options.user?.fields?.emailVerified || "emailVerified",
          input: false
        },
        image: {
          type: "string",
          required: false,
          fieldName: options.user?.fields?.image || "image"
        },
        createdAt: {
          type: "date",
          defaultValue: () => /* @__PURE__ */ new Date(),
          required: true,
          fieldName: options.user?.fields?.createdAt || "createdAt"
        },
        updatedAt: {
          type: "date",
          defaultValue: () => /* @__PURE__ */ new Date(),
          onUpdate: () => /* @__PURE__ */ new Date(),
          required: true,
          fieldName: options.user?.fields?.updatedAt || "updatedAt"
        },
        ...user?.fields,
        ...options.user?.additionalFields
      },
      order: 1
    },
    ...!options.secondaryStorage || options.session?.storeSessionInDatabase ? sessionTable : {},
    account: {
      modelName: options.account?.modelName || "account",
      fields: {
        accountId: {
          type: "string",
          required: true,
          fieldName: options.account?.fields?.accountId || "accountId"
        },
        providerId: {
          type: "string",
          required: true,
          fieldName: options.account?.fields?.providerId || "providerId"
        },
        userId: {
          type: "string",
          references: {
            model: options.user?.modelName || "user",
            field: "id",
            onDelete: "cascade"
          },
          required: true,
          fieldName: options.account?.fields?.userId || "userId",
          index: true
        },
        accessToken: {
          type: "string",
          required: false,
          fieldName: options.account?.fields?.accessToken || "accessToken"
        },
        refreshToken: {
          type: "string",
          required: false,
          fieldName: options.account?.fields?.refreshToken || "refreshToken"
        },
        idToken: {
          type: "string",
          required: false,
          fieldName: options.account?.fields?.idToken || "idToken"
        },
        accessTokenExpiresAt: {
          type: "date",
          required: false,
          fieldName: options.account?.fields?.accessTokenExpiresAt || "accessTokenExpiresAt"
        },
        refreshTokenExpiresAt: {
          type: "date",
          required: false,
          fieldName: options.account?.fields?.refreshTokenExpiresAt || "refreshTokenExpiresAt"
        },
        scope: {
          type: "string",
          required: false,
          fieldName: options.account?.fields?.scope || "scope"
        },
        password: {
          type: "string",
          required: false,
          fieldName: options.account?.fields?.password || "password"
        },
        createdAt: {
          type: "date",
          required: true,
          fieldName: options.account?.fields?.createdAt || "createdAt",
          defaultValue: () => /* @__PURE__ */ new Date()
        },
        updatedAt: {
          type: "date",
          required: true,
          fieldName: options.account?.fields?.updatedAt || "updatedAt",
          onUpdate: () => /* @__PURE__ */ new Date()
        },
        ...account?.fields,
        ...options.account?.additionalFields
      },
      order: 3
    },
    verification: {
      modelName: options.verification?.modelName || "verification",
      fields: {
        identifier: {
          type: "string",
          required: true,
          fieldName: options.verification?.fields?.identifier || "identifier",
          index: true
        },
        value: {
          type: "string",
          required: true,
          fieldName: options.verification?.fields?.value || "value"
        },
        expiresAt: {
          type: "date",
          required: true,
          fieldName: options.verification?.fields?.expiresAt || "expiresAt"
        },
        createdAt: {
          type: "date",
          required: true,
          defaultValue: () => /* @__PURE__ */ new Date(),
          fieldName: options.verification?.fields?.createdAt || "createdAt"
        },
        updatedAt: {
          type: "date",
          required: true,
          defaultValue: () => /* @__PURE__ */ new Date(),
          onUpdate: () => /* @__PURE__ */ new Date(),
          fieldName: options.verification?.fields?.updatedAt || "updatedAt"
        },
        ...verification?.fields,
        ...options.verification?.additionalFields
      },
      order: 4
    },
    ...pluginTables,
    ...shouldAddRateLimitTable ? rateLimitTable : {}
  };
};
const coreSchema = object({
  id: string(),
  createdAt: date().default(() => /* @__PURE__ */ new Date()),
  updatedAt: date().default(() => /* @__PURE__ */ new Date())
});
const accountSchema = coreSchema.extend({
  providerId: string(),
  accountId: string(),
  userId: string$1(),
  accessToken: string().nullish(),
  refreshToken: string().nullish(),
  idToken: string().nullish(),
  accessTokenExpiresAt: date().nullish(),
  refreshTokenExpiresAt: date().nullish(),
  scope: string().nullish(),
  password: string().nullish()
});
const rateLimitSchema = object({
  key: string(),
  count: number(),
  lastRequest: number()
});
const sessionSchema = coreSchema.extend({
  userId: string$1(),
  expiresAt: date(),
  token: string(),
  ipAddress: string().nullish(),
  userAgent: string().nullish()
});
const userSchema = coreSchema.extend({
  email: string().transform((val) => val.toLowerCase()),
  emailVerified: boolean().default(false),
  name: string(),
  image: string().nullish()
});
const verificationSchema = coreSchema.extend({
  value: string(),
  expiresAt: date(),
  identifier: string()
});
const import___better_auth_core_db = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  accountSchema,
  coreSchema,
  getAuthTables,
  rateLimitSchema,
  sessionSchema,
  userSchema,
  verificationSchema
}, Symbol.toStringTag, { value: "Module" }));
async function getBaseAdapter(options, handleDirectDatabase) {
  let adapter;
  if (!options.database) {
    const tables = getAuthTables(options);
    const memoryDB = Object.keys(tables).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    const { memoryAdapter } = await import("./index-Dz5dSHUC.mjs");
    adapter = memoryAdapter(memoryDB)(options);
  } else if (typeof options.database === "function") adapter = options.database(options);
  else adapter = await handleDirectDatabase(options);
  if (!adapter.transaction) {
    logger.warn("Adapter does not correctly implement transaction function, patching it automatically. Please update your adapter implementation.");
    adapter.transaction = async (cb) => {
      return cb(adapter);
    };
  }
  return adapter;
}
async function getAdapter(options) {
  return getBaseAdapter(options, async (opts) => {
    const { createKyselyAdapter: createKyselyAdapter2 } = await import("./index-Cbxf6CAH.mjs");
    const { kysely, databaseType, transaction } = await createKyselyAdapter2(opts);
    if (!kysely) throw new BetterAuthError("Failed to initialize database adapter");
    const { kyselyAdapter } = await import("./index-Cbxf6CAH.mjs");
    return kyselyAdapter(kysely, {
      type: databaseType || "sqlite",
      debugLogs: opts.database && "debugLogs" in opts.database ? opts.database.debugLogs : false,
      transaction
    })(opts);
  });
}
const createFieldAttribute = (type, config2) => {
  return {
    type,
    ...config2
  };
};
function convertToDB(fields, values) {
  let result = values.id ? { id: values.id } : {};
  for (const key in fields) {
    const field = fields[key];
    const value = values[key];
    if (value === void 0) continue;
    result[field.fieldName || key] = value;
  }
  return result;
}
function convertFromDB(fields, values) {
  if (!values) return null;
  let result = { id: values.id };
  for (const [key, value] of Object.entries(fields)) result[key] = values[value.fieldName || key];
  return result;
}
function getWithHooks(adapter, ctx) {
  const hooks = ctx.hooks;
  async function createWithHooks(data, model, customCreateFn) {
    const context = await getCurrentAuthContext().catch(() => null);
    let actualData = data;
    for (const hook of hooks || []) {
      const toRun = hook[model]?.create?.before;
      if (toRun) {
        const result = await toRun(actualData, context);
        if (result === false) return null;
        if (typeof result === "object" && "data" in result) actualData = {
          ...actualData,
          ...result.data
        };
      }
    }
    const customCreated = customCreateFn ? await customCreateFn.fn(actualData) : null;
    const created = !customCreateFn || customCreateFn.executeMainFn ? await (await getCurrentAdapter(adapter)).create({
      model,
      data: actualData,
      forceAllowId: true
    }) : customCreated;
    for (const hook of hooks || []) {
      const toRun = hook[model]?.create?.after;
      if (toRun) await toRun(created, context);
    }
    return created;
  }
  async function updateWithHooks(data, where, model, customUpdateFn) {
    const context = await getCurrentAuthContext().catch(() => null);
    let actualData = data;
    for (const hook of hooks || []) {
      const toRun = hook[model]?.update?.before;
      if (toRun) {
        const result = await toRun(data, context);
        if (result === false) return null;
        if (typeof result === "object" && "data" in result) actualData = {
          ...actualData,
          ...result.data
        };
      }
    }
    const customUpdated = customUpdateFn ? await customUpdateFn.fn(actualData) : null;
    const updated = !customUpdateFn || customUpdateFn.executeMainFn ? await (await getCurrentAdapter(adapter)).update({
      model,
      update: actualData,
      where
    }) : customUpdated;
    for (const hook of hooks || []) {
      const toRun = hook[model]?.update?.after;
      if (toRun) await toRun(updated, context);
    }
    return updated;
  }
  async function updateManyWithHooks(data, where, model, customUpdateFn) {
    const context = await getCurrentAuthContext().catch(() => null);
    let actualData = data;
    for (const hook of hooks || []) {
      const toRun = hook[model]?.update?.before;
      if (toRun) {
        const result = await toRun(data, context);
        if (result === false) return null;
        if (typeof result === "object" && "data" in result) actualData = {
          ...actualData,
          ...result.data
        };
      }
    }
    const customUpdated = customUpdateFn ? await customUpdateFn.fn(actualData) : null;
    const updated = !customUpdateFn || customUpdateFn.executeMainFn ? await (await getCurrentAdapter(adapter)).updateMany({
      model,
      update: actualData,
      where
    }) : customUpdated;
    for (const hook of hooks || []) {
      const toRun = hook[model]?.update?.after;
      if (toRun) await toRun(updated, context);
    }
    return updated;
  }
  async function deleteWithHooks(where, model, customDeleteFn) {
    const context = await getCurrentAuthContext().catch(() => null);
    let entityToDelete = null;
    try {
      entityToDelete = (await (await getCurrentAdapter(adapter)).findMany({
        model,
        where,
        limit: 1
      }))[0] || null;
    } catch {
    }
    if (entityToDelete) for (const hook of hooks || []) {
      const toRun = hook[model]?.delete?.before;
      if (toRun) {
        if (await toRun(entityToDelete, context) === false) return null;
      }
    }
    const customDeleted = customDeleteFn ? await customDeleteFn.fn(where) : null;
    const deleted = !customDeleteFn || customDeleteFn.executeMainFn ? await (await getCurrentAdapter(adapter)).delete({
      model,
      where
    }) : customDeleted;
    if (entityToDelete) for (const hook of hooks || []) {
      const toRun = hook[model]?.delete?.after;
      if (toRun) await toRun(entityToDelete, context);
    }
    return deleted;
  }
  async function deleteManyWithHooks(where, model, customDeleteFn) {
    const context = await getCurrentAuthContext().catch(() => null);
    let entitiesToDelete = [];
    try {
      entitiesToDelete = await (await getCurrentAdapter(adapter)).findMany({
        model,
        where
      });
    } catch {
    }
    for (const entity of entitiesToDelete) for (const hook of hooks || []) {
      const toRun = hook[model]?.delete?.before;
      if (toRun) {
        if (await toRun(entity, context) === false) return null;
      }
    }
    const customDeleted = customDeleteFn ? await customDeleteFn.fn(where) : null;
    const deleted = !customDeleteFn || customDeleteFn.executeMainFn ? await (await getCurrentAdapter(adapter)).deleteMany({
      model,
      where
    }) : customDeleted;
    for (const entity of entitiesToDelete) for (const hook of hooks || []) {
      const toRun = hook[model]?.delete?.after;
      if (toRun) await toRun(entity, context);
    }
    return deleted;
  }
  return {
    createWithHooks,
    updateWithHooks,
    updateManyWithHooks,
    deleteWithHooks,
    deleteManyWithHooks
  };
}
const createInternalAdapter = (adapter, ctx) => {
  const logger2 = ctx.logger;
  const options = ctx.options;
  const secondaryStorage = options.secondaryStorage;
  const sessionExpiration = options.session?.expiresIn || 3600 * 24 * 7;
  const { createWithHooks, updateWithHooks, updateManyWithHooks, deleteWithHooks, deleteManyWithHooks } = getWithHooks(adapter, ctx);
  async function refreshUserSessions(user) {
    if (!secondaryStorage) return;
    const listRaw = await secondaryStorage.get(`active-sessions-${user.id}`);
    if (!listRaw) return;
    const now2 = Date.now();
    const validSessions = (safeJSONParse(listRaw) || []).filter((s) => s.expiresAt > now2);
    await Promise.all(validSessions.map(async ({ token }) => {
      const cached = await secondaryStorage.get(token);
      if (!cached) return;
      const parsed = safeJSONParse(cached);
      if (!parsed) return;
      const sessionTTL = Math.max(Math.floor(new Date(parsed.session.expiresAt).getTime() - now2) / 1e3, 0);
      await secondaryStorage.set(token, JSON.stringify({
        session: parsed.session,
        user
      }), Math.floor(sessionTTL));
    }));
  }
  return {
    createOAuthUser: async (user, account) => {
      return runWithTransaction(adapter, async () => {
        const createdUser = await createWithHooks({
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          ...user
        }, "user", void 0);
        return {
          user: createdUser,
          account: await createWithHooks({
            ...account,
            userId: createdUser.id,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }, "account", void 0)
        };
      });
    },
    createUser: async (user) => {
      return await createWithHooks({
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        ...user,
        email: user.email?.toLowerCase()
      }, "user", void 0);
    },
    createAccount: async (account) => {
      return await createWithHooks({
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        ...account
      }, "account", void 0);
    },
    listSessions: async (userId) => {
      if (secondaryStorage) {
        const currentList = await secondaryStorage.get(`active-sessions-${userId}`);
        if (!currentList) return [];
        const list = safeJSONParse(currentList) || [];
        const now2 = Date.now();
        const seenTokens = /* @__PURE__ */ new Set();
        const sessions2 = [];
        for (const { token, expiresAt } of list) {
          if (expiresAt <= now2 || seenTokens.has(token)) continue;
          seenTokens.add(token);
          const data = await secondaryStorage.get(token);
          if (!data) continue;
          const parsed = safeJSONParse(data);
          if (!parsed) continue;
          sessions2.push(parseSessionOutput(ctx.options, {
            ...parsed.session,
            expiresAt: new Date(parsed.session.expiresAt)
          }));
        }
        return sessions2;
      }
      return await (await getCurrentAdapter(adapter)).findMany({
        model: "session",
        where: [{
          field: "userId",
          value: userId
        }]
      });
    },
    listUsers: async (limit, offset, sortBy, where) => {
      return await (await getCurrentAdapter(adapter)).findMany({
        model: "user",
        limit,
        offset,
        sortBy,
        where
      });
    },
    countTotalUsers: async (where) => {
      const total = await (await getCurrentAdapter(adapter)).count({
        model: "user",
        where
      });
      if (typeof total === "string") return parseInt(total);
      return total;
    },
    deleteUser: async (userId) => {
      if (!secondaryStorage || options.session?.storeSessionInDatabase) await deleteManyWithHooks([{
        field: "userId",
        value: userId
      }], "session", void 0);
      await deleteManyWithHooks([{
        field: "userId",
        value: userId
      }], "account", void 0);
      await deleteWithHooks([{
        field: "id",
        value: userId
      }], "user", void 0);
    },
    createSession: async (userId, dontRememberMe, override, overrideAll) => {
      const ctx$1 = await getCurrentAuthContext().catch(() => null);
      const headers = ctx$1?.headers || ctx$1?.request?.headers;
      const { id: _, ...rest } = override || {};
      const defaultAdditionalFields = parseSessionInput(ctx$1?.context.options ?? options, {});
      const data = {
        ipAddress: ctx$1?.request || ctx$1?.headers ? getIp(ctx$1?.request || ctx$1?.headers, ctx$1?.context.options) || "" : "",
        userAgent: headers?.get("user-agent") || "",
        ...rest,
        expiresAt: dontRememberMe ? getDate(3600 * 24, "sec") : getDate(sessionExpiration, "sec"),
        userId,
        token: generateId$1(32),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        ...defaultAdditionalFields,
        ...overrideAll ? rest : {}
      };
      return await createWithHooks(data, "session", secondaryStorage ? {
        fn: async (sessionData) => {
          const currentList = await secondaryStorage.get(`active-sessions-${userId}`);
          let list = [];
          const now2 = Date.now();
          if (currentList) {
            list = safeJSONParse(currentList) || [];
            list = list.filter((session) => session.expiresAt > now2 && session.token !== data.token);
          }
          const sorted = [...list, {
            token: data.token,
            expiresAt: data.expiresAt.getTime()
          }].sort((a, b) => a.expiresAt - b.expiresAt);
          const furthestSessionExp = sorted.at(-1)?.expiresAt ?? data.expiresAt.getTime();
          const furthestSessionTTL = Math.max(Math.floor((furthestSessionExp - now2) / 1e3), 0);
          if (furthestSessionTTL > 0) await secondaryStorage.set(`active-sessions-${userId}`, JSON.stringify(sorted), furthestSessionTTL);
          const user = await adapter.findOne({
            model: "user",
            where: [{
              field: "id",
              value: userId
            }]
          });
          const sessionTTL = Math.max(Math.floor((data.expiresAt.getTime() - now2) / 1e3), 0);
          if (sessionTTL > 0) await secondaryStorage.set(data.token, JSON.stringify({
            session: sessionData,
            user
          }), sessionTTL);
          return sessionData;
        },
        executeMainFn: options.session?.storeSessionInDatabase
      } : void 0);
    },
    findSession: async (token) => {
      if (secondaryStorage) {
        const sessionStringified = await secondaryStorage.get(token);
        if (!sessionStringified && !options.session?.storeSessionInDatabase) return null;
        if (sessionStringified) {
          const s = safeJSONParse(sessionStringified);
          if (!s) return null;
          return {
            session: parseSessionOutput(ctx.options, {
              ...s.session,
              expiresAt: new Date(s.session.expiresAt),
              createdAt: new Date(s.session.createdAt),
              updatedAt: new Date(s.session.updatedAt)
            }),
            user: parseUserOutput(ctx.options, {
              ...s.user,
              createdAt: new Date(s.user.createdAt),
              updatedAt: new Date(s.user.updatedAt)
            })
          };
        }
      }
      const result = await (await getCurrentAdapter(adapter)).findOne({
        model: "session",
        where: [{
          value: token,
          field: "token"
        }],
        join: { user: true }
      });
      if (!result) return null;
      const { user, ...session } = result;
      if (!user) return null;
      return {
        session: parseSessionOutput(ctx.options, session),
        user: parseUserOutput(ctx.options, user)
      };
    },
    findSessions: async (sessionTokens) => {
      if (secondaryStorage) {
        const sessions$1 = [];
        for (const sessionToken of sessionTokens) {
          const sessionStringified = await secondaryStorage.get(sessionToken);
          if (sessionStringified) {
            const s = safeJSONParse(sessionStringified);
            if (!s) return [];
            const session = {
              session: {
                ...s.session,
                expiresAt: new Date(s.session.expiresAt)
              },
              user: {
                ...s.user,
                createdAt: new Date(s.user.createdAt),
                updatedAt: new Date(s.user.updatedAt)
              }
            };
            sessions$1.push(session);
          }
        }
        return sessions$1;
      }
      const sessions2 = await (await getCurrentAdapter(adapter)).findMany({
        model: "session",
        where: [{
          field: "token",
          value: sessionTokens,
          operator: "in"
        }],
        join: { user: true }
      });
      if (!sessions2.length) return [];
      if (sessions2.some((session) => !session.user)) return [];
      return sessions2.map((_session) => {
        const { user, ...session } = _session;
        return {
          session,
          user
        };
      });
    },
    updateSession: async (sessionToken, session) => {
      return await updateWithHooks(session, [{
        field: "token",
        value: sessionToken
      }], "session", secondaryStorage ? {
        async fn(data) {
          const currentSession = await secondaryStorage.get(sessionToken);
          if (!currentSession) return null;
          const parsedSession = safeJSONParse(currentSession);
          if (!parsedSession) return null;
          const mergedSession = {
            ...parsedSession.session,
            ...data,
            expiresAt: new Date(data.expiresAt ?? parsedSession.session.expiresAt),
            createdAt: new Date(parsedSession.session.createdAt),
            updatedAt: new Date(data.updatedAt ?? parsedSession.session.updatedAt)
          };
          const updatedSession = parseSessionOutput(ctx.options, mergedSession);
          const now2 = Date.now();
          const expiresMs = new Date(updatedSession.expiresAt).getTime();
          const sessionTTL = Math.max(Math.floor((expiresMs - now2) / 1e3), 0);
          if (sessionTTL > 0) {
            await secondaryStorage.set(sessionToken, JSON.stringify({
              session: updatedSession,
              user: parsedSession.user
            }), sessionTTL);
            const listKey = `active-sessions-${updatedSession.userId}`;
            const listRaw = await secondaryStorage.get(listKey);
            const sorted = (listRaw ? safeJSONParse(listRaw) || [] : []).filter((s) => s.token !== sessionToken && s.expiresAt > now2).concat([{
              token: sessionToken,
              expiresAt: expiresMs
            }]).sort((a, b) => a.expiresAt - b.expiresAt);
            const furthestSessionExp = sorted.at(-1)?.expiresAt;
            if (furthestSessionExp && furthestSessionExp > now2) await secondaryStorage.set(listKey, JSON.stringify(sorted), Math.floor((furthestSessionExp - now2) / 1e3));
            else await secondaryStorage.delete(listKey);
          }
          return updatedSession;
        },
        executeMainFn: options.session?.storeSessionInDatabase
      } : void 0);
    },
    deleteSession: async (token) => {
      if (secondaryStorage) {
        const data = await secondaryStorage.get(token);
        if (data) {
          const { session } = safeJSONParse(data) ?? {};
          if (!session) {
            logger2.error("Session not found in secondary storage");
            return;
          }
          const userId = session.userId;
          const currentList = await secondaryStorage.get(`active-sessions-${userId}`);
          if (currentList) {
            let list = safeJSONParse(currentList) || [];
            const now2 = Date.now();
            const filtered = list.filter((session$1) => session$1.expiresAt > now2 && session$1.token !== token);
            const furthestSessionExp = filtered.sort((a, b) => a.expiresAt - b.expiresAt).at(-1)?.expiresAt;
            if (filtered.length > 0 && furthestSessionExp && furthestSessionExp > Date.now()) await secondaryStorage.set(`active-sessions-${userId}`, JSON.stringify(filtered), Math.floor((furthestSessionExp - now2) / 1e3));
            else await secondaryStorage.delete(`active-sessions-${userId}`);
          } else logger2.error("Active sessions list not found in secondary storage");
        }
        await secondaryStorage.delete(token);
        if (!options.session?.storeSessionInDatabase || ctx.options.session?.preserveSessionInDatabase) return;
      }
      await deleteWithHooks([{
        field: "token",
        value: token
      }], "session", void 0);
    },
    deleteAccounts: async (userId) => {
      await deleteManyWithHooks([{
        field: "userId",
        value: userId
      }], "account", void 0);
    },
    deleteAccount: async (accountId) => {
      await deleteWithHooks([{
        field: "id",
        value: accountId
      }], "account", void 0);
    },
    deleteSessions: async (userIdOrSessionTokens) => {
      if (secondaryStorage) {
        if (typeof userIdOrSessionTokens === "string") {
          const activeSession = await secondaryStorage.get(`active-sessions-${userIdOrSessionTokens}`);
          const sessions2 = activeSession ? safeJSONParse(activeSession) : [];
          if (!sessions2) return;
          for (const session of sessions2) await secondaryStorage.delete(session.token);
          await secondaryStorage.delete(`active-sessions-${userIdOrSessionTokens}`);
        } else for (const sessionToken of userIdOrSessionTokens) if (await secondaryStorage.get(sessionToken)) await secondaryStorage.delete(sessionToken);
        if (!options.session?.storeSessionInDatabase || ctx.options.session?.preserveSessionInDatabase) return;
      }
      await deleteManyWithHooks([{
        field: Array.isArray(userIdOrSessionTokens) ? "token" : "userId",
        value: userIdOrSessionTokens,
        operator: Array.isArray(userIdOrSessionTokens) ? "in" : void 0
      }], "session", void 0);
    },
    findOAuthUser: async (email2, accountId, providerId) => {
      const account = await (await getCurrentAdapter(adapter)).findMany({
        model: "account",
        where: [{
          value: accountId,
          field: "accountId"
        }],
        join: { user: true }
      }).then((accounts2) => {
        return accounts2.find((a) => a.providerId === providerId);
      });
      if (account) if (account.user) return {
        user: account.user,
        accounts: [account]
      };
      else {
        const user = await (await getCurrentAdapter(adapter)).findOne({
          model: "user",
          where: [{
            value: email2.toLowerCase(),
            field: "email"
          }]
        });
        if (user) return {
          user,
          accounts: [account]
        };
        return null;
      }
      else {
        const user = await (await getCurrentAdapter(adapter)).findOne({
          model: "user",
          where: [{
            value: email2.toLowerCase(),
            field: "email"
          }]
        });
        if (user) return {
          user,
          accounts: await (await getCurrentAdapter(adapter)).findMany({
            model: "account",
            where: [{
              value: user.id,
              field: "userId"
            }]
          }) || []
        };
        else return null;
      }
    },
    findUserByEmail: async (email2, options$1) => {
      const result = await (await getCurrentAdapter(adapter)).findOne({
        model: "user",
        where: [{
          value: email2.toLowerCase(),
          field: "email"
        }],
        join: { ...options$1?.includeAccounts ? { account: true } : {} }
      });
      if (!result) return null;
      const { account: accounts2, ...user } = result;
      return {
        user,
        accounts: accounts2 ?? []
      };
    },
    findUserById: async (userId) => {
      if (!userId) return null;
      return await (await getCurrentAdapter(adapter)).findOne({
        model: "user",
        where: [{
          field: "id",
          value: userId
        }]
      });
    },
    linkAccount: async (account) => {
      return await createWithHooks({
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        ...account
      }, "account", void 0);
    },
    updateUser: async (userId, data) => {
      const user = await updateWithHooks(data, [{
        field: "id",
        value: userId
      }], "user", void 0);
      await refreshUserSessions(user);
      return user;
    },
    updateUserByEmail: async (email2, data) => {
      const user = await updateWithHooks(data, [{
        field: "email",
        value: email2.toLowerCase()
      }], "user", void 0);
      await refreshUserSessions(user);
      return user;
    },
    updatePassword: async (userId, password) => {
      await updateManyWithHooks({ password }, [{
        field: "userId",
        value: userId
      }, {
        field: "providerId",
        value: "credential"
      }], "account", void 0);
    },
    findAccounts: async (userId) => {
      return await (await getCurrentAdapter(adapter)).findMany({
        model: "account",
        where: [{
          field: "userId",
          value: userId
        }]
      });
    },
    findAccount: async (accountId) => {
      return await (await getCurrentAdapter(adapter)).findOne({
        model: "account",
        where: [{
          field: "accountId",
          value: accountId
        }]
      });
    },
    findAccountByProviderId: async (accountId, providerId) => {
      return await (await getCurrentAdapter(adapter)).findOne({
        model: "account",
        where: [{
          field: "accountId",
          value: accountId
        }, {
          field: "providerId",
          value: providerId
        }]
      });
    },
    findAccountByUserId: async (userId) => {
      return await (await getCurrentAdapter(adapter)).findMany({
        model: "account",
        where: [{
          field: "userId",
          value: userId
        }]
      });
    },
    updateAccount: async (id, data) => {
      return await updateWithHooks(data, [{
        field: "id",
        value: id
      }], "account", void 0);
    },
    createVerificationValue: async (data) => {
      return await createWithHooks({
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        ...data
      }, "verification", void 0);
    },
    findVerificationValue: async (identifier) => {
      const verification = await (await getCurrentAdapter(adapter)).findMany({
        model: "verification",
        where: [{
          field: "identifier",
          value: identifier
        }],
        sortBy: {
          field: "createdAt",
          direction: "desc"
        },
        limit: 1
      });
      if (!options.verification?.disableCleanup) await deleteManyWithHooks([{
        field: "expiresAt",
        value: /* @__PURE__ */ new Date(),
        operator: "lt"
      }], "verification", void 0);
      return verification[0];
    },
    deleteVerificationValue: async (id) => {
      await deleteWithHooks([{
        field: "id",
        value: id
      }], "verification", void 0);
    },
    deleteVerificationByIdentifier: async (identifier) => {
      await deleteWithHooks([{
        field: "identifier",
        value: identifier
      }], "verification", void 0);
    },
    updateVerificationValue: async (id, data) => {
      return await updateWithHooks(data, [{
        field: "id",
        value: id
      }], "verification", void 0);
    }
  };
};
function toZodSchema({ fields, isClientSide }) {
  const zodFields = Object.keys(fields).reduce((acc, key) => {
    const field = fields[key];
    if (!field) return acc;
    if (isClientSide && field.input === false) return acc;
    let schema2;
    if (field.type === "json") schema2 = json ? json() : any();
    else if (field.type === "string[]" || field.type === "number[]") schema2 = array(field.type === "string[]" ? string() : number());
    else if (Array.isArray(field.type)) schema2 = any();
    else schema2 = z[field.type]();
    if (field?.required === false) schema2 = schema2.optional();
    if (field?.returned === false) return acc;
    return {
      ...acc,
      [key]: schema2
    };
  }, {});
  return object(zodFields);
}
function getSchema(config2) {
  const tables = (0, db_exports.getAuthTables)(config2);
  let schema2 = {};
  for (const key in tables) {
    const table = tables[key];
    const fields = table.fields;
    let actualFields = {};
    Object.entries(fields).forEach(([key$1, field]) => {
      actualFields[field.fieldName || key$1] = field;
      if (field.references) {
        const refTable = tables[field.references.model];
        if (refTable) actualFields[field.fieldName || key$1].references = {
          ...field.references,
          model: refTable.modelName,
          field: field.references.field
        };
      }
    });
    if (schema2[table.modelName]) {
      schema2[table.modelName].fields = {
        ...schema2[table.modelName].fields,
        ...actualFields
      };
      continue;
    }
    schema2[table.modelName] = {
      fields: actualFields,
      order: table.order || Infinity
    };
  }
  return schema2;
}
function getKyselyDatabaseType(db2) {
  if (!db2) return null;
  if ("dialect" in db2) return getKyselyDatabaseType(db2.dialect);
  if ("createDriver" in db2) {
    if (db2 instanceof SqliteDialect) return "sqlite";
    if (db2 instanceof MysqlDialect) return "mysql";
    if (db2 instanceof PostgresDialect) return "postgres";
    if (db2 instanceof MssqlDialect) return "mssql";
  }
  if ("aggregate" in db2) return "sqlite";
  if ("getConnection" in db2) return "mysql";
  if ("connect" in db2) return "postgres";
  if ("fileControl" in db2) return "sqlite";
  if ("open" in db2 && "close" in db2 && "prepare" in db2) return "sqlite";
  return null;
}
const createKyselyAdapter = async (config2) => {
  const db2 = config2.database;
  if (!db2) return {
    kysely: null,
    databaseType: null,
    transaction: void 0
  };
  if ("db" in db2) return {
    kysely: db2.db,
    databaseType: db2.type,
    transaction: db2.transaction
  };
  if ("dialect" in db2) return {
    kysely: new Kysely({ dialect: db2.dialect }),
    databaseType: db2.type,
    transaction: db2.transaction
  };
  let dialect = void 0;
  const databaseType = getKyselyDatabaseType(db2);
  if ("createDriver" in db2) dialect = db2;
  if ("aggregate" in db2 && !("createSession" in db2)) dialect = new SqliteDialect({ database: db2 });
  if ("getConnection" in db2) dialect = new MysqlDialect(db2);
  if ("connect" in db2) dialect = new PostgresDialect({ pool: db2 });
  if ("fileControl" in db2) {
    const { BunSqliteDialect } = await import("./bun-sqlite-dialect-CZkoC8t5.mjs");
    dialect = new BunSqliteDialect({ database: db2 });
  }
  if ("createSession" in db2 && typeof window === "undefined") {
    let DatabaseSync = void 0;
    try {
      let nodeSqlite = "node:sqlite";
      ({ DatabaseSync } = await import(
        /* @vite-ignore */
        /* webpackIgnore: true */
        nodeSqlite
      ));
    } catch (error2) {
      if (error2 !== null && typeof error2 === "object" && "code" in error2 && error2.code !== "ERR_UNKNOWN_BUILTIN_MODULE") throw error2;
    }
    if (DatabaseSync && db2 instanceof DatabaseSync) {
      const { NodeSqliteDialect } = await import("./node-sqlite-dialect-0sBQYD8M.mjs");
      dialect = new NodeSqliteDialect({ database: db2 });
    }
  }
  return {
    kysely: dialect ? new Kysely({ dialect }) : null,
    databaseType,
    transaction: void 0
  };
};
const initGetDefaultModelName = ({ usePlural, schema: schema2 }) => {
  const getDefaultModelName = (model) => {
    if (usePlural && model.charAt(model.length - 1) === "s") {
      let pluralessModel = model.slice(0, -1);
      let m$1 = schema2[pluralessModel] ? pluralessModel : void 0;
      if (!m$1) m$1 = Object.entries(schema2).find(([_, f]) => f.modelName === pluralessModel)?.[0];
      if (m$1) return m$1;
    }
    let m = schema2[model] ? model : void 0;
    if (!m) m = Object.entries(schema2).find(([_, f]) => f.modelName === model)?.[0];
    if (!m) throw new BetterAuthError(`Model "${model}" not found in schema`);
    return m;
  };
  return getDefaultModelName;
};
const initGetDefaultFieldName = ({ schema: schema2, usePlural }) => {
  const getDefaultModelName = initGetDefaultModelName({
    schema: schema2,
    usePlural
  });
  const getDefaultFieldName = ({ field, model: unsafeModel }) => {
    if (field === "id" || field === "_id") return "id";
    const model = getDefaultModelName(unsafeModel);
    let f = schema2[model]?.fields[field];
    if (!f) {
      const result = Object.entries(schema2[model].fields).find(([_, f$1]) => f$1.fieldName === field);
      if (result) {
        f = result[1];
        field = result[0];
      }
    }
    if (!f) throw new BetterAuthError(`Field ${field} not found in model ${model}`);
    return field;
  };
  return getDefaultFieldName;
};
const initGetIdField = ({ usePlural, schema: schema2, disableIdGeneration, options, customIdGenerator, supportsUUIDs }) => {
  const getDefaultModelName = initGetDefaultModelName({
    usePlural,
    schema: schema2
  });
  const idField = ({ customModelName, forceAllowId }) => {
    const useNumberId = options.advanced?.database?.useNumberId || options.advanced?.database?.generateId === "serial";
    const useUUIDs = options.advanced?.database?.generateId === "uuid";
    let shouldGenerateId = (() => {
      if (disableIdGeneration) return false;
      else if (useNumberId && !forceAllowId) return false;
      else if (useUUIDs) return !supportsUUIDs;
      else return true;
    })();
    const model = getDefaultModelName(customModelName ?? "id");
    return {
      type: useNumberId ? "number" : "string",
      required: shouldGenerateId ? true : false,
      ...shouldGenerateId ? { defaultValue() {
        if (disableIdGeneration) return void 0;
        let generateId$1$1 = options.advanced?.database?.generateId;
        if (generateId$1$1 === false || useNumberId) return void 0;
        if (typeof generateId$1$1 === "function") return generateId$1$1({ model });
        if (customIdGenerator) return customIdGenerator({ model });
        if (generateId$1$1 === "uuid") return crypto.randomUUID();
        return generateId$1();
      } } : {},
      transform: {
        input: (value) => {
          if (!value) return void 0;
          if (useNumberId) {
            const numberValue = Number(value);
            if (isNaN(numberValue)) return;
            return numberValue;
          }
          if (useUUIDs) {
            if (shouldGenerateId && !forceAllowId) return value;
            if (disableIdGeneration) return void 0;
            if (supportsUUIDs) return void 0;
            if (forceAllowId && typeof value === "string") if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) return value;
            else {
              const stack = (/* @__PURE__ */ new Error()).stack?.split("\n").filter((_, i) => i !== 1).join("\n").replace("Error:", "");
              logger.warn("[Adapter Factory] - Invalid UUID value for field `id` provided when `forceAllowId` is true. Generating a new UUID.", stack);
            }
            if (typeof value !== "string" && !supportsUUIDs) return crypto.randomUUID();
            return;
          }
          return value;
        },
        output: (value) => {
          if (!value) return void 0;
          return String(value);
        }
      }
    };
  };
  return idField;
};
const initGetFieldAttributes = ({ usePlural, schema: schema2, options, customIdGenerator, disableIdGeneration }) => {
  const getDefaultModelName = initGetDefaultModelName({
    usePlural,
    schema: schema2
  });
  const getDefaultFieldName = initGetDefaultFieldName({
    usePlural,
    schema: schema2
  });
  const idField = initGetIdField({
    usePlural,
    schema: schema2,
    options,
    customIdGenerator,
    disableIdGeneration
  });
  const getFieldAttributes = ({ model, field }) => {
    const defaultModelName = getDefaultModelName(model);
    const defaultFieldName = getDefaultFieldName({
      field,
      model: defaultModelName
    });
    const fields = schema2[defaultModelName].fields;
    fields.id = idField({ customModelName: defaultModelName });
    const fieldAttributes = fields[defaultFieldName];
    if (!fieldAttributes) throw new BetterAuthError(`Field ${field} not found in model ${model}`);
    return fieldAttributes;
  };
  return getFieldAttributes;
};
const initGetFieldName = ({ schema: schema2, usePlural }) => {
  const getDefaultModelName = initGetDefaultModelName({
    schema: schema2,
    usePlural
  });
  const getDefaultFieldName = initGetDefaultFieldName({
    schema: schema2,
    usePlural
  });
  function getFieldName({ model: modelName, field: fieldName }) {
    const model = getDefaultModelName(modelName);
    const field = getDefaultFieldName({
      model,
      field: fieldName
    });
    return schema2[model]?.fields[field]?.fieldName || field;
  }
  return getFieldName;
};
const initGetModelName = ({ usePlural, schema: schema2 }) => {
  const getDefaultModelName = initGetDefaultModelName({
    schema: schema2,
    usePlural
  });
  const getModelName = (model) => {
    const defaultModelKey = getDefaultModelName(model);
    if (schema2 && schema2[defaultModelKey] && schema2[defaultModelKey].modelName !== model) return usePlural ? `${schema2[defaultModelKey].modelName}s` : schema2[defaultModelKey].modelName;
    return usePlural ? `${model}s` : model;
  };
  return getModelName;
};
function withApplyDefault(value, field, action) {
  if (action === "update") {
    if (value === void 0 && field.onUpdate !== void 0) {
      if (typeof field.onUpdate === "function") return field.onUpdate();
      return field.onUpdate;
    }
    return value;
  }
  if (action === "create") {
    if (value === void 0 || field.required === true && value === null) {
      if (field.defaultValue !== void 0) {
        if (typeof field.defaultValue === "function") return field.defaultValue();
        return field.defaultValue;
      }
    }
  }
  return value;
}
let debugLogs = [];
let transactionId = -1;
const createAsIsTransaction = (adapter) => (fn) => fn(adapter);
const createAdapterFactory = ({ adapter: customAdapter, config: cfg }) => (options) => {
  const uniqueAdapterFactoryInstanceId = Math.random().toString(36).substring(2, 15);
  const config2 = {
    ...cfg,
    supportsBooleans: cfg.supportsBooleans ?? true,
    supportsDates: cfg.supportsDates ?? true,
    supportsJSON: cfg.supportsJSON ?? false,
    adapterName: cfg.adapterName ?? cfg.adapterId,
    supportsNumericIds: cfg.supportsNumericIds ?? true,
    supportsUUIDs: cfg.supportsUUIDs ?? false,
    supportsArrays: cfg.supportsArrays ?? false,
    transaction: cfg.transaction ?? false,
    disableTransformInput: cfg.disableTransformInput ?? false,
    disableTransformOutput: cfg.disableTransformOutput ?? false,
    disableTransformJoin: cfg.disableTransformJoin ?? false
  };
  if ((options.advanced?.database?.useNumberId === true || options.advanced?.database?.generateId === "serial") && config2.supportsNumericIds === false) throw new BetterAuthError(`[${config2.adapterName}] Your database or database adapter does not support numeric ids. Please disable "useNumberId" in your config.`);
  const schema2 = getAuthTables(options);
  const debugLog = (...args) => {
    if (config2.debugLogs === true || typeof config2.debugLogs === "object") {
      const logger$2 = createLogger({ level: "info" });
      if (typeof config2.debugLogs === "object" && "isRunningAdapterTests" in config2.debugLogs) {
        if (config2.debugLogs.isRunningAdapterTests) {
          args.shift();
          debugLogs.push({
            instance: uniqueAdapterFactoryInstanceId,
            args
          });
        }
        return;
      }
      if (typeof config2.debugLogs === "object" && config2.debugLogs.logCondition && !config2.debugLogs.logCondition?.()) return;
      if (typeof args[0] === "object" && "method" in args[0]) {
        const method = args.shift().method;
        if (typeof config2.debugLogs === "object") {
          if (method === "create" && !config2.debugLogs.create) return;
          else if (method === "update" && !config2.debugLogs.update) return;
          else if (method === "updateMany" && !config2.debugLogs.updateMany) return;
          else if (method === "findOne" && !config2.debugLogs.findOne) return;
          else if (method === "findMany" && !config2.debugLogs.findMany) return;
          else if (method === "delete" && !config2.debugLogs.delete) return;
          else if (method === "deleteMany" && !config2.debugLogs.deleteMany) return;
          else if (method === "count" && !config2.debugLogs.count) return;
        }
        logger$2.info(`[${config2.adapterName}]`, ...args);
      } else logger$2.info(`[${config2.adapterName}]`, ...args);
    }
  };
  const logger$1 = createLogger(options.logger);
  const getDefaultModelName = initGetDefaultModelName({
    usePlural: config2.usePlural,
    schema: schema2
  });
  const getDefaultFieldName = initGetDefaultFieldName({
    usePlural: config2.usePlural,
    schema: schema2
  });
  const getModelName = initGetModelName({
    usePlural: config2.usePlural,
    schema: schema2
  });
  const getFieldName = initGetFieldName({
    schema: schema2,
    usePlural: config2.usePlural
  });
  const idField = initGetIdField({
    schema: schema2,
    options,
    usePlural: config2.usePlural,
    disableIdGeneration: config2.disableIdGeneration,
    customIdGenerator: config2.customIdGenerator,
    supportsUUIDs: config2.supportsUUIDs
  });
  const getFieldAttributes = initGetFieldAttributes({
    schema: schema2,
    options,
    usePlural: config2.usePlural,
    disableIdGeneration: config2.disableIdGeneration,
    customIdGenerator: config2.customIdGenerator
  });
  const transformInput = async (data, defaultModelName, action, forceAllowId) => {
    const transformedData = {};
    const fields = schema2[defaultModelName].fields;
    const newMappedKeys = config2.mapKeysTransformInput ?? {};
    const useNumberId = options.advanced?.database?.useNumberId || options.advanced?.database?.generateId === "serial";
    fields.id = idField({
      customModelName: defaultModelName,
      forceAllowId: forceAllowId && "id" in data
    });
    for (const field in fields) {
      let value = data[field];
      const fieldAttributes = fields[field];
      let newFieldName = newMappedKeys[field] || fields[field].fieldName || field;
      if (value === void 0 && (fieldAttributes.defaultValue === void 0 && !fieldAttributes.transform?.input && !(action === "update" && fieldAttributes.onUpdate) || action === "update" && !fieldAttributes.onUpdate)) continue;
      if (fieldAttributes && fieldAttributes.type === "date" && !(value instanceof Date) && typeof value === "string") try {
        value = new Date(value);
      } catch {
        logger$1.error("[Adapter Factory] Failed to convert string to date", {
          value,
          field
        });
      }
      let newValue = withApplyDefault(value, fieldAttributes, action);
      if (fieldAttributes.transform?.input) newValue = await fieldAttributes.transform.input(newValue);
      if (fieldAttributes.references?.field === "id" && useNumberId) if (Array.isArray(newValue)) newValue = newValue.map((x) => x !== null ? Number(x) : null);
      else newValue = newValue !== null ? Number(newValue) : null;
      else if (config2.supportsJSON === false && typeof newValue === "object" && fieldAttributes.type === "json") newValue = JSON.stringify(newValue);
      else if (config2.supportsArrays === false && Array.isArray(newValue) && (fieldAttributes.type === "string[]" || fieldAttributes.type === "number[]")) newValue = JSON.stringify(newValue);
      else if (config2.supportsDates === false && newValue instanceof Date && fieldAttributes.type === "date") newValue = newValue.toISOString();
      else if (config2.supportsBooleans === false && typeof newValue === "boolean") newValue = newValue ? 1 : 0;
      if (config2.customTransformInput) newValue = config2.customTransformInput({
        data: newValue,
        action,
        field: newFieldName,
        fieldAttributes,
        model: getModelName(defaultModelName),
        schema: schema2,
        options
      });
      if (newValue !== void 0) transformedData[newFieldName] = newValue;
    }
    return transformedData;
  };
  const transformOutput = async (data, unsafe_model, select = [], join) => {
    const transformSingleOutput = async (data$1, unsafe_model$1, select$1 = []) => {
      if (!data$1) return null;
      const newMappedKeys = config2.mapKeysTransformOutput ?? {};
      const transformedData$1 = {};
      const tableSchema = schema2[getDefaultModelName(unsafe_model$1)].fields;
      const idKey = Object.entries(newMappedKeys).find(([_, v]) => v === "id")?.[0];
      tableSchema[idKey ?? "id"] = { type: options.advanced?.database?.useNumberId || options.advanced?.database?.generateId === "serial" ? "number" : "string" };
      for (const key in tableSchema) {
        if (select$1.length && !select$1.includes(key)) continue;
        const field = tableSchema[key];
        if (field) {
          const originalKey = field.fieldName || key;
          let newValue = data$1[Object.entries(newMappedKeys).find(([_, v]) => v === originalKey)?.[0] || originalKey];
          if (field.transform?.output) newValue = await field.transform.output(newValue);
          let newFieldName = newMappedKeys[key] || key;
          if (originalKey === "id" || field.references?.field === "id") {
            if (typeof newValue !== "undefined" && newValue !== null) newValue = String(newValue);
          } else if (config2.supportsJSON === false && typeof newValue === "string" && field.type === "json") newValue = safeJSONParse(newValue);
          else if (config2.supportsArrays === false && typeof newValue === "string" && (field.type === "string[]" || field.type === "number[]")) newValue = safeJSONParse(newValue);
          else if (config2.supportsDates === false && typeof newValue === "string" && field.type === "date") newValue = new Date(newValue);
          else if (config2.supportsBooleans === false && typeof newValue === "number" && field.type === "boolean") newValue = newValue === 1;
          if (config2.customTransformOutput) newValue = config2.customTransformOutput({
            data: newValue,
            field: newFieldName,
            fieldAttributes: field,
            select: select$1,
            model: getModelName(unsafe_model$1),
            schema: schema2,
            options
          });
          transformedData$1[newFieldName] = newValue;
        }
      }
      return transformedData$1;
    };
    if (!join || Object.keys(join).length === 0) return await transformSingleOutput(data, unsafe_model, select);
    unsafe_model = getDefaultModelName(unsafe_model);
    let transformedData = await transformSingleOutput(data, unsafe_model, select);
    const requiredModels = Object.entries(join).map(([model, joinConfig]) => ({
      modelName: getModelName(model),
      defaultModelName: getDefaultModelName(model),
      joinConfig
    }));
    if (!data) return null;
    for (const { modelName, defaultModelName, joinConfig } of requiredModels) {
      let joinedData = await (async () => {
        if (options.experimental?.joins) return data[modelName];
        else return await handleFallbackJoin({
          baseModel: unsafe_model,
          baseData: transformedData,
          joinModel: modelName,
          specificJoinConfig: joinConfig
        });
      })();
      if (joinedData === void 0 || joinedData === null) joinedData = joinConfig.relation === "one-to-one" ? null : [];
      if (joinConfig.relation === "one-to-many" && !Array.isArray(joinedData)) joinedData = [joinedData];
      let transformed = [];
      if (Array.isArray(joinedData)) for (const item of joinedData) {
        const transformedItem = await transformSingleOutput(item, modelName, []);
        transformed.push(transformedItem);
      }
      else {
        const transformedItem = await transformSingleOutput(joinedData, modelName, []);
        transformed.push(transformedItem);
      }
      transformedData[defaultModelName] = (joinConfig.relation === "one-to-one" ? transformed[0] : transformed) ?? null;
    }
    return transformedData;
  };
  const transformWhereClause = ({ model, where, action }) => {
    if (!where) return void 0;
    const newMappedKeys = config2.mapKeysTransformInput ?? {};
    return where.map((w) => {
      const { field: unsafe_field, value, operator = "eq", connector = "AND" } = w;
      if (operator === "in") {
        if (!Array.isArray(value)) throw new BetterAuthError("Value must be an array");
      }
      let newValue = value;
      const defaultModelName = getDefaultModelName(model);
      const defaultFieldName = getDefaultFieldName({
        field: unsafe_field,
        model
      });
      const fieldName = newMappedKeys[defaultFieldName] || getFieldName({
        field: defaultFieldName,
        model: defaultModelName
      });
      const fieldAttr = getFieldAttributes({
        field: defaultFieldName,
        model: defaultModelName
      });
      const useNumberId = options.advanced?.database?.useNumberId || options.advanced?.database?.generateId === "serial";
      if (defaultFieldName === "id" || fieldAttr.references?.field === "id") {
        if (useNumberId) if (Array.isArray(value)) newValue = value.map(Number);
        else newValue = Number(value);
      }
      if (fieldAttr.type === "date" && value instanceof Date && !config2.supportsDates) newValue = value.toISOString();
      if (fieldAttr.type === "boolean" && typeof value === "boolean" && !config2.supportsBooleans) newValue = value ? 1 : 0;
      if (fieldAttr.type === "json" && typeof value === "object" && !config2.supportsJSON) try {
        newValue = JSON.stringify(value);
      } catch (error2) {
        throw new Error(`Failed to stringify JSON value for field ${fieldName}`, { cause: error2 });
      }
      if (config2.customTransformInput) newValue = config2.customTransformInput({
        data: newValue,
        fieldAttributes: fieldAttr,
        field: fieldName,
        model: getModelName(model),
        schema: schema2,
        options,
        action
      });
      return {
        operator,
        connector,
        field: fieldName,
        value: newValue
      };
    });
  };
  const transformJoinClause = (baseModel, unsanitizedJoin, select) => {
    if (!unsanitizedJoin) return void 0;
    if (Object.keys(unsanitizedJoin).length === 0) return void 0;
    const transformedJoin = {};
    for (const [model, join] of Object.entries(unsanitizedJoin)) {
      if (!join) continue;
      const defaultModelName = getDefaultModelName(model);
      const defaultBaseModelName = getDefaultModelName(baseModel);
      let foreignKeys = Object.entries(schema2[defaultModelName].fields).filter(([field, fieldAttributes]) => fieldAttributes.references && getDefaultModelName(fieldAttributes.references.model) === defaultBaseModelName);
      let isForwardJoin = true;
      if (!foreignKeys.length) {
        foreignKeys = Object.entries(schema2[defaultBaseModelName].fields).filter(([field, fieldAttributes]) => fieldAttributes.references && getDefaultModelName(fieldAttributes.references.model) === defaultModelName);
        isForwardJoin = false;
      }
      if (!foreignKeys.length) throw new BetterAuthError(`No foreign key found for model ${model} and base model ${baseModel} while performing join operation.`);
      else if (foreignKeys.length > 1) throw new BetterAuthError(`Multiple foreign keys found for model ${model} and base model ${baseModel} while performing join operation. Only one foreign key is supported.`);
      const [foreignKey, foreignKeyAttributes] = foreignKeys[0];
      if (!foreignKeyAttributes.references) throw new BetterAuthError(`No references found for foreign key ${foreignKey} on model ${model} while performing join operation.`);
      let from;
      let to;
      let requiredSelectField;
      if (isForwardJoin) {
        requiredSelectField = foreignKeyAttributes.references.field;
        from = getFieldName({
          model: baseModel,
          field: requiredSelectField
        });
        to = getFieldName({
          model,
          field: foreignKey
        });
      } else {
        requiredSelectField = foreignKey;
        from = getFieldName({
          model: baseModel,
          field: requiredSelectField
        });
        to = getFieldName({
          model,
          field: foreignKeyAttributes.references.field
        });
      }
      if (select && !select.includes(requiredSelectField)) select.push(requiredSelectField);
      const isUnique = to === "id" ? true : foreignKeyAttributes.unique ?? false;
      let limit = options.advanced?.database?.defaultFindManyLimit ?? 100;
      if (isUnique) limit = 1;
      else if (typeof join === "object" && typeof join.limit === "number") limit = join.limit;
      transformedJoin[getModelName(model)] = {
        on: {
          from,
          to
        },
        limit,
        relation: isUnique ? "one-to-one" : "one-to-many"
      };
    }
    return {
      join: transformedJoin,
      select
    };
  };
  const handleFallbackJoin = async ({ baseModel, baseData, joinModel, specificJoinConfig: joinConfig }) => {
    if (!baseData) return baseData;
    const modelName = getModelName(joinModel);
    const field = joinConfig.on.to;
    const value = baseData[getDefaultFieldName({
      field: joinConfig.on.from,
      model: baseModel
    })];
    if (value === null || value === void 0) return joinConfig.relation === "one-to-one" ? null : [];
    let result;
    const where = transformWhereClause({
      model: modelName,
      where: [{
        field,
        value,
        operator: "eq",
        connector: "AND"
      }],
      action: "findOne"
    });
    try {
      if (joinConfig.relation === "one-to-one") result = await adapterInstance.findOne({
        model: modelName,
        where
      });
      else {
        const limit = joinConfig.limit ?? options.advanced?.database?.defaultFindManyLimit ?? 100;
        result = await adapterInstance.findMany({
          model: modelName,
          where,
          limit
        });
      }
    } catch (error2) {
      logger$1.error(`Failed to query fallback join for model ${modelName}:`, {
        where,
        limit: joinConfig.limit
      });
      console.error(error2);
      throw error2;
    }
    return result;
  };
  const adapterInstance = customAdapter({
    options,
    schema: schema2,
    debugLog,
    getFieldName,
    getModelName,
    getDefaultModelName,
    getDefaultFieldName,
    getFieldAttributes,
    transformInput,
    transformOutput,
    transformWhereClause
  });
  let lazyLoadTransaction = null;
  const adapter = {
    transaction: async (cb) => {
      if (!lazyLoadTransaction) if (!config2.transaction) lazyLoadTransaction = createAsIsTransaction(adapter);
      else {
        logger$1.debug(`[${config2.adapterName}] - Using provided transaction implementation.`);
        lazyLoadTransaction = config2.transaction;
      }
      return lazyLoadTransaction(cb);
    },
    create: async ({ data: unsafeData, model: unsafeModel, select, forceAllowId = false }) => {
      transactionId++;
      let thisTransactionId = transactionId;
      const model = getModelName(unsafeModel);
      unsafeModel = getDefaultModelName(unsafeModel);
      if ("id" in unsafeData && typeof unsafeData.id !== "undefined" && !forceAllowId) {
        logger$1.warn(`[${config2.adapterName}] - You are trying to create a record with an id. This is not allowed as we handle id generation for you, unless you pass in the \`forceAllowId\` parameter. The id will be ignored.`);
        const stack = (/* @__PURE__ */ new Error()).stack?.split("\n").filter((_, i) => i !== 1).join("\n").replace("Error:", "Create method with `id` being called at:");
        console.log(stack);
        unsafeData.id = void 0;
      }
      debugLog({ method: "create" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 4)}`, `${formatMethod("create")} ${formatAction("Unsafe Input")}:`, {
        model,
        data: unsafeData
      });
      let data = unsafeData;
      if (!config2.disableTransformInput) data = await transformInput(unsafeData, unsafeModel, "create", forceAllowId);
      debugLog({ method: "create" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 4)}`, `${formatMethod("create")} ${formatAction("Parsed Input")}:`, {
        model,
        data
      });
      const res = await adapterInstance.create({
        data,
        model
      });
      debugLog({ method: "create" }, `${formatTransactionId(thisTransactionId)} ${formatStep(3, 4)}`, `${formatMethod("create")} ${formatAction("DB Result")}:`, {
        model,
        res
      });
      let transformed = res;
      if (!config2.disableTransformOutput) transformed = await transformOutput(res, unsafeModel, select, void 0);
      debugLog({ method: "create" }, `${formatTransactionId(thisTransactionId)} ${formatStep(4, 4)}`, `${formatMethod("create")} ${formatAction("Parsed Result")}:`, {
        model,
        data: transformed
      });
      return transformed;
    },
    update: async ({ model: unsafeModel, where: unsafeWhere, update: unsafeData }) => {
      transactionId++;
      let thisTransactionId = transactionId;
      unsafeModel = getDefaultModelName(unsafeModel);
      const model = getModelName(unsafeModel);
      const where = transformWhereClause({
        model: unsafeModel,
        where: unsafeWhere,
        action: "update"
      });
      debugLog({ method: "update" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 4)}`, `${formatMethod("update")} ${formatAction("Unsafe Input")}:`, {
        model,
        data: unsafeData
      });
      let data = unsafeData;
      if (!config2.disableTransformInput) data = await transformInput(unsafeData, unsafeModel, "update");
      debugLog({ method: "update" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 4)}`, `${formatMethod("update")} ${formatAction("Parsed Input")}:`, {
        model,
        data
      });
      const res = await adapterInstance.update({
        model,
        where,
        update: data
      });
      debugLog({ method: "update" }, `${formatTransactionId(thisTransactionId)} ${formatStep(3, 4)}`, `${formatMethod("update")} ${formatAction("DB Result")}:`, {
        model,
        data: res
      });
      let transformed = res;
      if (!config2.disableTransformOutput) transformed = await transformOutput(res, unsafeModel, void 0, void 0);
      debugLog({ method: "update" }, `${formatTransactionId(thisTransactionId)} ${formatStep(4, 4)}`, `${formatMethod("update")} ${formatAction("Parsed Result")}:`, {
        model,
        data: transformed
      });
      return transformed;
    },
    updateMany: async ({ model: unsafeModel, where: unsafeWhere, update: unsafeData }) => {
      transactionId++;
      let thisTransactionId = transactionId;
      const model = getModelName(unsafeModel);
      const where = transformWhereClause({
        model: unsafeModel,
        where: unsafeWhere,
        action: "updateMany"
      });
      unsafeModel = getDefaultModelName(unsafeModel);
      debugLog({ method: "updateMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 4)}`, `${formatMethod("updateMany")} ${formatAction("Unsafe Input")}:`, {
        model,
        data: unsafeData
      });
      let data = unsafeData;
      if (!config2.disableTransformInput) data = await transformInput(unsafeData, unsafeModel, "update");
      debugLog({ method: "updateMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 4)}`, `${formatMethod("updateMany")} ${formatAction("Parsed Input")}:`, {
        model,
        data
      });
      const updatedCount = await adapterInstance.updateMany({
        model,
        where,
        update: data
      });
      debugLog({ method: "updateMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(3, 4)}`, `${formatMethod("updateMany")} ${formatAction("DB Result")}:`, {
        model,
        data: updatedCount
      });
      debugLog({ method: "updateMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(4, 4)}`, `${formatMethod("updateMany")} ${formatAction("Parsed Result")}:`, {
        model,
        data: updatedCount
      });
      return updatedCount;
    },
    findOne: async ({ model: unsafeModel, where: unsafeWhere, select, join: unsafeJoin }) => {
      transactionId++;
      let thisTransactionId = transactionId;
      const model = getModelName(unsafeModel);
      const where = transformWhereClause({
        model: unsafeModel,
        where: unsafeWhere,
        action: "findOne"
      });
      unsafeModel = getDefaultModelName(unsafeModel);
      let join;
      let passJoinToAdapter = true;
      if (!config2.disableTransformJoin) {
        const result = transformJoinClause(unsafeModel, unsafeJoin, select);
        if (result) {
          join = result.join;
          select = result.select;
        }
        if (!options.experimental?.joins && join && Object.keys(join).length > 0) passJoinToAdapter = false;
      } else join = unsafeJoin;
      debugLog({ method: "findOne" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 3)}`, `${formatMethod("findOne")}:`, {
        model,
        where,
        select,
        join
      });
      const res = await adapterInstance.findOne({
        model,
        where,
        select,
        join: passJoinToAdapter ? join : void 0
      });
      debugLog({ method: "findOne" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 3)}`, `${formatMethod("findOne")} ${formatAction("DB Result")}:`, {
        model,
        data: res
      });
      let transformed = res;
      if (!config2.disableTransformOutput) transformed = await transformOutput(res, unsafeModel, select, join);
      debugLog({ method: "findOne" }, `${formatTransactionId(thisTransactionId)} ${formatStep(3, 3)}`, `${formatMethod("findOne")} ${formatAction("Parsed Result")}:`, {
        model,
        data: transformed
      });
      return transformed;
    },
    findMany: async ({ model: unsafeModel, where: unsafeWhere, limit: unsafeLimit, sortBy, offset, join: unsafeJoin }) => {
      transactionId++;
      let thisTransactionId = transactionId;
      const limit = unsafeLimit ?? options.advanced?.database?.defaultFindManyLimit ?? 100;
      const model = getModelName(unsafeModel);
      const where = transformWhereClause({
        model: unsafeModel,
        where: unsafeWhere,
        action: "findMany"
      });
      unsafeModel = getDefaultModelName(unsafeModel);
      let join;
      let passJoinToAdapter = true;
      if (!config2.disableTransformJoin) {
        const result = transformJoinClause(unsafeModel, unsafeJoin, void 0);
        if (result) join = result.join;
        if (!options.experimental?.joins && join && Object.keys(join).length > 0) passJoinToAdapter = false;
      } else join = unsafeJoin;
      debugLog({ method: "findMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 3)}`, `${formatMethod("findMany")}:`, {
        model,
        where,
        limit,
        sortBy,
        offset,
        join
      });
      const res = await adapterInstance.findMany({
        model,
        where,
        limit,
        sortBy,
        offset,
        join: passJoinToAdapter ? join : void 0
      });
      debugLog({ method: "findMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 3)}`, `${formatMethod("findMany")} ${formatAction("DB Result")}:`, {
        model,
        data: res
      });
      let transformed = res;
      if (!config2.disableTransformOutput) transformed = await Promise.all(res.map(async (r) => {
        return await transformOutput(r, unsafeModel, void 0, join);
      }));
      debugLog({ method: "findMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(3, 3)}`, `${formatMethod("findMany")} ${formatAction("Parsed Result")}:`, {
        model,
        data: transformed
      });
      return transformed;
    },
    delete: async ({ model: unsafeModel, where: unsafeWhere }) => {
      transactionId++;
      let thisTransactionId = transactionId;
      const model = getModelName(unsafeModel);
      const where = transformWhereClause({
        model: unsafeModel,
        where: unsafeWhere,
        action: "delete"
      });
      unsafeModel = getDefaultModelName(unsafeModel);
      debugLog({ method: "delete" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 2)}`, `${formatMethod("delete")}:`, {
        model,
        where
      });
      await adapterInstance.delete({
        model,
        where
      });
      debugLog({ method: "delete" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 2)}`, `${formatMethod("delete")} ${formatAction("DB Result")}:`, { model });
    },
    deleteMany: async ({ model: unsafeModel, where: unsafeWhere }) => {
      transactionId++;
      let thisTransactionId = transactionId;
      const model = getModelName(unsafeModel);
      const where = transformWhereClause({
        model: unsafeModel,
        where: unsafeWhere,
        action: "deleteMany"
      });
      unsafeModel = getDefaultModelName(unsafeModel);
      debugLog({ method: "deleteMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 2)}`, `${formatMethod("deleteMany")} ${formatAction("DeleteMany")}:`, {
        model,
        where
      });
      const res = await adapterInstance.deleteMany({
        model,
        where
      });
      debugLog({ method: "deleteMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 2)}`, `${formatMethod("deleteMany")} ${formatAction("DB Result")}:`, {
        model,
        data: res
      });
      return res;
    },
    count: async ({ model: unsafeModel, where: unsafeWhere }) => {
      transactionId++;
      let thisTransactionId = transactionId;
      const model = getModelName(unsafeModel);
      const where = transformWhereClause({
        model: unsafeModel,
        where: unsafeWhere,
        action: "count"
      });
      unsafeModel = getDefaultModelName(unsafeModel);
      debugLog({ method: "count" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 2)}`, `${formatMethod("count")}:`, {
        model,
        where
      });
      const res = await adapterInstance.count({
        model,
        where
      });
      debugLog({ method: "count" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 2)}`, `${formatMethod("count")}:`, {
        model,
        data: res
      });
      return res;
    },
    createSchema: adapterInstance.createSchema ? async (_, file) => {
      const tables = getAuthTables(options);
      if (options.secondaryStorage && !options.session?.storeSessionInDatabase) delete tables.session;
      if (options.rateLimit && options.rateLimit.storage === "database" && (typeof options.rateLimit.enabled === "undefined" || options.rateLimit.enabled === true)) tables.ratelimit = {
        modelName: options.rateLimit.modelName ?? "ratelimit",
        fields: {
          key: {
            type: "string",
            unique: true,
            required: true,
            fieldName: options.rateLimit.fields?.key ?? "key"
          },
          count: {
            type: "number",
            required: true,
            fieldName: options.rateLimit.fields?.count ?? "count"
          },
          lastRequest: {
            type: "number",
            required: true,
            bigint: true,
            defaultValue: () => Date.now(),
            fieldName: options.rateLimit.fields?.lastRequest ?? "lastRequest"
          }
        }
      };
      return adapterInstance.createSchema({
        file,
        tables
      });
    } : void 0,
    options: {
      adapterConfig: config2,
      ...adapterInstance.options ?? {}
    },
    id: config2.adapterId,
    ...config2.debugLogs?.isRunningAdapterTests ? { adapterTestDebugLogs: {
      resetDebugLogs() {
        debugLogs = debugLogs.filter((log) => log.instance !== uniqueAdapterFactoryInstanceId);
      },
      printDebugLogs() {
        const separator = `─`.repeat(80);
        const logs = debugLogs.filter((log$1) => log$1.instance === uniqueAdapterFactoryInstanceId);
        if (logs.length === 0) return;
        let log = logs.reverse().map((log$1) => {
          log$1.args[0] = `
${log$1.args[0]}`;
          return [...log$1.args, "\n"];
        }).reduce((prev, curr) => {
          return [...curr, ...prev];
        }, [`
${separator}`]);
        console.log(...log);
      }
    } } : {}
  };
  return adapter;
};
function formatTransactionId(transactionId$1) {
  if (getColorDepth() < 8) return `#${transactionId$1}`;
  return `${TTY_COLORS.fg.magenta}#${transactionId$1}${TTY_COLORS.reset}`;
}
function formatStep(step, total) {
  return `${TTY_COLORS.bg.black}${TTY_COLORS.fg.yellow}[${step}/${total}]${TTY_COLORS.reset}`;
}
function formatMethod(method) {
  return `${TTY_COLORS.bright}${method}${TTY_COLORS.reset}`;
}
function formatAction(action) {
  return `${TTY_COLORS.dim}(${action})${TTY_COLORS.reset}`;
}
const map = {
  postgres: {
    string: [
      "character varying",
      "varchar",
      "text",
      "uuid"
    ],
    number: [
      "int4",
      "integer",
      "bigint",
      "smallint",
      "numeric",
      "real",
      "double precision"
    ],
    boolean: ["bool", "boolean"],
    date: [
      "timestamptz",
      "timestamp",
      "date"
    ],
    json: ["json", "jsonb"]
  },
  mysql: {
    string: [
      "varchar",
      "text",
      "uuid"
    ],
    number: [
      "integer",
      "int",
      "bigint",
      "smallint",
      "decimal",
      "float",
      "double"
    ],
    boolean: ["boolean", "tinyint"],
    date: [
      "timestamp",
      "datetime",
      "date"
    ],
    json: ["json"]
  },
  sqlite: {
    string: ["TEXT"],
    number: ["INTEGER", "REAL"],
    boolean: ["INTEGER", "BOOLEAN"],
    date: ["DATE", "INTEGER"],
    json: ["TEXT"]
  },
  mssql: {
    string: [
      "varchar",
      "nvarchar",
      "uniqueidentifier"
    ],
    number: [
      "int",
      "bigint",
      "smallint",
      "decimal",
      "float",
      "double"
    ],
    boolean: ["bit", "smallint"],
    date: [
      "datetime2",
      "date",
      "datetime"
    ],
    json: ["varchar", "nvarchar"]
  }
};
function matchType(columnDataType, fieldType, dbType) {
  function normalize(type) {
    return type.toLowerCase().split("(")[0].trim();
  }
  if (fieldType === "string[]" || fieldType === "number[]") return columnDataType.toLowerCase().includes("json");
  const types = map[dbType];
  return (Array.isArray(fieldType) ? types["string"].map((t) => t.toLowerCase()) : types[fieldType].map((t) => t.toLowerCase())).includes(normalize(columnDataType));
}
async function getPostgresSchema(db2) {
  try {
    const result = await sql$1`SHOW search_path`.execute(db2);
    if (result.rows[0]?.search_path) return result.rows[0].search_path.split(",").map((s) => s.trim()).map((s) => s.replace(/^["']|["']$/g, "")).filter((s) => !s.startsWith("$"))[0] || "public";
  } catch {
  }
  return "public";
}
async function getMigrations(config2) {
  const betterAuthSchema = getSchema(config2);
  const logger$1 = createLogger(config2.logger);
  let { kysely: db2, databaseType: dbType } = await createKyselyAdapter(config2);
  if (!dbType) {
    logger$1.warn("Could not determine database type, defaulting to sqlite. Please provide a type in the database options to avoid this.");
    dbType = "sqlite";
  }
  if (!db2) {
    logger$1.error("Only kysely adapter is supported for migrations. You can use `generate` command to generate the schema, if you're using a different adapter.");
    process.exit(1);
  }
  let currentSchema = "public";
  if (dbType === "postgres") {
    currentSchema = await getPostgresSchema(db2);
    logger$1.debug(`PostgreSQL migration: Using schema '${currentSchema}' (from search_path)`);
    try {
      if (!(await sql$1`
				SELECT schema_name 
				FROM information_schema.schemata 
				WHERE schema_name = ${currentSchema}
			`.execute(db2)).rows[0]) logger$1.warn(`Schema '${currentSchema}' does not exist. Tables will be inspected from available schemas. Consider creating the schema first or checking your database configuration.`);
    } catch (error2) {
      logger$1.debug(`Could not verify schema existence: ${error2 instanceof Error ? error2.message : String(error2)}`);
    }
  }
  const allTableMetadata = await db2.introspection.getTables();
  let tableMetadata = allTableMetadata;
  if (dbType === "postgres") try {
    const tablesInSchema = await sql$1`
				SELECT table_name 
				FROM information_schema.tables 
				WHERE table_schema = ${currentSchema}
				AND table_type = 'BASE TABLE'
			`.execute(db2);
    const tableNamesInSchema = new Set(tablesInSchema.rows.map((row) => row.table_name));
    tableMetadata = allTableMetadata.filter((table) => table.schema === currentSchema && tableNamesInSchema.has(table.name));
    logger$1.debug(`Found ${tableMetadata.length} table(s) in schema '${currentSchema}': ${tableMetadata.map((t) => t.name).join(", ") || "(none)"}`);
  } catch (error2) {
    logger$1.warn(`Could not filter tables by schema. Using all discovered tables. Error: ${error2 instanceof Error ? error2.message : String(error2)}`);
  }
  const toBeCreated = [];
  const toBeAdded = [];
  for (const [key, value] of Object.entries(betterAuthSchema)) {
    const table = tableMetadata.find((t) => t.name === key);
    if (!table) {
      const tIndex = toBeCreated.findIndex((t) => t.table === key);
      const tableData = {
        table: key,
        fields: value.fields,
        order: value.order || Infinity
      };
      const insertIndex = toBeCreated.findIndex((t) => (t.order || Infinity) > tableData.order);
      if (insertIndex === -1) if (tIndex === -1) toBeCreated.push(tableData);
      else toBeCreated[tIndex].fields = {
        ...toBeCreated[tIndex].fields,
        ...value.fields
      };
      else toBeCreated.splice(insertIndex, 0, tableData);
      continue;
    }
    let toBeAddedFields = {};
    for (const [fieldName, field] of Object.entries(value.fields)) {
      const column = table.columns.find((c) => c.name === fieldName);
      if (!column) {
        toBeAddedFields[fieldName] = field;
        continue;
      }
      if (matchType(column.dataType, field.type, dbType)) continue;
      else logger$1.warn(`Field ${fieldName} in table ${key} has a different type in the database. Expected ${field.type} but got ${column.dataType}.`);
    }
    if (Object.keys(toBeAddedFields).length > 0) toBeAdded.push({
      table: key,
      fields: toBeAddedFields,
      order: value.order || Infinity
    });
  }
  const migrations = [];
  const useUUIDs = config2.advanced?.database?.generateId === "uuid";
  const useNumberId = config2.advanced?.database?.useNumberId || config2.advanced?.database?.generateId === "serial";
  function getType(field, fieldName) {
    const type = field.type;
    const provider = dbType || "sqlite";
    const typeMap = {
      string: {
        sqlite: "text",
        postgres: "text",
        mysql: field.unique ? "varchar(255)" : field.references ? "varchar(36)" : field.sortable ? "varchar(255)" : field.index ? "varchar(255)" : "text",
        mssql: field.unique || field.sortable ? "varchar(255)" : field.references ? "varchar(36)" : "varchar(8000)"
      },
      boolean: {
        sqlite: "integer",
        postgres: "boolean",
        mysql: "boolean",
        mssql: "smallint"
      },
      number: {
        sqlite: field.bigint ? "bigint" : "integer",
        postgres: field.bigint ? "bigint" : "integer",
        mysql: field.bigint ? "bigint" : "integer",
        mssql: field.bigint ? "bigint" : "integer"
      },
      date: {
        sqlite: "date",
        postgres: "timestamptz",
        mysql: "timestamp(3)",
        mssql: sql$1`datetime2(3)`
      },
      json: {
        sqlite: "text",
        postgres: "jsonb",
        mysql: "json",
        mssql: "varchar(8000)"
      },
      id: {
        postgres: useNumberId ? sql$1`integer GENERATED BY DEFAULT AS IDENTITY` : useUUIDs ? "uuid" : "text",
        mysql: useNumberId ? "integer" : useUUIDs ? "varchar(36)" : "varchar(36)",
        mssql: useNumberId ? "integer" : useUUIDs ? "varchar(36)" : "varchar(36)",
        sqlite: useNumberId ? "integer" : "text"
      },
      foreignKeyId: {
        postgres: useNumberId ? "integer" : useUUIDs ? "uuid" : "text",
        mysql: useNumberId ? "integer" : useUUIDs ? "varchar(36)" : "varchar(36)",
        mssql: useNumberId ? "integer" : useUUIDs ? "varchar(36)" : "varchar(36)",
        sqlite: useNumberId ? "integer" : "text"
      },
      "string[]": {
        sqlite: "text",
        postgres: "jsonb",
        mysql: "json",
        mssql: "varchar(8000)"
      },
      "number[]": {
        sqlite: "text",
        postgres: "jsonb",
        mysql: "json",
        mssql: "varchar(8000)"
      }
    };
    if (fieldName === "id" || field.references?.field === "id") {
      if (fieldName === "id") return typeMap.id[provider];
      return typeMap.foreignKeyId[provider];
    }
    if (Array.isArray(type)) return "text";
    if (!(type in typeMap)) throw new Error(`Unsupported field type '${String(type)}' for field '${fieldName}'. Allowed types are: string, number, boolean, date, string[], number[]. If you need to store structured data, store it as a JSON string (type: "string") or split it into primitive fields. See https://better-auth.com/docs/advanced/schema#additional-fields`);
    return typeMap[type][provider];
  }
  const getModelName = initGetModelName({
    schema: getAuthTables(config2),
    usePlural: false
  });
  const getFieldName = initGetFieldName({
    schema: getAuthTables(config2),
    usePlural: false
  });
  function getReferencePath(model, field) {
    try {
      return `${getModelName(model)}.${getFieldName({
        model,
        field
      })}`;
    } catch {
      return `${model}.${field}`;
    }
  }
  if (toBeAdded.length) for (const table of toBeAdded) for (const [fieldName, field] of Object.entries(table.fields)) {
    const type = getType(field, fieldName);
    let builder = db2.schema.alterTable(table.table);
    if (field.index) {
      const index = db2.schema.alterTable(table.table).addIndex(`${table.table}_${fieldName}_idx`);
      migrations.push(index);
    }
    let built = builder.addColumn(fieldName, type, (col) => {
      col = field.required !== false ? col.notNull() : col;
      if (field.references) col = col.references(getReferencePath(field.references.model, field.references.field)).onDelete(field.references.onDelete || "cascade");
      if (field.unique) col = col.unique();
      if (field.type === "date" && typeof field.defaultValue === "function" && (dbType === "postgres" || dbType === "mysql" || dbType === "mssql")) if (dbType === "mysql") col = col.defaultTo(sql$1`CURRENT_TIMESTAMP(3)`);
      else col = col.defaultTo(sql$1`CURRENT_TIMESTAMP`);
      return col;
    });
    migrations.push(built);
  }
  let toBeIndexed = [];
  if (config2.advanced?.database?.useNumberId) logger$1.warn("`useNumberId` is deprecated. Please use `generateId` with `serial` instead.");
  if (toBeCreated.length) for (const table of toBeCreated) {
    const idType = getType({ type: useNumberId ? "number" : "string" }, "id");
    let dbT = db2.schema.createTable(table.table).addColumn("id", idType, (col) => {
      if (useNumberId) {
        if (dbType === "postgres") return col.primaryKey().notNull();
        else if (dbType === "sqlite") return col.primaryKey().notNull();
        else if (dbType === "mssql") return col.identity().primaryKey().notNull();
        return col.autoIncrement().primaryKey().notNull();
      }
      if (useUUIDs) {
        if (dbType === "postgres") return col.primaryKey().defaultTo(sql$1`pg_catalog.gen_random_uuid()`).notNull();
        return col.primaryKey().notNull();
      }
      return col.primaryKey().notNull();
    });
    for (const [fieldName, field] of Object.entries(table.fields)) {
      const type = getType(field, fieldName);
      dbT = dbT.addColumn(fieldName, type, (col) => {
        col = field.required !== false ? col.notNull() : col;
        if (field.references) col = col.references(getReferencePath(field.references.model, field.references.field)).onDelete(field.references.onDelete || "cascade");
        if (field.unique) col = col.unique();
        if (field.type === "date" && typeof field.defaultValue === "function" && (dbType === "postgres" || dbType === "mysql" || dbType === "mssql")) if (dbType === "mysql") col = col.defaultTo(sql$1`CURRENT_TIMESTAMP(3)`);
        else col = col.defaultTo(sql$1`CURRENT_TIMESTAMP`);
        return col;
      });
      if (field.index) {
        let builder = db2.schema.createIndex(`${table.table}_${fieldName}_${field.unique ? "uidx" : "idx"}`).on(table.table).columns([fieldName]);
        toBeIndexed.push(field.unique ? builder.unique() : builder);
      }
    }
    migrations.push(dbT);
  }
  if (toBeIndexed.length) for (const index of toBeIndexed) migrations.push(index);
  async function runMigrations() {
    for (const migration of migrations) await migration.execute();
  }
  async function compileMigrations() {
    return migrations.map((m) => m.compile().sql).join(";\n\n") + ";";
  }
  return {
    toBeCreated,
    toBeAdded,
    runMigrations,
    compileMigrations
  };
}
var db_exports = /* @__PURE__ */ __export({
  convertFromDB: () => convertFromDB,
  convertToDB: () => convertToDB,
  createFieldAttribute: () => createFieldAttribute,
  createInternalAdapter: () => createInternalAdapter,
  getAdapter: () => getAdapter,
  getBaseAdapter: () => getBaseAdapter,
  getMigrations: () => getMigrations,
  getSchema: () => getSchema,
  getWithHooks: () => getWithHooks,
  matchType: () => matchType,
  mergeSchema: () => mergeSchema,
  parseAccountInput: () => parseAccountInput,
  parseAccountOutput: () => parseAccountOutput,
  parseAdditionalUserInput: () => parseAdditionalUserInput,
  parseInputData: () => parseInputData,
  parseSessionInput: () => parseSessionInput,
  parseSessionOutput: () => parseSessionOutput,
  parseUserInput: () => parseUserInput,
  parseUserOutput: () => parseUserOutput,
  toZodSchema: () => toZodSchema
});
__reExport(db_exports, import___better_auth_core_db);
const ALLOWED_COOKIE_SIZE = 4096;
const ESTIMATED_EMPTY_COOKIE_SIZE = 200;
const CHUNK_SIZE = ALLOWED_COOKIE_SIZE - ESTIMATED_EMPTY_COOKIE_SIZE;
function parseCookiesFromContext(ctx) {
  const cookieHeader = ctx.headers?.get("cookie");
  if (!cookieHeader) return {};
  const cookies = {};
  const pairs = cookieHeader.split("; ");
  for (const pair of pairs) {
    const [name, ...valueParts] = pair.split("=");
    if (name && valueParts.length > 0) cookies[name] = valueParts.join("=");
  }
  return cookies;
}
function getChunkIndex(cookieName) {
  const parts = cookieName.split(".");
  const lastPart = parts[parts.length - 1];
  const index = parseInt(lastPart || "0", 10);
  return isNaN(index) ? 0 : index;
}
function readExistingChunks(cookieName, ctx) {
  const chunks = {};
  const cookies = parseCookiesFromContext(ctx);
  for (const [name, value] of Object.entries(cookies)) if (name.startsWith(cookieName)) chunks[name] = value;
  return chunks;
}
function joinChunks(chunks) {
  return Object.keys(chunks).sort((a, b) => {
    return getChunkIndex(a) - getChunkIndex(b);
  }).map((key) => chunks[key]).join("");
}
function chunkCookie(storeName, cookie, chunks, logger2) {
  const chunkCount = Math.ceil(cookie.value.length / CHUNK_SIZE);
  if (chunkCount === 1) {
    chunks[cookie.name] = cookie.value;
    return [cookie];
  }
  const cookies = [];
  for (let i = 0; i < chunkCount; i++) {
    const name = `${cookie.name}.${i}`;
    const start = i * CHUNK_SIZE;
    const value = cookie.value.substring(start, start + CHUNK_SIZE);
    cookies.push({
      ...cookie,
      name,
      value
    });
    chunks[name] = value;
  }
  logger2.debug(`CHUNKING_${storeName.toUpperCase()}_COOKIE`, {
    message: `${storeName} cookie exceeds allowed ${ALLOWED_COOKIE_SIZE} bytes.`,
    emptyCookieSize: ESTIMATED_EMPTY_COOKIE_SIZE,
    valueSize: cookie.value.length,
    chunkCount,
    chunks: cookies.map((c) => c.value.length + ESTIMATED_EMPTY_COOKIE_SIZE)
  });
  return cookies;
}
function getCleanCookies(chunks, cookieOptions) {
  const cleanedChunks = {};
  for (const name in chunks) cleanedChunks[name] = {
    name,
    value: "",
    options: {
      ...cookieOptions,
      maxAge: 0
    }
  };
  return cleanedChunks;
}
const storeFactory = (storeName) => (cookieName, cookieOptions, ctx) => {
  const chunks = readExistingChunks(cookieName, ctx);
  const logger2 = ctx.context.logger;
  return {
    getValue() {
      return joinChunks(chunks);
    },
    hasChunks() {
      return Object.keys(chunks).length > 0;
    },
    chunk(value, options) {
      const cleanedChunks = getCleanCookies(chunks, cookieOptions);
      for (const name in chunks) delete chunks[name];
      const cookies = cleanedChunks;
      const chunked = chunkCookie(storeName, {
        name: cookieName,
        value,
        options: {
          ...cookieOptions,
          ...options
        }
      }, chunks, logger2);
      for (const chunk of chunked) cookies[chunk.name] = chunk;
      return Object.values(cookies);
    },
    clean() {
      const cleanedChunks = getCleanCookies(chunks, cookieOptions);
      for (const name in chunks) delete chunks[name];
      return Object.values(cleanedChunks);
    },
    setCookies(cookies) {
      for (const cookie of cookies) ctx.setCookie(cookie.name, cookie.value, cookie.options);
    }
  };
};
const createSessionStore = storeFactory("Session");
const createAccountStore = storeFactory("Account");
function getChunkedCookie(ctx, cookieName) {
  const value = ctx.getCookie(cookieName);
  if (value) return value;
  const chunks = [];
  const cookieHeader = ctx.headers?.get("cookie");
  if (!cookieHeader) return null;
  const cookies = {};
  const pairs = cookieHeader.split("; ");
  for (const pair of pairs) {
    const [name, ...valueParts] = pair.split("=");
    if (name && valueParts.length > 0) cookies[name] = valueParts.join("=");
  }
  for (const [name, val] of Object.entries(cookies)) if (name.startsWith(cookieName + ".")) {
    const indexStr = name.split(".").at(-1);
    const index = parseInt(indexStr || "0", 10);
    if (!isNaN(index)) chunks.push({
      index,
      value: val
    });
  }
  if (chunks.length > 0) {
    chunks.sort((a, b) => a.index - b.index);
    return chunks.map((c) => c.value).join("");
  }
  return null;
}
async function setAccountCookie(c, accountData) {
  const accountDataCookie = c.context.authCookies.accountData;
  const options = {
    maxAge: 300,
    ...accountDataCookie.options
  };
  const data = await symmetricEncodeJWT(accountData, c.context.secret, "better-auth-account", options.maxAge);
  if (data.length > ALLOWED_COOKIE_SIZE) {
    const accountStore = createAccountStore(accountDataCookie.name, options, c);
    const cookies = accountStore.chunk(data, options);
    accountStore.setCookies(cookies);
  } else {
    const accountStore = createAccountStore(accountDataCookie.name, options, c);
    if (accountStore.hasChunks()) {
      const cleanCookies = accountStore.clean();
      accountStore.setCookies(cleanCookies);
    }
    c.setCookie(accountDataCookie.name, data, options);
  }
}
async function getAccountCookie(c) {
  const accountCookie = getChunkedCookie(c, c.context.authCookies.accountData.name);
  if (accountCookie) {
    const accountData = safeJSONParse(await symmetricDecodeJWT(accountCookie, c.context.secret, "better-auth-account"));
    if (accountData) return accountData;
  }
  return null;
}
const getSessionQuerySchema = optional(object({
  disableCookieCache: boolean$1().meta({ description: "Disable cookie cache and fetch session from database" }).optional(),
  disableRefresh: boolean$1().meta({ description: "Disable session refresh. Useful for checking session status, without updating the session" }).optional()
}));
const SEC = 1e3;
const MIN = SEC * 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365.25;
const REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|mo|years?|yrs?|y)(?: (ago|from now))?$/i;
function parse(value) {
  const match = REGEX.exec(value);
  if (!match || match[4] && match[1]) throw new TypeError(`Invalid time string format: "${value}". Use formats like "7d", "30m", "1 hour", etc.`);
  const n = parseFloat(match[2]);
  const unit = match[3].toLowerCase();
  let result;
  switch (unit) {
    case "years":
    case "year":
    case "yrs":
    case "yr":
    case "y":
      result = n * YEAR;
      break;
    case "months":
    case "month":
    case "mo":
      result = n * MONTH;
      break;
    case "weeks":
    case "week":
    case "w":
      result = n * WEEK;
      break;
    case "days":
    case "day":
    case "d":
      result = n * DAY;
      break;
    case "hours":
    case "hour":
    case "hrs":
    case "hr":
    case "h":
      result = n * HOUR;
      break;
    case "minutes":
    case "minute":
    case "mins":
    case "min":
    case "m":
      result = n * MIN;
      break;
    case "seconds":
    case "second":
    case "secs":
    case "sec":
    case "s":
      result = n * SEC;
      break;
    default:
      throw new TypeError(`Unknown time unit: "${unit}"`);
  }
  if (match[1] === "-" || match[4] === "ago") return -result;
  return result;
}
function sec(value) {
  return Math.round(parse(value) / 1e3);
}
const SECURE_COOKIE_PREFIX = "__Secure-";
function parseSetCookieHeader(setCookie2) {
  const cookies = /* @__PURE__ */ new Map();
  setCookie2.split(", ").forEach((cookieString) => {
    const [nameValue, ...attributes] = cookieString.split(";").map((part) => part.trim());
    const [name, ...valueParts] = (nameValue || "").split("=");
    const value = valueParts.join("=");
    if (!name || value === void 0) return;
    const attrObj = { value };
    attributes.forEach((attribute) => {
      const [attrName, ...attrValueParts] = attribute.split("=");
      const attrValue = attrValueParts.join("=");
      const normalizedAttrName = attrName.trim().toLowerCase();
      switch (normalizedAttrName) {
        case "max-age":
          attrObj["max-age"] = attrValue ? parseInt(attrValue.trim(), 10) : void 0;
          break;
        case "expires":
          attrObj.expires = attrValue ? new Date(attrValue.trim()) : void 0;
          break;
        case "domain":
          attrObj.domain = attrValue ? attrValue.trim() : void 0;
          break;
        case "path":
          attrObj.path = attrValue ? attrValue.trim() : void 0;
          break;
        case "secure":
          attrObj.secure = true;
          break;
        case "httponly":
          attrObj.httponly = true;
          break;
        case "samesite":
          attrObj.samesite = attrValue ? attrValue.trim().toLowerCase() : void 0;
          break;
        default:
          attrObj[normalizedAttrName] = attrValue ? attrValue.trim() : true;
          break;
      }
    });
    cookies.set(name, attrObj);
  });
  return cookies;
}
function createCookieGetter(options) {
  const secureCookiePrefix = (options.advanced?.useSecureCookies !== void 0 ? options.advanced?.useSecureCookies : options.baseURL !== void 0 ? options.baseURL.startsWith("https://") ? true : false : isProduction) ? SECURE_COOKIE_PREFIX : "";
  const crossSubdomainEnabled = !!options.advanced?.crossSubDomainCookies?.enabled;
  const domain = crossSubdomainEnabled ? options.advanced?.crossSubDomainCookies?.domain || (options.baseURL ? new URL(options.baseURL).hostname : void 0) : void 0;
  if (crossSubdomainEnabled && !domain) throw new BetterAuthError("baseURL is required when crossSubdomainCookies are enabled");
  function createCookie(cookieName, overrideAttributes = {}) {
    const prefix = options.advanced?.cookiePrefix || "better-auth";
    const name = options.advanced?.cookies?.[cookieName]?.name || `${prefix}.${cookieName}`;
    const attributes = options.advanced?.cookies?.[cookieName]?.attributes;
    return {
      name: `${secureCookiePrefix}${name}`,
      attributes: {
        secure: !!secureCookiePrefix,
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        ...crossSubdomainEnabled ? { domain } : {},
        ...options.advanced?.defaultCookieAttributes,
        ...overrideAttributes,
        ...attributes
      }
    };
  }
  return createCookie;
}
function getCookies(options) {
  const createCookie = createCookieGetter(options);
  const sessionToken = createCookie("session_token", { maxAge: options.session?.expiresIn || sec("7d") });
  const sessionData = createCookie("session_data", { maxAge: options.session?.cookieCache?.maxAge || 300 });
  const accountData = createCookie("account_data", { maxAge: options.session?.cookieCache?.maxAge || 300 });
  const dontRememberToken = createCookie("dont_remember");
  return {
    sessionToken: {
      name: sessionToken.name,
      options: sessionToken.attributes
    },
    sessionData: {
      name: sessionData.name,
      options: sessionData.attributes
    },
    dontRememberToken: {
      name: dontRememberToken.name,
      options: dontRememberToken.attributes
    },
    accountData: {
      name: accountData.name,
      options: accountData.attributes
    }
  };
}
async function setCookieCache(ctx, session, dontRememberMe) {
  if (ctx.context.options.session?.cookieCache?.enabled) {
    const filteredSession = Object.entries(session.session).reduce((acc, [key, value]) => {
      const fieldConfig = ctx.context.options.session?.additionalFields?.[key];
      if (!fieldConfig || fieldConfig.returned !== false) acc[key] = value;
      return acc;
    }, {});
    const filteredUser = parseUserOutput(ctx.context.options, session.user);
    const versionConfig = ctx.context.options.session?.cookieCache?.version;
    let version = "1";
    if (versionConfig) {
      if (typeof versionConfig === "string") version = versionConfig;
      else if (typeof versionConfig === "function") {
        const result = versionConfig(session.session, session.user);
        version = result instanceof Promise ? await result : result;
      }
    }
    const sessionData = {
      session: filteredSession,
      user: filteredUser,
      updatedAt: Date.now(),
      version
    };
    const options = {
      ...ctx.context.authCookies.sessionData.options,
      maxAge: dontRememberMe ? void 0 : ctx.context.authCookies.sessionData.options.maxAge
    };
    const expiresAtDate = getDate(options.maxAge || 60, "sec").getTime();
    const strategy2 = ctx.context.options.session?.cookieCache?.strategy || "compact";
    let data;
    if (strategy2 === "jwe") data = await symmetricEncodeJWT(sessionData, ctx.context.secret, "better-auth-session", options.maxAge || 300);
    else if (strategy2 === "jwt") data = await signJWT(sessionData, ctx.context.secret, options.maxAge || 300);
    else data = base64Url.encode(JSON.stringify({
      session: sessionData,
      expiresAt: expiresAtDate,
      signature: await createHMAC("SHA-256", "base64urlnopad").sign(ctx.context.secret, JSON.stringify({
        ...sessionData,
        expiresAt: expiresAtDate
      }))
    }), { padding: false });
    if (data.length > 4093) {
      const sessionStore = createSessionStore(ctx.context.authCookies.sessionData.name, options, ctx);
      const cookies = sessionStore.chunk(data, options);
      sessionStore.setCookies(cookies);
    } else {
      const sessionStore = createSessionStore(ctx.context.authCookies.sessionData.name, options, ctx);
      if (sessionStore.hasChunks()) {
        const cleanCookies = sessionStore.clean();
        sessionStore.setCookies(cleanCookies);
      }
      ctx.setCookie(ctx.context.authCookies.sessionData.name, data, options);
    }
  }
}
async function setSessionCookie(ctx, session, dontRememberMe, overrides) {
  const dontRememberMeCookie = await ctx.getSignedCookie(ctx.context.authCookies.dontRememberToken.name, ctx.context.secret);
  dontRememberMe = dontRememberMe !== void 0 ? dontRememberMe : !!dontRememberMeCookie;
  const options = ctx.context.authCookies.sessionToken.options;
  const maxAge = dontRememberMe ? void 0 : ctx.context.sessionConfig.expiresIn;
  await ctx.setSignedCookie(ctx.context.authCookies.sessionToken.name, session.session.token, ctx.context.secret, {
    ...options,
    maxAge,
    ...overrides
  });
  if (dontRememberMe) await ctx.setSignedCookie(ctx.context.authCookies.dontRememberToken.name, "true", ctx.context.secret, ctx.context.authCookies.dontRememberToken.options);
  await setCookieCache(ctx, session, dontRememberMe);
  ctx.context.setNewSession(session);
  if (ctx.context.options.secondaryStorage) await ctx.context.secondaryStorage?.set(session.session.token, JSON.stringify({
    user: session.user,
    session: session.session
  }), Math.floor((new Date(session.session.expiresAt).getTime() - Date.now()) / 1e3));
}
function deleteSessionCookie(ctx, skipDontRememberMe) {
  ctx.setCookie(ctx.context.authCookies.sessionToken.name, "", {
    ...ctx.context.authCookies.sessionToken.options,
    maxAge: 0
  });
  ctx.setCookie(ctx.context.authCookies.sessionData.name, "", {
    ...ctx.context.authCookies.sessionData.options,
    maxAge: 0
  });
  if (ctx.context.options.account?.storeAccountCookie) {
    ctx.setCookie(ctx.context.authCookies.accountData.name, "", {
      ...ctx.context.authCookies.accountData.options,
      maxAge: 0
    });
    const accountStore = createAccountStore(ctx.context.authCookies.accountData.name, ctx.context.authCookies.accountData.options, ctx);
    const cleanCookies$1 = accountStore.clean();
    accountStore.setCookies(cleanCookies$1);
  }
  if (ctx.context.oauthConfig.storeStateStrategy === "cookie") {
    const stateCookie = ctx.context.createAuthCookie("oauth_state");
    ctx.setCookie(stateCookie.name, "", {
      ...stateCookie.attributes,
      maxAge: 0
    });
  }
  const sessionStore = createSessionStore(ctx.context.authCookies.sessionData.name, ctx.context.authCookies.sessionData.options, ctx);
  const cleanCookies = sessionStore.clean();
  sessionStore.setCookies(cleanCookies);
  ctx.setCookie(ctx.context.authCookies.dontRememberToken.name, "", {
    ...ctx.context.authCookies.dontRememberToken.options,
    maxAge: 0
  });
}
const getSession = () => createAuthEndpoint("/get-session", {
  method: "GET",
  operationId: "getSession",
  query: getSessionQuerySchema,
  requireHeaders: true,
  metadata: { openapi: {
    operationId: "getSession",
    description: "Get the current session",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        nullable: true,
        properties: {
          session: { $ref: "#/components/schemas/Session" },
          user: { $ref: "#/components/schemas/User" }
        },
        required: ["session", "user"]
      } } }
    } }
  } }
}, async (ctx) => {
  try {
    const sessionCookieToken = await ctx.getSignedCookie(ctx.context.authCookies.sessionToken.name, ctx.context.secret);
    if (!sessionCookieToken) return null;
    const sessionDataCookie = getChunkedCookie(ctx, ctx.context.authCookies.sessionData.name);
    let sessionDataPayload = null;
    if (sessionDataCookie) {
      const strategy2 = ctx.context.options.session?.cookieCache?.strategy || "compact";
      if (strategy2 === "jwe") {
        const payload = await symmetricDecodeJWT(sessionDataCookie, ctx.context.secret, "better-auth-session");
        if (payload && payload.session && payload.user) sessionDataPayload = {
          session: {
            session: payload.session,
            user: payload.user,
            updatedAt: payload.updatedAt,
            version: payload.version
          },
          expiresAt: payload.exp ? payload.exp * 1e3 : Date.now()
        };
        else {
          const dataCookie = ctx.context.authCookies.sessionData.name;
          ctx.setCookie(dataCookie, "", { maxAge: 0 });
          return ctx.json(null);
        }
      } else if (strategy2 === "jwt") {
        const payload = await verifyJWT(sessionDataCookie, ctx.context.secret);
        if (payload && payload.session && payload.user) sessionDataPayload = {
          session: {
            session: payload.session,
            user: payload.user,
            updatedAt: payload.updatedAt,
            version: payload.version
          },
          expiresAt: payload.exp ? payload.exp * 1e3 : Date.now()
        };
        else {
          const dataCookie = ctx.context.authCookies.sessionData.name;
          ctx.setCookie(dataCookie, "", { maxAge: 0 });
          return ctx.json(null);
        }
      } else {
        const parsed = safeJSONParse(binary.decode(base64Url.decode(sessionDataCookie)));
        if (parsed) if (await createHMAC("SHA-256", "base64urlnopad").verify(ctx.context.secret, JSON.stringify({
          ...parsed.session,
          expiresAt: parsed.expiresAt
        }), parsed.signature)) sessionDataPayload = parsed;
        else {
          const dataCookie = ctx.context.authCookies.sessionData.name;
          ctx.setCookie(dataCookie, "", { maxAge: 0 });
          return ctx.json(null);
        }
      }
    }
    const dontRememberMe = await ctx.getSignedCookie(ctx.context.authCookies.dontRememberToken.name, ctx.context.secret);
    if (sessionDataPayload?.session && ctx.context.options.session?.cookieCache?.enabled && !ctx.query?.disableCookieCache) {
      const session$1 = sessionDataPayload.session;
      const versionConfig = ctx.context.options.session?.cookieCache?.version;
      let expectedVersion = "1";
      if (versionConfig) {
        if (typeof versionConfig === "string") expectedVersion = versionConfig;
        else if (typeof versionConfig === "function") {
          const result = versionConfig(session$1.session, session$1.user);
          expectedVersion = result instanceof Promise ? await result : result;
        }
      }
      if ((session$1.version || "1") !== expectedVersion) {
        const dataCookie = ctx.context.authCookies.sessionData.name;
        ctx.setCookie(dataCookie, "", { maxAge: 0 });
      } else {
        const cachedSessionExpiresAt = new Date(session$1.session.expiresAt);
        if (sessionDataPayload.expiresAt < Date.now() || cachedSessionExpiresAt < /* @__PURE__ */ new Date()) {
          const dataCookie = ctx.context.authCookies.sessionData.name;
          ctx.setCookie(dataCookie, "", { maxAge: 0 });
        } else {
          const cookieRefreshCache = ctx.context.sessionConfig.cookieRefreshCache;
          if (cookieRefreshCache === false) {
            ctx.context.session = session$1;
            return ctx.json({
              session: session$1.session,
              user: session$1.user
            });
          }
          if (sessionDataPayload.expiresAt - Date.now() < cookieRefreshCache.updateAge * 1e3) {
            const newExpiresAt = getDate(ctx.context.options.session?.cookieCache?.maxAge || 300, "sec");
            const refreshedSession = {
              session: {
                ...session$1.session,
                expiresAt: newExpiresAt
              },
              user: session$1.user,
              updatedAt: Date.now()
            };
            await setCookieCache(ctx, refreshedSession, false);
            const parsedRefreshedSession = parseSessionOutput(ctx.context.options, {
              ...refreshedSession.session,
              expiresAt: new Date(refreshedSession.session.expiresAt),
              createdAt: new Date(refreshedSession.session.createdAt),
              updatedAt: new Date(refreshedSession.session.updatedAt)
            });
            const parsedRefreshedUser = parseUserOutput(ctx.context.options, {
              ...refreshedSession.user,
              createdAt: new Date(refreshedSession.user.createdAt),
              updatedAt: new Date(refreshedSession.user.updatedAt)
            });
            ctx.context.session = {
              session: parsedRefreshedSession,
              user: parsedRefreshedUser
            };
            return ctx.json({
              session: parsedRefreshedSession,
              user: parsedRefreshedUser
            });
          }
          const parsedSession = parseSessionOutput(ctx.context.options, {
            ...session$1.session,
            expiresAt: new Date(session$1.session.expiresAt),
            createdAt: new Date(session$1.session.createdAt),
            updatedAt: new Date(session$1.session.updatedAt)
          });
          const parsedUser = parseUserOutput(ctx.context.options, {
            ...session$1.user,
            createdAt: new Date(session$1.user.createdAt),
            updatedAt: new Date(session$1.user.updatedAt)
          });
          ctx.context.session = {
            session: parsedSession,
            user: parsedUser
          };
          return ctx.json({
            session: parsedSession,
            user: parsedUser
          });
        }
      }
    }
    const session = await ctx.context.internalAdapter.findSession(sessionCookieToken);
    ctx.context.session = session;
    if (!session || session.session.expiresAt < /* @__PURE__ */ new Date()) {
      deleteSessionCookie(ctx);
      if (session)
        await ctx.context.internalAdapter.deleteSession(session.session.token);
      return ctx.json(null);
    }
    if (dontRememberMe || ctx.query?.disableRefresh) {
      const parsedSession = parseSessionOutput(ctx.context.options, session.session);
      const parsedUser = parseUserOutput(ctx.context.options, session.user);
      return ctx.json({
        session: parsedSession,
        user: parsedUser
      });
    }
    const expiresIn = ctx.context.sessionConfig.expiresIn;
    const updateAge = ctx.context.sessionConfig.updateAge;
    if (session.session.expiresAt.valueOf() - expiresIn * 1e3 + updateAge * 1e3 <= Date.now() && (!ctx.query?.disableRefresh || !ctx.context.options.session?.disableSessionRefresh)) {
      const updatedSession = await ctx.context.internalAdapter.updateSession(session.session.token, {
        expiresAt: getDate(ctx.context.sessionConfig.expiresIn, "sec"),
        updatedAt: /* @__PURE__ */ new Date()
      });
      if (!updatedSession) {
        deleteSessionCookie(ctx);
        return ctx.json(null, { status: 401 });
      }
      const maxAge = (updatedSession.expiresAt.valueOf() - Date.now()) / 1e3;
      await setSessionCookie(ctx, {
        session: updatedSession,
        user: session.user
      }, false, { maxAge });
      const parsedUpdatedSession = parseSessionOutput(ctx.context.options, updatedSession);
      const parsedUser = parseUserOutput(ctx.context.options, session.user);
      return ctx.json({
        session: parsedUpdatedSession,
        user: parsedUser
      });
    }
    await setCookieCache(ctx, session, !!dontRememberMe);
    return ctx.json(session);
  } catch (error2) {
    ctx.context.logger.error("INTERNAL_SERVER_ERROR", error2);
    throw new APIError("INTERNAL_SERVER_ERROR", { message: BASE_ERROR_CODES.FAILED_TO_GET_SESSION });
  }
});
const getSessionFromCtx = async (ctx, config2) => {
  if (ctx.context.session) return ctx.context.session;
  const session = await getSession()({
    ...ctx,
    asResponse: false,
    headers: ctx.headers,
    returnHeaders: false,
    returnStatus: false,
    query: {
      ...config2,
      ...ctx.query
    }
  }).catch((e) => {
    return null;
  });
  ctx.context.session = session;
  return session;
};
const sessionMiddleware = createAuthMiddleware(async (ctx) => {
  const session = await getSessionFromCtx(ctx);
  if (!session?.session) throw new APIError("UNAUTHORIZED");
  return { session };
});
const sensitiveSessionMiddleware = createAuthMiddleware(async (ctx) => {
  const session = await getSessionFromCtx(ctx, { disableCookieCache: true });
  if (!session?.session) throw new APIError("UNAUTHORIZED");
  return { session };
});
createAuthMiddleware(async (ctx) => {
  const session = await getSessionFromCtx(ctx);
  if (!session?.session && (ctx.request || ctx.headers)) throw new APIError("UNAUTHORIZED");
  return { session };
});
const freshSessionMiddleware = createAuthMiddleware(async (ctx) => {
  const session = await getSessionFromCtx(ctx);
  if (!session?.session) throw new APIError("UNAUTHORIZED");
  if (ctx.context.sessionConfig.freshAge === 0) return { session };
  const freshAge = ctx.context.sessionConfig.freshAge;
  const lastUpdated = new Date(session.session.updatedAt || session.session.createdAt).getTime();
  if (!(Date.now() - lastUpdated < freshAge * 1e3)) throw new APIError("FORBIDDEN", { message: "Session is not fresh" });
  return { session };
});
const listSessions = () => createAuthEndpoint("/list-sessions", {
  method: "GET",
  operationId: "listUserSessions",
  use: [sessionMiddleware],
  requireHeaders: true,
  metadata: { openapi: {
    operationId: "listUserSessions",
    description: "List all active sessions for the user",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "array",
        items: { $ref: "#/components/schemas/Session" }
      } } }
    } }
  } }
}, async (ctx) => {
  try {
    const activeSessions = (await ctx.context.internalAdapter.listSessions(ctx.context.session.user.id)).filter((session) => {
      return session.expiresAt > /* @__PURE__ */ new Date();
    });
    return ctx.json(activeSessions);
  } catch (e) {
    ctx.context.logger.error(e);
    throw ctx.error("INTERNAL_SERVER_ERROR");
  }
});
const revokeSession = createAuthEndpoint("/revoke-session", {
  method: "POST",
  body: object({ token: string().meta({ description: "The token to revoke" }) }),
  use: [sensitiveSessionMiddleware],
  requireHeaders: true,
  metadata: { openapi: {
    description: "Revoke a single session",
    requestBody: { content: { "application/json": { schema: {
      type: "object",
      properties: { token: {
        type: "string",
        description: "The token to revoke"
      } },
      required: ["token"]
    } } } },
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: { status: {
          type: "boolean",
          description: "Indicates if the session was revoked successfully"
        } },
        required: ["status"]
      } } }
    } }
  } }
}, async (ctx) => {
  const token = ctx.body.token;
  if ((await ctx.context.internalAdapter.findSession(token))?.session.userId === ctx.context.session.user.id) try {
    await ctx.context.internalAdapter.deleteSession(token);
  } catch (error2) {
    ctx.context.logger.error(error2 && typeof error2 === "object" && "name" in error2 ? error2.name : "", error2);
    throw new APIError("INTERNAL_SERVER_ERROR");
  }
  return ctx.json({ status: true });
});
const revokeSessions = createAuthEndpoint("/revoke-sessions", {
  method: "POST",
  use: [sensitiveSessionMiddleware],
  requireHeaders: true,
  metadata: { openapi: {
    description: "Revoke all sessions for the user",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: { status: {
          type: "boolean",
          description: "Indicates if all sessions were revoked successfully"
        } },
        required: ["status"]
      } } }
    } }
  } }
}, async (ctx) => {
  try {
    await ctx.context.internalAdapter.deleteSessions(ctx.context.session.user.id);
  } catch (error2) {
    ctx.context.logger.error(error2 && typeof error2 === "object" && "name" in error2 ? error2.name : "", error2);
    throw new APIError("INTERNAL_SERVER_ERROR");
  }
  return ctx.json({ status: true });
});
const revokeOtherSessions = createAuthEndpoint("/revoke-other-sessions", {
  method: "POST",
  requireHeaders: true,
  use: [sensitiveSessionMiddleware],
  metadata: { openapi: {
    description: "Revoke all other sessions for the user except the current one",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: { status: {
          type: "boolean",
          description: "Indicates if all other sessions were revoked successfully"
        } },
        required: ["status"]
      } } }
    } }
  } }
}, async (ctx) => {
  const session = ctx.context.session;
  if (!session.user) throw new APIError("UNAUTHORIZED");
  const otherSessions = (await ctx.context.internalAdapter.listSessions(session.user.id)).filter((session$1) => {
    return session$1.expiresAt > /* @__PURE__ */ new Date();
  }).filter((session$1) => session$1.token !== ctx.context.session.session.token);
  await Promise.all(otherSessions.map((session$1) => ctx.context.internalAdapter.deleteSession(session$1.token)));
  return ctx.json({ status: true });
});
function decryptOAuthToken(token, ctx) {
  if (!token) return token;
  if (ctx.options.account?.encryptOAuthTokens) return symmetricDecrypt({
    key: ctx.secret,
    data: token
  });
  return token;
}
function setTokenUtil(token, ctx) {
  if (ctx.options.account?.encryptOAuthTokens && token) return symmetricEncrypt({
    key: ctx.secret,
    data: token
  });
  return token;
}
function getOAuth2Tokens(data) {
  const getDate2 = (seconds) => {
    const now2 = /* @__PURE__ */ new Date();
    return new Date(now2.getTime() + seconds * 1e3);
  };
  return {
    tokenType: data.token_type,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessTokenExpiresAt: data.expires_in ? getDate2(data.expires_in) : void 0,
    refreshTokenExpiresAt: data.refresh_token_expires_in ? getDate2(data.refresh_token_expires_in) : void 0,
    scopes: data?.scope ? typeof data.scope === "string" ? data.scope.split(" ") : data.scope : [],
    idToken: data.id_token,
    raw: data
  };
}
async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64Url.encode(new Uint8Array(hash), { padding: false });
}
async function createAuthorizationURL({ id, options, authorizationEndpoint, state, codeVerifier, scopes, claims, redirectURI, duration, prompt, accessType, responseType, display, loginHint, hd, responseMode, additionalParams, scopeJoiner }) {
  const url = new URL(options.authorizationEndpoint || authorizationEndpoint);
  url.searchParams.set("response_type", responseType || "code");
  const primaryClientId = Array.isArray(options.clientId) ? options.clientId[0] : options.clientId;
  url.searchParams.set("client_id", primaryClientId);
  url.searchParams.set("state", state);
  if (scopes) url.searchParams.set("scope", scopes.join(scopeJoiner || " "));
  url.searchParams.set("redirect_uri", options.redirectURI || redirectURI);
  duration && url.searchParams.set("duration", duration);
  display && url.searchParams.set("display", display);
  loginHint && url.searchParams.set("login_hint", loginHint);
  prompt && url.searchParams.set("prompt", prompt);
  hd && url.searchParams.set("hd", hd);
  accessType && url.searchParams.set("access_type", accessType);
  responseMode && url.searchParams.set("response_mode", responseMode);
  if (codeVerifier) {
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge", codeChallenge);
  }
  if (claims) {
    const claimsObj = claims.reduce((acc, claim) => {
      acc[claim] = null;
      return acc;
    }, {});
    url.searchParams.set("claims", JSON.stringify({ id_token: {
      email: null,
      email_verified: null,
      ...claimsObj
    } }));
  }
  if (additionalParams) Object.entries(additionalParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url;
}
function createRefreshAccessTokenRequest({ refreshToken: refreshToken2, options, authentication, extraParams, resource }) {
  const body = new URLSearchParams();
  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    accept: "application/json"
  };
  body.set("grant_type", "refresh_token");
  body.set("refresh_token", refreshToken2);
  if (authentication === "basic") {
    const primaryClientId = Array.isArray(options.clientId) ? options.clientId[0] : options.clientId;
    if (primaryClientId) headers["authorization"] = "Basic " + base64.encode(`${primaryClientId}:${options.clientSecret ?? ""}`);
    else headers["authorization"] = "Basic " + base64.encode(`:${options.clientSecret ?? ""}`);
  } else {
    const primaryClientId = Array.isArray(options.clientId) ? options.clientId[0] : options.clientId;
    body.set("client_id", primaryClientId);
    if (options.clientSecret) body.set("client_secret", options.clientSecret);
  }
  if (resource) if (typeof resource === "string") body.append("resource", resource);
  else for (const _resource of resource) body.append("resource", _resource);
  if (extraParams) for (const [key, value] of Object.entries(extraParams)) body.set(key, value);
  return {
    body,
    headers
  };
}
async function refreshAccessToken({ refreshToken: refreshToken2, options, tokenEndpoint, authentication, extraParams }) {
  const { body, headers } = createRefreshAccessTokenRequest({
    refreshToken: refreshToken2,
    options,
    authentication,
    extraParams
  });
  const { data, error: error2 } = await betterFetch(tokenEndpoint, {
    method: "POST",
    body,
    headers
  });
  if (error2) throw error2;
  const tokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type,
    scopes: data.scope?.split(" "),
    idToken: data.id_token
  };
  if (data.expires_in) {
    const now2 = /* @__PURE__ */ new Date();
    tokens.accessTokenExpiresAt = new Date(now2.getTime() + data.expires_in * 1e3);
  }
  return tokens;
}
function createAuthorizationCodeRequest({ code, codeVerifier, redirectURI, options, authentication, deviceId, headers, additionalParams = {}, resource }) {
  const body = new URLSearchParams();
  const requestHeaders = {
    "content-type": "application/x-www-form-urlencoded",
    accept: "application/json",
    ...headers
  };
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  codeVerifier && body.set("code_verifier", codeVerifier);
  options.clientKey && body.set("client_key", options.clientKey);
  deviceId && body.set("device_id", deviceId);
  body.set("redirect_uri", options.redirectURI || redirectURI);
  if (resource) if (typeof resource === "string") body.append("resource", resource);
  else for (const _resource of resource) body.append("resource", _resource);
  if (authentication === "basic") {
    const primaryClientId = Array.isArray(options.clientId) ? options.clientId[0] : options.clientId;
    requestHeaders["authorization"] = `Basic ${base64.encode(`${primaryClientId}:${options.clientSecret ?? ""}`)}`;
  } else {
    const primaryClientId = Array.isArray(options.clientId) ? options.clientId[0] : options.clientId;
    body.set("client_id", primaryClientId);
    if (options.clientSecret) body.set("client_secret", options.clientSecret);
  }
  for (const [key, value] of Object.entries(additionalParams)) if (!body.has(key)) body.append(key, value);
  return {
    body,
    headers: requestHeaders
  };
}
async function validateAuthorizationCode({ code, codeVerifier, redirectURI, options, tokenEndpoint, authentication, deviceId, headers, additionalParams = {}, resource }) {
  const { body, headers: requestHeaders } = createAuthorizationCodeRequest({
    code,
    codeVerifier,
    redirectURI,
    options,
    authentication,
    deviceId,
    headers,
    additionalParams,
    resource
  });
  const { data, error: error2 } = await betterFetch(tokenEndpoint, {
    method: "POST",
    body,
    headers: requestHeaders
  });
  if (error2) throw error2;
  return getOAuth2Tokens(data);
}
const apple = (options) => {
  const tokenEndpoint = "https://appleid.apple.com/auth/token";
  return {
    id: "apple",
    name: "Apple",
    async createAuthorizationURL({ state, scopes, redirectURI }) {
      const _scope = options.disableDefaultScope ? [] : ["email", "name"];
      if (options.scope) _scope.push(...options.scope);
      if (scopes) _scope.push(...scopes);
      return await createAuthorizationURL({
        id: "apple",
        options,
        authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
        scopes: _scope,
        state,
        redirectURI,
        responseMode: "form_post",
        responseType: "code id_token"
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint
      });
    },
    async verifyIdToken(token, nonce) {
      if (options.disableIdTokenSignIn) return false;
      if (options.verifyIdToken) return options.verifyIdToken(token, nonce);
      const { kid, alg: jwtAlg } = decodeProtectedHeader(token);
      if (!kid || !jwtAlg) return false;
      const { payload: jwtClaims } = await jwtVerify(token, await getApplePublicKey(kid), {
        algorithms: [jwtAlg],
        issuer: "https://appleid.apple.com",
        audience: options.audience && options.audience.length ? options.audience : options.appBundleIdentifier ? options.appBundleIdentifier : options.clientId,
        maxTokenAge: "1h"
      });
      ["email_verified", "is_private_email"].forEach((field) => {
        if (jwtClaims[field] !== void 0) jwtClaims[field] = Boolean(jwtClaims[field]);
      });
      if (nonce && jwtClaims.nonce !== nonce) return false;
      return !!jwtClaims;
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://appleid.apple.com/auth/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      if (!token.idToken) return null;
      const profile = decodeJwt(token.idToken);
      if (!profile) return null;
      const name = token.user ? `${token.user.name?.firstName} ${token.user.name?.lastName}` : profile.name || profile.email;
      const emailVerified = typeof profile.email_verified === "boolean" ? profile.email_verified : profile.email_verified === "true";
      const enrichedProfile = {
        ...profile,
        name
      };
      const userMap = await options.mapProfileToUser?.(enrichedProfile);
      return {
        user: {
          id: profile.sub,
          name: enrichedProfile.name,
          emailVerified,
          email: profile.email,
          ...userMap
        },
        data: enrichedProfile
      };
    },
    options
  };
};
const getApplePublicKey = async (kid) => {
  const { data } = await betterFetch(`https://appleid.apple.com/auth/keys`);
  if (!data?.keys) throw new APIError("BAD_REQUEST", { message: "Keys not found" });
  const jwk = data.keys.find((key) => key.kid === kid);
  if (!jwk) throw new Error(`JWK with kid ${kid} not found`);
  return await importJWK(jwk, jwk.alg);
};
const atlassian = (options) => {
  return {
    id: "atlassian",
    name: "Atlassian",
    async createAuthorizationURL({ state, scopes, codeVerifier, redirectURI }) {
      if (!options.clientId || !options.clientSecret) {
        logger.error("Client Id and Secret are required for Atlassian");
        throw new BetterAuthError("CLIENT_ID_AND_SECRET_REQUIRED");
      }
      if (!codeVerifier) throw new BetterAuthError("codeVerifier is required for Atlassian");
      const _scopes = options.disableDefaultScope ? [] : ["read:jira-user", "offline_access"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "atlassian",
        options,
        authorizationEndpoint: "https://auth.atlassian.com/authorize",
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI,
        additionalParams: { audience: "api.atlassian.com" },
        prompt: options.prompt
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint: "https://auth.atlassian.com/oauth/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://auth.atlassian.com/oauth/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      if (!token.accessToken) return null;
      try {
        const { data: profile } = await betterFetch("https://api.atlassian.com/me", { headers: { Authorization: `Bearer ${token.accessToken}` } });
        if (!profile) return null;
        const userMap = await options.mapProfileToUser?.(profile);
        return {
          user: {
            id: profile.account_id,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            emailVerified: false,
            ...userMap
          },
          data: profile
        };
      } catch (error2) {
        logger.error("Failed to fetch user info from Figma:", error2);
        return null;
      }
    },
    options
  };
};
const cognito = (options) => {
  if (!options.domain || !options.region || !options.userPoolId) {
    logger.error("Domain, region and userPoolId are required for Amazon Cognito. Make sure to provide them in the options.");
    throw new BetterAuthError("DOMAIN_AND_REGION_REQUIRED");
  }
  const cleanDomain = options.domain.replace(/^https?:\/\//, "");
  const authorizationEndpoint = `https://${cleanDomain}/oauth2/authorize`;
  const tokenEndpoint = `https://${cleanDomain}/oauth2/token`;
  const userInfoEndpoint = `https://${cleanDomain}/oauth2/userinfo`;
  return {
    id: "cognito",
    name: "Cognito",
    async createAuthorizationURL({ state, scopes, codeVerifier, redirectURI }) {
      if (!options.clientId) {
        logger.error("ClientId is required for Amazon Cognito. Make sure to provide them in the options.");
        throw new BetterAuthError("CLIENT_ID_AND_SECRET_REQUIRED");
      }
      if (options.requireClientSecret && !options.clientSecret) {
        logger.error("Client Secret is required when requireClientSecret is true. Make sure to provide it in the options.");
        throw new BetterAuthError("CLIENT_SECRET_REQUIRED");
      }
      const _scopes = options.disableDefaultScope ? [] : [
        "openid",
        "profile",
        "email"
      ];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      const url = await createAuthorizationURL({
        id: "cognito",
        options: { ...options },
        authorizationEndpoint,
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI,
        prompt: options.prompt
      });
      const scopeValue = url.searchParams.get("scope");
      if (scopeValue) {
        url.searchParams.delete("scope");
        const encodedScope = encodeURIComponent(scopeValue);
        const urlString = url.toString();
        const separator = urlString.includes("?") ? "&" : "?";
        return new URL(`${urlString}${separator}scope=${encodedScope}`);
      }
      return url;
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint
      });
    },
    async verifyIdToken(token, nonce) {
      if (options.disableIdTokenSignIn) return false;
      if (options.verifyIdToken) return options.verifyIdToken(token, nonce);
      try {
        const { kid, alg: jwtAlg } = decodeProtectedHeader(token);
        if (!kid || !jwtAlg) return false;
        const publicKey = await getCognitoPublicKey(kid, options.region, options.userPoolId);
        const expectedIssuer = `https://cognito-idp.${options.region}.amazonaws.com/${options.userPoolId}`;
        const { payload: jwtClaims } = await jwtVerify(token, publicKey, {
          algorithms: [jwtAlg],
          issuer: expectedIssuer,
          audience: options.clientId,
          maxTokenAge: "1h"
        });
        if (nonce && jwtClaims.nonce !== nonce) return false;
        return true;
      } catch (error2) {
        logger.error("Failed to verify ID token:", error2);
        return false;
      }
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      if (token.idToken) try {
        const profile = decodeJwt(token.idToken);
        if (!profile) return null;
        const name = profile.name || profile.given_name || profile.username || profile.email;
        const enrichedProfile = {
          ...profile,
          name
        };
        const userMap = await options.mapProfileToUser?.(enrichedProfile);
        return {
          user: {
            id: profile.sub,
            name: enrichedProfile.name,
            email: profile.email,
            image: profile.picture,
            emailVerified: profile.email_verified,
            ...userMap
          },
          data: enrichedProfile
        };
      } catch (error2) {
        logger.error("Failed to decode ID token:", error2);
      }
      if (token.accessToken) try {
        const { data: userInfo } = await betterFetch(userInfoEndpoint, { headers: { Authorization: `Bearer ${token.accessToken}` } });
        if (userInfo) {
          const userMap = await options.mapProfileToUser?.(userInfo);
          return {
            user: {
              id: userInfo.sub,
              name: userInfo.name || userInfo.given_name || userInfo.username,
              email: userInfo.email,
              image: userInfo.picture,
              emailVerified: userInfo.email_verified,
              ...userMap
            },
            data: userInfo
          };
        }
      } catch (error2) {
        logger.error("Failed to fetch user info from Cognito:", error2);
      }
      return null;
    },
    options
  };
};
const getCognitoPublicKey = async (kid, region, userPoolId) => {
  const COGNITO_JWKS_URI = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
  try {
    const { data } = await betterFetch(COGNITO_JWKS_URI);
    if (!data?.keys) throw new APIError("BAD_REQUEST", { message: "Keys not found" });
    const jwk = data.keys.find((key) => key.kid === kid);
    if (!jwk) throw new Error(`JWK with kid ${kid} not found`);
    return await importJWK(jwk, jwk.alg);
  } catch (error2) {
    logger.error("Failed to fetch Cognito public key:", error2);
    throw error2;
  }
};
const discord = (options) => {
  return {
    id: "discord",
    name: "Discord",
    createAuthorizationURL({ state, scopes, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : ["identify", "email"];
      if (scopes) _scopes.push(...scopes);
      if (options.scope) _scopes.push(...options.scope);
      const permissionsParam = _scopes.includes("bot") && options.permissions !== void 0 ? `&permissions=${options.permissions}` : "";
      return new URL(`https://discord.com/api/oauth2/authorize?scope=${_scopes.join("+")}&response_type=code&client_id=${options.clientId}&redirect_uri=${encodeURIComponent(options.redirectURI || redirectURI)}&state=${state}&prompt=${options.prompt || "none"}${permissionsParam}`);
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        redirectURI,
        options,
        tokenEndpoint: "https://discord.com/api/oauth2/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://discord.com/api/oauth2/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://discord.com/api/users/@me", { headers: { authorization: `Bearer ${token.accessToken}` } });
      if (error2) return null;
      if (profile.avatar === null) profile.image_url = `https://cdn.discordapp.com/embed/avatars/${profile.discriminator === "0" ? Number(BigInt(profile.id) >> BigInt(22)) % 6 : parseInt(profile.discriminator) % 5}.png`;
      else {
        const format = profile.avatar.startsWith("a_") ? "gif" : "png";
        profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
      }
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.id,
          name: profile.global_name || profile.username || "",
          email: profile.email,
          emailVerified: profile.verified,
          image: profile.image_url,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const dropbox = (options) => {
  const tokenEndpoint = "https://api.dropboxapi.com/oauth2/token";
  return {
    id: "dropbox",
    name: "Dropbox",
    createAuthorizationURL: async ({ state, scopes, codeVerifier, redirectURI }) => {
      const _scopes = options.disableDefaultScope ? [] : ["account_info.read"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      const additionalParams = {};
      if (options.accessType) additionalParams.token_access_type = options.accessType;
      return await createAuthorizationURL({
        id: "dropbox",
        options,
        authorizationEndpoint: "https://www.dropbox.com/oauth2/authorize",
        scopes: _scopes,
        state,
        redirectURI,
        codeVerifier,
        additionalParams
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return await validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://api.dropbox.com/oauth2/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://api.dropboxapi.com/2/users/get_current_account", {
        method: "POST",
        headers: { Authorization: `Bearer ${token.accessToken}` }
      });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.account_id,
          name: profile.name?.display_name,
          email: profile.email,
          emailVerified: profile.email_verified || false,
          image: profile.profile_photo_url,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const facebook = (options) => {
  return {
    id: "facebook",
    name: "Facebook",
    async createAuthorizationURL({ state, scopes, redirectURI, loginHint }) {
      const _scopes = options.disableDefaultScope ? [] : ["email", "public_profile"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return await createAuthorizationURL({
        id: "facebook",
        options,
        authorizationEndpoint: "https://www.facebook.com/v21.0/dialog/oauth",
        scopes: _scopes,
        state,
        redirectURI,
        loginHint,
        additionalParams: options.configId ? { config_id: options.configId } : {}
      });
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        redirectURI,
        options,
        tokenEndpoint: "https://graph.facebook.com/oauth/access_token"
      });
    },
    async verifyIdToken(token, nonce) {
      if (options.disableIdTokenSignIn) return false;
      if (options.verifyIdToken) return options.verifyIdToken(token, nonce);
      if (token.split(".").length === 3) try {
        const { payload: jwtClaims } = await jwtVerify(token, createRemoteJWKSet(new URL("https://limited.facebook.com/.well-known/oauth/openid/jwks/")), {
          algorithms: ["RS256"],
          audience: options.clientId,
          issuer: "https://www.facebook.com"
        });
        if (nonce && jwtClaims.nonce !== nonce) return false;
        return !!jwtClaims;
      } catch {
        return false;
      }
      return true;
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://graph.facebook.com/v18.0/oauth/access_token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      if (token.idToken && token.idToken.split(".").length === 3) {
        const profile$1 = decodeJwt(token.idToken);
        const user = {
          id: profile$1.sub,
          name: profile$1.name,
          email: profile$1.email,
          picture: { data: {
            url: profile$1.picture,
            height: 100,
            width: 100,
            is_silhouette: false
          } }
        };
        const userMap$1 = await options.mapProfileToUser?.({
          ...user,
          email_verified: false
        });
        return {
          user: {
            ...user,
            emailVerified: false,
            ...userMap$1
          },
          data: profile$1
        };
      }
      const { data: profile, error: error2 } = await betterFetch("https://graph.facebook.com/me?fields=" + [
        "id",
        "name",
        "email",
        "picture",
        ...options?.fields || []
      ].join(","), { auth: {
        type: "Bearer",
        token: token.accessToken
      } });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture.data.url,
          emailVerified: profile.email_verified,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const figma = (options) => {
  return {
    id: "figma",
    name: "Figma",
    async createAuthorizationURL({ state, scopes, codeVerifier, redirectURI }) {
      if (!options.clientId || !options.clientSecret) {
        logger.error("Client Id and Client Secret are required for Figma. Make sure to provide them in the options.");
        throw new BetterAuthError("CLIENT_ID_AND_SECRET_REQUIRED");
      }
      if (!codeVerifier) throw new BetterAuthError("codeVerifier is required for Figma");
      const _scopes = options.disableDefaultScope ? [] : ["file_read"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return await createAuthorizationURL({
        id: "figma",
        options,
        authorizationEndpoint: "https://www.figma.com/oauth",
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint: "https://www.figma.com/api/oauth/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://www.figma.com/api/oauth/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      try {
        const { data: profile } = await betterFetch("https://api.figma.com/v1/me", { headers: { Authorization: `Bearer ${token.accessToken}` } });
        if (!profile) {
          logger.error("Failed to fetch user from Figma");
          return null;
        }
        const userMap = await options.mapProfileToUser?.(profile);
        return {
          user: {
            id: profile.id,
            name: profile.handle,
            email: profile.email,
            image: profile.img_url,
            emailVerified: false,
            ...userMap
          },
          data: profile
        };
      } catch (error2) {
        logger.error("Failed to fetch user info from Figma:", error2);
        return null;
      }
    },
    options
  };
};
const github = (options) => {
  const tokenEndpoint = "https://github.com/login/oauth/access_token";
  return {
    id: "github",
    name: "GitHub",
    createAuthorizationURL({ state, scopes, loginHint, codeVerifier, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : ["read:user", "user:email"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "github",
        options,
        authorizationEndpoint: "https://github.com/login/oauth/authorize",
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI,
        loginHint,
        prompt: options.prompt
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://github.com/login/oauth/access_token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://api.github.com/user", { headers: {
        "User-Agent": "better-auth",
        authorization: `Bearer ${token.accessToken}`
      } });
      if (error2) return null;
      const { data: emails } = await betterFetch("https://api.github.com/user/emails", { headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "User-Agent": "better-auth"
      } });
      if (!profile.email && emails) profile.email = (emails.find((e) => e.primary) ?? emails[0])?.email;
      const emailVerified = emails?.find((e) => e.email === profile.email)?.verified ?? false;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.id,
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          emailVerified,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const cleanDoubleSlashes = (input = "") => {
  return input.split("://").map((str) => str.replace(/\/{2,}/g, "/")).join("://");
};
const issuerToEndpoints = (issuer) => {
  let baseUrl = issuer || "https://gitlab.com";
  return {
    authorizationEndpoint: cleanDoubleSlashes(`${baseUrl}/oauth/authorize`),
    tokenEndpoint: cleanDoubleSlashes(`${baseUrl}/oauth/token`),
    userinfoEndpoint: cleanDoubleSlashes(`${baseUrl}/api/v4/user`)
  };
};
const gitlab = (options) => {
  const { authorizationEndpoint, tokenEndpoint, userinfoEndpoint } = issuerToEndpoints(options.issuer);
  const issuerId = "gitlab";
  return {
    id: issuerId,
    name: "Gitlab",
    createAuthorizationURL: async ({ state, scopes, codeVerifier, loginHint, redirectURI }) => {
      const _scopes = options.disableDefaultScope ? [] : ["read_user"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return await createAuthorizationURL({
        id: issuerId,
        options,
        authorizationEndpoint,
        scopes: _scopes,
        state,
        redirectURI,
        codeVerifier,
        loginHint
      });
    },
    validateAuthorizationCode: async ({ code, redirectURI, codeVerifier }) => {
      return validateAuthorizationCode({
        code,
        redirectURI,
        options,
        codeVerifier,
        tokenEndpoint
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch(userinfoEndpoint, { headers: { authorization: `Bearer ${token.accessToken}` } });
      if (error2 || profile.state !== "active" || profile.locked) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.id,
          name: profile.name ?? profile.username,
          email: profile.email,
          image: profile.avatar_url,
          emailVerified: profile.email_verified ?? false,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const google = (options) => {
  return {
    id: "google",
    name: "Google",
    async createAuthorizationURL({ state, scopes, codeVerifier, redirectURI, loginHint, display }) {
      if (!options.clientId || !options.clientSecret) {
        logger.error("Client Id and Client Secret is required for Google. Make sure to provide them in the options.");
        throw new BetterAuthError("CLIENT_ID_AND_SECRET_REQUIRED");
      }
      if (!codeVerifier) throw new BetterAuthError("codeVerifier is required for Google");
      const _scopes = options.disableDefaultScope ? [] : [
        "email",
        "profile",
        "openid"
      ];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return await createAuthorizationURL({
        id: "google",
        options,
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI,
        prompt: options.prompt,
        accessType: options.accessType,
        display: display || options.display,
        loginHint,
        hd: options.hd,
        additionalParams: { include_granted_scopes: "true" }
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint: "https://oauth2.googleapis.com/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://www.googleapis.com/oauth2/v4/token"
      });
    },
    async verifyIdToken(token, nonce) {
      if (options.disableIdTokenSignIn) return false;
      if (options.verifyIdToken) return options.verifyIdToken(token, nonce);
      const { kid, alg: jwtAlg } = decodeProtectedHeader(token);
      if (!kid || !jwtAlg) return false;
      const { payload: jwtClaims } = await jwtVerify(token, await getGooglePublicKey(kid), {
        algorithms: [jwtAlg],
        issuer: ["https://accounts.google.com", "accounts.google.com"],
        audience: options.clientId,
        maxTokenAge: "1h"
      });
      if (nonce && jwtClaims.nonce !== nonce) return false;
      return true;
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      if (!token.idToken) return null;
      const user = decodeJwt(token.idToken);
      const userMap = await options.mapProfileToUser?.(user);
      return {
        user: {
          id: user.sub,
          name: user.name,
          email: user.email,
          image: user.picture,
          emailVerified: user.email_verified,
          ...userMap
        },
        data: user
      };
    },
    options
  };
};
const getGooglePublicKey = async (kid) => {
  const { data } = await betterFetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!data?.keys) throw new APIError("BAD_REQUEST", { message: "Keys not found" });
  const jwk = data.keys.find((key) => key.kid === kid);
  if (!jwk) throw new Error(`JWK with kid ${kid} not found`);
  return await importJWK(jwk, jwk.alg);
};
const huggingface = (options) => {
  return {
    id: "huggingface",
    name: "Hugging Face",
    createAuthorizationURL({ state, scopes, codeVerifier, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : [
        "openid",
        "profile",
        "email"
      ];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "huggingface",
        options,
        authorizationEndpoint: "https://huggingface.co/oauth/authorize",
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint: "https://huggingface.co/oauth/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://huggingface.co/oauth/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://huggingface.co/oauth/userinfo", {
        method: "GET",
        headers: { Authorization: `Bearer ${token.accessToken}` }
      });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ?? false,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const kakao = (options) => {
  return {
    id: "kakao",
    name: "Kakao",
    createAuthorizationURL({ state, scopes, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : [
        "account_email",
        "profile_image",
        "profile_nickname"
      ];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "kakao",
        options,
        authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
        scopes: _scopes,
        state,
        redirectURI
      });
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        redirectURI,
        options,
        tokenEndpoint: "https://kauth.kakao.com/oauth/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://kauth.kakao.com/oauth/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://kapi.kakao.com/v2/user/me", { headers: { Authorization: `Bearer ${token.accessToken}` } });
      if (error2 || !profile) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      const account = profile.kakao_account || {};
      const kakaoProfile = account.profile || {};
      return {
        user: {
          id: String(profile.id),
          name: kakaoProfile.nickname || account.name || void 0,
          email: account.email,
          image: kakaoProfile.profile_image_url || kakaoProfile.thumbnail_image_url,
          emailVerified: !!account.is_email_valid && !!account.is_email_verified,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const kick = (options) => {
  return {
    id: "kick",
    name: "Kick",
    createAuthorizationURL({ state, scopes, redirectURI, codeVerifier }) {
      const _scopes = options.disableDefaultScope ? [] : ["user:read"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "kick",
        redirectURI,
        options,
        authorizationEndpoint: "https://id.kick.com/oauth/authorize",
        scopes: _scopes,
        codeVerifier,
        state
      });
    },
    async validateAuthorizationCode({ code, redirectURI, codeVerifier }) {
      return validateAuthorizationCode({
        code,
        redirectURI,
        options,
        tokenEndpoint: "https://id.kick.com/oauth/token",
        codeVerifier
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://id.kick.com/oauth/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data, error: error2 } = await betterFetch("https://api.kick.com/public/v1/users", {
        method: "GET",
        headers: { Authorization: `Bearer ${token.accessToken}` }
      });
      if (error2) return null;
      const profile = data.data[0];
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.user_id,
          name: profile.name,
          email: profile.email,
          image: profile.profile_picture,
          emailVerified: false,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const line = (options) => {
  const authorizationEndpoint = "https://access.line.me/oauth2/v2.1/authorize";
  const tokenEndpoint = "https://api.line.me/oauth2/v2.1/token";
  const userInfoEndpoint = "https://api.line.me/oauth2/v2.1/userinfo";
  const verifyIdTokenEndpoint = "https://api.line.me/oauth2/v2.1/verify";
  return {
    id: "line",
    name: "LINE",
    async createAuthorizationURL({ state, scopes, codeVerifier, redirectURI, loginHint }) {
      const _scopes = options.disableDefaultScope ? [] : [
        "openid",
        "profile",
        "email"
      ];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return await createAuthorizationURL({
        id: "line",
        options,
        authorizationEndpoint,
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI,
        loginHint
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientSecret: options.clientSecret
        },
        tokenEndpoint
      });
    },
    async verifyIdToken(token, nonce) {
      if (options.disableIdTokenSignIn) return false;
      if (options.verifyIdToken) return options.verifyIdToken(token, nonce);
      const body = new URLSearchParams();
      body.set("id_token", token);
      body.set("client_id", options.clientId);
      if (nonce) body.set("nonce", nonce);
      const { data, error: error2 } = await betterFetch(verifyIdTokenEndpoint, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body
      });
      if (error2 || !data) return false;
      if (data.aud !== options.clientId) return false;
      if (data.nonce && data.nonce !== nonce) return false;
      return true;
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      let profile = null;
      if (token.idToken) try {
        profile = decodeJwt(token.idToken);
      } catch {
      }
      if (!profile) {
        const { data } = await betterFetch(userInfoEndpoint, { headers: { authorization: `Bearer ${token.accessToken}` } });
        profile = data || null;
      }
      if (!profile) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      const id = profile.sub || profile.userId;
      const name = profile.name || profile.displayName;
      const image = profile.picture || profile.pictureUrl || void 0;
      return {
        user: {
          id,
          name,
          email: profile.email,
          image,
          emailVerified: false,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const linear = (options) => {
  const tokenEndpoint = "https://api.linear.app/oauth/token";
  return {
    id: "linear",
    name: "Linear",
    createAuthorizationURL({ state, scopes, loginHint, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : ["read"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "linear",
        options,
        authorizationEndpoint: "https://linear.app/oauth/authorize",
        scopes: _scopes,
        state,
        redirectURI,
        loginHint
      });
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        redirectURI,
        options,
        tokenEndpoint
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.accessToken}`
        },
        body: JSON.stringify({ query: `
							query {
								viewer {
									id
									name
									email
									avatarUrl
									active
									createdAt
									updatedAt
								}
							}
						` })
      });
      if (error2 || !profile?.data?.viewer) return null;
      const userData = profile.data.viewer;
      const userMap = await options.mapProfileToUser?.(userData);
      return {
        user: {
          id: profile.data.viewer.id,
          name: profile.data.viewer.name,
          email: profile.data.viewer.email,
          image: profile.data.viewer.avatarUrl,
          emailVerified: false,
          ...userMap
        },
        data: userData
      };
    },
    options
  };
};
const linkedin = (options) => {
  const authorizationEndpoint = "https://www.linkedin.com/oauth/v2/authorization";
  const tokenEndpoint = "https://www.linkedin.com/oauth/v2/accessToken";
  return {
    id: "linkedin",
    name: "Linkedin",
    createAuthorizationURL: async ({ state, scopes, redirectURI, loginHint }) => {
      const _scopes = options.disableDefaultScope ? [] : [
        "profile",
        "email",
        "openid"
      ];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return await createAuthorizationURL({
        id: "linkedin",
        options,
        authorizationEndpoint,
        scopes: _scopes,
        state,
        loginHint,
        redirectURI
      });
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return await validateAuthorizationCode({
        code,
        redirectURI,
        options,
        tokenEndpoint
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://api.linkedin.com/v2/userinfo", {
        method: "GET",
        headers: { Authorization: `Bearer ${token.accessToken}` }
      });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          emailVerified: profile.email_verified || false,
          image: profile.picture,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const microsoft = (options) => {
  const tenant = options.tenantId || "common";
  const authority = options.authority || "https://login.microsoftonline.com";
  const authorizationEndpoint = `${authority}/${tenant}/oauth2/v2.0/authorize`;
  const tokenEndpoint = `${authority}/${tenant}/oauth2/v2.0/token`;
  return {
    id: "microsoft",
    name: "Microsoft EntraID",
    createAuthorizationURL(data) {
      const scopes = options.disableDefaultScope ? [] : [
        "openid",
        "profile",
        "email",
        "User.Read",
        "offline_access"
      ];
      if (options.scope) scopes.push(...options.scope);
      if (data.scopes) scopes.push(...data.scopes);
      return createAuthorizationURL({
        id: "microsoft",
        options,
        authorizationEndpoint,
        state: data.state,
        codeVerifier: data.codeVerifier,
        scopes,
        redirectURI: data.redirectURI,
        prompt: options.prompt,
        loginHint: data.loginHint
      });
    },
    validateAuthorizationCode({ code, codeVerifier, redirectURI }) {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      if (!token.idToken) return null;
      const user = decodeJwt(token.idToken);
      const profilePhotoSize = options.profilePhotoSize || 48;
      await betterFetch(`https://graph.microsoft.com/v1.0/me/photos/${profilePhotoSize}x${profilePhotoSize}/$value`, {
        headers: { Authorization: `Bearer ${token.accessToken}` },
        async onResponse(context) {
          if (options.disableProfilePhoto || !context.response.ok) return;
          try {
            const pictureBuffer = await context.response.clone().arrayBuffer();
            user.picture = `data:image/jpeg;base64, ${base64.encode(pictureBuffer)}`;
          } catch (e) {
            logger.error(e && typeof e === "object" && "name" in e ? e.name : "", e);
          }
        }
      });
      const userMap = await options.mapProfileToUser?.(user);
      const emailVerified = user.email_verified !== void 0 ? user.email_verified : user.email && (user.verified_primary_email?.includes(user.email) || user.verified_secondary_email?.includes(user.email)) ? true : false;
      return {
        user: {
          id: user.sub,
          name: user.name,
          email: user.email,
          image: user.picture,
          emailVerified,
          ...userMap
        },
        data: user
      };
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      const scopes = options.disableDefaultScope ? [] : [
        "openid",
        "profile",
        "email",
        "User.Read",
        "offline_access"
      ];
      if (options.scope) scopes.push(...options.scope);
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientSecret: options.clientSecret
        },
        extraParams: { scope: scopes.join(" ") },
        tokenEndpoint
      });
    },
    options
  };
};
const naver = (options) => {
  return {
    id: "naver",
    name: "Naver",
    createAuthorizationURL({ state, scopes, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : ["profile", "email"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "naver",
        options,
        authorizationEndpoint: "https://nid.naver.com/oauth2.0/authorize",
        scopes: _scopes,
        state,
        redirectURI
      });
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        redirectURI,
        options,
        tokenEndpoint: "https://nid.naver.com/oauth2.0/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://nid.naver.com/oauth2.0/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://openapi.naver.com/v1/nid/me", { headers: { Authorization: `Bearer ${token.accessToken}` } });
      if (error2 || !profile || profile.resultcode !== "00") return null;
      const userMap = await options.mapProfileToUser?.(profile);
      const res = profile.response || {};
      return {
        user: {
          id: res.id,
          name: res.name || res.nickname,
          email: res.email,
          image: res.profile_image,
          emailVerified: false,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const notion = (options) => {
  const tokenEndpoint = "https://api.notion.com/v1/oauth/token";
  return {
    id: "notion",
    name: "Notion",
    createAuthorizationURL({ state, scopes, loginHint, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : [];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "notion",
        options,
        authorizationEndpoint: "https://api.notion.com/v1/oauth/authorize",
        scopes: _scopes,
        state,
        redirectURI,
        loginHint,
        additionalParams: { owner: "user" }
      });
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        redirectURI,
        options,
        tokenEndpoint,
        authentication: "basic"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://api.notion.com/v1/users/me", { headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Notion-Version": "2022-06-28"
      } });
      if (error2 || !profile) return null;
      const userProfile = profile.bot?.owner?.user;
      if (!userProfile) return null;
      const userMap = await options.mapProfileToUser?.(userProfile);
      return {
        user: {
          id: userProfile.id,
          name: userProfile.name || "Notion User",
          email: userProfile.person?.email || null,
          image: userProfile.avatar_url,
          emailVerified: false,
          ...userMap
        },
        data: userProfile
      };
    },
    options
  };
};
const paybin = (options) => {
  const issuer = options.issuer || "https://idp.paybin.io";
  const authorizationEndpoint = `${issuer}/oauth2/authorize`;
  const tokenEndpoint = `${issuer}/oauth2/token`;
  return {
    id: "paybin",
    name: "Paybin",
    async createAuthorizationURL({ state, scopes, codeVerifier, redirectURI, loginHint }) {
      if (!options.clientId || !options.clientSecret) {
        logger.error("Client Id and Client Secret is required for Paybin. Make sure to provide them in the options.");
        throw new BetterAuthError("CLIENT_ID_AND_SECRET_REQUIRED");
      }
      if (!codeVerifier) throw new BetterAuthError("codeVerifier is required for Paybin");
      const _scopes = options.disableDefaultScope ? [] : [
        "openid",
        "email",
        "profile"
      ];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return await createAuthorizationURL({
        id: "paybin",
        options,
        authorizationEndpoint,
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI,
        prompt: options.prompt,
        loginHint
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      if (!token.idToken) return null;
      const user = decodeJwt(token.idToken);
      const userMap = await options.mapProfileToUser?.(user);
      return {
        user: {
          id: user.sub,
          name: user.name || user.preferred_username || (user.email ? user.email.split("@")[0] : "User") || "User",
          email: user.email,
          image: user.picture,
          emailVerified: user.email_verified || false,
          ...userMap
        },
        data: user
      };
    },
    options
  };
};
const paypal = (options) => {
  const isSandbox = (options.environment || "sandbox") === "sandbox";
  const authorizationEndpoint = isSandbox ? "https://www.sandbox.paypal.com/signin/authorize" : "https://www.paypal.com/signin/authorize";
  const tokenEndpoint = isSandbox ? "https://api-m.sandbox.paypal.com/v1/oauth2/token" : "https://api-m.paypal.com/v1/oauth2/token";
  const userInfoEndpoint = isSandbox ? "https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo" : "https://api-m.paypal.com/v1/identity/oauth2/userinfo";
  return {
    id: "paypal",
    name: "PayPal",
    async createAuthorizationURL({ state, codeVerifier, redirectURI }) {
      if (!options.clientId || !options.clientSecret) {
        logger.error("Client Id and Client Secret is required for PayPal. Make sure to provide them in the options.");
        throw new BetterAuthError("CLIENT_ID_AND_SECRET_REQUIRED");
      }
      return await createAuthorizationURL({
        id: "paypal",
        options,
        authorizationEndpoint,
        scopes: [],
        state,
        codeVerifier,
        redirectURI,
        prompt: options.prompt
      });
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      const credentials = base64.encode(`${options.clientId}:${options.clientSecret}`);
      try {
        const response = await betterFetch(tokenEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            Accept: "application/json",
            "Accept-Language": "en_US",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectURI
          }).toString()
        });
        if (!response.data) throw new BetterAuthError("FAILED_TO_GET_ACCESS_TOKEN");
        const data = response.data;
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          accessTokenExpiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1e3) : void 0,
          idToken: data.id_token
        };
      } catch (error2) {
        logger.error("PayPal token exchange failed:", error2);
        throw new BetterAuthError("FAILED_TO_GET_ACCESS_TOKEN");
      }
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      const credentials = base64.encode(`${options.clientId}:${options.clientSecret}`);
      try {
        const response = await betterFetch(tokenEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            Accept: "application/json",
            "Accept-Language": "en_US",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken2
          }).toString()
        });
        if (!response.data) throw new BetterAuthError("FAILED_TO_REFRESH_ACCESS_TOKEN");
        const data = response.data;
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          accessTokenExpiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1e3) : void 0
        };
      } catch (error2) {
        logger.error("PayPal token refresh failed:", error2);
        throw new BetterAuthError("FAILED_TO_REFRESH_ACCESS_TOKEN");
      }
    },
    async verifyIdToken(token, nonce) {
      if (options.disableIdTokenSignIn) return false;
      if (options.verifyIdToken) return options.verifyIdToken(token, nonce);
      try {
        return !!decodeJwt(token).sub;
      } catch (error2) {
        logger.error("Failed to verify PayPal ID token:", error2);
        return false;
      }
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      if (!token.accessToken) {
        logger.error("Access token is required to fetch PayPal user info");
        return null;
      }
      try {
        const response = await betterFetch(`${userInfoEndpoint}?schema=paypalv1.1`, { headers: {
          Authorization: `Bearer ${token.accessToken}`,
          Accept: "application/json"
        } });
        if (!response.data) {
          logger.error("Failed to fetch user info from PayPal");
          return null;
        }
        const userInfo = response.data;
        const userMap = await options.mapProfileToUser?.(userInfo);
        return {
          user: {
            id: userInfo.user_id,
            name: userInfo.name,
            email: userInfo.email,
            image: userInfo.picture,
            emailVerified: userInfo.email_verified,
            ...userMap
          },
          data: userInfo
        };
      } catch (error2) {
        logger.error("Failed to fetch user info from PayPal:", error2);
        return null;
      }
    },
    options
  };
};
const polar = (options) => {
  return {
    id: "polar",
    name: "Polar",
    createAuthorizationURL({ state, scopes, codeVerifier, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : [
        "openid",
        "profile",
        "email"
      ];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "polar",
        options,
        authorizationEndpoint: "https://polar.sh/oauth2/authorize",
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI,
        prompt: options.prompt
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint: "https://api.polar.sh/v1/oauth2/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://api.polar.sh/v1/oauth2/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://api.polar.sh/v1/oauth2/userinfo", { headers: { Authorization: `Bearer ${token.accessToken}` } });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.id,
          name: profile.public_name || profile.username,
          email: profile.email,
          image: profile.avatar_url,
          emailVerified: profile.email_verified ?? false,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const reddit = (options) => {
  return {
    id: "reddit",
    name: "Reddit",
    createAuthorizationURL({ state, scopes, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : ["identity"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "reddit",
        options,
        authorizationEndpoint: "https://www.reddit.com/api/v1/authorize",
        scopes: _scopes,
        state,
        redirectURI,
        duration: options.duration
      });
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: options.redirectURI || redirectURI
      });
      const { data, error: error2 } = await betterFetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/plain",
          "user-agent": "better-auth",
          Authorization: `Basic ${base64.encode(`${options.clientId}:${options.clientSecret}`)}`
        },
        body: body.toString()
      });
      if (error2) throw error2;
      return getOAuth2Tokens(data);
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        authentication: "basic",
        tokenEndpoint: "https://www.reddit.com/api/v1/access_token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://oauth.reddit.com/api/v1/me", { headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "User-Agent": "better-auth"
      } });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.oauth_client_id,
          emailVerified: profile.has_verified_email,
          image: profile.icon_img?.split("?")[0],
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const roblox = (options) => {
  return {
    id: "roblox",
    name: "Roblox",
    createAuthorizationURL({ state, scopes, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : ["openid", "profile"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return new URL(`https://apis.roblox.com/oauth/v1/authorize?scope=${_scopes.join("+")}&response_type=code&client_id=${options.clientId}&redirect_uri=${encodeURIComponent(options.redirectURI || redirectURI)}&state=${state}&prompt=${options.prompt || "select_account consent"}`);
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        redirectURI: options.redirectURI || redirectURI,
        options,
        tokenEndpoint: "https://apis.roblox.com/oauth/v1/token",
        authentication: "post"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://apis.roblox.com/oauth/v1/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://apis.roblox.com/oauth/v1/userinfo", { headers: { authorization: `Bearer ${token.accessToken}` } });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.sub,
          name: profile.nickname || profile.preferred_username || "",
          image: profile.picture,
          email: profile.preferred_username || null,
          emailVerified: false,
          ...userMap
        },
        data: { ...profile }
      };
    },
    options
  };
};
const salesforce = (options) => {
  const isSandbox = (options.environment ?? "production") === "sandbox";
  const authorizationEndpoint = options.loginUrl ? `https://${options.loginUrl}/services/oauth2/authorize` : isSandbox ? "https://test.salesforce.com/services/oauth2/authorize" : "https://login.salesforce.com/services/oauth2/authorize";
  const tokenEndpoint = options.loginUrl ? `https://${options.loginUrl}/services/oauth2/token` : isSandbox ? "https://test.salesforce.com/services/oauth2/token" : "https://login.salesforce.com/services/oauth2/token";
  const userInfoEndpoint = options.loginUrl ? `https://${options.loginUrl}/services/oauth2/userinfo` : isSandbox ? "https://test.salesforce.com/services/oauth2/userinfo" : "https://login.salesforce.com/services/oauth2/userinfo";
  return {
    id: "salesforce",
    name: "Salesforce",
    async createAuthorizationURL({ state, scopes, codeVerifier, redirectURI }) {
      if (!options.clientId || !options.clientSecret) {
        logger.error("Client Id and Client Secret are required for Salesforce. Make sure to provide them in the options.");
        throw new BetterAuthError("CLIENT_ID_AND_SECRET_REQUIRED");
      }
      if (!codeVerifier) throw new BetterAuthError("codeVerifier is required for Salesforce");
      const _scopes = options.disableDefaultScope ? [] : [
        "openid",
        "email",
        "profile"
      ];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "salesforce",
        options,
        authorizationEndpoint,
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI: options.redirectURI || redirectURI
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI: options.redirectURI || redirectURI,
        options,
        tokenEndpoint
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientSecret: options.clientSecret
        },
        tokenEndpoint
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      try {
        const { data: user } = await betterFetch(userInfoEndpoint, { headers: { Authorization: `Bearer ${token.accessToken}` } });
        if (!user) {
          logger.error("Failed to fetch user info from Salesforce");
          return null;
        }
        const userMap = await options.mapProfileToUser?.(user);
        return {
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email,
            image: user.photos?.picture || user.photos?.thumbnail,
            emailVerified: user.email_verified ?? false,
            ...userMap
          },
          data: user
        };
      } catch (error2) {
        logger.error("Failed to fetch user info from Salesforce:", error2);
        return null;
      }
    },
    options
  };
};
const slack = (options) => {
  return {
    id: "slack",
    name: "Slack",
    createAuthorizationURL({ state, scopes, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : [
        "openid",
        "profile",
        "email"
      ];
      if (scopes) _scopes.push(...scopes);
      if (options.scope) _scopes.push(...options.scope);
      const url = new URL("https://slack.com/openid/connect/authorize");
      url.searchParams.set("scope", _scopes.join(" "));
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", options.clientId);
      url.searchParams.set("redirect_uri", options.redirectURI || redirectURI);
      url.searchParams.set("state", state);
      return url;
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        redirectURI,
        options,
        tokenEndpoint: "https://slack.com/api/openid.connect.token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://slack.com/api/openid.connect.token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://slack.com/api/openid.connect.userInfo", { headers: { authorization: `Bearer ${token.accessToken}` } });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile["https://slack.com/user_id"],
          name: profile.name || "",
          email: profile.email,
          emailVerified: profile.email_verified,
          image: profile.picture || profile["https://slack.com/user_image_512"],
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const spotify = (options) => {
  return {
    id: "spotify",
    name: "Spotify",
    createAuthorizationURL({ state, scopes, codeVerifier, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : ["user-read-email"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "spotify",
        options,
        authorizationEndpoint: "https://accounts.spotify.com/authorize",
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint: "https://accounts.spotify.com/api/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://accounts.spotify.com/api/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token.accessToken}` }
      });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.id,
          name: profile.display_name,
          email: profile.email,
          image: profile.images[0]?.url,
          emailVerified: false,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const tiktok = (options) => {
  return {
    id: "tiktok",
    name: "TikTok",
    createAuthorizationURL({ state, scopes, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : ["user.info.profile"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return new URL(`https://www.tiktok.com/v2/auth/authorize?scope=${_scopes.join(",")}&response_type=code&client_key=${options.clientKey}&redirect_uri=${encodeURIComponent(options.redirectURI || redirectURI)}&state=${state}`);
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        redirectURI: options.redirectURI || redirectURI,
        options: {
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://open.tiktokapis.com/v2/oauth/token/"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: { clientSecret: options.clientSecret },
        tokenEndpoint: "https://open.tiktokapis.com/v2/oauth/token/",
        authentication: "post",
        extraParams: { client_key: options.clientKey }
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch(`https://open.tiktokapis.com/v2/user/info/?fields=${[
        "open_id",
        "avatar_large_url",
        "display_name",
        "username"
      ].join(",")}`, { headers: { authorization: `Bearer ${token.accessToken}` } });
      if (error2) return null;
      return {
        user: {
          email: profile.data.user.email || profile.data.user.username,
          id: profile.data.user.open_id,
          name: profile.data.user.display_name || profile.data.user.username,
          image: profile.data.user.avatar_large_url,
          emailVerified: false
        },
        data: profile
      };
    },
    options
  };
};
const twitch = (options) => {
  return {
    id: "twitch",
    name: "Twitch",
    createAuthorizationURL({ state, scopes, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : ["user:read:email", "openid"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "twitch",
        redirectURI,
        options,
        authorizationEndpoint: "https://id.twitch.tv/oauth2/authorize",
        scopes: _scopes,
        state,
        claims: options.claims || [
          "email",
          "email_verified",
          "preferred_username",
          "picture"
        ]
      });
    },
    validateAuthorizationCode: async ({ code, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        redirectURI,
        options,
        tokenEndpoint: "https://id.twitch.tv/oauth2/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://id.twitch.tv/oauth2/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const idToken = token.idToken;
      if (!idToken) {
        logger.error("No idToken found in token");
        return null;
      }
      const profile = decodeJwt(idToken);
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.sub,
          name: profile.preferred_username,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const twitter = (options) => {
  return {
    id: "twitter",
    name: "Twitter",
    createAuthorizationURL(data) {
      const _scopes = options.disableDefaultScope ? [] : [
        "users.read",
        "tweet.read",
        "offline.access",
        "users.email"
      ];
      if (options.scope) _scopes.push(...options.scope);
      if (data.scopes) _scopes.push(...data.scopes);
      return createAuthorizationURL({
        id: "twitter",
        options,
        authorizationEndpoint: "https://x.com/i/oauth2/authorize",
        scopes: _scopes,
        state: data.state,
        codeVerifier: data.codeVerifier,
        redirectURI: data.redirectURI
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        authentication: "basic",
        redirectURI,
        options,
        tokenEndpoint: "https://api.x.com/2/oauth2/token"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        authentication: "basic",
        tokenEndpoint: "https://api.x.com/2/oauth2/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: profileError } = await betterFetch("https://api.x.com/2/users/me?user.fields=profile_image_url", {
        method: "GET",
        headers: { Authorization: `Bearer ${token.accessToken}` }
      });
      if (profileError) return null;
      const { data: emailData, error: emailError } = await betterFetch("https://api.x.com/2/users/me?user.fields=confirmed_email", {
        method: "GET",
        headers: { Authorization: `Bearer ${token.accessToken}` }
      });
      let emailVerified = false;
      if (!emailError && emailData?.data?.confirmed_email) {
        profile.data.email = emailData.data.confirmed_email;
        emailVerified = true;
      }
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.data.id,
          name: profile.data.name,
          email: profile.data.email || profile.data.username || null,
          image: profile.data.profile_image_url,
          emailVerified,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const vercel = (options) => {
  return {
    id: "vercel",
    name: "Vercel",
    createAuthorizationURL({ state, scopes, codeVerifier, redirectURI }) {
      if (!codeVerifier) throw new BetterAuthError("codeVerifier is required for Vercel");
      let _scopes = void 0;
      if (options.scope !== void 0 || scopes !== void 0) {
        _scopes = [];
        if (options.scope) _scopes.push(...options.scope);
        if (scopes) _scopes.push(...scopes);
      }
      return createAuthorizationURL({
        id: "vercel",
        options,
        authorizationEndpoint: "https://vercel.com/oauth/authorize",
        scopes: _scopes,
        state,
        codeVerifier,
        redirectURI
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI,
        options,
        tokenEndpoint: "https://api.vercel.com/login/oauth/token"
      });
    },
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://api.vercel.com/login/oauth/userinfo", { headers: { Authorization: `Bearer ${token.accessToken}` } });
      if (error2 || !profile) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ?? false,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const vk = (options) => {
  return {
    id: "vk",
    name: "VK",
    async createAuthorizationURL({ state, scopes, codeVerifier, redirectURI }) {
      const _scopes = options.disableDefaultScope ? [] : ["email", "phone"];
      if (options.scope) _scopes.push(...options.scope);
      if (scopes) _scopes.push(...scopes);
      return createAuthorizationURL({
        id: "vk",
        options,
        authorizationEndpoint: "https://id.vk.com/authorize",
        scopes: _scopes,
        state,
        redirectURI,
        codeVerifier
      });
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI, deviceId }) => {
      return validateAuthorizationCode({
        code,
        codeVerifier,
        redirectURI: options.redirectURI || redirectURI,
        options,
        deviceId,
        tokenEndpoint: "https://id.vk.com/oauth2/auth"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => {
      return refreshAccessToken({
        refreshToken: refreshToken2,
        options: {
          clientId: options.clientId,
          clientKey: options.clientKey,
          clientSecret: options.clientSecret
        },
        tokenEndpoint: "https://id.vk.com/oauth2/auth"
      });
    },
    async getUserInfo(data) {
      if (options.getUserInfo) return options.getUserInfo(data);
      if (!data.accessToken) return null;
      const formBody = new URLSearchParams({
        access_token: data.accessToken,
        client_id: options.clientId
      }).toString();
      const { data: profile, error: error2 } = await betterFetch("https://id.vk.com/oauth2/user_info", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody
      });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      if (!profile.user.email && !userMap?.email) return null;
      return {
        user: {
          id: profile.user.user_id,
          first_name: profile.user.first_name,
          last_name: profile.user.last_name,
          email: profile.user.email,
          image: profile.user.avatar,
          emailVerified: false,
          birthday: profile.user.birthday,
          sex: profile.user.sex,
          name: `${profile.user.first_name} ${profile.user.last_name}`,
          ...userMap
        },
        data: profile
      };
    },
    options
  };
};
const zoom = (userOptions) => {
  const options = {
    pkce: true,
    ...userOptions
  };
  return {
    id: "zoom",
    name: "Zoom",
    createAuthorizationURL: async ({ state, redirectURI, codeVerifier }) => {
      const params = new URLSearchParams({
        response_type: "code",
        redirect_uri: options.redirectURI ? options.redirectURI : redirectURI,
        client_id: options.clientId,
        state
      });
      if (options.pkce) {
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        params.set("code_challenge_method", "S256");
        params.set("code_challenge", codeChallenge);
      }
      const url = new URL("https://zoom.us/oauth/authorize");
      url.search = params.toString();
      return url;
    },
    validateAuthorizationCode: async ({ code, redirectURI, codeVerifier }) => {
      return validateAuthorizationCode({
        code,
        redirectURI: options.redirectURI || redirectURI,
        codeVerifier,
        options,
        tokenEndpoint: "https://zoom.us/oauth/token",
        authentication: "post"
      });
    },
    refreshAccessToken: options.refreshAccessToken ? options.refreshAccessToken : async (refreshToken2) => refreshAccessToken({
      refreshToken: refreshToken2,
      options: {
        clientId: options.clientId,
        clientKey: options.clientKey,
        clientSecret: options.clientSecret
      },
      tokenEndpoint: "https://zoom.us/oauth/token"
    }),
    async getUserInfo(token) {
      if (options.getUserInfo) return options.getUserInfo(token);
      const { data: profile, error: error2 } = await betterFetch("https://api.zoom.us/v2/users/me", { headers: { authorization: `Bearer ${token.accessToken}` } });
      if (error2) return null;
      const userMap = await options.mapProfileToUser?.(profile);
      return {
        user: {
          id: profile.id,
          name: profile.display_name,
          image: profile.pic_url,
          email: profile.email,
          emailVerified: Boolean(profile.verified),
          ...userMap
        },
        data: { ...profile }
      };
    }
  };
};
const socialProviders = {
  apple,
  atlassian,
  cognito,
  discord,
  facebook,
  figma,
  github,
  microsoft,
  google,
  huggingface,
  slack,
  spotify,
  twitch,
  twitter,
  dropbox,
  kick,
  linear,
  linkedin,
  gitlab,
  tiktok,
  reddit,
  roblox,
  salesforce,
  vk,
  zoom,
  notion,
  kakao,
  naver,
  line,
  paybin,
  paypal,
  polar,
  vercel
};
const socialProviderList = Object.keys(socialProviders);
const SocialProviderListEnum = _enum(socialProviderList).or(string());
const listUserAccounts = createAuthEndpoint("/list-accounts", {
  method: "GET",
  use: [sessionMiddleware],
  metadata: { openapi: {
    operationId: "listUserAccounts",
    description: "List all accounts linked to the user",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            providerId: { type: "string" },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            },
            accountId: { type: "string" },
            userId: { type: "string" },
            scopes: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: [
            "id",
            "providerId",
            "createdAt",
            "updatedAt",
            "accountId",
            "userId",
            "scopes"
          ]
        }
      } } }
    } }
  } }
}, async (c) => {
  const session = c.context.session;
  const accounts2 = await c.context.internalAdapter.findAccounts(session.user.id);
  return c.json(accounts2.map((a) => ({
    id: a.id,
    providerId: a.providerId,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    accountId: a.accountId,
    userId: a.userId,
    scopes: a.scope?.split(",") || []
  })));
});
const linkSocialAccount = createAuthEndpoint("/link-social", {
  method: "POST",
  requireHeaders: true,
  body: object({
    callbackURL: string().meta({ description: "The URL to redirect to after the user has signed in" }).optional(),
    provider: SocialProviderListEnum,
    idToken: object({
      token: string(),
      nonce: string().optional(),
      accessToken: string().optional(),
      refreshToken: string().optional(),
      scopes: array(string()).optional()
    }).optional(),
    requestSignUp: boolean().optional(),
    scopes: array(string()).meta({ description: "Additional scopes to request from the provider" }).optional(),
    errorCallbackURL: string().meta({ description: "The URL to redirect to if there is an error during the link process" }).optional(),
    disableRedirect: boolean().meta({ description: "Disable automatic redirection to the provider. Useful for handling the redirection yourself" }).optional(),
    additionalData: record(string(), any()).optional()
  }),
  use: [sessionMiddleware],
  metadata: { openapi: {
    description: "Link a social account to the user",
    operationId: "linkSocialAccount",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The authorization URL to redirect the user to"
          },
          redirect: {
            type: "boolean",
            description: "Indicates if the user should be redirected to the authorization URL"
          },
          status: { type: "boolean" }
        },
        required: ["redirect"]
      } } }
    } }
  } }
}, async (c) => {
  const session = c.context.session;
  const provider = c.context.socialProviders.find((p) => p.id === c.body.provider);
  if (!provider) {
    c.context.logger.error("Provider not found. Make sure to add the provider in your auth config", { provider: c.body.provider });
    throw new APIError("NOT_FOUND", { message: BASE_ERROR_CODES.PROVIDER_NOT_FOUND });
  }
  if (c.body.idToken) {
    if (!provider.verifyIdToken) {
      c.context.logger.error("Provider does not support id token verification", { provider: c.body.provider });
      throw new APIError("NOT_FOUND", { message: BASE_ERROR_CODES.ID_TOKEN_NOT_SUPPORTED });
    }
    const { token, nonce } = c.body.idToken;
    if (!await provider.verifyIdToken(token, nonce)) {
      c.context.logger.error("Invalid id token", { provider: c.body.provider });
      throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.INVALID_TOKEN });
    }
    const linkingUserInfo = await provider.getUserInfo({
      idToken: token,
      accessToken: c.body.idToken.accessToken,
      refreshToken: c.body.idToken.refreshToken
    });
    if (!linkingUserInfo || !linkingUserInfo?.user) {
      c.context.logger.error("Failed to get user info", { provider: c.body.provider });
      throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.FAILED_TO_GET_USER_INFO });
    }
    const linkingUserId = String(linkingUserInfo.user.id);
    if (!linkingUserInfo.user.email) {
      c.context.logger.error("User email not found", { provider: c.body.provider });
      throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.USER_EMAIL_NOT_FOUND });
    }
    if ((await c.context.internalAdapter.findAccounts(session.user.id)).find((a) => a.providerId === provider.id && a.accountId === linkingUserId)) return c.json({
      url: "",
      status: true,
      redirect: false
    });
    if (!c.context.options.account?.accountLinking?.trustedProviders?.includes(provider.id) && !linkingUserInfo.user.emailVerified || c.context.options.account?.accountLinking?.enabled === false) throw new APIError("UNAUTHORIZED", { message: "Account not linked - linking not allowed" });
    if (linkingUserInfo.user.email !== session.user.email && c.context.options.account?.accountLinking?.allowDifferentEmails !== true) throw new APIError("UNAUTHORIZED", { message: "Account not linked - different emails not allowed" });
    try {
      await c.context.internalAdapter.createAccount({
        userId: session.user.id,
        providerId: provider.id,
        accountId: linkingUserId,
        accessToken: c.body.idToken.accessToken,
        idToken: token,
        refreshToken: c.body.idToken.refreshToken,
        scope: c.body.idToken.scopes?.join(",")
      });
    } catch {
      throw new APIError("EXPECTATION_FAILED", { message: "Account not linked - unable to create account" });
    }
    if (c.context.options.account?.accountLinking?.updateUserInfoOnLink === true) try {
      await c.context.internalAdapter.updateUser(session.user.id, {
        name: linkingUserInfo.user?.name,
        image: linkingUserInfo.user?.image
      });
    } catch (e) {
      console.warn("Could not update user - " + e.toString());
    }
    return c.json({
      url: "",
      status: true,
      redirect: false
    });
  }
  const state = await generateState(c, {
    userId: session.user.id,
    email: session.user.email
  }, c.body.additionalData);
  const url = await provider.createAuthorizationURL({
    state: state.state,
    codeVerifier: state.codeVerifier,
    redirectURI: `${c.context.baseURL}/callback/${provider.id}`,
    scopes: c.body.scopes
  });
  if (!c.body.disableRedirect) c.setHeader("Location", url.toString());
  return c.json({
    url: url.toString(),
    redirect: !c.body.disableRedirect
  });
});
const unlinkAccount = createAuthEndpoint("/unlink-account", {
  method: "POST",
  body: object({
    providerId: string(),
    accountId: string().optional()
  }),
  use: [freshSessionMiddleware],
  metadata: { openapi: {
    description: "Unlink an account",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: { status: { type: "boolean" } }
      } } }
    } }
  } }
}, async (ctx) => {
  const { providerId, accountId } = ctx.body;
  const accounts2 = await ctx.context.internalAdapter.findAccounts(ctx.context.session.user.id);
  if (accounts2.length === 1 && !ctx.context.options.account?.accountLinking?.allowUnlinkingAll) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.FAILED_TO_UNLINK_LAST_ACCOUNT });
  const accountExist = accounts2.find((account) => accountId ? account.accountId === accountId && account.providerId === providerId : account.providerId === providerId);
  if (!accountExist) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.ACCOUNT_NOT_FOUND });
  await ctx.context.internalAdapter.deleteAccount(accountExist.id);
  return ctx.json({ status: true });
});
const getAccessToken = createAuthEndpoint("/get-access-token", {
  method: "POST",
  body: object({
    providerId: string().meta({ description: "The provider ID for the OAuth provider" }),
    accountId: string().meta({ description: "The account ID associated with the refresh token" }).optional(),
    userId: string().meta({ description: "The user ID associated with the account" }).optional()
  }),
  metadata: { openapi: {
    description: "Get a valid access token, doing a refresh if needed",
    responses: {
      200: {
        description: "A Valid access token",
        content: { "application/json": { schema: {
          type: "object",
          properties: {
            tokenType: { type: "string" },
            idToken: { type: "string" },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
            accessTokenExpiresAt: {
              type: "string",
              format: "date-time"
            },
            refreshTokenExpiresAt: {
              type: "string",
              format: "date-time"
            }
          }
        } } }
      },
      400: { description: "Invalid refresh token or provider configuration" }
    }
  } }
}, async (ctx) => {
  const { providerId, accountId, userId } = ctx.body || {};
  const req = ctx.request;
  const session = await getSessionFromCtx(ctx);
  if (req && !session) throw ctx.error("UNAUTHORIZED");
  let resolvedUserId = session?.user?.id || userId;
  if (!resolvedUserId) throw ctx.error("UNAUTHORIZED");
  if (!ctx.context.socialProviders.find((p) => p.id === providerId)) throw new APIError("BAD_REQUEST", { message: `Provider ${providerId} is not supported.` });
  const accountData = await getAccountCookie(ctx);
  let account = void 0;
  if (accountData && providerId === accountData.providerId && (!accountId || accountData.id === accountId)) account = accountData;
  else account = (await ctx.context.internalAdapter.findAccounts(resolvedUserId)).find((acc) => accountId ? acc.id === accountId && acc.providerId === providerId : acc.providerId === providerId);
  if (!account) throw new APIError("BAD_REQUEST", { message: "Account not found" });
  const provider = ctx.context.socialProviders.find((p) => p.id === providerId);
  if (!provider) throw new APIError("BAD_REQUEST", { message: `Provider ${providerId} not found.` });
  try {
    let newTokens = null;
    const accessTokenExpired = account.accessTokenExpiresAt && new Date(account.accessTokenExpiresAt).getTime() - Date.now() < 5e3;
    if (account.refreshToken && accessTokenExpired && provider.refreshAccessToken) {
      const refreshToken$1 = await decryptOAuthToken(account.refreshToken, ctx.context);
      newTokens = await provider.refreshAccessToken(refreshToken$1);
      const updatedData = {
        accessToken: await setTokenUtil(newTokens.accessToken, ctx.context),
        accessTokenExpiresAt: newTokens.accessTokenExpiresAt,
        refreshToken: await setTokenUtil(newTokens.refreshToken, ctx.context),
        refreshTokenExpiresAt: newTokens.refreshTokenExpiresAt
      };
      let updatedAccount = null;
      if (account.id) updatedAccount = await ctx.context.internalAdapter.updateAccount(account.id, updatedData);
      if (ctx.context.options.account?.storeAccountCookie) await setAccountCookie(ctx, {
        ...account,
        ...updatedAccount ?? updatedData
      });
    }
    const tokens = {
      accessToken: newTokens?.accessToken ?? await decryptOAuthToken(account.accessToken ?? "", ctx.context),
      accessTokenExpiresAt: newTokens?.accessTokenExpiresAt ?? account.accessTokenExpiresAt ?? void 0,
      scopes: account.scope?.split(",") ?? [],
      idToken: newTokens?.idToken ?? account.idToken ?? void 0
    };
    return ctx.json(tokens);
  } catch (error2) {
    throw new APIError("BAD_REQUEST", {
      message: "Failed to get a valid access token",
      cause: error2
    });
  }
});
const refreshToken = createAuthEndpoint("/refresh-token", {
  method: "POST",
  body: object({
    providerId: string().meta({ description: "The provider ID for the OAuth provider" }),
    accountId: string().meta({ description: "The account ID associated with the refresh token" }).optional(),
    userId: string().meta({ description: "The user ID associated with the account" }).optional()
  }),
  metadata: { openapi: {
    description: "Refresh the access token using a refresh token",
    responses: {
      200: {
        description: "Access token refreshed successfully",
        content: { "application/json": { schema: {
          type: "object",
          properties: {
            tokenType: { type: "string" },
            idToken: { type: "string" },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
            accessTokenExpiresAt: {
              type: "string",
              format: "date-time"
            },
            refreshTokenExpiresAt: {
              type: "string",
              format: "date-time"
            }
          }
        } } }
      },
      400: { description: "Invalid refresh token or provider configuration" }
    }
  } }
}, async (ctx) => {
  const { providerId, accountId, userId } = ctx.body;
  const req = ctx.request;
  const session = await getSessionFromCtx(ctx);
  if (req && !session) throw ctx.error("UNAUTHORIZED");
  let resolvedUserId = session?.user?.id || userId;
  if (!resolvedUserId) throw new APIError("BAD_REQUEST", { message: `Either userId or session is required` });
  const provider = ctx.context.socialProviders.find((p) => p.id === providerId);
  if (!provider) throw new APIError("BAD_REQUEST", { message: `Provider ${providerId} not found.` });
  if (!provider.refreshAccessToken) throw new APIError("BAD_REQUEST", { message: `Provider ${providerId} does not support token refreshing.` });
  let account = void 0;
  const accountData = await getAccountCookie(ctx);
  if (accountData && (!providerId || providerId === accountData?.providerId)) account = accountData;
  else account = (await ctx.context.internalAdapter.findAccounts(resolvedUserId)).find((acc) => accountId ? acc.id === accountId && acc.providerId === providerId : acc.providerId === providerId);
  if (!account) throw new APIError("BAD_REQUEST", { message: "Account not found" });
  let refreshToken$1 = void 0;
  if (accountData && providerId === accountData.providerId) refreshToken$1 = accountData.refreshToken ?? void 0;
  else refreshToken$1 = account.refreshToken ?? void 0;
  if (!refreshToken$1) throw new APIError("BAD_REQUEST", { message: "Refresh token not found" });
  try {
    const decryptedRefreshToken = await decryptOAuthToken(refreshToken$1, ctx.context);
    const tokens = await provider.refreshAccessToken(decryptedRefreshToken);
    if (account.id) {
      const updateData = {
        ...account || {},
        accessToken: await setTokenUtil(tokens.accessToken, ctx.context),
        refreshToken: await setTokenUtil(tokens.refreshToken, ctx.context),
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        scope: tokens.scopes?.join(",") || account.scope,
        idToken: tokens.idToken || account.idToken
      };
      await ctx.context.internalAdapter.updateAccount(account.id, updateData);
    }
    if (accountData && providerId === accountData.providerId && ctx.context.options.account?.storeAccountCookie) await setAccountCookie(ctx, {
      ...accountData,
      accessToken: await setTokenUtil(tokens.accessToken, ctx.context),
      refreshToken: await setTokenUtil(tokens.refreshToken, ctx.context),
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      scope: tokens.scopes?.join(",") || accountData.scope,
      idToken: tokens.idToken || accountData.idToken
    });
    return ctx.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      scope: tokens.scopes?.join(",") || account.scope,
      idToken: tokens.idToken || account.idToken,
      providerId: account.providerId,
      accountId: account.accountId
    });
  } catch (error2) {
    throw new APIError("BAD_REQUEST", {
      message: "Failed to refresh access token",
      cause: error2
    });
  }
});
const accountInfoQuerySchema = optional(object({ accountId: string().meta({ description: "The provider given account id for which to get the account info" }).optional() }));
const accountInfo = createAuthEndpoint("/account-info", {
  method: "GET",
  use: [sessionMiddleware],
  metadata: { openapi: {
    description: "Get the account info provided by the provider",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              image: { type: "string" },
              emailVerified: { type: "boolean" }
            },
            required: ["id", "emailVerified"]
          },
          data: {
            type: "object",
            properties: {},
            additionalProperties: true
          }
        },
        required: ["user", "data"],
        additionalProperties: false
      } } }
    } }
  } },
  query: accountInfoQuerySchema
}, async (ctx) => {
  const providedAccountId = ctx.query?.accountId;
  let account = void 0;
  if (!providedAccountId) {
    if (ctx.context.options.account?.storeAccountCookie) {
      const accountData = await getAccountCookie(ctx);
      if (accountData) account = accountData;
    }
  } else {
    const accountData = await ctx.context.internalAdapter.findAccount(providedAccountId);
    if (accountData) account = accountData;
  }
  if (!account || account.userId !== ctx.context.session.user.id) throw new APIError("BAD_REQUEST", { message: "Account not found" });
  const provider = ctx.context.socialProviders.find((p) => p.id === account.providerId);
  if (!provider) throw new APIError("INTERNAL_SERVER_ERROR", { message: `Provider account provider is ${account.providerId} but it is not configured` });
  const tokens = await getAccessToken({
    ...ctx,
    method: "POST",
    body: {
      accountId: account.id,
      providerId: account.providerId
    },
    returnHeaders: false,
    returnStatus: false
  });
  if (!tokens.accessToken) throw new APIError("BAD_REQUEST", { message: "Access token not found" });
  const info2 = await provider.getUserInfo({
    ...tokens,
    accessToken: tokens.accessToken
  });
  return ctx.json(info2);
});
async function createEmailVerificationToken(secret, email2, updateTo, expiresIn = 3600, extraPayload) {
  return await signJWT({
    email: email2.toLowerCase(),
    updateTo,
    ...extraPayload
  }, secret, expiresIn);
}
async function sendVerificationEmailFn(ctx, user) {
  if (!ctx.context.options.emailVerification?.sendVerificationEmail) {
    ctx.context.logger.error("Verification email isn't enabled.");
    throw new APIError("BAD_REQUEST", { message: "Verification email isn't enabled" });
  }
  const token = await createEmailVerificationToken(ctx.context.secret, user.email, void 0, ctx.context.options.emailVerification?.expiresIn);
  const callbackURL = ctx.body.callbackURL ? encodeURIComponent(ctx.body.callbackURL) : encodeURIComponent("/");
  const url = `${ctx.context.baseURL}/verify-email?token=${token}&callbackURL=${callbackURL}`;
  await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailVerification.sendVerificationEmail({
    user,
    url,
    token
  }, ctx.request));
}
const sendVerificationEmail = createAuthEndpoint("/send-verification-email", {
  method: "POST",
  operationId: "sendVerificationEmail",
  body: object({
    email: email().meta({ description: "The email to send the verification email to" }),
    callbackURL: string().meta({ description: "The URL to use for email verification callback" }).optional()
  }),
  metadata: { openapi: {
    operationId: "sendVerificationEmail",
    description: "Send a verification email to the user",
    requestBody: { content: { "application/json": { schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "The email to send the verification email to",
          example: "user@example.com"
        },
        callbackURL: {
          type: "string",
          description: "The URL to use for email verification callback",
          example: "https://example.com/callback",
          nullable: true
        }
      },
      required: ["email"]
    } } } },
    responses: {
      "200": {
        description: "Success",
        content: { "application/json": { schema: {
          type: "object",
          properties: { status: {
            type: "boolean",
            description: "Indicates if the email was sent successfully",
            example: true
          } }
        } } }
      },
      "400": {
        description: "Bad Request",
        content: { "application/json": { schema: {
          type: "object",
          properties: { message: {
            type: "string",
            description: "Error message",
            example: "Verification email isn't enabled"
          } }
        } } }
      }
    }
  } }
}, async (ctx) => {
  if (!ctx.context.options.emailVerification?.sendVerificationEmail) {
    ctx.context.logger.error("Verification email isn't enabled.");
    throw new APIError("BAD_REQUEST", { message: "Verification email isn't enabled" });
  }
  const { email: email2 } = ctx.body;
  const session = await getSessionFromCtx(ctx);
  if (!session) {
    const user = await ctx.context.internalAdapter.findUserByEmail(email2);
    if (!user) {
      await createEmailVerificationToken(ctx.context.secret, email2, void 0, ctx.context.options.emailVerification?.expiresIn);
      return ctx.json({ status: true });
    }
    await sendVerificationEmailFn(ctx, user.user);
    return ctx.json({ status: true });
  }
  if (session?.user.email !== email2) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.EMAIL_MISMATCH });
  if (session?.user.emailVerified) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.EMAIL_ALREADY_VERIFIED });
  await sendVerificationEmailFn(ctx, session.user);
  return ctx.json({ status: true });
});
const verifyEmail = createAuthEndpoint("/verify-email", {
  method: "GET",
  operationId: "verifyEmail",
  query: object({
    token: string().meta({ description: "The token to verify the email" }),
    callbackURL: string().meta({ description: "The URL to redirect to after email verification" }).optional()
  }),
  use: [originCheck((ctx) => ctx.query.callbackURL)],
  metadata: { openapi: {
    description: "Verify the email of the user",
    parameters: [{
      name: "token",
      in: "query",
      description: "The token to verify the email",
      required: true,
      schema: { type: "string" }
    }, {
      name: "callbackURL",
      in: "query",
      description: "The URL to redirect to after email verification",
      required: false,
      schema: { type: "string" }
    }],
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: {
          user: {
            type: "object",
            $ref: "#/components/schemas/User"
          },
          status: {
            type: "boolean",
            description: "Indicates if the email was verified successfully"
          }
        },
        required: ["user", "status"]
      } } }
    } }
  } }
}, async (ctx) => {
  function redirectOnError(error2) {
    if (ctx.query.callbackURL) {
      if (ctx.query.callbackURL.includes("?")) throw ctx.redirect(`${ctx.query.callbackURL}&error=${error2}`);
      throw ctx.redirect(`${ctx.query.callbackURL}?error=${error2}`);
    }
    throw new APIError("UNAUTHORIZED", { message: error2 });
  }
  const { token } = ctx.query;
  let jwt;
  try {
    jwt = await jwtVerify(token, new TextEncoder().encode(ctx.context.secret), { algorithms: ["HS256"] });
  } catch (e) {
    if (e instanceof JWTExpired) return redirectOnError("token_expired");
    return redirectOnError("invalid_token");
  }
  const parsed = object({
    email: email(),
    updateTo: string().optional(),
    requestType: string().optional()
  }).parse(jwt.payload);
  const user = await ctx.context.internalAdapter.findUserByEmail(parsed.email);
  if (!user) return redirectOnError("user_not_found");
  if (parsed.updateTo) {
    let session = await getSessionFromCtx(ctx);
    if (session && session.user.email !== parsed.email) return redirectOnError("unauthorized");
    if (parsed.requestType === "change-email-confirmation") {
      const newToken$1 = await createEmailVerificationToken(ctx.context.secret, parsed.email, parsed.updateTo, ctx.context.options.emailVerification?.expiresIn, { requestType: "change-email-verification" });
      const updateCallbackURL$1 = ctx.query.callbackURL ? encodeURIComponent(ctx.query.callbackURL) : encodeURIComponent("/");
      const url = `${ctx.context.baseURL}/verify-email?token=${newToken$1}&callbackURL=${updateCallbackURL$1}`;
      if (ctx.context.options.emailVerification?.sendVerificationEmail) await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailVerification.sendVerificationEmail({
        user: {
          ...user.user,
          email: parsed.updateTo
        },
        url,
        token: newToken$1
      }, ctx.request));
      if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL);
      return ctx.json({ status: true });
    }
    if (!session) {
      const newSession = await ctx.context.internalAdapter.createSession(user.user.id);
      if (!newSession) throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to create session" });
      session = {
        session: newSession,
        user: user.user
      };
    }
    if (parsed.requestType === "change-email-verification") {
      if (ctx.context.options.emailVerification?.onEmailVerification) await ctx.context.options.emailVerification.onEmailVerification(user.user, ctx.request);
      const updatedUser$2 = await ctx.context.internalAdapter.updateUserByEmail(parsed.email, {
        email: parsed.updateTo,
        emailVerified: true
      });
      if (ctx.context.options.emailVerification?.afterEmailVerification) await ctx.context.options.emailVerification.afterEmailVerification(updatedUser$2, ctx.request);
      await setSessionCookie(ctx, {
        session: session.session,
        user: {
          ...session.user,
          email: parsed.updateTo,
          emailVerified: true
        }
      });
      if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL);
      return ctx.json({
        status: true,
        user: updatedUser$2
      });
    }
    const updatedUser$1 = await ctx.context.internalAdapter.updateUserByEmail(parsed.email, {
      email: parsed.updateTo,
      emailVerified: false
    });
    const newToken = await createEmailVerificationToken(ctx.context.secret, parsed.updateTo);
    const updateCallbackURL = ctx.query.callbackURL ? encodeURIComponent(ctx.query.callbackURL) : encodeURIComponent("/");
    if (ctx.context.options.emailVerification?.sendVerificationEmail) await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailVerification.sendVerificationEmail({
      user: updatedUser$1,
      url: `${ctx.context.baseURL}/verify-email?token=${newToken}&callbackURL=${updateCallbackURL}`,
      token: newToken
    }, ctx.request));
    await setSessionCookie(ctx, {
      session: session.session,
      user: {
        ...session.user,
        email: parsed.updateTo,
        emailVerified: false
      }
    });
    if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL);
    return ctx.json({
      status: true,
      user: {
        id: updatedUser$1.id,
        email: updatedUser$1.email,
        name: updatedUser$1.name,
        image: updatedUser$1.image,
        emailVerified: updatedUser$1.emailVerified,
        createdAt: updatedUser$1.createdAt,
        updatedAt: updatedUser$1.updatedAt
      }
    });
  }
  if (user.user.emailVerified) {
    if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL);
    return ctx.json({
      status: true,
      user: null
    });
  }
  if (ctx.context.options.emailVerification?.beforeEmailVerification) await ctx.context.options.emailVerification.beforeEmailVerification(user.user, ctx.request);
  if (ctx.context.options.emailVerification?.onEmailVerification) await ctx.context.options.emailVerification.onEmailVerification(user.user, ctx.request);
  const updatedUser = await ctx.context.internalAdapter.updateUserByEmail(parsed.email, { emailVerified: true });
  if (ctx.context.options.emailVerification?.afterEmailVerification) await ctx.context.options.emailVerification.afterEmailVerification(updatedUser, ctx.request);
  if (ctx.context.options.emailVerification?.autoSignInAfterVerification) {
    const currentSession = await getSessionFromCtx(ctx);
    if (!currentSession || currentSession.user.email !== parsed.email) {
      const session = await ctx.context.internalAdapter.createSession(user.user.id);
      if (!session) throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to create session" });
      await setSessionCookie(ctx, {
        session,
        user: {
          ...user.user,
          emailVerified: true
        }
      });
    } else await setSessionCookie(ctx, {
      session: currentSession.session,
      user: {
        ...currentSession.user,
        emailVerified: true
      }
    });
  }
  if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL);
  return ctx.json({
    status: true,
    user: null
  });
});
async function handleOAuthUserInfo(c, opts) {
  const { userInfo, account, callbackURL, disableSignUp, overrideUserInfo } = opts;
  const dbUser = await c.context.internalAdapter.findOAuthUser(userInfo.email.toLowerCase(), account.accountId, account.providerId).catch((e) => {
    logger.error("Better auth was unable to query your database.\nError: ", e);
    const errorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
    throw c.redirect(`${errorURL}?error=internal_server_error`);
  });
  let user = dbUser?.user;
  let isRegister = !user;
  if (dbUser) {
    const hasBeenLinked = dbUser.accounts.find((a) => a.providerId === account.providerId && a.accountId === account.accountId);
    if (!hasBeenLinked) {
      const trustedProviders = c.context.options.account?.accountLinking?.trustedProviders;
      if (!(opts.isTrustedProvider || trustedProviders?.includes(account.providerId)) && !userInfo.emailVerified || c.context.options.account?.accountLinking?.enabled === false) {
        if (isDevelopment()) logger.warn(`User already exist but account isn't linked to ${account.providerId}. To read more about how account linking works in Better Auth see https://www.better-auth.com/docs/concepts/users-accounts#account-linking.`);
        return {
          error: "account not linked",
          data: null
        };
      }
      try {
        await c.context.internalAdapter.linkAccount({
          providerId: account.providerId,
          accountId: userInfo.id.toString(),
          userId: dbUser.user.id,
          accessToken: await setTokenUtil(account.accessToken, c.context),
          refreshToken: await setTokenUtil(account.refreshToken, c.context),
          idToken: account.idToken,
          accessTokenExpiresAt: account.accessTokenExpiresAt,
          refreshTokenExpiresAt: account.refreshTokenExpiresAt,
          scope: account.scope
        });
      } catch (e) {
        logger.error("Unable to link account", e);
        return {
          error: "unable to link account",
          data: null
        };
      }
      if (userInfo.emailVerified && !dbUser.user.emailVerified && userInfo.email.toLowerCase() === dbUser.user.email) await c.context.internalAdapter.updateUser(dbUser.user.id, { emailVerified: true });
    } else {
      if (c.context.options.account?.updateAccountOnSignIn !== false) {
        const updateData = Object.fromEntries(Object.entries({
          idToken: account.idToken,
          accessToken: await setTokenUtil(account.accessToken, c.context),
          refreshToken: await setTokenUtil(account.refreshToken, c.context),
          accessTokenExpiresAt: account.accessTokenExpiresAt,
          refreshTokenExpiresAt: account.refreshTokenExpiresAt,
          scope: account.scope
        }).filter(([_, value]) => value !== void 0));
        if (c.context.options.account?.storeAccountCookie) await setAccountCookie(c, {
          ...account,
          ...updateData
        });
        if (Object.keys(updateData).length > 0) await c.context.internalAdapter.updateAccount(hasBeenLinked.id, updateData);
      }
      if (userInfo.emailVerified && !dbUser.user.emailVerified && userInfo.email.toLowerCase() === dbUser.user.email) await c.context.internalAdapter.updateUser(dbUser.user.id, { emailVerified: true });
    }
    if (overrideUserInfo) {
      const { id: _, ...restUserInfo } = userInfo;
      user = await c.context.internalAdapter.updateUser(dbUser.user.id, {
        ...restUserInfo,
        email: userInfo.email.toLowerCase(),
        emailVerified: userInfo.email.toLowerCase() === dbUser.user.email ? dbUser.user.emailVerified || userInfo.emailVerified : userInfo.emailVerified
      });
    }
  } else {
    if (disableSignUp) return {
      error: "signup disabled",
      data: null,
      isRegister: false
    };
    try {
      const { id: _, ...restUserInfo } = userInfo;
      const accountData = {
        accessToken: await setTokenUtil(account.accessToken, c.context),
        refreshToken: await setTokenUtil(account.refreshToken, c.context),
        idToken: account.idToken,
        accessTokenExpiresAt: account.accessTokenExpiresAt,
        refreshTokenExpiresAt: account.refreshTokenExpiresAt,
        scope: account.scope,
        providerId: account.providerId,
        accountId: userInfo.id.toString()
      };
      const { user: createdUser, account: createdAccount } = await c.context.internalAdapter.createOAuthUser({
        ...restUserInfo,
        email: userInfo.email.toLowerCase()
      }, accountData);
      user = createdUser;
      if (c.context.options.account?.storeAccountCookie) await setAccountCookie(c, createdAccount);
      if (!userInfo.emailVerified && user && c.context.options.emailVerification?.sendOnSignUp && c.context.options.emailVerification?.sendVerificationEmail) {
        const token = await createEmailVerificationToken(c.context.secret, user.email, void 0, c.context.options.emailVerification?.expiresIn);
        const url = `${c.context.baseURL}/verify-email?token=${token}&callbackURL=${callbackURL}`;
        await c.context.runInBackgroundOrAwait(c.context.options.emailVerification.sendVerificationEmail({
          user,
          url,
          token
        }, c.request));
      }
    } catch (e) {
      logger.error(e);
      if (e instanceof APIError) return {
        error: e.message,
        data: null,
        isRegister: false
      };
      return {
        error: "unable to create user",
        data: null,
        isRegister: false
      };
    }
  }
  if (!user) return {
    error: "unable to create user",
    data: null,
    isRegister: false
  };
  const session = await c.context.internalAdapter.createSession(user.id);
  if (!session) return {
    error: "unable to create session",
    data: null,
    isRegister: false
  };
  return {
    data: {
      session,
      user
    },
    error: null,
    isRegister
  };
}
const schema$1 = object({
  code: string().optional(),
  error: string().optional(),
  device_id: string().optional(),
  error_description: string().optional(),
  state: string().optional(),
  user: string().optional()
});
const callbackOAuth = createAuthEndpoint("/callback/:id", {
  method: ["GET", "POST"],
  operationId: "handleOAuthCallback",
  body: schema$1.optional(),
  query: schema$1.optional(),
  metadata: {
    ...HIDE_METADATA,
    allowedMediaTypes: ["application/x-www-form-urlencoded", "application/json"]
  }
}, async (c) => {
  let queryOrBody;
  const defaultErrorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
  if (c.method === "POST") {
    const postData = c.body ? schema$1.parse(c.body) : {};
    const queryData = c.query ? schema$1.parse(c.query) : {};
    const mergedData = schema$1.parse({
      ...postData,
      ...queryData
    });
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(mergedData)) if (value !== void 0 && value !== null) params.set(key, String(value));
    const redirectURL = `${c.context.baseURL}/callback/${c.params.id}?${params.toString()}`;
    throw c.redirect(redirectURL);
  }
  try {
    if (c.method === "GET") queryOrBody = schema$1.parse(c.query);
    else if (c.method === "POST") queryOrBody = schema$1.parse(c.body);
    else throw new Error("Unsupported method");
  } catch (e) {
    c.context.logger.error("INVALID_CALLBACK_REQUEST", e);
    throw c.redirect(`${defaultErrorURL}?error=invalid_callback_request`);
  }
  const { code, error: error2, state, error_description, device_id } = queryOrBody;
  if (!state) {
    c.context.logger.error("State not found", error2);
    const url = `${defaultErrorURL}${defaultErrorURL.includes("?") ? "&" : "?"}state=state_not_found`;
    throw c.redirect(url);
  }
  const { codeVerifier, callbackURL, link, errorURL, newUserURL, requestSignUp } = await parseState(c);
  function redirectOnError(error$1, description) {
    const baseURL = errorURL ?? defaultErrorURL;
    const params = new URLSearchParams({ error: error$1 });
    if (description) params.set("error_description", description);
    const url = `${baseURL}${baseURL.includes("?") ? "&" : "?"}${params.toString()}`;
    throw c.redirect(url);
  }
  if (error2) redirectOnError(error2, error_description);
  if (!code) {
    c.context.logger.error("Code not found");
    throw redirectOnError("no_code");
  }
  const provider = c.context.socialProviders.find((p) => p.id === c.params.id);
  if (!provider) {
    c.context.logger.error("Oauth provider with id", c.params.id, "not found");
    throw redirectOnError("oauth_provider_not_found");
  }
  let tokens;
  try {
    tokens = await provider.validateAuthorizationCode({
      code,
      codeVerifier,
      deviceId: device_id,
      redirectURI: `${c.context.baseURL}/callback/${provider.id}`
    });
  } catch (e) {
    c.context.logger.error("", e);
    throw redirectOnError("invalid_code");
  }
  const userInfo = await provider.getUserInfo({
    ...tokens,
    user: c.body?.user ? safeJSONParse(c.body.user) : void 0
  }).then((res) => res?.user);
  if (!userInfo) {
    c.context.logger.error("Unable to get user info");
    return redirectOnError("unable_to_get_user_info");
  }
  if (!callbackURL) {
    c.context.logger.error("No callback URL found");
    throw redirectOnError("no_callback_url");
  }
  if (link) {
    if (!c.context.options.account?.accountLinking?.trustedProviders?.includes(provider.id) && !userInfo.emailVerified || c.context.options.account?.accountLinking?.enabled === false) {
      c.context.logger.error("Unable to link account - untrusted provider");
      return redirectOnError("unable_to_link_account");
    }
    if (userInfo.email !== link.email && c.context.options.account?.accountLinking?.allowDifferentEmails !== true) return redirectOnError("email_doesn't_match");
    const existingAccount = await c.context.internalAdapter.findAccount(String(userInfo.id));
    if (existingAccount) {
      if (existingAccount.userId.toString() !== link.userId.toString()) return redirectOnError("account_already_linked_to_different_user");
      const updateData = Object.fromEntries(Object.entries({
        accessToken: await setTokenUtil(tokens.accessToken, c.context),
        refreshToken: await setTokenUtil(tokens.refreshToken, c.context),
        idToken: tokens.idToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        scope: tokens.scopes?.join(",")
      }).filter(([_, value]) => value !== void 0));
      await c.context.internalAdapter.updateAccount(existingAccount.id, updateData);
    } else if (!await c.context.internalAdapter.createAccount({
      userId: link.userId,
      providerId: provider.id,
      accountId: String(userInfo.id),
      ...tokens,
      accessToken: await setTokenUtil(tokens.accessToken, c.context),
      refreshToken: await setTokenUtil(tokens.refreshToken, c.context),
      scope: tokens.scopes?.join(",")
    })) return redirectOnError("unable_to_link_account");
    let toRedirectTo$1;
    try {
      toRedirectTo$1 = callbackURL.toString();
    } catch {
      toRedirectTo$1 = callbackURL;
    }
    throw c.redirect(toRedirectTo$1);
  }
  if (!userInfo.email) {
    c.context.logger.error("Provider did not return email. This could be due to misconfiguration in the provider settings.");
    return redirectOnError("email_not_found");
  }
  const accountData = {
    providerId: provider.id,
    accountId: String(userInfo.id),
    ...tokens,
    scope: tokens.scopes?.join(",")
  };
  const result = await handleOAuthUserInfo(c, {
    userInfo: {
      ...userInfo,
      id: String(userInfo.id),
      email: userInfo.email,
      name: userInfo.name || userInfo.email
    },
    account: accountData,
    callbackURL,
    disableSignUp: provider.disableImplicitSignUp && !requestSignUp || provider.options?.disableSignUp,
    overrideUserInfo: provider.options?.overrideUserInfoOnSignIn
  });
  if (result.error) {
    c.context.logger.error(result.error.split(" ").join("_"));
    return redirectOnError(result.error.split(" ").join("_"));
  }
  const { session, user } = result.data;
  await setSessionCookie(c, {
    session,
    user
  });
  let toRedirectTo;
  try {
    toRedirectTo = (result.isRegister ? newUserURL || callbackURL : callbackURL).toString();
  } catch {
    toRedirectTo = result.isRegister ? newUserURL || callbackURL : callbackURL;
  }
  throw c.redirect(toRedirectTo);
});
function sanitize(input) {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/&(?!amp;|lt;|gt;|quot;|#39;|#x[0-9a-fA-F]+;|#[0-9]+;)/g, "&amp;");
}
const html = (options, code = "Unknown", description = null) => {
  const custom = options.onAPIError?.customizeDefaultErrorPage;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Error</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: ${custom?.font?.defaultFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"};
        background: ${custom?.colors?.background || "var(--background)"};
        color: var(--foreground);
        margin: 0;
      }
      :root,
      :host {
        --spacing: 0.25rem;
        --container-md: 28rem;
        --text-sm: ${custom?.size?.textSm || "0.875rem"};
        --text-sm--line-height: calc(1.25 / 0.875);
        --text-2xl: ${custom?.size?.text2xl || "1.5rem"};
        --text-2xl--line-height: calc(2 / 1.5);
        --text-4xl: ${custom?.size?.text4xl || "2.25rem"};
        --text-4xl--line-height: calc(2.5 / 2.25);
        --text-6xl: ${custom?.size?.text6xl || "3rem"};
        --text-6xl--line-height: 1;
        --font-weight-medium: 500;
        --font-weight-semibold: 600;
        --font-weight-bold: 700;
        --default-transition-duration: 150ms;
        --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        --radius: ${custom?.size?.radiusSm || "0.625rem"};
        --default-mono-font-family: ${custom?.font?.monoFamily || "var(--font-geist-mono)"};
        --primary: ${custom?.colors?.primary || "black"};
        --primary-foreground: ${custom?.colors?.primaryForeground || "white"};
        --background: ${custom?.colors?.background || "white"};
        --foreground: ${custom?.colors?.foreground || "oklch(0.271 0 0)"};
        --border: ${custom?.colors?.border || "oklch(0.89 0 0)"};
        --destructive: ${custom?.colors?.destructive || "oklch(0.55 0.15 25.723)"};
        --muted-foreground: ${custom?.colors?.mutedForeground || "oklch(0.545 0 0)"};
        --corner-border: ${custom?.colors?.cornerBorder || "#404040"};
      }

      button, .btn {
        cursor: pointer;
        background: none;
        border: none;
        color: inherit;
        font: inherit;
        transition: all var(--default-transition-duration)
          var(--default-transition-timing-function);
      }
      button:hover, .btn:hover {
        opacity: 0.8;
      }

      @media (prefers-color-scheme: dark) {
        :root,
        :host {
          --primary: ${custom?.colors?.primary || "white"};
          --primary-foreground: ${custom?.colors?.primaryForeground || "black"};
          --background: ${custom?.colors?.background || "oklch(0.15 0 0)"};
          --foreground: ${custom?.colors?.foreground || "oklch(0.98 0 0)"};
          --border: ${custom?.colors?.border || "oklch(0.27 0 0)"};
          --destructive: ${custom?.colors?.destructive || "oklch(0.65 0.15 25.723)"};
          --muted-foreground: ${custom?.colors?.mutedForeground || "oklch(0.65 0 0)"};
          --corner-border: ${custom?.colors?.cornerBorder || "#a0a0a0"};
        }
      }
      @media (max-width: 640px) {
        :root, :host {
          --text-6xl: 2.5rem;
          --text-2xl: 1.25rem;
          --text-sm: 0.8125rem;
        }
      }
      @media (max-width: 480px) {
        :root, :host {
          --text-6xl: 2rem;
          --text-2xl: 1.125rem;
        }
      }
    </style>
  </head>
  <body style="width: 100vw; min-height: 100vh; overflow-x: hidden; overflow-y: auto;">
    <div
        style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            position: relative;
            width: 100%;
            min-height: 100vh;
            padding: 1rem;
        "
        >
${custom?.disableBackgroundGrid ? "" : `
      <div
        style="
          position: absolute;
          inset: 0;
          background-image: linear-gradient(to right, ${custom?.colors?.gridColor || "var(--border)"} 1px, transparent 1px),
            linear-gradient(to bottom, ${custom?.colors?.gridColor || "var(--border)"} 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.6;
          pointer-events: none;
          width: 100vw;
          height: 100vh;
        "
      ></div>
      <div
        style="
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${custom?.colors?.background || "var(--background)"};
          mask-image: radial-gradient(ellipse at center, transparent 20%, black);
          -webkit-mask-image: radial-gradient(ellipse at center, transparent 20%, black);
          pointer-events: none;
        "
      ></div>
`}

<div
  style="
    position: relative;
    z-index: 10;
    border: 2px solid var(--border);
    background: ${custom?.colors?.cardBackground || "var(--background)"};
    padding: 1.5rem;
    max-width: 42rem;
    width: 100%;
  "
>
    ${custom?.disableCornerDecorations ? "" : `
        <!-- Corner decorations -->
        <div
          style="
            position: absolute;
            top: -2px;
            left: -2px;
            width: 2rem;
            height: 2rem;
            border-top: 4px solid var(--corner-border);
            border-left: 4px solid var(--corner-border);
          "
        ></div>
        <div
          style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 2rem;
            height: 2rem;
            border-top: 4px solid var(--corner-border);
            border-right: 4px solid var(--corner-border);
          "
        ></div>
  
        <div
          style="
            position: absolute;
            bottom: -2px;
            left: -2px;
            width: 2rem;
            height: 2rem;
            border-bottom: 4px solid var(--corner-border);
            border-left: 4px solid var(--corner-border);
          "
        ></div>
        <div
          style="
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 2rem;
            height: 2rem;
            border-bottom: 4px solid var(--corner-border);
            border-right: 4px solid var(--corner-border);
          "
        ></div>`}

        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="margin-bottom: 1.5rem;">
            <div
              style="
                display: inline-block;
                border: 2px solid ${custom?.disableTitleBorder ? "transparent" : custom?.colors?.titleBorder || "var(--destructive)"};
                padding: 0.375rem 1rem;
              "
            >
              <h1
                style="
                  font-size: var(--text-6xl);
                  font-weight: var(--font-weight-semibold);
                  color: ${custom?.colors?.titleColor || "var(--foreground)"};
                  letter-spacing: -0.02em;
                  margin: 0;
                "
              >
                ERROR
              </h1>
            </div>
            <div
              style="
                height: 2px;
                background-color: var(--border);
                width: calc(100% + 3rem);
                margin-left: -1.5rem;
                margin-top: 1.5rem;
              "
            ></div>
          </div>

          <h2
            style="
              font-size: var(--text-2xl);
              font-weight: var(--font-weight-semibold);
              color: var(--foreground);
              margin: 0 0 1rem;
            "
          >
            Something went wrong
          </h2>

          <div
            style="
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                border: 2px solid var(--border);
                background-color: var(--muted);
                padding: 0.375rem 0.75rem;
                margin: 0 0 1rem;
                flex-wrap: wrap;
                justify-content: center;
            "
            >
            <span
                style="
                font-size: 0.75rem;
                color: var(--muted-foreground);
                font-weight: var(--font-weight-semibold);
                "
            >
                CODE:
            </span>
            <span
                style="
                font-size: var(--text-sm);
                font-family: var(--default-mono-font-family, monospace);
                color: var(--foreground);
                word-break: break-all;
                "
            >
                ${sanitize(code)}
            </span>
            </div>

          <p
            style="
              color: var(--muted-foreground);
              max-width: 28rem;
              margin: 0 auto;
              font-size: var(--text-sm);
              line-height: 1.5;
              text-wrap: pretty;
            "
          >
            ${!description ? `We encountered an unexpected error. Please try again or return to the home page. If you're a developer, you can find more information about the error <a href='https://better-auth.com/docs/errors/${encodeURIComponent(code)}' target='_blank' rel="noopener noreferrer" style='color: var(--foreground); text-decoration: underline;'>here</a>.` : description}
          </p>
        </div>

        <div
          style="
            display: flex;
            gap: 0.75rem;
            margin-top: 1.5rem;
            justify-content: center;
            flex-wrap: wrap;
          "
        >
          <a
            href="/"
            style="
              text-decoration: none;
            "
          >
            <div
              style="
                border: 2px solid var(--border);
                background: var(--primary);
                color: var(--primary-foreground);
                padding: 0.5rem 1rem;
                border-radius: 0;
                white-space: nowrap;
              "
              class="btn"
            >
              Go Home
            </div>
          </a>
          <a
            href="https://better-auth.com/docs/errors/${encodeURIComponent(code)}?askai=${encodeURIComponent(`What does the error code ${code} mean?`)}"
            target="_blank"
            rel="noopener noreferrer"
            style="
              text-decoration: none;
            "
          >
            <div
              style="
                border: 2px solid var(--border);
                background: transparent;
                color: var(--foreground);
                padding: 0.5rem 1rem;
                border-radius: 0;
                white-space: nowrap;
              "
              class="btn"
            >
              Ask AI
            </div>
          </a>
        </div>
      </div>
    </div>
  </body>
</html>`;
};
const error = createAuthEndpoint("/error", {
  method: "GET",
  metadata: {
    ...HIDE_METADATA,
    openapi: {
      description: "Displays an error page",
      responses: { "200": {
        description: "Success",
        content: { "text/html": { schema: {
          type: "string",
          description: "The HTML content of the error page"
        } } }
      } }
    }
  }
}, async (c) => {
  const url = new URL(c.request?.url || "");
  const unsanitizedCode = url.searchParams.get("error") || "UNKNOWN";
  const unsanitizedDescription = url.searchParams.get("error_description") || null;
  const safeCode = /^[\'A-Za-z0-9_-]+$/.test(unsanitizedCode) ? unsanitizedCode : "UNKNOWN";
  const safeDescription = unsanitizedDescription ? sanitize(unsanitizedDescription) : null;
  const queryParams = new URLSearchParams();
  queryParams.set("error", safeCode);
  if (unsanitizedDescription) queryParams.set("error_description", unsanitizedDescription);
  const options = c.context.options;
  const errorURL = options.onAPIError?.errorURL;
  if (errorURL) return new Response(null, {
    status: 302,
    headers: { Location: `${errorURL}${errorURL.includes("?") ? "&" : "?"}${queryParams.toString()}` }
  });
  if (isProduction && !options.onAPIError?.customizeDefaultErrorPage) return new Response(null, {
    status: 302,
    headers: { Location: `/?${queryParams.toString()}` }
  });
  return new Response(html(c.context.options, safeCode, safeDescription), { headers: { "Content-Type": "text/html" } });
});
const ok = createAuthEndpoint("/ok", {
  method: "GET",
  metadata: {
    ...HIDE_METADATA,
    openapi: {
      description: "Check if the API is working",
      responses: { "200": {
        description: "API is working",
        content: { "application/json": { schema: {
          type: "object",
          properties: { ok: {
            type: "boolean",
            description: "Indicates if the API is working"
          } },
          required: ["ok"]
        } } }
      } }
    }
  }
}, async (ctx) => {
  return ctx.json({ ok: true });
});
async function validatePassword(ctx, data) {
  const credentialAccount = (await ctx.context.internalAdapter.findAccounts(data.userId))?.find((account) => account.providerId === "credential");
  const currentPassword = credentialAccount?.password;
  if (!credentialAccount || !currentPassword) return false;
  return await ctx.context.password.verify({
    hash: currentPassword,
    password: data.password
  });
}
async function checkPassword(userId, c) {
  const credentialAccount = (await c.context.internalAdapter.findAccounts(userId))?.find((account) => account.providerId === "credential");
  const currentPassword = credentialAccount?.password;
  if (!credentialAccount || !currentPassword || !c.body.password) throw new APIError("BAD_REQUEST", { message: "No password credential found" });
  if (!await c.context.password.verify({
    hash: currentPassword,
    password: c.body.password
  })) throw new APIError("BAD_REQUEST", { message: "Invalid password" });
  return true;
}
function redirectError(ctx, callbackURL, query) {
  const url = callbackURL ? new URL(callbackURL, ctx.baseURL) : new URL(`${ctx.baseURL}/error`);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.href;
}
function redirectCallback(ctx, callbackURL, query) {
  const url = new URL(callbackURL, ctx.baseURL);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.href;
}
const requestPasswordReset = createAuthEndpoint("/request-password-reset", {
  method: "POST",
  body: object({
    email: email().meta({ description: "The email address of the user to send a password reset email to" }),
    redirectTo: string().meta({ description: "The URL to redirect the user to reset their password. If the token isn't valid or expired, it'll be redirected with a query parameter `?error=INVALID_TOKEN`. If the token is valid, it'll be redirected with a query parameter `?token=VALID_TOKEN" }).optional()
  }),
  metadata: { openapi: {
    operationId: "requestPasswordReset",
    description: "Send a password reset email to the user",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: {
          status: { type: "boolean" },
          message: { type: "string" }
        }
      } } }
    } }
  } }
}, async (ctx) => {
  if (!ctx.context.options.emailAndPassword?.sendResetPassword) {
    ctx.context.logger.error("Reset password isn't enabled.Please pass an emailAndPassword.sendResetPassword function in your auth config!");
    throw new APIError("BAD_REQUEST", { message: "Reset password isn't enabled" });
  }
  const { email: email2, redirectTo } = ctx.body;
  const user = await ctx.context.internalAdapter.findUserByEmail(email2, { includeAccounts: true });
  if (!user) {
    generateId$1(24);
    await ctx.context.internalAdapter.findVerificationValue("dummy-verification-token");
    ctx.context.logger.error("Reset Password: User not found", { email: email2 });
    return ctx.json({
      status: true,
      message: "If this email exists in our system, check your email for the reset link"
    });
  }
  const expiresAt = getDate(ctx.context.options.emailAndPassword.resetPasswordTokenExpiresIn || 3600 * 1, "sec");
  const verificationToken = generateId$1(24);
  await ctx.context.internalAdapter.createVerificationValue({
    value: user.user.id,
    identifier: `reset-password:${verificationToken}`,
    expiresAt
  });
  const callbackURL = redirectTo ? encodeURIComponent(redirectTo) : "";
  const url = `${ctx.context.baseURL}/reset-password/${verificationToken}?callbackURL=${callbackURL}`;
  await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailAndPassword.sendResetPassword({
    user: user.user,
    url,
    token: verificationToken
  }, ctx.request));
  return ctx.json({
    status: true,
    message: "If this email exists in our system, check your email for the reset link"
  });
});
const requestPasswordResetCallback = createAuthEndpoint("/reset-password/:token", {
  method: "GET",
  operationId: "forgetPasswordCallback",
  query: object({ callbackURL: string().meta({ description: "The URL to redirect the user to reset their password" }) }),
  use: [originCheck((ctx) => ctx.query.callbackURL)],
  metadata: { openapi: {
    operationId: "resetPasswordCallback",
    description: "Redirects the user to the callback URL with the token",
    parameters: [{
      name: "token",
      in: "path",
      required: true,
      description: "The token to reset the password",
      schema: { type: "string" }
    }, {
      name: "callbackURL",
      in: "query",
      required: true,
      description: "The URL to redirect the user to reset their password",
      schema: { type: "string" }
    }],
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: { token: { type: "string" } }
      } } }
    } }
  } }
}, async (ctx) => {
  const { token } = ctx.params;
  const { callbackURL } = ctx.query;
  if (!token || !callbackURL) throw ctx.redirect(redirectError(ctx.context, callbackURL, { error: "INVALID_TOKEN" }));
  const verification = await ctx.context.internalAdapter.findVerificationValue(`reset-password:${token}`);
  if (!verification || verification.expiresAt < /* @__PURE__ */ new Date()) throw ctx.redirect(redirectError(ctx.context, callbackURL, { error: "INVALID_TOKEN" }));
  throw ctx.redirect(redirectCallback(ctx.context, callbackURL, { token }));
});
const resetPassword = createAuthEndpoint("/reset-password", {
  method: "POST",
  operationId: "resetPassword",
  query: object({ token: string().optional() }).optional(),
  body: object({
    newPassword: string().meta({ description: "The new password to set" }),
    token: string().meta({ description: "The token to reset the password" }).optional()
  }),
  metadata: { openapi: {
    operationId: "resetPassword",
    description: "Reset the password for a user",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: { status: { type: "boolean" } }
      } } }
    } }
  } }
}, async (ctx) => {
  const token = ctx.body.token || ctx.query?.token;
  if (!token) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.INVALID_TOKEN });
  const { newPassword } = ctx.body;
  const minLength = ctx.context.password?.config.minPasswordLength;
  const maxLength = ctx.context.password?.config.maxPasswordLength;
  if (newPassword.length < minLength) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.PASSWORD_TOO_SHORT });
  if (newPassword.length > maxLength) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.PASSWORD_TOO_LONG });
  const id = `reset-password:${token}`;
  const verification = await ctx.context.internalAdapter.findVerificationValue(id);
  if (!verification || verification.expiresAt < /* @__PURE__ */ new Date()) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.INVALID_TOKEN });
  const userId = verification.value;
  const hashedPassword = await ctx.context.password.hash(newPassword);
  if (!(await ctx.context.internalAdapter.findAccounts(userId)).find((ac) => ac.providerId === "credential")) await ctx.context.internalAdapter.createAccount({
    userId,
    providerId: "credential",
    password: hashedPassword,
    accountId: userId
  });
  else await ctx.context.internalAdapter.updatePassword(userId, hashedPassword);
  await ctx.context.internalAdapter.deleteVerificationValue(verification.id);
  if (ctx.context.options.emailAndPassword?.onPasswordReset) {
    const user = await ctx.context.internalAdapter.findUserById(userId);
    if (user) await ctx.context.options.emailAndPassword.onPasswordReset({ user }, ctx.request);
  }
  if (ctx.context.options.emailAndPassword?.revokeSessionsOnPasswordReset) await ctx.context.internalAdapter.deleteSessions(userId);
  return ctx.json({ status: true });
});
const verifyPassword = createAuthEndpoint("/verify-password", {
  method: "POST",
  body: object({ password: string().meta({ description: "The password to verify" }) }),
  metadata: {
    scope: "server",
    openapi: {
      operationId: "verifyPassword",
      description: "Verify the current user's password",
      responses: { "200": {
        description: "Success",
        content: { "application/json": { schema: {
          type: "object",
          properties: { status: { type: "boolean" } }
        } } }
      } }
    }
  },
  use: [sensitiveSessionMiddleware]
}, async (ctx) => {
  const { password } = ctx.body;
  const session = ctx.context.session;
  if (!await validatePassword(ctx, {
    password,
    userId: session.user.id
  })) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.INVALID_PASSWORD });
  return ctx.json({ status: true });
});
const socialSignInBodySchema = object({
  callbackURL: string().meta({ description: "Callback URL to redirect to after the user has signed in" }).optional(),
  newUserCallbackURL: string().optional(),
  errorCallbackURL: string().meta({ description: "Callback URL to redirect to if an error happens" }).optional(),
  provider: SocialProviderListEnum,
  disableRedirect: boolean().meta({ description: "Disable automatic redirection to the provider. Useful for handling the redirection yourself" }).optional(),
  idToken: optional(object({
    token: string().meta({ description: "ID token from the provider" }),
    nonce: string().meta({ description: "Nonce used to generate the token" }).optional(),
    accessToken: string().meta({ description: "Access token from the provider" }).optional(),
    refreshToken: string().meta({ description: "Refresh token from the provider" }).optional(),
    expiresAt: number().meta({ description: "Expiry date of the token" }).optional()
  })),
  scopes: array(string()).meta({ description: "Array of scopes to request from the provider. This will override the default scopes passed." }).optional(),
  requestSignUp: boolean().meta({ description: "Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider" }).optional(),
  loginHint: string().meta({ description: "The login hint to use for the authorization code request" }).optional(),
  additionalData: record(string(), any()).optional().meta({ description: "Additional data to be passed through the OAuth flow" })
});
const signInSocial = () => createAuthEndpoint("/sign-in/social", {
  method: "POST",
  operationId: "socialSignIn",
  body: socialSignInBodySchema,
  metadata: {
    $Infer: {
      body: {},
      returned: {}
    },
    openapi: {
      description: "Sign in with a social provider",
      operationId: "socialSignIn",
      responses: { "200": {
        description: "Success - Returns either session details or redirect URL",
        content: { "application/json": { schema: {
          type: "object",
          description: "Session response when idToken is provided",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              $ref: "#/components/schemas/User"
            },
            url: { type: "string" },
            redirect: {
              type: "boolean",
              enum: [false]
            }
          },
          required: [
            "redirect",
            "token",
            "user"
          ]
        } } }
      } }
    }
  }
}, async (c) => {
  const provider = c.context.socialProviders.find((p) => p.id === c.body.provider);
  if (!provider) {
    c.context.logger.error("Provider not found. Make sure to add the provider in your auth config", { provider: c.body.provider });
    throw new APIError("NOT_FOUND", { message: BASE_ERROR_CODES.PROVIDER_NOT_FOUND });
  }
  if (c.body.idToken) {
    if (!provider.verifyIdToken) {
      c.context.logger.error("Provider does not support id token verification", { provider: c.body.provider });
      throw new APIError("NOT_FOUND", { message: BASE_ERROR_CODES.ID_TOKEN_NOT_SUPPORTED });
    }
    const { token, nonce } = c.body.idToken;
    if (!await provider.verifyIdToken(token, nonce)) {
      c.context.logger.error("Invalid id token", { provider: c.body.provider });
      throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.INVALID_TOKEN });
    }
    const userInfo = await provider.getUserInfo({
      idToken: token,
      accessToken: c.body.idToken.accessToken,
      refreshToken: c.body.idToken.refreshToken
    });
    if (!userInfo || !userInfo?.user) {
      c.context.logger.error("Failed to get user info", { provider: c.body.provider });
      throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.FAILED_TO_GET_USER_INFO });
    }
    if (!userInfo.user.email) {
      c.context.logger.error("User email not found", { provider: c.body.provider });
      throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.USER_EMAIL_NOT_FOUND });
    }
    const data = await handleOAuthUserInfo(c, {
      userInfo: {
        ...userInfo.user,
        email: userInfo.user.email,
        id: String(userInfo.user.id),
        name: userInfo.user.name || "",
        image: userInfo.user.image,
        emailVerified: userInfo.user.emailVerified || false
      },
      account: {
        providerId: provider.id,
        accountId: String(userInfo.user.id),
        accessToken: c.body.idToken.accessToken
      },
      callbackURL: c.body.callbackURL,
      disableSignUp: provider.disableImplicitSignUp && !c.body.requestSignUp || provider.disableSignUp
    });
    if (data.error) throw new APIError("UNAUTHORIZED", { message: data.error });
    await setSessionCookie(c, data.data);
    return c.json({
      redirect: false,
      token: data.data.session.token,
      url: void 0,
      user: parseUserOutput(c.context.options, data.data.user)
    });
  }
  const { codeVerifier, state } = await generateState(c, void 0, c.body.additionalData);
  const url = await provider.createAuthorizationURL({
    state,
    codeVerifier,
    redirectURI: `${c.context.baseURL}/callback/${provider.id}`,
    scopes: c.body.scopes,
    loginHint: c.body.loginHint
  });
  if (!c.body.disableRedirect) c.setHeader("Location", url.toString());
  return c.json({
    url: url.toString(),
    redirect: !c.body.disableRedirect
  });
});
const signInEmail = () => createAuthEndpoint("/sign-in/email", {
  method: "POST",
  operationId: "signInEmail",
  use: [formCsrfMiddleware],
  body: object({
    email: string().meta({ description: "Email of the user" }),
    password: string().meta({ description: "Password of the user" }),
    callbackURL: string().meta({ description: "Callback URL to use as a redirect for email verification" }).optional(),
    rememberMe: boolean().meta({ description: "If this is false, the session will not be remembered. Default is `true`." }).default(true).optional()
  }),
  metadata: {
    allowedMediaTypes: ["application/x-www-form-urlencoded", "application/json"],
    $Infer: {
      body: {},
      returned: {}
    },
    openapi: {
      operationId: "signInEmail",
      description: "Sign in with email and password",
      responses: { "200": {
        description: "Success - Returns either session details or redirect URL",
        content: { "application/json": { schema: {
          type: "object",
          description: "Session response when idToken is provided",
          properties: {
            redirect: {
              type: "boolean",
              enum: [false]
            },
            token: {
              type: "string",
              description: "Session token"
            },
            url: {
              type: "string",
              nullable: true
            },
            user: {
              type: "object",
              $ref: "#/components/schemas/User"
            }
          },
          required: [
            "redirect",
            "token",
            "user"
          ]
        } } }
      } }
    }
  }
}, async (ctx) => {
  if (!ctx.context.options?.emailAndPassword?.enabled) {
    ctx.context.logger.error("Email and password is not enabled. Make sure to enable it in the options on you `auth.ts` file. Check `https://better-auth.com/docs/authentication/email-password` for more!");
    throw new APIError("BAD_REQUEST", { message: "Email and password is not enabled" });
  }
  const { email: email$1, password } = ctx.body;
  if (!email().safeParse(email$1).success) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.INVALID_EMAIL });
  const user = await ctx.context.internalAdapter.findUserByEmail(email$1, { includeAccounts: true });
  if (!user) {
    await ctx.context.password.hash(password);
    ctx.context.logger.error("User not found", { email: email$1 });
    throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD });
  }
  const credentialAccount = user.accounts.find((a) => a.providerId === "credential");
  if (!credentialAccount) {
    await ctx.context.password.hash(password);
    ctx.context.logger.error("Credential account not found", { email: email$1 });
    throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD });
  }
  const currentPassword = credentialAccount?.password;
  if (!currentPassword) {
    await ctx.context.password.hash(password);
    ctx.context.logger.error("Password not found", { email: email$1 });
    throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD });
  }
  if (!await ctx.context.password.verify({
    hash: currentPassword,
    password
  })) {
    ctx.context.logger.error("Invalid password");
    throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD });
  }
  if (ctx.context.options?.emailAndPassword?.requireEmailVerification && !user.user.emailVerified) {
    if (!ctx.context.options?.emailVerification?.sendVerificationEmail) throw new APIError("FORBIDDEN", { message: BASE_ERROR_CODES.EMAIL_NOT_VERIFIED });
    if (ctx.context.options?.emailVerification?.sendOnSignIn) {
      const token = await createEmailVerificationToken(ctx.context.secret, user.user.email, void 0, ctx.context.options.emailVerification?.expiresIn);
      const callbackURL = ctx.body.callbackURL ? encodeURIComponent(ctx.body.callbackURL) : encodeURIComponent("/");
      const url = `${ctx.context.baseURL}/verify-email?token=${token}&callbackURL=${callbackURL}`;
      await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailVerification.sendVerificationEmail({
        user: user.user,
        url,
        token
      }, ctx.request));
    }
    throw new APIError("FORBIDDEN", { message: BASE_ERROR_CODES.EMAIL_NOT_VERIFIED });
  }
  const session = await ctx.context.internalAdapter.createSession(user.user.id, ctx.body.rememberMe === false);
  if (!session) {
    ctx.context.logger.error("Failed to create session");
    throw new APIError("UNAUTHORIZED", { message: BASE_ERROR_CODES.FAILED_TO_CREATE_SESSION });
  }
  await setSessionCookie(ctx, {
    session,
    user: user.user
  }, ctx.body.rememberMe === false);
  if (ctx.body.callbackURL) ctx.setHeader("Location", ctx.body.callbackURL);
  return ctx.json({
    redirect: !!ctx.body.callbackURL,
    token: session.token,
    url: ctx.body.callbackURL,
    user: parseUserOutput(ctx.context.options, user.user)
  });
});
const signOut = createAuthEndpoint("/sign-out", {
  method: "POST",
  operationId: "signOut",
  requireHeaders: true,
  metadata: { openapi: {
    operationId: "signOut",
    description: "Sign out the current user",
    responses: { "200": {
      description: "Success",
      content: { "application/json": { schema: {
        type: "object",
        properties: { success: { type: "boolean" } }
      } } }
    } }
  } }
}, async (ctx) => {
  const sessionCookieToken = await ctx.getSignedCookie(ctx.context.authCookies.sessionToken.name, ctx.context.secret);
  if (sessionCookieToken) try {
    await ctx.context.internalAdapter.deleteSession(sessionCookieToken);
  } catch (e) {
    ctx.context.logger.error("Failed to delete session from database", e);
  }
  deleteSessionCookie(ctx);
  return ctx.json({ success: true });
});
const signUpEmailBodySchema = object({
  name: string().nonempty(),
  email: email(),
  password: string().nonempty(),
  image: string().optional(),
  callbackURL: string().optional(),
  rememberMe: boolean().optional()
}).and(record(string(), any()));
const signUpEmail = () => createAuthEndpoint("/sign-up/email", {
  method: "POST",
  operationId: "signUpWithEmailAndPassword",
  use: [formCsrfMiddleware],
  body: signUpEmailBodySchema,
  metadata: {
    allowedMediaTypes: ["application/x-www-form-urlencoded", "application/json"],
    $Infer: {
      body: {},
      returned: {}
    },
    openapi: {
      operationId: "signUpWithEmailAndPassword",
      description: "Sign up a user using email and password",
      requestBody: { content: { "application/json": { schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the user"
          },
          email: {
            type: "string",
            description: "The email of the user"
          },
          password: {
            type: "string",
            description: "The password of the user"
          },
          image: {
            type: "string",
            description: "The profile image URL of the user"
          },
          callbackURL: {
            type: "string",
            description: "The URL to use for email verification callback"
          },
          rememberMe: {
            type: "boolean",
            description: "If this is false, the session will not be remembered. Default is `true`."
          }
        },
        required: [
          "name",
          "email",
          "password"
        ]
      } } } },
      responses: {
        "200": {
          description: "Successfully created user",
          content: { "application/json": { schema: {
            type: "object",
            properties: {
              token: {
                type: "string",
                nullable: true,
                description: "Authentication token for the session"
              },
              user: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "The unique identifier of the user"
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "The email address of the user"
                  },
                  name: {
                    type: "string",
                    description: "The name of the user"
                  },
                  image: {
                    type: "string",
                    format: "uri",
                    nullable: true,
                    description: "The profile image URL of the user"
                  },
                  emailVerified: {
                    type: "boolean",
                    description: "Whether the email has been verified"
                  },
                  createdAt: {
                    type: "string",
                    format: "date-time",
                    description: "When the user was created"
                  },
                  updatedAt: {
                    type: "string",
                    format: "date-time",
                    description: "When the user was last updated"
                  }
                },
                required: [
                  "id",
                  "email",
                  "name",
                  "emailVerified",
                  "createdAt",
                  "updatedAt"
                ]
              }
            },
            required: ["user"]
          } } }
        },
        "422": {
          description: "Unprocessable Entity. User already exists or failed to create user.",
          content: { "application/json": { schema: {
            type: "object",
            properties: { message: { type: "string" } }
          } } }
        }
      }
    }
  }
}, async (ctx) => {
  return runWithTransaction(ctx.context.adapter, async () => {
    if (!ctx.context.options.emailAndPassword?.enabled || ctx.context.options.emailAndPassword?.disableSignUp) throw new APIError("BAD_REQUEST", { message: "Email and password sign up is not enabled" });
    const body = ctx.body;
    const { name, email: email$1, password, image, callbackURL: _callbackURL, rememberMe, ...rest } = body;
    if (!email().safeParse(email$1).success) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.INVALID_EMAIL });
    if (!password || typeof password !== "string") throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.INVALID_PASSWORD });
    const minPasswordLength = ctx.context.password.config.minPasswordLength;
    if (password.length < minPasswordLength) {
      ctx.context.logger.error("Password is too short");
      throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.PASSWORD_TOO_SHORT });
    }
    const maxPasswordLength = ctx.context.password.config.maxPasswordLength;
    if (password.length > maxPasswordLength) {
      ctx.context.logger.error("Password is too long");
      throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.PASSWORD_TOO_LONG });
    }
    if ((await ctx.context.internalAdapter.findUserByEmail(email$1))?.user) {
      ctx.context.logger.info(`Sign-up attempt for existing email: ${email$1}`);
      throw new APIError("UNPROCESSABLE_ENTITY", { message: BASE_ERROR_CODES.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL });
    }
    const hash = await ctx.context.password.hash(password);
    let createdUser;
    try {
      const data = parseUserInput(ctx.context.options, rest, "create");
      createdUser = await ctx.context.internalAdapter.createUser({
        email: email$1.toLowerCase(),
        name,
        image,
        ...data,
        emailVerified: false
      });
      if (!createdUser) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.FAILED_TO_CREATE_USER });
    } catch (e) {
      if (isDevelopment()) ctx.context.logger.error("Failed to create user", e);
      if (e instanceof APIError) throw e;
      ctx.context.logger?.error("Failed to create user", e);
      throw new APIError("UNPROCESSABLE_ENTITY", { message: BASE_ERROR_CODES.FAILED_TO_CREATE_USER });
    }
    if (!createdUser) throw new APIError("UNPROCESSABLE_ENTITY", { message: BASE_ERROR_CODES.FAILED_TO_CREATE_USER });
    await ctx.context.internalAdapter.linkAccount({
      userId: createdUser.id,
      providerId: "credential",
      accountId: createdUser.id,
      password: hash
    });
    if (ctx.context.options.emailVerification?.sendOnSignUp || ctx.context.options.emailAndPassword.requireEmailVerification) {
      const token = await createEmailVerificationToken(ctx.context.secret, createdUser.email, void 0, ctx.context.options.emailVerification?.expiresIn);
      const callbackURL = body.callbackURL ? encodeURIComponent(body.callbackURL) : encodeURIComponent("/");
      const url = `${ctx.context.baseURL}/verify-email?token=${token}&callbackURL=${callbackURL}`;
      if (ctx.context.options.emailVerification?.sendVerificationEmail) await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailVerification.sendVerificationEmail({
        user: createdUser,
        url,
        token
      }, ctx.request));
    }
    if (ctx.context.options.emailAndPassword.autoSignIn === false || ctx.context.options.emailAndPassword.requireEmailVerification) return ctx.json({
      token: null,
      user: parseUserOutput(ctx.context.options, createdUser)
    });
    const session = await ctx.context.internalAdapter.createSession(createdUser.id, rememberMe === false);
    if (!session) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.FAILED_TO_CREATE_SESSION });
    await setSessionCookie(ctx, {
      session,
      user: createdUser
    }, rememberMe === false);
    return ctx.json({
      token: session.token,
      user: parseUserOutput(ctx.context.options, createdUser)
    });
  });
});
const updateUserBodySchema = record(string().meta({ description: "Field name must be a string" }), any());
const updateUser = () => createAuthEndpoint("/update-user", {
  method: "POST",
  operationId: "updateUser",
  body: updateUserBodySchema,
  use: [sessionMiddleware],
  metadata: {
    $Infer: { body: {} },
    openapi: {
      operationId: "updateUser",
      description: "Update the current user",
      requestBody: { content: { "application/json": { schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the user"
          },
          image: {
            type: "string",
            description: "The image of the user",
            nullable: true
          }
        }
      } } } },
      responses: { "200": {
        description: "Success",
        content: { "application/json": { schema: {
          type: "object",
          properties: { user: {
            type: "object",
            $ref: "#/components/schemas/User"
          } }
        } } }
      } }
    }
  }
}, async (ctx) => {
  const body = ctx.body;
  if (typeof body !== "object" || Array.isArray(body)) throw new APIError("BAD_REQUEST", { message: "Body must be an object" });
  if (body.email) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.EMAIL_CAN_NOT_BE_UPDATED });
  const { name, image, ...rest } = body;
  const session = ctx.context.session;
  const additionalFields = parseUserInput(ctx.context.options, rest, "update");
  if (image === void 0 && name === void 0 && Object.keys(additionalFields).length === 0) throw new APIError("BAD_REQUEST", { message: "No fields to update" });
  const updatedUser = await ctx.context.internalAdapter.updateUser(session.user.id, {
    name,
    image,
    ...additionalFields
  }) ?? {
    ...session.user,
    ...name !== void 0 && { name },
    ...image !== void 0 && { image },
    ...additionalFields
  };
  await setSessionCookie(ctx, {
    session: session.session,
    user: updatedUser
  });
  return ctx.json({ status: true });
});
const changePassword = createAuthEndpoint("/change-password", {
  method: "POST",
  operationId: "changePassword",
  body: object({
    newPassword: string().meta({ description: "The new password to set" }),
    currentPassword: string().meta({ description: "The current password is required" }),
    revokeOtherSessions: boolean().meta({ description: "Must be a boolean value" }).optional()
  }),
  use: [sensitiveSessionMiddleware],
  metadata: { openapi: {
    operationId: "changePassword",
    description: "Change the password of the user",
    responses: { "200": {
      description: "Password successfully changed",
      content: { "application/json": { schema: {
        type: "object",
        properties: {
          token: {
            type: "string",
            nullable: true,
            description: "New session token if other sessions were revoked"
          },
          user: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "The unique identifier of the user"
              },
              email: {
                type: "string",
                format: "email",
                description: "The email address of the user"
              },
              name: {
                type: "string",
                description: "The name of the user"
              },
              image: {
                type: "string",
                format: "uri",
                nullable: true,
                description: "The profile image URL of the user"
              },
              emailVerified: {
                type: "boolean",
                description: "Whether the email has been verified"
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "When the user was created"
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "When the user was last updated"
              }
            },
            required: [
              "id",
              "email",
              "name",
              "emailVerified",
              "createdAt",
              "updatedAt"
            ]
          }
        },
        required: ["user"]
      } } }
    } }
  } }
}, async (ctx) => {
  const { newPassword, currentPassword, revokeOtherSessions: revokeOtherSessions2 } = ctx.body;
  const session = ctx.context.session;
  const minPasswordLength = ctx.context.password.config.minPasswordLength;
  if (newPassword.length < minPasswordLength) {
    ctx.context.logger.error("Password is too short");
    throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.PASSWORD_TOO_SHORT });
  }
  const maxPasswordLength = ctx.context.password.config.maxPasswordLength;
  if (newPassword.length > maxPasswordLength) {
    ctx.context.logger.error("Password is too long");
    throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.PASSWORD_TOO_LONG });
  }
  const account = (await ctx.context.internalAdapter.findAccounts(session.user.id)).find((account$1) => account$1.providerId === "credential" && account$1.password);
  if (!account || !account.password) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.CREDENTIAL_ACCOUNT_NOT_FOUND });
  const passwordHash = await ctx.context.password.hash(newPassword);
  if (!await ctx.context.password.verify({
    hash: account.password,
    password: currentPassword
  })) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.INVALID_PASSWORD });
  await ctx.context.internalAdapter.updateAccount(account.id, { password: passwordHash });
  let token = null;
  if (revokeOtherSessions2) {
    await ctx.context.internalAdapter.deleteSessions(session.user.id);
    const newSession = await ctx.context.internalAdapter.createSession(session.user.id);
    if (!newSession) throw new APIError("INTERNAL_SERVER_ERROR", { message: BASE_ERROR_CODES.FAILED_TO_GET_SESSION });
    await setSessionCookie(ctx, {
      session: newSession,
      user: session.user
    });
    token = newSession.token;
  }
  return ctx.json({
    token,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      emailVerified: session.user.emailVerified,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt
    }
  });
});
const setPassword = createAuthEndpoint({
  method: "POST",
  body: object({ newPassword: string().meta({ description: "The new password to set is required" }) }),
  use: [sensitiveSessionMiddleware]
}, async (ctx) => {
  const { newPassword } = ctx.body;
  const session = ctx.context.session;
  const minPasswordLength = ctx.context.password.config.minPasswordLength;
  if (newPassword.length < minPasswordLength) {
    ctx.context.logger.error("Password is too short");
    throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.PASSWORD_TOO_SHORT });
  }
  const maxPasswordLength = ctx.context.password.config.maxPasswordLength;
  if (newPassword.length > maxPasswordLength) {
    ctx.context.logger.error("Password is too long");
    throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.PASSWORD_TOO_LONG });
  }
  const account = (await ctx.context.internalAdapter.findAccounts(session.user.id)).find((account$1) => account$1.providerId === "credential" && account$1.password);
  const passwordHash = await ctx.context.password.hash(newPassword);
  if (!account) {
    await ctx.context.internalAdapter.linkAccount({
      userId: session.user.id,
      providerId: "credential",
      accountId: session.user.id,
      password: passwordHash
    });
    return ctx.json({ status: true });
  }
  throw new APIError("BAD_REQUEST", { message: "user already has a password" });
});
const deleteUser = createAuthEndpoint("/delete-user", {
  method: "POST",
  use: [sensitiveSessionMiddleware],
  body: object({
    callbackURL: string().meta({ description: "The callback URL to redirect to after the user is deleted" }).optional(),
    password: string().meta({ description: "The password of the user is required to delete the user" }).optional(),
    token: string().meta({ description: "The token to delete the user is required" }).optional()
  }),
  metadata: { openapi: {
    operationId: "deleteUser",
    description: "Delete the user",
    requestBody: { content: { "application/json": { schema: {
      type: "object",
      properties: {
        callbackURL: {
          type: "string",
          description: "The callback URL to redirect to after the user is deleted"
        },
        password: {
          type: "string",
          description: "The user's password. Required if session is not fresh"
        },
        token: {
          type: "string",
          description: "The deletion verification token"
        }
      }
    } } } },
    responses: { "200": {
      description: "User deletion processed successfully",
      content: { "application/json": { schema: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Indicates if the operation was successful"
          },
          message: {
            type: "string",
            enum: ["User deleted", "Verification email sent"],
            description: "Status message of the deletion process"
          }
        },
        required: ["success", "message"]
      } } }
    } }
  } }
}, async (ctx) => {
  if (!ctx.context.options.user?.deleteUser?.enabled) {
    ctx.context.logger.error("Delete user is disabled. Enable it in the options");
    throw new APIError("NOT_FOUND");
  }
  const session = ctx.context.session;
  if (ctx.body.password) {
    const account = (await ctx.context.internalAdapter.findAccounts(session.user.id)).find((account$1) => account$1.providerId === "credential" && account$1.password);
    if (!account || !account.password) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.CREDENTIAL_ACCOUNT_NOT_FOUND });
    if (!await ctx.context.password.verify({
      hash: account.password,
      password: ctx.body.password
    })) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.INVALID_PASSWORD });
  }
  if (ctx.body.token) {
    await deleteUserCallback({
      ...ctx,
      query: { token: ctx.body.token }
    });
    return ctx.json({
      success: true,
      message: "User deleted"
    });
  }
  if (ctx.context.options.user.deleteUser?.sendDeleteAccountVerification) {
    const token = generateRandomString(32, "0-9", "a-z");
    await ctx.context.internalAdapter.createVerificationValue({
      value: session.user.id,
      identifier: `delete-account-${token}`,
      expiresAt: new Date(Date.now() + (ctx.context.options.user.deleteUser?.deleteTokenExpiresIn || 3600 * 24) * 1e3)
    });
    const url = `${ctx.context.baseURL}/delete-user/callback?token=${token}&callbackURL=${ctx.body.callbackURL || "/"}`;
    await ctx.context.runInBackgroundOrAwait(ctx.context.options.user.deleteUser.sendDeleteAccountVerification({
      user: session.user,
      url,
      token
    }, ctx.request));
    return ctx.json({
      success: true,
      message: "Verification email sent"
    });
  }
  if (!ctx.body.password && ctx.context.sessionConfig.freshAge !== 0) {
    const currentAge = new Date(session.session.createdAt).getTime();
    const freshAge = ctx.context.sessionConfig.freshAge * 1e3;
    if (Date.now() - currentAge > freshAge * 1e3) throw new APIError("BAD_REQUEST", { message: BASE_ERROR_CODES.SESSION_EXPIRED });
  }
  const beforeDelete = ctx.context.options.user.deleteUser?.beforeDelete;
  if (beforeDelete) await beforeDelete(session.user, ctx.request);
  await ctx.context.internalAdapter.deleteUser(session.user.id);
  await ctx.context.internalAdapter.deleteSessions(session.user.id);
  deleteSessionCookie(ctx);
  const afterDelete = ctx.context.options.user.deleteUser?.afterDelete;
  if (afterDelete) await afterDelete(session.user, ctx.request);
  return ctx.json({
    success: true,
    message: "User deleted"
  });
});
const deleteUserCallback = createAuthEndpoint("/delete-user/callback", {
  method: "GET",
  query: object({
    token: string().meta({ description: "The token to verify the deletion request" }),
    callbackURL: string().meta({ description: "The URL to redirect to after deletion" }).optional()
  }),
  use: [originCheck((ctx) => ctx.query.callbackURL)],
  metadata: { openapi: {
    description: "Callback to complete user deletion with verification token",
    responses: { "200": {
      description: "User successfully deleted",
      content: { "application/json": { schema: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Indicates if the deletion was successful"
          },
          message: {
            type: "string",
            enum: ["User deleted"],
            description: "Confirmation message"
          }
        },
        required: ["success", "message"]
      } } }
    } }
  } }
}, async (ctx) => {
  if (!ctx.context.options.user?.deleteUser?.enabled) {
    ctx.context.logger.error("Delete user is disabled. Enable it in the options");
    throw new APIError("NOT_FOUND");
  }
  const session = await getSessionFromCtx(ctx);
  if (!session) throw new APIError("NOT_FOUND", { message: BASE_ERROR_CODES.FAILED_TO_GET_USER_INFO });
  const token = await ctx.context.internalAdapter.findVerificationValue(`delete-account-${ctx.query.token}`);
  if (!token || token.expiresAt < /* @__PURE__ */ new Date()) throw new APIError("NOT_FOUND", { message: BASE_ERROR_CODES.INVALID_TOKEN });
  if (token.value !== session.user.id) throw new APIError("NOT_FOUND", { message: BASE_ERROR_CODES.INVALID_TOKEN });
  const beforeDelete = ctx.context.options.user.deleteUser?.beforeDelete;
  if (beforeDelete) await beforeDelete(session.user, ctx.request);
  await ctx.context.internalAdapter.deleteUser(session.user.id);
  await ctx.context.internalAdapter.deleteSessions(session.user.id);
  await ctx.context.internalAdapter.deleteAccounts(session.user.id);
  await ctx.context.internalAdapter.deleteVerificationValue(token.id);
  deleteSessionCookie(ctx);
  const afterDelete = ctx.context.options.user.deleteUser?.afterDelete;
  if (afterDelete) await afterDelete(session.user, ctx.request);
  if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL || "/");
  return ctx.json({
    success: true,
    message: "User deleted"
  });
});
const changeEmail = createAuthEndpoint("/change-email", {
  method: "POST",
  body: object({
    newEmail: email().meta({ description: "The new email address to set must be a valid email address" }),
    callbackURL: string().meta({ description: "The URL to redirect to after email verification" }).optional()
  }),
  use: [sensitiveSessionMiddleware],
  metadata: { openapi: {
    operationId: "changeEmail",
    responses: {
      "200": {
        description: "Email change request processed successfully",
        content: { "application/json": { schema: {
          type: "object",
          properties: {
            user: {
              type: "object",
              $ref: "#/components/schemas/User"
            },
            status: {
              type: "boolean",
              description: "Indicates if the request was successful"
            },
            message: {
              type: "string",
              enum: ["Email updated", "Verification email sent"],
              description: "Status message of the email change process",
              nullable: true
            }
          },
          required: ["status"]
        } } }
      },
      "422": {
        description: "Unprocessable Entity. Email already exists",
        content: { "application/json": { schema: {
          type: "object",
          properties: { message: { type: "string" } }
        } } }
      }
    }
  } }
}, async (ctx) => {
  if (!ctx.context.options.user?.changeEmail?.enabled) {
    ctx.context.logger.error("Change email is disabled.");
    throw new APIError("BAD_REQUEST", { message: "Change email is disabled" });
  }
  const newEmail = ctx.body.newEmail.toLowerCase();
  if (newEmail === ctx.context.session.user.email) {
    ctx.context.logger.error("Email is the same");
    throw new APIError("BAD_REQUEST", { message: "Email is the same" });
  }
  if (await ctx.context.internalAdapter.findUserByEmail(newEmail)) {
    ctx.context.logger.error("Email already exists");
    throw new APIError("UNPROCESSABLE_ENTITY", { message: BASE_ERROR_CODES.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL });
  }
  if (ctx.context.session.user.emailVerified !== true && ctx.context.options.user.changeEmail.updateEmailWithoutVerification) {
    await ctx.context.internalAdapter.updateUserByEmail(ctx.context.session.user.email, { email: newEmail });
    await setSessionCookie(ctx, {
      session: ctx.context.session.session,
      user: {
        ...ctx.context.session.user,
        email: newEmail
      }
    });
    if (ctx.context.options.emailVerification?.sendVerificationEmail) {
      const token$1 = await createEmailVerificationToken(ctx.context.secret, newEmail, void 0, ctx.context.options.emailVerification?.expiresIn);
      const url$1 = `${ctx.context.baseURL}/verify-email?token=${token$1}&callbackURL=${ctx.body.callbackURL || "/"}`;
      await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailVerification.sendVerificationEmail({
        user: {
          ...ctx.context.session.user,
          email: newEmail
        },
        url: url$1,
        token: token$1
      }, ctx.request));
    }
    return ctx.json({ status: true });
  }
  if (ctx.context.session.user.emailVerified && (ctx.context.options.user.changeEmail.sendChangeEmailConfirmation || ctx.context.options.user.changeEmail.sendChangeEmailVerification)) {
    const token$1 = await createEmailVerificationToken(ctx.context.secret, ctx.context.session.user.email, newEmail, ctx.context.options.emailVerification?.expiresIn, { requestType: "change-email-confirmation" });
    const url$1 = `${ctx.context.baseURL}/verify-email?token=${token$1}&callbackURL=${ctx.body.callbackURL || "/"}`;
    const sendFn = ctx.context.options.user.changeEmail.sendChangeEmailConfirmation || ctx.context.options.user.changeEmail.sendChangeEmailVerification;
    if (sendFn) await ctx.context.runInBackgroundOrAwait(sendFn({
      user: ctx.context.session.user,
      newEmail,
      url: url$1,
      token: token$1
    }, ctx.request));
    return ctx.json({ status: true });
  }
  if (!ctx.context.options.emailVerification?.sendVerificationEmail) {
    ctx.context.logger.error("Verification email isn't enabled.");
    throw new APIError("BAD_REQUEST", { message: "Verification email isn't enabled" });
  }
  const token = await createEmailVerificationToken(ctx.context.secret, ctx.context.session.user.email, newEmail, ctx.context.options.emailVerification?.expiresIn, { requestType: "change-email-verification" });
  const url = `${ctx.context.baseURL}/verify-email?token=${token}&callbackURL=${ctx.body.callbackURL || "/"}`;
  await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailVerification.sendVerificationEmail({
    user: {
      ...ctx.context.session.user,
      email: newEmail
    },
    url,
    token
  }, ctx.request));
  return ctx.json({ status: true });
});
const defuReplaceArrays = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value;
    return true;
  }
});
const hooksSourceWeakMap = /* @__PURE__ */ new WeakMap();
function toAuthEndpoints(endpoints, ctx) {
  const api = {};
  for (const [key, endpoint] of Object.entries(endpoints)) {
    api[key] = async (context) => {
      const run = async () => {
        const authContext = await ctx;
        let internalContext = {
          ...context,
          context: {
            ...authContext,
            returned: void 0,
            responseHeaders: void 0,
            session: null
          },
          path: endpoint.path,
          headers: context?.headers ? new Headers(context?.headers) : void 0
        };
        return runWithEndpointContext(internalContext, async () => {
          const { beforeHooks, afterHooks } = getHooks(authContext);
          const before = await runBeforeHooks(internalContext, beforeHooks);
          if ("context" in before && before.context && typeof before.context === "object") {
            const { headers, ...rest } = before.context;
            if (headers) headers.forEach((value, key$1) => {
              internalContext.headers.set(key$1, value);
            });
            internalContext = defuReplaceArrays(rest, internalContext);
          } else if (before) return context?.asResponse ? toResponse$1(before, { headers: context?.headers }) : context?.returnHeaders ? {
            headers: context?.headers,
            response: before
          } : before;
          internalContext.asResponse = false;
          internalContext.returnHeaders = true;
          internalContext.returnStatus = true;
          const result = await runWithEndpointContext(internalContext, () => endpoint(internalContext)).catch((e) => {
            if (e instanceof APIError)
              return {
                response: e,
                status: e.statusCode,
                headers: e.headers ? new Headers(e.headers) : null
              };
            throw e;
          });
          if (result && result instanceof Response) return result;
          internalContext.context.returned = result.response;
          internalContext.context.responseHeaders = result.headers;
          const after = await runAfterHooks(internalContext, afterHooks);
          if (after.response) result.response = after.response;
          if (result.response instanceof APIError && shouldPublishLog(authContext.logger.level, "debug")) result.response.stack = result.response.errorStack;
          if (result.response instanceof APIError && !context?.asResponse) throw result.response;
          return context?.asResponse ? toResponse$1(result.response, {
            headers: result.headers,
            status: result.status
          }) : context?.returnHeaders ? context?.returnStatus ? {
            headers: result.headers,
            response: result.response,
            status: result.status
          } : {
            headers: result.headers,
            response: result.response
          } : context?.returnStatus ? {
            response: result.response,
            status: result.status
          } : result.response;
        });
      };
      if (await hasRequestState()) return run();
      else return runWithRequestState(/* @__PURE__ */ new WeakMap(), run);
    };
    api[key].path = endpoint.path;
    api[key].options = endpoint.options;
  }
  return api;
}
async function runBeforeHooks(context, hooks) {
  let modifiedContext = {};
  for (const hook of hooks) {
    let matched = false;
    try {
      matched = hook.matcher(context);
    } catch (error2) {
      const hookSource = hooksSourceWeakMap.get(hook.handler) ?? "unknown";
      context.context.logger.error(`An error occurred during ${hookSource} hook matcher execution:`, error2);
      throw new APIError("INTERNAL_SERVER_ERROR", { message: `An error occurred during hook matcher execution. Check the logs for more details.` });
    }
    if (matched) {
      const result = await hook.handler({
        ...context,
        returnHeaders: false
      }).catch((e) => {
        if (e instanceof APIError && shouldPublishLog(context.context.logger.level, "debug")) e.stack = e.errorStack;
        throw e;
      });
      if (result && typeof result === "object") {
        if ("context" in result && typeof result.context === "object") {
          const { headers, ...rest } = result.context;
          if (headers instanceof Headers) if (modifiedContext.headers) headers.forEach((value, key) => {
            modifiedContext.headers?.set(key, value);
          });
          else modifiedContext.headers = headers;
          modifiedContext = defuReplaceArrays(rest, modifiedContext);
          continue;
        }
        return result;
      }
    }
  }
  return { context: modifiedContext };
}
async function runAfterHooks(context, hooks) {
  for (const hook of hooks) if (hook.matcher(context)) {
    const result = await hook.handler(context).catch((e) => {
      if (e instanceof APIError) {
        if (shouldPublishLog(context.context.logger.level, "debug")) e.stack = e.errorStack;
        return {
          response: e,
          headers: e.headers ? new Headers(e.headers) : null
        };
      }
      throw e;
    });
    if (result.headers) result.headers.forEach((value, key) => {
      if (!context.context.responseHeaders) context.context.responseHeaders = new Headers({ [key]: value });
      else if (key.toLowerCase() === "set-cookie") context.context.responseHeaders.append(key, value);
      else context.context.responseHeaders.set(key, value);
    });
    if (result.response) context.context.returned = result.response;
  }
  return {
    response: context.context.returned,
    headers: context.context.responseHeaders
  };
}
function getHooks(authContext) {
  const plugins = authContext.options.plugins || [];
  const beforeHooks = [];
  const afterHooks = [];
  const beforeHookHandler = authContext.options.hooks?.before;
  if (beforeHookHandler) {
    hooksSourceWeakMap.set(beforeHookHandler, "user");
    beforeHooks.push({
      matcher: () => true,
      handler: beforeHookHandler
    });
  }
  const afterHookHandler = authContext.options.hooks?.after;
  if (afterHookHandler) {
    hooksSourceWeakMap.set(afterHookHandler, "user");
    afterHooks.push({
      matcher: () => true,
      handler: afterHookHandler
    });
  }
  const pluginBeforeHooks = plugins.filter((plugin) => plugin.hooks?.before).map((plugin) => plugin.hooks?.before).flat();
  const pluginAfterHooks = plugins.filter((plugin) => plugin.hooks?.after).map((plugin) => plugin.hooks?.after).flat();
  if (pluginBeforeHooks.length) beforeHooks.push(...pluginBeforeHooks);
  if (pluginAfterHooks.length) afterHooks.push(...pluginAfterHooks);
  return {
    beforeHooks,
    afterHooks
  };
}
function checkEndpointConflicts(options, logger$1) {
  const endpointRegistry = /* @__PURE__ */ new Map();
  options.plugins?.forEach((plugin) => {
    if (plugin.endpoints) {
      for (const [key, endpoint] of Object.entries(plugin.endpoints)) if (endpoint && "path" in endpoint && typeof endpoint.path === "string") {
        const path = endpoint.path;
        let methods = [];
        if (endpoint.options && "method" in endpoint.options) {
          if (Array.isArray(endpoint.options.method)) methods = endpoint.options.method;
          else if (typeof endpoint.options.method === "string") methods = [endpoint.options.method];
        }
        if (methods.length === 0) methods = ["*"];
        if (!endpointRegistry.has(path)) endpointRegistry.set(path, []);
        endpointRegistry.get(path).push({
          pluginId: plugin.id,
          endpointKey: key,
          methods
        });
      }
    }
  });
  const conflicts = [];
  for (const [path, entries] of endpointRegistry.entries()) if (entries.length > 1) {
    const methodMap = /* @__PURE__ */ new Map();
    let hasConflict = false;
    for (const entry of entries) for (const method of entry.methods) {
      if (!methodMap.has(method)) methodMap.set(method, []);
      methodMap.get(method).push(entry.pluginId);
      if (methodMap.get(method).length > 1) hasConflict = true;
      if (method === "*" && entries.length > 1) hasConflict = true;
      else if (method !== "*" && methodMap.has("*")) hasConflict = true;
    }
    if (hasConflict) {
      const uniquePlugins = [...new Set(entries.map((e) => e.pluginId))];
      const conflictingMethods = [];
      for (const [method, plugins] of methodMap.entries()) if (plugins.length > 1 || method === "*" && entries.length > 1 || method !== "*" && methodMap.has("*")) conflictingMethods.push(method);
      conflicts.push({
        path,
        plugins: uniquePlugins,
        conflictingMethods
      });
    }
  }
  if (conflicts.length > 0) {
    const conflictMessages = conflicts.map((conflict) => `  - "${conflict.path}" [${conflict.conflictingMethods.join(", ")}] used by plugins: ${conflict.plugins.join(", ")}`).join("\n");
    logger$1.error(`Endpoint path conflicts detected! Multiple plugins are trying to use the same endpoint paths with conflicting HTTP methods:
${conflictMessages}

To resolve this, you can:
	1. Use only one of the conflicting plugins
	2. Configure the plugins to use different paths (if supported)
	3. Ensure plugins use different HTTP methods for the same path
`);
  }
}
function getEndpoints(ctx, options) {
  const pluginEndpoints = options.plugins?.reduce((acc, plugin) => {
    return {
      ...acc,
      ...plugin.endpoints
    };
  }, {}) ?? {};
  const middlewares = options.plugins?.map((plugin) => plugin.middlewares?.map((m) => {
    const middleware = (async (context) => {
      const authContext = await ctx;
      return m.middleware({
        ...context,
        context: {
          ...authContext,
          ...context.context
        }
      });
    });
    middleware.options = m.middleware.options;
    return {
      path: m.path,
      middleware
    };
  })).filter((plugin) => plugin !== void 0).flat() || [];
  return {
    api: toAuthEndpoints({
      signInSocial: signInSocial(),
      callbackOAuth,
      getSession: getSession(),
      signOut,
      signUpEmail: signUpEmail(),
      signInEmail: signInEmail(),
      resetPassword,
      verifyPassword,
      verifyEmail,
      sendVerificationEmail,
      changeEmail,
      changePassword,
      setPassword,
      updateUser: updateUser(),
      deleteUser,
      requestPasswordReset,
      requestPasswordResetCallback,
      listSessions: listSessions(),
      revokeSession,
      revokeSessions,
      revokeOtherSessions,
      linkSocialAccount,
      listUserAccounts,
      deleteUserCallback,
      unlinkAccount,
      refreshToken,
      getAccessToken,
      accountInfo,
      ...pluginEndpoints,
      ok,
      error
    }, ctx),
    middlewares
  };
}
const router = (ctx, options) => {
  const { api, middlewares } = getEndpoints(ctx, options);
  const basePath = new URL(ctx.baseURL).pathname;
  return createRouter$1(api, {
    routerContext: ctx,
    openapi: { disabled: true },
    basePath,
    routerMiddleware: [{
      path: "/**",
      middleware: originCheckMiddleware
    }, ...middlewares],
    allowedMediaTypes: ["application/json"],
    async onRequest(req) {
      const disabledPaths = ctx.options.disabledPaths || [];
      const pathname = new URL(req.url).pathname.replace(/\/+$/, "") || "/";
      const normalizedPath = basePath === "/" ? pathname : pathname.startsWith(basePath) ? pathname.slice(basePath.length).replace(/\/+$/, "") || "/" : pathname;
      if (disabledPaths.includes(normalizedPath)) return new Response("Not Found", { status: 404 });
      let currentRequest = req;
      for (const plugin of ctx.options.plugins || []) if (plugin.onRequest) {
        const response = await plugin.onRequest(currentRequest, ctx);
        if (response && "response" in response) return response.response;
        if (response && "request" in response) currentRequest = response.request;
      }
      const rateLimitResponse2 = await onRequestRateLimit(currentRequest, ctx);
      if (rateLimitResponse2) return rateLimitResponse2;
      return currentRequest;
    },
    async onResponse(res) {
      for (const plugin of ctx.options.plugins || []) if (plugin.onResponse) {
        const response = await plugin.onResponse(res, ctx);
        if (response) return response.response;
      }
      return res;
    },
    onError(e) {
      if (e instanceof APIError && e.status === "FOUND") return;
      if (options.onAPIError?.throw) throw e;
      if (options.onAPIError?.onError) {
        options.onAPIError.onError(e, ctx);
        return;
      }
      const optLogLevel = options.logger?.level;
      const log = optLogLevel === "error" || optLogLevel === "warn" || optLogLevel === "debug" ? logger : void 0;
      if (options.logger?.disabled !== true) {
        if (e && typeof e === "object" && "message" in e && typeof e.message === "string") {
          if (e.message.includes("no column") || e.message.includes("column") || e.message.includes("relation") || e.message.includes("table") || e.message.includes("does not exist")) {
            ctx.logger?.error(e.message);
            return;
          }
        }
        if (e instanceof APIError) {
          if (e.status === "INTERNAL_SERVER_ERROR") ctx.logger.error(e.status, e);
          log?.error(e.message);
        } else ctx.logger?.error(e && typeof e === "object" && "name" in e ? e.name : "", e);
      }
    }
  });
};
const DEFAULT_SECRET = "better-auth-secret-12345678901234567890";
function isPromise(obj) {
  return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
}
async function runPluginInit(ctx) {
  let options = ctx.options;
  const plugins = options.plugins || [];
  let context = ctx;
  const dbHooks = [];
  for (const plugin of plugins) if (plugin.init) {
    let initPromise = plugin.init(context);
    let result;
    if (isPromise(initPromise)) result = await initPromise;
    else result = initPromise;
    if (typeof result === "object") {
      if (result.options) {
        const { databaseHooks, ...restOpts } = result.options;
        if (databaseHooks) dbHooks.push(databaseHooks);
        options = defu(options, restOpts);
      }
      if (result.context) context = {
        ...context,
        ...result.context
      };
    }
  }
  dbHooks.push(options.databaseHooks);
  context.internalAdapter = createInternalAdapter(context.adapter, {
    options,
    logger: context.logger,
    hooks: dbHooks.filter((u) => u !== void 0),
    generateId: context.generateId
  });
  context.options = options;
  return { context };
}
function getInternalPlugins(options) {
  const plugins = [];
  if (options.advanced?.crossSubDomainCookies?.enabled) ;
  return plugins;
}
async function getTrustedOrigins(options, request) {
  const baseURL = getBaseURL(options.baseURL, options.basePath);
  const trustedOrigins = baseURL ? [new URL(baseURL).origin] : [];
  if (options.trustedOrigins) {
    if (Array.isArray(options.trustedOrigins)) trustedOrigins.push(...options.trustedOrigins);
    if (typeof options.trustedOrigins === "function") {
      const validOrigins = await options.trustedOrigins(request);
      trustedOrigins.push(...validOrigins);
    }
  }
  const envTrustedOrigins = env$1.BETTER_AUTH_TRUSTED_ORIGINS;
  if (envTrustedOrigins) trustedOrigins.push(...envTrustedOrigins.split(","));
  return trustedOrigins.filter((v) => Boolean(v));
}
function getTelemetryAuthConfig(options, context) {
  return {
    database: context?.database,
    adapter: context?.adapter,
    emailVerification: {
      sendVerificationEmail: !!options.emailVerification?.sendVerificationEmail,
      sendOnSignUp: !!options.emailVerification?.sendOnSignUp,
      sendOnSignIn: !!options.emailVerification?.sendOnSignIn,
      autoSignInAfterVerification: !!options.emailVerification?.autoSignInAfterVerification,
      expiresIn: options.emailVerification?.expiresIn,
      onEmailVerification: !!options.emailVerification?.onEmailVerification,
      afterEmailVerification: !!options.emailVerification?.afterEmailVerification
    },
    emailAndPassword: {
      enabled: !!options.emailAndPassword?.enabled,
      disableSignUp: !!options.emailAndPassword?.disableSignUp,
      requireEmailVerification: !!options.emailAndPassword?.requireEmailVerification,
      maxPasswordLength: options.emailAndPassword?.maxPasswordLength,
      minPasswordLength: options.emailAndPassword?.minPasswordLength,
      sendResetPassword: !!options.emailAndPassword?.sendResetPassword,
      resetPasswordTokenExpiresIn: options.emailAndPassword?.resetPasswordTokenExpiresIn,
      onPasswordReset: !!options.emailAndPassword?.onPasswordReset,
      password: {
        hash: !!options.emailAndPassword?.password?.hash,
        verify: !!options.emailAndPassword?.password?.verify
      },
      autoSignIn: !!options.emailAndPassword?.autoSignIn,
      revokeSessionsOnPasswordReset: !!options.emailAndPassword?.revokeSessionsOnPasswordReset
    },
    socialProviders: Object.keys(options.socialProviders || {}).map((p) => {
      const provider = options.socialProviders?.[p];
      if (!provider) return {};
      return {
        id: p,
        mapProfileToUser: !!provider.mapProfileToUser,
        disableDefaultScope: !!provider.disableDefaultScope,
        disableIdTokenSignIn: !!provider.disableIdTokenSignIn,
        disableImplicitSignUp: provider.disableImplicitSignUp,
        disableSignUp: provider.disableSignUp,
        getUserInfo: !!provider.getUserInfo,
        overrideUserInfoOnSignIn: !!provider.overrideUserInfoOnSignIn,
        prompt: provider.prompt,
        verifyIdToken: !!provider.verifyIdToken,
        scope: provider.scope,
        refreshAccessToken: !!provider.refreshAccessToken
      };
    }),
    plugins: options.plugins?.map((p) => p.id.toString()),
    user: {
      modelName: options.user?.modelName,
      fields: options.user?.fields,
      additionalFields: options.user?.additionalFields,
      changeEmail: {
        enabled: options.user?.changeEmail?.enabled,
        sendChangeEmailVerification: !!options.user?.changeEmail?.sendChangeEmailVerification
      }
    },
    verification: {
      modelName: options.verification?.modelName,
      disableCleanup: options.verification?.disableCleanup,
      fields: options.verification?.fields
    },
    session: {
      modelName: options.session?.modelName,
      additionalFields: options.session?.additionalFields,
      cookieCache: {
        enabled: options.session?.cookieCache?.enabled,
        maxAge: options.session?.cookieCache?.maxAge,
        strategy: options.session?.cookieCache?.strategy
      },
      disableSessionRefresh: options.session?.disableSessionRefresh,
      expiresIn: options.session?.expiresIn,
      fields: options.session?.fields,
      freshAge: options.session?.freshAge,
      preserveSessionInDatabase: options.session?.preserveSessionInDatabase,
      storeSessionInDatabase: options.session?.storeSessionInDatabase,
      updateAge: options.session?.updateAge
    },
    account: {
      modelName: options.account?.modelName,
      fields: options.account?.fields,
      encryptOAuthTokens: options.account?.encryptOAuthTokens,
      updateAccountOnSignIn: options.account?.updateAccountOnSignIn,
      accountLinking: {
        enabled: options.account?.accountLinking?.enabled,
        trustedProviders: options.account?.accountLinking?.trustedProviders,
        updateUserInfoOnLink: options.account?.accountLinking?.updateUserInfoOnLink,
        allowUnlinkingAll: options.account?.accountLinking?.allowUnlinkingAll
      }
    },
    hooks: {
      after: !!options.hooks?.after,
      before: !!options.hooks?.before
    },
    secondaryStorage: !!options.secondaryStorage,
    advanced: {
      cookiePrefix: !!options.advanced?.cookiePrefix,
      cookies: !!options.advanced?.cookies,
      crossSubDomainCookies: {
        domain: !!options.advanced?.crossSubDomainCookies?.domain,
        enabled: options.advanced?.crossSubDomainCookies?.enabled,
        additionalCookies: options.advanced?.crossSubDomainCookies?.additionalCookies
      },
      database: {
        useNumberId: !!options.advanced?.database?.useNumberId || options.advanced?.database?.generateId === "serial",
        generateId: options.advanced?.database?.generateId,
        defaultFindManyLimit: options.advanced?.database?.defaultFindManyLimit
      },
      useSecureCookies: options.advanced?.useSecureCookies,
      ipAddress: {
        disableIpTracking: options.advanced?.ipAddress?.disableIpTracking,
        ipAddressHeaders: options.advanced?.ipAddress?.ipAddressHeaders
      },
      disableCSRFCheck: options.advanced?.disableCSRFCheck,
      cookieAttributes: {
        expires: options.advanced?.defaultCookieAttributes?.expires,
        secure: options.advanced?.defaultCookieAttributes?.secure,
        sameSite: options.advanced?.defaultCookieAttributes?.sameSite,
        domain: !!options.advanced?.defaultCookieAttributes?.domain,
        path: options.advanced?.defaultCookieAttributes?.path,
        httpOnly: options.advanced?.defaultCookieAttributes?.httpOnly
      }
    },
    trustedOrigins: options.trustedOrigins?.length,
    rateLimit: {
      storage: options.rateLimit?.storage,
      modelName: options.rateLimit?.modelName,
      window: options.rateLimit?.window,
      customStorage: !!options.rateLimit?.customStorage,
      enabled: options.rateLimit?.enabled,
      max: options.rateLimit?.max
    },
    onAPIError: {
      errorURL: options.onAPIError?.errorURL,
      onError: !!options.onAPIError?.onError,
      throw: options.onAPIError?.throw
    },
    logger: {
      disabled: options.logger?.disabled,
      level: options.logger?.level,
      log: !!options.logger?.log
    },
    databaseHooks: {
      user: {
        create: {
          after: !!options.databaseHooks?.user?.create?.after,
          before: !!options.databaseHooks?.user?.create?.before
        },
        update: {
          after: !!options.databaseHooks?.user?.update?.after,
          before: !!options.databaseHooks?.user?.update?.before
        }
      },
      session: {
        create: {
          after: !!options.databaseHooks?.session?.create?.after,
          before: !!options.databaseHooks?.session?.create?.before
        },
        update: {
          after: !!options.databaseHooks?.session?.update?.after,
          before: !!options.databaseHooks?.session?.update?.before
        }
      },
      account: {
        create: {
          after: !!options.databaseHooks?.account?.create?.after,
          before: !!options.databaseHooks?.account?.create?.before
        },
        update: {
          after: !!options.databaseHooks?.account?.update?.after,
          before: !!options.databaseHooks?.account?.update?.before
        }
      },
      verification: {
        create: {
          after: !!options.databaseHooks?.verification?.create?.after,
          before: !!options.databaseHooks?.verification?.create?.before
        },
        update: {
          after: !!options.databaseHooks?.verification?.update?.after,
          before: !!options.databaseHooks?.verification?.update?.before
        }
      }
    }
  };
}
let packageJSONCache;
async function readRootPackageJson() {
  if (packageJSONCache) return packageJSONCache;
  try {
    const cwd = typeof process !== "undefined" && typeof process.cwd === "function" ? process.cwd() : "";
    if (!cwd) return void 0;
    const importRuntime$1 = (m) => Function("mm", "return import(mm)")(m);
    const [{ default: fs }, { default: path }] = await Promise.all([importRuntime$1("fs/promises"), importRuntime$1("path")]);
    const raw = await fs.readFile(path.join(cwd, "package.json"), "utf-8");
    packageJSONCache = JSON.parse(raw);
    return packageJSONCache;
  } catch {
  }
}
async function getPackageVersion(pkg) {
  if (packageJSONCache) return packageJSONCache.dependencies?.[pkg] || packageJSONCache.devDependencies?.[pkg] || packageJSONCache.peerDependencies?.[pkg];
  try {
    const cwd = typeof process !== "undefined" && typeof process.cwd === "function" ? process.cwd() : "";
    if (!cwd) throw new Error("no-cwd");
    const importRuntime$1 = (m) => Function("mm", "return import(mm)")(m);
    const [{ default: fs }, { default: path }] = await Promise.all([importRuntime$1("fs/promises"), importRuntime$1("path")]);
    const pkgJsonPath = path.join(cwd, "node_modules", pkg, "package.json");
    const raw = await fs.readFile(pkgJsonPath, "utf-8");
    return JSON.parse(raw).version || await getVersionFromLocalPackageJson(pkg) || void 0;
  } catch {
  }
  return await getVersionFromLocalPackageJson(pkg);
}
async function getVersionFromLocalPackageJson(pkg) {
  const json2 = await readRootPackageJson();
  if (!json2) return void 0;
  return {
    ...json2.dependencies,
    ...json2.devDependencies,
    ...json2.peerDependencies
  }[pkg];
}
async function getNameFromLocalPackageJson() {
  return (await readRootPackageJson())?.name;
}
const DATABASES = {
  pg: "postgresql",
  mysql: "mysql",
  mariadb: "mariadb",
  sqlite3: "sqlite",
  "better-sqlite3": "sqlite",
  "@prisma/client": "prisma",
  mongoose: "mongodb",
  mongodb: "mongodb",
  "drizzle-orm": "drizzle"
};
async function detectDatabase() {
  for (const [pkg, name] of Object.entries(DATABASES)) {
    const version = await getPackageVersion(pkg);
    if (version) return {
      name,
      version
    };
  }
}
const FRAMEWORKS = {
  next: "next",
  nuxt: "nuxt",
  "@remix-run/server-runtime": "remix",
  astro: "astro",
  "@sveltejs/kit": "sveltekit",
  "solid-start": "solid-start",
  "tanstack-start": "tanstack-start",
  hono: "hono",
  express: "express",
  elysia: "elysia",
  expo: "expo"
};
async function detectFramework() {
  for (const [pkg, name] of Object.entries(FRAMEWORKS)) {
    const version = await getPackageVersion(pkg);
    if (version) return {
      name,
      version
    };
  }
}
function detectPackageManager() {
  const userAgent = env$1.npm_config_user_agent;
  if (!userAgent) return;
  const pmSpec = userAgent.split(" ")[0];
  const separatorPos = pmSpec.lastIndexOf("/");
  const name = pmSpec.substring(0, separatorPos);
  return {
    name: name === "npminstall" ? "cnpm" : name,
    version: pmSpec.substring(separatorPos + 1)
  };
}
const importRuntime = (m) => {
  return Function("mm", "return import(mm)")(m);
};
function getVendor() {
  const hasAny = (...keys) => keys.some((k) => Boolean(env$1[k]));
  if (hasAny("CF_PAGES", "CF_PAGES_URL", "CF_ACCOUNT_ID") || typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers") return "cloudflare";
  if (hasAny("VERCEL", "VERCEL_URL", "VERCEL_ENV")) return "vercel";
  if (hasAny("NETLIFY", "NETLIFY_URL")) return "netlify";
  if (hasAny("RENDER", "RENDER_URL", "RENDER_INTERNAL_HOSTNAME", "RENDER_SERVICE_ID")) return "render";
  if (hasAny("AWS_LAMBDA_FUNCTION_NAME", "AWS_EXECUTION_ENV", "LAMBDA_TASK_ROOT")) return "aws";
  if (hasAny("GOOGLE_CLOUD_FUNCTION_NAME", "GOOGLE_CLOUD_PROJECT", "GCP_PROJECT", "K_SERVICE")) return "gcp";
  if (hasAny("AZURE_FUNCTION_NAME", "FUNCTIONS_WORKER_RUNTIME", "WEBSITE_INSTANCE_ID", "WEBSITE_SITE_NAME")) return "azure";
  if (hasAny("DENO_DEPLOYMENT_ID", "DENO_REGION")) return "deno-deploy";
  if (hasAny("FLY_APP_NAME", "FLY_REGION", "FLY_ALLOC_ID")) return "fly-io";
  if (hasAny("RAILWAY_STATIC_URL", "RAILWAY_ENVIRONMENT_NAME")) return "railway";
  if (hasAny("DYNO", "HEROKU_APP_NAME")) return "heroku";
  if (hasAny("DO_DEPLOYMENT_ID", "DO_APP_NAME", "DIGITALOCEAN")) return "digitalocean";
  if (hasAny("KOYEB", "KOYEB_DEPLOYMENT_ID", "KOYEB_APP_NAME")) return "koyeb";
  return null;
}
async function detectSystemInfo() {
  try {
    if (getVendor() === "cloudflare") return "cloudflare";
    const os = await importRuntime("os");
    const cpus = os.cpus();
    return {
      deploymentVendor: getVendor(),
      systemPlatform: os.platform(),
      systemRelease: os.release(),
      systemArchitecture: os.arch(),
      cpuCount: cpus.length,
      cpuModel: cpus.length ? cpus[0].model : null,
      cpuSpeed: cpus.length ? cpus[0].speed : null,
      memory: os.totalmem(),
      isWSL: await isWsl(),
      isDocker: await isDocker(),
      isTTY: typeof process !== "undefined" && process.stdout ? process.stdout.isTTY : null
    };
  } catch {
    return {
      systemPlatform: null,
      systemRelease: null,
      systemArchitecture: null,
      cpuCount: null,
      cpuModel: null,
      cpuSpeed: null,
      memory: null,
      isWSL: null,
      isDocker: null,
      isTTY: null
    };
  }
}
let isDockerCached;
async function hasDockerEnv() {
  if (getVendor() === "cloudflare") return false;
  try {
    (await importRuntime("fs")).statSync("/.dockerenv");
    return true;
  } catch {
    return false;
  }
}
async function hasDockerCGroup() {
  if (getVendor() === "cloudflare") return false;
  try {
    return (await importRuntime("fs")).readFileSync("/proc/self/cgroup", "utf8").includes("docker");
  } catch {
    return false;
  }
}
async function isDocker() {
  if (getVendor() === "cloudflare") return false;
  if (isDockerCached === void 0) isDockerCached = await hasDockerEnv() || await hasDockerCGroup();
  return isDockerCached;
}
async function isWsl() {
  try {
    if (getVendor() === "cloudflare") return false;
    if (typeof process === "undefined" || process?.platform !== "linux") return false;
    const fs = await importRuntime("fs");
    if ((await importRuntime("os")).release().toLowerCase().includes("microsoft")) {
      if (await isInsideContainer()) return false;
      return true;
    }
    return fs.readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft") ? !await isInsideContainer() : false;
  } catch {
    return false;
  }
}
let isInsideContainerCached;
const hasContainerEnv = async () => {
  if (getVendor() === "cloudflare") return false;
  try {
    (await importRuntime("fs")).statSync("/run/.containerenv");
    return true;
  } catch {
    return false;
  }
};
async function isInsideContainer() {
  if (isInsideContainerCached === void 0) isInsideContainerCached = await hasContainerEnv() || await isDocker();
  return isInsideContainerCached;
}
function isCI() {
  return env$1.CI !== "false" && ("BUILD_ID" in env$1 || "BUILD_NUMBER" in env$1 || "CI" in env$1 || "CI_APP_ID" in env$1 || "CI_BUILD_ID" in env$1 || "CI_BUILD_NUMBER" in env$1 || "CI_NAME" in env$1 || "CONTINUOUS_INTEGRATION" in env$1 || "RUN_ID" in env$1);
}
function detectRuntime() {
  if (typeof Deno !== "undefined") return {
    name: "deno",
    version: Deno?.version?.deno ?? null
  };
  if (typeof Bun !== "undefined") return {
    name: "bun",
    version: Bun?.version ?? null
  };
  if (typeof process !== "undefined" && process?.versions?.node) return {
    name: "node",
    version: process.versions.node ?? null
  };
  return {
    name: "edge",
    version: null
  };
}
function detectEnvironment() {
  return getEnvVar("NODE_ENV") === "production" ? "production" : isCI() ? "ci" : isTest() ? "test" : "development";
}
async function hashToBase64(data) {
  const buffer = await createHash("SHA-256").digest(data);
  return base64.encode(buffer);
}
const generateId = (size) => {
  return createRandomStringGenerator("a-z", "A-Z", "0-9")(size);
};
let projectIdCached = null;
async function getProjectId(baseUrl) {
  if (projectIdCached) return projectIdCached;
  const projectName = await getNameFromLocalPackageJson();
  if (projectName) {
    projectIdCached = await hashToBase64(baseUrl ? baseUrl + projectName : projectName);
    return projectIdCached;
  }
  if (baseUrl) {
    projectIdCached = await hashToBase64(baseUrl);
    return projectIdCached;
  }
  projectIdCached = generateId(32);
  return projectIdCached;
}
async function createTelemetry(options, context) {
  const debugEnabled = options.telemetry?.debug || getBooleanEnvVar("BETTER_AUTH_TELEMETRY_DEBUG", false);
  const TELEMETRY_ENDPOINT = ENV.BETTER_AUTH_TELEMETRY_ENDPOINT;
  const track = async (event) => {
    if (context?.customTrack) await context.customTrack(event).catch(logger.error);
    else if (debugEnabled) logger.info("telemetry event", JSON.stringify(event, null, 2));
    else await betterFetch(TELEMETRY_ENDPOINT, {
      method: "POST",
      body: event
    }).catch(logger.error);
  };
  const isEnabled = async () => {
    const telemetryEnabled = options.telemetry?.enabled !== void 0 ? options.telemetry.enabled : false;
    return (getBooleanEnvVar("BETTER_AUTH_TELEMETRY", false) || telemetryEnabled) && (context?.skipTestCheck || !isTest());
  };
  const enabled = await isEnabled();
  let anonymousId;
  if (enabled) {
    anonymousId = await getProjectId(options.baseURL);
    track({
      type: "init",
      payload: {
        config: getTelemetryAuthConfig(options, context),
        runtime: detectRuntime(),
        database: await detectDatabase(),
        framework: await detectFramework(),
        environment: detectEnvironment(),
        systemInfo: await detectSystemInfo(),
        packageManager: detectPackageManager()
      },
      anonymousId
    });
  }
  return { publish: async (event) => {
    if (!enabled) return;
    if (!anonymousId) anonymousId = await getProjectId(options.baseURL);
    await track({
      type: event.type,
      payload: event.payload,
      anonymousId
    });
  } };
}
function estimateEntropy(str) {
  const unique = new Set(str).size;
  if (unique === 0) return 0;
  return Math.log2(Math.pow(unique, str.length));
}
function validateSecret(secret, logger$1) {
  const isDefaultSecret = secret === DEFAULT_SECRET;
  if (isTest()) return;
  if (isDefaultSecret && isProduction) throw new BetterAuthError("You are using the default secret. Please set `BETTER_AUTH_SECRET` in your environment variables or pass `secret` in your auth config.");
  if (secret.length < 32) logger$1.warn(`[better-auth] Warning: your BETTER_AUTH_SECRET should be at least 32 characters long for adequate security. Generate one with \`npx @better-auth/cli secret\` or \`openssl rand -base64 32\`.`);
  if (estimateEntropy(secret) < 120) logger$1.warn("[better-auth] Warning: your BETTER_AUTH_SECRET appears low-entropy. Use a randomly generated secret for production.");
}
async function createAuthContext(adapter, options, getDatabaseType) {
  if (!options.database) options = defu(options, {
    session: { cookieCache: {
      enabled: true,
      strategy: "jwe",
      refreshCache: true
    } },
    account: {
      storeStateStrategy: "cookie",
      storeAccountCookie: true
    }
  });
  const plugins = options.plugins || [];
  const internalPlugins = getInternalPlugins(options);
  const logger$1 = createLogger(options.logger);
  const baseURL = getBaseURL(options.baseURL, options.basePath);
  if (!baseURL) logger$1.warn(`[better-auth] Base URL could not be determined. Please set a valid base URL using the baseURL config option or the BETTER_AUTH_BASE_URL environment variable. Without this, callbacks and redirects may not work correctly.`);
  const secret = options.secret || env$1.BETTER_AUTH_SECRET || env$1.AUTH_SECRET || DEFAULT_SECRET;
  validateSecret(secret, logger$1);
  options = {
    ...options,
    secret,
    baseURL: baseURL ? new URL(baseURL).origin : "",
    basePath: options.basePath || "/api/auth",
    plugins: plugins.concat(internalPlugins)
  };
  checkEndpointConflicts(options, logger$1);
  const cookies = getCookies(options);
  const tables = getAuthTables(options);
  const providers = Object.entries(options.socialProviders || {}).map(([key, config2]) => {
    if (config2 == null) return null;
    if (config2.enabled === false) return null;
    if (!config2.clientId) logger$1.warn(`Social provider ${key} is missing clientId or clientSecret`);
    const provider = socialProviders[key](config2);
    provider.disableImplicitSignUp = config2.disableImplicitSignUp;
    return provider;
  }).filter((x) => x !== null);
  const generateIdFunc = ({ model, size }) => {
    if (typeof options.advanced?.generateId === "function") return options.advanced.generateId({
      model,
      size
    });
    if (typeof options?.advanced?.database?.generateId === "function") return options.advanced.database.generateId({
      model,
      size
    });
    return generateId$1(size);
  };
  const { publish } = await createTelemetry(options, {
    adapter: adapter.id,
    database: typeof options.database === "function" ? "adapter" : getDatabaseType(options.database)
  });
  const initOrPromise = runPluginInit({
    appName: options.appName || "Better Auth",
    socialProviders: providers,
    options,
    oauthConfig: {
      storeStateStrategy: options.account?.storeStateStrategy || (options.database ? "database" : "cookie"),
      skipStateCookieCheck: !!options.account?.skipStateCookieCheck
    },
    tables,
    trustedOrigins: await getTrustedOrigins(options),
    isTrustedOrigin(url, settings) {
      return this.trustedOrigins.some((origin) => matchesOriginPattern(url, origin, settings));
    },
    baseURL: baseURL || "",
    sessionConfig: {
      updateAge: options.session?.updateAge !== void 0 ? options.session.updateAge : 1440 * 60,
      expiresIn: options.session?.expiresIn || 3600 * 24 * 7,
      freshAge: options.session?.freshAge === void 0 ? 3600 * 24 : options.session.freshAge,
      cookieRefreshCache: (() => {
        const refreshCache = options.session?.cookieCache?.refreshCache;
        const maxAge = options.session?.cookieCache?.maxAge || 300;
        if ((!!options.database || !!options.secondaryStorage) && refreshCache) {
          logger$1.warn("[better-auth] `session.cookieCache.refreshCache` is enabled while `database` or `secondaryStorage` is configured. `refreshCache` is meant for stateless (DB-less) setups. Disabling `refreshCache` — remove it from your config to silence this warning.");
          return false;
        }
        if (refreshCache === false || refreshCache === void 0) return false;
        if (refreshCache === true) return {
          enabled: true,
          updateAge: Math.floor(maxAge * 0.2)
        };
        return {
          enabled: true,
          updateAge: refreshCache.updateAge !== void 0 ? refreshCache.updateAge : Math.floor(maxAge * 0.2)
        };
      })()
    },
    secret,
    rateLimit: {
      ...options.rateLimit,
      enabled: options.rateLimit?.enabled ?? isProduction,
      window: options.rateLimit?.window || 10,
      max: options.rateLimit?.max || 100,
      storage: options.rateLimit?.storage || (options.secondaryStorage ? "secondary-storage" : "memory")
    },
    authCookies: cookies,
    logger: logger$1,
    generateId: generateIdFunc,
    session: null,
    secondaryStorage: options.secondaryStorage,
    password: {
      hash: options.emailAndPassword?.password?.hash || hashPassword,
      verify: options.emailAndPassword?.password?.verify || verifyPassword$1,
      config: {
        minPasswordLength: options.emailAndPassword?.minPasswordLength || 8,
        maxPasswordLength: options.emailAndPassword?.maxPasswordLength || 128
      },
      checkPassword
    },
    setNewSession(session) {
      this.newSession = session;
    },
    newSession: null,
    adapter,
    internalAdapter: createInternalAdapter(adapter, {
      options,
      logger: logger$1,
      hooks: options.databaseHooks ? [options.databaseHooks] : []
    }),
    createAuthCookie: createCookieGetter(options),
    async runMigrations() {
      throw new BetterAuthError("runMigrations will be set by the specific init implementation");
    },
    publishTelemetry: publish,
    skipCSRFCheck: !!options.advanced?.disableCSRFCheck,
    skipOriginCheck: options.advanced?.disableOriginCheck !== void 0 ? options.advanced.disableOriginCheck : isTest() ? true : false,
    runInBackground: options.advanced?.backgroundTasks?.handler ?? ((p) => {
      p.catch(() => {
      });
    }),
    async runInBackgroundOrAwait(promise) {
      try {
        if (options.advanced?.backgroundTasks?.handler) {
          if (promise instanceof Promise) options.advanced.backgroundTasks.handler(promise.catch((e) => {
            logger$1.error("Failed to run background task:", e);
          }));
        } else await promise;
      } catch (e) {
        logger$1.error("Failed to run background task:", e);
      }
    },
    getPlugin: (id) => options.plugins.find((p) => p.id === id) ?? null
  });
  let context;
  if (isPromise(initOrPromise)) ({ context } = await initOrPromise);
  else ({ context } = initOrPromise);
  if (typeof context.options.emailVerification?.onEmailVerification === "function") context.options.emailVerification.onEmailVerification = deprecate(context.options.emailVerification.onEmailVerification, "Use `afterEmailVerification` instead. This will be removed in 1.5", context.logger);
  return context;
}
const init = async (options) => {
  const adapter = await getAdapter(options);
  const getDatabaseType = (database) => getKyselyDatabaseType(database) || "unknown";
  const ctx = await createAuthContext(adapter, options, getDatabaseType);
  ctx.runMigrations = async function() {
    if (!options.database || "updateMany" in options.database) throw new BetterAuthError("Database is not provided or it's an adapter. Migrations are only supported with a database instance.");
    const { runMigrations } = await getMigrations(options);
    await runMigrations();
  };
  return ctx;
};
const createBetterAuth = (options, initFn) => {
  const authContext = initFn(options);
  const { api } = getEndpoints(authContext, options);
  return {
    handler: async (request) => {
      const ctx = await authContext;
      const basePath = ctx.options.basePath || "/api/auth";
      if (!ctx.options.baseURL) {
        const baseURL = getBaseURL(void 0, basePath, request, void 0, ctx.options.advanced?.trustedProxyHeaders);
        if (baseURL) {
          ctx.baseURL = baseURL;
          ctx.options.baseURL = getOrigin(ctx.baseURL) || void 0;
        } else throw new BetterAuthError("Could not get base URL from request. Please provide a valid base URL.");
      }
      ctx.trustedOrigins = await getTrustedOrigins(ctx.options, request);
      const { handler } = router(ctx, options);
      return runWithAdapter(ctx.adapter, () => handler(request));
    },
    api,
    options,
    $context: authContext,
    $ERROR_CODES: {
      ...options.plugins?.reduce((acc, plugin) => {
        if (plugin.$ERROR_CODES) return {
          ...acc,
          ...plugin.$ERROR_CODES
        };
        return acc;
      }, {}),
      ...BASE_ERROR_CODES
    }
  };
};
const betterAuth = (options) => {
  return createBetterAuth(options, init);
};
const drizzleAdapter = (db2, config2) => {
  let lazyOptions = null;
  const createCustomAdapter = (db$1) => ({ getFieldName, options }) => {
    function getSchema2(model) {
      const schema2 = config2.schema || db$1._.fullSchema;
      if (!schema2) throw new BetterAuthError("Drizzle adapter failed to initialize. Schema not found. Please provide a schema object in the adapter options object.");
      const schemaModel = schema2[model];
      if (!schemaModel) throw new BetterAuthError(`[# Drizzle Adapter]: The model "${model}" was not found in the schema object. Please pass the schema directly to the adapter options.`);
      return schemaModel;
    }
    const withReturning = async (model, builder, data, where) => {
      if (config2.provider !== "mysql") return (await builder.returning())[0];
      await builder.execute();
      const schemaModel = getSchema2(model);
      const builderVal = builder.config?.values;
      if (where?.length) {
        const clause = convertWhereClause(where.map((w) => {
          if (data[w.field] !== void 0) return {
            ...w,
            value: data[w.field]
          };
          return w;
        }), model);
        return (await db$1.select().from(schemaModel).where(...clause))[0];
      } else if (builderVal && builderVal[0]?.id?.value) {
        let tId = builderVal[0]?.id?.value;
        if (!tId) tId = (await db$1.select({ id: sql`LAST_INSERT_ID()` }).from(schemaModel).orderBy(desc(schemaModel.id)).limit(1))[0].id;
        return (await db$1.select().from(schemaModel).where(eq(schemaModel.id, tId)).limit(1).execute())[0];
      } else if (data.id) return (await db$1.select().from(schemaModel).where(eq(schemaModel.id, data.id)).limit(1).execute())[0];
      else {
        if (!("id" in schemaModel)) throw new BetterAuthError(`The model "${model}" does not have an "id" field. Please use the "id" field as your primary key.`);
        return (await db$1.select().from(schemaModel).orderBy(desc(schemaModel.id)).limit(1).execute())[0];
      }
    };
    function convertWhereClause(where, model) {
      const schemaModel = getSchema2(model);
      if (!where) return [];
      if (where.length === 1) {
        const w = where[0];
        if (!w) return [];
        const field = getFieldName({
          model,
          field: w.field
        });
        if (!schemaModel[field]) throw new BetterAuthError(`The field "${w.field}" does not exist in the schema for the model "${model}". Please update your schema.`);
        if (w.operator === "in") {
          if (!Array.isArray(w.value)) throw new BetterAuthError(`The value for the field "${w.field}" must be an array when using the "in" operator.`);
          return [inArray(schemaModel[field], w.value)];
        }
        if (w.operator === "not_in") {
          if (!Array.isArray(w.value)) throw new BetterAuthError(`The value for the field "${w.field}" must be an array when using the "not_in" operator.`);
          return [notInArray(schemaModel[field], w.value)];
        }
        if (w.operator === "contains") return [like(schemaModel[field], `%${w.value}%`)];
        if (w.operator === "starts_with") return [like(schemaModel[field], `${w.value}%`)];
        if (w.operator === "ends_with") return [like(schemaModel[field], `%${w.value}`)];
        if (w.operator === "lt") return [lt(schemaModel[field], w.value)];
        if (w.operator === "lte") return [lte(schemaModel[field], w.value)];
        if (w.operator === "ne") return [ne(schemaModel[field], w.value)];
        if (w.operator === "gt") return [gt(schemaModel[field], w.value)];
        if (w.operator === "gte") return [gte(schemaModel[field], w.value)];
        return [eq(schemaModel[field], w.value)];
      }
      const andGroup = where.filter((w) => w.connector === "AND" || !w.connector);
      const orGroup = where.filter((w) => w.connector === "OR");
      const andClause = and(...andGroup.map((w) => {
        const field = getFieldName({
          model,
          field: w.field
        });
        if (w.operator === "in") {
          if (!Array.isArray(w.value)) throw new BetterAuthError(`The value for the field "${w.field}" must be an array when using the "in" operator.`);
          return inArray(schemaModel[field], w.value);
        }
        if (w.operator === "not_in") {
          if (!Array.isArray(w.value)) throw new BetterAuthError(`The value for the field "${w.field}" must be an array when using the "not_in" operator.`);
          return notInArray(schemaModel[field], w.value);
        }
        if (w.operator === "contains") return like(schemaModel[field], `%${w.value}%`);
        if (w.operator === "starts_with") return like(schemaModel[field], `${w.value}%`);
        if (w.operator === "ends_with") return like(schemaModel[field], `%${w.value}`);
        if (w.operator === "lt") return lt(schemaModel[field], w.value);
        if (w.operator === "lte") return lte(schemaModel[field], w.value);
        if (w.operator === "gt") return gt(schemaModel[field], w.value);
        if (w.operator === "gte") return gte(schemaModel[field], w.value);
        if (w.operator === "ne") return ne(schemaModel[field], w.value);
        return eq(schemaModel[field], w.value);
      }));
      const orClause = or(...orGroup.map((w) => {
        const field = getFieldName({
          model,
          field: w.field
        });
        if (w.operator === "in") {
          if (!Array.isArray(w.value)) throw new BetterAuthError(`The value for the field "${w.field}" must be an array when using the "in" operator.`);
          return inArray(schemaModel[field], w.value);
        }
        if (w.operator === "not_in") {
          if (!Array.isArray(w.value)) throw new BetterAuthError(`The value for the field "${w.field}" must be an array when using the "not_in" operator.`);
          return notInArray(schemaModel[field], w.value);
        }
        if (w.operator === "contains") return like(schemaModel[field], `%${w.value}%`);
        if (w.operator === "starts_with") return like(schemaModel[field], `${w.value}%`);
        if (w.operator === "ends_with") return like(schemaModel[field], `%${w.value}`);
        if (w.operator === "lt") return lt(schemaModel[field], w.value);
        if (w.operator === "lte") return lte(schemaModel[field], w.value);
        if (w.operator === "gt") return gt(schemaModel[field], w.value);
        if (w.operator === "gte") return gte(schemaModel[field], w.value);
        if (w.operator === "ne") return ne(schemaModel[field], w.value);
        return eq(schemaModel[field], w.value);
      }));
      const clause = [];
      if (andGroup.length) clause.push(andClause);
      if (orGroup.length) clause.push(orClause);
      return clause;
    }
    function checkMissingFields(schema2, model, values) {
      if (!schema2) throw new BetterAuthError("Drizzle adapter failed to initialize. Drizzle Schema not found. Please provide a schema object in the adapter options object.");
      for (const key in values) if (!schema2[key]) throw new BetterAuthError(`The field "${key}" does not exist in the "${model}" Drizzle schema. Please update your drizzle schema or re-generate using "npx @better-auth/cli@latest generate".`);
    }
    return {
      async create({ model, data: values }) {
        const schemaModel = getSchema2(model);
        checkMissingFields(schemaModel, model, values);
        return await withReturning(model, db$1.insert(schemaModel).values(values), values);
      },
      async findOne({ model, where, join }) {
        const schemaModel = getSchema2(model);
        const clause = convertWhereClause(where, model);
        if (options.experimental?.joins) if (!db$1.query || !db$1.query[model]) {
          logger.error(`[# Drizzle Adapter]: The model "${model}" was not found in the query object. Please update your Drizzle schema to include relations or re-generate using "npx @better-auth/cli@latest generate".`);
          logger.info("Falling back to regular query");
        } else {
          let includes;
          const pluralJoinResults = [];
          if (join) {
            includes = {};
            const joinEntries = Object.entries(join);
            for (const [model$1, joinAttr] of joinEntries) {
              const limit = joinAttr.limit ?? options.advanced?.database?.defaultFindManyLimit ?? 100;
              const isUnique = joinAttr.relation === "one-to-one";
              const pluralSuffix = isUnique || config2.usePlural ? "" : "s";
              includes[`${model$1}${pluralSuffix}`] = isUnique ? true : { limit };
              if (!isUnique) pluralJoinResults.push(`${model$1}${pluralSuffix}`);
            }
          }
          const res$1 = await db$1.query[model].findFirst({
            where: clause[0],
            with: includes
          });
          if (res$1) for (const pluralJoinResult of pluralJoinResults) {
            let singularKey = !config2.usePlural ? pluralJoinResult.slice(0, -1) : pluralJoinResult;
            res$1[singularKey] = res$1[pluralJoinResult];
            if (pluralJoinResult !== singularKey) delete res$1[pluralJoinResult];
          }
          return res$1;
        }
        const res = await db$1.select().from(schemaModel).where(...clause);
        if (!res.length) return null;
        return res[0];
      },
      async findMany({ model, where, sortBy, limit, offset, join }) {
        const schemaModel = getSchema2(model);
        const clause = where ? convertWhereClause(where, model) : [];
        const sortFn = sortBy?.direction === "desc" ? desc : asc;
        if (options.experimental?.joins) if (!db$1.query[model]) {
          logger.error(`[# Drizzle Adapter]: The model "${model}" was not found in the query object. Please update your Drizzle schema to include relations or re-generate using "npx @better-auth/cli@latest generate".`);
          logger.info("Falling back to regular query");
        } else {
          let includes;
          const pluralJoinResults = [];
          if (join) {
            includes = {};
            const joinEntries = Object.entries(join);
            for (const [model$1, joinAttr] of joinEntries) {
              const isUnique = joinAttr.relation === "one-to-one";
              const limit$1 = joinAttr.limit ?? options.advanced?.database?.defaultFindManyLimit ?? 100;
              let pluralSuffix = isUnique || config2.usePlural ? "" : "s";
              includes[`${model$1}${pluralSuffix}`] = isUnique ? true : { limit: limit$1 };
              if (!isUnique) pluralJoinResults.push(`${model$1}${pluralSuffix}`);
            }
          }
          let orderBy = void 0;
          if (sortBy?.field) orderBy = [sortFn(schemaModel[getFieldName({
            model,
            field: sortBy?.field
          })])];
          let res = await db$1.query[model].findMany({
            where: clause[0],
            with: includes,
            limit: limit ?? 100,
            offset: offset ?? 0,
            orderBy
          });
          if (res) for (const item of res) for (const pluralJoinResult of pluralJoinResults) {
            const singularKey = !config2.usePlural ? pluralJoinResult.slice(0, -1) : pluralJoinResult;
            if (singularKey === pluralJoinResult) continue;
            item[singularKey] = item[pluralJoinResult];
            delete item[pluralJoinResult];
          }
          return res;
        }
        let builder = db$1.select().from(schemaModel);
        const effectiveLimit = limit;
        const effectiveOffset = offset;
        if (typeof effectiveLimit !== "undefined") builder = builder.limit(effectiveLimit);
        if (typeof effectiveOffset !== "undefined") builder = builder.offset(effectiveOffset);
        if (sortBy?.field) builder = builder.orderBy(sortFn(schemaModel[getFieldName({
          model,
          field: sortBy?.field
        })]));
        return await builder.where(...clause);
      },
      async count({ model, where }) {
        const schemaModel = getSchema2(model);
        const clause = where ? convertWhereClause(where, model) : [];
        return (await db$1.select({ count: count() }).from(schemaModel).where(...clause))[0].count;
      },
      async update({ model, where, update: values }) {
        const schemaModel = getSchema2(model);
        const clause = convertWhereClause(where, model);
        return await withReturning(model, db$1.update(schemaModel).set(values).where(...clause), values, where);
      },
      async updateMany({ model, where, update: values }) {
        const schemaModel = getSchema2(model);
        const clause = convertWhereClause(where, model);
        return await db$1.update(schemaModel).set(values).where(...clause);
      },
      async delete({ model, where }) {
        const schemaModel = getSchema2(model);
        const clause = convertWhereClause(where, model);
        return await db$1.delete(schemaModel).where(...clause);
      },
      async deleteMany({ model, where }) {
        const schemaModel = getSchema2(model);
        const clause = convertWhereClause(where, model);
        const res = await db$1.delete(schemaModel).where(...clause);
        let count$1 = 0;
        if (res && "rowCount" in res) count$1 = res.rowCount;
        else if (Array.isArray(res)) count$1 = res.length;
        else if (res && ("affectedRows" in res || "rowsAffected" in res || "changes" in res)) count$1 = res.affectedRows ?? res.rowsAffected ?? res.changes;
        if (typeof count$1 !== "number") logger.error("[Drizzle Adapter] The result of the deleteMany operation is not a number. This is likely a bug in the adapter. Please report this issue to the Better Auth team.", {
          res,
          model,
          where
        });
        return count$1;
      },
      options: config2
    };
  };
  let adapterOptions = null;
  adapterOptions = {
    config: {
      adapterId: "drizzle",
      adapterName: "Drizzle Adapter",
      usePlural: config2.usePlural ?? false,
      debugLogs: config2.debugLogs ?? false,
      supportsUUIDs: config2.provider === "pg" ? true : false,
      supportsJSON: config2.provider === "pg" ? true : false,
      supportsArrays: config2.provider === "pg" ? true : false,
      transaction: config2.transaction ?? false ? (cb) => db2.transaction((tx) => {
        return cb(createAdapterFactory({
          config: adapterOptions.config,
          adapter: createCustomAdapter(tx)
        })(lazyOptions));
      }) : false
    },
    adapter: createCustomAdapter(db2)
  };
  const adapter = createAdapterFactory(adapterOptions);
  return (options) => {
    lazyOptions = options;
    return adapter(options);
  };
};
const tanstackStartCookies = () => {
  return {
    id: "tanstack-start-cookies",
    hooks: { after: [{
      matcher(ctx) {
        return true;
      },
      handler: createAuthMiddleware(async (ctx) => {
        const returned = ctx.context.responseHeaders;
        if ("_flag" in ctx && ctx._flag === "router") return;
        if (returned instanceof Headers) {
          const setCookies = returned?.get("set-cookie");
          if (!setCookies) return;
          const parsed = parseSetCookieHeader(setCookies);
          const { setCookie: setCookie2 } = await Promise.resolve().then(function() {
            return serverB3h6sgq_;
          });
          parsed.forEach((value, key) => {
            if (!key) return;
            const opts = {
              sameSite: value.samesite,
              secure: value.secure,
              maxAge: value["max-age"],
              httpOnly: value.httponly,
              domain: value.domain,
              path: value.path
            };
            try {
              setCookie2(key, decodeURIComponent(value.value), opts);
            } catch {
            }
          });
          return;
        }
      })
    }] }
  };
};
const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean$2("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" })
});
const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  accounts,
  sessions,
  users,
  verifications
}, Symbol.toStringTag, { value: "Module" }));
const db = drizzle(process.env.DATABASE_URL, { schema });
const __vite_import_meta_env__ = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": true, "TSS_CLIENT_OUTPUT_DIR": "dist/client", "TSS_DEV_SERVER": "false", "TSS_ROUTER_BASEPATH": "", "TSS_SERVER_FN_BASE": "/_serverFn/", "VITE_SENTRY_DSN": "", "VITE_SENTRY_ORG": "", "VITE_SENTRY_PROJECT": "" };
const env = createEnv({
  server: {
    SERVER_URL: string().url().optional(),
    BETTER_AUTH_SECRET: string().min(32).optional(),
    GOOGLE_CLIENT_ID: string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: string().min(1).optional()
  },
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_",
  client: {
    VITE_APP_TITLE: string().min(1).optional(),
    VITE_BACKEND_URL: string().url(),
    VITE_SENTRY_DSN: string().optional(),
    VITE_BETTER_AUTH_SECRET: string().min(32).optional()
  },
  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   * We merge both since server variables (non-VITE_ prefixed) are in process.env
   * and client variables (VITE_ prefixed) are in import.meta.env.
   */
  runtimeEnv: {
    ...process.env,
    ...__vite_import_meta_env__
  },
  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true
});
const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications
    }
  }),
  plugins: [tanstackStartCookies()],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }
  },
  emailAndPassword: {
    enabled: true
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
      // 5 minutes
    }
  }
});
const server = {
  async fetch(req) {
    const url = new URL(req.url);
    const start = Date.now();
    console.log(`[${req.method}] \x1B[36m->\x1B[0m ${url.pathname}`);
    const logResponse = (res) => {
      const duration = Date.now() - start;
      const color = res.status >= 500 ? "\x1B[31m" : res.status >= 400 ? "\x1B[33m" : "\x1B[32m";
      console.log(
        `[${req.method}] ${color}<- ${res.status}\x1B[0m ${url.pathname} (${duration}ms)`
      );
      return res;
    };
    try {
      if (url.pathname.startsWith("/api/auth")) {
        return auth.handler(req).then(logResponse);
      }
      return paraglideMiddleware(req, () => server$1.fetch(req)).then(
        logResponse
      );
    } catch (e) {
      console.error(`[${req.method}] \x1B[31mERROR\x1B[0m ${url.pathname}`, e);
      throw e;
    }
  }
};
const serverB3h6sgq_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  HEADERS,
  StartServer,
  attachRouterServerSsrUtils,
  createStartHandler,
  defaultStreamHandler,
  defineHandlerCallback,
  getRequest,
  getResponse,
  requestHandler,
  setCookie,
  transformPipeableStreamWithRouter,
  transformReadableStreamWithRouter
});
export {
  HEADERS as H,
  StartServer as S,
  TSS_SERVER_FUNCTION as T,
  getResponse as a,
  createServerFn as b,
  createStartHandler as c,
  defaultStreamHandler as d,
  server as default,
  auth as e,
  createAdapterFactory as f,
  getRequest as g,
  createKyselyAdapter as h,
  getKyselyDatabaseType as i,
  env as j,
  getLocale as k,
  logger as l,
  locales as m,
  setLocale as n,
  getBaseURL as o,
  capitalizeFirstLetter as p,
  getServerFnById as q,
  requestHandler as r,
  setCookie as s,
  trackMessageCall as t,
  localizeUrl as u,
  deLocalizeUrl as v
};
