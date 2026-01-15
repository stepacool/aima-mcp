import { r as require$$0 } from "./api.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
import { r as require$$5 } from "./semantic-conventions.mjs";
import { r as require$$1 } from "./core.mjs";
var src = {};
var instrumentation = {};
var types = {};
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes) return types;
  hasRequiredTypes = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.KoaLayerType = void 0;
    (function(KoaLayerType) {
      KoaLayerType["ROUTER"] = "router";
      KoaLayerType["MIDDLEWARE"] = "middleware";
    })(exports$1.KoaLayerType || (exports$1.KoaLayerType = {}));
  })(types);
  return types;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.57.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-koa";
  return version;
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
      AttributeNames2["KOA_TYPE"] = "koa.type";
      AttributeNames2["KOA_NAME"] = "koa.name";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames);
  return AttributeNames;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.isLayerIgnored = utils.getMiddlewareMetadata = void 0;
  const types_1 = /* @__PURE__ */ requireTypes();
  const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
  const semantic_conventions_1 = require$$5;
  const getMiddlewareMetadata = (context, layer, isRouter, layerPath) => {
    if (isRouter) {
      return {
        attributes: {
          [AttributeNames_1.AttributeNames.KOA_NAME]: layerPath?.toString(),
          [AttributeNames_1.AttributeNames.KOA_TYPE]: types_1.KoaLayerType.ROUTER,
          [semantic_conventions_1.ATTR_HTTP_ROUTE]: layerPath?.toString()
        },
        name: context._matchedRouteName || `router - ${layerPath}`
      };
    } else {
      return {
        attributes: {
          [AttributeNames_1.AttributeNames.KOA_NAME]: layer.name ?? "middleware",
          [AttributeNames_1.AttributeNames.KOA_TYPE]: types_1.KoaLayerType.MIDDLEWARE
        },
        name: `middleware - ${layer.name}`
      };
    }
  };
  utils.getMiddlewareMetadata = getMiddlewareMetadata;
  const isLayerIgnored = (type, config) => {
    return !!(Array.isArray(config?.ignoreLayersType) && config?.ignoreLayersType?.includes(type));
  };
  utils.isLayerIgnored = isLayerIgnored;
  return utils;
}
var internalTypes = {};
var hasRequiredInternalTypes;
function requireInternalTypes() {
  if (hasRequiredInternalTypes) return internalTypes;
  hasRequiredInternalTypes = 1;
  Object.defineProperty(internalTypes, "__esModule", { value: true });
  internalTypes.kLayerPatched = void 0;
  internalTypes.kLayerPatched = /* @__PURE__ */ Symbol("koa-layer-patched");
  return internalTypes;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.KoaInstrumentation = void 0;
  const api = require$$0;
  const instrumentation_1 = require$$2;
  const types_1 = /* @__PURE__ */ requireTypes();
  const version_1 = /* @__PURE__ */ requireVersion();
  const utils_1 = /* @__PURE__ */ requireUtils();
  const core_1 = require$$1;
  const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
  class KoaInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
      return new instrumentation_1.InstrumentationNodeModuleDefinition("koa", [">=2.0.0 <4"], (module) => {
        const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
        if (moduleExports == null) {
          return moduleExports;
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.use)) {
          this._unwrap(moduleExports.prototype, "use");
        }
        this._wrap(moduleExports.prototype, "use", this._getKoaUsePatch.bind(this));
        return module;
      }, (module) => {
        const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.use)) {
          this._unwrap(moduleExports.prototype, "use");
        }
      });
    }
    /**
     * Patches the Koa.use function in order to instrument each original
     * middleware layer which is introduced
     * @param {KoaMiddleware} middleware - the original middleware function
     */
    _getKoaUsePatch(original) {
      const plugin = this;
      return function use(middlewareFunction) {
        let patchedFunction;
        if (middlewareFunction.router) {
          patchedFunction = plugin._patchRouterDispatch(middlewareFunction);
        } else {
          patchedFunction = plugin._patchLayer(middlewareFunction, false);
        }
        return original.apply(this, [patchedFunction]);
      };
    }
    /**
     * Patches the dispatch function used by @koa/router. This function
     * goes through each routed middleware and adds instrumentation via a call
     * to the @function _patchLayer function.
     * @param {KoaMiddleware} dispatchLayer - the original dispatch function which dispatches
     * routed middleware
     */
    _patchRouterDispatch(dispatchLayer) {
      api.diag.debug("Patching @koa/router dispatch");
      const router = dispatchLayer.router;
      const routesStack = router?.stack ?? [];
      for (const pathLayer of routesStack) {
        const path = pathLayer.path;
        const pathStack = pathLayer.stack;
        for (let j = 0; j < pathStack.length; j++) {
          const routedMiddleware = pathStack[j];
          pathStack[j] = this._patchLayer(routedMiddleware, true, path);
        }
      }
      return dispatchLayer;
    }
    /**
     * Patches each individual @param middlewareLayer function in order to create the
     * span and propagate context. It does not create spans when there is no parent span.
     * @param {KoaMiddleware} middlewareLayer - the original middleware function.
     * @param {boolean} isRouter - tracks whether the original middleware function
     * was dispatched by the router originally
     * @param {string?} layerPath - if present, provides additional data from the
     * router about the routed path which the middleware is attached to
     */
    _patchLayer(middlewareLayer, isRouter, layerPath) {
      const layerType = isRouter ? types_1.KoaLayerType.ROUTER : types_1.KoaLayerType.MIDDLEWARE;
      if (middlewareLayer[internal_types_1.kLayerPatched] === true || (0, utils_1.isLayerIgnored)(layerType, this.getConfig()))
        return middlewareLayer;
      if (middlewareLayer.constructor.name === "GeneratorFunction" || middlewareLayer.constructor.name === "AsyncGeneratorFunction") {
        api.diag.debug("ignoring generator-based Koa middleware layer");
        return middlewareLayer;
      }
      middlewareLayer[internal_types_1.kLayerPatched] = true;
      api.diag.debug("patching Koa middleware layer");
      return async (context, next) => {
        const parent = api.trace.getSpan(api.context.active());
        if (parent === void 0) {
          return middlewareLayer(context, next);
        }
        const metadata = (0, utils_1.getMiddlewareMetadata)(context, middlewareLayer, isRouter, layerPath);
        const span = this.tracer.startSpan(metadata.name, {
          attributes: metadata.attributes
        });
        const rpcMetadata = (0, core_1.getRPCMetadata)(api.context.active());
        if (rpcMetadata?.type === core_1.RPCType.HTTP && context._matchedRoute) {
          rpcMetadata.route = context._matchedRoute.toString();
        }
        const { requestHook } = this.getConfig();
        if (requestHook) {
          (0, instrumentation_1.safeExecuteInTheMiddle)(() => requestHook(span, {
            context,
            middlewareLayer,
            layerType
          }), (e) => {
            if (e) {
              api.diag.error("koa instrumentation: request hook failed", e);
            }
          }, true);
        }
        const newContext = api.trace.setSpan(api.context.active(), span);
        return api.context.with(newContext, async () => {
          try {
            return await middlewareLayer(context, next);
          } catch (err) {
            span.recordException(err);
            throw err;
          } finally {
            span.end();
          }
        });
      };
    }
  }
  instrumentation.KoaInstrumentation = KoaInstrumentation;
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.KoaLayerType = exports$1.AttributeNames = exports$1.KoaInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "KoaInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.KoaInstrumentation;
    } });
    var AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
    Object.defineProperty(exports$1, "AttributeNames", { enumerable: true, get: function() {
      return AttributeNames_1.AttributeNames;
    } });
    var types_1 = /* @__PURE__ */ requireTypes();
    Object.defineProperty(exports$1, "KoaLayerType", { enumerable: true, get: function() {
      return types_1.KoaLayerType;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
