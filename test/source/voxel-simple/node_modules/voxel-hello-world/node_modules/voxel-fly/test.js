var textures = "http://commondatastorage.googleapis.com/voxeltextures/"
var game = require('voxel-hello-world')({
  texturePath: textures,
  playerSkin: textures + 'player.png'
})
var fly = require('./')
var makeFly = fly(game)
makeFly(game.controls.target())
window.game = game
