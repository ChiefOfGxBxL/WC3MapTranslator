import { HexBuffer } from '../HexBuffer';
import { WarResult, JsonResult, ITranslator } from '../CommonInterfaces';

interface StringRecord {
    comment?: string;
    value: string;
}

export abstract class StringsTranslator extends ITranslator {
    public static jsonToWar(stringsJson: Record<string, StringRecord>): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Strings
         */
        Object.keys(stringsJson).forEach((stringId) => {
            const w3String: StringRecord = stringsJson[stringId];

            outBufferToWar.addChars('STRING ' + stringId);
            outBufferToWar.addNewLine();
            if (w3String.comment) {
                outBufferToWar.addChars(w3String.comment);
            }
            outBufferToWar.addChars('{');
            outBufferToWar.addNewLine();
            outBufferToWar.addChars(w3String.value);
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

    private static matchStringDefinitionBlock = /STRING ([0-9]+)\r?\n?(\/\/.*\r?\n?)?{\r?\n((?:.|\r?\n)*?)\r?\n}/g; // see: https://regexr.com/8ii3d
    public static warToJson(buffer: Buffer): JsonResult<Record<string, StringRecord>> {
        const result: Record<string, StringRecord> = {}; // stores the json form of strings file

        let match: RegExpExecArray | null; // stores individual matches as input is read
        while ((match = this.matchStringDefinitionBlock.exec(buffer.toString('utf8'))) !== null) {
            const [, num, comment, value] = match;
            result[num] = { value };
            if (comment) result[num].comment = comment;
        }

        return {
            errors: [],
            json: result
        };
    }
}
