let BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer;

const StringsTranslator = function(stringsJson) {
    outBuffer = new BufferedHexFileWriter();

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
};

module.exports = StringsTranslator;
