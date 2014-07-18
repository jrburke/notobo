module.exports = Indexer;

function Indexer (opts) {
    if (!(this instanceof Indexer)) return new Indexer(opts);
    this.chunkSize = opts.chunkSize;
    this.cubeSize = opts.cubeSize;
}

Indexer.prototype.chunk = function (pos) {
    var chunkSize = this.chunkSize;
    var cubeSize = this.cubeSize;
    var cx = pos.x / cubeSize / chunkSize;
    var cy = pos.y / cubeSize / chunkSize;
    var cz = pos.z / cubeSize / chunkSize;
    var ckey = [ Math.floor(cx), Math.floor(cy), Math.floor(cz) ];
    return ckey.join('|');
};

Indexer.prototype.voxel = function (pos) {
    var size = this.chunkSize;
    var cubeSize = this.cubeSize;
    var vx = (size + Math.floor(pos.x / cubeSize) % size) % size;
    var vy = (size + Math.floor(pos.y / cubeSize) % size) % size;
    var vz = (size + Math.floor(pos.z / cubeSize) % size) % size;
    var x = Math.abs(vx);
    var y = Math.abs(vy);
    var z = Math.abs(vz);
    return x + y*size + z*size*size;
};
