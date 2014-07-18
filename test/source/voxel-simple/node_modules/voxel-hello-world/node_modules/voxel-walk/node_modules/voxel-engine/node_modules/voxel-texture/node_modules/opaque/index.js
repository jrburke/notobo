function opaque(image) {
  var canvas, ctx

  if (image.nodeName.toLowerCase() === 'img') {
    canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)
  } else {
    canvas = image
    ctx = canvas.getContext('2d')
  }

  var imageData = ctx.getImageData(0, 0, canvas.height, canvas.width)
    , data = imageData.data

  for (var i = 3, l = data.length; i < l; i += 4)
    if (data[i] !== 255)
      return false

  return true
};

module.exports = opaque
module.exports.opaque = opaque
module.exports.transparent = function(image) {
  return !opaque(image)
};