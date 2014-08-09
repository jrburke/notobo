requirejs.config({
  baseUrl: 'node_modules',
  nodeIdCompat: true,
  paths: {
    main: '../main'
  },
  map: {
    hasfalse: {
      imaginary: 'notobo-empty'
    },
    haslocal: {
      'haslocal/sub': 'haslocal/browser/sub'
    },
    hastop: {
      'colors-browser': 'hastop/node_modules/colors-browser',
      shirts: 'hastop/node_modules/shirts',
      colors: 'hastop/node_modules/colors-browser',
      'node-shapes': 'shapes'
    },
    'hastop/node_modules/colors-browser': {
      'hex-browser': 'hastop/node_modules/colors-browser/node_modules/hex-browser',
      hex: 'hastop/node_modules/colors-browser/node_modules/hex-browser'
    },
    'hastop/node_modules/shirts': {
      colors: 'hastop/node_modules/colors-browser'
    }
  }
});

require(['main']);
