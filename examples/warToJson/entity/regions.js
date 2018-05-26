const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3map.w3r');
const jsonPath = Path.resolve('./files/output/regions.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var regionResult = new Translator.Regions.warToJson(data);
    fs.writeFileSync(jsonPath, JSON.stringify(regionResult.json, null, 4));
});
