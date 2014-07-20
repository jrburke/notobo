/*jshint node: true */
'use strict';

var fs = require('fs'),
    path = require('path'),
    onrequirejs = require('./lib/onrequirejs'),
    builtins = require('browserify/lib/builtins'),
    walk = require('./walk'),
    toAmd = require('./lib/toAmd'),
    readableStreamRegExp = /^readable-stream(\/|$)/,
    internalBrowserifyNative = /browserify\/lib$/,
    jsSuffixRegExp = /\.js$/;

console.log(JSON.stringify(builtins, null, '  '));

function isNativeModule(id) {
  return builtins.hasOwnProperty(id) || readableStreamRegExp.test(id);
}

function getNativePath(id) {
  var nativePath = builtins[id];

  if (!nativePath) {
    if (readableStreamRegExp.test(id)) {
      // Just pick a readable-stream entry, will need the whole directory
      // anyway.
      nativePath = builtins._stream_readable;
    } else {
      throw new Error('Unknown native ID: ' + id);
    }
  }

  // Have a path to a specific module, but really need the full package
  // directory since the module can have internal package dependencies. However,
  // some are just mapped to "empty" files in browserify. So for those, just
  // return those files.
  var dirName = path.dirname(nativePath);

  if (internalBrowserifyNative.test(dirName)) {
    return nativePath;
  } else {
    return dirName;
  }
}

function findNatives(idArray, dep) {
console.log('CHECKING: ' + dep);
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
      // converted has .contents and .deps array.
      var converted = toAmd(fullPath, contents);

      // Write out file if it is different.
      if (converted.contents !== contents) {
        fs.writeFileSync(fullPath, converted.contents, 'utf8');
      }

      // Find the native modules needed.
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

function convertWithFile(baseUrl, file) {

  function convertPackage(packageName, mainId, fullPath) {
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

    // Scan for .js files, and convert to AMD.
    var foundNatives = amdDir(fullPath);

    // Install adapters for found native node modules.
    var idArray = Object.keys(foundNatives);

    for (var i = 0; i < idArray.length; i++) {
      var nativeId = idArray[i],
          nativePath = getNativePath(nativeId),
          destPrefix = path.join(baseUrl, nativeId);

      // Only do the work if there is not already a module at the expected
      // baseUrl location.
      if (fs.existsSync(destPrefix + '.js')) {
        var nativeStat = fs.statSync(nativePath);

        if (nativeStat.isFile()) {
          var nativeContents = fs.readFileSync(builtins[nativeId], 'utf8');

          // If the native shim is just an empty file, write out an empty AMD
          // module.
          if (!nativeContents.trim()) {
            nativeContents = 'define(function(){});';
          }

          var converted = toAmd(nativePath, nativeContents);
          fs.writeFileSync(nativePath, converted.contents, 'utf8');

          // The builtin adapter could itself have dependencies on other
          // built-ins and if so, make sure to add them.
          if (converted.deps) {
            converted.deps.forEach(findNatives.bind(null, idArray));
          }
        } else if (nativeStat.isDirectory()) {
          // Copy the directory over

          // Walk/convert it.
          nativeWalked[nativeId] = walk.topPackage(nativeId, destPrefix, onDep);
        }
      }
    }
  }

  function onDep(packageName, data, normalizedModuleId, fullPath) {
    //console.log('onDep called with: ' +
    //            Array.prototype.slice.call(arguments));
    convertPackage(packageName, data.main, fullPath);
  }

  var nativeWalked = {};
  var walked  = walk(baseUrl, onDep);

  Object.keys(nativeWalked).forEach(function(nativeId) {
    walked[nativeId] = nativeWalked[nativeId];
  });

  return walked;
}

module.exports = function convert(baseUrl, callback) {
  onrequirejs(['file'], callback, function(file, callback) {
    convertWithFile(baseUrl, file);
    callback();
  });
};





