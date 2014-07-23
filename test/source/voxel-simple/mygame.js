if (typeof define !== 'function') {
  define = function(fn) { fn(require); };
}

define(function(require) {
  var createGame = require('voxel-hello-world');
  var game = createGame();
});
