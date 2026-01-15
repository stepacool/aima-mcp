import { r as require$$0 } from "./api.mjs";
import { r as require$$1 } from "./core.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
import { r as require$$5 } from "./semantic-conventions.mjs";
var src = {};
var instrumentation = {};
var AttributeNames = {};
var hasRequiredAttributeNames;
function requireAttributeNames() {
  if (hasRequiredAttributeNames) return AttributeNames;
  hasRequiredAttributeNames = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.ConnectNames = exports$1.ConnectTypes = exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["CONNECT_TYPE"] = "connect.type";
      AttributeNames2["CONNECT_NAME"] = "connect.name";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
    (function(ConnectTypes) {
      ConnectTypes["MIDDLEWARE"] = "middleware";
      ConnectTypes["REQUEST_HANDLER"] = "request_handler";
    })(exports$1.ConnectTypes || (exports$1.ConnectTypes = {}));
    (function(ConnectNames) {
      ConnectNames["MIDDLEWARE"] = "middleware";
      ConnectNames["REQUEST_HANDLER"] = "request handler";
    })(exports$1.ConnectNames || (exports$1.ConnectNames = {}));
  })(AttributeNames);
  return AttributeNames;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.52.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-connect";
  return version;
}
var utils = {};
var internalTypes = {};
var hasRequiredInternalTypes;
function requireInternalTypes() {
  if (hasRequiredInternalTypes) return internalTypes;
  hasRequiredInternalTypes = 1;
  Object.defineProperty(internalTypes, "__esModule", { value: true });
  internalTypes._LAYERS_STORE_PROPERTY = void 0;
  internalTypes._LAYERS_STORE_PROPERTY = /* @__PURE__ */ Symbol("opentelemetry.instrumentation-connect.request-route-stack");
  return internalTypes;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.generateRoute = utils.replaceCurrentStackRoute = utils.addNewStackLayer = void 0;
  const api_1 = require$$0;
  const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
  const addNewStackLayer = (request) => {
    if (Array.isArray(request[internal_types_1._LAYERS_STORE_PROPERTY]) === false) {
      Object.defineProperty(request, internal_types_1._LAYERS_STORE_PROPERTY, {
        enumerable: false,
        value: []
      });
    }
    request[internal_types_1._LAYERS_STORE_PROPERTY].push("/");
    const stackLength = request[internal_types_1._LAYERS_STORE_PROPERTY].length;
    return () => {
      if (stackLength === request[internal_types_1._LAYERS_STORE_PROPERTY].length) {
        request[internal_types_1._LAYERS_STORE_PROPERTY].pop();
      } else {
        api_1.diag.warn("Connect: Trying to pop the stack multiple time");
      }
    };
  };
  utils.addNewStackLayer = addNewStackLayer;
  const replaceCurrentStackRoute = (request, newRoute) => {
    if (newRoute) {
      request[internal_types_1._LAYERS_STORE_PROPERTY].splice(-1, 1, newRoute);
    }
  };
  utils.replaceCurrentStackRoute = replaceCurrentStackRoute;
  const generateRoute = (request) => {
    return request[internal_types_1._LAYERS_STORE_PROPERTY].reduce((acc, sub) => acc.replace(/\/+$/, "") + sub);
  };
  utils.generateRoute = generateRoute;
  return utils;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.ConnectInstrumentation = exports$1.ANONYMOUS_NAME = void 0;
    const api_1 = require$$0;
    const core_1 = require$$1;
    const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
    const version_1 = /* @__PURE__ */ requireVersion();
    const instrumentation_1 = require$$2;
    const semantic_conventions_1 = require$$5;
    const utils_1 = /* @__PURE__ */ requireUtils();
    exports$1.ANONYMOUS_NAME = "anonymous";
    class ConnectInstrumentation extends instrumentation_1.InstrumentationBase {
      constructor(config = {}) {
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
      }
      init() {
        return [
          new instrumentation_1.InstrumentationNodeModuleDefinition("connect", [">=3.0.0 <4"], (moduleExports) => {
            return this._patchConstructor(moduleExports);
          })
        ];
      }
      _patchApp(patchedApp) {
        if (!(0, instrumentation_1.isWrapped)(patchedApp.use)) {
          this._wrap(patchedApp, "use", this._patchUse.bind(this));
        }
        if (!(0, instrumentation_1.isWrapped)(patchedApp.handle)) {
          this._wrap(patchedApp, "handle", this._patchHandle.bind(this));
        }
      }
      _patchConstructor(original) {
        const instrumentation2 = this;
        return function(...args) {
          const app = original.apply(this, args);
          instrumentation2._patchApp(app);
          return app;
        };
      }
      _patchNext(next, finishSpan) {
        return function nextFunction(err) {
          const result = next.apply(this, [err]);
          finishSpan();
          return result;
        };
      }
      _startSpan(routeName, middleWare) {
        let connectType;
        let connectName;
        let connectTypeName;
        if (routeName) {
          connectType = AttributeNames_1.ConnectTypes.REQUEST_HANDLER;
          connectTypeName = AttributeNames_1.ConnectNames.REQUEST_HANDLER;
          connectName = routeName;
        } else {
          connectType = AttributeNames_1.ConnectTypes.MIDDLEWARE;
          connectTypeName = AttributeNames_1.ConnectNames.MIDDLEWARE;
          connectName = middleWare.name || exports$1.ANONYMOUS_NAME;
        }
        const spanName = `${connectTypeName} - ${connectName}`;
        const options = {
          attributes: {
            [semantic_conventions_1.ATTR_HTTP_ROUTE]: routeName.length > 0 ? routeName : "/",
            [AttributeNames_1.AttributeNames.CONNECT_TYPE]: connectType,
            [AttributeNames_1.AttributeNames.CONNECT_NAME]: connectName
          }
        };
        return this.tracer.startSpan(spanName, options);
      }
      _patchMiddleware(routeName, middleWare) {
        const instrumentation2 = this;
        const isErrorMiddleware = middleWare.length === 4;
        function patchedMiddleware() {
          if (!instrumentation2.isEnabled()) {
            return middleWare.apply(this, arguments);
          }
          const [reqArgIdx, resArgIdx, nextArgIdx] = isErrorMiddleware ? [1, 2, 3] : [0, 1, 2];
          const req = arguments[reqArgIdx];
          const res = arguments[resArgIdx];
          const next = arguments[nextArgIdx];
          (0, utils_1.replaceCurrentStackRoute)(req, routeName);
          const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
          if (routeName && rpcMetadata?.type === core_1.RPCType.HTTP) {
            rpcMetadata.route = (0, utils_1.generateRoute)(req);
          }
          let spanName = "";
          if (routeName) {
            spanName = `request handler - ${routeName}`;
          } else {
            spanName = `middleware - ${middleWare.name || exports$1.ANONYMOUS_NAME}`;
          }
          const span = instrumentation2._startSpan(routeName, middleWare);
          instrumentation2._diag.debug("start span", spanName);
          let spanFinished = false;
          function finishSpan() {
            if (!spanFinished) {
              spanFinished = true;
              instrumentation2._diag.debug(`finishing span ${span.name}`);
              span.end();
            } else {
              instrumentation2._diag.debug(`span ${span.name} - already finished`);
            }
            res.removeListener("close", finishSpan);
          }
          res.addListener("close", finishSpan);
          arguments[nextArgIdx] = instrumentation2._patchNext(next, finishSpan);
          return middleWare.apply(this, arguments);
        }
        Object.defineProperty(patchedMiddleware, "length", {
          value: middleWare.length,
          writable: false,
          configurable: true
        });
        return patchedMiddleware;
      }
      _patchUse(original) {
        const instrumentation2 = this;
        return function(...args) {
          const middleWare = args[args.length - 1];
          const routeName = args[args.length - 2] || "";
          args[args.length - 1] = instrumentation2._patchMiddleware(routeName, middleWare);
          return original.apply(this, args);
        };
      }
      _patchHandle(original) {
        const instrumentation2 = this;
        return function() {
          const [reqIdx, outIdx] = [0, 2];
          const req = arguments[reqIdx];
          const out = arguments[outIdx];
          const completeStack = (0, utils_1.addNewStackLayer)(req);
          if (typeof out === "function") {
            arguments[outIdx] = instrumentation2._patchOut(out, completeStack);
          }
          return original.apply(this, arguments);
        };
      }
      _patchOut(out, completeStack) {
        return function nextFunction(...args) {
          completeStack();
          return Reflect.apply(out, this, args);
        };
      }
    }
    exports$1.ConnectInstrumentation = ConnectInstrumentation;
  })(instrumentation);
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.ConnectTypes = exports$1.ConnectNames = exports$1.AttributeNames = exports$1.ANONYMOUS_NAME = exports$1.ConnectInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "ConnectInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.ConnectInstrumentation;
    } });
    Object.defineProperty(exports$1, "ANONYMOUS_NAME", { enumerable: true, get: function() {
      return instrumentation_1.ANONYMOUS_NAME;
    } });
    var AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
    Object.defineProperty(exports$1, "AttributeNames", { enumerable: true, get: function() {
      return AttributeNames_1.AttributeNames;
    } });
    Object.defineProperty(exports$1, "ConnectNames", { enumerable: true, get: function() {
      return AttributeNames_1.ConnectNames;
    } });
    Object.defineProperty(exports$1, "ConnectTypes", { enumerable: true, get: function() {
      return AttributeNames_1.ConnectTypes;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
