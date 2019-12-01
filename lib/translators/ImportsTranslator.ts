import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';

export class ImportsTranslator {

    public _outBufferToWar: HexBuffer;
    public _outBufferToJSON: W3Buffer;

    constructor() {
    }

    jsonToWar(imports) {
        this._outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        this._outBufferToWar.addInt(1); // file version
        this._outBufferToWar.addInt(imports.length); // number of imports

        /*
         * Body
         */
        imports.forEach(function (importedFile) {
            this._outBufferToWar.addByte(
                importedFile.type === 'custom' ? 13 : 5
            );

            // Temporary: always start the file path with war3mapImported\ until other file support is added
            if (!importedFile.path.startsWith('war3mapImported\\') && importedFile.type === 'custom') {
                importedFile.path = 'war3mapImported\\' + importedFile.path;
            }

            this._outBufferToWar.addString(importedFile.path);
            this._outBufferToWar.addNullTerminator();
        });

        return {
            errors: [],
            buffer: this._outBufferToWar.getBuffer()
        };
    }

    warToJson(buffer) {
        const result = [];
        this._outBufferToJSON = new W3Buffer(buffer);

        let fileVersion = this._outBufferToJSON.readInt(); // File version
        console.log("FILE VERSION: " + fileVersion);
        let numImports = this._outBufferToJSON.readInt(); // # of imports

        for (let i = 0; i < numImports; i++) {
            let typeValue = this._outBufferToJSON.readByte();
            let typeEnum = {
                0: 'standard',
                5: 'standard',
                8: 'standard', // * preferred
                10: 'custom',
                13: 'custom'  // * preferred
            };

            let importedFile = {
                type: typeEnum[typeValue], // 5 or 8= standard path, 10 or 13: custom path
                path: this._outBufferToJSON.readString() // e.g. "war3mapImported\mysound.wav"
            };

            result.push(importedFile);
        }

        return {
            errors: [],
            json: result
        };
    }
};
