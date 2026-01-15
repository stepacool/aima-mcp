import path__default from "path";
var moduleDetailsFromPath;
var hasRequiredModuleDetailsFromPath;
function requireModuleDetailsFromPath() {
  if (hasRequiredModuleDetailsFromPath) return moduleDetailsFromPath;
  hasRequiredModuleDetailsFromPath = 1;
  var sep = path__default.sep;
  moduleDetailsFromPath = function(file) {
    var segments = file.split(sep);
    var index = segments.lastIndexOf("node_modules");
    if (index === -1) return;
    if (!segments[index + 1]) return;
    var scoped = segments[index + 1][0] === "@";
    var name = scoped ? segments[index + 1] + "/" + segments[index + 2] : segments[index + 1];
    var offset = scoped ? 3 : 2;
    var basedir = "";
    var lastBaseDirSegmentIndex = index + offset - 1;
    for (var i = 0; i <= lastBaseDirSegmentIndex; i++) {
      if (i === lastBaseDirSegmentIndex) {
        basedir += segments[i];
      } else {
        basedir += segments[i] + sep;
      }
    }
    var path = "";
    var lastSegmentIndex = segments.length - 1;
    for (var i2 = index + offset; i2 <= lastSegmentIndex; i2++) {
      if (i2 === lastSegmentIndex) {
        path += segments[i2];
      } else {
        path += segments[i2] + sep;
      }
    }
    return {
      name,
      basedir,
      path
    };
  };
  return moduleDetailsFromPath;
}
export {
  requireModuleDetailsFromPath as r
};
