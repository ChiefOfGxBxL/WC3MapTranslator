import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';

interface Region {
    position: Rect;
    name: string;
    id: number;
    weatherEffect: string;
    ambientSound: string;
    color: number[];
}

interface Rect {
    left: number;
    bottom: number;
    right: number;
    top: number;
}

export class RegionsTranslator {

    public _outBufferToWar: HexBuffer;
    public _outBufferToJSON: W3Buffer;

    constructor() { }

    public jsonToWar(regionsJson) {
        this._outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        this._outBufferToWar.addInt(5); // file version
        this._outBufferToWar.addInt(regionsJson.length); // number of regions

        /*
         * Body
         */
        regionsJson.forEach((region) => {
            // Position
            // Note that the .w3x guide has these coords wrong - the guide swaps bottom and right, but this is incorrect; bottom should be written before right
            this._outBufferToWar.addFloat(region.position.left);
            this._outBufferToWar.addFloat(region.position.bottom);
            this._outBufferToWar.addFloat(region.position.right);
            this._outBufferToWar.addFloat(region.position.top);

            // Region name - must be null terminated
            this._outBufferToWar.addString(region.name);
            this._outBufferToWar.addNullTerminator();

            // Region id
            this._outBufferToWar.addInt(region.id);

            // Weather effect name - lookup necessary: char[4]
            if (region.weatherEffect) {
                this._outBufferToWar.addString(region.weatherEffect); // Weather effect is optional - defaults to 0000 for "none"
            } else {
                // We can't put a string "0000", because ASCII 0's differ from 0x0 bytes
                this._outBufferToWar.addByte(0);
                this._outBufferToWar.addByte(0);
                this._outBufferToWar.addByte(0);
                this._outBufferToWar.addByte(0);
            }

            // Ambient sound - refer to names defined in .w3s file
            this._outBufferToWar.addString(region.ambientSound || ''); // May be empty string
            this._outBufferToWar.addNullTerminator();

            // Color of region used by editor
            // Careful! The order in .w3r is BB GG RR, whereas the JSON spec order is [RR, GG, BB]
            if (!region.color || region.color.length === 0) {
                this._outBufferToWar.addByte(255); // blue
                this._outBufferToWar.addByte(0);   // green
                this._outBufferToWar.addByte(0);   // red
            } else {
                this._outBufferToWar.addByte(region.color[2] || 0);   // blue
                this._outBufferToWar.addByte(region.color[1] || 0);   // green
                this._outBufferToWar.addByte(region.color[0] || 255); // red
            }

            // End of structure - for some reason the .w3r needs this here;
            // Value is set to 0xff based on observing the .w3r file, but not sure if it could be something else
            this._outBufferToWar.addByte(0xff);
        });

        return {
            errors: [],
            buffer: this._outBufferToWar.getBuffer()
        };
    }

    public warToJson(buffer) {
        const result = [];
        this._outBufferToJSON = new W3Buffer(buffer);

        let fileVersion = this._outBufferToJSON.readInt(), // File version
            numRegions = this._outBufferToJSON.readInt(); // # of regions

        for (let i = 0; i < numRegions; i++) {
            const region: Region = {
                name: '',
                id: 0,
                weatherEffect: '',
                ambientSound: '',
                color: [0, 0, 0],
                position: {
                    left: 0,
                    bottom: 0,
                    right: 0,
                    top: 0
                }
            };

            region.position.left = this._outBufferToJSON.readFloat();
            region.position.bottom = this._outBufferToJSON.readFloat();
            region.position.right = this._outBufferToJSON.readFloat();
            region.position.top = this._outBufferToJSON.readFloat();
            region.name = this._outBufferToJSON.readString();
            region.id = this._outBufferToJSON.readInt();
            region.weatherEffect = this._outBufferToJSON.readChars(4);
            region.ambientSound = this._outBufferToJSON.readString();
            region.color = [
                this._outBufferToJSON.readByte(), // red
                this._outBufferToJSON.readByte(), // green
                this._outBufferToJSON.readByte() // blue
            ];
            region.color.reverse(); // json wants it in RGB, but .w3r file stores it as BB GG RR
            this._outBufferToJSON.readByte(); // end of region structure

            result.push(region);
        }

        return {
            errors: [],
            json: result
        };
    }
};
