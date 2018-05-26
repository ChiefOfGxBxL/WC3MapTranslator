let HexBuffer = require('../lib/HexBuffer'),
    outBuffer;

const RegionsTranslator = {
    jsonToWar: function(regionsJson) {
        outBuffer = new HexBuffer();

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
            // Note that the .w3x guide has these coords wrong - the guide swaps bottom and right, but this is incorrect; bottom should be written before right
            outBuffer.addFloat(region.position.left);
            outBuffer.addFloat(region.position.bottom);
            outBuffer.addFloat(region.position.right);
            outBuffer.addFloat(region.position.top);

            // Region name - must be null terminated
            outBuffer.addString(region.name);
            outBuffer.addNullTerminator();

            // Region id
            outBuffer.addInt(region.id);

            // Weather effect name - lookup necessary: char[4]
            if(region.weatherEffect) {
                outBuffer.addString(region.weatherEffect); // Weather effect is optional - defaults to 0000 for "none"
            }
            else {
                // We can't put a string "0000", because ASCII 0's differ from 0x0 bytes
                outBuffer.addByte(0);
                outBuffer.addByte(0);
                outBuffer.addByte(0);
                outBuffer.addByte(0);
            }

            // Ambient sound - refer to names defined in .w3s file
            outBuffer.addString(region.ambientSound || ''); // May be empty string
            outBuffer.addNullTerminator();

            // Color of region used by editor
            // Careful! The order in .w3r is BB GG RR, whereas the JSON spec order is [RR, GG, BB]
            if(!region.color || region.color.length === 0) {
                outBuffer.addByte(255); // blue
                outBuffer.addByte(0);   // green
                outBuffer.addByte(0);   // red
            }
            else {
                outBuffer.addByte(region.color[2] || 0);   // blue
                outBuffer.addByte(region.color[1] || 0);   // green
                outBuffer.addByte(region.color[0] || 255); // red
            }

            // End of structure - for some reason the .w3r needs this here;
            // Value is set to 0xff based on observing the .w3r file, but not sure if it could be something else
            outBuffer.addByte(0xff);
        });

        return {
            errors: [],
            buffer: outBuffer.getBuffer()
        };
    },
    warToJson: function(buffer) {}
};

module.exports = RegionsTranslator;
