import path__default from "path";
import moduleModule__default from "module";
import { r as requireSrc } from "./debug.mjs";
import { r as requireModuleDetailsFromPath } from "./module-details-from-path.mjs";
var requireInTheMiddle = { exports: {} };
var hasRequiredRequireInTheMiddle;
function requireRequireInTheMiddle() {
  if (hasRequiredRequireInTheMiddle) return requireInTheMiddle.exports;
  hasRequiredRequireInTheMiddle = 1;
  const path = path__default;
  const Module = moduleModule__default;
  const debug = /* @__PURE__ */ requireSrc()("require-in-the-middle");
  const moduleDetailsFromPath = /* @__PURE__ */ requireModuleDetailsFromPath();
  requireInTheMiddle.exports = Hook;
  requireInTheMiddle.exports.Hook = Hook;
  let builtinModules;
  let isCore;
  if (Module.isBuiltin) {
    isCore = Module.isBuiltin;
  } else if (Module.builtinModules) {
    isCore = (moduleName) => {
      if (moduleName.startsWith("node:")) {
        return true;
      }
      if (builtinModules === void 0) {
        builtinModules = new Set(Module.builtinModules);
      }
      return builtinModules.has(moduleName);
    };
  } else {
    throw new Error("'require-in-the-middle' requires Node.js >=v9.3.0 or >=v8.10.0");
  }
  const normalize = /([/\\]index)?(\.js)?$/;
  class ExportsCache {
    constructor() {
      this._localCache = /* @__PURE__ */ new Map();
      this._kRitmExports = /* @__PURE__ */ Symbol("RitmExports");
    }
    has(filename, isBuiltin) {
      if (this._localCache.has(filename)) {
        return true;
      } else if (!isBuiltin) {
        const mod = require.cache[filename];
        return !!(mod && this._kRitmExports in mod);
      } else {
        return false;
      }
    }
    get(filename, isBuiltin) {
      const cachedExports = this._localCache.get(filename);
      if (cachedExports !== void 0) {
        return cachedExports;
      } else if (!isBuiltin) {
        const mod = require.cache[filename];
        return mod && mod[this._kRitmExports];
      }
    }
    set(filename, exports$1, isBuiltin) {
      if (isBuiltin) {
        this._localCache.set(filename, exports$1);
      } else if (filename in require.cache) {
        require.cache[filename][this._kRitmExports] = exports$1;
      } else {
        debug('non-core module is unexpectedly not in require.cache: "%s"', filename);
        this._localCache.set(filename, exports$1);
      }
    }
  }
  function Hook(modules, options, onrequire) {
    if (this instanceof Hook === false) return new Hook(modules, options, onrequire);
    if (typeof modules === "function") {
      onrequire = modules;
      modules = null;
      options = null;
    } else if (typeof options === "function") {
      onrequire = options;
      options = null;
    }
    if (typeof Module._resolveFilename !== "function") {
      console.error("Error: Expected Module._resolveFilename to be a function (was: %s) - aborting!", typeof Module._resolveFilename);
      console.error("Please report this error as an issue related to Node.js %s at https://github.com/nodejs/require-in-the-middle/issues", process.version);
      return;
    }
    this._cache = new ExportsCache();
    this._unhooked = false;
    this._origRequire = Module.prototype.require;
    const self = this;
    const patching = /* @__PURE__ */ new Set();
    const internals = options ? options.internals === true : false;
    const hasWhitelist = Array.isArray(modules);
    debug("registering require hook");
    this._require = Module.prototype.require = function(id) {
      if (self._unhooked === true) {
        debug("ignoring require call - module is soft-unhooked");
        return self._origRequire.apply(this, arguments);
      }
      return patchedRequire.call(this, arguments, false);
    };
    if (typeof process.getBuiltinModule === "function") {
      this._origGetBuiltinModule = process.getBuiltinModule;
      this._getBuiltinModule = process.getBuiltinModule = function(id) {
        if (self._unhooked === true) {
          debug("ignoring process.getBuiltinModule call - module is soft-unhooked");
          return self._origGetBuiltinModule.apply(this, arguments);
        }
        return patchedRequire.call(this, arguments, true);
      };
    }
    function patchedRequire(args, coreOnly) {
      const id = args[0];
      const core = isCore(id);
      let filename;
      if (core) {
        filename = id;
        if (id.startsWith("node:")) {
          const idWithoutPrefix = id.slice(5);
          if (isCore(idWithoutPrefix)) {
            filename = idWithoutPrefix;
          }
        }
      } else if (coreOnly) {
        debug("call to process.getBuiltinModule with unknown built-in id");
        return self._origGetBuiltinModule.apply(this, args);
      } else {
        try {
          filename = Module._resolveFilename(id, this);
        } catch (resolveErr) {
          debug('Module._resolveFilename("%s") threw %j, calling original Module.require', id, resolveErr.message);
          return self._origRequire.apply(this, args);
        }
      }
      let moduleName, basedir;
      debug("processing %s module require('%s'): %s", core === true ? "core" : "non-core", id, filename);
      if (self._cache.has(filename, core) === true) {
        debug("returning already patched cached module: %s", filename);
        return self._cache.get(filename, core);
      }
      const isPatching = patching.has(filename);
      if (isPatching === false) {
        patching.add(filename);
      }
      const exports$1 = coreOnly ? self._origGetBuiltinModule.apply(this, args) : self._origRequire.apply(this, args);
      if (isPatching === true) {
        debug("module is in the process of being patched already - ignoring: %s", filename);
        return exports$1;
      }
      patching.delete(filename);
      if (core === true) {
        if (hasWhitelist === true && modules.includes(filename) === false) {
          debug("ignoring core module not on whitelist: %s", filename);
          return exports$1;
        }
        moduleName = filename;
      } else if (hasWhitelist === true && modules.includes(filename)) {
        const parsedPath = path.parse(filename);
        moduleName = parsedPath.name;
        basedir = parsedPath.dir;
      } else {
        const stat = moduleDetailsFromPath(filename);
        if (stat === void 0) {
          debug("could not parse filename: %s", filename);
          return exports$1;
        }
        moduleName = stat.name;
        basedir = stat.basedir;
        const fullModuleName = resolveModuleName(stat);
        debug("resolved filename to module: %s (id: %s, resolved: %s, basedir: %s)", moduleName, id, fullModuleName, basedir);
        let matchFound = false;
        if (hasWhitelist) {
          if (!id.startsWith(".") && modules.includes(id)) {
            moduleName = id;
            matchFound = true;
          }
          if (!modules.includes(moduleName) && !modules.includes(fullModuleName)) {
            return exports$1;
          }
          if (modules.includes(fullModuleName) && fullModuleName !== moduleName) {
            moduleName = fullModuleName;
            matchFound = true;
          }
        }
        if (!matchFound) {
          let res;
          try {
            res = require.resolve(moduleName, { paths: [basedir] });
          } catch (e) {
            debug("could not resolve module: %s", moduleName);
            self._cache.set(filename, exports$1, core);
            return exports$1;
          }
          if (res !== filename) {
            if (internals === true) {
              moduleName = moduleName + path.sep + path.relative(basedir, filename);
              debug("preparing to process require of internal file: %s", moduleName);
            } else {
              debug("ignoring require of non-main module file: %s", res);
              self._cache.set(filename, exports$1, core);
              return exports$1;
            }
          }
        }
      }
      self._cache.set(filename, exports$1, core);
      debug("calling require hook: %s", moduleName);
      const patchedExports = onrequire(exports$1, moduleName, basedir);
      self._cache.set(filename, patchedExports, core);
      debug("returning module: %s", moduleName);
      return patchedExports;
    }
  }
  Hook.prototype.unhook = function() {
    this._unhooked = true;
    if (this._require === Module.prototype.require) {
      Module.prototype.require = this._origRequire;
      debug("require unhook successful");
    } else {
      debug("require unhook unsuccessful");
    }
    if (process.getBuiltinModule !== void 0) {
      if (this._getBuiltinModule === process.getBuiltinModule) {
        process.getBuiltinModule = this._origGetBuiltinModule;
        debug("process.getBuiltinModule unhook successful");
      } else {
        debug("process.getBuiltinModule unhook unsuccessful");
      }
    }
  };
  function resolveModuleName(stat) {
    const normalizedPath = path.sep !== "/" ? stat.path.split(path.sep).join("/") : stat.path;
    return path.posix.join(stat.name, normalizedPath).replace(normalize, "");
  }
  return requireInTheMiddle.exports;
}
var requireInTheMiddleExports = /* @__PURE__ */ requireRequireInTheMiddle();
export {
  requireInTheMiddleExports as r
};
