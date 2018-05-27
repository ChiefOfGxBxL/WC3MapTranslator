let HexBuffer = require('../lib/HexBuffer'),
    W3Buffer = require('../lib/W3Buffer'),
    outBuffer;

const ImportsTranslator = {
    jsonToWar: function(imports) {
        outBuffer = new HexBuffer();

        /*
         * Header
         */
        outBuffer.addInt(1); // file version
        outBuffer.addInt(imports.length); // number of imports

        /*
         * Body
         */
        imports.forEach(function(importedFile) {
            outBuffer.addByte(
                importedFile.type === 'custom' ? 13 : 5
            );

            // Temporary: always start the file path with war3mapImported\ until other file support is added
            if(!importedFile.path.startsWith('war3mapImported\\') && importedFile.type === 'custom') {
                importedFile.path = 'war3mapImported\\' + importedFile.path;
            }

            outBuffer.addString(importedFile.path);
            outBuffer.addNullTerminator();
        });

        return {
            errors: [],
            buffer: outBuffer.getBuffer()
        };
    },
    warToJson: function(buffer) {
        let result = [],
            b = new W3Buffer(buffer);

        let fileVersion = b.readInt(); // File version
        let numImports = b.readInt(); // # of imports

        for(let i = 0; i < numImports; i++) {
            let typeValue = b.readByte();
            let typeEnum = {
                0: 'standard',
                5: 'standard',
                8: 'standard', // * preferred
                10: 'custom',
                13: 'custom'  // * preferred
            };

            let importedFile = {
                type: typeEnum[typeValue], // 5 or 8= standard path, 10 or 13: custom path
                path: b.readString() // e.g. "war3mapImported\mysound.wav"
            };

            result.push(importedFile);
        }

        return {
            errors: [],
            json: result
        };
    }
};

module.exports = ImportsTranslator;
