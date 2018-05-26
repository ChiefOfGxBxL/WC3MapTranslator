const Translator = require('../../../index.js'); // require('wc3maptranslator');
const { WarFile, Write } = require('../writeHelper.js');

const data = {
    "original": {
        "BTtw": [
            { "id": "bvcr", "value": 127 },
            { "id": "bvcg", "value": 138 },
            { "id": "bvcb", "value": 149 }
        ]
    },
    "custom": {
        "B001:BTtw": [
            { "id": "bhps", "value": 432 }
        ]
    }
};

const objResult = new Translator.Objects.jsonToWar('destructables', data); // Custom destructables -> war3map.w3b
Write(WarFile.Object.Destructable, objResult.buffer);
