import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult, ITranslator } from '../CommonInterfaces';

enum ImportType {
    Standard = 'standard',
    Custom = 'custom'
}

interface Import {
    path: string;
    type: ImportType;
}

export abstract class ImportsTranslator extends ITranslator {
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

        outBufferToJSON.readInt(); // File version
        const numImports = outBufferToJSON.readInt(); // # of imports

        for (let i = 0; i < numImports; i++) {
            const typeValue = outBufferToJSON.readByte();
            const typeEnum: Record<number, ImportType> = {
                0: ImportType.Standard,
                5: ImportType.Standard,
                8: ImportType.Standard, // * preferred
                10: ImportType.Custom,
                13: ImportType.Custom // * preferred
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
