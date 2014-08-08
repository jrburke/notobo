
# notobo

Use modules installed via npm in AMD module projects, like projects that use [RequireJS](http://requirejs.org/).

## Why

Some people want to use npm to pull in dependencies for front end code, and then use a module system that allows dynamic module loading, and other features of an AMD module system, like loader plugins.

It also illustrates the separation of package manager from module format concerns, and gives more options for people that want a module loader on the front end instead of just module bundling.

For front end npm use, it also may give some feedback on how npm could be more usable for front end code.

## How it works

You can look at [test/source/nested](https://github.com/jrburke/notobo/tree/master/test/source/nested) to see the basic setup.

Once you install notobo, you can use [an example project](https://github.com/jrburke/notobo-example) to get started. That example project highlights some benefits of a front end module loader.

1) Install notobo. It is a command line utility that runs in Node, so install it with the -g flag:

    npm install -g notobo

2) Create a config.js file that sets the baseUrl to 'node_modules', and sets `nodeIdCompat` (a requirejs config option to allow Node-style dependency IDs that may have a '.js' extension explicitly mentioned.

3) npm install dependencies into node_modules.

4) In the directory where the `config.js` and `node_modules` lives , run:

    notobo config.js

5) notobo will modify the node_modules directory and config.js to conform to an AMD loader expectations.

## Description of modifications

The following changes are done to the files in node_modules:

* For each `packageName` directory, it creates a `packageName.js` file that just depends on the main module in that package.
* If the `packageName` directory ends in `.js`, then it renames it to not have that extension.
* It converts all .js files in the `packageName` directory to be an AMD module by wrapping it with `define(function(require, exports, module){})`.
* If the .js files reference native Node modules, notobo copies the browser-friendly packages that [browserify](http://browserify.org/) uses for those modules into the top-most `node_modules` directory.
* If the dependency ends in '.json', then it is converted to a 'json!' dependency, and a json.js and json-builder.js are placed in the node_modules directory, to handle json resources.
* If a module in the package uses `process` or `Buffer` globals, a `require()` dependency is inserted for those globals. Assumed globals are bad.

The config.js is modified to insert an [AMD map config](https://github.com/amdjs/amdjs-api/blob/master/CommonConfig.md#map-) for the nested node_modules.

notobo only needs to be run after an `npm install`. It does not run for every page load or as part of every build cycle.

## FAQ

### That is a gigantic map config in config.js!

Yeah, this points out one of the weaknesses of using npm for front end code. If npm would flatten dependency trees more, that has a direct impact on reducing the size of that config. `npm dedupe` may help you a bit, but as I understand it, that command still needs more work to fully realize its potential.

### Package X doesn't work!

There is a good chance it does not work in browserify either. Not all npm packages work in the browser, due to behaviors allowed in the Node module system that do not work in a networked file system like the browser.

If it is something that plugs in to Node's Module._extensions, like transpilers (CoffeeScript for example), then it is guaranteed not to work. The solution for front end code is to use [loader plugins](https://github.com/jrburke/requirejs/wiki/Plugins) for transpiled resources. They create a clear ownership/dependency chain that works for a network IO environment.

If there is an npm package that you would like to see working, feel free to [create an issue](https://github.com/jrburke/notobo/issues) describing the module and a test case that shows how it breaks.

It may not be possible to get it to work due to some fundamental incompatiblies in module systems that work in the networked IO of the browser and Node's synchronous, multiple file IO assumptions.

If you just distribute front end code that is already known to work as an AMD module, that will work fine. Or, if the module is a fairly straigtforward Node module it should work too.

See the [issues](https://github.com/jrburke/notobo/issues) or the [todo doc](https://github.com/jrburke/notobo/blob/master/docs/todo.md) for possible known issues.

### AMD modules in npm?

The npm folks have said it is fine to put in front end code in npm. Others have put browser globals-based code in there. So yes, it is fine.

npm is just about distributing packages of code that are installed in a node_modules nested fashion and uses package.json for declaring a 'main' and 'dependencies'.

The decision of what package manager to use is separate than the module format used at runtime for the modules. Choose the module format for those runtime concerns.

If you need the dynamic loading and loader plugin capabilities that are available to AMD modules, or is for code just for the front end, AMD modules are good choice.

If it is a utility that may also be useful in Node, the Node module format is a good choice. If you still want some of the benefits of AMD modules in Node, look at using [amdefine](https://github.com/jrburke/amdefine).

## npm sharp edges

The [npm sharp edges doc](https://github.com/jrburke/notobo/blob/master/docs/npm-sharp-edges.md) outlines some sharp edges around using npm for front end code.

## Bower option for main module

If you have bower-installed dependencies, instead of node_modules, then you can use notobo to create main module adapters for the main JS files in the bower packages. If the bower.json "main" entry is not a JS file, no adapter is written.

It will also try to convert CommonJS-style modules to `define()`-wrapped modules, but it does not do anything special for browser-globals based scripts.

So, no fancy shim auto configuration with notobo. This option should only be used for bower packages that are AMD or CommonJS modules. Not for browser globals packages.

If you need something fancier that wires up a module config for bower-based dependencies, then [grunt-bower-requirejs](https://github.com/yeoman/grunt-bower-requirejs) is likely a better fit.

Example use for reading a bower.json for the "main" value:

    notobo --alt-main-json=bower.json path/to/loader/config.js bower_components

If there is a package.json in the directory, notobo will still favor that over the bower.json for finding the "main" module ID.
