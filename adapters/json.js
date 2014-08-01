define({
  pluginBuilder: './json-builder',

  load: function(name, req, onload, config) {
    var url = req.toUrl(name),
        xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.onreadystatechange = function(evt) {
      var status, err;
      if (xhr.readyState === 4) {
        status = xhr.status;
        if (status > 399 && status < 600) {
          //An http 4xx or 5xx error. Signal an error.
          err = new Error(url + ' HTTP status: ' + status);
          err.xhr = xhr;
          onload.error(err);
        } else {
          var obj;
          try {
            obj = JSON.parse(xhr.responseText);
          } catch (e) {
            return onload.error(e);
          }
          onload(obj);
        }
      }
    };
    xhr.responseType = 'text';
    xhr.send(null);
  }
});
