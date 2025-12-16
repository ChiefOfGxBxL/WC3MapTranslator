import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { rad2Deg, deg2Rad } from '../AngleConverter';
import { WarResult, JsonResult, angle, ITranslator } from '../CommonInterfaces';

type ItemSet = Record<string, number>;

interface DoodadJson {
    regular: Doodad[];
    special?: SpecialDoodad[];
}

interface Doodad {
    type: string;
    variation: number;
    position: number[]; // float: [x, y, z]
    angle: angle;
    scale: number[];
    skinId: string;
    flags: DoodadFlag;
    life: number;
    id: number;
    randomItemSetId?: number;
    customItemSets?: ItemSet[];
}

interface SpecialDoodad {
    type: string;
    position: number[]; // int: [x, y, z], in w3e tile terms (0,0 is at top left)
}

interface DoodadFlag {
    // 0 = invisible, non-solid
    // 1 = visible, non-solid
    // 2 = visible, solid (normal)
    visible: boolean;
    solid: boolean;

    // adds 4 to the result
    fixedZ: boolean;
}

export default abstract class DoodadsTranslator extends ITranslator {
    public static jsonToWar(doodadsJson: DoodadJson): WarResult {
        const outBufferToWar = new HexBuffer();
        /*
         * Header
         */
        outBufferToWar.addChars('W3do'); // file id
        outBufferToWar.addInt(8); // file version
        outBufferToWar.addInt(11); // subversion 0x0B

        /*
         * Body
         */
        outBufferToWar.addInt(doodadsJson.regular.length); // num of regular doodads
        for (const doodad of doodadsJson.regular) {
            outBufferToWar.addChars(doodad.type);
            outBufferToWar.addInt(doodad.variation || 0); // optional - default value 0
            outBufferToWar.addFloat(doodad.position[0]);
            outBufferToWar.addFloat(doodad.position[1]);
            outBufferToWar.addFloat(doodad.position[2]);

            // Angle
            // Doodads format is unique because it uses radians for angles, as opposed
            // to angles in any other file which use degrees.
            //    war3map: Expects angle in RADIANS
            //    JSON: Spec defines angle in DEGREES
            outBufferToWar.addFloat(deg2Rad(doodad.angle) || 0); // optional - default value 0

            // Scale
            if (!doodad.scale) doodad.scale = [1, 1, 1];
            outBufferToWar.addFloat(doodad.scale[0] || 1);
            outBufferToWar.addFloat(doodad.scale[1] || 1);
            outBufferToWar.addFloat(doodad.scale[2] || 1);

            outBufferToWar.addChars(doodad.skinId);

            // Flags - not quite a bit-field, so can't assign bit masks
            /* | Visible | Solid | Flag value |
               |   no    |  no   |     0      |
               |  yes    |  no   |     1      |
               |  yes    |  yes  |     2      | */
            let treeFlag = 0;
            if (doodad.flags.visible) {
                treeFlag = (doodad.flags.solid) ? 2 : 1;
            }
            if (doodad.flags.fixedZ) treeFlag += 4;

            outBufferToWar.addByte(treeFlag);

            outBufferToWar.addByte(doodad.life || 100);

            // Item set from map
            outBufferToWar.addInt(doodad.randomItemSetId && doodad.randomItemSetId >= 0 ? doodad.randomItemSetId : -1); // use -1 to indicate none

            // Custom item set (global item set takes precedence over this if both are set)
            if (doodad.customItemSets && (!doodad.randomItemSetId || doodad.randomItemSetId === -1)) {
                outBufferToWar.addInt(doodad.customItemSets.length);

                for (const itemSet of doodad.customItemSets) {
                    outBufferToWar.addInt(Object.keys(itemSet).length);
                    for (const [itemId, dropChance] of Object.entries(itemSet)) {
                        outBufferToWar.addChars(itemId);
                        outBufferToWar.addInt(dropChance);
                    }
                }
            } else {
                outBufferToWar.addInt(0);
            }

            outBufferToWar.addInt(doodad.id);
        }

        /*
         * Footer
         */
        outBufferToWar.addInt(0); // special doodad format number, fixed at 0x00
        outBufferToWar.addInt(doodadsJson.special?.length || 0);
        for (const specialDoodad of doodadsJson.special || []) {
            outBufferToWar.addChars(specialDoodad.type);
            outBufferToWar.addInt(specialDoodad.position[2]);
            outBufferToWar.addInt(specialDoodad.position[0]);
            outBufferToWar.addInt(specialDoodad.position[1]);
        }

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<DoodadJson> {
        const result: DoodadJson = { regular: [], special: [] };
        const outBufferToJSON = new W3Buffer(buffer);

        outBufferToJSON.readChars(4); // File ID: `W3do` for doodad file
        outBufferToJSON.readInt(); // File version = 8
        outBufferToJSON.readInt(); // Sub-version: 0B 00 00 00

        const numDoodads = outBufferToJSON.readInt(); // # of regular doodads
        for (let i = 0; i < numDoodads; i++) {
            const doodad: Doodad = {
                type: '',
                variation: 0,
                position: [0, 0, 0],
                angle: -1,
                scale: [0, 0, 0],
                skinId: '',
                flags: { visible: true, solid: true, fixedZ: false },
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

            // Flags has weird logic since it doesn't appear to fully be a bit-field
            let flags = outBufferToJSON.readByte();
            if (flags > 4) {
                flags -= 4;
                doodad.flags.fixedZ = true;
            }
            doodad.flags.visible = flags >= 1;
            doodad.flags.solid = flags === 2;

            doodad.life = outBufferToJSON.readByte(); // as a %

            // Item sets
            const randomItemSetPtr = outBufferToJSON.readInt(); // randomItemSetPtr, points to an item set defined in the map (rather than custom one defined below)
            const numberOfItemSets = outBufferToJSON.readInt(); // this should be 0 if randomItemSetPtr is >= 0

            if (randomItemSetPtr >= 0) {
                doodad.randomItemSetId = randomItemSetPtr;
            } else if (numberOfItemSets) {
                doodad.customItemSets = [];

                for (let j = 0; j < numberOfItemSets; j++) {
                    const itemSet: Record<string, number> = {};
                    const numberOfItems = outBufferToJSON.readInt();
                    for (let k = 0; k < numberOfItems; k++) {
                        const itemId = outBufferToJSON.readChars(4); // Item ID
                        const dropChance = outBufferToJSON.readInt(); // % chance to drop
                        itemSet[itemId] = dropChance;
                    }
                    doodad.customItemSets.push(itemSet);
                }
            }

            doodad.id = outBufferToJSON.readInt();

            result.regular.push(doodad);
        }

        // Special doodads
        outBufferToJSON.readInt(); // special doodad format version set to '0'
        const numSpecialDoodads = outBufferToJSON.readInt();
        for (let i = 0; i < numSpecialDoodads; i++) {
            const id = outBufferToJSON.readChars(4);
            const posZ = outBufferToJSON.readInt();
            const posX = outBufferToJSON.readInt();
            const posY = outBufferToJSON.readInt();

            result.special?.push({
                type: id,
                position: [posX, posY, posZ]
            });
        }

        return {
            errors: [],
            json: result
        };
    }
}
