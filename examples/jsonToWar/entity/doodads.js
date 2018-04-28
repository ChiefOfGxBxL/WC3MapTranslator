/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
 const Translator = require('../../../index.js'); // require('wc3maptranslator');
 const { WarFile, Write } = require('../writeHelper.js');

// Place a "throne" doodad on the map
const data = [
    {
        id: 0,
        type: 'YOth',                           // type of tree - see lookup
        variation: 0,                           // (optional) variation number
        position: [0.0, 0.0, 20.0],             // x,y,z coords
        angle: 0,                               // (optional) in radians
        scale: [1, 1, 1],                       // x,y,z scaling factor - 1 is normal size
        life: 100                               // % health
    }
];

var doodadResult = new Translator.Doodads(data);
Write(WarFile.Entity.Doodad, doodadResult.buffer);
