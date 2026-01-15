import { g as getAugmentedNamespace } from "../@apm-js-collab/code-transformer.mjs";
import { t as trace, m as metrics, d as diag } from "./api.mjs";
import { l as logs } from "./api-logs.mjs";
import * as path from "path";
import { normalize } from "path";
import { types } from "util";
import { r as requireInTheMiddleExports } from "../require-in-the-middle.mjs";
import { i as importInTheMiddleExports } from "../import-in-the-middle.mjs";
import { readFileSync } from "fs";
function enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider) {
  for (let i = 0, j = instrumentations.length; i < j; i++) {
    const instrumentation = instrumentations[i];
    if (tracerProvider) {
      instrumentation.setTracerProvider(tracerProvider);
    }
    if (meterProvider) {
      instrumentation.setMeterProvider(meterProvider);
    }
    if (loggerProvider && instrumentation.setLoggerProvider) {
      instrumentation.setLoggerProvider(loggerProvider);
    }
    if (!instrumentation.getConfig().enabled) {
      instrumentation.enable();
    }
  }
}
function disableInstrumentations(instrumentations) {
  instrumentations.forEach((instrumentation) => instrumentation.disable());
}
function registerInstrumentations(options) {
  const tracerProvider = options.tracerProvider || trace.getTracerProvider();
  const meterProvider = options.meterProvider || metrics.getMeterProvider();
  const loggerProvider = options.loggerProvider || logs.getLoggerProvider();
  const instrumentations = options.instrumentations?.flat() ?? [];
  enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider);
  return () => {
    disableInstrumentations(instrumentations);
  };
}
const VERSION_REGEXP = /^(?:v)?(?<version>(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*))(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const RANGE_REGEXP = /^(?<op><|>|=|==|<=|>=|~|\^|~>)?\s*(?:v)?(?<version>(?<major>x|X|\*|0|[1-9]\d*)(?:\.(?<minor>x|X|\*|0|[1-9]\d*))?(?:\.(?<patch>x|X|\*|0|[1-9]\d*))?)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const operatorResMap = {
  ">": [1],
  ">=": [0, 1],
  "=": [0],
  "<=": [-1, 0],
  "<": [-1],
  "!=": [-1, 1]
};
function satisfies(version, range, options) {
  if (!_validateVersion(version)) {
    diag.error(`Invalid version: ${version}`);
    return false;
  }
  if (!range) {
    return true;
  }
  range = range.replace(/([<>=~^]+)\s+/g, "$1");
  const parsedVersion = _parseVersion(version);
  if (!parsedVersion) {
    return false;
  }
  const allParsedRanges = [];
  const checkResult = _doSatisfies(parsedVersion, range, allParsedRanges, options);
  if (checkResult && !options?.includePrerelease) {
    return _doPreleaseCheck(parsedVersion, allParsedRanges);
  }
  return checkResult;
}
function _validateVersion(version) {
  return typeof version === "string" && VERSION_REGEXP.test(version);
}
function _doSatisfies(parsedVersion, range, allParsedRanges, options) {
  if (range.includes("||")) {
    const ranges = range.trim().split("||");
    for (const r of ranges) {
      if (_checkRange(parsedVersion, r, allParsedRanges, options)) {
        return true;
      }
    }
    return false;
  } else if (range.includes(" - ")) {
    range = replaceHyphen(range, options);
  } else if (range.includes(" ")) {
    const ranges = range.trim().replace(/\s{2,}/g, " ").split(" ");
    for (const r of ranges) {
      if (!_checkRange(parsedVersion, r, allParsedRanges, options)) {
        return false;
      }
    }
    return true;
  }
  return _checkRange(parsedVersion, range, allParsedRanges, options);
}
function _checkRange(parsedVersion, range, allParsedRanges, options) {
  range = _normalizeRange(range, options);
  if (range.includes(" ")) {
    return _doSatisfies(parsedVersion, range, allParsedRanges, options);
  } else {
    const parsedRange = _parseRange(range);
    allParsedRanges.push(parsedRange);
    return _satisfies(parsedVersion, parsedRange);
  }
}
function _satisfies(parsedVersion, parsedRange) {
  if (parsedRange.invalid) {
    return false;
  }
  if (!parsedRange.version || _isWildcard(parsedRange.version)) {
    return true;
  }
  let comparisonResult = _compareVersionSegments(parsedVersion.versionSegments || [], parsedRange.versionSegments || []);
  if (comparisonResult === 0) {
    const versionPrereleaseSegments = parsedVersion.prereleaseSegments || [];
    const rangePrereleaseSegments = parsedRange.prereleaseSegments || [];
    if (!versionPrereleaseSegments.length && !rangePrereleaseSegments.length) {
      comparisonResult = 0;
    } else if (!versionPrereleaseSegments.length && rangePrereleaseSegments.length) {
      comparisonResult = 1;
    } else if (versionPrereleaseSegments.length && !rangePrereleaseSegments.length) {
      comparisonResult = -1;
    } else {
      comparisonResult = _compareVersionSegments(versionPrereleaseSegments, rangePrereleaseSegments);
    }
  }
  return operatorResMap[parsedRange.op]?.includes(comparisonResult);
}
function _doPreleaseCheck(parsedVersion, allParsedRanges) {
  if (parsedVersion.prerelease) {
    return allParsedRanges.some((r) => r.prerelease && r.version === parsedVersion.version);
  }
  return true;
}
function _normalizeRange(range, options) {
  range = range.trim();
  range = replaceCaret(range, options);
  range = replaceTilde(range);
  range = replaceXRange(range, options);
  range = range.trim();
  return range;
}
function isX(id) {
  return !id || id.toLowerCase() === "x" || id === "*";
}
function _parseVersion(versionString) {
  const match = versionString.match(VERSION_REGEXP);
  if (!match) {
    diag.error(`Invalid version: ${versionString}`);
    return void 0;
  }
  const version = match.groups.version;
  const prerelease = match.groups.prerelease;
  const build = match.groups.build;
  const versionSegments = version.split(".");
  const prereleaseSegments = prerelease?.split(".");
  return {
    op: void 0,
    version,
    versionSegments,
    versionSegmentCount: versionSegments.length,
    prerelease,
    prereleaseSegments,
    prereleaseSegmentCount: prereleaseSegments ? prereleaseSegments.length : 0,
    build
  };
}
function _parseRange(rangeString) {
  if (!rangeString) {
    return {};
  }
  const match = rangeString.match(RANGE_REGEXP);
  if (!match) {
    diag.error(`Invalid range: ${rangeString}`);
    return {
      invalid: true
    };
  }
  let op = match.groups.op;
  const version = match.groups.version;
  const prerelease = match.groups.prerelease;
  const build = match.groups.build;
  const versionSegments = version.split(".");
  const prereleaseSegments = prerelease?.split(".");
  if (op === "==") {
    op = "=";
  }
  return {
    op: op || "=",
    version,
    versionSegments,
    versionSegmentCount: versionSegments.length,
    prerelease,
    prereleaseSegments,
    prereleaseSegmentCount: prereleaseSegments ? prereleaseSegments.length : 0,
    build
  };
}
function _isWildcard(s) {
  return s === "*" || s === "x" || s === "X";
}
function _parseVersionString(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? v : n;
}
function _normalizeVersionType(a, b) {
  if (typeof a === typeof b) {
    if (typeof a === "number") {
      return [a, b];
    } else if (typeof a === "string") {
      return [a, b];
    } else {
      throw new Error("Version segments can only be strings or numbers");
    }
  } else {
    return [String(a), String(b)];
  }
}
function _compareVersionStrings(v1, v2) {
  if (_isWildcard(v1) || _isWildcard(v2)) {
    return 0;
  }
  const [parsedV1, parsedV2] = _normalizeVersionType(_parseVersionString(v1), _parseVersionString(v2));
  if (parsedV1 > parsedV2) {
    return 1;
  } else if (parsedV1 < parsedV2) {
    return -1;
  }
  return 0;
}
function _compareVersionSegments(v1, v2) {
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const res = _compareVersionStrings(v1[i] || "0", v2[i] || "0");
    if (res !== 0) {
      return res;
    }
  }
  return 0;
}
const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
const NUMERICIDENTIFIER = "0|[1-9]\\d*";
const NONNUMERICIDENTIFIER = `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`;
const GTLT = "((?:<|>)?=?)";
const PRERELEASEIDENTIFIER = `(?:${NUMERICIDENTIFIER}|${NONNUMERICIDENTIFIER})`;
const PRERELEASE = `(?:-(${PRERELEASEIDENTIFIER}(?:\\.${PRERELEASEIDENTIFIER})*))`;
const BUILDIDENTIFIER = `${LETTERDASHNUMBER}+`;
const BUILD = `(?:\\+(${BUILDIDENTIFIER}(?:\\.${BUILDIDENTIFIER})*))`;
const XRANGEIDENTIFIER = `${NUMERICIDENTIFIER}|x|X|\\*`;
const XRANGEPLAIN = `[v=\\s]*(${XRANGEIDENTIFIER})(?:\\.(${XRANGEIDENTIFIER})(?:\\.(${XRANGEIDENTIFIER})(?:${PRERELEASE})?${BUILD}?)?)?`;
const XRANGE = `^${GTLT}\\s*${XRANGEPLAIN}$`;
const XRANGE_REGEXP = new RegExp(XRANGE);
const HYPHENRANGE = `^\\s*(${XRANGEPLAIN})\\s+-\\s+(${XRANGEPLAIN})\\s*$`;
const HYPHENRANGE_REGEXP = new RegExp(HYPHENRANGE);
const LONETILDE = "(?:~>?)";
const TILDE = `^${LONETILDE}${XRANGEPLAIN}$`;
const TILDE_REGEXP = new RegExp(TILDE);
const LONECARET = "(?:\\^)";
const CARET = `^${LONECARET}${XRANGEPLAIN}$`;
const CARET_REGEXP = new RegExp(CARET);
function replaceTilde(comp) {
  const r = TILDE_REGEXP;
  return comp.replace(r, (_, M, m, p, pr) => {
    let ret;
    if (isX(M)) {
      ret = "";
    } else if (isX(m)) {
      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
    } else if (isX(p)) {
      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
    } else if (pr) {
      ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
    } else {
      ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
    }
    return ret;
  });
}
function replaceCaret(comp, options) {
  const r = CARET_REGEXP;
  const z = options?.includePrerelease ? "-0" : "";
  return comp.replace(r, (_, M, m, p, pr) => {
    let ret;
    if (isX(M)) {
      ret = "";
    } else if (isX(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
    } else if (isX(p)) {
      if (M === "0") {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
      }
    } else if (pr) {
      if (M === "0") {
        if (m === "0") {
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
      }
    } else {
      if (M === "0") {
        if (m === "0") {
          ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
      }
    }
    return ret;
  });
}
function replaceXRange(comp, options) {
  const r = XRANGE_REGEXP;
  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
    const xM = isX(M);
    const xm = xM || isX(m);
    const xp = xm || isX(p);
    const anyX = xp;
    if (gtlt === "=" && anyX) {
      gtlt = "";
    }
    pr = options?.includePrerelease ? "-0" : "";
    if (xM) {
      if (gtlt === ">" || gtlt === "<") {
        ret = "<0.0.0-0";
      } else {
        ret = "*";
      }
    } else if (gtlt && anyX) {
      if (xm) {
        m = 0;
      }
      p = 0;
      if (gtlt === ">") {
        gtlt = ">=";
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === "<=") {
        gtlt = "<";
        if (xm) {
          M = +M + 1;
        } else {
          m = +m + 1;
        }
      }
      if (gtlt === "<") {
        pr = "-0";
      }
      ret = `${gtlt + M}.${m}.${p}${pr}`;
    } else if (xm) {
      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
    } else if (xp) {
      ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
    }
    return ret;
  });
}
function replaceHyphen(comp, options) {
  const r = HYPHENRANGE_REGEXP;
  return comp.replace(r, (_, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${options?.includePrerelease ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${options?.includePrerelease ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${options?.includePrerelease ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (options?.includePrerelease) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  });
}
let logger = console.error.bind(console);
function defineProperty(obj, name, value) {
  const enumerable = !!obj[name] && Object.prototype.propertyIsEnumerable.call(obj, name);
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable,
    writable: true,
    value
  });
}
const wrap = (nodule, name, wrapper) => {
  if (!nodule || !nodule[name]) {
    logger("no original function " + String(name) + " to wrap");
    return;
  }
  if (!wrapper) {
    logger("no wrapper function");
    logger(new Error().stack);
    return;
  }
  const original = nodule[name];
  if (typeof original !== "function" || typeof wrapper !== "function") {
    logger("original object and wrapper must be functions");
    return;
  }
  const wrapped = wrapper(original, name);
  defineProperty(wrapped, "__original", original);
  defineProperty(wrapped, "__unwrap", () => {
    if (nodule[name] === wrapped) {
      defineProperty(nodule, name, original);
    }
  });
  defineProperty(wrapped, "__wrapped", true);
  defineProperty(nodule, name, wrapped);
  return wrapped;
};
const massWrap = (nodules, names, wrapper) => {
  if (!nodules) {
    logger("must provide one or more modules to patch");
    logger(new Error().stack);
    return;
  } else if (!Array.isArray(nodules)) {
    nodules = [nodules];
  }
  if (!(names && Array.isArray(names))) {
    logger("must provide one or more functions to wrap on modules");
    return;
  }
  nodules.forEach((nodule) => {
    names.forEach((name) => {
      wrap(nodule, name, wrapper);
    });
  });
};
const unwrap = (nodule, name) => {
  if (!nodule || !nodule[name]) {
    logger("no function to unwrap.");
    logger(new Error().stack);
    return;
  }
  const wrapped = nodule[name];
  if (!wrapped.__unwrap) {
    logger("no original to unwrap to -- has " + String(name) + " already been unwrapped?");
  } else {
    wrapped.__unwrap();
    return;
  }
};
const massUnwrap = (nodules, names) => {
  if (!nodules) {
    logger("must provide one or more modules to patch");
    logger(new Error().stack);
    return;
  } else if (!Array.isArray(nodules)) {
    nodules = [nodules];
  }
  if (!(names && Array.isArray(names))) {
    logger("must provide one or more functions to unwrap on modules");
    return;
  }
  nodules.forEach((nodule) => {
    names.forEach((name) => {
      unwrap(nodule, name);
    });
  });
};
class InstrumentationAbstract {
  instrumentationName;
  instrumentationVersion;
  _config = {};
  _tracer;
  _meter;
  _logger;
  _diag;
  constructor(instrumentationName, instrumentationVersion, config) {
    this.instrumentationName = instrumentationName;
    this.instrumentationVersion = instrumentationVersion;
    this.setConfig(config);
    this._diag = diag.createComponentLogger({
      namespace: instrumentationName
    });
    this._tracer = trace.getTracer(instrumentationName, instrumentationVersion);
    this._meter = metrics.getMeter(instrumentationName, instrumentationVersion);
    this._logger = logs.getLogger(instrumentationName, instrumentationVersion);
    this._updateMetricInstruments();
  }
  /* Api to wrap instrumented method */
  _wrap = wrap;
  /* Api to unwrap instrumented methods */
  _unwrap = unwrap;
  /* Api to mass wrap instrumented method */
  _massWrap = massWrap;
  /* Api to mass unwrap instrumented methods */
  _massUnwrap = massUnwrap;
  /* Returns meter */
  get meter() {
    return this._meter;
  }
  /**
   * Sets MeterProvider to this plugin
   * @param meterProvider
   */
  setMeterProvider(meterProvider) {
    this._meter = meterProvider.getMeter(this.instrumentationName, this.instrumentationVersion);
    this._updateMetricInstruments();
  }
  /* Returns logger */
  get logger() {
    return this._logger;
  }
  /**
   * Sets LoggerProvider to this plugin
   * @param loggerProvider
   */
  setLoggerProvider(loggerProvider) {
    this._logger = loggerProvider.getLogger(this.instrumentationName, this.instrumentationVersion);
  }
  /**
   * @experimental
   *
   * Get module definitions defined by {@link init}.
   * This can be used for experimental compile-time instrumentation.
   *
   * @returns an array of {@link InstrumentationModuleDefinition}
   */
  getModuleDefinitions() {
    const initResult = this.init() ?? [];
    if (!Array.isArray(initResult)) {
      return [initResult];
    }
    return initResult;
  }
  /**
   * Sets the new metric instruments with the current Meter.
   */
  _updateMetricInstruments() {
    return;
  }
  /* Returns InstrumentationConfig */
  getConfig() {
    return this._config;
  }
  /**
   * Sets InstrumentationConfig to this plugin
   * @param config
   */
  setConfig(config) {
    this._config = {
      enabled: true,
      ...config
    };
  }
  /**
   * Sets TraceProvider to this plugin
   * @param tracerProvider
   */
  setTracerProvider(tracerProvider) {
    this._tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);
  }
  /* Returns tracer */
  get tracer() {
    return this._tracer;
  }
  /**
   * Execute span customization hook, if configured, and log any errors.
   * Any semantics of the trigger and info are defined by the specific instrumentation.
   * @param hookHandler The optional hook handler which the user has configured via instrumentation config
   * @param triggerName The name of the trigger for executing the hook for logging purposes
   * @param span The span to which the hook should be applied
   * @param info The info object to be passed to the hook, with useful data the hook may use
   */
  _runSpanCustomizationHook(hookHandler, triggerName, span, info) {
    if (!hookHandler) {
      return;
    }
    try {
      hookHandler(span, info);
    } catch (e) {
      this._diag.error(`Error running span customization hook due to exception in handler`, { triggerName }, e);
    }
  }
}
const ModuleNameSeparator = "/";
class ModuleNameTrieNode {
  hooks = [];
  children = /* @__PURE__ */ new Map();
}
class ModuleNameTrie {
  _trie = new ModuleNameTrieNode();
  _counter = 0;
  /**
   * Insert a module hook into the trie
   *
   * @param {Hooked} hook Hook
   */
  insert(hook) {
    let trieNode = this._trie;
    for (const moduleNamePart of hook.moduleName.split(ModuleNameSeparator)) {
      let nextNode = trieNode.children.get(moduleNamePart);
      if (!nextNode) {
        nextNode = new ModuleNameTrieNode();
        trieNode.children.set(moduleNamePart, nextNode);
      }
      trieNode = nextNode;
    }
    trieNode.hooks.push({ hook, insertedId: this._counter++ });
  }
  /**
   * Search for matching hooks in the trie
   *
   * @param {string} moduleName Module name
   * @param {boolean} maintainInsertionOrder Whether to return the results in insertion order
   * @param {boolean} fullOnly Whether to return only full matches
   * @returns {Hooked[]} Matching hooks
   */
  search(moduleName, { maintainInsertionOrder, fullOnly } = {}) {
    let trieNode = this._trie;
    const results = [];
    let foundFull = true;
    for (const moduleNamePart of moduleName.split(ModuleNameSeparator)) {
      const nextNode = trieNode.children.get(moduleNamePart);
      if (!nextNode) {
        foundFull = false;
        break;
      }
      if (!fullOnly) {
        results.push(...nextNode.hooks);
      }
      trieNode = nextNode;
    }
    if (fullOnly && foundFull) {
      results.push(...trieNode.hooks);
    }
    if (results.length === 0) {
      return [];
    }
    if (results.length === 1) {
      return [results[0].hook];
    }
    if (maintainInsertionOrder) {
      results.sort((a, b) => a.insertedId - b.insertedId);
    }
    return results.map(({ hook }) => hook);
  }
}
const isMocha = [
  "afterEach",
  "after",
  "beforeEach",
  "before",
  "describe",
  "it"
].every((fn) => {
  return typeof global[fn] === "function";
});
class RequireInTheMiddleSingleton {
  _moduleNameTrie = new ModuleNameTrie();
  static _instance;
  constructor() {
    this._initialize();
  }
  _initialize() {
    new requireInTheMiddleExports.Hook(
      // Intercept all `require` calls; we will filter the matching ones below
      null,
      { internals: true },
      (exports$1, name, basedir) => {
        const normalizedModuleName = normalizePathSeparators(name);
        const matches = this._moduleNameTrie.search(normalizedModuleName, {
          maintainInsertionOrder: true,
          // For core modules (e.g. `fs`), do not match on sub-paths (e.g. `fs/promises').
          // This matches the behavior of `require-in-the-middle`.
          // `basedir` is always `undefined` for core modules.
          fullOnly: basedir === void 0
        });
        for (const { onRequire } of matches) {
          exports$1 = onRequire(exports$1, name, basedir);
        }
        return exports$1;
      }
    );
  }
  /**
   * Register a hook with `require-in-the-middle`
   *
   * @param {string} moduleName Module name
   * @param {OnRequireFn} onRequire Hook function
   * @returns {Hooked} Registered hook
   */
  register(moduleName, onRequire) {
    const hooked = { moduleName, onRequire };
    this._moduleNameTrie.insert(hooked);
    return hooked;
  }
  /**
   * Get the `RequireInTheMiddleSingleton` singleton
   *
   * @returns {RequireInTheMiddleSingleton} Singleton of `RequireInTheMiddleSingleton`
   */
  static getInstance() {
    if (isMocha)
      return new RequireInTheMiddleSingleton();
    return this._instance = this._instance ?? new RequireInTheMiddleSingleton();
  }
}
function normalizePathSeparators(moduleNameOrPath) {
  return path.sep !== ModuleNameSeparator ? moduleNameOrPath.split(path.sep).join(ModuleNameSeparator) : moduleNameOrPath;
}
function safeExecuteInTheMiddle(execute, onFinish, preventThrowingError) {
  let error;
  let result;
  try {
    result = execute();
  } catch (e) {
    error = e;
  } finally {
    onFinish(error, result);
    if (error && !preventThrowingError) {
      throw error;
    }
    return result;
  }
}
async function safeExecuteInTheMiddleAsync(execute, onFinish, preventThrowingError) {
  let error;
  let result;
  try {
    result = await execute();
  } catch (e) {
    error = e;
  } finally {
    await onFinish(error, result);
    if (error && !preventThrowingError) {
      throw error;
    }
    return result;
  }
}
function isWrapped(func) {
  return typeof func === "function" && typeof func.__original === "function" && typeof func.__unwrap === "function" && func.__wrapped === true;
}
class InstrumentationBase extends InstrumentationAbstract {
  _modules;
  _hooks = [];
  _requireInTheMiddleSingleton = RequireInTheMiddleSingleton.getInstance();
  _enabled = false;
  constructor(instrumentationName, instrumentationVersion, config) {
    super(instrumentationName, instrumentationVersion, config);
    let modules = this.init();
    if (modules && !Array.isArray(modules)) {
      modules = [modules];
    }
    this._modules = modules || [];
    if (this._config.enabled) {
      this.enable();
    }
  }
  _wrap = (moduleExports, name, wrapper) => {
    if (isWrapped(moduleExports[name])) {
      this._unwrap(moduleExports, name);
    }
    if (!types.isProxy(moduleExports)) {
      return wrap(moduleExports, name, wrapper);
    } else {
      const wrapped = wrap(Object.assign({}, moduleExports), name, wrapper);
      Object.defineProperty(moduleExports, name, {
        value: wrapped
      });
      return wrapped;
    }
  };
  _unwrap = (moduleExports, name) => {
    if (!types.isProxy(moduleExports)) {
      return unwrap(moduleExports, name);
    } else {
      return Object.defineProperty(moduleExports, name, {
        value: moduleExports[name]
      });
    }
  };
  _massWrap = (moduleExportsArray, names, wrapper) => {
    if (!moduleExportsArray) {
      diag.error("must provide one or more modules to patch");
      return;
    } else if (!Array.isArray(moduleExportsArray)) {
      moduleExportsArray = [moduleExportsArray];
    }
    if (!(names && Array.isArray(names))) {
      diag.error("must provide one or more functions to wrap on modules");
      return;
    }
    moduleExportsArray.forEach((moduleExports) => {
      names.forEach((name) => {
        this._wrap(moduleExports, name, wrapper);
      });
    });
  };
  _massUnwrap = (moduleExportsArray, names) => {
    if (!moduleExportsArray) {
      diag.error("must provide one or more modules to patch");
      return;
    } else if (!Array.isArray(moduleExportsArray)) {
      moduleExportsArray = [moduleExportsArray];
    }
    if (!(names && Array.isArray(names))) {
      diag.error("must provide one or more functions to wrap on modules");
      return;
    }
    moduleExportsArray.forEach((moduleExports) => {
      names.forEach((name) => {
        this._unwrap(moduleExports, name);
      });
    });
  };
  _warnOnPreloadedModules() {
    this._modules.forEach((module) => {
      const { name } = module;
      try {
        const resolvedModule = require.resolve(name);
        if (require.cache[resolvedModule]) {
          this._diag.warn(`Module ${name} has been loaded before ${this.instrumentationName} so it might not work, please initialize it before requiring ${name}`);
        }
      } catch {
      }
    });
  }
  _extractPackageVersion(baseDir) {
    try {
      const json = readFileSync(path.join(baseDir, "package.json"), {
        encoding: "utf8"
      });
      const version = JSON.parse(json).version;
      return typeof version === "string" ? version : void 0;
    } catch {
      diag.warn("Failed extracting version", baseDir);
    }
    return void 0;
  }
  _onRequire(module, exports$1, name, baseDir) {
    if (!baseDir) {
      if (typeof module.patch === "function") {
        module.moduleExports = exports$1;
        if (this._enabled) {
          this._diag.debug("Applying instrumentation patch for nodejs core module on require hook", {
            module: module.name
          });
          return module.patch(exports$1);
        }
      }
      return exports$1;
    }
    const version = this._extractPackageVersion(baseDir);
    module.moduleVersion = version;
    if (module.name === name) {
      if (isSupported(module.supportedVersions, version, module.includePrerelease)) {
        if (typeof module.patch === "function") {
          module.moduleExports = exports$1;
          if (this._enabled) {
            this._diag.debug("Applying instrumentation patch for module on require hook", {
              module: module.name,
              version: module.moduleVersion,
              baseDir
            });
            return module.patch(exports$1, module.moduleVersion);
          }
        }
      }
      return exports$1;
    }
    const files = module.files ?? [];
    const normalizedName = path.normalize(name);
    const supportedFileInstrumentations = files.filter((f) => f.name === normalizedName).filter((f) => isSupported(f.supportedVersions, version, module.includePrerelease));
    return supportedFileInstrumentations.reduce((patchedExports, file) => {
      file.moduleExports = patchedExports;
      if (this._enabled) {
        this._diag.debug("Applying instrumentation patch for nodejs module file on require hook", {
          module: module.name,
          version: module.moduleVersion,
          fileName: file.name,
          baseDir
        });
        return file.patch(patchedExports, module.moduleVersion);
      }
      return patchedExports;
    }, exports$1);
  }
  enable() {
    if (this._enabled) {
      return;
    }
    this._enabled = true;
    if (this._hooks.length > 0) {
      for (const module of this._modules) {
        if (typeof module.patch === "function" && module.moduleExports) {
          this._diag.debug("Applying instrumentation patch for nodejs module on instrumentation enabled", {
            module: module.name,
            version: module.moduleVersion
          });
          module.patch(module.moduleExports, module.moduleVersion);
        }
        for (const file of module.files) {
          if (file.moduleExports) {
            this._diag.debug("Applying instrumentation patch for nodejs module file on instrumentation enabled", {
              module: module.name,
              version: module.moduleVersion,
              fileName: file.name
            });
            file.patch(file.moduleExports, module.moduleVersion);
          }
        }
      }
      return;
    }
    this._warnOnPreloadedModules();
    for (const module of this._modules) {
      const hookFn = (exports$1, name, baseDir) => {
        if (!baseDir && path.isAbsolute(name)) {
          const parsedPath = path.parse(name);
          name = parsedPath.name;
          baseDir = parsedPath.dir;
        }
        return this._onRequire(module, exports$1, name, baseDir);
      };
      const onRequire = (exports$1, name, baseDir) => {
        return this._onRequire(module, exports$1, name, baseDir);
      };
      const hook = path.isAbsolute(module.name) ? new requireInTheMiddleExports.Hook([module.name], { internals: true }, onRequire) : this._requireInTheMiddleSingleton.register(module.name, onRequire);
      this._hooks.push(hook);
      const esmHook = new importInTheMiddleExports.Hook([module.name], { internals: false }, hookFn);
      this._hooks.push(esmHook);
    }
  }
  disable() {
    if (!this._enabled) {
      return;
    }
    this._enabled = false;
    for (const module of this._modules) {
      if (typeof module.unpatch === "function" && module.moduleExports) {
        this._diag.debug("Removing instrumentation patch for nodejs module on instrumentation disabled", {
          module: module.name,
          version: module.moduleVersion
        });
        module.unpatch(module.moduleExports, module.moduleVersion);
      }
      for (const file of module.files) {
        if (file.moduleExports) {
          this._diag.debug("Removing instrumentation patch for nodejs module file on instrumentation disabled", {
            module: module.name,
            version: module.moduleVersion,
            fileName: file.name
          });
          file.unpatch(file.moduleExports, module.moduleVersion);
        }
      }
    }
  }
  isEnabled() {
    return this._enabled;
  }
}
function isSupported(supportedVersions, version, includePrerelease) {
  if (typeof version === "undefined") {
    return supportedVersions.includes("*");
  }
  return supportedVersions.some((supportedVersion) => {
    return satisfies(version, supportedVersion, { includePrerelease });
  });
}
class InstrumentationNodeModuleDefinition {
  name;
  supportedVersions;
  patch;
  unpatch;
  files;
  constructor(name, supportedVersions, patch, unpatch, files) {
    this.name = name;
    this.supportedVersions = supportedVersions;
    this.patch = patch;
    this.unpatch = unpatch;
    this.files = files || [];
  }
}
class InstrumentationNodeModuleFile {
  supportedVersions;
  patch;
  unpatch;
  name;
  constructor(name, supportedVersions, patch, unpatch) {
    this.supportedVersions = supportedVersions;
    this.patch = patch;
    this.unpatch = unpatch;
    this.name = normalize(name);
  }
}
var SemconvStability;
(function(SemconvStability2) {
  SemconvStability2[SemconvStability2["STABLE"] = 1] = "STABLE";
  SemconvStability2[SemconvStability2["OLD"] = 2] = "OLD";
  SemconvStability2[SemconvStability2["DUPLICATE"] = 3] = "DUPLICATE";
})(SemconvStability || (SemconvStability = {}));
function semconvStabilityFromStr(namespace, str) {
  let semconvStability = SemconvStability.OLD;
  const entries = str?.split(",").map((v) => v.trim()).filter((s) => s !== "");
  for (const entry of entries ?? []) {
    if (entry.toLowerCase() === namespace + "/dup") {
      semconvStability = SemconvStability.DUPLICATE;
      break;
    } else if (entry.toLowerCase() === namespace) {
      semconvStability = SemconvStability.STABLE;
    }
  }
  return semconvStability;
}
const esm = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
  get SemconvStability() {
    return SemconvStability;
  },
  isWrapped,
  registerInstrumentations,
  safeExecuteInTheMiddle,
  safeExecuteInTheMiddleAsync,
  semconvStabilityFromStr
});
const require$$2 = /* @__PURE__ */ getAugmentedNamespace(esm);
export {
  InstrumentationBase as I,
  InstrumentationNodeModuleDefinition as a,
  InstrumentationNodeModuleFile as b,
  registerInstrumentations as c,
  isWrapped as i,
  require$$2 as r,
  safeExecuteInTheMiddle as s
};
