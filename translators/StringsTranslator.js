var BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer;

var StringsTranslator = function(outputPath, stringsJson) {
    outBuffer = new BufferedHexFileWriter(outputPath/*'war3map.wts'*/);
    
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