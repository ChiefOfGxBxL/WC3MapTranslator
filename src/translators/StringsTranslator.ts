import { HexBuffer } from '../HexBuffer';
import { WarResult, JsonResult, ITranslator } from '../CommonInterfaces';

export abstract class StringsTranslator extends ITranslator {
    public static jsonToWar(stringsJson: Record<string, string>): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Strings
         */
        Object.keys(stringsJson).forEach((key) => {
            outBufferToWar.addChars('STRING ' + key);
            outBufferToWar.addNewLine();
            outBufferToWar.addChars('{');
            outBufferToWar.addNewLine();
            outBufferToWar.addChars(stringsJson[key]);
            outBufferToWar.addNewLine();
            outBufferToWar.addChars('}');
            outBufferToWar.addNewLine();
            outBufferToWar.addNewLine();
        });

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<object> {
        const wts = buffer.toString().replace(/\r\n/g, '\n'); // may contain Windows linebreaks (\r\n), but below regex just assumes \n
        const matchStringDefinitionBlock = /STRING ([0-9]+)\n?(?:.*\n)?{\n((?:.|\n)*?)\n}/g; // see: https://regexr.com/3r572

        const result: Record<string, string> = {}; // stores the json form of strings file
        let match; // stores individual matches as input is read

        while ((match = matchStringDefinitionBlock.exec(wts)) !== null) {
            const [, num, body] = match;
            result[num] = body;
        }

        return {
            errors: [],
            json: result
        };
    }
}
