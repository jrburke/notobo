#!/usr/bin/env node
var args = [].splice.call(process.argv, 2);
var result = (require('../lib/moduleWalk'))(args[0]);
console.log(JSON.stringify(result, null, '  '));
