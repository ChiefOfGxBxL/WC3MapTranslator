let HexBuffer = require('../HexBuffer'),
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
    warToJson: function(buffer) {
        let wts = buffer.toString().replace(/\r\n/g, '\n'), // may contain Windows linebreaks (\r\n), but below regex just assumes \n
            matchStringDefinitionBlock = new RegExp('STRING ([0-9]+)\n?(?:.*\n)?\{\n((?:.|\n)*?)\n}', 'g'); // see: https://regexr.com/3r572

        let result = {}, // stores the json form of strings file
            match; // stores individual matches as input is read

        while((match = matchStringDefinitionBlock.exec(wts)) !== null) {
            let num = match[1],
                body = match[2];
            result[num] = body;
        }

        return {
            errors: [],
            json: result
        };
    }
};

module.exports = StringsTranslator;
