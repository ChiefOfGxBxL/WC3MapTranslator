const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3map.w3t');
const jsonPath = Path.resolve('./files/output/object/items.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var result = new Translator.Objects.warToJson('items', data);
    fs.writeFileSync(jsonPath, JSON.stringify(result.json, null, 4));
});
