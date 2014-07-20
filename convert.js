/*jshint node: true */
'use strict';

var fs = require('fs'),
    path = require('path'),
    builtins = require('browserify/lib/builtins'),
    toAmd = require('./lib/toAmd'),
    jsSuffixRegExp = /\.js$/;

function isNativeModule(id) {
  return builtins.hasOwnProperty(id);
}

function findNatives(idArray, dep) {
  if (isNativeModule(dep) && idArray.indexOf(dep) === -1) {
    idArray.push(dep);
  }
}

function amdDir(dir, foundNatives) {
  foundNatives = foundNatives || {};

  fs.readdirSync(dir).forEach(function(baseName) {
    var fullPath = path.join(dir, baseName),
        stat = fs.statSync(fullPath);

    if (jsSuffixRegExp.test(baseName) && stat.isFile()) {
      var contents = fs.readFileSync(fullPath, 'utf8');
      // converted has .contents and .deps array
      var converted = toAmd(fullPath, contents);

      // Write out file if it is different.
      if (converted.contents !== contents) {
        fs.writeFileSync(fullPath, converted.contents, 'utf8');
      }

      // Find the native modules needed
      if (converted.deps) {
        converted.deps.forEach(function(dep) {
          if (isNativeModule(dep)) {
            foundNatives[dep] = true;
          }
        });
      }
    } else if (stat.isDirectory() && baseName !== 'node_modules') {
      // recurse, but only if not the node_modules, that will be handled
      // by other calls to convert.
      amdDir(fullPath, foundNatives);
    }
  });

  return foundNatives;
}

module.exports = function convert(packageName, mainId, fullPath, baseUrl) {
  // Write main module adapter
  var adapterPath = fullPath + '.js';

  // This should work multiple times over the same directory. So if the
  // adapter already exists, do not bother doing the work.
  if (!fs.existsSync(adapterPath)) {
    fs.writeFileSync(adapterPath,
                     'define([\'./' +
                      packageName + '/' + mainId +
                      '\'], function(m) { return m; });',
                     'utf8');
  }

  // Scan for .js files, and convert to AMD
  var foundNatives = amdDir(fullPath);

  // Install adapters for found native node modules
  var idArray = Object.keys(foundNatives);

  for (var i = 0; i < idArray.length; i++) {
    var nativeId = idArray[i],
        nativePath = path.join(baseUrl, nativeId + '.js');

    if (!fs.existsSync(nativePath)) {
      var nativeContents = fs.readFileSync(builtins[nativeId], 'utf8');

      // If the native shim is just an empty file, write out an empty AMD
      // module.
      if (!nativeContents.trim()) {
        nativeContents = 'define(function(){});';
      }

      var converted = toAmd(nativePath, nativeContents);
      fs.writeFileSync(nativePath, converted.contents, 'utf8');

      // The builtin adapter could itself have dependencies on other built-ins
      // and if so, make sure to add them.
      if (converted.deps) {
        converted.deps.forEach(findNatives.bind(null, idArray));
      }
    }
  }
};

