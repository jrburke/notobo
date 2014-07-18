# voxel-texture

> A texture helper for [voxeljs](http://voxeljs.com).

View [the demo](http://shama.github.com/voxel-texture).

## example

```js
// create a material engine
var materialEngine = require('voxel-texture')({texturePath: '/textures/'});

// load textures and it returns materials
var materials = materialEngine.load(['grass', 'dirt', 'grass_dirt']);

// use the materials to create a grass block
var cube = new game.THREE.Mesh(
  new game.THREE.CubeGeometry(game.cubeSize, game.cubeSize, game.cubeSize),
  new game.THREE.MeshFaceMaterial(materials)
);
```

Loaded materials can also be retrieved later using `get`:

```js
materialEngine.load([
  'obsidian',
  ['grass', 'dirt', 'grass_dirt'],
  'brick'
]);

var brick = new game.THREE.Mesh(
  new game.THREE.CubeGeometry(game.cubeSize, game.cubeSize, game.cubeSize),
  // find by the name
  new game.THREE.MeshFaceMaterial(materialEngine.get('brick'))
);

var grassBlock = new game.THREE.Mesh(
  new game.THREE.CubeGeometry(game.cubeSize, game.cubeSize, game.cubeSize),
  // or by the index
  new game.THREE.MeshFaceMaterial(materialEngine.get(1))
);
```

`materialEngine.load()` can be called mulitple times and the `materialIndex`
will just keep on incrementing.

To access the raw list of materials:

```js
var allLoadedMaterials = materialEngine.materials;
```

## api

### require('voxel-texture')(options)
Returns a new material engine instance. `options` defaults to:

```js
{
  THREE: require('three'),
  materials: [],
  texturePath: '/textures/',
  materialParams: { ambient: 0xbbbbbb },
  materialType: THREE.MeshLambertMaterial,
  materialIndex: [],
  applyTextureParams: function(map) {
    map.magFilter = this.THREE.NearestFilter;
    map.minFilter = this.THREE.LinearMipMapLinearFilter;
    map.wrapT     = this.THREE.RepeatWrapping;
    map.wrapS     = this.THREE.RepeatWrapping;
  }
}
```

### materialEngine.load(textures, options)
Loads textures into materials. Will generate materials in various ways depending
how textures are feed into `load`:

```js
var materials = materialEngine.load('grass');
// equals [grass, grass, grass, grass, grass, grass]
```

```js
var materials = materialEngine.load(['grass', 'dirt', 'grass_dirt']);
// equals [grass_dirt, grass_dirt, grass, dirt, grass_dirt, grass_dirt]
```

```js
var materials = materialEngine.load([
  'obsidian',
  ['back', 'front', 'top', 'bottom', 'left', 'right'],
  'brick'
]);
/*
equals [
  obsidian, obsidian, obsidian, obsidian, obsidian, obsidian,
  back, front, top, bottom, left, right,
  brick, brick, brick, brick, brick, brick
]
*/
```

If you've already created a texture, you can mix those in as well. Such as with
creating a canvas texture:

```js
var canvas = document.createElement('canvas');
// ... do your canvas drawing here ...
var texture = new game.THREE.Texture(canvas);

// load into the material engine
materialEngine.load(texture);
```

#### alternate file extension
If your texture isn't a `.png`, just specify the extension:

```js
var materials = materialEngine.load([
  'diamond',
  'crate.gif',
]);
```

### materialEngine.get(index)
Retrieves previously loaded textures. `index` refers to the index of the texture
group loaded, for instance:

```js
materialEngine.load([
  'obsidian',
  ['grass', 'dirt', 'grass_dirt'],
  'brick'
]);

var materials = materialEngine.get(1);
// equals [grass_dirt, grass_dirt, grass, dirt, grass_dirt, grass_dirt]

var materials = materialEngine.get(2);
// equals [brick, brick, brick, brick, brick, brick]
```

You can also use the texture name. It will match the first texture within a
group and return that group:

```js
var materials = materialEngine.get('dirt');
// equals [grass_dirt, grass_dirt, grass, dirt, grass_dirt, grass_dirt]
```

### materialEngine.paint(geometry)
Applies materials to geometries based on their vertex colors. This is what
`voxel-engine` uses to paint materials onto voxel meshes:

```js
// create a custom mesh and load all materials
var geom = new game.THREE.Geometry();
var mesh = new game.THREE.Mesh(
  geom,
  new game.THREE.MeshFaceMaterial(materialEngine.get())
);

// paint the geometry
materialEngine.paint(geom);
```

### materialEngine.sprite(name, w, h, cb)
Create textures from a sprite map. If you have a single image with a bunch of
textures do:

```js
// load terrain.png, it is 512x512
// each texture is 32x32
materialEngine.sprite('terrain', 32, function(err, textures) {
  // load textures into the material engine
  var materials = materialEngine.load(textures);

  // each material will be named: terrain_x_y
});
```

It is async because the image must be loaded before we can chop it up. The width
and height default to `16x16`.

### transparent
If you don't specify the `transparent` option then the transparency will
automatically detected with each texture then either turned on or off.

## install
With [npm](http://npmjs.org) do:

```
npm install voxel-texture
```

## release history
* 0.3.0 - refactored entire module. removed rotate. added load, get, paint, sprite methods. auto detect transparent.
* 0.2.2 - ability to set material type and params. thanks @hughsk!
* 0.2.1 - fix rotation of front and left textures when loading mesh
* 0.2.0 - ability to set multiple textures on voxel meshes
* 0.1.1 - fix texture sharpness
* 0.1.0 - initial release

## license
Copyright (c) 2013 Kyle Robinson Young  
Licensed under the MIT license.
