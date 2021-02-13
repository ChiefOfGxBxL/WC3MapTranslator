import { HexBuffer } from '../HexBuffer';

export class StringsTranslator {
    private _outBufferToWar: HexBuffer;

    constructor() { }

    public jsonToWar(stringsJson: object) {
        this._outBufferToWar = new HexBuffer();

        /*
         * Strings
         */
        Object.keys(stringsJson).forEach((key) => {
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

    public warToJson(buffer: Buffer) {
        const wts = buffer.toString().replace(/\r\n/g, '\n'), // may contain Windows linebreaks (\r\n), but below regex just assumes \n
            matchStringDefinitionBlock = new RegExp('STRING ([0-9]+)\n?(?:.*\n)?\{\n((?:.|\n)*?)\n}', 'g'); // see: https://regexr.com/3r572

        const result = {}; // stores the json form of strings file
        let match; // stores individual matches as input is read

        // tslint:disable-next-line: no-conditional-assignment
        while ((match = matchStringDefinitionBlock.exec(wts)) !== null) {
            const num = match[1],
                body = match[2];
            result[num] = body;
        }

        return {
            errors: [],
            json: result
        };
    }
}
