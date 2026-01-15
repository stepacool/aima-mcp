import { r as require$$0 } from "./api.mjs";
import { r as require$$2 } from "./instrumentation.mjs";
import { r as require$$5 } from "./semantic-conventions.mjs";
var src = {};
var instrumentation = {};
var internalTypes = {};
var hasRequiredInternalTypes;
function requireInternalTypes() {
  if (hasRequiredInternalTypes) return internalTypes;
  hasRequiredInternalTypes = 1;
  Object.defineProperty(internalTypes, "__esModule", { value: true });
  internalTypes.EVENT_LISTENERS_SET = void 0;
  internalTypes.EVENT_LISTENERS_SET = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.kafkajs.eventListenersSet");
  return internalTypes;
}
var propagator = {};
var hasRequiredPropagator;
function requirePropagator() {
  if (hasRequiredPropagator) return propagator;
  hasRequiredPropagator = 1;
  Object.defineProperty(propagator, "__esModule", { value: true });
  propagator.bufferTextMapGetter = void 0;
  propagator.bufferTextMapGetter = {
    get(carrier, key) {
      if (!carrier) {
        return void 0;
      }
      const keys = Object.keys(carrier);
      for (const carrierKey of keys) {
        if (carrierKey === key || carrierKey.toLowerCase() === key) {
          return carrier[carrierKey]?.toString();
        }
      }
      return void 0;
    },
    keys(carrier) {
      return carrier ? Object.keys(carrier) : [];
    }
  };
  return propagator;
}
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.METRIC_MESSAGING_PROCESS_DURATION = semconv.METRIC_MESSAGING_CLIENT_SENT_MESSAGES = semconv.METRIC_MESSAGING_CLIENT_OPERATION_DURATION = semconv.METRIC_MESSAGING_CLIENT_CONSUMED_MESSAGES = semconv.MESSAGING_SYSTEM_VALUE_KAFKA = semconv.MESSAGING_OPERATION_TYPE_VALUE_SEND = semconv.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE = semconv.MESSAGING_OPERATION_TYPE_VALUE_PROCESS = semconv.ATTR_MESSAGING_SYSTEM = semconv.ATTR_MESSAGING_OPERATION_TYPE = semconv.ATTR_MESSAGING_OPERATION_NAME = semconv.ATTR_MESSAGING_KAFKA_OFFSET = semconv.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE = semconv.ATTR_MESSAGING_KAFKA_MESSAGE_KEY = semconv.ATTR_MESSAGING_DESTINATION_PARTITION_ID = semconv.ATTR_MESSAGING_DESTINATION_NAME = semconv.ATTR_MESSAGING_BATCH_MESSAGE_COUNT = void 0;
  semconv.ATTR_MESSAGING_BATCH_MESSAGE_COUNT = "messaging.batch.message_count";
  semconv.ATTR_MESSAGING_DESTINATION_NAME = "messaging.destination.name";
  semconv.ATTR_MESSAGING_DESTINATION_PARTITION_ID = "messaging.destination.partition.id";
  semconv.ATTR_MESSAGING_KAFKA_MESSAGE_KEY = "messaging.kafka.message.key";
  semconv.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE = "messaging.kafka.message.tombstone";
  semconv.ATTR_MESSAGING_KAFKA_OFFSET = "messaging.kafka.offset";
  semconv.ATTR_MESSAGING_OPERATION_NAME = "messaging.operation.name";
  semconv.ATTR_MESSAGING_OPERATION_TYPE = "messaging.operation.type";
  semconv.ATTR_MESSAGING_SYSTEM = "messaging.system";
  semconv.MESSAGING_OPERATION_TYPE_VALUE_PROCESS = "process";
  semconv.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE = "receive";
  semconv.MESSAGING_OPERATION_TYPE_VALUE_SEND = "send";
  semconv.MESSAGING_SYSTEM_VALUE_KAFKA = "kafka";
  semconv.METRIC_MESSAGING_CLIENT_CONSUMED_MESSAGES = "messaging.client.consumed.messages";
  semconv.METRIC_MESSAGING_CLIENT_OPERATION_DURATION = "messaging.client.operation.duration";
  semconv.METRIC_MESSAGING_CLIENT_SENT_MESSAGES = "messaging.client.sent.messages";
  semconv.METRIC_MESSAGING_PROCESS_DURATION = "messaging.process.duration";
  return semconv;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.18.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-kafkajs";
  return version;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.KafkaJsInstrumentation = void 0;
  const api_1 = require$$0;
  const instrumentation_1 = require$$2;
  const semantic_conventions_1 = require$$5;
  const internal_types_1 = /* @__PURE__ */ requireInternalTypes();
  const propagator_1 = /* @__PURE__ */ requirePropagator();
  const semconv_1 = /* @__PURE__ */ requireSemconv();
  const version_1 = /* @__PURE__ */ requireVersion();
  function prepareCounter(meter, value, attributes) {
    return (errorType) => {
      meter.add(value, {
        ...attributes,
        ...errorType ? { [semantic_conventions_1.ATTR_ERROR_TYPE]: errorType } : {}
      });
    };
  }
  function prepareDurationHistogram(meter, value, attributes) {
    return (errorType) => {
      meter.record((Date.now() - value) / 1e3, {
        ...attributes,
        ...errorType ? { [semantic_conventions_1.ATTR_ERROR_TYPE]: errorType } : {}
      });
    };
  }
  const HISTOGRAM_BUCKET_BOUNDARIES = [
    5e-3,
    0.01,
    0.025,
    0.05,
    0.075,
    0.1,
    0.25,
    0.5,
    0.75,
    1,
    2.5,
    5,
    7.5,
    10
  ];
  class KafkaJsInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    _updateMetricInstruments() {
      this._clientDuration = this.meter.createHistogram(semconv_1.METRIC_MESSAGING_CLIENT_OPERATION_DURATION, { advice: { explicitBucketBoundaries: HISTOGRAM_BUCKET_BOUNDARIES } });
      this._sentMessages = this.meter.createCounter(semconv_1.METRIC_MESSAGING_CLIENT_SENT_MESSAGES);
      this._consumedMessages = this.meter.createCounter(semconv_1.METRIC_MESSAGING_CLIENT_CONSUMED_MESSAGES);
      this._processDuration = this.meter.createHistogram(semconv_1.METRIC_MESSAGING_PROCESS_DURATION, { advice: { explicitBucketBoundaries: HISTOGRAM_BUCKET_BOUNDARIES } });
    }
    init() {
      const unpatch = (moduleExports) => {
        if ((0, instrumentation_1.isWrapped)(moduleExports?.Kafka?.prototype.producer)) {
          this._unwrap(moduleExports.Kafka.prototype, "producer");
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports?.Kafka?.prototype.consumer)) {
          this._unwrap(moduleExports.Kafka.prototype, "consumer");
        }
      };
      const module = new instrumentation_1.InstrumentationNodeModuleDefinition("kafkajs", [">=0.3.0 <3"], (moduleExports) => {
        unpatch(moduleExports);
        this._wrap(moduleExports?.Kafka?.prototype, "producer", this._getProducerPatch());
        this._wrap(moduleExports?.Kafka?.prototype, "consumer", this._getConsumerPatch());
        return moduleExports;
      }, unpatch);
      return module;
    }
    _getConsumerPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function consumer(...args) {
          const newConsumer = original.apply(this, args);
          if ((0, instrumentation_1.isWrapped)(newConsumer.run)) {
            instrumentation2._unwrap(newConsumer, "run");
          }
          instrumentation2._wrap(newConsumer, "run", instrumentation2._getConsumerRunPatch());
          instrumentation2._setKafkaEventListeners(newConsumer);
          return newConsumer;
        };
      };
    }
    _setKafkaEventListeners(kafkaObj) {
      if (kafkaObj[internal_types_1.EVENT_LISTENERS_SET])
        return;
      if (kafkaObj.events?.REQUEST) {
        kafkaObj.on(kafkaObj.events.REQUEST, this._recordClientDurationMetric.bind(this));
      }
      kafkaObj[internal_types_1.EVENT_LISTENERS_SET] = true;
    }
    _recordClientDurationMetric(event) {
      const [address, port] = event.payload.broker.split(":");
      this._clientDuration.record(event.payload.duration / 1e3, {
        [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
        [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: `${event.payload.apiName}`,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: address,
        [semantic_conventions_1.ATTR_SERVER_PORT]: Number.parseInt(port, 10)
      });
    }
    _getProducerPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function consumer(...args) {
          const newProducer = original.apply(this, args);
          if ((0, instrumentation_1.isWrapped)(newProducer.sendBatch)) {
            instrumentation2._unwrap(newProducer, "sendBatch");
          }
          instrumentation2._wrap(newProducer, "sendBatch", instrumentation2._getSendBatchPatch());
          if ((0, instrumentation_1.isWrapped)(newProducer.send)) {
            instrumentation2._unwrap(newProducer, "send");
          }
          instrumentation2._wrap(newProducer, "send", instrumentation2._getSendPatch());
          if ((0, instrumentation_1.isWrapped)(newProducer.transaction)) {
            instrumentation2._unwrap(newProducer, "transaction");
          }
          instrumentation2._wrap(newProducer, "transaction", instrumentation2._getProducerTransactionPatch());
          instrumentation2._setKafkaEventListeners(newProducer);
          return newProducer;
        };
      };
    }
    _getConsumerRunPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function run(...args) {
          const config = args[0];
          if (config?.eachMessage) {
            if ((0, instrumentation_1.isWrapped)(config.eachMessage)) {
              instrumentation2._unwrap(config, "eachMessage");
            }
            instrumentation2._wrap(config, "eachMessage", instrumentation2._getConsumerEachMessagePatch());
          }
          if (config?.eachBatch) {
            if ((0, instrumentation_1.isWrapped)(config.eachBatch)) {
              instrumentation2._unwrap(config, "eachBatch");
            }
            instrumentation2._wrap(config, "eachBatch", instrumentation2._getConsumerEachBatchPatch());
          }
          return original.call(this, config);
        };
      };
    }
    _getConsumerEachMessagePatch() {
      const instrumentation2 = this;
      return (original) => {
        return function eachMessage(...args) {
          const payload = args[0];
          const propagatedContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, payload.message.headers, propagator_1.bufferTextMapGetter);
          const span = instrumentation2._startConsumerSpan({
            topic: payload.topic,
            message: payload.message,
            operationType: semconv_1.MESSAGING_OPERATION_TYPE_VALUE_PROCESS,
            ctx: propagatedContext,
            attributes: {
              [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.partition)
            }
          });
          const pendingMetrics = [
            prepareDurationHistogram(instrumentation2._processDuration, Date.now(), {
              [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
              [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "process",
              [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: payload.topic,
              [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.partition)
            }),
            prepareCounter(instrumentation2._consumedMessages, 1, {
              [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
              [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "process",
              [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: payload.topic,
              [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.partition)
            })
          ];
          const eachMessagePromise = api_1.context.with(api_1.trace.setSpan(propagatedContext, span), () => {
            return original.apply(this, args);
          });
          return instrumentation2._endSpansOnPromise([span], pendingMetrics, eachMessagePromise);
        };
      };
    }
    _getConsumerEachBatchPatch() {
      return (original) => {
        const instrumentation2 = this;
        return function eachBatch(...args) {
          const payload = args[0];
          const receivingSpan = instrumentation2._startConsumerSpan({
            topic: payload.batch.topic,
            message: void 0,
            operationType: semconv_1.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE,
            ctx: api_1.ROOT_CONTEXT,
            attributes: {
              [semconv_1.ATTR_MESSAGING_BATCH_MESSAGE_COUNT]: payload.batch.messages.length,
              [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
            }
          });
          return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), receivingSpan), () => {
            const startTime = Date.now();
            const spans = [];
            const pendingMetrics = [
              prepareCounter(instrumentation2._consumedMessages, payload.batch.messages.length, {
                [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
                [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "process",
                [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: payload.batch.topic,
                [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
              })
            ];
            payload.batch.messages.forEach((message) => {
              const propagatedContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, message.headers, propagator_1.bufferTextMapGetter);
              const spanContext = api_1.trace.getSpan(propagatedContext)?.spanContext();
              let origSpanLink;
              if (spanContext) {
                origSpanLink = {
                  context: spanContext
                };
              }
              spans.push(instrumentation2._startConsumerSpan({
                topic: payload.batch.topic,
                message,
                operationType: semconv_1.MESSAGING_OPERATION_TYPE_VALUE_PROCESS,
                link: origSpanLink,
                attributes: {
                  [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
                }
              }));
              pendingMetrics.push(prepareDurationHistogram(instrumentation2._processDuration, startTime, {
                [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
                [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "process",
                [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: payload.batch.topic,
                [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
              }));
            });
            const batchMessagePromise = original.apply(this, args);
            spans.unshift(receivingSpan);
            return instrumentation2._endSpansOnPromise(spans, pendingMetrics, batchMessagePromise);
          });
        };
      };
    }
    _getProducerTransactionPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function transaction(...args) {
          const transactionSpan = instrumentation2.tracer.startSpan("transaction");
          const transactionPromise = original.apply(this, args);
          transactionPromise.then((transaction2) => {
            const originalSend = transaction2.send;
            transaction2.send = function send(...args2) {
              return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), transactionSpan), () => {
                const patched = instrumentation2._getSendPatch()(originalSend);
                return patched.apply(this, args2).catch((err) => {
                  transactionSpan.setStatus({
                    code: api_1.SpanStatusCode.ERROR,
                    message: err?.message
                  });
                  transactionSpan.recordException(err);
                  throw err;
                });
              });
            };
            const originalSendBatch = transaction2.sendBatch;
            transaction2.sendBatch = function sendBatch(...args2) {
              return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), transactionSpan), () => {
                const patched = instrumentation2._getSendBatchPatch()(originalSendBatch);
                return patched.apply(this, args2).catch((err) => {
                  transactionSpan.setStatus({
                    code: api_1.SpanStatusCode.ERROR,
                    message: err?.message
                  });
                  transactionSpan.recordException(err);
                  throw err;
                });
              });
            };
            const originalCommit = transaction2.commit;
            transaction2.commit = function commit(...args2) {
              const originCommitPromise = originalCommit.apply(this, args2).then(() => {
                transactionSpan.setStatus({ code: api_1.SpanStatusCode.OK });
              });
              return instrumentation2._endSpansOnPromise([transactionSpan], [], originCommitPromise);
            };
            const originalAbort = transaction2.abort;
            transaction2.abort = function abort(...args2) {
              const originAbortPromise = originalAbort.apply(this, args2);
              return instrumentation2._endSpansOnPromise([transactionSpan], [], originAbortPromise);
            };
          }).catch((err) => {
            transactionSpan.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: err?.message
            });
            transactionSpan.recordException(err);
            transactionSpan.end();
          });
          return transactionPromise;
        };
      };
    }
    _getSendBatchPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function sendBatch(...args) {
          const batch = args[0];
          const messages = batch.topicMessages || [];
          const spans = [];
          const pendingMetrics = [];
          messages.forEach((topicMessage) => {
            topicMessage.messages.forEach((message) => {
              spans.push(instrumentation2._startProducerSpan(topicMessage.topic, message));
              pendingMetrics.push(prepareCounter(instrumentation2._sentMessages, 1, {
                [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
                [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "send",
                [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: topicMessage.topic,
                ...message.partition !== void 0 ? {
                  [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(message.partition)
                } : {}
              }));
            });
          });
          const origSendResult = original.apply(this, args);
          return instrumentation2._endSpansOnPromise(spans, pendingMetrics, origSendResult);
        };
      };
    }
    _getSendPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function send(...args) {
          const record = args[0];
          const spans = record.messages.map((message) => {
            return instrumentation2._startProducerSpan(record.topic, message);
          });
          const pendingMetrics = record.messages.map((m) => prepareCounter(instrumentation2._sentMessages, 1, {
            [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
            [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "send",
            [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: record.topic,
            ...m.partition !== void 0 ? {
              [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(m.partition)
            } : {}
          }));
          const origSendResult = original.apply(this, args);
          return instrumentation2._endSpansOnPromise(spans, pendingMetrics, origSendResult);
        };
      };
    }
    _endSpansOnPromise(spans, pendingMetrics, sendPromise) {
      return Promise.resolve(sendPromise).then((result) => {
        pendingMetrics.forEach((m) => m());
        return result;
      }).catch((reason) => {
        let errorMessage;
        let errorType = semantic_conventions_1.ERROR_TYPE_VALUE_OTHER;
        if (typeof reason === "string" || reason === void 0) {
          errorMessage = reason;
        } else if (typeof reason === "object" && Object.prototype.hasOwnProperty.call(reason, "message")) {
          errorMessage = reason.message;
          errorType = reason.constructor.name;
        }
        pendingMetrics.forEach((m) => m(errorType));
        spans.forEach((span) => {
          span.setAttribute(semantic_conventions_1.ATTR_ERROR_TYPE, errorType);
          span.setStatus({
            code: api_1.SpanStatusCode.ERROR,
            message: errorMessage
          });
        });
        throw reason;
      }).finally(() => {
        spans.forEach((span) => span.end());
      });
    }
    _startConsumerSpan({ topic, message, operationType, ctx, link, attributes }) {
      const operationName = operationType === semconv_1.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE ? "poll" : operationType;
      const span = this.tracer.startSpan(`${operationName} ${topic}`, {
        kind: operationType === semconv_1.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE ? api_1.SpanKind.CLIENT : api_1.SpanKind.CONSUMER,
        attributes: {
          ...attributes,
          [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
          [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: topic,
          [semconv_1.ATTR_MESSAGING_OPERATION_TYPE]: operationType,
          [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: operationName,
          [semconv_1.ATTR_MESSAGING_KAFKA_MESSAGE_KEY]: message?.key ? String(message.key) : void 0,
          [semconv_1.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE]: message?.key && message.value === null ? true : void 0,
          [semconv_1.ATTR_MESSAGING_KAFKA_OFFSET]: message?.offset
        },
        links: link ? [link] : []
      }, ctx);
      const { consumerHook } = this.getConfig();
      if (consumerHook && message) {
        (0, instrumentation_1.safeExecuteInTheMiddle)(() => consumerHook(span, { topic, message }), (e) => {
          if (e)
            this._diag.error("consumerHook error", e);
        }, true);
      }
      return span;
    }
    _startProducerSpan(topic, message) {
      const span = this.tracer.startSpan(`send ${topic}`, {
        kind: api_1.SpanKind.PRODUCER,
        attributes: {
          [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
          [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: topic,
          [semconv_1.ATTR_MESSAGING_KAFKA_MESSAGE_KEY]: message.key ? String(message.key) : void 0,
          [semconv_1.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE]: message.key && message.value === null ? true : void 0,
          [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: message.partition !== void 0 ? String(message.partition) : void 0,
          [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "send",
          [semconv_1.ATTR_MESSAGING_OPERATION_TYPE]: semconv_1.MESSAGING_OPERATION_TYPE_VALUE_SEND
        }
      });
      message.headers = message.headers ?? {};
      api_1.propagation.inject(api_1.trace.setSpan(api_1.context.active(), span), message.headers);
      const { producerHook } = this.getConfig();
      if (producerHook) {
        (0, instrumentation_1.safeExecuteInTheMiddle)(() => producerHook(span, { topic, message }), (e) => {
          if (e)
            this._diag.error("producerHook error", e);
        }, true);
      }
      return span;
    }
  }
  instrumentation.KafkaJsInstrumentation = KafkaJsInstrumentation;
  return instrumentation;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.KafkaJsInstrumentation = void 0;
    var instrumentation_1 = /* @__PURE__ */ requireInstrumentation();
    Object.defineProperty(exports$1, "KafkaJsInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.KafkaJsInstrumentation;
    } });
  })(src);
  return src;
}
var srcExports = /* @__PURE__ */ requireSrc();
export {
  srcExports as s
};
