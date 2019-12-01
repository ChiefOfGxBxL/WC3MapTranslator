import { HexBuffer } from '../HexBuffer';

export class StringsTranslator {
    public _outBufferToWar: HexBuffer;

    constructor() {
    }

    jsonToWar(stringsJson) {
        this._outBufferToWar = new HexBuffer();

        /*
         * Strings
         */
        Object.keys(stringsJson).forEach(function (key) {
            this._outBufferToWar.addString('STRING ' + key);
            this._outBufferToWar.addNewLine();
            this._outBufferToWar.addString('{');
            this._outBufferToWar.addNewLine();
            this._outBufferToWar.addString(stringsJson[key]);
            this._outBufferToWar.addNewLine();
            this._outBufferToWar.addString('}');
            this._outBufferToWar.addNewLine();
            this._outBufferToWar.addNewLine();
        });

        return {
            errors: [],
            buffer: this._outBufferToWar.getBuffer()
        };
    }

    warToJson(buffer) {
        let wts = buffer.toString().replace(/\r\n/g, '\n'), // may contain Windows linebreaks (\r\n), but below regex just assumes \n
            matchStringDefinitionBlock = new RegExp('STRING ([0-9]+)\n?(?:.*\n)?\{\n((?:.|\n)*?)\n}', 'g'); // see: https://regexr.com/3r572

        let result = {}, // stores the json form of strings file
            match; // stores individual matches as input is read

        while ((match = matchStringDefinitionBlock.exec(wts)) !== null) {
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