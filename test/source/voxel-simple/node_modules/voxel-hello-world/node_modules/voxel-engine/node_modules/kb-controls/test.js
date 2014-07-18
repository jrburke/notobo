var raf = require('raf')
  , kb = require('./index')

var pre = document.createElement('pre')

document.body.appendChild(pre)

var ctl = kb({
  '<left>': 'strafe_left'
, '<right>': 'strafe_right'
, '<up>': 'forward'
, '<down>': 'backward'
, 'W': 'forward'
, 'A': 'strafe_left'
, 'S': 'backward'
, 'D': 'strafe_right'
, '<mouse 1>': 'fire'
})

raf(document.body)
  .on('data', function(dt) {
    pre.textContents = pre.innerText = JSON.stringify(ctl)
  })
