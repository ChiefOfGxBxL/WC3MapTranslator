import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult, angle, ITranslator } from '../CommonInterfaces';
enum TargetAcquisition {
    Normal = -1,
    Camp = -2
}

enum PlayerNumber {
    Red,
    Blue,
    Teal,
    Purple,
    Yellow,
    Orange,
    Green,
    Pink,
    Gray,
    LightBlue,
    DarkGreen,
    Brown,
    Maroon,
    Navy,
    Turquoise,
    Violet,
    Wheat,
    Peach,
    Mint,
    Lavender,
    Coal,
    Snow,
    Emerald,
    Peanut,
    NeutralHostile,
    NeutralXXX, // TODO: victim or extra?
    NeutralYYY, // TDOO: victim or extra?
    NeutralPassive
}

enum ItemClass {
    Any,
    Permanent,
    Charged,
    PowerUp,
    Artifact,
    Purchasable,
    Campaign,
    Miscellaneous
}

interface Unit {
    type: string;
    skinId?: string;
    position: number[];
    rotation: angle;
    scale: number[];
    hero: Hero;
    inventory: Inventory[];
    abilities: Abilities[];
    player: PlayerNumber;
    hitpoints?: number; // % of max
    mana?: number; // absolute value of max
    gold?: number;
    targetAcquisition?: TargetAcquisition;
    color: number;
    id: number;
    waygateRegionId?: number;
}

interface Hero {
    level: number;
    str: number;
    agi: number;
    int: number;
}

interface Inventory {
    slot: number; // the int is 0-based, but json format wants 1-6
    type: string; // Item ID
}

interface Abilities {
    ability: string; // Ability ID
    active: boolean; // autocast active? 0=no, 1=active
    level: number;
}

export abstract class UnitsTranslator extends ITranslator {
    public static readonly TargetAcquisition = TargetAcquisition;
    public static readonly PlayerNumber = PlayerNumber;
    public static readonly ItemClass = ItemClass;

    public static jsonToWar(unitsJson: Unit[]): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addChars('W3do');
        outBufferToWar.addInt(8);
        outBufferToWar.addInt(11);

        /*
         * Body
         */
        outBufferToWar.addInt(unitsJson.length); // number of units
        for (const unit of unitsJson) {
            outBufferToWar.addChars(unit.type); // type
            outBufferToWar.addInt(unit.variation || 0); // variation
            outBufferToWar.addFloat(unit.position[0]); // position x
            outBufferToWar.addFloat(unit.position[1]); // position y
            outBufferToWar.addFloat(unit.position[2]); // position z
            outBufferToWar.addFloat(unit.rotation || 0); // rotation angle

            if (!unit.scale) unit.scale = [1, 1, 1];
            outBufferToWar.addFloat(unit.scale[0]); // scale x
            outBufferToWar.addFloat(unit.scale[1]); // scale y
            outBufferToWar.addFloat(unit.scale[2]); // scale z

            outBufferToWar.addChars(unit.skinId || unit.type);

            // Unit flags
            outBufferToWar.addByte(0); // UNSUPPORTED: flags

            outBufferToWar.addInt(0); // unknown

            outBufferToWar.addInt(unit.player); // player #
            outBufferToWar.addByte(0); // (byte unknown - 0)
            outBufferToWar.addByte(0); // (byte unknown - 0)
            outBufferToWar.addInt(unit.hitpoints || -1); // hitpoints, -1 = unmodified
            outBufferToWar.addInt(unit.mana || -1); // mana, -1 = unmodified

            // Gold amount
            // Required if unit is a gold mine; if unit is not a gold mine, set to default 12500
            outBufferToWar.addInt(unit.gold || 12500);

            outBufferToWar.addFloat(unit.targetAcquisition || TargetAcquisition.Normal);

            // Unit hero attributes
            // Can be left unspecified, but values can never be below 1
            if (!unit.hero) unit.hero = { level: 1, str: 1, agi: 1, int: 1 };
            outBufferToWar.addInt(unit.hero.level);
            outBufferToWar.addInt(unit.hero.str);
            outBufferToWar.addInt(unit.hero.agi);
            outBufferToWar.addInt(unit.hero.int);

            // Inventory - - -
            if (!unit.inventory) unit.inventory = [];
            outBufferToWar.addInt(unit.inventory.length); // # items in inventory
            for (const item of unit.inventory) {
                outBufferToWar.addInt(item.slot - 1); // zero-index item slot
                outBufferToWar.addChars(item.type);
            }

            // Modified abilities - - -
            if (!unit.abilities) unit.abilities = [];
            outBufferToWar.addInt(unit.abilities.length); // # modified abilities
            for (const ability of unit.abilities) {
                outBufferToWar.addChars(ability.ability); // ability string
                outBufferToWar.addInt(+ability.active); // 0 = not active, 1 = active
                outBufferToWar.addInt(ability.level);
            }

            outBufferToWar.addInt(0);
            outBufferToWar.addInt(1);

            outBufferToWar.addInt(unit.color || unit.player); // custom color, defaults to owning player
            outBufferToWar.addInt(unit.waygateRegionId !== undefined ? unit.waygateRegionId : -1);
            outBufferToWar.addInt(unit.id); // id
        }

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<Unit[]> {
        const result = [];
        const outBufferToJSON = new W3Buffer(buffer);

        outBufferToJSON.readChars(4); // File ID: `W3do`
        outBufferToJSON.readInt(); // File version = 8
        outBufferToJSON.readInt(); // Sub-version: 0B 00 00 00
        const numUnits = outBufferToJSON.readInt(); // # of units

        for (let i = 0; i < numUnits; i++) {
            const unit: Unit = {
                type: '',
                variation: -1,
                position: [0, 0, 0],
                rotation: 0,
                scale: [0, 0, 0],
                hero: { level: 1, str: 1, agi: 1, int: 1 },
                inventory: [],
                abilities: [],
                player: 0,
                hitpoints: -1, // TODO: any optional values in interface should be removed from this obj
                mana: -1,
                gold: 0,
                targetAcquisition: TargetAcquisition.Normal,
                color: -1,
                id: -1
            };

            unit.type = outBufferToJSON.readChars(4); // (iDNR = random item, uDNR = random unit)
            unit.variation = outBufferToJSON.readInt();
            unit.position = [outBufferToJSON.readFloat(), outBufferToJSON.readFloat(), outBufferToJSON.readFloat()]; // X Y Z coords
            unit.rotation = outBufferToJSON.readFloat();
            unit.scale = [outBufferToJSON.readFloat(), outBufferToJSON.readFloat(), outBufferToJSON.readFloat()]; // X Y Z scaling

            const unitId = outBufferToJSON.readChars(4);
            if (unitId !== unit.type) unit.type = unitId;

            // UNSUPPORTED: flags
            outBufferToJSON.readByte(); // flags

            outBufferToJSON.readInt(); // Unknown

            unit.player = outBufferToJSON.readInt(); // (player1 = 0, 16=neutral passive); note: wc3 patch now has 24 max players

            outBufferToJSON.readByte(); // unknown
            outBufferToJSON.readByte(); // unknown

            unit.hitpoints = outBufferToJSON.readInt(); // -1 = use default
            unit.mana = outBufferToJSON.readInt(); // -1 = use default, 0 = unit doesn't have mana

            const gold = outBufferToJSON.readInt();
            if (gold !== 12500) unit.gold = gold; // TODO: what about gold mines with default amount of gold?

            unit.targetAcquisition = outBufferToJSON.readFloat();

            unit.hero = {
                level: outBufferToJSON.readInt(), // non-hero units = 1
                str: outBufferToJSON.readInt(),
                agi: outBufferToJSON.readInt(),
                int: outBufferToJSON.readInt()
            };

            const numItemsInventory = outBufferToJSON.readInt();
            for (let j = 0; j < numItemsInventory; j++) {
                unit.inventory.push({
                    slot: outBufferToJSON.readInt() + 1, // the int is 0-based, but json format wants 1-6
                    type: outBufferToJSON.readChars(4) // Item ID
                });
            }

            const numModifiedAbil = outBufferToJSON.readInt();
            for (let j = 0; j < numModifiedAbil; j++) {
                unit.abilities.push({
                    ability: outBufferToJSON.readChars(4), // Ability ID
                    active: !!outBufferToJSON.readInt(), // autocast active? 0=no, 1=active
                    level: outBufferToJSON.readInt()
                });
            }

            const randFlag = outBufferToJSON.readInt(); // random unit/item flag "r" (for uDNR units and iDNR items)
            if (randFlag === 0) {
                // 0 = Any neutral passive building/item, in this case we have
                //   byte[3]: level of the random unit/item,-1 = any (this is actually interpreted as a 24-bit number)
                //   byte: item class of the random item, 0 = any, 1 = permanent ... (this is 0 for units)
                //   r is also 0 for non random units/items so we have these 4 bytes anyway (even if the id wasnt uDNR or iDNR)
                outBufferToJSON.readByte();
                outBufferToJSON.readByte();
                outBufferToJSON.readByte();
                outBufferToJSON.readByte();
            } else if (randFlag === 1) {
                // 1 = random unit from random group (defined in the w3i), in this case we have
                //   int: unit group number (which group from the global table)
                //   int: position number (which column of this group)
                //   the column should of course have the item flag set (in the w3i) if this is a random item
                outBufferToJSON.readInt();
                outBufferToJSON.readInt();
            } else if (randFlag === 2) {
                // 2 = random unit from custom table, in this case we have
                //   int: number "n" of different available units
                //   then we have n times a random unit structure
                const numDiffAvailUnits = outBufferToJSON.readInt();
                for (let k = 0; k < numDiffAvailUnits; k++) {
                    outBufferToJSON.readChars(4); // Unit ID
                    outBufferToJSON.readInt(); // % chance
                }
            }

            unit.color = outBufferToJSON.readInt();

            // Waygate (-1 = deactivated, else it's the creation number of the target rect as in war3map.w3r)
            const waygateRegionId = outBufferToJSON.readInt();
            if (waygateRegionId !== -1) unit.waygateRegionId = waygateRegionId;

            unit.id = outBufferToJSON.readInt();

            result.push(unit);
        }

        return {
            errors: [],
            json: result
        };
    }
}
