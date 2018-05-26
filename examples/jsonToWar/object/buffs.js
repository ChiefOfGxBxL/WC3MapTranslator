const Translator = require('../../../index.js'); // require('wc3maptranslator');
const { WarFile, Write } = require('../writeHelper.js');

const data = {
    "original": {
        "BHav": [
            { "id": "fnam", "value": "hello world!" }
        ]
    },
    "custom": {
        "B000:BHbn": [
            { "id": "frac", "value": "orc" },
            { "id": "feff", "value": 1 }
        ]
    }
};

const objResult = new Translator.Objects.jsonToWar('buffs', data); // Custom buffs -> war3map.w3h
Write(WarFile.Object.Buff, objResult.buffer);
