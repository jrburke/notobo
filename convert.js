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
    browserifyPath = path.dirname(require.resolve('browserify')),
    browserifyPackageDir = path.join(browserifyPath, 'node_modules'),
    internalBrowserifyNative = /browserify\/lib$/,
    readableStreamDepRegExp = /require\s*\(\s*["']readable-stream[^\)]*\)/g,
    streamRegExp = /(require\s*\(\s*["'])stream(["']\s*\))/g,
    jsonPluginRegExp = /^json!/,
    jsSuffixRegExp = /\.js$/;

//console.log(JSON.stringify(builtins, null, '  '));

var streamMainAdapter = 'define([\'./stream/browser-main\'], ' +
                        'function(m) { return m; });';

function getPackageJson(filePath) {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    return {};
  }
}

function isJson(id) {
  return jsonPluginRegExp.test(id);
}

function isNativeModule(id) {
  return builtins.hasOwnProperty(id) || id === 'process';
}

function getNativePath(id) {
  if (id === 'process') {
    id = '_' + id;
  }

  var nativePath = builtins[id];

  if (!nativePath) {
    throw new Error('Unknown native ID: ' + id);
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

function convertWithFile(baseUrl, options, file) {
  if (!options.onDep) {
    options.onDep = onDep;
  }

  var nativeWalked = {};

  function installNativeShim(nativeId, nativePath) {
    nativePath = nativePath || getNativePath(nativeId);

    var destPrefix = path.join(baseUrl, nativeId);

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

        nativeWalked[nativeId] = {};

        // The builtin adapter could itself have dependencies on other
        // built-ins and if so, make sure to add them.
        if (converted.deps) {
          converted.deps.forEach(function(dep) {
            if (isNativeModule(dep) && !nativeWalked.hasOwnProperty(dep)) {
              installNativeShim(dep);
            }
          });
        }
      } else if (nativeStat.isDirectory()) {
        // Copy the directory over.
        file.copyDir(nativePath, destPrefix);

        // Walk/convert it. Create the entry in nativeWalked before receiving
        // the walked values to avoid cycles where a native depends on itself.
        nativeWalked[nativeId] = {};
        nativeWalked[nativeId] = walk.topPackage(nativeId,
                                                 destPrefix,
                                                 options);

        // Need to fix up the stream-browserify and readable-stream relations.
        if (nativeId === 'stream') {
          var mainPath = path.join(destPrefix,
                                   nativeWalked[nativeId].main + '.js');
          if (fs.existsSync(mainPath)) {
            var mainContents = file.readFile(mainPath)
                               .replace(readableStreamDepRegExp, 'undefined');
            file.saveFile(mainPath, mainContents);
            file.copyFile(path.join(__dirname,
                                    'adapters', 'stream-browser-main.js'),
                          path.join(destPrefix, 'browser-main.js'));
            file.saveFile(destPrefix + '.js', streamMainAdapter);
          }
        } else if (nativeId === 'readable-stream') {
          var files = file.getFilteredFileList(destPrefix, jsSuffixRegExp);
          files.forEach(function(filePath) {
            var fileContents = file.readFile(filePath);

            fileContents = fileContents.replace(streamRegExp,
            function(match, prefix, suffix) {
              return prefix + 'stream/index' + suffix;
            });

            if (/_stream_writable.js$/.test(filePath)) {
              // It is a complicated web that we weave for backcompat
              fileContents = fileContents.replace(
                /require\('.\/_stream_duplex'\)/g,
                'require(\'./_stream\' + \'_duplex\')'
              );
            }

            file.saveFile(filePath, fileContents);
          });
        }


        // Some of the native shims depend on packages installed in browserify's
        // node_modules. So if a package.json dependency is not in the nested
        // node_modules for that shim, get it from the browserify node_modules.
        var nativePackageJsonPath = path.join(destPrefix, 'package.json');
        var deps = getPackageJson(nativePackageJsonPath).dependencies;
        if (deps) {
          Object.keys(deps).forEach(function(depName) {
            var nestedPath = path.join(destPrefix, 'node_modules', depName);
            if (!fs.existsSync(nestedPath)) {
              var altPath = path.join(browserifyPackageDir, depName);
              if (!nativeWalked.hasOwnProperty(depName) &&
                  fs.existsSync(altPath)) {
                installNativeShim(depName, altPath);
              }
            }
          });
        }
      }
    }
  }

  function amdDir(dir) {
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
            // Browserify throws garbage in the require API by using numbers
            // sometimes, so skip those.
            if (typeof dep !== 'string') {
              return;
            }

            // Find the native modules needed.
            if (isNativeModule(dep) && !nativeWalked.hasOwnProperty(dep)) {
              installNativeShim(dep);
            } else {
              if (isJson(dep)) {
                // Write out json plugin and its builder.
                var jsonDest = path.join(baseUrl, 'json.js');
                if (!fs.existsSync(jsonDest)) {
                  file.copyFile(jsonAdapterPath, jsonDest);
                }
                jsonDest = path.join(baseUrl, 'json-builder.js');
                if (!fs.existsSync(jsonDest)) {
                  file.copyFile(jsonBuilderAdapterPath, jsonDest);
                }
              }
            }
          });
        }
      } else if (stat.isDirectory() && baseName !== 'node_modules') {
        // recurse, but only if not the node_modules, that will be handled
        // by other calls to convert.
        amdDir(fullPath);
      }
    });
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
    amdDir(fullPath);
  }

  function onDep(walkData) {
    convertPackage(walkData);
  }

  var walked = walk(baseUrl, options);

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
