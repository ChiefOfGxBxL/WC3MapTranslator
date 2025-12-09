import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult, ITranslator } from '../CommonInterfaces';

const CurrentPathVersion = 21;

export abstract class ImportsTranslator extends ITranslator {
    public static jsonToWar(imports: string[]): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addInt(1); // file version
        outBufferToWar.addInt(imports.length); // number of imports

        /*
         * Body
         */
        imports.forEach((importedFile) => {
            outBufferToWar.addByte(CurrentPathVersion);
            outBufferToWar.addString(importedFile);
        });

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<string[]> {
        const result = [];
        const outBufferToJSON = new W3Buffer(buffer);

        outBufferToJSON.readInt(); // File version

        const numImports = outBufferToJSON.readInt();
        for (let i = 0; i < numImports; i++) {
            outBufferToJSON.readByte(); // Path version (known values: 0, 5, 8, 10 13, 21)
            const path = outBufferToJSON.readString();
            result.push(path);
        }

        return {
            errors: [],
            json: result
        };
    }
}
