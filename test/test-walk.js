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
    var expectedPath = path.join(dir, 'expected', testName, 'walk.json');
    var expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
    assert.deepEqual(walked, expected);
  });
}

describe('notobo/walk', function() {
    compare('voxel-simple');
});
