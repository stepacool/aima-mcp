import { r as require$$0 } from "./api.mjs";
import require$$0$1 from "events";
import { r as require$$2 } from "./instrumentation.mjs";
var src = {};
var instrumentation = {};
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.DB_SYSTEM_VALUE_MSSQL = semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_DB_USER = semconv.ATTR_DB_SYSTEM = semconv.ATTR_DB_STATEMENT = semconv.ATTR_DB_SQL_TABLE = semconv.ATTR_DB_NAME = void 0;
  semconv.ATTR_DB_NAME = "db.name";
  semconv.ATTR_DB_SQL_TABLE = "db.sql.table";
  semconv.ATTR_DB_STATEMENT = "db.statement";
  semconv.ATTR_DB_SYSTEM = "db.system";
  semconv.ATTR_DB_USER = "db.user";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv.DB_SYSTEM_VALUE_MSSQL = "mssql";
  return semconv;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.once = utils.getSpanName = void 0;
  function getSpanName(operation, db, sql, bulkLoadTable) {
    if (operation === "execBulkLoad" && bulkLoadTable && db) {
      return `${operation} ${bulkLoadTable} ${db}`;
    }
    if (operation === "callProcedure") {
      if (db) {
        return `${operation} ${sql} ${db}`;
      }
      return `${operation} ${sql}`;
    }
    if (db) {
      return `${operation} ${db}`;
    }
    return `${operation}`;
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
  return utils;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.27.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-tedious";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.TediousInstrumentation = exports$1.INJECTED_CTX = void 0;
    const api = require$$0;
    const events_1 = require$$0$1;
    const instrumentation_1 = require$$2;
    const semconv_1 = /* @__PURE__ */ requireSemconv();
    const utils_1 = /* @__PURE__ */ requireUtils();
    const version_1 = /* @__PURE__ */ requireVersion();
    const CURRENT_DATABASE = /* @__PURE__ */ Symbol("opentelemetry.instrumentation-tedious.current-database");
    exports$1.INJECTED_CTX = /* @__PURE__ */ Symbol("opentelemetry.instrumentation-tedious.context-info-injected");
    const PATCHED_METHODS = [
      "callProcedure",
      "execSql",
      "execSqlBatch",
      "execBulkLoad",
      "prepare",
      "execute"
    ];
    function setDatabase(databaseName) {
      Object.defineProperty(this, CURRENT_DATABASE, {
        value: databaseName,
        writable: true
      });
    }
    class TediousInstrumentation extends instrumentation_1.InstrumentationBase {
      static COMPONENT = "tedious";
      constructor(config = {}) {
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
      }
      init() {
        return [
          new instrumentation_1.InstrumentationNodeModuleDefinition(TediousInstrumentation.COMPONENT, [">=1.11.0 <20"], (moduleExports) => {
            const ConnectionPrototype = moduleExports.Connection.prototype;
            for (const method of PATCHED_METHODS) {
              if ((0, instrumentation_1.isWrapped)(ConnectionPrototype[method])) {
                this._unwrap(ConnectionPrototype, method);
              }
              this._wrap(ConnectionPrototype, method, this._patchQuery(method, moduleExports));
            }
            if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.connect)) {
              this._unwrap(ConnectionPrototype, "connect");
            }
            this._wrap(ConnectionPrototype, "connect", this._patchConnect);
            return moduleExports;
          }, (moduleExports) => {
            if (moduleExports === void 0)
              return;
            const ConnectionPrototype = moduleExports.Connection.prototype;
            for (const method of PATCHED_METHODS) {
              this._unwrap(ConnectionPrototype, method);
            }
            this._unwrap(ConnectionPrototype, "connect");
          })
        ];
      }
      _patchConnect(original) {
        return function patchedConnect() {
          setDatabase.call(this, this.config?.options?.database);
          this.removeListener("databaseChange", setDatabase);
          this.on("databaseChange", setDatabase);
          this.once("end", () => {
            this.removeListener("databaseChange", setDatabase);
          });
          return original.apply(this, arguments);
        };
      }
      _buildTraceparent(span) {
        const sc = span.spanContext();
        return `00-${sc.traceId}-${sc.spanId}-0${Number(sc.traceFlags || api.TraceFlags.NONE).toString(16)}`;
      }
      /**
       * Fire a one-off `SET CONTEXT_INFO @opentelemetry_traceparent` on the same
       * connection. Marks the request with INJECTED_CTX so our patch skips it.
       */
      _injectContextInfo(connection, tediousModule, traceparent) {
        return new Promise((resolve) => {
          try {
            const sql = "set context_info @opentelemetry_traceparent";
            const req = new tediousModule.Request(sql, (_err) => {
              resolve();
            });
            Object.defineProperty(req, exports$1.INJECTED_CTX, { value: true });
            const buf = Buffer.from(traceparent, "utf8");
            req.addParameter("opentelemetry_traceparent", tediousModule.TYPES.VarBinary, buf, { length: buf.length });
            connection.execSql(req);
          } catch {
            resolve();
          }
        });
      }
      _shouldInjectFor(operation) {
        return operation === "execSql" || operation === "execSqlBatch" || operation === "callProcedure" || operation === "execute";
      }
      _patchQuery(operation, tediousModule) {
        return (originalMethod) => {
          const thisPlugin = this;
          function patchedMethod(request) {
            if (request?.[exports$1.INJECTED_CTX]) {
              return originalMethod.apply(this, arguments);
            }
            if (!(request instanceof events_1.EventEmitter)) {
              thisPlugin._diag.warn(`Unexpected invocation of patched ${operation} method. Span not recorded`);
              return originalMethod.apply(this, arguments);
            }
            let procCount = 0;
            let statementCount = 0;
            const incrementStatementCount = () => statementCount++;
            const incrementProcCount = () => procCount++;
            const databaseName = this[CURRENT_DATABASE];
            const sql = ((request2) => {
              if (request2.sqlTextOrProcedure === "sp_prepare" && request2.parametersByName?.stmt?.value) {
                return request2.parametersByName.stmt.value;
              }
              return request2.sqlTextOrProcedure;
            })(request);
            const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(operation, databaseName, sql, request.table), {
              kind: api.SpanKind.CLIENT,
              attributes: {
                [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_MSSQL,
                [semconv_1.ATTR_DB_NAME]: databaseName,
                [semconv_1.ATTR_NET_PEER_PORT]: this.config?.options?.port,
                [semconv_1.ATTR_NET_PEER_NAME]: this.config?.server,
                // >=4 uses `authentication` object, older versions just userName and password pair
                [semconv_1.ATTR_DB_USER]: this.config?.userName ?? this.config?.authentication?.options?.userName,
                [semconv_1.ATTR_DB_STATEMENT]: sql,
                [semconv_1.ATTR_DB_SQL_TABLE]: request.table
              }
            });
            const endSpan = (0, utils_1.once)((err) => {
              request.removeListener("done", incrementStatementCount);
              request.removeListener("doneInProc", incrementStatementCount);
              request.removeListener("doneProc", incrementProcCount);
              request.removeListener("error", endSpan);
              this.removeListener("end", endSpan);
              span.setAttribute("tedious.procedure_count", procCount);
              span.setAttribute("tedious.statement_count", statementCount);
              if (err) {
                span.setStatus({
                  code: api.SpanStatusCode.ERROR,
                  message: err.message
                });
              }
              span.end();
            });
            request.on("done", incrementStatementCount);
            request.on("doneInProc", incrementStatementCount);
            request.on("doneProc", incrementProcCount);
            request.once("error", endSpan);
            this.on("end", endSpan);
            if (typeof request.callback === "function") {
              thisPlugin._wrap(request, "callback", thisPlugin._patchCallbackQuery(endSpan));
            } else {
              thisPlugin._diag.error("Expected request.callback to be a function");
            }
            const runUserRequest = () => {
              return api.context.with(api.trace.setSpan(api.context.active(), span), originalMethod, this, ...arguments);
            };
            const cfg = thisPlugin.getConfig();
            const shouldInject = cfg.enableTraceContextPropagation && thisPlugin._shouldInjectFor(operation);
            if (!shouldInject)
              return runUserRequest();
            const traceparent = thisPlugin._buildTraceparent(span);
            void thisPlugin._injectContextInfo(this, tediousModule, traceparent).finally(runUserRequest);
          }
          Object.defineProperty(patchedMethod, "length", {
            value: originalMethod.length,
            writable: false
          });
          return patchedMethod;
        };
      }
      _patchCallbackQuery(endSpan) {
        return (originalCallback) => {
          return function(err, rowCount, rows) {
            endSpan(err);
            return originalCallback.apply(this, arguments);
          };
        };
      }
    }
    exports$1.TediousInstrumentation = TediousInstrumentation;
  })(instrumentation);
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.TediousInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "TediousInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.TediousInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
