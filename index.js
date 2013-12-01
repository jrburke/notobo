/*jshint node: true */
/**
 * @license Copyright (c) 2013, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/notobo for details
 */

function readFile(path) {
    return fs.readFileSync(path, 'utf8');
}
function writeFile(path, contents) {
    return fs.writeFileSync(path, contents, 'utf8');
}

var fs = require('fs'),
    path = require('path'),
    shelljs = require('shelljs'),
    fromNode = require('./fromNode'),
    file = require('./file'),
    installHookScript = readFile(path.join(__dirname, 'templates', 'hook.js')),
    packages = ['amdefine', 'requirejs', 'notobo', 'browser-builtins'],
    exclusions = {
        'amdefine': true,
        'requirejs': true,
        'notobo': true
    },
    exists = fs.existsSync || path.existsSync,
    mkdir = fs.mkdirSync,
    endJsRegExp = /\.js^/;

function notobo(dir) {
    var existingHookContents, packageJson,
        npmCommand = 'npm --save-dev ' + packages.join(' '),
        nodeDir = path.join(dir, 'node_modules'),
        hooksDir = path.join(nodeDir, '.hooks'),
        installHookPath = path.join(hooksDir, 'install'),
        existingInstallHookComment = 'NOTOBO INSTALL HOOK';

    if (!dir) {
        console.log('Usage: ' + process.argv[1] + ' dirname\nFor more details: https://github.com/jrburke/notobo');
        return;
    }

    if (exists(dir)) {
        if (!exists(nodeDir)) {
            throw new Error(dir + ' must contain a node_modules directory.');
        }
    } else {
        mkdir(dir);
        mkdir(nodeDir);
        writeFile(path.join(dir, 'package.json'), JSON.stringify({
            name: dir,
            version: '0.0.0'
        }, null, '  '));
    }

    // Set up the hook
    if (!exists(hooksDir)) {
        mkdir(hooksDir);
    }

    if (exists(installHookPath)) {
        //If already an install script and not notobo, then exit.
        existingHookContents = readFile(installHookPath);
        if (existingHookContents.indexOf(existingInstallHookComment) === -1) {
            throw new Error(installHookPath + ' already exists and is not a notobo script.');
        }
    }

    writeFile(installHookPath, installHookScript);


    // Install packages used in the management of the project
    if (shelljs.exec(npmCommand).code !== 0) {
        throw new Error('npm command failed: ' + npmCommand);
    }

    fs.readdirSync(nodeDir).forEach(function(baseName) {
        if (baseName.indexOf('.') === 0 ||
            exclusions.hasOwnProperty(baseName)) {
            return;
        }
        notobo.convert(nodeDir, baseName);
    });

    // TODO: Update package.json to have package.json install script?
    packageJson = JSON.parse(readFile(path.join(dir, 'package.json')));
    // TODO FINISH ^
}

notobo.convert = function (nodeDir, baseName) {
    var packageDir = path.join(nodeDir, baseName),
        packageJson = JSON.parse(readFile(path.join(packageDir, 'package.json')));

    // Create main adapter.
    writeFile(packageDir + '.js', "define(['" + baseName + '/' + packageJson.main + "'], function(m){return m;});");

    // Find all .js files and wrap in define if appropriate.
    file.getFilteredFileList(packageDir, endJsRegExp).forEach(function (filePath) {
        notobo.makeAmd(filePath);
    });
};

notobo.convert = function (nodeDir, baseName) {
    var packageDir = path.join(nodeDir, baseName),
        packageJson = JSON.parse(readFile(path.join(packageDir, 'package.json'))),
        mainPath = packageDir + packageJson.main;

    // Find main.js, create adapter.
    writeFile(packageDir + '.js', "define(['" + baseName + '/' + packageJson.main + "'], function(m){return m;});");

    // Convert main file and its dependencies to AMD
    notobo.makeAmd(mainPath);

    // To consider: some packages may have support modules not referenced via
    // main module. For those cases, could use this deep scanner, but need to
    // be careful that it does not try to convert too much -- nested deps,
    // .js files that are not actually used in node or amd runtime.
    /*
    getFilteredFileList(packageDir, endJsRegExp).forEach(function (filePath) {
        notobo.makeAmd(filePath);
    });
    */
};

notobo.makeAmd = function (filePath) {
    if (!endJsRegExp.test(filePath)) {
        filePath += '.js';
    }

    var results = fromNode(filePath, readFile(filePath)),
        deps = results.deps || [];

    writeFile(filePath, results.contents);

    // Convert any dependencies for main file.
    deps.forEach(function(dep) {
        if (dep.indexOf('.') === 0) {
            // A local package file, convert.
            notobo.makeAmd(path.join(filePath, dep));
        }
    });
};


module.exports = notobo;
