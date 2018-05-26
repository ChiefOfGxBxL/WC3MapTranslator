let HexBuffer = require('../lib/HexBuffer'),
    outBuffer;

const StringsTranslator = {
    jsonToWar: function(stringsJson) {
        outBuffer = new HexBuffer();

        /*
         * Strings
         */
        Object.keys(stringsJson).forEach(function(key) {
            outBuffer.addString('STRING ' + key);
            outBuffer.addNewLine();
            outBuffer.addString('{');
            outBuffer.addNewLine();
            outBuffer.addString(stringsJson[key]);
            outBuffer.addNewLine();
            outBuffer.addString('}');
            outBuffer.addNewLine();
            outBuffer.addNewLine();
        });

        return {
            errors: [],
            buffer: outBuffer.getBuffer()
        };
    },
    warToJson: function(buffer) {}
};

module.exports = StringsTranslator;
