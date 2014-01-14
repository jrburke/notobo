/*jshint node: true */
var fs = require('fs'),
  path = require('path'),
  exists = fs.existsSync || path.existsSync,
  startDotRegExp = /^\.\//,
  jsSuffixRegExp = /\.js$/;

module.exports = function moduleWalk(dir) {
  if (path.basename(dir) !== 'node_modules') {
    throw new Error('Directory is not a node_modules');
  }

  var result = {};

  fs.readdirSync(dir).forEach(function (subDir) {
    if (subDir.indexOf('.') === 0) {
      return;
    }

    var data = result[subDir] = {};

    var jsonPath = path.join(dir, subDir, 'package.json');
    if (exists(jsonPath)) {
      var json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (json.main) {
        data.main = json.main.replace(startDotRegExp, '')
                             .replace(jsSuffixRegExp, '');
      }
    }

    var nmPath = path.join(dir, subDir, 'node_modules');
    if ((exists(nmPath))) {
      data.node_modules = moduleWalk(nmPath);
    }
  });

  return result;
};
