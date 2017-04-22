var BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer,
    Path = require('path');

var DoodadsTranslator = function(doodadsJson, outputPath) {
    var path = (outputPath) ? Path.join(outputPath, 'war3map.doo') : 'war3map.doo';
    outBuffer = new BufferedHexFileWriter(path);
    
    /* 
     * Header
     */
    outBuffer.addString('W3do'); // file id
    outBuffer.addInt(8); // file version
    outBuffer.addInt(11); // subversion 0x0B
    outBuffer.addInt(doodadsJson.length); // num of trees
        
    /* 
     * Body
     */
    doodadsJson.forEach(function(tree) {
        outBuffer.addString(tree.type);
        outBuffer.addInt(tree.variation);
        outBuffer.addFloat(tree.position[0]);
        outBuffer.addFloat(tree.position[1]);
        outBuffer.addFloat(tree.position[2]);
        outBuffer.addFloat(tree.angle);
        outBuffer.addFloat(tree.scale[0]);
        outBuffer.addFloat(tree.scale[1]);
        outBuffer.addFloat(tree.scale[2]);
        outBuffer.addByte(2); // TODO: flags
        outBuffer.addByte(tree.life);
        outBuffer.addInt(0); // NOT SUPPORTED: random item table pointer: fixed to 0
        outBuffer.addInt(0); // NOT SUPPORTED: number of items dropped for item table
        outBuffer.addInt(tree.id);
    });

    /* 
     * Footer
     */
    outBuffer.addInt(0); // special doodad format number, fixed at 0x00
    outBuffer.addInt(0); // NOT SUPPORTED: number of special doodads
    
    return {
        write: function() {
            outBuffer.writeFile();
        }
    };
}

module.exports = DoodadsTranslator;
