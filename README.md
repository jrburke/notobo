* does not support *.json dependencies
* need to handle _stream_duplex, etc builtins?
  * also, like for 'url', needs 'punycode'? querystring has local modules
* test for natives mapped to empty in browserify
* node modules asking for 'module' will get AMD module object. OK though, since node one not usable in the browser. Although if a node module asks for 'module' and expects to get undefined back for the browser case, may need to change to rewriting those dependencies to 'moduleempty' or something like that.

### Niceties

* The internal lib/ modules are really in requirejs, so could just switch directly to that, but would need to update the consuming libraries to be async and also, make sure the toAmd -> commonJs supports the toAmd retry with a function wrapper.