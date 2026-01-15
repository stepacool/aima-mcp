var src = {};
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  Object.defineProperty(src, "__esModule", { value: true });
  src.defaultDbStatementSerializer = void 0;
  const serializationSubsets = [
    {
      regex: /^ECHO/i,
      args: 0
    },
    {
      regex: /^(LPUSH|MSET|PFA|PUBLISH|RPUSH|SADD|SET|SPUBLISH|XADD|ZADD)/i,
      args: 1
    },
    {
      regex: /^(HSET|HMSET|LSET|LINSERT)/i,
      args: 2
    },
    {
      regex: /^(ACL|BIT|B[LRZ]|CLIENT|CLUSTER|CONFIG|COMMAND|DECR|DEL|EVAL|EX|FUNCTION|GEO|GET|HINCR|HMGET|HSCAN|INCR|L[TRLM]|MEMORY|P[EFISTU]|RPOP|S[CDIMORSU]|XACK|X[CDGILPRT]|Z[CDILMPRS])/i,
      args: -1
    }
  ];
  const defaultDbStatementSerializer = (cmdName, cmdArgs) => {
    if (Array.isArray(cmdArgs) && cmdArgs.length) {
      const nArgsToSerialize = serializationSubsets.find(({ regex }) => {
        return regex.test(cmdName);
      })?.args ?? 0;
      const argsToSerialize = nArgsToSerialize >= 0 ? cmdArgs.slice(0, nArgsToSerialize) : cmdArgs;
      if (cmdArgs.length > argsToSerialize.length) {
        argsToSerialize.push(`[${cmdArgs.length - nArgsToSerialize} other arguments]`);
      }
      return `${cmdName} ${argsToSerialize.join(" ")}`;
    }
    return cmdName;
  };
  src.defaultDbStatementSerializer = defaultDbStatementSerializer;
  return src;
}
export {
  requireSrc as r
};
