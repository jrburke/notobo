module.exports = coordinates

var aabb = require('aabb-3d')
var events = require('events')

function coordinates(spatial, box, regionWidth) {
  var emitter = new events.EventEmitter()
  var lastRegion = [NaN, NaN, NaN]
  var thisRegion

  if (arguments.length === 2) {
    regionWidth = box
    box = aabb([-Infinity, -Infinity, -Infinity], [Infinity, Infinity, Infinity])
  }

  spatial.on('position', box, updateRegion)
  
  function updateRegion(pos) {
    thisRegion = [Math.floor(pos[0] / regionWidth), Math.floor(pos[1] / regionWidth), Math.floor(pos[2] / regionWidth)]
    if (thisRegion[0] !== lastRegion[0] || thisRegion[1] !== lastRegion[1] || thisRegion[2] !== lastRegion[2]) {
      emitter.emit('change', thisRegion)
    }
    lastRegion = thisRegion
  }
 
  return emitter
}