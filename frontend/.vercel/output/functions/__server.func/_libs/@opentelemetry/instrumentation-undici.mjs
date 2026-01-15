import diagch__default from "diagnostics_channel";
import require$$2$1 from "url";
import { r as require$$2 } from "./instrumentation.mjs";
import { r as require$$0 } from "./api.mjs";
import { r as require$$1 } from "./core.mjs";
import { r as require$$5 } from "./semantic-conventions.mjs";
var src = {};
var undici = {};
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.19.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-undici";
  return version;
}
var hasRequiredUndici;
function requireUndici() {
  if (hasRequiredUndici) return undici;
  hasRequiredUndici = 1;
  Object.defineProperty(undici, "__esModule", { value: true });
  undici.UndiciInstrumentation = void 0;
  const diagch = diagch__default;
  const url_1 = require$$2$1;
  const instrumentation_1 = require$$2;
  const api_1 = require$$0;
  const core_1 = require$$1;
  const semantic_conventions_1 = require$$5;
  const version_1 = /* @__PURE__ */ requireVersion();
  class UndiciInstrumentation extends instrumentation_1.InstrumentationBase {
    _recordFromReq = /* @__PURE__ */ new WeakMap();
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    // No need to instrument files/modules
    init() {
      return void 0;
    }
    disable() {
      super.disable();
      this._channelSubs.forEach((sub) => sub.unsubscribe());
      this._channelSubs.length = 0;
    }
    enable() {
      super.enable();
      this._channelSubs = this._channelSubs || [];
      if (this._channelSubs.length > 0) {
        return;
      }
      this.subscribeToChannel("undici:request:create", this.onRequestCreated.bind(this));
      this.subscribeToChannel("undici:client:sendHeaders", this.onRequestHeaders.bind(this));
      this.subscribeToChannel("undici:request:headers", this.onResponseHeaders.bind(this));
      this.subscribeToChannel("undici:request:trailers", this.onDone.bind(this));
      this.subscribeToChannel("undici:request:error", this.onError.bind(this));
    }
    _updateMetricInstruments() {
      this._httpClientDurationHistogram = this.meter.createHistogram(semantic_conventions_1.METRIC_HTTP_CLIENT_REQUEST_DURATION, {
        description: "Measures the duration of outbound HTTP requests.",
        unit: "s",
        valueType: api_1.ValueType.DOUBLE,
        advice: {
          explicitBucketBoundaries: [
            5e-3,
            0.01,
            0.025,
            0.05,
            0.075,
            0.1,
            0.25,
            0.5,
            0.75,
            1,
            2.5,
            5,
            7.5,
            10
          ]
        }
      });
    }
    subscribeToChannel(diagnosticChannel, onMessage) {
      const [major, minor] = process.version.replace("v", "").split(".").map((n) => Number(n));
      const useNewSubscribe = major > 18 || major === 18 && minor >= 19;
      let unsubscribe;
      if (useNewSubscribe) {
        diagch.subscribe?.(diagnosticChannel, onMessage);
        unsubscribe = () => diagch.unsubscribe?.(diagnosticChannel, onMessage);
      } else {
        const channel = diagch.channel(diagnosticChannel);
        channel.subscribe(onMessage);
        unsubscribe = () => channel.unsubscribe(onMessage);
      }
      this._channelSubs.push({
        name: diagnosticChannel,
        unsubscribe
      });
    }
    parseRequestHeaders(request) {
      const result = /* @__PURE__ */ new Map();
      if (Array.isArray(request.headers)) {
        for (let i = 0; i < request.headers.length; i += 2) {
          const key = request.headers[i];
          const value = request.headers[i + 1];
          if (typeof key === "string") {
            result.set(key.toLowerCase(), value);
          }
        }
      } else if (typeof request.headers === "string") {
        const headers = request.headers.split("\r\n");
        for (const line of headers) {
          if (!line) {
            continue;
          }
          const colonIndex = line.indexOf(":");
          if (colonIndex === -1) {
            continue;
          }
          const key = line.substring(0, colonIndex).toLowerCase();
          const value = line.substring(colonIndex + 1).trim();
          const allValues = result.get(key);
          if (allValues && Array.isArray(allValues)) {
            allValues.push(value);
          } else if (allValues) {
            result.set(key, [allValues, value]);
          } else {
            result.set(key, value);
          }
        }
      }
      return result;
    }
    // This is the 1st message we receive for each request (fired after request creation). Here we will
    // create the span and populate some atttributes, then link the span to the request for further
    // span processing
    onRequestCreated({ request }) {
      const config = this.getConfig();
      const enabled = config.enabled !== false;
      const shouldIgnoreReq = (0, instrumentation_1.safeExecuteInTheMiddle)(() => !enabled || request.method === "CONNECT" || config.ignoreRequestHook?.(request), (e) => e && this._diag.error("caught ignoreRequestHook error: ", e), true);
      if (shouldIgnoreReq) {
        return;
      }
      const startTime = (0, core_1.hrTime)();
      let requestUrl;
      try {
        requestUrl = new url_1.URL(request.path, request.origin);
      } catch (err) {
        this._diag.warn("could not determine url.full:", err);
        return;
      }
      const urlScheme = requestUrl.protocol.replace(":", "");
      const requestMethod = this.getRequestMethod(request.method);
      const attributes = {
        [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: requestMethod,
        [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD_ORIGINAL]: request.method,
        [semantic_conventions_1.ATTR_URL_FULL]: requestUrl.toString(),
        [semantic_conventions_1.ATTR_URL_PATH]: requestUrl.pathname,
        [semantic_conventions_1.ATTR_URL_QUERY]: requestUrl.search,
        [semantic_conventions_1.ATTR_URL_SCHEME]: urlScheme
      };
      const schemePorts = { https: "443", http: "80" };
      const serverAddress = requestUrl.hostname;
      const serverPort = requestUrl.port || schemePorts[urlScheme];
      attributes[semantic_conventions_1.ATTR_SERVER_ADDRESS] = serverAddress;
      if (serverPort && !isNaN(Number(serverPort))) {
        attributes[semantic_conventions_1.ATTR_SERVER_PORT] = Number(serverPort);
      }
      const headersMap = this.parseRequestHeaders(request);
      const userAgentValues = headersMap.get("user-agent");
      if (userAgentValues) {
        const userAgent = Array.isArray(userAgentValues) ? userAgentValues[userAgentValues.length - 1] : userAgentValues;
        attributes[semantic_conventions_1.ATTR_USER_AGENT_ORIGINAL] = userAgent;
      }
      const hookAttributes = (0, instrumentation_1.safeExecuteInTheMiddle)(() => config.startSpanHook?.(request), (e) => e && this._diag.error("caught startSpanHook error: ", e), true);
      if (hookAttributes) {
        Object.entries(hookAttributes).forEach(([key, val]) => {
          attributes[key] = val;
        });
      }
      const activeCtx = api_1.context.active();
      const currentSpan = api_1.trace.getSpan(activeCtx);
      let span;
      if (config.requireParentforSpans && (!currentSpan || !api_1.trace.isSpanContextValid(currentSpan.spanContext()))) {
        span = api_1.trace.wrapSpanContext(api_1.INVALID_SPAN_CONTEXT);
      } else {
        span = this.tracer.startSpan(requestMethod === "_OTHER" ? "HTTP" : requestMethod, {
          kind: api_1.SpanKind.CLIENT,
          attributes
        }, activeCtx);
      }
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => config.requestHook?.(span, request), (e) => e && this._diag.error("caught requestHook error: ", e), true);
      const requestContext = api_1.trace.setSpan(api_1.context.active(), span);
      const addedHeaders = {};
      api_1.propagation.inject(requestContext, addedHeaders);
      const headerEntries = Object.entries(addedHeaders);
      for (let i = 0; i < headerEntries.length; i++) {
        const [k, v] = headerEntries[i];
        if (typeof request.addHeader === "function") {
          request.addHeader(k, v);
        } else if (typeof request.headers === "string") {
          request.headers += `${k}: ${v}\r
`;
        } else if (Array.isArray(request.headers)) {
          request.headers.push(k, v);
        }
      }
      this._recordFromReq.set(request, { span, attributes, startTime });
    }
    // This is the 2nd message we receive for each request. It is fired when connection with
    // the remote is established and about to send the first byte. Here we do have info about the
    // remote address and port so we can populate some `network.*` attributes into the span
    onRequestHeaders({ request, socket }) {
      const record = this._recordFromReq.get(request);
      if (!record) {
        return;
      }
      const config = this.getConfig();
      const { span } = record;
      const { remoteAddress, remotePort } = socket;
      const spanAttributes = {
        [semantic_conventions_1.ATTR_NETWORK_PEER_ADDRESS]: remoteAddress,
        [semantic_conventions_1.ATTR_NETWORK_PEER_PORT]: remotePort
      };
      if (config.headersToSpanAttributes?.requestHeaders) {
        const headersToAttribs = new Set(config.headersToSpanAttributes.requestHeaders.map((n) => n.toLowerCase()));
        const headersMap = this.parseRequestHeaders(request);
        for (const [name, value] of headersMap.entries()) {
          if (headersToAttribs.has(name)) {
            const attrValue = Array.isArray(value) ? value.join(", ") : value;
            spanAttributes[`http.request.header.${name}`] = attrValue;
          }
        }
      }
      span.setAttributes(spanAttributes);
    }
    // This is the 3rd message we get for each request and it's fired when the server
    // headers are received, body may not be accessible yet.
    // From the response headers we can set the status and content length
    onResponseHeaders({ request, response }) {
      const record = this._recordFromReq.get(request);
      if (!record) {
        return;
      }
      const { span, attributes } = record;
      const spanAttributes = {
        [semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]: response.statusCode
      };
      const config = this.getConfig();
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => config.responseHook?.(span, { request, response }), (e) => e && this._diag.error("caught responseHook error: ", e), true);
      const headersToAttribs = /* @__PURE__ */ new Set();
      if (config.headersToSpanAttributes?.responseHeaders) {
        config.headersToSpanAttributes?.responseHeaders.forEach((name) => headersToAttribs.add(name.toLowerCase()));
      }
      for (let idx = 0; idx < response.headers.length; idx = idx + 2) {
        const name = response.headers[idx].toString().toLowerCase();
        const value = response.headers[idx + 1];
        if (headersToAttribs.has(name)) {
          spanAttributes[`http.response.header.${name}`] = value.toString();
        }
        if (name === "content-length") {
          const contentLength = Number(value.toString());
          if (!isNaN(contentLength)) {
            spanAttributes["http.response.header.content-length"] = contentLength;
          }
        }
      }
      span.setAttributes(spanAttributes);
      span.setStatus({
        code: response.statusCode >= 400 ? api_1.SpanStatusCode.ERROR : api_1.SpanStatusCode.UNSET
      });
      record.attributes = Object.assign(attributes, spanAttributes);
    }
    // This is the last event we receive if the request went without any errors
    onDone({ request }) {
      const record = this._recordFromReq.get(request);
      if (!record) {
        return;
      }
      const { span, attributes, startTime } = record;
      span.end();
      this._recordFromReq.delete(request);
      this.recordRequestDuration(attributes, startTime);
    }
    // This is the event we get when something is wrong in the request like
    // - invalid options when calling `fetch` global API or any undici method for request
    // - connectivity errors such as unreachable host
    // - requests aborted through an `AbortController.signal`
    // NOTE: server errors are considered valid responses and it's the lib consumer
    // who should deal with that.
    onError({ request, error }) {
      const record = this._recordFromReq.get(request);
      if (!record) {
        return;
      }
      const { span, attributes, startTime } = record;
      span.recordException(error);
      span.setStatus({
        code: api_1.SpanStatusCode.ERROR,
        message: error.message
      });
      span.end();
      this._recordFromReq.delete(request);
      attributes[semantic_conventions_1.ATTR_ERROR_TYPE] = error.message;
      this.recordRequestDuration(attributes, startTime);
    }
    recordRequestDuration(attributes, startTime) {
      const metricsAttributes = {};
      const keysToCopy = [
        semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE,
        semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD,
        semantic_conventions_1.ATTR_SERVER_ADDRESS,
        semantic_conventions_1.ATTR_SERVER_PORT,
        semantic_conventions_1.ATTR_URL_SCHEME,
        semantic_conventions_1.ATTR_ERROR_TYPE
      ];
      keysToCopy.forEach((key) => {
        if (key in attributes) {
          metricsAttributes[key] = attributes[key];
        }
      });
      const durationSeconds = (0, core_1.hrTimeToMilliseconds)((0, core_1.hrTimeDuration)(startTime, (0, core_1.hrTime)())) / 1e3;
      this._httpClientDurationHistogram.record(durationSeconds, metricsAttributes);
    }
    getRequestMethod(original) {
      const knownMethods = {
        CONNECT: true,
        OPTIONS: true,
        HEAD: true,
        GET: true,
        POST: true,
        PUT: true,
        PATCH: true,
        DELETE: true,
        TRACE: true
      };
      if (original.toUpperCase() in knownMethods) {
        return original.toUpperCase();
      }
      return "_OTHER";
    }
  }
  undici.UndiciInstrumentation = UndiciInstrumentation;
  return undici;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.UndiciInstrumentation = void 0;
    var undici_1 = /* @__PURE__ */ requireUndici();
    Object.defineProperty(exports$1, "UndiciInstrumentation", { enumerable: true, get: function() {
      return undici_1.UndiciInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
