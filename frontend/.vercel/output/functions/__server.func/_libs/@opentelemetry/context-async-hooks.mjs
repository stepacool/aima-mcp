import { r as require$$0$1 } from "./api.mjs";
import require$$1 from "async_hooks";
import require$$0 from "events";
var src = {};
var AsyncHooksContextManager = {};
var AbstractAsyncHooksContextManager = {};
var hasRequiredAbstractAsyncHooksContextManager;
function requireAbstractAsyncHooksContextManager() {
  if (hasRequiredAbstractAsyncHooksContextManager) return AbstractAsyncHooksContextManager;
  hasRequiredAbstractAsyncHooksContextManager = 1;
  Object.defineProperty(AbstractAsyncHooksContextManager, "__esModule", { value: true });
  AbstractAsyncHooksContextManager.AbstractAsyncHooksContextManager = void 0;
  const events_1 = require$$0;
  const ADD_LISTENER_METHODS = [
    "addListener",
    "on",
    "once",
    "prependListener",
    "prependOnceListener"
  ];
  let AbstractAsyncHooksContextManager$1 = class AbstractAsyncHooksContextManager {
    /**
     * Binds a the certain context or the active one to the target function and then returns the target
     * @param context A context (span) to be bind to target
     * @param target a function or event emitter. When target or one of its callbacks is called,
     *  the provided context will be used as the active context for the duration of the call.
     */
    bind(context, target) {
      if (target instanceof events_1.EventEmitter) {
        return this._bindEventEmitter(context, target);
      }
      if (typeof target === "function") {
        return this._bindFunction(context, target);
      }
      return target;
    }
    _bindFunction(context, target) {
      const manager = this;
      const contextWrapper = function(...args) {
        return manager.with(context, () => target.apply(this, args));
      };
      Object.defineProperty(contextWrapper, "length", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: target.length
      });
      return contextWrapper;
    }
    /**
     * By default, EventEmitter call their callback with their context, which we do
     * not want, instead we will bind a specific context to all callbacks that
     * go through it.
     * @param context the context we want to bind
     * @param ee EventEmitter an instance of EventEmitter to patch
     */
    _bindEventEmitter(context, ee) {
      const map = this._getPatchMap(ee);
      if (map !== void 0)
        return ee;
      this._createPatchMap(ee);
      ADD_LISTENER_METHODS.forEach((methodName) => {
        if (ee[methodName] === void 0)
          return;
        ee[methodName] = this._patchAddListener(ee, ee[methodName], context);
      });
      if (typeof ee.removeListener === "function") {
        ee.removeListener = this._patchRemoveListener(ee, ee.removeListener);
      }
      if (typeof ee.off === "function") {
        ee.off = this._patchRemoveListener(ee, ee.off);
      }
      if (typeof ee.removeAllListeners === "function") {
        ee.removeAllListeners = this._patchRemoveAllListeners(ee, ee.removeAllListeners);
      }
      return ee;
    }
    /**
     * Patch methods that remove a given listener so that we match the "patched"
     * version of that listener (the one that propagate context).
     * @param ee EventEmitter instance
     * @param original reference to the patched method
     */
    _patchRemoveListener(ee, original) {
      const contextManager = this;
      return function(event, listener) {
        const events = contextManager._getPatchMap(ee)?.[event];
        if (events === void 0) {
          return original.call(this, event, listener);
        }
        const patchedListener = events.get(listener);
        return original.call(this, event, patchedListener || listener);
      };
    }
    /**
     * Patch methods that remove all listeners so we remove our
     * internal references for a given event.
     * @param ee EventEmitter instance
     * @param original reference to the patched method
     */
    _patchRemoveAllListeners(ee, original) {
      const contextManager = this;
      return function(event) {
        const map = contextManager._getPatchMap(ee);
        if (map !== void 0) {
          if (arguments.length === 0) {
            contextManager._createPatchMap(ee);
          } else if (map[event] !== void 0) {
            delete map[event];
          }
        }
        return original.apply(this, arguments);
      };
    }
    /**
     * Patch methods on an event emitter instance that can add listeners so we
     * can force them to propagate a given context.
     * @param ee EventEmitter instance
     * @param original reference to the patched method
     * @param [context] context to propagate when calling listeners
     */
    _patchAddListener(ee, original, context) {
      const contextManager = this;
      return function(event, listener) {
        if (contextManager._wrapped) {
          return original.call(this, event, listener);
        }
        let map = contextManager._getPatchMap(ee);
        if (map === void 0) {
          map = contextManager._createPatchMap(ee);
        }
        let listeners = map[event];
        if (listeners === void 0) {
          listeners = /* @__PURE__ */ new WeakMap();
          map[event] = listeners;
        }
        const patchedListener = contextManager.bind(context, listener);
        listeners.set(listener, patchedListener);
        contextManager._wrapped = true;
        try {
          return original.call(this, event, patchedListener);
        } finally {
          contextManager._wrapped = false;
        }
      };
    }
    _createPatchMap(ee) {
      const map = /* @__PURE__ */ Object.create(null);
      ee[this._kOtListeners] = map;
      return map;
    }
    _getPatchMap(ee) {
      return ee[this._kOtListeners];
    }
    _kOtListeners = /* @__PURE__ */ Symbol("OtListeners");
    _wrapped = false;
  };
  AbstractAsyncHooksContextManager.AbstractAsyncHooksContextManager = AbstractAsyncHooksContextManager$1;
  return AbstractAsyncHooksContextManager;
}
var hasRequiredAsyncHooksContextManager;
function requireAsyncHooksContextManager() {
  if (hasRequiredAsyncHooksContextManager) return AsyncHooksContextManager;
  hasRequiredAsyncHooksContextManager = 1;
  Object.defineProperty(AsyncHooksContextManager, "__esModule", { value: true });
  AsyncHooksContextManager.AsyncHooksContextManager = void 0;
  const api_1 = require$$0$1;
  const asyncHooks = require$$1;
  const AbstractAsyncHooksContextManager_1 = /* @__PURE__ */ requireAbstractAsyncHooksContextManager();
  let AsyncHooksContextManager$1 = class AsyncHooksContextManager extends AbstractAsyncHooksContextManager_1.AbstractAsyncHooksContextManager {
    _asyncHook;
    _contexts = /* @__PURE__ */ new Map();
    _stack = [];
    constructor() {
      super();
      this._asyncHook = asyncHooks.createHook({
        init: this._init.bind(this),
        before: this._before.bind(this),
        after: this._after.bind(this),
        destroy: this._destroy.bind(this),
        promiseResolve: this._destroy.bind(this)
      });
    }
    active() {
      return this._stack[this._stack.length - 1] ?? api_1.ROOT_CONTEXT;
    }
    with(context, fn, thisArg, ...args) {
      this._enterContext(context);
      try {
        return fn.call(thisArg, ...args);
      } finally {
        this._exitContext();
      }
    }
    enable() {
      this._asyncHook.enable();
      return this;
    }
    disable() {
      this._asyncHook.disable();
      this._contexts.clear();
      this._stack = [];
      return this;
    }
    /**
     * Init hook will be called when userland create a async context, setting the
     * context as the current one if it exist.
     * @param uid id of the async context
     * @param type the resource type
     */
    _init(uid, type) {
      if (type === "TIMERWRAP")
        return;
      const context = this._stack[this._stack.length - 1];
      if (context !== void 0) {
        this._contexts.set(uid, context);
      }
    }
    /**
     * Destroy hook will be called when a given context is no longer used so we can
     * remove its attached context.
     * @param uid uid of the async context
     */
    _destroy(uid) {
      this._contexts.delete(uid);
    }
    /**
     * Before hook is called just before executing a async context.
     * @param uid uid of the async context
     */
    _before(uid) {
      const context = this._contexts.get(uid);
      if (context !== void 0) {
        this._enterContext(context);
      }
    }
    /**
     * After hook is called just after completing the execution of a async context.
     */
    _after() {
      this._exitContext();
    }
    /**
     * Set the given context as active
     */
    _enterContext(context) {
      this._stack.push(context);
    }
    /**
     * Remove the context at the root of the stack
     */
    _exitContext() {
      this._stack.pop();
    }
  };
  AsyncHooksContextManager.AsyncHooksContextManager = AsyncHooksContextManager$1;
  return AsyncHooksContextManager;
}
var AsyncLocalStorageContextManager = {};
var hasRequiredAsyncLocalStorageContextManager;
function requireAsyncLocalStorageContextManager() {
  if (hasRequiredAsyncLocalStorageContextManager) return AsyncLocalStorageContextManager;
  hasRequiredAsyncLocalStorageContextManager = 1;
  Object.defineProperty(AsyncLocalStorageContextManager, "__esModule", { value: true });
  AsyncLocalStorageContextManager.AsyncLocalStorageContextManager = void 0;
  const api_1 = require$$0$1;
  const async_hooks_1 = require$$1;
  const AbstractAsyncHooksContextManager_1 = /* @__PURE__ */ requireAbstractAsyncHooksContextManager();
  let AsyncLocalStorageContextManager$1 = class AsyncLocalStorageContextManager extends AbstractAsyncHooksContextManager_1.AbstractAsyncHooksContextManager {
    _asyncLocalStorage;
    constructor() {
      super();
      this._asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
    }
    active() {
      return this._asyncLocalStorage.getStore() ?? api_1.ROOT_CONTEXT;
    }
    with(context, fn, thisArg, ...args) {
      const cb = thisArg == null ? fn : fn.bind(thisArg);
      return this._asyncLocalStorage.run(context, cb, ...args);
    }
    enable() {
      return this;
    }
    disable() {
      this._asyncLocalStorage.disable();
      return this;
    }
  };
  AsyncLocalStorageContextManager.AsyncLocalStorageContextManager = AsyncLocalStorageContextManager$1;
  return AsyncLocalStorageContextManager;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AsyncLocalStorageContextManager = exports$1.AsyncHooksContextManager = void 0;
    var AsyncHooksContextManager_1 = /* @__PURE__ */ requireAsyncHooksContextManager();
    Object.defineProperty(exports$1, "AsyncHooksContextManager", { enumerable: true, get: function() {
      return AsyncHooksContextManager_1.AsyncHooksContextManager;
    } });
    var AsyncLocalStorageContextManager_1 = /* @__PURE__ */ requireAsyncLocalStorageContextManager();
    Object.defineProperty(exports$1, "AsyncLocalStorageContextManager", { enumerable: true, get: function() {
      return AsyncLocalStorageContextManager_1.AsyncLocalStorageContextManager;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
