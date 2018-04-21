const Translator = require('../../../index.js');

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

const objTranslator = new Translator.Objects('upgrades', data); // Custom upgrades -> war3map.w3q
objTranslator.write('./output');
