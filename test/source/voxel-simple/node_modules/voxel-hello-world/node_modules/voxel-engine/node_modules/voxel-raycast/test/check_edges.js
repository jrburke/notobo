var test = require("tap").test
var raycast = require("../raycast.js")

test("single block", function(t) {

  function assert_tolerance(a, b, str) {
    for(var i=0; i<3; ++i) {
      t.assert(Math.abs(a[i] - b[i]) < 1e-6, str + ": " + a.join(",") + " - " + b.join(","))
    }
  }
  
  
  var voxel = { getBlock: function(x,y,z) { return x === 0 && y === 0 && z === 0  ? 1 : 0; } }
  var hit_position = new Array(3)
  var hit_normal = new Array(3)

  t.equals(raycast(voxel, [-1, 0.5, 0.5], [1, 0, 0], 100, hit_position, hit_normal), 1)
  assert_tolerance(hit_position, [0, 0.5, 0.5], "-x position")
  assert_tolerance(hit_normal, [-1, 0, 0], "-x normal")

  t.equals(raycast(voxel, [2, 0.5, 0.5], [-1, 0, 0], 100, hit_position, hit_normal), 1)
  assert_tolerance(hit_position, [1, 0.5, 0.5], "+x position")
  assert_tolerance(hit_normal, [1, 0, 0], "+x normal")

  t.equals(raycast(voxel, [0.5, -1, 0.5], [0, 1, 0], 100, hit_position, hit_normal), 1)
  assert_tolerance(hit_position, [0.5, 0, 0.5], "-y position")
  assert_tolerance(hit_normal, [0, -1, 0], "-y normal")

  t.equals(raycast(voxel, [0.5, 2, 0.5], [0, -1, 0], 100, hit_position, hit_normal), 1)
  assert_tolerance(hit_position, [0.5, 1, 0.5], "+y position")
  assert_tolerance(hit_normal, [0, 1, 0], "+y normal")

  t.equals(raycast(voxel, [0.5, 0.5, -1], [0, 0, 1], 100, hit_position, hit_normal), 1)
  assert_tolerance(hit_position, [0.5, 0.5, 0], "-z position")
  assert_tolerance(hit_normal, [0, 0, -1], "-z normal")

  t.equals(raycast(voxel, [0.5, 0.5, 2], [0, 0, -1], 100, hit_position, hit_normal), 1)
  assert_tolerance(hit_position, [0.5, 0.5, 1], "+z position")
  assert_tolerance(hit_normal, [0, 0, 1], "+z normal")
  
  
  //Check distance
  for(var d=0.0; d<1.0; d+=0.1) {
    t.equals(raycast(voxel, [0.5, 0.5, -1.0], [0, 0, 1], d), 0, "distance")
  }
  t.equals(raycast(voxel, [0.5, 0.5, -1.0], [0, 0, 1], 1.0), 1, "distance")
  
  
  function check_hit(p, d) {
    if(p[0] === 1 || p[1] === 1 || p[2] === 1) {
      for(var i=0; i<3; ++i) {
        if(Math.floor(p[i] + 0.1 * d[i]) !== 0) {
          return false
        }
      }
    }
    return true;
  }
  
  //Check edge cases
  for(var x=0; x<=2; ++x) {
    for(var y=0; y<=2; ++y) {
      for(var z=0; z<=2; ++z) {
        var p = [0.5*x, 0.5*y, 0.5*z]
        for(var dx=-1; dx<=1; ++dx) {
          for(var dy=-1; dy<=1; ++dy) {
            for(var dz=-1; dz<=1; ++dz) {
              if(dx === 0 && dy === 0 && dz === 0) {
                continue
              }
              var d = [dx,dy,dz]
              var b = raycast(voxel, p, d, 10, hit_position, hit_normal);
              var w = (p[0]-0.5) * d[0] + (p[1]-0.5) * d[1] + (p[2]-0.5)*d[2]
     
              if(!check_hit(p, d)) {
                t.equals(b, 0, "expect miss:" + p + ";" + d + " -- poi: " + hit_position + "," + hit_normal)
              } else {
                t.equals(b, 1, "expect hit:" + p + "  " + d)
                assert_tolerance(hit_position, p, "poi")
              }
            }
          }
        }
      }
    }
  }
  
  t.end()
});