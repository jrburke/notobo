var cw = 400, ch = 550

var mouseX = 0
var mouseY = 0.1
var originMouseX = 0
var originMouseY = 0

var rad = 0

var isMouseOver = false
var isMouseDown = false

var counter = 0
var firstRender = true

var pausedTime = 0
var isRotating = true
var isPaused = false
var isYfreezed = false
var isFunnyRunning = false

window.duckWalk = require('./')

var skin = require('minecraft-skin')
window.duck = skin(THREE, 'neg.png')
var renderer = createRenderer(cw, ch)
var scene = createScene(renderer)
var camera = createCamera(scene)
var duckPlayer = duck.createPlayerObject()
duckPlayer.position.y -= 15
scene.add(duckPlayer)
window.duckPlayer = duckPlayer
render(scene, camera, renderer)

function createScene(width, height, renderer) {
  var scene = new THREE.Scene()
  var ambientLight, directionalLight
  ambientLight = new THREE.AmbientLight(0xaaaaaa)
  scene.add(ambientLight)
  var light  = new THREE.DirectionalLight( 0xffffff )
  light.position.set( Math.random(), Math.random(), Math.random() ).normalize()
  scene.add( light )
  return scene
}

function createRenderer() {
  var renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setSize(cw, ch)
  renderer.setClearColorHex(0xBFD1E5, 1.0)
  renderer.clear()
  var threecanvas = renderer.domElement
  document.body.appendChild(threecanvas)
  return renderer
}

function createCamera(scene) {
  var camera = new THREE.PerspectiveCamera(35, cw / ch, 1, 1000)
  camera.position.z = 50
  scene.add(camera)
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  
  return camera
}

function render(scene, camera, renderer) {
  window.webkitRequestAnimationFrame(function() {
    render(scene, camera, renderer)
  }, renderer.domElement)
  var oldRad = rad

  duckWalk.render(duck)
  
  mouseY *= 0.97
  rad += 2
  if (mouseY > 500) {
    mouseY = 500
  } else if (mouseY < -500) {
    mouseY = -500
  }                                       

  camera.position.x = -Math.cos(rad / (cw / 2) + (Math.PI / 0.9))
  camera.position.z = -Math.sin(rad / (cw / 2) + (Math.PI / 0.9))
  camera.position.y = (mouseY / (ch / 2)) * 1.5 + 0.2
  camera.position.setLength(70)
  camera.lookAt(new THREE.Vector3(0, 1.5, 0))
  
  renderer.render(scene, camera)
}
