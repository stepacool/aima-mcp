import require$$0 from "util";
var error;
var hasRequiredError;
function requireError() {
  if (hasRequiredError) return error;
  hasRequiredError = 1;
  var util = require$$0;
  function ParseError(message, input) {
    Error.captureStackTrace(this, ParseError);
    this.name = this.constructor.name;
    this.message = message;
    this.input = input;
  }
  util.inherits(ParseError, Error);
  error = ParseError;
  return error;
}
var ascii;
var hasRequiredAscii;
function requireAscii() {
  if (hasRequiredAscii) return ascii;
  hasRequiredAscii = 1;
  function isDelimiter(code) {
    return code === 34 || code === 40 || code === 41 || code === 44 || code === 47 || code >= 58 && code <= 64 || code >= 91 && code <= 93 || code === 123 || code === 125;
  }
  function isTokenChar(code) {
    return code === 33 || code >= 35 && code <= 39 || code === 42 || code === 43 || code === 45 || code === 46 || code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 94 && code <= 122 || code === 124 || code === 126;
  }
  function isPrint(code) {
    return code >= 32 && code <= 126;
  }
  function isExtended(code) {
    return code >= 128 && code <= 255;
  }
  ascii = {
    isDelimiter,
    isTokenChar,
    isExtended,
    isPrint
  };
  return ascii;
}
var forwardedParse;
var hasRequiredForwardedParse;
function requireForwardedParse() {
  if (hasRequiredForwardedParse) return forwardedParse;
  hasRequiredForwardedParse = 1;
  var util = require$$0;
  var ParseError = /* @__PURE__ */ requireError();
  var ascii2 = /* @__PURE__ */ requireAscii();
  var isDelimiter = ascii2.isDelimiter;
  var isTokenChar = ascii2.isTokenChar;
  var isExtended = ascii2.isExtended;
  var isPrint = ascii2.isPrint;
  function decode(str) {
    return str.replace(/\\(.)/g, "$1");
  }
  function unexpectedCharacterMessage(header, position) {
    return util.format(
      "Unexpected character '%s' at index %d",
      header.charAt(position),
      position
    );
  }
  function parse(header) {
    var mustUnescape = false;
    var isEscaping = false;
    var inQuotes = false;
    var forwarded = {};
    var output = [];
    var start = -1;
    var end = -1;
    var parameter;
    var code;
    for (var i = 0; i < header.length; i++) {
      code = header.charCodeAt(i);
      if (parameter === void 0) {
        if (i !== 0 && start === -1 && (code === 32 || code === 9)) {
          continue;
        }
        if (isTokenChar(code)) {
          if (start === -1) start = i;
        } else if (code === 61 && start !== -1) {
          parameter = header.slice(start, i).toLowerCase();
          start = -1;
        } else {
          throw new ParseError(unexpectedCharacterMessage(header, i), header);
        }
      } else {
        if (isEscaping && (code === 9 || isPrint(code) || isExtended(code))) {
          isEscaping = false;
        } else if (isTokenChar(code)) {
          if (end !== -1) {
            throw new ParseError(unexpectedCharacterMessage(header, i), header);
          }
          if (start === -1) start = i;
        } else if (isDelimiter(code) || isExtended(code)) {
          if (inQuotes) {
            if (code === 34) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              if (start === -1) start = i;
              isEscaping = mustUnescape = true;
            } else if (start === -1) {
              start = i;
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if ((code === 44 || code === 59) && (start !== -1 || end !== -1)) {
            if (start !== -1) {
              if (end === -1) end = i;
              forwarded[parameter] = mustUnescape ? decode(header.slice(start, end)) : header.slice(start, end);
            } else {
              forwarded[parameter] = "";
            }
            if (code === 44) {
              output.push(forwarded);
              forwarded = {};
            }
            parameter = void 0;
            start = end = -1;
          } else {
            throw new ParseError(unexpectedCharacterMessage(header, i), header);
          }
        } else if (code === 32 || code === 9) {
          if (end !== -1) continue;
          if (inQuotes) {
            if (start === -1) start = i;
          } else if (start !== -1) {
            end = i;
          } else {
            throw new ParseError(unexpectedCharacterMessage(header, i), header);
          }
        } else {
          throw new ParseError(unexpectedCharacterMessage(header, i), header);
        }
      }
    }
    if (parameter === void 0 || inQuotes || start === -1 && end === -1 || code === 32 || code === 9) {
      throw new ParseError("Unexpected end of input", header);
    }
    if (start !== -1) {
      if (end === -1) end = i;
      forwarded[parameter] = mustUnescape ? decode(header.slice(start, end)) : header.slice(start, end);
    } else {
      forwarded[parameter] = "";
    }
    output.push(forwarded);
    return output;
  }
  forwardedParse = parse;
  return forwardedParse;
}
export {
  requireForwardedParse as r
};
