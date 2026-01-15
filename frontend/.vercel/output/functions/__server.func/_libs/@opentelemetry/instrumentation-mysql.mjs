import { r as require$$0 } from "./api.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
var src = {};
var instrumentation = {};
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.METRIC_DB_CLIENT_CONNECTIONS_USAGE = semconv.DB_SYSTEM_VALUE_MYSQL = semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_DB_USER = semconv.ATTR_DB_SYSTEM = semconv.ATTR_DB_STATEMENT = semconv.ATTR_DB_NAME = semconv.ATTR_DB_CONNECTION_STRING = void 0;
  semconv.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv.ATTR_DB_NAME = "db.name";
  semconv.ATTR_DB_STATEMENT = "db.statement";
  semconv.ATTR_DB_SYSTEM = "db.system";
  semconv.ATTR_DB_USER = "db.user";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv.DB_SYSTEM_VALUE_MYSQL = "mysql";
  semconv.METRIC_DB_CLIENT_CONNECTIONS_USAGE = "db.client.connections.usage";
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
      AttributeNames2["MYSQL_VALUES"] = "db.mysql.values";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames);
  return AttributeNames;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.getPoolName = utils.arrayStringifyHelper = utils.getSpanName = utils.getDbValues = utils.getDbStatement = utils.getConnectionAttributes = void 0;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  function getConnectionAttributes(config) {
    const { host, port, database, user } = getConfig(config);
    const portNumber = parseInt(port, 10);
    if (!isNaN(portNumber)) {
      return {
        [semconv_1.ATTR_NET_PEER_NAME]: host,
        [semconv_1.ATTR_NET_PEER_PORT]: portNumber,
        [semconv_1.ATTR_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
        [semconv_1.ATTR_DB_NAME]: database,
        [semconv_1.ATTR_DB_USER]: user
      };
    }
    return {
      [semconv_1.ATTR_NET_PEER_NAME]: host,
      [semconv_1.ATTR_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
      [semconv_1.ATTR_DB_NAME]: database,
      [semconv_1.ATTR_DB_USER]: user
    };
  }
  utils.getConnectionAttributes = getConnectionAttributes;
  function getConfig(config) {
    const { host, port, database, user } = config && config.connectionConfig || config || {};
    return { host, port, database, user };
  }
  function getJDBCString(host, port, database) {
    let jdbcString = `jdbc:mysql://${host || "localhost"}`;
    if (typeof port === "number") {
      jdbcString += `:${port}`;
    }
    if (typeof database === "string") {
      jdbcString += `/${database}`;
    }
    return jdbcString;
  }
  function getDbStatement(query) {
    if (typeof query === "string") {
      return query;
    } else {
      return query.sql;
    }
  }
  utils.getDbStatement = getDbStatement;
  function getDbValues(query, values) {
    if (typeof query === "string") {
      return arrayStringifyHelper(values);
    } else {
      return arrayStringifyHelper(values || query.values);
    }
  }
  utils.getDbValues = getDbValues;
  function getSpanName(query) {
    const rawQuery = typeof query === "object" ? query.sql : query;
    const firstSpace = rawQuery?.indexOf(" ");
    if (typeof firstSpace === "number" && firstSpace !== -1) {
      return rawQuery?.substring(0, firstSpace);
    }
    return rawQuery;
  }
  utils.getSpanName = getSpanName;
  function arrayStringifyHelper(arr) {
    if (arr)
      return `[${arr.toString()}]`;
    return "";
  }
  utils.arrayStringifyHelper = arrayStringifyHelper;
  function getPoolName(pool) {
    const c = pool.config.connectionConfig;
    let poolName = "";
    poolName += c.host ? `host: '${c.host}', ` : "";
    poolName += c.port ? `port: ${c.port}, ` : "";
    poolName += c.database ? `database: '${c.database}', ` : "";
    poolName += c.user ? `user: '${c.user}'` : "";
    if (!c.user) {
      poolName = poolName.substring(0, poolName.length - 2);
    }
    return poolName.trim();
  }
  utils.getPoolName = getPoolName;
  return utils;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.54.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-mysql";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.MySQLInstrumentation = void 0;
  const api_1 = require$$0;
  const instrumentation_1 = require$$2;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
  const utils_1 = /* @__PURE__ */ requireUtils();
  const version_1 = /* @__PURE__ */ requireVersion();
  class MySQLInstrumentation extends instrumentation_1.InstrumentationBase {
    static COMMON_ATTRIBUTES = {
      [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_MYSQL
    };
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    _updateMetricInstruments() {
      this._connectionsUsage = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTIONS_USAGE, {
        description: "The number of connections that are currently in state described by the state attribute.",
        unit: "{connection}"
      });
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("mysql", [">=2.0.0 <3"], (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.createConnection)) {
            this._unwrap(moduleExports, "createConnection");
          }
          this._wrap(moduleExports, "createConnection", this._patchCreateConnection());
          if ((0, instrumentation_1.isWrapped)(moduleExports.createPool)) {
            this._unwrap(moduleExports, "createPool");
          }
          this._wrap(moduleExports, "createPool", this._patchCreatePool());
          if ((0, instrumentation_1.isWrapped)(moduleExports.createPoolCluster)) {
            this._unwrap(moduleExports, "createPoolCluster");
          }
          this._wrap(moduleExports, "createPoolCluster", this._patchCreatePoolCluster());
          return moduleExports;
        }, (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports, "createConnection");
          this._unwrap(moduleExports, "createPool");
          this._unwrap(moduleExports, "createPoolCluster");
        })
      ];
    }
    // global export function
    _patchCreateConnection() {
      return (originalCreateConnection) => {
        const thisPlugin = this;
        return function createConnection(_connectionUri) {
          const originalResult = originalCreateConnection(...arguments);
          thisPlugin._wrap(originalResult, "query", thisPlugin._patchQuery(originalResult));
          return originalResult;
        };
      };
    }
    // global export function
    _patchCreatePool() {
      return (originalCreatePool) => {
        const thisPlugin = this;
        return function createPool(_config) {
          const pool = originalCreatePool(...arguments);
          thisPlugin._wrap(pool, "query", thisPlugin._patchQuery(pool));
          thisPlugin._wrap(pool, "getConnection", thisPlugin._patchGetConnection(pool));
          thisPlugin._wrap(pool, "end", thisPlugin._patchPoolEnd(pool));
          thisPlugin._setPoolcallbacks(pool, thisPlugin, "");
          return pool;
        };
      };
    }
    _patchPoolEnd(pool) {
      return (originalPoolEnd) => {
        const thisPlugin = this;
        return function end(callback) {
          const nAll = pool._allConnections.length;
          const nFree = pool._freeConnections.length;
          const nUsed = nAll - nFree;
          const poolName = (0, utils_1.getPoolName)(pool);
          thisPlugin._connectionsUsage.add(-nUsed, {
            state: "used",
            name: poolName
          });
          thisPlugin._connectionsUsage.add(-nFree, {
            state: "idle",
            name: poolName
          });
          originalPoolEnd.apply(pool, arguments);
        };
      };
    }
    // global export function
    _patchCreatePoolCluster() {
      return (originalCreatePoolCluster) => {
        const thisPlugin = this;
        return function createPool(_config) {
          const cluster = originalCreatePoolCluster(...arguments);
          thisPlugin._wrap(cluster, "getConnection", thisPlugin._patchGetConnection(cluster));
          thisPlugin._wrap(cluster, "add", thisPlugin._patchAdd(cluster));
          return cluster;
        };
      };
    }
    _patchAdd(cluster) {
      return (originalAdd) => {
        const thisPlugin = this;
        return function add(id, config) {
          if (!thisPlugin["_enabled"]) {
            thisPlugin._unwrap(cluster, "add");
            return originalAdd.apply(cluster, arguments);
          }
          originalAdd.apply(cluster, arguments);
          const nodes = cluster["_nodes"];
          if (nodes) {
            const nodeId = typeof id === "object" ? "CLUSTER::" + cluster._lastId : String(id);
            const pool = nodes[nodeId].pool;
            thisPlugin._setPoolcallbacks(pool, thisPlugin, id);
          }
        };
      };
    }
    // method on cluster or pool
    _patchGetConnection(pool) {
      return (originalGetConnection) => {
        const thisPlugin = this;
        return function getConnection(arg1, arg2, arg3) {
          if (!thisPlugin["_enabled"]) {
            thisPlugin._unwrap(pool, "getConnection");
            return originalGetConnection.apply(pool, arguments);
          }
          if (arguments.length === 1 && typeof arg1 === "function") {
            const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg1);
            return originalGetConnection.call(pool, patchFn);
          }
          if (arguments.length === 2 && typeof arg2 === "function") {
            const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg2);
            return originalGetConnection.call(pool, arg1, patchFn);
          }
          if (arguments.length === 3 && typeof arg3 === "function") {
            const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg3);
            return originalGetConnection.call(pool, arg1, arg2, patchFn);
          }
          return originalGetConnection.apply(pool, arguments);
        };
      };
    }
    _getConnectionCallbackPatchFn(cb) {
      const thisPlugin = this;
      const activeContext = api_1.context.active();
      return function(err, connection) {
        if (connection) {
          if (!(0, instrumentation_1.isWrapped)(connection.query)) {
            thisPlugin._wrap(connection, "query", thisPlugin._patchQuery(connection));
          }
        }
        if (typeof cb === "function") {
          api_1.context.with(activeContext, cb, this, err, connection);
        }
      };
    }
    _patchQuery(connection) {
      return (originalQuery) => {
        const thisPlugin = this;
        return function query(query, _valuesOrCallback, _callback) {
          if (!thisPlugin["_enabled"]) {
            thisPlugin._unwrap(connection, "query");
            return originalQuery.apply(connection, arguments);
          }
          const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(query), {
            kind: api_1.SpanKind.CLIENT,
            attributes: {
              ...MySQLInstrumentation.COMMON_ATTRIBUTES,
              ...(0, utils_1.getConnectionAttributes)(connection.config)
            }
          });
          span.setAttribute(semconv_1.ATTR_DB_STATEMENT, (0, utils_1.getDbStatement)(query));
          if (thisPlugin.getConfig().enhancedDatabaseReporting) {
            let values;
            if (Array.isArray(_valuesOrCallback)) {
              values = _valuesOrCallback;
            } else if (arguments[2]) {
              values = [_valuesOrCallback];
            }
            span.setAttribute(AttributeNames_1.AttributeNames.MYSQL_VALUES, (0, utils_1.getDbValues)(query, values));
          }
          const cbIndex = Array.from(arguments).findIndex((arg) => typeof arg === "function");
          const parentContext = api_1.context.active();
          if (cbIndex === -1) {
            const streamableQuery = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
              return originalQuery.apply(connection, arguments);
            });
            api_1.context.bind(parentContext, streamableQuery);
            return streamableQuery.on("error", (err) => span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: err.message
            })).on("end", () => {
              span.end();
            });
          } else {
            thisPlugin._wrap(arguments, cbIndex, thisPlugin._patchCallbackQuery(span, parentContext));
            return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
              return originalQuery.apply(connection, arguments);
            });
          }
        };
      };
    }
    _patchCallbackQuery(span, parentContext) {
      return (originalCallback) => {
        return function(err, results, fields) {
          if (err) {
            span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: err.message
            });
          }
          span.end();
          return api_1.context.with(parentContext, () => originalCallback(...arguments));
        };
      };
    }
    _setPoolcallbacks(pool, thisPlugin, id) {
      const poolName = id || (0, utils_1.getPoolName)(pool);
      pool.on("connection", (connection) => {
        thisPlugin._connectionsUsage.add(1, {
          state: "idle",
          name: poolName
        });
      });
      pool.on("acquire", (connection) => {
        thisPlugin._connectionsUsage.add(-1, {
          state: "idle",
          name: poolName
        });
        thisPlugin._connectionsUsage.add(1, {
          state: "used",
          name: poolName
        });
      });
      pool.on("release", (connection) => {
        thisPlugin._connectionsUsage.add(-1, {
          state: "used",
          name: poolName
        });
        thisPlugin._connectionsUsage.add(1, {
          state: "idle",
          name: poolName
        });
      });
    }
  }
  instrumentation.MySQLInstrumentation = MySQLInstrumentation;
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MySQLInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "MySQLInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.MySQLInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
