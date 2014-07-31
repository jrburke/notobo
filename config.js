/*jshint node: true */
'use strict';

var fs = require('fs'),
    onrequirejs = require('./lib/onrequirejs');

function setDepMap(normalizedId, deps, config) {
  if (deps) {
    var modConfig = config.map[normalizedId] = {};
    Object.keys(deps).forEach(function(depKey) {
      var depValue = deps[depKey];
      modConfig[depKey] = depValue.normalizedId;
      setDepMap(depValue.normalizedId, depValue.deps, config);
    });
  }
}

function setMap(obj, config) {
  var modified = false;
  Object.keys(obj).forEach(function(key) {
    var value = obj[key];
    if (value.deps) {
      if (!config.map) {
        config.map = {};
      }

      modified = true;
      setDepMap(value.normalizedId, value.deps, config);
    }
  });

  return modified;
}

module.exports = function config(walkData, configFilePath, callback) {
  onrequirejs(['transform'], callback, function(transform, callback) {
    var contents = fs.readFileSync(configFilePath, 'utf8');
    contents = transform.modifyConfig(contents, function(currConfig) {
      // Do not bother returning the config if no changes happened. When no
      // config is returned, then transform should not attempt a file
      // modification.
      if (setMap(walkData, currConfig)) {
        return currConfig;
      }
    });
    fs.writeFileSync(configFilePath, contents, 'utf8');
    callback();
  });
};
