import { t as trace, a as context, f as SpanKind } from "../@opentelemetry/api.mjs";
import { I as InstrumentationBase, a as InstrumentationNodeModuleDefinition } from "../@opentelemetry/instrumentation.mjs";
var showAllTraces = process.env.PRISMA_SHOW_ALL_TRACES === "true";
var nonSampledTraceParent = `00-10-10-00`;
function engineSpanKindToOtelSpanKind(engineSpanKind) {
  switch (engineSpanKind) {
    case "client":
      return SpanKind.CLIENT;
    case "internal":
    default:
      return SpanKind.INTERNAL;
  }
}
var ActiveTracingHelper = class {
  tracerProvider;
  ignoreSpanTypes;
  constructor({ tracerProvider, ignoreSpanTypes }) {
    this.tracerProvider = tracerProvider;
    this.ignoreSpanTypes = ignoreSpanTypes;
  }
  isEnabled() {
    return true;
  }
  getTraceParent(context$1) {
    const span = trace.getSpanContext(context$1 ?? context.active());
    if (span) {
      return `00-${span.traceId}-${span.spanId}-0${span.traceFlags}`;
    }
    return nonSampledTraceParent;
  }
  dispatchEngineSpans(spans) {
    const tracer = this.tracerProvider.getTracer("prisma");
    const linkIds = /* @__PURE__ */ new Map();
    const roots = spans.filter((span) => span.parentId === null);
    for (const root of roots) {
      dispatchEngineSpan(tracer, root, spans, linkIds, this.ignoreSpanTypes);
    }
  }
  getActiveContext() {
    return context.active();
  }
  runInChildSpan(options, callback) {
    if (typeof options === "string") {
      options = { name: options };
    }
    if (options.internal && !showAllTraces) {
      return callback();
    }
    const tracer = this.tracerProvider.getTracer("prisma");
    const context2 = options.context ?? this.getActiveContext();
    const name = `prisma:client:${options.name}`;
    if (shouldIgnoreSpan(name, this.ignoreSpanTypes)) {
      return callback();
    }
    if (options.active === false) {
      const span = tracer.startSpan(name, options, context2);
      return endSpan(span, callback(span, context2));
    }
    return tracer.startActiveSpan(name, options, (span) => endSpan(span, callback(span, context2)));
  }
};
function dispatchEngineSpan(tracer, engineSpan, allSpans, linkIds, ignoreSpanTypes) {
  if (shouldIgnoreSpan(engineSpan.name, ignoreSpanTypes)) return;
  const spanOptions = {
    attributes: engineSpan.attributes,
    kind: engineSpanKindToOtelSpanKind(engineSpan.kind),
    startTime: engineSpan.startTime
  };
  tracer.startActiveSpan(engineSpan.name, spanOptions, (span) => {
    linkIds.set(engineSpan.id, span.spanContext().spanId);
    if (engineSpan.links) {
      span.addLinks(
        engineSpan.links.flatMap((link) => {
          const linkedId = linkIds.get(link);
          if (!linkedId) {
            return [];
          }
          return {
            context: {
              spanId: linkedId,
              traceId: span.spanContext().traceId,
              traceFlags: span.spanContext().traceFlags
            }
          };
        })
      );
    }
    const children = allSpans.filter((s) => s.parentId === engineSpan.id);
    for (const child of children) {
      dispatchEngineSpan(tracer, child, allSpans, linkIds, ignoreSpanTypes);
    }
    span.end(engineSpan.endTime);
  });
}
function endSpan(span, result) {
  if (isPromiseLike(result)) {
    return result.then(
      (value) => {
        span.end();
        return value;
      },
      (reason) => {
        span.end();
        throw reason;
      }
    );
  }
  span.end();
  return result;
}
function isPromiseLike(value) {
  return value != null && typeof value["then"] === "function";
}
function shouldIgnoreSpan(spanName, ignoreSpanTypes) {
  return ignoreSpanTypes.some(
    (pattern) => typeof pattern === "string" ? pattern === spanName : pattern.test(spanName)
  );
}
var package_default = {
  name: "@prisma/instrumentation",
  version: "6.19.0"
};
var VERSION = package_default.version;
var majorVersion = VERSION.split(".")[0];
var GLOBAL_INSTRUMENTATION_ACCESSOR_KEY = "PRISMA_INSTRUMENTATION";
var GLOBAL_VERSIONED_INSTRUMENTATION_ACCESSOR_KEY = `V${majorVersion}_PRISMA_INSTRUMENTATION`;
var NAME = package_default.name;
var MODULE_NAME = "@prisma/client";
var PrismaInstrumentation = class extends InstrumentationBase {
  tracerProvider;
  constructor(config = {}) {
    super(NAME, VERSION, config);
  }
  setTracerProvider(tracerProvider) {
    this.tracerProvider = tracerProvider;
  }
  init() {
    const module = new InstrumentationNodeModuleDefinition(MODULE_NAME, [VERSION]);
    return [module];
  }
  enable() {
    const config = this._config;
    const globalValue = {
      helper: new ActiveTracingHelper({
        tracerProvider: this.tracerProvider ?? trace.getTracerProvider(),
        ignoreSpanTypes: config.ignoreSpanTypes ?? []
      })
    };
    global[GLOBAL_INSTRUMENTATION_ACCESSOR_KEY] = globalValue;
    global[GLOBAL_VERSIONED_INSTRUMENTATION_ACCESSOR_KEY] = globalValue;
  }
  disable() {
    delete global[GLOBAL_INSTRUMENTATION_ACCESSOR_KEY];
    delete global[GLOBAL_VERSIONED_INSTRUMENTATION_ACCESSOR_KEY];
  }
  isEnabled() {
    return Boolean(global[GLOBAL_VERSIONED_INSTRUMENTATION_ACCESSOR_KEY]);
  }
};
export {
  PrismaInstrumentation as P
};
