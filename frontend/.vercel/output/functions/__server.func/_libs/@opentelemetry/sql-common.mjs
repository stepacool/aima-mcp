import { r as require$$0 } from "./api.mjs";
import { r as require$$1 } from "./core.mjs";
var src = {};
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  Object.defineProperty(src, "__esModule", { value: true });
  src.addSqlCommenterComment = void 0;
  const api_1 = require$$0;
  const core_1 = require$$1;
  function hasValidSqlComment(query) {
    const indexOpeningDashDashComment = query.indexOf("--");
    if (indexOpeningDashDashComment >= 0) {
      return true;
    }
    const indexOpeningSlashComment = query.indexOf("/*");
    if (indexOpeningSlashComment < 0) {
      return false;
    }
    const indexClosingSlashComment = query.indexOf("*/");
    return indexOpeningDashDashComment < indexClosingSlashComment;
  }
  function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  }
  function addSqlCommenterComment(span, query) {
    if (typeof query !== "string" || query.length === 0) {
      return query;
    }
    if (hasValidSqlComment(query)) {
      return query;
    }
    const propagator = new core_1.W3CTraceContextPropagator();
    const headers = {};
    propagator.inject(api_1.trace.setSpan(api_1.ROOT_CONTEXT, span), headers, api_1.defaultTextMapSetter);
    const sortedKeys = Object.keys(headers).sort();
    if (sortedKeys.length === 0) {
      return query;
    }
    const commentString = sortedKeys.map((key) => {
      const encodedValue = fixedEncodeURIComponent(headers[key]);
      return `${key}='${encodedValue}'`;
    }).join(",");
    return `${query} /*${commentString}*/`;
  }
  src.addSqlCommenterComment = addSqlCommenterComment;
  return src;
}
export {
  requireSrc as r
};
