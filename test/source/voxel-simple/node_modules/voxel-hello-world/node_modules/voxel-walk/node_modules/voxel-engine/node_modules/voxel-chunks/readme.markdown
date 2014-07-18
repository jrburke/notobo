# voxel-chunks

detached [voxel chunk geometry](http://voxeljs.com) with independent matrix
transforms on each chunk matrix collection

# example

See the [voxel-servo](https://github.com/substack/voxel-servo)
example for a more concrete use of this module.

# methods

``` js
var voxelChunks = require('voxel-chunks')
```

## var group = voxelChunks(game)

Given a [voxel-engine](https://github.com/maxogden/voxel-engine) `game`
instance, return a new voxel chunk group. The chunk matricies in each group have
their own matricies to independently transform their chunks.

## group.createBlock(pos, val)

Create a block at world coordinates `(pos.x, pos.y, pos.z)` in the
`pos.direction` direction from the existing block.

`pos.chunkMatrix` should be the chunk matrix instance to use to set the block to
`val`, a block value integer.

## group.setBlock(pos, val)

Set a block value to `val` at the woord coordinates `(pos.x, pos.y, pos.z)`.

`pos.chunkMatrix` should be the chunk matrix instance to use

## group.getBlock(pos)

Get the block at the world coordinates `(pos.x, pos.y, pos.z)` in the chunk
matrix instance `pos.chunkMatrix`.

## var ix = group.getIndex(pos)

Return an object with the chunk index `ix.chunk` and the voxel index `ix.voxel`
at the world coordinates `pos`.

## var cm = group.create(generate)

Create a new detached chunk matrix geometry to transform a collection of chunks.

The optional `generate(x,y,z)` function is used to generate blocks in the chunk
as necessary. It defaults to `return 0` (empty space).

## cm.setBlock(pos, value)

Set the block at the chunk-local coordinates `pos` to `value`.

## cm.getBlock(pos)

Get the block at the chunk-local coordinates `pos`.

# attributes

## group.meshes

An array of all the active chunk surface meshes in the scene. This array updates
every time an `'add'` or `'remove'` event occurs.

This array is useful for computing ray intersections with blocks in the scene.

## cm.rotation

chunk matrix rotation reference to the underlying rotation matrix

## cm.position

chunk matrix position reference to the underlying translation matrix

# events

## cm.on('add', function (surface) {})

Emitted when a chunk mesh gets computed.

## cm.on('remove', function (surface) {})

Emitted when a chunk mesh gets recomputed and the old `surface` mesh is no
longer active.

# install

With [npm](https://npmjs.org) do:

```
npm install voxel-chunks
```

# license

MIT
