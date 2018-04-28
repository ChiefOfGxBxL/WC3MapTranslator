let BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer,
    Path = require('path');

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
        write: function(outputPath) {
            const path = outputPath ? Path.join(outputPath, 'war3map.wts') : 'war3map.wts';
            outBuffer.writeFile(path);
        }
    };
};

module.exports = StringsTranslator;
