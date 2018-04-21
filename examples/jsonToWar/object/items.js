const Translator = require('../../../index.js');

const data = {
    "original": {
        "afac": [
            { "id": "unam", "value": "hello world!" }
        ]
    },
    "custom": {
        "a000:afac": [
            { "id": "ilev", "type": "int", "value": 7 },
            { "id": "uhot", "value": "J" }
        ]
    }
};

const objTranslator = new Translator.Objects('items', data); // Custom items -> war3map.w3t
objTranslator.write('./output');
