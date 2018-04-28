const Translator = require('../../../index.js'); // require('wc3maptranslator');
const { WarFile, Write } = require('../writeHelper.js');

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

const objResult = new Translator.Objects('items', data); // Custom items -> war3map.w3t
Write(WarFile.Object.Item, objResult.buffer);
