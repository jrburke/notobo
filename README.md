
## notobo

Use modules installed via npm in an AMD module project. Still in early development.

## Why

Some people want to use npm to pull in dependencies for front end code, and then use a module system that allows dynamic module loading, and other features of an AMD module system, like loader plugins.

## How it works

For now, you can look at [test/source/nested](https://github.com/jrburke/notobo/tree/master/test/source/nested) to see the basic setup:

1) Install notobo. It is a command line utility that runs in node, so install it with the -g flag:

    npm install -g notobo

2) Create a config.js file that sets the baseUrl to 'node_modules', and sets `nodeIdCompat` (a requirejs config option to allow node-style dependency IDs that may have a '.js' extension explicitly mentioned.

3) npm install dependencies into node_modules.

4) In the directory where the `config.js` and `node_modules` lives , run:

    notobo config.js

5) notobo will modify the node_modules directory and config.js to conform to an AMD loader expectations.

## Description of modifications

The following changes are done to the files in node_modules:

* For each `packageName` directory, it creates a `packageName.js` file that just depends on the main module in that package.
* If the `packageName` directory ends in `.js`, then it renames it to not have that extension.
* It converts all .js files in the `packageName` directory to be an AMD module by wrapping it with `define(function(require, exports, module){})`.
* If the .js files reference native node modules, notobo copies the browser-friendly packages that [browserify](http://browserify.org/) uses for those modules into the top-most `node_modules` directory.
* If the dependency ends in '.json', then it is converted to a 'json!' dependency, and a json.js and json-builder.js are placed in the node_modules directory, to handle json resources.
* If a module in the package uses `process` or `Buffer` globals, a `require()` dependency is inserted for those globals. Assumed globals are bad.

The config.js is modified to insert an [AMD map config](https://github.com/amdjs/amdjs-api/blob/master/CommonConfig.md#map-) for the nested node_modules.

## FAQ

### OMG that is a gigantic map config in config.js!

Yeah, this points out one of the weaknesses of using npm for front end code. If npm would try to flatten dependency trees more, that has a direct impact on reducing the size of that config. `npm dedupe` may help you a bit, but as I understand it, that command still needs more work to fully realize its potential.

### Package X doesn't work!

Then it likely does not work in browserify either. Not all npm packages work in the browser, due to behaviors allowed in the node module system that do not work in a networked file system like the browser.

If you just distribute front end code that is already known to work as an AMD module, that will work fine. Or, if the module is a fairly straigtforward node module that does not use any of the native node modules, it should work too.

If there is an npm package that you would like to see working, feel free to [create an issue](https://github.com/jrburke/notobo/issues) describing the module and a test case that shows how it breaks.

### Are you suggesting putting AMD modules in npm?

The npm folks have said it is fine to put in front end code in npm. Others have put browser globals-based code in there. So yes, it is fine.

npm is just about distributing packages of code that are laid out in a node_modules nested fashion and uses package.json for declaring a 'main' and 'dependencies'.

## Philosophical stuff

Ideally a front end packager would have these features:

* Flatten the dependency tree, to avoid duplicate versions of a package, when possible, from being downloaded. For npm, I believe `npm dedupe` is supposed to fill that gap.
* Allow giving a local name for the dependency that is different from its global name. Related, allow installing forks of a package. For npm, it can fetch from github, but it has a bit of a problem dealing with version matches in that case. Hopefully that will improve over time.
* Allow installation of single JS files just in the baseUrl (node_modules in this case). This just avoids an extra file to point to the package main, and also, for committing dependencies to source control, less source control noise.

[volo](http://volojs.org/) has those features, uses GitHub as the registry, and is targeted for front end code that is modular. So it may be an alternative approach that may be useful if notobo does not fit your needs.

## Bower option for main module

If you have a listing of bower-installed dependencies, instead of node_modules, then you can use notobo to create main module adapters for the main JS files in the bower packages. If the bower.json "main" entry is not a JS file, no adapter is written.

It will also try to convert CommonJS-style modules to define() wrapped modules, but it does not do anything special for browser-globals based scripts. So, no fancy shim auto configuration with here.

This option should only be used for bower packages that are AMD or CommonJS modules.

Example use:

  notobo --alt-main-json=bower.json path/to/loader/config.js bower_components

If there is a package.json in the directory, notobo will still favor that over the bower.json for finding the "main" module ID.

## Still TODO

* sample starter project
* decision tree
* expand support for the "browser" property in package.json for alt modules. Only "main" use supported right now.
* test for natives mapped to empty in browserify.
* right now only dependencies that explicitly end in '.json' are found and converted to 'json!' dependencies. Need to find out if it is common to use the assumed '.json' file scanning and not include the '.json' extension.

### Less important TODOs

* The internal lib/ modules are really in requirejs, so could just switch directly to that, but would need to update the consuming libraries to be async and also, make sure the toAmd -> commonJs supports the toAmd retry with a function wrapper.

## Low level notes

* node modules asking for 'module' will get AMD module object. OK though, since node one not usable in the browser. Although if a node module asks for 'module' and expects to get undefined back for the browser case, may need to change to rewriting those dependencies to 'moduleempty' or something like that.
