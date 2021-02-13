import { HexBuffer } from '../HexBuffer';

export abstract class StringsTranslator {

    public static jsonToWar(stringsJson: object) {
        const outBufferToWar = new HexBuffer();

        /*
         * Strings
         */
        Object.keys(stringsJson).forEach((key) => {
            outBufferToWar.addString('STRING ' + key);
            outBufferToWar.addNewLine();
            outBufferToWar.addString('{');
            outBufferToWar.addNewLine();
            outBufferToWar.addString(stringsJson[key]);
            outBufferToWar.addNewLine();
            outBufferToWar.addString('}');
            outBufferToWar.addNewLine();
            outBufferToWar.addNewLine();
        });

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer) {
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
