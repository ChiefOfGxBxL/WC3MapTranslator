let HexBuffer = require('../lib/HexBuffer'),
    outBuffer;

const ImportsTranslator = function(imports) {
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
        outBuffer.addByte(0); // 0 if starts with "war3mapImported\", otherwise 5 for custom path

        // Temporary: always start the file path with war3mapImported\ until other file support is added
        if(!importedFile.path.startsWith('war3mapImported\\')) {
            importedFile.path = 'war3mapImported\\' + importedFile.path;
        }

        outBuffer.addString(importedFile.path);
        outBuffer.addNullTerminator();
    });

    return {
        errors: [],
        buffer: outBuffer.getBuffer()
    };
};

module.exports = ImportsTranslator;
