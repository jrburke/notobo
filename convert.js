/*jshint node: true */
'use strict';

var fs = require('fs'),
    path = require('path'),
    onrequirejs = require('./lib/onrequirejs'),
    builtins = require('browserify/lib/builtins'),
    walk = require('./walk'),
    toAmd = require('./lib/toAmd'),
    jsonAdapterPath = require.resolve('./adapters/json'),
    jsonBuilderAdapterPath = require.resolve('./adapters/json-builder'),
    readableStreamRegExp = /^readable-stream(\/|$)/,
    internalBrowserifyNative = /browserify\/lib$/,
    jsonPluginRegExp = /^json!/,
    jsSuffixRegExp = /\.js$/;

//console.log(JSON.stringify(builtins, null, '  '));

function isJson(id) {
  return jsonPluginRegExp.test(id);
}

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
  if (isNativeModule(dep) && idArray.indexOf(dep) === -1) {
    idArray.push(dep);
  }
}

function amdDir(dir, traceInfo) {
  traceInfo = traceInfo || { foundNatives: {}, hasJson: false };

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

      if (converted.deps) {
        converted.deps.forEach(function(dep) {
          // Browserify shits in the require API by using numbers sometimes,
          // so skip those.
          if (typeof dep !== 'string') {
            return;
          }

          // Find the native modules needed.
          if (isNativeModule(dep)) {
            traceInfo.foundNatives[dep] = true;
          } else {
            if (isJson(dep)) {
              traceInfo.hasJson = true;
            }
          }
        });
      }
    } else if (stat.isDirectory() && baseName !== 'node_modules') {
      // recurse, but only if not the node_modules, that will be handled
      // by other calls to convert.
      amdDir(fullPath, traceInfo);
    }
  });

  return traceInfo;
}

function convertWithFile(baseUrl, options, file) {

  if (!options.onDep) {
    options.onDep = onDep;
  }

  // walkData has: packageName, main, normalizedId, fullPath
  function convertPackage(walkData) {
    var fullPath = walkData.fullPath,
        packageName = walkData.packageName,
        mainId = walkData.main;

    // If fullPath ends in a .js, rename the directory, and adjust the full
    // path.
    if (jsSuffixRegExp.test(walkData.fullPath)) {
      var oldPath = fullPath;
      fullPath = walkData.fullPath = fullPath.replace(jsSuffixRegExp, '');

      // This could be a re-run, so remove any existing target first.
      if (fs.existsSync(fullPath)) {
        file.deleteFile(fullPath);
      }
      file.copyDir(oldPath, fullPath);
      file.deleteFile(oldPath);

    }

    if (mainId) {
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
    }

    // Scan for .js files, and convert to AMD.
    var traceInfo = amdDir(fullPath);

    // Install adapter if JSON is used.
    if (traceInfo.hasJson) {
      var jsonDest = path.join(baseUrl, 'json.js');
      if (!fs.existsSync(jsonDest)) {
        file.copyFile(jsonAdapterPath, jsonDest);
      }
      jsonDest = path.join(baseUrl, 'json-builder.js');
      if (!fs.existsSync(jsonDest)) {
        file.copyFile(jsonBuilderAdapterPath, jsonDest);
      }
    }

    // Install adapters for found native node modules.
    var idArray = Object.keys(traceInfo.foundNatives);

    for (var i = 0; i < idArray.length; i++) {
      var nativeId = idArray[i],
          nativePath = getNativePath(nativeId),
          destPrefix = path.join(baseUrl, nativeId);

      // Only do the work if there is not already a module at the expected
      // baseUrl location.
      if (!nativeWalked.hasOwnProperty(nativeId) &&
          !fs.existsSync(destPrefix + '.js')) {
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
          file.copyDir(nativePath, destPrefix);

          // Walk/convert it. Create the entry in nativeWalked before receiving
          // the walked values to avoid cycles where a native depends on itself.
          nativeWalked[nativeId] = {};
          nativeWalked[nativeId] = walk.topPackage(nativeId,
                                                   destPrefix,
                                                   options);
        }
      }
    }
  }

  function onDep(walkData) {
    convertPackage(walkData);
  }

  var nativeWalked = {};
  var walked  = walk(baseUrl, options);

  Object.keys(nativeWalked).forEach(function(nativeId) {
    walked[nativeId] = nativeWalked[nativeId];
  });

  return walked;
}

module.exports = function convert(baseUrl, options, callback) {
  if (typeof options === 'function' || !options) {
    callback = options;
    options = {};
  }

  onrequirejs(['env!env/file'], callback, function(file, callback) {
    var walked = convertWithFile(baseUrl, options, file);
    callback(undefined, walked);
  });
};





