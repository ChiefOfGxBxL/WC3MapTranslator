import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult, ITranslator, expectVersion } from '../CommonInterfaces';

const CurrentPathVersion = 21;

export default abstract class ImportsTranslator extends ITranslator {
    public static jsonToWar(imports: string[]): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addInt(1); // file version

        /*
         * Body
         */
        outBufferToWar.addInt(imports.length); // number of imports
        for (const importedFile of imports) {
            outBufferToWar.addByte(CurrentPathVersion);
            outBufferToWar.addString(importedFile);
        }

        return {
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<string[]> {
        const result = [];
        const outBufferToJSON = new W3Buffer(buffer);

        expectVersion(1, outBufferToJSON.readInt()); // File version

        const numImports = outBufferToJSON.readInt();
        for (let i = 0; i < numImports; i++) {
            outBufferToJSON.readByte(); // Path version (known values: 0, 5, 8, 10 13, 21)
            const path = outBufferToJSON.readString();
            result.push(path);
        }

        return {
            json: result
        };
    }
}
