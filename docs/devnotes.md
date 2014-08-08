# Dev Notes

## Links

* [Details about the "browser" package.json property](https://gist.github.com/defunctzombie/4339901)

## Deep debugging commands

Test the voxel-simple transformation. Can set up a debug-brk with this too:

    rm -rf output && cp -r source output && ../bin/notobo output/voxel-simple/config.js output/voxel-simple/node_modules

## Low level notes

* node modules asking for 'module' will get AMD module object. OK though, since node one not usable in the browser. Although if a node module asks for 'module' and expects to get undefined back for the browser case, may need to change to rewriting those dependencies to 'moduleempty' or something like that.
