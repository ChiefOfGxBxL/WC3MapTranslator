const Translator = require('../../../index.js');

const data = {
    "original": {},
    "custom": {
        "D000:YOtf": [
            { "id": "dvar", "value": 3, "type": "int" },
            { "id": "dfil", "value": "Doodads\\Outland\\Props\\Grate\\Grate0.mdl"},

            { "id": "dvr1", "value": 125, "variation": 1, "type": "int" }
        ]
    }
};

const objTranslator = new Translator.Objects('doodads', data); // Custom doodads -> war3map.w3d
objTranslator.write('./output');
