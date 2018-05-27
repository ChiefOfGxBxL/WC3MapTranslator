const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3mapUnits.doo');
const jsonPath = Path.resolve('./files/output/units.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var unitResult = new Translator.Units.warToJson(data);
    fs.writeFileSync(jsonPath, JSON.stringify(unitResult.json, null, 4));
});
