import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult } from '../CommonInterfaces'

enum ImportType {
    Standard = 'standard',
    Custom = 'custom'
}

interface Import {
    path: string;
    type: ImportType;
}

export class ImportsTranslator {

    public static jsonToWar(imports: Import[]): WarResult {
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
            outBufferToWar.addByte(
                importedFile.type === ImportType.Custom ? 13 : 5
            );

            // Temporary: always start the file path with war3mapImported\ until other file support is added
            if (!importedFile.path.startsWith('war3mapImported\\') && importedFile.type === ImportType.Custom) {
                importedFile.path = 'war3mapImported\\' + importedFile.path;
            }

            outBufferToWar.addString(importedFile.path);
        });

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<Import[]> {
        const result = [];
        const outBufferToJSON = new W3Buffer(buffer);

        const fileVersion = outBufferToJSON.readInt(); // File version
        const numImports = outBufferToJSON.readInt(); // # of imports

        for (let i = 0; i < numImports; i++) {
            const typeValue = outBufferToJSON.readByte();
            const typeEnum = {
                0: 'standard',
                5: 'standard',
                8: 'standard', // * preferred
                10: 'custom',
                13: 'custom'  // * preferred
            };

            const importedFile = {
                type: typeEnum[typeValue], // 5 or 8= standard path, 10 or 13: custom path
                path: outBufferToJSON.readString() // e.g. "war3mapImported\mysound.wav"
            };

            result.push(importedFile);
        }

        return {
            errors: [],
            json: result
        };
    }
}
