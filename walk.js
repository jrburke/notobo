/*jshint node: true */
'use strict';

var fs = require('fs'),
    path = require('path'),
    firstDotRegExp = /^\.\//,
    jsSuffixRegExp = /\.js$/;

function throwIfMainJson(filePath) {
  throw new Error('Package at ' + filePath + ' uses .json, not supported yet');
}

module.exports = function walk(dirName, onDep, baseId) {
  var result = {};

  fs.readdirSync(dirName).forEach(function(packageName) {
    var mainId,
        fullPath = path.join(dirName, packageName);

    if (fs.statSync(fullPath).isDirectory()) {
      // Read package.json for the main value
      var packageJsonPath = path.join(fullPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        mainId = packageJson.main;
      }

      // Check for index.* conventions
      if (!mainId) {
        if (fs.existsSync(path.join(fullPath, 'index.js'))) {
          mainId = 'index';
        } else if (fs.existsSync(path.join(fullPath, 'index.json'))) {
          throwIfMainJson();
        }
      }

      if (!mainId) {
        throw new Error(fullPath + ' does not have a main module');
      }

      // Normalize mainId -- do not need the ./ or the file extension
      mainId = mainId.replace(firstDotRegExp, '').replace(jsSuffixRegExp, '');

      // Absolute, normalized module ID depends on nesting level.
      var normalizeId = baseId ?
                          baseId + '/node_modules/' + packageName :
                          packageName;

      result[packageName] = {
        normalizedId: normalizeId,
        main: mainId
      };

      // If the directory has a node_modules, recurse
      var nodeModulesPath = path.join(fullPath, 'node_modules');
      if (fs.existsSync(nodeModulesPath) &&
          fs.statSync(nodeModulesPath).isDirectory()) {
        result[packageName].deps = walk(nodeModulesPath,
                                        onDep,
                                        normalizeId);
      }

      // Let callback know of new package dependency found.
      if (typeof onDep === 'function') {
        onDep(packageName, result[packageName], normalizeId, fullPath);
      }
    }
  });

  return result;
};
