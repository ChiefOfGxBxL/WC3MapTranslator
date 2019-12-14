import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';

interface Doodad {
    type: string;
    variation: number;
    position: number[];
    angle: number;
    scale: number[];
    flags: DoodadFlag;
    life: number;
    id: number;
};

interface DoodadFlag {
    visible: any;
    solid: any;
}

enum flag {
    // 0= invisible and non-solid tree
    // 1= visible but non-solid tree
    // 2= normal tree (visible and solid)
    undefined = 0,
    visible = 1 || 2,
    solid = 3
}

export class DoodadsTranslator {
    public _outBufferToWar: HexBuffer;
    public _outBufferToJSON: W3Buffer;

    constructor() { }

    public jsonToWar(doodadsJson) {
        this._outBufferToWar = new HexBuffer();
        /*
         * Header
         */
        this._outBufferToWar.addString('W3do'); // file id
        this._outBufferToWar.addInt(8); // file version
        this._outBufferToWar.addInt(11); // subversion 0x0B
        this._outBufferToWar.addInt(doodadsJson.length); // num of trees

        /*
         * Body
         */
        doodadsJson.forEach((tree) => {
            this._outBufferToWar.addString(tree.type);
            this._outBufferToWar.addInt(tree.variation || 0); // optional - default value 0
            this._outBufferToWar.addFloat(tree.position[0]);
            this._outBufferToWar.addFloat(tree.position[1]);
            this._outBufferToWar.addFloat(tree.position[2]);
            this._outBufferToWar.addFloat(tree.angle || 0); // optional - default value 0

            // Scale
            if (!tree.scale) tree.scale = [1, 1, 1];
            this._outBufferToWar.addFloat(tree.scale[0] || 1);
            this._outBufferToWar.addFloat(tree.scale[1] || 1);
            this._outBufferToWar.addFloat(tree.scale[2] || 1);

            // Tree flags
            /* | Visible | Solid | Flag value |
               |   no    |  no   |     0      |
               |  yes    |  no   |     1      |
               |  yes    |  yes  |     2      | */
            let treeFlag = 2; // default: normal tree
            if (!tree.flags) tree.flags = { visible: true, solid: true }; // defaults if no flags are specified
            if (!tree.flags.visible && !tree.flags.solid) treeFlag = 0;
            else if (tree.flags.visible && !tree.flags.solid) treeFlag = 1;
            else if (tree.flags.visible && tree.flags.solid) treeFlag = 2;
            // Note: invisible and solid is not an option
            this._outBufferToWar.addByte(treeFlag);

            this._outBufferToWar.addByte(tree.life || 100);
            this._outBufferToWar.addInt(0); // NOT SUPPORTED: random item table pointer: fixed to 0
            this._outBufferToWar.addInt(0); // NOT SUPPORTED: number of items dropped for item table
            this._outBufferToWar.addInt(tree.id);
        });

        /*
         * Footer
         */
        this._outBufferToWar.addInt(0); // special doodad format number, fixed at 0x00
        this._outBufferToWar.addInt(0); // NOT SUPPORTED: number of special doodads

        return {
            errors: [],
            buffer: this._outBufferToWar.getBuffer()
        };
    }

    public warToJson(buffer) {
        const result = [];
        this._outBufferToJSON = new W3Buffer(buffer);

        const fileId = this._outBufferToJSON.readChars(4); // W3do for doodad file
        const fileVersion = this._outBufferToJSON.readInt(); // File version = 8
        const subVersion = this._outBufferToJSON.readInt(); // 0B 00 00 00
        const numDoodads = this._outBufferToJSON.readInt(); // # of doodads

        for (let i = 0; i < numDoodads; i++) {
            const doodad: Doodad = {
                type: "",
                variation: 0,
                position: [0, 0, 0],
                angle: -1,
                scale: [0, 0, 0],
                flags: { visible: flag.visible, solid: flag.solid },
                life: -1,
                id: -1
            };

            doodad.type = this._outBufferToJSON.readChars(4);
            doodad.variation = this._outBufferToJSON.readInt();
            doodad.position = [this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat()]; // X Y Z coords
            doodad.angle = this._outBufferToJSON.readFloat(); // angle in radians
            doodad.scale = [this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat()]; // X Y Z scaling

            const flags: flag = this._outBufferToJSON.readByte();
            doodad.flags = {
                visible: flags === 1 || flags === 2,
                solid: flags === 2
            };

            doodad.life = this._outBufferToJSON.readByte(); // as a %

            // UNSUPPORTED: random item set drops when doodad is destroyed/killed
            // This section just consumes the bytes from the file
            const randomItemSetPtr = this._outBufferToJSON.readInt(); // points to an item set defined in the map (rather than custom one defined below)
            const numberOfItemSets = this._outBufferToJSON.readInt(); // this should be 0 if randomItemSetPtr is >= 0

            for (let j = 0; j < numberOfItemSets; j++) {
                // Read the item set
                const numberOfItems = this._outBufferToJSON.readInt();
                for (let k = 0; k < numberOfItems; k++) {
                    this._outBufferToJSON.readChars(4); // Item ID
                    this._outBufferToJSON.readInt(); // % chance to drop
                }
            }

            doodad.id = this._outBufferToJSON.readInt();

            result.push(doodad);
        }

        // UNSUPPORTED: Special doodads
        this._outBufferToJSON.readInt(); // special doodad format version set to '0'
        const numSpecialDoodads = this._outBufferToJSON.readInt();
        for (let i = 0; i < numSpecialDoodads; i++) {
            this._outBufferToJSON.readChars(4); // doodad ID
            this._outBufferToJSON.readInt();
            this._outBufferToJSON.readInt();
            this._outBufferToJSON.readInt();
        }

        return {
            errors: [],
            json: result
        };
    }
}
