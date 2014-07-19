requirejs.config({
  baseUrl: 'node_modules',
  paths: {
    main: '../main'
  }
});

require(['main']);
