/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
 const Translator = require('../../../index.js'); // require('wc3maptranslator');
 const { WarFile, Write } = require('../writeHelper.js');

// Place a few regions on the map
const data = {
    "tileset": "L",
    "customtileset": true,
    "tilepalette": ["LDrt"],
    "clifftilepalette": [""],
    "map": {
        "width": 32,
        "height": 32
    },
    "tiles": [
        [
            [0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 0],
            [2, 0, 0, 0, 0, 0, 0],
            [3, 0, 0, 0, 0, 0, 0],
            [4, 0, 0, 0, 0, 0, 0]
        ]
    ]
};

var terrainResult = new Translator.Terrain.jsonToWar(data);
Write(WarFile.Entity.Terrain, terrainResult.buffer);
