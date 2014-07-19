//something here
requirejs.config({
  baseUrl: 'node_modules',
  paths: {
    mygame: '../mygame'
  }
});

requirejs(['mygame']);
