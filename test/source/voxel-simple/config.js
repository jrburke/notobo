//something here
requirejs.config({
  baseUrl: 'node_modules',
  nodeIdCompat: true,
  paths: {
    mygame: '../mygame'
  }
});

requirejs(['mygame']);
