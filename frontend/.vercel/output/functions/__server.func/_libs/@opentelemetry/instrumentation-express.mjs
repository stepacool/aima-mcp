import { r as require$$1 } from "./core.mjs";
import { r as require$$0 } from "./api.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
import { r as require$$5 } from "./semantic-conventions.mjs";
var src = {};
var instrumentation = {};
var ExpressLayerType = {};
var hasRequiredExpressLayerType;
function requireExpressLayerType() {
  if (hasRequiredExpressLayerType) return ExpressLayerType;
  hasRequiredExpressLayerType = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.ExpressLayerType = void 0;
    (function(ExpressLayerType2) {
      ExpressLayerType2["ROUTER"] = "router";
      ExpressLayerType2["MIDDLEWARE"] = "middleware";
      ExpressLayerType2["REQUEST_HANDLER"] = "request_handler";
    })(exports$1.ExpressLayerType || (exports$1.ExpressLayerType = {}));
  })(ExpressLayerType);
  return ExpressLayerType;
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
      AttributeNames2["EXPRESS_TYPE"] = "express.type";
      AttributeNames2["EXPRESS_NAME"] = "express.name";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames);
  return AttributeNames;
}
var utils = {};
var internalTypes = {};
var hasRequiredInternalTypes;
function requireInternalTypes() {
  if (hasRequiredInternalTypes) return internalTypes;
  hasRequiredInternalTypes = 1;
  Object.defineProperty(internalTypes, "__esModule", { value: true });
  internalTypes._LAYERS_STORE_PROPERTY = internalTypes.kLayerPatched = void 0;
  internalTypes.kLayerPatched = /* @__PURE__ */ Symbol("express-layer-patched");
  internalTypes._LAYERS_STORE_PROPERTY = "__ot_middlewares";
  return internalTypes;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.getActualMatchedRoute = exports$1.getConstructedRoute = exports$1.getLayerPath = exports$1.asErrorAndMessage = exports$1.isLayerIgnored = exports$1.getLayerMetadata = exports$1.getRouterPath = exports$1.storeLayerPath = void 0;
    const ExpressLayerType_1 = /* @__PURE__ */ requireExpressLayerType();
    const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
    const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
    const storeLayerPath = (request, value) => {
      if (Array.isArray(request[internal_types_1._LAYERS_STORE_PROPERTY]) === false) {
        Object.defineProperty(request, internal_types_1._LAYERS_STORE_PROPERTY, {
          enumerable: false,
          value: []
        });
      }
      if (value === void 0)
        return { isLayerPathStored: false };
      request[internal_types_1._LAYERS_STORE_PROPERTY].push(value);
      return { isLayerPathStored: true };
    };
    exports$1.storeLayerPath = storeLayerPath;
    const getRouterPath = (path, layer) => {
      const stackLayer = layer.handle?.stack?.[0];
      if (stackLayer?.route?.path) {
        return `${path}${stackLayer.route.path}`;
      }
      if (stackLayer?.handle?.stack) {
        return (0, exports$1.getRouterPath)(path, stackLayer);
      }
      return path;
    };
    exports$1.getRouterPath = getRouterPath;
    const getLayerMetadata = (route, layer, layerPath) => {
      if (layer.name === "router") {
        const maybeRouterPath = (0, exports$1.getRouterPath)("", layer);
        const extractedRouterPath = maybeRouterPath ? maybeRouterPath : layerPath || route || "/";
        return {
          attributes: {
            [AttributeNames_1.AttributeNames.EXPRESS_NAME]: extractedRouterPath,
            [AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.ROUTER
          },
          name: `router - ${extractedRouterPath}`
        };
      } else if (layer.name === "bound dispatch" || layer.name === "handle") {
        return {
          attributes: {
            [AttributeNames_1.AttributeNames.EXPRESS_NAME]: (route || layerPath) ?? "request handler",
            [AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.REQUEST_HANDLER
          },
          name: `request handler${layer.path ? ` - ${route || layerPath}` : ""}`
        };
      } else {
        return {
          attributes: {
            [AttributeNames_1.AttributeNames.EXPRESS_NAME]: layer.name,
            [AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.MIDDLEWARE
          },
          name: `middleware - ${layer.name}`
        };
      }
    };
    exports$1.getLayerMetadata = getLayerMetadata;
    const satisfiesPattern = (constant, pattern) => {
      if (typeof pattern === "string") {
        return pattern === constant;
      } else if (pattern instanceof RegExp) {
        return pattern.test(constant);
      } else if (typeof pattern === "function") {
        return pattern(constant);
      } else {
        throw new TypeError("Pattern is in unsupported datatype");
      }
    };
    const isLayerIgnored = (name, type, config) => {
      if (Array.isArray(config?.ignoreLayersType) && config?.ignoreLayersType?.includes(type)) {
        return true;
      }
      if (Array.isArray(config?.ignoreLayers) === false)
        return false;
      try {
        for (const pattern of config.ignoreLayers) {
          if (satisfiesPattern(name, pattern)) {
            return true;
          }
        }
      } catch (e) {
      }
      return false;
    };
    exports$1.isLayerIgnored = isLayerIgnored;
    const asErrorAndMessage = (error) => error instanceof Error ? [error, error.message] : [String(error), String(error)];
    exports$1.asErrorAndMessage = asErrorAndMessage;
    const getLayerPath = (args) => {
      const firstArg = args[0];
      if (Array.isArray(firstArg)) {
        return firstArg.map((arg) => extractLayerPathSegment(arg) || "").join(",");
      }
      return extractLayerPathSegment(firstArg);
    };
    exports$1.getLayerPath = getLayerPath;
    const extractLayerPathSegment = (arg) => {
      if (typeof arg === "string") {
        return arg;
      }
      if (arg instanceof RegExp || typeof arg === "number") {
        return arg.toString();
      }
      return;
    };
    function getConstructedRoute(req) {
      const layersStore = Array.isArray(req[internal_types_1._LAYERS_STORE_PROPERTY]) ? req[internal_types_1._LAYERS_STORE_PROPERTY] : [];
      const meaningfulPaths = layersStore.filter((path) => path !== "/" && path !== "/*");
      if (meaningfulPaths.length === 1 && meaningfulPaths[0] === "*") {
        return "*";
      }
      return meaningfulPaths.join("").replace(/\/{2,}/g, "/");
    }
    exports$1.getConstructedRoute = getConstructedRoute;
    function getActualMatchedRoute(req) {
      const layersStore = Array.isArray(req[internal_types_1._LAYERS_STORE_PROPERTY]) ? req[internal_types_1._LAYERS_STORE_PROPERTY] : [];
      if (layersStore.length === 0) {
        return void 0;
      }
      if (layersStore.every((path) => path === "/")) {
        return req.originalUrl === "/" ? "/" : void 0;
      }
      const constructedRoute = getConstructedRoute(req);
      if (constructedRoute === "*") {
        return constructedRoute;
      }
      if (constructedRoute.includes("/") && (constructedRoute.includes(",") || constructedRoute.includes("\\") || constructedRoute.includes("*") || constructedRoute.includes("["))) {
        return constructedRoute;
      }
      const normalizedRoute = constructedRoute.startsWith("/") ? constructedRoute : `/${constructedRoute}`;
      const isValidRoute = normalizedRoute.length > 0 && (req.originalUrl === normalizedRoute || req.originalUrl.startsWith(normalizedRoute) || isRoutePattern(normalizedRoute));
      return isValidRoute ? normalizedRoute : void 0;
    }
    exports$1.getActualMatchedRoute = getActualMatchedRoute;
    function isRoutePattern(route) {
      return route.includes(":") || route.includes("*");
    }
  })(utils);
  return utils;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.57.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-express";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.ExpressInstrumentation = void 0;
  const core_1 = require$$1;
  const api_1 = require$$0;
  const ExpressLayerType_1 = /* @__PURE__ */ requireExpressLayerType();
  const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
  const utils_1 = /* @__PURE__ */ requireUtils();
  const version_1 = /* @__PURE__ */ requireVersion();
  const instrumentation_1 = require$$2;
  const semantic_conventions_1 = require$$5;
  const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
  class ExpressInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("express", [">=4.0.0 <6"], (moduleExports) => {
          const isExpressWithRouterPrototype = typeof moduleExports?.Router?.prototype?.route === "function";
          const routerProto = isExpressWithRouterPrototype ? moduleExports.Router.prototype : moduleExports.Router;
          if ((0, instrumentation_1.isWrapped)(routerProto.route)) {
            this._unwrap(routerProto, "route");
          }
          this._wrap(routerProto, "route", this._getRoutePatch());
          if ((0, instrumentation_1.isWrapped)(routerProto.use)) {
            this._unwrap(routerProto, "use");
          }
          this._wrap(routerProto, "use", this._getRouterUsePatch());
          if ((0, instrumentation_1.isWrapped)(moduleExports.application.use)) {
            this._unwrap(moduleExports.application, "use");
          }
          this._wrap(
            moduleExports.application,
            "use",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._getAppUsePatch(isExpressWithRouterPrototype)
          );
          return moduleExports;
        }, (moduleExports) => {
          if (moduleExports === void 0)
            return;
          const isExpressWithRouterPrototype = typeof moduleExports?.Router?.prototype?.route === "function";
          const routerProto = isExpressWithRouterPrototype ? moduleExports.Router.prototype : moduleExports.Router;
          this._unwrap(routerProto, "route");
          this._unwrap(routerProto, "use");
          this._unwrap(moduleExports.application, "use");
        })
      ];
    }
    /**
     * Get the patch for Router.route function
     */
    _getRoutePatch() {
      const instrumentation2 = this;
      return function(original) {
        return function route_trace(...args) {
          const route = original.apply(this, args);
          const layer = this.stack[this.stack.length - 1];
          instrumentation2._applyPatch(layer, (0, utils_1.getLayerPath)(args));
          return route;
        };
      };
    }
    /**
     * Get the patch for Router.use function
     */
    _getRouterUsePatch() {
      const instrumentation2 = this;
      return function(original) {
        return function use(...args) {
          const route = original.apply(this, args);
          const layer = this.stack[this.stack.length - 1];
          instrumentation2._applyPatch(layer, (0, utils_1.getLayerPath)(args));
          return route;
        };
      };
    }
    /**
     * Get the patch for Application.use function
     */
    _getAppUsePatch(isExpressWithRouterPrototype) {
      const instrumentation2 = this;
      return function(original) {
        return function use(...args) {
          const router = isExpressWithRouterPrototype ? this.router : this._router;
          const route = original.apply(this, args);
          if (router) {
            const layer = router.stack[router.stack.length - 1];
            instrumentation2._applyPatch(layer, (0, utils_1.getLayerPath)(args));
          }
          return route;
        };
      };
    }
    /** Patch each express layer to create span and propagate context */
    _applyPatch(layer, layerPath) {
      const instrumentation2 = this;
      if (layer[internal_types_1.kLayerPatched] === true)
        return;
      layer[internal_types_1.kLayerPatched] = true;
      this._wrap(layer, "handle", (original) => {
        if (original.length === 4)
          return original;
        const patched = function(req, res) {
          const { isLayerPathStored } = (0, utils_1.storeLayerPath)(req, layerPath);
          const constructedRoute = (0, utils_1.getConstructedRoute)(req);
          const actualMatchedRoute = (0, utils_1.getActualMatchedRoute)(req);
          const attributes = {
            [semantic_conventions_1.ATTR_HTTP_ROUTE]: actualMatchedRoute
          };
          const metadata = (0, utils_1.getLayerMetadata)(constructedRoute, layer, layerPath);
          const type = metadata.attributes[AttributeNames_1.AttributeNames.EXPRESS_TYPE];
          const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
          if (rpcMetadata?.type === core_1.RPCType.HTTP) {
            rpcMetadata.route = actualMatchedRoute;
          }
          if ((0, utils_1.isLayerIgnored)(metadata.name, type, instrumentation2.getConfig())) {
            if (type === ExpressLayerType_1.ExpressLayerType.MIDDLEWARE) {
              req[internal_types_1._LAYERS_STORE_PROPERTY].pop();
            }
            return original.apply(this, arguments);
          }
          if (api_1.trace.getSpan(api_1.context.active()) === void 0) {
            return original.apply(this, arguments);
          }
          const spanName = instrumentation2._getSpanName({
            request: req,
            layerType: type,
            route: constructedRoute
          }, metadata.name);
          const span = instrumentation2.tracer.startSpan(spanName, {
            attributes: Object.assign(attributes, metadata.attributes)
          });
          const parentContext = api_1.context.active();
          let currentContext = api_1.trace.setSpan(parentContext, span);
          const { requestHook } = instrumentation2.getConfig();
          if (requestHook) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(() => requestHook(span, {
              request: req,
              layerType: type,
              route: constructedRoute
            }), (e) => {
              if (e) {
                api_1.diag.error("express instrumentation: request hook failed", e);
              }
            }, true);
          }
          let spanHasEnded = false;
          if (metadata.attributes[AttributeNames_1.AttributeNames.EXPRESS_TYPE] === ExpressLayerType_1.ExpressLayerType.ROUTER) {
            span.end();
            spanHasEnded = true;
            currentContext = parentContext;
          }
          const onResponseFinish = () => {
            if (spanHasEnded === false) {
              spanHasEnded = true;
              span.end();
            }
          };
          const args = Array.from(arguments);
          const callbackIdx = args.findIndex((arg) => typeof arg === "function");
          if (callbackIdx >= 0) {
            arguments[callbackIdx] = function() {
              const maybeError = arguments[0];
              const isError = ![void 0, null, "route", "router"].includes(maybeError);
              if (!spanHasEnded && isError) {
                const [error, message] = (0, utils_1.asErrorAndMessage)(maybeError);
                span.recordException(error);
                span.setStatus({
                  code: api_1.SpanStatusCode.ERROR,
                  message
                });
              }
              if (spanHasEnded === false) {
                spanHasEnded = true;
                req.res?.removeListener("finish", onResponseFinish);
                span.end();
              }
              if (!(req.route && isError) && isLayerPathStored) {
                req[internal_types_1._LAYERS_STORE_PROPERTY].pop();
              }
              const callback = args[callbackIdx];
              return api_1.context.bind(parentContext, callback).apply(this, arguments);
            };
          }
          try {
            return api_1.context.bind(currentContext, original).apply(this, arguments);
          } catch (anyError) {
            const [error, message] = (0, utils_1.asErrorAndMessage)(anyError);
            span.recordException(error);
            span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message
            });
            throw anyError;
          } finally {
            if (!spanHasEnded) {
              res.once("finish", onResponseFinish);
            }
          }
        };
        for (const key in original) {
          Object.defineProperty(patched, key, {
            get() {
              return original[key];
            },
            set(value) {
              original[key] = value;
            }
          });
        }
        return patched;
      });
    }
    _getSpanName(info, defaultName) {
      const { spanNameHook } = this.getConfig();
      if (!(spanNameHook instanceof Function)) {
        return defaultName;
      }
      try {
        return spanNameHook(info, defaultName) ?? defaultName;
      } catch (err) {
        api_1.diag.error("express instrumentation: error calling span name rewrite hook", err);
        return defaultName;
      }
    }
  }
  instrumentation.ExpressInstrumentation = ExpressInstrumentation;
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = exports$1.ExpressLayerType = exports$1.ExpressInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "ExpressInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.ExpressInstrumentation;
    } });
    var ExpressLayerType_1 = /* @__PURE__ */ requireExpressLayerType();
    Object.defineProperty(exports$1, "ExpressLayerType", { enumerable: true, get: function() {
      return ExpressLayerType_1.ExpressLayerType;
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
