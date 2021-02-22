import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { rad2Deg, deg2Rad } from '../AngleConverter';
import { WarResult, JsonResult, angle } from '../CommonInterfaces'

interface Doodad {
    type: string;
    variation: number;
    position: number[];
    angle: angle;
    scale: number[];
    skinId: string;
    flags: DoodadFlag;
    life: number;
    id: number;
}

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

export abstract class DoodadsTranslator {

    public static jsonToWar(doodadsJson: Doodad[]): WarResult {
        const outBufferToWar = new HexBuffer();
        /*
         * Header
         */
        outBufferToWar.addChars('W3do'); // file id
        outBufferToWar.addInt(8); // file version
        outBufferToWar.addInt(11); // subversion 0x0B
        outBufferToWar.addInt(doodadsJson.length); // num of trees

        /*
         * Body
         */
        doodadsJson.forEach((tree) => {
            outBufferToWar.addChars(tree.type);
            outBufferToWar.addInt(tree.variation || 0); // optional - default value 0
            outBufferToWar.addFloat(tree.position[0]);
            outBufferToWar.addFloat(tree.position[1]);
            outBufferToWar.addFloat(tree.position[2]);

            // Angle
            // Doodads format is unique because it uses radians for angles, as opposed
            // to angles in any other file which use degrees. Hence conversion is needed.
            //    war3map: Expects angle in RADIANS
            //    JSON: Spec defines angle in DEGREES
            outBufferToWar.addFloat(deg2Rad(tree.angle) || 0); // optional - default value 0

            // Scale
            if (!tree.scale) tree.scale = [1, 1, 1];
            outBufferToWar.addFloat(tree.scale[0] || 1);
            outBufferToWar.addFloat(tree.scale[1] || 1);
            outBufferToWar.addFloat(tree.scale[2] || 1);

            outBufferToWar.addChars(tree.skinId);

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
            outBufferToWar.addByte(treeFlag);

            outBufferToWar.addByte(tree.life || 100);
            outBufferToWar.addInt(0); // NOT SUPPORTED: random item table pointer: fixed to 0
            outBufferToWar.addInt(0); // NOT SUPPORTED: number of items dropped for item table
            outBufferToWar.addInt(tree.id);
        });

        /*
         * Footer
         */
        outBufferToWar.addInt(0); // special doodad format number, fixed at 0x00
        outBufferToWar.addInt(0); // NOT SUPPORTED: number of special doodads

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<Doodad[]> {
        const result = [];
        const outBufferToJSON = new W3Buffer(buffer);

        const fileId = outBufferToJSON.readChars(4); // W3do for doodad file
        const fileVersion = outBufferToJSON.readInt(); // File version = 8
        const subVersion = outBufferToJSON.readInt(); // 0B 00 00 00
        const numDoodads = outBufferToJSON.readInt(); // # of doodads

        for (let i = 0; i < numDoodads; i++) {
            const doodad: Doodad = {
                type: '',
                variation: 0,
                position: [0, 0, 0],
                angle: -1,
                scale: [0, 0, 0],
                skinId: '',
                flags: { visible: flag.visible, solid: flag.solid },
                life: -1,
                id: -1
            };

            doodad.type = outBufferToJSON.readChars(4);
            doodad.variation = outBufferToJSON.readInt();
            doodad.position = [outBufferToJSON.readFloat(), outBufferToJSON.readFloat(), outBufferToJSON.readFloat()]; // X Y Z coords

            // Angle
            // Doodads format is unique because it uses radians for angles, as opposed
            // to angles in any other file which use degrees. Hence conversion is needed.
            //    war3map: Expects angle in RADIANS
            //    JSON: Spec defines angle in DEGREES
            doodad.angle = rad2Deg(outBufferToJSON.readFloat());

            doodad.scale = [outBufferToJSON.readFloat(), outBufferToJSON.readFloat(), outBufferToJSON.readFloat()]; // X Y Z scaling
            doodad.skinId = outBufferToJSON.readChars(4);

            const flags: flag = outBufferToJSON.readByte();
            doodad.flags = {
                visible: flags === 1 || flags === 2,
                solid: flags === 2
            };

            doodad.life = outBufferToJSON.readByte(); // as a %

            // UNSUPPORTED: random item set drops when doodad is destroyed/killed
            // This section just consumes the bytes from the file
            const randomItemSetPtr = outBufferToJSON.readInt(); // points to an item set defined in the map (rather than custom one defined below)
            const numberOfItemSets = outBufferToJSON.readInt(); // this should be 0 if randomItemSetPtr is >= 0

            for (let j = 0; j < numberOfItemSets; j++) {
                // Read the item set
                const numberOfItems = outBufferToJSON.readInt();
                for (let k = 0; k < numberOfItems; k++) {
                    outBufferToJSON.readChars(4); // Item ID
                    outBufferToJSON.readInt(); // % chance to drop
                }
            }

            doodad.id = outBufferToJSON.readInt();

            result.push(doodad);
        }

        // UNSUPPORTED: Special doodads
        outBufferToJSON.readInt(); // special doodad format version set to '0'
        const numSpecialDoodads = outBufferToJSON.readInt();
        for (let i = 0; i < numSpecialDoodads; i++) {
            outBufferToJSON.readChars(4); // doodad ID
            outBufferToJSON.readInt();
            outBufferToJSON.readInt();
            outBufferToJSON.readInt();
        }

        return {
            errors: [],
            json: result
        };
    }
}
