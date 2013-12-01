#!/usr/bin/env node

// NOTOBO INSTALL HOOK

console.log('-------------');

console.log('ONINSTALL CALLED: ' + __dirname);

Object.keys(process.env).forEach(function(key) {
    console.log(key + ': ' + process.env[key]);
});


