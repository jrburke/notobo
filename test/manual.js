var path = require('path'),
    walk = require('../walk'),
    convert = require('../convert'),
    baseUrl = path.join('output', 'voxel-simple', 'node_modules');

// data has .main and .deps
function onDep(packageName, data, normalizedModuleId, fullPath) {
  //console.log('onDep called with: ' + Array.prototype.slice.call(arguments));
  convert(packageName, data.main, fullPath, baseUrl);
}

var walked  = walk(baseUrl, onDep);
