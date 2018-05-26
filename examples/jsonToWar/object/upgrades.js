const Translator = require('../../../index.js'); // require('wc3maptranslator');
const { WarFile, Write } = require('../writeHelper.js');

const data = {
    "original": {
        "Rhme": [
            { "id": "gglb", "level": 0, "value": 987, "type": "int" },
            { "id": "gglm", "level": 0, "value": 654, "type": "int" }
        ]
    },
    "custom": {
        "R000:Rhme": []
    }
};

const objResult = new Translator.Objects.jsonToWar('upgrades', data); // Custom upgrades -> war3map.w3q
Write(WarFile.Object.Upgrade, objResult.buffer);
