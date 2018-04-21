/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
const Translator = require('../../../index.js');
//const Translator = require('wc3maptranslator');

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

var terrainTranslator = new Translator.Terrain(data);
terrainTranslator.write('./output');

// Now we have a war3map.w3e file!
// We can place this in to a .w3x map archive and see it in action
