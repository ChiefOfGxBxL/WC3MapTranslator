let HexBuffer = require('../lib/HexBuffer'),
    outBuffer;

const UnitsTranslator = function(unitsJson) {
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

        outBuffer.addByte(unit.flags || 0); // flags
        outBuffer.addInt(unit.player); // player #
        outBuffer.addByte(0); // (byte unknown - 0)
        outBuffer.addByte(0); // (byte unknown - 0)
        outBuffer.addInt(unit.hitpoints); // hitpoints
        outBuffer.addInt(unit.mana); // mana

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
};

module.exports = UnitsTranslator;
