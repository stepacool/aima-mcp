import { g as getAugmentedNamespace } from "../@apm-js-collab/code-transformer.mjs";
import { c as createContextKey, b as baggageEntryMetadataFromString, p as propagation, d as diag, t as trace, i as isSpanContextValid, T as TraceFlags, D as DiagLogLevel, a as context } from "./api.mjs";
import { performance as performance$1 } from "perf_hooks";
import { T as TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS, A as ATTR_TELEMETRY_SDK_VERSION, a as ATTR_TELEMETRY_SDK_LANGUAGE, b as ATTR_TELEMETRY_SDK_NAME } from "./semantic-conventions.mjs";
import { inspect } from "util";
const SUPPRESS_TRACING_KEY$1 = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
function suppressTracing$1(context2) {
  return context2.setValue(SUPPRESS_TRACING_KEY$1, true);
}
function unsuppressTracing$1(context2) {
  return context2.deleteValue(SUPPRESS_TRACING_KEY$1);
}
function isTracingSuppressed$1(context2) {
  return context2.getValue(SUPPRESS_TRACING_KEY$1) === true;
}
const BAGGAGE_KEY_PAIR_SEPARATOR$1 = "=";
const BAGGAGE_PROPERTIES_SEPARATOR$1 = ";";
const BAGGAGE_ITEMS_SEPARATOR$1 = ",";
const BAGGAGE_HEADER$1 = "baggage";
const BAGGAGE_MAX_NAME_VALUE_PAIRS$1 = 180;
const BAGGAGE_MAX_PER_NAME_VALUE_PAIRS$1 = 4096;
const BAGGAGE_MAX_TOTAL_LENGTH$1 = 8192;
function serializeKeyPairs$1(keyPairs) {
  return keyPairs.reduce((hValue, current) => {
    const value = `${hValue}${hValue !== "" ? BAGGAGE_ITEMS_SEPARATOR$1 : ""}${current}`;
    return value.length > BAGGAGE_MAX_TOTAL_LENGTH$1 ? hValue : value;
  }, "");
}
function getKeyPairs$1(baggage) {
  return baggage.getAllEntries().map(([key, value]) => {
    let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
    if (value.metadata !== void 0) {
      entry += BAGGAGE_PROPERTIES_SEPARATOR$1 + value.metadata.toString();
    }
    return entry;
  });
}
function parsePairKeyValue$1(entry) {
  const valueProps = entry.split(BAGGAGE_PROPERTIES_SEPARATOR$1);
  if (valueProps.length <= 0)
    return;
  const keyPairPart = valueProps.shift();
  if (!keyPairPart)
    return;
  const separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR$1);
  if (separatorIndex <= 0)
    return;
  const key = decodeURIComponent(keyPairPart.substring(0, separatorIndex).trim());
  const value = decodeURIComponent(keyPairPart.substring(separatorIndex + 1).trim());
  let metadata;
  if (valueProps.length > 0) {
    metadata = baggageEntryMetadataFromString(valueProps.join(BAGGAGE_PROPERTIES_SEPARATOR$1));
  }
  return { key, value, metadata };
}
function parseKeyPairsIntoRecord$1(value) {
  const result = {};
  if (typeof value === "string" && value.length > 0) {
    value.split(BAGGAGE_ITEMS_SEPARATOR$1).forEach((entry) => {
      const keyPair = parsePairKeyValue$1(entry);
      if (keyPair !== void 0 && keyPair.value.length > 0) {
        result[keyPair.key] = keyPair.value;
      }
    });
  }
  return result;
}
let W3CBaggagePropagator$1 = class W3CBaggagePropagator {
  inject(context2, carrier, setter) {
    const baggage = propagation.getBaggage(context2);
    if (!baggage || isTracingSuppressed$1(context2))
      return;
    const keyPairs = getKeyPairs$1(baggage).filter((pair) => {
      return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS$1;
    }).slice(0, BAGGAGE_MAX_NAME_VALUE_PAIRS$1);
    const headerValue = serializeKeyPairs$1(keyPairs);
    if (headerValue.length > 0) {
      setter.set(carrier, BAGGAGE_HEADER$1, headerValue);
    }
  }
  extract(context2, carrier, getter) {
    const headerValue = getter.get(carrier, BAGGAGE_HEADER$1);
    const baggageString = Array.isArray(headerValue) ? headerValue.join(BAGGAGE_ITEMS_SEPARATOR$1) : headerValue;
    if (!baggageString)
      return context2;
    const baggage = {};
    if (baggageString.length === 0) {
      return context2;
    }
    const pairs = baggageString.split(BAGGAGE_ITEMS_SEPARATOR$1);
    pairs.forEach((entry) => {
      const keyPair = parsePairKeyValue$1(entry);
      if (keyPair) {
        const baggageEntry = { value: keyPair.value };
        if (keyPair.metadata) {
          baggageEntry.metadata = keyPair.metadata;
        }
        baggage[keyPair.key] = baggageEntry;
      }
    });
    if (Object.entries(baggage).length === 0) {
      return context2;
    }
    return propagation.setBaggage(context2, propagation.createBaggage(baggage));
  }
  fields() {
    return [BAGGAGE_HEADER$1];
  }
};
let AnchoredClock$1 = class AnchoredClock {
  _monotonicClock;
  _epochMillis;
  _performanceMillis;
  /**
   * Create a new AnchoredClock anchored to the current time returned by systemClock.
   *
   * @param systemClock should be a clock that returns the number of milliseconds since January 1 1970 such as Date
   * @param monotonicClock should be a clock that counts milliseconds monotonically such as window.performance or perf_hooks.performance
   */
  constructor(systemClock, monotonicClock) {
    this._monotonicClock = monotonicClock;
    this._epochMillis = systemClock.now();
    this._performanceMillis = monotonicClock.now();
  }
  /**
   * Returns the current time by adding the number of milliseconds since the
   * AnchoredClock was created to the creation epoch time
   */
  now() {
    const delta = this._monotonicClock.now() - this._performanceMillis;
    return this._epochMillis + delta;
  }
};
function sanitizeAttributes$1(attributes) {
  const out = {};
  if (typeof attributes !== "object" || attributes == null) {
    return out;
  }
  for (const key in attributes) {
    if (!Object.prototype.hasOwnProperty.call(attributes, key)) {
      continue;
    }
    if (!isAttributeKey$1(key)) {
      diag.warn(`Invalid attribute key: ${key}`);
      continue;
    }
    const val = attributes[key];
    if (!isAttributeValue$1(val)) {
      diag.warn(`Invalid attribute value set for key: ${key}`);
      continue;
    }
    if (Array.isArray(val)) {
      out[key] = val.slice();
    } else {
      out[key] = val;
    }
  }
  return out;
}
function isAttributeKey$1(key) {
  return typeof key === "string" && key !== "";
}
function isAttributeValue$1(val) {
  if (val == null) {
    return true;
  }
  if (Array.isArray(val)) {
    return isHomogeneousAttributeValueArray$1(val);
  }
  return isValidPrimitiveAttributeValueType$1(typeof val);
}
function isHomogeneousAttributeValueArray$1(arr) {
  let type;
  for (const element of arr) {
    if (element == null)
      continue;
    const elementType = typeof element;
    if (elementType === type) {
      continue;
    }
    if (!type) {
      if (isValidPrimitiveAttributeValueType$1(elementType)) {
        type = elementType;
        continue;
      }
      return false;
    }
    return false;
  }
  return true;
}
function isValidPrimitiveAttributeValueType$1(valType) {
  switch (valType) {
    case "number":
    case "boolean":
    case "string":
      return true;
  }
  return false;
}
function loggingErrorHandler$1() {
  return (ex) => {
    diag.error(stringifyException$1(ex));
  };
}
function stringifyException$1(ex) {
  if (typeof ex === "string") {
    return ex;
  } else {
    return JSON.stringify(flattenException$1(ex));
  }
}
function flattenException$1(ex) {
  const result = {};
  let current = ex;
  while (current !== null) {
    Object.getOwnPropertyNames(current).forEach((propertyName) => {
      if (result[propertyName])
        return;
      const value = current[propertyName];
      if (value) {
        result[propertyName] = String(value);
      }
    });
    current = Object.getPrototypeOf(current);
  }
  return result;
}
let delegateHandler$1 = loggingErrorHandler$1();
function setGlobalErrorHandler$1(handler) {
  delegateHandler$1 = handler;
}
function globalErrorHandler$1(ex) {
  try {
    delegateHandler$1(ex);
  } catch {
  }
}
function getNumberFromEnv$1(key) {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") {
    return void 0;
  }
  const value = Number(raw);
  if (isNaN(value)) {
    diag.warn(`Unknown value ${inspect(raw)} for ${key}, expected a number, using defaults`);
    return void 0;
  }
  return value;
}
function getStringFromEnv$1(key) {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") {
    return void 0;
  }
  return raw;
}
function getBooleanFromEnv$1(key) {
  const raw = process.env[key]?.trim().toLowerCase();
  if (raw == null || raw === "") {
    return false;
  }
  if (raw === "true") {
    return true;
  } else if (raw === "false") {
    return false;
  } else {
    diag.warn(`Unknown value ${inspect(raw)} for ${key}, expected 'true' or 'false', falling back to 'false' (default)`);
    return false;
  }
}
function getStringListFromEnv$1(key) {
  return getStringFromEnv$1(key)?.split(",").map((v) => v.trim()).filter((s) => s !== "");
}
const _globalThis$1 = typeof globalThis === "object" ? globalThis : global;
const otperformance$1 = performance$1;
const VERSION$3 = "2.2.0";
const ATTR_PROCESS_RUNTIME_NAME$1 = "process.runtime.name";
const SDK_INFO$1 = {
  [ATTR_TELEMETRY_SDK_NAME]: "opentelemetry",
  [ATTR_PROCESS_RUNTIME_NAME$1]: "node",
  [ATTR_TELEMETRY_SDK_LANGUAGE]: TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS,
  [ATTR_TELEMETRY_SDK_VERSION]: VERSION$3
};
const NANOSECOND_DIGITS$1 = 9;
const NANOSECOND_DIGITS_IN_MILLIS$1 = 6;
const MILLISECONDS_TO_NANOSECONDS$1 = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS$1);
const SECOND_TO_NANOSECONDS$1 = Math.pow(10, NANOSECOND_DIGITS$1);
function millisToHrTime$1(epochMillis) {
  const epochSeconds = epochMillis / 1e3;
  const seconds = Math.trunc(epochSeconds);
  const nanos = Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS$1);
  return [seconds, nanos];
}
function getTimeOrigin$1() {
  let timeOrigin = otperformance$1.timeOrigin;
  if (typeof timeOrigin !== "number") {
    const perf = otperformance$1;
    timeOrigin = perf.timing && perf.timing.fetchStart;
  }
  return timeOrigin;
}
function hrTime$1(performanceNow) {
  const timeOrigin = millisToHrTime$1(getTimeOrigin$1());
  const now = millisToHrTime$1(typeof performanceNow === "number" ? performanceNow : otperformance$1.now());
  return addHrTimes$1(timeOrigin, now);
}
function timeInputToHrTime$1(time) {
  if (isTimeInputHrTime$1(time)) {
    return time;
  } else if (typeof time === "number") {
    if (time < getTimeOrigin$1()) {
      return hrTime$1(time);
    } else {
      return millisToHrTime$1(time);
    }
  } else if (time instanceof Date) {
    return millisToHrTime$1(time.getTime());
  } else {
    throw TypeError("Invalid input type");
  }
}
function hrTimeDuration$1(startTime, endTime) {
  let seconds = endTime[0] - startTime[0];
  let nanos = endTime[1] - startTime[1];
  if (nanos < 0) {
    seconds -= 1;
    nanos += SECOND_TO_NANOSECONDS$1;
  }
  return [seconds, nanos];
}
function hrTimeToTimeStamp$1(time) {
  const precision = NANOSECOND_DIGITS$1;
  const tmp = `${"0".repeat(precision)}${time[1]}Z`;
  const nanoString = tmp.substring(tmp.length - precision - 1);
  const date = new Date(time[0] * 1e3).toISOString();
  return date.replace("000Z", nanoString);
}
function hrTimeToNanoseconds$1(time) {
  return time[0] * SECOND_TO_NANOSECONDS$1 + time[1];
}
function hrTimeToMilliseconds$1(time) {
  return time[0] * 1e3 + time[1] / 1e6;
}
function hrTimeToMicroseconds$1(time) {
  return time[0] * 1e6 + time[1] / 1e3;
}
function isTimeInputHrTime$1(value) {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}
function isTimeInput$1(value) {
  return isTimeInputHrTime$1(value) || typeof value === "number" || value instanceof Date;
}
function addHrTimes$1(time1, time2) {
  const out = [time1[0] + time2[0], time1[1] + time2[1]];
  if (out[1] >= SECOND_TO_NANOSECONDS$1) {
    out[1] -= SECOND_TO_NANOSECONDS$1;
    out[0] += 1;
  }
  return out;
}
function unrefTimer$1(timer) {
  if (typeof timer !== "number") {
    timer.unref();
  }
}
var ExportResultCode$1;
(function(ExportResultCode2) {
  ExportResultCode2[ExportResultCode2["SUCCESS"] = 0] = "SUCCESS";
  ExportResultCode2[ExportResultCode2["FAILED"] = 1] = "FAILED";
})(ExportResultCode$1 || (ExportResultCode$1 = {}));
let CompositePropagator$1 = class CompositePropagator {
  _propagators;
  _fields;
  /**
   * Construct a composite propagator from a list of propagators.
   *
   * @param [config] Configuration object for composite propagator
   */
  constructor(config = {}) {
    this._propagators = config.propagators ?? [];
    this._fields = Array.from(new Set(this._propagators.map((p) => typeof p.fields === "function" ? p.fields() : []).reduce((x, y) => x.concat(y), [])));
  }
  /**
   * Run each of the configured propagators with the given context and carrier.
   * Propagators are run in the order they are configured, so if multiple
   * propagators write the same carrier key, the propagator later in the list
   * will "win".
   *
   * @param context Context to inject
   * @param carrier Carrier into which context will be injected
   */
  inject(context2, carrier, setter) {
    for (const propagator of this._propagators) {
      try {
        propagator.inject(context2, carrier, setter);
      } catch (err) {
        diag.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
      }
    }
  }
  /**
   * Run each of the configured propagators with the given context and carrier.
   * Propagators are run in the order they are configured, so if multiple
   * propagators write the same context key, the propagator later in the list
   * will "win".
   *
   * @param context Context to add values to
   * @param carrier Carrier from which to extract context
   */
  extract(context2, carrier, getter) {
    return this._propagators.reduce((ctx, propagator) => {
      try {
        return propagator.extract(ctx, carrier, getter);
      } catch (err) {
        diag.warn(`Failed to extract with ${propagator.constructor.name}. Err: ${err.message}`);
      }
      return ctx;
    }, context2);
  }
  fields() {
    return this._fields.slice();
  }
};
const VALID_KEY_CHAR_RANGE$1 = "[_0-9a-z-*/]";
const VALID_KEY$1 = `[a-z]${VALID_KEY_CHAR_RANGE$1}{0,255}`;
const VALID_VENDOR_KEY$1 = `[a-z0-9]${VALID_KEY_CHAR_RANGE$1}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE$1}{0,13}`;
const VALID_KEY_REGEX$1 = new RegExp(`^(?:${VALID_KEY$1}|${VALID_VENDOR_KEY$1})$`);
const VALID_VALUE_BASE_REGEX$1 = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX$1 = /,|=/;
function validateKey$1(key) {
  return VALID_KEY_REGEX$1.test(key);
}
function validateValue$1(value) {
  return VALID_VALUE_BASE_REGEX$1.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX$1.test(value);
}
const MAX_TRACE_STATE_ITEMS$1 = 32;
const MAX_TRACE_STATE_LEN$1 = 512;
const LIST_MEMBERS_SEPARATOR$1 = ",";
const LIST_MEMBER_KEY_VALUE_SPLITTER$1 = "=";
let TraceState$1 = class TraceState {
  _internalState = /* @__PURE__ */ new Map();
  constructor(rawTraceState) {
    if (rawTraceState)
      this._parse(rawTraceState);
  }
  set(key, value) {
    const traceState = this._clone();
    if (traceState._internalState.has(key)) {
      traceState._internalState.delete(key);
    }
    traceState._internalState.set(key, value);
    return traceState;
  }
  unset(key) {
    const traceState = this._clone();
    traceState._internalState.delete(key);
    return traceState;
  }
  get(key) {
    return this._internalState.get(key);
  }
  serialize() {
    return this._keys().reduce((agg, key) => {
      agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER$1 + this.get(key));
      return agg;
    }, []).join(LIST_MEMBERS_SEPARATOR$1);
  }
  _parse(rawTraceState) {
    if (rawTraceState.length > MAX_TRACE_STATE_LEN$1)
      return;
    this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR$1).reverse().reduce((agg, part) => {
      const listMember = part.trim();
      const i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER$1);
      if (i !== -1) {
        const key = listMember.slice(0, i);
        const value = listMember.slice(i + 1, part.length);
        if (validateKey$1(key) && validateValue$1(value)) {
          agg.set(key, value);
        }
      }
      return agg;
    }, /* @__PURE__ */ new Map());
    if (this._internalState.size > MAX_TRACE_STATE_ITEMS$1) {
      this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS$1));
    }
  }
  _keys() {
    return Array.from(this._internalState.keys()).reverse();
  }
  _clone() {
    const traceState = new TraceState();
    traceState._internalState = new Map(this._internalState);
    return traceState;
  }
};
const TRACE_PARENT_HEADER$1 = "traceparent";
const TRACE_STATE_HEADER$1 = "tracestate";
const VERSION$2 = "00";
const VERSION_PART$1 = "(?!ff)[\\da-f]{2}";
const TRACE_ID_PART$1 = "(?![0]{32})[\\da-f]{32}";
const PARENT_ID_PART$1 = "(?![0]{16})[\\da-f]{16}";
const FLAGS_PART$1 = "[\\da-f]{2}";
const TRACE_PARENT_REGEX$1 = new RegExp(`^\\s?(${VERSION_PART$1})-(${TRACE_ID_PART$1})-(${PARENT_ID_PART$1})-(${FLAGS_PART$1})(-.*)?\\s?$`);
function parseTraceParent$1(traceParent) {
  const match = TRACE_PARENT_REGEX$1.exec(traceParent);
  if (!match)
    return null;
  if (match[1] === "00" && match[5])
    return null;
  return {
    traceId: match[2],
    spanId: match[3],
    traceFlags: parseInt(match[4], 16)
  };
}
let W3CTraceContextPropagator$1 = class W3CTraceContextPropagator {
  inject(context2, carrier, setter) {
    const spanContext = trace.getSpanContext(context2);
    if (!spanContext || isTracingSuppressed$1(context2) || !isSpanContextValid(spanContext))
      return;
    const traceParent = `${VERSION$2}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || TraceFlags.NONE).toString(16)}`;
    setter.set(carrier, TRACE_PARENT_HEADER$1, traceParent);
    if (spanContext.traceState) {
      setter.set(carrier, TRACE_STATE_HEADER$1, spanContext.traceState.serialize());
    }
  }
  extract(context2, carrier, getter) {
    const traceParentHeader = getter.get(carrier, TRACE_PARENT_HEADER$1);
    if (!traceParentHeader)
      return context2;
    const traceParent = Array.isArray(traceParentHeader) ? traceParentHeader[0] : traceParentHeader;
    if (typeof traceParent !== "string")
      return context2;
    const spanContext = parseTraceParent$1(traceParent);
    if (!spanContext)
      return context2;
    spanContext.isRemote = true;
    const traceStateHeader = getter.get(carrier, TRACE_STATE_HEADER$1);
    if (traceStateHeader) {
      const state = Array.isArray(traceStateHeader) ? traceStateHeader.join(",") : traceStateHeader;
      spanContext.traceState = new TraceState$1(typeof state === "string" ? state : void 0);
    }
    return trace.setSpanContext(context2, spanContext);
  }
  fields() {
    return [TRACE_PARENT_HEADER$1, TRACE_STATE_HEADER$1];
  }
};
const RPC_METADATA_KEY$1 = createContextKey("OpenTelemetry SDK Context Key RPC_METADATA");
var RPCType$1;
(function(RPCType2) {
  RPCType2["HTTP"] = "http";
})(RPCType$1 || (RPCType$1 = {}));
function setRPCMetadata$1(context2, meta) {
  return context2.setValue(RPC_METADATA_KEY$1, meta);
}
function deleteRPCMetadata$1(context2) {
  return context2.deleteValue(RPC_METADATA_KEY$1);
}
function getRPCMetadata$1(context2) {
  return context2.getValue(RPC_METADATA_KEY$1);
}
const objectTag$1 = "[object Object]";
const nullTag$1 = "[object Null]";
const undefinedTag$1 = "[object Undefined]";
const funcProto$1 = Function.prototype;
const funcToString$1 = funcProto$1.toString;
const objectCtorString$1 = funcToString$1.call(Object);
const getPrototypeOf$1 = Object.getPrototypeOf;
const objectProto$1 = Object.prototype;
const hasOwnProperty$1 = objectProto$1.hasOwnProperty;
const symToStringTag$1 = Symbol ? Symbol.toStringTag : void 0;
const nativeObjectToString$1 = objectProto$1.toString;
function isPlainObject$1(value) {
  if (!isObjectLike$1(value) || baseGetTag$1(value) !== objectTag$1) {
    return false;
  }
  const proto = getPrototypeOf$1(value);
  if (proto === null) {
    return true;
  }
  const Ctor = hasOwnProperty$1.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString$1.call(Ctor) === objectCtorString$1;
}
function isObjectLike$1(value) {
  return value != null && typeof value == "object";
}
function baseGetTag$1(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag$1 : nullTag$1;
  }
  return symToStringTag$1 && symToStringTag$1 in Object(value) ? getRawTag$1(value) : objectToString$1(value);
}
function getRawTag$1(value) {
  const isOwn = hasOwnProperty$1.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  let unmasked = false;
  try {
    value[symToStringTag$1] = void 0;
    unmasked = true;
  } catch {
  }
  const result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
function objectToString$1(value) {
  return nativeObjectToString$1.call(value);
}
const MAX_LEVEL$1 = 20;
function merge$1(...args) {
  let result = args.shift();
  const objects = /* @__PURE__ */ new WeakMap();
  while (args.length > 0) {
    result = mergeTwoObjects$1(result, args.shift(), 0, objects);
  }
  return result;
}
function takeValue$1(value) {
  if (isArray$1(value)) {
    return value.slice();
  }
  return value;
}
function mergeTwoObjects$1(one, two, level = 0, objects) {
  let result;
  if (level > MAX_LEVEL$1) {
    return void 0;
  }
  level++;
  if (isPrimitive$1(one) || isPrimitive$1(two) || isFunction$1(two)) {
    result = takeValue$1(two);
  } else if (isArray$1(one)) {
    result = one.slice();
    if (isArray$1(two)) {
      for (let i = 0, j = two.length; i < j; i++) {
        result.push(takeValue$1(two[i]));
      }
    } else if (isObject$1(two)) {
      const keys = Object.keys(two);
      for (let i = 0, j = keys.length; i < j; i++) {
        const key = keys[i];
        result[key] = takeValue$1(two[key]);
      }
    }
  } else if (isObject$1(one)) {
    if (isObject$1(two)) {
      if (!shouldMerge$1(one, two)) {
        return two;
      }
      result = Object.assign({}, one);
      const keys = Object.keys(two);
      for (let i = 0, j = keys.length; i < j; i++) {
        const key = keys[i];
        const twoValue = two[key];
        if (isPrimitive$1(twoValue)) {
          if (typeof twoValue === "undefined") {
            delete result[key];
          } else {
            result[key] = twoValue;
          }
        } else {
          const obj1 = result[key];
          const obj2 = twoValue;
          if (wasObjectReferenced$1(one, key, objects) || wasObjectReferenced$1(two, key, objects)) {
            delete result[key];
          } else {
            if (isObject$1(obj1) && isObject$1(obj2)) {
              const arr1 = objects.get(obj1) || [];
              const arr2 = objects.get(obj2) || [];
              arr1.push({ obj: one, key });
              arr2.push({ obj: two, key });
              objects.set(obj1, arr1);
              objects.set(obj2, arr2);
            }
            result[key] = mergeTwoObjects$1(result[key], twoValue, level, objects);
          }
        }
      }
    } else {
      result = two;
    }
  }
  return result;
}
function wasObjectReferenced$1(obj, key, objects) {
  const arr = objects.get(obj[key]) || [];
  for (let i = 0, j = arr.length; i < j; i++) {
    const info = arr[i];
    if (info.key === key && info.obj === obj) {
      return true;
    }
  }
  return false;
}
function isArray$1(value) {
  return Array.isArray(value);
}
function isFunction$1(value) {
  return typeof value === "function";
}
function isObject$1(value) {
  return !isPrimitive$1(value) && !isArray$1(value) && !isFunction$1(value) && typeof value === "object";
}
function isPrimitive$1(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "undefined" || value instanceof Date || value instanceof RegExp || value === null;
}
function shouldMerge$1(one, two) {
  if (!isPlainObject$1(one) || !isPlainObject$1(two)) {
    return false;
  }
  return true;
}
let TimeoutError$1 = class TimeoutError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
};
function callWithTimeout$1(promise, timeout) {
  let timeoutHandle;
  const timeoutPromise = new Promise(function timeoutFunction(_resolve, reject) {
    timeoutHandle = setTimeout(function timeoutHandler() {
      reject(new TimeoutError$1("Operation timed out."));
    }, timeout);
  });
  return Promise.race([promise, timeoutPromise]).then((result) => {
    clearTimeout(timeoutHandle);
    return result;
  }, (reason) => {
    clearTimeout(timeoutHandle);
    throw reason;
  });
}
function urlMatches$1(url, urlToMatch) {
  if (typeof urlToMatch === "string") {
    return url === urlToMatch;
  } else {
    return !!url.match(urlToMatch);
  }
}
function isUrlIgnored$1(url, ignoredUrls) {
  if (!ignoredUrls) {
    return false;
  }
  for (const ignoreUrl of ignoredUrls) {
    if (urlMatches$1(url, ignoreUrl)) {
      return true;
    }
  }
  return false;
}
let Deferred$1 = class Deferred {
  _promise;
  _resolve;
  _reject;
  constructor() {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  get promise() {
    return this._promise;
  }
  resolve(val) {
    this._resolve(val);
  }
  reject(err) {
    this._reject(err);
  }
};
let BindOnceFuture$1 = class BindOnceFuture {
  _callback;
  _that;
  _isCalled = false;
  _deferred = new Deferred$1();
  constructor(_callback, _that) {
    this._callback = _callback;
    this._that = _that;
  }
  get isCalled() {
    return this._isCalled;
  }
  get promise() {
    return this._deferred.promise;
  }
  call(...args) {
    if (!this._isCalled) {
      this._isCalled = true;
      try {
        Promise.resolve(this._callback.call(this._that, ...args)).then((val) => this._deferred.resolve(val), (err) => this._deferred.reject(err));
      } catch (err) {
        this._deferred.reject(err);
      }
    }
    return this._deferred.promise;
  }
};
const logLevelMap$1 = {
  ALL: DiagLogLevel.ALL,
  VERBOSE: DiagLogLevel.VERBOSE,
  DEBUG: DiagLogLevel.DEBUG,
  INFO: DiagLogLevel.INFO,
  WARN: DiagLogLevel.WARN,
  ERROR: DiagLogLevel.ERROR,
  NONE: DiagLogLevel.NONE
};
function diagLogLevelFromString$1(value) {
  if (value == null) {
    return void 0;
  }
  const resolvedLogLevel = logLevelMap$1[value.toUpperCase()];
  if (resolvedLogLevel == null) {
    diag.warn(`Unknown log level "${value}", expected one of ${Object.keys(logLevelMap$1)}, using default`);
    return DiagLogLevel.INFO;
  }
  return resolvedLogLevel;
}
function _export$1(exporter, arg) {
  return new Promise((resolve) => {
    context.with(suppressTracing$1(context.active()), () => {
      exporter.export(arg, (result) => {
        resolve(result);
      });
    });
  });
}
const internal$1 = {
  _export: _export$1
};
const esm$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  AnchoredClock: AnchoredClock$1,
  BindOnceFuture: BindOnceFuture$1,
  CompositePropagator: CompositePropagator$1,
  get ExportResultCode() {
    return ExportResultCode$1;
  },
  get RPCType() {
    return RPCType$1;
  },
  SDK_INFO: SDK_INFO$1,
  TRACE_PARENT_HEADER: TRACE_PARENT_HEADER$1,
  TRACE_STATE_HEADER: TRACE_STATE_HEADER$1,
  TimeoutError: TimeoutError$1,
  TraceState: TraceState$1,
  W3CBaggagePropagator: W3CBaggagePropagator$1,
  W3CTraceContextPropagator: W3CTraceContextPropagator$1,
  _globalThis: _globalThis$1,
  addHrTimes: addHrTimes$1,
  callWithTimeout: callWithTimeout$1,
  deleteRPCMetadata: deleteRPCMetadata$1,
  diagLogLevelFromString: diagLogLevelFromString$1,
  getBooleanFromEnv: getBooleanFromEnv$1,
  getNumberFromEnv: getNumberFromEnv$1,
  getRPCMetadata: getRPCMetadata$1,
  getStringFromEnv: getStringFromEnv$1,
  getStringListFromEnv: getStringListFromEnv$1,
  getTimeOrigin: getTimeOrigin$1,
  globalErrorHandler: globalErrorHandler$1,
  hrTime: hrTime$1,
  hrTimeDuration: hrTimeDuration$1,
  hrTimeToMicroseconds: hrTimeToMicroseconds$1,
  hrTimeToMilliseconds: hrTimeToMilliseconds$1,
  hrTimeToNanoseconds: hrTimeToNanoseconds$1,
  hrTimeToTimeStamp: hrTimeToTimeStamp$1,
  internal: internal$1,
  isAttributeValue: isAttributeValue$1,
  isTimeInput: isTimeInput$1,
  isTimeInputHrTime: isTimeInputHrTime$1,
  isTracingSuppressed: isTracingSuppressed$1,
  isUrlIgnored: isUrlIgnored$1,
  loggingErrorHandler: loggingErrorHandler$1,
  merge: merge$1,
  millisToHrTime: millisToHrTime$1,
  otperformance: otperformance$1,
  parseKeyPairsIntoRecord: parseKeyPairsIntoRecord$1,
  parseTraceParent: parseTraceParent$1,
  sanitizeAttributes: sanitizeAttributes$1,
  setGlobalErrorHandler: setGlobalErrorHandler$1,
  setRPCMetadata: setRPCMetadata$1,
  suppressTracing: suppressTracing$1,
  timeInputToHrTime: timeInputToHrTime$1,
  unrefTimer: unrefTimer$1,
  unsuppressTracing: unsuppressTracing$1,
  urlMatches: urlMatches$1
});
const require$$1$1 = /* @__PURE__ */ getAugmentedNamespace(esm$1);
const SUPPRESS_TRACING_KEY = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
function suppressTracing(context2) {
  return context2.setValue(SUPPRESS_TRACING_KEY, true);
}
function unsuppressTracing(context2) {
  return context2.deleteValue(SUPPRESS_TRACING_KEY);
}
function isTracingSuppressed(context2) {
  return context2.getValue(SUPPRESS_TRACING_KEY) === true;
}
const BAGGAGE_KEY_PAIR_SEPARATOR = "=";
const BAGGAGE_PROPERTIES_SEPARATOR = ";";
const BAGGAGE_ITEMS_SEPARATOR = ",";
const BAGGAGE_HEADER = "baggage";
const BAGGAGE_MAX_NAME_VALUE_PAIRS = 180;
const BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
const BAGGAGE_MAX_TOTAL_LENGTH = 8192;
function serializeKeyPairs(keyPairs) {
  return keyPairs.reduce((hValue, current) => {
    const value = `${hValue}${hValue !== "" ? BAGGAGE_ITEMS_SEPARATOR : ""}${current}`;
    return value.length > BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
  }, "");
}
function getKeyPairs(baggage) {
  return baggage.getAllEntries().map(([key, value]) => {
    let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
    if (value.metadata !== void 0) {
      entry += BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
    }
    return entry;
  });
}
function parsePairKeyValue(entry) {
  if (!entry)
    return;
  const metadataSeparatorIndex = entry.indexOf(BAGGAGE_PROPERTIES_SEPARATOR);
  const keyPairPart = metadataSeparatorIndex === -1 ? entry : entry.substring(0, metadataSeparatorIndex);
  const separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR);
  if (separatorIndex <= 0)
    return;
  const rawKey = keyPairPart.substring(0, separatorIndex).trim();
  const rawValue = keyPairPart.substring(separatorIndex + 1).trim();
  if (!rawKey || !rawValue)
    return;
  let key;
  let value;
  try {
    key = decodeURIComponent(rawKey);
    value = decodeURIComponent(rawValue);
  } catch {
    return;
  }
  let metadata;
  if (metadataSeparatorIndex !== -1 && metadataSeparatorIndex < entry.length - 1) {
    const metadataString = entry.substring(metadataSeparatorIndex + 1);
    metadata = baggageEntryMetadataFromString(metadataString);
  }
  return { key, value, metadata };
}
function parseKeyPairsIntoRecord(value) {
  const result = {};
  if (typeof value === "string" && value.length > 0) {
    value.split(BAGGAGE_ITEMS_SEPARATOR).forEach((entry) => {
      const keyPair = parsePairKeyValue(entry);
      if (keyPair !== void 0 && keyPair.value.length > 0) {
        result[keyPair.key] = keyPair.value;
      }
    });
  }
  return result;
}
class W3CBaggagePropagator2 {
  inject(context2, carrier, setter) {
    const baggage = propagation.getBaggage(context2);
    if (!baggage || isTracingSuppressed(context2))
      return;
    const keyPairs = getKeyPairs(baggage).filter((pair) => {
      return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
    }).slice(0, BAGGAGE_MAX_NAME_VALUE_PAIRS);
    const headerValue = serializeKeyPairs(keyPairs);
    if (headerValue.length > 0) {
      setter.set(carrier, BAGGAGE_HEADER, headerValue);
    }
  }
  extract(context2, carrier, getter) {
    const headerValue = getter.get(carrier, BAGGAGE_HEADER);
    const baggageString = Array.isArray(headerValue) ? headerValue.join(BAGGAGE_ITEMS_SEPARATOR) : headerValue;
    if (!baggageString)
      return context2;
    const baggage = {};
    if (baggageString.length === 0) {
      return context2;
    }
    const pairs = baggageString.split(BAGGAGE_ITEMS_SEPARATOR);
    pairs.forEach((entry) => {
      const keyPair = parsePairKeyValue(entry);
      if (keyPair) {
        const baggageEntry = { value: keyPair.value };
        if (keyPair.metadata) {
          baggageEntry.metadata = keyPair.metadata;
        }
        baggage[keyPair.key] = baggageEntry;
      }
    });
    if (Object.entries(baggage).length === 0) {
      return context2;
    }
    return propagation.setBaggage(context2, propagation.createBaggage(baggage));
  }
  fields() {
    return [BAGGAGE_HEADER];
  }
}
class AnchoredClock2 {
  _monotonicClock;
  _epochMillis;
  _performanceMillis;
  /**
   * Create a new AnchoredClock anchored to the current time returned by systemClock.
   *
   * @param systemClock should be a clock that returns the number of milliseconds since January 1 1970 such as Date
   * @param monotonicClock should be a clock that counts milliseconds monotonically such as window.performance or perf_hooks.performance
   */
  constructor(systemClock, monotonicClock) {
    this._monotonicClock = monotonicClock;
    this._epochMillis = systemClock.now();
    this._performanceMillis = monotonicClock.now();
  }
  /**
   * Returns the current time by adding the number of milliseconds since the
   * AnchoredClock was created to the creation epoch time
   */
  now() {
    const delta = this._monotonicClock.now() - this._performanceMillis;
    return this._epochMillis + delta;
  }
}
function sanitizeAttributes(attributes) {
  const out = {};
  if (typeof attributes !== "object" || attributes == null) {
    return out;
  }
  for (const key in attributes) {
    if (!Object.prototype.hasOwnProperty.call(attributes, key)) {
      continue;
    }
    if (!isAttributeKey(key)) {
      diag.warn(`Invalid attribute key: ${key}`);
      continue;
    }
    const val = attributes[key];
    if (!isAttributeValue(val)) {
      diag.warn(`Invalid attribute value set for key: ${key}`);
      continue;
    }
    if (Array.isArray(val)) {
      out[key] = val.slice();
    } else {
      out[key] = val;
    }
  }
  return out;
}
function isAttributeKey(key) {
  return typeof key === "string" && key !== "";
}
function isAttributeValue(val) {
  if (val == null) {
    return true;
  }
  if (Array.isArray(val)) {
    return isHomogeneousAttributeValueArray(val);
  }
  return isValidPrimitiveAttributeValueType(typeof val);
}
function isHomogeneousAttributeValueArray(arr) {
  let type;
  for (const element of arr) {
    if (element == null)
      continue;
    const elementType = typeof element;
    if (elementType === type) {
      continue;
    }
    if (!type) {
      if (isValidPrimitiveAttributeValueType(elementType)) {
        type = elementType;
        continue;
      }
      return false;
    }
    return false;
  }
  return true;
}
function isValidPrimitiveAttributeValueType(valType) {
  switch (valType) {
    case "number":
    case "boolean":
    case "string":
      return true;
  }
  return false;
}
function loggingErrorHandler() {
  return (ex) => {
    diag.error(stringifyException(ex));
  };
}
function stringifyException(ex) {
  if (typeof ex === "string") {
    return ex;
  } else {
    return JSON.stringify(flattenException(ex));
  }
}
function flattenException(ex) {
  const result = {};
  let current = ex;
  while (current !== null) {
    Object.getOwnPropertyNames(current).forEach((propertyName) => {
      if (result[propertyName])
        return;
      const value = current[propertyName];
      if (value) {
        result[propertyName] = String(value);
      }
    });
    current = Object.getPrototypeOf(current);
  }
  return result;
}
let delegateHandler = loggingErrorHandler();
function setGlobalErrorHandler(handler) {
  delegateHandler = handler;
}
function globalErrorHandler(ex) {
  try {
    delegateHandler(ex);
  } catch {
  }
}
function getNumberFromEnv(key) {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") {
    return void 0;
  }
  const value = Number(raw);
  if (isNaN(value)) {
    diag.warn(`Unknown value ${inspect(raw)} for ${key}, expected a number, using defaults`);
    return void 0;
  }
  return value;
}
function getStringFromEnv(key) {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") {
    return void 0;
  }
  return raw;
}
function getBooleanFromEnv(key) {
  const raw = process.env[key]?.trim().toLowerCase();
  if (raw == null || raw === "") {
    return false;
  }
  if (raw === "true") {
    return true;
  } else if (raw === "false") {
    return false;
  } else {
    diag.warn(`Unknown value ${inspect(raw)} for ${key}, expected 'true' or 'false', falling back to 'false' (default)`);
    return false;
  }
}
function getStringListFromEnv(key) {
  return getStringFromEnv(key)?.split(",").map((v) => v.trim()).filter((s) => s !== "");
}
const _globalThis = globalThis;
const VERSION$1 = "2.3.0";
const ATTR_PROCESS_RUNTIME_NAME = "process.runtime.name";
const SDK_INFO = {
  [ATTR_TELEMETRY_SDK_NAME]: "opentelemetry",
  [ATTR_PROCESS_RUNTIME_NAME]: "node",
  [ATTR_TELEMETRY_SDK_LANGUAGE]: TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS,
  [ATTR_TELEMETRY_SDK_VERSION]: VERSION$1
};
const otperformance = performance;
const NANOSECOND_DIGITS = 9;
const NANOSECOND_DIGITS_IN_MILLIS = 6;
const MILLISECONDS_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS);
const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
function millisToHrTime(epochMillis) {
  const epochSeconds = epochMillis / 1e3;
  const seconds = Math.trunc(epochSeconds);
  const nanos = Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS);
  return [seconds, nanos];
}
function getTimeOrigin() {
  return otperformance.timeOrigin;
}
function hrTime(performanceNow) {
  const timeOrigin = millisToHrTime(otperformance.timeOrigin);
  const now = millisToHrTime(typeof performanceNow === "number" ? performanceNow : otperformance.now());
  return addHrTimes(timeOrigin, now);
}
function timeInputToHrTime(time) {
  if (isTimeInputHrTime(time)) {
    return time;
  } else if (typeof time === "number") {
    if (time < otperformance.timeOrigin) {
      return hrTime(time);
    } else {
      return millisToHrTime(time);
    }
  } else if (time instanceof Date) {
    return millisToHrTime(time.getTime());
  } else {
    throw TypeError("Invalid input type");
  }
}
function hrTimeDuration(startTime, endTime) {
  let seconds = endTime[0] - startTime[0];
  let nanos = endTime[1] - startTime[1];
  if (nanos < 0) {
    seconds -= 1;
    nanos += SECOND_TO_NANOSECONDS;
  }
  return [seconds, nanos];
}
function hrTimeToTimeStamp(time) {
  const precision = NANOSECOND_DIGITS;
  const tmp = `${"0".repeat(precision)}${time[1]}Z`;
  const nanoString = tmp.substring(tmp.length - precision - 1);
  const date = new Date(time[0] * 1e3).toISOString();
  return date.replace("000Z", nanoString);
}
function hrTimeToNanoseconds(time) {
  return time[0] * SECOND_TO_NANOSECONDS + time[1];
}
function hrTimeToMilliseconds(time) {
  return time[0] * 1e3 + time[1] / 1e6;
}
function hrTimeToMicroseconds(time) {
  return time[0] * 1e6 + time[1] / 1e3;
}
function isTimeInputHrTime(value) {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}
function isTimeInput(value) {
  return isTimeInputHrTime(value) || typeof value === "number" || value instanceof Date;
}
function addHrTimes(time1, time2) {
  const out = [time1[0] + time2[0], time1[1] + time2[1]];
  if (out[1] >= SECOND_TO_NANOSECONDS) {
    out[1] -= SECOND_TO_NANOSECONDS;
    out[0] += 1;
  }
  return out;
}
function unrefTimer(timer) {
  if (typeof timer !== "number") {
    timer.unref();
  }
}
var ExportResultCode;
(function(ExportResultCode2) {
  ExportResultCode2[ExportResultCode2["SUCCESS"] = 0] = "SUCCESS";
  ExportResultCode2[ExportResultCode2["FAILED"] = 1] = "FAILED";
})(ExportResultCode || (ExportResultCode = {}));
class CompositePropagator2 {
  _propagators;
  _fields;
  /**
   * Construct a composite propagator from a list of propagators.
   *
   * @param [config] Configuration object for composite propagator
   */
  constructor(config = {}) {
    this._propagators = config.propagators ?? [];
    this._fields = Array.from(new Set(this._propagators.map((p) => typeof p.fields === "function" ? p.fields() : []).reduce((x, y) => x.concat(y), [])));
  }
  /**
   * Run each of the configured propagators with the given context and carrier.
   * Propagators are run in the order they are configured, so if multiple
   * propagators write the same carrier key, the propagator later in the list
   * will "win".
   *
   * @param context Context to inject
   * @param carrier Carrier into which context will be injected
   */
  inject(context2, carrier, setter) {
    for (const propagator of this._propagators) {
      try {
        propagator.inject(context2, carrier, setter);
      } catch (err) {
        diag.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
      }
    }
  }
  /**
   * Run each of the configured propagators with the given context and carrier.
   * Propagators are run in the order they are configured, so if multiple
   * propagators write the same context key, the propagator later in the list
   * will "win".
   *
   * @param context Context to add values to
   * @param carrier Carrier from which to extract context
   */
  extract(context2, carrier, getter) {
    return this._propagators.reduce((ctx, propagator) => {
      try {
        return propagator.extract(ctx, carrier, getter);
      } catch (err) {
        diag.warn(`Failed to extract with ${propagator.constructor.name}. Err: ${err.message}`);
      }
      return ctx;
    }, context2);
  }
  fields() {
    return this._fields.slice();
  }
}
const VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
function validateKey(key) {
  return VALID_KEY_REGEX.test(key);
}
function validateValue(value) {
  return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
}
const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ",";
const LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
class TraceState2 {
  _internalState = /* @__PURE__ */ new Map();
  constructor(rawTraceState) {
    if (rawTraceState)
      this._parse(rawTraceState);
  }
  set(key, value) {
    const traceState = this._clone();
    if (traceState._internalState.has(key)) {
      traceState._internalState.delete(key);
    }
    traceState._internalState.set(key, value);
    return traceState;
  }
  unset(key) {
    const traceState = this._clone();
    traceState._internalState.delete(key);
    return traceState;
  }
  get(key) {
    return this._internalState.get(key);
  }
  serialize() {
    return this._keys().reduce((agg, key) => {
      agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
      return agg;
    }, []).join(LIST_MEMBERS_SEPARATOR);
  }
  _parse(rawTraceState) {
    if (rawTraceState.length > MAX_TRACE_STATE_LEN)
      return;
    this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR).reverse().reduce((agg, part) => {
      const listMember = part.trim();
      const i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
      if (i !== -1) {
        const key = listMember.slice(0, i);
        const value = listMember.slice(i + 1, part.length);
        if (validateKey(key) && validateValue(value)) {
          agg.set(key, value);
        }
      }
      return agg;
    }, /* @__PURE__ */ new Map());
    if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
      this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS));
    }
  }
  _keys() {
    return Array.from(this._internalState.keys()).reverse();
  }
  _clone() {
    const traceState = new TraceState2();
    traceState._internalState = new Map(this._internalState);
    return traceState;
  }
}
const TRACE_PARENT_HEADER = "traceparent";
const TRACE_STATE_HEADER = "tracestate";
const VERSION = "00";
const VERSION_PART = "(?!ff)[\\da-f]{2}";
const TRACE_ID_PART = "(?![0]{32})[\\da-f]{32}";
const PARENT_ID_PART = "(?![0]{16})[\\da-f]{16}";
const FLAGS_PART = "[\\da-f]{2}";
const TRACE_PARENT_REGEX = new RegExp(`^\\s?(${VERSION_PART})-(${TRACE_ID_PART})-(${PARENT_ID_PART})-(${FLAGS_PART})(-.*)?\\s?$`);
function parseTraceParent(traceParent) {
  const match = TRACE_PARENT_REGEX.exec(traceParent);
  if (!match)
    return null;
  if (match[1] === "00" && match[5])
    return null;
  return {
    traceId: match[2],
    spanId: match[3],
    traceFlags: parseInt(match[4], 16)
  };
}
class W3CTraceContextPropagator2 {
  inject(context2, carrier, setter) {
    const spanContext = trace.getSpanContext(context2);
    if (!spanContext || isTracingSuppressed(context2) || !isSpanContextValid(spanContext))
      return;
    const traceParent = `${VERSION}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || TraceFlags.NONE).toString(16)}`;
    setter.set(carrier, TRACE_PARENT_HEADER, traceParent);
    if (spanContext.traceState) {
      setter.set(carrier, TRACE_STATE_HEADER, spanContext.traceState.serialize());
    }
  }
  extract(context2, carrier, getter) {
    const traceParentHeader = getter.get(carrier, TRACE_PARENT_HEADER);
    if (!traceParentHeader)
      return context2;
    const traceParent = Array.isArray(traceParentHeader) ? traceParentHeader[0] : traceParentHeader;
    if (typeof traceParent !== "string")
      return context2;
    const spanContext = parseTraceParent(traceParent);
    if (!spanContext)
      return context2;
    spanContext.isRemote = true;
    const traceStateHeader = getter.get(carrier, TRACE_STATE_HEADER);
    if (traceStateHeader) {
      const state = Array.isArray(traceStateHeader) ? traceStateHeader.join(",") : traceStateHeader;
      spanContext.traceState = new TraceState2(typeof state === "string" ? state : void 0);
    }
    return trace.setSpanContext(context2, spanContext);
  }
  fields() {
    return [TRACE_PARENT_HEADER, TRACE_STATE_HEADER];
  }
}
const RPC_METADATA_KEY = createContextKey("OpenTelemetry SDK Context Key RPC_METADATA");
var RPCType;
(function(RPCType2) {
  RPCType2["HTTP"] = "http";
})(RPCType || (RPCType = {}));
function setRPCMetadata(context2, meta) {
  return context2.setValue(RPC_METADATA_KEY, meta);
}
function deleteRPCMetadata(context2) {
  return context2.deleteValue(RPC_METADATA_KEY);
}
function getRPCMetadata(context2) {
  return context2.getValue(RPC_METADATA_KEY);
}
const objectTag = "[object Object]";
const nullTag = "[object Null]";
const undefinedTag = "[object Undefined]";
const funcProto = Function.prototype;
const funcToString = funcProto.toString;
const objectCtorString = funcToString.call(Object);
const getPrototypeOf = Object.getPrototypeOf;
const objectProto = Object.prototype;
const hasOwnProperty = objectProto.hasOwnProperty;
const symToStringTag = Symbol ? Symbol.toStringTag : void 0;
const nativeObjectToString = objectProto.toString;
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) !== objectTag) {
    return false;
  }
  const proto = getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  const Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
function getRawTag(value) {
  const isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
  let unmasked = false;
  try {
    value[symToStringTag] = void 0;
    unmasked = true;
  } catch {
  }
  const result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
function objectToString(value) {
  return nativeObjectToString.call(value);
}
const MAX_LEVEL = 20;
function merge(...args) {
  let result = args.shift();
  const objects = /* @__PURE__ */ new WeakMap();
  while (args.length > 0) {
    result = mergeTwoObjects(result, args.shift(), 0, objects);
  }
  return result;
}
function takeValue(value) {
  if (isArray(value)) {
    return value.slice();
  }
  return value;
}
function mergeTwoObjects(one, two, level = 0, objects) {
  let result;
  if (level > MAX_LEVEL) {
    return void 0;
  }
  level++;
  if (isPrimitive(one) || isPrimitive(two) || isFunction(two)) {
    result = takeValue(two);
  } else if (isArray(one)) {
    result = one.slice();
    if (isArray(two)) {
      for (let i = 0, j = two.length; i < j; i++) {
        result.push(takeValue(two[i]));
      }
    } else if (isObject(two)) {
      const keys = Object.keys(two);
      for (let i = 0, j = keys.length; i < j; i++) {
        const key = keys[i];
        result[key] = takeValue(two[key]);
      }
    }
  } else if (isObject(one)) {
    if (isObject(two)) {
      if (!shouldMerge(one, two)) {
        return two;
      }
      result = Object.assign({}, one);
      const keys = Object.keys(two);
      for (let i = 0, j = keys.length; i < j; i++) {
        const key = keys[i];
        const twoValue = two[key];
        if (isPrimitive(twoValue)) {
          if (typeof twoValue === "undefined") {
            delete result[key];
          } else {
            result[key] = twoValue;
          }
        } else {
          const obj1 = result[key];
          const obj2 = twoValue;
          if (wasObjectReferenced(one, key, objects) || wasObjectReferenced(two, key, objects)) {
            delete result[key];
          } else {
            if (isObject(obj1) && isObject(obj2)) {
              const arr1 = objects.get(obj1) || [];
              const arr2 = objects.get(obj2) || [];
              arr1.push({ obj: one, key });
              arr2.push({ obj: two, key });
              objects.set(obj1, arr1);
              objects.set(obj2, arr2);
            }
            result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
          }
        }
      }
    } else {
      result = two;
    }
  }
  return result;
}
function wasObjectReferenced(obj, key, objects) {
  const arr = objects.get(obj[key]) || [];
  for (let i = 0, j = arr.length; i < j; i++) {
    const info = arr[i];
    if (info.key === key && info.obj === obj) {
      return true;
    }
  }
  return false;
}
function isArray(value) {
  return Array.isArray(value);
}
function isFunction(value) {
  return typeof value === "function";
}
function isObject(value) {
  return !isPrimitive(value) && !isArray(value) && !isFunction(value) && typeof value === "object";
}
function isPrimitive(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "undefined" || value instanceof Date || value instanceof RegExp || value === null;
}
function shouldMerge(one, two) {
  if (!isPlainObject(one) || !isPlainObject(two)) {
    return false;
  }
  return true;
}
class TimeoutError2 extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, TimeoutError2.prototype);
  }
}
function callWithTimeout(promise, timeout) {
  let timeoutHandle;
  const timeoutPromise = new Promise(function timeoutFunction(_resolve, reject) {
    timeoutHandle = setTimeout(function timeoutHandler() {
      reject(new TimeoutError2("Operation timed out."));
    }, timeout);
  });
  return Promise.race([promise, timeoutPromise]).then((result) => {
    clearTimeout(timeoutHandle);
    return result;
  }, (reason) => {
    clearTimeout(timeoutHandle);
    throw reason;
  });
}
function urlMatches(url, urlToMatch) {
  if (typeof urlToMatch === "string") {
    return url === urlToMatch;
  } else {
    return !!url.match(urlToMatch);
  }
}
function isUrlIgnored(url, ignoredUrls) {
  if (!ignoredUrls) {
    return false;
  }
  for (const ignoreUrl of ignoredUrls) {
    if (urlMatches(url, ignoreUrl)) {
      return true;
    }
  }
  return false;
}
class Deferred2 {
  _promise;
  _resolve;
  _reject;
  constructor() {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  get promise() {
    return this._promise;
  }
  resolve(val) {
    this._resolve(val);
  }
  reject(err) {
    this._reject(err);
  }
}
class BindOnceFuture2 {
  _isCalled = false;
  _deferred = new Deferred2();
  _callback;
  _that;
  constructor(callback, that) {
    this._callback = callback;
    this._that = that;
  }
  get isCalled() {
    return this._isCalled;
  }
  get promise() {
    return this._deferred.promise;
  }
  call(...args) {
    if (!this._isCalled) {
      this._isCalled = true;
      try {
        Promise.resolve(this._callback.call(this._that, ...args)).then((val) => this._deferred.resolve(val), (err) => this._deferred.reject(err));
      } catch (err) {
        this._deferred.reject(err);
      }
    }
    return this._deferred.promise;
  }
}
const logLevelMap = {
  ALL: DiagLogLevel.ALL,
  VERBOSE: DiagLogLevel.VERBOSE,
  DEBUG: DiagLogLevel.DEBUG,
  INFO: DiagLogLevel.INFO,
  WARN: DiagLogLevel.WARN,
  ERROR: DiagLogLevel.ERROR,
  NONE: DiagLogLevel.NONE
};
function diagLogLevelFromString(value) {
  if (value == null) {
    return void 0;
  }
  const resolvedLogLevel = logLevelMap[value.toUpperCase()];
  if (resolvedLogLevel == null) {
    diag.warn(`Unknown log level "${value}", expected one of ${Object.keys(logLevelMap)}, using default`);
    return DiagLogLevel.INFO;
  }
  return resolvedLogLevel;
}
function _export(exporter, arg) {
  return new Promise((resolve) => {
    context.with(suppressTracing(context.active()), () => {
      exporter.export(arg, (result) => {
        resolve(result);
      });
    });
  });
}
const internal = {
  _export
};
const esm = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  AnchoredClock: AnchoredClock2,
  BindOnceFuture: BindOnceFuture2,
  CompositePropagator: CompositePropagator2,
  get ExportResultCode() {
    return ExportResultCode;
  },
  get RPCType() {
    return RPCType;
  },
  SDK_INFO,
  TRACE_PARENT_HEADER,
  TRACE_STATE_HEADER,
  TimeoutError: TimeoutError2,
  TraceState: TraceState2,
  W3CBaggagePropagator: W3CBaggagePropagator2,
  W3CTraceContextPropagator: W3CTraceContextPropagator2,
  _globalThis,
  addHrTimes,
  callWithTimeout,
  deleteRPCMetadata,
  diagLogLevelFromString,
  getBooleanFromEnv,
  getNumberFromEnv,
  getRPCMetadata,
  getStringFromEnv,
  getStringListFromEnv,
  getTimeOrigin,
  globalErrorHandler,
  hrTime,
  hrTimeDuration,
  hrTimeToMicroseconds,
  hrTimeToMilliseconds,
  hrTimeToNanoseconds,
  hrTimeToTimeStamp,
  internal,
  isAttributeValue,
  isTimeInput,
  isTimeInputHrTime,
  isTracingSuppressed,
  isUrlIgnored,
  loggingErrorHandler,
  merge,
  millisToHrTime,
  otperformance,
  parseKeyPairsIntoRecord,
  parseTraceParent,
  sanitizeAttributes,
  setGlobalErrorHandler,
  setRPCMetadata,
  suppressTracing,
  timeInputToHrTime,
  unrefTimer,
  unsuppressTracing,
  urlMatches
});
const require$$1 = /* @__PURE__ */ getAugmentedNamespace(esm);
export {
  RPCType as R,
  SDK_INFO as S,
  TraceState2 as T,
  W3CBaggagePropagator2 as W,
  require$$1$1 as a,
  isTimeInput as b,
  hrTime as c,
  isTimeInputHrTime as d,
  addHrTimes as e,
  getNumberFromEnv as f,
  globalErrorHandler as g,
  hrTimeDuration as h,
  isAttributeValue as i,
  getStringFromEnv as j,
  isTracingSuppressed as k,
  merge as l,
  millisToHrTime as m,
  getRPCMetadata as n,
  otperformance as o,
  setRPCMetadata as p,
  suppressTracing as q,
  require$$1 as r,
  sanitizeAttributes as s
};
