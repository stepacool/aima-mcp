import { r as require$$0 } from "./api.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
var src = {};
var instrumentation = {};
var _enum = {};
var hasRequired_enum;
function require_enum() {
  if (hasRequired_enum) return _enum;
  hasRequired_enum = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.SpanNames = exports$1.TokenKind = exports$1.AllowedOperationTypes = void 0;
    (function(AllowedOperationTypes) {
      AllowedOperationTypes["QUERY"] = "query";
      AllowedOperationTypes["MUTATION"] = "mutation";
      AllowedOperationTypes["SUBSCRIPTION"] = "subscription";
    })(exports$1.AllowedOperationTypes || (exports$1.AllowedOperationTypes = {}));
    (function(TokenKind) {
      TokenKind["SOF"] = "<SOF>";
      TokenKind["EOF"] = "<EOF>";
      TokenKind["BANG"] = "!";
      TokenKind["DOLLAR"] = "$";
      TokenKind["AMP"] = "&";
      TokenKind["PAREN_L"] = "(";
      TokenKind["PAREN_R"] = ")";
      TokenKind["SPREAD"] = "...";
      TokenKind["COLON"] = ":";
      TokenKind["EQUALS"] = "=";
      TokenKind["AT"] = "@";
      TokenKind["BRACKET_L"] = "[";
      TokenKind["BRACKET_R"] = "]";
      TokenKind["BRACE_L"] = "{";
      TokenKind["PIPE"] = "|";
      TokenKind["BRACE_R"] = "}";
      TokenKind["NAME"] = "Name";
      TokenKind["INT"] = "Int";
      TokenKind["FLOAT"] = "Float";
      TokenKind["STRING"] = "String";
      TokenKind["BLOCK_STRING"] = "BlockString";
      TokenKind["COMMENT"] = "Comment";
    })(exports$1.TokenKind || (exports$1.TokenKind = {}));
    (function(SpanNames) {
      SpanNames["EXECUTE"] = "graphql.execute";
      SpanNames["PARSE"] = "graphql.parse";
      SpanNames["RESOLVE"] = "graphql.resolve";
      SpanNames["VALIDATE"] = "graphql.validate";
      SpanNames["SCHEMA_VALIDATE"] = "graphql.validateSchema";
      SpanNames["SCHEMA_PARSE"] = "graphql.parseSchema";
    })(exports$1.SpanNames || (exports$1.SpanNames = {}));
  })(_enum);
  return _enum;
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
      AttributeNames2["SOURCE"] = "graphql.source";
      AttributeNames2["FIELD_NAME"] = "graphql.field.name";
      AttributeNames2["FIELD_PATH"] = "graphql.field.path";
      AttributeNames2["FIELD_TYPE"] = "graphql.field.type";
      AttributeNames2["OPERATION_TYPE"] = "graphql.operation.type";
      AttributeNames2["OPERATION_NAME"] = "graphql.operation.name";
      AttributeNames2["VARIABLES"] = "graphql.variables.";
      AttributeNames2["ERROR_VALIDATION_NAME"] = "graphql.validation.error";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames);
  return AttributeNames;
}
var symbols = {};
var hasRequiredSymbols;
function requireSymbols() {
  if (hasRequiredSymbols) return symbols;
  hasRequiredSymbols = 1;
  Object.defineProperty(symbols, "__esModule", { value: true });
  symbols.OTEL_GRAPHQL_DATA_SYMBOL = symbols.OTEL_PATCHED_SYMBOL = void 0;
  symbols.OTEL_PATCHED_SYMBOL = /* @__PURE__ */ Symbol.for("opentelemetry.patched");
  symbols.OTEL_GRAPHQL_DATA_SYMBOL = /* @__PURE__ */ Symbol.for("opentelemetry.graphql_data");
  return symbols;
}
var internalTypes = {};
var hasRequiredInternalTypes;
function requireInternalTypes() {
  if (hasRequiredInternalTypes) return internalTypes;
  hasRequiredInternalTypes = 1;
  Object.defineProperty(internalTypes, "__esModule", { value: true });
  internalTypes.OPERATION_NOT_SUPPORTED = void 0;
  internalTypes.OPERATION_NOT_SUPPORTED = "Operation$operationName$not supported";
  return internalTypes;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.wrapFieldResolver = exports$1.wrapFields = exports$1.getSourceFromLocation = exports$1.getOperation = exports$1.endSpan = exports$1.addSpanSource = exports$1.addInputVariableAttributes = exports$1.isPromise = void 0;
    const api = require$$0;
    const enum_1 = /* @__PURE__ */ require_enum();
    const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
    const symbols_1 = /* @__PURE__ */ requireSymbols();
    const OPERATION_VALUES = Object.values(enum_1.AllowedOperationTypes);
    const isPromise = (value) => {
      return typeof value?.then === "function";
    };
    exports$1.isPromise = isPromise;
    const isObjectLike = (value) => {
      return typeof value == "object" && value !== null;
    };
    function addInputVariableAttribute(span, key, variable) {
      if (Array.isArray(variable)) {
        variable.forEach((value, idx) => {
          addInputVariableAttribute(span, `${key}.${idx}`, value);
        });
      } else if (variable instanceof Object) {
        Object.entries(variable).forEach(([nestedKey, value]) => {
          addInputVariableAttribute(span, `${key}.${nestedKey}`, value);
        });
      } else {
        span.setAttribute(`${AttributeNames_1.AttributeNames.VARIABLES}${String(key)}`, variable);
      }
    }
    function addInputVariableAttributes(span, variableValues) {
      Object.entries(variableValues).forEach(([key, value]) => {
        addInputVariableAttribute(span, key, value);
      });
    }
    exports$1.addInputVariableAttributes = addInputVariableAttributes;
    function addSpanSource(span, loc, allowValues, start, end) {
      const source = getSourceFromLocation(loc, allowValues, start, end);
      span.setAttribute(AttributeNames_1.AttributeNames.SOURCE, source);
    }
    exports$1.addSpanSource = addSpanSource;
    function createFieldIfNotExists(tracer, getConfig, contextValue, info, path) {
      let field = getField(contextValue, path);
      if (field) {
        return { field, spanAdded: false };
      }
      const config = getConfig();
      const parentSpan = config.flatResolveSpans ? getRootSpan(contextValue) : getParentFieldSpan(contextValue, path);
      field = {
        span: createResolverSpan(tracer, getConfig, contextValue, info, path, parentSpan)
      };
      addField(contextValue, path, field);
      return { field, spanAdded: true };
    }
    function createResolverSpan(tracer, getConfig, contextValue, info, path, parentSpan) {
      const attributes = {
        [AttributeNames_1.AttributeNames.FIELD_NAME]: info.fieldName,
        [AttributeNames_1.AttributeNames.FIELD_PATH]: path.join("."),
        [AttributeNames_1.AttributeNames.FIELD_TYPE]: info.returnType.toString()
      };
      const span = tracer.startSpan(`${enum_1.SpanNames.RESOLVE} ${attributes[AttributeNames_1.AttributeNames.FIELD_PATH]}`, {
        attributes
      }, parentSpan ? api.trace.setSpan(api.context.active(), parentSpan) : void 0);
      const document = contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].source;
      const fieldNode = info.fieldNodes.find((fieldNode2) => fieldNode2.kind === "Field");
      if (fieldNode) {
        addSpanSource(span, document.loc, getConfig().allowValues, fieldNode.loc?.start, fieldNode.loc?.end);
      }
      return span;
    }
    function endSpan(span, error) {
      if (error) {
        span.recordException(error);
      }
      span.end();
    }
    exports$1.endSpan = endSpan;
    function getOperation(document, operationName) {
      if (!document || !Array.isArray(document.definitions)) {
        return void 0;
      }
      if (operationName) {
        return document.definitions.filter((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1).find((definition) => operationName === definition?.name?.value);
      } else {
        return document.definitions.find((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1);
      }
    }
    exports$1.getOperation = getOperation;
    function addField(contextValue, path, field) {
      return contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")] = field;
    }
    function getField(contextValue, path) {
      return contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")];
    }
    function getParentFieldSpan(contextValue, path) {
      for (let i = path.length - 1; i > 0; i--) {
        const field = getField(contextValue, path.slice(0, i));
        if (field) {
          return field.span;
        }
      }
      return getRootSpan(contextValue);
    }
    function getRootSpan(contextValue) {
      return contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].span;
    }
    function pathToArray(mergeItems, path) {
      const flattened = [];
      let curr = path;
      while (curr) {
        let key = curr.key;
        if (mergeItems && typeof key === "number") {
          key = "*";
        }
        flattened.push(String(key));
        curr = curr.prev;
      }
      return flattened.reverse();
    }
    function repeatBreak(i) {
      return repeatChar("\n", i);
    }
    function repeatSpace(i) {
      return repeatChar(" ", i);
    }
    function repeatChar(char, to) {
      let text = "";
      for (let i = 0; i < to; i++) {
        text += char;
      }
      return text;
    }
    const KindsToBeRemoved = [
      enum_1.TokenKind.FLOAT,
      enum_1.TokenKind.STRING,
      enum_1.TokenKind.INT,
      enum_1.TokenKind.BLOCK_STRING
    ];
    function getSourceFromLocation(loc, allowValues = false, inputStart, inputEnd) {
      let source = "";
      if (loc?.startToken) {
        const start = typeof inputStart === "number" ? inputStart : loc.start;
        const end = typeof inputEnd === "number" ? inputEnd : loc.end;
        let next = loc.startToken.next;
        let previousLine = 1;
        while (next) {
          if (next.start < start) {
            next = next.next;
            previousLine = next?.line;
            continue;
          }
          if (next.end > end) {
            next = next.next;
            previousLine = next?.line;
            continue;
          }
          let value = next.value || next.kind;
          let space = "";
          if (!allowValues && KindsToBeRemoved.indexOf(next.kind) >= 0) {
            value = "*";
          }
          if (next.kind === enum_1.TokenKind.STRING) {
            value = `"${value}"`;
          }
          if (next.kind === enum_1.TokenKind.EOF) {
            value = "";
          }
          if (next.line > previousLine) {
            source += repeatBreak(next.line - previousLine);
            previousLine = next.line;
            space = repeatSpace(next.column - 1);
          } else {
            if (next.line === next.prev?.line) {
              space = repeatSpace(next.start - (next.prev?.end || 0));
            }
          }
          source += space + value;
          if (next) {
            next = next.next;
          }
        }
      }
      return source;
    }
    exports$1.getSourceFromLocation = getSourceFromLocation;
    function wrapFields(type, tracer, getConfig) {
      if (!type || type[symbols_1.OTEL_PATCHED_SYMBOL]) {
        return;
      }
      const fields = type.getFields();
      type[symbols_1.OTEL_PATCHED_SYMBOL] = true;
      Object.keys(fields).forEach((key) => {
        const field = fields[key];
        if (!field) {
          return;
        }
        if (field.resolve) {
          field.resolve = wrapFieldResolver(tracer, getConfig, field.resolve);
        }
        if (field.type) {
          const unwrappedTypes = unwrapType(field.type);
          for (const unwrappedType of unwrappedTypes) {
            wrapFields(unwrappedType, tracer, getConfig);
          }
        }
      });
    }
    exports$1.wrapFields = wrapFields;
    function unwrapType(type) {
      if ("ofType" in type) {
        return unwrapType(type.ofType);
      }
      if (isGraphQLUnionType(type)) {
        return type.getTypes();
      }
      if (isGraphQLObjectType(type)) {
        return [type];
      }
      return [];
    }
    function isGraphQLUnionType(type) {
      return "getTypes" in type && typeof type.getTypes === "function";
    }
    function isGraphQLObjectType(type) {
      return "getFields" in type && typeof type.getFields === "function";
    }
    const handleResolveSpanError = (resolveSpan, err, shouldEndSpan) => {
      if (!shouldEndSpan) {
        return;
      }
      resolveSpan.recordException(err);
      resolveSpan.setStatus({
        code: api.SpanStatusCode.ERROR,
        message: err.message
      });
      resolveSpan.end();
    };
    const handleResolveSpanSuccess = (resolveSpan, shouldEndSpan) => {
      if (!shouldEndSpan) {
        return;
      }
      resolveSpan.end();
    };
    function wrapFieldResolver(tracer, getConfig, fieldResolver, isDefaultResolver = false) {
      if (wrappedFieldResolver[symbols_1.OTEL_PATCHED_SYMBOL] || typeof fieldResolver !== "function") {
        return fieldResolver;
      }
      function wrappedFieldResolver(source, args, contextValue, info) {
        if (!fieldResolver) {
          return void 0;
        }
        const config = getConfig();
        if (config.ignoreTrivialResolveSpans && isDefaultResolver && (isObjectLike(source) || typeof source === "function")) {
          const property = source[info.fieldName];
          if (typeof property !== "function") {
            return fieldResolver.call(this, source, args, contextValue, info);
          }
        }
        if (!contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL]) {
          return fieldResolver.call(this, source, args, contextValue, info);
        }
        const path = pathToArray(config.mergeItems, info && info.path);
        const depth = path.filter((item) => typeof item === "string").length;
        let span;
        let shouldEndSpan = false;
        if (config.depth >= 0 && config.depth < depth) {
          span = getParentFieldSpan(contextValue, path);
        } else {
          const { field, spanAdded } = createFieldIfNotExists(tracer, getConfig, contextValue, info, path);
          span = field.span;
          shouldEndSpan = spanAdded;
        }
        return api.context.with(api.trace.setSpan(api.context.active(), span), () => {
          try {
            const res = fieldResolver.call(this, source, args, contextValue, info);
            if ((0, exports$1.isPromise)(res)) {
              return res.then((r) => {
                handleResolveSpanSuccess(span, shouldEndSpan);
                return r;
              }, (err) => {
                handleResolveSpanError(span, err, shouldEndSpan);
                throw err;
              });
            } else {
              handleResolveSpanSuccess(span, shouldEndSpan);
              return res;
            }
          } catch (err) {
            handleResolveSpanError(span, err, shouldEndSpan);
            throw err;
          }
        });
      }
      wrappedFieldResolver[symbols_1.OTEL_PATCHED_SYMBOL] = true;
      return wrappedFieldResolver;
    }
    exports$1.wrapFieldResolver = wrapFieldResolver;
  })(utils);
  return utils;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.56.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-graphql";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.GraphQLInstrumentation = void 0;
  const api_1 = require$$0;
  const instrumentation_1 = require$$2;
  const enum_1 = /* @__PURE__ */ require_enum();
  const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames();
  const symbols_1 = /* @__PURE__ */ requireSymbols();
  const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
  const utils_1 = /* @__PURE__ */ requireUtils();
  const version_1 = /* @__PURE__ */ requireVersion();
  const DEFAULT_CONFIG = {
    mergeItems: false,
    depth: -1,
    allowValues: false,
    ignoreResolveSpans: false
  };
  const supportedVersions = [">=14.0.0 <17"];
  class GraphQLInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, { ...DEFAULT_CONFIG, ...config });
    }
    setConfig(config = {}) {
      super.setConfig({ ...DEFAULT_CONFIG, ...config });
    }
    init() {
      const module = new instrumentation_1.InstrumentationNodeModuleDefinition("graphql", supportedVersions);
      module.files.push(this._addPatchingExecute());
      module.files.push(this._addPatchingParser());
      module.files.push(this._addPatchingValidate());
      return module;
    }
    _addPatchingExecute() {
      return new instrumentation_1.InstrumentationNodeModuleFile(
        "graphql/execution/execute.js",
        supportedVersions,
        // cannot make it work with appropriate type as execute function has 2
        //types and/cannot import function but only types
        (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.execute)) {
            this._unwrap(moduleExports, "execute");
          }
          this._wrap(moduleExports, "execute", this._patchExecute(moduleExports.defaultFieldResolver));
          return moduleExports;
        },
        (moduleExports) => {
          if (moduleExports) {
            this._unwrap(moduleExports, "execute");
          }
        }
      );
    }
    _addPatchingParser() {
      return new instrumentation_1.InstrumentationNodeModuleFile("graphql/language/parser.js", supportedVersions, (moduleExports) => {
        if ((0, instrumentation_1.isWrapped)(moduleExports.parse)) {
          this._unwrap(moduleExports, "parse");
        }
        this._wrap(moduleExports, "parse", this._patchParse());
        return moduleExports;
      }, (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "parse");
        }
      });
    }
    _addPatchingValidate() {
      return new instrumentation_1.InstrumentationNodeModuleFile("graphql/validation/validate.js", supportedVersions, (moduleExports) => {
        if ((0, instrumentation_1.isWrapped)(moduleExports.validate)) {
          this._unwrap(moduleExports, "validate");
        }
        this._wrap(moduleExports, "validate", this._patchValidate());
        return moduleExports;
      }, (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "validate");
        }
      });
    }
    _patchExecute(defaultFieldResolved) {
      const instrumentation2 = this;
      return function execute(original) {
        return function patchExecute() {
          let processedArgs;
          if (arguments.length >= 2) {
            const args = arguments;
            processedArgs = instrumentation2._wrapExecuteArgs(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], defaultFieldResolved);
          } else {
            const args = arguments[0];
            processedArgs = instrumentation2._wrapExecuteArgs(args.schema, args.document, args.rootValue, args.contextValue, args.variableValues, args.operationName, args.fieldResolver, args.typeResolver, defaultFieldResolved);
          }
          const operation = (0, utils_1.getOperation)(processedArgs.document, processedArgs.operationName);
          const span = instrumentation2._createExecuteSpan(operation, processedArgs);
          processedArgs.contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] = {
            source: processedArgs.document ? processedArgs.document || processedArgs.document[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] : void 0,
            span,
            fields: {}
          };
          return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
            return (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
              return original.apply(this, [
                processedArgs
              ]);
            }, (err, result) => {
              instrumentation2._handleExecutionResult(span, err, result);
            });
          });
        };
      };
    }
    _handleExecutionResult(span, err, result) {
      const config = this.getConfig();
      if (result === void 0 || err) {
        (0, utils_1.endSpan)(span, err);
        return;
      }
      if ((0, utils_1.isPromise)(result)) {
        result.then((resultData) => {
          if (typeof config.responseHook !== "function") {
            (0, utils_1.endSpan)(span);
            return;
          }
          this._executeResponseHook(span, resultData);
        }, (error) => {
          (0, utils_1.endSpan)(span, error);
        });
      } else {
        if (typeof config.responseHook !== "function") {
          (0, utils_1.endSpan)(span);
          return;
        }
        this._executeResponseHook(span, result);
      }
    }
    _executeResponseHook(span, result) {
      const { responseHook } = this.getConfig();
      if (!responseHook) {
        return;
      }
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
        responseHook(span, result);
      }, (err) => {
        if (err) {
          this._diag.error("Error running response hook", err);
        }
        (0, utils_1.endSpan)(span, void 0);
      }, true);
    }
    _patchParse() {
      const instrumentation2 = this;
      return function parse(original) {
        return function patchParse(source, options) {
          return instrumentation2._parse(this, original, source, options);
        };
      };
    }
    _patchValidate() {
      const instrumentation2 = this;
      return function validate(original) {
        return function patchValidate(schema, documentAST, rules, options, typeInfo) {
          return instrumentation2._validate(this, original, schema, documentAST, rules, typeInfo, options);
        };
      };
    }
    _parse(obj, original, source, options) {
      const config = this.getConfig();
      const span = this.tracer.startSpan(enum_1.SpanNames.PARSE);
      return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
        return (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
          return original.call(obj, source, options);
        }, (err, result) => {
          if (result) {
            const operation = (0, utils_1.getOperation)(result);
            if (!operation) {
              span.updateName(enum_1.SpanNames.SCHEMA_PARSE);
            } else if (result.loc) {
              (0, utils_1.addSpanSource)(span, result.loc, config.allowValues);
            }
          }
          (0, utils_1.endSpan)(span, err);
        });
      });
    }
    _validate(obj, original, schema, documentAST, rules, typeInfo, options) {
      const span = this.tracer.startSpan(enum_1.SpanNames.VALIDATE, {});
      return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
        return (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
          return original.call(obj, schema, documentAST, rules, options, typeInfo);
        }, (err, errors) => {
          if (!documentAST.loc) {
            span.updateName(enum_1.SpanNames.SCHEMA_VALIDATE);
          }
          if (errors && errors.length) {
            span.recordException({
              name: AttributeNames_1.AttributeNames.ERROR_VALIDATION_NAME,
              message: JSON.stringify(errors)
            });
          }
          (0, utils_1.endSpan)(span, err);
        });
      });
    }
    _createExecuteSpan(operation, processedArgs) {
      const config = this.getConfig();
      const span = this.tracer.startSpan(enum_1.SpanNames.EXECUTE, {});
      if (operation) {
        const { operation: operationType, name: nameNode } = operation;
        span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_TYPE, operationType);
        const operationName = nameNode?.value;
        if (operationName) {
          span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_NAME, operationName);
          span.updateName(`${operationType} ${operationName}`);
        } else {
          span.updateName(operationType);
        }
      } else {
        let operationName = " ";
        if (processedArgs.operationName) {
          operationName = ` "${processedArgs.operationName}" `;
        }
        operationName = internal_types_1.OPERATION_NOT_SUPPORTED.replace("$operationName$", operationName);
        span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_NAME, operationName);
      }
      if (processedArgs.document?.loc) {
        (0, utils_1.addSpanSource)(span, processedArgs.document.loc, config.allowValues);
      }
      if (processedArgs.variableValues && config.allowValues) {
        (0, utils_1.addInputVariableAttributes)(span, processedArgs.variableValues);
      }
      return span;
    }
    _wrapExecuteArgs(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver, defaultFieldResolved) {
      if (!contextValue) {
        contextValue = {};
      }
      if (contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] || this.getConfig().ignoreResolveSpans) {
        return {
          schema,
          document,
          rootValue,
          contextValue,
          variableValues,
          operationName,
          fieldResolver,
          typeResolver
        };
      }
      const isUsingDefaultResolver = fieldResolver == null;
      const fieldResolverForExecute = fieldResolver ?? defaultFieldResolved;
      fieldResolver = (0, utils_1.wrapFieldResolver)(this.tracer, () => this.getConfig(), fieldResolverForExecute, isUsingDefaultResolver);
      if (schema) {
        (0, utils_1.wrapFields)(schema.getQueryType(), this.tracer, () => this.getConfig());
        (0, utils_1.wrapFields)(schema.getMutationType(), this.tracer, () => this.getConfig());
      }
      return {
        schema,
        document,
        rootValue,
        contextValue,
        variableValues,
        operationName,
        fieldResolver,
        typeResolver
      };
    }
  }
  instrumentation.GraphQLInstrumentation = GraphQLInstrumentation;
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.GraphQLInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "GraphQLInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.GraphQLInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
