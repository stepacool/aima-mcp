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
  version.PACKAGE_VERSION = "0.52.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-generic-pool";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.GenericPoolInstrumentation = void 0;
  const api = require$$0;
  const instrumentation_1 = require$$2;
  const version_1 = /* @__PURE__ */ requireVersion();
  const MODULE_NAME = "generic-pool";
  class GenericPoolInstrumentation extends instrumentation_1.InstrumentationBase {
    // only used for v2 - v2.3)
    _isDisabled = false;
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME, [">=3.0.0 <4"], (moduleExports) => {
          const Pool = moduleExports.Pool;
          if ((0, instrumentation_1.isWrapped)(Pool.prototype.acquire)) {
            this._unwrap(Pool.prototype, "acquire");
          }
          this._wrap(Pool.prototype, "acquire", this._acquirePatcher.bind(this));
          return moduleExports;
        }, (moduleExports) => {
          const Pool = moduleExports.Pool;
          this._unwrap(Pool.prototype, "acquire");
          return moduleExports;
        }),
        new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME, [">=2.4.0 <3"], (moduleExports) => {
          const Pool = moduleExports.Pool;
          if ((0, instrumentation_1.isWrapped)(Pool.prototype.acquire)) {
            this._unwrap(Pool.prototype, "acquire");
          }
          this._wrap(Pool.prototype, "acquire", this._acquireWithCallbacksPatcher.bind(this));
          return moduleExports;
        }, (moduleExports) => {
          const Pool = moduleExports.Pool;
          this._unwrap(Pool.prototype, "acquire");
          return moduleExports;
        }),
        new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME, [">=2.0.0 <2.4"], (moduleExports) => {
          this._isDisabled = false;
          if ((0, instrumentation_1.isWrapped)(moduleExports.Pool)) {
            this._unwrap(moduleExports, "Pool");
          }
          this._wrap(moduleExports, "Pool", this._poolWrapper.bind(this));
          return moduleExports;
        }, (moduleExports) => {
          this._isDisabled = true;
          return moduleExports;
        })
      ];
    }
    _acquirePatcher(original) {
      const instrumentation2 = this;
      return function wrapped_acquire(...args) {
        const parent = api.context.active();
        const span = instrumentation2.tracer.startSpan("generic-pool.acquire", {}, parent);
        return api.context.with(api.trace.setSpan(parent, span), () => {
          return original.call(this, ...args).then((value) => {
            span.end();
            return value;
          }, (err) => {
            span.recordException(err);
            span.end();
            throw err;
          });
        });
      };
    }
    _poolWrapper(original) {
      const instrumentation2 = this;
      return function wrapped_pool() {
        const pool = original.apply(this, arguments);
        instrumentation2._wrap(pool, "acquire", instrumentation2._acquireWithCallbacksPatcher.bind(instrumentation2));
        return pool;
      };
    }
    _acquireWithCallbacksPatcher(original) {
      const instrumentation2 = this;
      return function wrapped_acquire(cb, priority) {
        if (instrumentation2._isDisabled) {
          return original.call(this, cb, priority);
        }
        const parent = api.context.active();
        const span = instrumentation2.tracer.startSpan("generic-pool.acquire", {}, parent);
        return api.context.with(api.trace.setSpan(parent, span), () => {
          original.call(this, (err, client) => {
            span.end();
            if (cb) {
              return cb(err, client);
            }
          }, priority);
        });
      };
    }
  }
  instrumentation.GenericPoolInstrumentation = GenericPoolInstrumentation;
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.GenericPoolInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "GenericPoolInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.GenericPoolInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
