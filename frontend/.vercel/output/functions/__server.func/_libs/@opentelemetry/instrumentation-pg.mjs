import { r as require$$2 } from "./instrumentation.mjs";
import { r as require$$0 } from "./api.mjs";
import { r as require$$5 } from "./semantic-conventions.mjs";
import { r as requireSrc$1 } from "./sql-common.mjs";
import { r as require$$1 } from "./core.mjs";
var src = {};
var instrumentation = {};
var internalTypes = {};
var hasRequiredInternalTypes;
function requireInternalTypes() {
  if (hasRequiredInternalTypes) return internalTypes;
  hasRequiredInternalTypes = 1;
  Object.defineProperty(internalTypes, "__esModule", { value: true });
  internalTypes.EVENT_LISTENERS_SET = void 0;
  internalTypes.EVENT_LISTENERS_SET = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.pg.eventListenersSet");
  return internalTypes;
}
var utils = {};
var AttributeNames = {};
var hasRequiredAttributeNames;
function requireAttributeNames() {
  if (hasRequiredAttributeNames) return AttributeNames;
  hasRequiredAttributeNames = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["PG_VALUES"] = "db.postgresql.values";
      AttributeNames2["PG_PLAN"] = "db.postgresql.plan";
      AttributeNames2["IDLE_TIMEOUT_MILLIS"] = "db.postgresql.idle.timeout.millis";
      AttributeNames2["MAX_CLIENT"] = "db.postgresql.max.client";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames);
  return AttributeNames;
}
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = semconv.METRIC_DB_CLIENT_CONNECTION_COUNT = semconv.DB_SYSTEM_VALUE_POSTGRESQL = semconv.DB_CLIENT_CONNECTION_STATE_VALUE_USED = semconv.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE = semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_DB_USER = semconv.ATTR_DB_SYSTEM = semconv.ATTR_DB_STATEMENT = semconv.ATTR_DB_NAME = semconv.ATTR_DB_CONNECTION_STRING = semconv.ATTR_DB_CLIENT_CONNECTION_STATE = semconv.ATTR_DB_CLIENT_CONNECTION_POOL_NAME = void 0;
  semconv.ATTR_DB_CLIENT_CONNECTION_POOL_NAME = "db.client.connection.pool.name";
  semconv.ATTR_DB_CLIENT_CONNECTION_STATE = "db.client.connection.state";
  semconv.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv.ATTR_DB_NAME = "db.name";
  semconv.ATTR_DB_STATEMENT = "db.statement";
  semconv.ATTR_DB_SYSTEM = "db.system";
  semconv.ATTR_DB_USER = "db.user";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE = "idle";
  semconv.DB_CLIENT_CONNECTION_STATE_VALUE_USED = "used";
  semconv.DB_SYSTEM_VALUE_POSTGRESQL = "postgresql";
  semconv.METRIC_DB_CLIENT_CONNECTION_COUNT = "db.client.connection.count";
  semconv.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = "db.client.connection.pending_requests";
  return semconv;
}
var SpanNames = {};
var hasRequiredSpanNames;
function requireSpanNames() {
  if (hasRequiredSpanNames) return SpanNames;
  hasRequiredSpanNames = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.SpanNames = void 0;
    (function(SpanNames2) {
      SpanNames2["QUERY_PREFIX"] = "pg.query";
      SpanNames2["CONNECT"] = "pg.connect";
      SpanNames2["POOL_CONNECT"] = "pg-pool.connect";
    })(exports$1.SpanNames || (exports$1.SpanNames = {}));
  })(SpanNames);
  return SpanNames;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.sanitizedErrorMessage = utils.isObjectWithTextString = utils.getErrorMessage = utils.patchClientConnectCallback = utils.patchCallbackPGPool = utils.updateCounter = utils.getPoolName = utils.patchCallback = utils.handleExecutionResult = utils.handleConfigQuery = utils.shouldSkipInstrumentation = utils.getSemanticAttributesFromPoolConnection = utils.getSemanticAttributesFromConnection = utils.getConnectionString = utils.parseAndMaskConnectionString = utils.parseNormalizedOperationName = utils.getQuerySpanName = void 0;
  const api_1 = require$$0;
  const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
  const semantic_conventions_1 = require$$5;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const instrumentation_1 = require$$2;
  const SpanNames_1 = /* @__PURE__ */ requireSpanNames();
  function getQuerySpanName(dbName, queryConfig) {
    if (!queryConfig)
      return SpanNames_1.SpanNames.QUERY_PREFIX;
    const command = typeof queryConfig.name === "string" && queryConfig.name ? queryConfig.name : parseNormalizedOperationName(queryConfig.text);
    return `${SpanNames_1.SpanNames.QUERY_PREFIX}:${command}${dbName ? ` ${dbName}` : ""}`;
  }
  utils.getQuerySpanName = getQuerySpanName;
  function parseNormalizedOperationName(queryText) {
    const indexOfFirstSpace = queryText.indexOf(" ");
    let sqlCommand = indexOfFirstSpace === -1 ? queryText : queryText.slice(0, indexOfFirstSpace);
    sqlCommand = sqlCommand.toUpperCase();
    return sqlCommand.endsWith(";") ? sqlCommand.slice(0, -1) : sqlCommand;
  }
  utils.parseNormalizedOperationName = parseNormalizedOperationName;
  function parseAndMaskConnectionString(connectionString) {
    try {
      const url = new URL(connectionString);
      url.username = "";
      url.password = "";
      return url.toString();
    } catch (e) {
      return "postgresql://localhost:5432/";
    }
  }
  utils.parseAndMaskConnectionString = parseAndMaskConnectionString;
  function getConnectionString(params) {
    if ("connectionString" in params && params.connectionString) {
      return parseAndMaskConnectionString(params.connectionString);
    }
    const host = params.host || "localhost";
    const port = params.port || 5432;
    const database = params.database || "";
    return `postgresql://${host}:${port}/${database}`;
  }
  utils.getConnectionString = getConnectionString;
  function getPort(port) {
    if (Number.isInteger(port)) {
      return port;
    }
    return void 0;
  }
  function getSemanticAttributesFromConnection(params, semconvStability) {
    let attributes = {};
    if (semconvStability & instrumentation_1.SemconvStability.OLD) {
      attributes = {
        ...attributes,
        [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_POSTGRESQL,
        [semconv_1.ATTR_DB_NAME]: params.database,
        [semconv_1.ATTR_DB_CONNECTION_STRING]: getConnectionString(params),
        [semconv_1.ATTR_DB_USER]: params.user,
        [semconv_1.ATTR_NET_PEER_NAME]: params.host,
        [semconv_1.ATTR_NET_PEER_PORT]: getPort(params.port)
      };
    }
    if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
      attributes = {
        ...attributes,
        [semantic_conventions_1.ATTR_DB_SYSTEM_NAME]: semantic_conventions_1.DB_SYSTEM_NAME_VALUE_POSTGRESQL,
        [semantic_conventions_1.ATTR_DB_NAMESPACE]: params.namespace,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: params.host,
        [semantic_conventions_1.ATTR_SERVER_PORT]: getPort(params.port)
      };
    }
    return attributes;
  }
  utils.getSemanticAttributesFromConnection = getSemanticAttributesFromConnection;
  function getSemanticAttributesFromPoolConnection(params, semconvStability) {
    let url;
    try {
      url = params.connectionString ? new URL(params.connectionString) : void 0;
    } catch (e) {
      url = void 0;
    }
    let attributes = {
      [AttributeNames_1.AttributeNames.IDLE_TIMEOUT_MILLIS]: params.idleTimeoutMillis,
      [AttributeNames_1.AttributeNames.MAX_CLIENT]: params.maxClient
    };
    if (semconvStability & instrumentation_1.SemconvStability.OLD) {
      attributes = {
        ...attributes,
        [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_POSTGRESQL,
        [semconv_1.ATTR_DB_NAME]: url?.pathname.slice(1) ?? params.database,
        [semconv_1.ATTR_DB_CONNECTION_STRING]: getConnectionString(params),
        [semconv_1.ATTR_NET_PEER_NAME]: url?.hostname ?? params.host,
        [semconv_1.ATTR_NET_PEER_PORT]: Number(url?.port) || getPort(params.port),
        [semconv_1.ATTR_DB_USER]: url?.username ?? params.user
      };
    }
    if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
      attributes = {
        ...attributes,
        [semantic_conventions_1.ATTR_DB_SYSTEM_NAME]: semantic_conventions_1.DB_SYSTEM_NAME_VALUE_POSTGRESQL,
        [semantic_conventions_1.ATTR_DB_NAMESPACE]: params.namespace,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: url?.hostname ?? params.host,
        [semantic_conventions_1.ATTR_SERVER_PORT]: Number(url?.port) || getPort(params.port)
      };
    }
    return attributes;
  }
  utils.getSemanticAttributesFromPoolConnection = getSemanticAttributesFromPoolConnection;
  function shouldSkipInstrumentation(instrumentationConfig) {
    return instrumentationConfig.requireParentSpan === true && api_1.trace.getSpan(api_1.context.active()) === void 0;
  }
  utils.shouldSkipInstrumentation = shouldSkipInstrumentation;
  function handleConfigQuery(tracer, instrumentationConfig, semconvStability, queryConfig) {
    const { connectionParameters } = this;
    const dbName = connectionParameters.database;
    const spanName = getQuerySpanName(dbName, queryConfig);
    const span = tracer.startSpan(spanName, {
      kind: api_1.SpanKind.CLIENT,
      attributes: getSemanticAttributesFromConnection(connectionParameters, semconvStability)
    });
    if (!queryConfig) {
      return span;
    }
    if (queryConfig.text) {
      if (semconvStability & instrumentation_1.SemconvStability.OLD) {
        span.setAttribute(semconv_1.ATTR_DB_STATEMENT, queryConfig.text);
      }
      if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
        span.setAttribute(semantic_conventions_1.ATTR_DB_QUERY_TEXT, queryConfig.text);
      }
    }
    if (instrumentationConfig.enhancedDatabaseReporting && Array.isArray(queryConfig.values)) {
      try {
        const convertedValues = queryConfig.values.map((value) => {
          if (value == null) {
            return "null";
          } else if (value instanceof Buffer) {
            return value.toString();
          } else if (typeof value === "object") {
            if (typeof value.toPostgres === "function") {
              return value.toPostgres();
            }
            return JSON.stringify(value);
          } else {
            return value.toString();
          }
        });
        span.setAttribute(AttributeNames_1.AttributeNames.PG_VALUES, convertedValues);
      } catch (e) {
        api_1.diag.error("failed to stringify ", queryConfig.values, e);
      }
    }
    if (typeof queryConfig.name === "string") {
      span.setAttribute(AttributeNames_1.AttributeNames.PG_PLAN, queryConfig.name);
    }
    return span;
  }
  utils.handleConfigQuery = handleConfigQuery;
  function handleExecutionResult(config, span, pgResult) {
    if (typeof config.responseHook === "function") {
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
        config.responseHook(span, {
          data: pgResult
        });
      }, (err) => {
        if (err) {
          api_1.diag.error("Error running response hook", err);
        }
      }, true);
    }
  }
  utils.handleExecutionResult = handleExecutionResult;
  function patchCallback(instrumentationConfig, span, cb, attributes, recordDuration) {
    return function patchedCallback(err, res) {
      if (err) {
        if (Object.prototype.hasOwnProperty.call(err, "code")) {
          attributes[semantic_conventions_1.ATTR_ERROR_TYPE] = err["code"];
        }
        if (err instanceof Error) {
          span.recordException(sanitizedErrorMessage(err));
        }
        span.setStatus({
          code: api_1.SpanStatusCode.ERROR,
          message: err.message
        });
      } else {
        handleExecutionResult(instrumentationConfig, span, res);
      }
      recordDuration();
      span.end();
      cb.call(this, err, res);
    };
  }
  utils.patchCallback = patchCallback;
  function getPoolName(pool) {
    let poolName = "";
    poolName += (pool?.host ? `${pool.host}` : "unknown_host") + ":";
    poolName += (pool?.port ? `${pool.port}` : "unknown_port") + "/";
    poolName += pool?.database ? `${pool.database}` : "unknown_database";
    return poolName.trim();
  }
  utils.getPoolName = getPoolName;
  function updateCounter(poolName, pool, connectionCount, connectionPendingRequests, latestCounter) {
    const all = pool.totalCount;
    const pending = pool.waitingCount;
    const idle = pool.idleCount;
    const used = all - idle;
    connectionCount.add(used - latestCounter.used, {
      [semconv_1.ATTR_DB_CLIENT_CONNECTION_STATE]: semconv_1.DB_CLIENT_CONNECTION_STATE_VALUE_USED,
      [semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
    });
    connectionCount.add(idle - latestCounter.idle, {
      [semconv_1.ATTR_DB_CLIENT_CONNECTION_STATE]: semconv_1.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE,
      [semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
    });
    connectionPendingRequests.add(pending - latestCounter.pending, {
      [semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
    });
    return { used, idle, pending };
  }
  utils.updateCounter = updateCounter;
  function patchCallbackPGPool(span, cb) {
    return function patchedCallback(err, res, done) {
      if (err) {
        if (err instanceof Error) {
          span.recordException(sanitizedErrorMessage(err));
        }
        span.setStatus({
          code: api_1.SpanStatusCode.ERROR,
          message: err.message
        });
      }
      span.end();
      cb.call(this, err, res, done);
    };
  }
  utils.patchCallbackPGPool = patchCallbackPGPool;
  function patchClientConnectCallback(span, cb) {
    return function patchedClientConnectCallback(err) {
      if (err) {
        if (err instanceof Error) {
          span.recordException(sanitizedErrorMessage(err));
        }
        span.setStatus({
          code: api_1.SpanStatusCode.ERROR,
          message: err.message
        });
      }
      span.end();
      cb.apply(this, arguments);
    };
  }
  utils.patchClientConnectCallback = patchClientConnectCallback;
  function getErrorMessage(e) {
    return typeof e === "object" && e !== null && "message" in e ? String(e.message) : void 0;
  }
  utils.getErrorMessage = getErrorMessage;
  function isObjectWithTextString(it) {
    return typeof it === "object" && typeof it?.text === "string";
  }
  utils.isObjectWithTextString = isObjectWithTextString;
  function sanitizedErrorMessage(error) {
    const name = error?.name ?? "PostgreSQLError";
    const code = error?.code ?? "UNKNOWN";
    return `PostgreSQL error of type '${name}' occurred (code: ${code})`;
  }
  utils.sanitizedErrorMessage = sanitizedErrorMessage;
  return utils;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.61.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-pg";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.PgInstrumentation = void 0;
  const instrumentation_1 = require$$2;
  const api_1 = require$$0;
  const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
  const utils2 = /* @__PURE__ */ requireUtils();
  const sql_common_1 = /* @__PURE__ */ requireSrc$1();
  const version_1 = /* @__PURE__ */ requireVersion();
  const SpanNames_1 = /* @__PURE__ */ requireSpanNames();
  const core_1 = require$$1;
  const semantic_conventions_1 = require$$5;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  function extractModuleExports(module) {
    return module[Symbol.toStringTag] === "Module" ? module.default : module;
  }
  class PgInstrumentation extends instrumentation_1.InstrumentationBase {
    // Pool events connect, acquire, release and remove can be called
    // multiple times without changing the values of total, idle and waiting
    // connections. The _connectionsCounter is used to keep track of latest
    // values and only update the metrics _connectionsCount and _connectionPendingRequests
    // when the value change.
    _connectionsCounter = {
      used: 0,
      idle: 0,
      pending: 0
    };
    _semconvStability;
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
      this._semconvStability = (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    _updateMetricInstruments() {
      this._operationDuration = this.meter.createHistogram(semantic_conventions_1.METRIC_DB_CLIENT_OPERATION_DURATION, {
        description: "Duration of database client operations.",
        unit: "s",
        valueType: api_1.ValueType.DOUBLE,
        advice: {
          explicitBucketBoundaries: [
            1e-3,
            5e-3,
            0.01,
            0.05,
            0.1,
            0.5,
            1,
            5,
            10
          ]
        }
      });
      this._connectionsCounter = {
        idle: 0,
        pending: 0,
        used: 0
      };
      this._connectionsCount = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTION_COUNT, {
        description: "The number of connections that are currently in state described by the state attribute.",
        unit: "{connection}"
      });
      this._connectionPendingRequests = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS, {
        description: "The number of current pending requests for an open connection.",
        unit: "{connection}"
      });
    }
    init() {
      const SUPPORTED_PG_VERSIONS = [">=8.0.3 <9"];
      const SUPPORTED_PG_POOL_VERSIONS = [">=2.0.0 <4"];
      const modulePgNativeClient = new instrumentation_1.InstrumentationNodeModuleFile("pg/lib/native/client.js", SUPPORTED_PG_VERSIONS, this._patchPgClient.bind(this), this._unpatchPgClient.bind(this));
      const modulePgClient = new instrumentation_1.InstrumentationNodeModuleFile("pg/lib/client.js", SUPPORTED_PG_VERSIONS, this._patchPgClient.bind(this), this._unpatchPgClient.bind(this));
      const modulePG = new instrumentation_1.InstrumentationNodeModuleDefinition("pg", SUPPORTED_PG_VERSIONS, (module) => {
        const moduleExports = extractModuleExports(module);
        this._patchPgClient(moduleExports.Client);
        return module;
      }, (module) => {
        const moduleExports = extractModuleExports(module);
        this._unpatchPgClient(moduleExports.Client);
        return module;
      }, [modulePgClient, modulePgNativeClient]);
      const modulePGPool = new instrumentation_1.InstrumentationNodeModuleDefinition("pg-pool", SUPPORTED_PG_POOL_VERSIONS, (module) => {
        const moduleExports = extractModuleExports(module);
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
          this._unwrap(moduleExports.prototype, "connect");
        }
        this._wrap(moduleExports.prototype, "connect", this._getPoolConnectPatch());
        return moduleExports;
      }, (module) => {
        const moduleExports = extractModuleExports(module);
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
          this._unwrap(moduleExports.prototype, "connect");
        }
      });
      return [modulePG, modulePGPool];
    }
    _patchPgClient(module) {
      if (!module) {
        return;
      }
      const moduleExports = extractModuleExports(module);
      if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.query)) {
        this._unwrap(moduleExports.prototype, "query");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
        this._unwrap(moduleExports.prototype, "connect");
      }
      this._wrap(moduleExports.prototype, "query", this._getClientQueryPatch());
      this._wrap(moduleExports.prototype, "connect", this._getClientConnectPatch());
      return module;
    }
    _unpatchPgClient(module) {
      const moduleExports = extractModuleExports(module);
      if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.query)) {
        this._unwrap(moduleExports.prototype, "query");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
        this._unwrap(moduleExports.prototype, "connect");
      }
      return module;
    }
    _getClientConnectPatch() {
      const plugin = this;
      return (original) => {
        return function connect(callback) {
          if (utils2.shouldSkipInstrumentation(plugin.getConfig())) {
            return original.call(this, callback);
          }
          const span = plugin.tracer.startSpan(SpanNames_1.SpanNames.CONNECT, {
            kind: api_1.SpanKind.CLIENT,
            attributes: utils2.getSemanticAttributesFromConnection(this, plugin._semconvStability)
          });
          if (callback) {
            const parentSpan = api_1.trace.getSpan(api_1.context.active());
            callback = utils2.patchClientConnectCallback(span, callback);
            if (parentSpan) {
              callback = api_1.context.bind(api_1.context.active(), callback);
            }
          }
          const connectResult = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
            return original.call(this, callback);
          });
          return handleConnectResult(span, connectResult);
        };
      };
    }
    recordOperationDuration(attributes, startTime) {
      const metricsAttributes = {};
      const keysToCopy = [
        semantic_conventions_1.ATTR_DB_NAMESPACE,
        semantic_conventions_1.ATTR_ERROR_TYPE,
        semantic_conventions_1.ATTR_SERVER_PORT,
        semantic_conventions_1.ATTR_SERVER_ADDRESS,
        semantic_conventions_1.ATTR_DB_OPERATION_NAME
      ];
      if (this._semconvStability & instrumentation_1.SemconvStability.OLD) {
        keysToCopy.push(semconv_1.ATTR_DB_SYSTEM);
      }
      if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
        keysToCopy.push(semantic_conventions_1.ATTR_DB_SYSTEM_NAME);
      }
      keysToCopy.forEach((key) => {
        if (key in attributes) {
          metricsAttributes[key] = attributes[key];
        }
      });
      const durationSeconds = (0, core_1.hrTimeToMilliseconds)((0, core_1.hrTimeDuration)(startTime, (0, core_1.hrTime)())) / 1e3;
      this._operationDuration.record(durationSeconds, metricsAttributes);
    }
    _getClientQueryPatch() {
      const plugin = this;
      return (original) => {
        this._diag.debug("Patching pg.Client.prototype.query");
        return function query(...args) {
          if (utils2.shouldSkipInstrumentation(plugin.getConfig())) {
            return original.apply(this, args);
          }
          const startTime = (0, core_1.hrTime)();
          const arg0 = args[0];
          const firstArgIsString = typeof arg0 === "string";
          const firstArgIsQueryObjectWithText = utils2.isObjectWithTextString(arg0);
          const queryConfig = firstArgIsString ? {
            text: arg0,
            values: Array.isArray(args[1]) ? args[1] : void 0
          } : firstArgIsQueryObjectWithText ? arg0 : void 0;
          const attributes = {
            [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_POSTGRESQL,
            [semantic_conventions_1.ATTR_DB_NAMESPACE]: this.database,
            [semantic_conventions_1.ATTR_SERVER_PORT]: this.connectionParameters.port,
            [semantic_conventions_1.ATTR_SERVER_ADDRESS]: this.connectionParameters.host
          };
          if (queryConfig?.text) {
            attributes[semantic_conventions_1.ATTR_DB_OPERATION_NAME] = utils2.parseNormalizedOperationName(queryConfig?.text);
          }
          const recordDuration = () => {
            plugin.recordOperationDuration(attributes, startTime);
          };
          const instrumentationConfig = plugin.getConfig();
          const span = utils2.handleConfigQuery.call(this, plugin.tracer, instrumentationConfig, plugin._semconvStability, queryConfig);
          if (instrumentationConfig.addSqlCommenterCommentToQueries) {
            if (firstArgIsString) {
              args[0] = (0, sql_common_1.addSqlCommenterComment)(span, arg0);
            } else if (firstArgIsQueryObjectWithText && !("name" in arg0)) {
              args[0] = {
                ...arg0,
                text: (0, sql_common_1.addSqlCommenterComment)(span, arg0.text)
              };
            }
          }
          if (args.length > 0) {
            const parentSpan = api_1.trace.getSpan(api_1.context.active());
            if (typeof args[args.length - 1] === "function") {
              args[args.length - 1] = utils2.patchCallback(
                instrumentationConfig,
                span,
                args[args.length - 1],
                // nb: not type safe.
                attributes,
                recordDuration
              );
              if (parentSpan) {
                args[args.length - 1] = api_1.context.bind(api_1.context.active(), args[args.length - 1]);
              }
            } else if (typeof queryConfig?.callback === "function") {
              let callback = utils2.patchCallback(
                plugin.getConfig(),
                span,
                queryConfig.callback,
                // nb: not type safe.
                attributes,
                recordDuration
              );
              if (parentSpan) {
                callback = api_1.context.bind(api_1.context.active(), callback);
              }
              args[0].callback = callback;
            }
          }
          const { requestHook } = instrumentationConfig;
          if (typeof requestHook === "function" && queryConfig) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
              const { database, host, port, user } = this.connectionParameters;
              const connection = { database, host, port, user };
              requestHook(span, {
                connection,
                query: {
                  text: queryConfig.text,
                  // nb: if `client.query` is called with illegal arguments
                  // (e.g., if `queryConfig.values` is passed explicitly, but a
                  // non-array is given), then the type casts will be wrong. But
                  // we leave it up to the queryHook to handle that, and we
                  // catch and swallow any errors it throws. The other options
                  // are all worse. E.g., we could leave `queryConfig.values`
                  // and `queryConfig.name` as `unknown`, but then the hook body
                  // would be forced to validate (or cast) them before using
                  // them, which seems incredibly cumbersome given that these
                  // casts will be correct 99.9% of the time -- and pg.query
                  // will immediately throw during development in the other .1%
                  // of cases. Alternatively, we could simply skip calling the
                  // hook when `values` or `name` don't have the expected type,
                  // but that would add unnecessary validation overhead to every
                  // hook invocation and possibly be even more confusing/unexpected.
                  values: queryConfig.values,
                  name: queryConfig.name
                }
              });
            }, (err) => {
              if (err) {
                plugin._diag.error("Error running query hook", err);
              }
            }, true);
          }
          let result;
          try {
            result = original.apply(this, args);
          } catch (e) {
            if (e instanceof Error) {
              span.recordException(utils2.sanitizedErrorMessage(e));
            }
            span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: utils2.getErrorMessage(e)
            });
            span.end();
            throw e;
          }
          if (result instanceof Promise) {
            return result.then((result2) => {
              return new Promise((resolve) => {
                utils2.handleExecutionResult(plugin.getConfig(), span, result2);
                recordDuration();
                span.end();
                resolve(result2);
              });
            }).catch((error) => {
              return new Promise((_, reject) => {
                if (error instanceof Error) {
                  span.recordException(utils2.sanitizedErrorMessage(error));
                }
                span.setStatus({
                  code: api_1.SpanStatusCode.ERROR,
                  message: error.message
                });
                recordDuration();
                span.end();
                reject(error);
              });
            });
          }
          return result;
        };
      };
    }
    _setPoolConnectEventListeners(pgPool) {
      if (pgPool[internal_types_1.EVENT_LISTENERS_SET])
        return;
      const poolName = utils2.getPoolName(pgPool.options);
      pgPool.on("connect", () => {
        this._connectionsCounter = utils2.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
      });
      pgPool.on("acquire", () => {
        this._connectionsCounter = utils2.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
      });
      pgPool.on("remove", () => {
        this._connectionsCounter = utils2.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
      });
      pgPool.on("release", () => {
        this._connectionsCounter = utils2.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
      });
      pgPool[internal_types_1.EVENT_LISTENERS_SET] = true;
    }
    _getPoolConnectPatch() {
      const plugin = this;
      return (originalConnect) => {
        return function connect(callback) {
          if (utils2.shouldSkipInstrumentation(plugin.getConfig())) {
            return originalConnect.call(this, callback);
          }
          const span = plugin.tracer.startSpan(SpanNames_1.SpanNames.POOL_CONNECT, {
            kind: api_1.SpanKind.CLIENT,
            attributes: utils2.getSemanticAttributesFromPoolConnection(this.options, plugin._semconvStability)
          });
          plugin._setPoolConnectEventListeners(this);
          if (callback) {
            const parentSpan = api_1.trace.getSpan(api_1.context.active());
            callback = utils2.patchCallbackPGPool(span, callback);
            if (parentSpan) {
              callback = api_1.context.bind(api_1.context.active(), callback);
            }
          }
          const connectResult = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
            return originalConnect.call(this, callback);
          });
          return handleConnectResult(span, connectResult);
        };
      };
    }
  }
  instrumentation.PgInstrumentation = PgInstrumentation;
  function handleConnectResult(span, connectResult) {
    if (!(connectResult instanceof Promise)) {
      return connectResult;
    }
    const connectResultPromise = connectResult;
    return api_1.context.bind(api_1.context.active(), connectResultPromise.then((result) => {
      span.end();
      return result;
    }).catch((error) => {
      if (error instanceof Error) {
        span.recordException(utils2.sanitizedErrorMessage(error));
      }
      span.setStatus({
        code: api_1.SpanStatusCode.ERROR,
        message: utils2.getErrorMessage(error)
      });
      span.end();
      return Promise.reject(error);
    }));
  }
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = exports$1.PgInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "PgInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.PgInstrumentation;
    } });
    var AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
    Object.defineProperty(exports$1, "AttributeNames", { enumerable: true, get: function() {
      return AttributeNames_1.AttributeNames;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
