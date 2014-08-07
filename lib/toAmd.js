/*jshint node: true */
'use strict';
var parse = require('./parse'),
    lastSlashRegExp = /\/$/,
    jsonExtRegExp = /\.json$/;

function returnValue(contents, deps) {
  return {
    contents: contents,
    deps: deps
  };
}

function makeRequireRegExp(dep) {
  return new RegExp('(require\\s*\\(\\s*["\'])' +
                    dep +
                    '(["\']\\s*\\))', 'g');
}

module.exports = function toAmd(fileName, fileContents, fakeFileContents) {

  var parseableFileContents = fakeFileContents || fileContents,
      deps;

  try {
    var preamble = '',
        commonJsProps = parse.usesCommonJs(fileName, parseableFileContents);

    //First see if the module is not already RequireJS-formatted.
    if (parse.usesAmdOrRequireJs(fileName, parseableFileContents) ||
        !commonJsProps) {
      return returnValue(fileContents,
             parse.findDependencies(fileName, parseableFileContents));
    }

    deps = parse.findCjsDependencies(fileName, parseableFileContents);

    // Find any dependencies that end in .json and convert them to 'json!' ones,
    // updating the deps array, so consumers of this module know if they need a
    // loader plugin adapter.
    if (deps && deps.length) {
      deps.forEach(function(dep, i) {
        // Browserify shits in the require API by using numbers sometimes,
        // so skip those.
        if (typeof dep !== 'string') {
          return;
        }

        var replRegExp, repDep;

        // Get rid of dangling / because those are utterly useless and just
        // noise. The module API should reject them, but frozen legacy.
        if (lastSlashRegExp.test(dep)) {
          replRegExp = makeRequireRegExp(dep);
          repDep = dep.substring(0, dep.length - 1);

          fileContents = fileContents.replace(replRegExp,
          function(match, prefix, suffix) {
            return prefix + repDep + suffix;
          });

          deps[i] = repDep;
        }

        // Convert .json dependencies to json! loader plugin IDs
        var lastPart = dep.split('/').pop();
        if (jsonExtRegExp.test(lastPart)) {
          replRegExp = makeRequireRegExp(dep);
          repDep = 'json!' + dep.replace(jsonExtRegExp, '');

          fileContents = fileContents.replace(replRegExp,
          function(match, prefix, suffix) {
            return prefix + repDep + suffix;
          });

          deps[i] = repDep;
        }
      });
    }

    if (commonJsProps.dirname || commonJsProps.filename) {
      preamble = 'var __filename = module.uri || "", ' +
                  '__dirname = ' +
                  '__filename.substring(0, __filename.lastIndexOf("/") + 1); ';
    }

    //Construct the wrapper boilerplate.
    fileContents = 'define(function (require, exports, module) { ' +
        preamble +
        fileContents +
        '\n});\n';

  } catch (e) {
    if (!fakeFileContents) {
      // Try once with a function wrapped contents, since some node
      // modules return at the top level, assuming they are really
      // wrapped when executing. Which is true since Node wraps
      // the modules in a function. The module is just not valid JS
      // though without the function wrapper
      return toAmd(fileName, fileContents, 'function() {\n' +
                                           fileContents + '\n};');
    }
    console.log('Could not convert: ' + fileName +
                ', so skipping it. Error was: ' + e);
    return returnValue(fileContents);
  }

  return returnValue(fileContents, deps);
};
