const Translator = require('../../../index.js');

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

const objTranslator = new Translator.Objects('destructables', data); // Custom destructables -> war3map.w3b
objTranslator.write('./output');
