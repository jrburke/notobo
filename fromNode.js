/*jshint node: true */
var parse = require('./parse');

function returnValue(contents, deps) {
    return {
        contents: contents,
        deps: deps
    };
}

function fromNode(fileName, fileContents, fakeFileContents) {

    var parseableFileContents = fakeFileContents || fileContents,
        deps;

    try {
        var preamble = '',
            commonJsProps = parse.usesCommonJs(fileName, parseableFileContents);

        //First see if the module is not already RequireJS-formatted.
        if (parse.usesAmdOrRequireJs(fileName, parseableFileContents) || !commonJsProps) {
            return returnValue(fileContents);
        }

        deps = parse.findCjsDependencies(fileName, parseableFileContents);

        if (commonJsProps.dirname || commonJsProps.filename) {
            preamble = 'var __filename = module.uri || "", ' +
                       '__dirname = __filename.substring(0, __filename.lastIndexOf("/") + 1); ';
        }

        //Construct the wrapper boilerplate.
        fileContents = 'define(function (require, exports, module) {' +
            preamble +
            fileContents +
            '\n});\n';

    } catch (e) {
        if (!fakeFileContents) {
            // Try once with a function wrapped contents, since some node
            // modules return at the top level, assuming they are really
            // wrapped when executing. Which is true since Node wraps
            // the modules in a function. The module is just not valid JS
            // though without the function wrapper
            return fromNode(filename, fileContents, 'function() {\n' + fileContents + '\n};');
        }
        console.log("commonJs.convert: COULD NOT CONVERT: " + fileName + ", so skipping it. Error was: " + e);
        return returnValue(fileContents);
    }

    return returnValue(fileContents, deps);
}

module.exports = fromNode;
