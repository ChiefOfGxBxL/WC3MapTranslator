var BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer,
    Path = require('path');

var StringsTranslator = function(stringsJson, outputPath) {
    var path = (outputPath) ? Path.join(outputPath, 'war3map.wts') : 'war3map.wts';
    outBuffer = new BufferedHexFileWriter(path);
    
    /*
     * Strings
     */
    Object.keys(stringsJson).forEach(function(key) {
        outBuffer.addString("STRING " + key);
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
        write: function() {
            outBuffer.writeFile();
        }
    };
}

module.exports = StringsTranslator;