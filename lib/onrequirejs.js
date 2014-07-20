'use strict';
var requirejs = require('requirejs');

module.exports = function onrequirejs(deps, callback, fn) {
  // Current r.js is sync for some node compatibility reasons, but for this API,
  // since it is doing node callbacks, make sure it is async.
  process.nextTick(function() {
    requirejs.tools.useLib(function(req) {
      req(deps, function() {
        var args = Array.prototype.slice.call(arguments);
        args.push(callback);
        try {
          fn.apply(undefined, args);
        } catch (e) {
          callback(e);
        }
      }, callback);
    });
  });
};