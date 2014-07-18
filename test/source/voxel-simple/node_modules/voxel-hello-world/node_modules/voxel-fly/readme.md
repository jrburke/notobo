# voxel-fly

minecraft(TM) style double-tap jump button to go into fly mode, then use jump/crouch buttons to adjust altitude, and land if you hit the ground

### install
```
npm install voxel-fly
```

### example

```javascript
var fly = require('voxel-fly')
var makeFly = fly(game)
makeFly(physicalObject)
// physicalObject is most likely going to be your [voxel-player](https://github.com/substack/voxel-player)
// e.g.:
makeFly(game.controls.target())
```

## API

#### fly = require('fly')

require the module

#### var makeFly = fly(gameInstance)

Give it your game instance and it will return a function that you can use to make any physical object fly

#### var fly = makeFly(physicalObject, bindKeyEventsAutomatically)

`physicalObject` is most likely going to be your [voxel-player](https://github.com/substack/voxel-player)

`bindKeyEventsAutomatically` is true by default, set it to false to bypass the double-tap keyboard bindings

#### fly.bindKeyEvents(el)

If you chose not to bind key events at first you can bind them later to a specific element with this method

## License

BSD
