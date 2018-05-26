const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3map.w3q');
const jsonPath = Path.resolve('./files/output/object/upgrades.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var result = new Translator.Objects.warToJson('upgrades', data);
    fs.writeFileSync(jsonPath, JSON.stringify(result.json, null, 4));
});
