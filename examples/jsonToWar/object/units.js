const Translator = require('../../../index.js');

const data = {
    "original": {
        "hfoo": [
            { "id": "umvs", "value": 500 },
            { "id": "umpr", "type": "unreal", "value": 452.14 },
            { "id": "ua1b", "type": "int", "value": 77 }
        ]
    },
    "custom": {
        "h000:hfoo": [
            { "id": "ua1b", "type": "int", "value": 13 },
            { "id": "uhpm", "value": 999 },
            { "id": "utip", "value": "hey there! this is a custom footman, woohoo~" }
        ]
    }
};

const objTranslator = new Translator.Objects('units', data); // Custom units -> war3map.w3u
objTranslator.write('./output');
