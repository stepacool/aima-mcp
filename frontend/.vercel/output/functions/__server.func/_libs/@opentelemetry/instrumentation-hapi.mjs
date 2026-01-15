import { r as require$$0 } from "./api.mjs";
import { r as require$$1 } from "./core.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
import { r as require$$5 } from "./semantic-conventions.mjs";
var src = {};
var instrumentation = {};
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.55.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-hapi";
  return version;
}
var internalTypes = {};
var hasRequiredInternalTypes;
function requireInternalTypes() {
  if (hasRequiredInternalTypes) return internalTypes;
  hasRequiredInternalTypes = 1;
  Object.defineProperty(internalTypes, "__esModule", { value: true });
  internalTypes.HapiLifecycleMethodNames = internalTypes.HapiLayerType = internalTypes.handlerPatched = internalTypes.HapiComponentName = void 0;
  internalTypes.HapiComponentName = "@hapi/hapi";
  internalTypes.handlerPatched = /* @__PURE__ */ Symbol("hapi-handler-patched");
  internalTypes.HapiLayerType = {
    ROUTER: "router",
    PLUGIN: "plugin",
    EXT: "server.ext"
  };
  internalTypes.HapiLifecycleMethodNames = /* @__PURE__ */ new Set([
    "onPreAuth",
    "onCredentials",
    "onPostAuth",
    "onPreHandler",
    "onPostHandler",
    "onPreResponse",
    "onRequest"
  ]);
  return internalTypes;
}
var utils = {};
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.ATTR_HTTP_METHOD = void 0;
  semconv.ATTR_HTTP_METHOD = "http.method";
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
      AttributeNames2["HAPI_TYPE"] = "hapi.type";
      AttributeNames2["PLUGIN_NAME"] = "hapi.plugin.name";
      AttributeNames2["EXT_TYPE"] = "server.ext.type";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames);
  return AttributeNames;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.getPluginFromInput = exports$1.getExtMetadata = exports$1.getRouteMetadata = exports$1.isPatchableExtMethod = exports$1.isDirectExtInput = exports$1.isLifecycleExtEventObj = exports$1.isLifecycleExtType = exports$1.getPluginName = void 0;
    const semantic_conventions_1 = require$$5;
    const semconv_1 = /* @__PURE__ */ requireSemconv();
    const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
    const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
    const instrumentation_1 = require$$2;
    function getPluginName(plugin) {
      if (plugin.name) {
        return plugin.name;
      } else {
        return plugin.pkg.name;
      }
    }
    exports$1.getPluginName = getPluginName;
    const isLifecycleExtType = (variableToCheck) => {
      return typeof variableToCheck === "string" && internal_types_1.HapiLifecycleMethodNames.has(variableToCheck);
    };
    exports$1.isLifecycleExtType = isLifecycleExtType;
    const isLifecycleExtEventObj = (variableToCheck) => {
      const event = variableToCheck?.type;
      return event !== void 0 && (0, exports$1.isLifecycleExtType)(event);
    };
    exports$1.isLifecycleExtEventObj = isLifecycleExtEventObj;
    const isDirectExtInput = (variableToCheck) => {
      return Array.isArray(variableToCheck) && variableToCheck.length <= 3 && (0, exports$1.isLifecycleExtType)(variableToCheck[0]) && typeof variableToCheck[1] === "function";
    };
    exports$1.isDirectExtInput = isDirectExtInput;
    const isPatchableExtMethod = (variableToCheck) => {
      return !Array.isArray(variableToCheck);
    };
    exports$1.isPatchableExtMethod = isPatchableExtMethod;
    const getRouteMetadata = (route, semconvStability, pluginName) => {
      const attributes = {
        [semantic_conventions_1.ATTR_HTTP_ROUTE]: route.path
      };
      if (semconvStability & instrumentation_1.SemconvStability.OLD) {
        attributes[semconv_1.ATTR_HTTP_METHOD] = route.method;
      }
      if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
        attributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD] = route.method;
      }
      let name;
      if (pluginName) {
        attributes[AttributeNames_1.AttributeNames.HAPI_TYPE] = internal_types_1.HapiLayerType.PLUGIN;
        attributes[AttributeNames_1.AttributeNames.PLUGIN_NAME] = pluginName;
        name = `${pluginName}: route - ${route.path}`;
      } else {
        attributes[AttributeNames_1.AttributeNames.HAPI_TYPE] = internal_types_1.HapiLayerType.ROUTER;
        name = `route - ${route.path}`;
      }
      return { attributes, name };
    };
    exports$1.getRouteMetadata = getRouteMetadata;
    const getExtMetadata = (extPoint, pluginName) => {
      if (pluginName) {
        return {
          attributes: {
            [AttributeNames_1.AttributeNames.EXT_TYPE]: extPoint,
            [AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.EXT,
            [AttributeNames_1.AttributeNames.PLUGIN_NAME]: pluginName
          },
          name: `${pluginName}: ext - ${extPoint}`
        };
      }
      return {
        attributes: {
          [AttributeNames_1.AttributeNames.EXT_TYPE]: extPoint,
          [AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.EXT
        },
        name: `ext - ${extPoint}`
      };
    };
    exports$1.getExtMetadata = getExtMetadata;
    const getPluginFromInput = (pluginObj) => {
      if ("plugin" in pluginObj) {
        if ("plugin" in pluginObj.plugin) {
          return pluginObj.plugin.plugin;
        }
        return pluginObj.plugin;
      }
      return pluginObj;
    };
    exports$1.getPluginFromInput = getPluginFromInput;
  })(utils);
  return utils;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.HapiInstrumentation = void 0;
  const api = require$$0;
  const core_1 = require$$1;
  const instrumentation_1 = require$$2;
  const version_1 = /* @__PURE__ */ requireVersion();
  const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
  const utils_1 = /* @__PURE__ */ requireUtils();
  class HapiInstrumentation extends instrumentation_1.InstrumentationBase {
    _semconvStability;
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
      this._semconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    init() {
      return new instrumentation_1.InstrumentationNodeModuleDefinition(internal_types_1.HapiComponentName, [">=17.0.0 <22"], (module) => {
        const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
        if (!(0, instrumentation_1.isWrapped)(moduleExports.server)) {
          this._wrap(moduleExports, "server", this._getServerPatch.bind(this));
        }
        if (!(0, instrumentation_1.isWrapped)(moduleExports.Server)) {
          this._wrap(moduleExports, "Server", this._getServerPatch.bind(this));
        }
        return moduleExports;
      }, (module) => {
        const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
        this._massUnwrap([moduleExports], ["server", "Server"]);
      });
    }
    /**
     * Patches the Hapi.server and Hapi.Server functions in order to instrument
     * the server.route, server.ext, and server.register functions via calls to the
     * @function _getServerRoutePatch, @function _getServerExtPatch, and
     * @function _getServerRegisterPatch functions
     * @param original - the original Hapi Server creation function
     */
    _getServerPatch(original) {
      const instrumentation2 = this;
      const self = this;
      return function server(opts) {
        const newServer = original.apply(this, [opts]);
        self._wrap(newServer, "route", (originalRouter) => {
          return instrumentation2._getServerRoutePatch.bind(instrumentation2)(originalRouter);
        });
        self._wrap(newServer, "ext", (originalExtHandler) => {
          return instrumentation2._getServerExtPatch.bind(instrumentation2)(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            originalExtHandler
          );
        });
        self._wrap(
          newServer,
          "register",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          instrumentation2._getServerRegisterPatch.bind(instrumentation2)
        );
        return newServer;
      };
    }
    /**
     * Patches the plugin register function used by the Hapi Server. This function
     * goes through each plugin that is being registered and adds instrumentation
     * via a call to the @function _wrapRegisterHandler function.
     * @param {RegisterFunction<T>} original - the original register function which
     * registers each plugin on the server
     */
    _getServerRegisterPatch(original) {
      const instrumentation2 = this;
      return function register(pluginInput, options) {
        if (Array.isArray(pluginInput)) {
          for (const pluginObj of pluginInput) {
            const plugin = (0, utils_1.getPluginFromInput)(pluginObj);
            instrumentation2._wrapRegisterHandler(plugin);
          }
        } else {
          const plugin = (0, utils_1.getPluginFromInput)(pluginInput);
          instrumentation2._wrapRegisterHandler(plugin);
        }
        return original.apply(this, [pluginInput, options]);
      };
    }
    /**
     * Patches the Server.ext function which adds extension methods to the specified
     * point along the request lifecycle. This function accepts the full range of
     * accepted input into the standard Hapi `server.ext` function. For each extension,
     * it adds instrumentation to the handler via a call to the @function _wrapExtMethods
     * function.
     * @param original - the original ext function which adds the extension method to the server
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server extension. Else, signifies that the extension was added directly
     */
    _getServerExtPatch(original, pluginName) {
      const instrumentation2 = this;
      return function ext(...args) {
        if (Array.isArray(args[0])) {
          const eventsList = args[0];
          for (let i = 0; i < eventsList.length; i++) {
            const eventObj = eventsList[i];
            if ((0, utils_1.isLifecycleExtType)(eventObj.type)) {
              const lifecycleEventObj = eventObj;
              const handler = instrumentation2._wrapExtMethods(lifecycleEventObj.method, eventObj.type, pluginName);
              lifecycleEventObj.method = handler;
              eventsList[i] = lifecycleEventObj;
            }
          }
          return original.apply(this, args);
        } else if ((0, utils_1.isDirectExtInput)(args)) {
          const extInput = args;
          const method = extInput[1];
          const handler = instrumentation2._wrapExtMethods(method, extInput[0], pluginName);
          return original.apply(this, [extInput[0], handler, extInput[2]]);
        } else if ((0, utils_1.isLifecycleExtEventObj)(args[0])) {
          const lifecycleEventObj = args[0];
          const handler = instrumentation2._wrapExtMethods(lifecycleEventObj.method, lifecycleEventObj.type, pluginName);
          lifecycleEventObj.method = handler;
          return original.call(this, lifecycleEventObj);
        }
        return original.apply(this, args);
      };
    }
    /**
     * Patches the Server.route function. This function accepts either one or an array
     * of Hapi.ServerRoute objects and adds instrumentation on each route via a call to
     * the @function _wrapRouteHandler function.
     * @param {HapiServerRouteInputMethod} original - the original route function which adds
     * the route to the server
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server route. Else, signifies that the route was added directly
     */
    _getServerRoutePatch(original, pluginName) {
      const instrumentation2 = this;
      return function route(route) {
        if (Array.isArray(route)) {
          for (let i = 0; i < route.length; i++) {
            const newRoute = instrumentation2._wrapRouteHandler.call(instrumentation2, route[i], pluginName);
            route[i] = newRoute;
          }
        } else {
          route = instrumentation2._wrapRouteHandler.call(instrumentation2, route, pluginName);
        }
        return original.apply(this, [route]);
      };
    }
    /**
     * Wraps newly registered plugins to add instrumentation to the plugin's clone of
     * the original server. Specifically, wraps the server.route and server.ext functions
     * via calls to @function _getServerRoutePatch and @function _getServerExtPatch
     * @param {Hapi.Plugin<T>} plugin - the new plugin which is being instrumented
     */
    _wrapRegisterHandler(plugin) {
      const instrumentation2 = this;
      const pluginName = (0, utils_1.getPluginName)(plugin);
      const oldRegister = plugin.register;
      const self = this;
      const newRegisterHandler = function(server, options) {
        self._wrap(server, "route", (original) => {
          return instrumentation2._getServerRoutePatch.bind(instrumentation2)(original, pluginName);
        });
        self._wrap(server, "ext", (originalExtHandler) => {
          return instrumentation2._getServerExtPatch.bind(instrumentation2)(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            originalExtHandler,
            pluginName
          );
        });
        return oldRegister.call(this, server, options);
      };
      plugin.register = newRegisterHandler;
    }
    /**
     * Wraps request extension methods to add instrumentation to each new extension handler.
     * Patches each individual extension in order to create the
     * span and propagate context. It does not create spans when there is no parent span.
     * @param {PatchableExtMethod | PatchableExtMethod[]} method - the request extension
     * handler which is being instrumented
     * @param {Hapi.ServerRequestExtType} extPoint - the point in the Hapi request lifecycle
     * which this extension targets
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server route. Else, signifies that the route was added directly
     */
    _wrapExtMethods(method, extPoint, pluginName) {
      const instrumentation2 = this;
      if (method instanceof Array) {
        for (let i = 0; i < method.length; i++) {
          method[i] = instrumentation2._wrapExtMethods(method[i], extPoint);
        }
        return method;
      } else if ((0, utils_1.isPatchableExtMethod)(method)) {
        if (method[internal_types_1.handlerPatched] === true)
          return method;
        method[internal_types_1.handlerPatched] = true;
        const newHandler = async function(...params) {
          if (api.trace.getSpan(api.context.active()) === void 0) {
            return await method.apply(this, params);
          }
          const metadata = (0, utils_1.getExtMetadata)(extPoint, pluginName);
          const span = instrumentation2.tracer.startSpan(metadata.name, {
            attributes: metadata.attributes
          });
          try {
            return await api.context.with(api.trace.setSpan(api.context.active(), span), method, void 0, ...params);
          } catch (err) {
            span.recordException(err);
            span.setStatus({
              code: api.SpanStatusCode.ERROR,
              message: err.message
            });
            throw err;
          } finally {
            span.end();
          }
        };
        return newHandler;
      }
      return method;
    }
    /**
     * Patches each individual route handler method in order to create the
     * span and propagate context. It does not create spans when there is no parent span.
     * @param {PatchableServerRoute} route - the route handler which is being instrumented
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server route. Else, signifies that the route was added directly
     */
    _wrapRouteHandler(route, pluginName) {
      const instrumentation2 = this;
      if (route[internal_types_1.handlerPatched] === true)
        return route;
      route[internal_types_1.handlerPatched] = true;
      const wrapHandler = (oldHandler) => {
        return async function(...params) {
          if (api.trace.getSpan(api.context.active()) === void 0) {
            return await oldHandler.call(this, ...params);
          }
          const rpcMetadata = (0, core_1.getRPCMetadata)(api.context.active());
          if (rpcMetadata?.type === core_1.RPCType.HTTP) {
            rpcMetadata.route = route.path;
          }
          const metadata = (0, utils_1.getRouteMetadata)(route, instrumentation2._semconvStability, pluginName);
          const span = instrumentation2.tracer.startSpan(metadata.name, {
            attributes: metadata.attributes
          });
          try {
            return await api.context.with(api.trace.setSpan(api.context.active(), span), () => oldHandler.call(this, ...params));
          } catch (err) {
            span.recordException(err);
            span.setStatus({
              code: api.SpanStatusCode.ERROR,
              message: err.message
            });
            throw err;
          } finally {
            span.end();
          }
        };
      };
      if (typeof route.handler === "function") {
        route.handler = wrapHandler(route.handler);
      } else if (typeof route.options === "function") {
        const oldOptions = route.options;
        route.options = function(server) {
          const options = oldOptions(server);
          if (typeof options.handler === "function") {
            options.handler = wrapHandler(options.handler);
          }
          return options;
        };
      } else if (typeof route.options?.handler === "function") {
        route.options.handler = wrapHandler(route.options.handler);
      }
      return route;
    }
  }
  instrumentation.HapiInstrumentation = HapiInstrumentation;
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = exports$1.HapiInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "HapiInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.HapiInstrumentation;
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
