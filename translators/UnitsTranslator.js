var BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer;

var UnitsTranslator = function(outputPath, unitsJson) {
    outBuffer = new BufferedHexFileWriter(outputPath/*'war3mapUnits.doo'*/);
    
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
        outBuffer.addInt(unit.variation); // variation
        outBuffer.addFloat(unit.position[0]); // position x
        outBuffer.addFloat(unit.position[1]); // position y
        outBuffer.addFloat(unit.position[2]); // position z
        outBuffer.addFloat(unit.rotation); // rotation angle
        outBuffer.addFloat(unit.scale[0]); // scale x
        outBuffer.addFloat(unit.scale[1]); // scale y
        outBuffer.addFloat(unit.scale[2]); // scale z
        outBuffer.addByte(unit.flags); // flags
        outBuffer.addInt(unit.player); // player #
        outBuffer.addByte(0); // (byte unknown - 0)
        outBuffer.addByte(0); // (byte unknown - 0)
        outBuffer.addInt(unit.hitpoints); // hitpoints
        outBuffer.addInt(unit.mana); // mana
        
        if(unit.droppedItemSets.length === 0) { // needs to be -1 if no item sets
            outBuffer.addInt(-1);
        }
        else {
            outBuffer.addInt(unit.droppedItemSets.length); // # item sets
        }
        // UNSUPPORTED: dropped items
        outBuffer.addInt(0); // dropped item sets
        
        outBuffer.addInt(unit.gold); // gold amount
        outBuffer.addFloat(unit.targetAcquisition); // target acquisition
        outBuffer.addInt(unit.hero.level); // hero lvl
        outBuffer.addInt(unit.hero.str); // hero str
        outBuffer.addInt(unit.hero.agi); // hero agi
        outBuffer.addInt(unit.hero.int); // hero int
        
        // Inventory - - -
        outBuffer.addInt(unit.inventory.length); // # items in inventory
        unit.inventory.forEach(function(item) {
            outBuffer.addInt(item.slot - 1); // zero-index item slot
            outBuffer.addString(item.type);
        });
        
        // Modified abilities - - -
        outBuffer.addInt(unit.abilities.length); // # modified abilities
        unit.abilities.forEach(function(ability) {
            outBuffer.addString(ability.ability); // ability string
            outBuffer.addInt(+ability.active); // 0 = not active, 1 = active
            outBuffer.addInt(ability.level);
        });
        
        outBuffer.addInt(0);
        outBuffer.addInt(1);
        
        outBuffer.addInt(unit.color); // custom color
        outBuffer.addInt(unit.waygate); // waygate
        outBuffer.addInt(unit.id); // id
    });
    
    return {
        write: function() {
            outBuffer.writeFile();
        }
    };
}

module.exports = UnitsTranslator;