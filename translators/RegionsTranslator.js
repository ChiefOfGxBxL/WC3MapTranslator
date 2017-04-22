var BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer,
    Path = require('path');

var RegionsTranslator = function(regionsJson, outputPath) {
    var path = (outputPath) ? Path.join(outputPath, 'war3map.w3r') : 'war3map.w3r';
    outBuffer = new BufferedHexFileWriter(path);
    
    /* 
     * Header
     */
    outBuffer.addInt(5); // file version
    outBuffer.addInt(regionsJson.length); // number of regions
    
    /* 
     * Body
     */
    regionsJson.forEach(function(region) {
        // Position
        outBuffer.addFloat(region.position.left);
        outBuffer.addFloat(region.position.right);
        outBuffer.addFloat(region.position.bottom);
        outBuffer.addFloat(region.position.top);
        
        // Region name - must be null terminated
        outBuffer.addString(region.name);
        outBuffer.addNullTerminator();
        
        // Region id
        outBuffer.addInt(region.id);
        
        // Weather effect name - lookup necessary: char[4]
        outBuffer.addString(region.weatherEffect || '0000'); // Weather effect is optional - defaults to 0000 for "none"
        
        // Ambient sound - refer to names defined in .w3s file
        outBuffer.addString(region.ambientSound); // May be empty string
        outBuffer.addNullTerminator();
        
        // Color of region used by editor
        // Careful! The order in .w3r is BB GG RR, whereas the JSON spec order is [RR, GG, BB]
        outBuffer.addByte(region.color[2]);
        outBuffer.addByte(region.color[1]);
        outBuffer.addByte(region.color[0]);
        
        // End of structure - for some reason the .w3r needs this here;
        // Value is just left at 0, but not sure if it could be something else
        outBuffer.addByte(0);
    });
    
    return {
        write: function() {
            outBuffer.writeFile();
        }
    };
}

module.exports = RegionsTranslator;
