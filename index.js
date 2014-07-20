/*jshint node: true */
'use strict';

var fs = require('fs'),
    convert = require('./convert'),
    config = require('./config');

module.exports = function notobo(baseUrl, configFilePath, callback) {
  // For that authentic async callback feel.
  process.nextTick(function() {
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

      convert(baseUrl, function(err, walked) {
        if (err) {
          callback(err);
        } else {
          config(walked, configFilePath, callback);
        }
      });
    } catch (e) {
      callback(e);
    }
  });
};
