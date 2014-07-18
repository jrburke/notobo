var walk = require('../../../walk');

var walked  = walk('node_modules'),
    walkJson = JSON.stringify(walked, null, '  ');

console.log(walkJson);

var fs = require('fs');
fs.writeFile('../../expected/voxel-simple/walk.json', walkJson, 'utf8');
