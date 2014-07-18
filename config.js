/*jshint node: true */
var fs = require('fs'),
    requirejs = require('./lib/r');

function setMap(obj, config) {
  Object.keys(obj).forEach(function(key) {
    var value = obj[key];
    if (value.deps && value.deps.length) {
      if (!config.map) {
        config.map = {};
      }

      var modConfig = config.map[value.normalizedId] = {};
      Object.keys(value.deps).forEach(function(depKey) {
        var depValue = value.deps[depKey];
        modConfig[depKey] = depValue.normalizedId;
        setMap(depValue, config);
      });
    }
  });
}

module.exports = function config(walkData, configFilePath, callback) {
  // Current r.js is sync for some node compatibility reasons, but for this API,
  // since it is doing node callbacks, make sure it is async.
  process.nextTick(function() {
    requirejs.tools.useLib(function(req) {
      req(['transform'], function(transform) {
        try {
          var contents = fs.readFileSync(configFilePath, 'utf8');
          contents = transform.modifyConfig(contents, function(currConfig) {
            setMap(walkData, currConfig);
            return currConfig;
          });
          fs.writeFileSync(configFilePath, contents, 'utf8');
          callback();
        } catch (e) {
          callback(e);
        }
      }, callback);
    });
  });
};
