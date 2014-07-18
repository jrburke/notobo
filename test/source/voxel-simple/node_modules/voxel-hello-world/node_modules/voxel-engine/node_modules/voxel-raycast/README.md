voxel-raycast
=============
Ray casting queries for voxel.js

Installation
============
Via npm:

    npm install voxel-raycast
    
Example
=======
Here is how you could use the library to make a ray query:

    var traceRay = require("voxel-raycast").bind({}, voxels);

    var hit_normal = new Array(3);
    var hit_position = new Array(3);
    var hit_block = traceRay([0,0,0], [1,0,0], 10.0, hit_positions, hit_normal);
    
    if(hit_block > 0) {
      console.log("Hit:", hit_block, hit_position, hit_normal);
    } else {
      console.log("Miss");
    }
    

### `require("voxel-raycast")(voxels, origin, direction, max_d[, hit_position, hit_normal, EPSILON])`
Casts a ray against a voxel.js game instance.

* `voxels` is the main voxel.js instance
* `origin` is the origin of the ray
* `direction` is the direction of the ray
* `max_d` is a limit on the distance the ray can travel
* `hit_position` is the point of impact of the ray and the voxel world
* `hit_normal` is the normal of the ray impact
* `EPSILON` is an optional floating point number giving the relative accuracy of the ray distance (default 1e-8)

Returns the block type of the voxel that the ray cast hit, or if no voxel was encountered returns 0 and hit_position is set to origin + direction * max_d.  To get the voxel coordinate, round the hit position down using Math.floor

If the the ray starts in a block or does not hit a voxel, the returned hit normal is [0,0,0]

Credits
=======
(c) 2013 Mikola Lysenko. BSD License
