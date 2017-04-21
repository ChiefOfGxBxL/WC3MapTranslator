var BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer;

var TerrainTranslator = function(outputPath, terrainJson) {
    outBuffer = new BufferedHexFileWriter(outputPath/*'war3map.w3e'*/);
    
    /*
     * Header
     */
    outBuffer.addString('W3E!'); // file id
    outBuffer.addInt(11); // file version
    outBuffer.addChar(terrainJson.tileset); // subversion 0x0B
    outBuffer.addInt(+terrainJson.customtileset); // num of trees
        
    
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
            // TODO: below is test code to try out tiles
            outBuffer.addShort(tile[0]); // height
            outBuffer.addShort(tile[1]); // water
            outBuffer.addByte(tile[2]+''+tile[3]); // flags/tile
            outBuffer.addByte(tile[4]); // texture details
            outBuffer.addByte(tile[5]+''+tile[6]); // cliff tile/layer
            
            
            /* outBuffer.addShort(8192);
            outBuffer.addShort(0x2000);
            outBuffer.addByte(0x00);
            outBuffer.addByte(0x04);
            outBuffer.addByte(0xf2); */
        });
    }
    
    return {
        write: function() {
            outBuffer.writeFile();
        }
    };
}

module.exports = TerrainTranslator;