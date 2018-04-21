/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
const Translator = require('../../../index.js');
//const Translator = require('wc3maptranslator');

// Place a few regions on the map
const data = [
    {
        "id": 0,
        "name": "safe zone region",
        "position": {
            "left": 50.0,
            "right": 1000,
            "bottom": 0,
            "top": 400
        },
        "weatherEffect": "RLlr",
        "color": [255, 0, 0]
    },
    {
        "id": 1,
        "name": "death trap",
        "position": {
            "left": 100.0,
            "right": 200,
            "bottom": 200,
            "top": 300
        },
        "color": [0, 255, 0]
    }
];

var regionTranslator = new Translator.Regions(data);
regionTranslator.write('./output');

// Now we have a war3map.w3r file!
// We can place this in to a .w3x map archive and see it in action
