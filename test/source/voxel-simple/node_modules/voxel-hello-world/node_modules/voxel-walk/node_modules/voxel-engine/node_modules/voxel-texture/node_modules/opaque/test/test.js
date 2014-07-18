var opaque = require('../')
  , assert = require('assert')

var images = [
  { src: '/bedrock.png', opaque: true }
, { src: '/brick.png', opaque: true }
, { src: '/maxogden.png', opaque: false }
, { src: '/substack.png', opaque: false }
, { src: '/bluewool.png', opaque: false }
, { src: '/diamond.png', opaque: false }
]

images.forEach(function(info) {
  var img = new Image
  img.onload = function() {
    var wrapper = document.createElement('div')
      , text = document.createElement('p')

    wrapper.appendChild(img)
    wrapper.appendChild(text)

    if (
      opaque(img) === info.opaque &&
      opaque.transparent(img) === !info.opaque
    ) {
      // Green = Success
      text.setAttribute('style', 'color:#8d3')
    } else {
      // Red = Fail
      text.setAttribute('style', 'color:#f53')
    }

    text.innerHTML = opaque(img) ? 'Opaque' : 'Transparent'

    document.body.appendChild(wrapper)
  };

  img.src = info.src
})
