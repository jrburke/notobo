requirejs.config({
  baseUrl: 'node_modules',
  nodeIdCompat: true,
  paths: {
    main: '../main'
  }
});

require(['main']);
