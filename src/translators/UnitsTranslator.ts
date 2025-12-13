import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult, angle, ITranslator } from '../CommonInterfaces';
import { deg2Rad, rad2Deg } from '../AngleConverter';

enum TargetAcquisition {
    // There also exists value 0, observed for: sloc, iDNR
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

interface RandomEntityAny {
    level: number;
    class: ItemClass;
}

interface RandomEntityGlobal {
    group: number;
    position: number;
}

type UnitSet = Record<string, number>;
type RandomEntity = RandomEntityAny | RandomEntityGlobal | UnitSet;

function isRandomEntityAny (randomEntity: RandomEntity): randomEntity is RandomEntityAny {
    return (randomEntity as RandomEntityAny).level !== undefined && (randomEntity as RandomEntityAny).class !== undefined;
}

function isRandomEntityGlobal (randomEntity: RandomEntity): randomEntity is RandomEntityGlobal {
    return (randomEntity as RandomEntityGlobal).group !== undefined && (randomEntity as RandomEntityGlobal).position !== undefined;
}

function isRandomEntityUnitSet (randomEntity: RandomEntity): randomEntity is UnitSet {
    return Object.keys((randomEntity as UnitSet)).length !== 0;
}

interface Unit {
    type: string;
    variation?: number;
    skinId?: string;
    position: number[];
    rotation?: angle;
    hero?: Hero;
    inventory?: Inventory[];
    abilities?: Abilities[];
    player: PlayerNumber;
    hitpoints?: number; // % of max
    mana?: number; // absolute value of max
    gold?: number;
    targetAcquisition?: TargetAcquisition;
    color?: number;
    id: number;
    randomItemSetId?: number;
    customItemSets?: UnitSet[];
    waygateRegionId?: number;
    randomEntity?: RandomEntity;
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
            outBufferToWar.addFloat(deg2Rad(unit.rotation || 0)); // rotation angle

            // Scale x, y, z: has no effect
            outBufferToWar.addFloat(1);
            outBufferToWar.addFloat(1);
            outBufferToWar.addFloat(1);

            outBufferToWar.addChars(unit.skinId || unit.type);

            outBufferToWar.addByte(2); // Flags: presumably always "2", possibly related to doodad flags where 2 signifies "solid/visible"

            outBufferToWar.addInt(unit.player); // player #

            outBufferToWar.addByte(0); // (byte unknown - 0)
            outBufferToWar.addByte(0); // (byte unknown - 0)

            outBufferToWar.addInt(unit.hitpoints || -1); // hitpoints, -1 = unmodified
            outBufferToWar.addInt(unit.mana || -1); // mana, -1 = unmodified

            // random item set: global
            outBufferToWar.addInt(unit.randomItemSetId && unit.randomItemSetId >= 0 ? unit.randomItemSetId : -1); // use -1 to indicate none

            // random item set: custom
            if (unit.customItemSets && (!unit.randomItemSetId || unit.randomItemSetId === -1)) {
                outBufferToWar.addInt(unit.customItemSets.length);

                for (const itemSet of unit.customItemSets) {
                    outBufferToWar.addInt(Object.keys(itemSet).length);
                    Object.entries(itemSet).forEach(([itemId, dropChance]) => {
                        outBufferToWar.addChars(itemId);
                        outBufferToWar.addInt(dropChance);
                    });
                }
            } else {
                outBufferToWar.addInt(0); // dropped item sets
            }

            // Gold amount
            // Required if unit is a gold mine; if unit is not a gold mine, set to default 12500
            // Starting location "unit" always has a value of 0 gold
            outBufferToWar.addInt(unit.type === 'sloc' ? 0 : (unit.gold || 12500))

            outBufferToWar.addFloat(unit.targetAcquisition || TargetAcquisition.Normal);

            // Unit hero attributes
            if (!unit.hero) unit.hero = { level: 1, str: 0, agi: 0, int: 0 };
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

            // Random flag
            if (!['uDNR', 'iDNR'].includes(unit.type)) {
                outBufferToWar.addInt(0);
                outBufferToWar.addInt(1);
            } else if (unit.randomEntity) {
                if (isRandomEntityAny(unit.randomEntity)) {
                    outBufferToWar.addInt(0);
                    outBufferToWar.addInt24(unit.randomEntity.level);
                    outBufferToWar.addByte(unit.type === 'iDNR' ? unit.randomEntity.class : 0);
                } else if (isRandomEntityGlobal(unit.randomEntity)) {
                    outBufferToWar.addInt(1);
                    outBufferToWar.addInt(unit.randomEntity.group);
                    outBufferToWar.addInt(unit.randomEntity.position);
                } else if (isRandomEntityUnitSet(unit.randomEntity)) {
                    outBufferToWar.addInt(2);
                    outBufferToWar.addInt(Object.keys(unit.randomEntity).length); // number of units in random table
                    Object.entries(unit.randomEntity).forEach(([id, chance]) => {
                        outBufferToWar.addChars(id);
                        outBufferToWar.addInt(chance);
                    });
                }
            }

            outBufferToWar.addInt(unit.color || -1); // custom color, -1 defaults to owning player
            outBufferToWar.addInt(unit.waygateRegionId !== undefined ? unit.waygateRegionId : -1);
            outBufferToWar.addInt(unit.id);
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
                position: [0, 0, 0],
                rotation: 0,
                hero: { level: 1, str: 1, agi: 1, int: 1 },
                player: 0,
                id: -1
            };

            unit.type = outBufferToJSON.readChars(4); // (iDNR = random item, uDNR = random unit)

            const variation = outBufferToJSON.readInt();
            if (variation !== 0) unit.variation = variation;
            
            unit.position = [outBufferToJSON.readFloat(), outBufferToJSON.readFloat(), outBufferToJSON.readFloat()]; // X Y Z coords
            unit.rotation = rad2Deg(outBufferToJSON.readFloat());

            // Scale x, y, z: has no effect
            outBufferToJSON.readFloat();
            outBufferToJSON.readFloat();
            outBufferToJSON.readFloat();

            // Skin ID
            const unitId = outBufferToJSON.readChars(4);
            if (unitId !== unit.type) unit.type = unitId;

            outBufferToJSON.readByte(); // Flags

            unit.player = outBufferToJSON.readInt(); // (0 = red, 1 = blue, ...)

            outBufferToJSON.readByte(); // unknown
            outBufferToJSON.readByte(); // unknown

            const hitpoints = outBufferToJSON.readInt();
            const mana = outBufferToJSON.readInt();
            if (hitpoints !== -1) unit.hitpoints = hitpoints; // -1 = use default, % of max
            if (mana !== -1) unit.mana = mana; // -1 = use default, absolute value, 0 = unit doesn't have mana

            // Item sets
            const randomItemSetPtr = outBufferToJSON.readInt();
            const numberOfItemSets = outBufferToJSON.readInt();
            if (randomItemSetPtr >= 0) {
                unit.randomItemSetId = randomItemSetPtr;
            } else if (numberOfItemSets) {
                unit.customItemSets = [];

                for (let j = 0; j < numberOfItemSets; j++) {
                    const itemSet: Record<string, number> = {};
                    const numberOfItems = outBufferToJSON.readInt();
                    for (let k = 0; k < numberOfItems; k++) {
                        const itemId = outBufferToJSON.readChars(4); // Item ID
                        const dropChance = outBufferToJSON.readInt(); // % chance to drop
                        itemSet[itemId] = dropChance;
                    }
                    unit.customItemSets.push(itemSet);
                }
            }

            const gold = outBufferToJSON.readInt();
            if (unit.type === 'ngol') unit.gold = gold;

            const targetAcquisition = outBufferToJSON.readFloat()
            if (targetAcquisition !== TargetAcquisition.Normal) unit.targetAcquisition = targetAcquisition;

            unit.hero = {
                level: outBufferToJSON.readInt(), // non-hero units = 1
                str: outBufferToJSON.readInt(),
                agi: outBufferToJSON.readInt(),
                int: outBufferToJSON.readInt()
            };

            const numItemsInventory = outBufferToJSON.readInt();
            if (numItemsInventory) unit.inventory = [];
            for (let j = 0; j < numItemsInventory; j++) {
                unit.inventory && unit.inventory.push({
                    slot: outBufferToJSON.readInt() + 1, // the int is 0-based, but json format wants 1-6
                    type: outBufferToJSON.readChars(4) // Item ID
                });
            }

            const numModifiedAbil = outBufferToJSON.readInt();
            if (numModifiedAbil) unit.abilities = [];
            for (let j = 0; j < numModifiedAbil; j++) {
                unit.abilities && unit.abilities.push({
                    ability: outBufferToJSON.readChars(4), // Ability ID
                    active: !!outBufferToJSON.readInt(), // autocast active? 0=no, 1=active
                    level: outBufferToJSON.readInt()
                });
            }

            const randFlag = outBufferToJSON.readInt(); // random unit/item flag "r" (for uDNR units and iDNR items; 0 for non-random units/items)
            if (randFlag === 0) { // Any neutral passive building/item
                const level = outBufferToJSON.readInt24(); // byte[3] / 24-bit number: level of the random unit/item, -1 = any
                const itemClass = outBufferToJSON.readByte(); // uDNR: 0; iDNR: item class of the random item, 0 = any, 1 = permanent

                if (unit.type === 'uDNR' || unit.type === 'iDNR') {
                    unit.randomEntity = {
                        level,
                        class: itemClass
                    };
                }
            } else if (randFlag === 1) { // From random group (defined in the w3i)
                const group = outBufferToJSON.readInt(); // Unit group number (which group from the global table)
                const position = outBufferToJSON.readInt(); // Position number (which column of this group; for random item, have item flag set in w3i)

                unit.randomEntity = {
                    group,
                    position
                };
            } else if (randFlag === 2) { // Use custom table
                const numDiffAvailUnits = outBufferToJSON.readInt();

                unit.randomEntity = {};
                for (let k = 0; k < numDiffAvailUnits; k++) {
                    const id = outBufferToJSON.readChars(4); // Unit ID
                    const chance = outBufferToJSON.readInt(); // % chance

                    unit.randomEntity[id] = chance;
                }
            }

            const color = outBufferToJSON.readInt();
            if (color !== -1) unit.color = color;

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
