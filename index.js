/*jshint node: true */
'use strict';

var fs = require('fs'),
    walk = require('./walk'),
    convert = require('./convert'),
    config = require('./config');

module.exports = function notobo(baseUrl, configFilePath, callback) {
  // For that authentic async callback feel.
  process.nextTick(function() {
    // data has .main and .deps
    function onDep(packageName, data, normalizedModuleId, fullPath) {
      //console.log('onDep called with: ' +
      //            Array.prototype.slice.call(arguments));
      convert(packageName, data.main, fullPath, baseUrl);
    }

    try {
      if (!baseUrl) {
        throw new Error('No path for a node_modules was given');
      }
      if (!fs.existsSync(baseUrl)) {
        throw new Error(baseUrl + ' does not exist');
      }
      if (!configFilePath) {
        throw new Error('No path to file that contains the AMD config');
      }
      if (!fs.existsSync(configFilePath)) {
        throw new Error(configFilePath + ' does not exist');
      }

      var walked  = walk(baseUrl, onDep);
      config(walked, configFilePath, callback);
    } catch (e) {
      callback(e);
    }
  });
};
