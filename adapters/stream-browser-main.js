// Written by notobo to break cycle in readable-stream and stream-browserify.
define(function(require, exports, module) {
  var Stream = require('./index');
  Stream.Readable = require('readable-stream/readable.js');
  Stream.Writable = require('readable-stream/writable.js');
  Stream.Duplex = require('readable-stream/duplex.js');
  Stream.Transform = require('readable-stream/transform.js');
  Stream.PassThrough = require('readable-stream/passthrough.js');

  module.exports = Stream;
});
