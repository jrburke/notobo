# npm sharp edges

This is a list of sharp edges that come with using npm for front end code. If you know of existing bug numbers for some of these that are filed and in progress for npm, feel free to let me know and I can add links to them in the sections below.

Note that these are not a result of using an AMD loader. The challenges here are around ID resolution, not module format.

They result in any front end module loader that needs to have a single network IO lookup per module ID, and easy `baseUrl + moduleId + '.js'` convention to avoid big config blocks. The ES6 module loader would have these problems, and even a front end loader that allowed single module loads of CommonJS modules.

### Nested node_modules

npm favors nested node_modules to avoid version conflict issues. This is great for Node because it makes it easy to consume code, and Node typically runs in a place where it has direct, local file access and lots of file IO bandwidth and memory.

However, for front end code, the amount of code delivered over the wire is much more important, so trying to reduce the number of versions (or just duplicate copies of the same version) of a module is more important. Important enough that having an option to warn or block installs unless the developer makes a version choice can be useful.

`npm dedupe` can help a bit, but I understand that it still needs some improvements before it can be relied upon. It seems like it also requires some regular gardening when doing `npm install` later. It also does not flatten the list of packages, so it still leads to more map config for a front end loader.

What is likely wanted is something like a `npm flatten` command that will move all packages to the top-most node_modules directory, where possible. Or a package.json config option to specify "always flatten installs", and perhaps also warn/allow user to do manual version resolution to allow optimal flattening.

### Locked dependencies

The nested node_modules, coupled with the type of default semver style used by npm, and the more common practice in Node of not committing node_modules to source control leads to more variability for front end projects -- a future `npm install` for automated tests and deploys can result in unexpected behavior.

`npm shrinkwrap` might help, but also has some edges to it. See [npm-lockdown](https://github.com/mozilla/npm-lockdown) for some other thinking in that space.

For front end application code, it is best to just to commit the node_modules content to source control. By its nature, it locks the contents down, and removes a network dependency on a npm registry. This is really important for automated tooling, removing network dependencies that are not under your control.

### Extra metadata/file debris

For `npm install --save`, npm will complain if the package.json is missing these:

    "name": " ",
    "description": " ",
    "repository": " ",

and if a README is not in the directory. I can see the case for `npm publish` wanting these package.json fields, but for consumers, forcing those fields seems awkward, particularly for apps.

Similarly, the README is really only important for npm registry information, not useful to have on disk, and just creates more file debris. The package.json contains URLs to get more information if it is needed.

While not a specific fault of npm, if package authors are not used to looking inside the node_modules directory, they may not aggressively trim package contents via a .npmignore file. This becomes more of an issue for front end code that wants to commit code to their source control.

Encourage package authors to just get the installed directory to just be the package.json and the module code that is used at runtime.

### File layout convention

Node can do multiple IO lookups that have misses, but the browser should not take that approach. It would mean slower loading with 404 errors that would cause concern for the app developers.

One of the primary pieces of work notobo does is to fix this:

1) In the top-level node_modules directory, creates a `package.js` file next to the `package` directory, that just has a dependency on the to "main" module in `package`.

2) For nested node_modules, creates an AMD loader [map config](https://github.com/amdjs/amdjs-api/blob/master/CommonConfig.md#map-) so the loader can properly resolve IDs and only do one IO request.

For 1), a [packages config](https://github.com/amdjs/amdjs-api/blob/master/CommonConfig.md#packages-) is another option, but larger config blocks are unwieldy to view, and it means loading more up front information for modules that may not even be loaded until an app view is targeted much later, or if at all, by the user.

For 1) It would be ideal if there was an option for single file module packages just to be placed in `node_modules` directory, as `package.js`, which would be the main module. The package.json could be stored in a sibling `.packagejson` directory, so npm could refer to it later.

For 2), solutions for the [nested node_modules](#nested-node_modules) section would cut down that config.

### No local names

Allow giving a local name for the dependency that is different from its global name. Often, the global name is needed for package registry namespace issues, but does not make sense for local projects that already have a sub-culture that has shorthand names for things in that sub-culture.

An example is the [requirejs text loader plugin](https://github.com/requirejs/text). To install in a registry, it would likely need to be `requirejs-text`. However, in module code, users just want to use `text`.

npm can fetch from git and github, and that is how I suggest installing the requirejs text plugin if using npm (`npm install requirejs/text`), but npm has a bit of a problem dealing with version resolutions in that case. Hopefully that will improve over time.

It would be nice too if the local name could be different, so that if I did deploy to a registry as requirejs-text, it could just be `text` locally:

    "text": "requirejs-text@2.0.12"

