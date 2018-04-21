const Translator = require('../../../index.js');

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

const objTranslator = new Translator.Objects('buffs', data); // Custom buffs -> war3map.w3h
objTranslator.write('./output');
