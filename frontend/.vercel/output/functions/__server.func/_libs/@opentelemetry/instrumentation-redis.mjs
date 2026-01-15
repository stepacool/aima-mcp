import { r as require$$2 } from "./instrumentation.mjs";
import { r as require$$0 } from "./api.mjs";
import { r as require$$5 } from "./semantic-conventions.mjs";
import { r as requireSrc$1 } from "./redis-common.mjs";
var src = {};
var redis = {};
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.57.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-redis";
  return version;
}
var instrumentation$1 = {};
var utils$1 = {};
var hasRequiredUtils$1;
function requireUtils$1() {
  if (hasRequiredUtils$1) return utils$1;
  hasRequiredUtils$1 = 1;
  Object.defineProperty(utils$1, "__esModule", { value: true });
  utils$1.getTracedCreateStreamTrace = utils$1.getTracedCreateClient = utils$1.endSpan = void 0;
  const api_1 = require$$0;
  const endSpan = (span, err) => {
    if (err) {
      span.setStatus({
        code: api_1.SpanStatusCode.ERROR,
        message: err.message
      });
    }
    span.end();
  };
  utils$1.endSpan = endSpan;
  const getTracedCreateClient = (original) => {
    return function createClientTrace() {
      const client = original.apply(this, arguments);
      return api_1.context.bind(api_1.context.active(), client);
    };
  };
  utils$1.getTracedCreateClient = getTracedCreateClient;
  const getTracedCreateStreamTrace = (original) => {
    return function create_stream_trace() {
      if (!Object.prototype.hasOwnProperty.call(this, "stream")) {
        Object.defineProperty(this, "stream", {
          get() {
            return this._patched_redis_stream;
          },
          set(val) {
            api_1.context.bind(api_1.context.active(), val);
            this._patched_redis_stream = val;
          }
        });
      }
      return original.apply(this, arguments);
    };
  };
  utils$1.getTracedCreateStreamTrace = getTracedCreateStreamTrace;
  return utils$1;
}
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.DB_SYSTEM_VALUE_REDIS = semconv.DB_SYSTEM_NAME_VALUE_REDIS = semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_DB_SYSTEM = semconv.ATTR_DB_STATEMENT = semconv.ATTR_DB_CONNECTION_STRING = void 0;
  semconv.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv.ATTR_DB_STATEMENT = "db.statement";
  semconv.ATTR_DB_SYSTEM = "db.system";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv.DB_SYSTEM_NAME_VALUE_REDIS = "redis";
  semconv.DB_SYSTEM_VALUE_REDIS = "redis";
  return semconv;
}
var hasRequiredInstrumentation$1;
function requireInstrumentation$1() {
  if (hasRequiredInstrumentation$1) return instrumentation$1;
  hasRequiredInstrumentation$1 = 1;
  Object.defineProperty(instrumentation$1, "__esModule", { value: true });
  instrumentation$1.RedisInstrumentationV2_V3 = void 0;
  const instrumentation_1 = require$$2;
  const utils_1 = /* @__PURE__ */ requireUtils$1();
  const version_1 = /* @__PURE__ */ requireVersion();
  const api_1 = require$$0;
  const semantic_conventions_1 = require$$5;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const redis_common_1 = /* @__PURE__ */ requireSrc$1();
  class RedisInstrumentationV2_V3 extends instrumentation_1.InstrumentationBase {
    static COMPONENT = "redis";
    _semconvStability;
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
      this._semconvStability = config.semconvStability ? config.semconvStability : (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    setConfig(config = {}) {
      super.setConfig(config);
      this._semconvStability = config.semconvStability ? config.semconvStability : (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("redis", [">=2.6.0 <4"], (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.RedisClient.prototype["internal_send_command"])) {
            this._unwrap(moduleExports.RedisClient.prototype, "internal_send_command");
          }
          this._wrap(moduleExports.RedisClient.prototype, "internal_send_command", this._getPatchInternalSendCommand());
          if ((0, instrumentation_1.isWrapped)(moduleExports.RedisClient.prototype["create_stream"])) {
            this._unwrap(moduleExports.RedisClient.prototype, "create_stream");
          }
          this._wrap(moduleExports.RedisClient.prototype, "create_stream", this._getPatchCreateStream());
          if ((0, instrumentation_1.isWrapped)(moduleExports.createClient)) {
            this._unwrap(moduleExports, "createClient");
          }
          this._wrap(moduleExports, "createClient", this._getPatchCreateClient());
          return moduleExports;
        }, (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports.RedisClient.prototype, "internal_send_command");
          this._unwrap(moduleExports.RedisClient.prototype, "create_stream");
          this._unwrap(moduleExports, "createClient");
        })
      ];
    }
    /**
     * Patch internal_send_command(...) to trace requests
     */
    _getPatchInternalSendCommand() {
      const instrumentation2 = this;
      return function internal_send_command(original) {
        return function internal_send_command_trace(cmd) {
          if (arguments.length !== 1 || typeof cmd !== "object") {
            return original.apply(this, arguments);
          }
          const config = instrumentation2.getConfig();
          const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === void 0;
          if (config.requireParentSpan === true && hasNoParentSpan) {
            return original.apply(this, arguments);
          }
          const dbStatementSerializer = config?.dbStatementSerializer || redis_common_1.defaultDbStatementSerializer;
          const attributes = {};
          if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.OLD) {
            Object.assign(attributes, {
              [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_REDIS,
              [semconv_1.ATTR_DB_STATEMENT]: dbStatementSerializer(cmd.command, cmd.args)
            });
          }
          if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.STABLE) {
            Object.assign(attributes, {
              [semantic_conventions_1.ATTR_DB_SYSTEM_NAME]: semconv_1.DB_SYSTEM_NAME_VALUE_REDIS,
              [semantic_conventions_1.ATTR_DB_OPERATION_NAME]: cmd.command,
              [semantic_conventions_1.ATTR_DB_QUERY_TEXT]: dbStatementSerializer(cmd.command, cmd.args)
            });
          }
          const span = instrumentation2.tracer.startSpan(`${RedisInstrumentationV2_V3.COMPONENT}-${cmd.command}`, {
            kind: api_1.SpanKind.CLIENT,
            attributes
          });
          if (this.connection_options) {
            const connectionAttributes = {};
            if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.OLD) {
              Object.assign(connectionAttributes, {
                [semconv_1.ATTR_NET_PEER_NAME]: this.connection_options.host,
                [semconv_1.ATTR_NET_PEER_PORT]: this.connection_options.port
              });
            }
            if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.STABLE) {
              Object.assign(connectionAttributes, {
                [semantic_conventions_1.ATTR_SERVER_ADDRESS]: this.connection_options.host,
                [semantic_conventions_1.ATTR_SERVER_PORT]: this.connection_options.port
              });
            }
            span.setAttributes(connectionAttributes);
          }
          if (this.address && instrumentation2._semconvStability & instrumentation_1.SemconvStability.OLD) {
            span.setAttribute(semconv_1.ATTR_DB_CONNECTION_STRING, `redis://${this.address}`);
          }
          const originalCallback = arguments[0].callback;
          if (originalCallback) {
            const originalContext = api_1.context.active();
            arguments[0].callback = function callback(err, reply) {
              if (config?.responseHook) {
                const responseHook = config.responseHook;
                (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
                  responseHook(span, cmd.command, cmd.args, reply);
                }, (err2) => {
                  if (err2) {
                    instrumentation2._diag.error("Error executing responseHook", err2);
                  }
                }, true);
              }
              (0, utils_1.endSpan)(span, err);
              return api_1.context.with(originalContext, originalCallback, this, ...arguments);
            };
          }
          try {
            return original.apply(this, arguments);
          } catch (rethrow) {
            (0, utils_1.endSpan)(span, rethrow);
            throw rethrow;
          }
        };
      };
    }
    _getPatchCreateClient() {
      return function createClient(original) {
        return (0, utils_1.getTracedCreateClient)(original);
      };
    }
    _getPatchCreateStream() {
      return function createReadStream(original) {
        return (0, utils_1.getTracedCreateStreamTrace)(original);
      };
    }
  }
  instrumentation$1.RedisInstrumentationV2_V3 = RedisInstrumentationV2_V3;
  return instrumentation$1;
}
var instrumentation = {};
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.getClientAttributes = void 0;
  const semantic_conventions_1 = require$$5;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const instrumentation_1 = require$$2;
  function getClientAttributes(diag, options, semconvStability) {
    const attributes = {};
    if (semconvStability & instrumentation_1.SemconvStability.OLD) {
      Object.assign(attributes, {
        [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_REDIS,
        [semconv_1.ATTR_NET_PEER_NAME]: options?.socket?.host,
        [semconv_1.ATTR_NET_PEER_PORT]: options?.socket?.port,
        [semconv_1.ATTR_DB_CONNECTION_STRING]: removeCredentialsFromDBConnectionStringAttribute(diag, options?.url)
      });
    }
    if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
      Object.assign(attributes, {
        [semantic_conventions_1.ATTR_DB_SYSTEM_NAME]: semconv_1.DB_SYSTEM_NAME_VALUE_REDIS,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: options?.socket?.host,
        [semantic_conventions_1.ATTR_SERVER_PORT]: options?.socket?.port
      });
    }
    return attributes;
  }
  utils.getClientAttributes = getClientAttributes;
  function removeCredentialsFromDBConnectionStringAttribute(diag, url) {
    if (typeof url !== "string" || !url) {
      return;
    }
    try {
      const u = new URL(url);
      u.searchParams.delete("user_pwd");
      u.username = "";
      u.password = "";
      return u.href;
    } catch (err) {
      diag.error("failed to sanitize redis connection url", err);
    }
    return;
  }
  return utils;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.RedisInstrumentationV4_V5 = void 0;
  const api_1 = require$$0;
  const instrumentation_1 = require$$2;
  const utils_1 = /* @__PURE__ */ requireUtils();
  const redis_common_1 = /* @__PURE__ */ requireSrc$1();
  const version_1 = /* @__PURE__ */ requireVersion();
  const semantic_conventions_1 = require$$5;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const OTEL_OPEN_SPANS = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.redis.open_spans");
  const MULTI_COMMAND_OPTIONS = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.redis.multi_command_options");
  class RedisInstrumentationV4_V5 extends instrumentation_1.InstrumentationBase {
    static COMPONENT = "redis";
    _semconvStability;
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
      this._semconvStability = config.semconvStability ? config.semconvStability : (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    setConfig(config = {}) {
      super.setConfig(config);
      this._semconvStability = config.semconvStability ? config.semconvStability : (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    init() {
      return [
        this._getInstrumentationNodeModuleDefinition("@redis/client"),
        this._getInstrumentationNodeModuleDefinition("@node-redis/client")
      ];
    }
    _getInstrumentationNodeModuleDefinition(basePackageName) {
      const commanderModuleFile = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/commander.js`, ["^1.0.0"], (moduleExports, moduleVersion) => {
        const transformCommandArguments = moduleExports.transformCommandArguments;
        if (!transformCommandArguments) {
          this._diag.error("internal instrumentation error, missing transformCommandArguments function");
          return moduleExports;
        }
        const functionToPatch = moduleVersion?.startsWith("1.0.") ? "extendWithCommands" : "attachCommands";
        if ((0, instrumentation_1.isWrapped)(moduleExports?.[functionToPatch])) {
          this._unwrap(moduleExports, functionToPatch);
        }
        this._wrap(moduleExports, functionToPatch, this._getPatchExtendWithCommands(transformCommandArguments));
        return moduleExports;
      }, (moduleExports) => {
        if ((0, instrumentation_1.isWrapped)(moduleExports?.extendWithCommands)) {
          this._unwrap(moduleExports, "extendWithCommands");
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports?.attachCommands)) {
          this._unwrap(moduleExports, "attachCommands");
        }
      });
      const multiCommanderModule = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/client/multi-command.js`, ["^1.0.0", "^5.0.0"], (moduleExports) => {
        const redisClientMultiCommandPrototype = moduleExports?.default?.prototype;
        if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype?.exec)) {
          this._unwrap(redisClientMultiCommandPrototype, "exec");
        }
        this._wrap(redisClientMultiCommandPrototype, "exec", this._getPatchMultiCommandsExec());
        if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype?.addCommand)) {
          this._unwrap(redisClientMultiCommandPrototype, "addCommand");
        }
        this._wrap(redisClientMultiCommandPrototype, "addCommand", this._getPatchMultiCommandsAddCommand());
        return moduleExports;
      }, (moduleExports) => {
        const redisClientMultiCommandPrototype = moduleExports?.default?.prototype;
        if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype?.exec)) {
          this._unwrap(redisClientMultiCommandPrototype, "exec");
        }
        if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype?.addCommand)) {
          this._unwrap(redisClientMultiCommandPrototype, "addCommand");
        }
      });
      const clientIndexModule = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/client/index.js`, ["^1.0.0", "^5.0.0"], (moduleExports) => {
        const redisClientPrototype = moduleExports?.default?.prototype;
        if (redisClientPrototype?.multi) {
          if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.multi)) {
            this._unwrap(redisClientPrototype, "multi");
          }
          this._wrap(redisClientPrototype, "multi", this._getPatchRedisClientMulti());
        }
        if (redisClientPrototype?.MULTI) {
          if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.MULTI)) {
            this._unwrap(redisClientPrototype, "MULTI");
          }
          this._wrap(redisClientPrototype, "MULTI", this._getPatchRedisClientMulti());
        }
        if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.sendCommand)) {
          this._unwrap(redisClientPrototype, "sendCommand");
        }
        this._wrap(redisClientPrototype, "sendCommand", this._getPatchRedisClientSendCommand());
        this._wrap(redisClientPrototype, "connect", this._getPatchedClientConnect());
        return moduleExports;
      }, (moduleExports) => {
        const redisClientPrototype = moduleExports?.default?.prototype;
        if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.multi)) {
          this._unwrap(redisClientPrototype, "multi");
        }
        if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.MULTI)) {
          this._unwrap(redisClientPrototype, "MULTI");
        }
        if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.sendCommand)) {
          this._unwrap(redisClientPrototype, "sendCommand");
        }
      });
      return new instrumentation_1.InstrumentationNodeModuleDefinition(basePackageName, ["^1.0.0", "^5.0.0"], (moduleExports) => {
        return moduleExports;
      }, () => {
      }, [commanderModuleFile, multiCommanderModule, clientIndexModule]);
    }
    // serves both for redis 4.0.x where function name is extendWithCommands
    // and redis ^4.1.0 where function name is attachCommands
    _getPatchExtendWithCommands(transformCommandArguments) {
      const plugin = this;
      return function extendWithCommandsPatchWrapper(original) {
        return function extendWithCommandsPatch(config) {
          if (config?.BaseClass?.name !== "RedisClient") {
            return original.apply(this, arguments);
          }
          const origExecutor = config.executor;
          config.executor = function(command, args) {
            const redisCommandArguments = transformCommandArguments(command, args).args;
            return plugin._traceClientCommand(origExecutor, this, arguments, redisCommandArguments);
          };
          return original.apply(this, arguments);
        };
      };
    }
    _getPatchMultiCommandsExec() {
      const plugin = this;
      return function execPatchWrapper(original) {
        return function execPatch() {
          const execRes = original.apply(this, arguments);
          if (typeof execRes?.then !== "function") {
            plugin._diag.error("got non promise result when patching RedisClientMultiCommand.exec");
            return execRes;
          }
          return execRes.then((redisRes) => {
            const openSpans = this[OTEL_OPEN_SPANS];
            plugin._endSpansWithRedisReplies(openSpans, redisRes);
            return redisRes;
          }).catch((err) => {
            const openSpans = this[OTEL_OPEN_SPANS];
            if (!openSpans) {
              plugin._diag.error("cannot find open spans to end for redis multi command");
            } else {
              const replies = err.constructor.name === "MultiErrorReply" ? err.replies : new Array(openSpans.length).fill(err);
              plugin._endSpansWithRedisReplies(openSpans, replies);
            }
            return Promise.reject(err);
          });
        };
      };
    }
    _getPatchMultiCommandsAddCommand() {
      const plugin = this;
      return function addCommandWrapper(original) {
        return function addCommandPatch(args) {
          return plugin._traceClientCommand(original, this, arguments, args);
        };
      };
    }
    _getPatchRedisClientMulti() {
      return function multiPatchWrapper(original) {
        return function multiPatch() {
          const multiRes = original.apply(this, arguments);
          multiRes[MULTI_COMMAND_OPTIONS] = this.options;
          return multiRes;
        };
      };
    }
    _getPatchRedisClientSendCommand() {
      const plugin = this;
      return function sendCommandWrapper(original) {
        return function sendCommandPatch(args) {
          return plugin._traceClientCommand(original, this, arguments, args);
        };
      };
    }
    _getPatchedClientConnect() {
      const plugin = this;
      return function connectWrapper(original) {
        return function patchedConnect() {
          const options = this.options;
          const attributes = (0, utils_1.getClientAttributes)(plugin._diag, options, plugin._semconvStability);
          const span = plugin.tracer.startSpan(`${RedisInstrumentationV4_V5.COMPONENT}-connect`, {
            kind: api_1.SpanKind.CLIENT,
            attributes
          });
          const res = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
            return original.apply(this);
          });
          return res.then((result) => {
            span.end();
            return result;
          }).catch((error) => {
            span.recordException(error);
            span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: error.message
            });
            span.end();
            return Promise.reject(error);
          });
        };
      };
    }
    _traceClientCommand(origFunction, origThis, origArguments, redisCommandArguments) {
      const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === void 0;
      if (hasNoParentSpan && this.getConfig().requireParentSpan) {
        return origFunction.apply(origThis, origArguments);
      }
      const clientOptions = origThis.options || origThis[MULTI_COMMAND_OPTIONS];
      const commandName = redisCommandArguments[0];
      const commandArgs = redisCommandArguments.slice(1);
      const dbStatementSerializer = this.getConfig().dbStatementSerializer || redis_common_1.defaultDbStatementSerializer;
      const attributes = (0, utils_1.getClientAttributes)(this._diag, clientOptions, this._semconvStability);
      if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
        attributes[semantic_conventions_1.ATTR_DB_OPERATION_NAME] = commandName;
      }
      try {
        const dbStatement = dbStatementSerializer(commandName, commandArgs);
        if (dbStatement != null) {
          if (this._semconvStability & instrumentation_1.SemconvStability.OLD) {
            attributes[semconv_1.ATTR_DB_STATEMENT] = dbStatement;
          }
          if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
            attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = dbStatement;
          }
        }
      } catch (e) {
        this._diag.error("dbStatementSerializer throw an exception", e, {
          commandName
        });
      }
      const span = this.tracer.startSpan(`${RedisInstrumentationV4_V5.COMPONENT}-${commandName}`, {
        kind: api_1.SpanKind.CLIENT,
        attributes
      });
      const res = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
        return origFunction.apply(origThis, origArguments);
      });
      if (typeof res?.then === "function") {
        res.then((redisRes) => {
          this._endSpanWithResponse(span, commandName, commandArgs, redisRes, void 0);
        }, (err) => {
          this._endSpanWithResponse(span, commandName, commandArgs, null, err);
        });
      } else {
        const redisClientMultiCommand = res;
        redisClientMultiCommand[OTEL_OPEN_SPANS] = redisClientMultiCommand[OTEL_OPEN_SPANS] || [];
        redisClientMultiCommand[OTEL_OPEN_SPANS].push({
          span,
          commandName,
          commandArgs
        });
      }
      return res;
    }
    _endSpansWithRedisReplies(openSpans, replies) {
      if (!openSpans) {
        return this._diag.error("cannot find open spans to end for redis multi command");
      }
      if (replies.length !== openSpans.length) {
        return this._diag.error("number of multi command spans does not match response from redis");
      }
      for (let i = 0; i < openSpans.length; i++) {
        const { span, commandName, commandArgs } = openSpans[i];
        const currCommandRes = replies[i];
        const [res, err] = currCommandRes instanceof Error ? [null, currCommandRes] : [currCommandRes, void 0];
        this._endSpanWithResponse(span, commandName, commandArgs, res, err);
      }
    }
    _endSpanWithResponse(span, commandName, commandArgs, response, error) {
      const { responseHook } = this.getConfig();
      if (!error && responseHook) {
        try {
          responseHook(span, commandName, commandArgs, response);
        } catch (err) {
          this._diag.error("responseHook throw an exception", err);
        }
      }
      if (error) {
        span.recordException(error);
        span.setStatus({ code: api_1.SpanStatusCode.ERROR, message: error?.message });
      }
      span.end();
    }
  }
  instrumentation.RedisInstrumentationV4_V5 = RedisInstrumentationV4_V5;
  return instrumentation;
}
var hasRequiredRedis;
function requireRedis() {
  if (hasRequiredRedis) return redis;
  hasRequiredRedis = 1;
  Object.defineProperty(redis, "__esModule", { value: true });
  redis.RedisInstrumentation = void 0;
  const instrumentation_1 = require$$2;
  const version_1 = /* @__PURE__ */ requireVersion();
  const instrumentation_2 = /* @__PURE__ */ requireInstrumentation$1();
  const instrumentation_3 = /* @__PURE__ */ requireInstrumentation();
  const DEFAULT_CONFIG = {
    requireParentSpan: false
  };
  class RedisInstrumentation extends instrumentation_1.InstrumentationBase {
    instrumentationV2_V3;
    instrumentationV4_V5;
    // this is used to bypass a flaw in the base class constructor, which is calling
    // member functions before the constructor has a chance to fully initialize the member variables.
    initialized = false;
    constructor(config = {}) {
      const resolvedConfig = { ...DEFAULT_CONFIG, ...config };
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, resolvedConfig);
      this.instrumentationV2_V3 = new instrumentation_2.RedisInstrumentationV2_V3(this.getConfig());
      this.instrumentationV4_V5 = new instrumentation_3.RedisInstrumentationV4_V5(this.getConfig());
      this.initialized = true;
    }
    setConfig(config = {}) {
      const newConfig = { ...DEFAULT_CONFIG, ...config };
      super.setConfig(newConfig);
      if (!this.initialized) {
        return;
      }
      this.instrumentationV2_V3.setConfig(newConfig);
      this.instrumentationV4_V5.setConfig(newConfig);
    }
    init() {
    }
    // Return underlying modules, as consumers (like https://github.com/DrewCorlin/opentelemetry-node-bundler-plugins) may
    // expect them to be populated without knowing that this module wraps 2 instrumentations
    getModuleDefinitions() {
      return [
        ...this.instrumentationV2_V3.getModuleDefinitions(),
        ...this.instrumentationV4_V5.getModuleDefinitions()
      ];
    }
    setTracerProvider(tracerProvider) {
      super.setTracerProvider(tracerProvider);
      if (!this.initialized) {
        return;
      }
      this.instrumentationV2_V3.setTracerProvider(tracerProvider);
      this.instrumentationV4_V5.setTracerProvider(tracerProvider);
    }
    enable() {
      super.enable();
      if (!this.initialized) {
        return;
      }
      this.instrumentationV2_V3.enable();
      this.instrumentationV4_V5.enable();
    }
    disable() {
      super.disable();
      if (!this.initialized) {
        return;
      }
      this.instrumentationV2_V3.disable();
      this.instrumentationV4_V5.disable();
    }
  }
  redis.RedisInstrumentation = RedisInstrumentation;
  return redis;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.RedisInstrumentation = void 0;
    var redis_1 = /* @__PURE__ */ requireRedis();
    Object.defineProperty(exports$1, "RedisInstrumentation", { enumerable: true, get: function() {
      return redis_1.RedisInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
