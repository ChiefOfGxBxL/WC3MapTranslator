import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';

interface Unit {
    type: string;
    variation: number;
    position: number[];
    rotation: number;
    scale: number[];
    hero: Hero;
    inventory: Inventory[];
    abilities: Abilities[];
    player: number;
    hitpoints: number;
    mana: number;
    gold: number;
    targetAcquisition: number; // (-1 = normal, -2 = camp),
    color: number;
    id: number;
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

export class UnitsTranslator {

    public _outBufferToWar: HexBuffer;
    public _outBufferToJSON: W3Buffer;

    constructor() { }

    public jsonToWar(unitsJson: Unit[]) {
        this._outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        this._outBufferToWar.addString('W3do');
        this._outBufferToWar.addInt(8);
        this._outBufferToWar.addInt(11);
        this._outBufferToWar.addInt(unitsJson.length); // number of units

        /*
         * Body
         */
        unitsJson.forEach((unit) => {
            this._outBufferToWar.addString(unit.type); // type
            this._outBufferToWar.addInt(unit.variation || 0); // variation
            this._outBufferToWar.addFloat(unit.position[0]); // position x
            this._outBufferToWar.addFloat(unit.position[1]); // position y
            this._outBufferToWar.addFloat(unit.position[2]); // position z
            this._outBufferToWar.addFloat(unit.rotation || 0); // rotation angle

            if (!unit.scale) unit.scale = [1, 1, 1];
            this._outBufferToWar.addFloat(unit.scale[0] || 1); // scale x
            this._outBufferToWar.addFloat(unit.scale[1] || 1); // scale y
            this._outBufferToWar.addFloat(unit.scale[2] || 1); // scale z

            // Unit flags
            this._outBufferToWar.addByte(0); // UNSUPPORTED: flags

            this._outBufferToWar.addInt(unit.player); // player #
            this._outBufferToWar.addByte(0); // (byte unknown - 0)
            this._outBufferToWar.addByte(0); // (byte unknown - 0)
            this._outBufferToWar.addInt(unit.hitpoints); // hitpoints
            this._outBufferToWar.addInt(unit.mana || 0); // mana

            // if(unit.droppedItemSets.length === 0) { // needs to be -1 if no item sets
            this._outBufferToWar.addInt(-1);
            // }
            // else {
            //    outBuffer.addInt(unit.droppedItemSets.length); // # item sets
            // }
            // UNSUPPORTED: dropped items
            this._outBufferToWar.addInt(0); // dropped item sets

            // Gold amount
            // Required if unit is a gold mine
            // Optional (set to zero) if unit is not a gold mine
            this._outBufferToWar.addInt(unit.type === 'ngol' ? unit.gold : 0);

            this._outBufferToWar.addFloat(unit.targetAcquisition || 0); // target acquisition

            // Unit hero attributes
            // Can be left unspecified, but values can never be below 1
            if (!unit.hero) unit.hero = { level: 1, str: 1, agi: 1, int: 1 };
            this._outBufferToWar.addInt(unit.hero.level || 1); // hero lvl
            this._outBufferToWar.addInt(unit.hero.str || 1); // hero str
            this._outBufferToWar.addInt(unit.hero.agi || 1); // hero agi
            this._outBufferToWar.addInt(unit.hero.int || 1); // hero int

            // Inventory - - -
            if (!unit.inventory) unit.inventory = [];
            this._outBufferToWar.addInt(unit.inventory.length); // # items in inventory
            unit.inventory.forEach((item) => {
                this._outBufferToWar.addInt(item.slot - 1); // zero-index item slot
                this._outBufferToWar.addString(item.type);
            });

            // Modified abilities - - -
            if (!unit.abilities) unit.abilities = [];
            this._outBufferToWar.addInt(unit.abilities.length); // # modified abilities
            unit.abilities.forEach((ability) => {
                this._outBufferToWar.addString(ability.ability); // ability string
                this._outBufferToWar.addInt(+ability.active); // 0 = not active, 1 = active
                this._outBufferToWar.addInt(ability.level);
            });

            this._outBufferToWar.addInt(0);
            this._outBufferToWar.addInt(1);

            this._outBufferToWar.addInt(unit.color || unit.player); // custom color, defaults to owning player
            this._outBufferToWar.addInt(0); // outBuffer.addInt(unit.waygate); // UNSUPPORTED - waygate
            this._outBufferToWar.addInt(unit.id); // id
        });

        return {
            errors: [],
            buffer: this._outBufferToWar.getBuffer()
        };
    }

    public warToJson(buffer: Buffer) {
        const result = [];
        this._outBufferToJSON = new W3Buffer(buffer);

        const fileId = this._outBufferToJSON.readChars(4), // W3do for doodad file
            fileVersion = this._outBufferToJSON.readInt(), // File version = 7
            subVersion = this._outBufferToJSON.readInt(), // 0B 00 00 00
            numUnits = this._outBufferToJSON.readInt(); // # of units

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
                hitpoints: -1,
                mana: -1,
                gold: 0,
                targetAcquisition: -1,
                color: -1,
                id: -1
            };

            unit.type = this._outBufferToJSON.readChars(4); // (iDNR = random item, uDNR = random unit)
            unit.variation = this._outBufferToJSON.readInt();
            unit.position = [this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat()]; // X Y Z coords
            unit.rotation = this._outBufferToJSON.readFloat();
            unit.scale = [this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat()]; // X Y Z scaling

            const flags = this._outBufferToJSON.readByte();
            // UNSUPPORTED: flags

            unit.player = this._outBufferToJSON.readInt(); // (player1 = 0, 16=neutral passive); note: wc3 patch now has 24 max players

            this._outBufferToJSON.readByte(); // unknown
            this._outBufferToJSON.readByte(); // unknown

            unit.hitpoints = this._outBufferToJSON.readInt(); // -1 = use default
            unit.mana = this._outBufferToJSON.readInt(); // -1 = use default, 0 = unit doesn't have mana

            const droppedItemSetPtr = this._outBufferToJSON.readInt(),
                numDroppedItemSets = this._outBufferToJSON.readInt();
            for (let j = 0; j < numDroppedItemSets; j++) {
                const numDroppableItems = this._outBufferToJSON.readInt();
                for (let k = 0; k < numDroppableItems; k++) {
                    this._outBufferToJSON.readChars(4); // Item ID
                    this._outBufferToJSON.readInt(); // % chance to drop
                }
            }

            unit.gold = this._outBufferToJSON.readInt();
            unit.targetAcquisition = this._outBufferToJSON.readFloat(); // (-1 = normal, -2 = camp)

            unit.hero = {
                level: this._outBufferToJSON.readInt(), // non-hero units = 1
                str: this._outBufferToJSON.readInt(),
                agi: this._outBufferToJSON.readInt(),
                int: this._outBufferToJSON.readInt()
            };

            const numItemsInventory = this._outBufferToJSON.readInt();
            for (let j = 0; j < numItemsInventory; j++) {
                unit.inventory.push({
                    slot: this._outBufferToJSON.readInt() + 1, // the int is 0-based, but json format wants 1-6
                    type: this._outBufferToJSON.readChars(4) // Item ID
                });
            }

            const numModifiedAbil = this._outBufferToJSON.readInt();
            for (let j = 0; j < numModifiedAbil; j++) {
                unit.abilities.push({
                    ability: this._outBufferToJSON.readChars(4), // Ability ID
                    active: !!this._outBufferToJSON.readInt(), // autocast active? 0=no, 1=active
                    level: this._outBufferToJSON.readInt()
                });
            }

            const randFlag = this._outBufferToJSON.readInt(); // random unit/item flag "r" (for uDNR units and iDNR items)
            if (randFlag === 0) {
                // 0 = Any neutral passive building/item, in this case we have
                //   byte[3]: level of the random unit/item,-1 = any (this is actually interpreted as a 24-bit number)
                //   byte: item class of the random item, 0 = any, 1 = permanent ... (this is 0 for units)
                //   r is also 0 for non random units/items so we have these 4 bytes anyway (even if the id wasnt uDNR or iDNR)
                this._outBufferToJSON.readByte();
                this._outBufferToJSON.readByte();
                this._outBufferToJSON.readByte();
                this._outBufferToJSON.readByte();
            } else if (randFlag === 1) {
                // 1 = random unit from random group (defined in the w3i), in this case we have
                //   int: unit group number (which group from the global table)
                //   int: position number (which column of this group)
                //   the column should of course have the item flag set (in the w3i) if this is a random item
                this._outBufferToJSON.readInt();
                this._outBufferToJSON.readInt();
            } else if (randFlag === 2) {
                // 2 = random unit from custom table, in this case we have
                //   int: number "n" of different available units
                //   then we have n times a random unit structure
                const numDiffAvailUnits = this._outBufferToJSON.readInt();
                for (let k = 0; k < numDiffAvailUnits; k++) {
                    this._outBufferToJSON.readChars(4); // Unit ID
                    this._outBufferToJSON.readInt(); // % chance
                }
            }

            unit.color = this._outBufferToJSON.readInt();
            this._outBufferToJSON.readInt(); // UNSUPPORTED: waygate (-1 = deactivated, else its the creation number of the target rect as in war3map.w3r)
            unit.id = this._outBufferToJSON.readInt();

            result.push(unit);
        }

        return {
            errors: [],
            json: result
        };
    }
}
