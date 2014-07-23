/*jshint node: true */
'use strict';

var walk,
    fs = require('fs'),
    path = require('path'),
    firstDotRegExp = /^\.\//,
    jsSuffixRegExp = /\.js$/;

function throwIfMainJson(filePath) {
  throw new Error('Package at ' + filePath + ' uses .json, not supported yet');
}

function topPackage(packageName, fullPath, onDep, baseId) {
  var mainId,
      result = {};

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
    var normalizedId = (baseId ?
                        baseId + '/node_modules/' + packageName :
                        packageName).replace(jsSuffixRegExp, '');

    var walkData = {
      packageName: packageName,
      main: mainId,
      normalizedId: normalizedId,
      fullPath: fullPath
    };

    // Let callback know of new package dependency found. The callback has the
    // capability to modify the walkData.
    if (typeof onDep === 'function') {
      onDep(walkData);
    }

    result = {
      normalizedId: walkData.normalizedId,
      main: walkData.main
    };

    // If the directory has a node_modules, recurse
    var nodeModulesPath = path.join(walkData.fullPath, 'node_modules');
    if (fs.existsSync(nodeModulesPath) &&
        fs.statSync(nodeModulesPath).isDirectory()) {
      result.deps = walk(nodeModulesPath,
                                      onDep,
                                      walkData.normalizedId);
    }
  }

  return result;
}

module.exports = walk = function(dirName, onDep, baseId) {
  var result = {};

  fs.readdirSync(dirName).forEach(function(packageName) {
    var fullPath = path.join(dirName, packageName);

    packageName = packageName.replace(jsSuffixRegExp, '');

    result[packageName] = topPackage(packageName, fullPath, onDep, baseId);
  });

  return result;
};

walk.topPackage = topPackage;
