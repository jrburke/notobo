requirejs.config({
  baseUrl: 'node_modules',
  paths: {
    main: '../main'
  },
  map: {
    a: {
      c: 'a/node_modules/c',
      d: 'a/node_modules/d'
    },
    'a/node_modules/c': {
      e: 'a/node_modules/c/node_modules/e'
    }
  }
});

require(['main']);
