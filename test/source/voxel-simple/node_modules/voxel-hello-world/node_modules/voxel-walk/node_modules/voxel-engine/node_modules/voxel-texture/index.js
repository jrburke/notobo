var transparent = require('opaque').transparent;

function Texture(opts) {
  var self = this;
  if (!(this instanceof Texture)) return new Texture(opts || {});
  this.THREE              = opts.THREE          || require('three');
  this.materials          = [];
  this.texturePath        = opts.texturePath    || '/textures/';
  this.materialParams     = opts.materialParams || {};
  this.materialType       = opts.materialType   || this.THREE.MeshLambertMaterial;
  this.materialIndex      = [];
  this._materialDefaults  = { ambient: 0xbbbbbb };
  this.applyTextureParams = opts.applyTextureParams || function(map) {
    map.magFilter = self.THREE.NearestFilter;
    map.minFilter = self.THREE.LinearMipMapLinearFilter;
    map.wrapT     = self.THREE.RepeatWrapping;
    map.wrapS     = self.THREE.RepeatWrapping;
  }
}
module.exports = Texture;

Texture.prototype.load = function(names, opts) {
  var self = this;
  opts = self._options(opts);
  if (!isArray(names)) names = [names];
  if (!hasSubArray(names)) names = [names];
  return [].concat.apply([], names.map(function(name) {
    name = self._expandName(name);
    self.materialIndex.push([self.materials.length, self.materials.length + name.length]);
    return name.map(function(n) {
      if (n instanceof self.THREE.Texture) {
        var map = n;
        n = n.name;
      } else if (typeof n === 'string') {
        var map = self.THREE.ImageUtils.loadTexture(self.texturePath + ext(n));
      } else {
        var map = new self.THREE.Texture(n);
        n = map.name;
      }
      self.applyTextureParams.call(self, map);
      var mat = new opts.materialType(opts.materialParams);
      mat.map = map;
      mat.name = n;
      if (opts.transparent == null) self._isTransparent(mat);
      self.materials.push(mat);
      return mat;
    });
  }));
};

Texture.prototype.get = function(index) {
  if (index == null) return this.materials;
  if (typeof index === 'number') {
    index = this.materialIndex[index];
  } else {
    for (var i = 0; i < this.materials.length; i++) {
      if (index === this.materials[i].name) {
        index = i;
        break;
      }
    }
    for (var i = 0; i < this.materialIndex.length; i++) {
      var idx = this.materialIndex[i];
      if (index >= idx[0] && index < idx[1]) {
        index = idx;
        break;
      }
    }
  }
  return this.materials.slice(index[0], index[1]);
};

Texture.prototype._expandName = function(name) {
  if (name.top) return [name.back, name.front, name.top, name.bottom, name.left, name.right];
  if (!isArray(name)) name = [name];
  // load the 0 texture to all
  if (name.length === 1) name = [name[0],name[0],name[0],name[0],name[0],name[0]];
  // 0 is top/bottom, 1 is sides
  if (name.length === 2) name = [name[1],name[1],name[0],name[0],name[1],name[1]];
  // 0 is top, 1 is bottom, 2 is sides
  if (name.length === 3) name = [name[2],name[2],name[0],name[1],name[2],name[2]];
  // 0 is top, 1 is bottom, 2 is front/back, 3 is left/right
  if (name.length === 4) name = [name[2],name[2],name[0],name[1],name[3],name[3]];
  return name;
};

Texture.prototype._options = function(opts) {
  opts = opts || {};
  opts.materialType = opts.materialType || this.materialType;
  opts.materialParams = defaults(opts.materialParams || {}, this._materialDefaults, this.materialParams);
  opts.applyTextureParams = opts.applyTextureParams || this.applyTextureParams;
  return opts;
};

Texture.prototype.paint = function(geom) {
  var self = this;
  geom.faces.forEach(function(face, i) {
    var c = face.vertexColors[0];
    var index = Math.floor(c.b*255 + c.g*255*255 + c.r*255*255*255);
    index = self.materialIndex[Math.floor(Math.max(0, index - 1) % self.materialIndex.length)][0];

    // BACK, FRONT, TOP, BOTTOM, LEFT, RIGHT
    if      (face.normal.z === 1)  index += 1;
    else if (face.normal.y === 1)  index += 2;
    else if (face.normal.y === -1) index += 3;
    else if (face.normal.x === -1) index += 4;
    else if (face.normal.x === 1)  index += 5;

    face.materialIndex = index;
  });
};

Texture.prototype.sprite = function(name, w, h, cb) {
  var self = this;
  if (typeof w === 'function') { cb = w; w = null; }
  if (typeof h === 'function') { cb = h; h = null; }
  w = w || 16; h = h || w;
  var img = new Image();
  img.src = self.texturePath + ext(name);
  img.onerror = cb;
  img.onload = function() {
    var textures = [];
    for (var x = 0; x < img.width; x += w) {
      for (var y = 0; y < img.height; y += h) {
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
        var tex = new self.THREE.Texture(canvas);
        tex.name = name + '_' + x + '_' + y;
        tex.needsUpdate = true;
        textures.push(tex);
      }
    }
    cb(null, textures);
  };
  return self;
};

Texture.prototype._isTransparent = function(material) {
  if (!material.map) return;
  if (!material.map.image) return;
  if (material.map.image.nodeName.toLowerCase() === 'img') {
    material.map.image.onload = function() {
      if (transparent(this)) {
        material.transparent = true;
        material.needsUpdate = true;
      }
    };
  } else {
    if (transparent(material.map.image)) {
      material.transparent = true;
      material.needsUpdate = true;
    }
  }
};

function ext(name) {
  return (String(name).indexOf('.') !== -1) ? name : name + '.png';
}

// copied from https://github.com/joyent/node/blob/master/lib/util.js#L433
function isArray(ar) {
  return Array.isArray(ar) || (typeof ar === 'object' && Object.prototype.toString.call(ar) === '[object Array]');
}

function hasSubArray(ar) {
  var has = false;
  ar.forEach(function(a) { if (isArray(a)) { has = true; return false; } });
  return has;
}

function defaults(obj) {
  [].slice.call(arguments, 1).forEach(function(from) {
    if (from) for (var k in from) if (obj[k] == null) obj[k] = from[k];
  });
  return obj;
}
