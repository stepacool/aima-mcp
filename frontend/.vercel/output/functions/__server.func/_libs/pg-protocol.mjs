import { a as getDefaultExportFromCjs, g as getAugmentedNamespace } from "./@apm-js-collab/code-transformer.mjs";
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: function() {
                return e[k];
              }
            });
          }
        }
      }
    }
  }
  return Object.freeze(n);
}
var dist = {};
var messages = {};
var hasRequiredMessages;
function requireMessages() {
  if (hasRequiredMessages) return messages;
  hasRequiredMessages = 1;
  Object.defineProperty(messages, "__esModule", { value: true });
  messages.NoticeMessage = messages.DataRowMessage = messages.CommandCompleteMessage = messages.ReadyForQueryMessage = messages.NotificationResponseMessage = messages.BackendKeyDataMessage = messages.AuthenticationMD5Password = messages.ParameterStatusMessage = messages.ParameterDescriptionMessage = messages.RowDescriptionMessage = messages.Field = messages.CopyResponse = messages.CopyDataMessage = messages.DatabaseError = messages.copyDone = messages.emptyQuery = messages.replicationStart = messages.portalSuspended = messages.noData = messages.closeComplete = messages.bindComplete = messages.parseComplete = void 0;
  messages.parseComplete = {
    name: "parseComplete",
    length: 5
  };
  messages.bindComplete = {
    name: "bindComplete",
    length: 5
  };
  messages.closeComplete = {
    name: "closeComplete",
    length: 5
  };
  messages.noData = {
    name: "noData",
    length: 5
  };
  messages.portalSuspended = {
    name: "portalSuspended",
    length: 5
  };
  messages.replicationStart = {
    name: "replicationStart",
    length: 4
  };
  messages.emptyQuery = {
    name: "emptyQuery",
    length: 4
  };
  messages.copyDone = {
    name: "copyDone",
    length: 4
  };
  class DatabaseError2 extends Error {
    constructor(message, length, name) {
      super(message);
      this.length = length;
      this.name = name;
    }
  }
  messages.DatabaseError = DatabaseError2;
  class CopyDataMessage {
    constructor(length, chunk) {
      this.length = length;
      this.chunk = chunk;
      this.name = "copyData";
    }
  }
  messages.CopyDataMessage = CopyDataMessage;
  class CopyResponse {
    constructor(length, name, binary, columnCount) {
      this.length = length;
      this.name = name;
      this.binary = binary;
      this.columnTypes = new Array(columnCount);
    }
  }
  messages.CopyResponse = CopyResponse;
  class Field {
    constructor(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
      this.name = name;
      this.tableID = tableID;
      this.columnID = columnID;
      this.dataTypeID = dataTypeID;
      this.dataTypeSize = dataTypeSize;
      this.dataTypeModifier = dataTypeModifier;
      this.format = format;
    }
  }
  messages.Field = Field;
  class RowDescriptionMessage {
    constructor(length, fieldCount) {
      this.length = length;
      this.fieldCount = fieldCount;
      this.name = "rowDescription";
      this.fields = new Array(this.fieldCount);
    }
  }
  messages.RowDescriptionMessage = RowDescriptionMessage;
  class ParameterDescriptionMessage {
    constructor(length, parameterCount) {
      this.length = length;
      this.parameterCount = parameterCount;
      this.name = "parameterDescription";
      this.dataTypeIDs = new Array(this.parameterCount);
    }
  }
  messages.ParameterDescriptionMessage = ParameterDescriptionMessage;
  class ParameterStatusMessage {
    constructor(length, parameterName, parameterValue) {
      this.length = length;
      this.parameterName = parameterName;
      this.parameterValue = parameterValue;
      this.name = "parameterStatus";
    }
  }
  messages.ParameterStatusMessage = ParameterStatusMessage;
  class AuthenticationMD5Password {
    constructor(length, salt) {
      this.length = length;
      this.salt = salt;
      this.name = "authenticationMD5Password";
    }
  }
  messages.AuthenticationMD5Password = AuthenticationMD5Password;
  class BackendKeyDataMessage {
    constructor(length, processID, secretKey) {
      this.length = length;
      this.processID = processID;
      this.secretKey = secretKey;
      this.name = "backendKeyData";
    }
  }
  messages.BackendKeyDataMessage = BackendKeyDataMessage;
  class NotificationResponseMessage {
    constructor(length, processId, channel, payload) {
      this.length = length;
      this.processId = processId;
      this.channel = channel;
      this.payload = payload;
      this.name = "notification";
    }
  }
  messages.NotificationResponseMessage = NotificationResponseMessage;
  class ReadyForQueryMessage {
    constructor(length, status) {
      this.length = length;
      this.status = status;
      this.name = "readyForQuery";
    }
  }
  messages.ReadyForQueryMessage = ReadyForQueryMessage;
  class CommandCompleteMessage {
    constructor(length, text) {
      this.length = length;
      this.text = text;
      this.name = "commandComplete";
    }
  }
  messages.CommandCompleteMessage = CommandCompleteMessage;
  class DataRowMessage {
    constructor(length, fields) {
      this.length = length;
      this.fields = fields;
      this.name = "dataRow";
      this.fieldCount = fields.length;
    }
  }
  messages.DataRowMessage = DataRowMessage;
  class NoticeMessage {
    constructor(length, message) {
      this.length = length;
      this.message = message;
      this.name = "notice";
    }
  }
  messages.NoticeMessage = NoticeMessage;
  return messages;
}
var serializer = {};
var bufferWriter = {};
var hasRequiredBufferWriter;
function requireBufferWriter() {
  if (hasRequiredBufferWriter) return bufferWriter;
  hasRequiredBufferWriter = 1;
  Object.defineProperty(bufferWriter, "__esModule", { value: true });
  bufferWriter.Writer = void 0;
  class Writer {
    constructor(size = 256) {
      this.size = size;
      this.offset = 5;
      this.headerPosition = 0;
      this.buffer = Buffer.allocUnsafe(size);
    }
    ensure(size) {
      const remaining = this.buffer.length - this.offset;
      if (remaining < size) {
        const oldBuffer = this.buffer;
        const newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
        this.buffer = Buffer.allocUnsafe(newSize);
        oldBuffer.copy(this.buffer);
      }
    }
    addInt32(num) {
      this.ensure(4);
      this.buffer[this.offset++] = num >>> 24 & 255;
      this.buffer[this.offset++] = num >>> 16 & 255;
      this.buffer[this.offset++] = num >>> 8 & 255;
      this.buffer[this.offset++] = num >>> 0 & 255;
      return this;
    }
    addInt16(num) {
      this.ensure(2);
      this.buffer[this.offset++] = num >>> 8 & 255;
      this.buffer[this.offset++] = num >>> 0 & 255;
      return this;
    }
    addCString(string) {
      if (!string) {
        this.ensure(1);
      } else {
        const len = Buffer.byteLength(string);
        this.ensure(len + 1);
        this.buffer.write(string, this.offset, "utf-8");
        this.offset += len;
      }
      this.buffer[this.offset++] = 0;
      return this;
    }
    addString(string = "") {
      const len = Buffer.byteLength(string);
      this.ensure(len);
      this.buffer.write(string, this.offset);
      this.offset += len;
      return this;
    }
    add(otherBuffer) {
      this.ensure(otherBuffer.length);
      otherBuffer.copy(this.buffer, this.offset);
      this.offset += otherBuffer.length;
      return this;
    }
    join(code) {
      if (code) {
        this.buffer[this.headerPosition] = code;
        const length = this.offset - (this.headerPosition + 1);
        this.buffer.writeInt32BE(length, this.headerPosition + 1);
      }
      return this.buffer.slice(code ? 0 : 5, this.offset);
    }
    flush(code) {
      const result = this.join(code);
      this.offset = 5;
      this.headerPosition = 0;
      this.buffer = Buffer.allocUnsafe(this.size);
      return result;
    }
  }
  bufferWriter.Writer = Writer;
  return bufferWriter;
}
var hasRequiredSerializer;
function requireSerializer() {
  if (hasRequiredSerializer) return serializer;
  hasRequiredSerializer = 1;
  Object.defineProperty(serializer, "__esModule", { value: true });
  serializer.serialize = void 0;
  const buffer_writer_1 = /* @__PURE__ */ requireBufferWriter();
  const writer = new buffer_writer_1.Writer();
  const startup = (opts) => {
    writer.addInt16(3).addInt16(0);
    for (const key of Object.keys(opts)) {
      writer.addCString(key).addCString(opts[key]);
    }
    writer.addCString("client_encoding").addCString("UTF8");
    const bodyBuffer = writer.addCString("").flush();
    const length = bodyBuffer.length + 4;
    return new buffer_writer_1.Writer().addInt32(length).add(bodyBuffer).flush();
  };
  const requestSsl = () => {
    const response = Buffer.allocUnsafe(8);
    response.writeInt32BE(8, 0);
    response.writeInt32BE(80877103, 4);
    return response;
  };
  const password = (password2) => {
    return writer.addCString(password2).flush(
      112
      /* code.startup */
    );
  };
  const sendSASLInitialResponseMessage = function(mechanism, initialResponse) {
    writer.addCString(mechanism).addInt32(Buffer.byteLength(initialResponse)).addString(initialResponse);
    return writer.flush(
      112
      /* code.startup */
    );
  };
  const sendSCRAMClientFinalMessage = function(additionalData) {
    return writer.addString(additionalData).flush(
      112
      /* code.startup */
    );
  };
  const query = (text) => {
    return writer.addCString(text).flush(
      81
      /* code.query */
    );
  };
  const emptyArray = [];
  const parse2 = (query2) => {
    const name = query2.name || "";
    if (name.length > 63) {
      console.error("Warning! Postgres only supports 63 characters for query names.");
      console.error("You supplied %s (%s)", name, name.length);
      console.error("This can cause conflicts and silent errors executing queries");
    }
    const types = query2.types || emptyArray;
    const len = types.length;
    const buffer = writer.addCString(name).addCString(query2.text).addInt16(len);
    for (let i = 0; i < len; i++) {
      buffer.addInt32(types[i]);
    }
    return writer.flush(
      80
      /* code.parse */
    );
  };
  const paramWriter = new buffer_writer_1.Writer();
  const writeValues = function(values, valueMapper) {
    for (let i = 0; i < values.length; i++) {
      const mappedVal = valueMapper ? valueMapper(values[i], i) : values[i];
      if (mappedVal == null) {
        writer.addInt16(
          0
          /* ParamType.STRING */
        );
        paramWriter.addInt32(-1);
      } else if (mappedVal instanceof Buffer) {
        writer.addInt16(
          1
          /* ParamType.BINARY */
        );
        paramWriter.addInt32(mappedVal.length);
        paramWriter.add(mappedVal);
      } else {
        writer.addInt16(
          0
          /* ParamType.STRING */
        );
        paramWriter.addInt32(Buffer.byteLength(mappedVal));
        paramWriter.addString(mappedVal);
      }
    }
  };
  const bind = (config = {}) => {
    const portal = config.portal || "";
    const statement = config.statement || "";
    const binary = config.binary || false;
    const values = config.values || emptyArray;
    const len = values.length;
    writer.addCString(portal).addCString(statement);
    writer.addInt16(len);
    writeValues(values, config.valueMapper);
    writer.addInt16(len);
    writer.add(paramWriter.flush());
    writer.addInt16(1);
    writer.addInt16(
      binary ? 1 : 0
      /* ParamType.STRING */
    );
    return writer.flush(
      66
      /* code.bind */
    );
  };
  const emptyExecute = Buffer.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]);
  const execute = (config) => {
    if (!config || !config.portal && !config.rows) {
      return emptyExecute;
    }
    const portal = config.portal || "";
    const rows = config.rows || 0;
    const portalLength = Buffer.byteLength(portal);
    const len = 4 + portalLength + 1 + 4;
    const buff = Buffer.allocUnsafe(1 + len);
    buff[0] = 69;
    buff.writeInt32BE(len, 1);
    buff.write(portal, 5, "utf-8");
    buff[portalLength + 5] = 0;
    buff.writeUInt32BE(rows, buff.length - 4);
    return buff;
  };
  const cancel = (processID, secretKey) => {
    const buffer = Buffer.allocUnsafe(16);
    buffer.writeInt32BE(16, 0);
    buffer.writeInt16BE(1234, 4);
    buffer.writeInt16BE(5678, 6);
    buffer.writeInt32BE(processID, 8);
    buffer.writeInt32BE(secretKey, 12);
    return buffer;
  };
  const cstringMessage = (code, string) => {
    const stringLen = Buffer.byteLength(string);
    const len = 4 + stringLen + 1;
    const buffer = Buffer.allocUnsafe(1 + len);
    buffer[0] = code;
    buffer.writeInt32BE(len, 1);
    buffer.write(string, 5, "utf-8");
    buffer[len] = 0;
    return buffer;
  };
  const emptyDescribePortal = writer.addCString("P").flush(
    68
    /* code.describe */
  );
  const emptyDescribeStatement = writer.addCString("S").flush(
    68
    /* code.describe */
  );
  const describe = (msg) => {
    return msg.name ? cstringMessage(68, `${msg.type}${msg.name || ""}`) : msg.type === "P" ? emptyDescribePortal : emptyDescribeStatement;
  };
  const close = (msg) => {
    const text = `${msg.type}${msg.name || ""}`;
    return cstringMessage(67, text);
  };
  const copyData = (chunk) => {
    return writer.add(chunk).flush(
      100
      /* code.copyFromChunk */
    );
  };
  const copyFail = (message) => {
    return cstringMessage(102, message);
  };
  const codeOnlyBuffer = (code) => Buffer.from([code, 0, 0, 0, 4]);
  const flushBuffer = codeOnlyBuffer(
    72
    /* code.flush */
  );
  const syncBuffer = codeOnlyBuffer(
    83
    /* code.sync */
  );
  const endBuffer = codeOnlyBuffer(
    88
    /* code.end */
  );
  const copyDoneBuffer = codeOnlyBuffer(
    99
    /* code.copyDone */
  );
  const serialize2 = {
    startup,
    password,
    requestSsl,
    sendSASLInitialResponseMessage,
    sendSCRAMClientFinalMessage,
    query,
    parse: parse2,
    bind,
    execute,
    describe,
    close,
    flush: () => flushBuffer,
    sync: () => syncBuffer,
    end: () => endBuffer,
    copyData,
    copyDone: () => copyDoneBuffer,
    copyFail,
    cancel
  };
  serializer.serialize = serialize2;
  return serializer;
}
var parser = {};
var bufferReader = {};
var hasRequiredBufferReader;
function requireBufferReader() {
  if (hasRequiredBufferReader) return bufferReader;
  hasRequiredBufferReader = 1;
  Object.defineProperty(bufferReader, "__esModule", { value: true });
  bufferReader.BufferReader = void 0;
  const emptyBuffer = Buffer.allocUnsafe(0);
  class BufferReader {
    constructor(offset = 0) {
      this.offset = offset;
      this.buffer = emptyBuffer;
      this.encoding = "utf-8";
    }
    setBuffer(offset, buffer) {
      this.offset = offset;
      this.buffer = buffer;
    }
    int16() {
      const result = this.buffer.readInt16BE(this.offset);
      this.offset += 2;
      return result;
    }
    byte() {
      const result = this.buffer[this.offset];
      this.offset++;
      return result;
    }
    int32() {
      const result = this.buffer.readInt32BE(this.offset);
      this.offset += 4;
      return result;
    }
    uint32() {
      const result = this.buffer.readUInt32BE(this.offset);
      this.offset += 4;
      return result;
    }
    string(length) {
      const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
      this.offset += length;
      return result;
    }
    cstring() {
      const start = this.offset;
      let end = start;
      while (this.buffer[end++] !== 0) {
      }
      this.offset = end;
      return this.buffer.toString(this.encoding, start, end - 1);
    }
    bytes(length) {
      const result = this.buffer.slice(this.offset, this.offset + length);
      this.offset += length;
      return result;
    }
  }
  bufferReader.BufferReader = BufferReader;
  return bufferReader;
}
var hasRequiredParser;
function requireParser() {
  if (hasRequiredParser) return parser;
  hasRequiredParser = 1;
  Object.defineProperty(parser, "__esModule", { value: true });
  parser.Parser = void 0;
  const messages_1 = /* @__PURE__ */ requireMessages();
  const buffer_reader_1 = /* @__PURE__ */ requireBufferReader();
  const CODE_LENGTH = 1;
  const LEN_LENGTH = 4;
  const HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
  const emptyBuffer = Buffer.allocUnsafe(0);
  class Parser {
    constructor(opts) {
      this.buffer = emptyBuffer;
      this.bufferLength = 0;
      this.bufferOffset = 0;
      this.reader = new buffer_reader_1.BufferReader();
      if ((opts === null || opts === void 0 ? void 0 : opts.mode) === "binary") {
        throw new Error("Binary mode not supported yet");
      }
      this.mode = (opts === null || opts === void 0 ? void 0 : opts.mode) || "text";
    }
    parse(buffer, callback) {
      this.mergeBuffer(buffer);
      const bufferFullLength = this.bufferOffset + this.bufferLength;
      let offset = this.bufferOffset;
      while (offset + HEADER_LENGTH <= bufferFullLength) {
        const code = this.buffer[offset];
        const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
        const fullMessageLength = CODE_LENGTH + length;
        if (fullMessageLength + offset <= bufferFullLength) {
          const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
          callback(message);
          offset += fullMessageLength;
        } else {
          break;
        }
      }
      if (offset === bufferFullLength) {
        this.buffer = emptyBuffer;
        this.bufferLength = 0;
        this.bufferOffset = 0;
      } else {
        this.bufferLength = bufferFullLength - offset;
        this.bufferOffset = offset;
      }
    }
    mergeBuffer(buffer) {
      if (this.bufferLength > 0) {
        const newLength = this.bufferLength + buffer.byteLength;
        const newFullLength = newLength + this.bufferOffset;
        if (newFullLength > this.buffer.byteLength) {
          let newBuffer;
          if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
            newBuffer = this.buffer;
          } else {
            let newBufferLength = this.buffer.byteLength * 2;
            while (newLength >= newBufferLength) {
              newBufferLength *= 2;
            }
            newBuffer = Buffer.allocUnsafe(newBufferLength);
          }
          this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
          this.buffer = newBuffer;
          this.bufferOffset = 0;
        }
        buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
        this.bufferLength = newLength;
      } else {
        this.buffer = buffer;
        this.bufferOffset = 0;
        this.bufferLength = buffer.byteLength;
      }
    }
    handlePacket(offset, code, length, bytes) {
      switch (code) {
        case 50:
          return messages_1.bindComplete;
        case 49:
          return messages_1.parseComplete;
        case 51:
          return messages_1.closeComplete;
        case 110:
          return messages_1.noData;
        case 115:
          return messages_1.portalSuspended;
        case 99:
          return messages_1.copyDone;
        case 87:
          return messages_1.replicationStart;
        case 73:
          return messages_1.emptyQuery;
        case 68:
          return this.parseDataRowMessage(offset, length, bytes);
        case 67:
          return this.parseCommandCompleteMessage(offset, length, bytes);
        case 90:
          return this.parseReadyForQueryMessage(offset, length, bytes);
        case 65:
          return this.parseNotificationMessage(offset, length, bytes);
        case 82:
          return this.parseAuthenticationResponse(offset, length, bytes);
        case 83:
          return this.parseParameterStatusMessage(offset, length, bytes);
        case 75:
          return this.parseBackendKeyData(offset, length, bytes);
        case 69:
          return this.parseErrorMessage(offset, length, bytes, "error");
        case 78:
          return this.parseErrorMessage(offset, length, bytes, "notice");
        case 84:
          return this.parseRowDescriptionMessage(offset, length, bytes);
        case 116:
          return this.parseParameterDescriptionMessage(offset, length, bytes);
        case 71:
          return this.parseCopyInMessage(offset, length, bytes);
        case 72:
          return this.parseCopyOutMessage(offset, length, bytes);
        case 100:
          return this.parseCopyData(offset, length, bytes);
        default:
          return new messages_1.DatabaseError("received invalid response: " + code.toString(16), length, "error");
      }
    }
    parseReadyForQueryMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const status = this.reader.string(1);
      return new messages_1.ReadyForQueryMessage(length, status);
    }
    parseCommandCompleteMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const text = this.reader.cstring();
      return new messages_1.CommandCompleteMessage(length, text);
    }
    parseCopyData(offset, length, bytes) {
      const chunk = bytes.slice(offset, offset + (length - 4));
      return new messages_1.CopyDataMessage(length, chunk);
    }
    parseCopyInMessage(offset, length, bytes) {
      return this.parseCopyMessage(offset, length, bytes, "copyInResponse");
    }
    parseCopyOutMessage(offset, length, bytes) {
      return this.parseCopyMessage(offset, length, bytes, "copyOutResponse");
    }
    parseCopyMessage(offset, length, bytes, messageName) {
      this.reader.setBuffer(offset, bytes);
      const isBinary = this.reader.byte() !== 0;
      const columnCount = this.reader.int16();
      const message = new messages_1.CopyResponse(length, messageName, isBinary, columnCount);
      for (let i = 0; i < columnCount; i++) {
        message.columnTypes[i] = this.reader.int16();
      }
      return message;
    }
    parseNotificationMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const processId = this.reader.int32();
      const channel = this.reader.cstring();
      const payload = this.reader.cstring();
      return new messages_1.NotificationResponseMessage(length, processId, channel, payload);
    }
    parseRowDescriptionMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const fieldCount = this.reader.int16();
      const message = new messages_1.RowDescriptionMessage(length, fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        message.fields[i] = this.parseField();
      }
      return message;
    }
    parseField() {
      const name = this.reader.cstring();
      const tableID = this.reader.uint32();
      const columnID = this.reader.int16();
      const dataTypeID = this.reader.uint32();
      const dataTypeSize = this.reader.int16();
      const dataTypeModifier = this.reader.int32();
      const mode = this.reader.int16() === 0 ? "text" : "binary";
      return new messages_1.Field(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
    }
    parseParameterDescriptionMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const parameterCount = this.reader.int16();
      const message = new messages_1.ParameterDescriptionMessage(length, parameterCount);
      for (let i = 0; i < parameterCount; i++) {
        message.dataTypeIDs[i] = this.reader.int32();
      }
      return message;
    }
    parseDataRowMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const fieldCount = this.reader.int16();
      const fields = new Array(fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        const len = this.reader.int32();
        fields[i] = len === -1 ? null : this.reader.string(len);
      }
      return new messages_1.DataRowMessage(length, fields);
    }
    parseParameterStatusMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const name = this.reader.cstring();
      const value = this.reader.cstring();
      return new messages_1.ParameterStatusMessage(length, name, value);
    }
    parseBackendKeyData(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const processID = this.reader.int32();
      const secretKey = this.reader.int32();
      return new messages_1.BackendKeyDataMessage(length, processID, secretKey);
    }
    parseAuthenticationResponse(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const code = this.reader.int32();
      const message = {
        name: "authenticationOk",
        length
      };
      switch (code) {
        case 0:
          break;
        case 3:
          if (message.length === 8) {
            message.name = "authenticationCleartextPassword";
          }
          break;
        case 5:
          if (message.length === 12) {
            message.name = "authenticationMD5Password";
            const salt = this.reader.bytes(4);
            return new messages_1.AuthenticationMD5Password(length, salt);
          }
          break;
        case 10:
          {
            message.name = "authenticationSASL";
            message.mechanisms = [];
            let mechanism;
            do {
              mechanism = this.reader.cstring();
              if (mechanism) {
                message.mechanisms.push(mechanism);
              }
            } while (mechanism);
          }
          break;
        case 11:
          message.name = "authenticationSASLContinue";
          message.data = this.reader.string(length - 8);
          break;
        case 12:
          message.name = "authenticationSASLFinal";
          message.data = this.reader.string(length - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + code);
      }
      return message;
    }
    parseErrorMessage(offset, length, bytes, name) {
      this.reader.setBuffer(offset, bytes);
      const fields = {};
      let fieldType = this.reader.string(1);
      while (fieldType !== "\0") {
        fields[fieldType] = this.reader.cstring();
        fieldType = this.reader.string(1);
      }
      const messageValue = fields.M;
      const message = name === "notice" ? new messages_1.NoticeMessage(length, messageValue) : new messages_1.DatabaseError(messageValue, length, name);
      message.severity = fields.S;
      message.code = fields.C;
      message.detail = fields.D;
      message.hint = fields.H;
      message.position = fields.P;
      message.internalPosition = fields.p;
      message.internalQuery = fields.q;
      message.where = fields.W;
      message.schema = fields.s;
      message.table = fields.t;
      message.column = fields.c;
      message.dataType = fields.d;
      message.constraint = fields.n;
      message.file = fields.F;
      message.line = fields.L;
      message.routine = fields.R;
      return message;
    }
  }
  parser.Parser = Parser;
  return parser;
}
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) return dist;
  hasRequiredDist = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.DatabaseError = exports$1.serialize = exports$1.parse = void 0;
    const messages_1 = /* @__PURE__ */ requireMessages();
    Object.defineProperty(exports$1, "DatabaseError", { enumerable: true, get: function() {
      return messages_1.DatabaseError;
    } });
    const serializer_1 = /* @__PURE__ */ requireSerializer();
    Object.defineProperty(exports$1, "serialize", { enumerable: true, get: function() {
      return serializer_1.serialize;
    } });
    const parser_1 = /* @__PURE__ */ requireParser();
    function parse2(stream, callback) {
      const parser2 = new parser_1.Parser();
      stream.on("data", (buffer) => parser2.parse(buffer, callback));
      return new Promise((resolve) => stream.on("end", () => resolve()));
    }
    exports$1.parse = parse2;
  })(dist);
  return dist;
}
var distExports = /* @__PURE__ */ requireDist();
const index = /* @__PURE__ */ getDefaultExportFromCjs(distExports);
const protocol = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: index
}, [distExports]);
const DatabaseError = distExports.DatabaseError;
const SASL = distExports.SASL;
const serialize = distExports.serialize;
const parse = distExports.parse;
const esm = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  DatabaseError,
  SASL,
  default: protocol,
  parse,
  serialize
});
const require$$7 = /* @__PURE__ */ getAugmentedNamespace(esm);
export {
  require$$7 as r
};
