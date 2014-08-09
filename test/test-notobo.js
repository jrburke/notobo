/*jshint node: true */
'use strict';
var file,
    fs = require('fs'),
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

        file.deleteFile(path.join(dir, 'output'));
        file.copyDir(path.join(dir, 'source'), path.join(dir, 'output'));
        done();
      });
    });
  });

  function compareConfig(testName, done) {
    it(testName, function(done) {
      var configOutput = path.join(dir, 'output', testName, 'config.js'),
          configExpected = path.join(dir, 'expected', testName, 'config.js');

      notobo({
        loaderConfigFile: configOutput,
        baseUrl: path.join(dir, 'output', testName, 'node_modules'),
      },
      function(err) {
        assert(file.readFile(configExpected).trim(),
               file.readFile(configOutput).trim());
        done(err);
      });
    });
  }

  compareConfig('alt-browser');

  it('bower-alt', function(done) {
    var configOutput = path.join(dir, 'output', 'bower-alt', 'config.js'),
        configExpected = path.join(dir, 'expected', 'bower-alt', 'config.js'),
        altLib = path.join(dir, 'output', 'bower-alt', 'lib');

    notobo({
      loaderConfigFile: configOutput,
      baseUrl: altLib,
      altMainJson: 'bower.json'
    },
    function(err) {
      assert(file.readFile(configExpected).trim(),
             file.readFile(configOutput).trim());

      assert(true, !fs.existsSync(path.join(altLib, 'two.js')));
      var adapterPath = path.join(altLib, 'one.js');
      assert(true, fs.existsSync(adapterPath));
      assert(true, file.readFile(adapterPath).indexOf('./one/main') !== -1);

      done(err);
    });
  });

  compareConfig('nested');
});
