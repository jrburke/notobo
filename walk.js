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
  var mainId, packageJson,
      result = {};

  // Do not bother with requirejs, it is a bootstrap package. Also, no need to
  // handle the .bin directory.
  if (packageName === 'requirejs' || packageName === '.bin') {
    return result;
  }

  if (!options) {
    options = {};
  }

  if (fs.statSync(fullPath).isDirectory()) {
    // Read package.json for the main value
    var packageJsonPath = path.join(fullPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      // Some modules use packageJson.browser to indicate a browser alternative
      // for a main module. The 'inherits' package is one example.
      mainId = typeof packageJson.browser === 'string' ?
               packageJson.browser : packageJson.main;
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
    var nodeModulesPath = path.join(walkData.fullPath, 'node_modules');


    if (mainId) {
      // Normalize mainId -- do not need the ./ or the file extension
      walkData.main = mainId
                      .replace(firstDotRegExp, '')
                      .replace(jsSuffixRegExp, '');
    }

    // If the package.json has a browser field that is an object of alternatives
    // set up map config for them.
    var browserAlts = packageJson && packageJson.browser;
    if (browserAlts && typeof browserAlts !== 'string') {
        walkData.map = {};

      Object.keys(browserAlts).forEach(function(targetId) {
        var altId = browserAlts[targetId];

        if (targetId.indexOf('.') === 0) {
          targetId = walkData.normalizedId + '/' + targetId.substring(2);
        }
        targetId = targetId.replace(jsSuffixRegExp, '');

        if (altId === false) {
          walkData.map[targetId] = 'notobo-empty';
        } else {
          altId = altId.replace(jsSuffixRegExp, '');

          if (altId.indexOf('.') === 0) {
            altId = walkData.normalizedId + '/' + altId.substring(2);
          } else {
            // Find out if the referenced ID is in nested node_modules, and
            // if so, append node_modules to the final ID.
            var firstPart = altId.split('/').shift();
            if (fs.existsSync(path.join(nodeModulesPath, firstPart))) {
              altId = walkData.normalizedId + '/node_modules/' + altId;
            } else {
              // Try as a sibling
              if (fs.existsSync(path.join(nodeModulesPath, '..', '..', firstPart))) {
                var parts = walkData.normalizedId.split('/');
                parts.pop();
                parts.push(altId);
                altId = parts.join('/');
              }
            }
          }

          walkData.map[targetId] = altId;
        }
      });
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
    if (walkData.map) {
      result.map = walkData.map;
    }

    // If the directory has a node_modules, recurse
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
