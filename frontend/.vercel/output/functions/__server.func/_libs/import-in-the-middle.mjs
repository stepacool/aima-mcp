import path__default from "path";
import { r as requireModuleDetailsFromPath } from "./module-details-from-path.mjs";
import require$$2 from "url";
import require$$3 from "worker_threads";
var importInTheMiddle = { exports: {} };
var register = {};
var hasRequiredRegister;
function requireRegister() {
  if (hasRequiredRegister) return register;
  hasRequiredRegister = 1;
  const importHooks = [];
  const setters = /* @__PURE__ */ new WeakMap();
  const getters = /* @__PURE__ */ new WeakMap();
  const specifiers = /* @__PURE__ */ new Map();
  const toHook = [];
  const proxyHandler = {
    set(target, name, value) {
      return setters.get(target)[name](value);
    },
    get(target, name) {
      if (name === Symbol.toStringTag) {
        return "Module";
      }
      const getter = getters.get(target)[name];
      if (typeof getter === "function") {
        return getter();
      }
    },
    defineProperty(target, property, descriptor) {
      if (!("value" in descriptor)) {
        throw new Error("Getters/setters are not supported for exports property descriptors.");
      }
      return setters.get(target)[property](descriptor.value);
    }
  };
  function register$1(name, namespace, set, get, specifier) {
    specifiers.set(name, specifier);
    setters.set(namespace, set);
    getters.set(namespace, get);
    const proxy = new Proxy(namespace, proxyHandler);
    importHooks.forEach((hook) => hook(name, proxy, specifier));
    toHook.push([name, proxy, specifier]);
  }
  let experimentalPatchInternals = false;
  function getExperimentalPatchInternals() {
    return experimentalPatchInternals;
  }
  function setExperimentalPatchInternals(value) {
    experimentalPatchInternals = value;
  }
  register.register = register$1;
  register.importHooks = importHooks;
  register.specifiers = specifiers;
  register.toHook = toHook;
  register.getExperimentalPatchInternals = getExperimentalPatchInternals;
  register.setExperimentalPatchInternals = setExperimentalPatchInternals;
  return register;
}
var hasRequiredImportInTheMiddle;
function requireImportInTheMiddle() {
  if (hasRequiredImportInTheMiddle) return importInTheMiddle.exports;
  hasRequiredImportInTheMiddle = 1;
  const path = path__default;
  const parse = /* @__PURE__ */ requireModuleDetailsFromPath();
  const { fileURLToPath } = require$$2;
  const { MessageChannel } = require$$3;
  const {
    importHooks,
    specifiers,
    toHook,
    getExperimentalPatchInternals
  } = /* @__PURE__ */ requireRegister();
  function addHook(hook) {
    importHooks.push(hook);
    toHook.forEach(([name, namespace, specifier]) => hook(name, namespace, specifier));
  }
  function removeHook(hook) {
    const index = importHooks.indexOf(hook);
    if (index > -1) {
      importHooks.splice(index, 1);
    }
  }
  function callHookFn(hookFn, namespace, name, baseDir) {
    const newDefault = hookFn(namespace, name, baseDir);
    if (newDefault && newDefault !== namespace) {
      namespace.default = newDefault;
    }
  }
  let sendModulesToLoader;
  function createAddHookMessageChannel() {
    const { port1, port2 } = new MessageChannel();
    let pendingAckCount = 0;
    let resolveFn;
    sendModulesToLoader = (modules) => {
      pendingAckCount++;
      port1.postMessage(modules);
    };
    port1.on("message", () => {
      pendingAckCount--;
      if (resolveFn && pendingAckCount <= 0) {
        resolveFn();
      }
    }).unref();
    function waitForAllMessagesAcknowledged() {
      const timer = setInterval(() => {
      }, 1e3);
      const promise = new Promise((resolve) => {
        resolveFn = resolve;
      }).then(() => {
        clearInterval(timer);
      });
      if (pendingAckCount === 0) {
        resolveFn();
      }
      return promise;
    }
    const addHookMessagePort = port2;
    const registerOptions = { data: { addHookMessagePort, include: [] }, transferList: [addHookMessagePort] };
    return { registerOptions, addHookMessagePort, waitForAllMessagesAcknowledged };
  }
  function Hook(modules, options, hookFn) {
    if (this instanceof Hook === false) return new Hook(modules, options, hookFn);
    if (typeof modules === "function") {
      hookFn = modules;
      modules = null;
      options = null;
    } else if (typeof options === "function") {
      hookFn = options;
      options = null;
    }
    const internals = options ? options.internals === true : false;
    if (sendModulesToLoader && Array.isArray(modules)) {
      sendModulesToLoader(modules);
    }
    this._iitmHook = (name, namespace, specifier) => {
      const filename = name;
      const isBuiltin = name.startsWith("node:");
      let baseDir;
      if (isBuiltin) {
        name = name.replace(/^node:/, "");
      } else {
        if (name.startsWith("file://")) {
          try {
            name = fileURLToPath(name);
          } catch (e) {
          }
        }
        const details = parse(name);
        if (details) {
          name = details.name;
          baseDir = details.basedir;
        }
      }
      if (modules) {
        for (const moduleName of modules) {
          const nameMatch = moduleName === name;
          const specMatch = moduleName === specifier;
          if (nameMatch || specMatch) {
            if (baseDir) {
              if (internals) {
                name = name + path.sep + path.relative(baseDir, fileURLToPath(filename));
              } else {
                if (!getExperimentalPatchInternals() && !specMatch && !baseDir.endsWith(specifiers.get(filename))) {
                  continue;
                }
              }
            }
            callHookFn(hookFn, namespace, name, baseDir);
          }
        }
      } else {
        callHookFn(hookFn, namespace, name, baseDir);
      }
    };
    addHook(this._iitmHook);
  }
  Hook.prototype.unhook = function() {
    removeHook(this._iitmHook);
  };
  importInTheMiddle.exports = Hook;
  importInTheMiddle.exports.Hook = Hook;
  importInTheMiddle.exports.addHook = addHook;
  importInTheMiddle.exports.removeHook = removeHook;
  importInTheMiddle.exports.createAddHookMessageChannel = createAddHookMessageChannel;
  return importInTheMiddle.exports;
}
var importInTheMiddleExports = /* @__PURE__ */ requireImportInTheMiddle();
export {
  importInTheMiddleExports as i
};
