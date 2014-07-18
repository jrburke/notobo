# kb-controls

expose a polling object for (game) keybindings using [vkey](https://github.com/chrisdickinson/vkey/) definitions.

```javascript
var kb = require('./index')
  , raf = require('raf')

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

raf(document.body).on('data', function(dt) {
  console.log(!!ctl.forward)
})

```

### Why not events?

Events are great! I love them. But when you're writing game logic, oftentimes you want the frame event to drive the simulation -- and dealing with the keyboard as a separate evented interface can be troublesome in this regard.

## API

#### kb = require('raf')

return the `kb` function.

#### ctl = kb([DOMElement,] bindings[, augmentObject])

Add event listeners to `DOMElement` or `document.body` if not provided.

Bindings is a map of `vkey`'s to desired property names:

```javascript
// bindings example
{ 'X': 'do_something'
, '<space>': 'jump'
, '<control>': 'sprint' }

// would yield the following ctl object (sans methods):
{ 'do_something': 0
, 'jump': 0
, 'sprint': 0 }
```

If `augmentObject` is passed, these property names will be attached to it instead
of a new object.

#### ctl[yourPropertyName] -> Number

If the number is truthy, that means it's actively being pressed. Otherwise it's not. If it's
greater than 1, then two different keys may have been bound to the action and are simultaneously being pressed.

#### ctl.enable()

Enables the keyup, keydown, mouseup, and mousedown listeners (and makes them `preventDefault()`.)

#### ctl.enabled() -> boolean

Returns whether or not the `ctl` is enabled.

#### ctl.disable()

Disables the DOM listeners (without removing them). Keyboard and mouse events should work
as normal while the `ctl` is disabled.

#### ctl.destroy()

Removes all DOM event listeners and renders the `ctl` inert.

## License

MIT


