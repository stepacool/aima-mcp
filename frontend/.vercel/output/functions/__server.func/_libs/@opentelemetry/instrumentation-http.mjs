import { r as require$$0 } from "./api.mjs";
import { a as require$$1 } from "./core.mjs";
import require$$2 from "url";
import { r as require$$2$1 } from "./instrumentation.mjs";
import require$$0$1 from "events";
import { r as require$$5 } from "./semantic-conventions.mjs";
import { r as requireForwardedParse } from "../forwarded-parse.mjs";
var src = {};
var http = {};
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.VERSION = void 0;
  version.VERSION = "0.208.0";
  return version;
}
var utils = {};
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.HTTP_FLAVOR_VALUE_HTTP_1_1 = semconv.NET_TRANSPORT_VALUE_IP_UDP = semconv.NET_TRANSPORT_VALUE_IP_TCP = semconv.ATTR_NET_TRANSPORT = semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_NET_PEER_IP = semconv.ATTR_NET_HOST_PORT = semconv.ATTR_NET_HOST_NAME = semconv.ATTR_NET_HOST_IP = semconv.ATTR_HTTP_USER_AGENT = semconv.ATTR_HTTP_URL = semconv.ATTR_HTTP_TARGET = semconv.ATTR_HTTP_STATUS_CODE = semconv.ATTR_HTTP_SERVER_NAME = semconv.ATTR_HTTP_SCHEME = semconv.ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = semconv.ATTR_HTTP_RESPONSE_CONTENT_LENGTH = semconv.ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = semconv.ATTR_HTTP_REQUEST_CONTENT_LENGTH = semconv.ATTR_HTTP_METHOD = semconv.ATTR_HTTP_HOST = semconv.ATTR_HTTP_FLAVOR = semconv.ATTR_HTTP_CLIENT_IP = semconv.USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST = semconv.USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT = semconv.ATTR_USER_AGENT_SYNTHETIC_TYPE = void 0;
  semconv.ATTR_USER_AGENT_SYNTHETIC_TYPE = "user_agent.synthetic.type";
  semconv.USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT = "bot";
  semconv.USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST = "test";
  semconv.ATTR_HTTP_CLIENT_IP = "http.client_ip";
  semconv.ATTR_HTTP_FLAVOR = "http.flavor";
  semconv.ATTR_HTTP_HOST = "http.host";
  semconv.ATTR_HTTP_METHOD = "http.method";
  semconv.ATTR_HTTP_REQUEST_CONTENT_LENGTH = "http.request_content_length";
  semconv.ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = "http.request_content_length_uncompressed";
  semconv.ATTR_HTTP_RESPONSE_CONTENT_LENGTH = "http.response_content_length";
  semconv.ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = "http.response_content_length_uncompressed";
  semconv.ATTR_HTTP_SCHEME = "http.scheme";
  semconv.ATTR_HTTP_SERVER_NAME = "http.server_name";
  semconv.ATTR_HTTP_STATUS_CODE = "http.status_code";
  semconv.ATTR_HTTP_TARGET = "http.target";
  semconv.ATTR_HTTP_URL = "http.url";
  semconv.ATTR_HTTP_USER_AGENT = "http.user_agent";
  semconv.ATTR_NET_HOST_IP = "net.host.ip";
  semconv.ATTR_NET_HOST_NAME = "net.host.name";
  semconv.ATTR_NET_HOST_PORT = "net.host.port";
  semconv.ATTR_NET_PEER_IP = "net.peer.ip";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv.ATTR_NET_TRANSPORT = "net.transport";
  semconv.NET_TRANSPORT_VALUE_IP_TCP = "ip_tcp";
  semconv.NET_TRANSPORT_VALUE_IP_UDP = "ip_udp";
  semconv.HTTP_FLAVOR_VALUE_HTTP_1_1 = "1.1";
  return semconv;
}
var AttributeNames = {};
var hasRequiredAttributeNames;
function requireAttributeNames() {
  if (hasRequiredAttributeNames) return AttributeNames;
  hasRequiredAttributeNames = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["HTTP_ERROR_NAME"] = "http.error_name";
      AttributeNames2["HTTP_ERROR_MESSAGE"] = "http.error_message";
      AttributeNames2["HTTP_STATUS_TEXT"] = "http.status_text";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames);
  return AttributeNames;
}
var internalTypes = {};
var hasRequiredInternalTypes;
function requireInternalTypes() {
  if (hasRequiredInternalTypes) return internalTypes;
  hasRequiredInternalTypes = 1;
  Object.defineProperty(internalTypes, "__esModule", { value: true });
  internalTypes.DEFAULT_QUERY_STRINGS_TO_REDACT = internalTypes.STR_REDACTED = internalTypes.SYNTHETIC_BOT_NAMES = internalTypes.SYNTHETIC_TEST_NAMES = void 0;
  internalTypes.SYNTHETIC_TEST_NAMES = ["alwayson"];
  internalTypes.SYNTHETIC_BOT_NAMES = ["googlebot", "bingbot"];
  internalTypes.STR_REDACTED = "REDACTED";
  internalTypes.DEFAULT_QUERY_STRINGS_TO_REDACT = [
    "sig",
    "Signature",
    "AWSAccessKeyId",
    "X-Goog-Signature"
  ];
  return internalTypes;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.headerCapture = exports$1.getIncomingStableRequestMetricAttributesOnResponse = exports$1.getIncomingRequestMetricAttributesOnResponse = exports$1.getIncomingRequestAttributesOnResponse = exports$1.getIncomingRequestMetricAttributes = exports$1.getIncomingRequestAttributes = exports$1.getRemoteClientAddress = exports$1.getOutgoingStableRequestMetricAttributesOnResponse = exports$1.getOutgoingRequestMetricAttributesOnResponse = exports$1.getOutgoingRequestAttributesOnResponse = exports$1.setAttributesFromHttpKind = exports$1.getOutgoingRequestMetricAttributes = exports$1.getOutgoingRequestAttributes = exports$1.extractHostnameAndPort = exports$1.isValidOptionsType = exports$1.getRequestInfo = exports$1.isCompressed = exports$1.setResponseContentLengthAttribute = exports$1.setRequestContentLengthAttribute = exports$1.setSpanWithError = exports$1.satisfiesPattern = exports$1.parseResponseStatus = exports$1.getAbsoluteUrl = void 0;
    const api_1 = require$$0;
    const semantic_conventions_1 = require$$5;
    const semconv_1 = /* @__PURE__ */ requireSemconv();
    const core_1 = require$$1;
    const instrumentation_1 = require$$2$1;
    const url = require$$2;
    const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
    const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
    const internal_types_2 = /* @__PURE__ */ requireInternalTypes();
    const forwardedParse = /* @__PURE__ */ requireForwardedParse();
    const getAbsoluteUrl = (requestUrl, headers, fallbackProtocol = "http:", redactedQueryParams = Array.from(internal_types_2.DEFAULT_QUERY_STRINGS_TO_REDACT)) => {
      const reqUrlObject = requestUrl || {};
      const protocol = reqUrlObject.protocol || fallbackProtocol;
      const port = (reqUrlObject.port || "").toString();
      let path = reqUrlObject.path || "/";
      let host = reqUrlObject.host || reqUrlObject.hostname || headers.host || "localhost";
      if (host.indexOf(":") === -1 && port && port !== "80" && port !== "443") {
        host += `:${port}`;
      }
      if (path.includes("?")) {
        const parsedUrl = url.parse(path);
        const pathname = parsedUrl.pathname || "";
        const query = parsedUrl.query || "";
        const searchParams = new URLSearchParams(query);
        const sensitiveParamsToRedact = redactedQueryParams || [];
        for (const sensitiveParam of sensitiveParamsToRedact) {
          if (searchParams.has(sensitiveParam) && searchParams.get(sensitiveParam) !== "") {
            searchParams.set(sensitiveParam, internal_types_2.STR_REDACTED);
          }
        }
        const redactedQuery = searchParams.toString();
        path = `${pathname}?${redactedQuery}`;
      }
      const authPart = reqUrlObject.auth ? `${internal_types_2.STR_REDACTED}:${internal_types_2.STR_REDACTED}@` : "";
      return `${protocol}//${authPart}${host}${path}`;
    };
    exports$1.getAbsoluteUrl = getAbsoluteUrl;
    const parseResponseStatus = (kind, statusCode) => {
      const upperBound = kind === api_1.SpanKind.CLIENT ? 400 : 500;
      if (statusCode && statusCode >= 100 && statusCode < upperBound) {
        return api_1.SpanStatusCode.UNSET;
      }
      return api_1.SpanStatusCode.ERROR;
    };
    exports$1.parseResponseStatus = parseResponseStatus;
    const satisfiesPattern = (constant, pattern) => {
      if (typeof pattern === "string") {
        return pattern === constant;
      } else if (pattern instanceof RegExp) {
        return pattern.test(constant);
      } else if (typeof pattern === "function") {
        return pattern(constant);
      } else {
        throw new TypeError("Pattern is in unsupported datatype");
      }
    };
    exports$1.satisfiesPattern = satisfiesPattern;
    const setSpanWithError = (span, error, semconvStability) => {
      const message = error.message;
      if (semconvStability & instrumentation_1.SemconvStability.OLD) {
        span.setAttribute(AttributeNames_1.AttributeNames.HTTP_ERROR_NAME, error.name);
        span.setAttribute(AttributeNames_1.AttributeNames.HTTP_ERROR_MESSAGE, message);
      }
      if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
        span.setAttribute(semantic_conventions_1.ATTR_ERROR_TYPE, error.name);
      }
      span.setStatus({ code: api_1.SpanStatusCode.ERROR, message });
      span.recordException(error);
    };
    exports$1.setSpanWithError = setSpanWithError;
    const setRequestContentLengthAttribute = (request, attributes) => {
      const length = getContentLength(request.headers);
      if (length === null)
        return;
      if ((0, exports$1.isCompressed)(request.headers)) {
        attributes[semconv_1.ATTR_HTTP_REQUEST_CONTENT_LENGTH] = length;
      } else {
        attributes[semconv_1.ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED] = length;
      }
    };
    exports$1.setRequestContentLengthAttribute = setRequestContentLengthAttribute;
    const setResponseContentLengthAttribute = (response, attributes) => {
      const length = getContentLength(response.headers);
      if (length === null)
        return;
      if ((0, exports$1.isCompressed)(response.headers)) {
        attributes[semconv_1.ATTR_HTTP_RESPONSE_CONTENT_LENGTH] = length;
      } else {
        attributes[semconv_1.ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED] = length;
      }
    };
    exports$1.setResponseContentLengthAttribute = setResponseContentLengthAttribute;
    function getContentLength(headers) {
      const contentLengthHeader = headers["content-length"];
      if (contentLengthHeader === void 0)
        return null;
      const contentLength = parseInt(contentLengthHeader, 10);
      if (isNaN(contentLength))
        return null;
      return contentLength;
    }
    const isCompressed = (headers) => {
      const encoding = headers["content-encoding"];
      return !!encoding && encoding !== "identity";
    };
    exports$1.isCompressed = isCompressed;
    function stringUrlToHttpOptions(stringUrl) {
      const { hostname, pathname, port, username, password, search, protocol, hash, href, origin, host } = new URL(stringUrl);
      const options = {
        protocol,
        hostname: hostname && hostname[0] === "[" ? hostname.slice(1, -1) : hostname,
        hash,
        search,
        pathname,
        path: `${pathname || ""}${search || ""}`,
        href,
        origin,
        host
      };
      if (port !== "") {
        options.port = Number(port);
      }
      if (username || password) {
        options.auth = `${decodeURIComponent(username)}:${decodeURIComponent(password)}`;
      }
      return options;
    }
    const getRequestInfo = (logger, options, extraOptions) => {
      let pathname;
      let origin;
      let optionsParsed;
      let invalidUrl = false;
      if (typeof options === "string") {
        try {
          const convertedOptions = stringUrlToHttpOptions(options);
          optionsParsed = convertedOptions;
          pathname = convertedOptions.pathname || "/";
        } catch (e) {
          invalidUrl = true;
          logger.verbose("Unable to parse URL provided to HTTP request, using fallback to determine path. Original error:", e);
          optionsParsed = {
            path: options
          };
          pathname = optionsParsed.path || "/";
        }
        origin = `${optionsParsed.protocol || "http:"}//${optionsParsed.host}`;
        if (extraOptions !== void 0) {
          Object.assign(optionsParsed, extraOptions);
        }
      } else if (options instanceof url.URL) {
        optionsParsed = {
          protocol: options.protocol,
          hostname: typeof options.hostname === "string" && options.hostname.startsWith("[") ? options.hostname.slice(1, -1) : options.hostname,
          path: `${options.pathname || ""}${options.search || ""}`
        };
        if (options.port !== "") {
          optionsParsed.port = Number(options.port);
        }
        if (options.username || options.password) {
          optionsParsed.auth = `${options.username}:${options.password}`;
        }
        pathname = options.pathname;
        origin = options.origin;
        if (extraOptions !== void 0) {
          Object.assign(optionsParsed, extraOptions);
        }
      } else {
        optionsParsed = Object.assign({ protocol: options.host ? "http:" : void 0 }, options);
        const hostname = optionsParsed.host || (optionsParsed.port != null ? `${optionsParsed.hostname}${optionsParsed.port}` : optionsParsed.hostname);
        origin = `${optionsParsed.protocol || "http:"}//${hostname}`;
        pathname = options.pathname;
        if (!pathname && optionsParsed.path) {
          try {
            const parsedUrl = new URL(optionsParsed.path, origin);
            pathname = parsedUrl.pathname || "/";
          } catch {
            pathname = "/";
          }
        }
      }
      const method = optionsParsed.method ? optionsParsed.method.toUpperCase() : "GET";
      return { origin, pathname, method, optionsParsed, invalidUrl };
    };
    exports$1.getRequestInfo = getRequestInfo;
    const isValidOptionsType = (options) => {
      if (!options) {
        return false;
      }
      const type = typeof options;
      return type === "string" || type === "object" && !Array.isArray(options);
    };
    exports$1.isValidOptionsType = isValidOptionsType;
    const extractHostnameAndPort = (requestOptions) => {
      if (requestOptions.hostname && requestOptions.port) {
        return { hostname: requestOptions.hostname, port: requestOptions.port };
      }
      const matches = requestOptions.host?.match(/^([^:/ ]+)(:\d{1,5})?/) || null;
      const hostname = requestOptions.hostname || (matches === null ? "localhost" : matches[1]);
      let port = requestOptions.port;
      if (!port) {
        if (matches && matches[2]) {
          port = matches[2].substring(1);
        } else {
          port = requestOptions.protocol === "https:" ? "443" : "80";
        }
      }
      return { hostname, port };
    };
    exports$1.extractHostnameAndPort = extractHostnameAndPort;
    const getOutgoingRequestAttributes = (requestOptions, options, semconvStability, enableSyntheticSourceDetection) => {
      const hostname = options.hostname;
      const port = options.port;
      const method = requestOptions.method ?? "GET";
      const normalizedMethod = normalizeMethod(method);
      const headers = requestOptions.headers || {};
      const userAgent = headers["user-agent"];
      const urlFull = (0, exports$1.getAbsoluteUrl)(requestOptions, headers, `${options.component}:`, options.redactedQueryParams);
      const oldAttributes = {
        [semconv_1.ATTR_HTTP_URL]: urlFull,
        [semconv_1.ATTR_HTTP_METHOD]: method,
        [semconv_1.ATTR_HTTP_TARGET]: requestOptions.path || "/",
        [semconv_1.ATTR_NET_PEER_NAME]: hostname,
        [semconv_1.ATTR_HTTP_HOST]: headers.host ?? `${hostname}:${port}`
      };
      const newAttributes = {
        // Required attributes
        [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: normalizedMethod,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: hostname,
        [semantic_conventions_1.ATTR_SERVER_PORT]: Number(port),
        [semantic_conventions_1.ATTR_URL_FULL]: urlFull,
        [semantic_conventions_1.ATTR_USER_AGENT_ORIGINAL]: userAgent
        // leaving out protocol version, it is not yet negotiated
        // leaving out protocol name, it is only required when protocol version is set
        // retries and redirects not supported
        // Opt-in attributes left off for now
      };
      if (method !== normalizedMethod) {
        newAttributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = method;
      }
      if (enableSyntheticSourceDetection && userAgent) {
        newAttributes[semconv_1.ATTR_USER_AGENT_SYNTHETIC_TYPE] = getSyntheticType(userAgent);
      }
      if (userAgent !== void 0) {
        oldAttributes[semconv_1.ATTR_HTTP_USER_AGENT] = userAgent;
      }
      switch (semconvStability) {
        case instrumentation_1.SemconvStability.STABLE:
          return Object.assign(newAttributes, options.hookAttributes);
        case instrumentation_1.SemconvStability.OLD:
          return Object.assign(oldAttributes, options.hookAttributes);
      }
      return Object.assign(oldAttributes, newAttributes, options.hookAttributes);
    };
    exports$1.getOutgoingRequestAttributes = getOutgoingRequestAttributes;
    const getOutgoingRequestMetricAttributes = (spanAttributes) => {
      const metricAttributes = {};
      metricAttributes[semconv_1.ATTR_HTTP_METHOD] = spanAttributes[semconv_1.ATTR_HTTP_METHOD];
      metricAttributes[semconv_1.ATTR_NET_PEER_NAME] = spanAttributes[semconv_1.ATTR_NET_PEER_NAME];
      return metricAttributes;
    };
    exports$1.getOutgoingRequestMetricAttributes = getOutgoingRequestMetricAttributes;
    const setAttributesFromHttpKind = (kind, attributes) => {
      if (kind) {
        attributes[semconv_1.ATTR_HTTP_FLAVOR] = kind;
        if (kind.toUpperCase() !== "QUIC") {
          attributes[semconv_1.ATTR_NET_TRANSPORT] = semconv_1.NET_TRANSPORT_VALUE_IP_TCP;
        } else {
          attributes[semconv_1.ATTR_NET_TRANSPORT] = semconv_1.NET_TRANSPORT_VALUE_IP_UDP;
        }
      }
    };
    exports$1.setAttributesFromHttpKind = setAttributesFromHttpKind;
    const getSyntheticType = (userAgent) => {
      const userAgentString = String(userAgent).toLowerCase();
      for (const name of internal_types_1.SYNTHETIC_TEST_NAMES) {
        if (userAgentString.includes(name)) {
          return semconv_1.USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST;
        }
      }
      for (const name of internal_types_1.SYNTHETIC_BOT_NAMES) {
        if (userAgentString.includes(name)) {
          return semconv_1.USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT;
        }
      }
      return;
    };
    const getOutgoingRequestAttributesOnResponse = (response, semconvStability) => {
      const { statusCode, statusMessage, httpVersion, socket } = response;
      const oldAttributes = {};
      const stableAttributes = {};
      if (statusCode != null) {
        stableAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = statusCode;
      }
      if (socket) {
        const { remoteAddress, remotePort } = socket;
        oldAttributes[semconv_1.ATTR_NET_PEER_IP] = remoteAddress;
        oldAttributes[semconv_1.ATTR_NET_PEER_PORT] = remotePort;
        stableAttributes[semantic_conventions_1.ATTR_NETWORK_PEER_ADDRESS] = remoteAddress;
        stableAttributes[semantic_conventions_1.ATTR_NETWORK_PEER_PORT] = remotePort;
        stableAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = response.httpVersion;
      }
      (0, exports$1.setResponseContentLengthAttribute)(response, oldAttributes);
      if (statusCode) {
        oldAttributes[semconv_1.ATTR_HTTP_STATUS_CODE] = statusCode;
        oldAttributes[AttributeNames_1.AttributeNames.HTTP_STATUS_TEXT] = (statusMessage || "").toUpperCase();
      }
      (0, exports$1.setAttributesFromHttpKind)(httpVersion, oldAttributes);
      switch (semconvStability) {
        case instrumentation_1.SemconvStability.STABLE:
          return stableAttributes;
        case instrumentation_1.SemconvStability.OLD:
          return oldAttributes;
      }
      return Object.assign(oldAttributes, stableAttributes);
    };
    exports$1.getOutgoingRequestAttributesOnResponse = getOutgoingRequestAttributesOnResponse;
    const getOutgoingRequestMetricAttributesOnResponse = (spanAttributes) => {
      const metricAttributes = {};
      metricAttributes[semconv_1.ATTR_NET_PEER_PORT] = spanAttributes[semconv_1.ATTR_NET_PEER_PORT];
      metricAttributes[semconv_1.ATTR_HTTP_STATUS_CODE] = spanAttributes[semconv_1.ATTR_HTTP_STATUS_CODE];
      metricAttributes[semconv_1.ATTR_HTTP_FLAVOR] = spanAttributes[semconv_1.ATTR_HTTP_FLAVOR];
      return metricAttributes;
    };
    exports$1.getOutgoingRequestMetricAttributesOnResponse = getOutgoingRequestMetricAttributesOnResponse;
    const getOutgoingStableRequestMetricAttributesOnResponse = (spanAttributes) => {
      const metricAttributes = {};
      if (spanAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]) {
        metricAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = spanAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION];
      }
      if (spanAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]) {
        metricAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = spanAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE];
      }
      return metricAttributes;
    };
    exports$1.getOutgoingStableRequestMetricAttributesOnResponse = getOutgoingStableRequestMetricAttributesOnResponse;
    function parseHostHeader(hostHeader, proto) {
      const parts = hostHeader.split(":");
      if (parts.length === 1) {
        if (proto === "http") {
          return { host: parts[0], port: "80" };
        }
        if (proto === "https") {
          return { host: parts[0], port: "443" };
        }
        return { host: parts[0] };
      }
      if (parts.length === 2) {
        return {
          host: parts[0],
          port: parts[1]
        };
      }
      if (parts[0].startsWith("[")) {
        if (parts[parts.length - 1].endsWith("]")) {
          if (proto === "http") {
            return { host: hostHeader, port: "80" };
          }
          if (proto === "https") {
            return { host: hostHeader, port: "443" };
          }
        } else if (parts[parts.length - 2].endsWith("]")) {
          return {
            host: parts.slice(0, -1).join(":"),
            port: parts[parts.length - 1]
          };
        }
      }
      return { host: hostHeader };
    }
    function getServerAddress(request, component) {
      const forwardedHeader = request.headers["forwarded"];
      if (forwardedHeader) {
        for (const entry of parseForwardedHeader(forwardedHeader)) {
          if (entry.host) {
            return parseHostHeader(entry.host, entry.proto);
          }
        }
      }
      const xForwardedHost = request.headers["x-forwarded-host"];
      if (typeof xForwardedHost === "string") {
        if (typeof request.headers["x-forwarded-proto"] === "string") {
          return parseHostHeader(xForwardedHost, request.headers["x-forwarded-proto"]);
        }
        if (Array.isArray(request.headers["x-forwarded-proto"])) {
          return parseHostHeader(xForwardedHost, request.headers["x-forwarded-proto"][0]);
        }
        return parseHostHeader(xForwardedHost);
      } else if (Array.isArray(xForwardedHost) && typeof xForwardedHost[0] === "string" && xForwardedHost[0].length > 0) {
        if (typeof request.headers["x-forwarded-proto"] === "string") {
          return parseHostHeader(xForwardedHost[0], request.headers["x-forwarded-proto"]);
        }
        if (Array.isArray(request.headers["x-forwarded-proto"])) {
          return parseHostHeader(xForwardedHost[0], request.headers["x-forwarded-proto"][0]);
        }
        return parseHostHeader(xForwardedHost[0]);
      }
      const host = request.headers["host"];
      if (typeof host === "string" && host.length > 0) {
        return parseHostHeader(host, component);
      }
      return null;
    }
    function getRemoteClientAddress(request) {
      const forwardedHeader = request.headers["forwarded"];
      if (forwardedHeader) {
        for (const entry of parseForwardedHeader(forwardedHeader)) {
          if (entry.for) {
            return removePortFromAddress(entry.for);
          }
        }
      }
      const xForwardedFor = request.headers["x-forwarded-for"];
      if (xForwardedFor) {
        let xForwardedForVal;
        if (typeof xForwardedFor === "string") {
          xForwardedForVal = xForwardedFor;
        } else if (Array.isArray(xForwardedFor)) {
          xForwardedForVal = xForwardedFor[0];
        }
        if (typeof xForwardedForVal === "string") {
          xForwardedForVal = xForwardedForVal.split(",")[0].trim();
          return removePortFromAddress(xForwardedForVal);
        }
      }
      const remote = request.socket.remoteAddress;
      if (remote) {
        return remote;
      }
      return null;
    }
    exports$1.getRemoteClientAddress = getRemoteClientAddress;
    function removePortFromAddress(input) {
      try {
        const { hostname: address } = new URL(`http://${input}`);
        if (address.startsWith("[") && address.endsWith("]")) {
          return address.slice(1, -1);
        }
        return address;
      } catch {
        return input;
      }
    }
    function getInfoFromIncomingMessage(component, request, logger) {
      try {
        if (request.headers.host) {
          return new URL(request.url ?? "/", `${component}://${request.headers.host}`);
        } else {
          const unsafeParsedUrl = new URL(
            request.url ?? "/",
            // using localhost as a workaround to still use the URL constructor for parsing
            `${component}://localhost`
          );
          return {
            pathname: unsafeParsedUrl.pathname,
            search: unsafeParsedUrl.search,
            toString: function() {
              return unsafeParsedUrl.pathname + unsafeParsedUrl.search;
            }
          };
        }
      } catch (e) {
        logger.verbose("Unable to get URL from request", e);
        return {};
      }
    }
    const getIncomingRequestAttributes = (request, options, logger) => {
      const headers = request.headers;
      const userAgent = headers["user-agent"];
      const ips = headers["x-forwarded-for"];
      const httpVersion = request.httpVersion;
      const host = headers.host;
      const hostname = host?.replace(/^(.*)(:[0-9]{1,5})/, "$1") || "localhost";
      const method = request.method;
      const normalizedMethod = normalizeMethod(method);
      const serverAddress = getServerAddress(request, options.component);
      const serverName = options.serverName;
      const remoteClientAddress = getRemoteClientAddress(request);
      const newAttributes = {
        [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: normalizedMethod,
        [semantic_conventions_1.ATTR_URL_SCHEME]: options.component,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: serverAddress?.host,
        [semantic_conventions_1.ATTR_NETWORK_PEER_ADDRESS]: request.socket.remoteAddress,
        [semantic_conventions_1.ATTR_NETWORK_PEER_PORT]: request.socket.remotePort,
        [semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]: request.httpVersion,
        [semantic_conventions_1.ATTR_USER_AGENT_ORIGINAL]: userAgent
      };
      const parsedUrl = getInfoFromIncomingMessage(options.component, request, logger);
      if (parsedUrl?.pathname != null) {
        newAttributes[semantic_conventions_1.ATTR_URL_PATH] = parsedUrl.pathname;
      }
      if (parsedUrl.search) {
        newAttributes[semantic_conventions_1.ATTR_URL_QUERY] = parsedUrl.search.slice(1);
      }
      if (remoteClientAddress != null) {
        newAttributes[semantic_conventions_1.ATTR_CLIENT_ADDRESS] = remoteClientAddress;
      }
      if (serverAddress?.port != null) {
        newAttributes[semantic_conventions_1.ATTR_SERVER_PORT] = Number(serverAddress.port);
      }
      if (method !== normalizedMethod) {
        newAttributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = method;
      }
      if (options.enableSyntheticSourceDetection && userAgent) {
        newAttributes[semconv_1.ATTR_USER_AGENT_SYNTHETIC_TYPE] = getSyntheticType(userAgent);
      }
      const oldAttributes = {
        [semconv_1.ATTR_HTTP_URL]: parsedUrl.toString(),
        [semconv_1.ATTR_HTTP_HOST]: host,
        [semconv_1.ATTR_NET_HOST_NAME]: hostname,
        [semconv_1.ATTR_HTTP_METHOD]: method,
        [semconv_1.ATTR_HTTP_SCHEME]: options.component
      };
      if (typeof ips === "string") {
        oldAttributes[semconv_1.ATTR_HTTP_CLIENT_IP] = ips.split(",")[0];
      }
      if (typeof serverName === "string") {
        oldAttributes[semconv_1.ATTR_HTTP_SERVER_NAME] = serverName;
      }
      if (parsedUrl?.pathname) {
        oldAttributes[semconv_1.ATTR_HTTP_TARGET] = parsedUrl?.pathname + parsedUrl?.search || "/";
      }
      if (userAgent !== void 0) {
        oldAttributes[semconv_1.ATTR_HTTP_USER_AGENT] = userAgent;
      }
      (0, exports$1.setRequestContentLengthAttribute)(request, oldAttributes);
      (0, exports$1.setAttributesFromHttpKind)(httpVersion, oldAttributes);
      switch (options.semconvStability) {
        case instrumentation_1.SemconvStability.STABLE:
          return Object.assign(newAttributes, options.hookAttributes);
        case instrumentation_1.SemconvStability.OLD:
          return Object.assign(oldAttributes, options.hookAttributes);
      }
      return Object.assign(oldAttributes, newAttributes, options.hookAttributes);
    };
    exports$1.getIncomingRequestAttributes = getIncomingRequestAttributes;
    const getIncomingRequestMetricAttributes = (spanAttributes) => {
      const metricAttributes = {};
      metricAttributes[semconv_1.ATTR_HTTP_SCHEME] = spanAttributes[semconv_1.ATTR_HTTP_SCHEME];
      metricAttributes[semconv_1.ATTR_HTTP_METHOD] = spanAttributes[semconv_1.ATTR_HTTP_METHOD];
      metricAttributes[semconv_1.ATTR_NET_HOST_NAME] = spanAttributes[semconv_1.ATTR_NET_HOST_NAME];
      metricAttributes[semconv_1.ATTR_HTTP_FLAVOR] = spanAttributes[semconv_1.ATTR_HTTP_FLAVOR];
      return metricAttributes;
    };
    exports$1.getIncomingRequestMetricAttributes = getIncomingRequestMetricAttributes;
    const getIncomingRequestAttributesOnResponse = (request, response, semconvStability) => {
      const { socket } = request;
      const { statusCode, statusMessage } = response;
      const newAttributes = {
        [semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode
      };
      const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
      const oldAttributes = {};
      if (socket) {
        const { localAddress, localPort, remoteAddress, remotePort } = socket;
        oldAttributes[semconv_1.ATTR_NET_HOST_IP] = localAddress;
        oldAttributes[semconv_1.ATTR_NET_HOST_PORT] = localPort;
        oldAttributes[semconv_1.ATTR_NET_PEER_IP] = remoteAddress;
        oldAttributes[semconv_1.ATTR_NET_PEER_PORT] = remotePort;
      }
      oldAttributes[semconv_1.ATTR_HTTP_STATUS_CODE] = statusCode;
      oldAttributes[AttributeNames_1.AttributeNames.HTTP_STATUS_TEXT] = (statusMessage || "").toUpperCase();
      if (rpcMetadata?.type === core_1.RPCType.HTTP && rpcMetadata.route !== void 0) {
        oldAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] = rpcMetadata.route;
        newAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] = rpcMetadata.route;
      }
      switch (semconvStability) {
        case instrumentation_1.SemconvStability.STABLE:
          return newAttributes;
        case instrumentation_1.SemconvStability.OLD:
          return oldAttributes;
      }
      return Object.assign(oldAttributes, newAttributes);
    };
    exports$1.getIncomingRequestAttributesOnResponse = getIncomingRequestAttributesOnResponse;
    const getIncomingRequestMetricAttributesOnResponse = (spanAttributes) => {
      const metricAttributes = {};
      metricAttributes[semconv_1.ATTR_HTTP_STATUS_CODE] = spanAttributes[semconv_1.ATTR_HTTP_STATUS_CODE];
      metricAttributes[semconv_1.ATTR_NET_HOST_PORT] = spanAttributes[semconv_1.ATTR_NET_HOST_PORT];
      if (spanAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] !== void 0) {
        metricAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] = spanAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE];
      }
      return metricAttributes;
    };
    exports$1.getIncomingRequestMetricAttributesOnResponse = getIncomingRequestMetricAttributesOnResponse;
    const getIncomingStableRequestMetricAttributesOnResponse = (spanAttributes) => {
      const metricAttributes = {};
      if (spanAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] !== void 0) {
        metricAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] = spanAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE];
      }
      if (spanAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]) {
        metricAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = spanAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE];
      }
      return metricAttributes;
    };
    exports$1.getIncomingStableRequestMetricAttributesOnResponse = getIncomingStableRequestMetricAttributesOnResponse;
    function headerCapture(type, headers) {
      const normalizedHeaders = /* @__PURE__ */ new Map();
      for (let i = 0, len = headers.length; i < len; i++) {
        const capturedHeader = headers[i].toLowerCase();
        normalizedHeaders.set(capturedHeader, capturedHeader.replace(/-/g, "_"));
      }
      return (span, getHeader) => {
        for (const capturedHeader of normalizedHeaders.keys()) {
          const value = getHeader(capturedHeader);
          if (value === void 0) {
            continue;
          }
          const normalizedHeader = normalizedHeaders.get(capturedHeader);
          const key = `http.${type}.header.${normalizedHeader}`;
          if (typeof value === "string") {
            span.setAttribute(key, [value]);
          } else if (Array.isArray(value)) {
            span.setAttribute(key, value);
          } else {
            span.setAttribute(key, [value]);
          }
        }
      };
    }
    exports$1.headerCapture = headerCapture;
    const KNOWN_METHODS = /* @__PURE__ */ new Set([
      // methods from https://www.rfc-editor.org/rfc/rfc9110.html#name-methods
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "DELETE",
      "CONNECT",
      "OPTIONS",
      "TRACE",
      // PATCH from https://www.rfc-editor.org/rfc/rfc5789.html
      "PATCH"
    ]);
    function normalizeMethod(method) {
      if (method == null) {
        return "GET";
      }
      const upper = method.toUpperCase();
      if (KNOWN_METHODS.has(upper)) {
        return upper;
      }
      return "_OTHER";
    }
    function parseForwardedHeader(header) {
      try {
        return forwardedParse(header);
      } catch {
        return [];
      }
    }
  })(utils);
  return utils;
}
var hasRequiredHttp;
function requireHttp() {
  if (hasRequiredHttp) return http;
  hasRequiredHttp = 1;
  Object.defineProperty(http, "__esModule", { value: true });
  http.HttpInstrumentation = void 0;
  const api_1 = require$$0;
  const core_1 = require$$1;
  const url = require$$2;
  const version_1 = /* @__PURE__ */ requireVersion();
  const instrumentation_1 = require$$2$1;
  const events_1 = require$$0$1;
  const semantic_conventions_1 = require$$5;
  const utils_1 = /* @__PURE__ */ requireUtils();
  class HttpInstrumentation extends instrumentation_1.InstrumentationBase {
    /** keep track on spans not ended */
    _spanNotEnded = /* @__PURE__ */ new WeakSet();
    _headerCapture;
    _semconvStability = instrumentation_1.SemconvStability.OLD;
    constructor(config = {}) {
      super("@opentelemetry/instrumentation-http", version_1.VERSION, config);
      this._headerCapture = this._createHeaderCapture();
      this._semconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    _updateMetricInstruments() {
      this._oldHttpServerDurationHistogram = this.meter.createHistogram("http.server.duration", {
        description: "Measures the duration of inbound HTTP requests.",
        unit: "ms",
        valueType: api_1.ValueType.DOUBLE
      });
      this._oldHttpClientDurationHistogram = this.meter.createHistogram("http.client.duration", {
        description: "Measures the duration of outbound HTTP requests.",
        unit: "ms",
        valueType: api_1.ValueType.DOUBLE
      });
      this._stableHttpServerDurationHistogram = this.meter.createHistogram(semantic_conventions_1.METRIC_HTTP_SERVER_REQUEST_DURATION, {
        description: "Duration of HTTP server requests.",
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
      this._stableHttpClientDurationHistogram = this.meter.createHistogram(semantic_conventions_1.METRIC_HTTP_CLIENT_REQUEST_DURATION, {
        description: "Duration of HTTP client requests.",
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
    _recordServerDuration(durationMs, oldAttributes, stableAttributes) {
      if (this._semconvStability & instrumentation_1.SemconvStability.OLD) {
        this._oldHttpServerDurationHistogram.record(durationMs, oldAttributes);
      }
      if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
        this._stableHttpServerDurationHistogram.record(durationMs / 1e3, stableAttributes);
      }
    }
    _recordClientDuration(durationMs, oldAttributes, stableAttributes) {
      if (this._semconvStability & instrumentation_1.SemconvStability.OLD) {
        this._oldHttpClientDurationHistogram.record(durationMs, oldAttributes);
      }
      if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
        this._stableHttpClientDurationHistogram.record(durationMs / 1e3, stableAttributes);
      }
    }
    setConfig(config = {}) {
      super.setConfig(config);
      this._headerCapture = this._createHeaderCapture();
    }
    init() {
      return [this._getHttpsInstrumentation(), this._getHttpInstrumentation()];
    }
    _getHttpInstrumentation() {
      return new instrumentation_1.InstrumentationNodeModuleDefinition("http", ["*"], (moduleExports) => {
        const isESM = moduleExports[Symbol.toStringTag] === "Module";
        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          const patchedRequest = this._wrap(moduleExports, "request", this._getPatchOutgoingRequestFunction("http"));
          const patchedGet = this._wrap(moduleExports, "get", this._getPatchOutgoingGetFunction(patchedRequest));
          if (isESM) {
            moduleExports.default.request = patchedRequest;
            moduleExports.default.get = patchedGet;
          }
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          this._wrap(moduleExports.Server.prototype, "emit", this._getPatchIncomingRequestFunction("http"));
        }
        return moduleExports;
      }, (moduleExports) => {
        if (moduleExports === void 0)
          return;
        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          this._unwrap(moduleExports, "request");
          this._unwrap(moduleExports, "get");
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          this._unwrap(moduleExports.Server.prototype, "emit");
        }
      });
    }
    _getHttpsInstrumentation() {
      return new instrumentation_1.InstrumentationNodeModuleDefinition("https", ["*"], (moduleExports) => {
        const isESM = moduleExports[Symbol.toStringTag] === "Module";
        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          const patchedRequest = this._wrap(moduleExports, "request", this._getPatchHttpsOutgoingRequestFunction("https"));
          const patchedGet = this._wrap(moduleExports, "get", this._getPatchHttpsOutgoingGetFunction(patchedRequest));
          if (isESM) {
            moduleExports.default.request = patchedRequest;
            moduleExports.default.get = patchedGet;
          }
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          this._wrap(moduleExports.Server.prototype, "emit", this._getPatchIncomingRequestFunction("https"));
        }
        return moduleExports;
      }, (moduleExports) => {
        if (moduleExports === void 0)
          return;
        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          this._unwrap(moduleExports, "request");
          this._unwrap(moduleExports, "get");
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          this._unwrap(moduleExports.Server.prototype, "emit");
        }
      });
    }
    /**
     * Creates spans for incoming requests, restoring spans' context if applied.
     */
    _getPatchIncomingRequestFunction(component) {
      return (original) => {
        return this._incomingRequestFunction(component, original);
      };
    }
    /**
     * Creates spans for outgoing requests, sending spans' context for distributed
     * tracing.
     */
    _getPatchOutgoingRequestFunction(component) {
      return (original) => {
        return this._outgoingRequestFunction(component, original);
      };
    }
    _getPatchOutgoingGetFunction(clientRequest) {
      return (_original) => {
        return function outgoingGetRequest(options, ...args) {
          const req = clientRequest(options, ...args);
          req.end();
          return req;
        };
      };
    }
    /** Patches HTTPS outgoing requests */
    _getPatchHttpsOutgoingRequestFunction(component) {
      return (original) => {
        const instrumentation = this;
        return function httpsOutgoingRequest(options, ...args) {
          if (component === "https" && typeof options === "object" && options?.constructor?.name !== "URL") {
            options = Object.assign({}, options);
            instrumentation._setDefaultOptions(options);
          }
          return instrumentation._getPatchOutgoingRequestFunction(component)(original)(options, ...args);
        };
      };
    }
    _setDefaultOptions(options) {
      options.protocol = options.protocol || "https:";
      options.port = options.port || 443;
    }
    /** Patches HTTPS outgoing get requests */
    _getPatchHttpsOutgoingGetFunction(clientRequest) {
      return (original) => {
        const instrumentation = this;
        return function httpsOutgoingRequest(options, ...args) {
          return instrumentation._getPatchOutgoingGetFunction(clientRequest)(original)(options, ...args);
        };
      };
    }
    /**
     * Attach event listeners to a client request to end span and add span attributes.
     *
     * @param request The original request object.
     * @param span representing the current operation
     * @param startTime representing the start time of the request to calculate duration in Metric
     * @param oldMetricAttributes metric attributes for old semantic conventions
     * @param stableMetricAttributes metric attributes for new semantic conventions
     */
    _traceClientRequest(request, span, startTime, oldMetricAttributes, stableMetricAttributes) {
      if (this.getConfig().requestHook) {
        this._callRequestHook(span, request);
      }
      let responseFinished = false;
      request.prependListener("response", (response) => {
        this._diag.debug("outgoingRequest on response()");
        if (request.listenerCount("response") <= 1) {
          response.resume();
        }
        const responseAttributes = (0, utils_1.getOutgoingRequestAttributesOnResponse)(response, this._semconvStability);
        span.setAttributes(responseAttributes);
        oldMetricAttributes = Object.assign(oldMetricAttributes, (0, utils_1.getOutgoingRequestMetricAttributesOnResponse)(responseAttributes));
        stableMetricAttributes = Object.assign(stableMetricAttributes, (0, utils_1.getOutgoingStableRequestMetricAttributesOnResponse)(responseAttributes));
        if (this.getConfig().responseHook) {
          this._callResponseHook(span, response);
        }
        this._headerCapture.client.captureRequestHeaders(span, (header) => request.getHeader(header));
        this._headerCapture.client.captureResponseHeaders(span, (header) => response.headers[header]);
        api_1.context.bind(api_1.context.active(), response);
        const endHandler = () => {
          this._diag.debug("outgoingRequest on end()");
          if (responseFinished) {
            return;
          }
          responseFinished = true;
          let status;
          if (response.aborted && !response.complete) {
            status = { code: api_1.SpanStatusCode.ERROR };
          } else {
            status = {
              code: (0, utils_1.parseResponseStatus)(api_1.SpanKind.CLIENT, response.statusCode)
            };
          }
          span.setStatus(status);
          if (this.getConfig().applyCustomAttributesOnSpan) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(() => this.getConfig().applyCustomAttributesOnSpan(span, request, response), () => {
            }, true);
          }
          this._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
        };
        response.on("end", endHandler);
        response.on(events_1.errorMonitor, (error) => {
          this._diag.debug("outgoingRequest on error()", error);
          if (responseFinished) {
            return;
          }
          responseFinished = true;
          this._onOutgoingRequestError(span, oldMetricAttributes, stableMetricAttributes, startTime, error);
        });
      });
      request.on("close", () => {
        this._diag.debug("outgoingRequest on request close()");
        if (request.aborted || responseFinished) {
          return;
        }
        responseFinished = true;
        this._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
      });
      request.on(events_1.errorMonitor, (error) => {
        this._diag.debug("outgoingRequest on request error()", error);
        if (responseFinished) {
          return;
        }
        responseFinished = true;
        this._onOutgoingRequestError(span, oldMetricAttributes, stableMetricAttributes, startTime, error);
      });
      this._diag.debug("http.ClientRequest return request");
      return request;
    }
    _incomingRequestFunction(component, original) {
      const instrumentation = this;
      return function incomingRequest(event, ...args) {
        if (event !== "request") {
          return original.apply(this, [event, ...args]);
        }
        const request = args[0];
        const response = args[1];
        const method = request.method || "GET";
        instrumentation._diag.debug(`${component} instrumentation incomingRequest`);
        if ((0, instrumentation_1.safeExecuteInTheMiddle)(() => instrumentation.getConfig().ignoreIncomingRequestHook?.(request), (e) => {
          if (e != null) {
            instrumentation._diag.error("caught ignoreIncomingRequestHook error: ", e);
          }
        }, true)) {
          return api_1.context.with((0, core_1.suppressTracing)(api_1.context.active()), () => {
            api_1.context.bind(api_1.context.active(), request);
            api_1.context.bind(api_1.context.active(), response);
            return original.apply(this, [event, ...args]);
          });
        }
        const headers = request.headers;
        const spanAttributes = (0, utils_1.getIncomingRequestAttributes)(request, {
          component,
          serverName: instrumentation.getConfig().serverName,
          hookAttributes: instrumentation._callStartSpanHook(request, instrumentation.getConfig().startIncomingSpanHook),
          semconvStability: instrumentation._semconvStability,
          enableSyntheticSourceDetection: instrumentation.getConfig().enableSyntheticSourceDetection || false
        }, instrumentation._diag);
        const spanOptions = {
          kind: api_1.SpanKind.SERVER,
          attributes: spanAttributes
        };
        const startTime = (0, core_1.hrTime)();
        const oldMetricAttributes = (0, utils_1.getIncomingRequestMetricAttributes)(spanAttributes);
        const stableMetricAttributes = {
          [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: spanAttributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD],
          [semantic_conventions_1.ATTR_URL_SCHEME]: spanAttributes[semantic_conventions_1.ATTR_URL_SCHEME]
        };
        if (spanAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]) {
          stableMetricAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = spanAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION];
        }
        const ctx = api_1.propagation.extract(api_1.ROOT_CONTEXT, headers);
        const span = instrumentation._startHttpSpan(method, spanOptions, ctx);
        const rpcMetadata = {
          type: core_1.RPCType.HTTP,
          span
        };
        return api_1.context.with((0, core_1.setRPCMetadata)(api_1.trace.setSpan(ctx, span), rpcMetadata), () => {
          api_1.context.bind(api_1.context.active(), request);
          api_1.context.bind(api_1.context.active(), response);
          if (instrumentation.getConfig().requestHook) {
            instrumentation._callRequestHook(span, request);
          }
          if (instrumentation.getConfig().responseHook) {
            instrumentation._callResponseHook(span, response);
          }
          instrumentation._headerCapture.server.captureRequestHeaders(span, (header) => request.headers[header]);
          let hasError = false;
          response.on("close", () => {
            if (hasError) {
              return;
            }
            instrumentation._onServerResponseFinish(request, response, span, oldMetricAttributes, stableMetricAttributes, startTime);
          });
          response.on(events_1.errorMonitor, (err) => {
            hasError = true;
            instrumentation._onServerResponseError(span, oldMetricAttributes, stableMetricAttributes, startTime, err);
          });
          return (0, instrumentation_1.safeExecuteInTheMiddle)(() => original.apply(this, [event, ...args]), (error) => {
            if (error) {
              instrumentation._onServerResponseError(span, oldMetricAttributes, stableMetricAttributes, startTime, error);
              throw error;
            }
          });
        });
      };
    }
    _outgoingRequestFunction(component, original) {
      const instrumentation = this;
      return function outgoingRequest(options, ...args) {
        if (!(0, utils_1.isValidOptionsType)(options)) {
          return original.apply(this, [options, ...args]);
        }
        const extraOptions = typeof args[0] === "object" && (typeof options === "string" || options instanceof url.URL) ? args.shift() : void 0;
        const { method, invalidUrl, optionsParsed } = (0, utils_1.getRequestInfo)(instrumentation._diag, options, extraOptions);
        if ((0, instrumentation_1.safeExecuteInTheMiddle)(() => instrumentation.getConfig().ignoreOutgoingRequestHook?.(optionsParsed), (e) => {
          if (e != null) {
            instrumentation._diag.error("caught ignoreOutgoingRequestHook error: ", e);
          }
        }, true)) {
          return original.apply(this, [optionsParsed, ...args]);
        }
        const { hostname, port } = (0, utils_1.extractHostnameAndPort)(optionsParsed);
        const attributes = (0, utils_1.getOutgoingRequestAttributes)(optionsParsed, {
          component,
          port,
          hostname,
          hookAttributes: instrumentation._callStartSpanHook(optionsParsed, instrumentation.getConfig().startOutgoingSpanHook),
          redactedQueryParams: instrumentation.getConfig().redactedQueryParams
          // Added config for adding custom query strings
        }, instrumentation._semconvStability, instrumentation.getConfig().enableSyntheticSourceDetection || false);
        const startTime = (0, core_1.hrTime)();
        const oldMetricAttributes = (0, utils_1.getOutgoingRequestMetricAttributes)(attributes);
        const stableMetricAttributes = {
          [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: attributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD],
          [semantic_conventions_1.ATTR_SERVER_ADDRESS]: attributes[semantic_conventions_1.ATTR_SERVER_ADDRESS],
          [semantic_conventions_1.ATTR_SERVER_PORT]: attributes[semantic_conventions_1.ATTR_SERVER_PORT]
        };
        if (attributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]) {
          stableMetricAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = attributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE];
        }
        if (attributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]) {
          stableMetricAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = attributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION];
        }
        const spanOptions = {
          kind: api_1.SpanKind.CLIENT,
          attributes
        };
        const span = instrumentation._startHttpSpan(method, spanOptions);
        const parentContext = api_1.context.active();
        const requestContext = api_1.trace.setSpan(parentContext, span);
        if (!optionsParsed.headers) {
          optionsParsed.headers = {};
        } else {
          optionsParsed.headers = Object.assign({}, optionsParsed.headers);
        }
        api_1.propagation.inject(requestContext, optionsParsed.headers);
        return api_1.context.with(requestContext, () => {
          const cb = args[args.length - 1];
          if (typeof cb === "function") {
            args[args.length - 1] = api_1.context.bind(parentContext, cb);
          }
          const request = (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
            if (invalidUrl) {
              return original.apply(this, [options, ...args]);
            } else {
              return original.apply(this, [optionsParsed, ...args]);
            }
          }, (error) => {
            if (error) {
              instrumentation._onOutgoingRequestError(span, oldMetricAttributes, stableMetricAttributes, startTime, error);
              throw error;
            }
          });
          instrumentation._diag.debug(`${component} instrumentation outgoingRequest`);
          api_1.context.bind(parentContext, request);
          return instrumentation._traceClientRequest(request, span, startTime, oldMetricAttributes, stableMetricAttributes);
        });
      };
    }
    _onServerResponseFinish(request, response, span, oldMetricAttributes, stableMetricAttributes, startTime) {
      const attributes = (0, utils_1.getIncomingRequestAttributesOnResponse)(request, response, this._semconvStability);
      oldMetricAttributes = Object.assign(oldMetricAttributes, (0, utils_1.getIncomingRequestMetricAttributesOnResponse)(attributes));
      stableMetricAttributes = Object.assign(stableMetricAttributes, (0, utils_1.getIncomingStableRequestMetricAttributesOnResponse)(attributes));
      this._headerCapture.server.captureResponseHeaders(span, (header) => response.getHeader(header));
      span.setAttributes(attributes).setStatus({
        code: (0, utils_1.parseResponseStatus)(api_1.SpanKind.SERVER, response.statusCode)
      });
      const route = attributes[semantic_conventions_1.ATTR_HTTP_ROUTE];
      if (route) {
        span.updateName(`${request.method || "GET"} ${route}`);
      }
      if (this.getConfig().applyCustomAttributesOnSpan) {
        (0, instrumentation_1.safeExecuteInTheMiddle)(() => this.getConfig().applyCustomAttributesOnSpan(span, request, response), () => {
        }, true);
      }
      this._closeHttpSpan(span, api_1.SpanKind.SERVER, startTime, oldMetricAttributes, stableMetricAttributes);
    }
    _onOutgoingRequestError(span, oldMetricAttributes, stableMetricAttributes, startTime, error) {
      (0, utils_1.setSpanWithError)(span, error, this._semconvStability);
      stableMetricAttributes[semantic_conventions_1.ATTR_ERROR_TYPE] = error.name;
      this._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
    }
    _onServerResponseError(span, oldMetricAttributes, stableMetricAttributes, startTime, error) {
      (0, utils_1.setSpanWithError)(span, error, this._semconvStability);
      stableMetricAttributes[semantic_conventions_1.ATTR_ERROR_TYPE] = error.name;
      this._closeHttpSpan(span, api_1.SpanKind.SERVER, startTime, oldMetricAttributes, stableMetricAttributes);
    }
    _startHttpSpan(name, options, ctx = api_1.context.active()) {
      const requireParent = options.kind === api_1.SpanKind.CLIENT ? this.getConfig().requireParentforOutgoingSpans : this.getConfig().requireParentforIncomingSpans;
      let span;
      const currentSpan = api_1.trace.getSpan(ctx);
      if (requireParent === true && (!currentSpan || !api_1.trace.isSpanContextValid(currentSpan.spanContext()))) {
        span = api_1.trace.wrapSpanContext(api_1.INVALID_SPAN_CONTEXT);
      } else if (requireParent === true && currentSpan?.spanContext().isRemote) {
        span = currentSpan;
      } else {
        span = this.tracer.startSpan(name, options, ctx);
      }
      this._spanNotEnded.add(span);
      return span;
    }
    _closeHttpSpan(span, spanKind, startTime, oldMetricAttributes, stableMetricAttributes) {
      if (!this._spanNotEnded.has(span)) {
        return;
      }
      span.end();
      this._spanNotEnded.delete(span);
      const duration = (0, core_1.hrTimeToMilliseconds)((0, core_1.hrTimeDuration)(startTime, (0, core_1.hrTime)()));
      if (spanKind === api_1.SpanKind.SERVER) {
        this._recordServerDuration(duration, oldMetricAttributes, stableMetricAttributes);
      } else if (spanKind === api_1.SpanKind.CLIENT) {
        this._recordClientDuration(duration, oldMetricAttributes, stableMetricAttributes);
      }
    }
    _callResponseHook(span, response) {
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => this.getConfig().responseHook(span, response), () => {
      }, true);
    }
    _callRequestHook(span, request) {
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => this.getConfig().requestHook(span, request), () => {
      }, true);
    }
    _callStartSpanHook(request, hookFunc) {
      if (typeof hookFunc === "function") {
        return (0, instrumentation_1.safeExecuteInTheMiddle)(() => hookFunc(request), () => {
        }, true);
      }
    }
    _createHeaderCapture() {
      const config = this.getConfig();
      return {
        client: {
          captureRequestHeaders: (0, utils_1.headerCapture)("request", config.headersToSpanAttributes?.client?.requestHeaders ?? []),
          captureResponseHeaders: (0, utils_1.headerCapture)("response", config.headersToSpanAttributes?.client?.responseHeaders ?? [])
        },
        server: {
          captureRequestHeaders: (0, utils_1.headerCapture)("request", config.headersToSpanAttributes?.server?.requestHeaders ?? []),
          captureResponseHeaders: (0, utils_1.headerCapture)("response", config.headersToSpanAttributes?.server?.responseHeaders ?? [])
        }
      };
    }
  }
  http.HttpInstrumentation = HttpInstrumentation;
  return http;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.HttpInstrumentation = void 0;
    var http_1 = /* @__PURE__ */ requireHttp();
    Object.defineProperty(exports$1, "HttpInstrumentation", { enumerable: true, get: function() {
      return http_1.HttpInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
