`npm install voxel-walk --save`
Spreading the good word.  Using --save updates your package.json automatically.

A simple walk cycle animation for minecraft-skin characters (used in Voxel.js), using code ripped directly out of Daniel Hede's "[Minecraft Items](http://djazz.mine.nu/lab/minecraft_items/)", the same project that birthed the minecraft-skin module.

[Run this example.](http://danfinlay.com/projects/voxeljs/walk/)
```
var walk = require('voxel-walk')
```
In your render loop you pass it a minecraft-skin object for each tick (npm minecraft-skin).  For example, if you hav a minecraft-skin named duck:
```
var render = function () {
	walk.render(duck)
}
```
When called, the walk function automatically detects the velocity of the skin, and eases the stride to an appropriate magnitude.

If you want to run the demo, just  run:
```
//If you don't have browserify installed:
npm install browserify -g

browserify demo.js -o bundle.js

//If you don't have http-server installed:
npm install http-server -g

http-server
```
