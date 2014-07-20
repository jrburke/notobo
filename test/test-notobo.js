/*jshint node: true */
'use strict';
var file,
    path = require('path'),
    assert = require('assert'),
    requirejs = require('requirejs'),
    notobo = require('../index'),
    dir = __dirname;

describe('notobo', function() {
  before(function(done) {
    requirejs.tools.useLib(function(req) {
      req(['env!env/file'], function(f) {
        file = f;

        file.deleteFile('output');
        file.copyDir('source', 'output');
        done();
      });
    });
  });

  it('nested', function(done) {
    var configOutput = path.join(dir, 'output', 'nested', 'config.js'),
        configExpected = path.join(dir, 'expected', 'nested', 'config.js');

    notobo(
      path.join(dir, 'output', 'nested', 'node_modules'),
      configOutput,
      function(err) {
        assert(file.readFile(configExpected).trim(),
               file.readFile(configOutput).trim());
        done(err);
      }
    );
  });
});
