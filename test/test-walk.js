/*jshint node: true */
'use strict';

var path = require('path'),
    fs = require('fs'),
    assert = require('assert'),
    walk = require('../walk'),
    dir = __dirname;

function compare(testName) {
  it(testName, function() {
    var walked = walk(path.join(dir, 'source', testName, 'node_modules'));

    // if (testName === 'alt-browser') {
    //   console.log(JSON.stringify(walked, null, '  '));
    //}

    var expectedPath = path.join(dir, 'expected', testName, 'walk.json');
    var expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
    assert.deepEqual(walked, expected);
  });
}

function compareAltJson(testName, baseDir) {
  it(testName, function() {
    var walked = walk(path.join(dir, 'source', testName, baseDir), {
        altMainJson: 'bower.json'
    });
    var expectedPath = path.join(dir, 'expected', testName, 'walk.json');
    var expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
    assert.deepEqual(walked, expected);
  });
}

describe('notobo/walk', function() {
    compare('alt-browser');
    compare('voxel-simple');

    compareAltJson('bower-alt', 'lib');
});
