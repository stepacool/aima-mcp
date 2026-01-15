class NoopLogger {
  emit(_logRecord) {
  }
}
const NOOP_LOGGER = new NoopLogger();
class NoopLoggerProvider {
  getLogger(_name, _version, _options) {
    return new NoopLogger();
  }
}
const NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();
class ProxyLogger {
  constructor(_provider, name, version, options) {
    this._provider = _provider;
    this.name = name;
    this.version = version;
    this.options = options;
  }
  /**
   * Emit a log record. This method should only be used by log appenders.
   *
   * @param logRecord
   */
  emit(logRecord) {
    this._getLogger().emit(logRecord);
  }
  /**
   * Try to get a logger from the proxy logger provider.
   * If the proxy logger provider has no delegate, return a noop logger.
   */
  _getLogger() {
    if (this._delegate) {
      return this._delegate;
    }
    const logger = this._provider._getDelegateLogger(this.name, this.version, this.options);
    if (!logger) {
      return NOOP_LOGGER;
    }
    this._delegate = logger;
    return this._delegate;
  }
}
class ProxyLoggerProvider {
  getLogger(name, version, options) {
    var _a;
    return (_a = this._getDelegateLogger(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyLogger(this, name, version, options);
  }
  /**
   * Get the delegate logger provider.
   * Used by tests only.
   * @internal
   */
  _getDelegate() {
    var _a;
    return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_LOGGER_PROVIDER;
  }
  /**
   * Set the delegate logger provider
   * @internal
   */
  _setDelegate(delegate) {
    this._delegate = delegate;
  }
  /**
   * @internal
   */
  _getDelegateLogger(name, version, options) {
    var _a;
    return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name, version, options);
  }
}
const _globalThis = typeof globalThis === "object" ? globalThis : global;
const GLOBAL_LOGS_API_KEY = /* @__PURE__ */ Symbol.for("io.opentelemetry.js.api.logs");
const _global = _globalThis;
function makeGetter(requiredVersion, instance, fallback) {
  return (version) => version === requiredVersion ? instance : fallback;
}
const API_BACKWARDS_COMPATIBILITY_VERSION = 1;
class LogsAPI {
  constructor() {
    this._proxyLoggerProvider = new ProxyLoggerProvider();
  }
  static getInstance() {
    if (!this._instance) {
      this._instance = new LogsAPI();
    }
    return this._instance;
  }
  setGlobalLoggerProvider(provider) {
    if (_global[GLOBAL_LOGS_API_KEY]) {
      return this.getLoggerProvider();
    }
    _global[GLOBAL_LOGS_API_KEY] = makeGetter(API_BACKWARDS_COMPATIBILITY_VERSION, provider, NOOP_LOGGER_PROVIDER);
    this._proxyLoggerProvider._setDelegate(provider);
    return provider;
  }
  /**
   * Returns the global logger provider.
   *
   * @returns LoggerProvider
   */
  getLoggerProvider() {
    var _a, _b;
    return (_b = (_a = _global[GLOBAL_LOGS_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(_global, API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : this._proxyLoggerProvider;
  }
  /**
   * Returns a logger from the global logger provider.
   *
   * @returns Logger
   */
  getLogger(name, version, options) {
    return this.getLoggerProvider().getLogger(name, version, options);
  }
  /** Remove the global logger provider */
  disable() {
    delete _global[GLOBAL_LOGS_API_KEY];
    this._proxyLoggerProvider = new ProxyLoggerProvider();
  }
}
const logs = LogsAPI.getInstance();
export {
  logs as l
};
