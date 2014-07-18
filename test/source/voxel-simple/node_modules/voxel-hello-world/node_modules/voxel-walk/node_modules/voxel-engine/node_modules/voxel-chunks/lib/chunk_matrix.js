var voxelMesh = require('voxel-mesh');
var voxel = require('voxel');

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var indexer = require('./indexer');

module.exports = ChunkMatrix;
inherits(ChunkMatrix, EventEmitter);

function ChunkMatrix (game, generator) {
    var T = game.THREE;
    var size = game.cubeSize;
    
    var r = this.rotationObject = new T.Object3D;
    var t = this.translationObject = new T.Object3D;
    var inner = new T.Object3D;
    
    inner.add(r);
    t.add(inner);
    game.scene.add(t);
    
    inner.position.x = size / 2;
    inner.position.z = size / 2;
    
    this.generator = generator || function (x,y,z) { return 0 };
    this.rotation = r.rotation;
    this.position = t.position;
    this.chunks = {};
    this.meshes = {};
    this.game = game;
    this.indexer = indexer(game);
    
    this._update('0|0|0');
}

ChunkMatrix.prototype.generateChunk = function (ckey) {
    if (Array.isArray(ckey)) ckey = ckey.join('|');
    var xyz = ckey.split('|');
    
    var d = this.game.chunkSize;
    var low = [ xyz[0]*d, xyz[1]*d, xyz[2]*d ];
    var high = [ low[0]+d, low[1]+d, low[2]+d ];
    
    var chunk = voxel.generate(low, high, this.generator);
    this.chunks[ckey] = chunk;
    return chunk;
};

ChunkMatrix.prototype.setBlock = function (pos, value) {
    var ci = this.indexer.chunk(pos);
    var vi = this.indexer.voxel(pos);
    return this.setByIndex(ci, vi, value);
};

ChunkMatrix.prototype.getBlock = function (pos) {
    var ci = this.indexer.chunk(pos);
    var vi = this.indexer.voxel(pos);
    return this.getByIndex(ci, vi);
};

ChunkMatrix.prototype.setByIndex = function (ci, vi, value) {
    var ckey = typeof ci === 'object' ? ci.join('|') : ci
    if (!this.chunks[ckey]) this.generateChunk(ckey);
    this.chunks[ckey].voxels[vi] = value;
    this._update(ckey);
};

ChunkMatrix.prototype.getByIndex = function (ci, vi) {
    var ckey = typeof ci === 'object' ? ci.join('|') : ci;
    if (!this.chunks[ckey]) return undefined;
    return this.chunks[ckey].voxels[vi];
};
    
ChunkMatrix.prototype._update = function (ci) {
    var game = this.game;
    var T = game.THREE;
    var size = game.cubeSize;
    var csize = size * game.chunkSize;
    var scale = new T.Vector3(size, size, size);
    
    var ckey = typeof ci === 'object' ? ci.join('|') : ci;
    var chunk = this.chunks[ckey];
    if (!chunk) return;
    
    var mesh = voxelMesh(chunk, voxel.meshers.greedy, scale);
    
    if (this.meshes[ckey]) {
        var s = this.meshes[ckey].surfaceMesh || this.meshes[ckey].wireMesh;
        delete this.meshes[s.id];
        this.emit('remove', s);
        this.rotationObject.remove(s);
    }
    this.meshes[ckey] = mesh;
    
    if (game.meshType === 'wireMesh') {
        mesh.createWireMesh();
    }
    else {
        mesh.createSurfaceMesh(game.material);
    }
    
    var surface = mesh.surfaceMesh || mesh.wireMesh;
    surface.position.x = -size / 2;
    surface.position.z = -size / 2;
    
    var xyz = ckey.split('|');
    surface.position.x += xyz[0] * csize;
    surface.position.y += xyz[1] * csize;
    surface.position.z += xyz[2] * csize;
    
    this.rotationObject.add(surface);
    
    game.applyTextures(mesh.geometry);
    
    this.emit('add', surface, this);
    this.emit('update', chunk, ckey);
};
