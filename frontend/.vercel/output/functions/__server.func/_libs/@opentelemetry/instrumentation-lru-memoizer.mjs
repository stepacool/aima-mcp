import { r as require$$0 } from "./api.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
var src = {};
var instrumentation = {};
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.53.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-lru-memoizer";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.LruMemoizerInstrumentation = void 0;
  const api_1 = require$$0;
  const instrumentation_1 = require$$2;
  const version_1 = /* @__PURE__ */ requireVersion();
  class LruMemoizerInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition(
          "lru-memoizer",
          [">=1.3 <3"],
          (moduleExports) => {
            const asyncMemoizer = function() {
              const origMemoizer = moduleExports.apply(this, arguments);
              return function() {
                const modifiedArguments = [...arguments];
                const origCallback = modifiedArguments.pop();
                const callbackWithContext = typeof origCallback === "function" ? api_1.context.bind(api_1.context.active(), origCallback) : origCallback;
                modifiedArguments.push(callbackWithContext);
                return origMemoizer.apply(this, modifiedArguments);
              };
            };
            asyncMemoizer.sync = moduleExports.sync;
            return asyncMemoizer;
          },
          void 0
          // no need to disable as this instrumentation does not create any spans
        )
      ];
    }
  }
  instrumentation.LruMemoizerInstrumentation = LruMemoizerInstrumentation;
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.LruMemoizerInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "LruMemoizerInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.LruMemoizerInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
