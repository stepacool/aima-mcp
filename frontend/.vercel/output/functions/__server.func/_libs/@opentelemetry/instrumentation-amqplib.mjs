import { r as require$$0 } from "./api.mjs";
import { r as require$$1 } from "./core.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
var src = {};
var amqplib = {};
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_MESSAGING_SYSTEM = semconv.ATTR_MESSAGING_OPERATION = void 0;
  semconv.ATTR_MESSAGING_OPERATION = "messaging.operation";
  semconv.ATTR_MESSAGING_SYSTEM = "messaging.system";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  return semconv;
}
var semconvObsolete = {};
var hasRequiredSemconvObsolete;
function requireSemconvObsolete() {
  if (hasRequiredSemconvObsolete) return semconvObsolete;
  hasRequiredSemconvObsolete = 1;
  Object.defineProperty(semconvObsolete, "__esModule", { value: true });
  semconvObsolete.ATTR_MESSAGING_CONVERSATION_ID = semconvObsolete.OLD_ATTR_MESSAGING_MESSAGE_ID = semconvObsolete.MESSAGING_DESTINATION_KIND_VALUE_TOPIC = semconvObsolete.ATTR_MESSAGING_URL = semconvObsolete.ATTR_MESSAGING_PROTOCOL_VERSION = semconvObsolete.ATTR_MESSAGING_PROTOCOL = semconvObsolete.MESSAGING_OPERATION_VALUE_PROCESS = semconvObsolete.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY = semconvObsolete.ATTR_MESSAGING_DESTINATION_KIND = semconvObsolete.ATTR_MESSAGING_DESTINATION = void 0;
  semconvObsolete.ATTR_MESSAGING_DESTINATION = "messaging.destination";
  semconvObsolete.ATTR_MESSAGING_DESTINATION_KIND = "messaging.destination_kind";
  semconvObsolete.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY = "messaging.rabbitmq.routing_key";
  semconvObsolete.MESSAGING_OPERATION_VALUE_PROCESS = "process";
  semconvObsolete.ATTR_MESSAGING_PROTOCOL = "messaging.protocol";
  semconvObsolete.ATTR_MESSAGING_PROTOCOL_VERSION = "messaging.protocol_version";
  semconvObsolete.ATTR_MESSAGING_URL = "messaging.url";
  semconvObsolete.MESSAGING_DESTINATION_KIND_VALUE_TOPIC = "topic";
  semconvObsolete.OLD_ATTR_MESSAGING_MESSAGE_ID = "messaging.message_id";
  semconvObsolete.ATTR_MESSAGING_CONVERSATION_ID = "messaging.conversation_id";
  return semconvObsolete;
}
var types = {};
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes) return types;
  hasRequiredTypes = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.DEFAULT_CONFIG = exports$1.EndOperation = void 0;
    (function(EndOperation) {
      EndOperation["AutoAck"] = "auto ack";
      EndOperation["Ack"] = "ack";
      EndOperation["AckAll"] = "ackAll";
      EndOperation["Reject"] = "reject";
      EndOperation["Nack"] = "nack";
      EndOperation["NackAll"] = "nackAll";
      EndOperation["ChannelClosed"] = "channel closed";
      EndOperation["ChannelError"] = "channel error";
      EndOperation["InstrumentationTimeout"] = "instrumentation timeout";
    })(exports$1.EndOperation || (exports$1.EndOperation = {}));
    exports$1.DEFAULT_CONFIG = {
      consumeTimeoutMs: 1e3 * 60,
      useLinksForConsume: false
    };
  })(types);
  return types;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.isConfirmChannelTracing = utils.unmarkConfirmChannelTracing = utils.markConfirmChannelTracing = utils.getConnectionAttributesFromUrl = utils.getConnectionAttributesFromServer = utils.normalizeExchange = utils.CONNECTION_ATTRIBUTES = utils.CHANNEL_CONSUME_TIMEOUT_TIMER = utils.CHANNEL_SPANS_NOT_ENDED = utils.MESSAGE_STORED_SPAN = void 0;
  const api_1 = require$$0;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const semconv_obsolete_1 = /* @__PURE__ */ requireSemconvObsolete();
  utils.MESSAGE_STORED_SPAN = /* @__PURE__ */ Symbol("opentelemetry.amqplib.message.stored-span");
  utils.CHANNEL_SPANS_NOT_ENDED = /* @__PURE__ */ Symbol("opentelemetry.amqplib.channel.spans-not-ended");
  utils.CHANNEL_CONSUME_TIMEOUT_TIMER = /* @__PURE__ */ Symbol("opentelemetry.amqplib.channel.consumer-timeout-timer");
  utils.CONNECTION_ATTRIBUTES = /* @__PURE__ */ Symbol("opentelemetry.amqplib.connection.attributes");
  const IS_CONFIRM_CHANNEL_CONTEXT_KEY = (0, api_1.createContextKey)("opentelemetry.amqplib.channel.is-confirm-channel");
  const normalizeExchange = (exchangeName) => exchangeName !== "" ? exchangeName : "<default>";
  utils.normalizeExchange = normalizeExchange;
  const censorPassword = (url) => {
    return url.replace(/:[^:@/]*@/, ":***@");
  };
  const getPort = (portFromUrl, resolvedProtocol) => {
    return portFromUrl || (resolvedProtocol === "AMQP" ? 5672 : 5671);
  };
  const getProtocol = (protocolFromUrl) => {
    const resolvedProtocol = protocolFromUrl || "amqp";
    const noEndingColon = resolvedProtocol.endsWith(":") ? resolvedProtocol.substring(0, resolvedProtocol.length - 1) : resolvedProtocol;
    return noEndingColon.toUpperCase();
  };
  const getHostname = (hostnameFromUrl) => {
    return hostnameFromUrl || "localhost";
  };
  const extractConnectionAttributeOrLog = (url, attributeKey, attributeValue, nameForLog) => {
    if (attributeValue) {
      return { [attributeKey]: attributeValue };
    } else {
      api_1.diag.error(`amqplib instrumentation: could not extract connection attribute ${nameForLog} from user supplied url`, {
        url
      });
      return {};
    }
  };
  const getConnectionAttributesFromServer = (conn) => {
    const product = conn.serverProperties.product?.toLowerCase?.();
    if (product) {
      return {
        [semconv_1.ATTR_MESSAGING_SYSTEM]: product
      };
    } else {
      return {};
    }
  };
  utils.getConnectionAttributesFromServer = getConnectionAttributesFromServer;
  const getConnectionAttributesFromUrl = (url) => {
    const attributes = {
      [semconv_obsolete_1.ATTR_MESSAGING_PROTOCOL_VERSION]: "0.9.1"
      // this is the only protocol supported by the instrumented library
    };
    url = url || "amqp://localhost";
    if (typeof url === "object") {
      const connectOptions = url;
      const protocol = getProtocol(connectOptions?.protocol);
      Object.assign(attributes, {
        ...extractConnectionAttributeOrLog(url, semconv_obsolete_1.ATTR_MESSAGING_PROTOCOL, protocol, "protocol")
      });
      const hostname = getHostname(connectOptions?.hostname);
      Object.assign(attributes, {
        ...extractConnectionAttributeOrLog(url, semconv_1.ATTR_NET_PEER_NAME, hostname, "hostname")
      });
      const port = getPort(connectOptions.port, protocol);
      Object.assign(attributes, {
        ...extractConnectionAttributeOrLog(url, semconv_1.ATTR_NET_PEER_PORT, port, "port")
      });
    } else {
      const censoredUrl = censorPassword(url);
      attributes[semconv_obsolete_1.ATTR_MESSAGING_URL] = censoredUrl;
      try {
        const urlParts = new URL(censoredUrl);
        const protocol = getProtocol(urlParts.protocol);
        Object.assign(attributes, {
          ...extractConnectionAttributeOrLog(censoredUrl, semconv_obsolete_1.ATTR_MESSAGING_PROTOCOL, protocol, "protocol")
        });
        const hostname = getHostname(urlParts.hostname);
        Object.assign(attributes, {
          ...extractConnectionAttributeOrLog(censoredUrl, semconv_1.ATTR_NET_PEER_NAME, hostname, "hostname")
        });
        const port = getPort(urlParts.port ? parseInt(urlParts.port) : void 0, protocol);
        Object.assign(attributes, {
          ...extractConnectionAttributeOrLog(censoredUrl, semconv_1.ATTR_NET_PEER_PORT, port, "port")
        });
      } catch (err) {
        api_1.diag.error("amqplib instrumentation: error while extracting connection details from connection url", {
          censoredUrl,
          err
        });
      }
    }
    return attributes;
  };
  utils.getConnectionAttributesFromUrl = getConnectionAttributesFromUrl;
  const markConfirmChannelTracing = (context) => {
    return context.setValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY, true);
  };
  utils.markConfirmChannelTracing = markConfirmChannelTracing;
  const unmarkConfirmChannelTracing = (context) => {
    return context.deleteValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY);
  };
  utils.unmarkConfirmChannelTracing = unmarkConfirmChannelTracing;
  const isConfirmChannelTracing = (context) => {
    return context.getValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY) === true;
  };
  utils.isConfirmChannelTracing = isConfirmChannelTracing;
  return utils;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.55.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-amqplib";
  return version;
}
var hasRequiredAmqplib;
function requireAmqplib() {
  if (hasRequiredAmqplib) return amqplib;
  hasRequiredAmqplib = 1;
  Object.defineProperty(amqplib, "__esModule", { value: true });
  amqplib.AmqplibInstrumentation = void 0;
  const api_1 = require$$0;
  const core_1 = require$$1;
  const instrumentation_1 = require$$2;
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const semconv_obsolete_1 = /* @__PURE__ */ requireSemconvObsolete();
  const types_1 = /* @__PURE__ */ requireTypes();
  const utils_1 = /* @__PURE__ */ requireUtils();
  const version_1 = /* @__PURE__ */ requireVersion();
  const supportedVersions = [">=0.5.5 <1"];
  class AmqplibInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, { ...types_1.DEFAULT_CONFIG, ...config });
    }
    setConfig(config = {}) {
      super.setConfig({ ...types_1.DEFAULT_CONFIG, ...config });
    }
    init() {
      const channelModelModuleFile = new instrumentation_1.InstrumentationNodeModuleFile("amqplib/lib/channel_model.js", supportedVersions, this.patchChannelModel.bind(this), this.unpatchChannelModel.bind(this));
      const callbackModelModuleFile = new instrumentation_1.InstrumentationNodeModuleFile("amqplib/lib/callback_model.js", supportedVersions, this.patchChannelModel.bind(this), this.unpatchChannelModel.bind(this));
      const connectModuleFile = new instrumentation_1.InstrumentationNodeModuleFile("amqplib/lib/connect.js", supportedVersions, this.patchConnect.bind(this), this.unpatchConnect.bind(this));
      const module = new instrumentation_1.InstrumentationNodeModuleDefinition("amqplib", supportedVersions, void 0, void 0, [channelModelModuleFile, connectModuleFile, callbackModelModuleFile]);
      return module;
    }
    patchConnect(moduleExports) {
      moduleExports = this.unpatchConnect(moduleExports);
      if (!(0, instrumentation_1.isWrapped)(moduleExports.connect)) {
        this._wrap(moduleExports, "connect", this.getConnectPatch.bind(this));
      }
      return moduleExports;
    }
    unpatchConnect(moduleExports) {
      if ((0, instrumentation_1.isWrapped)(moduleExports.connect)) {
        this._unwrap(moduleExports, "connect");
      }
      return moduleExports;
    }
    patchChannelModel(moduleExports, moduleVersion) {
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.publish)) {
        this._wrap(moduleExports.Channel.prototype, "publish", this.getPublishPatch.bind(this, moduleVersion));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.consume)) {
        this._wrap(moduleExports.Channel.prototype, "consume", this.getConsumePatch.bind(this, moduleVersion));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ack)) {
        this._wrap(moduleExports.Channel.prototype, "ack", this.getAckPatch.bind(this, false, types_1.EndOperation.Ack));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nack)) {
        this._wrap(moduleExports.Channel.prototype, "nack", this.getAckPatch.bind(this, true, types_1.EndOperation.Nack));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.reject)) {
        this._wrap(moduleExports.Channel.prototype, "reject", this.getAckPatch.bind(this, true, types_1.EndOperation.Reject));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ackAll)) {
        this._wrap(moduleExports.Channel.prototype, "ackAll", this.getAckAllPatch.bind(this, false, types_1.EndOperation.AckAll));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nackAll)) {
        this._wrap(moduleExports.Channel.prototype, "nackAll", this.getAckAllPatch.bind(this, true, types_1.EndOperation.NackAll));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.emit)) {
        this._wrap(moduleExports.Channel.prototype, "emit", this.getChannelEmitPatch.bind(this));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.ConfirmChannel.prototype.publish)) {
        this._wrap(moduleExports.ConfirmChannel.prototype, "publish", this.getConfirmedPublishPatch.bind(this, moduleVersion));
      }
      return moduleExports;
    }
    unpatchChannelModel(moduleExports) {
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.publish)) {
        this._unwrap(moduleExports.Channel.prototype, "publish");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.consume)) {
        this._unwrap(moduleExports.Channel.prototype, "consume");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ack)) {
        this._unwrap(moduleExports.Channel.prototype, "ack");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nack)) {
        this._unwrap(moduleExports.Channel.prototype, "nack");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.reject)) {
        this._unwrap(moduleExports.Channel.prototype, "reject");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ackAll)) {
        this._unwrap(moduleExports.Channel.prototype, "ackAll");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nackAll)) {
        this._unwrap(moduleExports.Channel.prototype, "nackAll");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.emit)) {
        this._unwrap(moduleExports.Channel.prototype, "emit");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.ConfirmChannel.prototype.publish)) {
        this._unwrap(moduleExports.ConfirmChannel.prototype, "publish");
      }
      return moduleExports;
    }
    getConnectPatch(original) {
      return function patchedConnect(url, socketOptions, openCallback) {
        return original.call(this, url, socketOptions, function(err, conn) {
          if (err == null) {
            const urlAttributes = (0, utils_1.getConnectionAttributesFromUrl)(url);
            const serverAttributes = (0, utils_1.getConnectionAttributesFromServer)(conn);
            conn[utils_1.CONNECTION_ATTRIBUTES] = {
              ...urlAttributes,
              ...serverAttributes
            };
          }
          openCallback.apply(this, arguments);
        });
      };
    }
    getChannelEmitPatch(original) {
      const self = this;
      return function emit(eventName) {
        if (eventName === "close") {
          self.endAllSpansOnChannel(this, true, types_1.EndOperation.ChannelClosed, void 0);
          const activeTimer = this[utils_1.CHANNEL_CONSUME_TIMEOUT_TIMER];
          if (activeTimer) {
            clearInterval(activeTimer);
          }
          this[utils_1.CHANNEL_CONSUME_TIMEOUT_TIMER] = void 0;
        } else if (eventName === "error") {
          self.endAllSpansOnChannel(this, true, types_1.EndOperation.ChannelError, void 0);
        }
        return original.apply(this, arguments);
      };
    }
    getAckAllPatch(isRejected, endOperation, original) {
      const self = this;
      return function ackAll(requeueOrEmpty) {
        self.endAllSpansOnChannel(this, isRejected, endOperation, requeueOrEmpty);
        return original.apply(this, arguments);
      };
    }
    getAckPatch(isRejected, endOperation, original) {
      const self = this;
      return function ack(message, allUpToOrRequeue, requeue) {
        const channel = this;
        const requeueResolved = endOperation === types_1.EndOperation.Reject ? allUpToOrRequeue : requeue;
        const spansNotEnded = channel[utils_1.CHANNEL_SPANS_NOT_ENDED] ?? [];
        const msgIndex = spansNotEnded.findIndex((msgDetails) => msgDetails.msg === message);
        if (msgIndex < 0) {
          self.endConsumerSpan(message, isRejected, endOperation, requeueResolved);
        } else if (endOperation !== types_1.EndOperation.Reject && allUpToOrRequeue) {
          for (let i = 0; i <= msgIndex; i++) {
            self.endConsumerSpan(spansNotEnded[i].msg, isRejected, endOperation, requeueResolved);
          }
          spansNotEnded.splice(0, msgIndex + 1);
        } else {
          self.endConsumerSpan(message, isRejected, endOperation, requeueResolved);
          spansNotEnded.splice(msgIndex, 1);
        }
        return original.apply(this, arguments);
      };
    }
    getConsumePatch(moduleVersion, original) {
      const self = this;
      return function consume(queue, onMessage, options) {
        const channel = this;
        if (!Object.prototype.hasOwnProperty.call(channel, utils_1.CHANNEL_SPANS_NOT_ENDED)) {
          const { consumeTimeoutMs } = self.getConfig();
          if (consumeTimeoutMs) {
            const timer = setInterval(() => {
              self.checkConsumeTimeoutOnChannel(channel);
            }, consumeTimeoutMs);
            timer.unref();
            channel[utils_1.CHANNEL_CONSUME_TIMEOUT_TIMER] = timer;
          }
          channel[utils_1.CHANNEL_SPANS_NOT_ENDED] = [];
        }
        const patchedOnMessage = function(msg) {
          if (!msg) {
            return onMessage.call(this, msg);
          }
          const headers = msg.properties.headers ?? {};
          let parentContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, headers);
          const exchange = msg.fields?.exchange;
          let links;
          if (self._config.useLinksForConsume) {
            const parentSpanContext = parentContext ? api_1.trace.getSpan(parentContext)?.spanContext() : void 0;
            parentContext = void 0;
            if (parentSpanContext) {
              links = [
                {
                  context: parentSpanContext
                }
              ];
            }
          }
          const span = self.tracer.startSpan(`${queue} process`, {
            kind: api_1.SpanKind.CONSUMER,
            attributes: {
              ...channel?.connection?.[utils_1.CONNECTION_ATTRIBUTES],
              [semconv_obsolete_1.ATTR_MESSAGING_DESTINATION]: exchange,
              [semconv_obsolete_1.ATTR_MESSAGING_DESTINATION_KIND]: semconv_obsolete_1.MESSAGING_DESTINATION_KIND_VALUE_TOPIC,
              [semconv_obsolete_1.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY]: msg.fields?.routingKey,
              [semconv_1.ATTR_MESSAGING_OPERATION]: semconv_obsolete_1.MESSAGING_OPERATION_VALUE_PROCESS,
              [semconv_obsolete_1.OLD_ATTR_MESSAGING_MESSAGE_ID]: msg?.properties.messageId,
              [semconv_obsolete_1.ATTR_MESSAGING_CONVERSATION_ID]: msg?.properties.correlationId
            },
            links
          }, parentContext);
          const { consumeHook } = self.getConfig();
          if (consumeHook) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(() => consumeHook(span, { moduleVersion, msg }), (e) => {
              if (e) {
                api_1.diag.error("amqplib instrumentation: consumerHook error", e);
              }
            }, true);
          }
          if (!options?.noAck) {
            channel[utils_1.CHANNEL_SPANS_NOT_ENDED].push({
              msg,
              timeOfConsume: (0, core_1.hrTime)()
            });
            msg[utils_1.MESSAGE_STORED_SPAN] = span;
          }
          const setContext = parentContext ? parentContext : api_1.ROOT_CONTEXT;
          api_1.context.with(api_1.trace.setSpan(setContext, span), () => {
            onMessage.call(this, msg);
          });
          if (options?.noAck) {
            self.callConsumeEndHook(span, msg, false, types_1.EndOperation.AutoAck);
            span.end();
          }
        };
        arguments[1] = patchedOnMessage;
        return original.apply(this, arguments);
      };
    }
    getConfirmedPublishPatch(moduleVersion, original) {
      const self = this;
      return function confirmedPublish(exchange, routingKey, content, options, callback) {
        const channel = this;
        const { span, modifiedOptions } = self.createPublishSpan(self, exchange, routingKey, channel, options);
        const { publishHook } = self.getConfig();
        if (publishHook) {
          (0, instrumentation_1.safeExecuteInTheMiddle)(() => publishHook(span, {
            moduleVersion,
            exchange,
            routingKey,
            content,
            options: modifiedOptions,
            isConfirmChannel: true
          }), (e) => {
            if (e) {
              api_1.diag.error("amqplib instrumentation: publishHook error", e);
            }
          }, true);
        }
        const patchedOnConfirm = function(err, ok) {
          try {
            callback?.call(this, err, ok);
          } finally {
            const { publishConfirmHook } = self.getConfig();
            if (publishConfirmHook) {
              (0, instrumentation_1.safeExecuteInTheMiddle)(() => publishConfirmHook(span, {
                moduleVersion,
                exchange,
                routingKey,
                content,
                options,
                isConfirmChannel: true,
                confirmError: err
              }), (e) => {
                if (e) {
                  api_1.diag.error("amqplib instrumentation: publishConfirmHook error", e);
                }
              }, true);
            }
            if (err) {
              span.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: "message confirmation has been nack'ed"
              });
            }
            span.end();
          }
        };
        const markedContext = (0, utils_1.markConfirmChannelTracing)(api_1.context.active());
        const argumentsCopy = [...arguments];
        argumentsCopy[3] = modifiedOptions;
        argumentsCopy[4] = api_1.context.bind((0, utils_1.unmarkConfirmChannelTracing)(api_1.trace.setSpan(markedContext, span)), patchedOnConfirm);
        return api_1.context.with(markedContext, original.bind(this, ...argumentsCopy));
      };
    }
    getPublishPatch(moduleVersion, original) {
      const self = this;
      return function publish(exchange, routingKey, content, options) {
        if ((0, utils_1.isConfirmChannelTracing)(api_1.context.active())) {
          return original.apply(this, arguments);
        } else {
          const channel = this;
          const { span, modifiedOptions } = self.createPublishSpan(self, exchange, routingKey, channel, options);
          const { publishHook } = self.getConfig();
          if (publishHook) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(() => publishHook(span, {
              moduleVersion,
              exchange,
              routingKey,
              content,
              options: modifiedOptions,
              isConfirmChannel: false
            }), (e) => {
              if (e) {
                api_1.diag.error("amqplib instrumentation: publishHook error", e);
              }
            }, true);
          }
          const argumentsCopy = [...arguments];
          argumentsCopy[3] = modifiedOptions;
          const originalRes = original.apply(this, argumentsCopy);
          span.end();
          return originalRes;
        }
      };
    }
    createPublishSpan(self, exchange, routingKey, channel, options) {
      const normalizedExchange = (0, utils_1.normalizeExchange)(exchange);
      const span = self.tracer.startSpan(`publish ${normalizedExchange}`, {
        kind: api_1.SpanKind.PRODUCER,
        attributes: {
          ...channel.connection[utils_1.CONNECTION_ATTRIBUTES],
          [semconv_obsolete_1.ATTR_MESSAGING_DESTINATION]: exchange,
          [semconv_obsolete_1.ATTR_MESSAGING_DESTINATION_KIND]: semconv_obsolete_1.MESSAGING_DESTINATION_KIND_VALUE_TOPIC,
          [semconv_obsolete_1.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY]: routingKey,
          [semconv_obsolete_1.OLD_ATTR_MESSAGING_MESSAGE_ID]: options?.messageId,
          [semconv_obsolete_1.ATTR_MESSAGING_CONVERSATION_ID]: options?.correlationId
        }
      });
      const modifiedOptions = options ?? {};
      modifiedOptions.headers = modifiedOptions.headers ?? {};
      api_1.propagation.inject(api_1.trace.setSpan(api_1.context.active(), span), modifiedOptions.headers);
      return { span, modifiedOptions };
    }
    endConsumerSpan(message, isRejected, operation, requeue) {
      const storedSpan = message[utils_1.MESSAGE_STORED_SPAN];
      if (!storedSpan)
        return;
      if (isRejected !== false) {
        storedSpan.setStatus({
          code: api_1.SpanStatusCode.ERROR,
          message: operation !== types_1.EndOperation.ChannelClosed && operation !== types_1.EndOperation.ChannelError ? `${operation} called on message${requeue === true ? " with requeue" : requeue === false ? " without requeue" : ""}` : operation
        });
      }
      this.callConsumeEndHook(storedSpan, message, isRejected, operation);
      storedSpan.end();
      message[utils_1.MESSAGE_STORED_SPAN] = void 0;
    }
    endAllSpansOnChannel(channel, isRejected, operation, requeue) {
      const spansNotEnded = channel[utils_1.CHANNEL_SPANS_NOT_ENDED] ?? [];
      spansNotEnded.forEach((msgDetails) => {
        this.endConsumerSpan(msgDetails.msg, isRejected, operation, requeue);
      });
      channel[utils_1.CHANNEL_SPANS_NOT_ENDED] = [];
    }
    callConsumeEndHook(span, msg, rejected, endOperation) {
      const { consumeEndHook } = this.getConfig();
      if (!consumeEndHook)
        return;
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => consumeEndHook(span, { msg, rejected, endOperation }), (e) => {
        if (e) {
          api_1.diag.error("amqplib instrumentation: consumerEndHook error", e);
        }
      }, true);
    }
    checkConsumeTimeoutOnChannel(channel) {
      const currentTime = (0, core_1.hrTime)();
      const spansNotEnded = channel[utils_1.CHANNEL_SPANS_NOT_ENDED] ?? [];
      let i;
      const { consumeTimeoutMs } = this.getConfig();
      for (i = 0; i < spansNotEnded.length; i++) {
        const currMessage = spansNotEnded[i];
        const timeFromConsume = (0, core_1.hrTimeDuration)(currMessage.timeOfConsume, currentTime);
        if ((0, core_1.hrTimeToMilliseconds)(timeFromConsume) < consumeTimeoutMs) {
          break;
        }
        this.endConsumerSpan(currMessage.msg, null, types_1.EndOperation.InstrumentationTimeout, true);
      }
      spansNotEnded.splice(0, i);
    }
  }
  amqplib.AmqplibInstrumentation = AmqplibInstrumentation;
  return amqplib;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.EndOperation = exports$1.DEFAULT_CONFIG = exports$1.AmqplibInstrumentation = void 0;
    var amqplib_1 = /* @__PURE__ */ requireAmqplib();
    Object.defineProperty(exports$1, "AmqplibInstrumentation", { enumerable: true, get: function() {
      return amqplib_1.AmqplibInstrumentation;
    } });
    var types_1 = /* @__PURE__ */ requireTypes();
    Object.defineProperty(exports$1, "DEFAULT_CONFIG", { enumerable: true, get: function() {
      return types_1.DEFAULT_CONFIG;
    } });
    Object.defineProperty(exports$1, "EndOperation", { enumerable: true, get: function() {
      return types_1.EndOperation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
