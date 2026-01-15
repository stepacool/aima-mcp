import { r as require$$0 } from "./api.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
import { r as requireSrc$1 } from "./redis-common.mjs";
var src = {};
var instrumentation = {};
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.DB_SYSTEM_VALUE_REDIS = semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_DB_SYSTEM = semconv.ATTR_DB_STATEMENT = semconv.ATTR_DB_CONNECTION_STRING = void 0;
  semconv.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv.ATTR_DB_STATEMENT = "db.statement";
  semconv.ATTR_DB_SYSTEM = "db.system";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv.DB_SYSTEM_VALUE_REDIS = "redis";
  return semconv;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.endSpan = void 0;
  const api_1 = require$$0;
  const endSpan = (span, err) => {
    if (err) {
      span.recordException(err);
      span.setStatus({
        code: api_1.SpanStatusCode.ERROR,
        message: err.message
      });
    }
    span.end();
  };
  utils.endSpan = endSpan;
  return utils;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.56.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-ioredis";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.IORedisInstrumentation = void 0;
  const api_1 = require$$0;
  const instrumentation_1 = require$$2;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const instrumentation_2 = require$$2;
  const utils_1 = /* @__PURE__ */ requireUtils();
  const redis_common_1 = /* @__PURE__ */ requireSrc$1();
  const version_1 = /* @__PURE__ */ requireVersion();
  const DEFAULT_CONFIG = {
    requireParentSpan: true
  };
  class IORedisInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, { ...DEFAULT_CONFIG, ...config });
    }
    setConfig(config = {}) {
      super.setConfig({ ...DEFAULT_CONFIG, ...config });
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("ioredis", [">=2.0.0 <6"], (module, moduleVersion) => {
          const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
          if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.sendCommand)) {
            this._unwrap(moduleExports.prototype, "sendCommand");
          }
          this._wrap(moduleExports.prototype, "sendCommand", this._patchSendCommand(moduleVersion));
          if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
            this._unwrap(moduleExports.prototype, "connect");
          }
          this._wrap(moduleExports.prototype, "connect", this._patchConnection());
          return module;
        }, (module) => {
          if (module === void 0)
            return;
          const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
          this._unwrap(moduleExports.prototype, "sendCommand");
          this._unwrap(moduleExports.prototype, "connect");
        })
      ];
    }
    /**
     * Patch send command internal to trace requests
     */
    _patchSendCommand(moduleVersion) {
      return (original) => {
        return this._traceSendCommand(original, moduleVersion);
      };
    }
    _patchConnection() {
      return (original) => {
        return this._traceConnection(original);
      };
    }
    _traceSendCommand(original, moduleVersion) {
      const instrumentation2 = this;
      return function(cmd) {
        if (arguments.length < 1 || typeof cmd !== "object") {
          return original.apply(this, arguments);
        }
        const config = instrumentation2.getConfig();
        const dbStatementSerializer = config.dbStatementSerializer || redis_common_1.defaultDbStatementSerializer;
        const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === void 0;
        if (config.requireParentSpan === true && hasNoParentSpan) {
          return original.apply(this, arguments);
        }
        const span = instrumentation2.tracer.startSpan(cmd.name, {
          kind: api_1.SpanKind.CLIENT,
          attributes: {
            [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_REDIS,
            [semconv_1.ATTR_DB_STATEMENT]: dbStatementSerializer(cmd.name, cmd.args)
          }
        });
        const { requestHook } = config;
        if (requestHook) {
          (0, instrumentation_2.safeExecuteInTheMiddle)(() => requestHook(span, {
            moduleVersion,
            cmdName: cmd.name,
            cmdArgs: cmd.args
          }), (e) => {
            if (e) {
              api_1.diag.error("ioredis instrumentation: request hook failed", e);
            }
          }, true);
        }
        const { host, port } = this.options;
        span.setAttributes({
          [semconv_1.ATTR_NET_PEER_NAME]: host,
          [semconv_1.ATTR_NET_PEER_PORT]: port,
          [semconv_1.ATTR_DB_CONNECTION_STRING]: `redis://${host}:${port}`
        });
        try {
          const result = original.apply(this, arguments);
          const origResolve = cmd.resolve;
          cmd.resolve = function(result2) {
            (0, instrumentation_2.safeExecuteInTheMiddle)(() => config.responseHook?.(span, cmd.name, cmd.args, result2), (e) => {
              if (e) {
                api_1.diag.error("ioredis instrumentation: response hook failed", e);
              }
            }, true);
            (0, utils_1.endSpan)(span, null);
            origResolve(result2);
          };
          const origReject = cmd.reject;
          cmd.reject = function(err) {
            (0, utils_1.endSpan)(span, err);
            origReject(err);
          };
          return result;
        } catch (error) {
          (0, utils_1.endSpan)(span, error);
          throw error;
        }
      };
    }
    _traceConnection(original) {
      const instrumentation2 = this;
      return function() {
        const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === void 0;
        if (instrumentation2.getConfig().requireParentSpan === true && hasNoParentSpan) {
          return original.apply(this, arguments);
        }
        const span = instrumentation2.tracer.startSpan("connect", {
          kind: api_1.SpanKind.CLIENT,
          attributes: {
            [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_REDIS,
            [semconv_1.ATTR_DB_STATEMENT]: "connect"
          }
        });
        const { host, port } = this.options;
        span.setAttributes({
          [semconv_1.ATTR_NET_PEER_NAME]: host,
          [semconv_1.ATTR_NET_PEER_PORT]: port,
          [semconv_1.ATTR_DB_CONNECTION_STRING]: `redis://${host}:${port}`
        });
        try {
          const client = original.apply(this, arguments);
          (0, utils_1.endSpan)(span, null);
          return client;
        } catch (error) {
          (0, utils_1.endSpan)(span, error);
          throw error;
        }
      };
    }
  }
  instrumentation.IORedisInstrumentation = IORedisInstrumentation;
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.IORedisInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "IORedisInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.IORedisInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
