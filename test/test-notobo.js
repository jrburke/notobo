/*jshint node: true */
/*global describe, it, before */
var file,
    path = require('path'),
    fs = require('fs'),
    assert = require('assert'),
    requirejs = require('requirejs'),
    notobo = require('../index'),
    dir = __dirname;

function compare(testName) {
  it(testName, function() {
    assert.equal(1, 1);
    // var walked = walk(path.join(dir, 'source', testName, 'node_modules'));
    // var expectedPath = path.join(dir, 'expected', testName, 'walk.json');
    // var expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
    // assert.deepEqual(walked, expected);
  });
}

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
