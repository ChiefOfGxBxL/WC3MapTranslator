/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
 const Translator = require('../../../index.js'); // require('wc3maptranslator');
 const { WarFile, Write } = require('../writeHelper.js');

// Place a footman on the map
const data = [
    {
        id: 0,
        type: 'hfoo', // Unit type - lookup
        position: [0, 50, 100.52], // x,y,z coords
        rotation: 36, // in degrees
        scale: [1, 1, 1],
        player: 0, // belongs to player red
        hitpoints: 210,
        mana: 0,
        gold: 0,
        targetAcquisition: 0,
        hero: {
            level: 0,
            str: 0,
            agi: 0,
            int: 0
        },
        inventory: [],
        abilities: []
    }
];

var unitResult = new Translator.Units.jsonToWar(data);
Write(WarFile.Entity.Unit, unitResult.buffer);
