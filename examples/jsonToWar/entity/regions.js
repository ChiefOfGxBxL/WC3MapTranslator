/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
 const Translator = require('../../../index.js'); // require('wc3maptranslator');
 const { WarFile, Write } = require('../writeHelper.js');

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

var regionResult = new Translator.Regions(data);
Write(WarFile.Entity.Region, regionResult.buffer);
