let HexBuffer = require('../lib/HexBuffer'),
    W3Buffer = require('../lib/W3Buffer'),
    outBuffer;

const UnitsTranslator = {
    jsonToWar: function(unitsJson) {
        outBuffer = new HexBuffer();

        /*
         * Header
         */
        outBuffer.addString('W3do');
        outBuffer.addInt(8);
        outBuffer.addInt(11);
        outBuffer.addInt(unitsJson.length); // number of units

        /*
         * Body
         */
        unitsJson.forEach(function(unit) {
            outBuffer.addString(unit.type); // type
            outBuffer.addInt(unit.variation || 0); // variation
            outBuffer.addFloat(unit.position[0]); // position x
            outBuffer.addFloat(unit.position[1]); // position y
            outBuffer.addFloat(unit.position[2]); // position z
            outBuffer.addFloat(unit.rotation || 0); // rotation angle

            if(!unit.scale) unit.scale = [1, 1, 1];
            outBuffer.addFloat(unit.scale[0] || 1); // scale x
            outBuffer.addFloat(unit.scale[1] || 1); // scale y
            outBuffer.addFloat(unit.scale[2] || 1); // scale z

            // Unit flags
            outBuffer.addByte(0); // UNSUPPORTED: flags

            outBuffer.addInt(unit.player); // player #
            outBuffer.addByte(0); // (byte unknown - 0)
            outBuffer.addByte(0); // (byte unknown - 0)
            outBuffer.addInt(unit.hitpoints); // hitpoints
            outBuffer.addInt(unit.mana || 0); // mana

            //if(unit.droppedItemSets.length === 0) { // needs to be -1 if no item sets
            outBuffer.addInt(-1);
            //}
            //else {
            //    outBuffer.addInt(unit.droppedItemSets.length); // # item sets
            //}
            // UNSUPPORTED: dropped items
            outBuffer.addInt(0); // dropped item sets

            // Gold amount
            // Required if unit is a gold mine
            // Optional (set to zero) if unit is not a gold mine
            outBuffer.addInt(unit.type === 'ngol' ? unit.gold : 0);

            outBuffer.addFloat(unit.targetAcquisition || 0); // target acquisition

            // Unit hero attributes
            // Can be left unspecified, but values can never be below 1
            if(!unit.hero) unit.hero = { level: 1, str: 1, agi: 1, int: 1 };
            outBuffer.addInt(unit.hero.level || 1); // hero lvl
            outBuffer.addInt(unit.hero.str || 1); // hero str
            outBuffer.addInt(unit.hero.agi || 1); // hero agi
            outBuffer.addInt(unit.hero.int || 1); // hero int

            // Inventory - - -
            if(!unit.inventory) unit.inventory = [];
            outBuffer.addInt(unit.inventory.length); // # items in inventory
            unit.inventory.forEach(function(item) {
                outBuffer.addInt(item.slot - 1); // zero-index item slot
                outBuffer.addString(item.type);
            });

            // Modified abilities - - -
            if(!unit.abilities) unit.abilities = [];
            outBuffer.addInt(unit.abilities.length); // # modified abilities
            unit.abilities.forEach(function(ability) {
                outBuffer.addString(ability.ability); // ability string
                outBuffer.addInt(+ability.active); // 0 = not active, 1 = active
                outBuffer.addInt(ability.level);
            });

            outBuffer.addInt(0);
            outBuffer.addInt(1);

            outBuffer.addInt(unit.color || unit.player); // custom color, defaults to owning player
            outBuffer.addInt(0); //outBuffer.addInt(unit.waygate); // UNSUPPORTED - waygate
            outBuffer.addInt(unit.id); // id
        });

        return {
            errors: [],
            buffer: outBuffer.getBuffer()
        };
    },
    warToJson: function(buffer) {
        let result = [],
            b = new W3Buffer(buffer);

        let fileId = b.readChars(4), // W3do for doodad file
            fileVersion = b.readInt(), // File version = 7
            subVersion = b.readInt(), // 0B 00 00 00
            numUnits = b.readInt(); // # of units

        for(let i = 0; i < numUnits; i++) {
            let unit = { hero: {}, inventory: [], abilities: [] };

            unit.type = b.readChars(4); // (iDNR = random item, uDNR = random unit)
            unit.variation = b.readInt();
            unit.position = [ b.readFloat(), b.readFloat(), b.readFloat() ]; // X Y Z coords
            unit.rotation = b.readFloat();
            unit.scale = [ b.readFloat(), b.readFloat(), b.readFloat() ]; // X Y Z scaling


            let flags = b.readByte();
            // UNSUPPORTED: flags

            unit.player = b.readInt(); // (player1 = 0, 16=neutral passive); note: wc3 patch now has 24 max players

            b.readByte(); // unknown
            b.readByte(); // unknown

            unit.hitpoints = b.readInt(); // -1 = use default
            unit.mana = b.readInt(); // -1 = use default, 0 = unit doesn't have mana

            let droppedItemSetPtr = b.readInt(),
                numDroppedItemSets = b.readInt();
            for(let j = 0; j < numDroppedItemSets; j++) {
                let numDroppableItems = b.readInt();
                for(let k = 0; k < numDroppableItems; k++) {
                    b.readChars(4); // Item ID
                    b.readInt(); // % chance to drop
                }
            }

            unit.gold = b.readInt();
            unit.targetAcquisition = b.readFloat(); // (-1 = normal, -2 = camp)

            unit.hero = {
                level: b.readInt(), // non-hero units = 1
                str: b.readInt(),
                agi: b.readInt(),
                int: b.readInt()
            };

            let numItemsInventory = b.readInt();
            for(let j = 0; j < numItemsInventory; j++) {
                unit.inventory.push({
                    slot: b.readInt() + 1, // the int is 0-based, but json format wants 1-6
                    type: b.readChars(4) // Item ID
                });
            }

            let numModifiedAbil = b.readInt();
            for(let j = 0; j < numModifiedAbil; j++) {
                unit.abilities.push({
                    ability: b.readChars(4), // Ability ID
                    active: !!b.readInt(), // autocast active? 0=no, 1=active
                    level: b.readInt()
                });
            }

            let randFlag = b.readInt(); // random unit/item flag "r" (for uDNR units and iDNR items)
            if(randFlag === 0) {
                // 0 = Any neutral passive building/item, in this case we have
                //   byte[3]: level of the random unit/item,-1 = any (this is actually interpreted as a 24-bit number)
                //   byte: item class of the random item, 0 = any, 1 = permanent ... (this is 0 for units)
                //   r is also 0 for non random units/items so we have these 4 bytes anyway (even if the id wasnt uDNR or iDNR)
                b.readByte();
                b.readByte();
                b.readByte();
                b.readByte();
            }
            else if(randFlag === 1) {
                // 1 = random unit from random group (defined in the w3i), in this case we have
                //   int: unit group number (which group from the global table)
                //   int: position number (which column of this group)
                //   the column should of course have the item flag set (in the w3i) if this is a random item
                b.readInt();
                b.readInt();
            }
            else if(randFlag === 2) {
                // 2 = random unit from custom table, in this case we have
                //   int: number "n" of different available units
                //   then we have n times a random unit structure
                let numDiffAvailUnits = b.readInt();
                for(let k = 0; k < numDiffAvailUnits; k++) {
                    b.readChars(4); // Unit ID
                    b.readInt(); // % chance
                }
            }

            unit.color = b.readInt();
            b.readInt(); // UNSUPPORTED: waygate (-1 = deactivated, else its the creation number of the target rect as in war3map.w3r)
            unit.id = b.readInt();

            result.push(unit);
        }

        return {
            errors: [],
            json: result
        };
    }
};

module.exports = UnitsTranslator;
