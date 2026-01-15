import { r as require$$0 } from "./api.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
import { r as requireSrc$1 } from "./sql-common.mjs";
import { r as require$$5 } from "./semantic-conventions.mjs";
var src = {};
var instrumentation = {};
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.DB_SYSTEM_VALUE_MYSQL = semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_DB_USER = semconv.ATTR_DB_SYSTEM = semconv.ATTR_DB_STATEMENT = semconv.ATTR_DB_NAME = semconv.ATTR_DB_CONNECTION_STRING = void 0;
  semconv.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv.ATTR_DB_NAME = "db.name";
  semconv.ATTR_DB_STATEMENT = "db.statement";
  semconv.ATTR_DB_SYSTEM = "db.system";
  semconv.ATTR_DB_USER = "db.user";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv.DB_SYSTEM_VALUE_MYSQL = "mysql";
  return semconv;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.getConnectionPrototypeToInstrument = utils.once = utils.getSpanName = utils.getQueryText = utils.getConnectionAttributes = void 0;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const instrumentation_1 = require$$2;
  const semantic_conventions_1 = require$$5;
  function getConnectionAttributes(config, dbSemconvStability, netSemconvStability) {
    const { host, port, database, user } = getConfig(config);
    const attrs = {};
    if (dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
      attrs[semconv_1.ATTR_DB_CONNECTION_STRING] = getJDBCString(host, port, database);
      attrs[semconv_1.ATTR_DB_NAME] = database;
      attrs[semconv_1.ATTR_DB_USER] = user;
    }
    if (dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
      attrs[semantic_conventions_1.ATTR_DB_NAMESPACE] = database;
    }
    const portNumber = parseInt(port, 10);
    if (netSemconvStability & instrumentation_1.SemconvStability.OLD) {
      attrs[semconv_1.ATTR_NET_PEER_NAME] = host;
      if (!isNaN(portNumber)) {
        attrs[semconv_1.ATTR_NET_PEER_PORT] = portNumber;
      }
    }
    if (netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
      attrs[semantic_conventions_1.ATTR_SERVER_ADDRESS] = host;
      if (!isNaN(portNumber)) {
        attrs[semantic_conventions_1.ATTR_SERVER_PORT] = portNumber;
      }
    }
    return attrs;
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
  function getQueryText(query, format, values, maskStatement = false, maskStatementHook = defaultMaskingHook) {
    const [querySql, queryValues] = typeof query === "string" ? [query, values] : [query.sql, hasValues(query) ? values || query.values : values];
    try {
      if (maskStatement) {
        return maskStatementHook(querySql);
      } else if (format && queryValues) {
        return format(querySql, queryValues);
      } else {
        return querySql;
      }
    } catch (e) {
      return "Could not determine the query due to an error in masking or formatting";
    }
  }
  utils.getQueryText = getQueryText;
  function defaultMaskingHook(query) {
    return query.replace(/\b\d+\b/g, "?").replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, "?");
  }
  function hasValues(obj) {
    return "values" in obj;
  }
  function getSpanName(query) {
    const rawQuery = typeof query === "object" ? query.sql : query;
    const firstSpace = rawQuery?.indexOf(" ");
    if (typeof firstSpace === "number" && firstSpace !== -1) {
      return rawQuery?.substring(0, firstSpace);
    }
    return rawQuery;
  }
  utils.getSpanName = getSpanName;
  const once = (fn) => {
    let called = false;
    return (...args) => {
      if (called)
        return;
      called = true;
      return fn(...args);
    };
  };
  utils.once = once;
  function getConnectionPrototypeToInstrument(connection) {
    const connectionPrototype = connection.prototype;
    const basePrototype = Object.getPrototypeOf(connectionPrototype);
    if (typeof basePrototype?.query === "function" && typeof basePrototype?.execute === "function") {
      return basePrototype;
    }
    return connectionPrototype;
  }
  utils.getConnectionPrototypeToInstrument = getConnectionPrototypeToInstrument;
  return utils;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.55.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-mysql2";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.MySQL2Instrumentation = void 0;
  const api = require$$0;
  const instrumentation_1 = require$$2;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const sql_common_1 = /* @__PURE__ */ requireSrc$1();
  const utils_1 = /* @__PURE__ */ requireUtils();
  const version_1 = /* @__PURE__ */ requireVersion();
  const semantic_conventions_1 = require$$5;
  const supportedVersions = [">=1.4.2 <4"];
  class MySQL2Instrumentation extends instrumentation_1.InstrumentationBase {
    _netSemconvStability;
    _dbSemconvStability;
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
      this._setSemconvStabilityFromEnv();
    }
    // Used for testing.
    _setSemconvStabilityFromEnv() {
      this._netSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
      this._dbSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    init() {
      let format;
      function setFormatFunction(moduleExports) {
        if (!format && moduleExports.format) {
          format = moduleExports.format;
        }
      }
      const patch = (ConnectionPrototype) => {
        if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.query)) {
          this._unwrap(ConnectionPrototype, "query");
        }
        this._wrap(ConnectionPrototype, "query", this._patchQuery(format, false));
        if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.execute)) {
          this._unwrap(ConnectionPrototype, "execute");
        }
        this._wrap(ConnectionPrototype, "execute", this._patchQuery(format, true));
      };
      const unpatch = (ConnectionPrototype) => {
        this._unwrap(ConnectionPrototype, "query");
        this._unwrap(ConnectionPrototype, "execute");
      };
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("mysql2", supportedVersions, (moduleExports) => {
          setFormatFunction(moduleExports);
          return moduleExports;
        }, () => {
        }, [
          new instrumentation_1.InstrumentationNodeModuleFile("mysql2/promise.js", supportedVersions, (moduleExports) => {
            setFormatFunction(moduleExports);
            return moduleExports;
          }, () => {
          }),
          new instrumentation_1.InstrumentationNodeModuleFile("mysql2/lib/connection.js", supportedVersions, (moduleExports) => {
            const ConnectionPrototype = (0, utils_1.getConnectionPrototypeToInstrument)(moduleExports);
            patch(ConnectionPrototype);
            return moduleExports;
          }, (moduleExports) => {
            if (moduleExports === void 0)
              return;
            const ConnectionPrototype = (0, utils_1.getConnectionPrototypeToInstrument)(moduleExports);
            unpatch(ConnectionPrototype);
          })
        ])
      ];
    }
    _patchQuery(format, isPrepared) {
      return (originalQuery) => {
        const thisPlugin = this;
        return function query(query, _valuesOrCallback, _callback) {
          let values;
          if (Array.isArray(_valuesOrCallback)) {
            values = _valuesOrCallback;
          } else if (arguments[2]) {
            values = [_valuesOrCallback];
          }
          const { maskStatement, maskStatementHook, responseHook } = thisPlugin.getConfig();
          const attributes = (0, utils_1.getConnectionAttributes)(this.config, thisPlugin._dbSemconvStability, thisPlugin._netSemconvStability);
          const dbQueryText = (0, utils_1.getQueryText)(query, format, values, maskStatement, maskStatementHook);
          if (thisPlugin._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
            attributes[semconv_1.ATTR_DB_SYSTEM] = semconv_1.DB_SYSTEM_VALUE_MYSQL;
            attributes[semconv_1.ATTR_DB_STATEMENT] = dbQueryText;
          }
          if (thisPlugin._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
            attributes[semantic_conventions_1.ATTR_DB_SYSTEM_NAME] = semantic_conventions_1.DB_SYSTEM_NAME_VALUE_MYSQL;
            attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = dbQueryText;
          }
          const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(query), {
            kind: api.SpanKind.CLIENT,
            attributes
          });
          if (!isPrepared && thisPlugin.getConfig().addSqlCommenterCommentToQueries) {
            arguments[0] = query = typeof query === "string" ? (0, sql_common_1.addSqlCommenterComment)(span, query) : Object.assign(query, {
              sql: (0, sql_common_1.addSqlCommenterComment)(span, query.sql)
            });
          }
          const endSpan = (0, utils_1.once)((err, results) => {
            if (err) {
              span.setStatus({
                code: api.SpanStatusCode.ERROR,
                message: err.message
              });
            } else {
              if (typeof responseHook === "function") {
                (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
                  responseHook(span, {
                    queryResults: results
                  });
                }, (err2) => {
                  if (err2) {
                    thisPlugin._diag.warn("Failed executing responseHook", err2);
                  }
                }, true);
              }
            }
            span.end();
          });
          if (arguments.length === 1) {
            if (typeof query.onResult === "function") {
              thisPlugin._wrap(query, "onResult", thisPlugin._patchCallbackQuery(endSpan));
            }
            const streamableQuery = originalQuery.apply(this, arguments);
            streamableQuery.once("error", (err) => {
              endSpan(err);
            }).once("result", (results) => {
              endSpan(void 0, results);
            });
            return streamableQuery;
          }
          if (typeof arguments[1] === "function") {
            thisPlugin._wrap(arguments, 1, thisPlugin._patchCallbackQuery(endSpan));
          } else if (typeof arguments[2] === "function") {
            thisPlugin._wrap(arguments, 2, thisPlugin._patchCallbackQuery(endSpan));
          }
          return originalQuery.apply(this, arguments);
        };
      };
    }
    _patchCallbackQuery(endSpan) {
      return (originalCallback) => {
        return function(err, results, fields) {
          endSpan(err, results);
          return originalCallback(...arguments);
        };
      };
    }
  }
  instrumentation.MySQL2Instrumentation = MySQL2Instrumentation;
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MySQL2Instrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "MySQL2Instrumentation", { enumerable: true, get: function() {
      return instrumentation_1.MySQL2Instrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
