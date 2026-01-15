import { r as require$$0 } from "./api.mjs";
import { r as require$$1 } from "./core.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
var src = {};
var mongoose = {};
var utils = {};
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_DB_USER = semconv.ATTR_DB_SYSTEM = semconv.ATTR_DB_STATEMENT = semconv.ATTR_DB_OPERATION = semconv.ATTR_DB_NAME = semconv.ATTR_DB_MONGODB_COLLECTION = void 0;
  semconv.ATTR_DB_MONGODB_COLLECTION = "db.mongodb.collection";
  semconv.ATTR_DB_NAME = "db.name";
  semconv.ATTR_DB_OPERATION = "db.operation";
  semconv.ATTR_DB_STATEMENT = "db.statement";
  semconv.ATTR_DB_SYSTEM = "db.system";
  semconv.ATTR_DB_USER = "db.user";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  return semconv;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.handleCallbackResponse = utils.handlePromiseResponse = utils.getAttributesFromCollection = void 0;
  const api_1 = require$$0;
  const instrumentation_1 = require$$2;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  function getAttributesFromCollection(collection) {
    return {
      [semconv_1.ATTR_DB_MONGODB_COLLECTION]: collection.name,
      [semconv_1.ATTR_DB_NAME]: collection.conn.name,
      [semconv_1.ATTR_DB_USER]: collection.conn.user,
      [semconv_1.ATTR_NET_PEER_NAME]: collection.conn.host,
      [semconv_1.ATTR_NET_PEER_PORT]: collection.conn.port
    };
  }
  utils.getAttributesFromCollection = getAttributesFromCollection;
  function setErrorStatus(span, error = {}) {
    span.recordException(error);
    span.setStatus({
      code: api_1.SpanStatusCode.ERROR,
      message: `${error.message} ${error.code ? `
Mongoose Error Code: ${error.code}` : ""}`
    });
  }
  function applyResponseHook(span, response, responseHook, moduleVersion = void 0) {
    if (!responseHook) {
      return;
    }
    (0, instrumentation_1.safeExecuteInTheMiddle)(() => responseHook(span, { moduleVersion, response }), (e) => {
      if (e) {
        api_1.diag.error("mongoose instrumentation: responseHook error", e);
      }
    }, true);
  }
  function handlePromiseResponse(execResponse, span, responseHook, moduleVersion = void 0) {
    if (!(execResponse instanceof Promise)) {
      applyResponseHook(span, execResponse, responseHook, moduleVersion);
      span.end();
      return execResponse;
    }
    return execResponse.then((response) => {
      applyResponseHook(span, response, responseHook, moduleVersion);
      return response;
    }).catch((err) => {
      setErrorStatus(span, err);
      throw err;
    }).finally(() => span.end());
  }
  utils.handlePromiseResponse = handlePromiseResponse;
  function handleCallbackResponse(callback, exec, originalThis, span, args, responseHook, moduleVersion = void 0) {
    let callbackArgumentIndex = 0;
    if (args.length === 2) {
      callbackArgumentIndex = 1;
    } else if (args.length === 3) {
      callbackArgumentIndex = 2;
    }
    args[callbackArgumentIndex] = (err, response) => {
      if (err) {
        setErrorStatus(span, err);
      } else {
        applyResponseHook(span, response, responseHook, moduleVersion);
      }
      span.end();
      return callback(err, response);
    };
    return exec.apply(originalThis, args);
  }
  utils.handleCallbackResponse = handleCallbackResponse;
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
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-mongoose";
  return version;
}
var hasRequiredMongoose;
function requireMongoose() {
  if (hasRequiredMongoose) return mongoose;
  hasRequiredMongoose = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MongooseInstrumentation = exports$1._STORED_PARENT_SPAN = void 0;
    const api_1 = require$$0;
    const core_1 = require$$1;
    const utils_1 = /* @__PURE__ */ requireUtils();
    const instrumentation_1 = require$$2;
    const version_1 = /* @__PURE__ */ requireVersion();
    const semconv_1 = /* @__PURE__ */ requireSemconv();
    const contextCaptureFunctionsCommon = [
      "deleteOne",
      "deleteMany",
      "find",
      "findOne",
      "estimatedDocumentCount",
      "countDocuments",
      "distinct",
      "where",
      "$where",
      "findOneAndUpdate",
      "findOneAndDelete",
      "findOneAndReplace"
    ];
    const contextCaptureFunctions6 = [
      "remove",
      "count",
      "findOneAndRemove",
      ...contextCaptureFunctionsCommon
    ];
    const contextCaptureFunctions7 = [
      "count",
      "findOneAndRemove",
      ...contextCaptureFunctionsCommon
    ];
    const contextCaptureFunctions8 = [...contextCaptureFunctionsCommon];
    function getContextCaptureFunctions(moduleVersion) {
      if (!moduleVersion) {
        return contextCaptureFunctionsCommon;
      } else if (moduleVersion.startsWith("6.") || moduleVersion.startsWith("5.")) {
        return contextCaptureFunctions6;
      } else if (moduleVersion.startsWith("7.")) {
        return contextCaptureFunctions7;
      } else {
        return contextCaptureFunctions8;
      }
    }
    function instrumentRemove(moduleVersion) {
      return moduleVersion && (moduleVersion.startsWith("5.") || moduleVersion.startsWith("6.")) || false;
    }
    exports$1._STORED_PARENT_SPAN = /* @__PURE__ */ Symbol("stored-parent-span");
    class MongooseInstrumentation extends instrumentation_1.InstrumentationBase {
      constructor(config = {}) {
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
      }
      init() {
        const module = new instrumentation_1.InstrumentationNodeModuleDefinition("mongoose", [">=5.9.7 <9"], this.patch.bind(this), this.unpatch.bind(this));
        return module;
      }
      patch(module, moduleVersion) {
        const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
        this._wrap(moduleExports.Model.prototype, "save", this.patchOnModelMethods("save", moduleVersion));
        moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
        if (instrumentRemove(moduleVersion)) {
          this._wrap(moduleExports.Model.prototype, "remove", this.patchOnModelMethods("remove", moduleVersion));
        }
        this._wrap(moduleExports.Query.prototype, "exec", this.patchQueryExec(moduleVersion));
        this._wrap(moduleExports.Aggregate.prototype, "exec", this.patchAggregateExec(moduleVersion));
        const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
        contextCaptureFunctions.forEach((funcName) => {
          this._wrap(moduleExports.Query.prototype, funcName, this.patchAndCaptureSpanContext(funcName));
        });
        this._wrap(moduleExports.Model, "aggregate", this.patchModelAggregate());
        this._wrap(moduleExports.Model, "insertMany", this.patchModelStatic("insertMany", moduleVersion));
        this._wrap(moduleExports.Model, "bulkWrite", this.patchModelStatic("bulkWrite", moduleVersion));
        return moduleExports;
      }
      unpatch(module, moduleVersion) {
        const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
        const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
        this._unwrap(moduleExports.Model.prototype, "save");
        moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
        if (instrumentRemove(moduleVersion)) {
          this._unwrap(moduleExports.Model.prototype, "remove");
        }
        this._unwrap(moduleExports.Query.prototype, "exec");
        this._unwrap(moduleExports.Aggregate.prototype, "exec");
        contextCaptureFunctions.forEach((funcName) => {
          this._unwrap(moduleExports.Query.prototype, funcName);
        });
        this._unwrap(moduleExports.Model, "aggregate");
        this._unwrap(moduleExports.Model, "insertMany");
        this._unwrap(moduleExports.Model, "bulkWrite");
      }
      patchAggregateExec(moduleVersion) {
        const self = this;
        return (originalAggregate) => {
          return function exec(callback) {
            if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) {
              return originalAggregate.apply(this, arguments);
            }
            const parentSpan = this[exports$1._STORED_PARENT_SPAN];
            const attributes = {};
            const { dbStatementSerializer } = self.getConfig();
            if (dbStatementSerializer) {
              attributes[semconv_1.ATTR_DB_STATEMENT] = dbStatementSerializer("aggregate", {
                options: this.options,
                aggregatePipeline: this._pipeline
              });
            }
            const span = self._startSpan(this._model.collection, this._model?.modelName, "aggregate", attributes, parentSpan);
            return self._handleResponse(span, originalAggregate, this, arguments, callback, moduleVersion);
          };
        };
      }
      patchQueryExec(moduleVersion) {
        const self = this;
        return (originalExec) => {
          return function exec(callback) {
            if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) {
              return originalExec.apply(this, arguments);
            }
            const parentSpan = this[exports$1._STORED_PARENT_SPAN];
            const attributes = {};
            const { dbStatementSerializer } = self.getConfig();
            if (dbStatementSerializer) {
              attributes[semconv_1.ATTR_DB_STATEMENT] = dbStatementSerializer(this.op, {
                condition: this._conditions,
                updates: this._update,
                options: this.options,
                fields: this._fields
              });
            }
            const span = self._startSpan(this.mongooseCollection, this.model.modelName, this.op, attributes, parentSpan);
            return self._handleResponse(span, originalExec, this, arguments, callback, moduleVersion);
          };
        };
      }
      patchOnModelMethods(op, moduleVersion) {
        const self = this;
        return (originalOnModelFunction) => {
          return function method(options, callback) {
            if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) {
              return originalOnModelFunction.apply(this, arguments);
            }
            const serializePayload = { document: this };
            if (options && !(options instanceof Function)) {
              serializePayload.options = options;
            }
            const attributes = {};
            const { dbStatementSerializer } = self.getConfig();
            if (dbStatementSerializer) {
              attributes[semconv_1.ATTR_DB_STATEMENT] = dbStatementSerializer(op, serializePayload);
            }
            const span = self._startSpan(this.constructor.collection, this.constructor.modelName, op, attributes);
            if (options instanceof Function) {
              callback = options;
              options = void 0;
            }
            return self._handleResponse(span, originalOnModelFunction, this, arguments, callback, moduleVersion);
          };
        };
      }
      patchModelStatic(op, moduleVersion) {
        const self = this;
        return (original) => {
          return function patchedStatic(docsOrOps, options, callback) {
            if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) {
              return original.apply(this, arguments);
            }
            if (typeof options === "function") {
              callback = options;
              options = void 0;
            }
            const serializePayload = {};
            switch (op) {
              case "insertMany":
                serializePayload.documents = docsOrOps;
                break;
              case "bulkWrite":
                serializePayload.operations = docsOrOps;
                break;
              default:
                serializePayload.document = docsOrOps;
                break;
            }
            if (options !== void 0) {
              serializePayload.options = options;
            }
            const attributes = {};
            const { dbStatementSerializer } = self.getConfig();
            if (dbStatementSerializer) {
              attributes[semconv_1.ATTR_DB_STATEMENT] = dbStatementSerializer(op, serializePayload);
            }
            const span = self._startSpan(this.collection, this.modelName, op, attributes);
            return self._handleResponse(span, original, this, arguments, callback, moduleVersion);
          };
        };
      }
      // we want to capture the otel span on the object which is calling exec.
      // in the special case of aggregate, we need have no function to path
      // on the Aggregate object to capture the context on, so we patch
      // the aggregate of Model, and set the context on the Aggregate object
      patchModelAggregate() {
        const self = this;
        return (original) => {
          return function captureSpanContext() {
            const currentSpan = api_1.trace.getSpan(api_1.context.active());
            const aggregate = self._callOriginalFunction(() => original.apply(this, arguments));
            if (aggregate)
              aggregate[exports$1._STORED_PARENT_SPAN] = currentSpan;
            return aggregate;
          };
        };
      }
      patchAndCaptureSpanContext(funcName) {
        const self = this;
        return (original) => {
          return function captureSpanContext() {
            this[exports$1._STORED_PARENT_SPAN] = api_1.trace.getSpan(api_1.context.active());
            return self._callOriginalFunction(() => original.apply(this, arguments));
          };
        };
      }
      _startSpan(collection, modelName, operation, attributes, parentSpan) {
        return this.tracer.startSpan(`mongoose.${modelName}.${operation}`, {
          kind: api_1.SpanKind.CLIENT,
          attributes: {
            ...attributes,
            ...(0, utils_1.getAttributesFromCollection)(collection),
            [semconv_1.ATTR_DB_OPERATION]: operation,
            [semconv_1.ATTR_DB_SYSTEM]: "mongoose"
          }
        }, parentSpan ? api_1.trace.setSpan(api_1.context.active(), parentSpan) : void 0);
      }
      _handleResponse(span, exec, originalThis, args, callback, moduleVersion = void 0) {
        const self = this;
        if (callback instanceof Function) {
          return self._callOriginalFunction(() => (0, utils_1.handleCallbackResponse)(callback, exec, originalThis, span, args, self.getConfig().responseHook, moduleVersion));
        } else {
          const response = self._callOriginalFunction(() => exec.apply(originalThis, args));
          return (0, utils_1.handlePromiseResponse)(response, span, self.getConfig().responseHook, moduleVersion);
        }
      }
      _callOriginalFunction(originalFunction) {
        if (this.getConfig().suppressInternalInstrumentation) {
          return api_1.context.with((0, core_1.suppressTracing)(api_1.context.active()), originalFunction);
        } else {
          return originalFunction();
        }
      }
    }
    exports$1.MongooseInstrumentation = MongooseInstrumentation;
  })(mongoose);
  return mongoose;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MongooseInstrumentation = void 0;
    var mongoose_1 = /* @__PURE__ */ requireMongoose();
    Object.defineProperty(exports$1, "MongooseInstrumentation", { enumerable: true, get: function() {
      return mongoose_1.MongooseInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
