## TODO

* expand support for the "browser" property in package.json for alt modules. Only "main" use supported right now.
* test for natives mapped to empty in browserify.
* right now only dependencies that explicitly end in '.json' are found and converted to 'json!' dependencies. Need to find out if it is common to use the assumed '.json' file scanning and not include the '.json' extension.

## Less important TODOs

* The internal lib/ modules are really in requirejs, so could just switch directly to that, but would need to update the consuming libraries to be async and also, make sure the toAmd -> commonJs supports the toAmd retry with a function wrapper.
