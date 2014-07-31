/*jshint node: true */
'use strict';

var fs = require('fs'),
    convert = require('./convert'),
    config = require('./config');

module.exports = function notobo(options, callback) {
  // For that authentic async callback feel.
  process.nextTick(function() {
    try {
      var loaderConfigFile = options.loaderConfigFile,
          baseUrl = options.baseUrl;

      if (!baseUrl) {
        baseUrl = 'node_modules';
      }
      if (!fs.existsSync(baseUrl)) {
        throw new Error(baseUrl + ' does not exist');
      }
      if (!loaderConfigFile) {
        throw new Error('No path to file that contains the AMD config');
      }
      if (!fs.existsSync(loaderConfigFile)) {
        throw new Error(loaderConfigFile + ' does not exist');
      }

      convert(baseUrl, options, function(err, walked) {
        if (err) {
          callback(err);
        } else {
          config(walked, loaderConfigFile, callback);
        }
      });
    } catch (e) {
      callback(e);
    }
  });
};
