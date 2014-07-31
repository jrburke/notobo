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

function topPackage(packageName, fullPath, options, baseId) {
  var mainId,
      result = {};

  if (!options) {
    options = {};
  }

  if (fs.statSync(fullPath).isDirectory()) {
    // Read package.json for the main value
    var packageJsonPath = path.join(fullPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      mainId = packageJson.main;
    } else if (options.altMainJson) {
      var altJsonPath = path.join(fullPath, options.altMainJson);
      if (fs.existsSync(altJsonPath)) {
        var altJson = JSON.parse(fs.readFileSync(altJsonPath, 'utf8'));
        if (altJson.main) {
          // This is likely the bower case. If the mainId is not a .js file, or
          // just no extension, then disregard.
          var ext = path.extname(altJson.main);
          if (!ext || ext === '.js') {
            mainId = altJson.main;
          }
        }
      }
    }

    // Check for index.* conventions
    if (!mainId) {
      if (fs.existsSync(path.join(fullPath, 'index.js'))) {
        mainId = 'index';
      } else if (fs.existsSync(path.join(fullPath, 'index.json'))) {
        throwIfMainJson();
      }
    }

    // Absolute, normalized module ID depends on nesting level.
    var normalizedId = (baseId ?
                        baseId + '/node_modules/' + packageName :
                        packageName).replace(jsSuffixRegExp, '');

    var walkData = {
      packageName: packageName,
      normalizedId: normalizedId,
      fullPath: fullPath
    };

    if (mainId) {
      // Normalize mainId -- do not need the ./ or the file extension
      walkData.main = mainId
                      .replace(firstDotRegExp, '')
                      .replace(jsSuffixRegExp, '');
    }

    // Let callback know of new package dependency found. The callback has the
    // capability to modify the walkData.
    if (typeof options.onDep === 'function') {
      options.onDep(walkData);
    }

    result = {
      normalizedId: walkData.normalizedId
    };
    if (walkData.main) {
      result.main = walkData.main;
    }

    // If the directory has a node_modules, recurse
    var nodeModulesPath = path.join(walkData.fullPath, 'node_modules');
    if (fs.existsSync(nodeModulesPath) &&
        fs.statSync(nodeModulesPath).isDirectory()) {
      result.deps = walk(nodeModulesPath,
                                      options,
                                      walkData.normalizedId);
    }
  }

  return result;
}

module.exports = walk = function(dirName, options, baseId) {
  var result = {};

  fs.readdirSync(dirName).forEach(function(packageName) {
    var fullPath = path.join(dirName, packageName);

    packageName = packageName.replace(jsSuffixRegExp, '');

    result[packageName] = topPackage(packageName, fullPath, options, baseId);
  });

  return result;
};

walk.topPackage = topPackage;
