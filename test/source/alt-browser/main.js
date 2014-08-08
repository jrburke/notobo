define(function(require) {
  function log(obj) {
    console.log(JSON.stringify(obj, null, '  '));
  }

  log(require('hasfalse'));
  log(require('haslocal'));
  log(require('hasmain'));
  log(require('hastop'));
});
