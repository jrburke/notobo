/*jshint node: true */
var fs = require('fs'),
    path = require('path'),
    exists = fs.existsSync || path.existsSync;

function frontSlash(p) {
    return p.replace(/\\/g, '/');
}

var file = {
    exclusionRegExp: /^\./,

    getFilteredFileList: function (/*String*/startDir, /*RegExp*/regExpFilters, /*boolean?*/makeUnixPaths) {
        //summary: Recurses startDir and finds matches to the files that match regExpFilters.include
        //and do not match regExpFilters.exclude. Or just one regexp can be passed in for regExpFilters,
        //and it will be treated as the "include" case.
        //Ignores files/directories that start with a period (.) unless exclusionRegExp
        //is set to another value.
        var files = [], topDir, regExpInclude, regExpExclude, dirFileArray,
            i, stat, filePath, ok, dirFiles, fileName;

        topDir = startDir;

        regExpInclude = regExpFilters.include || regExpFilters;
        regExpExclude = regExpFilters.exclude || null;

        if (exists(topDir)) {
            dirFileArray = fs.readdirSync(topDir);
            for (i = 0; i < dirFileArray.length; i++) {
                fileName = dirFileArray[i];
                filePath = path.join(topDir, fileName);
                stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    if (makeUnixPaths) {
                        //Make sure we have a JS string.
                        if (filePath.indexOf("/") === -1) {
                            filePath = frontSlash(filePath);
                        }
                    }

                    ok = true;
                    if (regExpInclude) {
                        ok = filePath.match(regExpInclude);
                    }
                    if (ok && regExpExclude) {
                        ok = !filePath.match(regExpExclude);
                    }

                    if (ok && (!file.exclusionRegExp ||
                        !file.exclusionRegExp.test(fileName))) {
                        files.push(filePath);
                    }
                } else if (stat.isDirectory() &&
                          (!file.exclusionRegExp || !file.exclusionRegExp.test(fileName))) {
                    dirFiles = this.getFilteredFileList(filePath, regExpFilters, makeUnixPaths);
                    files.push.apply(files, dirFiles);
                }
            }
        }

        return files; //Array
    }
};

module.exports = file;
