define(function() {
  'use strict';
  var fs = require.nodeRequire('fs'),
      buildMap = {};

  function jsEscape(content) {
    return content.replace(/(['\\])/g, '\\$1')
                  .replace(/[\f]/g, '\\f')
                  .replace(/[\b]/g, '\\b')
                  .replace(/[\n]/g, '\\n')
                  .replace(/[\t]/g, '\\t')
                  .replace(/[\r]/g, '\\r')
                  .replace(/[\u2028]/g, '\\u2028')
                  .replace(/[\u2029]/g, '\\u2029');
  }

  return {
    load: function(name, req, onload, config) {
      try {
        var url = req.toUrl(name + '.json');
        var contents = fs.readFileSync(url, 'utf8');
        //Remove BOM (Byte Mark Order) from utf8 files if it is there.
        if (contents.indexOf('\uFEFF') === 0) {
          contents = contents.substring(1);
        }

        buildMap[name] = contents;

        var obj;
        try {
          obj = JSON.parse(contents);
        } catch (e) {
          return onload.error(e);
        }
        onload(obj);
      } catch (e) {
        onload.error(e);
      }
    },

    write: function (pluginName, moduleName, write, config) {
      if (buildMap.hasOwnProperty(moduleName)) {
        var content = jsEscape(buildMap[moduleName]);
        write.asModule(pluginName + '!' + moduleName,
                       'define(function () { return JSON.parse(\'' +
                           content +
                       '\');});\n');
      }
    }

  };
});
