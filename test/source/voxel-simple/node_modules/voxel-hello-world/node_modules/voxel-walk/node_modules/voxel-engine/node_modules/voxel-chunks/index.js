var voxel = require('voxel');
var ChunkMatrix = require('./lib/chunk_matrix');
var indexer = require('./lib/indexer');

module.exports = Group;

function Group (game) {
    if (!(this instanceof Group)) return new Group(game);
    this.meshes = [];
    this.chunkMatricies = [];
    this.game = game;
    this.indexer = indexer(game);
}

Group.prototype.create = function (generate) {
    var self = this;
    var cm = new ChunkMatrix(self.game, generate);
    cm.on('add', function (mesh) {
        self.chunkMatricies[mesh.id] = cm;
        self.meshes.push(mesh);
    });
    cm.on('remove', function (id) {
        delete self.chunkMatricies[id];
    });
    self.chunkMatricies.push(cm);
    return cm;
};
 
Group.prototype.createBlock = function (pos, val) {
    var self = this;
    var T = self.game.THREE;
    var size = self.game.cubeSize;
    
    var cm = pos.chunkMatrix;
    var d = pos.direction;
    
    var mr = new T.Matrix4().getInverse(cm.rotationObject.matrix);
    var mt = new T.Matrix4().getInverse(cm.translationObject.matrix);
    var m = new T.Matrix4().multiply(mr, mt);
    
    
    return (function draw (offset) {
        var pt = new T.Vector3();
        pt.copy(pos);
        
        pt.x -= d.x * offset;
        pt.y -= d.y * offset;
        pt.z -= d.z * offset;
        offset += size / 8;
        
        var tr = m.multiplyVector3(pt);
        var ci = self.indexer.chunk(tr);
        var vi = self.indexer.voxel(tr);
        
        var value = cm.getByIndex(ci, vi);
        if (!value) {
            cm.setByIndex(ci, vi, 3);
            return true;
        }
        else draw(offset + 0.1)
    })(0)
};

Group.prototype.setBlock = function (pos, val) {
    var ix = this.getIndex(pos);
    var cm = pos.chunkMatrix;
    return cm.setByIndex(ix.chunk, ix.voxel, val);
};

Group.prototype.getBlock = function (pos) {
    var ix = this.getIndex(pos);
    var cm = pos.chunkMatrix;
    return cm.getByIndex(ix.chunk, ix.voxel);
};

Group.prototype.getIndex = function (pos) {
    var T = this.game.THREE;
    var cm = pos.chunkMatrix;
    
    var mr = new T.Matrix4().getInverse(cm.rotationObject.matrix);
    var mt = new T.Matrix4().getInverse(cm.translationObject.matrix);
    var m = new T.Matrix4().multiply(mt, mr);
    
    var tr = m.multiplyVector3(pos);
    var ci = this.indexer.chunk(tr);
    var vi = this.indexer.voxel(tr);
    
    return { chunk: ci, voxel: vi };
};
