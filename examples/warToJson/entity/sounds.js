const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3map.w3s');
const jsonPath = Path.resolve('./files/output/sounds.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var soundResult = new Translator.Sounds.warToJson(data);
    fs.writeFileSync(jsonPath, JSON.stringify(soundResult.json, null, 4));
});
