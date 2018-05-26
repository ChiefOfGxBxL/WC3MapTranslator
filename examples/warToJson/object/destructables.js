const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3map.w3b');
const jsonPath = Path.resolve('./files/output/object/destructables.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var result = new Translator.Objects.warToJson('destructables', data);
    fs.writeFileSync(jsonPath, JSON.stringify(result.json, null, 4));
});
