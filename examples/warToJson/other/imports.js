const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3map.imp');
const jsonPath = Path.resolve('./files/output/other/imports.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var importResult = new Translator.Imports.warToJson(data);
    fs.writeFileSync(jsonPath, JSON.stringify(importResult.json, null, 4));
});
