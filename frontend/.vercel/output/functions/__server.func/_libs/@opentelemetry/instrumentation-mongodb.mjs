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
  semconv.METRIC_DB_CLIENT_CONNECTIONS_USAGE = semconv.DB_SYSTEM_VALUE_MONGODB = semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_DB_SYSTEM = semconv.ATTR_DB_STATEMENT = semconv.ATTR_DB_OPERATION = semconv.ATTR_DB_NAME = semconv.ATTR_DB_MONGODB_COLLECTION = semconv.ATTR_DB_CONNECTION_STRING = void 0;
  semconv.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv.ATTR_DB_MONGODB_COLLECTION = "db.mongodb.collection";
  semconv.ATTR_DB_NAME = "db.name";
  semconv.ATTR_DB_OPERATION = "db.operation";
  semconv.ATTR_DB_STATEMENT = "db.statement";
  semconv.ATTR_DB_SYSTEM = "db.system";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv.DB_SYSTEM_VALUE_MONGODB = "mongodb";
  semconv.METRIC_DB_CLIENT_CONNECTIONS_USAGE = "db.client.connections.usage";
  return semconv;
}
var internalTypes = {};
var hasRequiredInternalTypes;
function requireInternalTypes() {
  if (hasRequiredInternalTypes) return internalTypes;
  hasRequiredInternalTypes = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MongodbCommandType = void 0;
    (function(MongodbCommandType) {
      MongodbCommandType["CREATE_INDEXES"] = "createIndexes";
      MongodbCommandType["FIND_AND_MODIFY"] = "findAndModify";
      MongodbCommandType["IS_MASTER"] = "isMaster";
      MongodbCommandType["COUNT"] = "count";
      MongodbCommandType["AGGREGATE"] = "aggregate";
      MongodbCommandType["UNKNOWN"] = "unknown";
    })(exports$1.MongodbCommandType || (exports$1.MongodbCommandType = {}));
  })(internalTypes);
  return internalTypes;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.61.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-mongodb";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.MongoDBInstrumentation = void 0;
  const api_1 = require$$0;
  const instrumentation_1 = require$$2;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
  const version_1 = /* @__PURE__ */ requireVersion();
  const DEFAULT_CONFIG = {
    requireParentSpan: true
  };
  class MongoDBInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, { ...DEFAULT_CONFIG, ...config });
    }
    setConfig(config = {}) {
      super.setConfig({ ...DEFAULT_CONFIG, ...config });
    }
    _updateMetricInstruments() {
      this._connectionsUsage = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTIONS_USAGE, {
        description: "The number of connections that are currently in state described by the state attribute.",
        unit: "{connection}"
      });
    }
    init() {
      const { v3PatchConnection, v3UnpatchConnection } = this._getV3ConnectionPatches();
      const { v4PatchConnect, v4UnpatchConnect } = this._getV4ConnectPatches();
      const { v4PatchConnectionCallback, v4PatchConnectionPromise, v4UnpatchConnection } = this._getV4ConnectionPatches();
      const { v4PatchConnectionPool, v4UnpatchConnectionPool } = this._getV4ConnectionPoolPatches();
      const { v4PatchSessions, v4UnpatchSessions } = this._getV4SessionsPatches();
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("mongodb", [">=3.3.0 <4"], void 0, void 0, [
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/core/wireprotocol/index.js", [">=3.3.0 <4"], v3PatchConnection, v3UnpatchConnection)
        ]),
        new instrumentation_1.InstrumentationNodeModuleDefinition("mongodb", [">=4.0.0 <7"], void 0, void 0, [
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/cmap/connection.js", [">=4.0.0 <6.4"], v4PatchConnectionCallback, v4UnpatchConnection),
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/cmap/connection.js", [">=6.4.0 <7"], v4PatchConnectionPromise, v4UnpatchConnection),
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/cmap/connection_pool.js", [">=4.0.0 <6.4"], v4PatchConnectionPool, v4UnpatchConnectionPool),
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/cmap/connect.js", [">=4.0.0 <7"], v4PatchConnect, v4UnpatchConnect),
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/sessions.js", [">=4.0.0 <7"], v4PatchSessions, v4UnpatchSessions)
        ])
      ];
    }
    _getV3ConnectionPatches() {
      return {
        v3PatchConnection: (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.insert)) {
            this._unwrap(moduleExports, "insert");
          }
          this._wrap(moduleExports, "insert", this._getV3PatchOperation("insert"));
          if ((0, instrumentation_1.isWrapped)(moduleExports.remove)) {
            this._unwrap(moduleExports, "remove");
          }
          this._wrap(moduleExports, "remove", this._getV3PatchOperation("remove"));
          if ((0, instrumentation_1.isWrapped)(moduleExports.update)) {
            this._unwrap(moduleExports, "update");
          }
          this._wrap(moduleExports, "update", this._getV3PatchOperation("update"));
          if ((0, instrumentation_1.isWrapped)(moduleExports.command)) {
            this._unwrap(moduleExports, "command");
          }
          this._wrap(moduleExports, "command", this._getV3PatchCommand());
          if ((0, instrumentation_1.isWrapped)(moduleExports.query)) {
            this._unwrap(moduleExports, "query");
          }
          this._wrap(moduleExports, "query", this._getV3PatchFind());
          if ((0, instrumentation_1.isWrapped)(moduleExports.getMore)) {
            this._unwrap(moduleExports, "getMore");
          }
          this._wrap(moduleExports, "getMore", this._getV3PatchCursor());
          return moduleExports;
        },
        v3UnpatchConnection: (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports, "insert");
          this._unwrap(moduleExports, "remove");
          this._unwrap(moduleExports, "update");
          this._unwrap(moduleExports, "command");
          this._unwrap(moduleExports, "query");
          this._unwrap(moduleExports, "getMore");
        }
      };
    }
    _getV4SessionsPatches() {
      return {
        v4PatchSessions: (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.acquire)) {
            this._unwrap(moduleExports, "acquire");
          }
          this._wrap(moduleExports.ServerSessionPool.prototype, "acquire", this._getV4AcquireCommand());
          if ((0, instrumentation_1.isWrapped)(moduleExports.release)) {
            this._unwrap(moduleExports, "release");
          }
          this._wrap(moduleExports.ServerSessionPool.prototype, "release", this._getV4ReleaseCommand());
          return moduleExports;
        },
        v4UnpatchSessions: (moduleExports) => {
          if (moduleExports === void 0)
            return;
          if ((0, instrumentation_1.isWrapped)(moduleExports.acquire)) {
            this._unwrap(moduleExports, "acquire");
          }
          if ((0, instrumentation_1.isWrapped)(moduleExports.release)) {
            this._unwrap(moduleExports, "release");
          }
        }
      };
    }
    _getV4AcquireCommand() {
      const instrumentation2 = this;
      return (original) => {
        return function patchAcquire() {
          const nSessionsBeforeAcquire = this.sessions.length;
          const session = original.call(this);
          const nSessionsAfterAcquire = this.sessions.length;
          if (nSessionsBeforeAcquire === nSessionsAfterAcquire) {
            instrumentation2._connectionsUsage.add(1, {
              state: "used",
              "pool.name": instrumentation2._poolName
            });
          } else if (nSessionsBeforeAcquire - 1 === nSessionsAfterAcquire) {
            instrumentation2._connectionsUsage.add(-1, {
              state: "idle",
              "pool.name": instrumentation2._poolName
            });
            instrumentation2._connectionsUsage.add(1, {
              state: "used",
              "pool.name": instrumentation2._poolName
            });
          }
          return session;
        };
      };
    }
    _getV4ReleaseCommand() {
      const instrumentation2 = this;
      return (original) => {
        return function patchRelease(session) {
          const cmdPromise = original.call(this, session);
          instrumentation2._connectionsUsage.add(-1, {
            state: "used",
            "pool.name": instrumentation2._poolName
          });
          instrumentation2._connectionsUsage.add(1, {
            state: "idle",
            "pool.name": instrumentation2._poolName
          });
          return cmdPromise;
        };
      };
    }
    _getV4ConnectionPoolPatches() {
      return {
        v4PatchConnectionPool: (moduleExports) => {
          const poolPrototype = moduleExports.ConnectionPool.prototype;
          if ((0, instrumentation_1.isWrapped)(poolPrototype.checkOut)) {
            this._unwrap(poolPrototype, "checkOut");
          }
          this._wrap(poolPrototype, "checkOut", this._getV4ConnectionPoolCheckOut());
          return moduleExports;
        },
        v4UnpatchConnectionPool: (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports.ConnectionPool.prototype, "checkOut");
        }
      };
    }
    _getV4ConnectPatches() {
      return {
        v4PatchConnect: (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.connect)) {
            this._unwrap(moduleExports, "connect");
          }
          this._wrap(moduleExports, "connect", this._getV4ConnectCommand());
          return moduleExports;
        },
        v4UnpatchConnect: (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports, "connect");
        }
      };
    }
    // This patch will become unnecessary once
    // https://jira.mongodb.org/browse/NODE-5639 is done.
    _getV4ConnectionPoolCheckOut() {
      return (original) => {
        return function patchedCheckout(callback) {
          const patchedCallback = api_1.context.bind(api_1.context.active(), callback);
          return original.call(this, patchedCallback);
        };
      };
    }
    _getV4ConnectCommand() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedConnect(options, callback) {
          if (original.length === 1) {
            const result = original.call(this, options);
            if (result && typeof result.then === "function") {
              result.then(
                () => instrumentation2.setPoolName(options),
                // this handler is set to pass the lint rules
                () => void 0
              );
            }
            return result;
          }
          const patchedCallback = function(err, conn) {
            if (err || !conn) {
              callback(err, conn);
              return;
            }
            instrumentation2.setPoolName(options);
            callback(err, conn);
          };
          return original.call(this, options, patchedCallback);
        };
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getV4ConnectionPatches() {
      return {
        v4PatchConnectionCallback: (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.Connection.prototype.command)) {
            this._unwrap(moduleExports.Connection.prototype, "command");
          }
          this._wrap(moduleExports.Connection.prototype, "command", this._getV4PatchCommandCallback());
          return moduleExports;
        },
        v4PatchConnectionPromise: (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.Connection.prototype.command)) {
            this._unwrap(moduleExports.Connection.prototype, "command");
          }
          this._wrap(moduleExports.Connection.prototype, "command", this._getV4PatchCommandPromise());
          return moduleExports;
        },
        v4UnpatchConnection: (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports.Connection.prototype, "command");
        }
      };
    }
    /** Creates spans for common operations */
    _getV3PatchOperation(operationName) {
      const instrumentation2 = this;
      return (original) => {
        return function patchedServerCommand(server, ns, ops, options, callback) {
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const resultHandler = typeof options === "function" ? options : callback;
          if (skipInstrumentation || typeof resultHandler !== "function" || typeof ops !== "object") {
            if (typeof options === "function") {
              return original.call(this, server, ns, ops, options);
            } else {
              return original.call(this, server, ns, ops, options, callback);
            }
          }
          const span = instrumentation2.tracer.startSpan(`mongodb.${operationName}`, {
            kind: api_1.SpanKind.CLIENT
          });
          instrumentation2._populateV3Attributes(
            span,
            ns,
            server,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ops[0],
            operationName
          );
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler);
          if (typeof options === "function") {
            return original.call(this, server, ns, ops, patchedCallback);
          } else {
            return original.call(this, server, ns, ops, options, patchedCallback);
          }
        };
      };
    }
    /** Creates spans for command operation */
    _getV3PatchCommand() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedServerCommand(server, ns, cmd, options, callback) {
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const resultHandler = typeof options === "function" ? options : callback;
          if (skipInstrumentation || typeof resultHandler !== "function" || typeof cmd !== "object") {
            if (typeof options === "function") {
              return original.call(this, server, ns, cmd, options);
            } else {
              return original.call(this, server, ns, cmd, options, callback);
            }
          }
          const commandType = MongoDBInstrumentation._getCommandType(cmd);
          const type = commandType === internal_types_1.MongodbCommandType.UNKNOWN ? "command" : commandType;
          const span = instrumentation2.tracer.startSpan(`mongodb.${type}`, {
            kind: api_1.SpanKind.CLIENT
          });
          const operation = commandType === internal_types_1.MongodbCommandType.UNKNOWN ? void 0 : commandType;
          instrumentation2._populateV3Attributes(span, ns, server, cmd, operation);
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler);
          if (typeof options === "function") {
            return original.call(this, server, ns, cmd, patchedCallback);
          } else {
            return original.call(this, server, ns, cmd, options, patchedCallback);
          }
        };
      };
    }
    /** Creates spans for command operation */
    _getV4PatchCommandCallback() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedV4ServerCommand(ns, cmd, options, callback) {
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const resultHandler = callback;
          const commandType = Object.keys(cmd)[0];
          if (typeof cmd !== "object" || cmd.ismaster || cmd.hello) {
            return original.call(this, ns, cmd, options, callback);
          }
          let span = void 0;
          if (!skipInstrumentation) {
            span = instrumentation2.tracer.startSpan(`mongodb.${commandType}`, {
              kind: api_1.SpanKind.CLIENT
            });
            instrumentation2._populateV4Attributes(span, this, ns, cmd, commandType);
          }
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler, this.id, commandType);
          return original.call(this, ns, cmd, options, patchedCallback);
        };
      };
    }
    _getV4PatchCommandPromise() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedV4ServerCommand(...args) {
          const [ns, cmd] = args;
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const commandType = Object.keys(cmd)[0];
          const resultHandler = () => void 0;
          if (typeof cmd !== "object" || cmd.ismaster || cmd.hello) {
            return original.apply(this, args);
          }
          let span = void 0;
          if (!skipInstrumentation) {
            span = instrumentation2.tracer.startSpan(`mongodb.${commandType}`, {
              kind: api_1.SpanKind.CLIENT
            });
            instrumentation2._populateV4Attributes(span, this, ns, cmd, commandType);
          }
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler, this.id, commandType);
          const result = original.apply(this, args);
          result.then((res) => patchedCallback(null, res), (err) => patchedCallback(err));
          return result;
        };
      };
    }
    /** Creates spans for find operation */
    _getV3PatchFind() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedServerCommand(server, ns, cmd, cursorState, options, callback) {
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const resultHandler = typeof options === "function" ? options : callback;
          if (skipInstrumentation || typeof resultHandler !== "function" || typeof cmd !== "object") {
            if (typeof options === "function") {
              return original.call(this, server, ns, cmd, cursorState, options);
            } else {
              return original.call(this, server, ns, cmd, cursorState, options, callback);
            }
          }
          const span = instrumentation2.tracer.startSpan("mongodb.find", {
            kind: api_1.SpanKind.CLIENT
          });
          instrumentation2._populateV3Attributes(span, ns, server, cmd, "find");
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler);
          if (typeof options === "function") {
            return original.call(this, server, ns, cmd, cursorState, patchedCallback);
          } else {
            return original.call(this, server, ns, cmd, cursorState, options, patchedCallback);
          }
        };
      };
    }
    /** Creates spans for find operation */
    _getV3PatchCursor() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedServerCommand(server, ns, cursorState, batchSize, options, callback) {
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const resultHandler = typeof options === "function" ? options : callback;
          if (skipInstrumentation || typeof resultHandler !== "function") {
            if (typeof options === "function") {
              return original.call(this, server, ns, cursorState, batchSize, options);
            } else {
              return original.call(this, server, ns, cursorState, batchSize, options, callback);
            }
          }
          const span = instrumentation2.tracer.startSpan("mongodb.getMore", {
            kind: api_1.SpanKind.CLIENT
          });
          instrumentation2._populateV3Attributes(span, ns, server, cursorState.cmd, "getMore");
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler);
          if (typeof options === "function") {
            return original.call(this, server, ns, cursorState, batchSize, patchedCallback);
          } else {
            return original.call(this, server, ns, cursorState, batchSize, options, patchedCallback);
          }
        };
      };
    }
    /**
     * Get the mongodb command type from the object.
     * @param command Internal mongodb command object
     */
    static _getCommandType(command) {
      if (command.createIndexes !== void 0) {
        return internal_types_1.MongodbCommandType.CREATE_INDEXES;
      } else if (command.findandmodify !== void 0) {
        return internal_types_1.MongodbCommandType.FIND_AND_MODIFY;
      } else if (command.ismaster !== void 0) {
        return internal_types_1.MongodbCommandType.IS_MASTER;
      } else if (command.count !== void 0) {
        return internal_types_1.MongodbCommandType.COUNT;
      } else if (command.aggregate !== void 0) {
        return internal_types_1.MongodbCommandType.AGGREGATE;
      } else {
        return internal_types_1.MongodbCommandType.UNKNOWN;
      }
    }
    /**
     * Populate span's attributes by fetching related metadata from the context
     * @param span span to add attributes to
     * @param connectionCtx mongodb internal connection context
     * @param ns mongodb namespace
     * @param command mongodb internal representation of a command
     */
    _populateV4Attributes(span, connectionCtx, ns, command, operation) {
      let host, port;
      if (connectionCtx) {
        const hostParts = typeof connectionCtx.address === "string" ? connectionCtx.address.split(":") : "";
        if (hostParts.length === 2) {
          host = hostParts[0];
          port = hostParts[1];
        }
      }
      let commandObj;
      if (command?.documents && command.documents[0]) {
        commandObj = command.documents[0];
      } else if (command?.cursors) {
        commandObj = command.cursors;
      } else {
        commandObj = command;
      }
      this._addAllSpanAttributes(span, ns.db, ns.collection, host, port, commandObj, operation);
    }
    /**
     * Populate span's attributes by fetching related metadata from the context
     * @param span span to add attributes to
     * @param ns mongodb namespace
     * @param topology mongodb internal representation of the network topology
     * @param command mongodb internal representation of a command
     */
    _populateV3Attributes(span, ns, topology, command, operation) {
      let host;
      let port;
      if (topology && topology.s) {
        host = topology.s.options?.host ?? topology.s.host;
        port = (topology.s.options?.port ?? topology.s.port)?.toString();
        if (host == null || port == null) {
          const address = topology.description?.address;
          if (address) {
            const addressSegments = address.split(":");
            host = addressSegments[0];
            port = addressSegments[1];
          }
        }
      }
      const [dbName, dbCollection] = ns.toString().split(".");
      const commandObj = command?.query ?? command?.q ?? command;
      this._addAllSpanAttributes(span, dbName, dbCollection, host, port, commandObj, operation);
    }
    _addAllSpanAttributes(span, dbName, dbCollection, host, port, commandObj, operation) {
      span.setAttributes({
        [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_MONGODB,
        [semconv_1.ATTR_DB_NAME]: dbName,
        [semconv_1.ATTR_DB_MONGODB_COLLECTION]: dbCollection,
        [semconv_1.ATTR_DB_OPERATION]: operation,
        [semconv_1.ATTR_DB_CONNECTION_STRING]: `mongodb://${host}:${port}/${dbName}`
      });
      if (host && port) {
        span.setAttribute(semconv_1.ATTR_NET_PEER_NAME, host);
        const portNumber = parseInt(port, 10);
        if (!isNaN(portNumber)) {
          span.setAttribute(semconv_1.ATTR_NET_PEER_PORT, portNumber);
        }
      }
      if (!commandObj)
        return;
      const { dbStatementSerializer: configDbStatementSerializer } = this.getConfig();
      const dbStatementSerializer = typeof configDbStatementSerializer === "function" ? configDbStatementSerializer : this._defaultDbStatementSerializer.bind(this);
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
        const query = dbStatementSerializer(commandObj);
        span.setAttribute(semconv_1.ATTR_DB_STATEMENT, query);
      }, (err) => {
        if (err) {
          this._diag.error("Error running dbStatementSerializer hook", err);
        }
      }, true);
    }
    _getDefaultDbStatementReplacer() {
      const seen = /* @__PURE__ */ new WeakSet();
      return (_key, value) => {
        if (typeof value !== "object" || !value)
          return "?";
        if (seen.has(value))
          return "[Circular]";
        seen.add(value);
        return value;
      };
    }
    _defaultDbStatementSerializer(commandObj) {
      const { enhancedDatabaseReporting } = this.getConfig();
      if (enhancedDatabaseReporting) {
        return JSON.stringify(commandObj);
      }
      return JSON.stringify(commandObj, this._getDefaultDbStatementReplacer());
    }
    /**
     * Triggers the response hook in case it is defined.
     * @param span The span to add the results to.
     * @param result The command result
     */
    _handleExecutionResult(span, result) {
      const { responseHook } = this.getConfig();
      if (typeof responseHook === "function") {
        (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
          responseHook(span, { data: result });
        }, (err) => {
          if (err) {
            this._diag.error("Error running response hook", err);
          }
        }, true);
      }
    }
    /**
     * Ends a created span.
     * @param span The created span to end.
     * @param resultHandler A callback function.
     * @param connectionId: The connection ID of the Command response.
     */
    _patchEnd(span, resultHandler, connectionId, commandType) {
      const activeContext = api_1.context.active();
      const instrumentation2 = this;
      return function patchedEnd(...args) {
        const error = args[0];
        if (span) {
          if (error instanceof Error) {
            span?.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: error.message
            });
          } else {
            const result = args[1];
            instrumentation2._handleExecutionResult(span, result);
          }
          span.end();
        }
        return api_1.context.with(activeContext, () => {
          if (commandType === "endSessions") {
            instrumentation2._connectionsUsage.add(-1, {
              state: "idle",
              "pool.name": instrumentation2._poolName
            });
          }
          return resultHandler.apply(this, args);
        });
      };
    }
    setPoolName(options) {
      const host = options.hostAddress?.host;
      const port = options.hostAddress?.port;
      const database = options.dbName;
      const poolName = `mongodb://${host}:${port}/${database}`;
      this._poolName = poolName;
    }
    _checkSkipInstrumentation(currentSpan) {
      const requireParentSpan = this.getConfig().requireParentSpan;
      const hasNoParentSpan = currentSpan === void 0;
      return requireParentSpan === true && hasNoParentSpan;
    }
  }
  instrumentation.MongoDBInstrumentation = MongoDBInstrumentation;
  return instrumentation;
}
var types = {};
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes) return types;
  hasRequiredTypes = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MongodbCommandType = void 0;
    (function(MongodbCommandType) {
      MongodbCommandType["CREATE_INDEXES"] = "createIndexes";
      MongodbCommandType["FIND_AND_MODIFY"] = "findAndModify";
      MongodbCommandType["IS_MASTER"] = "isMaster";
      MongodbCommandType["COUNT"] = "count";
      MongodbCommandType["UNKNOWN"] = "unknown";
    })(exports$1.MongodbCommandType || (exports$1.MongodbCommandType = {}));
  })(types);
  return types;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MongodbCommandType = exports$1.MongoDBInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "MongoDBInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.MongoDBInstrumentation;
    } });
    var types_1 = /* @__PURE__ */ requireTypes();
    Object.defineProperty(exports$1, "MongodbCommandType", { enumerable: true, get: function() {
      return types_1.MongodbCommandType;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
