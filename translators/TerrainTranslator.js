var BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer,
    Path = require('path');

var TerrainTranslator = function(terrainJson, outputPath) {
    var path = (outputPath) ? Path.join(outputPath, 'war3map.w3e') : 'war3map.w3e';
    outBuffer = new BufferedHexFileWriter(path);
    
    /*
     * Header
     */
    outBuffer.addString('W3E!'); // file id
    outBuffer.addInt(11); // file version
    outBuffer.addChar(terrainJson.tileset); // base tileset
    outBuffer.addInt(+terrainJson.customtileset); // 1 = using custom tileset, 0 = not
        
    
    /*
     * Tiles
     */
    outBuffer.addInt(terrainJson.tilepalette.length);
    terrainJson.tilepalette.forEach(function(tile) {
        outBuffer.addString(tile);
    });
    
    
    /*
     * Cliffs
     */
    outBuffer.addInt(terrainJson.clifftilepalette.length);
    terrainJson.clifftilepalette.forEach(function(clifftile) {
        outBuffer.addString(clifftile);
    });
    
    
    /*
     * Map size data
     */
    outBuffer.addInt(terrainJson.map.width);
    outBuffer.addInt(terrainJson.map.height);
    
    // Unsupported
    // map.offset is not implemented yet.. so we hardcode
    outBuffer.addByte(0x00);outBuffer.addByte(0x00);outBuffer.addByte(0x80);outBuffer.addByte(0xc5);
    outBuffer.addByte(0x00);outBuffer.addByte(0x00);outBuffer.addByte(0x80);outBuffer.addByte(0xc5);
    //outBuffer.addFloat(terrainJson.map.offset.x);
    //outBuffer.addFloat(terrainJson.map.offset.y);
    

    /*
     * Tile points
     */
    for(var i = terrainJson.tiles.length - 1; i >= 0; i--) {
        // write each for of tiles
        terrainJson.tiles[i].forEach(function(tile) {
            outBuffer.addShort(tile[0]);            // height
            outBuffer.addShort(tile[1]);            // water
            outBuffer.addByte(tile[2]+''+tile[3]);  // flags/tile
            outBuffer.addByte(tile[4]);             // texture details
            outBuffer.addByte(tile[5]+''+tile[6]);  // cliff tile/layer
        });
    }
    
    return {
        write: function() {
            outBuffer.writeFile();
        }
    };
}

module.exports = TerrainTranslator;
