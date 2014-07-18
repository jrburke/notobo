# pin-it

pin object updates to the top right of your screen. minimally styled.

```javascript

var pin = require('pin-it')
  , obj = {x: 1, y:2}           // assume this changes every frame

setInterval(function() {
    pin(obj)
})

```

![a better example](http://f.cl.ly/items/3l0P223F46133u15193J/Screen%20Shot%202013-02-02%20at%203.06.18%20PM.png)

# API

### pin(obj[, updateEveryMS=0])

create-or-update a pinned value. pins are unique to the line they originated from. 

# license

MIT
